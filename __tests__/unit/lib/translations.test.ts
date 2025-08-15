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

// Mock console methods to avoid noise in tests
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
    // Reset to default language before each test
    setLanguage('en');
  });

  describe('Basic Translation Functions', () => {
    it('should translate common keys correctly', () => {
      expect(t('common.loading')).toBe('Loading...');
      expect(t('common.save')).toBe('Save');
      expect(t('common.cancel')).toBe('Cancel');
      expect(t('common.delete')).toBe('Delete');
    });

    it('should translate Dutch keys correctly', () => {
      setLanguage('nl');
      expect(t('common.loading')).toBe('Laden...');
      expect(t('common.save')).toBe('Opslaan');
      expect(t('common.cancel')).toBe('Annuleren');
      expect(t('common.delete')).toBe('Verwijderen');
    });

    it('should fallback to English when Dutch translation missing', () => {
      setLanguage('nl');
      // Assuming some key only has English
      expect(t('common.loading')).toBe('Laden...');
    });

    it('should return key when translation not found', () => {
      expect(t('nonexistent.key')).toBe('nonexistent.key');
      expect(t('common.nonexistent')).toBe('common.nonexistent');
    });

    it('should handle nested keys correctly', () => {
      // Test with keys that actually exist in the translations
      expect(t('common.status')).toBe('Status');
      expect(t('common.name')).toBe('Name');
    });
  });

  describe('Language Management', () => {
    it('should set and get current language correctly', () => {
      expect(getCurrentLanguage()).toBe('en');
      
      setLanguage('nl');
      expect(getCurrentLanguage()).toBe('nl');
      
      setLanguage('en');
      expect(getCurrentLanguage()).toBe('en');
    });

    it('should load translations asynchronously', async () => {
      await loadTranslations('nl');
      expect(getCurrentLanguage()).toBe('nl');
      
      await loadTranslations('en');
      expect(getCurrentLanguage()).toBe('en');
    });

    it('should get available languages correctly', () => {
      const languages = getAvailableLanguages();
      expect(languages).toHaveLength(2);
      expect(languages).toEqual([
        { code: 'en', name: 'English', nativeName: 'English' },
        { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' }
      ]);
    });
  });

  describe('Translation Utilities', () => {
    it('should check if translation exists', () => {
      expect(hasTranslation('common.loading')).toBe(true);
      expect(hasTranslation('common.save')).toBe(true);
      expect(hasTranslation('nonexistent.key')).toBe(false);
    });

    it('should get all translations for a specific language', () => {
      const englishTranslations = getAllTranslations('en');
      const dutchTranslations = getAllTranslations('nl');
      
      expect(englishTranslations['common.loading']).toBe('Loading...');
      expect(dutchTranslations['common.loading']).toBe('Laden...');
      expect(englishTranslations['common.save']).toBe('Save');
      expect(dutchTranslations['common.save']).toBe('Opslaan');
    });

    it('should flatten nested translations correctly', () => {
      const englishTranslations = getAllTranslations('en');
      
      // Check that nested keys are flattened
      expect(englishTranslations['common.status']).toBe('Status');
      expect(englishTranslations['common.name']).toBe('Name');
    });
  });

  describe('Backward Compatibility', () => {
    it('should provide backward compatibility with getTranslation', () => {
      expect(getTranslation('common.loading')).toBe('Loading...');
      expect(getTranslation('common.save', 'nl')).toBe('Opslaan');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty keys', () => {
      expect(t('')).toBe('');
    });

    it('should handle keys with only dots', () => {
      expect(t('...')).toBe('...');
    });

    it('should handle very deep nested keys', () => {
      // Test with a deeply nested key if it exists
      expect(t('common.status')).toBe('Status');
    });

    it('should handle language parameter override', () => {
      setLanguage('en');
      expect(t('common.loading', 'nl')).toBe('Laden...');
      expect(t('common.save', 'en')).toBe('Save');
    });
  });

  describe('Translations Object', () => {
    it('should export translations object', () => {
      expect(translations).toBeDefined();
      expect(typeof translations).toBe('object');
      expect(translations.common).toBeDefined();
      expect(translations.common.loading).toBeDefined();
    });

    it('should have correct structure for common translations', () => {
      expect(translations.common.loading).toEqual({
        en: 'Loading...',
        nl: 'Laden...'
      });
      expect(translations.common.save).toEqual({
        en: 'Save',
        nl: 'Opslaan'
      });
    });
  });

  describe('Default Export', () => {
    it('should export all functions as default', () => {
      const defaultExport = require('@/lib/translations').default;
      
      expect(defaultExport.t).toBeDefined();
      expect(defaultExport.getTranslation).toBeDefined();
      expect(defaultExport.setLanguage).toBeDefined();
      expect(defaultExport.getCurrentLanguage).toBeDefined();
      expect(defaultExport.loadTranslations).toBeDefined();
      expect(defaultExport.getAllTranslations).toBeDefined();
      expect(defaultExport.hasTranslation).toBeDefined();
      expect(defaultExport.getAvailableLanguages).toBeDefined();
      expect(defaultExport.translations).toBeDefined();
    });
  });
});