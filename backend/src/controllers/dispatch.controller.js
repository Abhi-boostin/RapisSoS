import twilio from 'twilio';
import Request from '../models/Request.js';
import Officer from '../models/Officer.js';
import Ambulance from '../models/Ambulance.js';
import User from '../models/User.js';
import { isE164Phone } from '../utils/validate.js';

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const MESSAGING_SERVICE_SID = process.env.TWILIO_MESSAGING_SERVICE_SID;

const timers = new Map(); // requestId -> timeout

function toMeters(km) { return Math.round(km * 1000); }

async function findNearest(serviceType, lng, lat) {
	if (serviceType === 'police') {
		const officer = await Officer.findOne({ dutyStatus: 'on' })
			.where('currentLocation').near({ center: { type: 'Point', coordinates: [lng, lat] }, spherical: true })
			.lean();
		return officer ? { type: 'officer', phone: officer.phone } : null;
	}
	if (serviceType === 'ambulance') {
		const amb = await Ambulance.findOne({ status: 'available', phoneVerified: true })
			.where('currentLocation').near({ center: { type: 'Point', coordinates: [lng, lat] }, spherical: true })
			.lean();
		return amb ? { type: 'ambulance', phone: amb.phone } : null;
	}
	return null;
}

async function distanceMeters(responderType, responderPhone, lng, lat) {
	if (responderType === 'officer') {
		const o = await Officer.findOne({ phone: responderPhone }).lean();
		if (!o?.currentLocation?.coordinates) return undefined;
		// Simple Haversine via Mongo not available here; approximate using deltas
		return undefined;
	}
	if (responderType === 'ambulance') {
		const a = await Ambulance.findOne({ phone: responderPhone }).lean();
		if (!a?.currentLocation?.coordinates) return undefined;
		return undefined;
	}
	return undefined;
}

async function notifyEmergencyContacts(user, mapsUrl, serviceType) {
	const contacts = Array.isArray(user.emergencyContacts) ? user.emergencyContacts : [];
	const phones = contacts.map(c => c?.phone).filter(p => isE164Phone(p));
	if (phones.length === 0) return { sent: 0 };
	const msg = `SOS ${serviceType.toUpperCase()} ALERT\n${user.name?.first || 'User'} needs help.\nLocation: ${mapsUrl}`;
	const results = await Promise.allSettled(phones.map(to => client.messages.create({ messagingServiceSid: MESSAGING_SERVICE_SID, to, body: msg })));
	return { sent: results.filter(r => r.status === 'fulfilled').length };
}

export const createDispatch = async (req, res) => {
	try {
		const { phone, serviceType, lat, lng } = req.body || {};
		if (!phone || !isE164Phone(phone)) return res.status(400).json({ error: 'phone (E.164) required' });
		if (!['police', 'ambulance'].includes(String(serviceType))) return res.status(400).json({ error: "serviceType must be 'police' or 'ambulance'" });
		const lngNum = Number(lng), latNum = Number(lat);
		if (!Number.isFinite(lngNum) || !Number.isFinite(latNum)) return res.status(400).json({ error: 'valid lat,lng required' });

		const user = await User.findOne({ phone }).lean();
		if (!user) return res.status(404).json({ error: 'user not found' });
		const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${latNum},${lngNum}`;

		const nearest = await findNearest(serviceType, lngNum, latNum);
		if (!nearest) return res.status(404).json({ error: 'no on-duty responder available' });

		const reqDoc = await Request.create({
			userPhone: phone,
			serviceType,
			userLocation: { type: 'Point', coordinates: [lngNum, latNum] },
			mapsUrl,
			assignedResponderType: nearest.type,
			assignedResponderPhone: nearest.phone,
			status: 'pending',
			expireAt: new Date(Date.now() + 5000)
		});

		// Notify emergency contacts in parallel (fire-and-forget)
		notifyEmergencyContacts(user, mapsUrl, serviceType).catch(() => {});

		// Arm 5s timeout to auto-decline and reroute
		const t = setTimeout(async () => {
			try {
				const fresh = await Request.findById(reqDoc._id);
				if (!fresh || fresh.status !== 'pending') return;
				await Request.findByIdAndUpdate(reqDoc._id, { $set: { status: 'declined', declinedAt: new Date() } });
				const next = await findNearest(serviceType, lngNum, latNum);
				if (next) {
					await Request.create({
						userPhone: phone,
						serviceType,
						userLocation: { type: 'Point', coordinates: [lngNum, latNum] },
						mapsUrl,
						assignedResponderType: next.type,
						assignedResponderPhone: next.phone,
						status: 'pending',
						expireAt: new Date(Date.now() + 5000)
					});
				}
			} catch {}
		}, 5000);
		timers.set(String(reqDoc._id), t);

		return res.json({ requestId: String(reqDoc._id), assigned: nearest });
	} catch (e) {
		return res.status(500).json({ error: e.message });
	}
};

export const acceptDispatch = async (req, res) => {
	try {
		const { requestId, responderPhone } = req.body || {};
		if (!requestId || !isE164Phone(responderPhone)) return res.status(400).json({ error: 'requestId and responderPhone (E.164) required' });
		const doc = await Request.findById(requestId);
		if (!doc || doc.status !== 'pending') return res.status(400).json({ error: 'invalid or non-pending request' });
		if (doc.assignedResponderPhone !== responderPhone) return res.status(403).json({ error: 'not assigned to this responder' });

		await Request.findByIdAndUpdate(requestId, { $set: { status: 'accepted', acceptedAt: new Date() } });
		clearTimeout(timers.get(String(requestId)));
		timers.delete(String(requestId));

		if (doc.assignedResponderType === 'officer') {
			await Officer.findOneAndUpdate({ phone: responderPhone }, { $set: { dutyStatus: 'on' } });
		} else if (doc.assignedResponderType === 'ambulance') {
			await Ambulance.findOneAndUpdate({ phone: responderPhone }, { $set: { status: 'enroute' } });
		}
		return res.json({ ok: true });
	} catch (e) {
		return res.status(500).json({ error: e.message });
	}
};

export const declineDispatch = async (req, res) => {
	try {
		const { requestId, responderPhone } = req.body || {};
		if (!requestId || !isE164Phone(responderPhone)) return res.status(400).json({ error: 'requestId and responderPhone (E.164) required' });
		const doc = await Request.findById(requestId);
		if (!doc || doc.status !== 'pending') return res.status(400).json({ error: 'invalid or non-pending request' });
		if (doc.assignedResponderPhone !== responderPhone) return res.status(403).json({ error: 'not assigned to this responder' });

		await Request.findByIdAndUpdate(requestId, { $set: { status: 'declined', declinedAt: new Date() } });
		clearTimeout(timers.get(String(requestId)));
		timers.delete(String(requestId));
		return res.json({ ok: true });
	} catch (e) {
		return res.status(500).json({ error: e.message });
	}
};

export const updateOfficerStatusLocation = async (req, res) => {
	try {
		const { phone, dutyStatus, lng, lat } = req.body || {};
		if (!phone || !isE164Phone(phone)) return res.status(400).json({ error: 'phone required (E.164)' });
		const update = { lastStatusAt: new Date() };
		if (dutyStatus) update.dutyStatus = dutyStatus;
		if (lng !== undefined && lat !== undefined) {
			const lngNum = Number(lng); const latNum = Number(lat);
			if (Number.isFinite(lngNum) && Number.isFinite(latNum)) {
				update.currentLocation = { type: 'Point', coordinates: [lngNum, latNum] };
			}
		}
		const officer = await Officer.findOneAndUpdate({ phone }, { $set: update }, { new: true });
		if (!officer) return res.status(404).json({ error: 'officer not found' });
		return res.json({ officer });
	} catch (e) {
		return res.status(500).json({ error: e.message });
	}
}; 