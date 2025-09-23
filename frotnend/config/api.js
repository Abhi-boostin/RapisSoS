export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const endpoints = {
    // User endpoints
    userVerifyOtp: `${API_URL}/users/verifyotp`,
    userUpdate: `${API_URL}/users/update`,
    sosAmbulance: `${API_URL}/users/sos/ambulance`,
    sosOfficer: `${API_URL}/users/sos/officer`,

    // Ambulance endpoints
    ambulanceVerifyOtp: `${API_URL}/ambulances/verifyotp`,
    ambulanceUpdate: `${API_URL}/ambulances/update`,
    ambulanceStatus: `${API_URL}/ambulances/status`,
    ambulanceRequests: `${API_URL}/ambulances/requests`,
    ambulanceAcceptRequest: (id) => `${API_URL}/ambulances/requests/${id}/accept`,
    ambulanceDeclineRequest: (id) => `${API_URL}/ambulances/requests/${id}/decline`,

    // Officer endpoints
    officerVerifyOtp: `${API_URL}/officers/verifyotp`,
    officerUpdate: `${API_URL}/officers/update`,
    officerStatus: `${API_URL}/officers/status`,
    officerRequests: `${API_URL}/officers/requests`,
    officerAcceptRequest: (id) => `${API_URL}/officers/requests/${id}/accept`,
    officerDeclineRequest: (id) => `${API_URL}/officers/requests/${id}/decline`,
};