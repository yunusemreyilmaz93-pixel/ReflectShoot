/**
 * Extract Dashboard tab JSX into pages/dashboard/tabs/* using a shared DashboardUIContext.
 * Does not change markup — only moves blocks behind useDashboardUI().
 */
import fs from 'fs';
import path from 'path';

const srcPath = 'pages/Dashboard.tsx';
const lines = fs.readFileSync(srcPath, 'utf8').split(/\r?\n/);
const extract = (start, end) => lines.slice(start - 1, end).join('\n');

const outDir = 'pages/dashboard/tabs';
fs.mkdirSync(outDir, { recursive: true });

// Context file
const contextSrc = `import { createContext, useContext } from 'react';
import type { Application, Student, Theme, UserProfile } from '../../types';
import type { SystemSettings } from '../../types';

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
  // theme
  pendingTheme: Theme;
  setPendingTheme: (t: Theme) => void;
  pendingVerse: string;
  setPendingVerse: (v: string) => void;
  pendingTopic: string;
  setPendingTopic: (t: string) => void;
  isSavingTheme: boolean;
  hasThemeChanges: boolean | null | undefined;
  handleSaveTheme: () => Promise<void>;
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
  setVideoChecklist: React.Dispatch<React.SetStateAction<{ resolution: boolean; audio: boolean; credits: boolean; copyright: boolean }>>;
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
`;

fs.writeFileSync(path.join('pages/dashboard', 'DashboardUIContext.tsx'), contextSrc);

const tabDefs = [
  {
    name: 'DashboardStatusTab',
    file: 'DashboardStatusTab.tsx',
    start: 868, // inside the && (
    end: 1120, // closing )}
    // extract inner content of {activeTab === 'STATUS' && ( ... )}
    stripWrapper: true,
  },
  {
    name: 'DashboardAcademyTab',
    file: 'DashboardAcademyTab.tsx',
    start: 1124,
    end: 1180,
    stripWrapper: true,
  },
  {
    name: 'DashboardDocumentsTab',
    file: 'DashboardDocumentsTab.tsx',
    start: 1185,
    end: 1468,
    stripWrapper: true,
  },
  {
    name: 'DashboardVideoTab',
    file: 'DashboardVideoTab.tsx',
    start: 1472,
    end: 1571,
    stripWrapper: true,
  },
];

const commonImports = `import React from 'react';
import { motion } from 'motion/react';
import {
  Clapperboard, Users, FileText, Video, MessageSquare, AlertCircle,
  CheckCircle2, Clock, Upload, X, Save, Film, HelpCircle, LogOut, Ban, ShieldAlert,
  Download, Lock, ExternalLink, RefreshCw, FileCheck, BookOpen, Eye, Calendar, Bell, Copy, Info, Loader2, File,
  Plus, Trash2, Edit, AlertOctagon, CheckSquare, Camera, PenTool, Printer, ShieldCheck,
  Sparkles, ArrowRight, UploadCloud, Megaphone, Star, PartyPopper, User, RefreshCcw, Youtube, Trophy
} from 'lucide-react';
import { Category, Theme, ApplicationStatus, UserRole } from '../../types';
import { versesList, verseDetails } from '../../data/verses';
import { AcademicJuryScorePanel } from '../../components/AcademicJuryScorePanel';
import { getJuryFeedback } from '../../data/juryFeedback';
import { CertificateGenerator } from '../../components/CertificateGenerator';
import { downloadCertificate } from '../../lib/certificates';
import { useDashboardUI } from '../DashboardUIContext';
`;

for (const tab of tabDefs) {
  let body = extract(tab.start, tab.end);
  // Un-indent one level (tabs were nested inside Dashboard return)
  // Keep as-is for safety
  const fileContent = `${commonImports}

export function ${tab.name}() {
  const {
    currentUser, currentApplication, myApplications, activeApplicationId, setActiveApplicationId,
    systemSettings, cmsAcademy, IS_DEADLINE_PASSED, progress, missingDocsCount, remainingDays,
    allVideoChecksPassed, pendingTheme, setPendingTheme, pendingVerse, setPendingVerse,
    pendingTopic, setPendingTopic, isSavingTheme, hasThemeChanges, handleSaveTheme, renderVerseText,
    uploadingDoc, selectedFiles, verifyCodes, declarationModal, declarationAccepted, setDeclarationAccepted,
    handleOpenStudentModal, handleDeleteStudent, handleGenerateCode, copyCode,
    handleOpenDeclarationModal, handleConfirmDeclaration, handleFileSelect, handleDocUpload, handleDeleteDoc,
    videoChecklist, setVideoChecklist, videoLink, setVideoLink, confirmVideoSubmission,
    handleActionRedirect, getCategoryStyle, getTeacherCertificateUrl, getStudentCertificateUrl,
    TEMPLATE_PARENT_URL, TEMPLATE_CONSENT_URL,
  } = useDashboardUI();

  return (
${body}
  );
}
`;
  fs.writeFileSync(path.join(outDir, tab.file), fileContent);
  console.log('Wrote', tab.file, body.split('\n').length, 'body lines');
}

// Chat tab is tiny
fs.writeFileSync(
  path.join(outDir, 'DashboardChatTab.tsx'),
  `import React from 'react';
import { ChatArea } from '../../components/ChatArea';
import { useDashboardUI } from '../DashboardUIContext';

export function DashboardChatTab() {
  const { currentApplication } = useDashboardUI();
  return (
    <div className="max-w-4xl mx-auto">
      <ChatArea appId={currentApplication.id} />
    </div>
  );
}
`
);

// Patch Dashboard.tsx: replace tab blocks with components + provider
let dash = fs.readFileSync(srcPath, 'utf8');

// Add imports after widgets import
if (!dash.includes('DashboardUIProvider')) {
  dash = dash.replace(
    "import { ProductionStatusRing, NextActionCard, TeamSwitcher } from './dashboard/DashboardWidgets';",
    `import { ProductionStatusRing, NextActionCard, TeamSwitcher } from './dashboard/DashboardWidgets';
import { DashboardUIProvider, type DashboardUI } from './dashboard/DashboardUIContext';
import { DashboardStatusTab } from './dashboard/tabs/DashboardStatusTab';
import { DashboardAcademyTab } from './dashboard/tabs/DashboardAcademyTab';
import { DashboardDocumentsTab } from './dashboard/tabs/DashboardDocumentsTab';
import { DashboardVideoTab } from './dashboard/tabs/DashboardVideoTab';
import { DashboardChatTab } from './dashboard/tabs/DashboardChatTab';`
  );
}

// Replace tab sections with component calls — use markers
const statusBlock = /\{activeTab === 'STATUS' && \(\n[\s\S]*?\n                \)\}/;
const academyBlock = /\{activeTab === 'ACADEMY' && \(\n[\s\S]*?\n                \)\}/;
const docsBlock = /\{activeTab === 'DOCUMENTS' && \(\n[\s\S]*?\n                \)\}/;
const videoBlock = /\{activeTab === 'VIDEO' && \(\n[\s\S]*?\n                \)\}/;
const chatBlock = /\{activeTab === 'CHAT' && \(\n[\s\S]*?\n                \)\}/;

dash = dash.replace(statusBlock, `{activeTab === 'STATUS' && <DashboardStatusTab />}`);
dash = dash.replace(academyBlock, `{activeTab === 'ACADEMY' && <DashboardAcademyTab />}`);
dash = dash.replace(docsBlock, `{activeTab === 'DOCUMENTS' && <DashboardDocumentsTab />}`);
dash = dash.replace(videoBlock, `{activeTab === 'VIDEO' && <DashboardVideoTab />}`);
dash = dash.replace(chatBlock, `{activeTab === 'CHAT' && <DashboardChatTab />}`);

// Inject provider: after showRedDot, before return, build ui value;
// Wrap the main return content's content area... easier: wrap entire return with provider.

// Find: const showRedDot = ...
// After it, add dashboardUI value
const showRedDotMarker = "const showRedDot = isLastMessageFromAdmin && latestMessageId !== lastReadMessageId && activeTab !== 'CHAT';";
if (dash.includes(showRedDotMarker) && !dash.includes('const dashboardUI:')) {
  dash = dash.replace(
    showRedDotMarker,
    `${showRedDotMarker}

    const dashboardUI: DashboardUI = {
      currentUser, currentApplication, myApplications, activeApplicationId, setActiveApplicationId,
      systemSettings, cmsAcademy, IS_DEADLINE_PASSED, progress, missingDocsCount, remainingDays,
      allVideoChecksPassed, pendingTheme, setPendingTheme, pendingVerse, setPendingVerse,
      pendingTopic, setPendingTopic, isSavingTheme, hasThemeChanges: !!hasThemeChanges, handleSaveTheme, renderVerseText,
      uploadingDoc, selectedFiles, verifyCodes, declarationModal, declarationAccepted, setDeclarationAccepted,
      handleOpenStudentModal, handleDeleteStudent, handleGenerateCode, copyCode,
      handleOpenDeclarationModal, handleConfirmDeclaration, handleFileSelect, handleDocUpload, handleDeleteDoc,
      videoChecklist, setVideoChecklist, videoLink, setVideoLink, confirmVideoSubmission,
      handleActionRedirect, getCategoryStyle, getTeacherCertificateUrl, getStudentCertificateUrl,
      TEMPLATE_PARENT_URL, TEMPLATE_CONSENT_URL,
    };`
  );
}

// Wrap return JSX: return ( <div ...>  -> return ( <DashboardUIProvider value={dashboardUI}><div ...>
// and closing before final );
if (!dash.includes('<DashboardUIProvider')) {
  dash = dash.replace(
    'return (\n        <div className="bg-slate-950 min-h-screen',
    'return (\n      <DashboardUIProvider value={dashboardUI}>\n        <div className="bg-slate-950 min-h-screen'
  );
  // Close provider before last ); of component - the structure ends with style then </div> then );
  dash = dash.replace(
    /(<style>\{\`[\s\S]*?\`\}<\/style>\n        <\/div>\n    \);\n\};)/,
    (m) => m.replace('        </div>\n    );\n};', '        </div>\n      </DashboardUIProvider>\n    );\n};')
  );
}

fs.writeFileSync(srcPath, dash);
console.log('Patched Dashboard.tsx, new length', dash.split('\n').length);
