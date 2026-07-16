import { describe, expect, test } from 'vitest';
import {
  sanitizeFirestoreData,
  resolvePublicTimelineEvents,
  sortTimelineItems,
  normalizeTimelineOrder,
} from '../../lib/domain/timeline';
import type { CMSTimelineItem } from '../../types';

describe('timeline domain', () => {
  test('sanitizeFirestoreData strips id and undefined', () => {
    const clean = sanitizeFirestoreData({
      id: 'x',
      title: 'A',
      targetDate: undefined,
      order: 1,
    });
    expect(clean).toEqual({ title: 'A', order: 1 });
    expect('id' in clean).toBe(false);
    expect('targetDate' in clean).toBe(false);
  });

  test('resolvePublicTimelineEvents prefers CMS when present', () => {
    const cms: CMSTimelineItem[] = [
      { id: '2', order: 2, date: 'B', title: 'Second', description: '' },
      { id: '1', order: 1, date: 'A', title: 'First', description: 'd' },
    ];
    const fallback = [
      { date: 'F', title: 'Fallback', description: '', order: 1 },
    ];
    const resolved = resolvePublicTimelineEvents(cms, fallback);
    expect(resolved.map((e) => e.title)).toEqual(['First', 'Second']);
  });

  test('resolvePublicTimelineEvents falls back when CMS empty', () => {
    const fallback = [
      { date: 'F', title: 'Fallback', description: '', order: 1, icon: 'Star', color: 'amber' },
    ];
    expect(resolvePublicTimelineEvents([], fallback)[0].title).toBe('Fallback');
    expect(resolvePublicTimelineEvents(null, fallback)[0].title).toBe('Fallback');
  });

  test('sortTimelineItems by order', () => {
    const items = sortTimelineItems([
      { id: 'b', order: 5, date: '', title: 'B', description: '' },
      { id: 'a', order: 1, date: '', title: 'A', description: '' },
    ]);
    expect(items[0].title).toBe('A');
  });

  test('normalizeTimelineOrder', () => {
    expect(normalizeTimelineOrder('3')).toBe(3);
    expect(normalizeTimelineOrder('x', 7)).toBe(7);
    expect(normalizeTimelineOrder(0, 2)).toBe(2);
  });
});
