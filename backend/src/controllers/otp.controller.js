import User from '../models/User.js';
import { isE164Phone } from '../utils/validate.js';
import { verifyOtp } from '../utils/otp.js';

export const verifyPhone = async (req, res) => {
	try {
		const { phone, code } = req.body || {};
		if (!phone || !isE164Phone(phone) || !code) {
			return res.status(400).json({ error: 'phone (E.164) and code required' });
		}

		const check = await verifyOtp(phone, code);

		if (check.status === 'approved') {
			await User.findOneAndUpdate({ phone }, { $set: { phoneVerified: true } });
			return res.json({ approved: true, status: check.status });
		}
		return res.status(400).json({ approved: false, status: check.status, error: 'Invalid or expired code' });
	} catch (e) {
		return res.status(400).json({ error: e.message });
	}
};
