/**
 * Banking-Grade API Authentication Wrapper
 * Automatische security compliance voor alle API endpoints
 * Voldoet aan Nederlandse banking standards
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from './supabase';
import { apiLogger } from './logger';
import { logClientSecurityEvent, validateApiInput } from './banking-security';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: 'admin' | 'user';
  garden_access: string[];
}

/**
 * Wrapper voor API routes die authenticatie vereisen
 * Controleert JWT token en haalt user info op
 */
export async function requireAuthentication(
  request: NextRequest
): Promise<{ user: AuthenticatedUser; response?: NextResponse }> {
  try {
    // Haal Authorization header op
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        user: null as any,
        response: NextResponse.json(
          { error: 'Geen geldige authenticatie header' },
          { status: 401 }
        )
      };
    }

    const token = authHeader.substring(7);

    // Verifieer JWT token met Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      await logClientSecurityEvent('auth_failed', 'HIGH', false, undefined, 'Invalid token', undefined, { 
        reason: 'invalid_token',
        ip: request.ip || 'unknown'
      });
      
      return {
        user: null as any,
        response: NextResponse.json(
          { error: 'Ongeldige of verlopen token' },
          { status: 401 }
        )
      };
    }

    // Haal user permissions op
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, role, garden_access')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      await logClientSecurityEvent('auth_failed', 'HIGH', false, user.id, 'User not found', undefined, { 
        reason: 'user_not_found',
        ip: request.ip || 'unknown'
      });
      
      return {
        user: null as any,
        response: NextResponse.json(
          { error: 'Gebruiker niet gevonden' },
          { status: 404 }
        )
      };
    }

    const authenticatedUser: AuthenticatedUser = {
      id: userData.id,
      email: userData.email,
      role: userData.role || 'user',
      garden_access: userData.garden_access || []
    };

    // Log successful authentication
    await logClientSecurityEvent('auth_success', 'LOW', true, authenticatedUser.id, undefined, undefined, {
      role: authenticatedUser.role,
      ip: request.ip || 'unknown'
    });

    return { user: authenticatedUser };

  } catch (error) {
    apiLogger.error('Authentication error:', error instanceof Error ? { message: error.message } : { error: String(error) });
    
    await logClientSecurityEvent('auth_error', 'HIGH', false, undefined, error instanceof Error ? error.message : 'Unknown error', undefined, {
      ip: request.ip || 'unknown'
    });

    return {
      user: null as any,
      response: NextResponse.json(
        { error: 'Interne server fout bij authenticatie' },
        { status: 500 }
      )
    };
  }
}

/**
 * Snelle authenticatie check voor endpoints die alleen user ID nodig hebben
 */
export async function requireAuthenticationQuick(
  request: NextRequest
): Promise<{ userId: string; response?: NextResponse }> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        userId: '',
        response: NextResponse.json(
          { error: 'Geen geldige authenticatie header' },
          { status: 401 }
        )
      };
    }

    const token = authHeader.substring(7);
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return {
        userId: '',
        response: NextResponse.json(
          { error: 'Ongeldige of verlopen token' },
          { status: 401 }
        )
      };
    }

    return { userId: user.id };

  } catch (error) {
          apiLogger.error('Quick authentication error:', error instanceof Error ? { message: error.message } : { error: String(error) });
    return {
      userId: '',
      response: NextResponse.json(
        { error: 'Interne server fout bij authenticatie' },
        { status: 500 }
      )
    };
  }
}

/**
 * Controleert of gebruiker admin rechten heeft
 */
export async function requireAdmin(
  request: NextRequest
): Promise<{ user: AuthenticatedUser; response?: NextResponse }> {
  const authResult = await requireAuthentication(request);
  
  if (authResult.response) {
    return authResult;
  }

  if (authResult.user.role !== 'admin') {
    await logClientSecurityEvent('access_denied', 'HIGH', false, authResult.user.id, 'Insufficient permissions', undefined, {
      reason: 'insufficient_permissions',
      requiredRole: 'admin',
      userRole: authResult.user.role,
      ip: request.ip || 'unknown'
    });

    return {
      user: null as any,
      response: NextResponse.json(
        { error: 'Admin rechten vereist' },
        { status: 403 }
      )
    };
  }

  return authResult;
}

/**
 * Controleert of gebruiker toegang heeft tot specifieke garden
 */
export async function requireGardenAccess(
  request: NextRequest,
  gardenId: string
): Promise<{ user: AuthenticatedUser; response?: NextResponse }> {
  const authResult = await requireAuthentication(request);
  
  if (authResult.response) {
    return authResult;
  }

  // Admins hebben altijd toegang
  if (authResult.user.role === 'admin') {
    return authResult;
  }

  // Controleer garden access
  if (!authResult.user.garden_access.includes(gardenId)) {
    await logClientSecurityEvent('access_denied', 'HIGH', false, authResult.user.id, 'Garden access denied', undefined, {
      reason: 'garden_access_denied',
      gardenId,
      userGardenAccess: authResult.user.garden_access,
      ip: request.ip || 'unknown'
    });

    return {
      user: null as any,
      response: NextResponse.json(
        { error: 'Geen toegang tot deze tuin' },
        { status: 403 }
      )
    };
  }

  return authResult;
}

/**
 * Wrapper voor API endpoints die input validatie nodig hebben
 */
export function withInputValidation<T>(
  schema: Record<string, any>,
  handler: (request: NextRequest, user: AuthenticatedUser, validatedData: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, user: AuthenticatedUser) => {
    try {
      let body;
      
      // Probeer body te parsen
      try {
        body = await request.json();
      } catch {
        body = {};
      }

      // Valideer input
      const validation = validateApiInput(body, schema);
      
      if (!validation.isValid) {
        await logClientSecurityEvent('input_validation_failed', 'MEDIUM', false, user.id, 'Input validation failed', undefined, {
          errors: validation.errors,
          ip: request.ip || 'unknown'
        });

        return NextResponse.json(
          { 
            error: 'Ongeldige input',
            details: validation.errors 
          },
          { status: 400 }
        );
      }

      // Roep handler aan met gevalideerde data
      return await handler(request, user, validation.sanitizedData as T);

    } catch (error) {
      apiLogger.error('Input validation error:', error instanceof Error ? { message: error.message } : { error: String(error) });
      
      await logClientSecurityEvent('input_validation_error', 'HIGH', false, user.id, error instanceof Error ? error.message : 'Unknown error', undefined, {
        ip: request.ip || 'unknown'
      });

      return NextResponse.json(
        { error: 'Interne server fout bij input validatie' },
        { status: 500 }
      );
    }
  };
}

/**
 * Wrapper voor API endpoints die rate limiting nodig hebben
 */
export function withRateLimiting(
  action: string,
  maxRequests: number = 100,
  timeWindow: number = 60000,
  handler: (request: NextRequest, user: AuthenticatedUser) => Promise<NextResponse>
) {
  return async (request: NextRequest, user: AuthenticatedUser) => {
    try {
      // Import rate limiting function
      const { checkRateLimit } = await import('./banking-security');
      
      const isAllowed = await checkRateLimit(user.id, action, maxRequests, timeWindow);
      
      if (!isAllowed) {
        await logClientSecurityEvent('rate_limit_exceeded', 'HIGH', false, user.id, 'Rate limit exceeded', undefined, {
          action,
          ip: request.ip || 'unknown'
        });

        return NextResponse.json(
          { error: 'Te veel requests, probeer het later opnieuw' },
          { status: 429 }
        );
      }

      // Roep handler aan
      return await handler(request, user);

    } catch (error) {
      apiLogger.error('Rate limiting error:', error instanceof Error ? { message: error.message } : { error: String(error) });
      return await handler(request, user); // Fallback naar handler
    }
  };
}

/**
 * Combinatie van alle wrappers voor maximale security
 */
export function withFullSecurity<T>(
  schema: Record<string, any>,
  action: string,
  handler: (request: NextRequest, user: AuthenticatedUser, validatedData: T) => Promise<NextResponse>
) {
  return withRateLimiting(
    action,
    100,
    60000,
    async (request: NextRequest, user: AuthenticatedUser) => {
      return withInputValidation(schema, handler)(request, user);
    }
  );
}