import type { Application, SeasonConfig, SystemSettings } from '../../types';

export const DEFAULT_SEASON: SeasonConfig = {
  id: '2026',
  label: 'Reflect & Shoot 2026',
};

export function getActiveSeason(settings: SystemSettings | null | undefined): SeasonConfig {
  if (settings?.season?.id) {
    return {
      id: settings.season.id,
      label: settings.season.label || settings.season.id,
    };
  }
  return DEFAULT_SEASON;
}

/** Apps without seasonId are treated as legacy (pre multi-season). */
export function appSeasonId(app: Pick<Application, 'seasonId'> | null | undefined): string {
  return app?.seasonId || 'legacy';
}

export function isInSeason(
  app: Pick<Application, 'seasonId' | 'archived'>,
  seasonId: string,
  opts: { includeArchived?: boolean } = {}
): boolean {
  if (!opts.includeArchived && app.archived) return false;
  if (seasonId === 'all') return opts.includeArchived ? true : !app.archived;
  if (seasonId === 'legacy') return appSeasonId(app) === 'legacy' && (opts.includeArchived || !app.archived);
  // Current season includes legacy apps that were never tagged
  if (appSeasonId(app) === 'legacy') return true;
  return appSeasonId(app) === seasonId && (opts.includeArchived || !app.archived);
}

export function filterAppsBySeason(
  apps: Application[],
  seasonId: string,
  opts: { includeArchived?: boolean } = {}
): Application[] {
  return apps.filter((app) => isInSeason(app, seasonId, opts));
}

export function canCreateApplication(settings: SystemSettings): { ok: true } | { ok: false; reason: string } {
  if (settings.features?.blockNewApplications) {
    return { ok: false, reason: 'Yeni başvuru şu an kapalı (sezon arşiv / kilit).' };
  }
  if (settings.features?.allowNewRegistrations === false) {
    return { ok: false, reason: 'Yeni kayıtlar şu an kapalı.' };
  }
  return { ok: true };
}

/** Count of a teacher's teams that count toward the max-teams limit in the active season. */
export function countTeacherTeamsInSeason(
  apps: Application[],
  teacherId: string,
  seasonId: string
): number {
  return apps.filter(
    (a) => a.teacher?.id === teacherId && isInSeason(a, seasonId)
  ).length;
}

function shiftIsoDate(value: string | undefined, years: number): string {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  d.setFullYear(d.getFullYear() + years);
  // Preserve datetime-local style when possible (YYYY-MM-DDTHH:mm)
  const pad = (n: number) => String(n).padStart(2, '0');
  if (value.includes('T') || value.length >= 16) {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Shift all competition date fields by N years (for new-season template). */
export function shiftSystemDates(
  dates: SystemSettings['dates'],
  years: number
): SystemSettings['dates'] {
  const keys = Object.keys(dates) as (keyof SystemSettings['dates'])[];
  const next = { ...dates };
  for (const k of keys) {
    const v = dates[k];
    if (typeof v === 'string' && v) {
      (next as Record<string, string>)[k as string] = shiftIsoDate(v, years);
    }
  }
  return next;
}

export type NewSeasonInput = {
  id: string;
  label: string;
  /** Shift all dates by this many years (default 1). */
  shiftYears?: number;
  /** Open teacher registrations / applications for the new season. */
  openApplications?: boolean;
  /** Turn video upload off until admin re-enables. */
  resetVideoUpload?: boolean;
};

/**
 * Build next system settings for a new competition season.
 * Does not archive applications — caller handles bulk archive.
 */
export function buildNewSeasonSettings(
  current: SystemSettings,
  input: NewSeasonInput
): SystemSettings {
  const id = input.id.trim();
  const label = input.label.trim() || id;
  const years = input.shiftYears ?? 1;
  const open = input.openApplications !== false;
  const resetVideo = input.resetVideoUpload !== false;

  return {
    ...current,
    season: { id, label },
    dates: shiftSystemDates(current.dates, years),
    features: {
      ...current.features,
      blockNewApplications: !open,
      allowNewRegistrations: open,
      videoUploadActive: resetVideo ? false : current.features.videoUploadActive,
      publicVotingActive: false,
      publicResultReveal: false,
      judgeSystemActive: false,
    },
  };
}

export function validateNewSeasonId(
  id: string,
  previousId: string
): string | null {
  const trimmed = id.trim();
  if (trimmed.length < 2 || trimmed.length > 32) {
    return 'Sezon ID 2–32 karakter olmalı.';
  }
  if (!/^[a-zA-Z0-9._-]+$/.test(trimmed)) {
    return 'Sezon ID yalnızca harf, rakam, . _ - içerebilir.';
  }
  if (trimmed === previousId) {
    return 'Yeni sezon ID mevcut sezonla aynı olamaz.';
  }
  return null;
}

/** Apps belonging to the previous active season (for archive on season change). */
export function appsToArchiveOnSeasonChange(
  apps: Application[],
  previousSeasonId: string
): Application[] {
  return apps.filter((app) => {
    if (app.archived) return false;
    const sid = appSeasonId(app);
    // legacy treated as current before multi-season — archive them with previous
    if (sid === 'legacy') return true;
    return sid === previousSeasonId;
  });
}
