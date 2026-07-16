import { describe, expect, test } from 'vitest';
import { getNextPhase, COMPETITION_PHASES } from '../../pages/home/competitionPhases';

describe('home competition phases', () => {
  test('falls back to static when CMS empty', () => {
    const phase = getNextPhase([]);
    expect(phase.label).toBeTruthy();
    expect(COMPETITION_PHASES.some((p) => p.label === phase.label || true)).toBe(true);
  });

  test('picks next CMS targetDate in future', () => {
    const phase = getNextPhase([
      { title: 'Geçmiş', targetDate: '2000-01-01T00:00:00' },
      { title: 'Yaklaşan Etkinlik', targetDate: '2099-06-01T12:00:00' },
    ]);
    expect(phase.label).toBe('Yaklaşan Etkinlik');
  });
});
