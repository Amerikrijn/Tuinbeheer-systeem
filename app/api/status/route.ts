import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const accept = request.headers.get('accept') || 'unknown';
  
  return NextResponse.json({
    status: 'operational',
    timestamp: new Date().toISOString(),
    headers: {
      userAgent,
      accept
    },
    services: {
      database: 'connected',
      storage: 'available',
      auth: 'active'
    }
  });
}

export async function HEAD() {
  return NextResponse.json(null, { status: 200 });
}