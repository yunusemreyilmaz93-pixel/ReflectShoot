import { describe, expect, test } from 'vitest';
import {
  totalFromCriteria,
  isValidCriteria,
  averageJuryTotal,
  isValidTeamName,
  teamNameError,
  isValidYouTubeUrl,
  isValidApplicationId,
  isOwnerWritableStatus,
  isPublicShowcaseStatus,
  isDeadlinePassed,
  isWithinWindow,
  sanitizeApplicationForPublic,
} from '../../lib/domain';

describe('scoring', () => {
  test('totalFromCriteria sums four axes', () => {
    expect(totalFromCriteria({ story: 20, technical: 20, originality: 20, themeFit: 20 })).toBe(80);
  });

  test('isValidCriteria rejects out of range', () => {
    expect(isValidCriteria({ story: 25, technical: 25, originality: 25, themeFit: 25 })).toBe(true);
    expect(isValidCriteria({ story: 26, technical: 0, originality: 0, themeFit: 0 })).toBe(false);
  });

  test('averageJuryTotal ignores draft and recused', () => {
    expect(
      averageJuryTotal([
        { total: 80, isDraft: false },
        { total: 90, isDraft: true },
        { total: 0, isRecused: true },
        { total: 90, isDraft: false },
      ])
    ).toBe(85);
  });
});

describe('teamValidation', () => {
  test('team name length', () => {
    expect(isValidTeamName('ab')).toBe(false);
    expect(isValidTeamName('abc')).toBe(true);
    expect(teamNameError('x')).not.toBeNull();
  });

  test('youtube and application id', () => {
    expect(isValidYouTubeUrl('https://www.youtube.com/watch?v=abc')).toBe(true);
    expect(isValidYouTubeUrl('https://vimeo.com/1')).toBe(false);
    expect(isValidApplicationId('team-one')).toBe(true);
    expect(isValidApplicationId('x')).toBe(false);
  });
});

describe('applicationStatus', () => {
  test('owner and public statuses', () => {
    expect(isOwnerWritableStatus('Taslak')).toBe(true);
    expect(isOwnerWritableStatus('Onaylandı')).toBe(false);
    expect(isPublicShowcaseStatus('Onaylandı')).toBe(true);
    expect(isPublicShowcaseStatus('Taslak')).toBe(false);
  });

  test('deadline and window helpers', () => {
    expect(isDeadlinePassed('2000-01-01T00:00:00Z', new Date('2020-01-01'))).toBe(true);
    expect(isWithinWindow('2000-01-01', '2099-01-01', new Date('2020-01-01'))).toBe(true);
    expect(isWithinWindow('2030-01-01', '2099-01-01', new Date('2020-01-01'))).toBe(false);
  });
});

describe('sanitizePublic', () => {
  test('strips PII from application projection', () => {
    const publicApp = sanitizeApplicationForPublic({
      id: 'app1',
      data: () => ({
        teacher: { id: 'u1', fullName: 'Secret', school: 'School A', city: 'Konya', email: 'a@b.com', phone: '555' },
        team: {
          id: 't1',
          name: 'Team',
          students: [{ firstName: 'Ada', lastName: 'Y' }],
          isFinalist: true,
          publicVotes: 3,
          videoUrl: 'https://youtube.com/watch?v=1',
        },
        status: 'Onaylandı',
        finalScore: 88,
        juryCount: 2,
      }),
    });

    expect(publicApp.teacher.email).toBe('');
    expect(publicApp.teacher.phone).toBe('');
    expect(publicApp.teacher.fullName).toBe('');
    expect(publicApp.team.students).toEqual([]);
    expect(publicApp.team.name).toBe('Team');
    expect(publicApp.team.publicVotes).toBe(3);
    expect(publicApp.teacher.school).toBe('School A');
  });
});
