'use client';

import { useEffect, useState } from 'react';
import { ServiceStatus } from '@/components/ServiceStatus';
import { IncidentCard } from '@/components/IncidentCard';

interface Service {
  id: number;
  name: string;
  url: string;
  type: string;
  status: 'operational' | 'degraded' | 'down';
  responseTime: number | null;
  lastChecked: string;
}

interface UptimeData {
  id: number;
  name: string;
  uptime: string;
}

export default function Home() {
  const [services, setServices] = useState<Service[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [uptimeData, setUptimeData] = useState<UptimeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchData = async () => {
    try {
      const [statusRes, incidentsRes, uptimeRes] = await Promise.all([
        fetch('/api/status', { cache: 'no-store' }),
        fetch('/api/incidents?days=30', { cache: 'no-store' }),
        fetch('/api/uptime?days=90', { cache: 'no-store' }),
      ]);

      if (!statusRes.ok || !incidentsRes.ok || !uptimeRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const statusData = await statusRes.json();
      const incidentsData = await incidentsRes.json();
      const uptimeDataRes = await uptimeRes.json();

      setServices(statusData.services);
      setIncidents(incidentsData.incidents);
      setUptimeData(uptimeDataRes.uptime);
      setLastUpdate(new Date());
      setError(null);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Refresh data every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const getUptimeForService = (serviceId: number) => {
    const uptime = uptimeData.find(u => u.id === serviceId);
    return uptime?.uptime || '0.00';
  };

  const getOverallStatus = () => {
    if (services.some(s => s.status === 'down')) {
      return { text: 'Major Outage', color: 'bg-red-50 border-red-200 text-red-900' };
    }
    if (services.some(s => s.status === 'degraded')) {
      return { text: 'Degraded Performance', color: 'bg-yellow-50 border-yellow-200 text-yellow-900' };
    }
    return { text: 'All Systems Operational', color: 'bg-green-50 border-green-200 text-green-900' };
  };

  const overall = getOverallStatus();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/deltaproto-logo.svg" 
                alt="DeltaProto" 
                className="h-10 w-10"
              />
              <h1 className="text-xl font-semibold text-gray-900">DeltaProto Status</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-800">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Error loading status: {error}</span>
            </div>
            <p className="text-sm text-red-700 mt-2">
              Make sure your database is configured correctly. Visit /api/init to initialize the database.
            </p>
          </div>
        )}

        {/* Current Status Banner */}
        {!error && services.length > 0 && (
          <div className={`mb-8 rounded-lg border p-6 ${overall.color}`}>
            <h2 className="text-2xl font-bold">{overall.text}</h2>
          </div>
        )}

        {/* Uptime Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              Uptime over the past 90 days.
            </p>
            <p className="text-xs text-gray-400">
              Last updated: {lastUpdate.toLocaleString()}
            </p>
          </div>

          {/* Services List */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {services.map((service) => (
              <ServiceStatus
                key={service.id}
                id={service.id}
                name={service.name}
                status={service.status}
                uptime={getUptimeForService(service.id)}
              />
            ))}
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center gap-6 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-sm" />
              <span>Operational</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-sm" />
              <span>Degraded Performance</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-sm" />
              <span>Major Outage</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-300 rounded-sm" />
              <span>No Data</span>
            </div>
          </div>
        </div>

        {/* Past Incidents */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Past Incidents</h2>
          
          {incidents.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <div className="text-green-600 mb-2">
                <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-gray-600 font-medium">No incidents reported.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {incidents.map((incident) => (
                <IncidentCard key={incident.id} incident={incident} />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="text-center text-gray-500 text-sm">
            <p>© {new Date().getFullYear()} DeltaProto. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
