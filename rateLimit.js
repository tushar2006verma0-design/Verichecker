import { RATE_LIMIT_MAX, RATE_LIMIT_WINDOW } from './constants';

// IP -> { count, resetTime }
const rateLimitStore = new Map();

/**
 * Check if a request is allowed based on IP rate limiting
 * @param {string} ip - Client IP address
 * @returns {{ allowed: boolean, remaining: number, resetIn: number }}
 */
export function checkRateLimit(ip) {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  // No prior requests or window expired
  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return {
      allowed: true,
      remaining: RATE_LIMIT_MAX - 1,
      resetIn: RATE_LIMIT_WINDOW,
    };
  }

  // Within window
  if (entry.count < RATE_LIMIT_MAX) {
    entry.count++;
    return {
      allowed: true,
      remaining: RATE_LIMIT_MAX - entry.count,
      resetIn: entry.resetTime - now,
    };
  }

  // Rate limited
  return {
    allowed: false,
    remaining: 0,
    resetIn: entry.resetTime - now,
  };
}

// Periodic cleanup of expired entries (every 10 minutes)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of rateLimitStore.entries()) {
      if (now > entry.resetTime) {
        rateLimitStore.delete(ip);
      }
    }
  }, 10 * 60 * 1000);
}
