// controllers/users.controller.js
import User from '../models/User.js';
import Officer from '../models/Officer.js';
import Ambulance from '../models/Ambulance.js';
import Request from '../models/Request.js';
import { verifyOtp as verifyOtpUtil, sendOtp as sendOtpUtil } from '../utils/otp.js';

// Haversine
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Send OTP
export const sendUserOtp = async (req, res) => {
  try {
    const { phone } = req.body || {};
    if (!phone) return res.status(400).json({ success: false, message: 'phone required' });
    const resp = await sendOtpUtil(phone);
    if (!resp.success) return res.status(400).json({ success: false, message: resp.error, code: resp.code, status: resp.status, moreInfo: resp.moreInfo });
    return res.json({ success: true, message: 'OTP send initiated', to: resp.to });
  } catch (err) {
    return res.status(500).json({ success: false, message: err?.message || 'Server error' });
  }
};

// Verify OTP
export const verifyUser = async (req, res) => {
  try {
    const { phone, code } = req.body || {};
    if (!phone || !code) return res.status(400).json({ success: false, message: 'phone and code required' });
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
    return res.status(400).json({ success: false, message: check.error || 'Invalid or expired OTP', code: check.code, status: check.status, moreInfo: check.moreInfo });
  } catch (err) {
    return res.status(500).json({ success: false, message: err?.message || 'Server error' });
  }
};

// Update User (full profile)
export const updateUser = async (req, res) => {
  try {
    const {
      phone, name, dob, bloodGroup, allergies, medicalConditions, medications, specialNeeds,
      emergencyContacts, aadhaarNumber, homeAddress, photoUrl
    } = req.body || {};
    if (!phone) return res.status(400).json({ success: false, message: 'phone required' });
    const updateData = {};
    if (name) updateData.name = name;
    if (dob) updateData.dob = dob;
    if (bloodGroup) updateData.bloodGroup = bloodGroup;
    if (allergies) updateData.allergies = allergies;
    if (medicalConditions) updateData.medicalConditions = medicalConditions;
    if (medications) updateData.medications = medications;
    if (specialNeeds) updateData.specialNeeds = specialNeeds;
    if (emergencyContacts) updateData.emergencyContacts = emergencyContacts;
    if (aadhaarNumber) updateData.aadhaarNumber = aadhaarNumber;
    if (homeAddress) updateData.homeAddress = homeAddress;
    if (photoUrl) updateData.photoUrl = photoUrl;
    const user = await User.findOneAndUpdate({ phone }, { $set: updateData }, { new: true });
    return res.json({ success: true, user });
  } catch {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// SOS: Nearest Ambulance (minimal response on create)
export const sosAmbulance = async (req, res) => {
  try {
    const { location, userPhone } = req.body || {};
    if (!location?.coordinates?.length || !userPhone) {
      return res.status(400).json({ success: false, message: 'userPhone and location required' });
    }
    const [long, lat] = location.coordinates;

    const ambulance = await Ambulance.findOne({
      status: 'available',
      currentLocation: { $near: { $geometry: { type: 'Point', coordinates: [long, lat] } } },
    }).select('phone currentLocation');

    if (!ambulance) {
      return res.json({ success: false, message: 'No ambulances available' });
    }

    const distanceKm = calculateDistance(
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
      assignedDistanceMeters: Math.round(distanceKm * 1000),
      status: 'pending',
      expireAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    // Return minimal details; full details only after accept via GET /users/request/:id
    return res.json({ success: true, requestId: request._id, status: 'pending' });
  } catch {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// SOS: Nearest Officer (minimal response on create)
export const sosOfficer = async (req, res) => {
  try {
    const { location, userPhone } = req.body || {};
    if (!location?.coordinates?.length || !userPhone) {
      return res.status(400).json({ success: false, message: 'userPhone and location required' });
    }
    const [long, lat] = location.coordinates;

    const officer = await Officer.findOne({
      dutyStatus: 'on',
      currentLocation: { $near: { $geometry: { type: 'Point', coordinates: [long, lat] } } },
    }).select('phone currentLocation');

    if (!officer) {
      return res.json({ success: false, message: 'No officers available' });
    }

    const distanceKm = calculateDistance(
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
      assignedDistanceMeters: Math.round(distanceKm * 1000),
      status: 'pending',
      expireAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    return res.json({ success: true, requestId: request._id, status: 'pending' });
  } catch {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// New: User can poll request status; reveals details only after accept
export const getUserRequestStatus = async (req, res) => {
  try {
    const { id } = req.params || {};
    const reqDoc = await Request.findById(id);
    if (!reqDoc) return res.status(404).json({ success: false, message: 'Request not found' });

    const base = {
      success: true,
      id: reqDoc._id,
      status: reqDoc.status,
      createdAt: reqDoc.createdAt,
      secondsRemaining: reqDoc.secondsRemaining,
      mapsUrl: reqDoc.mapsUrl,
      serviceType: reqDoc.serviceType,
    };

    if (reqDoc.status !== 'accepted') {
      return res.json(base);
    }

    // Accepted: include responder details and ETA
    if (reqDoc.assignedResponderType === 'ambulance') {
      const amb = await Ambulance.findOne({ phone: reqDoc.assignedResponderPhone }).select('phone unitId vehiclePlate crew');
      return res.json({
        ...base,
        responder: {
          type: 'ambulance',
          phone: amb?.phone,
          unitId: amb?.unitId,
          vehiclePlate: amb?.vehiclePlate,
          crew: amb?.crew,
        },
        etaMinutes: reqDoc.meta?.estimatedArrivalMinutes,
        distanceMeters: reqDoc.assignedDistanceMeters,
      });
    }

    if (reqDoc.assignedResponderType === 'officer') {
      const off = await Officer.findOne({ phone: reqDoc.assignedResponderPhone }).select('phone fullName agency rank');
      return res.json({
        ...base,
        responder: {
          type: 'officer',
          phone: off?.phone,
          fullName: off?.fullName,
          agency: off?.agency,
          rank: off?.rank,
        },
        etaMinutes: reqDoc.meta?.estimatedArrivalMinutes,
        distanceMeters: reqDoc.assignedDistanceMeters,
      });
    }

    return res.json(base);
  } catch {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
