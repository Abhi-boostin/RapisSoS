// controllers/ambulances.controller.js
import Ambulance from '../models/Ambulance.js';
import Request from '../models/Request.js';
import User from '../models/User.js';
import { verifyOtp as verifyOtpUtil, sendOtp as sendOtpUtil } from '../utils/otp.js';

function kmFromMeters(m) { return (m || 0) / 1000; }

// Simple estimate helpers (can be tuned)
function etaFromDistanceKmAmbulance(km) { return Math.round(2 + km * 2); }
function etaFromDistanceKmOfficer(km) { return Math.round(1 + km * 1.5); }

export const sendAmbulanceOtp = async (req, res) => {
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

export const verifyAmbulance = async (req, res) => {
  try {
    const { phone, code } = req.body || {};
    if (!phone || !code) return res.status(400).json({ success: false, message: 'phone and code required' });
    const check = await verifyOtpUtil(phone, code);
    if (check.success && check.result?.status === 'approved') {
      const normalized = check.to || phone;
      const ambulance = await Ambulance.findOneAndUpdate(
        { phone: normalized },
        { $set: { phone: normalized, phoneVerified: true } },
        { upsert: true, new: true }
      );
      return res.json({ success: true, message: 'OTP verified successfully', ambulance });
    }
    return res.status(400).json({ success: false, message: check.error || 'Invalid or expired OTP', code: check.code, status: check.status, moreInfo: check.moreInfo });
  } catch (err) {
    return res.status(500).json({ success: false, message: err?.message || 'Server error' });
  }
};

// Full profile update
export const updateAmbulance = async (req, res) => {
  try {
    const {
      phone, unitId, vehiclePlate, registrationNumber, makeModel, color, agencyName, ownership,
      region, baseStation, capabilities, crew, currentLocation
    } = req.body || {};
    if (!phone) return res.status(400).json({ success: false, message: 'phone required' });
    const updateData = {};
    if (unitId) updateData.unitId = unitId;
    if (vehiclePlate) updateData.vehiclePlate = vehiclePlate;
    if (registrationNumber) updateData.registrationNumber = registrationNumber;
    if (makeModel) updateData.makeModel = makeModel;
    if (color) updateData.color = color;
    if (agencyName) updateData.agencyName = agencyName;
    if (ownership) updateData.ownership = ownership;
    if (region) updateData.region = region;
    if (baseStation) updateData.baseStation = baseStation;
    if (capabilities) updateData.capabilities = capabilities;
    if (crew) updateData.crew = crew;
    if (currentLocation) updateData.currentLocation = currentLocation;

    const ambulance = await Ambulance.findOneAndUpdate({ phone }, { $set: updateData }, { new: true });
    return res.json({ success: true, ambulance });
  } catch {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { phone, status } = req.body || {};
    if (!phone || !status) return res.status(400).json({ success: false, message: 'phone and status required' });
    const allowed = ['available', 'enroute', 'busy', 'offline'];
    if (!allowed.includes(status)) return res.status(400).json({ success: false, message: 'invalid status' });
    const ambulance = await Ambulance.findOneAndUpdate({ phone }, { $set: { status, lastStatusAt: new Date() } }, { new: true });
    return res.json({ success: true, ambulance });
  } catch {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getRequests = async (req, res) => {
  try {
    const { phone } = req.query || {};
    if (!phone) return res.status(400).json({ success: false, message: 'phone required' });
    const requests = await Request.find({
      assignedResponderType: 'ambulance',
      assignedResponderPhone: phone,
      status: 'pending',
      expireAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    const requestsWithUserInfo = await Promise.all(
      requests.map(async (request) => {
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
          user: user
            ? {
                name: user.name,
                phone: user.phone,
                bloodGroup: user.bloodGroup,
                allergies: user.allergies,
                medicalConditions: user.medicalConditions,
                medications: user.medications,
                specialNeeds: user.specialNeeds,
                emergencyContacts: user.emergencyContacts,
              }
            : null,
        };
      })
    );

    return res.json({ success: true, requests: requestsWithUserInfo });
  } catch {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const acceptRequest = async (req, res) => {
  try {
    const { id } = req.params || {};
    const { ambulancePhone } = req.body || {};
    const request = await Request.findById(id);
    if (!request || request.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Request not available' });
    }
    if (request.assignedResponderPhone !== ambulancePhone) {
      return res.status(400).json({ success: false, message: 'Not authorized' });
    }

    const distanceKm = kmFromMeters(request.assignedDistanceMeters);
    request.status = 'accepted';
    request.acceptedAt = new Date();
    request.meta = request.meta || {};
    request.meta.estimatedArrivalMinutes = etaFromDistanceKmAmbulance(distanceKm);
    await request.save();

    await Ambulance.findOneAndUpdate(
      { phone: ambulancePhone },
      { $set: { status: 'enroute', lastStatusAt: new Date() } }
    );

    const user = await User.findOne({ phone: request.userPhone });

    return res.json({
      success: true,
      message: 'Request accepted',
      request,
      userLocation: request.userLocation,
      mapsUrl: request.mapsUrl,
      user: user
        ? {
            name: user.name,
            phone: user.phone,
            bloodGroup: user.bloodGroup,
            allergies: user.allergies,
            medicalConditions: user.medicalConditions,
            medications: user.medications,
            specialNeeds: user.specialNeeds,
            emergencyContacts: user.emergencyContacts,
          }
        : null,
    });
  } catch {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const declineRequest = async (req, res) => {
  try {
    const { id } = req.params || {};
    const { ambulancePhone } = req.body || {};
    const request = await Request.findById(id);
    if (!request || request.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Request not available' });
    }
    if (request.assignedResponderPhone !== ambulancePhone) {
      return res.status(400).json({ success: false, message: 'Not authorized' });
    }

    request.status = 'declined';
    request.declinedAt = new Date();
    await request.save();

    const nextAmbulance = await Ambulance.findOne({
      phone: { $ne: ambulancePhone },
      status: 'available',
      currentLocation: {
        $near: {
          $geometry: { type: 'Point', coordinates: request.userLocation.coordinates },
          $maxDistance: 10000,
        },
      },
    }).select('phone currentLocation unitId crew vehiclePlate');

    if (!nextAmbulance) {
      return res.json({ success: false, message: 'No other ambulances available' });
    }

    const [long, lat] = request.userLocation.coordinates;
    const [ambLong, ambLat] = nextAmbulance.currentLocation.coordinates;
    const distanceKm = Math.hypot(ambLat - lat, ambLong - long); // not accurate but unused in UI here

    request.assignedResponderPhone = nextAmbulance.phone;
    request.status = 'pending';
    request.expireAt = new Date(Date.now() + 5 * 60 * 1000);
    request.assignedDistanceMeters = request.assignedDistanceMeters; // keep previous, or recompute if desired
    await request.save();

    return res.json({
      success: true,
      message: 'Request reassigned',
      request,
      nextAmbulance: {
        unitId: nextAmbulance.unitId,
        vehicleNumber: nextAmbulance.vehiclePlate,
        crew: nextAmbulance.crew,
        distance: (request.assignedDistanceMeters / 1000).toFixed(1),
      },
    });
  } catch {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
