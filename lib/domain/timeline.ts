import type { CMSTimelineItem } from '../../types';

export type ResolvedTimelineEvent = {
  id?: string;
  date: string;
  title: string;
  description: string;
  icon?: string;
  color?: string;
  order: number;
  targetDate?: string;
};

/** Strip `id` and undefined — Firestore updateDoc rejects undefined values. */
export function sanitizeFirestoreData<T extends Record<string, unknown>>(
  data: T
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (key === 'id') continue;
    if (value === undefined) continue;
    out[key] = value;
  }
  return out;
}

export function sortTimelineItems(items: CMSTimelineItem[]): CMSTimelineItem[] {
  return [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

/**
 * Public timeline resolver:
 * - Prefer CMS when non-empty (admin-managed).
 * - Otherwise fall back to static defaults so the home page never blanks.
 */
export function resolvePublicTimelineEvents(
  cmsItems: CMSTimelineItem[] | null | undefined,
  fallback: ResolvedTimelineEvent[]
): ResolvedTimelineEvent[] {
  const sorted = sortTimelineItems(cmsItems || []).filter(
    (e) => e && (e.title || '').trim().length > 0
  );
  if (sorted.length === 0) return fallback;
  return sorted.map((e) => ({
    id: e.id,
    date: e.date || '',
    title: e.title,
    description: e.description || '',
    icon: e.icon || 'Clapperboard',
    color: e.color || 'teal',
    order: e.order ?? 0,
    targetDate: e.targetDate,
  }));
}

export function normalizeTimelineOrder(value: unknown, fallback = 1): number {
  const n = typeof value === 'number' ? value : parseInt(String(value ?? ''), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}
