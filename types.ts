
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
  
  // Consent Docs
  hasParentalConsent: boolean; // File uploaded
  hasKvkkConsent: boolean;     // File uploaded
  parentalConsentUrl?: string; // Private R2 Key/URL
  kvkkConsentUrl?: string;     // Private R2 Key/URL
  
  // Challenge-Response Security
  parentalExpectedId?: string; // The ID generated on the PDF
  kvkkExpectedId?: string;     // The ID generated on the PDF
  
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
  logoUrl?: string; // Derived in frontend (Public URL)
  logoKey?: string; // Stored in DB (R2 Key: teams/{id}/logo.png)
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
  assignedJuryIds?: string[]; // NEW: For Jury Assignment
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
        finalistRevealStart?: string;
        finalistRevealEnd?: string;
        reviseUploadStart?: string;
        reviseUploadEnd?: string;
    };
    features: {
        judgeSystemActive: boolean;
        publicResultReveal: boolean;
        allowNewRegistrations: boolean;
        publicVotingActive?: boolean;
        videoUploadActive: boolean; // NEW: Master switch for video uploads
        maintenanceMode: boolean; // NEW: Global maintenance switch
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

export type NotificationTarget = 'ALL' | 'TEACHERS' | 'JUDGES' | 'FINALISTS' | 'SINGLE';

// NEW: Messaging System
export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  text: string;
  createdAt: string;
}

// NEW: Contact Message (Inbox)
export interface ContactMessage {
    id: string;
    name: string;
    email: string;
    title: string; // Subject
    message: string;
    createdAt: string;
    status: 'READ' | 'UNREAD';
}

// NEW: Vote
export interface PublicVote {
  id: string;
  appId: string;
  voterFingerprint: string; // Simple client-side hash
  timestamp: string;
}

// --- CMS TYPES ---

export interface CMSGeneral {
    contactEmail: string;
    contactPhone: string;
    contactAddress: string;
    socialInstagram: string;
    socialTwitter: string;
    socialYoutube: string;
    footerText: string;
}

// NEW: Central Link Management
export interface CMSLinks {
    specUrl: string; // Şartname
    parentalUrl: string; // Veli İzin
    kvkkUrl: string; // KVKK
    posterUrl: string; // Afiş
}

// NEW: Prize Management
export interface CMSPrize {
    id: string; // rank1, rank2, rank3, mention, special
    title: string; // "Altın Kamera"
    reward: string; // "40.000 TL"
    description: string;
}

export type FAQCategory = 'Genel' | 'Teknik' | 'Süreç & Teslim' | 'Ödüller & Değerlendirme';

export interface CMSFaqItem {
    id: string; // Firestore Doc ID
    category: FAQCategory;
    question: string;
    answer: string;
    order: number;
}

export interface CMSGalleryItem {
    id: string;
    src: string; // Image URL
    alt: string; // Description/Alt text
    category: string; // e.g. "Gala 2025", "Kamera Arkası"
    year: string;
}

export interface CMSAcademyItem {
    id: string;
    title: string;
    description: string;
    type: 'PDF' | 'VIDEO' | 'LINK';
    url: string; // General/Legacy URL
    category: 'Senaryo & Tema' | 'Teknik & Kurgu' | 'Yapay Zeka' | 'İlham & Rehber';
    isStarterPack?: boolean;
    isFinalistContent?: boolean;
    
    // NEW Fields for Admin
    pdfFile?: string; // Public Bucket URL for PDF Download
    coverImage?: string; // Public Bucket URL for Card Image
}

export interface CMSTimelineItem {
    id: string;
    date: string;
    title: string;
    description: string;
    order: number;
}

// Deprecated in favor of CMSAcademyItem, but kept for type safety in existing (unused) components
export interface AcademyContent {
    id: string;
    slug: string;
    title: string;
    description: string;
    order: number;
    published: boolean;
    pdfFile?: string;
    youtubeUrl?: string;
}
