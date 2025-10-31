import { NextResponse } from 'next/server';
import { initializeDatabase, seedServices } from '@/lib/db';

export async function GET() {
  try {
    await initializeDatabase();
    await seedServices();
    
    return NextResponse.json({
      success: true,
      message: 'Database initialized and services seeded successfully',
    });
  } catch (error: any) {
    console.error('Initialization error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

