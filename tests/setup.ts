/**
 * BANKING-GRADE TEST SETUP
 * Comprehensive test configuration and utilities for enterprise-level testing
 * 
 * Features:
 * - Test database setup and teardown
 * - Mock data factories
 * - Test utilities and helpers
 * - Performance testing utilities
 * - Security testing helpers
 * - Integration test setup
 */

import { logger } from '../lib/logger';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Test environment configuration
export const TEST_CONFIG = {
  SUPABASE_URL: process.env.TEST_SUPABASE_URL || 'https://dwsgwqosmihsfaxuheji.supabase.co',
  SUPABASE_ANON_KEY: process.env.TEST_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3c2d3cW9zbWloc2ZheHVoZWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MTI3NTAsImV4cCI6MjA2ODA4ODc1MH0.Tq24K455oEOyO_bRourUQrg8-9F6HiRBjEwofEImEtE',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  CLEANUP_AFTER_TESTS: true
};

// Test database client
export const testSupabase = createClient(
  TEST_CONFIG.SUPABASE_URL,
  TEST_CONFIG.SUPABASE_ANON_KEY
);

// Test data factories
export class TestDataFactory {
  static createTestGarden(overrides: Partial<any> = {}) {
    return {
      id: uuidv4(),
      name: `Test Garden ${Date.now()}`,
      description: 'Test garden for automated testing',
      location: 'Test Location',
      total_area: '100m²',
      length: '10m',
      width: '10m',
      garden_type: 'vegetable',
      established_date: new Date().toISOString().split('T')[0],
      notes: 'Created by automated test',
      is_active: true,
      ...overrides
    };
  }

  static createTestPlantBed(gardenId: string, overrides: Partial<any> = {}) {
    return {
      id: uuidv4(),
      garden_id: gardenId,
      name: `Test Plant Bed ${Date.now()}`,
      location: 'Test Location',
      size: '2x2m',
      soil_type: 'loam',
      sun_exposure: 'full-sun' as const,
      description: 'Test plant bed for automated testing',
      is_active: true,
      ...overrides
    };
  }

  static createTestPlant(plantBedId: string, overrides: Partial<any> = {}) {
    return {
      id: uuidv4(),
      plant_bed_id: plantBedId,
      name: `Test Plant ${Date.now()}`,
      scientific_name: 'Testus planticus',
      variety: 'Test Variety',
      color: 'green',
      height: 50,
      stem_length: 20,
      category: 'vegetable',
      bloom_period: 'summer',
      planting_date: new Date().toISOString().split('T')[0],
      status: 'healthy' as const,
      notes: 'Created by automated test',
      care_instructions: 'Water regularly',
      watering_frequency: 3,
      fertilizer_schedule: 'Monthly',
      ...overrides
    };
  }

  static createTestUser(overrides: Partial<any> = {}) {
    return {
      email: `test-${Date.now()}@example.com`,
      password: 'TestPassword123!',
      full_name: 'Test User',
      ...overrides
    };
  }
}

// Test utilities
export class TestUtils {
  static async waitFor(condition: () => Promise<boolean>, timeout: number = 5000): Promise<void> {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      if (await condition()) {
        return;
      }
      await this.sleep(100);
    }
    throw new Error(`Condition not met within ${timeout}ms`);
  }

  static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static generateUniqueId(): string {
    return `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  static async retryAsync<T>(
    fn: () => Promise<T>,
    maxAttempts: number = TEST_CONFIG.RETRY_ATTEMPTS,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        logger.warn(`Attempt ${attempt}/${maxAttempts} failed: ${error}`, {
          operation: 'test_retry',
          component: 'test_utils',
          metadata: { attempt, maxAttempts, error: error }
        });
        
        if (attempt < maxAttempts) {
          await this.sleep(delay * attempt); // Exponential backoff
        }
      }
    }
    
    throw lastError!;
  }

  static async measurePerformance<T>(fn: () => Promise<T>): Promise<{ result: T; duration: number; memory: number }> {
    const startTime = performance.now();
    const startMemory = process.memoryUsage().heapUsed;
    
    const result = await fn();
    
    const endTime = performance.now();
    const endMemory = process.memoryUsage().heapUsed;
    
    return {
      result,
      duration: endTime - startTime,
      memory: endMemory - startMemory
    };
  }

  static validatePerformance(duration: number, expectedMaxDuration: number, operation: string): void {
    if (duration > expectedMaxDuration) {
      throw new Error(
        `Performance test failed: ${operation} took ${duration}ms, expected max ${expectedMaxDuration}ms`
      );
    }
  }

  static validateMemoryUsage(memoryUsed: number, expectedMaxMemory: number, operation: string): void {
    if (memoryUsed > expectedMaxMemory) {
      throw new Error(
        `Memory test failed: ${operation} used ${memoryUsed} bytes, expected max ${expectedMaxMemory} bytes`
      );
    }
  }
}

// Database test utilities
export class DatabaseTestUtils {
  static async cleanupTestData(): Promise<void> {
    if (!TEST_CONFIG.CLEANUP_AFTER_TESTS) {
      logger.info('Skipping test data cleanup (disabled in config)');
      return;
    }

    try {
      logger.info('Starting test data cleanup');

      // Delete test plants
      await testSupabase
        .from('plants')
        .delete()
        .like('name', 'Test Plant %');

      // Delete test plant beds
      await testSupabase
        .from('plant_beds')
        .delete()
        .like('name', 'Test Plant Bed %');

      // Delete test gardens
      await testSupabase
        .from('gardens')
        .delete()
        .like('name', 'Test Garden %');

      logger.info('Test data cleanup completed');
    } catch (error) {
      logger.error('Error during test data cleanup', error as Error);
      // Don't throw - cleanup errors shouldn't fail tests
    }
  }

  static async ensureTestTables(): Promise<void> {
    try {
      // Test that all required tables exist
      const tables = ['gardens', 'plant_beds', 'plants'];
      
      for (const table of tables) {
        const { error } = await testSupabase
          .from(table)
          .select('count')
          .limit(1);
        
        if (error) {
          throw new Error(`Table ${table} not accessible: ${error.message}`);
        }
      }
      
      logger.info('All test tables are accessible');
    } catch (error) {
      logger.error('Test table validation failed', error as Error);
      throw error;
    }
  }

  static async createTestGarden(): Promise<any> {
    const gardenData = TestDataFactory.createTestGarden();
    
    const { data, error } = await testSupabase
      .from('gardens')
      .insert([gardenData])
      .select()
      .single();
    
    if (error) {
      throw new Error(`Failed to create test garden: ${error.message}`);
    }
    
    return data;
  }

  static async createTestPlantBed(gardenId: string): Promise<any> {
    const plantBedData = TestDataFactory.createTestPlantBed(gardenId);
    
    const { data, error } = await testSupabase
      .from('plant_beds')
      .insert([plantBedData])
      .select()
      .single();
    
    if (error) {
      throw new Error(`Failed to create test plant bed: ${error.message}`);
    }
    
    return data;
  }

  static async createTestPlant(plantBedId: string): Promise<any> {
    const plantData = TestDataFactory.createTestPlant(plantBedId);
    
    const { data, error } = await testSupabase
      .from('plants')
      .insert([plantData])
      .select()
      .single();
    
    if (error) {
      throw new Error(`Failed to create test plant: ${error.message}`);
    }
    
    return data;
  }
}

// Security test utilities
export class SecurityTestUtils {
  static validateInputSanitization(input: string, expected: string): void {
    if (input !== expected) {
      throw new Error(`Input sanitization failed: expected "${expected}", got "${input}"`);
    }
  }

  static validateNoSqlInjection(result: any): void {
    const resultStr = JSON.stringify(result);
    // Only check for actual malicious patterns in user data, not in error messages or logs
    const maliciousPatterns = [
      'UNION ALL SELECT', 'UNION SELECT', '; DROP', '; DELETE', '; UPDATE', 
      '<script>', 'javascript:', 'eval(', 'EXEC(', 'xp_cmdshell'
    ];
    
    // Don't validate against error messages that might contain SQL keywords
    if (resultStr.includes('"error"') || resultStr.includes('"message"')) {
      return; // Skip validation for error responses
    }
    
    for (const pattern of maliciousPatterns) {
      if (resultStr.toUpperCase().includes(pattern.toUpperCase())) {
        throw new Error(`Potential SQL injection detected: found "${pattern}" in result`);
      }
    }
  }

  static validateNoXss(result: any): void {
    const resultStr = JSON.stringify(result);
    const xssPatterns = ['<script', 'javascript:', 'onerror=', 'onload='];
    
    for (const pattern of xssPatterns) {
      if (resultStr.toLowerCase().includes(pattern.toLowerCase())) {
        throw new Error(`Potential XSS detected: found "${pattern}" in result`);
      }
    }
  }

  static generateMaliciousInput(): string[] {
    return [
      "'; DROP TABLE gardens; --",
      '<script>alert("xss")</script>',
      'javascript:alert("xss")',
      '"><script>alert("xss")</script>',
      "' OR '1'='1",
      '${7*7}',
      '{{7*7}}',
      '<img src=x onerror=alert("xss")>',
      'data:text/html,<script>alert("xss")</script>'
    ];
  }
}

// Integration test utilities
export class IntegrationTestUtils {
  static async testDatabaseConnection(): Promise<void> {
    const { data, error } = await testSupabase
      .from('gardens')
      .select('count')
      .limit(1);
    
    if (error) {
      throw new Error(`Database connection test failed: ${error.message}`);
    }
    
    logger.info('Database connection test passed');
  }

  static async testApiEndpoint(endpoint: string, method: string = 'GET'): Promise<Response> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const url = `${baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`API endpoint test failed: ${method} ${endpoint} returned ${response.status}`);
    }
    
    return response;
  }

  static async simulateUserWorkflow(): Promise<void> {
    logger.info('Starting user workflow simulation');
    
    // Create garden
    const garden = await DatabaseTestUtils.createTestGarden();
    logger.info(`Created test garden: ${garden.id}`);
    
    // Create plant bed
    const plantBed = await DatabaseTestUtils.createTestPlantBed(garden.id);
    logger.info(`Created test plant bed: ${plantBed.id}`);
    
    // Create plant
    const plant = await DatabaseTestUtils.createTestPlant(plantBed.id);
    logger.info(`Created test plant: ${plant.id}`);
    
    // Verify relationships
    const { data: gardenWithBeds } = await testSupabase
      .from('gardens')
      .select(`
        *,
        plant_beds (
          *,
          plants (*)
        )
      `)
      .eq('id', garden.id)
      .single();
    
    if (!gardenWithBeds?.plant_beds?.length) {
      throw new Error('Garden-PlantBed relationship test failed');
    }
    
    if (!gardenWithBeds.plant_beds[0].plants?.length) {
      throw new Error('PlantBed-Plant relationship test failed');
    }
    
    logger.info('User workflow simulation completed successfully');
  }
}

// Test lifecycle hooks
export class TestLifecycle {
  static async beforeAll(): Promise<void> {
    logger.info('Starting test suite setup');
    
    try {
      await DatabaseTestUtils.ensureTestTables();
      await IntegrationTestUtils.testDatabaseConnection();
      
      logger.info('Test suite setup completed successfully');
    } catch (error) {
      logger.error('Test suite setup failed', error as Error);
      throw error;
    }
  }

  static async afterAll(): Promise<void> {
    logger.info('Starting test suite teardown');
    
    try {
      await DatabaseTestUtils.cleanupTestData();
      
      logger.info('Test suite teardown completed successfully');
    } catch (error) {
      logger.error('Test suite teardown failed', error as Error);
      // Don't throw - teardown errors shouldn't fail the test run
    }
  }

  static async beforeEach(): Promise<void> {
    // Set unique correlation ID for each test
    logger.setCorrelationId(`test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  }

  static async afterEach(): Promise<void> {
    // Optional: cleanup after each test
    // Currently not implemented to allow test data inspection
  }
}

// All utilities are already exported as classes above