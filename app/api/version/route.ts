import { NextResponse } from 'next/server';
import { APP_VERSION, CACHE_BUST_TIMESTAMP } from '@/lib/version';

export async function GET() {
  return NextResponse.json({
    version: APP_VERSION,
    timestamp: CACHE_BUST_TIMESTAMP,
    buildTime: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
}