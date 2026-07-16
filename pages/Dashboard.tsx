import React, { useState, useEffect, useCallback } from 'react';
import { ShieldAlert } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ApplicationStatus, UserRole } from '../types';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { getTeacherCertificateUrl_2026, getStudentCertificateUrl_2026 } from '../data/certificates_2026';
import {
  isVideoDeadlinePassed,
  daysUntilVideoDeadline,
  calculateTeacherProgress,
  teacherProgressBreakdown,
  countMissingDocs,
  chatReadStorageKey,
  getAcademyCategoryStyle,
  winnerModalKey,
  thanksModalKey,
  deadlineModalKey,
  formatDateTimeTr,
} from '../lib/domain/teacherDashboard';
import { MAX_TEAMS_PER_TEACHER, isValidYouTubeUrl } from '../lib/domain/teamValidation';
import {
  canCreateApplication,
  getActiveSeason,
  countTeacherTeamsInSeason,
  isInSeason,
} from '../lib/domain/season';

import { DashboardUIProvider, type DashboardUI } from './dashboard/DashboardUIContext';
import { DashboardStatusTab } from './dashboard/tabs/DashboardStatusTab';
import { DashboardAcademyTab } from './dashboard/tabs/DashboardAcademyTab';
import { DashboardDocumentsTab } from './dashboard/tabs/DashboardDocumentsTab';
import { DashboardVideoTab } from './dashboard/tabs/DashboardVideoTab';
import { DashboardChatTab } from './dashboard/tabs/DashboardChatTab';
import { isDashboardTabId, type DashboardTabId } from './dashboard/dashboardTabs';
import { useDashboardActions } from './dashboard/useDashboardActions';
import { DashboardCreateTeamForm } from './dashboard/DashboardCreateTeamForm';
import { DashboardModals } from './dashboard/DashboardModals';
import { DashboardDisqualifiedView } from './dashboard/DashboardDisqualifiedView';
import { DashboardHero } from './dashboard/DashboardHero';
import {
  renderVerseText,
  TEMPLATE_PARENT_URL,
  TEMPLATE_CONSENT_URL,
} from './dashboard/dashboardUiUtils';

export const Dashboard: React.FC = () => {
  const {
    currentUser,
    currentApplication,
    myApplications,
    activeApplicationId,
    setActiveApplicationId,
    createApplication,
    updateApplication,
    showToast,
    systemSettings,
    simulatedApplicationId,
    setSimulatedApplicationId,
    cmsAcademy,
  } = useAppContext();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const IS_DEADLINE_PASSED = isVideoDeadlinePassed(systemSettings);

  const tabFromUrl = searchParams.get('tab');
  const activeTab: DashboardTabId = isDashboardTabId(tabFromUrl) ? tabFromUrl : 'STATUS';
  const setActiveTab = useCallback(
    (tab: string) => {
      const next = isDashboardTabId(tab) ? tab : 'STATUS';
      setSearchParams(next === 'STATUS' ? {} : { tab: next }, { replace: true });
    },
    [setSearchParams]
  );

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [latestMessageId, setLatestMessageId] = useState<string | null>(null);
  const [lastReadMessageId, setLastReadMessageId] = useState<string | null>(null);
  const [isLastMessageFromAdmin, setIsLastMessageFromAdmin] = useState(false);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [showThanksModal, setShowThanksModal] = useState(false);
  const [showDeadlineModal, setShowDeadlineModal] = useState(false);

  const activeSeason = getActiveSeason(systemSettings);
  const seasonTeamCount = currentUser
    ? countTeacherTeamsInSeason(myApplications, currentUser.uid, activeSeason.id)
    : 0;
  const createGate = canCreateApplication(systemSettings);
  const canCreateTeam = seasonTeamCount < MAX_TEAMS_PER_TEACHER && createGate.ok;
  const createBlockedReason: string | null =
    createGate.ok === false
      ? createGate.reason
      : seasonTeamCount >= MAX_TEAMS_PER_TEACHER
        ? `Bu sezonda en fazla ${MAX_TEAMS_PER_TEACHER} takım`
        : null;

  // Prefer active-season teams in switcher; still list past (archived/other) after
  const orderedApplications = [...myApplications].sort((a, b) => {
    const aCur = isInSeason(a, activeSeason.id) ? 0 : 1;
    const bCur = isInSeason(b, activeSeason.id) ? 0 : 1;
    if (aCur !== bCur) return aCur - bCur;
    return (a.team.name || '').localeCompare(b.team.name || '', 'tr');
  });

  const actions = useDashboardActions({
    currentApplication,
    updateApplication,
    showToast,
    isDeadlinePassed: IS_DEADLINE_PASSED,
    setActiveTab,
  });

  const winningMyApplications = myApplications.filter((a) => a.team.isWinner);
  const losingMyApplications = myApplications.filter((a) => a.team.isWinner === false);

  useEffect(() => {
    if (winningMyApplications.length > 0 && currentUser?.uid) {
      if (!localStorage.getItem(winnerModalKey(currentUser.uid))) setShowWinnerModal(true);
    }
  }, [winningMyApplications.length, currentUser?.uid]);

  useEffect(() => {
    if (
      losingMyApplications.length > 0 &&
      winningMyApplications.length === 0 &&
      currentUser?.uid
    ) {
      if (!localStorage.getItem(thanksModalKey(currentUser.uid))) setShowThanksModal(true);
    }
  }, [losingMyApplications.length, winningMyApplications.length, currentUser?.uid]);

  useEffect(() => {
    if (!currentApplication) return;
    try {
      setLastReadMessageId(localStorage.getItem(chatReadStorageKey(currentApplication.id)));
    } catch {
      setLastReadMessageId(null);
    }
    const q = query(
      collection(db, 'applications', currentApplication.id, 'messages'),
      orderBy('createdAt', 'desc'),
      limit(1)
    );
    const unsub = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const docSnap = snapshot.docs[0];
        setLatestMessageId(docSnap.id);
        setIsLastMessageFromAdmin(docSnap.data().senderRole === UserRole.ADMIN);
      }
    });
    return () => unsub();
  }, [currentApplication?.id]);

  useEffect(() => {
    if (activeTab === 'CHAT' && latestMessageId && currentApplication) {
      setLastReadMessageId(latestMessageId);
      try {
        localStorage.setItem(chatReadStorageKey(currentApplication.id), latestMessageId);
      } catch {
        /* ignore */
      }
    }
  }, [activeTab, latestMessageId, currentApplication?.id]);

  useEffect(() => {
    if (IS_DEADLINE_PASSED && currentApplication?.team.videoStatus === 'SUBMITTED_LINK') {
      const key = deadlineModalKey(currentApplication.id);
      if (!localStorage.getItem(key)) {
        setShowDeadlineModal(true);
        localStorage.setItem(key, 'true');
      }
    }
  }, [IS_DEADLINE_PASSED, currentApplication?.id, currentApplication?.team.videoStatus]);

  const switchTeam = (id: string) => {
    setActiveApplicationId(id);
    setShowCreateForm(false);
  };

  if (currentApplication?.status === ApplicationStatus.DISQUALIFIED) {
    return (
      <DashboardDisqualifiedView
        app={currentApplication}
        myApplications={orderedApplications}
        activeApplicationId={activeApplicationId}
        canCreateTeam={canCreateTeam}
        createBlockedReason={createBlockedReason}
        onSwitch={switchTeam}
        onCreate={() => setShowCreateForm(true)}
      />
    );
  }

  if (!currentApplication || showCreateForm) {
    return (
      <DashboardCreateTeamForm
        myApplications={orderedApplications}
        activeApplicationId={activeApplicationId}
        showCreateForm={showCreateForm}
        canCreateTeam={canCreateTeam}
        createBlockedReason={createBlockedReason}
        onSwitch={switchTeam}
        onCreate={() => setShowCreateForm(true)}
        onCancel={() => setShowCreateForm(false)}
        onSubmit={async (form) => {
          await createApplication(form);
          setShowCreateForm(false);
        }}
        showToast={showToast}
      />
    );
  }

  const progress = calculateTeacherProgress(currentApplication);
  const progressParts = teacherProgressBreakdown(currentApplication);
  const allVideoChecksPassed =
    actions.videoChecklist.resolution &&
    actions.videoChecklist.audio &&
    actions.videoChecklist.credits &&
    actions.videoChecklist.copyright &&
    !!actions.videoLink.trim() &&
    isValidYouTubeUrl(actions.videoLink);
  const missingDocsCount = countMissingDocs(currentApplication);
  const remainingDays = daysUntilVideoDeadline(systemSettings);
  const showRedDot =
    isLastMessageFromAdmin && latestMessageId !== lastReadMessageId && activeTab !== 'CHAT';

  const awardFormDeadlineLabel =
    formatDateTimeTr(systemSettings.dates.galaDate) ||
    formatDateTimeTr(systemSettings.dates.videoUploadEnd) ||
    undefined;

  const getTeacherCertificateUrl = () =>
    getTeacherCertificateUrl_2026(
      currentApplication.teacher?.fullName || currentUser?.fullName || '',
      currentApplication.team?.name || ''
    );
  const getStudentCertificateUrl = (student: { firstName: string; lastName: string }) =>
    getStudentCertificateUrl_2026(student, currentApplication.team?.name || '');

  const dashboardUI: DashboardUI = {
    currentUser,
    currentApplication,
    myApplications,
    activeApplicationId,
    setActiveApplicationId,
    systemSettings,
    cmsAcademy,
    IS_DEADLINE_PASSED,
    progress,
    missingDocsCount,
    remainingDays,
    allVideoChecksPassed,
    renderVerseText,
    uploadingDoc: actions.uploadingDoc,
    selectedFiles: actions.selectedFiles,
    verifyCodes: actions.verifyCodes,
    declarationModal: actions.declarationModal,
    declarationAccepted: actions.declarationAccepted,
    setDeclarationAccepted: actions.setDeclarationAccepted,
    handleOpenStudentModal: actions.handleOpenStudentModal,
    handleDeleteStudent: actions.handleDeleteStudent,
    handleGenerateCode: actions.handleGenerateCode,
    copyCode: actions.copyCode,
    handleOpenDeclarationModal: actions.handleOpenDeclarationModal,
    handleConfirmDeclaration: actions.handleConfirmDeclaration,
    handleFileSelect: actions.handleFileSelect,
    handleDocUpload: actions.handleDocUpload,
    handleDeleteDoc: actions.handleDeleteDoc,
    videoChecklist: actions.videoChecklist,
    setVideoChecklist: actions.setVideoChecklist,
    videoLink: actions.videoLink,
    setVideoLink: actions.setVideoLink,
    confirmVideoSubmission: actions.confirmVideoSubmission,
    handleActionRedirect: actions.handleActionRedirect,
    getCategoryStyle: getAcademyCategoryStyle,
    getTeacherCertificateUrl,
    getStudentCertificateUrl,
    TEMPLATE_PARENT_URL,
    TEMPLATE_CONSENT_URL,
    showToast,
    setVerifyCodes: actions.setVerifyCodes,
  };

  return (
    <DashboardUIProvider value={dashboardUI}>
      <div className="bg-slate-950 min-h-screen text-slate-200 font-sans pb-24 relative overflow-x-hidden">
        {currentUser?.role === UserRole.ADMIN && simulatedApplicationId && (
          <div className="bg-gradient-to-r from-amber-600 to-rose-700 text-white py-3.5 px-4 sticky top-0 z-[100] shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-slideIn">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-xl animate-pulse">
                🛡️
              </div>
              <div>
                <div className="font-extrabold text-sm flex items-center gap-2">
                  ÖĞRETMEN EKRANI SİMÜLASYONU
                  <span className="bg-slate-900/40 text-[10px] uppercase font-black px-2 py-0.5 rounded-full border border-white/20">
                    YÖNETİCİ ÖNİZLEMESİ
                  </span>
                </div>
                <p className="text-xs text-white/90">
                  <strong className="text-amber-200">{currentApplication.teacher?.fullName}</strong>{' '}
                  ({currentApplication.teacher?.school}) öğretmenimizin ekranını inceliyorsunuz.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setSimulatedApplicationId(null);
                navigate('/admin');
              }}
              className="bg-slate-950/80 hover:bg-slate-950 border border-white/10 text-white font-black text-xs px-4 py-2 rounded-xl flex items-center gap-1.5"
            >
              <ShieldAlert size={14} className="text-amber-400" />
              Admin Paneline Geri Dön
            </button>
          </div>
        )}

        <div className="fixed inset-0 pointer-events-none z-[0] opacity-[0.03] mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />

        <DashboardHero
          app={currentApplication}
          myApplications={orderedApplications}
          activeApplicationId={activeApplicationId}
          canCreateTeam={canCreateTeam}
          createBlockedReason={createBlockedReason}
          seasonLabel={activeSeason.label}
          progress={progress}
          progressParts={progressParts}
          isDeadlinePassed={IS_DEADLINE_PASSED}
          activeTab={activeTab}
          showRedDot={showRedDot}
          onSwitchTeam={switchTeam}
          onCreateTeam={() => setShowCreateForm(true)}
          onAction={actions.handleActionRedirect}
          onTabChange={setActiveTab}
        />

        <div
          id="dashboard-content"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 animate-fadeIn"
        >
          {activeTab === 'STATUS' && <DashboardStatusTab />}
          {activeTab === 'ACADEMY' && <DashboardAcademyTab />}
          {activeTab === 'DOCUMENTS' && <DashboardDocumentsTab />}
          {activeTab === 'VIDEO' && <DashboardVideoTab />}
          {activeTab === 'CHAT' && <DashboardChatTab />}
        </div>

        <DashboardModals
          declarationModal={actions.declarationModal}
          declarationAccepted={actions.declarationAccepted}
          setDeclarationAccepted={actions.setDeclarationAccepted}
          onCloseDeclaration={() => actions.setDeclarationModal(null)}
          onConfirmDeclaration={actions.handleConfirmDeclaration}
          showWinnerModal={showWinnerModal}
          winningApps={winningMyApplications}
          awardFormDeadlineLabel={awardFormDeadlineLabel}
          onCloseWinner={() => {
            setShowWinnerModal(false);
            if (currentUser) localStorage.setItem(winnerModalKey(currentUser.uid), 'true');
          }}
          showThanksModal={showThanksModal}
          losingApps={losingMyApplications}
          onCloseThanks={() => {
            setShowThanksModal(false);
            if (currentUser) localStorage.setItem(thanksModalKey(currentUser.uid), 'true');
          }}
          showVideoSuccessModal={actions.showVideoSuccessModal}
          onCloseVideoSuccess={() => actions.setShowVideoSuccessModal(false)}
          showDeadlineModal={showDeadlineModal}
          onCloseDeadline={() => setShowDeadlineModal(false)}
          isStudentModalOpen={actions.isStudentModalOpen}
          editingStudent={actions.editingStudent}
          setEditingStudent={actions.setEditingStudent}
          onCloseStudent={() => {
            actions.setIsStudentModalOpen(false);
            actions.setEditingStudent(null);
          }}
          onSaveStudent={actions.handleSaveStudent}
        />

        <style>{`
          .scrollbar-hide::-webkit-scrollbar { display: none; }
          .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
        `}</style>
      </div>
    </DashboardUIProvider>
  );
};
