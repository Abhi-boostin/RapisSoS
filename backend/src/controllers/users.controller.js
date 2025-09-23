// controllers/user.js
import User from '../models/User.js';
import Officer from '../models/Officer.js';
import Ambulance from '../models/Ambulance.js';
import Request from '../models/Request.js';
import { verifyOtp as verifyOtpUtil, sendOtp as sendOtpUtil } from '../utils/otp.js';

// ---------------------- Helper: Haversine Distance ----------------------
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ---------------------- Send OTP (User) ----------------------
export const sendUserOtp = async (req, res) => {
  try {
    const { phone } = req.body || {};
    if (!phone) return res.status(400).json({ success: false, message: 'phone required' });

    const resp = await sendOtpUtil(phone);

    if (!resp.success) {
      // Pass through Twilio error context to help client-side UX/debug
      return res
        .status(400)
        .json({
          success: false,
          message: resp.error || 'Failed to send OTP',
          code: resp.code,
          status: resp.status,
          moreInfo: resp.moreInfo,
        });
    }

    // Optionally persist a pre-user record keyed by E.164 to align with Verify
    // await User.updateOne({ phone: resp.to }, { $setOnInsert: { phone: resp.to } }, { upsert: true });

    return res.json({ success: true, message: 'OTP send initiated', to: resp.to });
  } catch (err) {
    return res.status(500).json({ success: false, message: err?.message || 'Server error' });
  }
};

// ---------------------- Verify OTP ----------------------
export const verifyUser = async (req, res) => {
  try {
    const { phone, code } = req.body || {};
    if (!phone || !code) {
      return res.status(400).json({ success: false, message: 'phone and code required' });
    }

    const check = await verifyOtpUtil(phone, code);

    if (check.success && check.result?.status === 'approved') {
      const normalized = check.to || phone;

      const user = await User.findOneAndUpdate(
        { phone: normalized },
        { $set: { phone: normalized, phoneVerified: true } },
        { upsert: true, new: true }
      );

      return res.json({ success: true, message: 'OTP verified successfully', user });
    }

    return res
      .status(400)
      .json({
        success: false,
        message: check.error || 'Invalid or expired OTP',
        code: check.code,
        status: check.status,
        moreInfo: check.moreInfo,
      });
  } catch (err) {
    return res.status(500).json({ success: false, message: err?.message || 'Server error' });
  }
};

// ---------------------- Update User ----------------------
export const updateUser = async (req, res) => {
  try {
    const { phone, name, emergencyContacts, location } = req.body || {};
    if (!phone) return res.status(400).json({ success: false, message: 'phone required' });

    const user = await User.findOneAndUpdate(
      { phone },
      { $set: { name, emergencyContacts, location } },
      { new: true }
    );
    return res.json({ success: true, user });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ---------------------- SOS: Nearest Ambulance ----------------------
export const sosAmbulance = async (req, res) => {
  try {
    const { location, userPhone } = req.body || {};
    if (!location?.coordinates?.length) {
      return res.status(400).json({ success: false, message: 'location coordinates required' });
    }
    const [long, lat] = location.coordinates;

    const ambulance = await Ambulance.findOne({
      status: 'available',
      currentLocation: {
        $near: {
          $geometry: { type: 'Point', coordinates: [long, lat] },
        },
      },
    }).select('phone currentLocation unitId crew vehicleNumber');

    if (!ambulance) {
      return res.json({ success: false, message: 'No ambulances available' });
    }

    const distance = calculateDistance(
      lat,
      long,
      ambulance.currentLocation.coordinates[1],
      ambulance.currentLocation.coordinates[0]
    );

    const request = await Request.create({
      userPhone,
      serviceType: 'ambulance',
      userLocation: { type: 'Point', coordinates: [long, lat] },
      mapsUrl: `https://www.google.com/maps?q=${lat},${long}`,
      assignedResponderPhone: ambulance.phone,
      assignedResponderType: 'ambulance',
      assignedDistanceMeters: Math.round(distance * 1000),
      status: 'pending',
      expireAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    const estimatedMinutes = 2 + distance * 2;

    return res.json({
      success: true,
      requestId: request._id,
      ambulance: {
        unitId: ambulance.unitId,
        vehicleNumber: ambulance.vehicleNumber,
        crew: ambulance.crew,
        phone: ambulance.phone,
        distance: distance.toFixed(1),
        estimatedMinutes: Math.round(estimatedMinutes),
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ---------------------- SOS: Nearest Officer ----------------------
export const sosOfficer = async (req, res) => {
  try {
    const { location, userPhone } = req.body || {};
    if (!location?.coordinates?.length) {
      return res.status(400).json({ success: false, message: 'location coordinates required' });
    }
    const [long, lat] = location.coordinates;

    const officer = await Officer.findOne({
      status: 'available',
      currentLocation: {
        $near: {
          $geometry: { type: 'Point', coordinates: [long, lat] },
        },
      },
    }).select('phone currentLocation badgeNumber department');

    if (!officer) {
      return res.json({ success: false, message: 'No officers available' });
    }

    const distance = calculateDistance(
      lat,
      long,
      officer.currentLocation.coordinates[1],
      officer.currentLocation.coordinates[0]
    );

    const request = await Request.create({
      userPhone,
      serviceType: 'police',
      userLocation: { type: 'Point', coordinates: [long, lat] },
      mapsUrl: `https://www.google.com/maps?q=${lat},${long}`,
      assignedResponderPhone: officer.phone,
      assignedResponderType: 'officer',
      assignedDistanceMeters: Math.round(distance * 1000),
      status: 'pending',
      expireAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    const estimatedMinutes = 1 + distance * 1.5;

    return res.json({
      success: true,
      requestId: request._id,
      officer: {
        badgeNumber: officer.badgeNumber,
        department: officer.department,
        phone: officer.phone,
        distance: distance.toFixed(1),
        estimatedMinutes: Math.round(estimatedMinutes),
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
