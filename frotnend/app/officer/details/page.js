'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Card from '@/components/Card';
import Button from '@/components/Button';

const RANKS = [
  'Inspector General of Police',
  'Deputy Inspector General',
  'Senior Superintendent',
  'Superintendent',
  'Deputy Superintendent',
  'Inspector',
  'Sub-Inspector',
  'Assistant Sub-Inspector',
  'Head Constable',
  'Constable'
];

const DEPARTMENTS = [
  'Law & Order',
  'Traffic',
  'Crime Investigation',
  'Special Branch',
  'Anti-Terrorism Squad',
  'Cyber Crime',
  'Special Operations',
  'Highway Patrol',
  'Emergency Response'
];

const SHIFTS = [
  'Morning (6 AM - 2 PM)',
  'Afternoon (2 PM - 10 PM)',
  'Night (10 PM - 6 AM)',
  'Flexible'
];

const inputClasses = "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white";
const selectClasses = "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white";

export default function OfficerDetails() {
  const searchParams = useSearchParams();
  const phone = searchParams.get('phone');
  
  const [form, setForm] = useState({
    phone: '',
    fullName: '',
    personalContact: '',
    employeeId: '',
    badgeNumber: '',
    rank: '',
    department: '',
    agency: '',
    stationLocation: '',
    preferredShift: '',
    yearsOfService: '',
    specializations: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!phone) {
      router.push('/officer/init');
    } else {
      setForm(f => ({ ...f, phone }));
    }
  }, [phone, router]);

  const validateForm = () => {
    const nameRegex = /^[a-zA-Z\s]{3,50}$/;
    const phoneRegex = /^\+91[6-9]\d{9}$/;
    const badgeNumberRegex = /^[A-Z0-9]{4,10}$/;
    
    if (!nameRegex.test(form.fullName)) {
      setError('Please enter a valid full name (3-50 characters, letters only)');
      return false;
    }
    
    if (!phoneRegex.test(form.personalContact)) {
      setError('Please enter a valid emergency contact number with +91 prefix');
      return false;
    }
    
    if (!form.badgeNumber || !badgeNumberRegex.test(form.badgeNumber)) {
      setError('Please enter a valid badge number (4-10 alphanumeric characters)');
      return false;
    }
    
    if (!form.rank || !RANKS.includes(form.rank)) {
      setError('Please select a valid rank');
      return false;
    }
    
    if (!form.department || !DEPARTMENTS.includes(form.department)) {
      setError('Please select a valid department');
      return false;
    }

    if (!form.stationLocation) {
      setError('Please enter your station location');
      return false;
    }

    if (!form.preferredShift || !SHIFTS.includes(form.preferredShift)) {
      setError('Please select a preferred shift');
      return false;
    }

    if (!form.yearsOfService || isNaN(form.yearsOfService) || form.yearsOfService < 0) {
      setError('Please enter valid years of service');
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

      localStorage.setItem('officerPhone', form.phone);
      localStorage.setItem('officerBadge', form.badgeNumber);
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Officer Details</h1>
          <p className="text-lg text-gray-600">Complete your profile to join RapidSoS network</p>
        </div>

        <Card className="backdrop-blur-sm bg-white/90 shadow-xl border-0">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    value={form.fullName}
                    onChange={(e) => setForm(f => ({ ...f, fullName: e.target.value }))}
                    className={inputClasses}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="personalContact" className="block text-sm font-medium text-gray-700 mb-1">
                    Emergency Contact *
                  </label>
                  <input
                    type="tel"
                    id="personalContact"
                    value={form.personalContact}
                    onChange={(e) => setForm(f => ({ ...f, personalContact: e.target.value }))}
                    className={inputClasses}
                    placeholder="Emergency contact number"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="yearsOfService" className="block text-sm font-medium text-gray-700 mb-1">
                    Years of Service *
                  </label>
                  <input
                    type="number"
                    id="yearsOfService"
                    value={form.yearsOfService}
                    onChange={(e) => setForm(f => ({ ...f, yearsOfService: e.target.value }))}
                    className={inputClasses}
                    min="0"
                    max="50"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700 mb-1">
                    Employee ID *
                  </label>
                  <input
                    type="text"
                    id="employeeId"
                    value={form.employeeId}
                    onChange={(e) => setForm(f => ({ ...f, employeeId: e.target.value }))}
                    className={inputClasses}
                    required
                  />
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
                    placeholder="Enter badge number"
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
                    {RANKS.map(rank => (
                      <option key={rank} value={rank}>{rank}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                    Department *
                  </label>
                  <select
                    id="department"
                    value={form.department}
                    onChange={(e) => setForm(f => ({ ...f, department: e.target.value }))}
                    className={selectClasses}
                    required
                  >
                    <option value="">Select department</option>
                    {DEPARTMENTS.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Station & Shift Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Station & Shift Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="agency" className="block text-sm font-medium text-gray-700 mb-1">
                    Agency/Organization *
                  </label>
                  <input
                    type="text"
                    id="agency"
                    value={form.agency}
                    onChange={(e) => setForm(f => ({ ...f, agency: e.target.value }))}
                    className={inputClasses}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="stationLocation" className="block text-sm font-medium text-gray-700 mb-1">
                    Station Location *
                  </label>
                  <input
                    type="text"
                    id="stationLocation"
                    value={form.stationLocation}
                    onChange={(e) => setForm(f => ({ ...f, stationLocation: e.target.value }))}
                    className={inputClasses}
                    placeholder="Enter station location"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="preferredShift" className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Shift *
                  </label>
                  <select
                    id="preferredShift"
                    value={form.preferredShift}
                    onChange={(e) => setForm(f => ({ ...f, preferredShift: e.target.value }))}
                    className={selectClasses}
                    required
                  >
                    <option value="">Select preferred shift</option>
                    {SHIFTS.map(shift => (
                      <option key={shift} value={shift}>{shift}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="specializations" className="block text-sm font-medium text-gray-700 mb-1">
                    Specializations
                  </label>
                  <select
                    id="specializations"
                    multiple
                    value={form.specializations}
                    onChange={(e) => setForm(f => ({ 
                      ...f, 
                      specializations: Array.from(e.target.selectedOptions, option => option.value)
                    }))}
                    className={selectClasses}
                    size="3"
                  >
                    <option value="Crisis Negotiation">Crisis Negotiation</option>
                    <option value="Tactical Operations">Tactical Operations</option>
                    <option value="Traffic Management">Traffic Management</option>
                    <option value="Cybercrime">Cybercrime</option>
                    <option value="First Aid">First Aid</option>
                    <option value="Search and Rescue">Search and Rescue</option>
                  </select>
                  <p className="mt-1 text-sm text-gray-500">Hold Ctrl/Cmd to select multiple</p>
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
                className="px-8 py-3 text-base font-medium shadow-md transition-all duration-200" 
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Saving...
                  </div>
                ) : 'Complete Registration'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}