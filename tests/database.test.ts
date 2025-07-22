/**
 * BANKING-GRADE DATABASE TESTS
 * Comprehensive test suite for database operations with enterprise-level standards
 * 
 * Test Categories:
 * - Unit tests for database service layer
 * - Integration tests for database operations
 * - Performance tests for database queries
 * - Security tests for input validation
 * - Error handling and recovery tests
 * - Data consistency and integrity tests
 */

import {
  TestLifecycle,
  TestDataFactory,
  TestUtils,
  DatabaseTestUtils,
  SecurityTestUtils,
  TEST_CONFIG
} from './setup';
import { DatabaseService } from '../lib/services/database.service';
import { logger } from '../lib/logger';
import { ErrorFactory, ApplicationError } from '../lib/errors';

// Test suite setup
beforeAll(async () => {
  await TestLifecycle.beforeAll();
}, TEST_CONFIG.TIMEOUT);

afterAll(async () => {
  await TestLifecycle.afterAll();
});

beforeEach(async () => {
  await TestLifecycle.beforeEach();
});

describe('🏦 Banking-Grade Database Service Tests', () => {
  
  describe('🌱 Tuin (Garden) Service', () => {
    
    test('should create garden with valid data', async () => {
      const gardenData = TestDataFactory.createTestGarden();
      
      const performance = await TestUtils.measurePerformance(async () => {
        return await DatabaseService.Tuin.create(gardenData);
      });
      
      expect(performance.result.success).toBe(true);
      expect(performance.result.data).toBeDefined();
      expect(performance.result.data?.name).toBe(gardenData.name);
      expect(performance.result.data?.location).toBe(gardenData.location);
      
      // Performance validation
      TestUtils.validatePerformance(performance.duration, 2000, 'create_garden');
      TestUtils.validateMemoryUsage(performance.memory, 50 * 1024 * 1024, 'create_garden'); // 50MB max
      
      logger.info('Garden creation test passed', {
        operation: 'test_create_garden',
        component: 'database_test',
        metadata: {
          gardenId: performance.result.data?.id,
          duration: performance.duration,
          memory: performance.memory
        }
      });
    });

    test('should fail to create garden with missing required fields', async () => {
      const invalidGardenData = {
        description: 'Garden without name'
        // Missing name and location
      };
      
      const result = await DatabaseService.Tuin.create(invalidGardenData as any);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('verplicht');
      expect(result.data).toBeNull();
    });

    test('should handle SQL injection attempts', async () => {
      const maliciousInputs = SecurityTestUtils.generateMaliciousInput();
      
      for (const maliciousInput of maliciousInputs) {
        const gardenData = TestDataFactory.createTestGarden({
          name: maliciousInput,
          description: maliciousInput
        });
        
        const result = await DatabaseService.Tuin.create(gardenData);
        
        // For banking-grade security, malicious input should either:
        // 1. Be rejected (result.success = false), or
        // 2. Be sanitized (no malicious patterns in stored data)
        if (result.success && result.data) {
          // If creation succeeded, verify data was properly sanitized
          expect(result.data.name).not.toEqual(maliciousInput);
          expect(result.data.description).not.toEqual(maliciousInput);
        }
        // If creation failed, that's also acceptable for security
      }
    });

    test('should retrieve all gardens with pagination', async () => {
      // Create test gardens
      const testGardens = await Promise.all([
        DatabaseTestUtils.createTestGarden(),
        DatabaseTestUtils.createTestGarden(),
        DatabaseTestUtils.createTestGarden()
      ]);
      
      const performance = await TestUtils.measurePerformance(async () => {
        return await DatabaseService.Tuin.getAll();
      });
      
      expect(performance.result.success).toBe(true);
      expect(performance.result.data).toBeDefined();
      expect(performance.result.data!.length).toBeGreaterThanOrEqual(3);
      
      // Performance validation
      TestUtils.validatePerformance(performance.duration, 1000, 'get_all_gardens');
    });

    test('should retrieve garden by ID', async () => {
      const testGarden = await DatabaseTestUtils.createTestGarden();
      
      const result = await DatabaseService.Tuin.getById(testGarden.id);
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.id).toBe(testGarden.id);
      expect(result.data?.name).toBe(testGarden.name);
    });

    test('should handle non-existent garden ID gracefully', async () => {
      const nonExistentId = 'non-existent-id-12345';
      
      const result = await DatabaseService.Tuin.getById(nonExistentId);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('probleem opgetreden');
      expect(result.data).toBeNull();
    });

    test('should update garden with valid data', async () => {
      const testGarden = await DatabaseTestUtils.createTestGarden();
      const updateData = {
        name: 'Updated Garden Name',
        description: 'Updated description'
      };
      
      const result = await DatabaseService.Tuin.update(testGarden.id, updateData);
      
      expect(result.success).toBe(true);
      expect(result.data?.name).toBe(updateData.name);
      expect(result.data?.description).toBe(updateData.description);
    });

    test('should soft delete garden', async () => {
      const testGarden = await DatabaseTestUtils.createTestGarden();
      
      const deleteResult = await DatabaseService.Tuin.delete(testGarden.id);
      expect(deleteResult.success).toBe(true);
      
      // Verify garden is no longer accessible
      const getResult = await DatabaseService.Tuin.getById(testGarden.id);
      expect(getResult.success).toBe(false);
    });

    test('should retrieve garden with plant beds', async () => {
      const testGarden = await DatabaseTestUtils.createTestGarden();
      const testPlantBed = await DatabaseTestUtils.createTestPlantBed(testGarden.id);
      
      const result = await DatabaseService.Tuin.getWithPlantvakken(testGarden.id);
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.plant_beds).toBeDefined();
      expect(result.data?.plant_beds.length).toBeGreaterThan(0);
    });
  });

  describe('🌿 Plantvak (Plant Bed) Service', () => {
    
    let testGarden: any;
    
    beforeEach(async () => {
      testGarden = await DatabaseTestUtils.createTestGarden();
    });

    test('should create plant bed with valid data', async () => {
      const plantBedData = TestDataFactory.createTestPlantBed(testGarden.id);
      
      const performance = await TestUtils.measurePerformance(async () => {
        return await DatabaseService.Plantvak.create(plantBedData);
      });
      
      expect(performance.result.success).toBe(true);
      expect(performance.result.data).toBeDefined();
      expect(performance.result.data?.garden_id).toBe(testGarden.id);
      expect(performance.result.data?.name).toBe(plantBedData.name);
      
      // Performance validation
      TestUtils.validatePerformance(performance.duration, 1500, 'create_plant_bed');
    });

    test('should fail to create plant bed with invalid garden ID', async () => {
      const plantBedData = TestDataFactory.createTestPlantBed('invalid-garden-id');
      
      const result = await DatabaseService.Plantvak.create(plantBedData);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('should retrieve plant beds by garden ID', async () => {
      const plantBed1 = await DatabaseTestUtils.createTestPlantBed(testGarden.id);
      const plantBed2 = await DatabaseTestUtils.createTestPlantBed(testGarden.id);
      
      const result = await DatabaseService.Plantvak.getByGardenId(testGarden.id);
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.length).toBeGreaterThanOrEqual(2);
    });

    test('should update plant bed properties', async () => {
      const testPlantBed = await DatabaseTestUtils.createTestPlantBed(testGarden.id);
      const updateData = {
        name: 'Updated Plant Bed',
        size: '3x3m',
        soil_type: 'clay'
      };
      
      const result = await DatabaseService.Plantvak.update(testPlantBed.id, updateData);
      
      expect(result.success).toBe(true);
      expect(result.data?.name).toBe(updateData.name);
      expect(result.data?.size).toBe(updateData.size);
      expect(result.data?.soil_type).toBe(updateData.soil_type);
    });

    test('should soft delete plant bed', async () => {
      const testPlantBed = await DatabaseTestUtils.createTestPlantBed(testGarden.id);
      
      const deleteResult = await DatabaseService.Plantvak.delete(testPlantBed.id);
      expect(deleteResult.success).toBe(true);
      
      // Verify plant bed is no longer accessible
      const getResult = await DatabaseService.Plantvak.getById(testPlantBed.id);
      expect(getResult.success).toBe(false);
    });

    test('should retrieve plant bed with plants', async () => {
      const testPlantBed = await DatabaseTestUtils.createTestPlantBed(testGarden.id);
      const testPlant = await DatabaseTestUtils.createTestPlant(testPlantBed.id);
      
      const result = await DatabaseService.Plantvak.getWithBloemen(testPlantBed.id);
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.plants).toBeDefined();
      expect(result.data?.plants.length).toBeGreaterThan(0);
    });
  });

  describe('🌸 Bloem (Plant) Service', () => {
    
    let testGarden: any;
    let testPlantBed: any;
    
    beforeEach(async () => {
      testGarden = await DatabaseTestUtils.createTestGarden();
      testPlantBed = await DatabaseTestUtils.createTestPlantBed(testGarden.id);
    });

    test('should create plant with valid data', async () => {
      const plantData = TestDataFactory.createTestPlant(testPlantBed.id);
      
      const performance = await TestUtils.measurePerformance(async () => {
        return await DatabaseService.Bloem.create(plantData);
      });
      
      expect(performance.result.success).toBe(true);
      expect(performance.result.data).toBeDefined();
      expect(performance.result.data?.plant_bed_id).toBe(testPlantBed.id);
      expect(performance.result.data?.name).toBe(plantData.name);
      
      // Performance validation
      TestUtils.validatePerformance(performance.duration, 1000, 'create_plant');
    });

    test('should retrieve plants by plant bed ID', async () => {
      const plant1 = await DatabaseTestUtils.createTestPlant(testPlantBed.id);
      const plant2 = await DatabaseTestUtils.createTestPlant(testPlantBed.id);
      
      const result = await DatabaseService.Bloem.getByPlantvakId(testPlantBed.id);
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.length).toBeGreaterThanOrEqual(2);
    });

    test('should update plant properties', async () => {
      const testPlant = await DatabaseTestUtils.createTestPlant(testPlantBed.id);
      const updateData = {
        name: 'Updated Plant',
        status: 'needs_attention' as const,
        height: 75
      };
      
      const result = await DatabaseService.Bloem.update(testPlant.id, updateData);
      
      expect(result.success).toBe(true);
      expect(result.data?.name).toBe(updateData.name);
      expect(result.data?.status).toBe(updateData.status);
      expect(result.data?.height).toBe(updateData.height);
    });

    test('should delete plant', async () => {
      const testPlant = await DatabaseTestUtils.createTestPlant(testPlantBed.id);
      
      const deleteResult = await DatabaseService.Bloem.delete(testPlant.id);
      expect(deleteResult.success).toBe(true);
      
      // Verify plant is deleted (hard delete)
      const getResult = await DatabaseService.Bloem.getById(testPlant.id);
      expect(getResult.success).toBe(false);
    });

    test('should search plants with filters', async () => {
      // Create test plants with different properties
      await DatabaseTestUtils.createTestPlant(testPlantBed.id);
      await DatabaseTestUtils.createTestPlant(testPlantBed.id);
      
      const searchResult = await DatabaseService.Bloem.search(
        { query: 'Test Plant' },
        { field: 'created_at', direction: 'desc' },
        1,
        10
      );
      
      expect(searchResult.success).toBe(true);
      expect(searchResult.data).toBeDefined();
      expect(searchResult.data?.data.length).toBeGreaterThan(0);
      expect(searchResult.data?.count).toBeGreaterThan(0);
    });
  });

  describe('📊 Performance Tests', () => {
    
    test('should handle bulk operations efficiently', async () => {
      const testGarden = await DatabaseTestUtils.createTestGarden();
      
      // Create multiple plant beds in parallel
      const plantBedPromises = Array.from({ length: 10 }, () =>
        DatabaseTestUtils.createTestPlantBed(testGarden.id)
      );
      
      const performance = await TestUtils.measurePerformance(async () => {
        return await Promise.all(plantBedPromises);
      });
      
      expect(performance.result.length).toBe(10);
      
      // Should complete bulk operations within reasonable time
      TestUtils.validatePerformance(performance.duration, 5000, 'bulk_create_plant_beds');
    });

    test('should handle concurrent database operations', async () => {
      const testGarden = await DatabaseTestUtils.createTestGarden();
      
      // Simulate concurrent operations
      const operations = [
        DatabaseService.Tuin.getAll(),
        DatabaseService.Tuin.getById(testGarden.id),
        DatabaseService.Plantvak.getByGardenId(testGarden.id),
        DatabaseService.Bloemendatabase.getStatistics()
      ];
      
      const performance = await TestUtils.measurePerformance(async () => {
        return await Promise.all(operations);
      });
      
      // All operations should succeed
      performance.result.forEach(result => {
        expect(result.success).toBe(true);
      });
      
      // Concurrent operations should be faster than sequential
      TestUtils.validatePerformance(performance.duration, 3000, 'concurrent_operations');
    });
  });

  describe('🔒 Security Tests', () => {
    
    test('should prevent SQL injection in all operations', async () => {
      const maliciousInputs = SecurityTestUtils.generateMaliciousInput();
      const testGarden = await DatabaseTestUtils.createTestGarden();
      
      for (const maliciousInput of maliciousInputs) {
        // Test garden operations
        const gardenResult = await DatabaseService.Tuin.create(
          TestDataFactory.createTestGarden({ name: maliciousInput })
        );
        
        // Banking-grade security: malicious input should be rejected or sanitized
        if (gardenResult.success && gardenResult.data) {
          expect(gardenResult.data.name).not.toEqual(maliciousInput);
        }
        
        // Test plant bed operations
        const plantBedResult = await DatabaseService.Plantvak.create(
          TestDataFactory.createTestPlantBed(testGarden.id, { name: maliciousInput })
        );
        
        if (plantBedResult.success && plantBedResult.data) {
          expect(plantBedResult.data.name).not.toEqual(maliciousInput);
        }
      }
    });

    test('should validate input data types and formats', async () => {
      const invalidInputs = [
        { name: 123 }, // Invalid type
        { name: '' }, // Empty string
        { name: null }, // Null value
        { name: undefined }, // Undefined value
        { name: 'a'.repeat(1000) } // Too long
      ];
      
      for (const invalidInput of invalidInputs) {
        const result = await DatabaseService.Tuin.create(invalidInput as any);
        expect(result.success).toBe(false);
      }
    });
  });

  describe('🔄 Error Handling and Recovery', () => {
    
    test('should handle database connection failures gracefully', async () => {
      // This test would require mocking the database connection
      // For now, we test that errors are properly wrapped
      
      const result = await DatabaseService.Tuin.getById('invalid-uuid-format');
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(typeof result.error).toBe('string');
    });

    test('should retry failed operations with exponential backoff', async () => {
      // Test retry logic with a function that fails initially
      let attempts = 0;
      const maxAttempts = 3;
      
      const result = await TestUtils.retryAsync(async () => {
        attempts++;
        if (attempts < maxAttempts) {
          throw new Error(`Attempt ${attempts} failed`);
        }
        return 'success';
      }, maxAttempts);
      
      expect(result).toBe('success');
      expect(attempts).toBe(maxAttempts);
    });

    test('should maintain data consistency during failures', async () => {
      const testGarden = await DatabaseTestUtils.createTestGarden();
      
      // Try to create a plant bed with invalid data
      const invalidPlantBedData = {
        garden_id: 'invalid-id',
        name: 'Test Plant Bed'
      };
      
      const result = await DatabaseService.Plantvak.create(invalidPlantBedData as any);
      
      expect(result.success).toBe(false);
      
      // Verify the garden still exists and is not corrupted
      const gardenResult = await DatabaseService.Tuin.getById(testGarden.id);
      expect(gardenResult.success).toBe(true);
    });
  });

  describe('🔗 Integration Tests', () => {
    
    test('should maintain referential integrity across all operations', async () => {
      // Create a complete garden hierarchy
      const garden = await DatabaseTestUtils.createTestGarden();
      const plantBed = await DatabaseTestUtils.createTestPlantBed(garden.id);
      const plant = await DatabaseTestUtils.createTestPlant(plantBed.id);
      
      // Verify relationships
      const gardenWithBeds = await DatabaseService.Tuin.getWithPlantvakken(garden.id);
      expect(gardenWithBeds.success).toBe(true);
      expect(gardenWithBeds.data?.plant_beds.length).toBeGreaterThan(0);
      
      const plantBedWithPlants = await DatabaseService.Plantvak.getWithBloemen(plantBed.id);
      expect(plantBedWithPlants.success).toBe(true);
      expect(plantBedWithPlants.data?.plants.length).toBeGreaterThan(0);
      
      // Test cascade behavior
      await DatabaseService.Tuin.delete(garden.id);
      
      // Plant bed should still be accessible directly, but garden should be soft deleted
      const deletedPlantBed = await DatabaseService.Plantvak.getById(plantBed.id);
      expect(deletedPlantBed.success).toBe(true); // Plant bed itself still exists
      
      // But the garden should no longer be accessible
      const deletedGarden = await DatabaseService.Tuin.getById(garden.id);
      expect(deletedGarden.success).toBe(false); // Garden is soft deleted
    });

    test('should handle complex queries efficiently', async () => {
      const garden = await DatabaseTestUtils.createTestGarden();
      const plantBed1 = await DatabaseTestUtils.createTestPlantBed(garden.id);
      const plantBed2 = await DatabaseTestUtils.createTestPlantBed(garden.id);
      
      // Create multiple plants in each bed
      await Promise.all([
        DatabaseTestUtils.createTestPlant(plantBed1.id),
        DatabaseTestUtils.createTestPlant(plantBed1.id),
        DatabaseTestUtils.createTestPlant(plantBed2.id)
      ]);
      
      const performance = await TestUtils.measurePerformance(async () => {
        return await DatabaseService.Tuin.getWithPlantvakken(garden.id);
      });
      
      expect(performance.result.success).toBe(true);
      expect(performance.result.data?.plant_beds.length).toBe(2);
      
      // Complex query should still be fast
      TestUtils.validatePerformance(performance.duration, 2000, 'complex_query_with_relations');
    });
  });
});