import { Redis } from "@upstash/redis";

// Initialize Redis client
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

export type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
};

/**
 * Rate limit using Upstash Redis
 *
 * @param identifier - Unique identifier (IP address, user ID, etc.)
 * @param limit - Max requests allowed in window
 * @param window - Time window in seconds
 * @returns Rate limit result
 *
 * Algorithm: Sliding Window Counter
 * - Uses Redis sorted sets with timestamps
 * - Removes expired entries
 * - Counts entries in current window
 * - Allows if under limit
 */
export async function rateLimit(
  identifier: string,
  limit: number = 10,
  window: number = 60
): Promise<RateLimitResult> {
  // Fallback to permissive if Redis not configured
  if (!redis) {
    console.warn("Redis not configured, rate limiting disabled");
    return {
      success: true,
      limit,
      remaining: limit,
      reset: Date.now() + window * 1000,
    };
  }

  try {
    const now = Date.now();
    const key = `rate-limit:${identifier}`;
    const windowStart = now - window * 1000;

    // Use Redis pipeline for atomic operations
    const pipeline = redis.pipeline();

    // Remove old entries outside current window
    pipeline.zremrangebyscore(key, 0, windowStart);

    // Count entries in current window
    pipeline.zcard(key);

    // Add current request
    pipeline.zadd(key, { score: now, member: `${now}` });

    // Set expiry on key (cleanup)
    pipeline.expire(key, window);

    // Execute pipeline
    const results = await pipeline.exec();

    // Get count from pipeline results
    // results[1] is from zcard command
    const count = (results[1] as number) || 0;

    const remaining = Math.max(0, limit - count);
    const reset = now + window * 1000;

    if (count >= limit) {
      return {
        success: false,
        limit,
        remaining: 0,
        reset,
        retryAfter: Math.ceil(window),
      };
    }

    return {
      success: true,
      limit,
      remaining,
      reset,
    };
  } catch (error) {
    console.error("Rate limit error:", error);
    // Fail open - allow request if Redis error
    return {
      success: true,
      limit,
      remaining: limit,
      reset: Date.now() + window * 1000,
    };
  }
}

/**
 * Get IP address from request headers
 */
export function getClientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  );
}
