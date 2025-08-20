import {
  METERS_TO_PIXELS,
  GARDEN_CANVAS_WIDTH,
  GARDEN_CANVAS_HEIGHT,
  GARDEN_GRID_SIZE,
  PLANTVAK_MIN_WIDTH,
  PLANTVAK_MIN_HEIGHT,
  PLANTVAK_CANVAS_PADDING,
  FLOWER_SIZE_TINY,
  FLOWER_SIZE_SMALL,
  FLOWER_SIZE_MEDIUM,
  FLOWER_SIZE_LARGE,
  FLOWER_NAME_HEIGHT,
  metersToPixels,
  pixelsToMeters,
  parsePlantBedDimensions,
  calculatePlantBedCanvasSize
} from '@/lib/scaling-constants';

describe('Scaling Constants', () => {
  describe('Constants', () => {
    it('should have correct base scaling', () => {
      expect(METERS_TO_PIXELS).toBe(80);
    });

    it('should have correct garden canvas dimensions', () => {
      expect(GARDEN_CANVAS_WIDTH).toBe(1000);
      expect(GARDEN_CANVAS_HEIGHT).toBe(800);
    });

    it('should have correct garden grid size', () => {
      expect(GARDEN_GRID_SIZE).toBe(20);
    });

    it('should have correct plant bed minimum dimensions', () => {
      expect(PLANTVAK_MIN_WIDTH).toBe(80);
      expect(PLANTVAK_MIN_HEIGHT).toBe(80);
    });

    it('should have correct plant bed canvas padding', () => {
      expect(PLANTVAK_CANVAS_PADDING).toBe(100);
    });

    it('should have correct flower sizes', () => {
      expect(FLOWER_SIZE_TINY).toBe(20);
      expect(FLOWER_SIZE_SMALL).toBe(35);
      expect(FLOWER_SIZE_MEDIUM).toBe(45);
      expect(FLOWER_SIZE_LARGE).toBe(55);
    });

    it('should have correct flower name height', () => {
      expect(FLOWER_NAME_HEIGHT).toBe(30);
    });
  });

  describe('Utility Functions', () => {
    describe('metersToPixels', () => {
      it('should convert meters to pixels correctly', () => {
        expect(metersToPixels(1)).toBe(80);
        expect(metersToPixels(2.5)).toBe(200);
        expect(metersToPixels(0.5)).toBe(40);
      });

      it('should handle zero and negative values', () => {
        expect(metersToPixels(0)).toBe(0);
        expect(metersToPixels(-1)).toBe(-80);
      });
    });

    describe('pixelsToMeters', () => {
      it('should convert pixels to meters correctly', () => {
        expect(pixelsToMeters(80)).toBe(1);
        expect(pixelsToMeters(200)).toBe(2.5);
        expect(pixelsToMeters(40)).toBe(0.5);
      });

      it('should handle zero and negative values', () => {
        expect(pixelsToMeters(0)).toBe(0);
        expect(pixelsToMeters(-80)).toBe(-1);
      });
    });
  });

  describe('parsePlantBedDimensions', () => {
    it('should parse dimensions with "m" units', () => {
      const result = parsePlantBedDimensions('5m x 3m');
      expect(result).toEqual({
        lengthMeters: 5,
        widthMeters: 3,
        lengthPixels: 400,
        widthPixels: 240
      });
    });

    it('should parse dimensions with "X" separator', () => {
      const result = parsePlantBedDimensions('8X4');
      expect(result).toEqual({
        lengthMeters: 8,
        widthMeters: 4,
        lengthPixels: 640,
        widthPixels: 320
      });
    });

    it('should parse single dimension as square', () => {
      const result = parsePlantBedDimensions('6m');
      expect(result).toEqual({
        lengthMeters: 6,
        widthMeters: 6,
        lengthPixels: 480,
        widthPixels: 480
      });
    });

    it('should parse decimal dimensions', () => {
      const result = parsePlantBedDimensions('3.5 x 2.8');
      expect(result).toEqual({
        lengthMeters: 3.5,
        widthMeters: 2.8,
        lengthPixels: 280,
        widthPixels: 224
      });
    });

    it('should handle invalid input gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      const result = parsePlantBedDimensions('invalid');
      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith('Could not parse plant bed dimensions from:', 'invalid');
      
      consoleSpy.mockRestore();
    });

    it('should handle null/undefined input', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      const result = parsePlantBedDimensions(null as any);
      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith('Could not parse plant bed dimensions from:', null);
      
      consoleSpy.mockRestore();
    });
  });

  describe('calculatePlantBedCanvasSize', () => {
    it('should calculate canvas size for valid dimensions', () => {
      const result = calculatePlantBedCanvasSize('5m x 3m');
      expect(result).toEqual({
        width: 600, // max(600, 400 + 200)
        height: 480 // max(450, 240 + 200) + 30
      });
    });

    it('should maintain minimum canvas dimensions', () => {
      const result = calculatePlantBedCanvasSize('1m x 1m');
      expect(result).toEqual({
        width: 600, // max(600, 80 + 200)
        height: 480 // max(450, 80 + 200) + 30
      });
    });

    it('should maintain aspect ratio', () => {
      const result = calculatePlantBedCanvasSize('8m x 2m');
      expect(result.width / result.height).toBeGreaterThanOrEqual(1.2);
    });

    it('should return default size for invalid dimensions', () => {
      const result = calculatePlantBedCanvasSize('invalid');
      expect(result).toEqual({
        width: 700,
        height: 550
      });
    });

    it('should handle square dimensions', () => {
      const result = calculatePlantBedCanvasSize('4m');
      expect(result).toEqual({
        width: 624, // 320 + 200 + padding adjustment
        height: 550 // 320 + 200 + 30
      });
    });

    it('should handle very small dimensions', () => {
      const result = calculatePlantBedCanvasSize('0.5m x 0.5m');
      expect(result).toEqual({
        width: 600, // max(600, 40 + 200)
        height: 480 // max(450, 40 + 200) + 30
      });
    });

    it('should handle very large dimensions', () => {
      const result = calculatePlantBedCanvasSize('20m x 15m');
      expect(result).toEqual({
        width: 1800, // 1600 + 200
        height: 1430 // 1200 + 200 + 30
      });
    });
  });

  describe('Integration', () => {
    it('should work together for complete workflow', () => {
      const dimensions = '6m x 4m';
      const parsed = parsePlantBedDimensions(dimensions);
      const canvas = calculatePlantBedCanvasSize(dimensions);
      
      expect(parsed).toEqual({
        lengthMeters: 6,
        widthMeters: 4,
        lengthPixels: 480,
        widthPixels: 320
      });
      
      expect(canvas).toEqual({
        width: 680, // 480 + 200
        height: 550 // 320 + 200 + 30
      });
      
      // Verify scaling consistency
      expect(parsed!.lengthPixels).toBe(metersToPixels(parsed!.lengthMeters));
      expect(parsed!.widthPixels).toBe(metersToPixels(parsed!.widthMeters));
    });
  });
});