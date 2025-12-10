
export enum UserRole {
  GUEST = 'GUEST',
  PENDING_TEACHER = 'PENDING_TEACHER', // Registered but email not verified or admin not approved
  TEACHER = 'TEACHER', // Approved and verified
  STUDENT = 'STUDENT',
  ADMIN = 'ADMIN',
  JUDGE = 'JUDGE' // New Role
}

export interface UserProfile {
  uid: string;
  email: string;
  fullName: string;
  role: UserRole;
  school?: string;
  city?: string;
  phone?: string;
  createdAt: string;
  emailVerified: boolean; // From Firebase Auth
}

export enum Category {
  LIVE_ACTION = 'Canlı Çekim',
  AI_ANIMATION = 'Yapay Zeka Animasyon'
}

export enum Theme {
  AYET = "Kur'an'dan Ayetler",
  HADITH = 'Hadisler',
  SAHABE = 'Sahabelerden Hikayeler'
}

export enum ApplicationStatus {
  DRAFT = 'Taslak',
  PRELIMINARY_SUBMITTED = 'Ön Başvuru Yapıldı',
  FINAL_SUBMITTED = 'Video İnceleniyor', // Updated label logic in UI
  UNDER_REVIEW = 'Değerlendiriliyor',
  APPROVED = 'Onaylandı', // Video Published
  GRADED = 'Puanlandı',
  REJECTED = 'Reddedildi',
  NEEDS_FIX = 'Düzeltme Gerekli',
  DISQUALIFIED = 'Diskalifiye'
}

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  grade: string; // e.g. "11-B"
  email?: string;
  hasParentalConsent: boolean; // File uploaded
  hasKvkkConsent: boolean;     // File uploaded
  parentalConsentUrl?: string; // Mock URL for admin view
  kvkkConsentUrl?: string;     // Mock URL for admin view
  docStatus?: 'PENDING' | 'APPROVED' | 'REJECTED'; // New for admin review
}

export interface EvaluationCriteria {
  story: number;       // Hikaye / Senaryo (0-25)
  technical: number;   // Teknik Kalite (0-25)
  originality: number; // Özgünlük / Yaratıcılık (0-25)
  themeFit: number;    // Tema Uyumu (0-25)
}

// Firestore Subcollection Structure: applications/{appId}/scores/{juryId}
export interface ScoreDocument {
  id?: string; // juryId (document ID)
  juryId: string;
  juryName: string; 
  total: number;
  criteria: EvaluationCriteria;
  notes: string;
  updatedAt: string;
}

export interface Team {
  id: string;
  name: string;
  logoUrl?: string; // Mock URL or base64
  category: Category;
  theme: Theme;
  selectedVerse?: string; // If theme is AYET
  students: Student[];
  
  // Submission Files
  submissionDownloadUrl?: string; // The link teacher pasted (Drive/WeTransfer)
  videoUrl?: string; // The YouTube Embed URL (Admin sets this)
  videoStatus: 'PENDING' | 'SUBMITTED_LINK' | 'UPLOADED' | 'ERROR';
  videoSize?: string; // For Admin view
  videoResolution?: string; // For Admin view
  virusScanStatus?: 'PENDING' | 'CLEAN' | 'INFECTED'; // Cloud Storage AV Scan
  
  // Stages
  isPreliminaryStageComplete: boolean;
  isFinalStageComplete: boolean;
  
  // Finals
  isFinalist?: boolean; // NEW: Flag for finalists
  finalistRank?: number; // NEW: Rank if applicable
  
  // Public Voting
  publicVotes?: number;
}

export interface TeacherProfile {
  id: string;
  fullName: string;
  school: string;
  city: string;
  email: string;
  phone: string;
}

export interface Application {
  id: string;
  teacher: TeacherProfile;
  team: Team;
  status: ApplicationStatus;
  submittedAt: string;
  
  // Scoring & Stats
  finalScore?: number; // Average of all jury scores (cached on parent)
  juryCount?: number;  // How many juries graded this (cached on parent)
  gradedBy?: string[]; // Array of Jury IDs who graded this (for UI filtering)
}

export interface SystemSettings {
    dates: {
        applicationStart: string;
        applicationEnd: string;
        videoUploadStart: string;
        videoUploadEnd: string;
        academyStart: string;
        galaDate: string;
        publicVoteStart?: string;
        publicVoteEnd?: string;
    };
    features: {
        judgeSystemActive: boolean;
        publicResultReveal: boolean;
        allowNewRegistrations: boolean;
        publicVotingActive?: boolean;
    };
}

export interface LogEntry {
    id: string;
    action: string;
    details: string;
    performedBy: string; // Email
    timestamp: string;
    targetId?: string;
}

// NEW: Toast Notification Type
export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

// NEW: Notification System
export interface Notification {
  id: string;
  userId: string; // Who receives it
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  link?: string; // Optional link to redirect
}

// NEW: Messaging System
export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  text: string;
  createdAt: string;
}

// NEW: Vote
export interface PublicVote {
  id: string;
  appId: string;
  voterFingerprint: string; // Simple client-side hash
  timestamp: string;
}
