// controllers/officers.controller.js
import Officer from '../models/Officer.js';
import Request from '../models/Request.js';
import User from '../models/User.js';
import { verifyOtp as verifyOtpUtil, sendOtp as sendOtpUtil } from '../utils/otp.js';

function kmFromMeters(m) { return (m || 0) / 1000; }
function etaFromDistanceKmOfficer(km) { return Math.round(1 + km * 1.5); }

export const sendOfficerOtp = async (req, res) => {
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

export const verifyOfficer = async (req, res) => {
  try {
    const { phone, code } = req.body || {};
    if (!phone || !code) return res.status(400).json({ success: false, message: 'phone and code required' });
    const check = await verifyOtpUtil(phone, code);
    if (check.success && check.result?.status === 'approved') {
      const normalized = check.to || phone;
      const officer = await Officer.findOneAndUpdate(
        { phone: normalized },
        { $set: { phone: normalized, phoneVerified: true } },
        { upsert: true, new: true }
      );
      return res.json({ success: true, message: 'OTP verified successfully', officer });
    }
    return res.status(400).json({ success: false, message: check.error || 'Invalid or expired OTP', code: check.code, status: check.status, moreInfo: check.moreInfo });
  } catch (err) {
    return res.status(500).json({ success: false, message: err?.message || 'Server error' });
  }
};

export const updateOfficer = async (req, res) => {
  try {
    const { phone, fullName, personalContact, employeeId, rank, agency, currentLocation } = req.body || {};
    if (!phone) return res.status(400).json({ success: false, message: 'phone required' });
    const updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (personalContact) updateData.personalContact = personalContact;
    if (employeeId) updateData.employeeId = employeeId;
    if (rank) updateData.rank = rank;
    if (agency) updateData.agency = agency;
    if (currentLocation) updateData.currentLocation = currentLocation;

    const officer = await Officer.findOneAndUpdate({ phone }, { $set: updateData }, { new: true });
    return res.json({ success: true, officer });
  } catch {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { phone, dutyStatus } = req.body || {};
    if (!phone || !dutyStatus) return res.status(400).json({ success: false, message: 'phone and dutyStatus required' });
    if (!['on', 'off'].includes(dutyStatus)) return res.status(400).json({ success: false, message: 'invalid dutyStatus' });
    const officer = await Officer.findOneAndUpdate({ phone }, { $set: { dutyStatus, lastStatusAt: new Date() } }, { new: true });
    return res.json({ success: true, officer });
  } catch {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getRequests = async (req, res) => {
  try {
    const { phone } = req.query || {};
    if (!phone) return res.status(400).json({ success: false, message: 'phone required' });
    const requests = await Request.find({
      assignedResponderType: 'officer',
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
    const { officerPhone } = req.body || {};
    const request = await Request.findById(id);
    if (!request || request.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Request not available' });
    }
    if (request.assignedResponderPhone !== officerPhone) {
      return res.status(400).json({ success: false, message: 'Not authorized' });
    }

    const distanceKm = kmFromMeters(request.assignedDistanceMeters);
    request.status = 'accepted';
    request.acceptedAt = new Date();
    request.meta = request.meta || {};
    request.meta.estimatedArrivalMinutes = etaFromDistanceKmOfficer(distanceKm);
    await request.save();

    await Officer.findOneAndUpdate(
      { phone: officerPhone },
      { $set: { dutyStatus: 'off', lastStatusAt: new Date() } }
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
    const { officerPhone } = req.body || {};
    const request = await Request.findById(id);
    if (!request || request.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Request not available' });
    }
    if (request.assignedResponderPhone !== officerPhone) {
      return res.status(400).json({ success: false, message: 'Not authorized' });
    }

    request.status = 'declined';
    request.declinedAt = new Date();
    await request.save();

    const nextOfficer = await Officer.findOne({
      phone: { $ne: officerPhone },
      dutyStatus: 'on',
      currentLocation: {
        $near: {
          $geometry: { type: 'Point', coordinates: request.userLocation.coordinates },
          $maxDistance: 10000,
        },
      },
    }).select('phone currentLocation fullName agency rank');

    if (!nextOfficer) {
      return res.json({ success: false, message: 'No other officers available' });
    }

    request.assignedResponderPhone = nextOfficer.phone;
    request.status = 'pending';
    request.expireAt = new Date(Date.now() + 5 * 60 * 1000);
    await request.save();

    return res.json({
      success: true,
      message: 'Request reassigned',
      request,
      nextOfficer: {
        phone: nextOfficer.phone,
        distance: (request.assignedDistanceMeters / 1000).toFixed(1),
      },
    });
  } catch {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};