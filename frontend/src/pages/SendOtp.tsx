import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Shield, Truck, Heart } from 'lucide-react';
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

  const getRoleIcon = () => {
    switch (appState.role) {
      case 'citizen':
        return Heart;
      case 'officer':
        return Shield;
      case 'ambulance':
        return Truck;
      default:
        return Phone;
    }
  };

  const getRoleColor = () => {
    switch (appState.role) {
      case 'citizen':
        return 'from-blue-500 to-cyan-500';
      case 'officer':
        return 'from-indigo-500 to-purple-500';
      case 'ambulance':
        return 'from-red-500 to-pink-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const RoleIcon = getRoleIcon();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Side - Hero Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-600 to-teal-800 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 rounded-full bg-white/20"></div>
          <div className="absolute top-40 right-20 w-24 h-24 rounded-full bg-white/10"></div>
          <div className="absolute bottom-20 left-40 w-40 h-40 rounded-full bg-white/5"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          {/* Logo */}
          <div className="mb-8">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <RoleIcon className="w-10 h-10 text-white" />
            </div>
          </div>

          {/* Main Text */}
          <div className="text-center max-w-md">
            <h1 className="text-4xl font-bold mb-4">RapidSoS</h1>
            <p className="text-xl text-teal-100 mb-6">
              Your next emergency response within seconds
            </p>
            <p className="text-teal-200 text-sm leading-relaxed">
              Experience the power of effortless emergency services and find help when you need it most.
            </p>
          </div>

          {/* Navigation Dots */}
          <div className="flex space-x-2 mt-12">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <div className="w-2 h-2 bg-white/50 rounded-full"></div>
            <div className="w-2 h-2 bg-white/30 rounded-full"></div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 right-20 w-32 h-32 border-2 border-white/20 rounded-full"></div>
        <div className="absolute bottom-32 left-20 w-24 h-24 border border-white/10 rounded-full"></div>
      </div>

      {/* Right Side - OTP Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-teal-600 hover:text-teal-700 mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>

            {/* Logo */}
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-12 h-12 bg-gradient-to-r ${getRoleColor()} rounded-full flex items-center justify-center`}>
                <RoleIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Send OTP</h1>
                <p className="text-sm text-gray-500">Phone Verification</p>
              </div>
            </div>

            <p className="text-gray-600">
              Please enter your phone number to receive a One-Time Password (OTP) as a {getRoleTitle()}.
            </p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
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
                className={`w-full bg-gradient-to-r ${getRoleColor()} text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200`}
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>

            {/* Help Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Having difficulties?{' '}
                <button className="text-teal-600 hover:text-teal-700 font-medium">
                  Get help
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
