import type { Application } from '../../types';

/** The 2025-26 competition (stored as season "2026"): kept online as an archive for inspiration. */
export const ARCHIVE_SEASON_ID = '2026';

export type ShowcaseSplit = {
  /** Films of the archived 2025-26 season, both categories. */
  archive: Application[];
  /** Films of the currently active season (AI animation only). Empty until they are published. */
  current: Application[];
};

export function splitShowcaseBySeason(apps: Application[], activeSeasonId: string): ShowcaseSplit {
  const seasonOf = (app: Application) => app.seasonId || ARCHIVE_SEASON_ID;
  return {
    archive: apps.filter((app) => seasonOf(app) === ARCHIVE_SEASON_ID),
    current:
      activeSeasonId === ARCHIVE_SEASON_ID
        ? []
        : apps.filter((app) => seasonOf(app) === activeSeasonId && app.team?.category === 'Yapay Zeka Animasyon'),
  };
}
