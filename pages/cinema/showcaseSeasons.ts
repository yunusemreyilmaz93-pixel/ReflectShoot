import type { Application } from '../../types';

/** The 2025-26 competition (stored as season "2026"): kept online as an archive for inspiration. */
export const ARCHIVE_SEASON_ID = '2026';

/** Only AI animation films are shown in the gala; live-action films were retired. */
export const SHOWCASE_CATEGORY = 'Yapay Zeka Animasyon';

export function splitShowcaseBySeason(apps: Application[]): { archive: Application[] } {
  const seasonOf = (app: Application) => app.seasonId || ARCHIVE_SEASON_ID;
  return {
    archive: apps.filter((app) => seasonOf(app) === ARCHIVE_SEASON_ID && app.team?.category === SHOWCASE_CATEGORY),
  };
}
