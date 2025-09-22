'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/Card';
import Button from '@/components/Button';

export default function AmbulanceManagement() {
  const [ambulances, setAmbulances] = useState([]);
  const [newAmbulance, setNewAmbulance] = useState({ 
    vehicleNumber: '', 
    driverName: '', 
    driverPhone: '',
    hospitalName: '',
    capacity: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchAmbulances();
  }, []);

  const fetchAmbulances = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/ambulances', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('officerToken')}`
        }
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch ambulances');

      setAmbulances(data);
    } catch (err) {
      setError(err.message || 'Failed to load ambulances');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAmbulance = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('http://localhost:4000/api/ambulances', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('officerToken')}`
        },
        body: JSON.stringify(newAmbulance)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add ambulance');

      setAmbulances(prev => [...prev, data]);
      setNewAmbulance({ 
        vehicleNumber: '', 
        driverName: '', 
        driverPhone: '',
        hospitalName: '',
        capacity: ''
      });
      setIsAdding(false);
    } catch (err) {
      setError(err.message || 'Failed to add ambulance');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await fetch(`http://localhost:4000/api/ambulances/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('officerToken')}`
        },
        body: JSON.stringify({ status })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update status');

      setAmbulances(prev => prev.map(amb => 
        amb.id === id ? { ...amb, status } : amb
      ));
    } catch (err) {
      setError(err.message || 'Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <p className="text-center">Loading ambulances...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Ambulance Management</h1>
        <Button onClick={() => setIsAdding(!isAdding)}>
          {isAdding ? 'Cancel' : 'Add New Ambulance'}
        </Button>
      </div>

      {error && (
        <Card className="mb-6 bg-red-50">
          <p className="text-red-600">{error}</p>
        </Card>
      )}

      {isAdding && (
        <Card className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Add New Ambulance</h2>
          <form onSubmit={handleAddAmbulance} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle Number
              </label>
              <input
                type="text"
                value={newAmbulance.vehicleNumber}
                onChange={(e) => setNewAmbulance(prev => ({ ...prev, vehicleNumber: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Driver Name
              </label>
              <input
                type="text"
                value={newAmbulance.driverName}
                onChange={(e) => setNewAmbulance(prev => ({ ...prev, driverName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Driver Phone
              </label>
              <input
                type="tel"
                value={newAmbulance.driverPhone}
                onChange={(e) => setNewAmbulance(prev => ({ ...prev, driverPhone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hospital Name
              </label>
              <input
                type="text"
                value={newAmbulance.hospitalName}
                onChange={(e) => setNewAmbulance(prev => ({ ...prev, hospitalName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Capacity
              </label>
              <input
                type="number"
                value={newAmbulance.capacity}
                onChange={(e) => setNewAmbulance(prev => ({ ...prev, capacity: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                required
              />
            </div>

            <Button type="submit" className="w-full">
              Add Ambulance
            </Button>
          </form>
        </Card>
      )}

      <div className="grid gap-4">
        {ambulances.map((ambulance) => (
          <Card key={ambulance.id} className="relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-2 h-full ${
              ambulance.status === 'available' ? 'bg-green-500' :
              ambulance.status === 'busy' ? 'bg-red-500' :
              ambulance.status === 'maintenance' ? 'bg-yellow-500' :
              'bg-gray-500'
            }`} />

            <div className="ml-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold">{ambulance.vehicleNumber}</h2>
                  <p className="text-gray-600">Driver: {ambulance.driverName}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  ambulance.status === 'available' ? 'bg-green-100 text-green-800' :
                  ambulance.status === 'busy' ? 'bg-red-100 text-red-800' :
                  ambulance.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {ambulance.status.charAt(0).toUpperCase() + ambulance.status.slice(1)}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <p><strong>Phone:</strong> {ambulance.driverPhone}</p>
                <p><strong>Hospital:</strong> {ambulance.hospitalName}</p>
                <p><strong>Capacity:</strong> {ambulance.capacity} patients</p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => handleUpdateStatus(ambulance.id, 'available')}
                  className={`flex-1 ${ambulance.status === 'available' ? '!bg-gray-400' : '!bg-green-600 hover:!bg-green-700'}`}
                  disabled={ambulance.status === 'available'}
                >
                  Available
                </Button>
                <Button
                  onClick={() => handleUpdateStatus(ambulance.id, 'busy')}
                  className={`flex-1 ${ambulance.status === 'busy' ? '!bg-gray-400' : '!bg-red-600 hover:!bg-red-700'}`}
                  disabled={ambulance.status === 'busy'}
                >
                  Busy
                </Button>
                <Button
                  onClick={() => handleUpdateStatus(ambulance.id, 'maintenance')}
                  className={`flex-1 ${ambulance.status === 'maintenance' ? '!bg-gray-400' : '!bg-yellow-600 hover:!bg-yellow-700'}`}
                  disabled={ambulance.status === 'maintenance'}
                >
                  Maintenance
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {ambulances.length === 0 && (
          <Card>
            <p className="text-center text-gray-600">No ambulances registered yet.</p>
          </Card>
        )}
      </div>
    </div>
  );
}