/**
 * Simple in-memory rate limiter for API routes.
 * 
 * For production with multiple instances, replace with Redis-backed solution:
 * - @upstash/ratelimit + @upstash/redis
 * - Or use Vercel's built-in rate limiting
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

class RateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(private limit: number, private windowMs: number) {
    // Clean up expired entries every minute
    this.cleanupInterval = setInterval(() => this.cleanup(), 60_000);
  }

  check(identifier: string): { success: boolean; limit: number; remaining: number; reset: number } {
    const now = Date.now();
    const entry = this.store.get(identifier);

    // No entry or expired entry
    if (!entry || now > entry.resetAt) {
      this.store.set(identifier, {
        count: 1,
        resetAt: now + this.windowMs,
      });
      return {
        success: true,
        limit: this.limit,
        remaining: this.limit - 1,
        reset: now + this.windowMs,
      };
    }

    // Entry exists and not expired
    if (entry.count < this.limit) {
      entry.count++;
      return {
        success: true,
        limit: this.limit,
        remaining: this.limit - entry.count,
        reset: entry.resetAt,
      };
    }

    // Rate limit exceeded
    return {
      success: false,
      limit: this.limit,
      remaining: 0,
      reset: entry.resetAt,
    };
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetAt) {
        this.store.delete(key);
      }
    }
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

import { RATE_LIMITS } from "./constants";

// Rate limiters for different endpoints
export const claudeRateLimiter = new RateLimiter(
  RATE_LIMITS.CLAUDE_REQUESTS_PER_MINUTE,
  RATE_LIMITS.WINDOW_MS
);

export const checkoutRateLimiter = new RateLimiter(
  RATE_LIMITS.CHECKOUT_REQUESTS_PER_MINUTE,
  RATE_LIMITS.WINDOW_MS
);

/**
 * Get client identifier from request (IP address or fallback)
 */
export function getClientIdentifier(request: Request): string {
  // Try various headers for IP address
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');

  const ip = cfConnectingIp || realIp || forwarded?.split(',')[0] || 'unknown';
  return ip.trim();
}

/**
 * Create rate limit response with appropriate headers
 */
export function createRateLimitResponse(result: ReturnType<RateLimiter['check']>) {
  return new Response(
    JSON.stringify({
      error: 'Rate limit exceeded. Please try again later.',
      retryAfter: Math.ceil((result.reset - Date.now()) / 1000),
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': String(result.limit),
        'X-RateLimit-Remaining': String(result.remaining),
        'X-RateLimit-Reset': String(result.reset),
        'Retry-After': String(Math.ceil((result.reset - Date.now()) / 1000)),
      },
    }
  );
}
