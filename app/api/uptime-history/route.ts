import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceId = parseInt(searchParams.get('serviceId') || '1');
    const days = parseInt(searchParams.get('days') || '90');
    
    // Get daily aggregated status for the past N days
    const history = await sql`
      WITH daily_status AS (
        SELECT 
          DATE(checked_at) as check_date,
          CASE 
            WHEN COUNT(*) FILTER (WHERE status = 'down') > 0 THEN 'down'
            WHEN COUNT(*) FILTER (WHERE status = 'degraded') > 0 THEN 'degraded'
            ELSE 'operational'
          END as day_status,
          COUNT(*) as total_checks,
          COUNT(*) FILTER (WHERE status = 'down') as down_count,
          COUNT(*) FILTER (WHERE status = 'degraded') as degraded_count
        FROM status_checks
        WHERE service_id = ${serviceId}
        AND checked_at > NOW() - INTERVAL '1 day' * ${days}
        GROUP BY DATE(checked_at)
      ),
      date_series AS (
        SELECT 
          (NOW() - INTERVAL '1 day' * generate_series)::date as check_date
        FROM generate_series(0, ${days - 1})
      )
      SELECT 
        ds.check_date::text as date,
        COALESCE(dst.day_status, 'nodata') as status,
        COALESCE(dst.down_count + dst.degraded_count, 0) as incidents
      FROM date_series ds
      LEFT JOIN daily_status dst ON ds.check_date = dst.check_date
      ORDER BY ds.check_date ASC
    `;
    
    // Calculate overall uptime
    const stats = await sql`
      SELECT 
        COUNT(*) as total_checks,
        COUNT(*) FILTER (WHERE status = 'operational') as operational_checks
      FROM status_checks
      WHERE service_id = ${serviceId}
      AND checked_at > NOW() - INTERVAL '1 day' * ${days}
    `;
    
    let uptime = '0.00';
    if (stats.length > 0 && stats[0].total_checks > 0) {
      uptime = ((stats[0].operational_checks / stats[0].total_checks) * 100).toFixed(2);
    }
    
    return NextResponse.json({
      success: true,
      history,
      uptime,
      days,
    });
  } catch (error: any) {
    console.error('Uptime history fetch error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

