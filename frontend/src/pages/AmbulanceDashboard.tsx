import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, RefreshCw } from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { HealthBadge } from '../components/HealthBadge';
import { StatusToggle } from '../components/StatusToggle';
import { RequestList } from '../components/RequestList';
import { RequestDetail } from '../components/RequestDetail';
import { ErrorBanner } from '../components/ErrorBanner';
import { Toast } from '../components/Toast';
import { 
  getAmbulanceRequests, 
  acceptAmbulanceRequest, 
  declineAmbulanceRequest, 
  setAmbulanceStatus,
  SOSRequest
} from '../api/endpoints';
import { parseAPIError, APIError } from '../api/client';

export function AmbulanceDashboard() {
  const navigate = useNavigate();
  const { appState, clearState } = useAppState();
  const [requests, setRequests] = useState<SOSRequest[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState('available');
  const [error, setError] = useState<APIError | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  React.useEffect(() => {
    if (!appState.phone || !appState.profileComplete) {
      navigate('/');
    }
  }, [appState.phone, appState.profileComplete, navigate]);

  const fetchRequests = async () => {
    if (!appState.phone) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await getAmbulanceRequests(appState.phone);
      setRequests(response.requests || []);
    } catch (err) {
      setError(parseAPIError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [appState.phone]);

  const handleStatusChange = async (status: string) => {
    if (!appState.phone) return;

    try {
      await setAmbulanceStatus(appState.phone, status);
      setCurrentStatus(status);
      setToast({ message: `Status updated to ${status}`, type: 'success' });
    } catch (err) {
      const error = parseAPIError(err);
      setToast({ message: error.message, type: 'error' });
    }
  };

  const handleAcceptRequest = async () => {
    if (!selectedRequestId || !appState.phone) return;

    setActionLoading(true);
    try {
      const response = await acceptAmbulanceRequest(selectedRequestId, appState.phone);
      setToast({ message: response.message || 'Request accepted successfully', type: 'success' });
      await fetchRequests();
      setSelectedRequestId('');
    } catch (err) {
      const error = parseAPIError(err);
      setToast({ message: error.message, type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeclineRequest = async () => {
    if (!selectedRequestId || !appState.phone) return;

    setActionLoading(true);
    try {
      const response = await declineAmbulanceRequest(selectedRequestId, appState.phone);
      
      let message = 'Request declined';
      if (response.nextAmbulance) {
        message += ` and reassigned to ${response.nextAmbulance.unitId}`;
      } else if (response.success === false) {
        message = response.message || 'No other ambulances available';
      }
      
      setToast({ message, type: 'success' });
      await fetchRequests();
      setSelectedRequestId('');
    } catch (err) {
      const error = parseAPIError(err);
      setToast({ message: error.message, type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = () => {
    clearState();
    navigate('/');
  };

  const selectedRequest = requests.find(req => req.id === selectedRequestId) || null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Ambulance Dashboard</h1>
              <p className="text-sm text-gray-600">{appState.phone}</p>
            </div>
            <div className="flex items-center gap-4">
              <StatusToggle
                role="ambulance"
                currentStatus={currentStatus}
                onStatusChange={handleStatusChange}
              />
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
      <div className="max-w-6xl mx-auto px-4 py-6">
        <ErrorBanner error={error} onDismiss={() => setError(null)} />

        <div className="grid lg:grid-cols-5 gap-6 h-[calc(100vh-200px)]">
          {/* Sidebar - Request List */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Pending Requests ({requests.length})
              </h2>
              <button
                onClick={fetchRequests}
                disabled={loading}
                className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
              >
                <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="overflow-y-auto h-full">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : (
                <RequestList
                  requests={requests}
                  onSelect={setSelectedRequestId}
                  selectedId={selectedRequestId}
                />
              )}
            </div>
          </div>

          {/* Main Panel - Request Detail */}
          <div className="lg:col-span-3 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Request Details</h2>
            
            <div className="overflow-y-auto h-full">
              <RequestDetail
                request={selectedRequest}
                onAccept={handleAcceptRequest}
                onDecline={handleDeclineRequest}
                loading={actionLoading}
              />
            </div>
          </div>
        </div>
      </div>

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