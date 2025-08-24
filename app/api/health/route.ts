import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
}

export async function POST() {
  return NextResponse.json({
    status: 'healthy',
    method: 'POST',
    timestamp: new Date().toISOString()
  }, { status: 200 });
}