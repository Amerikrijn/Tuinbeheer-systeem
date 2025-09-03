import {
  TASK_TYPE_CONFIGS,
  PRIORITY_CONFIGS,
  getTaskTypeConfig,
  getPriorityConfig,
  getTaskStatusColor,
  formatTaskDate,
  getWeekStartDate,
  getWeekEndDate
} from '@/lib/types/tasks';

describe('Tasks Types', () => {
  describe('Task Type Configurations', () => {
    it('should have all required task types', () => {
      const expectedTypes = ['watering', 'fertilizing', 'pruning', 'harvesting', 'planting', 'pest_control', 'general'];
      
      expect(TASK_TYPE_CONFIGS).toHaveLength(expectedTypes.length);
      
      expectedTypes.forEach(type => {
        const config = TASK_TYPE_CONFIGS.find(c => c.value === type);
        expect(config).toBeDefined();
        expect(config?.label).toBeDefined();
        expect(config?.icon).toBeDefined();
        expect(config?.color).toBeDefined();
        expect(config?.defaultPriority).toBeDefined();
      });
    });

    it('should have valid task type configurations', () => {
      TASK_TYPE_CONFIGS.forEach(config => {
        expect(config.value).toMatch(/^(watering|fertilizing|pruning|harvesting|planting|pest_control|general)$/);
        expect(config.label).toBeTruthy();
        expect(config.icon).toBeTruthy();
        expect(config.color).toMatch(/^#[0-9A-F]{6}$/i);
        expect(['low', 'medium', 'high']).toContain(config.defaultPriority);
      });
    });

    it('should have specific task type configurations', () => {
      const wateringConfig = TASK_TYPE_CONFIGS.find(c => c.value === 'watering');
      expect(wateringConfig).toBeDefined();
      expect(wateringConfig?.label).toBe('Water geven');
      expect(wateringConfig?.icon).toBe('💧');
      expect(wateringConfig?.defaultPriority).toBe('high');
      expect(wateringConfig?.defaultInterval).toBe(2);

      const fertilizingConfig = TASK_TYPE_CONFIGS.find(c => c.value === 'fertilizing');
      expect(fertilizingConfig).toBeDefined();
      expect(fertilizingConfig?.label).toBe('Bemesten');
      expect(fertilizingConfig?.icon).toBe('🌱');
      expect(fertilizingConfig?.defaultPriority).toBe('medium');
      expect(fertilizingConfig?.defaultInterval).toBe(14);
    });
  });

  describe('Priority Configurations', () => {
    it('should have all priority levels', () => {
      const expectedPriorities = ['low', 'medium', 'high'];
      
      expect(PRIORITY_CONFIGS).toHaveLength(expectedPriorities.length);
      
      expectedPriorities.forEach(priority => {
        const config = PRIORITY_CONFIGS.find(c => c.value === priority);
        expect(config).toBeDefined();
        expect(config?.label).toBeDefined();
        expect(config?.color).toBeDefined();
        expect(config?.badge_color).toBeDefined();
      });
    });

    it('should have valid priority configurations', () => {
      PRIORITY_CONFIGS.forEach(config => {
        expect(config.value).toMatch(/^(low|medium|high)$/);
        expect(config.label).toBeTruthy();
        expect(config.color).toMatch(/^#[0-9A-F]{6}$/i);
        expect(config.badge_color).toBeTruthy();
      });
    });

    it('should have specific priority configurations', () => {
      const lowConfig = PRIORITY_CONFIGS.find(c => c.value === 'low');
      expect(lowConfig).toBeDefined();
      expect(lowConfig?.label).toBe('Laag');
      expect(lowConfig?.color).toBe('#6B7280');
      expect(lowConfig?.badge_color).toContain('bg-gray-100 text-gray-800');

      const highConfig = PRIORITY_CONFIGS.find(c => c.value === 'high');
      expect(highConfig).toBeDefined();
      expect(highConfig?.label).toBe('Hoog');
      expect(highConfig?.color).toBe('#EF4444');
      expect(highConfig?.badge_color).toContain('bg-red-100');
      expect(highConfig?.badge_color).toContain('text-red-800');
    });
  });

  describe('Utility Functions', () => {
    describe('getTaskTypeConfig', () => {
      it('should return correct task type config', () => {
        const wateringConfig = getTaskTypeConfig('watering');
        expect(wateringConfig).toBeDefined();
        expect(wateringConfig?.value).toBe('watering');
        expect(wateringConfig?.label).toBe('Water geven');
      });

      it('should return undefined for invalid task type', () => {
        const invalidConfig = getTaskTypeConfig('invalid');
        expect(invalidConfig).toBeUndefined();
      });

      it('should handle all valid task types', () => {
        const validTypes = ['watering', 'fertilizing', 'pruning', 'harvesting', 'planting', 'pest_control', 'general'];
        
        validTypes.forEach(type => {
          const config = getTaskTypeConfig(type);
          expect(config).toBeDefined();
          expect(config?.value).toBe(type);
        });
      });
    });

    describe('getPriorityConfig', () => {
      it('should return correct priority config', () => {
        const highConfig = getPriorityConfig('high');
        expect(highConfig).toBeDefined();
        expect(highConfig?.value).toBe('high');
        expect(highConfig?.label).toBe('Hoog');
      });

      it('should return undefined for invalid priority', () => {
        const invalidConfig = getPriorityConfig('invalid');
        expect(invalidConfig).toBeUndefined();
      });

      it('should handle all valid priorities', () => {
        const validPriorities = ['low', 'medium', 'high'];
        
        validPriorities.forEach(priority => {
          const config = getPriorityConfig(priority);
          expect(config).toBeDefined();
          expect(config?.value).toBe(priority);
        });
      });
    });

    describe('getTaskStatusColor', () => {
      it('should return green for completed tasks', () => {
        const mockTask = {
          completed: true,
          status_category: 'upcoming'
        } as any;
        
        const color = getTaskStatusColor(mockTask);
        expect(color).toBe('#10B981');
      });

      it('should return red for overdue tasks', () => {
        const mockTask = {
          completed: false,
          status_category: 'overdue'
        } as any;
        
        const color = getTaskStatusColor(mockTask);
        expect(color).toBe('#EF4444');
      });

      it('should return orange for today tasks', () => {
        const mockTask = {
          completed: false,
          status_category: 'today'
        } as any;
        
        const color = getTaskStatusColor(mockTask);
        expect(color).toBe('#F59E0B');
      });

      it('should return gray for future tasks', () => {
        const mockTask = {
          completed: false,
          status_category: 'future'
        } as any;
        
        const color = getTaskStatusColor(mockTask);
        expect(color).toBe('#6B7280');
      });
    });

    describe('formatTaskDate', () => {
      it('should format today correctly', () => {
        const today = new Date();
        const formatted = formatTaskDate(today.toISOString());
        expect(formatted).toBe('Vandaag');
      });

      it('should format yesterday correctly', () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const formatted = formatTaskDate(yesterday.toISOString());
        expect(formatted).toBe('Gisteren');
      });

      it('should format tomorrow correctly', () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const formatted = formatTaskDate(tomorrow.toISOString());
        expect(formatted).toBe('Morgen');
      });

      it('should format other dates correctly', () => {
        const otherDate = new Date('2024-01-15');
        const formatted = formatTaskDate(otherDate.toISOString());
        expect(formatted).toMatch(/^[a-z]{2} \d{1,2} [a-z]{3}$/i); // Dutch format: "ma 15 jan"
      });
    });

    describe('getWeekStartDate', () => {
      it('should return Monday for a given date', () => {
        const testDate = new Date('2024-01-17'); // Wednesday
        const weekStart = getWeekStartDate(testDate);
        
        expect(weekStart.getDay()).toBe(1); // Monday
        expect(weekStart.getDate()).toBe(15); // January 15th
      });

      it('should handle Sunday correctly', () => {
        const testDate = new Date('2024-01-14'); // Sunday
        const weekStart = getWeekStartDate(testDate);
        
        expect(weekStart.getDay()).toBe(1); // Monday
        expect(weekStart.getDate()).toBe(8); // January 8th
      });

      it('should use current date when no date provided', () => {
        const weekStart = getWeekStartDate();
        expect(weekStart).toBeInstanceOf(Date);
        expect(weekStart.getDay()).toBe(1); // Monday
      });
    });

    describe('getWeekEndDate', () => {
      it('should return Sunday for a given week start', () => {
        const weekStart = new Date('2024-01-15'); // Monday
        const weekEnd = getWeekEndDate(weekStart);
        
        expect(weekEnd.getDay()).toBe(0); // Sunday
        expect(weekEnd.getDate()).toBe(21); // January 21st
      });

      it('should handle week spanning month boundary', () => {
        const weekStart = new Date('2024-01-29'); // Monday
        const weekEnd = getWeekEndDate(weekStart);
        
        expect(weekEnd.getDay()).toBe(0); // Sunday
        expect(weekEnd.getDate()).toBe(4); // February 4th
        expect(weekEnd.getMonth()).toBe(1); // February
      });
    });
  });

  describe('Integration', () => {
    it('should work together for complete workflow', () => {
      // Test task type and priority together
      const taskType = 'watering';
      const priority = 'high';
      
      const typeConfig = getTaskTypeConfig(taskType);
      const priorityConfig = getPriorityConfig(priority);
      
      expect(typeConfig).toBeDefined();
      expect(priorityConfig).toBeDefined();
      expect(typeConfig?.defaultPriority).toBe('high');
      expect(priorityConfig?.value).toBe('high');
    });

    it('should handle date formatting and week calculations together', () => {
      const testDate = new Date('2024-01-17'); // Wednesday
      const weekStart = getWeekStartDate(testDate);
      const weekEnd = getWeekEndDate(weekStart);
      
      expect(weekStart.getDay()).toBe(1); // Monday
      expect(weekEnd.getDay()).toBe(0); // Sunday
      expect(weekEnd.getTime() - weekStart.getTime()).toBe(6 * 24 * 60 * 60 * 1000); // 6 days difference
    });
  });
});