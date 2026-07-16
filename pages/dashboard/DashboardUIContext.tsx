import { createContext, useContext } from 'react';
import type { Application, Student, UserProfile, SystemSettings } from '../../types';

/** Shared dashboard UI bag — populated by Dashboard shell; consumed by tab components. */
export type DashboardUI = {
  currentUser: UserProfile | null;
  currentApplication: Application;
  myApplications: Application[];
  activeApplicationId: string | null;
  setActiveApplicationId: (id: string | null) => void;
  systemSettings: SystemSettings;
  cmsAcademy: any[];
  IS_DEADLINE_PASSED: boolean;
  progress: number;
  missingDocsCount: number;
  remainingDays: number;
  allVideoChecksPassed: boolean;
  renderVerseText: (text: string, isArabic: boolean) => React.ReactNode;
  // docs
  uploadingDoc: string | null;
  selectedFiles: Record<string, File>;
  verifyCodes: Record<string, string>;
  declarationModal: { studentId: string; type: 'PARENT' | 'KVKK' } | null;
  declarationAccepted: boolean;
  setDeclarationAccepted: (v: boolean) => void;
  handleOpenStudentModal: (student?: Student) => void;
  handleDeleteStudent: (studentId: string) => Promise<void>;
  handleGenerateCode: (studentId: string, type: 'PARENT' | 'KVKK') => Promise<void>;
  copyCode: (code: string) => void;
  handleOpenDeclarationModal: (studentId: string, type: 'PARENT' | 'KVKK') => void;
  handleConfirmDeclaration: () => void;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>, key: string) => void;
  handleDocUpload: (studentId: string, type: 'PARENT' | 'KVKK') => Promise<void>;
  handleDeleteDoc: (studentId: string, type: 'PARENT' | 'KVKK') => Promise<void>;
  // video
  videoChecklist: { resolution: boolean; audio: boolean; credits: boolean; copyright: boolean };
  setVideoChecklist: React.Dispatch<
    React.SetStateAction<{ resolution: boolean; audio: boolean; credits: boolean; copyright: boolean }>
  >;
  videoLink: string;
  setVideoLink: (v: string) => void;
  confirmVideoSubmission: () => Promise<void>;
  // nav helpers
  handleActionRedirect: (tab: string) => void;
  getCategoryStyle: (category: string) => { badge: string; btn: string; title: string };
  getTeacherCertificateUrl: () => string;
  getStudentCertificateUrl: (student: { firstName: string; lastName: string }) => string;
  TEMPLATE_PARENT_URL: string;
  TEMPLATE_CONSENT_URL: string;
  showToast: (msg: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  setVerifyCodes: React.Dispatch<React.SetStateAction<Record<string, string>>>;
};

const DashboardUIContext = createContext<DashboardUI | null>(null);

export function DashboardUIProvider({
  value,
  children,
}: {
  value: DashboardUI;
  children: React.ReactNode;
}) {
  return <DashboardUIContext.Provider value={value}>{children}</DashboardUIContext.Provider>;
}

export function useDashboardUI(): DashboardUI {
  const ctx = useContext(DashboardUIContext);
  if (!ctx) throw new Error('useDashboardUI must be used within DashboardUIProvider');
  return ctx;
}
