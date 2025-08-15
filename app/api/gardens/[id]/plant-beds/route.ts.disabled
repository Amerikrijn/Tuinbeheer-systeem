import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { apiLogger } from '@/lib/logger';
import { logClientSecurityEvent } from '@/lib/banking-security';

// Force dynamic rendering since this route uses Date.now()
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now();
  const operationId = `plant-beds-get-${Date.now()}`;
  let userId: string | null = null;
  
  try {
    const { id: gardenId } = params;
    
    apiLogger.info('GET /api/gardens/[id]/plant-beds', { operationId, gardenId });

    // 1. Authentication check (banking-grade)
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        await logClientSecurityEvent('API_AUTH_FAILED', 'HIGH', false, 'Unauthorized API access to plant beds');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      userId = user.id;
    } catch (authException) {
      // Fallback: If auth check fails completely, deny access
      await logClientSecurityEvent('API_AUTH_EXCEPTION', 'CRITICAL', false, 'Authentication system failure');
      return NextResponse.json({ error: 'Authentication system unavailable' }, { status: 503 });
    }

    // 2. Input validation
    if (!gardenId) {
      await logClientSecurityEvent('API_VALIDATION_FAILED', 'MEDIUM', false, 'Garden ID is required');
      return NextResponse.json({ error: 'Garden ID is required' }, { status: 400 });
    }

    // 3. Database operation
    const { data: plantBeds, error } = await supabase
      .from('plant_beds')
      .select('*')
      .eq('garden_id', gardenId)
      .order('created_at', { ascending: false });

    if (error) {
      // Banking-grade error logging with fallback
      try {
        apiLogger.error('Database error fetching plant beds', error, { gardenId, operationId });
        await logClientSecurityEvent('API_DATABASE_ERROR', 'HIGH', false, 'Database error fetching plant beds');
      } catch (logError) {
        // Fallback: If logging fails, still handle the error gracefully
        console.error('Logging failed, original error:', error);
      }
      return NextResponse.json({ error: 'Failed to fetch plant beds' }, { status: 500 });
    }

    // Success logging
    await logClientSecurityEvent('API_PLANT_BEDS_GET_SUCCESS', 'LOW', true, undefined, Date.now() - startTime);
    
    apiLogger.info('Plant beds fetched successfully', { 
      operationId, 
      count: plantBeds?.length || 0,
      gardenId 
    });

    return NextResponse.json(plantBeds);
  } catch (error) {
    // Banking-grade error logging with fallback
    try {
      await logClientSecurityEvent('API_PLANT_BEDS_GET_ERROR', 'HIGH', false, error instanceof Error ? error.message : 'Unknown error', Date.now() - startTime);
      apiLogger.error('API error in plant beds endpoint', error as Error, { gardenId: params.id, operationId });
    } catch (logError) {
      // Fallback: If logging fails, still handle the error gracefully
      console.error('Logging failed, original error:', error);
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}