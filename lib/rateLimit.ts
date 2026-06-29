import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import * as Sentry from "@sentry/nextjs";

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
      // If Upstash doesn't respond in time, allow the request through rather than
      // hanging the caller. This only covers slow responses — hard errors are
      // handled by the try/catch below.
      timeout: 1500,
    });
    limiters.set(key, rl);
  }
  return rl;
}

type LimitResult = Awaited<ReturnType<Ratelimit["limit"]>>;

/**
 * Checks a sliding-window rate limit.
 *
 * @param opts.failOpen When the limiter itself is unavailable (Upstash down /
 *   network error), allow the request instead of throwing. Use this for cheap,
 *   core-UX paths so a rate-limiter outage doesn't 500 the user's primary
 *   actions. Leave it off (default) for expensive paths — e.g. OpenAI calls —
 *   that should fail closed under abuse or when limits can't be enforced.
 */
export async function checkRateLimit(
  identifier: string,
  maxRequests: number,
  windowSeconds: number,
  opts: { failOpen?: boolean } = {},
): Promise<{ remaining: number; reset: number }> {
  const rl = getLimiter(maxRequests, windowSeconds);

  let result: LimitResult;
  try {
    result = await rl.limit(identifier);
  } catch (err) {
    // The limiter is unreachable (the built-in `timeout` only fails open on slow
    // responses, not connection/auth errors). Report it, then either allow or
    // block depending on how critical enforcement is for this path.
    Sentry.captureException(err, {
      extra: { context: "rateLimit unavailable", identifier },
    });
    if (opts.failOpen) {
      return { remaining: maxRequests, reset: Date.now() + windowSeconds * 1000 };
    }
    throw err;
  }

  const { success, remaining, reset } = result;
  if (!success) {
    throw new Error("Too many requests — please slow down.");
  }

  return { remaining, reset };
}
