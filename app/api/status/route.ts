import { NextResponse } from 'next/server';
import { monitorServices } from '@/lib/monitor';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const statuses = await monitorServices();
    
    return NextResponse.json({
      success: true,
      services: statuses,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

