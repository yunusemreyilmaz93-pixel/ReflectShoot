import { describe, expect, test } from 'vitest';
import {
  validateJuryScorePayload,
  computeFinalScoreFromScores,
  CRITERIA_KEYS,
} from '../../server/juryScoreValidate.js';
import { validateAdminUserRoleBody } from '../../server/adminUserRoleValidate.js';

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

describe('admin-user-role validation', () => {
  test('accepts valid admin role payload', () => {
    const r = validateAdminUserRoleBody({ uid: 'abc123xyz', role: 'JUDGE' });
    expect(r.role).toBe('JUDGE');
  });

  test('rejects invalid role', () => {
    expect(() => validateAdminUserRoleBody({ uid: 'abc123xyz', role: 'HACKER' })).toThrow();
  });

  test('rejects short uid', () => {
    expect(() => validateAdminUserRoleBody({ uid: 'ab', role: 'TEACHER' })).toThrow();
  });
});
