'use client';

interface OverallStatusProps {
  services: Array<{
    status: 'operational' | 'degraded' | 'down';
  }>;
}

export function OverallStatus({ services }: OverallStatusProps) {
  const getOverallStatus = () => {
    if (services.some(s => s.status === 'down')) {
      return {
        status: 'down',
        text: 'Major Outage',
        description: 'One or more services are currently unavailable',
        color: 'bg-red-50 border-red-200',
        textColor: 'text-red-900',
        iconColor: 'text-red-500',
      };
    }
    
    if (services.some(s => s.status === 'degraded')) {
      return {
        status: 'degraded',
        text: 'Partial Outage',
        description: 'Some services are experiencing issues',
        color: 'bg-yellow-50 border-yellow-200',
        textColor: 'text-yellow-900',
        iconColor: 'text-yellow-500',
      };
    }
    
    return {
      status: 'operational',
      text: 'All Systems Operational',
      description: 'All services are running smoothly',
      color: 'bg-green-50 border-green-200',
      textColor: 'text-green-900',
      iconColor: 'text-green-500',
    };
  };

  const overall = getOverallStatus();

  const getIcon = () => {
    if (overall.status === 'operational') {
      return (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      );
    } else if (overall.status === 'degraded') {
      return (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      );
    } else {
      return (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      );
    }
  };

  return (
    <div className={`rounded-lg border p-8 ${overall.color}`}>
      <div className="flex items-center gap-4">
        <div className={overall.iconColor}>
          {getIcon()}
        </div>
        <div className="flex-1">
          <h2 className={`text-2xl font-bold ${overall.textColor}`}>{overall.text}</h2>
          <p className={`mt-1 ${overall.textColor} opacity-80`}>{overall.description}</p>
        </div>
      </div>
    </div>
  );
}

