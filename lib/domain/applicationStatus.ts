import { ApplicationStatus } from '../../types';

/** Statuses a teacher/student may set on their own application (client-side mirror of rules). */
export const OWNER_WRITABLE_STATUSES: ApplicationStatus[] = [
  ApplicationStatus.DRAFT,
  ApplicationStatus.PRELIMINARY_SUBMITTED,
  ApplicationStatus.FINAL_SUBMITTED,
  ApplicationStatus.NEEDS_FIX,
];

export function isOwnerWritableStatus(status: string): boolean {
  return OWNER_WRITABLE_STATUSES.includes(status as ApplicationStatus);
}

/** Public showcase eligible statuses (matches api/public-showcase). */
export const PUBLIC_SHOWCASE_STATUSES = ['Onaylandı', 'Puanlandı'] as const;

export function isPublicShowcaseStatus(status: string): boolean {
  return (PUBLIC_SHOWCASE_STATUSES as readonly string[]).includes(status);
}

export function isDeadlinePassed(isoOrDate: string | Date, now: Date = new Date()): boolean {
  const end = typeof isoOrDate === 'string' ? new Date(isoOrDate) : isoOrDate;
  if (Number.isNaN(end.getTime())) return false;
  return now.getTime() > end.getTime();
}

export function isWithinWindow(
  start: string | undefined | null,
  end: string | undefined | null,
  now: Date = new Date()
): boolean {
  if (start) {
    const s = new Date(start);
    if (!Number.isNaN(s.getTime()) && now < s) return false;
  }
  if (end) {
    const e = new Date(end);
    if (!Number.isNaN(e.getTime()) && now > e) return false;
  }
  return true;
}
