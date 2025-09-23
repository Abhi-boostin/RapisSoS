import Ambulance from '../models/Ambulance.js';
import { isE164Phone } from '../utils/validate.js';
import { verifyOtp } from '../utils/otp.js';

// Verify OTP and create/update ambulance
export const verifyOtp = async (req, res) => {
    const { phone, code } = req.body;
    
    const isValid = await verifyOtp(phone, code);
    if (!isValid) {
        return res.status(400).json({ error: 'Invalid OTP' });
    }

    let ambulance = await Ambulance.findOneAndUpdate(
        { phone },
        { $set: { phone, phoneVerified: true } },
        { upsert: true, new: true }
    );

    return res.json({ success: true, ambulance });
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