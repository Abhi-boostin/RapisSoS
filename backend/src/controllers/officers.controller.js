import Officer from '../models/Officer.js';
import Request from '../models/Request.js';
import { isE164Phone } from '../utils/validate.js';
import { verifyOtp } from '../utils/otp.js';

// Verify OTP and create/update officer
export const verifyOtp = async (req, res) => {
    const { phone, code } = req.body;
    
    const isValid = await verifyOtp(phone, code);
    if (!isValid) {
        return res.status(400).json({ error: 'Invalid OTP' });
    }

    let officer = await Officer.findOneAndUpdate(
        { phone },
        { $set: { phone, phoneVerified: true } },
        { upsert: true, new: true }
    );

    return res.json({ success: true, officer });
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

// Handle emergency request response (accept/reject)
export const handleRequest = async (req, res) => {
    const { requestId, action, officerPhone } = req.body;

    const request = await Request.findById(requestId);
    if (!request) {
        return res.json({ success: false, message: 'Request not found' });
    }

    if (request.assignedResponderPhone !== officerPhone) {
        return res.json({ success: false, message: 'Not authorized to handle this request' });
    }

    if (action === 'accept') {
        request.status = 'accepted';
        request.acceptedAt = new Date();
        await request.save();

        // Update officer status to busy
        await Officer.findOneAndUpdate(
            { phone: officerPhone },
            { 
                $set: { 
                    status: 'busy',
                    lastStatusUpdate: new Date()
                }
            }
        );

        return res.json({ 
            success: true, 
            message: 'Request accepted',
            userLocation: request.userLocation,
            mapsUrl: request.mapsUrl
        });
    } else if (action === 'reject') {
        request.status = 'declined';
        request.declinedAt = new Date();
        await request.save();

        return res.json({ 
            success: true, 
            message: 'Request declined'
        });
    }

    return res.json({ success: false, message: 'Invalid action' });
}; 