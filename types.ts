
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
  FINAL_SUBMITTED = 'Final Dosyaları Yüklendi',
  UNDER_REVIEW = 'Değerlendiriliyor',
  APPROVED = 'Onaylandı',
  GRADED = 'Puanlandı',
  REJECTED = 'Reddedildi',
  NEEDS_FIX = 'Düzeltme Gerekli'
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
}

export interface EvaluationCriteria {
  script: number;      // Senaryo & Hikaye (30)
  technical: number;   // Teknik Kalite (25)
  creativity: number;  // Yaratıcılık (25)
  editing: number;     // Kurgu & Montaj (20)
}

// Single evaluation by one judge
export interface JudgeEvaluation {
  judgeId: string;
  judgeName: string;
  criteriaScores: EvaluationCriteria;
  feedback: string;     // Public feedback visible to teacher eventually
  privateNote?: string; // Private note ONLY for admin (e.g. "Copyright issue?")
  totalScore: number;
  gradedAt: string;
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
  videoUrl?: string;
  videoStatus: 'PENDING' | 'UPLOADED' | 'ERROR';
  videoSize?: string; // For Admin view
  videoResolution?: string; // For Admin view
  virusScanStatus?: 'PENDING' | 'CLEAN' | 'INFECTED'; // Cloud Storage AV Scan
  
  // Stages
  isPreliminaryStageComplete: boolean;
  isFinalStageComplete: boolean;
  
  // Finals
  isFinalist?: boolean; // NEW: Flag for finalists
  finalistRank?: number; // NEW: Rank if applicable
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
  
  // Grading System
  judgeEvaluations?: JudgeEvaluation[]; // Array of individual judge scores
  finalScore?: number; // Average of all judge scores
  
  // Legacy support (optional, kept for type safety during migration)
  evaluation?: {
      score: number;
      feedback: string;
      judgeName: string;
      gradedAt: string;
      criteriaScores: EvaluationCriteria;
  }; 
}
