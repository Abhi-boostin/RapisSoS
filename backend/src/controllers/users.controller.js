import User from '../models/User.js';
import Officer from '../models/Officer.js';
import Ambulance from '../models/Ambulance.js';
import Request from '../models/Request.js';
import { verifyOtp as verifyOtpUtil } from '../utils/otp.js';

// ---------------------- Helper: Haversine Distance ----------------------
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}

// ---------------------- Verify OTP ----------------------
export const verifyOtp = async (req, res) => {
    try {
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
    } catch (err) {
        console.error("OTP Verify Error:", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// ---------------------- Update User ----------------------
export const updateUser = async (req, res) => {
    try {
        const { phone, name, emergencyContacts, location } = req.body;

        const user = await User.findOneAndUpdate(
            { phone },
            { $set: { name, emergencyContacts, location } },
            { new: true }
        );

        return res.json({ success: true, user });
    } catch (err) {
        console.error("Update User Error:", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// ---------------------- SOS: Nearest Ambulance ----------------------
export const sosAmbulance = async (req, res) => {
    try {
        const { location, userPhone } = req.body;
        const [long, lat] = location.coordinates;

        // Find nearest available ambulance (no distance limit)
        const ambulance = await Ambulance.findOne({
            status: "available",
            currentLocation: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [long, lat]
                    }
                }
            }
        }).select("phone currentLocation unitId crew vehicleNumber");

        if (!ambulance) {
            return res.json({ success: false, message: "No ambulances available" });
        }

        // Calculate distance
        const distance = calculateDistance(
            lat, long,
            ambulance.currentLocation.coordinates[1],
            ambulance.currentLocation.coordinates[0]
        );

        // Create emergency request
        const request = await Request.create({
            userPhone,
            serviceType: "ambulance",
            userLocation: {
                type: "Point",
                coordinates: [long, lat]
            },
            mapsUrl: `https://www.google.com/maps?q=${lat},${long}`,
            assignedResponderPhone: ambulance.phone,
            assignedResponderType: "ambulance",
            assignedDistanceMeters: distance * 1000,
            status: "pending",
            expireAt: new Date(Date.now() + 5 * 60000) // 5 minutes
        });

        // Estimate arrival (2 min prep + 2 min/km)
        const estimatedMinutes = 2 + (distance * 2);

        return res.json({
            success: true,
            requestId: request._id,
            ambulance: {
                unitId: ambulance.unitId,
                vehicleNumber: ambulance.vehicleNumber,
                crew: ambulance.crew,
                phone: ambulance.phone,
                distance: distance.toFixed(1),
                estimatedMinutes: Math.round(estimatedMinutes)
            }
        });
    } catch (err) {
        console.error("SOS Ambulance Error:", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// ---------------------- SOS: Nearest Officer ----------------------
export const sosOfficer = async (req, res) => {
    try {
        const { location, userPhone } = req.body;
        const [long, lat] = location.coordinates;

        // Find nearest available officer (no distance limit)
        const officer = await Officer.findOne({
            status: "available",
            currentLocation: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [long, lat]
                    }
                }
            }
        }).select("phone currentLocation badgeNumber department");

        if (!officer) {
            return res.json({ success: false, message: "No officers available" });
        }

        // Calculate distance
        const distance = calculateDistance(
            lat, long,
            officer.currentLocation.coordinates[1],
            officer.currentLocation.coordinates[0]
        );

        // Create emergency request
        const request = await Request.create({
            userPhone,
            serviceType: "police",
            userLocation: {
                type: "Point",
                coordinates: [long, lat]
            },
            mapsUrl: `https://www.google.com/maps?q=${lat},${long}`,
            assignedResponderPhone: officer.phone,
            assignedResponderType: "officer",
            assignedDistanceMeters: distance * 1000,
            status: "pending",
            expireAt: new Date(Date.now() + 5 * 60000) // 5 minutes
        });

        // Estimate arrival (1 min prep + 1.5 min/km)
        const estimatedMinutes = 1 + (distance * 1.5);

        return res.json({
            success: true,
            requestId: request._id,
            officer: {
                badgeNumber: officer.badgeNumber,
                department: officer.department,
                phone: officer.phone,
                distance: distance.toFixed(1),
                estimatedMinutes: Math.round(estimatedMinutes)
            }
        });
    } catch (err) {
        console.error("SOS Officer Error:", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};
