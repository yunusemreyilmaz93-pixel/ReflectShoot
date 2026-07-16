import type { Application, CMSAcademyItem } from '../../types';

/** Public catalog: never show finalist-only items. */
export function publicAcademyItems(items: CMSAcademyItem[] | null | undefined): CMSAcademyItem[] {
  return sortAcademyItems((items || []).filter((i) => !i.isFinalistContent));
}

/** Teacher catalog: public + finalist pack if any of their teams is finalist. */
export function teacherAcademyItems(
  items: CMSAcademyItem[] | null | undefined,
  teacherApps: Application[] | null | undefined
): { publicItems: CMSAcademyItem[]; finalistItems: CMSAcademyItem[]; isFinalistTeacher: boolean } {
  const all = sortAcademyItems(items || []);
  const isFinalistTeacher = (teacherApps || []).some(
    (a) => a.team?.isFinalist && !a.archived
  );
  return {
    publicItems: all.filter((i) => !i.isFinalistContent),
    finalistItems: isFinalistTeacher ? all.filter((i) => i.isFinalistContent) : [],
    isFinalistTeacher,
  };
}

export function sortAcademyItems(items: CMSAcademyItem[]): CMSAcademyItem[] {
  return [...items].sort((a, b) => {
    const as = a.isStarterPack ? 0 : 1;
    const bs = b.isStarterPack ? 0 : 1;
    if (as !== bs) return as - bs;
    return (a.title || '').localeCompare(b.title || '', 'tr');
  });
}

export function academyResourceUrl(item: Pick<CMSAcademyItem, 'pdfFile' | 'url'>): string | null {
  const u = (item.pdfFile || item.url || '').trim();
  return u || null;
}

/** Short human code for classroom share (no server). */
export function academyShareCode(itemId: string): string {
  const clean = (itemId || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  if (clean.length >= 6) return clean.slice(0, 6);
  return `A${clean.padEnd(5, 'X')}`.slice(0, 6);
}

export function findAcademyByShareCode(
  items: CMSAcademyItem[],
  code: string
): CMSAcademyItem | undefined {
  const c = (code || '').trim().toUpperCase();
  if (!c) return undefined;
  return items.find((i) => academyShareCode(i.id) === c || i.id.toUpperCase() === c);
}

export function buildClassroomShareText(item: CMSAcademyItem, pageUrl: string): string {
  const resource = academyResourceUrl(item);
  const lines = [
    `Reflect & Shoot — Akademi`,
    item.title,
    item.description ? item.description.slice(0, 160) : '',
    resource ? `Materyal: ${resource}` : '',
    `Sayfa: ${pageUrl}`,
    `Sınıf kodu: ${academyShareCode(item.id)}`,
  ].filter(Boolean);
  return lines.join('\n');
}

/** wa.me share URL only — no API, optional teacher helper after copy. */
export function academyWhatsAppShareUrl(item: CMSAcademyItem, pageUrl: string): string {
  const text = buildClassroomShareText(item, pageUrl);
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function academyPublicPageUrl(origin?: string): string {
  const base =
    origin ||
    (typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : '');
  return `${base}#/academy`;
}
