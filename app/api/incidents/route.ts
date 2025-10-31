import { NextResponse } from 'next/server';
import { getRecentIncidents } from '@/lib/monitor';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    
    const incidents = await getRecentIncidents(days);
    
    return NextResponse.json({
      success: true,
      incidents,
    });
  } catch (error: any) {
    console.error('Incidents fetch error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

