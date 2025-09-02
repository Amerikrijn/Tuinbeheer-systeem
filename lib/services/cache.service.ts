/**
 * SUPABASE FREE TIER OPTIMIZATION: Smart Caching Service
 * 
 * Implements intelligent caching to reduce database calls and improve performance
 * for Supabase Free Tier limitations (3-4 connections, 60s timeout)
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number // Time to live in milliseconds
  accessCount: number
  lastAccessed: number
}

interface CacheStats {
  hits: number
  misses: number
  evictions: number
  size: number
}

export class CacheService {
  private cache = new Map<string, CacheEntry<any>>()
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    size: 0
  }
  
  // SUPABASE FREE TIER: Conservative cache settings
  private readonly DEFAULT_TTL = 5 * 60 * 1000 // 5 minutes
  private readonly MAX_SIZE = 50 // Limit cache size for Free Tier
  private readonly CLEANUP_INTERVAL = 2 * 60 * 1000 // Cleanup every 2 minutes
  
  constructor() {
    // Start periodic cleanup
    this.startCleanup()
  }
  
  /**
   * Get data from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      this.stats.misses++
      return null
    }
    
    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      this.stats.misses++
      this.stats.evictions++
      this.stats.size--
      return null
    }
    
    // Update access stats
    entry.accessCount++
    entry.lastAccessed = Date.now()
    this.stats.hits++
    
    return entry.data
  }
  
  /**
   * Set data in cache
   */
  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    // SUPABASE FREE TIER: Enforce size limit
    if (this.cache.size >= this.MAX_SIZE) {
      this.evictLeastUsed()
    }
    
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      accessCount: 0,
      lastAccessed: Date.now()
    }
    
    this.cache.set(key, entry)
    this.stats.size = this.cache.size
  }
  
  /**
   * Remove specific key from cache
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key)
    if (deleted) {
      this.stats.size = this.cache.size
    }
    return deleted
  }
  
  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear()
    this.stats.size = 0
    this.stats.evictions += this.cache.size
  }
  
  /**
   * Get cache statistics
   */
  getStats(): CacheStats & { hitRate: number } {
    const total = this.stats.hits + this.stats.misses
    return {
      ...this.stats,
      hitRate: total > 0 ? this.stats.hits / total : 0
    }
  }
  
  /**
   * Evict least recently used entry
   */
  private evictLeastUsed(): void {
    let oldestKey = ''
    let oldestTime = Date.now()
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed
        oldestKey = key
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey)
      this.stats.evictions++
      this.stats.size--
    }
  }
  
  /**
   * Start periodic cleanup of expired entries
   */
  private startCleanup(): void {
    setInterval(() => {
      const now = Date.now()
      let cleaned = 0
      
      for (const [key, entry] of this.cache.entries()) {
        if (now - entry.timestamp > entry.ttl) {
          this.cache.delete(key)
          cleaned++
        }
      }
      
      if (cleaned > 0) {
        this.stats.evictions += cleaned
        this.stats.size = this.cache.size
        console.log(`🧹 Cache cleanup: removed ${cleaned} expired entries`)
      }
    }, this.CLEANUP_INTERVAL)
  }
}

// SUPABASE FREE TIER: Global cache instance
export const cacheService = new CacheService()

/**
 * Cache key generators for consistent naming
 */
export const CacheKeys = {
  gardens: (userId?: string) => `gardens:${userId || 'all'}`,
  garden: (gardenId: string) => `garden:${gardenId}`,
  plantBeds: (gardenId: string) => `plantbeds:${gardenId}`,
  plants: (plantBedId: string) => `plants:${plantBedId}`,
  user: (userId: string) => `user:${userId}`,
  userGardenAccess: (userId: string) => `user_access:${userId}`,
  logbook: (gardenId: string, year?: number) => `logbook:${gardenId}:${year || 'all'}`,
  tasks: (userId: string, date?: string) => `tasks:${userId}:${date || 'all'}`
} as const

/**
 * Cache TTL constants (in milliseconds)
 */
export const CacheTTL = {
  SHORT: 2 * 60 * 1000,    // 2 minutes - for frequently changing data
  MEDIUM: 5 * 60 * 1000,   // 5 minutes - for moderately changing data
  LONG: 15 * 60 * 1000,    // 15 minutes - for rarely changing data
  VERY_LONG: 30 * 60 * 1000 // 30 minutes - for static data
} as const
