# 🔒 Compliance & Security Requirements

**Security requirements en compliance checklists - NIET NEGOCIEERBAAR**

## 🚨 KRITIEKE SECURITY WAARSCHUWING - NOOIT OVERTREDEN 🚨

**SUPABASE KEYS MOGEN NOOIT MEER IN `vercel.json` WORDEN HARDCODEERD!**

Deze fout is al één keer gemaakt en mag NOOIT meer gebeuren. Alle Supabase keys worden nu beheerd via Vercel Secrets.

### ❌ VERBODEN IN `vercel.json`:
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (gebruik `@supabase-anon-key` secret)
- `SUPABASE_SERVICE_ROLE_KEY` (gebruik `@supabase-service-role-key` secret)

### ❌ VERBODEN IN ALLE BESTANDEN:
- `your_anon_key` of `your_anon_key_here`
- `your_service_role_key` of `your_service_role_key_here`
- `YOUR-ANON-KEY` of `YOUR-SERVICE-ROLE-KEY`
- `YOUR-PROJECT.supabase.co`

### ✅ CORRECTE CONFIGURATIE VOOR ALLE BESTANDEN:
- Gebruik ALTIJD: `@supabase-anon-key` en `@supabase-service-role-key`
- Gebruik ALTIJD: `https://dwsgwqosmihsfaxuheji.supabase.co`

### 🔍 BESTANDEN DIE AGENTS MOETEN CONTROLEREN:
- `vercel.json` - Hoofdconfiguratie
- `.env.example` - Voorbeeld environment variables
- `components/error-boundary.tsx` - Error handling voorbeelden
- Alle documentatie bestanden (`.md` bestanden)
- Alle TypeScript/JavaScript bestanden
- Alle configuratie bestanden

### ✅ CORRECTE `vercel.json` CONFIGURATIE:
```json
{
  "env": {
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key",
    "SUPABASE_SERVICE_ROLE_KEY": "@supabase-service-role-key"
  }
}
```

## 🔐 Verplichte Environment Variables

### Production Environment (Vercel)
```bash
# Supabase - Public (safe in browser)
NEXT_PUBLIC_SUPABASE_URL=https://dwsgwqosmihsfaxuheji.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=@supabase-anon-key

# Supabase - Private (SERVER-SIDE ONLY!)
SUPABASE_SERVICE_ROLE_KEY=@supabase-service-role-key

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://tuinbeheer-systeem.vercel.app
NEXT_PUBLIC_PROTECTED_ADMIN_EMAIL=admin@tuinbeheer.nl
```

### Preview Environment (Vercel)
```bash
# Supabase - Same as production
NEXT_PUBLIC_SUPABASE_URL=https://dwsgwqosmihsfaxuheji.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=@supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=@supabase-service-role-key

# Site Configuration - Preview URLs
NEXT_PUBLIC_SITE_URL=https://tuinbeheer-systeem-git-preview-amerikrijn.vercel.app
NEXT_PUBLIC_PROTECTED_ADMIN_EMAIL=admin@tuinbeheer.nl
```

## 🔒 SECURITY REQUIREMENTS (NIET NEGOCIEERBAAR)

### **ELKE DATABASE WIJZIGING MOET:**
1. Audit logging hebben via `log_security_event()`
2. Input validation via `validate_input()`
3. Proper error handling met try-catch
4. Performance monitoring (execution time)
5. Rollback procedure gedocumenteerd

### **ELKE API ENDPOINT MOET:**
1. Authentication check (`supabase.auth.getUser()`)
2. Authorization check (permission validation)
3. Input validation (client + server side)
4. Rate limiting considerations
5. Comprehensive error logging

### **ELKE FRONTEND COMPONENT MOET:**
1. Authentication guards
2. Permission-based rendering
3. Input sanitization
4. Error boundaries
5. Security event logging

### **ELKE UI COMPONENT MOET:**
1. WCAG 2.1 AA compliant zijn
2. Responsive design (mobile-first)
3. Keyboard navigation support
4. Loading states hebben
5. Error states hebben
6. Success feedback geven
7. Consistent styling gebruiken

## 🏦 Banking Standards Compliance

### **✅ Server-Side API Routes**
Alle admin functies via beveiligde server routes:
- `/api/admin/invite-user` - User invitations
- `/api/admin/delete-user` - User deletion
- `/api/admin/reset-password` - Password resets
- `/api/admin/update-user-role` - Role changes  
- `/api/admin/update-user-status` - Status changes

### **✅ Privilege Separation**
- **NEXT_PUBLIC_*** = Client-side safe (anon key, URLs)
- **SUPABASE_SERVICE_ROLE_KEY** = Server-side only (admin privileges)

## 📊 Automatische Code Templates

### **Nieuwe Database Functie Template**
```sql
CREATE OR REPLACE FUNCTION function_name(
    p_param1 UUID,
    p_param2 TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    result_id UUID;
    start_time TIMESTAMPTZ;
BEGIN
    start_time := clock_timestamp();
    
    -- Input validation
    IF p_param1 IS NULL THEN
        PERFORM log_security_event(
            p_action := 'FUNCTION_VALIDATION_FAILED',
            p_severity := 'HIGH',
            p_success := FALSE,
            p_error_message := 'Required parameter p_param1 is NULL'
        );
        RAISE EXCEPTION 'Invalid input: p_param1 cannot be NULL';
    END IF;
    
    -- Validate input if text
    IF p_param2 IS NOT NULL AND NOT validate_input(p_param2, 1000, false) THEN
        RAISE EXCEPTION 'Invalid input: p_param2 failed validation';
    END IF;
    
    -- Main logic here
    
    -- Success logging
    PERFORM log_security_event(
        p_action := 'FUNCTION_NAME_SUCCESS',
        p_severity := 'LOW',
        p_success := TRUE,
        p_execution_time_ms := EXTRACT(MILLISECONDS FROM clock_timestamp() - start_time)::INTEGER
    );
    
    RETURN result_id;
    
EXCEPTION WHEN OTHERS THEN
    -- Error logging
    PERFORM log_security_event(
        p_action := 'FUNCTION_NAME_ERROR',
        p_severity := 'HIGH',
        p_success := FALSE,
        p_error_message := SQLERRM,
        p_execution_time_ms := EXTRACT(MILLISECONDS FROM clock_timestamp() - start_time)::INTEGER
    );
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### **Nieuwe API Endpoint Template**
```typescript
// Altijd deze structuur gebruiken voor API endpoints
export async function POST(request: Request) {
  const startTime = Date.now();
  let userId: string | null = null;
  
  try {
    // 1. Authentication check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      await logSecurityEvent('API_AUTH_FAILED', 'HIGH', false, 'Unauthorized API access');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    userId = user.id;
    
    // 2. Input validation
    const body = await request.json();
    if (!validateApiInput(body)) {
      await logSecurityEvent('API_VALIDATION_FAILED', 'HIGH', false, 'Invalid API input');
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    
    // 3. Permission check
    const hasPermission = await checkUserPermission(userId, 'resource', 'action');
    if (!hasPermission) {
      await logSecurityEvent('API_PERMISSION_DENIED', 'HIGH', false, 'Insufficient permissions');
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // 4. Main logic
    const result = await performOperation(body);
    
    // 5. Success logging
    await logSecurityEvent('API_SUCCESS', 'LOW', true, null, Date.now() - startTime);
    
    return NextResponse.json({ data: result, success: true });
    
  } catch (error) {
    // 6. Error handling & logging
    await logSecurityEvent('API_ERROR', 'HIGH', false, error.message, Date.now() - startTime);
    return NextResponse.json(
      { error: 'Internal server error', success: false }, 
      { status: 500 }
    );
  }
}
```

### **Nieuwe Component Template**
```typescript
// Altijd security-first React components
'use client';

import { useAuth } from '@/hooks/use-supabase-auth';
import { validateInput } from '@/lib/security';
import { logClientEvent } from '@/lib/audit';

export function SecureComponent({ requiredPermission }: { requiredPermission?: string }) {
  const { user, hasPermission } = useAuth();
  
  // Authentication guard
  if (!user) {
    return <div>Please log in to access this feature</div>;
  }
  
  // Permission guard
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <div>You don't have permission to access this feature</div>;
  }
  
  const handleUserInput = async (input: string) => {
    // Client-side validation
    if (!validateInput(input)) {
      await logClientEvent('CLIENT_VALIDATION_FAILED', 'MEDIUM', false);
      return;
    }
    
    try {
      // API call with proper error handling
      const response = await fetch('/api/endpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input })
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      await logClientEvent('CLIENT_SUCCESS', 'LOW', true);
      
    } catch (error) {
      await logClientEvent('CLIENT_ERROR', 'HIGH', false, error.message);
      // Show user-friendly error
    }
  };
  
  return (
    // Component JSX with security considerations
    <div>
      {/* Secure component content */}
    </div>
  );
}
```

## 🔍 Security Compliance Checklist

### **Pre-Development Security Review**
- [ ] Security requirements gedefinieerd
- [ ] Threat model opgesteld
- [ ] Security controls geïdentificeerd
- [ ] Compliance requirements bekend

### **Development Security Checks**
- [ ] Input validation geïmplementeerd
- [ ] Authentication & authorization gecontroleerd
- [ ] Error handling veilig geïmplementeerd
- [ ] Logging & monitoring toegevoegd
- [ ] Security tests geschreven

### **Pre-Deployment Security Review**
- [ ] Security scan uitgevoerd
- [ ] Vulnerability assessment gedaan
- [ ] Penetration test overweging
- [ ] Security documentation bijgewerkt
- [ ] Rollback procedures gedocumenteerd

### **Post-Deployment Security Monitoring**
- [ ] Security events gemonitord
- [ ] Performance impact gemeten
- [ ] Error rates getrackt
- [ ] User feedback verzameld
- [ ] Security metrics bijgewerkt

## 🚫 Security Anti-Patterns

### **NOOIT DOEN:**
- Hardcoded secrets in code
- Client-side admin privileges
- Unvalidated user input
- Silent error handling
- Bypassing security checks
- Using deprecated security methods
- Ignoring security warnings
- Deploying without security review

### **ALTIJD DOEN:**
- Use environment variables for secrets
- Server-side permission checks
- Input validation & sanitization
- Comprehensive error logging
- Security-first development
- Regular security updates
- Security testing automation
- Security documentation updates

---

**Laatste update**: 25-08-2025  
**Versie**: 1.0.0  
**Status**: Actief - Verplicht voor alle AI agents