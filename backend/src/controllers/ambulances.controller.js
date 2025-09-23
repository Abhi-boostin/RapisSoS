import Ambulance from '../models/Ambulance.js';
import Request from '../models/Request.js';
import User from '../models/User.js';
import { verifyOtp as verifyOtpUtil, sendOtp as sendOtpUtil } from '../utils/otp.js';

export const sendAmbulanceOtp = async (req, res) => {
    try {
        const { phone } = req.body;
        await sendOtpUtil(phone);
        return res.json({ success: true, message: 'OTP sent successfully' });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

export const verifyAmbulance = async (req, res) => {
    try {
        const { phone, code } = req.body;
        const check = await verifyOtpUtil(phone, code);
        
        if (check.status === 'approved') {
            let ambulance = await Ambulance.findOneAndUpdate(
                { phone },
                { $set: { phone, phoneVerified: true } },
                { upsert: true, new: true }
            );
            return res.json({ success: true, message: 'OTP verified successfully', ambulance });
        } else {
            return res.status(400).json({ success: false, message: 'Invalid OTP' });
        }
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

export const updateAmbulance = async (req, res) => {
    const { phone, vehicleNumber, type, location } = req.body;
    const ambulance = await Ambulance.findOneAndUpdate(
        { phone },
        { $set: { vehicleNumber, type, location } },
        { new: true }
    );
    return res.json({ success: true, ambulance });
};

export const updateStatus = async (req, res) => {
    const { phone, status } = req.body;
    const ambulance = await Ambulance.findOneAndUpdate(
        { phone },
        { $set: { status, lastStatusUpdate: new Date() } },
        { new: true }
    );
    return res.json({ success: true, ambulance });
};

export const getRequests = async (req, res) => {
    const { phone } = req.query;
    const requests = await Request.find({
        assignedResponderType: 'ambulance',
        assignedResponderPhone: phone,
        status: 'pending',
        expireAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });

    const requestsWithUserInfo = await Promise.all(requests.map(async request => {
        const user = await User.findOne({ phone: request.userPhone });
        const timeRemaining = request.expireAt - new Date();
        const secondsRemaining = Math.max(0, Math.floor(timeRemaining / 1000));
        
        return {
            id: request._id,
            userLocation: request.userLocation,
            mapsUrl: request.mapsUrl,
            distanceMeters: request.assignedDistanceMeters,
            createdAt: request.createdAt,
            secondsRemaining,
            status: request.status,
            user: user ? {
                name: user.name,
                phone: user.phone,
                bloodGroup: user.bloodGroup,
                allergies: user.allergies,
                medicalConditions: user.medicalConditions,
                medications: user.medications,
                specialNeeds: user.specialNeeds,
                emergencyContacts: user.emergencyContacts
            } : null
        };
    }));

    return res.json({ success: true, requests: requestsWithUserInfo });
};

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

        request.status = "accepted";
        request.acceptedAt = new Date();
        await request.save();

        await Ambulance.findOneAndUpdate(
            { phone: ambulancePhone },
            { $set: { status: "off", lastStatusUpdate: new Date() } }
        );

        const user = await User.findOne({ phone: request.userPhone });

        return res.json({
            success: true,
            message: "Request accepted",
            request,
            userLocation: request.userLocation,
            mapsUrl: request.mapsUrl,
            user: user ? {
                name: user.name,
                phone: user.phone,
                bloodGroup: user.bloodGroup,
                allergies: user.allergies,
                medicalConditions: user.medicalConditions,
                medications: user.medications,
                specialNeeds: user.specialNeeds,
                emergencyContacts: user.emergencyContacts
            } : null
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

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

        request.status = "declined";
        request.declinedAt = new Date();
        await request.save();

        const nextAmbulance = await Ambulance.findOne({
            phone: { $ne: ambulancePhone },
            status: "available",
            currentLocation: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: request.userLocation.coordinates
                    },
                    $maxDistance: 10000
                }
            }
        }).select("phone currentLocation unitId crew vehicleNumber");

        if (!nextAmbulance) {
            return res.json({ success: false, message: "No other ambulances available" });
        }

        const [long, lat] = request.userLocation.coordinates;
        const [ambLong, ambLat] = nextAmbulance.currentLocation.coordinates;
        const distance = calculateDistance(lat, long, ambLat, ambLong);

        request.assignedResponderPhone = nextAmbulance.phone;
        request.status = "pending";
        request.expireAt = new Date(Date.now() + 5 * 60000);
        request.assignedDistanceMeters = distance * 1000;
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
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}
