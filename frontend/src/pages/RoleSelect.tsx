import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../context/AppStateContext';
import { Heart, Shield, Truck } from 'lucide-react';
import { HealthBadge } from '../components/HealthBadge';

export function RoleSelect() {
  const navigate = useNavigate();
  const { appState, setRole } = useAppState();

  // Auto-redirect if already authenticated and profile complete
  React.useEffect(() => {
    if (appState.role && appState.phone && appState.profileComplete) {
      navigate(`/${appState.role}`);
    }
  }, [appState, navigate]);

  const roles = [
    {
      id: 'citizen' as const,
      title: 'Citizen',
      description: 'Request emergency services',
      icon: Heart,
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      id: 'officer' as const,
      title: 'Police Officer',
      description: 'Respond to emergency calls',
      icon: Shield,
      color: 'bg-indigo-600 hover:bg-indigo-700',
    },
    {
      id: 'ambulance' as const,
      title: 'Ambulance Crew',
      description: 'Provide medical emergency response',
      icon: Truck,
      color: 'bg-red-600 hover:bg-red-700',
    },
  ];

  const handleRoleSelect = (roleId: 'citizen' | 'officer' | 'ambulance') => {
    setRole(roleId);
    navigate('/send-otp');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">RapidSoS</h1>
          <p className="text-gray-600">Choose your role to continue</p>
          <div className="mt-4 flex justify-center">
            <HealthBadge />
          </div>
        </div>

        {/* Role Cards */}
        <div className="space-y-4">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <button
                key={role.id}
                onClick={() => handleRoleSelect(role.id)}
                className={`w-full p-6 rounded-xl text-white ${role.color} transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 transition-transform`}
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-xl font-semibold">{role.title}</h3>
                    <p className="text-white text-opacity-90">{role.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Emergency services platform</p>
        </div>
      </div>
    </div>
  );
}