import twilio from 'twilio';
import User from '../models/User.js';
import { isE164Phone } from '../utils/validate.js';

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const MESSAGING_SERVICE_SID = process.env.TWILIO_MESSAGING_SERVICE_SID;

export const triggerSOS = async (req, res) => {
	try {
		const { phone, type, lat, lng } = req.body || {};
		if (!phone || !isE164Phone(phone)) {
			return res.status(400).json({ error: 'phone required (E.164)' });
		}
		if (!lat || !lng || isNaN(Number(lat)) || isNaN(Number(lng))) {
			return res.status(400).json({ error: 'valid lat and lng required' });
		}
		const serviceType = (typeof type === 'string' ? type.toLowerCase() : '').trim();
		if (!['police', 'ambulance'].includes(serviceType)) {
			return res.status(400).json({ error: "type must be 'police' or 'ambulance'" });
		}

		const user = await User.findOne({ phone }).lean();
		if (!user) {
			return res.status(404).json({ error: 'user not found' });
		}
		const contacts = Array.isArray(user.emergencyContacts) ? user.emergencyContacts : [];
		const recipientPhones = contacts
			.map(c => c?.phone)
			.filter(p => isE164Phone(p));

		if (recipientPhones.length === 0) {
			return res.status(400).json({ error: 'no valid emergency contact phones' });
		}

		const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
		const userName = [user?.name?.first, user?.name?.last].filter(Boolean).join(' ') || 'Your contact';
		const msg = `SOS ${serviceType.toUpperCase()} ALERT\n${userName} needs help.\nLocation: ${mapsUrl}`;

		const results = await Promise.allSettled(
			recipientPhones.map(to => client.messages.create({
				messagingServiceSid: MESSAGING_SERVICE_SID,
				to,
				body: msg
			}))
		);

		const sent = results.filter(r => r.status === 'fulfilled').length;
		const failed = results.length - sent;
		return res.json({ sent, failed });
	} catch (e) {
		return res.status(500).json({ error: e.message });
	}
}; 