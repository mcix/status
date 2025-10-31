import axios from 'axios';
import { sql } from './db';

export interface ServiceStatus {
  id: number;
  name: string;
  url: string;
  type: string;
  status: 'operational' | 'degraded' | 'down';
  responseTime: number | null;
  lastChecked: Date;
  errorMessage?: string;
}

export async function checkServiceStatus(url: string): Promise<{
  status: 'operational' | 'degraded' | 'down';
  responseTime: number | null;
  errorMessage?: string;
}> {
  const startTime = Date.now();
  
  try {
    const response = await axios.get(url, {
      timeout: 10000,
      validateStatus: (status) => status < 500,
    });
    
    const responseTime = Date.now() - startTime;
    
    if (response.status >= 200 && response.status < 300) {
      return {
        status: responseTime > 3000 ? 'degraded' : 'operational',
        responseTime,
      };
    } else if (response.status >= 300 && response.status < 500) {
      return {
        status: 'degraded',
        responseTime,
        errorMessage: `HTTP ${response.status}`,
      };
    } else {
      return {
        status: 'down',
        responseTime,
        errorMessage: `HTTP ${response.status}`,
      };
    }
  } catch (error: any) {
    return {
      status: 'down',
      responseTime: null,
      errorMessage: error.message || 'Connection failed',
    };
  }
}

export async function monitorServices(): Promise<ServiceStatus[]> {
  try {
    const services = await sql`SELECT * FROM services ORDER BY id`;
    
    const statuses = await Promise.all(
      services.map(async (service: any) => {
        const check = await checkServiceStatus(service.url);
        
        // Store the check result
        await sql`
          INSERT INTO status_checks (service_id, status, response_time, error_message)
          VALUES (${service.id}, ${check.status}, ${check.responseTime}, ${check.errorMessage || null})
        `;
        
        // Check if we need to create or resolve an incident
        await handleIncidents(service.id, check.status);
        
        return {
          id: service.id,
          name: service.name,
          url: service.url,
          type: service.type,
          status: check.status,
          responseTime: check.responseTime,
          lastChecked: new Date(),
          errorMessage: check.errorMessage,
        };
      })
    );
    
    return statuses;
  } catch (error) {
    console.error('Error monitoring services:', error);
    throw error;
  }
}

async function handleIncidents(serviceId: number, currentStatus: string) {
  try {
    // Check for active incidents
    const activeIncidents = await sql`
      SELECT * FROM incidents 
      WHERE service_id = ${serviceId} 
      AND status != 'resolved'
      ORDER BY started_at DESC
      LIMIT 1
    `;
    
    if (currentStatus === 'down' || currentStatus === 'degraded') {
      // Create incident if none exists
      if (activeIncidents.length === 0) {
        const service = await sql`SELECT name FROM services WHERE id = ${serviceId}`;
        const statusText = currentStatus === 'down' ? 'outage' : 'degraded performance';
        
        await sql`
          INSERT INTO incidents (service_id, title, description, status)
          VALUES (
            ${serviceId},
            ${`${service[0].name} ${statusText}`},
            ${`We are investigating issues with ${service[0].name}.`},
            'investigating'
          )
        `;
      }
    } else if (currentStatus === 'operational' && activeIncidents.length > 0) {
      // Resolve active incident
      const incident = activeIncidents[0];
      await sql`
        UPDATE incidents 
        SET status = 'resolved', resolved_at = NOW()
        WHERE id = ${incident.id}
      `;
      
      await sql`
        INSERT INTO incident_updates (incident_id, message, status)
        VALUES (
          ${incident.id},
          'The issue has been resolved. All services are operational.',
          'resolved'
        )
      `;
    }
  } catch (error) {
    console.error('Error handling incidents:', error);
  }
}

export async function getRecentIncidents(days: number = 30) {
  try {
    const incidents = await sql`
      SELECT 
        i.*,
        s.name as service_name,
        s.type as service_type,
        (
          SELECT json_agg(
            json_build_object(
              'id', iu.id,
              'message', iu.message,
              'status', iu.status,
              'created_at', iu.created_at
            ) ORDER BY iu.created_at DESC
          )
          FROM incident_updates iu
          WHERE iu.incident_id = i.id
        ) as updates
      FROM incidents i
      JOIN services s ON i.service_id = s.id
      WHERE i.started_at > NOW() - INTERVAL '${days} days'
      ORDER BY i.started_at DESC
    `;
    
    return incidents;
  } catch (error) {
    console.error('Error fetching incidents:', error);
    throw error;
  }
}

export async function getUptimeStats(serviceId: number, days: number = 30) {
  try {
    const stats = await sql`
      SELECT 
        COUNT(*) as total_checks,
        COUNT(*) FILTER (WHERE status = 'operational') as operational_checks,
        AVG(response_time) FILTER (WHERE status = 'operational') as avg_response_time
      FROM status_checks
      WHERE service_id = ${serviceId}
      AND checked_at > NOW() - INTERVAL '${days} days'
    `;
    
    if (stats.length > 0 && stats[0].total_checks > 0) {
      const uptime = (stats[0].operational_checks / stats[0].total_checks) * 100;
      return {
        uptime: uptime.toFixed(2),
        avgResponseTime: Math.round(stats[0].avg_response_time || 0),
        totalChecks: stats[0].total_checks,
      };
    }
    
    return {
      uptime: '0.00',
      avgResponseTime: 0,
      totalChecks: 0,
    };
  } catch (error) {
    console.error('Error fetching uptime stats:', error);
    throw error;
  }
}

