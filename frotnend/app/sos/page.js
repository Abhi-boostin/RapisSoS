'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentLocation, formatDistance } from '@/utils/helpers';
import { endpoints } from '@/config/api';
import Card from '@/components/Card';
import Button from '@/components/Button';

export default function SOS() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [userPhone, setUserPhone] = useState('');
    const [responder, setResponder] = useState(null);
    const [requestType, setRequestType] = useState('');

    useEffect(() => {
        const phone = localStorage.getItem('userPhone');
        if (!phone) {
            router.replace('/user/init');
        } else {
            setUserPhone(phone);
        }
    }, [router]);

    const handleSOS = async (type) => {
        try {
            setLoading(true);
            setError('');
            setRequestType(type);

            // Get current location
            const location = await getCurrentLocation();
            
            // Send SOS request
            const endpoint = type === 'ambulance' ? endpoints.sosAmbulance : endpoints.sosOfficer;
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ location, userPhone })
            });

            const data = await response.json();
            if (!data.success) {
                throw new Error(data.message || 'Failed to send SOS');
            }

            // Update state with responder info
            setResponder(data[type === 'ambulance' ? 'ambulance' : 'officer']);
            
        } catch (err) {
            setError(err.message || 'Something went wrong');
            setResponder(null);
        } finally {
            setLoading(false);
        }
    };

    if (!userPhone) return null;

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-md mx-auto">
                <Card className={error || responder ? 'mb-4' : ''}>
                    <h1 className="text-2xl font-bold text-red-600 mb-6">Emergency SOS</h1>

                    {error ? (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    ) : null}

                    {responder ? (
                        <div className="bg-green-50 p-4 rounded-lg space-y-3">
                            <h2 className="text-lg font-semibold text-green-800">
                                Help is on the way!
                            </h2>
                            
                            {requestType === 'ambulance' ? (
                                <>
                                    <p><span className="font-medium">Ambulance Unit:</span> {responder.unitId}</p>
                                    <p><span className="font-medium">Vehicle:</span> {responder.vehicleNumber}</p>
                                    <p><span className="font-medium">Crew:</span> {responder.crew}</p>
                                </>
                            ) : (
                                <>
                                    <p><span className="font-medium">Badge Number:</span> {responder.badgeNumber}</p>
                                    <p><span className="font-medium">Department:</span> {responder.department}</p>
                                </>
                            )}

                            <div className="border-t border-green-200 pt-3 mt-3">
                                <p className="text-green-800">
                                    <span className="font-medium">Distance:</span> {responder.distance}km
                                </p>
                                <p className="text-green-800">
                                    <span className="font-medium">ETA:</span> ~{responder.estimatedMinutes} minutes
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <Button
                                onClick={() => handleSOS('ambulance')}
                                className="w-full !bg-red-600 hover:!bg-red-700"
                                disabled={loading}
                            >
                                {loading && requestType === 'ambulance' 
                                    ? 'Requesting Ambulance...' 
                                    : '🚑 Request Ambulance'}
                            </Button>

                            <Button
                                onClick={() => handleSOS('police')}
                                className="w-full !bg-blue-600 hover:!bg-blue-700"
                                disabled={loading}
                            >
                                {loading && requestType === 'police'
                                    ? 'Requesting Police...'
                                    : '👮 Request Police'}
                            </Button>
                        </div>
                    )}
                </Card>

                {responder && (
                    <div className="text-center text-sm text-gray-600 mt-4">
                        The responder has been notified and will arrive shortly.
                        Please stay at your current location.
                    </div>
                )}
            </div>
        </div>
    );
}