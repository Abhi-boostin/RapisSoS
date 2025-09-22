export function isE164Phone(phone) {
	const e164 = /^\+[1-9]\d{1,14}$/;
	return typeof phone === 'string' && e164.test(phone);
}
