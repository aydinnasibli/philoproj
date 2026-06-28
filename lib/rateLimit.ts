import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();
const cache = new Map();
const limiters = new Map<string, Ratelimit>();

function getLimiter(maxRequests: number, windowSeconds: number): Ratelimit {
  const key = `${maxRequests}:${windowSeconds}`;
  let rl = limiters.get(key);
  if (!rl) {
    rl = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(maxRequests, `${windowSeconds} s`),
      ephemeralCache: cache,
    });
    limiters.set(key, rl);
  }
  return rl;
}

export async function checkRateLimit(
  identifier: string,
  maxRequests: number,
  windowSeconds: number
): Promise<{ remaining: number; reset: number }> {
  const rl = getLimiter(maxRequests, windowSeconds);
  const { success, remaining, reset } = await rl.limit(identifier);

  if (!success) {
    throw new Error("Too many requests — please slow down.");
  }

  return { remaining, reset };
}
