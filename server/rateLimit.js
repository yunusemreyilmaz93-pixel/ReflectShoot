import { createHash } from 'node:crypto';
import { HttpError } from './auth.js';

/**
 * Fixed-window rate limit kept in Firestore (`rate_limits/{hash}`, server-only: the rules deny
 * every client access). One transaction per call, so use it on endpoints that are called at human
 * speed (presigned URLs, name checks, audit log), not on hot paths.
 *
 * Fails open: if Firestore itself is unavailable the request goes through, because blocking every
 * teacher during an outage is worse than missing one throttle.
 */
export async function enforceRateLimit(db, { scope, key, limit, windowMs }) {
  const id = createHash('sha256').update(`${scope}:${key}`).digest('hex');
  const ref = db.collection('rate_limits').doc(id);
  const now = Date.now();

  try {
    await db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(ref);
      const data = snapshot.data() || {};
      const windowStart = Number(data.windowStart || 0);
      const withinWindow = now - windowStart < windowMs;
      const count = withinWindow ? Number(data.count || 0) : 0;

      if (count >= limit) {
        throw new HttpError(429, 'Çok fazla istek gönderdiniz. Lütfen biraz sonra tekrar deneyin.', 'rate_limited');
      }

      transaction.set(ref, { scope, count: count + 1, windowStart: withinWindow ? windowStart : now });
    });
  } catch (error) {
    if (error instanceof HttpError) throw error;
    console.error('Rate limit check failed (allowing the request):', error);
  }
}

/** Limits per user and hour for the authenticated endpoints that call it. */
export const LIMITS = Object.freeze({
  upload: { scope: 'upload', limit: 40, windowMs: 60 * 60 * 1000 },
  teamName: { scope: 'team-name', limit: 60, windowMs: 60 * 60 * 1000 },
  log: { scope: 'log', limit: 300, windowMs: 60 * 60 * 1000 },
  view: { scope: 'view', limit: 300, windowMs: 60 * 60 * 1000 },
});
