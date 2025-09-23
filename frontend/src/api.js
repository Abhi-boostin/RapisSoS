// I will create a simple API client for all backend endpoints with base URL from env.
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false) {
    const message = data?.message || `Request failed: ${res.status}`;
    throw new Error(message);
  }
  return data;
}

export const api = {
  // Users
  sendUserOtp: (phone) => request('/users/sendotp', { method: 'POST', body: JSON.stringify({ phone }) }),
  verifyUser: (phone, code) => request('/users/verifyotp', { method: 'POST', body: JSON.stringify({ phone, code }) }),
  updateUser: (payload) => request('/users/update', { method: 'POST', body: JSON.stringify(payload) }),
  sosOfficer: (userPhone, location) => request('/users/sos/officer', { method: 'POST', body: JSON.stringify({ userPhone, location }) }),
  sosAmbulance: (userPhone, location) => request('/users/sos/ambulance', { method: 'POST', body: JSON.stringify({ userPhone, location }) }),

  // Officers
  sendOfficerOtp: (phone) => request('/officers/sendotp', { method: 'POST', body: JSON.stringify({ phone }) }),
  verifyOfficer: (phone, code) => request('/officers/verifyotp', { method: 'POST', body: JSON.stringify({ phone, code }) }),
  updateOfficer: (payload) => request('/officers/update', { method: 'POST', body: JSON.stringify(payload) }),
  officerStatus: (phone, status) => request('/officers/status', { method: 'POST', body: JSON.stringify({ phone, status }) }),
  officerRequests: (phone) => request(`/officers/requests?phone=${encodeURIComponent(phone)}`),
  officerAccept: (id, officerPhone) => request(`/officers/requests/${id}/accept`, { method: 'POST', body: JSON.stringify({ officerPhone }) }),
  officerDecline: (id, officerPhone) => request(`/officers/requests/${id}/decline`, { method: 'POST', body: JSON.stringify({ officerPhone }) }),

  // Ambulances
  sendAmbulanceOtp: (phone) => request('/ambulances/sendotp', { method: 'POST', body: JSON.stringify({ phone }) }),
  verifyAmbulance: (phone, code) => request('/ambulances/verifyotp', { method: 'POST', body: JSON.stringify({ phone, code }) }),
  updateAmbulance: (payload) => request('/ambulances/update', { method: 'POST', body: JSON.stringify(payload) }),
  ambulanceStatus: (phone, status) => request('/ambulances/status', { method: 'POST', body: JSON.stringify({ phone, status }) }),
  ambulanceRequests: (phone) => request(`/ambulances/requests?phone=${encodeURIComponent(phone)}`),
  ambulanceAccept: (id, ambulancePhone) => request(`/ambulances/requests/${id}/accept`, { method: 'POST', body: JSON.stringify({ ambulancePhone }) }),
  ambulanceDecline: (id, ambulancePhone) => request(`/ambulances/requests/${id}/decline`, { method: 'POST', body: JSON.stringify({ ambulancePhone }) }),
}; 