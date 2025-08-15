import { translations } from '@/lib/full-translations';

describe('Full Translations', () => {
  describe('Structure', () => {
    it('should have both Dutch and English translations', () => {
      expect(translations).toHaveProperty('nl');
      expect(translations).toHaveProperty('en');
    });

    it('should have substantial translation content', () => {
      const dutchKeys = Object.keys(translations.nl);
      const englishKeys = Object.keys(translations.en);
      
      expect(dutchKeys.length).toBeGreaterThan(50);
      expect(englishKeys.length).toBeGreaterThan(50);
    });
  });

  describe('Dutch Translations', () => {
    it('should have correct navigation translations', () => {
      expect(translations.nl['garden.volunteers']).toBe('Tuin Vrijwilligers');
      expect(translations.nl['welcome.back']).toBe('Welkom terug');
      expect(translations.nl.loading).toBe('Laden...');
      expect(translations.nl.logout).toBe('Uitloggen');
      expect(translations.nl.login).toBe('Inloggen');
      expect(translations.nl.register).toBe('Registreren');
      expect(translations.nl.admin).toBe('Beheerder');
      expect(translations.nl.volunteer).toBe('Vrijwilliger');
      expect(translations.nl.language).toBe('Taal');
    });

    it('should have correct dashboard translations', () => {
      expect(translations.nl['session.calendar']).toBe('Sessie Kalender');
      expect(translations.nl['progress.gallery']).toBe('Voortgang Galerij');
      expect(translations.nl['garden.statistics']).toBe('Tuin Statistieken');
      expect(translations.nl['active.volunteers']).toBe('Actieve Vrijwilligers');
      expect(translations.nl['upcoming.sessions']).toBe('Komende Sessies');
      expect(translations.nl['tasks.completed']).toBe('Taken Voltooid');
      expect(translations.nl['progress.photos']).toBe('Voortgang Foto\'s');
    });

    it('should have correct calendar translations', () => {
      expect(translations.nl['garden.calendar']).toBe('Tuin Agenda');
      expect(translations.nl['next.session']).toBe('Volgende Sessie');
      expect(translations.nl['your.upcoming.session']).toBe('Je eerstvolgende tuinsessie');
      expect(translations.nl.days).toBe('dagen');
      expect(translations.nl['planned.tasks']).toBe('Geplande Taken');
      expect(translations.nl['more.tasks']).toBe('meer taken');
    });

    it('should have correct task translations', () => {
      expect(translations.nl['add.task.session']).toBe('Taak Toevoegen aan Sessie');
      expect(translations.nl['task.title']).toBe('Taak Titel');
      expect(translations.nl['task.details']).toBe('Taak details...');
      expect(translations.nl.priority).toBe('Prioriteit');
      expect(translations.nl['high.priority']).toBe('Hoge Prioriteit');
      expect(translations.nl['medium.priority']).toBe('Gemiddelde Prioriteit');
      expect(translations.nl['low.priority']).toBe('Lage Prioriteit');
    });

    it('should have correct status translations', () => {
      expect(translations.nl.status).toBe('Status');
      expect(translations.nl['not.started']).toBe('Niet Gestart');
      expect(translations.nl['in.progress']).toBe('Bezig');
      expect(translations.nl.completed).toBe('Voltooid');
      expect(translations.nl.high).toBe('hoog');
      expect(translations.nl.medium).toBe('gemiddeld');
      expect(translations.nl.low).toBe('laag');
    });

    it('should have correct form validation translations', () => {
      expect(translations.nl['missing.information']).toBe('Ontbrekende Informatie');
      expect(translations.nl['fill.required.fields']).toBe('Vul alle verplichte velden in.');
      expect(translations.nl['name.required']).toBe('Naam Vereist');
      expect(translations.nl['enter.name.register']).toBe('Voer je naam in om te registreren.');
    });

    it('should have correct no data state translations', () => {
      expect(translations.nl['no.upcoming.sessions']).toBe('Geen komende sessies gepland.');
      expect(translations.nl['no.tasks.assigned']).toBe('Nog geen taken toegewezen aan deze sessie.');
      expect(translations.nl['no.photos.uploaded']).toBe('Nog geen foto\'s geüpload');
    });
  });

  describe('English Translations', () => {
    it('should have correct navigation translations', () => {
      expect(translations.en['garden.volunteers']).toBe('Garden Volunteers');
      expect(translations.en['welcome.back']).toBe('Welcome back');
      expect(translations.en.loading).toBe('Loading...');
      expect(translations.en.logout).toBe('Logout');
      expect(translations.en.login).toBe('Login');
      expect(translations.en.register).toBe('Register');
      expect(translations.en.admin).toBe('Admin');
      expect(translations.en.volunteer).toBe('Volunteer');
      expect(translations.en.language).toBe('Language');
    });

    it('should have correct dashboard translations', () => {
      expect(translations.en['session.calendar']).toBe('Session Calendar');
      expect(translations.en['progress.gallery']).toBe('Progress Gallery');
      expect(translations.en['garden.statistics']).toBe('Garden Statistics');
      expect(translations.en['active.volunteers']).toBe('Active Volunteers');
      expect(translations.en['upcoming.sessions']).toBe('Upcoming Sessions');
      expect(translations.en['tasks.completed']).toBe('Tasks Completed');
      expect(translations.en['progress.photos']).toBe('Progress Photos');
    });

    it('should have correct calendar translations', () => {
      expect(translations.en['garden.calendar']).toBe('Garden Calendar');
      expect(translations.en['next.session']).toBe('Next Session');
      expect(translations.en['your.upcoming.session']).toBe('Your upcoming garden session');
      expect(translations.en.days).toBe('days');
      expect(translations.en['planned.tasks']).toBe('Planned Tasks');
      expect(translations.en['more.tasks']).toBe('more tasks');
    });

    it('should have correct task translations', () => {
      expect(translations.en['add.task.session']).toBe('Add Task to Session');
      expect(translations.en['task.title']).toBe('Task Title');
      expect(translations.en['task.details']).toBe('Task details...');
      expect(translations.en.priority).toBe('Priority');
      expect(translations.en['high.priority']).toBe('High Priority');
      expect(translations.en['medium.priority']).toBe('Medium Priority');
      expect(translations.en['low.priority']).toBe('Low Priority');
    });

    it('should have correct status translations', () => {
      expect(translations.en.status).toBe('Status');
      expect(translations.en['not.started']).toBe('Not Started');
      expect(translations.en['in.progress']).toBe('In Progress');
      expect(translations.en.completed).toBe('Completed');
      expect(translations.en.high).toBe('high');
      expect(translations.en.medium).toBe('medium');
      expect(translations.en.low).toBe('low');
    });

    it('should have correct form validation translations', () => {
      expect(translations.en['missing.information']).toBe('Missing Information');
      expect(translations.en['fill.required.fields']).toBe('Fill in all required fields.');
      expect(translations.en['name.required']).toBe('Name Required');
      expect(translations.en['enter.name.register']).toBe('Enter your name to register.');
    });

    it('should have correct no data state translations', () => {
      expect(translations.en['no.upcoming.sessions']).toBe('No upcoming sessions scheduled.');
      expect(translations.en['no.tasks.assigned']).toBe('No tasks assigned to this session yet.');
      expect(translations.en['no.photos.uploaded']).toBe('No photos uploaded yet');
    });
  });

  describe('Translation Consistency', () => {
    it('should have consistent placeholder formats', () => {
      const dutchPlaceholders = Object.entries(translations.nl)
        .filter(([key, value]) => value.includes('bijv.'))
        .map(([key, value]) => ({ key, value }));
      
      const englishPlaceholders = Object.entries(translations.en)
        .filter(([key, value]) => value.includes('e.g.'))
        .map(([key, value]) => ({ key, value }));
      
      // Check that placeholder keys match between languages
      const dutchPlaceholderKeys = dutchPlaceholders.map(p => p.key);
      const englishPlaceholderKeys = englishPlaceholders.map(p => p.key);
      
      expect(dutchPlaceholderKeys).toEqual(englishPlaceholderKeys);
    });

    it('should have consistent interpolation patterns', () => {
      const dutchInterpolations = Object.entries(translations.nl)
        .filter(([key, value]) => value.includes('{'))
        .map(([key, value]) => ({ key, value }));
      
      const englishInterpolations = Object.entries(translations.en)
        .filter(([key, value]) => value.includes('{'))
        .map(([key, value]) => ({ key, value }));
      
      // Check that interpolation keys match between languages
      const dutchInterpolationKeys = dutchInterpolations.map(p => p.key);
      const englishInterpolationKeys = englishInterpolations.map(p => p.key);
      
      expect(dutchInterpolationKeys).toEqual(englishInterpolationKeys);
    });

    it('should have consistent punctuation', () => {
      // Check that both languages use consistent punctuation patterns
      const dutchKeys = Object.keys(translations.nl);
      
      dutchKeys.forEach(key => {
        const dutchValue = translations.nl[key];
        const englishValue = translations.en[key];
        
        // If Dutch ends with punctuation, English should too
        if (dutchValue.endsWith('.') || dutchValue.endsWith('!') || dutchValue.endsWith('?')) {
          expect(englishValue).toMatch(/[.!?]$/);
        }
        
        // If Dutch doesn't end with punctuation, English shouldn't either
        if (!dutchValue.match(/[.!?]$/)) {
          expect(englishValue).not.toMatch(/[.!?]$/);
        }
      });
    });
  });

  describe('Content Quality', () => {
    it('should not have empty translations', () => {
      const allTranslations = { ...translations.nl, ...translations.en };
      
      Object.entries(allTranslations).forEach(([key, value]) => {
        expect(value).toBeTruthy();
        expect(value.trim()).not.toBe('');
      });
    });
  });
});