'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '../../components/Card';
import Button from '@/components/Button';
import Link from 'next/link';

export default function QuickAccess() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-4xl mx-auto pt-12 px-4">
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-blue-600">RapidSoS</h1>
          <p className="text-xl text-gray-600 mt-4">Emergency Response System</p>
        </div>

        <div className="grid gap-6 max-w-lg mx-auto">
          <Link href="/sos" className="block">
            <Card className="bg-red-50 hover:bg-red-100 transition-colors p-6 text-center">
              <span className="text-4xl mb-4 block">🆘</span>
              <h2 className="text-2xl font-bold text-red-600 mb-2">Emergency SOS</h2>
              <p className="text-gray-600">Need immediate help? Tap here for emergency assistance</p>
            </Card>
          </Link>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Login</h2>
            <div className="space-y-4">
              <Button
                onClick={() => router.push('/user/verify')}
                className="w-full bg-blue-500 hover:bg-blue-600"
              >
                Login with Phone Number
              </Button>
              <div className="text-center">
                <span className="text-sm text-gray-500">or</span>
              </div>
              <Button
                onClick={() => router.push('/')}
                className="w-full bg-gray-500 hover:bg-gray-600"
              >
                Choose Different Role
              </Button>
            </div>
          </Card>

          <div className="text-center">
            <button 
              onClick={() => router.push('/user/init')}
              className="text-gray-600 hover:text-blue-600 text-sm"
            >
              New user? Create an account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}