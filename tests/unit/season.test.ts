import { describe, expect, test } from 'vitest';
import {
  canCreateApplication,
  filterAppsBySeason,
  getActiveSeason,
  isInSeason,
  DEFAULT_SEASON,
  buildNewSeasonSettings,
  validateNewSeasonId,
  countTeacherTeamsInSeason,
  appsToArchiveOnSeasonChange,
} from '../../lib/domain/season';
import type { Application, SystemSettings } from '../../types';
import { DEFAULT_SYSTEM_SETTINGS } from '../../context/defaults';

const baseApp = (over: Partial<Application> = {}): Application =>
  ({
    id: 'a1',
    teacher: { id: 't', fullName: 'T', school: 'S', city: 'C', email: 'e', phone: 'p' },
    team: {
      id: 't1',
      name: 'Team',
      category: 'Canlı Çekim' as any,
      theme: "Kur'an'dan Ayetler" as any,
      students: [],
      videoStatus: 'PENDING',
      isPreliminaryStageComplete: false,
      isFinalStageComplete: false,
    },
    status: 'Taslak' as any,
    submittedAt: '2026-01-01',
    ...over,
  }) as Application;

describe('season domain', () => {
  test('getActiveSeason falls back to default', () => {
    expect(getActiveSeason({} as SystemSettings).id).toBe(DEFAULT_SEASON.id);
    expect(getActiveSeason(DEFAULT_SYSTEM_SETTINGS).id).toBe('2026');
  });

  test('isInSeason treats untagged as current-season compatible', () => {
    const legacy = baseApp({});
    expect(isInSeason(legacy, '2026')).toBe(true);
    expect(isInSeason(baseApp({ seasonId: '2026' }), '2026')).toBe(true);
    expect(isInSeason(baseApp({ seasonId: '2025' }), '2026')).toBe(false);
    expect(isInSeason(baseApp({ seasonId: '2026', archived: true }), '2026')).toBe(false);
    expect(isInSeason(baseApp({ seasonId: '2026', archived: true }), '2026', { includeArchived: true })).toBe(true);
  });

  test('filterAppsBySeason', () => {
    const apps = [
      baseApp({ id: '1', seasonId: '2026' }),
      baseApp({ id: '2', seasonId: '2025' }),
      baseApp({ id: '3' }),
    ];
    expect(filterAppsBySeason(apps, '2026').map((a) => a.id).sort()).toEqual(['1', '3']);
  });

  test('canCreateApplication respects block flag', () => {
    expect(canCreateApplication(DEFAULT_SYSTEM_SETTINGS).ok).toBe(true);
    const blocked = {
      ...DEFAULT_SYSTEM_SETTINGS,
      features: { ...DEFAULT_SYSTEM_SETTINGS.features, blockNewApplications: true },
    };
    const r = canCreateApplication(blocked);
    expect(r.ok).toBe(false);
  });

  test('buildNewSeasonSettings can blank all dates (announced later)', () => {
    const next = buildNewSeasonSettings(DEFAULT_SYSTEM_SETTINGS, {
      id: '2027',
      label: '2026-27',
      clearDates: true,
      openApplications: false,
    });
    expect(next.season).toEqual({ id: '2027', label: '2026-27' });
    expect(Object.values(next.dates).every((v) => v === '')).toBe(true);
    expect(next.features.blockNewApplications).toBe(true);
  });

  test('buildNewSeasonSettings shifts year and opens apps', () => {
    const next = buildNewSeasonSettings(DEFAULT_SYSTEM_SETTINGS, {
      id: '2027',
      label: 'R&S 2027',
      shiftYears: 1,
      openApplications: true,
      resetVideoUpload: true,
    });
    expect(next.season?.id).toBe('2027');
    expect(next.features.blockNewApplications).toBe(false);
    expect(next.features.videoUploadActive).toBe(false);
    expect(next.features.publicVotingActive).toBe(false);
    expect(next.dates.applicationStart).toContain('2027');
  });

  test('validateNewSeasonId', () => {
    expect(validateNewSeasonId('2026', '2026')).not.toBeNull();
    expect(validateNewSeasonId('2027', '2026')).toBeNull();
    expect(validateNewSeasonId('a', '2026')).not.toBeNull();
  });

  test('countTeacherTeamsInSeason ignores other seasons and archived', () => {
    const apps = [
      baseApp({ id: '1', seasonId: '2026', teacher: { id: 't1', fullName: 'T', school: 'S', city: 'C', email: 'e', phone: 'p' } }),
      baseApp({ id: '2', seasonId: '2025', teacher: { id: 't1', fullName: 'T', school: 'S', city: 'C', email: 'e', phone: 'p' } }),
      baseApp({ id: '3', seasonId: '2026', archived: true, teacher: { id: 't1', fullName: 'T', school: 'S', city: 'C', email: 'e', phone: 'p' } }),
    ];
    expect(countTeacherTeamsInSeason(apps, 't1', '2026')).toBe(1);
  });

  test('appsToArchiveOnSeasonChange', () => {
    const apps = [
      baseApp({ id: '1', seasonId: '2026' }),
      baseApp({ id: '2', seasonId: '2025' }),
      baseApp({ id: '3', archived: true, seasonId: '2026' }),
      baseApp({ id: '4' }), // legacy
    ];
    const toArch = appsToArchiveOnSeasonChange(apps, '2026');
    expect(toArch.map((a) => a.id).sort()).toEqual(['1', '4']);
  });
});
