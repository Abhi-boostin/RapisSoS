import Officer from '../models/Officer.js';
import Request from '../models/Request.js';
import { verifyOtp as verifyOtpUtil } from '../utils/otp.js';

// Verify OTP and create/update officer
export const verifyOfficer = async (req, res) => {
    try {
        const { phone, code } = req.body;
        
        // Verify OTP
        const isValid = await verifyOtpUtil(phone, code);
        if (!isValid) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid OTP' 
            });
        }

        // Create or update officer
        let officer = await Officer.findOneAndUpdate(
            { phone },
            { $set: { phone, phoneVerified: true } },
            { upsert: true, new: true }
        );

        return res.json({ 
            success: true, 
            message: 'OTP verified successfully',
            officer 
        });
    } catch (err) {
        console.error('Officer Verify Error:', err);
        return res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

// Update officer data
export const updateOfficer = async (req, res) => {
    const { phone, badgeNumber, fullName, department, location } = req.body;
    
    const officer = await Officer.findOneAndUpdate(
        { phone },
        { $set: { badgeNumber, fullName, department, location } },
        { new: true }
    );

    return res.json({ success: true, officer });
};

// Update officer status
export const updateStatus = async (req, res) => {
    const { phone, status } = req.body;
    
    const officer = await Officer.findOneAndUpdate(
        { phone },
        { $set: { status, lastStatusUpdate: new Date() } },
        { new: true }
    );

    return res.json({ success: true, officer });
};

// Get available requests for officer
export const getRequests = async (req, res) => {
    const { phone } = req.query;

    // Find all pending requests assigned to this officer
    const requests = await Request.find({
        assignedResponderType: 'officer',
        assignedResponderPhone: phone,
        status: 'pending',
        expireAt: { $gt: new Date() } // Only non-expired requests
    }).sort({ createdAt: -1 }); // Newest first

    // Calculate time remaining for each request
    const requestsWithTime = requests.map(request => {
        const timeRemaining = request.expireAt - new Date();
        const secondsRemaining = Math.max(0, Math.floor(timeRemaining / 1000));
        
        return {
            id: request._id,
            userLocation: request.userLocation,
            mapsUrl: request.mapsUrl,
            distanceMeters: request.assignedDistanceMeters,
            createdAt: request.createdAt,
            secondsRemaining,
            status: request.status
        };
    });

    return res.json({
        success: true,
        requests: requestsWithTime
    });
};

// Accept emergency request
export const acceptRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { officerPhone } = req.body;

        const request = await Request.findById(id);
        if (!request || request.status !== "pending") {
            return res.status(400).json({ success: false, message: "Request not available" });
        }

        if (request.assignedResponderPhone !== officerPhone) {
            return res.status(400).json({ success: false, message: "Not authorized" });
        }

        // Update request
        request.status = "accepted";
        request.acceptedAt = new Date();
        await request.save();

        // Update officer status to off
        await Officer.findOneAndUpdate(
            { phone: officerPhone },
            { 
                $set: { 
                    status: "off",
                    lastStatusUpdate: new Date()
                }
            }
        );

        return res.json({
            success: true,
            message: "Request accepted",
            request,
            userLocation: request.userLocation,
            mapsUrl: request.mapsUrl
        });
    } catch (err) {
        console.error("Accept Request Error:", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// Decline emergency request
export const declineRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { officerPhone } = req.body;

        const request = await Request.findById(id);
        if (!request || request.status !== "pending") {
            return res.status(400).json({ success: false, message: "Request not available" });
        }

        if (request.assignedResponderPhone !== officerPhone) {
            return res.status(400).json({ success: false, message: "Not authorized" });
        }

        // Mark as declined
        request.status = "declined";
        request.declinedAt = new Date();
        await request.save();

        // Find next nearest officer
        const nextOfficer = await Officer.findOne({
            phone: { $ne: officerPhone },
            status: "available",
            currentLocation: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: request.userLocation.coordinates
                    },
                    $maxDistance: 10000 // 10km radius
                }
            }
        }).select("phone currentLocation badgeNumber department");

        if (!nextOfficer) {
            return res.json({ success: false, message: "No other officers available" });
        }

        // Calculate distance for next officer
        const [long, lat] = request.userLocation.coordinates;
        const [officerLong, officerLat] = nextOfficer.currentLocation.coordinates;
        const distance = calculateDistance(lat, long, officerLat, officerLong);

        // Reassign request
        request.assignedResponderPhone = nextOfficer.phone;
        request.status = "pending";
        request.expireAt = new Date(Date.now() + 5 * 60000); // Reset 5-minute timer
        request.assignedDistanceMeters = distance * 1000; // Convert km to meters
        await request.save();

        return res.json({
            success: true,
            message: "Request reassigned",
            request,
            nextOfficer: {
                badgeNumber: nextOfficer.badgeNumber,
                department: nextOfficer.department,
                distance: distance.toFixed(1)
            }
        });
    } catch (err) {
        console.error("Decline Request Error:", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};