import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../context/AppStateContext';
import { Heart, Shield, Truck, Zap } from 'lucide-react';
import { HealthBadge } from '../components/HealthBadge';
import { AnimatedGradientText } from '../components/magicui/animated-gradient-text';
import { RippleButton } from '../components/magicui/ripple-button';

// Decorative mock devices (purely presentational)
function PhoneMock({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative w-[300px] h-[620px] rounded-[42px] border border-white/10 bg-white/5 backdrop-blur-md shadow-2xl ${className}`}>
      {/* Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-6 bg-black/70 rounded-b-2xl mt-2" />
      {/* Inner screen */}
      <div className="absolute inset-[14px] rounded-[32px] overflow-hidden bg-white">
        {children}
      </div>
    </div>
  );
}

function SosScreen() {
  return (
    <div className="h-full w-full bg-gradient-to-b from-white to-orange-50">
      <div className="px-5 pt-6 text-xs text-gray-500">Current location • 4th Mound road, California</div>
      <div className="px-5 mt-2">
        <div className="text-[13px] font-semibold text-gray-900">Are you in an emergency?</div>
        <p className="text-[11px] text-gray-500 mt-1">Press the SOS button, your live location will be shared with the nearest help centre and your emergency contacts</p>
      </div>
      <div className="mt-5 mx-5 rounded-xl bg-white shadow-inner border border-gray-200 p-6 flex items-center justify-center">
        <div className="relative h-44 w-44 rounded-full bg-gradient-to-b from-orange-400 to-orange-500 flex items-center justify-center shadow-lg">
          <div className="absolute inset-0 rounded-full ring-8 ring-white/60" />
          <div className="text-white text-2xl font-bold">SOS</div>
        </div>
      </div>
      <div className="px-5 mt-4 text-[12px] text-gray-700 font-medium">What's your emergency?</div>
      <div className="px-4 grid grid-cols-4 gap-2 mt-2 pb-6">
        {['Medical','Fire','Natural','Accident','Violence','Rescue','Other'].map((t) => (
          <div key={t} className="text-[10px] px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-center">{t}</div>
        ))}
      </div>
      <div className="absolute bottom-3 inset-x-0 flex items-center justify-center text-[10px] text-gray-500">Home • My circle • Explore • Profile</div>
    </div>
  );
}

function CallingScreen() {
  return (
    <div className="h-full w-full bg-white">
      <div className="px-5 pt-8 text-[13px] text-gray-700 font-semibold">Calling emergency...</div>
      <p className="px-5 text-[11px] text-gray-500">Please stand by, we are currently requesting for help. Your emergency contacts and nearby rescue services would see your call for help</p>
      <div className="relative flex items-center justify-center mt-8">
        {/* Concentric pulse rings */}
        <div className="relative h-64 w-64">
          <div className="absolute inset-0 rounded-full bg-gradient-to-b from-orange-200 via-orange-100 to-white" />
          <div className="absolute inset-8 rounded-full bg-gradient-to-b from-orange-300/70 to-orange-100" />
          <div className="absolute inset-16 rounded-full bg-gradient-to-b from-orange-400/70 to-orange-200" />
          <div className="absolute inset-24 rounded-full bg-white flex items-center justify-center shadow-inner">
            <div className="h-28 w-28 rounded-full bg-gradient-to-b from-orange-400 to-orange-500 flex items-center justify-center text-white text-3xl font-bold ring-8 ring-white/70">02</div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 rounded-full bg-gray-300" />
    </div>
  );
}

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
      color: 'from-blue-600 to-cyan-500',
    },
    {
      id: 'officer' as const,
      title: 'Police Officer',
      description: 'Respond to emergency calls',
      icon: Shield,
      color: 'from-indigo-600 to-purple-600',
    },
    {
      id: 'ambulance' as const,
      title: 'Ambulance Crew',
      description: 'Provide medical emergency response',
      icon: Truck,
      color: 'from-red-600 to-pink-600',
    },
  ];

  const handleRoleSelect = (roleId: 'citizen' | 'officer' | 'ambulance') => {
    setRole(roleId);
    navigate('/send-otp');
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-r from-black via-slate-900 to-zinc-900">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Hero */}
          <div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-12 w-12 rounded-xl bg-orange-500" />
                <div className="absolute -right-2 -bottom-2 h-6 w-6 rotate-45 rounded-[6px] bg-orange-400" />
              </div>
              <div>
                <div className="text-orange-400 font-semibold text-lg tracking-wide">RapidSoS</div>
                <div className="text-sm text-gray-400">“Go without fear”</div>
              </div>
            </div>

            <div className="mt-10">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight">
                <span className="block">SOS Emergency</span>
                <AnimatedGradientText speed={1.2} colorFrom="#ffaa40" colorTo="#9c40ff" className="block mt-2">App UI Kit</AnimatedGradientText>
              </h1>
              <div className="mt-4 text-gray-300">Choose your role to continue</div>
              <div className="mt-4"><HealthBadge /></div>
            </div>

            {/* Role Buttons */}
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
              {roles.map((role) => {
                const Icon = role.icon;
                return (
                  <RippleButton
                    key={role.id}
                    onClick={() => handleRoleSelect(role.id)}
                    className={`w-full group bg-gradient-to-br ${role.color} px-5 py-4 rounded-xl shadow-lg border border-white/10`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-white/20 p-2 rounded-lg">
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="text-white font-semibold">{role.title}</div>
                        <div className="text-white/80 text-xs">{role.description}</div>
                      </div>
                    </div>
                  </RippleButton>
                );
              })}
            </div>

            <div className="mt-10 text-gray-400 text-sm flex items-center gap-2">
              <Zap className="h-4 w-4 text-orange-400" /> Editable
            </div>
          </div>

          {/* Right Visuals */}
          <div className="relative hidden lg:block">
            {/* Ambient glow */}
            <div className="absolute -top-10 -left-10 h-72 w-72 rounded-full bg-orange-500/30 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />

            <div className="flex items-end justify-center gap-8 pr-6">
              <PhoneMock className="translate-y-8 rotate-0">
                <SosScreen />
              </PhoneMock>
              <PhoneMock className="-translate-y-2">
                <CallingScreen />
              </PhoneMock>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
