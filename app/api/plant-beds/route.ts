import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { apiLogger } from '@/lib/logger';
import { z } from 'zod';
import { rateLimit } from '@/lib/security/rateLimit';
import { checkIdempotency, markIdempotencyCompleted, markIdempotencyFailed } from '@/lib/http/idempotency';

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
  const operationId = `plant-beds-get-${Date.now()}`;
  
  try {
    apiLogger.info('GET /api/plant-beds', { operationId });
    
    const { searchParams } = new URL(request.url);
    const gardenId = searchParams.get('garden_id');

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

// Zod schema for plant bed creation
const plantBedSchema = z.object({
  garden_id: z.string().uuid(),
  name: z.string().min(1).max(80),
  width_cm: z.number().int().positive().max(2000),
  length_cm: z.number().int().positive().max(2000),
  location: z.string().min(1).max(100).optional(),
  soil_type: z.string().min(1).max(50).optional(),
  sun_exposure: z.string().min(1).max(50).optional(),
  description: z.string().max(500).optional(),
})

/**
 * POST /api/plant-beds
 * Create a new plant bed with Zod validation
 */
export async function POST(request: NextRequest) {
  const operationId = `plant-beds-post-${Date.now()}`;
  let idempotencyKey: string | undefined;
  
  try {
    // Rate limiting for mutations
    await rateLimit(request, { key: 'plant-beds:post', limit: 20, windowSec: 60 })
    
    // Check idempotency
    const idempotency = await checkIdempotency(request)
    idempotencyKey = idempotency.key
    
    if (!idempotency.shouldProcess) {
      // Return cached result
      return NextResponse.json(idempotency.existingResult, { status: 200 })
    }
    
    apiLogger.info('POST /api/plant-beds', { operationId, idempotencyKey });
    
    // Parse request body
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    // Zod validation - whitelist approach
    const parsed = plantBedSchema.safeParse(body)
    if (!parsed.success) {
      apiLogger.warn('Plant bed validation failed', { 
        operationId, 
        errors: parsed.error.errors 
      });
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }
    
    const data = parsed.data // Only use whitelisted data

    // TODO: Add authentication check here
    // TODO: Add garden membership check for data.garden_id
    
    // Insert into database using only validated data
    const { data: plantBed, error } = await supabase
      .from('plant_beds')
      .insert({
        garden_id: data.garden_id,
        name: data.name,
        width_cm: data.width_cm,
        length_cm: data.length_cm,
        location: data.location,
        soil_type: data.soil_type,
        sun_exposure: data.sun_exposure,
        description: data.description,
      })
      .select()
      .single()

    if (error) {
      apiLogger.error('Database error creating plant bed', error, { operationId });
      return NextResponse.json({ error: 'Could not create plant bed' }, { status: 400 });
    }

    apiLogger.info('Plant bed created successfully', { 
      operationId, 
      plantBedId: plantBed.id,
      idempotencyKey
    });

    // Mark idempotency as completed
    if (idempotencyKey) {
      markIdempotencyCompleted(idempotencyKey, plantBed)
    }

    return NextResponse.json(plantBed, { status: 201 });
    
  } catch (error) {
    // Mark idempotency as failed
    if (idempotencyKey) {
      markIdempotencyFailed(idempotencyKey)
    }
    
    apiLogger.error('Unexpected error in POST /api/plant-beds', error as Error, { operationId, idempotencyKey });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}