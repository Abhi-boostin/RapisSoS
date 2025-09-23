import React from 'react';
import { MapPin, Clock, Eye } from 'lucide-react';
import { useCountdown } from '../hooks/useCountdown';
import { SOSRequest } from '../api/endpoints';

interface RequestListProps {
  requests: SOSRequest[];
  onSelect: (id: string) => void;
  selectedId?: string;
}

function RequestItem({ request, onSelect, isSelected }: { 
  request: SOSRequest; 
  onSelect: (id: string) => void;
  isSelected: boolean;
}) {
  const { formatTime } = useCountdown(request.secondsRemaining);
  const distanceKm = (request.distanceMeters / 1000).toFixed(1);

  return (
    <div
      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300 bg-white'
      }`}
      onClick={() => onSelect(request.id)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">
            {new Date(request.createdAt).toLocaleTimeString()}
          </span>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          request.secondsRemaining > 60 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {formatTime()}
        </span>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">{distanceKm} km away</span>
        </div>
        <button className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
          <Eye className="h-4 w-4" />
          View
        </button>
      </div>
    </div>
  );
}

export function RequestList({ requests, onSelect, selectedId }: RequestListProps) {
  if (requests.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>No pending requests</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {requests.map(request => (
        <RequestItem
          key={request.id}
          request={request}
          onSelect={onSelect}
          isSelected={selectedId === request.id}
        />
      ))}
    </div>
  );
}