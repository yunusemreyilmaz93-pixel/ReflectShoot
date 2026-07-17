import { Application, ApplicationStatus } from '../../types';

/** Tab ids used by the operator action queue (subset of admin tabs). */
export type AdminOpsTab = 'TEAMS' | 'JURY_ASSIGN' | 'INBOX' | 'JURY_STATUS';

export type AdminActionQueueItem = {
  id: string;
  label: string;
  count: number;
  tab: AdminOpsTab;
  hint?: string;
};

export type ContactMessageLike = {
  status: 'READ' | 'UNREAD' | 'REPLIED' | string;
};

export function hasSubmittedVideo(app: Application): boolean {
  const v = app.team?.videoStatus;
  return v === 'UPLOADED' || v === 'SUBMITTED_LINK';
}

export function countPendingApproval(apps: Application[]): number {
  return apps.filter((a) => a.status === ApplicationStatus.PRELIMINARY_SUBMITTED).length;
}

export function countUnassignedWithVideo(apps: Application[]): number {
  return apps.filter(
    (a) => hasSubmittedVideo(a) && !(a.assignedJuryIds && a.assignedJuryIds.length > 0)
  ).length;
}

export function countUnreadMessages(messages: ContactMessageLike[]): number {
  return messages.filter((m) => m.status === 'UNREAD').length;
}

export function countNeedsFix(apps: Application[]): number {
  return apps.filter((a) => a.status === ApplicationStatus.NEEDS_FIX).length;
}

/**
 * Operator action queue: only items with count > 0.
 * Pure — safe for unit tests.
 */
export function buildAdminActionQueue(
  apps: Application[],
  messages: ContactMessageLike[]
): AdminActionQueueItem[] {
  const items: AdminActionQueueItem[] = [
    {
      id: 'pending-approval',
      label: 'Onay bekleyen başvuru',
      count: countPendingApproval(apps),
      tab: 'TEAMS',
      hint: 'Ön başvurusu yapılmış takımlar',
    },
    {
      id: 'unassigned-video',
      label: 'Jürisiz video teslimi',
      count: countUnassignedWithVideo(apps),
      tab: 'JURY_ASSIGN',
      hint: 'Video var, jüri atanmamış',
    },
    {
      id: 'unread-inbox',
      label: 'Okunmamış mesaj',
      count: countUnreadMessages(messages),
      tab: 'INBOX',
    },
    {
      id: 'needs-fix',
      label: 'Düzeltme bekleyen',
      count: countNeedsFix(apps),
      tab: 'TEAMS',
      hint: 'Düzeltme gerekli durumundaki takımlar',
    },
  ];
  return items.filter((i) => i.count > 0);
}

/** Daily submission counts for the last 30 days (inclusive window). */
export function trendCountsLast30Days(
  apps: { submittedAt?: string }[],
  now: Date = new Date()
): number[] {
  const cutoff = new Date(now);
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() - 29);

  const groups: Record<string, number> = {};
  for (const app of apps) {
    if (!app.submittedAt) continue;
    const d = new Date(app.submittedAt);
    if (Number.isNaN(d.getTime()) || d < cutoff) continue;
    const key = app.submittedAt.split('T')[0];
    if (!key) continue;
    groups[key] = (groups[key] || 0) + 1;
  }

  return Object.keys(groups)
    .sort()
    .map((k) => groups[k]);
}
