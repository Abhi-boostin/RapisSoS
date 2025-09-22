'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Card from '../../../components/Card';
import Button from '../../../components/Button';

const AMBULANCE_TYPES = [
  'Basic Life Support (BLS)',
  'Advanced Life Support (ALS)',
  'Mobile Intensive Care Unit (MICU)',
  'Neonatal',
  'Patient Transport',
  'Multi-Purpose'
];

const EQUIPMENT_LIST = [
  'Ventilator',
  'Defibrillator',
  'ECG Monitor',
  'Oxygen System',
  'Suction Unit',
  'Stretcher',
  'Wheelchair',
  'First Aid Kits',
  'IV Equipment',
  'Spine Board',
  'Pulse Oximeter',
  'Blood Pressure Monitor'
];

const inputClasses = "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white";
const selectClasses = "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white";

export default function AmbulanceDetails() {
  const searchParams = useSearchParams();
  const phone = searchParams.get('phone');
  
  const [form, setForm] = useState({
    phone: '',
    vehicleNumber: '',
    registrationNumber: '',
    type: '',
    manufacturer: '',
    model: '',
    yearOfManufacture: '',
    capacity: '',
    equipmentList: [],
    insuranceNumber: '',
    insuranceExpiry: '',
    primaryDriver: {
      name: '',
      license: '',
      phone: '',
      experience: ''
    },
    baseLocation: '',
    operationalRadius: '',
    maintenanceStatus: 'Operational',
    lastMaintenanceDate: '',
    nextMaintenanceDate: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!phone) {
      router.push('/ambulance/init');
    } else {
      setForm(f => ({ ...f, phone }));
    }
  }, [phone, router]);

  const validateForm = () => {
    // Vehicle number format: XX00XX0000 (state code + number)
    const vehicleRegex = /^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/;
    
    if (!vehicleRegex.test(form.vehicleNumber)) {
      setError('Please enter a valid vehicle number (Format: XX00XX0000)');
      return false;
    }

    if (!form.type || !AMBULANCE_TYPES.includes(form.type)) {
      setError('Please select a valid ambulance type');
      return false;
    }

    if (!form.capacity || isNaN(form.capacity) || form.capacity < 1) {
      setError('Please enter a valid passenger capacity');
      return false;
    }

    const currentYear = new Date().getFullYear();
    if (!form.yearOfManufacture || 
        isNaN(form.yearOfManufacture) || 
        form.yearOfManufacture < 1990 || 
        form.yearOfManufacture > currentYear) {
      setError('Please enter a valid manufacturing year (1990-present)');
      return false;
    }

    if (!form.primaryDriver.license || !form.primaryDriver.phone || !form.primaryDriver.name) {
      setError('Please fill in all primary driver details');
      return false;
    }

    // Validate insurance expiry date
    const today = new Date();
    const insuranceExpiry = new Date(form.insuranceExpiry);
    if (insuranceExpiry <= today) {
      setError('Insurance expiry date must be in the future');
      return false;
    }

    // Validate maintenance dates
    if (form.lastMaintenanceDate && form.nextMaintenanceDate) {
      const lastMaintenance = new Date(form.lastMaintenanceDate);
      const nextMaintenance = new Date(form.nextMaintenanceDate);
      if (lastMaintenance >= nextMaintenance) {
        setError('Next maintenance date must be after last maintenance date');
        return false;
      }
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
      const res = await fetch('http://localhost:4000/api/ambulances/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to register');

      localStorage.setItem('ambulancePhone', form.phone);
      localStorage.setItem('ambulanceId', form.vehicleNumber);
      router.push('/ambulance/dashboard');
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Ambulance Details</h1>
          <p className="text-lg text-gray-600">Complete the registration to join RapidSoS network</p>
        </div>

        <Card className="backdrop-blur-sm bg-white/90 shadow-xl border-0">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Vehicle Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="vehicleNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle Number *
                  </label>
                  <input
                    type="text"
                    id="vehicleNumber"
                    value={form.vehicleNumber}
                    onChange={(e) => setForm(f => ({ ...f, vehicleNumber: e.target.value.toUpperCase() }))}
                    className={inputClasses}
                    placeholder="XX00XX0000"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                    Ambulance Type *
                  </label>
                  <select
                    id="type"
                    value={form.type}
                    onChange={(e) => setForm(f => ({ ...f, type: e.target.value }))}
                    className={selectClasses}
                    required
                  >
                    <option value="">Select type</option>
                    {AMBULANCE_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="manufacturer" className="block text-sm font-medium text-gray-700 mb-1">
                    Manufacturer *
                  </label>
                  <input
                    type="text"
                    id="manufacturer"
                    value={form.manufacturer}
                    onChange={(e) => setForm(f => ({ ...f, manufacturer: e.target.value }))}
                    className={inputClasses}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
                    Model *
                  </label>
                  <input
                    type="text"
                    id="model"
                    value={form.model}
                    onChange={(e) => setForm(f => ({ ...f, model: e.target.value }))}
                    className={inputClasses}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="yearOfManufacture" className="block text-sm font-medium text-gray-700 mb-1">
                    Year of Manufacture *
                  </label>
                  <input
                    type="number"
                    id="yearOfManufacture"
                    value={form.yearOfManufacture}
                    onChange={(e) => setForm(f => ({ ...f, yearOfManufacture: e.target.value }))}
                    className={inputClasses}
                    min="1990"
                    max={new Date().getFullYear()}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-1">
                    Passenger Capacity *
                  </label>
                  <input
                    type="number"
                    id="capacity"
                    value={form.capacity}
                    onChange={(e) => setForm(f => ({ ...f, capacity: e.target.value }))}
                    className={inputClasses}
                    min="1"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Equipment Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Equipment Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Equipment
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {EQUIPMENT_LIST.map(equipment => (
                      <label key={equipment} className="inline-flex items-center">
                        <input
                          type="checkbox"
                          checked={form.equipmentList.includes(equipment)}
                          onChange={(e) => {
                            const newList = e.target.checked
                              ? [...form.equipmentList, equipment]
                              : form.equipmentList.filter(item => item !== equipment);
                            setForm(f => ({ ...f, equipmentList: newList }));
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{equipment}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Insurance & Maintenance */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Insurance & Maintenance</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="insuranceNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Insurance Number *
                  </label>
                  <input
                    type="text"
                    id="insuranceNumber"
                    value={form.insuranceNumber}
                    onChange={(e) => setForm(f => ({ ...f, insuranceNumber: e.target.value }))}
                    className={inputClasses}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="insuranceExpiry" className="block text-sm font-medium text-gray-700 mb-1">
                    Insurance Expiry Date *
                  </label>
                  <input
                    type="date"
                    id="insuranceExpiry"
                    value={form.insuranceExpiry}
                    onChange={(e) => setForm(f => ({ ...f, insuranceExpiry: e.target.value }))}
                    className={inputClasses}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="lastMaintenanceDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Maintenance Date
                  </label>
                  <input
                    type="date"
                    id="lastMaintenanceDate"
                    value={form.lastMaintenanceDate}
                    onChange={(e) => setForm(f => ({ ...f, lastMaintenanceDate: e.target.value }))}
                    className={inputClasses}
                  />
                </div>

                <div>
                  <label htmlFor="nextMaintenanceDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Next Maintenance Date
                  </label>
                  <input
                    type="date"
                    id="nextMaintenanceDate"
                    value={form.nextMaintenanceDate}
                    onChange={(e) => setForm(f => ({ ...f, nextMaintenanceDate: e.target.value }))}
                    className={inputClasses}
                  />
                </div>

                <div>
                  <label htmlFor="maintenanceStatus" className="block text-sm font-medium text-gray-700 mb-1">
                    Maintenance Status *
                  </label>
                  <select
                    id="maintenanceStatus"
                    value={form.maintenanceStatus}
                    onChange={(e) => setForm(f => ({ ...f, maintenanceStatus: e.target.value }))}
                    className={selectClasses}
                    required
                  >
                    <option value="Operational">Operational</option>
                    <option value="Under Maintenance">Under Maintenance</option>
                    <option value="Out of Service">Out of Service</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Driver Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Primary Driver Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="driverName" className="block text-sm font-medium text-gray-700 mb-1">
                    Driver Name *
                  </label>
                  <input
                    type="text"
                    id="driverName"
                    value={form.primaryDriver.name}
                    onChange={(e) => setForm(f => ({ 
                      ...f, 
                      primaryDriver: { ...f.primaryDriver, name: e.target.value }
                    }))}
                    className={inputClasses}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="driverLicense" className="block text-sm font-medium text-gray-700 mb-1">
                    Driver's License Number *
                  </label>
                  <input
                    type="text"
                    id="driverLicense"
                    value={form.primaryDriver.license}
                    onChange={(e) => setForm(f => ({ 
                      ...f, 
                      primaryDriver: { ...f.primaryDriver, license: e.target.value }
                    }))}
                    className={inputClasses}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="driverPhone" className="block text-sm font-medium text-gray-700 mb-1">
                    Driver's Phone *
                  </label>
                  <input
                    type="tel"
                    id="driverPhone"
                    value={form.primaryDriver.phone}
                    onChange={(e) => setForm(f => ({ 
                      ...f, 
                      primaryDriver: { ...f.primaryDriver, phone: e.target.value }
                    }))}
                    className={inputClasses}
                    placeholder="+91XXXXXXXXXX"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="driverExperience" className="block text-sm font-medium text-gray-700 mb-1">
                    Years of Experience *
                  </label>
                  <input
                    type="number"
                    id="driverExperience"
                    value={form.primaryDriver.experience}
                    onChange={(e) => setForm(f => ({ 
                      ...f, 
                      primaryDriver: { ...f.primaryDriver, experience: e.target.value }
                    }))}
                    className={inputClasses}
                    min="0"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Location Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="baseLocation" className="block text-sm font-medium text-gray-700 mb-1">
                    Base Location *
                  </label>
                  <input
                    type="text"
                    id="baseLocation"
                    value={form.baseLocation}
                    onChange={(e) => setForm(f => ({ ...f, baseLocation: e.target.value }))}
                    className={inputClasses}
                    placeholder="Enter base location"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="operationalRadius" className="block text-sm font-medium text-gray-700 mb-1">
                    Operational Radius (km) *
                  </label>
                  <input
                    type="number"
                    id="operationalRadius"
                    value={form.operationalRadius}
                    onChange={(e) => setForm(f => ({ ...f, operationalRadius: e.target.value }))}
                    className={inputClasses}
                    min="1"
                    required
                  />
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