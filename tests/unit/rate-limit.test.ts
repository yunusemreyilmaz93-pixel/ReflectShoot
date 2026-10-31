import { afterEach, describe, expect, test, vi } from 'vitest';
import { enforceRateLimit } from '../../server/rateLimit.js';
import { createFakeDb } from './helpers/fakeDb';

const opts = { scope: 'upload', limit: 3, windowMs: 60_000 };

describe('enforceRateLimit', () => {
  afterEach(() => vi.useRealTimers());

  test('allows up to the limit, then answers 429', async () => {
    const db = createFakeDb();
    for (let i = 0; i < 3; i++) await enforceRateLimit(db, { ...opts, key: 'u1' });
    await expect(enforceRateLimit(db, { ...opts, key: 'u1' })).rejects.toMatchObject({ status: 429, code: 'rate_limited' });
  });

  test('keys and scopes are isolated', async () => {
    const db = createFakeDb();
    for (let i = 0; i < 3; i++) await enforceRateLimit(db, { ...opts, key: 'u1' });
    await expect(enforceRateLimit(db, { ...opts, key: 'u2' })).resolves.toBeUndefined();
    await expect(enforceRateLimit(db, { ...opts, scope: 'log', key: 'u1' })).resolves.toBeUndefined();
  });

  test('the window resets', async () => {
    vi.useFakeTimers();
    const db = createFakeDb();
    for (let i = 0; i < 3; i++) await enforceRateLimit(db, { ...opts, key: 'u1' });
    vi.advanceTimersByTime(60_001);
    await expect(enforceRateLimit(db, { ...opts, key: 'u1' })).resolves.toBeUndefined();
  });

  test('fails open when Firestore itself errors', async () => {
    const db: any = createFakeDb();
    db.runTransaction = async () => {
      throw new Error('firestore unavailable');
    };
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    await expect(enforceRateLimit(db, { ...opts, key: 'u1' })).resolves.toBeUndefined();
    spy.mockRestore();
  });
});
