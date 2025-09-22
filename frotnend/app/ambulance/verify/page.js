'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Card from '../../../components/Card';
import Button from '../../../components/Button';

export default function AmbulanceVerify() {
  const searchParams = useSearchParams();
  const phone = searchParams.get('phone');
  const [otp, setOTP] = useState('');
  const [remainingTime, setRemainingTime] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!phone) {
      router.push('/ambulance/init');
      return;
    }

    const timer = setInterval(() => {
      setRemainingTime((time) => (time > 0 ? time - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [phone, router]);

  const handleResendOTP = async () => {
    if (remainingTime > 0) return;
    
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('http://localhost:4000/api/ambulances/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      
      if (!res.ok) throw new Error('Failed to resend OTP');
      
      setRemainingTime(30);
    } catch (err) {
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const validateOTP = (otp) => {
    const otpRegex = /^\d{6}$/;
    return otpRegex.test(otp);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!validateOTP(otp)) {
      setError('Please enter a valid 6-digit OTP');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:4000/api/ambulances/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp })
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Invalid OTP');

      if (data.isRegistered) {
        router.push('/ambulance/dashboard');
      } else {
        router.push(`/ambulance/details?phone=${encodeURIComponent(phone)}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-semibold text-gray-900 tracking-tight mb-3 font-sans">
            Verify Phone Number
          </h1>
          <p className="text-lg text-gray-600 font-light">
            Enter the 6-digit OTP sent to {phone}
          </p>
        </div>

        <Card className="backdrop-blur-sm bg-white/90 shadow-xl border-0">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label 
                htmlFor="otp" 
                className="block text-sm font-medium text-gray-900 mb-2 tracking-wide"
              >
                One-Time Password
              </label>
              <div>
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => setOTP(e.target.value)}
                  className="block w-full px-4 py-3.5 text-gray-900 placeholder:text-gray-400 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter 6-digit OTP"
                  pattern="\d{6}"
                  maxLength={6}
                  required
                />
              </div>
              <div className="mt-2 flex justify-between items-center">
                <p className="text-sm text-gray-500">Didn't receive the code?</p>
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={remainingTime > 0 || loading}
                  className={`text-sm font-medium ${
                    remainingTime > 0
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-blue-600 hover:text-blue-500'
                  }`}
                >
                  {remainingTime > 0
                    ? `Resend in ${remainingTime}s`
                    : 'Resend OTP'}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full py-3 text-base font-medium rounded-lg shadow-md transition-all duration-200 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700" 
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Verifying...
                </div>
              ) : 'Verify OTP'}
            </Button>
          </form>
        </Card>

        <div className="mt-6 text-center">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
            <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Your number will be verified for future logins</span>
          </div>
        </div>
      </div>
    </div>
  );
}