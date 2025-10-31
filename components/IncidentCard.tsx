'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

interface IncidentUpdate {
  id: number;
  message: string;
  status: string;
  created_at: string;
}

interface Incident {
  id: number;
  service_name: string;
  title: string;
  description: string;
  status: string;
  started_at: string;
  resolved_at: string | null;
  updates: IncidentUpdate[];
}

interface IncidentCardProps {
  incident: Incident;
}

export function IncidentCard({ incident }: IncidentCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'resolved':
        return 'text-green-600';
      case 'monitoring':
        return 'text-blue-600';
      case 'identified':
        return 'text-orange-600';
      case 'investigating':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'resolved':
        return '✓';
      case 'monitoring':
        return '◉';
      case 'identified':
        return '!';
      case 'investigating':
        return '?';
      default:
        return '•';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  };

  const allUpdates = [
    ...(incident.updates || []),
    {
      id: 0,
      message: incident.description,
      status: 'investigating',
      created_at: incident.started_at,
    }
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-base font-semibold text-gray-900 mb-1">
              {incident.title}
            </h3>
            <p className="text-sm text-gray-500">
              {formatDate(incident.started_at)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-sm font-medium ${getStatusColor(incident.status)}`}>
              {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
            </span>
            <svg 
              className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 border-t border-gray-100">
          <div className="space-y-4 mt-4">
            {allUpdates.map((update, index) => (
              <div key={update.id || index} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    update.status === 'resolved' ? 'bg-green-500' :
                    update.status === 'monitoring' ? 'bg-blue-500' :
                    update.status === 'identified' ? 'bg-orange-500' :
                    'bg-yellow-500'
                  }`} />
                  {index < allUpdates.length - 1 && (
                    <div className="w-px h-full bg-gray-200 mt-1" />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-sm font-semibold ${getStatusColor(update.status)}`}>
                      {update.status.charAt(0).toUpperCase() + update.status.slice(1)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(update.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{update.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

