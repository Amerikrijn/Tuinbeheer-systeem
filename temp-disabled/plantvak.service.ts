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
      if (process.env.NODE_ENV === "development") { // Console logging removed for banking standards
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
      if (process.env.NODE_ENV === "development") { // Console logging removed for banking standards
      
      // Validate input data
      if (!plantvakData.garden_id) {
        throw new Error('Garden ID is required');
      }
      
      // Get existing letter codes for this garden
      const existingPlantvakken = await this.getByGarden(plantvakData.garden_id);
      if (process.env.NODE_ENV === "development") { // Console logging removed for banking standards
      
      const existingCodes = existingPlantvakken.map(p => p.letter_code).filter(Boolean);
      if (process.env.NODE_ENV === "development") { // Console logging removed for banking standards
      
      // Generate next available letter code
      const nextLetterCode = this.generateNextLetterCode(existingCodes.filter(Boolean) as string[]);
      if (process.env.NODE_ENV === "development") { // Console logging removed for banking standards
      
      // Generate a unique ID for the plantvak
      const uniqueId = `plantvak-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      if (process.env.NODE_ENV === "development") { // Console logging removed for banking standards
      
      // Create new plantvak with letter code and ID
      // Use the letter code as the name if no name is provided
      const newPlantvak = {
        id: uniqueId,
        name: plantvakData.name || nextLetterCode, // Use provided name or letter code
        ...plantvakData,
        letter_code: nextLetterCode,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      if (process.env.NODE_ENV === "development") { // Console logging removed for banking standards

      const { data, error } = await supabase
        .from('plant_beds')
        .insert(newPlantvak)
        .select()
        .single();

      if (error) {
        if (process.env.NODE_ENV === "development") { // Console logging removed for banking standards
        // Console logging removed for banking standards.error('❌ Error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }
      
      if (process.env.NODE_ENV === "development") { // Console logging removed for banking standards
      if (process.env.NODE_ENV === "development") { // Console logging removed for banking standards
      return data;
    } catch (error) {
      if (process.env.NODE_ENV === "development") { // Console logging removed for banking standards
      if (error && typeof error === 'object' && 'message' in error) {
        const errorObj = error as { message?: string; code?: string; details?: string; hint?: string; stack?: string }
        // Console logging removed for banking standards.error('❌ Error details:', {
          message: errorObj.message,
          code: errorObj.code,
          details: errorObj.details,
          hint: errorObj.hint,
          stack: errorObj.stack
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
      if (process.env.NODE_ENV === "development") { // Console logging removed for banking standards
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
      if (process.env.NODE_ENV === "development") { // Console logging removed for banking standards
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
      if (process.env.NODE_ENV === "development") { // Console logging removed for banking standards
      return null;
    }
  }
}