import Officer from '../models/Officer.js';
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