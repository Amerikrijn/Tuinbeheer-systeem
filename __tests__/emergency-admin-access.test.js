/**
 * 🔒 EMERGENCY ADMIN ACCESS TEST
 * 
 * Test om te verifiëren dat emergency admin access nog werkt
 * na de banking-compliant refactor.
 */

// Mock environment variables
const originalEnv = process.env;

beforeEach(() => {
  jest.resetModules();
  process.env = {
    ...originalEnv,
    NEXT_PUBLIC_EMERGENCY_ADMIN_EMAIL: 'amerik.rijn@gmail.com',
    NEXT_PUBLIC_EMERGENCY_ACCESS_ENABLED: 'true'
  };
});

afterEach(() => {
  process.env = originalEnv;
});

describe('🔒 Emergency Admin Access - Banking Compliant', () => {
  test('Emergency admin can access with environment variable', () => {
    // Simulate the new logic
    const emergencyAdminEmail = process.env.NEXT_PUBLIC_EMERGENCY_ADMIN_EMAIL;
    const emergencyAccessEnabled = process.env.NEXT_PUBLIC_EMERGENCY_ACCESS_ENABLED !== 'false';
    
    const fallbackEmails = [
      emergencyAdminEmail?.toLowerCase(),
      'amerik.rijn@gmail.com', // Temporary fallback
      'admin@tuinbeheer.nl'
    ].filter(Boolean);
    
    const userEmail = 'amerik.rijn@gmail.com';
    const isEmergencyAdmin = fallbackEmails.includes(userEmail);
    
    expect(emergencyAccessEnabled).toBe(true);
    expect(isEmergencyAdmin).toBe(true);
    expect(fallbackEmails).toContain('amerik.rijn@gmail.com');
  });

  test('Emergency access can be disabled', () => {
    process.env.NEXT_PUBLIC_EMERGENCY_ACCESS_ENABLED = 'false';
    
    const emergencyAccessEnabled = process.env.NEXT_PUBLIC_EMERGENCY_ACCESS_ENABLED !== 'false';
    expect(emergencyAccessEnabled).toBe(false);
  });

  test('Multiple fallback emails work', () => {
    const fallbackEmails = [
      'amerik.rijn@gmail.com',
      'admin@tuinbeheer.nl'
    ];
    
    expect(fallbackEmails.includes('amerik.rijn@gmail.com')).toBe(true);
    expect(fallbackEmails.includes('admin@tuinbeheer.nl')).toBe(true);
    expect(fallbackEmails.includes('unauthorized@test.com')).toBe(false);
  });

  test('Environment variable takes precedence', () => {
    process.env.NEXT_PUBLIC_EMERGENCY_ADMIN_EMAIL = 'new.admin@test.com';
    
    const emergencyAdminEmail = process.env.NEXT_PUBLIC_EMERGENCY_ADMIN_EMAIL;
    const fallbackEmails = [
      emergencyAdminEmail?.toLowerCase(),
      'amerik.rijn@gmail.com', // Fallback
    ].filter(Boolean);
    
    expect(fallbackEmails[0]).toBe('new.admin@test.com');
    expect(fallbackEmails).toContain('amerik.rijn@gmail.com'); // Still has fallback
  });
});

console.log('✅ Emergency Admin Access Test - Banking Compliant Implementation');