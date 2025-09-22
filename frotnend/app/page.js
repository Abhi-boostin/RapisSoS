'use client';

import Card from '@/components/Card';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { getUserData, isFirstTimeUser } from '@/utils/auth';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check authentication state
    const userData = getUserData();
    const firstTime = isFirstTimeUser();

    if (userData) {
      // If user is authenticated, redirect to their dashboard based on role
      const dashboardRoutes = {
        user: '/user/dashboard',
        officer: '/officer/dashboard',
        ambulance: '/ambulance/dashboard'
      };
      router.replace(dashboardRoutes[userData.role] || '/');
    } else if (!firstTime) {
      // If not first time but not logged in, show quick access screen
      router.replace('/quick-access');
    } else {
      setIsLoading(false);
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-4xl mx-auto pt-12 px-4">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4 text-blue-600">RapidSoS</h1>
          <p className="text-xl text-gray-600 mb-8">Emergency Response System</p>
          <p className="text-lg text-gray-500">Select your role to continue</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <button 
            onClick={() => router.push('/user/init')}
            className="group relative"
          >
            <Card className="hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 cursor-pointer text-center p-8 h-full border-2 border-transparent hover:border-blue-500 relative overflow-hidden">
              <div className="absolute inset-0 bg-blue-500 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
              <div className="mb-6 flex justify-center">
                <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="text-5xl">👤</span>
                </div>
              </div>
              <h2 className="text-2xl font-semibold mb-4 text-blue-600">Citizen</h2>
              <p className="text-gray-600">
                Request emergency assistance or medical help in times of need
              </p>
              <div className="mt-6 text-blue-500 font-medium">
                Get Started →
              </div>
            </Card>
          </button>

          <button 
            onClick={() => router.push('/officer/init')}
            className="group relative"
          >
            <Card className="hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 cursor-pointer text-center p-8 h-full border-2 border-transparent hover:border-green-500">
              <div className="absolute inset-0 bg-green-500 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
              <div className="mb-6 flex justify-center">
                <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="text-5xl">👮‍♂️</span>
                </div>
              </div>
              <h2 className="text-2xl font-semibold mb-4 text-green-600">Officer</h2>
              <p className="text-gray-600">
                Respond to emergency calls and manage public safety
              </p>
              <div className="mt-6 text-green-500 font-medium">
                Officer Login →
              </div>
            </Card>
          </button>

          <button 
            onClick={() => router.push('/ambulance/init')}
            className="group relative"
          >
            <Card className="hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 cursor-pointer text-center p-8 h-full border-2 border-transparent hover:border-red-500">
              <div className="absolute inset-0 bg-red-500 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
              <div className="mb-6 flex justify-center">
                <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="text-5xl">🚑</span>
                </div>
              </div>
              <h2 className="text-2xl font-semibold mb-4 text-red-600">Ambulance</h2>
              <p className="text-gray-600">
                Provide medical emergency response and transportation
              </p>
              <div className="mt-6 text-red-500 font-medium">
                Ambulance Login →
              </div>
            </Card>
          </button>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            For emergency assistance without logging in,{' '}
            <Link href="/sos" className="text-red-600 font-medium hover:underline">
              click here for SOS
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
