import { apiClient } from './client';

export interface Location {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface User {
  phone: string;
  phoneVerified: boolean;
  name?: { first?: string; last?: string };
  bloodGroup?: string;
  allergies?: string[];
  medicalConditions?: string[];
  medications?: string[];
  specialNeeds?: string[];
  emergencyContacts?: Array<{ name: string; phone: string }>;
}

export interface Ambulance {
  phone: string;
  phoneVerified: boolean;
  unitId?: string;
  vehicleNumber?: string;
  crew?: any;
  status?: 'available' | 'enroute' | 'busy' | 'offline';
}

export interface Officer {
  phone: string;
  phoneVerified: boolean;
  fullName?: string;
  department?: string;
  rank?: string;
  agency?: string;
  dutyStatus?: 'on' | 'off';
}

export interface SOSRequest {
  id: string;
  userLocation: Location;
  mapsUrl: string;
  distanceMeters: number;
  createdAt: string;
  secondsRemaining: number;
  status: 'pending' | 'accepted' | 'completed';
  user?: User;
}

// Health
export async function getHealth() {
  const response = await apiClient.get('/health');
  return response.data;
}

// Users
export async function sendUserOtp(phone: string) {
  const response = await apiClient.post('/users/sendotp', { phone });
  return response.data;
}

export async function verifyUser(phone: string, code: string) {
  const response = await apiClient.post('/users/verifyotp', { phone, code });
  return response.data;
}

export async function updateUser(payload: any) {
  const response = await apiClient.post('/users/update', payload);
  return response.data;
}

export async function sosAmbulance(userPhone: string, coordinates: [number, number]) {
  const response = await apiClient.post('/users/sos/ambulance', {
    userPhone,
    location: { type: 'Point', coordinates },
  });
  return response.data;
}

export async function sosOfficer(userPhone: string, coordinates: [number, number]) {
  const response = await apiClient.post('/users/sos/officer', {
    userPhone,
    location: { type: 'Point', coordinates },
  });
  return response.data;
}

export async function getUserRequest(requestId: string) {
  const response = await apiClient.get(`/users/request/${requestId}`);
  return response.data;
}

// Ambulances
export async function sendAmbulanceOtp(phone: string) {
  const response = await apiClient.post('/ambulances/sendotp', { phone });
  return response.data;
}

export async function verifyAmbulance(phone: string, code: string) {
  const response = await apiClient.post('/ambulances/verifyotp', { phone, code });
  return response.data;
}

export async function updateAmbulance(payload: any) {
  const response = await apiClient.post('/ambulances/update', payload);
  return response.data;
}

export async function setAmbulanceStatus(phone: string, status: string) {
  const response = await apiClient.post('/ambulances/status', { phone, status });
  return response.data;
}

export async function getAmbulanceRequests(phone: string) {
  const response = await apiClient.get(`/ambulances/requests?phone=${encodeURIComponent(phone)}`);
  return response.data;
}

export async function acceptAmbulanceRequest(id: string, ambulancePhone: string) {
  const response = await apiClient.post(`/ambulances/requests/${id}/accept`, { ambulancePhone });
  return response.data;
}

export async function declineAmbulanceRequest(id: string, ambulancePhone: string) {
  const response = await apiClient.post(`/ambulances/requests/${id}/decline`, { ambulancePhone });
  return response.data;
}

// Officers
export async function sendOfficerOtp(phone: string) {
  const response = await apiClient.post('/officers/sendotp', { phone });
  return response.data;
}

export async function verifyOfficer(phone: string, code: string) {
  const response = await apiClient.post('/officers/verifyotp', { phone, code });
  return response.data;
}

export async function updateOfficer(payload: any) {
  const response = await apiClient.post('/officers/update', payload);
  return response.data;
}

export async function setOfficerStatus(phone: string, dutyStatus: string) {
  const response = await apiClient.post('/officers/status', { phone, dutyStatus });
  return response.data;
}

export async function getOfficerRequests(phone: string) {
  const response = await apiClient.get(`/officers/requests?phone=${encodeURIComponent(phone)}`);
  return response.data;
}

export async function acceptOfficerRequest(id: string, officerPhone: string) {
  const response = await apiClient.post(`/officers/requests/${id}/accept`, { officerPhone });
  return response.data;
}

export async function declineOfficerRequest(id: string, officerPhone: string) {
  const response = await apiClient.post(`/officers/requests/${id}/decline`, { officerPhone });
  return response.data;
}