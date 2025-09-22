'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/Card';
import Button from '@/components/Button';

export default function OfficerDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('officerToken');
    if (!token) {
      router.replace('/officer/init');
      return;
    }

    const fetchRequests = async () => {
      try {
        const res = await fetch('http://localhost:4000/api/dispatch/pending', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch requests');

        setRequests(data);
      } catch (err) {
        setError(err.message || 'Failed to load requests');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
    const interval = setInterval(fetchRequests, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, [router]);

  const handleRespond = async (requestId, status) => {
    try {
      const res = await fetch(`http://localhost:4000/api/dispatch/${requestId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('officerToken')}`
        },
        body: JSON.stringify({ status })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update request');

      setRequests(prev => prev.map(req => 
        req.id === requestId ? { ...req, status } : req
      ));
    } catch (err) {
      setError(err.message || 'Failed to update request');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <p className="text-center">Loading requests...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Emergency Requests</h1>
        <Button 
          onClick={() => setRequests([])} 
          className="!bg-gray-600 hover:!bg-gray-700"
        >
          Clear List
        </Button>
      </div>

      {error && (
        <Card className="mb-6 bg-red-50">
          <p className="text-red-600">{error}</p>
        </Card>
      )}

      {requests.length === 0 ? (
        <Card>
          <p className="text-center text-gray-600">No pending requests at the moment.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {requests.map((request) => (
            <Card key={request.id} className="relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-2 h-full ${
                request.status === 'pending' ? 'bg-yellow-500' :
                request.status === 'accepted' ? 'bg-green-500' :
                request.status === 'rejected' ? 'bg-red-500' :
                'bg-gray-500'
              }`} />

              <div className="ml-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold">
                      {request.serviceType === 'police' ? '👮‍♂️ Police' : '🚑 Ambulance'} Assistance
                    </h2>
                    <p className="text-gray-600">Request ID: {request.id}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    request.status === 'accepted' ? 'bg-green-100 text-green-800' :
                    request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <p>
                    <strong>Location:</strong>{' '}
                    <a 
                      href={`https://www.google.com/maps?q=${request.lat},${request.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View on Map
                    </a>
                  </p>
                  {request.description && (
                    <p>
                      <strong>Description:</strong> {request.description}
                    </p>
                  )}
                  <p>
                    <strong>Requester:</strong> {request.phone}
                  </p>
                </div>

                {request.status === 'pending' && (
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleRespond(request.id, 'accepted')}
                      className="flex-1 !bg-green-600 hover:!bg-green-700"
                    >
                      Accept Request
                    </Button>
                    <Button
                      onClick={() => handleRespond(request.id, 'rejected')}
                      className="flex-1 !bg-red-600 hover:!bg-red-700"
                    >
                      Reject Request
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}