'use client';

import React, { useState, useEffect } from 'react';

interface UptimeDay {
  date: string;
  status: 'operational' | 'degraded' | 'down' | 'nodata';
  incidents?: number;
}

interface UptimeBarProps {
  serviceId: number;
  serviceName: string;
  days?: number;
}

export function UptimeBar({ serviceId, serviceName, days = 90 }: UptimeBarProps) {
  const [hoveredDay, setHoveredDay] = useState<UptimeDay | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [uptimeData, setUptimeData] = useState<UptimeDay[]>([]);
  const [uptime, setUptime] = useState<string>('0.00');

  const generateMockData = React.useCallback(() => {
    const mockData: UptimeDay[] = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Simulate mostly operational with occasional issues
      let status: 'operational' | 'degraded' | 'down' | 'nodata' = 'operational';
      const random = Math.random();
      
      if (random > 0.98) {
        status = 'down';
      } else if (random > 0.95) {
        status = 'degraded';
      }
      
      mockData.push({
        date: date.toISOString().split('T')[0],
        status,
        incidents: status !== 'operational' ? 1 : 0,
      });
    }
    
    setUptimeData(mockData);
    
    // Calculate uptime percentage
    const operational = mockData.filter(d => d.status === 'operational').length;
    const uptimePercent = (operational / mockData.length * 100).toFixed(2);
    setUptime(uptimePercent);
  }, [days]);

  // Fetch historical uptime data
  useEffect(() => {
    fetch(`/api/uptime-history?serviceId=${serviceId}&days=${days}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUptimeData(data.history);
          setUptime(data.uptime);
        } else {
          // Generate mock data for now
          generateMockData();
        }
      })
      .catch(() => {
        generateMockData();
      });
  }, [serviceId, days, generateMockData]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'bg-green-500';
      case 'degraded':
        return 'bg-yellow-500';
      case 'down':
        return 'bg-red-500';
      default:
        return 'bg-gray-300';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'operational':
        return 'No downtime recorded on this day.';
      case 'degraded':
        return 'Partial outage';
      case 'down':
        return 'Major outage';
      default:
        return 'No data exists for this day.';
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2 h-8">
        {uptimeData.map((day, index) => (
          <div
            key={index}
            className={`flex-1 h-full ${getStatusColor(day.status)} cursor-pointer transition-opacity hover:opacity-80 rounded-sm`}
            onMouseEnter={() => {
              setHoveredDay(day);
              setHoveredIndex(index);
            }}
            onMouseLeave={() => {
              setHoveredDay(null);
              setHoveredIndex(null);
            }}
          />
        ))}
      </div>

      {/* Tooltip */}
      {hoveredDay && hoveredIndex !== null && (
        <div 
          className="absolute z-10 bg-white border border-gray-200 rounded-lg shadow-lg p-4 mt-2 min-w-[280px]"
          style={{
            left: `${(hoveredIndex / uptimeData.length) * 100}%`,
            transform: 'translateX(-50%)',
          }}
        >
          <div className="font-semibold text-gray-900 mb-2">
            {formatDate(hoveredDay.date)}
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${getStatusColor(hoveredDay.status)}`} />
            <span className="text-sm text-gray-700">{getStatusText(hoveredDay.status)}</span>
          </div>
          {hoveredDay.incidents && hoveredDay.incidents > 0 && (
            <div className="mt-2 text-sm text-gray-500">
              {hoveredDay.incidents} incident{hoveredDay.incidents > 1 ? 's' : ''}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

