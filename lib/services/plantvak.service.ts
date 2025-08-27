import { supabase } from '../supabase';
import type { Plantvak } from '../types/index';

// Type alias for backward compatibility
type PlantBed = Plantvak

/**
 * PlantvakService - Handles all plantvak operations with automatic letter code assignment
 */
export class PlantvakService {
  /**
   * Generate next available letter code for a garden
   */
  private static generateNextLetterCode(existingCodes: string[]): string {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    
    // Try single letters first (A, B, C, etc.)
    for (const letter of alphabet) {
      if (!existingCodes.includes(letter)) {
        return letter;
      }
    }
    
    // If all single letters are used, try double letters (AA, AB, AC, etc.)
    for (const firstLetter of alphabet) {
      for (const secondLetter of alphabet) {
        const code = `${firstLetter}${secondLetter}`;
        if (!existingCodes.includes(code)) {
          return code;
        }
      }
    }
    
    // If all double letters are also used (very unlikely), start with AAA, AAB, etc.
    // But limit to prevent infinite loops
    for (let i = 0; i < 1000; i++) {
      const code = `A${i + 1}`;
      if (!existingCodes.includes(code)) {
        return code;
      }
    }
    
    // Fallback - should never reach here
    return `X${Date.now()}`;
  }

  /**
   * Get all plantvakken for a specific garden
   */
  static async getByGarden(gardenId: string): Promise<PlantBed[]> {
    try {
      const { data, error } = await supabase
        .from('plant_beds')
        .select('*')
        .eq('garden_id', gardenId)
        .eq('is_active', true)
        .order('letter_code', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching plantvakken:', error);
      return [];
    }
  }

  /**
   * Create a new plantvak with automatic letter code assignment
   */
  static async create(plantvakData: {
    garden_id: string;
    location?: string;
    size?: string;
    soil_type?: string;
    sun_exposure?: 'full-sun' | 'partial-sun' | 'shade';
    description?: string;
  }): Promise<PlantBed | null> {
    try {
      console.log('🔍 PlantvakService.create called with:', JSON.stringify(plantvakData, null, 2));
      
      // Validate input data
      if (!plantvakData.garden_id) {
        throw new Error('Garden ID is required');
      }
      
      // Get existing letter codes for this garden
      const existingPlantvakken = await this.getByGarden(plantvakData.garden_id);
      console.log('📊 Existing plantvakken:', existingPlantvakken);
      
      const existingCodes = existingPlantvakken.map(p => p.letter_code).filter(Boolean);
      console.log('🔤 Existing letter codes:', existingCodes);
      
      // Generate next available letter code
      const nextLetterCode = this.generateNextLetterCode(existingCodes.filter(Boolean) as string[]);
      console.log('✨ Next letter code:', nextLetterCode);
      
      // Generate a UUID for the ID (v4 UUID format)
      const generateUUID = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      };
      
      // Create new plantvak with letter code as both name and letter_code
      const newPlantvak: any = {
        id: generateUUID(), // Generate UUID for ID
        garden_id: plantvakData.garden_id,
        name: nextLetterCode, // Always use letter code as name
        letter_code: nextLetterCode
      };
      
      // Only add optional fields if they have values
      if (plantvakData.location) {
        newPlantvak.location = plantvakData.location;
      }
      if (plantvakData.size) {
        newPlantvak.size = plantvakData.size;
      }
      if (plantvakData.soil_type) {
        newPlantvak.soil_type = plantvakData.soil_type;
      }
      if (plantvakData.sun_exposure) {
        newPlantvak.sun_exposure = plantvakData.sun_exposure;
      }
      if (plantvakData.description) {
        newPlantvak.description = plantvakData.description;
      }
      
      // Try to add season_year - if it fails, we'll try without it
      try {
        newPlantvak.season_year = new Date().getFullYear();
      } catch (e) {
        console.log('⚠️ Could not add season_year, continuing without it');
      }
      
      console.log('📝 Inserting new plantvak:', JSON.stringify(newPlantvak, null, 2));

      let { data, error } = await supabase
        .from('plant_beds')
        .insert(newPlantvak)
        .select()
        .single();

      // If error and we have season_year, try without it
      if (error && newPlantvak.season_year) {
        console.log('⚠️ Insert failed with season_year, retrying without it...');
        delete newPlantvak.season_year;
        
        const retryResult = await supabase
          .from('plant_beds')
          .insert(newPlantvak)
          .select()
          .single();
          
        data = retryResult.data;
        error = retryResult.error;
      }

      if (error) {
        console.error('❌ Supabase error:', error);
        console.error('❌ Error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }
      
      console.log(`✅ Plantvak created with letter code: ${nextLetterCode}`);
      console.log('📊 Created plantvak data:', data);
      return data;
    } catch (error) {
      console.error('❌ Error creating plantvak:', error);
      if (error && typeof error === 'object' && 'message' in error) {
        console.error('❌ Error details:', {
          message: (error as any).message,
          code: (error as any).code,
          details: (error as any).details,
          hint: (error as any).hint,
          stack: (error as any).stack
        });
      }
      return null;
    }
  }

  /**
   * Update an existing plantvak
   */
  static async update(id: string, updates: Partial<PlantBed>): Promise<PlantBed | null> {
    try {
      const { data, error } = await supabase
        .from('plant_beds')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating plantvak:', error);
      return null;
    }
  }

  /**
   * Delete a plantvak
   */
  static async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('plant_beds')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting plantvak:', error);
      return false;
    }
  }

  /**
   * Get plantvak by ID
   */
  static async getById(id: string): Promise<PlantBed | null> {
    try {
      const { data, error } = await supabase
        .from('plant_beds')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching plantvak:', error);
      return null;
    }
  }
}