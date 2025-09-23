import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppState } from './context/AppStateContext';
import { RoleSelect } from './pages/RoleSelect';
import { SendOtp } from './pages/SendOtp';
import { VerifyOtp } from './pages/VerifyOtp';
import { ProfileComplete } from './components/ProfileComplete';
import { CitizenDashboard } from './pages/CitizenDashboard';
import { AmbulanceDashboard } from './pages/AmbulanceDashboard';
import { OfficerDashboard } from './pages/OfficerDashboard';

export function AppRoutes() {
  const { appState } = useAppState();

  // Auto-redirect to dashboard if profile is complete
  React.useEffect(() => {
    if (appState.role && appState.phone && appState.profileComplete) {
      // This will be handled by individual route components
    }
  }, [appState]);

  return (
    <Routes>
      <Route path="/" element={<RoleSelect />} />
      <Route path="/send-otp" element={<SendOtp />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="/profile-complete" element={<ProfileComplete />} />
      <Route path="/citizen" element={<CitizenDashboard />} />
      <Route path="/ambulance" element={<AmbulanceDashboard />} />
      <Route path="/officer" element={<OfficerDashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}