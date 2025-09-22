import twilio from 'twilio';
import Ambulance from '../models/Ambulance.js';
import { isE164Phone } from '../utils/validate.js';
import { sendOtp, verifyOtp } from '../utils/otp.js';

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const VERIFY_SERVICE_SID = process.env.TWILIO_VERIFY_SERVICE_SID;

export const upsertAmbulance = async (req, res) => {
	try {
		const { phone, ...rest } = req.body || {};
		if (!phone || !isE164Phone(phone)) {
			return res.status(400).json({ error: 'phone required (E.164)' });
		}
		if ('phoneVerified' in rest) delete rest.phoneVerified;

		const ambulance = await Ambulance.findOneAndUpdate(
			{ phone },
			{ $set: { phone, ...rest } },
			{ upsert: true, new: true }
		);
		return res.json({ ambulance });
	} catch (e) {
		return res.status(500).json({ error: e.message });
	}
};

export const sendAmbulanceOtp = async (req, res) => {
	try {
		const { phone } = req.body || {};
		if (!phone || !isE164Phone(phone)) {
			return res.status(400).json({ error: 'phone required (E.164)' });
		}
		const verification = await sendOtp(phone);
		return res.json({ status: verification.status });
	} catch (e) {
		return res.status(400).json({ error: e.message });
	}
};

export const verifyAmbulanceOtp = async (req, res) => {
	try {
		const { phone, code } = req.body || {};
		if (!phone || !isE164Phone(phone) || !code) {
			return res.status(400).json({ error: 'phone (E.164) and code required' });
		}
		const check = await verifyOtp(phone, code);

		if (check.status === 'approved') {
			await Ambulance.findOneAndUpdate({ phone }, { $set: { phoneVerified: true } });
			return res.json({ approved: true, status: check.status });
		}
		return res.status(400).json({ approved: false, status: check.status, error: 'Invalid or expired code' });
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