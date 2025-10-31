'use client';

import { useEffect, useState } from 'react';
import { ServiceCard } from '@/components/ServiceCard';
import { IncidentTimeline } from '@/components/IncidentTimeline';
import { OverallStatus } from '@/components/OverallStatus';

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
        fetch('/api/uptime?days=30', { cache: 'no-store' }),
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
    return uptime?.uptime;
  };

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
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src="/deltaproto-logo.svg" 
                alt="DeltaProto" 
                className="h-12 w-12"
              />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">DeltaProto Status</h1>
                <p className="text-gray-500 mt-1">Real-time service monitoring</p>
              </div>
            </div>
            <button
              onClick={fetchData}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        {/* Overall Status */}
        {services.length > 0 && (
          <div className="mb-8">
            <OverallStatus services={services} />
          </div>
        )}

        {/* Last Updated */}
        <div className="mb-6 text-sm text-gray-500 text-right">
          Last updated: {lastUpdate.toLocaleString()}
        </div>

        {/* Services Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Services</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                name={service.name}
                type={service.type}
                status={service.status}
                responseTime={service.responseTime}
                lastChecked={service.lastChecked}
                uptime={getUptimeForService(service.id)}
              />
            ))}
          </div>
        </div>

        {/* Incidents */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Incidents</h2>
          <IncidentTimeline incidents={incidents} />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-500 text-sm">
            <p>© {new Date().getFullYear()} DeltaProto. All rights reserved.</p>
            <p className="mt-2">
              Powered by Next.js and Neon PostgreSQL
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
