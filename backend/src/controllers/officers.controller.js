import twilio from 'twilio';
import Officer from '../models/Officer.js';
import { isE164Phone } from '../utils/validate.js';
import { sendOtp, verifyOtp } from '../utils/otp.js';

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const VERIFY_SERVICE_SID = process.env.TWILIO_VERIFY_SERVICE_SID;

export const upsertOfficer = async (req, res) => {
	try {
		const { phone, ...rest } = req.body || {};
		if (!phone || !isE164Phone(phone)) {
			return res.status(400).json({ error: 'phone required (E.164)' });
		}
		if ('phoneVerified' in rest) delete rest.phoneVerified;

		const officer = await Officer.findOneAndUpdate(
			{ phone },
			{ $set: { phone, ...rest } },
			{ upsert: true, new: true }
		);
		return res.json({ officer });
	} catch (e) {
		return res.status(500).json({ error: e.message });
	}
};

export const sendOfficerOtp = async (req, res) => {
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

export const verifyOfficerOtp = async (req, res) => {
	try {
		const { phone, code } = req.body || {};
		if (!phone || !isE164Phone(phone) || !code) {
			return res.status(400).json({ error: 'phone (E.164) and code required' });
		}
		const check = await verifyOtp(phone, code);

		if (check.status === 'approved') {
			await Officer.findOneAndUpdate({ phone }, { $set: { phoneVerified: true } });
			return res.json({ approved: true, status: check.status });
		}
		return res.status(400).json({ approved: false, status: check.status, error: 'Invalid or expired code' });
	} catch (e) {
		return res.status(400).json({ error: e.message });
	}
}; 