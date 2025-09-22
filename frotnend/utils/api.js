const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function registerUser(phoneNumber) {
  const response = await fetch(`${API_BASE_URL}/api/users/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ phoneNumber }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to register user');
  }
  
  return response.json();
}

export async function verifyOTP(phoneNumber, otp) {
  const response = await fetch(`${API_BASE_URL}/api/users/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ phoneNumber, otp }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to verify OTP');
  }
  
  return response.json();
}

export async function sendSOS(location, description) {
  const response = await fetch(`${API_BASE_URL}/api/sos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify({ location, description }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to send SOS');
  }
  
  return response.json();
}