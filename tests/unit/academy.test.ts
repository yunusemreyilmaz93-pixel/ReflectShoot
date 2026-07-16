import { describe, expect, test } from 'vitest';
import {
  publicAcademyItems,
  teacherAcademyItems,
  academyShareCode,
  findAcademyByShareCode,
  academyResourceUrl,
  sortAcademyItems,
  academyWhatsAppShareUrl,
  buildClassroomShareText,
} from '../../lib/domain/academy';
import type { Application, CMSAcademyItem } from '../../types';

const item = (over: Partial<CMSAcademyItem>): CMSAcademyItem =>
  ({
    id: 'abc123xyz',
    title: 'Test',
    description: 'd',
    type: 'PDF',
    url: 'https://example.com/a',
    category: 'Senaryo & Tema',
    ...over,
  }) as CMSAcademyItem;

describe('academy domain', () => {
  test('publicAcademyItems hides finalist', () => {
    const items = [
      item({ id: '1', isFinalistContent: true, title: 'F' }),
      item({ id: '2', isFinalistContent: false, title: 'P', isStarterPack: true }),
      item({ id: '3', title: 'Z' }),
    ];
    const pub = publicAcademyItems(items);
    expect(pub.every((i) => !i.isFinalistContent)).toBe(true);
    expect(pub[0].isStarterPack).toBe(true);
  });

  test('teacherAcademyItems unlocks finalist pack', () => {
    const items = [
      item({ id: '1', isFinalistContent: true, title: 'Final' }),
      item({ id: '2', isFinalistContent: false, title: 'Public' }),
    ];
    const finalistApp = {
      team: { isFinalist: true },
      archived: false,
    } as Application;
    const open = teacherAcademyItems(items, [finalistApp]);
    expect(open.isFinalistTeacher).toBe(true);
    expect(open.finalistItems).toHaveLength(1);

    const locked = teacherAcademyItems(items, [
      { team: { isFinalist: false }, archived: false } as Application,
    ]);
    expect(locked.finalistItems).toHaveLength(0);
  });

  test('share code stable and findable', () => {
    const i = item({ id: 'helloWorld99' });
    const code = academyShareCode(i.id);
    expect(code.length).toBe(6);
    expect(findAcademyByShareCode([i], code)?.id).toBe(i.id);
  });

  test('academyResourceUrl prefers pdf', () => {
    expect(academyResourceUrl({ pdfFile: 'https://a.pdf', url: 'https://b' })).toBe(
      'https://a.pdf'
    );
    expect(academyResourceUrl({ url: 'https://b' } as CMSAcademyItem)).toBe('https://b');
  });

  test('sortAcademyItems starter first', () => {
    const sorted = sortAcademyItems([
      item({ id: 'a', title: 'B', isStarterPack: false }),
      item({ id: 'b', title: 'A', isStarterPack: true }),
    ]);
    expect(sorted[0].isStarterPack).toBe(true);
  });

  test('academyWhatsAppShareUrl is wa.me only', () => {
    const i = item({ title: 'Senaryo Pack' });
    const url = academyWhatsAppShareUrl(i, 'https://example.com/#/academy');
    expect(url.startsWith('https://wa.me/?text=')).toBe(true);
    const text = decodeURIComponent(url.split('text=')[1] || '');
    expect(text).toContain('Senaryo Pack');
    expect(text).toContain(buildClassroomShareText(i, 'https://example.com/#/academy').split('\n')[0]);
  });
});
