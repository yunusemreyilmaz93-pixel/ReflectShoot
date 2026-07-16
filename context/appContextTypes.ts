import type {
  UserProfile, UserRole, Application, ApplicationStatus, SystemSettings,
  Notification, ToastMessage, CMSGeneral, CMSLinks, CMSPrize, CMSFaqItem,
  CMSGalleryItem, CMSAcademyItem, CMSTimelineItem, LogEntry, ContactMessage,
  ScoreDocument, EvaluationCriteria, NotificationTarget,
} from '../types';

export interface AppContextType {
  currentUser: UserProfile | null;
  loading: boolean;
  login: (e: string, p: string) => Promise<void>;
  logout: () => Promise<void>;
  registerTeacher: (data: any) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;

  currentApplication: Application | null;
  myApplications: Application[];
  activeApplicationId: string | null;
  setActiveApplicationId: (id: string | null) => void;
  simulatedApplicationId: string | null;
  setSimulatedApplicationId: (id: string | null) => void;
  allApplications: Application[];
  createApplication: (data: any) => Promise<void>;
  updateApplication: (app: Application) => Promise<void>;
  updateApplicationStatus: (appId: string, newStatus: ApplicationStatus) => Promise<void>;
  deleteApplication: (appId: string) => Promise<void>;

  systemSettings: SystemSettings;
  updateSystemSettings: (s: SystemSettings) => Promise<void>;

  cmsGeneral: CMSGeneral;
  updateCMSGeneral: (d: CMSGeneral) => Promise<void>;
  cmsLinks: CMSLinks;
  updateCMSLinks: (d: CMSLinks) => Promise<void>;
  cmsAcademy: CMSAcademyItem[];
  addCMSAcademyItem: (i: CMSAcademyItem) => Promise<void>;
  updateCMSAcademyItem: (id: string, d: Partial<CMSAcademyItem>) => Promise<void>;
  deleteCMSAcademyItem: (id: string) => Promise<void>;
  cmsGallery: CMSGalleryItem[];
  addCMSGalleryItem: (i: CMSGalleryItem) => Promise<void>;
  deleteCMSGalleryItem: (id: string) => Promise<void>;
  cmsFaqs: CMSFaqItem[];
  addCMSFaq: (i: CMSFaqItem) => Promise<void>;
  updateCMSFaq: (id: string, d: Partial<CMSFaqItem>) => Promise<void>;
  deleteCMSFaq: (id: string) => Promise<void>;
  cmsTimeline: CMSTimelineItem[];
  addCMSTimelineItem: (i: CMSTimelineItem) => Promise<void>;
  updateCMSTimelineItem: (id: string, d: Partial<CMSTimelineItem>) => Promise<void>;
  deleteCMSTimelineItem: (id: string) => Promise<void>;
  cmsPrizes: CMSPrize[];
  updateCMSPrize: (p: CMSPrize) => Promise<void>;

  toasts: ToastMessage[];
  showToast: (msg: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;

  notifications: Notification[];
  markNotificationAsRead: (id: string) => Promise<void>;

  contactMessages: ContactMessage[];
  sendContactMessage: (data: any) => Promise<void>;
  markContactMessageAsRead: (id: string) => Promise<void>;
  replyToContactMessage: (messageId: string, replyText: string) => Promise<void>;
  deleteContactMessage: (id: string) => Promise<void>;

  allUsers: UserProfile[];
  updateUserRole: (uid: string, role: UserRole) => Promise<void>;
  deleteUser: (uid: string) => Promise<void>;
  setApplicationArchived: (appId: string, archived: boolean) => Promise<void>;

  auditLogs: LogEntry[];
  logAction: (action: string, details: string, targetId?: string) => Promise<void>;

  fetchJuryScores: (appId: string) => Promise<ScoreDocument[]>;
  fetchMyScore: (appId: string) => Promise<ScoreDocument | null>;
  submitScore: (
    appId: string,
    criteria: EvaluationCriteria,
    notes: string,
    isDraft?: boolean,
    isRecused?: boolean
  ) => Promise<void>;
  assignJury: (appId: string, juryIds: string[]) => Promise<void>;
  bulkAssignJury: (assignments: { appId: string; juryIds: string[] }[]) => Promise<void>;

  sendMessage: (appId: string, text: string) => Promise<void>;
  sendAnnouncement: (target: NotificationTarget, title: string, message: string, type: string) => Promise<void>;

  downloadFullBackup: () => Promise<void>;
  seedAcademyContent: () => Promise<void>;
  /** Admin: tag applications missing seasonId (dryRun default recommended first). */
  tagLegacySeasons?: (dryRun?: boolean) => Promise<{ legacyCount: number; updated: number; seasonId: string }>;
  /** Admin: open a new competition season (settings + optional archive of previous apps). */
  startNewSeason?: (input: {
    id: string;
    label: string;
    shiftYears?: number;
    openApplications?: boolean;
    resetVideoUpload?: boolean;
    archivePrevious?: boolean;
  }) => Promise<{ previousSeasonId: string; archivedCount: number; season: { id: string; label: string } }>;
}
