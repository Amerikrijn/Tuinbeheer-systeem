/**
 * Idempotency key support for mutating API endpoints
 * Prevents duplicate operations within a time window
 */

interface IdempotencyRecord {
  status: 'processing' | 'completed' | 'failed'
  result?: any
  timestamp: number
  expiresAt: number
}

// In-memory store for idempotency (replace with Redis in production)
const idempotencyStore = new Map<string, IdempotencyRecord>()

// Default window: 2 minutes
const DEFAULT_WINDOW_MS = 2 * 60 * 1000

/**
 * Check and handle idempotency for a request
 * @param request - The incoming request
 * @param windowMs - Time window in milliseconds (default: 2 minutes)
 * @returns Object with shouldProcess flag and existing result if duplicate
 */
export async function checkIdempotency(
  request: Request, 
  windowMs: number = DEFAULT_WINDOW_MS
): Promise<{
  shouldProcess: boolean
  existingResult?: any
  key?: string
}> {
  const idempotencyKey = request.headers.get('Idempotency-Key')
  
  // If no idempotency key provided, always process
  if (!idempotencyKey) {
    return { shouldProcess: true }
  }
  
  // Validate key format (should be UUID or similar)
  if (!isValidIdempotencyKey(idempotencyKey)) {
    throw new Response('Invalid Idempotency-Key format', { status: 400 })
  }
  
  const now = Date.now()
  const record = idempotencyStore.get(idempotencyKey)
  
  // Clean up expired record
  if (record && now > record.expiresAt) {
    idempotencyStore.delete(idempotencyKey)
    return { shouldProcess: true, key: idempotencyKey }
  }
  
  // If record exists and not expired
  if (record) {
    if (record.status === 'processing') {
      // Request is still being processed
      throw new Response('Request is being processed', { status: 409 })
    }
    
    if (record.status === 'completed') {
      // Return cached successful result
      return { 
        shouldProcess: false, 
        existingResult: record.result,
        key: idempotencyKey
      }
    }
    
    if (record.status === 'failed') {
      // Allow retry for failed requests
      idempotencyStore.delete(idempotencyKey)
      return { shouldProcess: true, key: idempotencyKey }
    }
  }
  
  // Mark as processing
  idempotencyStore.set(idempotencyKey, {
    status: 'processing',
    timestamp: now,
    expiresAt: now + windowMs
  })
  
  return { shouldProcess: true, key: idempotencyKey }
}

/**
 * Mark idempotency operation as completed
 * @param key - Idempotency key
 * @param result - Operation result to cache
 */
export function markIdempotencyCompleted(key: string, result: any): void {
  const record = idempotencyStore.get(key)
  if (record) {
    record.status = 'completed'
    record.result = result
  }
}

/**
 * Mark idempotency operation as failed
 * @param key - Idempotency key
 */
export function markIdempotencyFailed(key: string): void {
  const record = idempotencyStore.get(key)
  if (record) {
    record.status = 'failed'
  }
}

/**
 * Validate idempotency key format
 * @param key - Key to validate
 * @returns boolean indicating if key is valid
 */
function isValidIdempotencyKey(key: string): boolean {
  // Accept UUID format or alphanumeric strings between 10-64 characters
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  const alphanumericRegex = /^[a-zA-Z0-9_-]{10,64}$/
  
  return uuidRegex.test(key) || alphanumericRegex.test(key)
}

/**
 * Cleanup expired idempotency records
 * Call this periodically to prevent memory leaks
 */
export function cleanupIdempotencyStore(): void {
  const now = Date.now()
  let cleaned = 0
  
  for (const [key, record] of idempotencyStore.entries()) {
    if (now > record.expiresAt) {
      idempotencyStore.delete(key)
      cleaned++
    }
  }
  
  if (cleaned > 0) {
    console.log(`🧹 Idempotency store cleanup: removed ${cleaned} expired entries`)
  }
}

// Auto-cleanup every 5 minutes
setInterval(cleanupIdempotencyStore, 5 * 60 * 1000)