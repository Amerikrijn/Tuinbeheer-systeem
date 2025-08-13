import { supabase } from '../supabase';
import { PlantBed } from '../types';

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
    name: string;
    location?: string;
    size?: string;
    soil_type?: string;
    sun_exposure?: 'full-sun' | 'partial-sun' | 'shade';
    description?: string;
  }): Promise<PlantBed | null> {
    try {
      // Get existing letter codes for this garden
      const existingPlantvakken = await this.getByGarden(plantvakData.garden_id);
      const existingCodes = existingPlantvakken.map(p => p.letter_code).filter(Boolean);
      
      // Generate next available letter code
      const nextLetterCode = this.generateNextLetterCode(existingCodes);
      
      // Create new plantvak with letter code
      const newPlantvak = {
        ...plantvakData,
        letter_code: nextLetterCode,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('plant_beds')
        .insert(newPlantvak)
        .select()
        .single();

      if (error) throw error;
      
      console.log(`✅ Plantvak created with letter code: ${nextLetterCode}`);
      return data;
    } catch (error) {
      console.error('Error creating plantvak:', error);
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