/**
 * Banking-Grade API Authentication Wrapper
 * Automatische security compliance voor alle API endpoints
 * Voldoet aan Nederlandse banking standards
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { apiLogger } from '@/lib/logger';
import { logClientSecurityEvent, validateApiInput } from '@/lib/banking-security';

export interface AuthenticatedUser {
  id: string;
  email?: string;
  role?: string;
}

export interface AuthOptions {
  requireAuth?: boolean;
  requiredPermission?: string;
  validateInput?: boolean;
  logAction?: string;
}

/**
 * Banking-grade authentication wrapper for API endpoints
 * Handles authentication, authorization, validation, and logging with fallbacks
 */
export async function withBankingAuth<T>(
  handler: (request: NextRequest, params: Record<string, string>, user: AuthenticatedUser | null) => Promise<NextResponse<T>>,
  options: AuthOptions = {}
) {
  return async (request: NextRequest, params?: Record<string, string>): Promise<NextResponse<T>> => {
    const startTime = Date.now();
    const operationId = `api-${Date.now()}`;
    let userId: string | null = null;
    
    const {
      requireAuth = true,
      requiredPermission,
      validateInput = true,
      logAction = 'API_CALL'
    } = options;

    try {
      // 1. Authentication check (banking-grade)
      let user: AuthenticatedUser | null = null;
      
      if (requireAuth) {
        try {
          const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
          if (authError || !authUser) {
            await logClientSecurityEvent('API_AUTH_FAILED', 'HIGH', false, `Unauthorized API access: ${logAction}`);
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) as NextResponse<T>;
          }
          
          user = {
            id: authUser.id,
            email: authUser.email,
            role: authUser.user_metadata?.role || 'user'
          };
          userId = user.id;
          
        } catch (authException) {
          // Fallback: If auth check fails completely, deny access
          await logClientSecurityEvent('API_AUTH_EXCEPTION', 'CRITICAL', false, 'Authentication system failure');
          return NextResponse.json({ error: 'Authentication system unavailable' }, { status: 503 }) as NextResponse<T>;
        }
      }

      // 2. Permission check (if required)
      if (requiredPermission && user) {
        try {
          const { data: permissionData, error: permError } = await supabase
            .from('user_permissions')
            .select('permission')
            .eq('user_id', user.id)
            .eq('permission', requiredPermission)
            .single();
            
          if (permError || !permissionData) {
            await logClientSecurityEvent('API_PERMISSION_DENIED', 'HIGH', false, `Insufficient permissions: ${requiredPermission}`);
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 }) as NextResponse<T>;
          }
        } catch (permException) {
          // Fallback: If permission check fails, deny access for safety
          await logClientSecurityEvent('API_PERMISSION_CHECK_FAILED', 'HIGH', false, 'Permission check system failure');
          return NextResponse.json({ error: 'Permission system unavailable' }, { status: 503 }) as NextResponse<T>;
        }
      }

      // 3. Input validation (if enabled)
      if (validateInput && (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH')) {
        try {
          const body = await request.json();
          if (!validateApiInput(body)) {
            await logClientSecurityEvent('API_VALIDATION_FAILED', 'HIGH', false, 'Invalid API input data');
            return NextResponse.json({ error: 'Invalid input data' }, { status: 400 }) as NextResponse<T>;
          }
          // Reset request body for handler
          Object.defineProperty(request, 'json', {
            value: () => Promise.resolve(body),
            writable: false
          });
        } catch (parseError) {
          // Fallback: If JSON parsing fails
          await logClientSecurityEvent('API_INVALID_JSON', 'MEDIUM', false, 'Invalid JSON in request body');
          return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 }) as NextResponse<T>;
        }
      }

      // 4. Execute handler with banking-grade error handling
      const result = await handler(request, params, user);
      
      // 5. Success logging
      await logClientSecurityEvent(
        `${logAction}_SUCCESS`,
        'LOW',
        true,
        undefined,
        Date.now() - startTime,
        { userId, endpoint: request.url }
      );
      
      return result;
      
    } catch (error) {
      // Banking-grade error logging with fallback
      try {
        await logClientSecurityEvent(
          `${logAction}_ERROR`,
          'HIGH',
          false,
          error instanceof Error ? error.message : 'Unknown error',
          Date.now() - startTime,
          { userId, endpoint: request.url }
        );
        
        apiLogger.error(`API error in ${logAction}`, error as Error, { operationId, userId });
      } catch (logError) {
        // Fallback: If logging fails, still handle the error gracefully
        if (process.env.NODE_ENV === "development") { // Console logging removed for banking standards
      }
      
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      ) as NextResponse<T>;
    }
  };
}

/**
 * Simplified authentication check for quick implementation
 * Returns user or null with proper logging
 */
export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      await logClientSecurityEvent('AUTH_CHECK_FAILED', 'MEDIUM', false, 'User not authenticated');
      return null;
    }
    
    return {
      id: user.id,
      email: user.email,
      role: user.user_metadata?.role || 'user'
    };
  } catch (error) {
    await logClientSecurityEvent('AUTH_CHECK_ERROR', 'HIGH', false, 'Authentication check failed');
    return null;
  }
}

/**
 * Quick authentication middleware for existing endpoints
 * Minimal changes required to existing code
 */
export async function requireAuthenticationQuick(request: NextRequest): Promise<{ user: AuthenticatedUser; error?: never } | { user?: never; error: NextResponse }> {
  try {
    const user = await getAuthenticatedUser();
    
    if (!user) {
      return {
        error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      };
    }
    
    return { user };
  } catch (error) {
    return {
      error: NextResponse.json({ error: 'Authentication system unavailable' }, { status: 503 })
    };
  }
}