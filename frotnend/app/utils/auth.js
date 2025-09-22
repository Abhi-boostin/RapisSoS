'use client';

export const AUTH_KEYS = {
  USER_DATA: 'rapidsos_user_data',
  AUTH_TOKEN: 'rapidsos_auth_token',
  FIRST_TIME: 'rapidsos_first_time'
};

export const setUserData = (data) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTH_KEYS.USER_DATA, JSON.stringify(data));
  localStorage.setItem(AUTH_KEYS.AUTH_TOKEN, data.token);
  localStorage.setItem(AUTH_KEYS.FIRST_TIME, 'false');
};

export const getUserData = () => {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(AUTH_KEYS.USER_DATA);
  return data ? JSON.parse(data) : null;
};

export const isAuthenticated = () => {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem(AUTH_KEYS.AUTH_TOKEN);
};

export const isFirstTimeUser = () => {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(AUTH_KEYS.FIRST_TIME) !== 'false';
};

export const logout = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_KEYS.USER_DATA);
  localStorage.removeItem(AUTH_KEYS.AUTH_TOKEN);
  // Don't remove FIRST_TIME flag on logout
};