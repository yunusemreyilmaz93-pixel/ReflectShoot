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

  test('legacy (untagged) applications belong to the archived 2026 season', () => {
    expect(seasonOf({})).toBe('2026');
    expect(seasonOf({ seasonId: '2027' })).toBe('2027');
    const { archive } = splitShowcaseBySeason(apps, '2027');
    expect(archive.map((a) => a.id)).toEqual(['old-live', 'old-ai']);
  });

  test('the active season lists AI films only; nothing is "current" while 2026 is still active', () => {
    expect(splitShowcaseBySeason(apps, '2027').current.map((a) => a.id)).toEqual(['new-ai']);
    expect(splitShowcaseBySeason(apps, '2026').current).toEqual([]);
  });

  test('server projection exposes the season', () => {
    const projected = sanitizeApplication({ id: 'x', data: () => ({ team: { name: 'T' }, status: 'Onaylandı' }) });
    expect(projected.seasonId).toBe('2026');
    expect(projected.archived).toBe(false);
  });
});
