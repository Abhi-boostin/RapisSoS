import React from 'react';
import { Phone } from 'lucide-react';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}

export function PhoneInput({ value, onChange, placeholder = '+91XXXXXXXXXX', disabled = false, error }: PhoneInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    
    // Remove any non-digit characters except +
    val = val.replace(/[^\d+]/g, '');
    
    // Ensure it starts with +
    if (val && !val.startsWith('+')) {
      val = '+' + val;
    }
    
    onChange(val);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Phone Number
      </label>
      <div className="relative">
        <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        <input
          type="tel"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`block w-full pl-10 pr-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
            error ? 'border-red-300' : 'border-gray-300'
          }`}
        />
      </div>
      <p className="text-xs text-gray-500">Use E.164 format: +91XXXXXXXXXX</p>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}