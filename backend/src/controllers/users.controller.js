import User from '../models/User.js';
import Officer from '../models/Officer.js';
import Ambulance from '../models/Ambulance.js';
import { verifyOtp as verifyOtpUtil } from '../utils/otp.js';

// Verify OTP and create user
export const verifyOtp = async (req, res) => {
    const { phone, code } = req.body;
    
    const isValid = await verifyOtpUtil(phone, code);
    if (!isValid) {
        return res.status(400).json({ error: 'Invalid OTP' });
    }

    let user = await User.findOneAndUpdate(
        { phone },
        { $set: { phone, phoneVerified: true } },
        { upsert: true, new: true }
    );

    return res.json({ success: true, user });
};

// Update user data
export const updateUser = async (req, res) => {
    const { phone, name, emergencyContacts, location } = req.body;
    
    const user = await User.findOneAndUpdate(
        { phone },
        { $set: { name, emergencyContacts, location } },
        { new: true }
    );

    return res.json({ success: true, user });
};

// SOS for ambulance
export const sosAmbulance = async (req, res) => {
    const { location } = req.body;
    const [long, lat] = location.coordinates;

    const ambulance = await Ambulance.findOne({
        location: {
            $near: {
                $geometry: {
                    type: "Point",
                    coordinates: [long, lat]
                },
                $maxDistance: 10000 // 10km radius
            }
        },
        status: "available"
    });

    return res.json({ success: true, ambulance });
};

// SOS for officer
export const sosOfficer = async (req, res) => {
    const { location } = req.body;
    const [long, lat] = location.coordinates;

    const officer = await Officer.findOne({
        location: {
            $near: {
                $geometry: {
                    type: "Point",
                    coordinates: [long, lat]
                },
                $maxDistance: 10000 // 10km radius
            }
        },
        status: "available"
    });

    return res.json({ success: true, officer });
}; 