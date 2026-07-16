/** Canonical teacher dashboard tab ids — keep in sync with nav + deep-links. */
export const DASHBOARD_TABS = [
  'STATUS',
  'ACADEMY',
  'DOCUMENTS',
  'VIDEO',
  'CHAT',
] as const;

export type DashboardTabId = (typeof DASHBOARD_TABS)[number];

export function isDashboardTabId(value: string | null | undefined): value is DashboardTabId {
  return !!value && (DASHBOARD_TABS as readonly string[]).includes(value);
}

export const DASHBOARD_TAB_LABELS: Record<DashboardTabId, string> = {
  STATUS: 'Genel Bakış',
  ACADEMY: 'Akademi',
  DOCUMENTS: 'Belgeler & Kadro',
  VIDEO: 'Video Teslim',
  CHAT: 'Yönetimle İletişim',
};
