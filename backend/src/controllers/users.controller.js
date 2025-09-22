import User from '../models/User.js';
import { isE164Phone } from '../utils/validate.js';

export const upsertUser = async (req, res) => {
	try {
		const { phone, ...rest } = req.body || {};
		if (!phone || !isE164Phone(phone)) {
			return res.status(400).json({ error: 'phone required (E.164)' });
		}

		// Never allow phoneVerified to be set here
		if ('phoneVerified' in rest) delete rest.phoneVerified;

		const user = await User.findOneAndUpdate(
			{ phone },
			{ $set: { phone, ...rest } },
			{ upsert: true, new: true }
		);

		return res.json({ user });
	} catch (e) {
		return res.status(500).json({ error: e.message });
	}
}; 