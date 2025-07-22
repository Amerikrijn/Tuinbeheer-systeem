import { DatabaseService } from "./services/database.service"
import { logger, createOperationContext } from "./logger"
import { ErrorHandler, safeAsync } from "./errors"
import { supabase, type Garden, type PlantBed, type Plant, type PlantBedWithPlants, type PlantWithPosition } from "./supabase"

/**
 * LEGACY DATABASE FUNCTIONS - REFACTORED FOR BANKING STANDARDS
 * 
 * This file maintains backward compatibility while using the new banking-grade
 * database service layer underneath. All functions now include:
 * - Proper logging with correlation IDs
 * - Structured error handling
 * - Performance monitoring
 * - Security audit trails
 * 
 * These functions are maintained for backward compatibility.
 * New code should use DatabaseService directly.
 */

function isMissingRelation(err: { code?: string } | null): boolean {
  return !!err && err.code === "42P01"
}

// Garden functions
export async function getGardens(): Promise<Garden[]> {
  const context = createOperationContext('legacy_get_gardens', 'legacy_database');
  
  const result = await safeAsync(async () => {
    logger.info("Fetching gardens via legacy function", context);
    
    const result = await DatabaseService.Tuin.getAll();
    
    if (!result.success) {
      logger.error("Error fetching gardens via legacy function", new Error(result.error || 'Unknown error'), context);
      return [];
    }

    logger.info(`Gardens fetched successfully via legacy function: ${result.data?.length || 0}`, context);
    return result.data || [];
  }, context, []);
  
  return result || [];
}

export async function getGarden(id?: string): Promise<Garden | null> {
  const context = createOperationContext('legacy_get_garden', 'legacy_database', { gardenId: id });
  
  return safeAsync(async () => {
    if (!id) {
      // Get the first active garden if no ID provided
      logger.info("No ID provided, fetching first active garden", context);
      const result = await DatabaseService.Tuin.getAll();
      
      if (!result.success || !result.data || result.data.length === 0) {
        logger.error("Error fetching default garden", new Error(result.error || 'No gardens found'), context);
        return null;
      }

      return result.data[0];
    }

    logger.info(`Fetching garden by ID: ${id}`, context);
    const result = await DatabaseService.Tuin.getById(id);
    
    if (!result.success) {
      logger.error("Error fetching garden by ID", new Error(result.error || 'Unknown error'), context);
      return null;
    }

    return result.data;
  }, context, null);
}

export async function createGarden(garden: {
  name: string
  description?: string
  location: string
  total_area?: string
  length?: string
  width?: string
  garden_type?: string
  established_date?: string
  notes?: string
}): Promise<Garden | null> {
  const context = createOperationContext('legacy_create_garden', 'legacy_database', { gardenName: garden.name });
  
  return safeAsync(async () => {
    logger.info(`Creating garden via legacy function: ${garden.name}`, context);

    // Test if table exists first (legacy behavior)
    const { data: testData, error: testError } = await supabase.from("gardens").select("id").limit(1);

    if (testError) {
      logger.error("Table test failed", testError, context);
      if (isMissingRelation(testError)) {
        throw new Error("Database tables not found. Please run the migration first.");
      }
      throw testError;
    }

    logger.debug("Table exists, proceeding with insert via service", context);

    const result = await DatabaseService.Tuin.create({
      name: garden.name,
      description: garden.description || undefined,
      location: garden.location,
      total_area: garden.total_area || undefined,
      length: garden.length || undefined,
      width: garden.width || undefined,
      garden_type: garden.garden_type || undefined,
      established_date: garden.established_date || undefined,
      notes: garden.notes || undefined,
      is_active: true,
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to create garden');
    }

    logger.info(`Garden created successfully via legacy function: ${result.data?.name}`, context);
    return result.data;
  }, context, null);
}

export async function updateGarden(id: string, updates: Partial<Garden>): Promise<Garden | null> {
  const context = createOperationContext('legacy_update_garden', 'legacy_database', { gardenId: id });
  
  return safeAsync(async () => {
    logger.info(`Updating garden via legacy function: ${id}`, context);
    
    const result = await DatabaseService.Tuin.update(id, updates);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to update garden');
    }

    logger.info(`Garden updated successfully via legacy function: ${result.data?.name}`, context);
    return result.data;
  }, context, null);
}

export async function deleteGarden(id: string): Promise<void> {
  const context = createOperationContext('legacy_delete_garden', 'legacy_database', { gardenId: id });
  
  await safeAsync(async () => {
    logger.info(`Deleting garden via legacy function: ${id}`, context);
    
    const result = await DatabaseService.Tuin.delete(id);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to delete garden');
    }

    logger.info(`Garden deleted successfully via legacy function: ${id}`, context);
  }, context);
}

// Plant bed functions
export async function getPlantBeds(gardenId?: string): Promise<PlantBedWithPlants[]> {
  const context = createOperationContext('legacy_get_plant_beds', 'legacy_database', { gardenId });
  
  const result = await safeAsync(async () => {
    logger.info(`Fetching plant beds via legacy function for garden: ${gardenId || 'all'}`, context);
    
    let plantBeds: PlantBed[] = [];
    
    if (gardenId) {
      const result = await DatabaseService.Plantvak.getByGardenId(gardenId);
      if (!result.success) {
        logger.warn("Failed to fetch plant beds, returning empty array", context);
        return [];
      }
      plantBeds = result.data || [];
    } else {
      // Legacy behavior: get all plant beds (not implemented in new service)
      logger.warn("Getting all plant beds across gardens - using direct query for legacy compatibility", context);
      
      const { data, error } = await supabase
        .from("plant_beds")
        .select("*")
        .eq("is_active", true)
        .order("id");

      if (error) {
        if (isMissingRelation(error)) {
          logger.warn("Supabase table `plant_beds` not found yet – returning empty list", context);
          return [];
        }
        logger.error("Error fetching plant beds", error, context);
        return [];
      }
      
      plantBeds = data || [];
    }

    // Fetch plants for each plant bed
    const plantBedsWithPlants = await Promise.all(
      plantBeds.map(async (bed) => {
        const plantsResult = await DatabaseService.Bloem.getByPlantvakId(bed.id);
        
        if (!plantsResult.success) {
          logger.error(`Error fetching plants for bed: ${bed.id}`, new Error(plantsResult.error || 'Unknown error'), context);
          return { 
            ...bed, 
            plants: [],
            position_x: bed.position_x ?? 0,
            position_y: bed.position_y ?? 0,
            visual_width: bed.visual_width ?? 100,
            visual_height: bed.visual_height ?? 100,
            rotation: bed.rotation ?? 0,
            z_index: bed.z_index ?? 1,
            color_code: bed.color_code ?? '#4ade80',
            visual_updated_at: bed.visual_updated_at ?? new Date().toISOString()
          };
        }

        return { 
          ...bed, 
          plants: (plantsResult.data || []).map(plant => ({
            ...plant,
            position_x: plant.position_x ?? Math.random() * 400,
            position_y: plant.position_y ?? Math.random() * 300,
            visual_width: plant.visual_width ?? 40,
            visual_height: plant.visual_height ?? 40
          })),
          position_x: bed.position_x ?? 0,
          position_y: bed.position_y ?? 0,
          visual_width: bed.visual_width ?? 100,
          visual_height: bed.visual_height ?? 100,
          rotation: bed.rotation ?? 0,
          z_index: bed.z_index ?? 1,
          color_code: bed.color_code ?? '#4ade80',
          visual_updated_at: bed.visual_updated_at ?? new Date().toISOString()
        };
      }),
    );

    logger.info(`Successfully fetched ${plantBedsWithPlants.length} plant beds with plants`, context);
    return plantBedsWithPlants;
  }, context, []);
  
  // Ensure we always return an array
  return result || [];
}

export async function getPlantBed(id: string): Promise<PlantBedWithPlants | null> {
  const context = createOperationContext('legacy_get_plant_bed', 'legacy_database', { plantBedId: id });
  
  return safeAsync(async () => {
    logger.info(`Fetching plant bed via legacy function: ${id}`, context);
    
    const result = await DatabaseService.Plantvak.getWithBloemen(id);
    
    if (!result.success) {
      if (result.error?.includes('not found')) {
        logger.warn(`Plant bed not found: ${id}`, context);
        return null;
      }
      logger.error("Error fetching plant bed", new Error(result.error || 'Unknown error'), context);
      return null;
    }

    logger.info(`Successfully fetched plant bed: ${result.data?.name}`, context);
    // Ensure position_x, position_y, visual_width, and visual_height are defined
    const data = result.data;
    if (data) {
      return {
        ...data,
        position_x: data.position_x ?? 0,
        position_y: data.position_y ?? 0,
        visual_width: data.visual_width ?? 100,
        visual_height: data.visual_height ?? 100,
        rotation: data.rotation ?? 0,
        z_index: data.z_index ?? 1,
        color_code: data.color_code ?? '#4ade80',
        visual_updated_at: data.visual_updated_at ?? new Date().toISOString(),
        // Ensure plants have required visual properties
        plants: data.plants.map(plant => ({
          ...plant,
          position_x: plant.position_x ?? Math.random() * 400,
          position_y: plant.position_y ?? Math.random() * 300,
          visual_width: plant.visual_width ?? 40,
          visual_height: plant.visual_height ?? 40
        }))
      } as PlantBedWithPlants;
    }
    return null;
  }, context, null);
}

export async function createPlantBed(plantBed: {
  id: string
  garden_id: string
  name: string
  location?: string
  size?: string
  soil_type?: string
  sun_exposure?: 'full-sun' | 'partial-sun' | 'shade'
  description?: string
}): Promise<PlantBed | null> {
  const context = createOperationContext('legacy_create_plant_bed', 'legacy_database', { 
    plantBedName: plantBed.name,
    gardenId: plantBed.garden_id 
  });
  
  return safeAsync(async () => {
    logger.info(`Creating plant bed via legacy function: ${plantBed.name}`, context);
    
    // Legacy validation logging
    logger.debug(`Garden ID to be used: ${plantBed.garden_id} (type: ${typeof plantBed.garden_id})`, context);
    
    // Check if garden exists first (legacy behavior)
    const { data: gardenExists, error: gardenCheckError } = await supabase
      .from("gardens")
      .select("id")
      .eq("id", plantBed.garden_id)
      .single();
    
    if (gardenCheckError || !gardenExists) {
      logger.error(`Garden does not exist: ${plantBed.garden_id}`, gardenCheckError, context);
      throw new Error(`Garden with id ${plantBed.garden_id} does not exist`);
    }
    
    logger.debug("Garden exists, proceeding with plant bed creation", context);
    
    const result = await DatabaseService.Plantvak.create({
      garden_id: plantBed.garden_id,
      name: plantBed.name,
      location: plantBed.location,
      size: plantBed.size,
      soil_type: plantBed.soil_type,
      sun_exposure: plantBed.sun_exposure || 'full-sun',
      description: plantBed.description,
      is_active: true,
    });

    if (!result.success) {
      logger.error("Failed to create plant bed via service", new Error(result.error || 'Unknown error'), context);
      throw new Error(result.error || 'Failed to create plant bed');
    }

    logger.info(`Plant bed created successfully via legacy function: ${result.data?.name}`, context);
    return result.data;
  }, context, null);
}

export async function updatePlantBed(id: string, updates: Partial<PlantBed>): Promise<PlantBed | null> {
  const context = createOperationContext('legacy_update_plant_bed', 'legacy_database', { plantBedId: id });
  
  return safeAsync(async () => {
    logger.info(`Updating plant bed via legacy function: ${id}`, context);
    
    const result = await DatabaseService.Plantvak.update(id, updates);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to update plant bed');
    }

    logger.info(`Plant bed updated successfully via legacy function: ${result.data?.name}`, context);
    return result.data;
  }, context, null);
}

export async function deletePlantBed(id: string): Promise<void> {
  const context = createOperationContext('legacy_delete_plant_bed', 'legacy_database', { plantBedId: id });
  
  await safeAsync(async () => {
    logger.info(`Deleting plant bed via legacy function: ${id}`, context);
    
    const result = await DatabaseService.Plantvak.delete(id);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to delete plant bed');
    }

    logger.info(`Plant bed deleted successfully via legacy function: ${id}`, context);
  }, context);
}

// Plant functions
export async function createPlant(plant: {
  plant_bed_id: string
  name: string
  scientific_name?: string
  variety?: string
  color?: string
  height?: number
  stem_length?: number
  photo_url?: string
  category?: string
  bloom_period?: string
  planting_date?: string
  expected_harvest_date?: string
  status?: "healthy" | "needs_attention" | "diseased" | "dead" | "harvested"
  notes?: string
  care_instructions?: string
  watering_frequency?: number
  fertilizer_schedule?: string
}): Promise<Plant | null> {
  const context = createOperationContext('legacy_create_plant', 'legacy_database', { 
    plantName: plant.name,
    plantBedId: plant.plant_bed_id 
  });
  
  return safeAsync(async () => {
    logger.info(`Creating plant via legacy function: ${plant.name}`, context);
    
    const result = await DatabaseService.Bloem.create({
      ...plant,
      status: plant.status || 'healthy'
    });
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to create plant');
    }

    logger.info(`Plant created successfully via legacy function: ${result.data?.name}`, context);
    return result.data;
  }, context, null);
}

export async function updatePlant(id: string, updates: Partial<Plant>): Promise<Plant | null> {
  const context = createOperationContext('legacy_update_plant', 'legacy_database', { plantId: id });
  
  return safeAsync(async () => {
    logger.info(`Updating plant via legacy function: ${id}`, context);
    
    const result = await DatabaseService.Bloem.update(id, updates);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to update plant');
    }

    logger.info(`Plant updated successfully via legacy function: ${result.data?.name}`, context);
    return result.data;
  }, context, null);
}

export async function deletePlant(id: string): Promise<void> {
  const context = createOperationContext('legacy_delete_plant', 'legacy_database', { plantId: id });
  
  await safeAsync(async () => {
    logger.info(`Deleting plant via legacy function: ${id}`, context);
    
    const result = await DatabaseService.Bloem.delete(id);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to delete plant');
    }

    logger.info(`Plant deleted successfully via legacy function: ${id}`, context);
  }, context);
}

export async function getPlant(id: string): Promise<Plant | null> {
  const context = createOperationContext('legacy_get_plant', 'legacy_database', { plantId: id });
  
  return safeAsync(async () => {
    logger.info(`Fetching plant via legacy function: ${id}`, context);
    
    const result = await DatabaseService.Bloem.getById(id);
    
    if (!result.success) {
      logger.error("Error fetching plant", new Error(result.error || 'Unknown error'), context);
      return null;
    }

    logger.info(`Successfully fetched plant: ${result.data?.name}`, context);
    return result.data;
  }, context, null);
}

// ===================================================================
// VISUAL PLANT DESIGNER FUNCTIONS (LEGACY COMPATIBILITY)
// ===================================================================

// Get plants with positions for visual designer
export async function getPlantsWithPositions(plantBedId: string): Promise<PlantWithPosition[]> {
  const context = createOperationContext('legacy_get_plants_with_positions', 'legacy_database', { plantBedId });
  
  const result = await safeAsync(async () => {
    logger.info(`Fetching plants with positions via legacy function: ${plantBedId}`, context);
    
    const { data: plants, error } = await supabase
      .from("plants")
      .select("*")
      .eq("plant_bed_id", plantBedId)
      .order("created_at", { ascending: true });

    if (error) {
      logger.error("Error fetching plants with positions", error, context);
      return [];
    }

    // Convert to PlantWithPosition format with defaults
    const plantsWithPositions = (plants || []).map(plant => ({
      ...plant,
      position_x: plant.position_x ?? Math.random() * 400,
      position_y: plant.position_y ?? Math.random() * 300,
      visual_width: plant.visual_width ?? 40,
      visual_height: plant.visual_height ?? 40,
      emoji: plant.emoji
    })) as PlantWithPosition[];

    logger.info(`Successfully fetched ${plantsWithPositions.length} plants with positions`, context);
    return plantsWithPositions;
  }, context, []);
  
  // Ensure we always return an array
  return result || [];
}

// Create plant for visual designer
export async function createVisualPlant(plant: {
  plant_bed_id: string
  name: string
  color: string
  status: "healthy" | "needs_attention" | "diseased" | "dead" | "harvested"
  position_x: number
  position_y: number
  visual_width: number
  visual_height: number
  emoji?: string
  photo_url?: string | null
  is_custom?: boolean
  category?: string
  notes?: string
}): Promise<PlantWithPosition | null> {
  const context = createOperationContext('legacy_create_visual_plant', 'legacy_database', { 
    plantName: plant.name,
    plantBedId: plant.plant_bed_id 
  });
  
  return safeAsync(async () => {
    logger.info(`Creating visual plant via legacy function: ${plant.name}`, context);
    
    const { data, error } = await supabase.from("plants").insert({
      plant_bed_id: plant.plant_bed_id,
      name: plant.name,
      color: plant.color,
      status: plant.status,
      position_x: plant.position_x,
      position_y: plant.position_y,
      visual_width: plant.visual_width,
      visual_height: plant.visual_height,
      emoji: plant.emoji,
      photo_url: plant.photo_url,
      is_custom: plant.is_custom,
      category: plant.category,
      notes: plant.notes,
    }).select().single();

    if (error) {
      logger.error("Error creating visual plant", error, context);
      throw error;
    }

    logger.info(`Visual plant created successfully via legacy function: ${data.name}`, context);
    return data as PlantWithPosition;
  }, context, null);
}

// Update plant position and visual properties
export async function updatePlantPosition(id: string, updates: {
  position_x?: number
  position_y?: number
  visual_width?: number
  visual_height?: number
  name?: string
  color?: string
  status?: "healthy" | "needs_attention" | "diseased" | "dead" | "harvested"
  emoji?: string
  is_custom?: boolean
  category?: string
  notes?: string
  photo_url?: string | null
}): Promise<PlantWithPosition | null> {
  const context = createOperationContext('legacy_update_plant_position', 'legacy_database', { plantId: id });
  
  return safeAsync(async () => {
    logger.info(`Updating plant position via legacy function: ${id}`, context);
    
    const { data, error } = await supabase
      .from("plants")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      logger.error("Error updating plant position", error, context);
      throw error;
    }

    logger.info(`Plant position updated successfully via legacy function: ${data.name}`, context);
    return data as PlantWithPosition;
  }, context, null);
}
