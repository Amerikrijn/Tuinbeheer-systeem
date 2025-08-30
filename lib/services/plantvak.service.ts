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
        // Verwijder is_active filter voor letter code check
        // We willen ALLE plantvakken zien voor unieke letters
        .order('letter_code', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {

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

      console.log('📊 Existing plantvakken details:', existingPlantvakken.map(p => ({
        id: p.id,
        name: p.name,
        letter_code: p.letter_code,
        is_active: p.is_active
      })));
      
      const existingCodes = existingPlantvakken
        .map(p => p.letter_code || p.name) // Fallback naar name als letter_code null is
        .filter(Boolean);

      // Generate next available letter code
      const nextLetterCode = this.generateNextLetterCode(existingCodes.filter(Boolean) as string[]);

      // WERKENDE VERSIE - gebaseerd op database tests
      // Database genereert automatisch: id, timestamps, defaults
      const newPlantvak: any = {
        garden_id: plantvakData.garden_id,
        name: nextLetterCode,  // Bijv. "E", "F", etc.
        letter_code: nextLetterCode  // BELANGRIJK: moet zelfde zijn als name voor de constraint
      };
      
      // Voeg optionele velden toe als ze aanwezig zijn
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
      if (plantvakData.location) {
        newPlantvak.location = plantvakData.location;
      }
      
      console.log('📝 Inserting new plantvak:', JSON.stringify(newPlantvak, null, 2));

      const { data, error } = await supabase
        .from('plant_beds')
        .insert(newPlantvak)
        .select()
        .single();

      if (error) {

        throw error;
      }

      return data;
    } catch (error) {

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

      return null;
    }
  }
}