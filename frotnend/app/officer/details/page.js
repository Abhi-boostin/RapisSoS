'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Card from '@/components/Card';
import Button from '@/components/Button';

const OFFICER_RANKS = [
  'Inspector',
  'Sub-Inspector',
  'Assistant Sub-Inspector',
  'Head Constable',
  'Senior Constable',
  'Constable',
  'Other'
];

const inputClasses = "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white";
const selectClasses = "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white";

export default function OfficerDetails() {
  const [form, setForm] = useState({
    phone: '',
    name: '',
    rank: '',
    badgeNumber: '',
    station: '',
    district: '',
    state: '',
    jurisdiction: '',
    emergencyContact: '',
    dateOfJoining: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get the phone number from URL or localStorage
    const phone = searchParams.get('phone') || localStorage.getItem('officerPhone');
    if (!phone) {
      router.replace('/officer/init');
      return;
    }
    setForm(f => ({ ...f, phone }));
  }, [searchParams, router]);

  const validateForm = () => {
    if (!form.name.trim()) {
      setError('Please enter your name');
      return false;
    }

    if (!form.rank || !OFFICER_RANKS.includes(form.rank)) {
      setError('Please select your rank');
      return false;
    }

    if (!form.badgeNumber.trim()) {
      setError('Please enter your badge number');
      return false;
    }

    if (!form.station.trim()) {
      setError('Please enter your police station');
      return false;
    }

    if (!form.district.trim()) {
      setError('Please enter your district');
      return false;
    }

    if (!form.state.trim()) {
      setError('Please enter your state');
      return false;
    }

    if (!form.dateOfJoining) {
      setError('Please enter your date of joining');
      return false;
    }

    const emergencyPhoneRegex = /^\+91[6-9]\d{9}$/;
    if (!emergencyPhoneRegex.test(form.emergencyContact)) {
      setError('Please enter a valid emergency contact number');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:4000/api/officers/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to register');

      // Store officer data in localStorage
      localStorage.setItem('officerId', data.officerId);
      localStorage.setItem('officerPhone', form.phone);
      localStorage.setItem('token', data.token);

      router.push('/officer/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
          <p className="text-lg text-gray-600">Enter your details to join RapidSoS network</p>
        </div>

        <Card className="backdrop-blur-sm bg-white/90 shadow-xl border-0">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                    className={inputClasses}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="rank" className="block text-sm font-medium text-gray-700 mb-1">
                    Rank *
                  </label>
                  <select
                    id="rank"
                    value={form.rank}
                    onChange={(e) => setForm(f => ({ ...f, rank: e.target.value }))}
                    className={selectClasses}
                    required
                  >
                    <option value="">Select rank</option>
                    {OFFICER_RANKS.map(rank => (
                      <option key={rank} value={rank}>{rank}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="badgeNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Badge Number *
                  </label>
                  <input
                    type="text"
                    id="badgeNumber"
                    value={form.badgeNumber}
                    onChange={(e) => setForm(f => ({ ...f, badgeNumber: e.target.value }))}
                    className={inputClasses}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="dateOfJoining" className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Joining *
                  </label>
                  <input
                    type="date"
                    id="dateOfJoining"
                    value={form.dateOfJoining}
                    onChange={(e) => setForm(f => ({ ...f, dateOfJoining: e.target.value }))}
                    className={inputClasses}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Station Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Station Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="station" className="block text-sm font-medium text-gray-700 mb-1">
                    Police Station *
                  </label>
                  <input
                    type="text"
                    id="station"
                    value={form.station}
                    onChange={(e) => setForm(f => ({ ...f, station: e.target.value }))}
                    className={inputClasses}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-1">
                    District *
                  </label>
                  <input
                    type="text"
                    id="district"
                    value={form.district}
                    onChange={(e) => setForm(f => ({ ...f, district: e.target.value }))}
                    className={inputClasses}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    id="state"
                    value={form.state}
                    onChange={(e) => setForm(f => ({ ...f, state: e.target.value }))}
                    className={inputClasses}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="jurisdiction" className="block text-sm font-medium text-gray-700 mb-1">
                    Jurisdiction Area
                  </label>
                  <input
                    type="text"
                    id="jurisdiction"
                    value={form.jurisdiction}
                    onChange={(e) => setForm(f => ({ ...f, jurisdiction: e.target.value }))}
                    className={inputClasses}
                    placeholder="Area under your jurisdiction"
                  />
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h2>
              <div>
                <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700 mb-1">
                  Emergency Contact Number *
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    id="emergencyContact"
                    value={form.emergencyContact}
                    onChange={(e) => setForm(f => ({ ...f, emergencyContact: e.target.value }))}
                    className="block w-full pl-12 pr-4 py-2 text-gray-900 placeholder:text-gray-400 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+91XXXXXXXXXX"
                    pattern="^\+91[6-9]\d{9}$"
                    required
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <span className="text-lg">🇮🇳</span>
                  </div>
                </div>
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

            <div className="flex justify-end">
              <Button 
                type="submit" 
                className="px-8 py-3 text-base font-medium rounded-lg shadow-md transition-all duration-200 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700" 
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Completing Profile...
                  </div>
                ) : 'Complete Profile'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}