// utils/otp.js
import twilio from 'twilio';

function getTwilioConfig() {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VERIFY_SERVICE_SID } = process.env;
  return {
    accountSid: TWILIO_ACCOUNT_SID,
    authToken: TWILIO_AUTH_TOKEN,
    serviceSid: (TWILIO_VERIFY_SERVICE_SID || '').trim(),
  };
}

function getClient() {
  const { accountSid, authToken } = getTwilioConfig();
  return twilio(accountSid, authToken);
}

function isValidVaSid(sid) {
  return typeof sid === 'string' && /^VA[0-9a-fA-F]{32}$/.test(sid);
}

async function toE164(client, phone) {
  const pn = await client.lookups.v2.phoneNumbers(phone).fetch({ fields: 'validation' });
  const e164 = pn.phoneNumber;
  if (!e164) throw new Error('Invalid phone number');
  return e164;
}

export async function sendOtp(rawPhone) {
  try {
    const client = getClient();
    const { serviceSid } = getTwilioConfig();
    if (!isValidVaSid(serviceSid)) return { success: false, error: 'Invalid Twilio Verify Service SID' };
    const to = await toE164(client, rawPhone);
    const verification = await client.verify.v2.services(serviceSid).verifications.create({ to, channel: 'sms' });
    return { success: true, to, verification };
  } catch (err) {
    console.error('Send OTP error:', { code: err?.code, status: err?.status, message: err?.message, moreInfo: err?.moreInfo });
    return { success: false, error: err?.message || 'Failed to send OTP', code: err?.code, status: err?.status, moreInfo: err?.moreInfo };
  }
}

export async function verifyOtp(rawPhone, code) {
  try {
    const client = getClient();
    const { serviceSid } = getTwilioConfig();
    if (!isValidVaSid(serviceSid)) return { success: false, error: 'Invalid Twilio Verify Service SID' };
    const to = await toE164(client, rawPhone);
    const result = await client.verify.v2.services(serviceSid).verificationChecks.create({ to, code });
    return { success: result?.status === 'approved', to, result };
  } catch (err) {
    console.error('Verify OTP error:', { code: err?.code, status: err?.status, message: err?.message, moreInfo: err?.moreInfo });
    return { success: false, error: err?.message || 'Failed to verify OTP', code: err?.code, status: err?.status, moreInfo: err?.moreInfo };
  }
}
