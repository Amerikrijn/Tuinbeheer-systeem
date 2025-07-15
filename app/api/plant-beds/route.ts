import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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
    name: 'Bloemenveld Zuid',
    garden_id: 'garden-1',
    location: 'Zuidkant',
    size: '3x2 meter',
    soil_type: 'Zand',
    sun_exposure: 'Halfschaduw',
    description: 'Plantvak voor bloemen',
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
  try {
    const { data: plantBeds, error } = await supabase
      .from('plant_beds')
      .select(`
        *,
        gardens (
          id,
          name
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      // Return mock data as fallback
      return NextResponse.json(mockPlantBeds);
    }

    return NextResponse.json(plantBeds);
  } catch (error) {
    console.error('API error:', error);
    // Return mock data as fallback
    return NextResponse.json(mockPlantBeds);
  }
}