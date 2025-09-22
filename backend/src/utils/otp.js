import twilio from 'twilio';

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const VERIFY_SERVICE_SID = process.env.TWILIO_VERIFY_SERVICE_SID;

export async function sendOtp(phone) {
	return client.verify.v2.services(VERIFY_SERVICE_SID)
		.verifications.create({ to: phone, channel: 'sms' });
}

export async function verifyOtp(phone, code) {
	return client.verify.v2.services(VERIFY_SERVICE_SID)
		.verificationChecks.create({ to: phone, code });
} 