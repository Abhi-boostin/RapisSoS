import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Heart, Phone, MapPin, FileText, Users, Camera } from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { ErrorBanner } from './ErrorBanner';
import { updateUser, updateAmbulance, updateOfficer } from '../api/endpoints';
import { parseAPIError, APIError } from '../api/client';

export function ProfileComplete() {
  const navigate = useNavigate();
  const { appState, setProfileComplete } = useAppState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<APIError | null>(null);

  // Citizen fields
  const [citizenData, setCitizenData] = useState({
    name: { first: '', middle: '', last: '' },
    dob: '',
    bloodGroup: '',
    allergies: [''],
    medicalConditions: [''],
    medications: [''],
    specialNeeds: [''],
    emergencyContacts: [{ name: '', relationship: '', phone: '', email: '' }],
    aadhaarNumber: '',
    homeAddress: '',
    photoUrl: ''
  });

  // Ambulance fields
  const [ambulanceData, setAmbulanceData] = useState({
    unitId: '',
    vehiclePlate: '',
    registrationNumber: '',
    makeModel: '',
    color: '',
    agencyName: '',
    ownership: 'public' as 'public' | 'private' | 'ngo',
    region: '',
    baseStation: {
      name: '',
      address: '',
      location: { type: 'Point' as const, coordinates: [0, 0] }
    },
    capabilities: {
      level: 'BLS' as 'BLS' | 'ALS' | 'ICU',
      oxygen: false,
      defibrillator: false,
      ventilator: false,
      neonatal: false
    },
    crew: {
      driverName: '',
      paramedicName: '',
      attendantName: '',
      contactPhone: '',
      contactEmail: ''
    },
    currentLocation: { type: 'Point' as const, coordinates: [0, 0] }
  });

  // Officer fields
  const [officerData, setOfficerData] = useState({
    fullName: '',
    personalContact: '',
    employeeId: '',
    rank: '',
    agency: '',
    currentLocation: { type: 'Point' as const, coordinates: [0, 0] }
  });

  React.useEffect(() => {
    if (!appState.phone || !appState.role) {
      navigate('/');
    }
    if (appState.profileComplete) {
      navigate(`/${appState.role}`);
    }
  }, [appState, navigate]);

  const getCurrentLocation = (): Promise<[number, number]> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => resolve([position.coords.longitude, position.coords.latitude]),
        reject,
        { timeout: 10000, enableHighAccuracy: true }
      );
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let payload: any = { phone: appState.phone };

      if (appState.role === 'citizen') {
        payload = { ...payload, ...citizenData };
      } else if (appState.role === 'ambulance') {
        // Get current location for ambulance
        try {
          const coords = await getCurrentLocation();
          ambulanceData.currentLocation.coordinates = coords;
          ambulanceData.baseStation.location.coordinates = coords;
        } catch (locationError) {
          setError({ message: 'Location access required for ambulance registration', status: 400 });
          setLoading(false);
          return;
        }
        payload = { ...payload, ...ambulanceData };
      } else if (appState.role === 'officer') {
        // Get current location for officer
        try {
          const coords = await getCurrentLocation();
          officerData.currentLocation.coordinates = coords;
        } catch (locationError) {
          setError({ message: 'Location access required for officer registration', status: 400 });
          setLoading(false);
          return;
        }
        payload = { ...payload, ...officerData };
      }

      let response;
      switch (appState.role) {
        case 'citizen':
          response = await updateUser(payload);
          break;
        case 'ambulance':
          response = await updateAmbulance(payload);
          break;
        case 'officer':
          response = await updateOfficer(payload);
          break;
        default:
          throw new Error('Invalid role');
      }

      setProfileComplete(true);
      navigate(`/${appState.role}`);
    } catch (err) {
      setError(parseAPIError(err));
    } finally {
      setLoading(false);
    }
  };

  const addArrayItem = (field: string, setter: any, data: any) => {
    setter({ ...data, [field]: [...data[field], ''] });
  };

  const updateArrayItem = (field: string, index: number, value: string, setter: any, data: any) => {
    const newArray = [...data[field]];
    newArray[index] = value;
    setter({ ...data, [field]: newArray });
  };

  const removeArrayItem = (field: string, index: number, setter: any, data: any) => {
    const newArray = data[field].filter((_: any, i: number) => i !== index);
    setter({ ...data, [field]: newArray });
  };

  const getRoleTitle = () => {
    switch (appState.role) {
      case 'citizen': return 'Citizen';
      case 'officer': return 'Police Officer';
      case 'ambulance': return 'Ambulance Crew';
      default: return 'User';
    }
  };

  const renderCitizenForm = () => (
    <div className="space-y-6">
      {/* Personal Information */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
          <User className="h-5 w-5 text-blue-600" />
          Personal Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">First Name *</label>
            <input
              type="text"
              required
              value={citizenData.name.first}
              onChange={(e) => setCitizenData(prev => ({ ...prev, name: { ...prev.name, first: e.target.value } }))}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Middle Name</label>
            <input
              type="text"
              value={citizenData.name.middle}
              onChange={(e) => setCitizenData(prev => ({ ...prev, name: { ...prev.name, middle: e.target.value } }))}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Last Name *</label>
            <input
              type="text"
              required
              value={citizenData.name.last}
              onChange={(e) => setCitizenData(prev => ({ ...prev, name: { ...prev.name, last: e.target.value } }))}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Date of Birth *</label>
            <input
              type="date"
              required
              value={citizenData.dob}
              onChange={(e) => setCitizenData(prev => ({ ...prev, dob: e.target.value }))}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Aadhaar Number</label>
            <input
              type="text"
              value={citizenData.aadhaarNumber}
              onChange={(e) => setCitizenData(prev => ({ ...prev, aadhaarNumber: e.target.value }))}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">Home Address</label>
          <textarea
            value={citizenData.homeAddress}
            onChange={(e) => setCitizenData(prev => ({ ...prev, homeAddress: e.target.value }))}
            rows={3}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Medical Information */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-600" />
          Medical Information
        </h3>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Blood Group</label>
          <select
            value={citizenData.bloodGroup}
            onChange={(e) => setCitizenData(prev => ({ ...prev, bloodGroup: e.target.value }))}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select Blood Group</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
        </div>

        {/* Allergies */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Allergies</label>
          {citizenData.allergies.map((allergy, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={allergy}
                onChange={(e) => updateArrayItem('allergies', index, e.target.value, setCitizenData, citizenData)}
                placeholder="Enter allergy"
                className="flex-1 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => removeArrayItem('allergies', index, setCitizenData, citizenData)}
                className="px-3 py-2 text-red-600 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => addArrayItem('allergies', setCitizenData, citizenData)}
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            + Add Allergy
          </button>
        </div>

        {/* Medical Conditions */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Medical Conditions</label>
          {citizenData.medicalConditions.map((condition, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={condition}
                onChange={(e) => updateArrayItem('medicalConditions', index, e.target.value, setCitizenData, citizenData)}
                placeholder="Enter medical condition"
                className="flex-1 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => removeArrayItem('medicalConditions', index, setCitizenData, citizenData)}
                className="px-3 py-2 text-red-600 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => addArrayItem('medicalConditions', setCitizenData, citizenData)}
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            + Add Condition
          </button>
        </div>

        {/* Medications */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Current Medications</label>
          {citizenData.medications.map((medication, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={medication}
                onChange={(e) => updateArrayItem('medications', index, e.target.value, setCitizenData, citizenData)}
                placeholder="Enter medication"
                className="flex-1 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => removeArrayItem('medications', index, setCitizenData, citizenData)}
                className="px-3 py-2 text-red-600 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => addArrayItem('medications', setCitizenData, citizenData)}
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            + Add Medication
          </button>
        </div>

        {/* Special Needs */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Special Needs</label>
          {citizenData.specialNeeds.map((need, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={need}
                onChange={(e) => updateArrayItem('specialNeeds', index, e.target.value, setCitizenData, citizenData)}
                placeholder="Enter special need"
                className="flex-1 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => removeArrayItem('specialNeeds', index, setCitizenData, citizenData)}
                className="px-3 py-2 text-red-600 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => addArrayItem('specialNeeds', setCitizenData, citizenData)}
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            + Add Special Need
          </button>
        </div>
      </div>

      {/* Emergency Contacts */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-green-600" />
          Emergency Contacts
        </h3>
        {citizenData.emergencyContacts.map((contact, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={contact.name}
                  onChange={(e) => {
                    const newContacts = [...citizenData.emergencyContacts];
                    newContacts[index] = { ...newContacts[index], name: e.target.value };
                    setCitizenData(prev => ({ ...prev, emergencyContacts: newContacts }));
                  }}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Relationship</label>
                <input
                  type="text"
                  value={contact.relationship}
                  onChange={(e) => {
                    const newContacts = [...citizenData.emergencyContacts];
                    newContacts[index] = { ...newContacts[index], relationship: e.target.value };
                    setCitizenData(prev => ({ ...prev, emergencyContacts: newContacts }));
                  }}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  value={contact.phone}
                  onChange={(e) => {
                    const newContacts = [...citizenData.emergencyContacts];
                    newContacts[index] = { ...newContacts[index], phone: e.target.value };
                    setCitizenData(prev => ({ ...prev, emergencyContacts: newContacts }));
                  }}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={contact.email}
                  onChange={(e) => {
                    const newContacts = [...citizenData.emergencyContacts];
                    newContacts[index] = { ...newContacts[index], email: e.target.value };
                    setCitizenData(prev => ({ ...prev, emergencyContacts: newContacts }));
                  }}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                const newContacts = citizenData.emergencyContacts.filter((_, i) => i !== index);
                setCitizenData(prev => ({ ...prev, emergencyContacts: newContacts }));
              }}
              className="mt-2 text-red-600 hover:text-red-700 text-sm"
            >
              Remove Contact
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => {
            setCitizenData(prev => ({
              ...prev,
              emergencyContacts: [...prev.emergencyContacts, { name: '', relationship: '', phone: '', email: '' }]
            }));
          }}
          className="text-blue-600 hover:text-blue-700 text-sm"
        >
          + Add Emergency Contact
        </button>
      </div>
    </div>
  );

  const renderAmbulanceForm = () => (
    <div className="space-y-6">
      {/* Vehicle Information */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          Vehicle Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Unit ID *</label>
            <input
              type="text"
              required
              value={ambulanceData.unitId}
              onChange={(e) => setAmbulanceData(prev => ({ ...prev, unitId: e.target.value }))}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Vehicle Plate *</label>
            <input
              type="text"
              required
              value={ambulanceData.vehiclePlate}
              onChange={(e) => setAmbulanceData(prev => ({ ...prev, vehiclePlate: e.target.value }))}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Registration Number</label>
            <input
              type="text"
              value={ambulanceData.registrationNumber}
              onChange={(e) => setAmbulanceData(prev => ({ ...prev, registrationNumber: e.target.value }))}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Make & Model</label>
            <input
              type="text"
              value={ambulanceData.makeModel}
              onChange={(e) => setAmbulanceData(prev => ({ ...prev, makeModel: e.target.value }))}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Color</label>
            <input
              type="text"
              value={ambulanceData.color}
              onChange={(e) => setAmbulanceData(prev => ({ ...prev, color: e.target.value }))}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Ownership</label>
            <select
              value={ambulanceData.ownership}
              onChange={(e) => setAmbulanceData(prev => ({ ...prev, ownership: e.target.value as any }))}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="ngo">NGO</option>
            </select>
          </div>
        </div>
      </div>

      {/* Agency Information */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-4">Agency Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Agency Name *</label>
            <input
              type="text"
              required
              value={ambulanceData.agencyName}
              onChange={(e) => setAmbulanceData(prev => ({ ...prev, agencyName: e.target.value }))}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Region</label>
            <input
              type="text"
              value={ambulanceData.region}
              onChange={(e) => setAmbulanceData(prev => ({ ...prev, region: e.target.value }))}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Base Station */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-4">Base Station</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Station Name</label>
            <input
              type="text"
              value={ambulanceData.baseStation.name}
              onChange={(e) => setAmbulanceData(prev => ({
                ...prev,
                baseStation: { ...prev.baseStation, name: e.target.value }
              }))}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Station Address</label>
            <textarea
              value={ambulanceData.baseStation.address}
              onChange={(e) => setAmbulanceData(prev => ({
                ...prev,
                baseStation: { ...prev.baseStation, address: e.target.value }
              }))}
              rows={3}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Capabilities */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-4">Capabilities</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Service Level</label>
            <select
              value={ambulanceData.capabilities.level}
              onChange={(e) => setAmbulanceData(prev => ({
                ...prev,
                capabilities: { ...prev.capabilities, level: e.target.value as any }
              }))}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="BLS">BLS (Basic Life Support)</option>
              <option value="ALS">ALS (Advanced Life Support)</option>
              <option value="ICU">ICU (Intensive Care Unit)</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {['oxygen', 'defibrillator', 'ventilator', 'neonatal'].map((capability) => (
              <label key={capability} className="flex items-center">
                <input
                  type="checkbox"
                  checked={ambulanceData.capabilities[capability as keyof typeof ambulanceData.capabilities] as boolean}
                  onChange={(e) => setAmbulanceData(prev => ({
                    ...prev,
                    capabilities: { ...prev.capabilities, [capability]: e.target.checked }
                  }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700 capitalize">{capability}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Crew Information */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-4">Crew Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Driver Name</label>
            <input
              type="text"
              value={ambulanceData.crew.driverName}
              onChange={(e) => setAmbulanceData(prev => ({
                ...prev,
                crew: { ...prev.crew, driverName: e.target.value }
              }))}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Paramedic Name</label>
            <input
              type="text"
              value={ambulanceData.crew.paramedicName}
              onChange={(e) => setAmbulanceData(prev => ({
                ...prev,
                crew: { ...prev.crew, paramedicName: e.target.value }
              }))}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Attendant Name</label>
            <input
              type="text"
              value={ambulanceData.crew.attendantName}
              onChange={(e) => setAmbulanceData(prev => ({
                ...prev,
                crew: { ...prev.crew, attendantName: e.target.value }
              }))}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Contact Phone</label>
            <input
              type="tel"
              value={ambulanceData.crew.contactPhone}
              onChange={(e) => setAmbulanceData(prev => ({
                ...prev,
                crew: { ...prev.crew, contactPhone: e.target.value }
              }))}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Contact Email</label>
            <input
              type="email"
              value={ambulanceData.crew.contactEmail}
              onChange={(e) => setAmbulanceData(prev => ({
                ...prev,
                crew: { ...prev.crew, contactEmail: e.target.value }
              }))}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderOfficerForm = () => (
    <div className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
          <User className="h-5 w-5 text-blue-600" />
          Officer Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name *</label>
            <input
              type="text"
              required
              value={officerData.fullName}
              onChange={(e) => setOfficerData(prev => ({ ...prev, fullName: e.target.value }))}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Personal Contact</label>
            <input
              type="tel"
              value={officerData.personalContact}
              onChange={(e) => setOfficerData(prev => ({ ...prev, personalContact: e.target.value }))}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Employee ID *</label>
            <input
              type="text"
              required
              value={officerData.employeeId}
              onChange={(e) => setOfficerData(prev => ({ ...prev, employeeId: e.target.value }))}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Rank</label>
            <input
              type="text"
              value={officerData.rank}
              onChange={(e) => setOfficerData(prev => ({ ...prev, rank: e.target.value }))}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Agency *</label>
            <input
              type="text"
              required
              value={officerData.agency}
              onChange={(e) => setOfficerData(prev => ({ ...prev, agency: e.target.value }))}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/verify-otp')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Complete Your Profile</h1>
          <p className="text-gray-600 mt-2">
            Please provide your information to complete registration as a {getRoleTitle()}
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <ErrorBanner error={error} onDismiss={() => setError(null)} />
          
          <form onSubmit={handleSubmit}>
            {appState.role === 'citizen' && renderCitizenForm()}
            {appState.role === 'ambulance' && renderAmbulanceForm()}
            {appState.role === 'officer' && renderOfficerForm()}
            
            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Completing Profile...' : 'Complete Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}