import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { apiLogger } from '@/lib/logger';

// Force dynamic rendering since this route handles query parameters
export const dynamic = 'force-dynamic';

// Mock data for development/testing
const mockPlantBeds = [
  {
    id: 'bed-1',
    name: 'Groenteveld Noord',
    garden_id: 'garden-1',
    location: 'Noordkant',
    size: '4x3 meter',
    soil_type: 'Klei',
    sun_exposure: 'Veel zon',
    description: 'Plantvak voor groenten',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_active: true,
    gardens: {
      id: 'garden-1',
      name: 'Gemeenschapstuin Noord'
    }
  },
  {
    id: 'bed-2',
    name: 'Plantenveld Zuid',
    garden_id: 'garden-1',
    location: 'Zuidkant',
    size: '3x2 meter',
    soil_type: 'Zand',
    sun_exposure: 'Halfschaduw',
    description: 'Plantvak voor planten',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_active: true,
    gardens: {
      id: 'garden-1',
      name: 'Gemeenschapstuin Noord'
    }
  },
  {
    id: 'bed-3',
    name: 'Kruidentuin',
    garden_id: 'garden-2',
    location: 'Centraal',
    size: '2x2 meter',
    soil_type: 'Potgrond',
    sun_exposure: 'Veel zon',
    description: 'Plantvak voor kruiden',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_active: true,
    gardens: {
      id: 'garden-2',
      name: 'Schooltuin Oost'
    }
  }
];

export async function GET(request: NextRequest) {
  const operationId = `plant-beds-get-${Date.now()}`;
  
  try {
    apiLogger.info('GET /api/plant-beds', { operationId });
    
    const gardenId = request.nextUrl.searchParams.get('garden_id');

    let query = supabase
      .from('plant_beds')
      .select('*')
      .order('created_at', { ascending: false });

    if (gardenId) {
      query = query.eq('garden_id', gardenId);
    }

    const { data: plantBeds, error } = await query;

    if (error) {
      // Banking-grade error logging with fallback
      try {
        apiLogger.error('Database error fetching plant beds', error, { operationId, gardenId });
      } catch (logError) {
        // Fallback: If logging fails, still handle the error gracefully
        console.error('Logging failed, original error:', error);
      }
      return NextResponse.json({ error: 'Failed to fetch plant beds' }, { status: 500 });
    }

    apiLogger.info('Plant beds fetched successfully', { 
      operationId, 
      count: plantBeds?.length || 0,
      gardenId 
    });

    return NextResponse.json(plantBeds);
  } catch (error) {
    // Banking-grade error logging with fallback
    try {
      apiLogger.error('API error in plant beds endpoint', error as Error, { operationId });
    } catch (logError) {
      // Fallback: If logging fails, still handle the error gracefully
      console.error('Logging failed, original error:', error);
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}