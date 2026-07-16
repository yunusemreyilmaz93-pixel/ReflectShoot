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

export const ADMIN_TAB_TITLES: Record<AdminTabId, string> = {
  DASHBOARD: 'Genel Bakış',
  ANNOUNCEMENTS: 'Duyuru Merkezi',
  INBOX: 'Gelen Kutusu',
  TEAMS: 'Takım Yönetimi',
  AWARDS: 'Ödül Töreni Katılım Takibi',
  ACADEMIC_RESULTS: 'Akademik Bağımsız Jüri Sonuç Raporları',
  JURY_ASSIGN: 'Jüri Atama',
  JURY_STATUS: 'Jüri İlerlemeleri',
  USERS: 'Kullanıcılar & Jüri',
  CONTENT: 'İçerik Yönetimi (CMS)',
  CERTIFICATES: 'Sertifika Şablonları & Tasarımı',
  SETTINGS: 'Sistem Ayarları',
  LOGS: 'Denetim Kayıtları',
};

export type AdminNavGroup = {
  label: string;
  items: { id: AdminTabId; label: string; icon: string }[];
};

/** Icon names resolved in Sidebar to lucide components. */
export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    label: 'Operasyon',
    items: [
      { id: 'DASHBOARD', label: 'Panel Özeti', icon: 'LayoutDashboard' },
      { id: 'TEAMS', label: 'Takım Yönetimi', icon: 'Clapperboard' },
      { id: 'INBOX', label: 'Gelen Kutusu', icon: 'Mail' },
      { id: 'ANNOUNCEMENTS', label: 'Duyurular', icon: 'Megaphone' },
      { id: 'AWARDS', label: 'Tören Katılımları', icon: 'Trophy' },
    ],
  },
  {
    label: 'Jüri & Sonuç',
    items: [
      { id: 'JURY_ASSIGN', label: 'Jüri Atama', icon: 'UserCheck' },
      { id: 'JURY_STATUS', label: 'Jüri İlerlemeleri', icon: 'Activity' },
      { id: 'ACADEMIC_RESULTS', label: 'Akademik Jüri Sonuçları', icon: 'Award' },
    ],
  },
  {
    label: 'İçerik',
    items: [
      { id: 'CONTENT', label: 'CMS', icon: 'LayoutTemplate' },
      { id: 'CERTIFICATES', label: 'Sertifikalar', icon: 'FileText' },
    ],
  },
  {
    label: 'Sistem',
    items: [
      { id: 'USERS', label: 'Kullanıcılar & Jüri', icon: 'Users' },
      { id: 'SETTINGS', label: 'Sistem Ayarları', icon: 'Settings' },
      { id: 'LOGS', label: 'Denetim Kayıtları', icon: 'List' },
    ],
  },
];
