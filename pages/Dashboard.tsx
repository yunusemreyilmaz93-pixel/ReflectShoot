
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    Clapperboard, Users, FileText, Video, MessageSquare, AlertCircle, 
    CheckCircle2, Clock, Upload, X, Save, Film, HelpCircle, LogOut, Ban, ShieldAlert,
    Download, Lock, ExternalLink, RefreshCw, FileCheck, BookOpen, Eye, Calendar, Bell, Copy, Info, Loader2, File,
    Plus, Trash2, Edit, AlertOctagon, CheckSquare, Camera, PenTool, Printer, ShieldCheck,
    Sparkles, ArrowRight, UploadCloud, Megaphone, Star, PartyPopper, User, RefreshCcw, Youtube, Trophy
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Category, Theme, ApplicationStatus, Student, UserRole } from '../types';
import { versesList, verseDetails, VERSE_SPLITTER } from '../data/verses';
import { ChatArea } from '../components/ChatArea';
import { AcademicJuryScorePanel } from '../components/AcademicJuryScorePanel';
import { getJuryFeedback } from '../data/juryFeedback';
import { uploadFileToR2, uploadPublicLogo } from '../lib/cloudStorage';
import { CertificateGenerator, printCertificate } from '../components/CertificateGenerator';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { getTeacherCertificateUrl_2026, getStudentCertificateUrl_2026 } from '../data/certificates_2026';
import { downloadCertificate } from '../lib/certificates';

import { ProductionStatusRing, NextActionCard, TeamSwitcher } from './dashboard/DashboardWidgets';
import { DashboardUIProvider, type DashboardUI } from './dashboard/DashboardUIContext';
import { DashboardStatusTab } from './dashboard/tabs/DashboardStatusTab';
import { DashboardAcademyTab } from './dashboard/tabs/DashboardAcademyTab';
import { DashboardDocumentsTab } from './dashboard/tabs/DashboardDocumentsTab';
import { DashboardVideoTab } from './dashboard/tabs/DashboardVideoTab';
import { DashboardChatTab } from './dashboard/tabs/DashboardChatTab';

// Placeholder Template URLs
const TEMPLATE_PARENT_URL = "https://assets.reflectandshoot.com/veli_izin_belgesi.pdf";
const TEMPLATE_CONSENT_URL = "https://assets.reflectandshoot.com/acik_riza_metni.pdf";

export const Dashboard: React.FC = () => {
    const { currentUser, currentApplication, myApplications, activeApplicationId, setActiveApplicationId, createApplication, updateApplication, showToast, systemSettings, simulatedApplicationId, setSimulatedApplicationId, cmsAcademy } = useAppContext();
    const navigate = useNavigate();

    const getTeacherCertificateUrl = () => {
        const teacherName = currentApplication?.teacher?.fullName || currentUser?.fullName || "";
        const teamName = currentApplication?.team?.name || "";
        return getTeacherCertificateUrl_2026(teacherName, teamName);
    };

    const getStudentCertificateUrl = (student: { firstName: string, lastName: string }) => {
        const teamName = currentApplication?.team?.name || "";
        return getStudentCertificateUrl_2026(student, teamName);
    };

    const IS_DEADLINE_PASSED = new Date() > new Date('2026-05-04T20:59:59Z');

    const [activeTab, setActiveTab] = useState('STATUS');
    const [showCreateForm, setShowCreateForm] = useState(false);
    
    // Notification Logic States
    const [latestMessageId, setLatestMessageId] = useState<string | null>(null);
    const [lastReadMessageId, setLastReadMessageId] = useState<string | null>(null);
    const [isLastMessageFromAdmin, setIsLastMessageFromAdmin] = useState(false);
    
    // Create App Form State
    const [teamForm, setTeamForm] = useState({
        teamName: '',
        category: Category.LIVE_ACTION,
        theme: Theme.AYET,
        selectedVerse: versesList[0],
        selectedTopic: '',
        students: [
            { firstName: '', lastName: '', grade: '' },
            { firstName: '', lastName: '', grade: '' },
            { firstName: '', lastName: '', grade: '' }
        ]
    });
    const [formErrors, setFormErrors] = useState<any>({});
    const [isCreating, setIsCreating] = useState(false);

    // Reset form when showCreateForm changes to true
    useEffect(() => {
        if (showCreateForm) {
            setTeamForm({
                teamName: '',
                category: Category.LIVE_ACTION,
                theme: Theme.AYET,
                selectedVerse: versesList[0],
                selectedTopic: '',
                students: [
                    { firstName: '', lastName: '', grade: '' },
                    { firstName: '', lastName: '', grade: '' },
                    { firstName: '', lastName: '', grade: '' }
                ]
            });
            setFormErrors({});
        }
    }, [showCreateForm]);

    // Theme Selection State (Integrated)
    const [pendingTheme, setPendingTheme] = useState<Theme>(currentApplication?.team.theme || Theme.AYET);
    const [pendingVerse, setPendingVerse] = useState<string>(currentApplication?.team.selectedVerse || versesList[0]);
    const [pendingTopic, setPendingTopic] = useState<string>(currentApplication?.team.selectedTopic || '');
    const [isSavingTheme, setIsSavingTheme] = useState(false);

    useEffect(() => {
        if (currentApplication) {
            setPendingTheme(currentApplication.team.theme);
            setPendingVerse(currentApplication.team.selectedVerse || versesList[0]);
            setPendingTopic(currentApplication.team.selectedTopic || '');
        }
    }, [currentApplication?.id]);

    const handleSaveTheme = async () => {
        if (!currentApplication) return;
        setIsSavingTheme(true);
        try {
            await updateApplication({
                ...currentApplication,
                team: {
                    ...currentApplication.team,
                    theme: pendingTheme,
                    selectedVerse: pendingTheme === Theme.AYET ? pendingVerse : undefined,
                    selectedTopic: (pendingTheme === Theme.HADITH || pendingTheme === Theme.SAHABE) ? pendingTopic : undefined
                }
            });
            showToast("Proje teması güncellendi.", "success");
        } catch (e) {
            showToast("Güncelleme başarısız.", "error");
        } finally {
            setIsSavingTheme(false);
        }
    };

    const hasThemeChanges = currentApplication && (
        pendingTheme !== currentApplication.team.theme || 
        (pendingTheme === Theme.AYET && pendingVerse !== currentApplication.team.selectedVerse)
    );

    // Student Management State
    const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Partial<Student> | null>(null);

    // Video Submission Checklist
    const [videoChecklist, setVideoChecklist] = useState({
        resolution: false,
        audio: false,
        credits: false,
        copyright: false
    });
    const [videoLink, setVideoLink] = useState('');
    const [showVideoSuccessModal, setShowVideoSuccessModal] = useState(false);
    const [showDeadlineModal, setShowDeadlineModal] = useState(false);
    
    // Winner Celebration Modal
    const [showWinnerModal, setShowWinnerModal] = useState(false);
    const winningMyApplications = myApplications.filter(a => a.team.isWinner);

    // Thanks Modal (For non-winning)
    const [showThanksModal, setShowThanksModal] = useState(false);
    const losingMyApplications = myApplications.filter(a => a.team.isWinner === false);

    useEffect(() => {
        // Show winner modal only if there are winning applications and hasn't been seen
        if (winningMyApplications.length > 0) {
            const hasSeen = localStorage.getItem(`seen_winner_modal_${currentUser?.uid}`);
            if (!hasSeen) {
                setShowWinnerModal(true);
            }
        }
    }, [winningMyApplications.length, currentUser?.uid]);

    useEffect(() => {
        // Show thanks modal only if there are non-winning applications, no winning ones, and hasn't been seen
        if (losingMyApplications.length > 0 && winningMyApplications.length === 0) {
            const hasSeen = localStorage.getItem(`seen_thanks_modal_${currentUser?.uid}`);
            if (!hasSeen) {
                setShowThanksModal(true);
            }
        }
    }, [losingMyApplications.length, winningMyApplications.length, currentUser?.uid]);

    const handleCloseWinnerModal = () => {
        setShowWinnerModal(false);
        if (currentUser) {
            localStorage.setItem(`seen_winner_modal_${currentUser.uid}`, 'true');
        }
    };

    const handleCloseThanksModal = () => {
        setShowThanksModal(false);
        if (currentUser) {
            localStorage.setItem(`seen_thanks_modal_${currentUser.uid}`, 'true');
        }
    };

    // Edit & Upload State
    const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
    const [selectedFiles, setSelectedFiles] = useState<Record<string, File>>({});
    
    // Verification Codes Input State
    const [verifyCodes, setVerifyCodes] = useState<Record<string, string>>({});
    
    // Declaration Modal State
    const [declarationModal, setDeclarationModal] = useState<{ studentId: string, type: 'PARENT' | 'KVKK' } | null>(null);
    const [declarationAccepted, setDeclarationAccepted] = useState(false);

    useEffect(() => {
        setVerifyCodes({});
        setSelectedFiles({});
        if (currentApplication?.team.videoUrl) {
            setVideoLink(currentApplication.team.videoUrl);
        }
    }, [currentApplication?.id]);

    // Listener for new messages
    useEffect(() => {
        if (!currentApplication) return;
        
        const q = query(
            collection(db, "applications", currentApplication.id, "messages"),
            orderBy("createdAt", "desc"),
            limit(1)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                const doc = snapshot.docs[0];
                const msgData = doc.data();
                setLatestMessageId(doc.id);
                setIsLastMessageFromAdmin(msgData.senderRole === UserRole.ADMIN);
            }
        });

        return () => unsubscribe();
    }, [currentApplication?.id]);

    // Mark as read when entering CHAT tab
    useEffect(() => {
        if (activeTab === 'CHAT' && latestMessageId) {
            setLastReadMessageId(latestMessageId);
        }
    }, [activeTab, latestMessageId]);

    // Show Deadline Passed Modal once
    useEffect(() => {
        if (IS_DEADLINE_PASSED && currentApplication?.team.videoStatus === 'SUBMITTED_LINK') {
            const hasSeen = localStorage.getItem(`seen_deadline_passed_${currentApplication.id}`);
            if (!hasSeen) {
                setShowDeadlineModal(true);
                localStorage.setItem(`seen_deadline_passed_${currentApplication.id}`, 'true');
            }
        }
    }, [IS_DEADLINE_PASSED, currentApplication?.id, currentApplication?.team.videoStatus]);

    // Progress Calculation
    const calculateProgress = () => {
        if (!currentApplication) return 0;
        const students = currentApplication.team.students;
        const totalDocs = students.length * 2;
        const uploadedDocs = students.reduce((acc, s) => acc + (s.hasParentalConsent ? 1 : 0) + (s.hasKvkkConsent ? 1 : 0), 0);
        const hasVideo = currentApplication.team.videoStatus !== 'PENDING' ? 1 : 0;
        
        const totalItems = totalDocs + 1; // Docs + Video (No Logo)
        const completedItems = uploadedDocs + hasVideo;
        
        // Avoid division by zero
        if(totalItems === 0) return 0;
        
        return Math.round((completedItems / totalItems) * 100);
    };

    const renderVerseText = (text: string, isArabic: boolean) => {
        if (!text) return null;
        return text.split(VERSE_SPLITTER).map((part, index) => (
            <React.Fragment key={index}>
                {index > 0 && (
                    <span className={`mx-2 inline-block ${isArabic ? 'text-amber-500 text-xl' : 'text-amber-500/50 text-xs'} select-none`}>
                        {isArabic ? ' ۞ ' : ' ✦ '}
                    </span>
                )}
                {part}
            </React.Fragment>
        ));
    };

    // --- Dynamic Data Helpers ---
    const getRemainingDays = () => {
        const end = new Date(systemSettings.dates.videoUploadEnd);
        const now = new Date();
        const diff = end.getTime() - now.getTime();
        const days = Math.ceil(diff / (1000 * 3600 * 24));
        return days > 0 ? days : 0;
    };

    const getMissingDocsCount = () => {
        if (!currentApplication) return 0;
        let count = 0;
        currentApplication.team.students.forEach(s => {
            if (!s.hasParentalConsent) count++;
            if (!s.hasKvkkConsent) count++;
        });
        return count;
    };

    const getCategoryStyle = (category: string) => {
        const cat = (category || '').toLowerCase();
        if (cat.includes('senaryo') || cat.includes('tema')) return { 
            badge: 'bg-slate-950 text-amber-500 border-amber-500/50 shadow-lg shadow-amber-900/20', 
            btn: 'text-amber-500 hover:text-amber-400', 
            title: 'group-hover:text-amber-400'
        };
        if (cat.includes('teknik') || cat.includes('kurgu')) return { 
            badge: 'bg-slate-950 text-cyan-500 border-cyan-500/50 shadow-lg shadow-cyan-900/20', 
            btn: 'text-cyan-500 hover:text-cyan-400', 
            title: 'group-hover:text-cyan-400'
        };
        if (cat.includes('yapay zeka') || cat.includes('ai')) return { 
            badge: 'bg-slate-950 text-purple-500 border-purple-500/50 shadow-lg shadow-purple-900/20', 
            btn: 'text-purple-500 hover:text-purple-400', 
            title: 'group-hover:text-purple-400'
        };
        if (cat.includes('ilham') || cat.includes('rehber')) return { 
            badge: 'bg-slate-950 text-rose-500 border-rose-500/50 shadow-lg shadow-rose-900/20', 
            btn: 'text-rose-500 hover:text-rose-400', 
            title: 'group-hover:text-rose-400'
        };
        return { 
            badge: 'bg-slate-950 text-slate-300 border-slate-600 shadow-lg', 
            btn: 'text-blue-400 hover:text-blue-300', 
            title: 'group-hover:text-emerald-400'
        };
    };

    // --- Actions ---

    const handleActionRedirect = (tab: string) => {
        if (tab === 'AWARD_WIN' && currentApplication) {
            window.location.href = `#/award-participation/team/${currentApplication.team.id}`;
            return;
        }
        setActiveTab(tab);
        // Scroll to content
        const el = document.getElementById('dashboard-content');
        if(el) el.scrollIntoView({ behavior: 'smooth' });
    };

    const handleOpenStudentModal = (student?: Student) => {
        setEditingStudent(student || { firstName: '', lastName: '', grade: '' });
        setIsStudentModalOpen(true);
    };

    const handleSaveStudent = async () => {
        if (!currentApplication || !editingStudent) return;
        if (currentApplication.team.videoStatus === 'UPLOADED' || currentApplication.team.videoStatus === 'SUBMITTED_LINK') {
            showToast("Video yüklendikten sonra öğrenci değişikliği yapılamaz.", "error");
            return;
        }

        if (!editingStudent.firstName || !editingStudent.lastName || !editingStudent.grade) {
            showToast("Lütfen tüm alanları doldurunuz.", "error");
            return;
        }

        let updatedStudents = [...currentApplication.team.students];

        if (editingStudent.id) {
            updatedStudents = updatedStudents.map(s => s.id === editingStudent.id ? { ...s, ...editingStudent } as Student : s);
        } else {
            if (updatedStudents.length >= 6) {
                showToast("En fazla 6 öğrenci ekleyebilirsiniz.", "error");
                return;
            }
            const newStudent: Student = {
                id: Math.random().toString(36).substring(7),
                firstName: editingStudent.firstName!,
                lastName: editingStudent.lastName!,
                grade: editingStudent.grade!,
                hasParentalConsent: false,
                hasKvkkConsent: false
            };
            updatedStudents.push(newStudent);
        }

        try {
            await updateApplication({ ...currentApplication, team: { ...currentApplication.team, students: updatedStudents } });
            showToast("Kadro güncellendi.", "success");
            setIsStudentModalOpen(false);
            setEditingStudent(null);
        } catch (e) {
            showToast("Güncelleme başarısız.", "error");
        }
    };

    const handleDeleteStudent = async (studentId: string) => {
        if (!currentApplication) return;
        if (currentApplication.team.videoStatus === 'UPLOADED' || currentApplication.team.videoStatus === 'SUBMITTED_LINK') {
            showToast("Video yüklendikten sonra öğrenci değişikliği yapılamaz.", "error");
            return;
        }
        if (currentApplication.team.students.length <= 3) {
            showToast("Takım en az 3 kişiden oluşmalıdır.", "error");
            return;
        }
        if (!window.confirm("Bu öğrenciyi takımdan çıkarmak istediğinize emin misiniz?")) return;

        const updatedStudents = currentApplication.team.students.filter(s => s.id !== studentId);
        try {
            await updateApplication({ ...currentApplication, team: { ...currentApplication.team, students: updatedStudents } });
            showToast("Öğrenci çıkarıldı.", "success");
        } catch (e) {
            showToast("Silme işlemi başarısız.", "error");
        }
    };

    const handleGenerateCode = async (studentId: string, type: 'PARENT' | 'KVKK') => {
        if (!currentApplication) return;
        
        // 5-digit number
        const generateRandomString = () => {
            return Math.floor(10000 + Math.random() * 90000).toString();
        };

        let newCode = generateRandomString();
        
        if (type === 'PARENT') {
            newCode = `RAS-VI-${newCode}`;
        } else {
            newCode = `RAS-AR-${newCode}`;
        }

        const isCodeTaken = currentApplication.team.students.some(s => 
            s.parentalExpectedId === newCode || s.kvkkExpectedId === newCode
        );

        if (isCodeTaken) { handleGenerateCode(studentId, type); return; }

        const updatedStudents = currentApplication.team.students.map(s => {
            if (s.id === studentId) {
                return type === 'PARENT' ? { ...s, parentalExpectedId: newCode } : { ...s, kvkkExpectedId: newCode };
            }
            return s;
        });

        try {
            await updateApplication({ ...currentApplication, team: { ...currentApplication.team, students: updatedStudents } });
            showToast("Kod oluşturuldu.", 'success');
        } catch (e) {
            showToast("Hata oluştu.", 'error');
        }
    };

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        showToast("Kod kopyalandı!", 'success');
    };

    const handleOpenDeclarationModal = (studentId: string, type: 'PARENT' | 'KVKK') => {
        setDeclarationModal({ studentId, type });
        setDeclarationAccepted(false);
    };

    const handleConfirmDeclaration = () => {
        if (!declarationModal) return;
        // Trigger upload
        handleDocUpload(declarationModal.studentId, declarationModal.type);
        setDeclarationModal(null);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFiles(prev => ({ ...prev, [key]: file }));
        }
    };

    const handleDocUpload = async (studentId: string, type: 'PARENT' | 'KVKK') => {
        const keyMap = `${studentId}_${type}`;
        const file = selectedFiles[keyMap];
        
        if(!file || !currentApplication) { showToast("Dosya seçilmedi.", 'error'); return; }
        
        const enteredCode = (verifyCodes[keyMap] || '').trim();
        const student = currentApplication.team.students.find(s => s.id === studentId);
        const expectedCode = type === 'PARENT' ? student?.parentalExpectedId : student?.kvkkExpectedId;
        
        if (!expectedCode) { showToast("Önce kod oluşturun.", 'error'); return; }
        if (enteredCode !== expectedCode) { showToast("Girdiğiniz kod belge üzerindeki kodla eşleşmiyor!", 'error'); return; }

        setUploadingDoc(keyMap);
        try {
            const storagePath = `teams/${currentApplication.id}/students/${studentId}/docs/${type.toLowerCase()}.pdf`;
            const r2Key = await uploadFileToR2(file, storagePath);
            const updatedStudents = currentApplication.team.students.map(s => {
                if(s.id === studentId) {
                    return type === 'PARENT' 
                        ? { ...s, hasParentalConsent: true, parentalConsentUrl: r2Key, docStatus: 'PENDING', rejectionReason: undefined } 
                        : { ...s, hasKvkkConsent: true, kvkkConsentUrl: r2Key, docStatus: 'PENDING', rejectionReason: undefined };
                }
                return s;
            });
            await updateApplication({ ...currentApplication, team: { ...currentApplication.team, students: updatedStudents as Student[] } });
            
            setSelectedFiles(prev => { const n = {...prev}; delete n[keyMap]; return n; });
            setVerifyCodes(prev => ({ ...prev, [keyMap]: '' }));
            showToast("Belge başarıyla yüklendi.", 'success');
        } catch(err: any) { 
            showToast("Hata: " + err.message, 'error'); 
        } finally { 
            setUploadingDoc(null);
        }
    };

    const handleDeleteDoc = async (studentId: string, type: 'PARENT' | 'KVKK') => {
        if (!currentApplication) return;
        if (!window.confirm("Yüklenen belgeyi silmek ve yeniden yüklemek istediğinize emin misiniz?")) return;

        const updatedStudents = currentApplication.team.students.map(s => {
            if (s.id === studentId) {
                if (type === 'PARENT') {
                    return { ...s, hasParentalConsent: false, parentalConsentUrl: undefined, docStatus: undefined, rejectionReason: undefined };
                } else {
                    return { ...s, hasKvkkConsent: false, kvkkConsentUrl: undefined, docStatus: undefined, rejectionReason: undefined };
                }
            }
            return s;
        });

        try {
            await updateApplication({ ...currentApplication, team: { ...currentApplication.team, students: updatedStudents as Student[] } });
            showToast("Belge silindi.", "success");
        } catch (e) {
            showToast("Silme işlemi başarısız.", "error");
        }
    };

    const confirmVideoSubmission = async () => {
        if (!currentApplication) return;
        if (IS_DEADLINE_PASSED) {
            showToast("Video teslim süresi sona ermiştir.", "error");
            return;
        }
        if (!videoLink.trim()) {
            showToast("Lütfen YouTube video linkini giriniz.", "error");
            return;
        }
        try {
            const updated = { 
                ...currentApplication, 
                team: { ...currentApplication.team, videoStatus: 'SUBMITTED_LINK' as const, videoUrl: videoLink },
                status: ApplicationStatus.FINAL_SUBMITTED 
            };
            await updateApplication(updated);
            setShowVideoSuccessModal(true); // Open success modal
        } catch (error) {
            showToast("Hata oluştu.", 'error');
        }
    };

    // --- Disqualified View ---
    if (currentApplication?.status === ApplicationStatus.DISQUALIFIED) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center animate-fadeIn relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>
                <div className="relative z-10 max-w-lg w-full bg-slate-900/80 backdrop-blur-xl border border-red-900/30 p-10 rounded-3xl shadow-2xl flex flex-col items-center">
                    <div className="relative mb-8">
                        <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full animate-pulse"></div>
                        <div className="relative w-24 h-24 bg-slate-950 border border-red-500/50 rounded-full flex items-center justify-center shadow-2xl">
                            <Ban size={48} className="text-red-500" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-black text-white mb-4">Erişim Engellendi</h1>
                    <p className="text-lg text-slate-300 mb-8 font-light">Üzgünüz, takımınız diskalifiye edilmiştir.</p>
                </div>
            </div>
        );
    }

    // --- Create Application View ---
    if (!currentApplication || showCreateForm) {
        const handleCreateSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            if(!validateCreate()) return;
            setIsCreating(true);
            try { 
                await createApplication(teamForm); 
                setShowCreateForm(false);
            } catch (e: any) { 
                showToast(e.message, 'error'); 
            } finally { 
                setIsCreating(false); 
            }
        };
        const validateCreate = () => {
            const errs: any = {};
            if(!teamForm.teamName) errs.teamName = "Takım adı gereklidir.";
            if(teamForm.students.some(s => !s.firstName || !s.lastName || !s.grade)) errs.students = "Tüm öğrenci bilgileri doldurulmalıdır.";
            setFormErrors(errs);
            return Object.keys(errs).length === 0;
        };

        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fadeIn min-h-screen">
                {/* Team Switcher in Create View */}
                <TeamSwitcher 
                    applications={myApplications}
                    activeId={showCreateForm ? null : activeApplicationId}
                    onSwitch={(id) => {
                        setActiveApplicationId(id);
                        setShowCreateForm(false);
                    }}
                    onCreate={() => setShowCreateForm(true)}
                    canCreate={myApplications.length < 5}
                />

                <div className="max-w-4xl mx-auto w-full bg-slate-900 border border-slate-700 rounded-[2rem] p-8 md:p-12 shadow-2xl relative overflow-hidden mt-8">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-[80px] pointer-events-none -mr-20 -mt-20"></div>
                    <h2 className="text-3xl md:text-4xl font-black text-white mb-8 flex items-center gap-4">
                        <Clapperboard className="text-rose-500" size={40}/> Prodüksiyonu Başlat
                    </h2>
                    <form onSubmit={handleCreateSubmit} className="space-y-8 relative z-10">
                        {showCreateForm && myApplications.length > 0 && (
                            <button 
                                type="button"
                                onClick={() => setShowCreateForm(false)}
                                className="absolute -top-16 right-0 text-slate-400 hover:text-white flex items-center gap-2 font-bold text-sm"
                            >
                                <X size={20} /> Vazgeç
                            </button>
                        )}
                        <div className="grid md:grid-cols-2 gap-8">
                            <div>
                                <label htmlFor="teamName" className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">Takım Adı</label>
                                <input name="teamName" id="teamName" value={teamForm.teamName} onChange={(e) => setTeamForm({...teamForm, teamName: e.target.value})} maxLength={40} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white focus:border-rose-500 outline-none text-lg font-bold placeholder-slate-700 transition-colors" placeholder="Örn: Yıldızlar Ekibi" />
                            </div>
                            <div>
                                <label htmlFor="category" className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">Kategori</label>
                                <select name="category" id="category" value={teamForm.category} onChange={(e) => setTeamForm({...teamForm, category: e.target.value as Category})} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white focus:border-rose-500 outline-none text-lg font-bold transition-colors">
                                    {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div>
                                <label htmlFor="theme" className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">Proje Teması</label>
                                <select 
                                    name="theme" id="theme" 
                                    value={teamForm.theme} 
                                    onChange={(e) => setTeamForm({...teamForm, theme: e.target.value as Theme})} 
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white focus:border-rose-500 outline-none text-lg font-bold transition-colors"
                                >
                                    {Object.values(Theme).map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            {teamForm.theme === Theme.AYET && (
                                <div>
                                    <label htmlFor="selectedVerse" className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">Seçilen Ayet</label>
                                    <select 
                                        name="selectedVerse" id="selectedVerse" 
                                        value={teamForm.selectedVerse} 
                                        onChange={(e) => setTeamForm({...teamForm, selectedVerse: e.target.value})} 
                                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white focus:border-rose-500 outline-none text-lg font-bold transition-colors"
                                    >
                                        {versesList.map(v => <option key={v} value={v}>{v}</option>)}
                                    </select>
                                </div>
                            )}
                            {(teamForm.theme === Theme.HADITH || teamForm.theme === Theme.SAHABE) && (
                                <div>
                                    <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">
                                        {teamForm.theme === Theme.HADITH ? 'Seçilen Hadis' : 'Seçilen Sahabe'}
                                    </label>
                                    <input 
                                        type="text"
                                        placeholder={teamForm.theme === Theme.HADITH ? "Örn: Ameller niyetlere göredir" : "Örn: Hz. Mus'ab b. Umeyr"}
                                        value={teamForm.selectedTopic} 
                                        onChange={(e) => setTeamForm({...teamForm, selectedTopic: e.target.value})} 
                                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white focus:border-rose-500 outline-none text-lg font-bold transition-colors"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Verse Preview in Registration */}
                        {teamForm.theme === Theme.AYET && teamForm.selectedVerse && verseDetails[teamForm.selectedVerse] && (
                            <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-6 animate-fadeIn">
                                <p className="text-right text-xl font-serif text-amber-400 leading-loose mb-4" dir="rtl">
                                    {renderVerseText(verseDetails[teamForm.selectedVerse].arabic, true)}
                                </p>
                                <div className="w-full h-px bg-slate-800 mb-4"></div>
                                <p className="text-sm text-slate-300 italic">
                                    "{renderVerseText(verseDetails[teamForm.selectedVerse].turkish, false)}"
                                </p>
                            </div>
                        )}

                        {teamForm.theme === Theme.HADITH && (
                            <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-6 animate-fadeIn flex flex-col items-center text-center gap-3">
                                <Sparkles className="text-amber-500" size={24} />
                                <p className="text-amber-400 font-serif text-lg" dir="rtl">إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ</p>
                                <p className="text-sm text-slate-300 italic">"Ameller niyetlere göredir." (Buhârî, Bed’ü’l-vahy, 1)</p>
                            </div>
                        )}

                        {teamForm.theme === Theme.SAHABE && (
                            <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-6 animate-fadeIn flex flex-col items-center text-center gap-3">
                                <Users className="text-teal-500" size={24} />
                                <h5 className="text-white font-bold">Sahabe-i Kiram'ın İzinde</h5>
                                <p className="text-xs text-slate-400 leading-relaxed">İslam'ın ilk sancaktarları, fedakarlık ve sadakat timsalleri. Hz. Mus'ab b. Umeyr'in daveti, Hz. Bilal'in sabrı ve Hz. Hatice'nin desteği gibi nice hikmetli hayatlar...</p>
                            </div>
                        )}

                        <div className="flex items-center gap-3 p-4 bg-amber-900/10 border border-amber-500/20 rounded-xl">
                            <AlertCircle className="text-amber-500 flex-shrink-0" size={20} />
                            <p className="text-xs text-amber-200/80 font-medium">
                                <strong className="text-amber-500">Önemli:</strong> Seçilen <span className="text-white">Kategori</span> ve <span className="text-white">Proje Teması</span> kayıt tamamlandıktan sonra <span className="underline decoration-amber-500/50">değiştirilemez</span>. Lütfen seçimlerinizi kontrol ediniz.
                            </p>
                        </div>

                        <div className="bg-slate-950/50 p-6 rounded-2xl border border-slate-800">
                            <h4 className="text-white font-bold mb-4 flex items-center gap-2"><Users size={18} className="text-teal-500"/> İlk 3 Öğrenci (Zorunlu)</h4>
                            <div className="grid gap-4">
                                {teamForm.students.map((s, i) => (
                                    <div key={i} className="grid grid-cols-3 gap-4">
                                        <input placeholder="Ad" value={s.firstName} onChange={e => { const n=[...teamForm.students]; n[i].firstName=e.target.value; setTeamForm({...teamForm, students:n}) }} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-teal-500" />
                                        <input placeholder="Soyad" value={s.lastName} onChange={e => { const n=[...teamForm.students]; n[i].lastName=e.target.value; setTeamForm({...teamForm, students:n}) }} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-teal-500" />
                                        <input placeholder="Sınıf (Örn: 11-A)" value={s.grade} onChange={e => { const n=[...teamForm.students]; n[i].grade=e.target.value; setTeamForm({...teamForm, students:n}) }} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-teal-500" />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <button type="submit" disabled={isCreating} className="w-full bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white py-5 rounded-2xl font-black text-xl shadow-lg shadow-rose-900/30 transition-all flex items-center justify-center gap-3 transform hover:-translate-y-1">
                            {isCreating ? 'Sahne Kuruluyor...' : 'Motor! (Başvuruyu Tamamla)'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    const progress = calculateProgress();
    const allVideoChecksPassed = videoChecklist.resolution && videoChecklist.audio && videoChecklist.credits && videoChecklist.copyright && videoLink.length > 10;
    const missingDocsCount = getMissingDocsCount();
    const remainingDays = getRemainingDays();

    // Logic for Chat Indicator
    const showRedDot = isLastMessageFromAdmin && latestMessageId !== lastReadMessageId && activeTab !== 'CHAT';

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
      showToast, setVerifyCodes,
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
                                <strong className="text-amber-200">{currentApplication?.teacher?.fullName}</strong> ({currentApplication?.teacher?.school}) öğretmenimizin ekranını ve tüm yetkilerini inceliyorsunuz.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button type="button" 
                            onClick={() => {
                                setSimulatedApplicationId(null);
                                navigate('/admin');
                            }}
                            className="bg-slate-950/80 hover:bg-slate-950 hover:scale-105 active:scale-95 border border-white/10 text-white font-black text-xs px-4 py-2 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                            <ShieldAlert size={14} className="text-amber-400" />
                            Admin Paneline Geri Dön
                        </button>
                    </div>
                </div>
            )}
            {/* Background Texture */}
            <div className="fixed inset-0 pointer-events-none z-[0] opacity-[0.03] mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>

            {/* --- HERO SECTION: Director's Cut Style --- */}
            <div className="relative pt-8 pb-12 bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {/* Team Switcher */}
                    <TeamSwitcher 
                        applications={myApplications}
                        activeId={activeApplicationId}
                        onSwitch={(id) => {
                            setActiveApplicationId(id);
                            setShowCreateForm(false);
                        }}
                        onCreate={() => setShowCreateForm(true)}
                        canCreate={myApplications.length < 5}
                    />

                    {/* Top Bar: Identity */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                        <div className="flex items-center gap-6">
                            {/* Logo logic removed here as per request */}
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">{currentApplication.team.name}</h1>
                                    <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                        {currentApplication.team.category}
                                    </span>
                                </div>
                                <p className="text-slate-400 font-medium flex items-center gap-2">
                                    <Clapperboard size={14} className="text-rose-500"/> {currentApplication.teacher.school}
                                </p>
                            </div>
                        </div>

                        {/* Production Status */}
                        <div className="flex items-center gap-6 bg-slate-900/50 p-4 rounded-3xl border border-slate-800/50 backdrop-blur-sm">
                            <div className="text-right hidden sm:block">
                                <span className="block text-white font-bold text-lg leading-none mb-1">Hazırlık Süreci</span>
                                <span className="block text-slate-500 text-xs font-medium uppercase tracking-wider">{progress === 100 ? 'Tamamlandı' : 'Devam Ediyor'}</span>
                            </div>
                            <ProductionStatusRing progress={progress} />
                        </div>
                    </div>

                    {/* Dynamic CTA */}
                    <div className="mb-8">
                        <NextActionCard app={currentApplication} isDeadlinePassed={IS_DEADLINE_PASSED} onAction={handleActionRedirect} />
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {[
                            { id: 'STATUS', label: 'Genel Bakış', icon: AlertOctagon },
                            { id: 'ACADEMY', label: 'Akademi', icon: BookOpen },
                            { id: 'DOCUMENTS', label: 'Belgeler & Kadro', icon: Users },
                            { id: 'VIDEO', label: 'Video Teslim', icon: Film },
                            { id: 'CHAT', label: 'Yönetimle İletişim', icon: MessageSquare }
                        ].map(tab => (
                            <button type="button" 
                                key={tab.id} 
                                onClick={() => setActiveTab(tab.id)} 
                                className={`
                                    flex items-center gap-2 px-6 py-4 rounded-xl font-bold text-sm transition-all whitespace-nowrap border-b-4 
                                    ${activeTab === tab.id 
                                        ? 'bg-slate-800 text-white border-rose-500 shadow-lg' 
                                        : 'bg-transparent text-slate-500 border-transparent hover:bg-slate-900 hover:text-white'}
                                `}
                            >
                                <tab.icon size={18} className={activeTab === tab.id ? 'text-rose-500' : ''} />
                                {tab.label}
                                {tab.id === 'CHAT' && (
                                    activeTab === 'CHAT' ? (
                                         <span className="ml-2 relative inline-flex rounded-full h-3 w-3 bg-green-500 shadow-[0_0_10px_#22c55e]"></span>
                                    ) : showRedDot ? (
                                        <span className="ml-2 relative flex h-3 w-3">
                                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                          <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                                        </span>
                                    ) : null
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- CONTENT AREA --- */}
            <div id="dashboard-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 animate-fadeIn">
                
                {/* 1. STATUS TAB */}
                {activeTab === 'STATUS' && <DashboardStatusTab />}

                {/* 2. ACADEMY TAB */}
                {activeTab === 'ACADEMY' && <DashboardAcademyTab />}

                {/* 3. DOCUMENTS TAB (Cast & Crew) */}
                {activeTab === 'DOCUMENTS' && <DashboardDocumentsTab />}

                {/* 3. VIDEO TAB (Cinema Room) - OPEN TO TEACHERS */}
                {activeTab === 'VIDEO' && <DashboardVideoTab />}

                {activeTab === 'CHAT' && <DashboardChatTab />}

            </div>

            {/* --- MODALS --- */}
            {/* Responsibility Modal */}
            {declarationModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full shadow-2xl relative overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-slate-800 bg-slate-950 flex justify-between items-center">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                <ShieldCheck className="text-amber-500" size={20} /> Yasal Sorumluluk Beyanı
                            </h3>
                            <button type="button" onClick={() => setDeclarationModal(null)} className="text-slate-500 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-8">
                            <div className="bg-amber-900/10 border-l-4 border-amber-500 p-4 rounded-r-lg mb-6">
                                <p className="text-amber-200/80 text-sm leading-relaxed">
                                    Bu işlem, resmi bir belge teslimidir. Lütfen aşağıdaki metni dikkatle okuyarak onaylayınız.
                                </p>
                            </div>
                            <p className="text-slate-300 text-sm leading-relaxed mb-6 font-light">
                                "Yüklemekte olduğum bu belgenin; orijinalinin tarafımda saklandığını, üzerindeki bilgilerin ve imzaların gerçek olduğunu, KVKK ve yarışma şartnamesine uygun olduğunu beyan ederim."
                            </p>
                            <label className="flex items-start gap-3 cursor-pointer group p-3 rounded-xl hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-700">
                                <div className={`w-5 h-5 rounded border flex items-center justify-center mt-0.5 transition-all ${declarationAccepted ? 'bg-green-600 border-green-600' : 'border-slate-600'}`}>
                                    {declarationAccepted && <CheckSquare size={14} className="text-white" />}
                                </div>
                                <input type="checkbox" className="hidden" checked={declarationAccepted} onChange={(e) => setDeclarationAccepted(e.target.checked)} />
                                <span className={`text-sm select-none ${declarationAccepted ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'}`}>
                                    Okudum, anladım ve onaylıyorum.
                                </span>
                            </label>
                        </div>
                        <div className="p-6 border-t border-slate-800 bg-slate-950 flex justify-end gap-3">
                            <button type="button" onClick={() => setDeclarationModal(null)} className="px-6 py-3 rounded-xl text-slate-400 hover:text-white font-bold text-sm transition-colors">İptal</button>
                            <button type="button" 
                                onClick={handleConfirmDeclaration}
                                disabled={!declarationAccepted}
                                className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-900 px-8 py-3 rounded-xl font-black text-sm shadow-lg shadow-amber-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95"
                            >
                                Onaylıyorum ve Yükle
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Winner Celebration Modal */}
            {showWinnerModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fadeIn">
                    <div className="bg-slate-900 border border-amber-500/50 rounded-[2.5rem] max-w-2xl w-full shadow-[0_0_100px_rgba(245,158,11,0.2)] relative overflow-hidden text-center p-8 md:p-12">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 pointer-events-none"></div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/20 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-500/20 rounded-full blur-[80px] -ml-20 -mb-20 pointer-events-none"></div>

                        <button type="button" onClick={handleCloseWinnerModal} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors z-20" aria-label="Kapat">
                            <X size={32} />
                        </button>

                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-28 h-28 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(245,158,11,0.4)] mb-8">
                                <Trophy size={48} className="text-white" />
                            </div>
                            
                            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4 leading-tight">
                                TEBRİKLER!
                            </h2>
                            <p className="text-lg md:text-xl text-slate-300 font-medium mb-8 leading-relaxed">
                                Danışmanlığını yürüttüğünüz aşağıdaki {winningMyApplications.length > 1 ? 'takımlarınız' : 'takımınız'} jüri değerlendirmesinde başarı göstererek <strong className="text-amber-500">Ödül Almaya</strong> hak kazanmıştır.
                            </p>

                            <div className="w-full bg-slate-950/50 border border-slate-800 rounded-3xl p-6 mb-8 text-left space-y-4">
                                {winningMyApplications.map(app => (
                                    <div key={app.id} className="bg-slate-900 border border-amber-500/30 p-4 rounded-xl flex items-center justify-between">
                                        <div>
                                            <h4 className="font-bold text-white text-lg">{app.team.name}</h4>
                                            <p className="text-sm text-slate-400">{app.team.awardCategory}</p>
                                        </div>
                                        <button type="button" 
                                            onClick={() => {
                                                handleCloseWinnerModal();
                                                setTimeout(() => window.location.href = `#/award-participation/team/${app.team.id}`, 300);
                                            }}
                                            className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 px-4 text-sm rounded-lg transition-transform hover:-translate-y-1 shadow-lg"
                                        >
                                            Formu Doldur <ArrowRight size={16} className="inline ml-1"/>
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <p className="text-sm text-slate-400 mb-8 max-w-lg mx-auto">
                                Ödül Töreni hazırlıkları için katılım durumunuzu bildiren formu en geç <strong className="text-white">11 Mayıs 2026 Pzt. Saat 13:00'e</strong> kadar doldurmanız gerekmektedir.
                            </p>

                            <button type="button" onClick={handleCloseWinnerModal} className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 px-10 rounded-2xl transition-colors">
                                Anladım, Panele Dön
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Thanks Modal for Non-Winning Participants */}
            {showThanksModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fadeIn">
                    <div className="bg-slate-900 border border-slate-700 rounded-[2.5rem] max-w-2xl w-full shadow-2xl relative overflow-hidden text-center p-8 md:p-12">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -ml-20 -mb-20 pointer-events-none"></div>

                        <button type="button" onClick={handleCloseThanksModal} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors z-20" aria-label="Kapat">
                            <X size={32} />
                        </button>

                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mb-6">
                                <Sparkles size={40} className="text-blue-400" />
                            </div>
                            
                            <h2 className="text-3xl font-black text-white tracking-tight mb-4 leading-tight">
                                Katılımınız İçin Teşekkürler!
                            </h2>
                            <p className="text-lg md:text-xl text-slate-300 font-medium mb-6 leading-relaxed">
                                Danışmanlığını yürüttüğünüz takımlar ödül töreni için davet alamasa da, gösterdikleri çaba ve sürece katkıları bizim için çok değerli.
                            </p>

                            <div className="w-full bg-slate-950/50 border border-slate-800 rounded-3xl p-6 mb-8 text-left space-y-4">
                                {losingMyApplications.map(app => (
                                    <div key={app.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                                        <div>
                                            <h4 className="font-bold text-white text-lg">{app.team.name}</h4>
                                            <p className="text-sm text-slate-400">Harika bir iş çıkardılar!</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <p className="text-sm text-slate-400 mb-8 max-w-lg mx-auto">
                                Öğrencilerinize ve size emeklerinizden dolayı sonsuz teşekkürler. Hazırlanan teşekkür e-sertifikalarını panelinizden anında görüntüleyebilir ve indirebilirsiniz.
                            </p>

                            <button type="button" onClick={handleCloseThanksModal} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-10 rounded-2xl transition-colors">
                                Anladım, Panele Dön
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Video Success Modal */}
            {showVideoSuccessModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fadeIn">
                    <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full shadow-2xl relative overflow-hidden text-center p-10">
                        {/* Confetti / Celebration Decoration */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none"></div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-[80px] -mr-20 -mt-20"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] -ml-20 -mb-20"></div>

                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.4)] mb-8 animate-bounce">
                                <PartyPopper size={48} className="text-white" />
                            </div>
                            
                            <h2 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">
                                Tebrikler!
                            </h2>
                            <h3 className="text-xl font-bold text-green-400 mb-6">
                                Filminiz Jüriye Ulaştı
                            </h3>
                            
                            <p className="text-slate-300 text-lg leading-relaxed mb-8">
                                Yarışma başvurunuz başarıyla tamamlandı.<br/>
                                Büyük bir emeğin ürününü teslim ettiğiniz için teşekkür ederiz. Artık arkanıza yaslanıp ödül törenini bekleyebilirsiniz.
                            </p>

                            <button type="button" 
                                onClick={() => setShowVideoSuccessModal(false)}
                                className="bg-white text-slate-900 hover:bg-slate-200 px-10 py-4 rounded-xl font-black text-lg shadow-xl hover:-translate-y-1 transition-all"
                            >
                                Harika!
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showDeadlineModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fadeIn">
                    <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full shadow-2xl relative overflow-hidden text-center p-10">
                        {/* Confetti / Celebration Decoration */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none"></div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-[80px] -mr-20 -mt-20"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/10 rounded-full blur-[80px] -ml-20 -mb-20"></div>

                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(20,184,166,0.4)] mb-8 animate-bounce">
                                <Clapperboard size={48} className="text-white" />
                            </div>
                            
                            <h2 className="text-3xl md:text-3xl font-black text-white mb-4 tracking-tight">
                                Film Gönderim Süreci Sona Erdi!
                            </h2>
                            <h3 className="text-xl font-bold text-green-400 mb-6">
                                Jüri Değerlendirmesi Başladı
                            </h3>
                            
                            <p className="text-slate-300 text-lg leading-relaxed mb-8">
                                Tebrikler! Filminizi başarıyla teslim ettiniz ve değerlendirme sürecine katılmaya hak kazandınız. Jüri heyetimiz projelerinizi dikkatle inceliyor.
                                <br/><br/>
                                Sonuçlar, ödül töreninde açıklanacaktır. Hazırlıklarınızı yapmayı unutmayın!
                            </p>

                            <button type="button" 
                                onClick={() => setShowDeadlineModal(false)}
                                className="bg-white text-slate-900 hover:bg-slate-200 px-10 py-4 rounded-xl font-black text-lg shadow-xl hover:-translate-y-1 transition-all"
                            >
                                Anladım
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Student Edit Modal */}
            {isStudentModalOpen && editingStudent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-slate-900 w-full max-w-md rounded-2xl border border-slate-700 shadow-2xl p-8 relative">
                        <button type="button" onClick={() => setIsStudentModalOpen(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white">
                            <X size={20} />
                        </button>
                        <h3 className="text-xl font-bold text-white mb-6">
                            {editingStudent.id ? 'Oyuncu Kartını Düzenle' : 'Yeni Oyuncu Ekle'}
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Ad</label>
                                <input 
                                    value={editingStudent.firstName} 
                                    onChange={(e) => setEditingStudent({...editingStudent, firstName: e.target.value})}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white outline-none focus:border-rose-500"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Soyad</label>
                                <input 
                                    value={editingStudent.lastName} 
                                    onChange={(e) => setEditingStudent({...editingStudent, lastName: e.target.value})}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white outline-none focus:border-rose-500"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Sınıf</label>
                                <input 
                                    value={editingStudent.grade} 
                                    onChange={(e) => setEditingStudent({...editingStudent, grade: e.target.value})}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white outline-none focus:border-rose-500"
                                />
                            </div>
                            <button type="button" 
                                onClick={handleSaveStudent}
                                className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 rounded-xl mt-4 transition-colors"
                            >
                                Değişiklikleri Kaydet
                            </button>
                        </div>
                    </div>
                </div>
            )}

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

