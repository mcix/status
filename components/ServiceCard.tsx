'use client';

import { StatusBadge } from './StatusBadge';

interface ServiceCardProps {
  name: string;
  type: string;
  status: 'operational' | 'degraded' | 'down';
  responseTime: number | null;
  lastChecked: string;
  uptime?: string;
}

export function ServiceCard({ name, type, status, responseTime, lastChecked, uptime }: ServiceCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
          <p className="text-sm text-gray-500 capitalize">{type}</p>
        </div>
        <StatusBadge status={status} />
      </div>
      
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
        <div>
          <p className="text-xs text-gray-500 mb-1">Response Time</p>
          <p className="text-sm font-medium text-gray-900">
            {responseTime ? `${responseTime}ms` : 'N/A'}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">30-Day Uptime</p>
          <p className="text-sm font-medium text-gray-900">
            {uptime ? `${uptime}%` : 'Calculating...'}
          </p>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-400">
          Last checked: {new Date(lastChecked).toLocaleString()}
        </p>
      </div>
    </div>
  );
}

