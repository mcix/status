'use client';

import { UptimeBar } from './UptimeBar';

interface ServiceStatusProps {
  id: number;
  name: string;
  status: 'operational' | 'degraded' | 'down';
  uptime: string;
}

export function ServiceStatus({ id, name, status, uptime }: ServiceStatusProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'operational':
        return 'text-green-600';
      case 'degraded':
        return 'text-yellow-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'operational':
        return 'Operational';
      case 'degraded':
        return 'Degraded Performance';
      case 'down':
        return 'Major Outage';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 last:border-b-0 overflow-visible">
      <div className="px-6 py-6 pb-12">
        {/* Header with name and status */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-gray-900">{name}</h3>
          <span className={`text-sm font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>

        {/* 90-day uptime bar */}
        <UptimeBar serviceId={id} serviceName={name} days={90} />

        {/* Uptime stats */}
        <div className="flex items-center justify-between mt-3 text-sm text-gray-500">
          <span>90 days ago</span>
          <span className="font-medium">{uptime} % uptime</span>
          <span>Today</span>
        </div>
      </div>
    </div>
  );
}

