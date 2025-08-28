# Database Connection Improvements

Dit document beschrijft de verbeteringen die zijn aangebracht om het probleem van hangende pagina's bij database timeouts op te lossen.

## Probleem

De applicatie kon vastlopen tijdens het laden van pagina's wanneer database queries timeout hadden, zonder duidelijke feedback aan de gebruiker.

## Oplossingen

### 1. Verbeterde Retry Logic

**Bestand:** `hooks/use-supabase-auth.ts`

- **Optimized timeouts:** Progressieve timeouts (3s, 8s, 15s) in plaats van (5s, 10s, 20s)
- **Connection checking:** Controleert internetverbinding voor elke retry
- **Smart error handling:** Onderscheid tussen retryable en non-retryable errors
- **Exponential backoff:** Wacht tussen retries om database overbelasting te voorkomen
- **Better logging:** Duidelijke logs voor debugging

```typescript
// Voorbeeld van de verbeterde retry logic
const timeouts = [3000, 8000, 15000] // Optimized progressive timeouts

// Check connection before retry
if (typeof window !== 'undefined' && !navigator.onLine) {
  throw new Error('No internet connection detected')
}
```

### 2. Connection Status Hook

**Bestand:** `hooks/use-connection-status.ts`

Nieuwe hook die real-time connection status bijhoudt:

```typescript
const connection = useConnectionStatus()

// Available properties:
// - isOnline: boolean (browser online status)
// - isConnected: boolean (database connection status) 
// - latency: number | null (response time in ms)
// - error: string | null (last error message)
// - isHealthy: boolean (overall health status)
```

### 3. Connection Status Component

**Bestand:** `components/ui/connection-status.tsx`

Visuele indicator voor connection status:

```typescript
// Compact version (just a dot)
<ConnectionStatus compact />

// Full version with details
<ConnectionStatus showDetails />

// Loading component with connection awareness
<LoadingWithConnectionStatus message="Gegevens laden..." />
```

### 4. Optimized Supabase Configuration

**Bestand:** `lib/supabase.ts`

- **Progressive timeouts:** Kortere timeouts voor health checks (5s) vs normale requests (20s)
- **Better error messages:** Nederlandse gebruiksvriendelijke foutmeldingen
- **Performance logging:** Automatische logging van langzame requests
- **Network error detection:** Detecteert en handelt netwerk problemen af

### 5. Enhanced Fallback Mechanisms

**Bestand:** `hooks/use-supabase-auth.ts`

- **Smart caching:** Gebruikt cached data bij connection problemen
- **User feedback:** Toont waarschuwing wanneer cached data wordt gebruikt
- **Graceful degradation:** App blijft bruikbaar met beperkte functionaliteit

## Gebruiksvoorbeelden

### 1. Loading State met Connection Status

```typescript
import { LoadingWithConnectionStatus } from '@/components/ui/connection-status'

function MyComponent() {
  if (loading) {
    return <LoadingWithConnectionStatus message="Tuinen laden..." />
  }
  // ... rest of component
}
```

### 2. Connection Indicator in Header

```typescript
import { ConnectionStatus } from '@/components/ui/connection-status'

function Header() {
  return (
    <header>
      {/* Other header content */}
      <ConnectionStatus compact />
    </header>
  )
}
```

### 3. Custom Hook Usage

```typescript
import { useConnectionStatus } from '@/hooks/use-connection-status'

function MyComponent() {
  const connection = useConnectionStatus()
  
  if (!connection.isHealthy) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded">
        <p>Verbindingsproblemen: {connection.getStatusMessage()}</p>
        <button onClick={connection.checkConnection}>
          Opnieuw proberen
        </button>
      </div>
    )
  }
  
  // Normal component render
}
```

## Technische Details

### Timeout Configuratie

| Type | Oude Waarde | Nieuwe Waarde | Reden |
|------|-------------|---------------|-------|
| Auth queries | 5s, 10s, 20s | 3s, 8s, 15s | Snellere feedback |
| Health checks | 30s | 5s | Snelle connection test |
| Normal requests | 30s | 20s | Redelijke timeout |
| Loading timeout | 8s | 12s | Meer tijd voor langzame verbindingen |

### Error Handling Verbetering

- **Connection errors:** "Verbinding time-out - probeer het later opnieuw"
- **Network errors:** "Netwerkfout - controleer je internetverbinding"  
- **Database errors:** "Database fout - neem contact op met de beheerder"
- **Offline:** "Geen internetverbinding - controleer je netwerk"

### Performance Monitoring

- Automatische logging van langzame requests (>3s)
- Critical alerts voor zeer langzame requests (>10s)
- Latency tracking voor connection status
- Circuit breaker pattern voor cascade failures

## Voordelen

1. **Geen hangende pagina's meer:** Duidelijke timeouts en fallbacks
2. **Betere gebruikerservaring:** Real-time feedback over connection status
3. **Offline resilience:** Gebruikt cached data wanneer mogelijk
4. **Developer debugging:** Uitgebreide logging en error reporting
5. **Proactive monitoring:** Connection health checks en alerts

## Implementatie Checklist

- [x] Verbeterde retry logic met optimized timeouts
- [x] Connection status hook en component
- [x] Enhanced Supabase configuration  
- [x] Fallback mechanisms met caching
- [x] User-friendly error messages
- [x] Loading components met connection awareness
- [x] Documentation en usage examples

## Monitoring en Debugging

Voor debugging kun je de browser console checken:

```javascript
// Check connection status
console.log(connection.getStats())

// Force connection check
connection.checkConnection()

// Check Supabase performance metrics
performanceMonitor.getStats()
```

## Toekomstige Verbeteringen

- [ ] Offline mode met service worker
- [ ] Background sync voor cached updates
- [ ] Push notifications voor connection recovery
- [ ] Advanced retry strategies per query type
- [ ] Connection quality adaptive timeouts