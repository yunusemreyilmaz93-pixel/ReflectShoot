import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  getDocs,
  deleteDoc,
  orderBy,
  serverTimestamp,
  limit,
  writeBatch,
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { authenticatedFetch } from '../lib/authenticatedFetch';
import { sanitizeData } from '../lib/sanitize';
import { teamNameError, MAX_TEAMS_PER_TEACHER } from '../lib/domain/teamValidation';
import {
  canCreateApplication,
  getActiveSeason,
  countTeacherTeamsInSeason,
  buildNewSeasonSettings,
  validateNewSeasonId,
  appsToArchiveOnSeasonChange,
  type NewSeasonInput,
} from '../lib/domain/season';
import {
  UserProfile,
  UserRole,
  Application,
  ApplicationStatus,
  Notification,
  ContactMessage,
  ScoreDocument,
  Team,
  EvaluationCriteria,
  NotificationTarget,
  LogEntry,
} from '../types';
import type { AppContextType } from './appContextTypes';
import { useToasts } from './hooks/useToasts';
import { useAuthSession } from './hooks/useAuthSession';
import { useCmsStore } from './hooks/useCmsStore';
import { useRoleDataListeners } from './hooks/useRoleDataListeners';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { toasts, showToast, removeToast } = useToasts();
  const {
    currentUser,
    loading,
    login,
    logout: authLogout,
    registerTeacher,
    resetPassword,
    resendVerificationEmail,
  } = useAuthSession();

  const cms = useCmsStore(showToast);

  const [currentApplication, setCurrentApplication] = useState<Application | null>(null);
  const [myApplications, setMyApplications] = useState<Application[]>([]);
  const [activeApplicationId, setActiveApplicationId] = useState<string | null>(null);
  const [simulatedApplicationId, setSimulatedApplicationId] = useState<string | null>(null);
  const [allApplications, setAllApplications] = useState<Application[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [auditLogs, setAuditLogs] = useState<LogEntry[]>([]);
  const [userIp, setUserIp] = useState<string>('unknown');

  // Public showcase when logged out
  useEffect(() => {
    if (currentUser) return;
    let cancelled = false;
    fetch('/api/public-showcase')
      .then(async (response) => {
        if (!response.ok) throw new Error('Public showcase could not be loaded');
        return response.json();
      })
      .then((data) => {
        if (!cancelled) setAllApplications((data.applications || []) as Application[]);
      })
      .catch((error) => console.log('Public showcase fetch info:', error.message));
    return () => {
      cancelled = true;
    };
  }, [currentUser]);

  useRoleDataListeners(currentUser, {
    setNotifications,
    setAllApplications,
    setAllUsers,
    setAuditLogs,
    setContactMessages,
    setMyApplications,
    setActiveApplicationId,
    activeApplicationId,
  });

  useEffect(() => {
    if (activeApplicationId) {
      const active = myApplications.find((a) => a.id === activeApplicationId);
      setCurrentApplication(active || null);
    } else {
      setCurrentApplication(null);
    }
  }, [activeApplicationId, myApplications]);

  useEffect(() => {
    if (currentUser?.role === UserRole.ADMIN && simulatedApplicationId) {
      const simulatedApp = allApplications.find((a) => a.id === simulatedApplicationId);
      if (simulatedApp) {
        const teacherId = simulatedApp.teacher.id;
        const teacherApps = allApplications.filter((a) => a.teacher.id === teacherId);
        setMyApplications(teacherApps);
        setActiveApplicationId((prevActiveId) => {
          const isAlreadyTeacherApp = teacherApps.some((a) => a.id === prevActiveId);
          if (prevActiveId && isAlreadyTeacherApp) return prevActiveId;
          return simulatedApplicationId;
        });
      }
    } else if (currentUser?.role === UserRole.ADMIN && !simulatedApplicationId) {
      setMyApplications([]);
      setActiveApplicationId(null);
    }
  }, [currentUser, simulatedApplicationId, allApplications]);

  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then((res) => res.json())
      .then((data) => setUserIp(data.ip))
      .catch(() => console.log('IP could not be fetched for logs'));
  }, []);

  const logout = async () => {
    await authLogout();
    setAllApplications([]);
    setSimulatedApplicationId(null);
  };

  const logAction = async (action: string, details: string, targetId?: string, metadata?: any) => {
    if (!currentUser) return;
    try {
      const payload: any = {
        action,
        details,
        performedBy: currentUser.email,
        performedByUid: currentUser.uid,
        ip: userIp || '',
        userAgent: navigator.userAgent || '',
        timestamp: new Date().toISOString(),
      };
      if (targetId !== undefined) payload.targetId = targetId;
      if (metadata !== undefined) payload.metadata = metadata;
      await addDoc(collection(db, 'logs'), payload);
    } catch (err) {
      console.error('Failed to log action:', err);
    }
  };

  const createApplication = async (data: any) => {
    if (!auth.currentUser) return;

    const createGate = canCreateApplication(cms.systemSettings);
    if (createGate.ok === false) throw new Error(createGate.reason);

    const season = getActiveSeason(cms.systemSettings);
    const teamsInSeason = countTeacherTeamsInSeason(
      myApplications,
      auth.currentUser.uid,
      season.id
    );
    if (teamsInSeason >= MAX_TEAMS_PER_TEACHER) {
      throw new Error(
        `Bu sezonda en fazla ${MAX_TEAMS_PER_TEACHER} takıma danışmanlık yapabilirsiniz. Önceki sezon takımları limit sayılmaz.`
      );
    }

    const nameErr = teamNameError(data.teamName || '');
    if (nameErr) throw new Error(nameErr);

    const nameResponse = await authenticatedFetch('/api/team-name-available', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: data.teamName }),
    });
    const nameResult = await nameResponse.json().catch(() => ({}));
    if (!nameResponse.ok) throw new Error(nameResult.error || 'Takım adı kontrol edilemedi.');
    if (!nameResult.available) {
      throw new Error('Bu takım ismi zaten alınmış. Lütfen başka bir isim seçiniz.');
    }

    const generatedId = Math.random().toString(36).substring(7);
    const team: Team = {
      id: generatedId,
      name: data.teamName,
      category: data.category,
      theme: data.theme,
      selectedVerse: data.selectedVerse,
      selectedTopic: data.selectedTopic,
      students: data.students.map((s: any) => ({
        id: Math.random().toString(36).substring(7),
        ...s,
        hasParentalConsent: false,
        hasKvkkConsent: false,
      })),
      isPreliminaryStageComplete: false,
      isFinalStageComplete: false,
      videoStatus: 'PENDING',
    };

    const app: Application = {
      id: generatedId,
      teacher: {
        id: auth.currentUser.uid,
        fullName: currentUser?.fullName || '',
        school: currentUser?.school || '',
        city: currentUser?.city || '',
        email: auth.currentUser.email || '',
        phone: currentUser?.phone || '',
      },
      team,
      status: ApplicationStatus.DRAFT,
      submittedAt: new Date().toISOString(),
      seasonId: season.id,
      archived: false,
    };

    const safeData = sanitizeData(app) as unknown as Record<string, unknown>;
    const batch = writeBatch(db);
    batch.set(doc(db, 'applications', app.id), safeData);
    batch.update(doc(db, 'users', auth.currentUser.uid), { lastActionAt: serverTimestamp() });
    await batch.commit();

    setActiveApplicationId(app.id);
    showToast('Takım oluşturuldu.', 'success');
    await logAction('CREATE_APP', `Takım oluşturuldu: ${app.team.name}`);
  };

  const updateApplication = async (app: Application) => {
    const safeData = sanitizeData(app) as unknown as Record<string, unknown>;
    await updateDoc(doc(db, 'applications', app.id), safeData);
    showToast('Başvuru güncellendi.', 'success');
  };

  const updateApplicationStatus = async (appId: string, newStatus: ApplicationStatus) => {
    const app = allApplications.find((a) => a.id === appId);
    if (!app) return;
    const oldStatus = app.status;
    await updateDoc(doc(db, 'applications', appId), { status: newStatus });
    await logAction(
      'UPDATE_STATUS',
      `Durum güncellendi: ${oldStatus} -> ${newStatus}`,
      appId,
      { before: oldStatus, after: newStatus }
    );
  };

  const deleteApplication = async (appId: string) => {
    const batch = writeBatch(db);
    const messagesSnap = await getDocs(collection(db, 'applications', appId, 'messages'));
    messagesSnap.forEach((d) => batch.delete(d.ref));
    const scoresSnap = await getDocs(collection(db, 'applications', appId, 'scores'));
    scoresSnap.forEach((d) => batch.delete(d.ref));
    batch.delete(doc(db, 'applications', appId));
    await batch.commit();
    await logAction('DELETE_APP', 'Başvuru ve tüm bağlı veriler (mesajlar, puanlar) silindi.', appId);
    showToast('Takım ve tüm verileri silindi.', 'success');
  };

  const updateUserRole = async (uid: string, role: UserRole) => {
    const response = await authenticatedFetch('/api/admin-user-role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, role }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || 'Rol güncellenemedi.');
    showToast('Kullanıcı rolü güncellendi.', 'success');
  };

  const setApplicationArchived = async (appId: string, archived: boolean) => {
    await updateDoc(doc(db, 'applications', appId), { archived });
    await logAction(
      archived ? 'ARCHIVE_APP' : 'UNARCHIVE_APP',
      archived ? 'Başvuru arşivlendi.' : 'Başvuru arşivden çıkarıldı.',
      appId
    );
    showToast(archived ? 'Başvuru arşivlendi.' : 'Başvuru arşivden çıkarıldı.', 'info');
  };

  const deleteUser = async (uid: string) => {
    await deleteDoc(doc(db, 'users', uid));
    await logAction('DELETE_USER', 'Kullanıcı silindi.', uid);
    showToast('Kullanıcı silindi.', 'success');
  };

  const sendContactMessage = async (data: any) => {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || 'Mesajınız gönderilemedi.');
    showToast('Mesajınız iletildi.', 'success');
  };

  const markContactMessageAsRead = async (id: string) => {
    await updateDoc(doc(db, 'contact_messages', id), { status: 'READ' });
  };

  const deleteContactMessage = async (id: string) => {
    await deleteDoc(doc(db, 'contact_messages', id));
    showToast('Mesaj silindi.', 'success');
  };

  const replyToContactMessage = async (messageId: string, replyText: string) => {
    if (!currentUser) return;
    const msgRef = doc(db, 'contact_messages', messageId);
    const msgSnap = await getDoc(msgRef);
    if (!msgSnap.exists()) throw new Error('Mesaj bulunamadı');
    const msgData = msgSnap.data() as ContactMessage;

    if (msgData.source === 'DASHBOARD_CHAT' && msgData.applicationId) {
      await addDoc(collection(db, 'applications', msgData.applicationId, 'messages'), {
        senderId: currentUser.uid,
        senderName: 'Yönetim',
        senderRole: UserRole.ADMIN,
        text: replyText,
        createdAt: new Date().toISOString(),
      });
      await updateDoc(msgRef, { status: 'REPLIED' });
      showToast('Cevap panele gönderildi.', 'success');
    } else {
      await updateDoc(msgRef, { status: 'REPLIED' });
      showToast('Mesaj cevaplandı olarak işaretlendi.', 'info');
    }
    await logAction('REPLY_MESSAGE', `Mesaja cevap verildi: ${messageId}`, msgData.applicationId);
  };

  const markNotificationAsRead = async (id: string) => {
    await updateDoc(doc(db, 'notifications', id), { read: true });
  };

  const fetchJuryScores = async (appId: string) => {
    const snap = await getDocs(collection(db, 'applications', appId, 'scores'));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ScoreDocument));
  };

  const fetchMyScore = async (appId: string) => {
    if (!currentUser) return null;
    const d = await getDoc(doc(db, 'applications', appId, 'scores', currentUser.uid));
    return d.exists() ? ({ id: d.id, ...d.data() } as ScoreDocument) : null;
  };

  const submitScore = async (
    appId: string,
    criteria: EvaluationCriteria,
    notes: string,
    isDraft = false,
    isRecused = false
  ) => {
    if (!currentUser) return;
    const response = await authenticatedFetch('/api/jury-score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appId, criteria, notes, isDraft, isRecused }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || 'Puan kaydedilemedi.');

    if (isDraft) {
      showToast('Taslak olarak kaydedildi.', 'info');
      return;
    }
    if (isRecused) {
      showToast('Bu eser için çekimser kaldınız.', 'warning');
      await logAction('RECUSE_SCORE', 'Jüri çekimser kaldı.', appId);
    } else {
      showToast('Puan kaydedildi ve gönderildi.', 'success');
      await logAction('SUBMIT_SCORE', `Puan verildi: ${result.total}`, appId);
    }
  };

  const assignJury = async (appId: string, juryIds: string[]) => {
    await updateDoc(doc(db, 'applications', appId), { assignedJuryIds: juryIds });
    showToast('Jüri ataması güncellendi.', 'success');
  };

  const bulkAssignJury = async (assignments: { appId: string; juryIds: string[] }[]) => {
    const batch = writeBatch(db);
    assignments.forEach((a) => {
      batch.update(doc(db, 'applications', a.appId), { assignedJuryIds: a.juryIds });
    });
    await batch.commit();
    showToast('Toplu atama tamamlandı.', 'success');
  };

  const sendMessage = async (appId: string, text: string) => {
    if (!currentUser) return;
    const timestamp = new Date().toISOString();
    await addDoc(collection(db, 'applications', appId, 'messages'), {
      senderId: currentUser.uid,
      senderName: currentUser.fullName,
      senderRole: currentUser.role,
      text,
      createdAt: timestamp,
    });
    if (currentUser.role === UserRole.TEACHER) {
      let title = 'Panel Mesajı';
      if (currentApplication && currentApplication.id === appId) {
        title = `Mesaj: ${currentApplication.team.name}`;
      }
      await addDoc(collection(db, 'contact_messages'), {
        name: currentUser.fullName,
        email: currentUser.email,
        title,
        message: text,
        createdAt: timestamp,
        status: 'UNREAD',
        source: 'DASHBOARD_CHAT',
        applicationId: appId,
      });
    }
  };

  const sendAnnouncement = async (
    target: NotificationTarget,
    title: string,
    message: string,
    type: string
  ) => {
    const seasonId = getActiveSeason(cms.systemSettings).id;
    let userIds: string[] = [];
    if (target === 'ALL') userIds = allUsers.map((u) => u.uid);
    else if (target === 'TEACHERS')
      userIds = allUsers.filter((u) => u.role === UserRole.TEACHER).map((u) => u.uid);
    else if (target === 'JUDGES')
      userIds = allUsers.filter((u) => u.role === UserRole.JUDGE).map((u) => u.uid);
    else if (target === 'FINALISTS') {
      userIds = allApplications
        .filter((a) => a.team.isFinalist && (!a.seasonId || a.seasonId === seasonId || a.seasonId === 'legacy'))
        .map((a) => a.teacher.id);
    }
    // unique
    userIds = [...new Set(userIds.filter(Boolean))];
    if (userIds.length === 0) {
      showToast('Hedef kitlede kullanıcı bulunamadı.', 'warning');
      return;
    }

    // Firestore batch limit 500
    const CHUNK = 400;
    for (let i = 0; i < userIds.length; i += CHUNK) {
      const chunk = userIds.slice(i, i + CHUNK);
      const batch = writeBatch(db);
      chunk.forEach((uid) => {
        batch.set(doc(collection(db, 'notifications')), {
          userId: uid,
          title,
          message,
          type,
          read: false,
          createdAt: new Date().toISOString(),
        });
      });
      await batch.commit();
    }
    showToast(`${userIds.length} kullanıcıya bildirim gönderildi.`, 'success');
    await logAction('ANNOUNCEMENT', `Duyuru (${target}): ${title} → ${userIds.length} kişi`);
  };

  const startNewSeason = async (
    input: NewSeasonInput & { archivePrevious?: boolean }
  ) => {
    const previous = getActiveSeason(cms.systemSettings);
    const idErr = validateNewSeasonId(input.id, previous.id);
    if (idErr) throw new Error(idErr);

    const nextSettings = buildNewSeasonSettings(cms.systemSettings, input);
    await cms.updateSystemSettings(nextSettings);

    let archivedCount = 0;
    if (input.archivePrevious !== false) {
      const toArchive = appsToArchiveOnSeasonChange(allApplications, previous.id);
      const CHUNK = 400;
      for (let i = 0; i < toArchive.length; i += CHUNK) {
        const chunk = toArchive.slice(i, i + CHUNK);
        const batch = writeBatch(db);
        chunk.forEach((app) => {
          batch.update(doc(db, 'applications', app.id), {
            archived: true,
            // ensure previous season id is set for legacy
            seasonId: app.seasonId || previous.id,
          });
        });
        await batch.commit();
        archivedCount += chunk.length;
      }
    }

    await logAction(
      'START_SEASON',
      `Yeni sezon: ${nextSettings.season?.id} (önceki ${previous.id}). Arşiv: ${archivedCount}`
    );
    showToast(
      `Sezon ${nextSettings.season?.label || nextSettings.season?.id} açıldı. ${archivedCount} eski başvuru arşivlendi.`,
      'success'
    );
    return { previousSeasonId: previous.id, archivedCount, season: nextSettings.season! };
  };

  const downloadFullBackup = async () => {
    try {
      const response = await authenticatedFetch('/api/admin-backup', { method: 'GET' });
      if (response.ok) {
        const backup = await response.json();
        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup-server-${new Date().toISOString()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('Sunucu yedeği indirildi (skorlar dahil).', 'success');
        return;
      }
    } catch (err) {
      console.warn('Server backup failed, using client snapshot', err);
    }

    const backup = {
      exportedAt: new Date().toISOString(),
      exporter: 'client-fallback',
      users: allUsers,
      applications: allApplications,
      settings: cms.systemSettings,
      cms: {
        general: cms.cmsGeneral,
        links: cms.cmsLinks,
        academy: cms.cmsAcademy,
        gallery: cms.cmsGallery,
        faq: cms.cmsFaqs,
        timeline: cms.cmsTimeline,
        prizes: cms.cmsPrizes,
      },
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-client-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('İstemci yedeği indirildi (skor alt koleksiyonları eksik olabilir).', 'warning');
  };

  const seedAcademyContent = async () => {
    showToast('İçerik yükleme özelliği şimdilik devre dışı.', 'info');
  };

  const tagLegacySeasons = async (dryRun = true) => {
    const response = await authenticatedFetch('/api/admin-season-tag', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dryRun }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || 'Sezon etiketleme başarısız.');
    showToast(
      dryRun
        ? `Dry-run: ${result.legacyCount} legacy başvuru etiketlenecek.`
        : `${result.updated} başvuru ${result.seasonId} sezonuna etiketlendi.`,
      'success'
    );
    return result;
  };

  const updateSystemSettings = async (s: Parameters<typeof cms.updateSystemSettings>[0]) => {
    await cms.updateSystemSettings(s);
    await logAction('UPDATE_SETTINGS', 'Sistem ayarları güncellendi.');
  };

  const value = useMemo<AppContextType>(
    () => ({
      currentUser,
      loading,
      login,
      logout,
      registerTeacher,
      resetPassword,
      resendVerificationEmail,
      currentApplication,
      myApplications,
      activeApplicationId,
      setActiveApplicationId,
      simulatedApplicationId,
      setSimulatedApplicationId,
      allApplications,
      createApplication,
      updateApplication,
      updateApplicationStatus,
      deleteApplication,
      systemSettings: cms.systemSettings,
      updateSystemSettings,
      cmsGeneral: cms.cmsGeneral,
      updateCMSGeneral: cms.updateCMSGeneral,
      cmsLinks: cms.cmsLinks,
      updateCMSLinks: cms.updateCMSLinks,
      cmsAcademy: cms.cmsAcademy,
      addCMSAcademyItem: cms.addCMSAcademyItem,
      updateCMSAcademyItem: cms.updateCMSAcademyItem,
      deleteCMSAcademyItem: cms.deleteCMSAcademyItem,
      cmsGallery: cms.cmsGallery,
      addCMSGalleryItem: cms.addCMSGalleryItem,
      deleteCMSGalleryItem: cms.deleteCMSGalleryItem,
      cmsFaqs: cms.cmsFaqs,
      addCMSFaq: cms.addCMSFaq,
      updateCMSFaq: cms.updateCMSFaq,
      deleteCMSFaq: cms.deleteCMSFaq,
      cmsTimeline: cms.cmsTimeline,
      addCMSTimelineItem: cms.addCMSTimelineItem,
      updateCMSTimelineItem: cms.updateCMSTimelineItem,
      deleteCMSTimelineItem: cms.deleteCMSTimelineItem,
      cmsPrizes: cms.cmsPrizes,
      updateCMSPrize: cms.updateCMSPrize,
      toasts,
      showToast,
      removeToast,
      notifications,
      markNotificationAsRead,
      contactMessages,
      sendContactMessage,
      markContactMessageAsRead,
      replyToContactMessage,
      deleteContactMessage,
      allUsers,
      updateUserRole,
      deleteUser,
      setApplicationArchived,
      auditLogs,
      logAction,
      fetchJuryScores,
      fetchMyScore,
      submitScore,
      assignJury,
      bulkAssignJury,
      sendMessage,
      sendAnnouncement,
      downloadFullBackup,
      seedAcademyContent,
      tagLegacySeasons,
      startNewSeason,
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }),
    [
      currentUser,
      loading,
      currentApplication,
      myApplications,
      activeApplicationId,
      simulatedApplicationId,
      allApplications,
      cms.systemSettings,
      cms.cmsGeneral,
      cms.cmsLinks,
      cms.cmsAcademy,
      cms.cmsGallery,
      cms.cmsFaqs,
      cms.cmsTimeline,
      cms.cmsPrizes,
      toasts,
      notifications,
      contactMessages,
      allUsers,
      auditLogs,
      userIp,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
