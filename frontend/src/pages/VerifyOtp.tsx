import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { OtpForm } from '../components/OtpForm';
import { ErrorBanner } from '../components/ErrorBanner';
import { verifyUser, verifyOfficer, verifyAmbulance } from '../api/endpoints';
import { parseAPIError, APIError } from '../api/client';

export function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setPhone } = useAppState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<APIError | null>(null);

  const statePhone = location.state?.phone;
  const stateRole = location.state?.role;

  React.useEffect(() => {
    if (!statePhone || !stateRole) {
      navigate('/send-otp');
    }
  }, [statePhone, stateRole, navigate]);

  const handleVerify = async (code: string) => {
    setError(null);
    setLoading(true);

    try {
      let response;
      switch (stateRole) {
        case 'citizen':
          response = await verifyUser(statePhone, code);
          setPhone(response.user.phone);
          navigate('/profile-complete');
          break;
        case 'officer':
          response = await verifyOfficer(statePhone, code);
          setPhone(response.officer.phone);
          navigate('/profile-complete');
          break;
        case 'ambulance':
          response = await verifyAmbulance(statePhone, code);
          setPhone(response.ambulance.phone);
          navigate('/profile-complete');
          break;
        default:
          throw new Error('Invalid role');
      }
    } catch (err) {
      setError(parseAPIError(err));
    } finally {
      setLoading(false);
    }
  };

  const getRoleTitle = () => {
    switch (stateRole) {
      case 'citizen':
        return 'Citizen';
      case 'officer':
        return 'Police Officer';
      case 'ambulance':
        return 'Ambulance Crew';
      default:
        return 'User';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/send-otp')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Verify OTP</h1>
          <p className="text-gray-600 mt-2">
            Enter the 6-digit code sent to <span className="font-medium">{statePhone}</span>
          </p>
          <p className="text-sm text-blue-600 mt-1">
            Signing in as {getRoleTitle()}
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <ErrorBanner error={error} onDismiss={() => setError(null)} />
          
          <OtpForm onSubmit={handleVerify} loading={loading} />
        </div>
      </div>
    </div>
  );
}