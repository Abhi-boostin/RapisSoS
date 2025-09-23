import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, MapPin, Truck, Shield, Clock, Phone } from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { HealthBadge } from '../components/HealthBadge';
import { ErrorBanner } from '../components/ErrorBanner';
import { Toast } from '../components/Toast';
import { RequestStatusCard } from '../components/RequestStatusCard';
import { useRequestStatusPolling } from '../hooks/useRequestStatusPolling';
import { sosAmbulance, sosOfficer } from '../api/endpoints';
import { parseAPIError, APIError } from '../api/client';

export function CitizenDashboard() {
  const navigate = useNavigate();
  const { appState, clearState } = useAppState();
  const [loading, setLoading] = useState<'ambulance' | 'police' | null>(null);
  const [error, setError] = useState<APIError | null>(null);
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);
  const [currentServiceType, setCurrentServiceType] = useState<'ambulance' | 'officer' | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [manualLocation, setManualLocation] = useState({ longitude: '', latitude: '' });
  
  const { requestStatus, loading: pollingLoading, error: pollingError, retry } = useRequestStatusPolling(currentRequestId);

  React.useEffect(() => {
    if (!appState.phone || !appState.profileComplete) {
      navigate('/');
    }
  }, [appState.phone, appState.profileComplete, navigate]);

  const getCurrentLocation = (): Promise<[number, number]> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve([position.coords.longitude, position.coords.latitude]);
        },
        (error) => {
          reject(error);
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    });
  };

  const handleLocationDenied = () => {
    setShowLocationModal(true);
  };

  const handleManualLocationSubmit = async (type: 'ambulance' | 'police') => {
    const longitude = parseFloat(manualLocation.longitude);
    const latitude = parseFloat(manualLocation.latitude);

    if (isNaN(longitude) || isNaN(latitude)) {
      setError({ message: 'Please enter valid longitude and latitude', status: 400 });
      return;
    }

    setShowLocationModal(false);
    await makeSOSRequest(type, [longitude, latitude]);
  };

  const makeSOSRequest = async (type: 'ambulance' | 'police', coordinates: [number, number]) => {
    setError(null);
    setLoading(type);
    setCurrentRequestId(null);

    try {
      let response;
      if (type === 'ambulance') {
        response = await sosAmbulance(appState.phone!, coordinates);
        setCurrentServiceType('ambulance');
      } else {
        response = await sosOfficer(appState.phone!, coordinates);
        setCurrentServiceType('officer');
      }

      setCurrentRequestId(response.requestId);
      setToast({ 
        message: `${type === 'ambulance' ? 'Ambulance' : 'Police'} request sent successfully!`, 
        type: 'success' 
      });
    } catch (err) {
      setError(parseAPIError(err));
    } finally {
      setLoading(null);
    }
  };

  const handleEmergencyRequest = async (type: 'ambulance' | 'police') => {
    try {
      const coordinates = await getCurrentLocation();
      await makeSOSRequest(type, coordinates);
    } catch (locationError) {
      if (locationError instanceof GeolocationPositionError && locationError.code === locationError.PERMISSION_DENIED) {
        handleLocationDenied();
      } else {
        setError({ message: 'Unable to get your location. Please try again.', status: 400 });
      }
    }
  };

  const handleRetryRequest = () => {
    setCurrentRequestId(null);
    setCurrentServiceType(null);
    setError(null);
  };

  const handleLogout = () => {
    clearState();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Citizen Dashboard</h1>
              <p className="text-sm text-gray-600">{appState.phone}</p>
            </div>
            <div className="flex items-center gap-4">
              <HealthBadge />
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <ErrorBanner error={error} onDismiss={() => setError(null)} />

        {/* Request Status Card */}
        {requestStatus && (
          <div className="mb-8">
            <RequestStatusCard 
              requestStatus={requestStatus} 
              onRetry={handleRetryRequest}
            />
          </div>
        )}

        {/* Polling Error */}
        {pollingError && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-red-800">Connection Error</h3>
                <p className="text-sm text-red-700 mt-1">{pollingError.message}</p>
              </div>
              <button
                onClick={retry}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Emergency Buttons */}
        <div className={`grid md:grid-cols-2 gap-6 ${currentRequestId ? 'opacity-50 pointer-events-none' : ''}`}>
          <button
            onClick={() => handleEmergencyRequest('ambulance')}
            disabled={loading === 'ambulance' || !!currentRequestId}
            className="bg-red-600 text-white p-8 rounded-xl shadow-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:shadow-xl transform hover:scale-105 transition-transform"
          >
            <div className="text-center">
              <Truck className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {loading === 'ambulance' ? 'Requesting...' : 'Request Ambulance'}
              </h3>
              <p className="text-red-100">Medical emergency assistance</p>
            </div>
          </button>

          <button
            onClick={() => handleEmergencyRequest('police')}
            disabled={loading === 'police' || !!currentRequestId}
            className="bg-blue-600 text-white p-8 rounded-xl shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:shadow-xl transform hover:scale-105 transition-transform"
          >
            <div className="text-center">
              <Shield className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {loading === 'police' ? 'Requesting...' : 'Request Police'}
              </h3>
              <p className="text-blue-100">Police emergency assistance</p>
            </div>
          </button>
        </div>

        {/* Info */}
        <div className={`mt-8 bg-white rounded-lg p-6 shadow ${currentRequestId ? 'opacity-50' : ''}`}>
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            How it works
          </h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• Click the appropriate emergency button above</p>
            <p>• Your location will be automatically detected</p>
            <p>• Wait for the nearest available responder to accept</p>
            <p>• Once accepted, you'll receive contact details and ETA</p>
          </div>
        </div>
      </div>

      {/* Manual Location Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Manual Location Entry</h3>
            <p className="text-sm text-gray-600 mb-4">
              Location access was denied. Please enter your coordinates manually.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={manualLocation.longitude}
                  onChange={(e) => setManualLocation(prev => ({ ...prev, longitude: e.target.value }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="e.g., 77.2090"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={manualLocation.latitude}
                  onChange={(e) => setManualLocation(prev => ({ ...prev, latitude: e.target.value }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="e.g., 28.6139"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleManualLocationSubmit('ambulance')}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
                >
                  Request Ambulance
                </button>
                <button
                  onClick={() => handleManualLocationSubmit('police')}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                >
                  Request Police
                </button>
              </div>
              <button
                onClick={() => setShowLocationModal(false)}
                className="w-full mt-2 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}