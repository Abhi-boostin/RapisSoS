// utils/otp.js
import twilio from 'twilio';

const {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_VERIFY_SERVICE_SID,
} = process.env;

if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
  // Fail fast in boot logs
  // Do not throw here in serverless runtimes; prefer logging.
  // eslint-disable-next-line no-console
  console.error('Twilio credentials missing: TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN');
}

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

function isValidVaSid(sid) {
  return typeof sid === 'string' && /^VA[0-9a-fA-F]{32}$/.test(sid.trim());
}

// Normalize to E.164 using Lookup v2; throws if invalid/unfetchable
async function toE164(phone) {
  const pn = await client.lookups.v2
    .phoneNumbers(phone)
    // validation field is optional; Lookup will 404 on clearly invalid numbers
    .fetch({ fields: 'validation' });
  const e164 = pn.phoneNumber; // E.164 like +91XXXXXXXXXX
  if (!e164) throw new Error('Invalid phone number');
  return e164;
}

// Send OTP via Twilio Verify
export async function sendOtp(rawPhone) {
  try {
    const serviceSid = (TWILIO_VERIFY_SERVICE_SID || '').trim();
    if (!isValidVaSid(serviceSid)) {
      return { success: false, error: 'Invalid Twilio Verify Service SID' };
    }
    const to = await toE164(rawPhone);

    const verification = await client.verify.v2
      .services(serviceSid)
      .verifications.create({
        to,
        channel: 'sms',
        // Optional: locale: 'en',
        // Optional: customCode: '123456' // for testing with approved use
      });

    // status "pending" means code generated and send attempted
    return { success: true, to, verification };
  } catch (err) {
    // Surface Twilio error context
    // eslint-disable-next-line no-console
    console.error('Send OTP error:', {
      code: err?.code,
      status: err?.status,
      message: err?.message,
      moreInfo: err?.moreInfo,
    });
    return {
      success: false,
      error: err?.message || 'Failed to send OTP',
      code: err?.code,
      status: err?.status,
      moreInfo: err?.moreInfo,
    };
  }
}

// Verify OTP via Twilio Verify
export async function verifyOtp(rawPhone, code) {
  try {
    const serviceSid = (TWILIO_VERIFY_SERVICE_SID || '').trim();
    if (!isValidVaSid(serviceSid)) {
      return { success: false, error: 'Invalid Twilio Verify Service SID' };
    }
    const to = await toE164(rawPhone);

    const result = await client.verify.v2
      .services(serviceSid)
      .verificationChecks.create({ to, code });

    const approved = result?.status === 'approved';
    return { success: approved, to, result };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Verify OTP error:', {
      code: err?.code,
      status: err?.status,
      message: err?.message,
      moreInfo: err?.moreInfo,
    });
    return {
      success: false,
      error: err?.message || 'Failed to verify OTP',
      code: err?.code,
      status: err?.status,
      moreInfo: err?.moreInfo,
    };
  }
}
