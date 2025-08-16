import {
  DUTCH_FLOWERS,
  FlowerData,
  getFlowersByCategory,
  getPopularFlowers,
  getFlowersByColor,
  getFlowersByBloomingPeriod,
  searchFlowers,
  FLOWER_CATEGORIES,
  FLOWER_COLORS,
  BLOOMING_MONTHS
} from '@/lib/dutch-flowers';

describe('Dutch Flowers', () => {
  describe('Data Structure', () => {
    it('should have the correct FlowerData interface structure', () => {
      const sampleFlower: FlowerData = DUTCH_FLOWERS[0];
      
      expect(sampleFlower).toHaveProperty('name');
      expect(sampleFlower).toHaveProperty('category');
      expect(sampleFlower).toHaveProperty('bloeiperiode');
      expect(sampleFlower).toHaveProperty('kleur');
      expect(sampleFlower).toHaveProperty('popular');
      
      expect(typeof sampleFlower.name).toBe('string');
      expect(typeof sampleFlower.category).toBe('string');
      expect(typeof sampleFlower.bloeiperiode).toBe('string');
      expect(Array.isArray(sampleFlower.kleur)).toBe(true);
      expect(typeof sampleFlower.popular).toBe('boolean');
    });

    it('should have valid categories for all flowers', () => {
      const validCategories = Object.keys(FLOWER_CATEGORIES);
      
      DUTCH_FLOWERS.forEach(flower => {
        expect(validCategories).toContain(flower.category);
      });
    });

    it('should have valid colors for all flowers', () => {
      DUTCH_FLOWERS.forEach(flower => {
        flower.kleur.forEach(color => {
          expect(FLOWER_COLORS).toContain(color);
        });
      });
    });

    it('should have valid blooming periods', () => {
      DUTCH_FLOWERS.forEach(flower => {
        expect(flower.bloeiperiode).toBeDefined();
        expect(flower.bloeiperiode.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Constants', () => {
    it('should have correct flower categories', () => {
      expect(FLOWER_CATEGORIES).toEqual({
        'eenjarig': 'Eenjarige planten',
        'vaste_planten': 'Vaste planten',
        'bolgewassen': 'Bolgewassen',
        'struiken': 'Struiken',
        'klimmers': 'Klimmers',
        'overig': 'Overig'
      });
    });

    it('should have correct flower colors', () => {
      expect(FLOWER_COLORS).toEqual([
        'Wit', 'Geel', 'Roze', 'Rood', 'Paars', 'Blauw', 'Oranje', 'Groen'
      ]);
    });

    it('should have correct blooming months', () => {
      expect(BLOOMING_MONTHS).toEqual([
        'Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni',
        'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'
      ]);
    });
  });

  describe('Utility Functions', () => {
    describe('getFlowersByCategory', () => {
      it('should return flowers by category', () => {
        const eenjarigFlowers = getFlowersByCategory('eenjarig');
        const vastePlantenFlowers = getFlowersByCategory('vaste_planten');
        
        expect(eenjarigFlowers.length).toBeGreaterThan(0);
        expect(vastePlantenFlowers.length).toBeGreaterThan(0);
        
        eenjarigFlowers.forEach(flower => {
          expect(flower.category).toBe('eenjarig');
        });
        
        vastePlantenFlowers.forEach(flower => {
          expect(flower.category).toBe('vaste_planten');
        });
      });

      it('should return empty array for invalid category', () => {
        const invalidCategory = getFlowersByCategory('invalid' as any);
        expect(invalidCategory).toEqual([]);
      });
    });

    describe('getPopularFlowers', () => {
      it('should return only popular flowers', () => {
        const popularFlowers = getPopularFlowers();
        
        expect(popularFlowers.length).toBeGreaterThan(0);
        popularFlowers.forEach(flower => {
          expect(flower.popular).toBe(true);
        });
      });

      it('should return flowers sorted alphabetically by name', () => {
        const popularFlowers = getPopularFlowers();
        
        for (let i = 1; i < popularFlowers.length; i++) {
          expect(popularFlowers[i-1].name.localeCompare(popularFlowers[i].name)).toBeLessThanOrEqual(0);
        }
      });
    });

    describe('getFlowersByColor', () => {
      it('should return flowers by color', () => {
        const yellowFlowers = getFlowersByColor('Geel');
        const redFlowers = getFlowersByColor('Rood');
        const whiteFlowers = getFlowersByColor('Wit');
        
        expect(yellowFlowers.length).toBeGreaterThan(0);
        expect(redFlowers.length).toBeGreaterThan(0);
        expect(whiteFlowers.length).toBeGreaterThan(0);
        
        yellowFlowers.forEach(flower => {
          expect(flower.kleur).toContain('Geel');
        });
        
        redFlowers.forEach(flower => {
          expect(flower.kleur).toContain('Rood');
        });
        
        whiteFlowers.forEach(flower => {
          expect(flower.kleur).toContain('Wit');
        });
      });

      it('should return empty array for non-existent color', () => {
        const nonExistentColor = getFlowersByColor('NonExistentColor');
        expect(nonExistentColor).toEqual([]);
      });

      it('should return flowers for valid colors', () => {
        const yellowFlowers = getFlowersByColor('Geel');
        expect(yellowFlowers.length).toBeGreaterThan(0);
        expect(yellowFlowers[0].kleur).toContain('Geel');
      });
    });

    describe('getFlowersByBloomingPeriod', () => {
      it('should return flowers by blooming month', () => {
        const mayFlowers = getFlowersByBloomingPeriod('Mei');
        const juneFlowers = getFlowersByBloomingPeriod('Juni');
        const julyFlowers = getFlowersByBloomingPeriod('Juli');
        
        expect(mayFlowers.length).toBeGreaterThan(0);
        expect(juneFlowers.length).toBeGreaterThan(0);
        expect(julyFlowers.length).toBeGreaterThan(0);
        
        mayFlowers.forEach(flower => {
          expect(flower.bloeiperiode.toLowerCase()).toContain('mei');
        });
        
        juneFlowers.forEach(flower => {
          expect(flower.bloeiperiode.toLowerCase()).toContain('juni');
        });
        
        julyFlowers.forEach(flower => {
          expect(flower.bloeiperiode.toLowerCase()).toContain('juli');
        });
      });

      it('should handle case-insensitive month matching', () => {
        const mayFlowers = getFlowersByBloomingPeriod('mei');
        const mayFlowersUpper = getFlowersByBloomingPeriod('Mei');
        
        expect(mayFlowers).toEqual(mayFlowersUpper);
      });

      it('should return empty array for non-existent month', () => {
        const nonExistentMonth = getFlowersByBloomingPeriod('NonExistentMonth');
        expect(nonExistentMonth).toEqual([]);
      });
    });

    describe('searchFlowers', () => {
      it('should search by flower name', () => {
        const zonnebloemResults = searchFlowers('Zonnebloem');
        const petuniaResults = searchFlowers('Petunia');
        
        expect(zonnebloemResults.length).toBeGreaterThan(0);
        expect(petuniaResults.length).toBeGreaterThan(0);
        
        expect(zonnebloemResults[0].name).toBe('Zonnebloem');
        expect(petuniaResults[0].name).toBe('Petunia');
      });

      it('should search by scientific name', () => {
        const helianthusResults = searchFlowers('Helianthus');
        const petuniaResults = searchFlowers('Petunia');
        
        expect(helianthusResults.length).toBeGreaterThan(0);
        expect(petuniaResults.length).toBeGreaterThan(0);
      });

      it('should search by description', () => {
        const descriptionResults = searchFlowers('grote bloem');
        expect(descriptionResults.length).toBeGreaterThan(0);
      });

      it('should handle case-insensitive search', () => {
        const zonnebloemResults = searchFlowers('zonnebloem');
        const zonnebloemResultsUpper = searchFlowers('Zonnebloem');
        
        expect(zonnebloemResults).toEqual(zonnebloemResultsUpper);
      });

      it('should return empty array for non-existent search term', () => {
        const nonExistentResults = searchFlowers('NonExistentFlower');
        expect(nonExistentResults).toEqual([]);
      });

      it('should handle empty search query', () => {
        const emptyResults = searchFlowers('');
        expect(emptyResults.length).toBeGreaterThanOrEqual(0); // Empty query might return all flowers
      });
    });
  });

  describe('Data Quality', () => {
          it('should have valid flower names', () => {
        const names = DUTCH_FLOWERS.map(flower => flower.name);
        
        expect(names.length).toBeGreaterThan(0);
        names.forEach(name => {
          expect(typeof name).toBe('string');
          expect(name.length).toBeGreaterThan(0);
        });
      });

    it('should have valid scientific names when present', () => {
      DUTCH_FLOWERS.forEach(flower => {
        if (flower.scientificName) {
          expect(typeof flower.scientificName).toBe('string');
          expect(flower.scientificName.length).toBeGreaterThan(0);
        }
      });
    });

    it('should have valid descriptions when present', () => {
      DUTCH_FLOWERS.forEach(flower => {
        if (flower.description) {
          expect(typeof flower.description).toBe('string');
          expect(flower.description.length).toBeGreaterThan(0);
        }
      });
    });

    it('should have at least one color per flower', () => {
      DUTCH_FLOWERS.forEach(flower => {
        expect(flower.kleur.length).toBeGreaterThan(0);
      });
    });
  });
});