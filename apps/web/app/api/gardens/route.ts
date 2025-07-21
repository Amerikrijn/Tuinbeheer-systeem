import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Mock data for development/testing
const mockGardens = [
  {
    id: 'garden-1',
    name: 'Gemeenschapstuin Noord',
    location: 'Noordkant van de stad',
    description: 'Een mooie gemeenschapstuin',
    width: 50,
    height: 30,
    soil_type: 'Klei',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_active: true
  },
  {
    id: 'garden-2',
    name: 'Schooltuin Oost',
    location: 'Bij de basisschool',
    description: 'Educatieve tuin voor kinderen',
    width: 30,
    height: 20,
    soil_type: 'Zand',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_active: true
  }
];

export async function GET(request: NextRequest) {
  try {
    const { data: gardens, error } = await supabase
      .from('gardens')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      // Return mock data as fallback
      return NextResponse.json(mockGardens);
    }

    return NextResponse.json(gardens);
  } catch (error) {
    console.error('API error:', error);
    // Return mock data as fallback
    return NextResponse.json(mockGardens);
  }
}