import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: gardenId } = params;

    if (!gardenId) {
      return NextResponse.json({ error: 'Garden ID is required' }, { status: 400 });
    }

    const { data: plantBeds, error } = await supabase
      .from('plant_beds')
      .select('*')
      .eq('garden_id', gardenId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch plant beds' }, { status: 500 });
    }

    return NextResponse.json(plantBeds);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}