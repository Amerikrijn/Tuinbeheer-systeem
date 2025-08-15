import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAuthenticationQuick } from '@/lib/api-auth-wrapper';
import { logClientSecurityEvent } from '@/lib/banking-security';
import { 
  UpdatePositionRequest, 
  PlantBedWithPosition, 
  ApiResponse,
  VISUAL_GARDEN_CONSTANTS 
} from '@/lib/supabase';

// ===================================================================
// VALIDATION HELPERS
// ===================================================================

interface PositionRequestData {
  position_x: number;
  position_y: number;
  visual_width?: number;
  visual_height?: number;
  rotation?: number;
  z_index?: number;
  color_code?: string;
}

function validatePositionRequest(data: PositionRequestData): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Required fields
  if (typeof data.position_x !== 'number') {
    errors.push('position_x must be a number');
  }
  if (typeof data.position_y !== 'number') {
    errors.push('position_y must be a number');
  }
  
  // Range validation
  if (data.position_x < 0) {
    errors.push('position_x must be non-negative');
  }
  if (data.position_y < 0) {
    errors.push('position_y must be non-negative');
  }
  
  // Optional fields validation
  if (data.visual_width !== undefined) {
    if (typeof data.visual_width !== 'number' || data.visual_width <= 0) {
      errors.push('visual_width must be a positive number');
    }
    if (data.visual_width > VISUAL_GARDEN_CONSTANTS.MAX_PLANT_BED_SIZE) {
      errors.push(`visual_width cannot exceed ${VISUAL_GARDEN_CONSTANTS.MAX_PLANT_BED_SIZE}`);
    }
  }
  
  if (data.visual_height !== undefined) {
    if (typeof data.visual_height !== 'number' || data.visual_height <= 0) {
      errors.push('visual_height must be a positive number');
    }
    if (data.visual_height > VISUAL_GARDEN_CONSTANTS.MAX_PLANT_BED_SIZE) {
      errors.push(`visual_height cannot exceed ${VISUAL_GARDEN_CONSTANTS.MAX_PLANT_BED_SIZE}`);
    }
  }
  
  if (data.rotation !== undefined) {
    if (typeof data.rotation !== 'number' || data.rotation < -180 || data.rotation > 180) {
      errors.push('rotation must be a number between -180 and 180');
    }
  }
  
  if (data.z_index !== undefined) {
    if (typeof data.z_index !== 'number' || data.z_index < 0) {
      errors.push('z_index must be a non-negative number');
    }
  }
  
  if (data.color_code !== undefined) {
    if (typeof data.color_code !== 'string' || !/^#[0-9A-Fa-f]{6}$/.test(data.color_code)) {
      errors.push('color_code must be a valid hex color (e.g., #22c55e)');
    }
  }
  
  return { isValid: errors.length === 0, errors };
}

// ===================================================================
// COLLISION DETECTION
// ===================================================================

async function checkCollision(
  gardenId: string,
  plantBedId: string,
  position_x: number,
  position_y: number,
  visual_width: number,
  visual_height: number
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .rpc('check_plant_bed_collision', {
        p_garden_id: gardenId,
        p_plant_bed_id: plantBedId,
        p_position_x: position_x,
        p_position_y: position_y,
        p_visual_width: visual_width,
        p_visual_height: visual_height
      });
    
    if (error) {
      // Log error only in development for security
      if (process.env.NODE_ENV === 'development') {
        console.error('Collision check error:', error);
      }
      return false; // Allow movement if check fails
    }
    
    return data === true;
  } catch (error) {
    // Log error only in development for security
    if (process.env.NODE_ENV === 'development') {
      console.error('Collision check exception:', error);
    }
    return false; // Allow movement if check fails
  }
}

// ===================================================================
// CANVAS BOUNDARIES CHECK
// ===================================================================

async function checkCanvasBoundaries(
  gardenId: string,
  position_x: number,
  position_y: number,
  visual_width: number,
  visual_height: number
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .rpc('check_canvas_boundaries', {
        p_garden_id: gardenId,
        p_position_x: position_x,
        p_position_y: position_y,
        p_visual_width: visual_width,
        p_visual_height: visual_height
      });
    
    if (error) {
      // Log error only in development for security
      if (process.env.NODE_ENV === 'development') {
        console.error('Canvas boundaries check error:', error);
      }
      return false;
    }
    
    return data === true;
  } catch (error) {
    // Log error only in development for security
    if (process.env.NODE_ENV === 'development') {
      console.error('Canvas boundaries check exception:', error);
    }
    return false;
  }
}

// ===================================================================
// GET PLANT BED POSITION
// ===================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<PlantBedWithPosition>>> {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json<ApiResponse<PlantBedWithPosition>>({
        data: null,
        error: 'Plant bed ID is required',
        success: false
      }, { status: 400 });
    }
    
    // Get plant bed with position data
    const { data: plantBed, error } = await supabase
      .from('plant_beds')
      .select(`
        *,
        gardens (canvas_width, canvas_height, grid_size)
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      // Log error only in development for security
      if (process.env.NODE_ENV === 'development') {
        console.error('Database error:', error);
      }
      return NextResponse.json<ApiResponse<PlantBedWithPosition>>({
        data: null,
        error: 'Failed to fetch plant bed',
        success: false
      }, { status: 500 });
    }
    
    if (!plantBed) {
      return NextResponse.json<ApiResponse<PlantBedWithPosition>>({
        data: null,
        error: 'Plant bed not found',
        success: false
      }, { status: 404 });
    }
    
    return NextResponse.json<ApiResponse<PlantBedWithPosition>>({
      data: plantBed as PlantBedWithPosition,
      error: null,
      success: true
    });
    
  } catch (error) {
    // Banking-grade error logging with fallback
    try {
      await logClientSecurityEvent('API_POSITION_GET_ERROR', 'HIGH', false, error instanceof Error ? error.message : 'Unknown error');
    } catch (logError) {
      // Fallback: If logging fails, still handle the error gracefully
      // Log error only in development for security
      if (process.env.NODE_ENV === 'development') {
        console.error('Logging failed, original error:', error);
      }
    }
    return NextResponse.json<ApiResponse<PlantBedWithPosition>>({
      data: null,
      error: 'Internal server error',
      success: false
    }, { status: 500 });
  }
}

// ===================================================================
// UPDATE PLANT BED POSITION
// ===================================================================

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<PlantBedWithPosition>>> {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json<ApiResponse<PlantBedWithPosition>>({
        data: null,
        error: 'Plant bed ID is required',
        success: false
      }, { status: 400 });
    }
    
    // Parse request body
    const body = await request.json();
    
    // Validate request data
    const validation = validatePositionRequest(body);
    if (!validation.isValid) {
      return NextResponse.json<ApiResponse<PlantBedWithPosition>>({
        data: null,
        error: `Validation error: ${validation.errors.join(', ')}`,
        success: false
      }, { status: 400 });
    }
    
    // Get current plant bed data
    const { data: currentPlantBed, error: fetchError } = await supabase
      .from('plant_beds')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError || !currentPlantBed) {
      return NextResponse.json<ApiResponse<PlantBedWithPosition>>({
        data: null,
        error: 'Plant bed not found',
        success: false
      }, { status: 404 });
    }
    
    // Prepare update data with current values as defaults
    const updateData: UpdatePositionRequest = {
      position_x: body.position_x,
      position_y: body.position_y,
      visual_width: body.visual_width ?? currentPlantBed.visual_width ?? VISUAL_GARDEN_CONSTANTS.DEFAULT_PLANT_BED_SIZE,
      visual_height: body.visual_height ?? currentPlantBed.visual_height ?? VISUAL_GARDEN_CONSTANTS.DEFAULT_PLANT_BED_SIZE,
      rotation: body.rotation ?? currentPlantBed.rotation ?? 0,
      z_index: body.z_index ?? currentPlantBed.z_index ?? 0,
      color_code: body.color_code ?? currentPlantBed.color_code ?? VISUAL_GARDEN_CONSTANTS.DEFAULT_COLORS.PLANT_BED
    };
    
    // Check canvas boundaries
    const withinBounds = await checkCanvasBoundaries(
      currentPlantBed.garden_id,
      updateData.position_x,
      updateData.position_y,
      updateData.visual_width!,
      updateData.visual_height!
    );
    
    if (!withinBounds) {
      return NextResponse.json<ApiResponse<PlantBedWithPosition>>({
        data: null,
        error: 'Position would be outside canvas boundaries',
        success: false
      }, { status: 400 });
    }
    
    // Check for collisions
    const hasCollision = await checkCollision(
      currentPlantBed.garden_id,
      id,
      updateData.position_x,
      updateData.position_y,
      updateData.visual_width!,
      updateData.visual_height!
    );
    
    if (hasCollision) {
      return NextResponse.json<ApiResponse<PlantBedWithPosition>>({
        data: null,
        error: 'Position would cause collision with another plant bed',
        success: false
      }, { status: 400 });
    }
    
    // Update plant bed position
    const { data: updatedPlantBed, error: updateError } = await supabase
      .from('plant_beds')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();
    
    if (updateError) {
      // Log error only in development for security
      if (process.env.NODE_ENV === 'development') {
        console.error('Database update error:', updateError);
      }
      return NextResponse.json<ApiResponse<PlantBedWithPosition>>({
        data: null,
        error: 'Failed to update plant bed position',
        success: false
      }, { status: 500 });
    }
    
    return NextResponse.json<ApiResponse<PlantBedWithPosition>>({
      data: updatedPlantBed as PlantBedWithPosition,
      error: null,
      success: true
    });
    
  } catch (error) {
    // Log error only in development for security
    if (process.env.NODE_ENV === 'development') {
      console.error('PUT position error:', error);
    }
    return NextResponse.json<ApiResponse<PlantBedWithPosition>>({
      data: null,
      error: 'Internal server error',
      success: false
    }, { status: 500 });
  }
}

// ===================================================================
// PATCH - PARTIAL UPDATE
// ===================================================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<PlantBedWithPosition>>> {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json<ApiResponse<PlantBedWithPosition>>({
        data: null,
        error: 'Plant bed ID is required',
        success: false
      }, { status: 400 });
    }
    
    // Parse request body
    const body = await request.json();
    
    // For PATCH, we only validate provided fields
    const partialValidation = validatePositionRequest({ 
      position_x: body.position_x ?? 0,
      position_y: body.position_y ?? 0,
      ...body
    });
    
    if (!partialValidation.isValid) {
      return NextResponse.json<ApiResponse<PlantBedWithPosition>>({
        data: null,
        error: `Validation error: ${partialValidation.errors.join(', ')}`,
        success: false
      }, { status: 400 });
    }
    
    // Get current plant bed data
    const { data: currentPlantBed, error: fetchError } = await supabase
      .from('plant_beds')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError || !currentPlantBed) {
      return NextResponse.json<ApiResponse<PlantBedWithPosition>>({
        data: null,
        error: 'Plant bed not found',
        success: false
      }, { status: 404 });
    }
    
    // Build update object with only provided fields
    const updateData: Partial<UpdatePositionRequest> = {};
    
    if (body.position_x !== undefined) updateData.position_x = body.position_x;
    if (body.position_y !== undefined) updateData.position_y = body.position_y;
    if (body.visual_width !== undefined) updateData.visual_width = body.visual_width;
    if (body.visual_height !== undefined) updateData.visual_height = body.visual_height;
    if (body.rotation !== undefined) updateData.rotation = body.rotation;
    if (body.z_index !== undefined) updateData.z_index = body.z_index;
    if (body.color_code !== undefined) updateData.color_code = body.color_code;
    
    // If position or size changed, check constraints
    if (updateData.position_x !== undefined || updateData.position_y !== undefined || 
        updateData.visual_width !== undefined || updateData.visual_height !== undefined) {
      
      const newPosition = {
        x: updateData.position_x ?? currentPlantBed.position_x ?? 0,
        y: updateData.position_y ?? currentPlantBed.position_y ?? 0,
        width: updateData.visual_width ?? currentPlantBed.visual_width ?? VISUAL_GARDEN_CONSTANTS.DEFAULT_PLANT_BED_SIZE,
        height: updateData.visual_height ?? currentPlantBed.visual_height ?? VISUAL_GARDEN_CONSTANTS.DEFAULT_PLANT_BED_SIZE
      };
      
      // Check canvas boundaries
      const withinBounds = await checkCanvasBoundaries(
        currentPlantBed.garden_id,
        newPosition.x,
        newPosition.y,
        newPosition.width,
        newPosition.height
      );
      
      if (!withinBounds) {
        return NextResponse.json<ApiResponse<PlantBedWithPosition>>({
          data: null,
          error: 'Position would be outside canvas boundaries',
          success: false
        }, { status: 400 });
      }
      
      // Check for collisions
      const hasCollision = await checkCollision(
        currentPlantBed.garden_id,
        id,
        newPosition.x,
        newPosition.y,
        newPosition.width,
        newPosition.height
      );
      
      if (hasCollision) {
        return NextResponse.json<ApiResponse<PlantBedWithPosition>>({
          data: null,
          error: 'Position would cause collision with another plant bed',
          success: false
        }, { status: 400 });
      }
    }
    
    // Update plant bed
    const { data: updatedPlantBed, error: updateError } = await supabase
      .from('plant_beds')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();
    
    if (updateError) {
      // Log error only in development for security
      if (process.env.NODE_ENV === 'development') {
        console.error('Database update error:', updateError);
      }
      return NextResponse.json<ApiResponse<PlantBedWithPosition>>({
        data: null,
        error: 'Failed to update plant bed position',
        success: false
      }, { status: 500 });
    }
    
    return NextResponse.json<ApiResponse<PlantBedWithPosition>>({
      data: updatedPlantBed as PlantBedWithPosition,
      error: null,
      success: true
    });
    
  } catch (error) {
    // Log error only in development for security
    if (process.env.NODE_ENV === 'development') {
      console.error('PATCH position error:', error);
    }
    return NextResponse.json<ApiResponse<PlantBedWithPosition>>({
      data: null,
      error: 'Internal server error',
      success: false
    }, { status: 500 });
  }
}