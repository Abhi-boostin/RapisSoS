import Officer from '../models/Officer.js';
import { detectUserType } from '../utils/userTypeDetection.js';
import { isE164Phone } from '../utils/validate.js';
import { sendOtp, verifyOtp } from '../utils/otp.js';

export const init = async (req, res) => {
  try {
    const { phone } = req.body || {};
    if (!phone || !isE164Phone(phone)) {
      return res.status(400).json({ error: 'Valid phone number (E.164) required' });
    }

    // Check if number exists in any other service
    const userType = await detectUserType(phone);
    if (userType && userType.type !== 'officer') {
      return res.status(400).json({ 
        error: `This number is already registered as a ${userType.type}`
      });
    }

    // Create officer record if it doesn't exist
    let officer = await Officer.findOne({ phone });
    if (!officer) {
      officer = new Officer({ phone });
      await officer.save();
    }

    // Generate and send OTP
    const verification = await sendOtp(phone);
    
    return res.json({ success: true, message: 'OTP sent successfully' });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
};

export const verify = async (req, res) => {
  try {
    const { phone, otp } = req.body || {};
    if (!phone || !isE164Phone(phone) || !otp) {
      return res.status(400).json({ error: 'phone (E.164) and otp required' });
    }

    // Verify OTP
    const check = await verifyOtp(phone, otp);
    if (check.status !== 'approved') {
      return res.status(400).json({ approved: false, status: check.status, error: 'Invalid or expired code' });
    }

    // Get officer record
    const officer = await Officer.findOne({ phone });
    if (!officer) {
      return res.status(404).json({ error: 'Officer not found' });
    }

    // Update verification status
    officer.phoneVerified = true;
    await officer.save();

    // Check if officer is fully registered
    const isRegistered = !!officer.badgeNumber;

    return res.json({ approved: true, isRegistered });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
};

export const register = async (req, res) => {
  try {
    const { phone, fullName, badgeNumber, department, rank, stationLocation, ...rest } = req.body || {};
    
    // Basic validation
    if (!phone || !fullName || !badgeNumber || !department || !rank || !stationLocation) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Find officer by phone
    const officer = await Officer.findOne({ phone });
    if (!officer) {
      return res.status(404).json({ error: 'Officer not found' });
    }

    // Check if badge number is unique
    const existingBadge = await Officer.findOne({ badgeNumber });
    if (existingBadge && existingBadge.phone !== phone) {
      return res.status(400).json({ error: 'Badge number already registered' });
    }

    // Update officer details
    Object.assign(officer, { 
      fullName, 
      badgeNumber, 
      department, 
      rank, 
      stationLocation,
      ...rest 
    });

    await officer.save();
    return res.json({ success: true, officer });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
}; 