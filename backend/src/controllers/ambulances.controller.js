import Ambulance from '../models/Ambulance.js';
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
    if (userType && userType.type !== 'ambulance') {
      return res.status(400).json({ 
        error: `This number is already registered as a ${userType.type}`
      });
    }

    // Create ambulance record if it doesn't exist
    let ambulance = await Ambulance.findOne({ phone });
    if (!ambulance) {
      ambulance = new Ambulance({ phone });
      await ambulance.save();
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

    // Get ambulance record
    const ambulance = await Ambulance.findOne({ phone });
    if (!ambulance) {
      return res.status(404).json({ error: 'Ambulance not found' });
    }

    // Update verification status
    ambulance.phoneVerified = true;
    await ambulance.save();

    // Check if ambulance is fully registered
    const isRegistered = !!ambulance.vehicleNumber;

    return res.json({ approved: true, isRegistered });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
};

export const register = async (req, res) => {
  try {
    const { 
      phone,
      vehicleNumber,
      type,
      manufacturer,
      model,
      yearOfManufacture,
      capacity,
      primaryDriver,
      baseLocation,
      ...rest
    } = req.body || {};
    
    // Basic validation
    if (!phone || !vehicleNumber || !type || !manufacturer || !model || !yearOfManufacture || !capacity || !primaryDriver || !baseLocation) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Find ambulance by phone
    const ambulance = await Ambulance.findOne({ phone });
    if (!ambulance) {
      return res.status(404).json({ error: 'Ambulance not found' });
    }

    // Check if vehicle number is unique
    const existingVehicle = await Ambulance.findOne({ vehicleNumber });
    if (existingVehicle && existingVehicle.phone !== phone) {
      return res.status(400).json({ error: 'Vehicle number already registered' });
    }

    // Update ambulance details
    Object.assign(ambulance, { 
      vehicleNumber,
      type,
      manufacturer,
      model,
      yearOfManufacture,
      capacity,
      primaryDriver,
      baseLocation,
      ...rest 
    });

    await ambulance.save();
    return res.json({ success: true, ambulance });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
};

export const updateAmbulanceStatus = async (req, res) => {
	try {
		const { phone, status, lng, lat } = req.body || {};
		if (!phone || !isE164Phone(phone)) return res.status(400).json({ error: 'phone required (E.164)' });
		const update = { lastStatusAt: new Date() };
		if (status) update.status = status;
		if (lng !== undefined && lat !== undefined) {
			const lngNum = Number(lng); const latNum = Number(lat);
			if (Number.isFinite(lngNum) && Number.isFinite(latNum)) {
				update.currentLocation = { type: 'Point', coordinates: [lngNum, latNum] };
			}
		}
		const ambulance = await Ambulance.findOneAndUpdate(
			{ phone },
			{ $set: update },
			{ new: true }
		);
		if (!ambulance) return res.status(404).json({ error: 'ambulance not found' });
		return res.json({ ambulance });
	} catch (e) {
		return res.status(500).json({ error: e.message });
	}
}; 