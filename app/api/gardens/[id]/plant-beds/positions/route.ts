import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase';
import { 
  BulkUpdatePositionsRequest, 
  PlantBedWithPosition, 
  ApiResponse,
  VISUAL_GARDEN_CONSTANTS 
} from '@/lib/supabase';

// Only check environment variables in production, not during build
const checkEnvironment = () => {
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error('SECURITY ERROR: Missing Supabase environment variables for production. Required: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY')
    }
  }
}

// ===================================================================
// VALIDATION HELPERS
// ===================================================================

function validateBulkPositionRequest(data: unknown): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check if positions array exists
  if (!data.positions || !Array.isArray(data.positions)) {
    errors.push('positions must be an array');
    return { isValid: false, errors };
  }
  
  // Check if array is not empty
  if (data.positions.length === 0) {
    errors.push('positions array cannot be empty');
    return { isValid: false, errors };
  }
  
  // Check if array is not too large
  if (data.positions.length > 100) {
    errors.push('positions array cannot have more than 100 items');
    return { isValid: false, errors };
  }
  
  // Validate each position
  data.positions.forEach((position: unknown, index: number) => {
    const prefix = `positions[${index}]`;
    
    // Required fields
    if (!position.id || typeof position.id !== 'string') {
      errors.push(`${prefix}.id is required and must be a string`);
    }
    
    if (typeof position.position_x !== 'number') {
      errors.push(`${prefix}.position_x must be a number`);
    }
    
    if (typeof position.position_y !== 'number') {
      errors.push(`${prefix}.position_y must be a number`);
    }
    
    // Range validation
    if (position.position_x < 0) {
      errors.push(`${prefix}.position_x must be non-negative`);
    }
    
    if (position.position_y < 0) {
      errors.push(`${prefix}.position_y must be non-negative`);
    }
    
    // Optional fields validation
    if (position.visual_width !== undefined) {
      if (typeof position.visual_width !== 'number' || position.visual_width <= 0) {
        errors.push(`${prefix}.visual_width must be a positive number`);
      }
      if (position.visual_width > VISUAL_GARDEN_CONSTANTS.MAX_PLANT_BED_SIZE) {
        errors.push(`${prefix}.visual_width cannot exceed ${VISUAL_GARDEN_CONSTANTS.MAX_PLANT_BED_SIZE}`);
      }
    }
    
    if (position.visual_height !== undefined) {
      if (typeof position.visual_height !== 'number' || position.visual_height <= 0) {
        errors.push(`${prefix}.visual_height must be a positive number`);
      }
      if (position.visual_height > VISUAL_GARDEN_CONSTANTS.MAX_PLANT_BED_SIZE) {
        errors.push(`${prefix}.visual_height cannot exceed ${VISUAL_GARDEN_CONSTANTS.MAX_PLANT_BED_SIZE}`);
      }
    }
    
    if (position.rotation !== undefined) {
      if (typeof position.rotation !== 'number' || position.rotation < -180 || position.rotation > 180) {
        errors.push(`${prefix}.rotation must be a number between -180 and 180`);
      }
    }
    
    if (position.z_index !== undefined) {
      if (typeof position.z_index !== 'number' || position.z_index < 0) {
        errors.push(`${prefix}.z_index must be a non-negative number`);
      }
    }
    
    if (position.color_code !== undefined) {
      if (typeof position.color_code !== 'string' || !/^#[0-9A-Fa-f]{6}$/.test(position.color_code)) {
        errors.push(`${prefix}.color_code must be a valid hex color (e.g., #22c55e)`);
      }
    }
  });
  
  return { isValid: errors.length === 0, errors };
}

// ===================================================================
// COLLISION DETECTION FOR BULK UPDATE
// ===================================================================

async function checkBulkCollisions(
  gardenId: string,
  positions: BulkUpdatePositionsRequest['positions']
): Promise<{ hasCollision: boolean; conflicts: string[] }> {
  const conflicts: string[] = [];
  
  try {
    // Get all current plant beds in the garden
    const { data: currentPlantBeds, error } = await supabase
      .from('plant_beds')
      .select('id, position_x, position_y, visual_width, visual_height')
      .eq('garden_id', gardenId);
    
    if (error) {
      console.error('Error fetching current plant beds:', error);
      return { hasCollision: false, conflicts: [] };
    }
    
    // Create a map of current positions for quick lookup
    const currentPositions = new Map();
    currentPlantBeds?.forEach(pb => {
      currentPositions.set(pb.id, {
        x: pb.position_x ?? 0,
        y: pb.position_y ?? 0,
        width: pb.visual_width ?? VISUAL_GARDEN_CONSTANTS.DEFAULT_PLANT_BED_SIZE,
        height: pb.visual_height ?? VISUAL_GARDEN_CONSTANTS.DEFAULT_PLANT_BED_SIZE
      });
    });
    
    // Update positions with new values
    positions.forEach(pos => {
      const currentPos = currentPositions.get(pos.id);
      if (currentPos) {
        currentPositions.set(pos.id, {
          x: pos.position_x,
          y: pos.position_y,
          width: pos.visual_width ?? currentPos.width,
          height: pos.visual_height ?? currentPos.height
        });
      }
    });
    
    // Check for overlaps
    const positionArray = Array.from(currentPositions.entries());
    
    for (let i = 0; i < positionArray.length; i++) {
      for (let j = i + 1; j < positionArray.length; j++) {
        const [id1, pos1] = positionArray[i];
        const [id2, pos2] = positionArray[j];
        
        // Check if rectangles overlap
        if (pos1.x < pos2.x + pos2.width &&
            pos1.x + pos1.width > pos2.x &&
            pos1.y < pos2.y + pos2.height &&
            pos1.y + pos1.height > pos2.y) {
          conflicts.push(`Plant beds ${id1} and ${id2} would overlap`);
        }
      }
    }
    
    return { hasCollision: conflicts.length > 0, conflicts };
    
  } catch (error) {
    console.error('Bulk collision check error:', error);
    return { hasCollision: false, conflicts: [] };
  }
}

// ===================================================================
// CANVAS BOUNDARIES CHECK FOR BULK UPDATE
// ===================================================================

async function checkBulkCanvasBoundaries(
  gardenId: string,
  positions: BulkUpdatePositionsRequest['positions']
): Promise<{ allWithinBounds: boolean; violations: string[] }> {
  const violations: string[] = [];
  
  try {
    // Get garden canvas size
    const { data: garden, error } = await supabase
      .from('gardens')
      .select('canvas_width, canvas_height')
      .eq('id', gardenId)
      .single();
    
    if (error || !garden) {
      console.error('Error fetching garden:', error);
      return { allWithinBounds: false, violations: ['Garden not found'] };
    }
    
    const canvasWidth = garden.canvas_width ?? VISUAL_GARDEN_CONSTANTS.DEFAULT_CANVAS_WIDTH;
    const canvasHeight = garden.canvas_height ?? VISUAL_GARDEN_CONSTANTS.DEFAULT_CANVAS_HEIGHT;
    
    // Check each position
    positions.forEach(pos => {
      const width = pos.visual_width ?? VISUAL_GARDEN_CONSTANTS.DEFAULT_PLANT_BED_SIZE;
      const height = pos.visual_height ?? VISUAL_GARDEN_CONSTANTS.DEFAULT_PLANT_BED_SIZE;
      
      if (pos.position_x < 0 || pos.position_y < 0) {
        violations.push(`Plant bed ${pos.id} position cannot be negative`);
      }
      
      if (pos.position_x + width > canvasWidth || pos.position_y + height > canvasHeight) {
        violations.push(`Plant bed ${pos.id} would extend beyond canvas boundaries`);
      }
    });
    
    return { allWithinBounds: violations.length === 0, violations };
    
  } catch (error) {
    console.error('Bulk canvas boundaries check error:', error);
    return { allWithinBounds: false, violations: ['Canvas boundaries check failed'] };
  }
}

// ===================================================================
// GET ALL PLANT BED POSITIONS IN GARDEN
// ===================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<PlantBedWithPosition[]>>> {
  try {
    // Only check environment in production
    checkEnvironment()
    
    const { id: gardenId } = params;
    
    if (!gardenId) {
      return NextResponse.json(
        { success: false, error: 'Garden ID is required' },
        { status: 400 }
      );
    }
    
    // Get all plant beds with positions for this garden
    const { data: plantBeds, error } = await supabase
      .from('plant_beds')
      .select('*')
      .eq('garden_id', gardenId)
      .order('z_index', { ascending: true })
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Database error:', error);
      return NextResponse.json<ApiResponse<PlantBedWithPosition[]>>({
        data: null,
        error: 'Failed to fetch plant beds',
        success: false
      }, { status: 500 });
    }
    
    return NextResponse.json<ApiResponse<PlantBedWithPosition[]>>({
      data: plantBeds as PlantBedWithPosition[] || [],
      error: null,
      success: true
    });
    
  } catch (error) {
    console.error('GET positions error:', error);
    return NextResponse.json<ApiResponse<PlantBedWithPosition[]>>({
      data: null,
      error: 'Internal server error',
      success: false
    }, { status: 500 });
  }
}

// ===================================================================
// BULK UPDATE PLANT BED POSITIONS
// ===================================================================

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<PlantBedWithPosition[]>>> {
  try {
    const { id: gardenId } = params;
    
    if (!gardenId) {
      return NextResponse.json<ApiResponse<PlantBedWithPosition[]>>({
        data: null,
        error: 'Garden ID is required',
        success: false
      }, { status: 400 });
    }
    
    // Parse request body
    const body = await request.json();
    
    // Validate request body
    if (!body || !body.positions || !Array.isArray(body.positions)) {
      return NextResponse.json(
        { success: false, error: 'Invalid request body. Expected positions array.', data: null },
        { status: 400 }
      )
    }

    const typedBody = body as any;

    if (typedBody.positions.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Positions array cannot be empty.', data: null },
        { status: 400 }
      )
    }

    if (typedBody.positions.length > 100) {
      return NextResponse.json(
        { success: false, error: 'Too many positions. Maximum 100 allowed.', data: null },
        { status: 400 }
      )
    }

    // Validate each position
    typedBody.positions.forEach((position: unknown, index: number) => {
      if (!position || typeof position !== 'object') {
        throw new Error(`Invalid position at index ${index}: must be an object`)
      }

      const pos = position as any;
      
      if (!pos.id || typeof pos.id !== 'string') {
        throw new Error(`Invalid position at index ${index}: id must be a string`)
      }

      if (typeof pos.position_x !== 'number') {
        throw new Error(`Invalid position at index ${index}: position_x must be a number`)
      }

      if (typeof pos.position_y !== 'number') {
        throw new Error(`Invalid position at index ${index}: position_y must be a number`)
      }

      if (pos.position_x < 0) {
        throw new Error(`Invalid position at index ${index}: position_x cannot be negative`)
      }

      if (pos.position_y < 0) {
        throw new Error(`Invalid position at index ${index}: position_y cannot be negative`)
      }

      if (pos.visual_width !== undefined) {
        if (typeof pos.visual_width !== 'number' || pos.visual_width <= 0) {
          throw new Error(`Invalid position at index ${index}: visual_width must be a positive number`)
        }
        if (pos.visual_width > VISUAL_GARDEN_CONSTANTS.MAX_PLANT_BED_SIZE) {
          throw new Error(`Invalid position at index ${index}: visual_width exceeds maximum size`)
        }
      }

      if (pos.visual_height !== undefined) {
        if (typeof pos.visual_height !== 'number' || pos.visual_height <= 0) {
          throw new Error(`Invalid position at index ${index}: visual_height must be a positive number`)
        }
        if (pos.visual_height > VISUAL_GARDEN_CONSTANTS.MAX_PLANT_BED_SIZE) {
          throw new Error(`Invalid position at index ${index}: visual_height exceeds maximum size`)
        }
      }

      if (pos.rotation !== undefined) {
        if (typeof pos.rotation !== 'number' || pos.rotation < -180 || pos.rotation > 180) {
          throw new Error(`Invalid position at index ${index}: rotation must be between -180 and 180 degrees`)
        }
      }

      if (pos.z_index !== undefined) {
        if (typeof pos.z_index !== 'number' || pos.z_index < 0) {
          throw new Error(`Invalid position at index ${index}: z_index must be a non-negative number`)
        }
      }

      if (pos.color_code !== undefined) {
        if (typeof pos.color_code !== 'string' || !/^#[0-9A-Fa-f]{6}$/.test(pos.color_code)) {
          throw new Error(`Invalid position at index ${index}: color_code must be a valid hex color`)
        }
      }
    })
    
    // Verify all plant beds belong to this garden
    const plantBedIds = body.positions.map((pos: unknown) => (pos as any).id);
    const { data: existingPlantBeds, error: fetchError } = await supabase
      .from('plant_beds')
      .select('id, garden_id')
      .in('id', plantBedIds);
    
    if (fetchError) {
      console.error('Database fetch error:', fetchError);
      return NextResponse.json<ApiResponse<PlantBedWithPosition[]>>({
        data: null,
        error: 'Failed to verify plant beds',
        success: false
      }, { status: 500 });
    }
    
    // Check if all plant beds exist and belong to this garden
    const invalidPlantBeds = plantBedIds.filter((id: string) => 
      !existingPlantBeds?.some(pb => pb.id === id && pb.garden_id === gardenId)
    );
    
    if (invalidPlantBeds.length > 0) {
      return NextResponse.json<ApiResponse<PlantBedWithPosition[]>>({
        data: null,
        error: `Invalid plant bed IDs: ${invalidPlantBeds.join(', ')}`,
        success: false
      }, { status: 400 });
    }
    
    // Check canvas boundaries
    const boundariesCheck = await checkBulkCanvasBoundaries(gardenId, body.positions);
    if (!boundariesCheck.allWithinBounds) {
      return NextResponse.json<ApiResponse<PlantBedWithPosition[]>>({
        data: null,
        error: `Canvas boundaries violated: ${boundariesCheck.violations.join(', ')}`,
        success: false
      }, { status: 400 });
    }
    
    // Check for collisions
    const collisionCheck = await checkBulkCollisions(gardenId, body.positions);
    if (collisionCheck.hasCollision) {
      return NextResponse.json<ApiResponse<PlantBedWithPosition[]>>({
        data: null,
        error: `Collision detected: ${collisionCheck.conflicts.join(', ')}`,
        success: false
      }, { status: 400 });
    }
    
    // Perform bulk update
    const updatedPlantBeds: PlantBedWithPosition[] = [];
    
    // Process updates in batches to avoid overwhelming the database
    const batchSize = 10;
    for (let i = 0; i < body.positions.length; i += batchSize) {
      const batch = body.positions.slice(i, i + batchSize);
      
      for (const position of batch) {
        const updateData = {
          position_x: position.position_x,
          position_y: position.position_y,
          visual_width: position.visual_width,
          visual_height: position.visual_height,
          rotation: position.rotation,
          z_index: position.z_index,
          color_code: position.color_code
        };
        
        // Remove undefined values
        Object.keys(updateData).forEach(key => {
          if (updateData[key as keyof typeof updateData] === undefined) {
            delete updateData[key as keyof typeof updateData];
          }
        });
        
        const { data: updated, error: updateError } = await supabase
          .from('plant_beds')
          .update(updateData)
          .eq('id', position.id)
          .select('*')
          .single();
        
        if (updateError) {
          console.error(`Update error for plant bed ${position.id}:`, updateError);
          return NextResponse.json<ApiResponse<PlantBedWithPosition[]>>({
            data: null,
            error: `Failed to update plant bed ${position.id}`,
            success: false
          }, { status: 500 });
        }
        
        if (updated) {
          updatedPlantBeds.push(updated as PlantBedWithPosition);
        }
      }
    }
    
    return NextResponse.json<ApiResponse<PlantBedWithPosition[]>>({
      data: updatedPlantBeds,
      error: null,
      success: true
    });
    
  } catch (error) {
    console.error('Bulk position update error:', error);
    return NextResponse.json<ApiResponse<PlantBedWithPosition[]>>({
      data: null,
      error: 'Internal server error',
      success: false
    }, { status: 500 });
  }
}

// ===================================================================
// PARTIAL BULK UPDATE (PATCH)
// ===================================================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<PlantBedWithPosition[]>>> {
  try {
    const { id: gardenId } = params;
    
    if (!gardenId) {
      return NextResponse.json<ApiResponse<PlantBedWithPosition[]>>({
        data: null,
        error: 'Garden ID is required',
        success: false
      }, { status: 400 });
    }
    
    // Parse request body
    const body = await request.json();
    
    // Validate request data
    const validation = validateBulkPositionRequest(body);
    if (!validation.isValid) {
      return NextResponse.json<ApiResponse<PlantBedWithPosition[]>>({
        data: null,
        error: `Validation error: ${validation.errors.join(', ')}`,
        success: false
      }, { status: 400 });
    }
    
    // Get current plant bed data
    const plantBedIds = body.positions.map((pos: unknown) => (pos as any).id);
    const { data: currentPlantBeds, error: fetchError } = await supabase
      .from('plant_beds')
      .select('*')
      .in('id', plantBedIds)
      .eq('garden_id', gardenId);
    
    if (fetchError) {
      console.error('Database fetch error:', fetchError);
      return NextResponse.json<ApiResponse<PlantBedWithPosition[]>>({
        data: null,
        error: 'Failed to fetch current plant beds',
        success: false
      }, { status: 500 });
    }
    
    // Create lookup map for current data
    const currentDataMap = new Map();
    currentPlantBeds?.forEach(pb => {
      currentDataMap.set(pb.id, pb);
    });
    
    // Check if all plant beds exist
    const missingPlantBeds = plantBedIds.filter((id: string) => !currentDataMap.has(id));
    if (missingPlantBeds.length > 0) {
      return NextResponse.json<ApiResponse<PlantBedWithPosition[]>>({
        data: null,
        error: `Plant beds not found: ${missingPlantBeds.join(', ')}`,
        success: false
      }, { status: 404 });
    }
    
    // Build complete position data for validation
    const completePositions = body.positions.map((pos: unknown) => {
      const typedPos = pos as any;
      const current = currentDataMap.get(typedPos.id);
      return {
        id: typedPos.id,
        position_x: typedPos.position_x,
        position_y: typedPos.position_y,
        visual_width: typedPos.visual_width ?? current?.visual_width ?? VISUAL_GARDEN_CONSTANTS.DEFAULT_PLANT_BED_SIZE,
        visual_height: typedPos.visual_height ?? current?.visual_height ?? VISUAL_GARDEN_CONSTANTS.DEFAULT_PLANT_BED_SIZE,
        rotation: typedPos.rotation ?? current?.rotation ?? 0,
        z_index: typedPos.z_index ?? current?.z_index ?? 0,
        color_code: typedPos.color_code ?? current?.color_code ?? VISUAL_GARDEN_CONSTANTS.DEFAULT_COLORS.PLANT_BED
      };
    });
    
    // Check canvas boundaries
    const boundariesCheck = await checkBulkCanvasBoundaries(gardenId, completePositions);
    if (!boundariesCheck.allWithinBounds) {
      return NextResponse.json<ApiResponse<PlantBedWithPosition[]>>({
        data: null,
        error: `Canvas boundaries violated: ${boundariesCheck.violations.join(', ')}`,
        success: false
      }, { status: 400 });
    }
    
    // Check for collisions
    const collisionCheck = await checkBulkCollisions(gardenId, completePositions);
    if (collisionCheck.hasCollision) {
      return NextResponse.json<ApiResponse<PlantBedWithPosition[]>>({
        data: null,
        error: `Collision detected: ${collisionCheck.conflicts.join(', ')}`,
        success: false
      }, { status: 400 });
    }
    
    // Perform partial bulk update
    const updatedPlantBeds: PlantBedWithPosition[] = [];
    
    for (const position of body.positions) {
      const typedPosition = position as any;
      const updateData: Record<string, unknown> = {};
      
      // Only include fields that are provided
      if (typedPosition.position_x !== undefined) updateData.position_x = typedPosition.position_x;
      if (typedPosition.position_y !== undefined) updateData.position_y = typedPosition.position_y;
      if (typedPosition.visual_width !== undefined) updateData.visual_width = typedPosition.visual_width;
      if (typedPosition.visual_height !== undefined) updateData.visual_height = typedPosition.visual_height;
      if (typedPosition.rotation !== undefined) updateData.rotation = typedPosition.rotation;
      if (typedPosition.z_index !== undefined) updateData.z_index = typedPosition.z_index;
      if (typedPosition.color_code !== undefined) updateData.color_code = typedPosition.color_code;
      
      const { data: updated, error: updateError } = await supabase
        .from('plant_beds')
        .update(updateData)
        .eq('id', typedPosition.id)
        .select('*')
        .single();
      
      if (updateError) {
        console.error(`Update error for plant bed ${typedPosition.id}:`, updateError);
        return NextResponse.json<ApiResponse<PlantBedWithPosition[]>>({
          data: null,
          error: `Failed to update plant bed ${typedPosition.id}`,
          success: false
        }, { status: 500 });
      }
      
      if (updated) {
        updatedPlantBeds.push(updated as PlantBedWithPosition);
      }
    }
    
    return NextResponse.json<ApiResponse<PlantBedWithPosition[]>>({
      data: updatedPlantBeds,
      error: null,
      success: true
    });
    
  } catch (error) {
    console.error('Bulk partial position update error:', error);
    return NextResponse.json<ApiResponse<PlantBedWithPosition[]>>({
      data: null,
      error: 'Internal server error',
      success: false
    }, { status: 500 });
  }
}