/**
 * Simple in-memory rate limiter
 * For production, replace with Redis/Upstash for distributed rate limiting
 * 
 * Usage:
 * const rateLimiter = createRateLimiter({ requests: 10, window: 60000 }) // 10 req/min
 * const { allowed, remaining, reset } = await rateLimiter.check(userId)
 */

interface RateLimiterOptions {
  requests: number  // Number of requests allowed
  window: number    // Time window in milliseconds
}

interface RateLimitResult {
  allowed: boolean
  remaining: number
  reset: number
  limit: number
}

interface RequestRecord {
  count: number
  resetAt: number
}

// In-memory store (not suitable for multi-instance deployments)
// For production: use Redis/Upstash
const store = new Map<string, RequestRecord>()

export function createRateLimiter(options: RateLimiterOptions) {
  const { requests, window } = options

  return {
    async check(identifier: string): Promise<RateLimitResult> {
      const now = Date.now()
      const key = `rate-limit:${identifier}`
      
      // Get current record
      let record = store.get(key)
      
      // Clean up expired records
      if (record && record.resetAt <= now) {
        store.delete(key)
        record = undefined
      }
      
      // Create new record if needed
      if (!record) {
        record = {
          count: 0,
          resetAt: now + window,
        }
        store.set(key, record)
      }
      
      // Check if limit exceeded
      const allowed = record.count < requests
      
      // Increment counter if allowed
      if (allowed) {
        record.count++
      }
      
      return {
        allowed,
        remaining: Math.max(0, requests - record.count),
        reset: record.resetAt,
        limit: requests,
      }
    },
    
    // Reset a specific identifier (useful for testing)
    async reset(identifier: string): Promise<void> {
      const key = `rate-limit:${identifier}`
      store.delete(key)
    },
    
    // Clear all rate limit data (useful for testing)
    async clear(): Promise<void> {
      store.clear()
    },
  }
}

// Pre-configured rate limiters for different endpoint types
export const aiRateLimiter = createRateLimiter({
  requests: 10,      // 10 requests
  window: 60 * 1000, // per minute
})

export const uploadRateLimiter = createRateLimiter({
  requests: 20,      // 20 requests
  window: 60 * 1000, // per minute
})

export const generalRateLimiter = createRateLimiter({
  requests: 100,       // 100 requests
  window: 60 * 1000,   // per minute
})

/**
 * Helper function to apply rate limiting in API routes
 */
export async function applyRateLimit(
  identifier: string,
  limiter: ReturnType<typeof createRateLimiter>
): Promise<RateLimitResult> {
  const result = await limiter.check(identifier)
  return result
}

/**
 * Middleware-style rate limit checker
 * Returns null if allowed, or NextResponse with 429 if rate limited
 */
export async function checkRateLimit(
  userId: string | undefined,
  limiter: ReturnType<typeof createRateLimiter>
): Promise<{ allowed: true; remaining: number } | { allowed: false; response: Response }> {
  // Use IP or user ID as identifier
  const identifier = userId || 'anonymous'
  
  const result = await limiter.check(identifier)
  
  if (!result.allowed) {
    const resetDate = new Date(result.reset)
    return {
      allowed: false,
      response: new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          message: `Too many requests. Please try again after ${resetDate.toISOString()}`,
          limit: result.limit,
          remaining: result.remaining,
          reset: resetDate.toISOString(),
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': result.limit.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': result.reset.toString(),
            'Retry-After': Math.ceil((result.reset - Date.now()) / 1000).toString(),
          },
        }
      ),
    }
  }
  
  return { allowed: true, remaining: result.remaining }
}

// Cleanup interval - remove expired records every 5 minutes
if (typeof window === 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, record] of store.entries()) {
      if (record.resetAt <= now) {
        store.delete(key)
      }
    }
  }, 5 * 60 * 1000)
}

