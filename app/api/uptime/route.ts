import { NextResponse } from 'next/server';
import { getUptimeStats } from '@/lib/monitor';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    
    const services = await sql`SELECT * FROM services ORDER BY id`;
    
    const uptimeData = await Promise.all(
      services.map(async (service: any) => {
        const stats = await getUptimeStats(service.id, days);
        return {
          id: service.id,
          name: service.name,
          type: service.type,
          ...stats,
        };
      })
    );
    
    return NextResponse.json({
      success: true,
      uptime: uptimeData,
      period: `${days} days`,
    });
  } catch (error: any) {
    console.error('Uptime fetch error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

