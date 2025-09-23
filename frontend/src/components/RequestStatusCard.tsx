import React from 'react';
import { Clock, MapPin, Phone, Truck, Shield, RefreshCw } from 'lucide-react';
import { useCountdown } from '../hooks/useCountdown';

interface RequestStatus {
  id: string;
  status: 'pending' | 'accepted' | 'expired';
  createdAt: string;
  secondsRemaining: number;
  mapsUrl: string;
  serviceType: 'ambulance' | 'officer';
  responder?: {
    type: 'ambulance' | 'officer';
    phone: string;
    unitId?: string;
    vehiclePlate?: string;
    crew?: any;
    fullName?: string;
    agency?: string;
    rank?: string;
  };
  etaMinutes?: number;
  distanceMeters?: number;
}

interface RequestStatusCardProps {
  requestStatus: RequestStatus;
  onRetry: () => void;
}

export function RequestStatusCard({ requestStatus, onRetry }: RequestStatusCardProps) {
  const { formatTime } = useCountdown(requestStatus.secondsRemaining);
  const distanceKm = requestStatus.distanceMeters ? (requestStatus.distanceMeters / 1000).toFixed(1) : null;

  const getServiceIcon = () => {
    return requestStatus.serviceType === 'ambulance' ? Truck : Shield;
  };

  const getServiceColor = () => {
    return requestStatus.serviceType === 'ambulance' ? 'text-red-600' : 'text-blue-600';
  };

  const getServiceBgColor = () => {
    return requestStatus.serviceType === 'ambulance' ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200';
  };

  const ServiceIcon = getServiceIcon();

  if (requestStatus.status === 'expired') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="text-center">
          <Clock className="h-12 w-12 mx-auto mb-4 text-red-400" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Request Expired</h3>
          <p className="text-red-600 mb-4">
            Your {requestStatus.serviceType} request has expired. Please try again.
          </p>
          <button
            onClick={onRetry}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Request Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`border rounded-lg p-6 ${getServiceBgColor()}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <ServiceIcon className={`h-8 w-8 ${getServiceColor()}`} />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {requestStatus.serviceType === 'ambulance' ? 'Ambulance' : 'Police'} Request
            </h3>
            <p className="text-sm text-gray-600">ID: {requestStatus.id}</p>
          </div>
        </div>
        <div className="text-right">
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${
            requestStatus.status === 'accepted' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {requestStatus.status === 'accepted' ? 'Accepted' : 'Pending'}
          </span>
        </div>
      </div>

      {/* Basic Info - Always Visible */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">Time Remaining</span>
          </div>
          <span className={`text-sm font-medium ${
            requestStatus.secondsRemaining > 60 ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatTime()}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">Location</span>
          </div>
          <a
            href={requestStatus.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-700 underline"
          >
            View on Maps
          </a>
        </div>
      </div>

      {/* Pending State */}
      {requestStatus.status === 'pending' && (
        <div className="text-center py-4">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-gray-400" />
          <p className="text-gray-600">Awaiting responder acceptance...</p>
        </div>
      )}

      {/* Accepted State - Show Responder Details */}
      {requestStatus.status === 'accepted' && requestStatus.responder && (
        <div className="border-t pt-4">
          <h4 className="font-medium text-gray-900 mb-3">Responder Assigned</h4>
          
          <div className="space-y-3">
            {/* Contact Info */}
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Contact:</span>
              <span className="text-sm text-gray-600">{requestStatus.responder.phone}</span>
            </div>

            {/* Ambulance Details */}
            {requestStatus.responder.type === 'ambulance' && (
              <>
                {requestStatus.responder.unitId && (
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Unit:</span>
                    <span className="text-sm text-gray-600">
                      {requestStatus.responder.unitId}
                      {requestStatus.responder.vehiclePlate && ` (${requestStatus.responder.vehiclePlate})`}
                    </span>
                  </div>
                )}
                {requestStatus.responder.crew && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Crew:</span> {requestStatus.responder.crew.driverName || 'N/A'}
                  </div>
                )}
              </>
            )}

            {/* Officer Details */}
            {requestStatus.responder.type === 'officer' && (
              <>
                {requestStatus.responder.fullName && (
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Officer:</span>
                    <span className="text-sm text-gray-600">{requestStatus.responder.fullName}</span>
                  </div>
                )}
                {requestStatus.responder.agency && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Agency:</span> {requestStatus.responder.agency}
                    {requestStatus.responder.rank && ` (${requestStatus.responder.rank})`}
                  </div>
                )}
              </>
            )}

            {/* ETA and Distance */}
            {(requestStatus.etaMinutes || distanceKm) && (
              <div className="flex items-center justify-between pt-2 border-t">
                {requestStatus.etaMinutes && (
                  <div className="text-center">
                    <div className="text-lg font-semibold text-green-600">{requestStatus.etaMinutes} min</div>
                    <div className="text-xs text-gray-500">ETA</div>
                  </div>
                )}
                {distanceKm && (
                  <div className="text-center">
                    <div className="text-lg font-semibold text-blue-600">{distanceKm} km</div>
                    <div className="text-xs text-gray-500">Distance</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}