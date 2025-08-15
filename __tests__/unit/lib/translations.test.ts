import {
  t,
  getTranslation,
  setLanguage,
  getCurrentLanguage,
  loadTranslations,
  getAllTranslations,
  hasTranslation,
  getAvailableLanguages,
  translations
} from '@/lib/translations';

// Mock console methods to avoid noise
const originalConsole = { ...console };
beforeAll(() => {
  console.log = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  console.log = originalConsole.log;
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
});

describe('Translations', () => {
  beforeEach(() => {
    setLanguage('en');
  });

  describe('Basic Translation Functions', () => {
    it('should translate common keys correctly', () => {
      expect(t('common.loading')).toBe('Loading...');
      expect(t('common.status')).toBe('Status');
      expect(t('common.name')).toBe('Name');
    });

    it('should handle nested keys correctly', () => {
      expect(t('common.status')).toBe('Status');
      expect(t('common.name')).toBe('Name');
    });

    it('should return key when translation not found', () => {
      expect(t('nonexistent.key')).toBe('nonexistent.key');
    });

    it('should handle empty key', () => {
      expect(t('')).toBe('');
    });


  });

  describe('Language Management', () => {
    it('should set and get current language', () => {
      setLanguage('nl');
      expect(getCurrentLanguage()).toBe('nl');
      
      setLanguage('en');
      expect(getCurrentLanguage()).toBe('en');
    });

    it('should get available languages', () => {
      const languages = getAvailableLanguages();
      expect(languages).toHaveLength(2);
      expect(languages[0].code).toBe('en');
      expect(languages[1].code).toBe('nl');
    });
  });

  describe('Utility Functions', () => {
    it('should check if translation exists', () => {
      expect(hasTranslation('common.loading')).toBe(true);
      expect(hasTranslation('nonexistent.key')).toBe(false);
    });

    it('should get all translations for current language', () => {
      setLanguage('en');
      const allTranslations = getAllTranslations();
      expect(allTranslations).toBeDefined();
      expect(typeof allTranslations).toBe('object');
    });

    it('should get all translations for specific language', () => {
      const dutchTranslations = getAllTranslations('nl');
      expect(dutchTranslations).toBeDefined();
      expect(typeof dutchTranslations).toBe('object');
    });


  });

  describe('Translation Object', () => {
    it('should have translations structure', () => {
      expect(translations).toBeDefined();
      expect(typeof translations).toBe('object');
      expect(translations).toHaveProperty('common');
    });

    it('should have common translations', () => {
      expect(translations.common).toBeDefined();
      expect(translations.common.loading).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle deep nested keys', () => {
      const deepKey = 'deeply.nested.key.structure';
      expect(t(deepKey)).toBe(deepKey);
    });

    it('should handle special characters in keys', () => {
      const specialKey = 'special.chars.@#$%^&*()';
      expect(t(specialKey)).toBe(specialKey);
    });
  });

  describe('Performance', () => {
    it('should handle multiple rapid language switches', () => {
      for (let i = 0; i < 10; i++) {
        setLanguage('en');
        setLanguage('nl');
      }
      expect(getCurrentLanguage()).toBe('nl');
    });

    it('should handle multiple translation calls efficiently', () => {
      const start = performance.now();
      for (let i = 0; i < 100; i++) {
        t('common.loading');
      }
      const end = performance.now();
      expect(end - start).toBeLessThan(100); // Should complete in less than 100ms
    });
  });
});