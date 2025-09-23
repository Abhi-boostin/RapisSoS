'use client';



import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '../../../components/Card';
import Button from '../../../components/Button';



export default function OfficerInit() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();



  const validatePhone = (phone) => {  const validatePhone = (phone) => {

    const phoneRegex = /^\+91[6-9]\d{9}$/;    const phoneRegex = /^\+91[6-9]\d{9}$/;

    return phoneRegex.test(phone);    return phoneRegex.test(phone);

  };  };



  const handleSubmit = async (e) => {  const handleSubmit = async (e) => {

    e.preventDefault();    e.preventDefault();

    setLoading(true);    setLoading(true);

    setError('');    setError('');



    if (!validatePhone(phone)) {    if (!validatePhone(phone)) {

      setError('Please enter a valid Indian mobile number with +91 prefix');      setError('Please enter a valid Indian mobile number with +91 prefix');

      setLoading(false);      setLoading(false);

      return;      return;

    }    }



    try {    try {

      const res = await fetch('http://localhost:4000/api/officers/init', {      const res = await fetch('http://localhost:4000/api/officers/init', {

        method: 'POST',        method: 'POST',

        headers: { 'Content-Type': 'application/json' },        headers: { 'Content-Type': 'application/json' },

        body: JSON.stringify({ phone })        body: JSON.stringify({ phone })

      });      });

      

      const data = await res.json();      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');

      

      router.push(`/officer/verify?phone=${encodeURIComponent(phone)}`);      localStorage.setItem('officerPhone', phone);

    } catch (err) {      router.push(`/officer/verify?phone=${encodeURIComponent(phone)}`);

      setError(err.message || 'Failed to send OTP. Please try again.');    } catch (err) {

    } finally {      setError(err.message || 'Failed to send OTP. Please try again.');

      setLoading(false);    } finally {

    }      setLoading(false);

  };    }

  };

  return (

    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">  return (

      <div className="max-w-md w-full">    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-10">      <div className="max-w-md w-full">

          <h1 className="text-4xl font-semibold text-gray-900 tracking-tight mb-3 font-sans">        <div className="text-center mb-10">

            Officer Registration          <h1 className="text-4xl font-semibold text-gray-900 tracking-tight mb-3 font-sans">

          </h1>            Officer Registration

          <p className="text-lg text-gray-600 font-light">          </h1>

            Enter your phone number to get started          <p className="text-lg text-gray-600 font-light">

          </p>            Enter your phone number to get started

        </div>          </p>

        </div>

        <Card className="backdrop-blur-sm bg-white/90 shadow-xl border-0">

          <form onSubmit={handleSubmit} className="space-y-6">        <Card className="backdrop-blur-sm bg-white/90 shadow-xl border-0">

            <div>          <form onSubmit={handleSubmit} className="space-y-6">

              <label             <div>

                htmlFor="phone"               <label 

                className="block text-sm font-medium text-gray-900 mb-2 tracking-wide"                htmlFor="phone" 

              >                className="block text-sm font-medium text-gray-900 mb-2 tracking-wide"

                Phone Number              >

              </label>                Phone Number

              <div className="relative rounded-lg shadow-sm">              </label>

                <input              <div className="relative rounded-lg shadow-sm">

                  type="tel"                <input

                  id="phone"                  type="tel"

                  value={phone}                  id="phone"

                  onChange={(e) => setPhone(e.target.value)}                  value={phone}

                  className="block w-full pl-12 pr-4 py-3.5 text-gray-900 placeholder:text-gray-400 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"                  onChange={(e) => setPhone(e.target.value)}

                  placeholder="Enter your mobile number"                  className="block w-full pl-12 pr-4 py-3.5 text-gray-900 placeholder:text-gray-400 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"

                  pattern="^\+91[6-9]\d{9}$"                  placeholder="Enter your mobile number"

                  required                  pattern="^\+91[6-9]\d{9}$"

                />                  required

                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">                />

                  <span className="text-lg">🇮🇳</span>                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">

                </div>                  <span className="text-lg">🇮🇳</span>

              </div>                </div>

              <p className="mt-2.5 text-sm text-gray-500 flex items-center">              </div>

                <svg className="w-4 h-4 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">              <p className="mt-2.5 text-sm text-gray-500 flex items-center">

                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />                <svg className="w-4 h-4 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                </svg>                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />

                Format: +91XXXXXXXXXX                </svg>

              </p>                Format: +91XXXXXXXXXX

            </div>              </p>

            </div>

            {error && (

              <div className="rounded-md bg-red-50 p-4">            {error && (

                <div className="flex">              <div className="rounded-md bg-red-50 p-4">

                  <div className="flex-shrink-0">                <div className="flex">

                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">                  <div className="flex-shrink-0">

                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">

                    </svg>                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />

                  </div>                    </svg>

                  <div className="ml-3">                  </div>

                    <p className="text-sm text-red-800">{error}</p>                  <div className="ml-3">

                  </div>                    <p className="text-sm text-red-800">{error}</p>

                </div>                  </div>

              </div>                </div>

            )}              </div>

            )}

            <Button 

              type="submit"             <Button 

              className="w-full py-3 text-base font-medium shadow-md transition-all duration-200"               type="submit" 

              disabled={loading}              className="w-full py-3 text-base font-medium rounded-lg shadow-md transition-all duration-200 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700" 

            >              disabled={loading}

              {loading ? (            >

                <div className="flex items-center justify-center">              {loading ? (

                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">                <div className="flex items-center justify-center">

                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">

                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />

                  </svg>                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />

                  Sending OTP...                  </svg>

                </div>                  Sending OTP...

              ) : 'Get OTP'}                </div>

            </Button>              ) : 'Get OTP'}

          </form>            </Button>

        </Card>          </form>

      </div>        </Card>

    </div>

  );        <div className="mt-6 text-center">

}          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
            <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Your officer details will be collected after verification</span>
          </div>
        </div>
      </div>
    </div>
  );
} 