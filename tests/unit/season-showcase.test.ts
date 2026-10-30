import { describe, expect, test } from 'vitest';
import { splitShowcaseBySeason } from '../../pages/cinema/showcaseSeasons';
import { sanitizeApplication, seasonOf } from '../../server/publicShowcase.js';

const app = (id: string, seasonId: string | undefined, category: string): any => ({
  id,
  seasonId,
  team: { name: id, category },
});

describe('showcase seasons', () => {
  const apps = [
    app('old-live', undefined, 'Canlı Çekim'),
    app('old-ai', '2026', 'Yapay Zeka Animasyon'),
    app('new-ai', '2027', 'Yapay Zeka Animasyon'),
    app('new-live', '2027', 'Canlı Çekim'),
  ];

  test('the gala lists only the archived 2026 season, AI films only', () => {
    expect(seasonOf({})).toBe('2026');
    expect(seasonOf({ seasonId: '2027' })).toBe('2027');
    expect(splitShowcaseBySeason(apps).archive.map((a) => a.id)).toEqual(['old-ai']);
  });

  test('server projection exposes the season', () => {
    const projected = sanitizeApplication({ id: 'x', data: () => ({ team: { name: 'T' }, status: 'Onaylandı' }) });
    expect(projected.seasonId).toBe('2026');
    expect(projected.archived).toBe(false);
  });
});
