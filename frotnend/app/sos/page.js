'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/Card';
import Button from '@/components/Button';

export default function SOS() {
  const [phone, setPhone] = useState('');
  const [serviceType, setServiceType] = useState('police');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const savedPhone = localStorage.getItem('phone');
    if (!savedPhone) {
      router.replace('/user/init');
    } else {
      setPhone(savedPhone);
    }
  }, [router]);

  const sendSOS = async () => {
    setLoading(true);
    setStatus('Locating your position...');

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0
        });
      });

      const { latitude, longitude } = position.coords;
      setStatus('Dispatching help...');

      // Send SOS signal
      await fetch('http://localhost:4000/api/sos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          phone,
          type: serviceType,
          lat: latitude,
          lng: longitude,
          description
        })
      });

      // Create dispatch request
      const res = await fetch('http://localhost:4000/api/dispatch/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          phone,
          serviceType,
          lat: latitude,
          lng: longitude,
          description
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to dispatch help');

      setStatus('Help is on the way! Request ID: ' + data.requestId);
    } catch (err) {
      setStatus(err.message || 'Failed to send SOS. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!phone) {
    return null;
  }

  return (
    <div className="max-w-md mx-auto">
      <Card className={status ? 'mb-4' : ''}>
        <h1 className="text-2xl font-bold text-red-600 mb-6">Emergency SOS</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Emergency Service
            </label>
            <select
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              <option value="police">Police</option>
              <option value="ambulance">Ambulance</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe your emergency..."
              rows={3}
              disabled={loading}
            />
          </div>

          <Button
            onClick={sendSOS}
            className="w-full !bg-red-600 hover:!bg-red-700"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Emergency SOS'}
          </Button>
        </div>
      </Card>

      {status && (
        <Card className={status.includes('Help is on the way') ? 'bg-green-50' : 'bg-blue-50'}>
          <p className="text-center font-medium">
            {status}
          </p>
        </Card>
      )}
    </div>
  );
} 