/**
 * Rate limiting utility for protecting sensitive API endpoints
 * Uses in-memory storage (can be replaced with Redis for production scaling)
 */

export interface RateLimitOptions {
  key: string
  limit: number
  windowSec: number
}

interface RateLimitRecord {
  count: number
  resetAt: number
}

// In-memory store for rate limiting (replace with Redis in production)
const memoryStore = new Map<string, RateLimitRecord>()

/**
 * Rate limiting function that throws 429 response when limit exceeded
 * @param req - The incoming request
 * @param opts - Rate limiting configuration
 * @throws Response with 429 status when rate limit exceeded
 */
export async function rateLimit(req: Request, opts: RateLimitOptions): Promise<void> {
  // Extract IP address (considering proxy headers)
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
             req.headers.get('x-real-ip') || 
             'unknown'
  
  const key = `${opts.key}:${ip}`
  const now = Date.now()
  
  // Get or create rate limit record
  const record = memoryStore.get(key)
  
  // Reset window if expired or first request
  if (!record || now > record.resetAt) {
    memoryStore.set(key, { 
      count: 1, 
      resetAt: now + opts.windowSec * 1000 
    })
    return
  }
  
  // Check if limit exceeded
  if (record.count >= opts.limit) {
    // Log rate limit violation for security monitoring
    console.warn('🚨 RATE LIMIT EXCEEDED:', {
      ip,
      key: opts.key,
      count: record.count,
      limit: opts.limit,
      windowSec: opts.windowSec,
      resetAt: new Date(record.resetAt).toISOString()
    })
    
    throw new Response('Too many requests', { status: 429 })
  }
  
  // Increment counter
  record.count++
}

/**
 * Cleanup old entries from memory store (call periodically)
 * This prevents memory leaks in long-running processes
 */
export function cleanupRateLimitStore(): void {
  const now = Date.now()
  let cleaned = 0
  
  for (const [key, record] of memoryStore.entries()) {
    if (now > record.resetAt) {
      memoryStore.delete(key)
      cleaned++
    }
  }
  
  if (cleaned > 0) {
    console.log(`🧹 Rate limit store cleanup: removed ${cleaned} expired entries`)
  }
}

// Auto-cleanup every 5 minutes
setInterval(cleanupRateLimitStore, 5 * 60 * 1000)