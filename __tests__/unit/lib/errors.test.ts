import { getUserFriendlyErrorMessage } from '@/lib/errors';

describe('Errors', () => {
  describe('getUserFriendlyErrorMessage', () => {
    describe('Authentication errors', () => {
      it('should handle auth errors in Dutch', () => {
        const result = getUserFriendlyErrorMessage('auth error', 'nl');
        expect(result).toBe('U heeft geen toegang. Log in en probeer opnieuw.');
      });

      it('should handle auth errors in English', () => {
        const result = getUserFriendlyErrorMessage('unauthorized', 'en');
        expect(result).toBe("You don't have access. Please log in and try again.");
      });

      it('should handle permission errors', () => {
        const result = getUserFriendlyErrorMessage('permission denied', 'nl');
        expect(result).toBe('U heeft geen toegang. Log in en probeer opnieuw.');
      });
    });

    describe('Network errors', () => {
      it('should handle network errors in Dutch', () => {
        const result = getUserFriendlyErrorMessage('network error', 'nl');
        expect(result).toBe('Verbindingsprobleem. Controleer uw internet en probeer opnieuw.');
      });

      it('should handle fetch errors in English', () => {
        const result = getUserFriendlyErrorMessage('failed to fetch', 'en');
        expect(result).toBe('Connection problem. Check your internet and try again.');
      });

      it('should handle timeout errors', () => {
        const result = getUserFriendlyErrorMessage('timeout', 'nl');
        expect(result).toBe('Verbindingsprobleem. Controleer uw internet en probeer opnieuw.');
      });
    });

    describe('Validation errors', () => {
      it('should handle validation errors in Dutch', () => {
        const result = getUserFriendlyErrorMessage('validation failed', 'nl');
        expect(result).toBe('Controleer uw invoer en probeer het opnieuw.');
      });

      it('should handle required field errors in English', () => {
        const result = getUserFriendlyErrorMessage('required field', 'en');
        expect(result).toBe('Please check your input and try again.');
      });

      it('should handle schema errors', () => {
        const result = getUserFriendlyErrorMessage('schema error', 'nl');
        expect(result).toBe('Controleer uw invoer en probeer het opnieuw.');
      });
    });

    describe('Database errors', () => {
      it('should handle database errors in Dutch', () => {
        const result = getUserFriendlyErrorMessage('postgres error', 'nl');
        expect(result).toBe('Databaseprobleem. Neem contact op met support.');
      });

      it('should handle table errors in English', () => {
        const result = getUserFriendlyErrorMessage('table not found', 'en');
        expect(result).toBe('Database issue. Please contact support.');
      });

      it('should handle supabase errors', () => {
        const result = getUserFriendlyErrorMessage('supabase error', 'nl');
        expect(result).toBe('Databaseprobleem. Neem contact op met support.');
      });
    });

    describe('Rate limiting errors', () => {
      it('should handle rate limit errors in Dutch', () => {
        const result = getUserFriendlyErrorMessage('rate limit exceeded', 'nl');
        expect(result).toBe('Te veel verzoeken. Wacht even en probeer opnieuw.');
      });

      it('should handle too many requests in English', () => {
        const result = getUserFriendlyErrorMessage('too many requests', 'en');
        expect(result).toBe('Too many requests. Please wait and try again.');
      });
    });

    describe('Conflict errors', () => {
      it('should handle duplicate key errors in Dutch', () => {
        const result = getUserFriendlyErrorMessage('duplicate key', 'nl');
        expect(result).toBe('Dit bestaat al. Vernieuw of wijzig uw invoer.');
      });

      it('should handle already exists errors in English', () => {
        const result = getUserFriendlyErrorMessage('already exists', 'en');
        expect(result).toBe('This already exists. Refresh or adjust your input.');
      });
    });

    describe('Not found errors', () => {
      it('should handle not found errors in Dutch', () => {
        const result = getUserFriendlyErrorMessage('not found', 'nl');
        expect(result).toBe('Niet gevonden. Het item bestaat mogelijk niet meer.');
      });

      it('should handle 404 errors in English', () => {
        const result = getUserFriendlyErrorMessage('404 error', 'en');
        expect(result).toBe('Not found. The item may no longer exist.');
      });
    });

    describe('File errors', () => {
      it('should handle file errors in Dutch', () => {
        const result = getUserFriendlyErrorMessage('file upload failed', 'nl');
        expect(result).toBe('Bestandsfout. Controleer het bestandstype en de bestandsgrootte.');
      });

      it('should handle storage errors in English', () => {
        const result = getUserFriendlyErrorMessage('storage error', 'en');
        expect(result).toBe('File error. Check file type and size.');
      });
    });

    describe('Edge cases', () => {
      it('should handle null error in Dutch', () => {
        const result = getUserFriendlyErrorMessage(null, 'nl');
        expect(result).toBe('Er is een onverwachte fout opgetreden.');
      });

      it('should handle undefined error in English', () => {
        const result = getUserFriendlyErrorMessage(undefined, 'en');
        expect(result).toBe('An unexpected error occurred.');
      });

      it('should handle empty string in Dutch', () => {
        const result = getUserFriendlyErrorMessage('', 'nl');
        expect(result).toBe('Er is een onverwachte fout opgetreden.');
      });

      it('should handle unknown error in Dutch', () => {
        const result = getUserFriendlyErrorMessage('unknown error type', 'nl');
        expect(result).toBe('Er is iets misgegaan. Probeer het opnieuw of neem contact op met support.');
      });

      it('should handle unknown error in English', () => {
        const result = getUserFriendlyErrorMessage('unknown error type', 'en');
        expect(result).toBe('Something went wrong. Please try again or contact support.');
      });
    });

    describe('Default locale', () => {
      it('should default to Dutch when no locale specified', () => {
        const result = getUserFriendlyErrorMessage('auth error');
        expect(result).toBe('U heeft geen toegang. Log in en probeer opnieuw.');
      });
    });
  });
});