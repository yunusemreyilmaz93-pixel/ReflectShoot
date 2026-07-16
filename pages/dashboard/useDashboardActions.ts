import { useState, useEffect, useCallback } from 'react';
import type { Application, Student } from '../../types';
import { ApplicationStatus } from '../../types';
import { uploadFileToR2 } from '../../lib/cloudStorage';
import {
  MAX_STUDENTS_PER_TEAM,
  MIN_STUDENTS_PER_TEAM,
  requireValidYouTubeUrl,
} from '../../lib/domain/teamValidation';
import {
  buildDocVerificationCode,
  canMutateStudents,
  isDocCodeTaken,
} from '../../lib/domain/teacherDashboard';

type ToastFn = (msg: string, type?: 'success' | 'error' | 'info' | 'warning') => void;

type Params = {
  currentApplication: Application | null | undefined;
  updateApplication: (app: Application) => Promise<void>;
  showToast: ToastFn;
  isDeadlinePassed: boolean;
  setActiveTab: (tab: string) => void;
};

export function useDashboardActions({
  currentApplication,
  updateApplication,
  showToast,
  isDeadlinePassed,
  setActiveTab,
}: Params) {
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Partial<Student> | null>(null);
  const [videoChecklist, setVideoChecklist] = useState({
    resolution: false,
    audio: false,
    credits: false,
    copyright: false,
  });
  const [videoLink, setVideoLink] = useState('');
  const [showVideoSuccessModal, setShowVideoSuccessModal] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File>>({});
  const [verifyCodes, setVerifyCodes] = useState<Record<string, string>>({});
  const [declarationModal, setDeclarationModal] = useState<{
    studentId: string;
    type: 'PARENT' | 'KVKK';
  } | null>(null);
  const [declarationAccepted, setDeclarationAccepted] = useState(false);

  useEffect(() => {
    setVerifyCodes({});
    setSelectedFiles({});
    if (currentApplication?.team.videoUrl) {
      setVideoLink(currentApplication.team.videoUrl);
    } else {
      setVideoLink('');
    }
  }, [currentApplication?.id, currentApplication?.team.videoUrl]);

  const handleActionRedirect = useCallback(
    (tab: string) => {
      if (tab === 'AWARD_WIN' && currentApplication) {
        // HashRouter-safe internal navigation
        window.location.hash = `#/award-participation/team/${currentApplication.team.id}`;
        return;
      }
      setActiveTab(tab);
      const el = document.getElementById('dashboard-content');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    },
    [currentApplication, setActiveTab]
  );

  const handleOpenStudentModal = useCallback((student?: Student) => {
    setEditingStudent(student || { firstName: '', lastName: '', grade: '' });
    setIsStudentModalOpen(true);
  }, []);

  const handleSaveStudent = useCallback(async () => {
    if (!currentApplication || !editingStudent) return;
    if (!canMutateStudents(currentApplication.team.videoStatus)) {
      showToast('Video yüklendikten sonra öğrenci değişikliği yapılamaz.', 'error');
      return;
    }
    if (!editingStudent.firstName || !editingStudent.lastName || !editingStudent.grade) {
      showToast('Lütfen tüm alanları doldurunuz.', 'error');
      return;
    }

    let updatedStudents = [...currentApplication.team.students];
    if (editingStudent.id) {
      updatedStudents = updatedStudents.map((s) =>
        s.id === editingStudent.id ? ({ ...s, ...editingStudent } as Student) : s
      );
    } else {
      if (updatedStudents.length >= MAX_STUDENTS_PER_TEAM) {
        showToast(`En fazla ${MAX_STUDENTS_PER_TEAM} öğrenci ekleyebilirsiniz.`, 'error');
        return;
      }
      updatedStudents.push({
        id: crypto.randomUUID?.() || Math.random().toString(36).substring(2, 10),
        firstName: editingStudent.firstName!,
        lastName: editingStudent.lastName!,
        grade: editingStudent.grade!,
        hasParentalConsent: false,
        hasKvkkConsent: false,
      });
    }

    try {
      await updateApplication({
        ...currentApplication,
        team: { ...currentApplication.team, students: updatedStudents },
      });
      showToast('Kadro güncellendi.', 'success');
      setIsStudentModalOpen(false);
      setEditingStudent(null);
    } catch {
      showToast('Güncelleme başarısız.', 'error');
    }
  }, [currentApplication, editingStudent, showToast, updateApplication]);

  const handleDeleteStudent = useCallback(
    async (studentId: string) => {
      if (!currentApplication) return;
      if (!canMutateStudents(currentApplication.team.videoStatus)) {
        showToast('Video yüklendikten sonra öğrenci değişikliği yapılamaz.', 'error');
        return;
      }
      if (currentApplication.team.students.length <= MIN_STUDENTS_PER_TEAM) {
        showToast(`Takım en az ${MIN_STUDENTS_PER_TEAM} kişiden oluşmalıdır.`, 'error');
        return;
      }
      if (!window.confirm('Bu öğrenciyi takımdan çıkarmak istediğinize emin misiniz?')) return;

      const updatedStudents = currentApplication.team.students.filter((s) => s.id !== studentId);
      try {
        await updateApplication({
          ...currentApplication,
          team: { ...currentApplication.team, students: updatedStudents },
        });
        showToast('Öğrenci çıkarıldı.', 'success');
      } catch {
        showToast('Silme işlemi başarısız.', 'error');
      }
    },
    [currentApplication, showToast, updateApplication]
  );

  const handleGenerateCode = useCallback(
    async (studentId: string, type: 'PARENT' | 'KVKK') => {
      if (!currentApplication) return;

      const digits = Math.floor(10000 + Math.random() * 90000).toString();
      let newCode = buildDocVerificationCode(type, digits);
      let attempts = 0;
      while (isDocCodeTaken(currentApplication.team.students, newCode) && attempts < 20) {
        const d = Math.floor(10000 + Math.random() * 90000).toString();
        newCode = buildDocVerificationCode(type, d);
        attempts++;
      }

      const updatedStudents = currentApplication.team.students.map((s) => {
        if (s.id !== studentId) return s;
        return type === 'PARENT'
          ? { ...s, parentalExpectedId: newCode }
          : { ...s, kvkkExpectedId: newCode };
      });

      try {
        await updateApplication({
          ...currentApplication,
          team: { ...currentApplication.team, students: updatedStudents },
        });
        showToast('Kod oluşturuldu.', 'success');
      } catch {
        showToast('Hata oluştu.', 'error');
      }
    },
    [currentApplication, showToast, updateApplication]
  );

  const copyCode = useCallback(
    (code: string) => {
      navigator.clipboard.writeText(code);
      showToast('Kod kopyalandı!', 'success');
    },
    [showToast]
  );

  const handleOpenDeclarationModal = useCallback(
    (studentId: string, type: 'PARENT' | 'KVKK') => {
      setDeclarationModal({ studentId, type });
      setDeclarationAccepted(false);
    },
    []
  );

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    if (e.target.files?.[0]) {
      setSelectedFiles((prev) => ({ ...prev, [key]: e.target.files![0] }));
    }
  }, []);

  const handleDocUpload = useCallback(
    async (studentId: string, type: 'PARENT' | 'KVKK') => {
      const keyMap = `${studentId}_${type}`;
      const file = selectedFiles[keyMap];
      if (!file || !currentApplication) {
        showToast('Dosya seçilmedi.', 'error');
        return;
      }

      const enteredCode = (verifyCodes[keyMap] || '').trim();
      const student = currentApplication.team.students.find((s) => s.id === studentId);
      const expectedCode =
        type === 'PARENT' ? student?.parentalExpectedId : student?.kvkkExpectedId;

      if (!expectedCode) {
        showToast('Önce kod oluşturun.', 'error');
        return;
      }
      if (enteredCode !== expectedCode) {
        showToast('Girdiğiniz kod belge üzerindeki kodla eşleşmiyor!', 'error');
        return;
      }

      setUploadingDoc(keyMap);
      try {
        const storagePath = `teams/${currentApplication.id}/students/${studentId}/docs/${type.toLowerCase()}.pdf`;
        const r2Key = await uploadFileToR2(file, storagePath);
        const updatedStudents = currentApplication.team.students.map((s) => {
          if (s.id !== studentId) return s;
          return type === 'PARENT'
            ? {
                ...s,
                hasParentalConsent: true,
                parentalConsentUrl: r2Key,
                docStatus: 'PENDING' as const,
                rejectionReason: undefined,
              }
            : {
                ...s,
                hasKvkkConsent: true,
                kvkkConsentUrl: r2Key,
                docStatus: 'PENDING' as const,
                rejectionReason: undefined,
              };
        });
        await updateApplication({
          ...currentApplication,
          team: { ...currentApplication.team, students: updatedStudents as Student[] },
        });
        setSelectedFiles((prev) => {
          const n = { ...prev };
          delete n[keyMap];
          return n;
        });
        setVerifyCodes((prev) => ({ ...prev, [keyMap]: '' }));
        showToast('Belge başarıyla yüklendi.', 'success');
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Yükleme hatası';
        showToast(`Hata: ${msg}`, 'error');
      } finally {
        setUploadingDoc(null);
      }
    },
    [currentApplication, selectedFiles, showToast, updateApplication, verifyCodes]
  );

  const handleConfirmDeclaration = useCallback(() => {
    if (!declarationModal) return;
    void handleDocUpload(declarationModal.studentId, declarationModal.type);
    setDeclarationModal(null);
  }, [declarationModal, handleDocUpload]);

  const handleDeleteDoc = useCallback(
    async (studentId: string, type: 'PARENT' | 'KVKK') => {
      if (!currentApplication) return;
      if (!window.confirm('Yüklenen belgeyi silmek ve yeniden yüklemek istediğinize emin misiniz?')) {
        return;
      }

      const updatedStudents = currentApplication.team.students.map((s) => {
        if (s.id !== studentId) return s;
        if (type === 'PARENT') {
          return {
            ...s,
            hasParentalConsent: false,
            parentalConsentUrl: undefined,
            docStatus: undefined,
            rejectionReason: undefined,
          };
        }
        return {
          ...s,
          hasKvkkConsent: false,
          kvkkConsentUrl: undefined,
          docStatus: undefined,
          rejectionReason: undefined,
        };
      });

      try {
        await updateApplication({
          ...currentApplication,
          team: { ...currentApplication.team, students: updatedStudents as Student[] },
        });
        showToast('Belge silindi.', 'success');
      } catch {
        showToast('Silme işlemi başarısız.', 'error');
      }
    },
    [currentApplication, showToast, updateApplication]
  );

  const confirmVideoSubmission = useCallback(async () => {
    if (!currentApplication) return;
    if (isDeadlinePassed) {
      showToast('Video teslim süresi sona ermiştir veya yükleme kapalıdır.', 'error');
      return;
    }
    const ytErr = requireValidYouTubeUrl(videoLink);
    if (ytErr) {
      showToast(ytErr, 'error');
      return;
    }
    try {
      await updateApplication({
        ...currentApplication,
        team: {
          ...currentApplication.team,
          videoStatus: 'SUBMITTED_LINK',
          videoUrl: videoLink.trim(),
        },
        status: ApplicationStatus.FINAL_SUBMITTED,
      });
      setShowVideoSuccessModal(true);
    } catch {
      showToast('Hata oluştu.', 'error');
    }
  }, [currentApplication, isDeadlinePassed, showToast, updateApplication, videoLink]);

  return {
    isStudentModalOpen,
    setIsStudentModalOpen,
    editingStudent,
    setEditingStudent,
    videoChecklist,
    setVideoChecklist,
    videoLink,
    setVideoLink,
    showVideoSuccessModal,
    setShowVideoSuccessModal,
    uploadingDoc,
    selectedFiles,
    verifyCodes,
    setVerifyCodes,
    declarationModal,
    setDeclarationModal,
    declarationAccepted,
    setDeclarationAccepted,
    handleActionRedirect,
    handleOpenStudentModal,
    handleSaveStudent,
    handleDeleteStudent,
    handleGenerateCode,
    copyCode,
    handleOpenDeclarationModal,
    handleConfirmDeclaration,
    handleFileSelect,
    handleDocUpload,
    handleDeleteDoc,
    confirmVideoSubmission,
  };
}
