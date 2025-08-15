import { NextRequest, NextResponse } from 'next/server';

// 🚨 TEMPORARY FIX: Disabled for Cursor release issue
// TODO: Re-enable after environment variables are properly configured

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // 🚨 TEMPORARY: Return success response
    return NextResponse.json({
      success: true,
      message: 'API temporarily disabled for maintenance',
      data: null
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // 🚨 TEMPORARY: Return empty data
    return NextResponse.json({
      success: true,
      data: null
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}