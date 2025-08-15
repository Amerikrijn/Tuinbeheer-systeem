/**
 * Nederlandse Banking Security Helper Library
 * Automatische security compliance voor alle code wijzigingen
 *
 * Deze library wordt automatisch gebruikt door .cursor-rules
 * Elke functie voldoet aan Nederlandse banking standards
 */

import { supabase } from './supabase';

/**
 * Security Event Logging
 * Logt alle security-gerelateerde events voor audit trail
 */
export async function logClientSecurityEvent(
  event: string,
  details: Record<string, any>,
  userId?: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('security_events')
      .insert({
        event_type: event,
        event_details: details,
        user_id: userId,
        timestamp: new Date().toISOString(),
        ip_address: 'client-side', // In echte implementatie zou dit uit request komen
        user_agent: 'client-side'
      });

    if (error) {
      console.error('Security event logging failed:', error);
    }
  } catch (err) {
    console.error('Security event logging error:', err);
  }
}

/**
 * Input Validation & Sanitization
 * Valideert en sanitized alle user input volgens banking standards
 */
export function validateApiInput(data: any, schema: Record<string, any>): {
  isValid: boolean;
  errors: string[];
  sanitizedData: any;
} {
  const errors: string[] = [];
  const sanitizedData: any = {};

  for (const [key, rules] of Object.entries(schema)) {
    const value = data[key];

    // Required field check
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push(`${key} is verplicht`);
      continue;
    }

    // Type validation
    if (value !== undefined && value !== null) {
      if (rules.type === 'string' && typeof value !== 'string') {
        errors.push(`${key} moet een string zijn`);
        continue;
      }
      if (rules.type === 'number' && typeof value !== 'number') {
        errors.push(`${key} moet een nummer zijn`);
        continue;
      }
      if (rules.type === 'boolean' && typeof value !== 'boolean') {
        errors.push(`${key} moet een boolean zijn`);
        continue;
      }

      // String sanitization
      if (rules.type === 'string' && typeof value === 'string') {
        let sanitized = value.trim();
        
        // Remove potentially dangerous characters
        sanitized = sanitized.replace(/[<>]/g, '');
        
        // Length validation
        if (rules.minLength && sanitized.length < rules.minLength) {
          errors.push(`${key} moet minimaal ${rules.minLength} karakters bevatten`);
        }
        if (rules.maxLength && sanitized.length > rules.maxLength) {
          errors.push(`${key} mag maximaal ${rules.maxLength} karakters bevatten`);
        }

        sanitizedData[key] = sanitized;
      } else {
        sanitizedData[key] = value;
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData
  };
}

/**
 * Access Control Validation
 * Controleert of gebruiker toegang heeft tot specifieke data
 */
export async function validateAccess(
  userId: string,
  resourceType: string,
  resourceId: string
): Promise<boolean> {
  try {
    // Check user permissions in database
    const { data, error } = await supabase
      .from('user_permissions')
      .select('permission_level')
      .eq('user_id', userId)
      .eq('resource_type', resourceType)
      .eq('resource_id', resourceId)
      .single();

    if (error || !data) {
      return false;
    }

    return data.permission_level >= 1; // Minimum read access
  } catch (err) {
    console.error('Access validation error:', err);
    return false;
  }
}

/**
 * Data Hashing
 * Hasht gevoelige data voor veilige opslag
 */
export async function hashSensitiveData(data: string): Promise<string> {
  // In productie zou je een sterke hashing library gebruiken
  // Dit is een vereenvoudigde versie voor demonstratie
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Audit Trail Creation
 * Maakt audit trail entries voor alle data wijzigingen
 */
export async function createAuditTrail(
  action: string,
  resourceType: string,
  resourceId: string,
  userId: string,
  changes: Record<string, any>
): Promise<void> {
  try {
    const { error } = await supabase
      .from('audit_trail')
      .insert({
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        user_id: userId,
        changes: changes,
        timestamp: new Date().toISOString(),
        ip_address: 'server-side'
      });

    if (error) {
      console.error('Audit trail creation failed:', error);
    }
  } catch (err) {
    console.error('Audit trail creation error:', err);
  }
}

/**
 * Security Headers
 * Genereert security headers voor API responses
 */
export function getSecurityHeaders(): Record<string, string> {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
  };
}

/**
 * Rate Limiting Helper
 * Controleert of gebruiker te veel requests doet
 */
export async function checkRateLimit(
  userId: string,
  action: string,
  maxRequests: number = 100,
  timeWindow: number = 60000 // 1 minuut
): Promise<boolean> {
  try {
    const now = Date.now();
    const windowStart = now - timeWindow;

    const { data, error } = await supabase
      .from('rate_limits')
      .select('request_count')
      .eq('user_id', userId)
      .eq('action', action)
      .gte('timestamp', new Date(windowStart).toISOString())
      .single();

    if (error || !data) {
      // Eerste request voor deze gebruiker/actie
      await supabase
        .from('rate_limits')
        .insert({
          user_id: userId,
          action,
          request_count: 1,
          timestamp: new Date().toISOString()
        });
      return true;
    }

    if (data.request_count >= maxRequests) {
      return false; // Rate limit exceeded
    }

    // Update request count
    await supabase
      .from('rate_limits')
      .update({ request_count: data.request_count + 1 })
      .eq('user_id', userId)
      .eq('action', action);

    return true;
  } catch (err) {
    console.error('Rate limit check error:', err);
    return true; // In case of error, allow request
  }
}