/** Canonical admin tab ids — keep in sync with sidebar + deep-links. */
export const ADMIN_TABS = [
  'DASHBOARD',
  'INBOX',
  'ANNOUNCEMENTS',
  'TEAMS',
  'AWARDS',
  'ACADEMIC_RESULTS',
  'JURY_ASSIGN',
  'JURY_STATUS',
  'USERS',
  'CONTENT',
  'CERTIFICATES',
  'SETTINGS',
  'LOGS',
] as const;

export type AdminTabId = (typeof ADMIN_TABS)[number];

export function isAdminTabId(value: string | null | undefined): value is AdminTabId {
  return !!value && (ADMIN_TABS as readonly string[]).includes(value);
}

/** Single source for sidebar labels + page headers. Keep short (one line). */
export const ADMIN_TAB_TITLES: Record<AdminTabId, string> = {
  DASHBOARD: 'Genel Bakış',
  ANNOUNCEMENTS: 'Duyuru Merkezi',
  INBOX: 'Gelen Kutusu',
  TEAMS: 'Takım Yönetimi',
  AWARDS: 'Tören Katılımları',
  ACADEMIC_RESULTS: 'Akademik Jüri Sonuçları',
  JURY_ASSIGN: 'Jüri Atama',
  JURY_STATUS: 'Jüri İlerlemeleri',
  USERS: 'Kullanıcılar & Jüri',
  CONTENT: 'İçerik Yönetimi',
  CERTIFICATES: 'Sertifikalar',
  SETTINGS: 'Sistem Ayarları',
  LOGS: 'Denetim Kayıtları',
};

export type AdminNavGroup = {
  label: string;
  /** Icon names resolved in Sidebar to lucide components. */
  items: { id: AdminTabId; icon: string }[];
};

/** Grouped nav — labels come from ADMIN_TAB_TITLES. */
export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    label: 'Operasyon',
    items: [
      { id: 'DASHBOARD', icon: 'LayoutDashboard' },
      { id: 'TEAMS', icon: 'UsersRound' },
      { id: 'INBOX', icon: 'Mail' },
      { id: 'ANNOUNCEMENTS', icon: 'Megaphone' },
      { id: 'AWARDS', icon: 'Medal' },
    ],
  },
  {
    label: 'Jüri & Sonuç',
    items: [
      { id: 'JURY_ASSIGN', icon: 'UserCheck' },
      { id: 'JURY_STATUS', icon: 'ListChecks' },
      { id: 'ACADEMIC_RESULTS', icon: 'GraduationCap' },
    ],
  },
  {
    label: 'İçerik',
    items: [
      { id: 'CONTENT', icon: 'LayoutTemplate' },
      { id: 'CERTIFICATES', icon: 'ScrollText' },
    ],
  },
  {
    label: 'Sistem',
    items: [
      { id: 'USERS', icon: 'Users' },
      { id: 'SETTINGS', icon: 'Settings' },
      { id: 'LOGS', icon: 'History' },
    ],
  },
];
