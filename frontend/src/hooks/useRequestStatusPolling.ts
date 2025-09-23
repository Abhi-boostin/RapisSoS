import { useState, useEffect, useRef } from 'react';
import { getUserRequest } from '../api/endpoints';
import { parseAPIError, APIError } from '../api/client';

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
    // Ambulance fields
    unitId?: string;
    vehiclePlate?: string;
    crew?: any;
    // Officer fields
    fullName?: string;
    agency?: string;
    rank?: string;
  };
  etaMinutes?: number;
  distanceMeters?: number;
}

export function useRequestStatusPolling(requestId: string | null) {
  const [requestStatus, setRequestStatus] = useState<RequestStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<APIError | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchRequestStatus = async () => {
    if (!requestId) return;

    try {
      const response = await getUserRequest(requestId);
      setRequestStatus(response);
      setError(null);

      // Stop polling if request is accepted or expired
      if (response.status === 'accepted' || response.status === 'expired') {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    } catch (err) {
      const apiError = parseAPIError(err);
      setError(apiError);
      
      // Stop polling on 404 or other errors
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  };

  useEffect(() => {
    if (!requestId) {
      setRequestStatus(null);
      setError(null);
      return;
    }

    setLoading(true);
    
    // Initial fetch
    fetchRequestStatus().finally(() => setLoading(false));

    // Start polling every 5 seconds
    intervalRef.current = setInterval(fetchRequestStatus, 5000);

    // Cleanup on unmount or requestId change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [requestId]);

  const retry = () => {
    setError(null);
    setLoading(true);
    fetchRequestStatus().finally(() => setLoading(false));
  };

  return {
    requestStatus,
    loading,
    error,
    retry
  };
}