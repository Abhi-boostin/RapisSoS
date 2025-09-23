import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { PhoneInput } from '../components/PhoneInput';
import { ErrorBanner } from '../components/ErrorBanner';
import { sendUserOtp, sendOfficerOtp, sendAmbulanceOtp } from '../api/endpoints';
import { parseAPIError, APIError } from '../api/client';

export function SendOtp() {
  const navigate = useNavigate();
  const { appState } = useAppState();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<APIError | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!phone.trim() || !appState.role) {
      setError({ message: 'Phone number is required', status: 400 });
      return;
    }

    setLoading(true);

    try {
      let response;
      switch (appState.role) {
        case 'citizen':
          response = await sendUserOtp(phone);
          break;
        case 'officer':
          response = await sendOfficerOtp(phone);
          break;
        case 'ambulance':
          response = await sendAmbulanceOtp(phone);
          break;
        default:
          throw new Error('Invalid role');
      }

      navigate('/verify-otp', { state: { phone, role: appState.role } });
    } catch (err) {
      setError(parseAPIError(err));
    } finally {
      setLoading(false);
    }
  };

  const getRoleTitle = () => {
    switch (appState.role) {
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
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Phone Verification</h1>
          <p className="text-gray-600 mt-2">
            Enter your phone number to receive an OTP as a {getRoleTitle()}
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <ErrorBanner error={error} onDismiss={() => setError(null)} />
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <PhoneInput
              value={phone}
              onChange={setPhone}
              disabled={loading}
            />
            
            <button
              type="submit"
              disabled={loading || !phone.trim()}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}