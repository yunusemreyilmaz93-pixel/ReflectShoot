import { describe, expect, test } from 'vitest';
import {
  validateJuryScorePayload,
  computeFinalScoreFromScores,
  CRITERIA_KEYS,
} from '../../server/juryScoreValidate.js';
import {
  validatePublicVoteBody,
  isVoteRateLimited,
  isApplicationVoteEligible,
} from '../../server/publicVoteValidate.js';

describe('jury-score validation', () => {
  const good = {
    appId: 'team-one',
    criteria: { story: 20, technical: 20, originality: 20, themeFit: 20 },
    notes: 'ok',
    isDraft: false,
    isRecused: false,
  };

  test('accepts valid payload', () => {
    const result = validateJuryScorePayload(good);
    expect(result.appId).toBe('team-one');
    expect(result.criteria.story).toBe(20);
    expect(CRITERIA_KEYS).toHaveLength(4);
  });

  test('rejects invalid app id', () => {
    expect(() => validateJuryScorePayload({ ...good, appId: 'x' })).toThrow();
  });

  test('rejects criteria out of range', () => {
    expect(() =>
      validateJuryScorePayload({
        ...good,
        criteria: { ...good.criteria, story: 26 },
      })
    ).toThrow();
  });

  test('computeFinalScoreFromScores matches API average', () => {
    const { finalScore, juryCount, gradedBy } = computeFinalScoreFromScores([
      { total: 80, juryId: 'j1', isDraft: false },
      { total: 90, juryId: 'j2', isDraft: true },
      { total: 0, juryId: 'j3', isRecused: true },
      { total: 90, juryId: 'j4', isDraft: false },
    ]);
    expect(finalScore).toBe(85);
    expect(juryCount).toBe(2);
    expect(gradedBy).toEqual(['j1', 'j4']);
  });
});

describe('public-vote validation', () => {
  test('accepts valid body', () => {
    const r = validatePublicVoteBody({
      appId: 'film-abc',
      fingerprint: 'abcdef0123456789',
    });
    expect(r.ok).toBe(true);
  });

  test('rejects short fingerprint', () => {
    const r = validatePublicVoteBody({ appId: 'film-abc', fingerprint: 'short' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe('invalid_fingerprint');
  });

  test('rate limit', () => {
    expect(isVoteRateLimited({ count: 50, lastVoteAtMs: 0 }, Date.now())).toBe(true);
    expect(isVoteRateLimited({ count: 1, lastVoteAtMs: Date.now() - 100 }, Date.now())).toBe(true);
    expect(isVoteRateLimited({ count: 1, lastVoteAtMs: Date.now() - 5000 }, Date.now())).toBe(false);
  });

  test('eligibility requires finalist + video', () => {
    expect(isApplicationVoteEligible({ team: { isFinalist: true, videoUrl: 'https://youtube.com/x' } })).toBe(true);
    expect(isApplicationVoteEligible({ team: { isFinalist: false, videoUrl: 'https://youtube.com/x' } })).toBe(false);
    expect(isApplicationVoteEligible({ team: { isFinalist: true } })).toBe(false);
  });
});
