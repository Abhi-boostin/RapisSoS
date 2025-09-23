import Ambulance from '../models/Ambulance.js';
import Request from '../models/Request.js';
import { verifyOtp as verifyOtpUtil } from '../utils/otp.js';

// Verify OTP and create/update ambulance
export const verifyAmbulance = async (req, res) => {
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

        // Create or update ambulance
        let ambulance = await Ambulance.findOneAndUpdate(
            { phone },
            { $set: { phone, phoneVerified: true } },
            { upsert: true, new: true }
        );

        return res.json({ 
            success: true, 
            message: 'OTP verified successfully',
            ambulance 
        });
    } catch (err) {
        console.error('Ambulance Verify Error:', err);
        return res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

// Update ambulance data
export const updateAmbulance = async (req, res) => {
    const { phone, vehicleNumber, type, location } = req.body;
    
    const ambulance = await Ambulance.findOneAndUpdate(
        { phone },
        { $set: { vehicleNumber, type, location } },
        { new: true }
    );

    return res.json({ success: true, ambulance });
};

// Update ambulance status
export const updateStatus = async (req, res) => {
    const { phone, status } = req.body;
    
    const ambulance = await Ambulance.findOneAndUpdate(
        { phone },
        { $set: { status, lastStatusUpdate: new Date() } },
        { new: true }
    );

    return res.json({ success: true, ambulance });
};

// Get available requests for ambulance
export const getRequests = async (req, res) => {
    const { phone } = req.query;

    // Find all pending requests assigned to this ambulance
    const requests = await Request.find({
        assignedResponderType: 'ambulance',
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

// Helper function to calculate distance between two points
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// Accept emergency request
export const acceptRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { ambulancePhone } = req.body;

        const request = await Request.findById(id);
        if (!request || request.status !== "pending") {
            return res.status(400).json({ success: false, message: "Request not available" });
        }

        if (request.assignedResponderPhone !== ambulancePhone) {
            return res.status(400).json({ success: false, message: "Not authorized" });
        }

        // Update request
        request.status = "accepted";
        request.acceptedAt = new Date();
        await request.save();

        // Update ambulance status to off
        await Ambulance.findOneAndUpdate(
            { phone: ambulancePhone },
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
        const { ambulancePhone } = req.body;

        const request = await Request.findById(id);
        if (!request || request.status !== "pending") {
            return res.status(400).json({ success: false, message: "Request not available" });
        }

        if (request.assignedResponderPhone !== ambulancePhone) {
            return res.status(400).json({ success: false, message: "Not authorized" });
        }

        // Mark as declined
        request.status = "declined";
        request.declinedAt = new Date();
        await request.save();

        // Find next nearest ambulance
        const nextAmbulance = await Ambulance.findOne({
            phone: { $ne: ambulancePhone },
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
        }).select("phone currentLocation unitId crew vehicleNumber");

        if (!nextAmbulance) {
            return res.json({ success: false, message: "No other ambulances available" });
        }

        // Calculate distance for next ambulance
        const [long, lat] = request.userLocation.coordinates;
        const [ambLong, ambLat] = nextAmbulance.currentLocation.coordinates;
        const distance = calculateDistance(lat, long, ambLat, ambLong);

        // Reassign request
        request.assignedResponderPhone = nextAmbulance.phone;
        request.status = "pending";
        request.expireAt = new Date(Date.now() + 5 * 60000); // Reset 5-minute timer
        request.assignedDistanceMeters = distance * 1000; // Convert km to meters
        await request.save();

        return res.json({
            success: true,
            message: "Request reassigned",
            request,
            nextAmbulance: {
                unitId: nextAmbulance.unitId,
                vehicleNumber: nextAmbulance.vehicleNumber,
                crew: nextAmbulance.crew,
                distance: distance.toFixed(1)
            }
        });
    } catch (err) {
        console.error("Decline Request Error:", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
}; 