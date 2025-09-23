import React from 'react';
import { MapPin, User, Phone, Heart, AlertTriangle, Pill, Users, Check, X } from 'lucide-react';
import { SOSRequest } from '../api/endpoints';

interface RequestDetailProps {
  request: SOSRequest | null;
  onAccept: () => void;
  onDecline: () => void;
  loading?: boolean;
}

export function RequestDetail({ request, onAccept, onDecline, loading = false }: RequestDetailProps) {
  if (!request) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Select a request to view details</p>
        </div>
      </div>
    );
  }

  const { user } = request;
  const distanceKm = (request.distanceMeters / 1000).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Location and Maps */}
      <div className="bg-white rounded-lg border p-4">
        <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-blue-600" />
          Location Details
        </h3>
        <div className="space-y-2">
          <p className="text-sm text-gray-600">Distance: {distanceKm} km away</p>
          <a
            href={request.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
          >
            <MapPin className="h-4 w-4" />
            Open in Maps
          </a>
        </div>
      </div>

      {/* User Information */}
      {user && (
        <div className="bg-white rounded-lg border p-4">
          <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            User Information
          </h3>
          <div className="space-y-3">
            {(user.name?.first || user.name?.last) && (
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Name</label>
                <p className="text-sm">{user.name.first} {user.name.last}</p>
              </div>
            )}
            
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Phone</label>
              <p className="text-sm flex items-center gap-2">
                <Phone className="h-4 w-4" />
                {user.phone}
              </p>
            </div>

            {user.bloodGroup && (
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Blood Group</label>
                <p className="text-sm flex items-center gap-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  {user.bloodGroup}
                </p>
              </div>
            )}

            {user.allergies && user.allergies.length > 0 && (
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Allergies</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {user.allergies.map((allergy, index) => (
                    <span key={index} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {allergy}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {user.medicalConditions && user.medicalConditions.length > 0 && (
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Medical Conditions</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {user.medicalConditions.map((condition, index) => (
                    <span key={index} className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                      {condition}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {user.medications && user.medications.length > 0 && (
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Current Medications</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {user.medications.map((medication, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full flex items-center gap-1">
                      <Pill className="h-3 w-3" />
                      {medication}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {user.specialNeeds && user.specialNeeds.length > 0 && (
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Special Needs</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {user.specialNeeds.map((need, index) => (
                    <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                      {need}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {user.emergencyContacts && user.emergencyContacts.length > 0 && (
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Emergency Contacts</label>
                <div className="space-y-2 mt-1">
                  {user.emergencyContacts.map((contact, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{contact.name}</span>
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-600">{contact.phone}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onAccept}
          disabled={loading}
          className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Check className="h-5 w-5" />
          {loading ? 'Processing...' : 'Accept Request'}
        </button>
        <button
          onClick={onDecline}
          disabled={loading}
          className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <X className="h-5 w-5" />
          {loading ? 'Processing...' : 'Decline Request'}
        </button>
      </div>
    </div>
  );
}