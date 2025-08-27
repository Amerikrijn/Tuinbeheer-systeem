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
  static generateNextLetterCode(existingCodes: string[]): string {
    // If no existing codes, start with A
    if (!existingCodes || existingCodes.length === 0) {
      return 'A';
    }
    
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    
    // Try single letters first (A, B, C, etc.)
    for (const letter of alphabet) {
      if (!existingCodes.includes(letter)) {
        return letter;
      }
    }
    
    // If all letters are used, start with A1, A2, etc.
    let counter = 1;
    while (true) {
      const code = `A${counter}`;
      if (!existingCodes.includes(code)) {
        return code;
      }
      counter++;
    }
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
        .order('created_at', { ascending: true }); // Order by creation date instead of letter_code

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
    name?: string;
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
      
      // Generate a unique ID for the plantvak
      const uniqueId = `plantvak-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      console.log('🆔 Generated unique ID:', uniqueId);
      
      // Create new plantvak with letter code and ID
      // Always use the letter code as the name for consistency
      const newPlantvak = {
        id: uniqueId,
        name: nextLetterCode, // Always use the letter code as the name
        ...plantvakData,
        letter_code: nextLetterCode,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('📝 Inserting new plantvak:', JSON.stringify(newPlantvak, null, 2));

      const { data, error } = await supabase
        .from('plant_beds')
        .insert(newPlantvak)
        .select()
        .single();

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