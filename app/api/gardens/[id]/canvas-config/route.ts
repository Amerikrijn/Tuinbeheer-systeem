import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { 
  CanvasConfig, 
  UpdateCanvasConfigRequest, 
  ApiResponse,
  VISUAL_GARDEN_CONSTANTS 
} from '@/lib/supabase';

// ===================================================================
// VALIDATION HELPERS
// ===================================================================

function validateCanvasConfig(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Canvas width validation
  if (data.canvas_width !== undefined) {
    if (typeof data.canvas_width !== 'number' || data.canvas_width <= 0) {
      errors.push('canvas_width must be a positive number');
    }
    if (data.canvas_width < VISUAL_GARDEN_CONSTANTS.MIN_CANVAS_WIDTH || 
        data.canvas_width > VISUAL_GARDEN_CONSTANTS.MAX_CANVAS_WIDTH) {
      errors.push(`canvas_width must be between ${VISUAL_GARDEN_CONSTANTS.MIN_CANVAS_WIDTH} and ${VISUAL_GARDEN_CONSTANTS.MAX_CANVAS_WIDTH}`);
    }
  }
  
  // Canvas height validation
  if (data.canvas_height !== undefined) {
    if (typeof data.canvas_height !== 'number' || data.canvas_height <= 0) {
      errors.push('canvas_height must be a positive number');
    }
    if (data.canvas_height < VISUAL_GARDEN_CONSTANTS.MIN_CANVAS_HEIGHT || 
        data.canvas_height > VISUAL_GARDEN_CONSTANTS.MAX_CANVAS_HEIGHT) {
      errors.push(`canvas_height must be between ${VISUAL_GARDEN_CONSTANTS.MIN_CANVAS_HEIGHT} and ${VISUAL_GARDEN_CONSTANTS.MAX_CANVAS_HEIGHT}`);
    }
  }
  
  // Grid size validation
  if (data.grid_size !== undefined) {
    if (typeof data.grid_size !== 'number' || data.grid_size <= 0) {
      errors.push('grid_size must be a positive number');
    }
    if (data.grid_size < VISUAL_GARDEN_CONSTANTS.MIN_GRID_SIZE || 
        data.grid_size > VISUAL_GARDEN_CONSTANTS.MAX_GRID_SIZE) {
      errors.push(`grid_size must be between ${VISUAL_GARDEN_CONSTANTS.MIN_GRID_SIZE} and ${VISUAL_GARDEN_CONSTANTS.MAX_GRID_SIZE}`);
    }
  }
  
  // Default zoom validation
  if (data.default_zoom !== undefined) {
    if (typeof data.default_zoom !== 'number' || data.default_zoom <= 0) {
      errors.push('default_zoom must be a positive number');
    }
    if (data.default_zoom < VISUAL_GARDEN_CONSTANTS.MIN_ZOOM || 
        data.default_zoom > VISUAL_GARDEN_CONSTANTS.MAX_ZOOM) {
      errors.push(`default_zoom must be between ${VISUAL_GARDEN_CONSTANTS.MIN_ZOOM} and ${VISUAL_GARDEN_CONSTANTS.MAX_ZOOM}`);
    }
  }
  
  // Boolean validations
  if (data.show_grid !== undefined && typeof data.show_grid !== 'boolean') {
    errors.push('show_grid must be a boolean');
  }
  
  if (data.snap_to_grid !== undefined && typeof data.snap_to_grid !== 'boolean') {
    errors.push('snap_to_grid must be a boolean');
  }
  
  // Background color validation
  if (data.background_color !== undefined) {
    if (typeof data.background_color !== 'string' || 
        !/^#[0-9A-Fa-f]{6}$/.test(data.background_color)) {
      errors.push('background_color must be a valid hex color (e.g., #f8fafc)');
    }
  }
  
  return { isValid: errors.length === 0, errors };
}

// ===================================================================
// CHECK CANVAS RESIZE IMPACT
// ===================================================================

async function checkCanvasResizeImpact(
  gardenId: string,
  newCanvasWidth: number,
  newCanvasHeight: number
): Promise<{ hasImpact: boolean; affectedPlantBeds: string[] }> {
  const affectedPlantBeds: string[] = [];
  
  try {
    // Get all plant beds in the garden
    const { data: plantBeds, error } = await supabase
      .from('plant_beds')
      .select('id, name, position_x, position_y, visual_width, visual_height')
      .eq('garden_id', gardenId);
    
    if (error) {
      console.error('Error checking canvas resize impact:', error);
      return { hasImpact: false, affectedPlantBeds: [] };
    }
    
    // Check which plant beds would be outside the new canvas
    plantBeds?.forEach(pb => {
      const rightEdge = (pb.position_x ?? 0) + (pb.visual_width ?? VISUAL_GARDEN_CONSTANTS.DEFAULT_PLANT_BED_SIZE);
      const bottomEdge = (pb.position_y ?? 0) + (pb.visual_height ?? VISUAL_GARDEN_CONSTANTS.DEFAULT_PLANT_BED_SIZE);
      
      if (rightEdge > newCanvasWidth || bottomEdge > newCanvasHeight) {
        affectedPlantBeds.push(pb.name || pb.id);
      }
    });
    
    return { 
      hasImpact: affectedPlantBeds.length > 0, 
      affectedPlantBeds 
    };
    
  } catch (error) {
    console.error('Canvas resize impact check error:', error);
    return { hasImpact: false, affectedPlantBeds: [] };
  }
}

// ===================================================================
// GET CANVAS CONFIGURATION
// ===================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<CanvasConfig>>> {
  try {
    const { id: gardenId } = params;
    
    if (!gardenId) {
      return NextResponse.json<ApiResponse<CanvasConfig>>({
        data: null,
        error: 'Garden ID is required',
        success: false
      }, { status: 400 });
    }
    
    // Get garden canvas configuration
    const { data: garden, error } = await supabase
      .from('gardens')
      .select('canvas_width, canvas_height, grid_size, default_zoom, show_grid, snap_to_grid, background_color')
      .eq('id', gardenId)
      .single();
    
    if (error) {
      console.error('Database error:', error);
      return NextResponse.json<ApiResponse<CanvasConfig>>({
        data: null,
        error: 'Failed to fetch garden canvas configuration',
        success: false
      }, { status: 500 });
    }
    
    if (!garden) {
      return NextResponse.json<ApiResponse<CanvasConfig>>({
        data: null,
        error: 'Garden not found',
        success: false
      }, { status: 404 });
    }
    
    // Return canvas configuration with defaults
    const canvasConfig: CanvasConfig = {
      canvas_width: garden.canvas_width ?? VISUAL_GARDEN_CONSTANTS.DEFAULT_CANVAS_WIDTH,
      canvas_height: garden.canvas_height ?? VISUAL_GARDEN_CONSTANTS.DEFAULT_CANVAS_HEIGHT,
      grid_size: garden.grid_size ?? VISUAL_GARDEN_CONSTANTS.DEFAULT_GRID_SIZE,
      default_zoom: garden.default_zoom ?? VISUAL_GARDEN_CONSTANTS.DEFAULT_ZOOM,
      show_grid: garden.show_grid ?? true,
      snap_to_grid: garden.snap_to_grid ?? true,
      background_color: garden.background_color ?? VISUAL_GARDEN_CONSTANTS.DEFAULT_COLORS.BACKGROUND
    };
    
    return NextResponse.json<ApiResponse<CanvasConfig>>({
      data: canvasConfig,
      error: null,
      success: true
    });
    
  } catch (error) {
    console.error('GET canvas config error:', error);
    return NextResponse.json<ApiResponse<CanvasConfig>>({
      data: null,
      error: 'Internal server error',
      success: false
    }, { status: 500 });
  }
}

// ===================================================================
// UPDATE CANVAS CONFIGURATION
// ===================================================================

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<CanvasConfig>>> {
  try {
    const { id: gardenId } = params;
    
    if (!gardenId) {
      return NextResponse.json<ApiResponse<CanvasConfig>>({
        data: null,
        error: 'Garden ID is required',
        success: false
      }, { status: 400 });
    }
    
    // Parse request body
    const body = await request.json();
    
    // Validate request data
    const validation = validateCanvasConfig(body);
    if (!validation.isValid) {
      return NextResponse.json<ApiResponse<CanvasConfig>>({
        data: null,
        error: `Validation error: ${validation.errors.join(', ')}`,
        success: false
      }, { status: 400 });
    }
    
    // Check if garden exists
    const { data: existingGarden, error: fetchError } = await supabase
      .from('gardens')
      .select('id, canvas_width, canvas_height')
      .eq('id', gardenId)
      .single();
    
    if (fetchError || !existingGarden) {
      return NextResponse.json<ApiResponse<CanvasConfig>>({
        data: null,
        error: 'Garden not found',
        success: false
      }, { status: 404 });
    }
    
    // Check canvas resize impact if dimensions are changing
    if (body.canvas_width !== undefined || body.canvas_height !== undefined) {
      const newWidth = body.canvas_width ?? existingGarden.canvas_width ?? VISUAL_GARDEN_CONSTANTS.DEFAULT_CANVAS_WIDTH;
      const newHeight = body.canvas_height ?? existingGarden.canvas_height ?? VISUAL_GARDEN_CONSTANTS.DEFAULT_CANVAS_HEIGHT;
      
      const impact = await checkCanvasResizeImpact(gardenId, newWidth, newHeight);
      
      if (impact.hasImpact) {
        return NextResponse.json<ApiResponse<CanvasConfig>>({
          data: null,
          error: `Canvas resize would affect plant beds: ${impact.affectedPlantBeds.join(', ')}. Please move or resize these plant beds first.`,
          success: false
        }, { status: 400 });
      }
    }
    
    // Prepare update data
    const updateData: UpdateCanvasConfigRequest = {
      canvas_width: body.canvas_width,
      canvas_height: body.canvas_height,
      grid_size: body.grid_size,
      default_zoom: body.default_zoom,
      show_grid: body.show_grid,
      snap_to_grid: body.snap_to_grid,
      background_color: body.background_color
    };
    
    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key as keyof UpdateCanvasConfigRequest] === undefined) {
        delete updateData[key as keyof UpdateCanvasConfigRequest];
      }
    });
    
    // Update garden canvas configuration
    const { data: updatedGarden, error: updateError } = await supabase
      .from('gardens')
      .update(updateData)
      .eq('id', gardenId)
      .select('canvas_width, canvas_height, grid_size, default_zoom, show_grid, snap_to_grid, background_color')
      .single();
    
    if (updateError) {
      console.error('Database update error:', updateError);
      return NextResponse.json<ApiResponse<CanvasConfig>>({
        data: null,
        error: 'Failed to update canvas configuration',
        success: false
      }, { status: 500 });
    }
    
    // Return updated configuration with defaults
    const canvasConfig: CanvasConfig = {
      canvas_width: updatedGarden.canvas_width ?? VISUAL_GARDEN_CONSTANTS.DEFAULT_CANVAS_WIDTH,
      canvas_height: updatedGarden.canvas_height ?? VISUAL_GARDEN_CONSTANTS.DEFAULT_CANVAS_HEIGHT,
      grid_size: updatedGarden.grid_size ?? VISUAL_GARDEN_CONSTANTS.DEFAULT_GRID_SIZE,
      default_zoom: updatedGarden.default_zoom ?? VISUAL_GARDEN_CONSTANTS.DEFAULT_ZOOM,
      show_grid: updatedGarden.show_grid ?? true,
      snap_to_grid: updatedGarden.snap_to_grid ?? true,
      background_color: updatedGarden.background_color ?? VISUAL_GARDEN_CONSTANTS.DEFAULT_COLORS.BACKGROUND
    };
    
    return NextResponse.json<ApiResponse<CanvasConfig>>({
      data: canvasConfig,
      error: null,
      success: true
    });
    
  } catch (error) {
    console.error('PUT canvas config error:', error);
    return NextResponse.json<ApiResponse<CanvasConfig>>({
      data: null,
      error: 'Internal server error',
      success: false
    }, { status: 500 });
  }
}

// ===================================================================
// PARTIAL UPDATE CANVAS CONFIGURATION
// ===================================================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<CanvasConfig>>> {
  try {
    const { id: gardenId } = params;
    
    if (!gardenId) {
      return NextResponse.json<ApiResponse<CanvasConfig>>({
        data: null,
        error: 'Garden ID is required',
        success: false
      }, { status: 400 });
    }
    
    // Parse request body
    const body = await request.json();
    
    // Validate request data
    const validation = validateCanvasConfig(body);
    if (!validation.isValid) {
      return NextResponse.json<ApiResponse<CanvasConfig>>({
        data: null,
        error: `Validation error: ${validation.errors.join(', ')}`,
        success: false
      }, { status: 400 });
    }
    
    // Check if garden exists and get current configuration
    const { data: existingGarden, error: fetchError } = await supabase
      .from('gardens')
      .select('canvas_width, canvas_height, grid_size, default_zoom, show_grid, snap_to_grid, background_color')
      .eq('id', gardenId)
      .single();
    
    if (fetchError || !existingGarden) {
      return NextResponse.json<ApiResponse<CanvasConfig>>({
        data: null,
        error: 'Garden not found',
        success: false
      }, { status: 404 });
    }
    
    // Check canvas resize impact if dimensions are changing
    if (body.canvas_width !== undefined || body.canvas_height !== undefined) {
      const newWidth = body.canvas_width ?? existingGarden.canvas_width ?? VISUAL_GARDEN_CONSTANTS.DEFAULT_CANVAS_WIDTH;
      const newHeight = body.canvas_height ?? existingGarden.canvas_height ?? VISUAL_GARDEN_CONSTANTS.DEFAULT_CANVAS_HEIGHT;
      
      const impact = await checkCanvasResizeImpact(gardenId, newWidth, newHeight);
      
      if (impact.hasImpact) {
        return NextResponse.json<ApiResponse<CanvasConfig>>({
          data: null,
          error: `Canvas resize would affect plant beds: ${impact.affectedPlantBeds.join(', ')}. Please move or resize these plant beds first.`,
          success: false
        }, { status: 400 });
      }
    }
    
    // Build update object with only provided fields
    const updateData: Partial<UpdateCanvasConfigRequest> = {};
    
    if (body.canvas_width !== undefined) updateData.canvas_width = body.canvas_width;
    if (body.canvas_height !== undefined) updateData.canvas_height = body.canvas_height;
    if (body.grid_size !== undefined) updateData.grid_size = body.grid_size;
    if (body.default_zoom !== undefined) updateData.default_zoom = body.default_zoom;
    if (body.show_grid !== undefined) updateData.show_grid = body.show_grid;
    if (body.snap_to_grid !== undefined) updateData.snap_to_grid = body.snap_to_grid;
    if (body.background_color !== undefined) updateData.background_color = body.background_color;
    
    // If no fields to update, return current configuration
    if (Object.keys(updateData).length === 0) {
      const canvasConfig: CanvasConfig = {
        canvas_width: existingGarden.canvas_width ?? VISUAL_GARDEN_CONSTANTS.DEFAULT_CANVAS_WIDTH,
        canvas_height: existingGarden.canvas_height ?? VISUAL_GARDEN_CONSTANTS.DEFAULT_CANVAS_HEIGHT,
        grid_size: existingGarden.grid_size ?? VISUAL_GARDEN_CONSTANTS.DEFAULT_GRID_SIZE,
        default_zoom: existingGarden.default_zoom ?? VISUAL_GARDEN_CONSTANTS.DEFAULT_ZOOM,
        show_grid: existingGarden.show_grid ?? true,
        snap_to_grid: existingGarden.snap_to_grid ?? true,
        background_color: existingGarden.background_color ?? VISUAL_GARDEN_CONSTANTS.DEFAULT_COLORS.BACKGROUND
      };
      
      return NextResponse.json<ApiResponse<CanvasConfig>>({
        data: canvasConfig,
        error: null,
        success: true
      });
    }
    
    // Update garden canvas configuration
    const { data: updatedGarden, error: updateError } = await supabase
      .from('gardens')
      .update(updateData)
      .eq('id', gardenId)
      .select('canvas_width, canvas_height, grid_size, default_zoom, show_grid, snap_to_grid, background_color')
      .single();
    
    if (updateError) {
      console.error('Database update error:', updateError);
      return NextResponse.json<ApiResponse<CanvasConfig>>({
        data: null,
        error: 'Failed to update canvas configuration',
        success: false
      }, { status: 500 });
    }
    
    // Return updated configuration with defaults
    const canvasConfig: CanvasConfig = {
      canvas_width: updatedGarden.canvas_width ?? VISUAL_GARDEN_CONSTANTS.DEFAULT_CANVAS_WIDTH,
      canvas_height: updatedGarden.canvas_height ?? VISUAL_GARDEN_CONSTANTS.DEFAULT_CANVAS_HEIGHT,
      grid_size: updatedGarden.grid_size ?? VISUAL_GARDEN_CONSTANTS.DEFAULT_GRID_SIZE,
      default_zoom: updatedGarden.default_zoom ?? VISUAL_GARDEN_CONSTANTS.DEFAULT_ZOOM,
      show_grid: updatedGarden.show_grid ?? true,
      snap_to_grid: updatedGarden.snap_to_grid ?? true,
      background_color: updatedGarden.background_color ?? VISUAL_GARDEN_CONSTANTS.DEFAULT_COLORS.BACKGROUND
    };
    
    return NextResponse.json<ApiResponse<CanvasConfig>>({
      data: canvasConfig,
      error: null,
      success: true
    });
    
  } catch (error) {
    console.error('PATCH canvas config error:', error);
    return NextResponse.json<ApiResponse<CanvasConfig>>({
      data: null,
      error: 'Internal server error',
      success: false
    }, { status: 500 });
  }
}

// ===================================================================
// RESET CANVAS CONFIGURATION TO DEFAULTS
// ===================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<CanvasConfig>>> {
  try {
    const { id: gardenId } = params;
    
    if (!gardenId) {
      return NextResponse.json<ApiResponse<CanvasConfig>>({
        data: null,
        error: 'Garden ID is required',
        success: false
      }, { status: 400 });
    }
    
    // Check if garden exists
    const { data: existingGarden, error: fetchError } = await supabase
      .from('gardens')
      .select('id')
      .eq('id', gardenId)
      .single();
    
    if (fetchError || !existingGarden) {
      return NextResponse.json<ApiResponse<CanvasConfig>>({
        data: null,
        error: 'Garden not found',
        success: false
      }, { status: 404 });
    }
    
    // Reset to default values
    const defaultConfig: UpdateCanvasConfigRequest = {
      canvas_width: VISUAL_GARDEN_CONSTANTS.DEFAULT_CANVAS_WIDTH,
      canvas_height: VISUAL_GARDEN_CONSTANTS.DEFAULT_CANVAS_HEIGHT,
      grid_size: VISUAL_GARDEN_CONSTANTS.DEFAULT_GRID_SIZE,
      default_zoom: VISUAL_GARDEN_CONSTANTS.DEFAULT_ZOOM,
      show_grid: true,
      snap_to_grid: true,
      background_color: VISUAL_GARDEN_CONSTANTS.DEFAULT_COLORS.BACKGROUND
    };
    
    // Check if default canvas size would affect existing plant beds
    const impact = await checkCanvasResizeImpact(
      gardenId, 
      defaultConfig.canvas_width!, 
      defaultConfig.canvas_height!
    );
    
    if (impact.hasImpact) {
      return NextResponse.json<ApiResponse<CanvasConfig>>({
        data: null,
        error: `Cannot reset canvas to default size. This would affect plant beds: ${impact.affectedPlantBeds.join(', ')}. Please move or resize these plant beds first.`,
        success: false
      }, { status: 400 });
    }
    
    // Update garden with default configuration
    const { data: updatedGarden, error: updateError } = await supabase
      .from('gardens')
      .update(defaultConfig)
      .eq('id', gardenId)
      .select('canvas_width, canvas_height, grid_size, default_zoom, show_grid, snap_to_grid, background_color')
      .single();
    
    if (updateError) {
      console.error('Database update error:', updateError);
      return NextResponse.json<ApiResponse<CanvasConfig>>({
        data: null,
        error: 'Failed to reset canvas configuration',
        success: false
      }, { status: 500 });
    }
    
    // Return reset configuration
    const canvasConfig: CanvasConfig = {
      canvas_width: updatedGarden.canvas_width ?? VISUAL_GARDEN_CONSTANTS.DEFAULT_CANVAS_WIDTH,
      canvas_height: updatedGarden.canvas_height ?? VISUAL_GARDEN_CONSTANTS.DEFAULT_CANVAS_HEIGHT,
      grid_size: updatedGarden.grid_size ?? VISUAL_GARDEN_CONSTANTS.DEFAULT_GRID_SIZE,
      default_zoom: updatedGarden.default_zoom ?? VISUAL_GARDEN_CONSTANTS.DEFAULT_ZOOM,
      show_grid: updatedGarden.show_grid ?? true,
      snap_to_grid: updatedGarden.snap_to_grid ?? true,
      background_color: updatedGarden.background_color ?? VISUAL_GARDEN_CONSTANTS.DEFAULT_COLORS.BACKGROUND
    };
    
    return NextResponse.json<ApiResponse<CanvasConfig>>({
      data: canvasConfig,
      error: null,
      success: true
    });
    
  } catch (error) {
    console.error('DELETE canvas config error:', error);
    return NextResponse.json<ApiResponse<CanvasConfig>>({
      data: null,
      error: 'Internal server error',
      success: false
    }, { status: 500 });
  }
}