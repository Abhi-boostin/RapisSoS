import { useState, useEffect, useRef } from 'react';
import { getAmbulanceRequests, SOSRequest } from '../api/endpoints';
import { parseAPIError, APIError } from '../api/client';

export function useAmbulanceRequestPolling(phone: string | null) {
  const [requests, setRequests] = useState<SOSRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<APIError | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchRequests = async () => {
    if (!phone) return;

    try {
      const response = await getAmbulanceRequests(phone);
      setRequests(response.requests || []);
      setError(null);
    } catch (err) {
      const apiError = parseAPIError(err);
      setError(apiError);
    }
  };

  useEffect(() => {
    if (!phone) {
      setRequests([]);
      setError(null);
      return;
    }

    setLoading(true);
    
    // Initial fetch
    fetchRequests().finally(() => setLoading(false));

    // Start polling every 3 seconds
    intervalRef.current = setInterval(fetchRequests, 3000);

    // Cleanup on unmount or phone change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [phone]);

  const retry = () => {
    setError(null);
    setLoading(true);
    fetchRequests().finally(() => setLoading(false));
  };

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const startPolling = () => {
    if (intervalRef.current) return; // Already polling
    
    if (phone) {
      intervalRef.current = setInterval(fetchRequests, 3000);
    }
  };

  return {
    requests,
    loading,
    error,
    retry,
    stopPolling,
    startPolling
  };
}
