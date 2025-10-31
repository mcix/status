import { NextResponse } from 'next/server';
import { monitorServices } from '@/lib/monitor';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// This endpoint will be called by Vercel Cron Jobs
// or an external cron service like cron-job.org
export async function GET(request: Request) {
  try {
    // Optional: Add authentication to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const statuses = await monitorServices();
    
    return NextResponse.json({
      success: true,
      message: 'Monitoring check completed',
      services: statuses,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

