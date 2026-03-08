import { redis } from "@/lib/redis";

const DAILY_LIMIT = 20;
const TTL_SECONDS = 86400; // 24 hours

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
}

export async function checkRateLimit(userEmail: string): Promise<RateLimitResult> {
  const key = `ratelimit:generate-pr:${userEmail}`;

  const current = await redis.incr(key);

  // First request of the window — set the 24h TTL
  if (current === 1) {
    await redis.expire(key, TTL_SECONDS);
  }

  const allowed = current <= DAILY_LIMIT;
  const remaining = Math.max(0, DAILY_LIMIT - current);

  return { allowed, remaining, limit: DAILY_LIMIT };
}
