import React, { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';
import { getHealth } from '../api/endpoints';

export function HealthBadge() {
  const [status, setStatus] = useState<'ok' | 'error' | 'loading'>('loading');
  const [lastCheck, setLastCheck] = useState<string>('');

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const health = await getHealth();
        setStatus(health.status === 'ok' ? 'ok' : 'error');
        setLastCheck(new Date().toLocaleTimeString());
      } catch {
        setStatus('error');
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 60000); // Check every 60 seconds

    return () => clearInterval(interval);
  }, []);

  const statusColors = {
    ok: 'text-green-600 bg-green-50',
    error: 'text-red-600 bg-red-50',
    loading: 'text-gray-600 bg-gray-50',
  };

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
      <Activity className="h-3 w-3" />
      <span>{status === 'ok' ? 'Online' : status === 'error' ? 'Offline' : 'Checking...'}</span>
      {lastCheck && <span className="text-gray-500">• {lastCheck}</span>}
    </div>
  );
}