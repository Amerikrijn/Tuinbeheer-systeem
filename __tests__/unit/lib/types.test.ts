import { PlantBedFormData, PlantFormData, PlantBedPosition } from '@/lib/types';

describe('Type Definitions', () => {
  describe('PlantBedFormData', () => {
    it('should have correct structure', () => {
      const plantBed: PlantBedFormData = {
        id: 'bed-1',
        name: 'Test Bed',
        location: 'Backyard',
        size: '2x4m',
        soilType: 'Loamy',
        sunExposure: 'full-sun',
        description: 'A test plant bed'
      };

      expect(plantBed.id).toBe('bed-1');
      expect(plantBed.name).toBe('Test Bed');
      expect(plantBed.location).toBe('Backyard');
      expect(plantBed.size).toBe('2x4m');
      expect(plantBed.soilType).toBe('Loamy');
      expect(plantBed.sunExposure).toBe('full-sun');
      expect(plantBed.description).toBe('A test plant bed');
    });

    it('should accept valid sun exposure values', () => {
      const validExposures: PlantBedFormData['sunExposure'][] = ['full-sun', 'partial-sun', 'shade'];
      
      validExposures.forEach(exposure => {
        const plantBed: PlantBedFormData = {
          id: 'bed-1',
          name: 'Test Bed',
          location: 'Backyard',
          size: '2x4m',
          soilType: 'Loamy',
          sunExposure: exposure,
          description: 'A test plant bed'
        };
        
        expect(plantBed.sunExposure).toBe(exposure);
      });
    });
  });

  describe('PlantFormData', () => {
    it('should have correct structure with required fields', () => {
      const plant: PlantFormData = {
        name: 'Tomato',
        status: 'gezond'
      };

      expect(plant.name).toBe('Tomato');
      expect(plant.status).toBe('gezond');
    });

    it('should accept optional fields', () => {
      const plant: PlantFormData = {
        name: 'Tomato',
        scientificName: 'Solanum lycopersicum',
        variety: 'Cherry',
        color: 'Red',
        height: 60,
        plantingDate: '2024-03-01',
        expectedHarvestDate: '2024-07-01',
        status: 'gezond',
        notes: 'Growing well',
        careInstructions: 'Water daily',
        wateringFrequency: 1,
        fertilizerSchedule: 'Weekly'
      };

      expect(plant.scientificName).toBe('Solanum lycopersicum');
      expect(plant.variety).toBe('Cherry');
      expect(plant.color).toBe('Red');
      expect(plant.height).toBe(60);
      expect(plant.plantingDate).toBe('2024-03-01');
      expect(plant.expectedHarvestDate).toBe('2024-07-01');
      expect(plant.notes).toBe('Growing well');
      expect(plant.careInstructions).toBe('Water daily');
      expect(plant.wateringFrequency).toBe(1);
      expect(plant.fertilizerSchedule).toBe('Weekly');
    });

    it('should accept valid status values', () => {
      const validStatuses: PlantFormData['status'][] = ['gezond', 'aandacht_nodig', 'ziek', 'dood', 'geoogst'];
      
      validStatuses.forEach(status => {
        const plant: PlantFormData = {
          name: 'Test Plant',
          status: status
        };
        
        expect(plant.status).toBe(status);
      });
    });
  });

  describe('PlantBedPosition', () => {
    it('should have correct structure', () => {
      const position: PlantBedPosition = {
        id: 'pos-1',
        x: 10,
        y: 20,
        width: 100,
        height: 50,
        rotation: 45
      };

      expect(position.id).toBe('pos-1');
      expect(position.x).toBe(10);
      expect(position.y).toBe(20);
      expect(position.width).toBe(100);
      expect(position.height).toBe(50);
      expect(position.rotation).toBe(45);
    });

    it('should accept numeric values for coordinates and dimensions', () => {
      const position: PlantBedPosition = {
        id: 'pos-1',
        x: 0,
        y: 0,
        width: 1.5,
        height: 2.5,
        rotation: 0
      };

      expect(typeof position.x).toBe('number');
      expect(typeof position.y).toBe('number');
      expect(typeof position.width).toBe('number');
      expect(typeof position.height).toBe('number');
      expect(typeof position.rotation).toBe('number');
    });
  });
});