'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentLocation, formatTimeRemaining, formatDistance, openInMaps } from '@/utils/helpers';
import { endpoints } from '@/config/api';
import Card from '@/components/Card';
import Button from '@/components/Button';

export default function OfficerPage() {
    const router = useRouter();
    const [officerPhone, setOfficerPhone] = useState('');
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [status, setStatus] = useState('available');

    useEffect(() => {
        const phone = localStorage.getItem('officerPhone');
        if (!phone) {
            router.replace('/officer/init');
        } else {
            setOfficerPhone(phone);
            fetchRequests(phone);
            // Start polling for requests
            const interval = setInterval(() => fetchRequests(phone), 10000);
            return () => clearInterval(interval);
        }
    }, [router]);

    const fetchRequests = async (phone) => {
        try {
            const response = await fetch(`${endpoints.officerRequests}?phone=${phone}`);
            const data = await response.json();
            if (data.success) {
                setRequests(data.requests);
            }
        } catch (err) {
            console.error('Error fetching requests:', err);
        }
    };

    const updateStatus = async (newStatus) => {
        try {
            setLoading(true);
            // Get current location
            const location = await getCurrentLocation();

            const response = await fetch(endpoints.officerStatus, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone: officerPhone,
                    status: newStatus,
                    location
                })
            });

            const data = await response.json();
            if (data.success) {
                setStatus(newStatus);
            } else {
                throw new Error(data.message);
            }
        } catch (err) {
            setError(err.message || 'Failed to update status');
        } finally {
            setLoading(false);
        }
    };

    const handleRequest = async (requestId, action) => {
        try {
            setLoading(true);
            const endpoint = action === 'accept' 
                ? endpoints.officerAcceptRequest(requestId)
                : endpoints.officerDeclineRequest(requestId);

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ officerPhone })
            });

            const data = await response.json();
            if (!data.success) {
                throw new Error(data.message);
            }

            // Refresh requests list
            fetchRequests(officerPhone);

            if (action === 'accept') {
                // Open location in maps
                openInMaps(data.mapsUrl);
                // Update status to busy
                await updateStatus('busy');
            }
        } catch (err) {
            setError(err.message || `Failed to ${action} request`);
        } finally {
            setLoading(false);
        }
    };

    if (!officerPhone) return null;

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-md mx-auto">
                <Card className="mb-4">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-xl font-bold">Officer Dashboard</h1>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            status === 'available' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                    </div>

                    <Button
                        onClick={() => updateStatus(status === 'available' ? 'off' : 'available')}
                        className={`w-full ${
                            status === 'available' 
                                ? '!bg-yellow-500 hover:!bg-yellow-600' 
                                : '!bg-green-500 hover:!bg-green-600'
                        }`}
                        disabled={loading || status === 'busy'}
                    >
                        {status === 'available' ? 'Go Offline' : 'Go Online'}
                    </Button>
                </Card>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {requests.length > 0 ? (
                    <div className="space-y-4">
                        {requests.map((request) => (
                            <Card key={request.id} className="bg-blue-50">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-medium text-blue-900">
                                            Emergency Request
                                        </h3>
                                        <p className="text-sm text-blue-700">
                                            Distance: {formatDistance(request.distanceMeters)}
                                        </p>
                                    </div>
                                    <span className="text-sm text-blue-700">
                                        {formatTimeRemaining(request.secondsRemaining)}
                                    </span>
                                </div>

                                <div className="flex space-x-2">
                                    <Button
                                        onClick={() => handleRequest(request.id, 'accept')}
                                        className="flex-1 !bg-green-500 hover:!bg-green-600"
                                        disabled={loading}
                                    >
                                        Accept
                                    </Button>
                                    <Button
                                        onClick={() => handleRequest(request.id, 'decline')}
                                        className="flex-1 !bg-red-500 hover:!bg-red-600"
                                        disabled={loading}
                                    >
                                        Decline
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="bg-gray-50">
                        <p className="text-center text-gray-600">
                            No pending requests
                        </p>
                    </Card>
                )}
            </div>
        </div>
    );
}