'use client';

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

interface IncidentTimelineProps {
  incidents: Incident[];
}

export function IncidentTimeline({ incidents }: IncidentTimelineProps) {
  if (!incidents || incidents.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <svg className="w-16 h-16 mx-auto text-green-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Recent Incidents</h3>
        <p className="text-gray-500">All systems are operating normally</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'investigating':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'identified':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'monitoring':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {incidents.map((incident) => (
        <div key={incident.id} className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{incident.title}</h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(incident.status)}`}>
                  {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-2">
                {incident.service_name} • Started {formatDistanceToNow(new Date(incident.started_at), { addSuffix: true })}
              </p>
              <p className="text-gray-700">{incident.description}</p>
            </div>
          </div>

          {incident.updates && incident.updates.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Updates</h4>
              <div className="space-y-3">
                {incident.updates.map((update) => (
                  <div key={update.id} className="flex gap-3">
                    <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-gray-300" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded border ${getStatusColor(update.status)}`}>
                          {update.status}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatDistanceToNow(new Date(update.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{update.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {incident.resolved_at && (
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 text-sm text-green-700">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Resolved {formatDistanceToNow(new Date(incident.resolved_at), { addSuffix: true })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

