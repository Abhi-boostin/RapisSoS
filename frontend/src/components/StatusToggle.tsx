import React from 'react';

interface StatusToggleProps {
  role: 'ambulance' | 'officer';
  currentStatus: string;
  onStatusChange: (status: string) => void;
  loading?: boolean;
}

export function StatusToggle({ role, currentStatus, onStatusChange, loading = false }: StatusToggleProps) {
  const ambulanceStatuses = [
    { value: 'available', label: 'Available', color: 'bg-green-100 text-green-800' },
    { value: 'enroute', label: 'En Route', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'busy', label: 'Busy', color: 'bg-red-100 text-red-800' },
    { value: 'offline', label: 'Offline', color: 'bg-gray-100 text-gray-800' },
  ];

  const officerStatuses = [
    { value: 'on', label: 'On Duty', color: 'bg-green-100 text-green-800' },
    { value: 'off', label: 'Off Duty', color: 'bg-gray-100 text-gray-800' },
  ];

  const statuses = role === 'ambulance' ? ambulanceStatuses : officerStatuses;
  const currentStatusInfo = statuses.find(s => s.value === currentStatus) || statuses[0];

  return (
    <div className="relative">
      <select
        value={currentStatus}
        onChange={e => onStatusChange(e.target.value)}
        disabled={loading}
        className={`appearance-none px-3 py-2 pr-8 text-sm font-medium rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${currentStatusInfo.color}`}
      >
        {statuses.map(status => (
          <option key={status.value} value={status.value}>
            {status.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
        </svg>
      </div>
    </div>
  );
}