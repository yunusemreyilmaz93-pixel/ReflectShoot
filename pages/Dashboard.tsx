
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    Clapperboard, Users, FileText, Video, MessageSquare, AlertCircle, 
    CheckCircle2, Clock, Upload, X, Save, Film, HelpCircle, LogOut, Ban, ShieldAlert,
    Download, Lock, ExternalLink, RefreshCw, FileCheck, BookOpen, Eye, Calendar, Bell, Copy, Info, Loader2, File,
    Plus, Trash2, Edit, AlertOctagon, CheckSquare, Camera, PenTool, Printer, ShieldCheck,
    Sparkles, ArrowRight, UploadCloud, Megaphone, Star, PartyPopper, User, RefreshCcw, Youtube
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Category, Theme, ApplicationStatus, Student, UserRole } from '../types';
import { versesList, verseDetails, VERSE_SPLITTER } from '../data/verses';
import { ChatArea } from '../components/ChatArea';
import { uploadFileToR2, uploadPublicLogo } from '../lib/cloudStorage';
import { CertificateGenerator } from '../components/CertificateGenerator';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

// Placeholder Template URLs
const TEMPLATE_PARENT_URL = "https://assets.reflectandshoot.com/veli_izin_belgesi.pdf";
const TEMPLATE_CONSENT_URL = "https://assets.reflectandshoot.com/acik_riza_metni.pdf";

// --- COMPONENTS ---

// 1. Premium Circular Progress
const ProductionStatusRing = ({ progress }: { progress: number }) => {
    const size = 80;
    const stroke = 6;
    const radius = (size / 2) - stroke;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center group cursor-default">
            {/* Glow Effect */}
            <div className={`absolute inset-0 rounded-full blur-xl opacity-20 transition-all duration-1000 ${progress === 100 ? 'bg-green-500' : 'bg-rose-500'}`}></div>
            
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="transform -rotate-90">
                    <circle cx={size/2} cy={size/2} r={radius} stroke="currentColor" strokeWidth={stroke} fill="transparent" className="text-slate-800" />
                    <circle 
                        cx={size/2} cy={size/2} r={radius} stroke="currentColor" strokeWidth={stroke} fill="transparent" 
                        strokeDasharray={circumference}
                        style={{ strokeDashoffset: offset, transition: 'stroke-dashoffset 1.5s ease-in-out' }}
                        strokeLinecap="round"
                        className={progress === 100 ? 'text-green-500' : 'text-rose-600'} 
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg font-black text-white">{progress}%</span>
                    <span className="text-[8px] uppercase font-bold text-slate-500 tracking-wider">Hazır</span>
                </div>
            </div>
            
            {progress === 100 && (
                <div className="absolute -top-2 -right-2 bg-green-500 text-slate-900 p-1.5 rounded-full shadow-lg animate-bounce">
                    <CheckCircle2 size={16} />
                </div>
            )}
        </div>
    );
};

// 2. Next Action Card (Smart Assistant)
const NextActionCard = ({ app, onAction }: { app: any, onAction: (tab: string, subAction?: any) => void }) => {
    let action = { text: "Tüm aşamalar tamamlandı! Arkanıza yaslanın.", btn: "Durumu Kontrol Et", tab: "STATUS", type: "success" };
    
    // Logic Chain
    
    // Check Students (Dynamic Check)
    const missingParent = app.team.students.find((s: Student) => !s.hasParentalConsent);
    const missingKvkk = app.team.students.find((s: Student) => !s.hasKvkkConsent);

    if (app.team.students.length < 3) {
        action = { text: "Takım en az 3 kişiden oluşmalıdır.", btn: "Öğrenci Ekle", tab: "DOCUMENTS", type: "urgent" };
    } else if (missingParent) {
        action = { text: `${missingParent.firstName} isimli öğrencinin Veli İzin Belgesi eksik.`, btn: "Belgeyi Yükle", tab: "DOCUMENTS", type: "warning" };
    } else if (missingKvkk) {
        action = { text: `${missingKvkk.firstName} isimli öğrencinin KVKK Metni eksik.`, btn: "Belgeyi Yükle", tab: "DOCUMENTS", type: "warning" };
    } else if (app.team.videoStatus === 'PENDING' || app.team.videoStatus === 'ERROR') {
        action = { text: "Prodüksiyon belgeleri tamam. Sırada film teslimi var.", btn: "Videoyu Teslim Et", tab: "VIDEO", type: "info" };
    } else if (app.team.videoStatus === 'SUBMITTED_LINK') {
        action = { text: "Video inceleme aşamasında. Onay bekleniyor.", btn: "Detayları Gör", tab: "VIDEO", type: "success" };
    }

    return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 shadow-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 group">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
            <div className={`absolute left-0 top-0 bottom-0 w-2 ${action.type === 'success' ? 'bg-green-500' : action.type === 'urgent' ? 'bg-red-500' : action.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'}`}></div>

            <div className="flex items-center gap-6 relative z-10 w-full md:w-auto">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 ${action.type === 'success' ? 'bg-green-500/20 text-green-500' : action.type === 'urgent' ? 'bg-red-500/20 text-red-500' : 'bg-amber-500/20 text-amber-500'}`}>
                    {action.type === 'success' ? <PartyPopper size={28} /> : <Megaphone size={28} className="animate-pulse" />}
                </div>
                <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Sıradaki Görev</h4>
                    <p className="text-lg md:text-xl font-bold text-white leading-tight">{action.text}</p>
                </div>
            </div>

            <button 
                onClick={() => onAction(action.tab)}
                className="relative z-10 bg-white text-slate-900 hover:bg-slate-200 px-8 py-4 rounded-xl font-black text-sm flex items-center gap-2 transition-all shadow-xl hover:-translate-y-1 whitespace-nowrap w-full md:w-auto justify-center"
            >
                {action.btn} <ArrowRight size={16} />
            </button>
        </div>
    );
};

// 3. Team Switcher
const TeamSwitcher = ({ 
    applications, 
    activeId, 
    onSwitch, 
    onCreate, 
    canCreate 
}: { 
    applications: any[], 
    activeId: string | null, 
    onSwitch: (id: string) => void, 
    onCreate: () => void,
    canCreate: boolean
}) => {
    return (
        <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
            {applications.map((app, index) => (
                <button
                    key={app.id}
                    onClick={() => onSwitch(app.id)}
                    className={`
                        group relative flex items-center gap-3 px-4 py-2 rounded-2xl border transition-all duration-300 whitespace-nowrap
                        ${activeId === app.id 
                            ? 'bg-rose-500/10 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.2)]' 
                            : 'bg-slate-900/50 border-slate-800 hover:border-slate-600'}
                    `}
                >
                    <div className={`
                        w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs
                        ${activeId === app.id ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-400 group-hover:text-white'}
                    `}>
                        {index + 1}
                    </div>
                    <div className="text-left">
                        <span className={`block text-xs font-black uppercase tracking-wider ${activeId === app.id ? 'text-rose-500' : 'text-slate-500 group-hover:text-slate-300'}`}>
                            Takım {index + 1}
                        </span>
                        <span className={`block text-sm font-bold ${activeId === app.id ? 'text-white' : 'text-slate-400'}`}>
                            {app.team.name}
                        </span>
                    </div>
                    {activeId === app.id && (
                        <motion.div 
                            layoutId="active-team-glow"
                            className="absolute inset-0 rounded-2xl bg-rose-500/5 blur-md -z-10"
                        />
                    )}
                </button>
            ))}

            {canCreate && (
                <button
                    onClick={onCreate}
                    className="flex items-center gap-3 px-4 py-2 rounded-2xl border border-dashed border-slate-700 hover:border-rose-500/50 hover:bg-rose-500/5 transition-all group whitespace-nowrap"
                >
                    <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                        <Plus size={18} />
                    </div>
                    <div className="text-left">
                        <span className="block text-xs font-black uppercase tracking-wider text-slate-500 group-hover:text-rose-500">
                            Yeni Takım
                        </span>
                        <span className="block text-sm font-bold text-slate-400 group-hover:text-white">
                            Takım Ekle ({applications.length}/5)
                        </span>
                    </div>
                </button>
            )}
        </div>
    );
};

export const Dashboard: React.FC = () => {
    const { currentUser, currentApplication, myApplications, activeApplicationId, setActiveApplicationId, createApplication, updateApplication, showToast, systemSettings } = useAppContext();
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
                                <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">Takım Adı</label>
                                <input name="teamName" value={teamForm.teamName} onChange={(e) => setTeamForm({...teamForm, teamName: e.target.value})} maxLength={40} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white focus:border-rose-500 outline-none text-lg font-bold placeholder-slate-700 transition-colors" placeholder="Örn: Yıldızlar Ekibi" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">Kategori</label>
                                <select name="category" value={teamForm.category} onChange={(e) => setTeamForm({...teamForm, category: e.target.value as Category})} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white focus:border-rose-500 outline-none text-lg font-bold transition-colors">
                                    {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">Proje Teması</label>
                                <select 
                                    name="theme" 
                                    value={teamForm.theme} 
                                    onChange={(e) => setTeamForm({...teamForm, theme: e.target.value as Theme})} 
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white focus:border-rose-500 outline-none text-lg font-bold transition-colors"
                                >
                                    {Object.values(Theme).map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            {teamForm.theme === Theme.AYET && (
                                <div>
                                    <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">Seçilen Ayet</label>
                                    <select 
                                        name="selectedVerse" 
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
    
    return (
        <div className="bg-slate-950 min-h-screen text-slate-200 font-sans pb-24 relative overflow-x-hidden">
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
                        <NextActionCard app={currentApplication} onAction={handleActionRedirect} />
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
                            <button 
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
                {activeTab === 'STATUS' && (
                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Left Column */}
                        <div className="space-y-8">
                            {/* Multi-Team Overview Card */}
                            {myApplications.length > 1 && (
                                <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-[2rem] border border-slate-800/50 shadow-xl">
                                    <h3 className="font-bold text-white flex items-center gap-3 text-lg mb-6">
                                        <Users size={22} className="text-rose-500"/> Tüm Takımlarım
                                    </h3>
                                    <div className="grid gap-3">
                                        {myApplications.map((app, idx) => (
                                            <button 
                                                key={app.id}
                                                onClick={() => setActiveApplicationId(app.id)}
                                                className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                                                    activeApplicationId === app.id 
                                                    ? 'bg-rose-500/10 border-rose-500/50 shadow-lg' 
                                                    : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                                                }`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${activeApplicationId === app.id ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                                                        {idx + 1}
                                                    </div>
                                                    <div className="text-left">
                                                        <span className="block text-sm font-bold text-white">{app.team.name}</span>
                                                        <span className="block text-[10px] uppercase font-black tracking-widest text-slate-500">{app.status}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {app.team.videoStatus === 'SUBMITTED_LINK' ? (
                                                        <CheckCircle2 size={16} className="text-green-500" />
                                                    ) : (
                                                        <Clock size={16} className="text-amber-500" />
                                                    )}
                                                    <ArrowRight size={14} className="text-slate-600" />
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 shadow-xl relative overflow-hidden group">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="font-bold text-white flex items-center gap-3 text-lg"><Info size={22} className="text-teal-500"/> Proje Teması</h3>
                                </div>
                                
                                <div className="space-y-6 relative z-10">
                                    {/* Theme Display (Read-Only) */}
                                    <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                                        <span className="text-slate-500 font-medium">Seçilen Tema</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-white font-bold text-lg">{currentApplication.team.theme}</span>
                                            <Lock size={14} className="text-slate-600" />
                                        </div>
                                    </div>

                                    {/* Display Area */}
                                    <div className="mt-6">
                                        {currentApplication.team.theme === Theme.AYET && currentApplication.team.selectedVerse && verseDetails[currentApplication.team.selectedVerse] ? (
                                            <div className="p-6 bg-slate-950/50 border border-slate-800 rounded-2xl space-y-4 shadow-inner relative group/verse">
                                                <div className="absolute -top-3 left-4 px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-[10px] font-black text-amber-500 tracking-wider">
                                                    {currentApplication.team.selectedVerse}
                                                </div>
                                                <p className="text-right text-2xl font-serif text-amber-400 leading-loose pt-2" dir="rtl">
                                                    {renderVerseText(verseDetails[currentApplication.team.selectedVerse].arabic, true)}
                                                </p>
                                                <div className="w-full h-px bg-slate-800"></div>
                                                <p className="text-sm text-slate-300 italic leading-relaxed">
                                                    "{renderVerseText(verseDetails[currentApplication.team.selectedVerse].turkish, false)}"
                                                </p>
                                            </div>
                                        ) : (currentApplication.team.theme === Theme.HADITH || currentApplication.team.theme === Theme.SAHABE) ? (
                                            <div className="p-8 bg-slate-950/50 border border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center gap-4">
                                                <div className={`w-16 h-16 ${currentApplication.team.theme === Theme.HADITH ? 'bg-amber-500/10 text-amber-500' : 'bg-teal-500/10 text-teal-500'} rounded-full flex items-center justify-center`}>
                                                    {currentApplication.team.theme === Theme.HADITH ? <Sparkles size={32} /> : <Users size={32} />}
                                                </div>
                                                <div>
                                                    <h4 className="text-white font-bold mb-2">{currentApplication.team.selectedTopic || (currentApplication.team.theme === Theme.HADITH ? 'Hadis-i Şerif' : 'Sahabe Hikayesi')}</h4>
                                                    <p className="text-slate-400 text-sm leading-relaxed max-w-[300px]">
                                                        {currentApplication.team.theme === Theme.HADITH 
                                                            ? 'Seçilen hadis-i şerif üzerine kurgulanan sinematik eser.' 
                                                            : 'Seçilen sahabe efendimizin hayatından bir kesit sunan sinematik eser.'}
                                                    </p>
                                                    <p className="text-slate-500 text-[10px] mt-4 uppercase tracking-widest">{currentApplication.team.theme}</p>
                                                </div>
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 shadow-xl">
                                <h3 className="font-bold text-white mb-6 flex items-center gap-3 text-lg"><Bell size={22} className="text-amber-500"/> Hatırlatıcılar</h3>
                                <div className="space-y-4">
                                    <div className="p-5 bg-rose-900/10 border border-rose-500/20 rounded-2xl flex gap-4 transition-transform hover:scale-[1.02]">
                                        <div className="w-12 h-12 bg-rose-500/20 rounded-xl flex items-center justify-center flex-shrink-0"><Clock className="text-rose-500" size={24}/></div>
                                        <div>
                                            <p className="font-bold text-rose-200">Video Teslimi</p>
                                            <p className="text-xs text-slate-400 mt-1">Son teslim tarihine <strong className="text-white">{remainingDays} gün</strong> kaldı. ({new Date(systemSettings.dates.videoUploadEnd).toLocaleDateString()})</p>
                                        </div>
                                    </div>
                                    <div className="p-5 bg-teal-900/10 border border-teal-500/20 rounded-2xl flex gap-4 transition-transform hover:scale-[1.02]">
                                        <div className="w-12 h-12 bg-teal-500/20 rounded-xl flex items-center justify-center flex-shrink-0"><FileCheck className="text-teal-500" size={24}/></div>
                                        <div>
                                            <p className="font-bold text-teal-200">Belge Onayları</p>
                                            {missingDocsCount > 0 ? (
                                                <p className="text-xs text-slate-400 mt-1">Takımda <strong className="text-white">{missingDocsCount} adet</strong> eksik belge bulunuyor.</p>
                                            ) : (
                                                <p className="text-xs text-green-400 mt-1">Harika! Tüm belgeler tamamlandı.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Timeline */}
                        <div className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 shadow-xl">
                            <h3 className="font-bold text-white mb-8 flex items-center gap-3 text-lg"><Clock size={22} className="text-blue-500"/> Süreç Takibi</h3>
                            <div className="space-y-8 relative pl-4">
                                <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-slate-800"></div>
                                {[
                                    { label: 'Başvuru Oluşturuldu', done: true, date: new Date(currentApplication.submittedAt).toLocaleDateString() },
                                    { label: 'Belgeler Tamamlandı', done: currentApplication.team.students.every(s => s.hasParentalConsent && s.hasKvkkConsent) },
                                    { label: 'Video Teslim Edildi', done: currentApplication.team.videoStatus !== 'PENDING' },
                                    { label: 'Ön Eleme Sonucu', done: currentApplication.team.isPreliminaryStageComplete },
                                    { label: 'Gala Gecesi', done: false }
                                ].map((step, i) => (
                                    <div key={i} className="relative flex items-center gap-6 group">
                                        <div className={`w-6 h-6 rounded-full border-4 relative z-10 flex-shrink-0 transition-all duration-500 ${step.done ? 'bg-green-500 border-slate-900 shadow-[0_0_15px_rgba(34,197,94,0.5)]' : 'bg-slate-800 border-slate-900'}`}></div>
                                        <div className={`flex-1 p-4 rounded-2xl border transition-all ${step.done ? 'bg-slate-800 border-slate-700' : 'bg-transparent border-transparent opacity-50'}`}>
                                            <p className={`text-sm font-bold ${step.done ? 'text-white' : 'text-slate-500'}`}>{step.label}</p>
                                            {step.date && <p className="text-[10px] text-slate-500 mt-1 font-mono">{step.date}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. ACADEMY TAB */}
                {activeTab === 'ACADEMY' && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-black text-white">Akademi İçerikleri</h3>
                                <p className="text-slate-400 text-sm">Yarışma sürecinde size rehberlik edecek temel eğitimler.</p>
                            </div>
                            <button 
                                onClick={() => window.open('/academy', '_blank')}
                                className="text-rose-500 hover:text-rose-400 text-sm font-bold flex items-center gap-2"
                            >
                                Tümünü Gör <ExternalLink size={16} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {useAppContext().cmsAcademy.slice(0, 6).map((item: any) => {
                                const styles = getCategoryStyle(item.category);
                                return (
                                    <div 
                                        key={item.id}
                                        onClick={() => item.pdfFile ? window.open(item.pdfFile, '_blank') : window.open(item.url, '_blank')}
                                        className="group bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden cursor-pointer hover:border-slate-600 transition-all hover:-translate-y-1"
                                    >
                                        <div className="h-40 relative overflow-hidden">
                                            <img 
                                                src={item.coverImage || 'https://images.unsplash.com/photo-1478720568477-152d9b164e63?auto=format&fit=crop&q=80&w=800'} 
                                                alt={item.title}
                                                className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
                                            <div className="absolute bottom-4 left-4">
                                                <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${styles.badge}`}>
                                                    {item.category}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="p-6">
                                            <h4 className={`text-white font-bold mb-2 line-clamp-1 transition-colors ${styles.title}`}>{item.title}</h4>
                                            <p className="text-slate-500 text-xs line-clamp-2 mb-4">{item.description}</p>
                                            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                                                <span className="text-slate-600 flex items-center gap-1">
                                                    <Clock size={12} /> 5 Dakika
                                                </span>
                                                <span className={`flex items-center gap-1 ${styles.btn}`}>
                                                    İncele <ArrowRight size={12} />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}

                {/* 3. DOCUMENTS TAB (Cast & Crew) */}
                {activeTab === 'DOCUMENTS' && (
                    <div className="space-y-12">
                        {/* Guide Section */}
                        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border-2 border-blue-500/20 rounded-[2.5rem] p-10 relative overflow-hidden shadow-2xl group">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none -mr-20 -mt-20"></div>
                            <h3 className="text-xl font-black text-white uppercase tracking-widest mb-10 flex items-center gap-3">
                                <Info size={24} className="text-blue-500"/> Belge Yükleme Rehberi
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
                                {[
                                    { icon: RefreshCw, title: '1. Kodu Oluştur', desc: 'Sistemden her belge için benzersiz kod üret.' },
                                    { icon: PenTool, title: '2. Belgeye Yaz', desc: 'Kodu çıktısını aldığın belgenin üzerine el yazısıyla yaz.' },
                                    { icon: Camera, title: '3. PDF Olarak Tara', desc: 'İmzalı ve kodlu belgenizi PDF formatında taratın.' },
                                    { icon: Upload, title: '4. Sisteme Yükle', desc: 'Beyanı onayla ve dosyayı yükle.' }
                                ].map((step, i) => (
                                    <div key={i} className="flex flex-col items-center text-center group/item hover:-translate-y-1 transition-transform duration-300">
                                        <div className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center mb-6 border-2 border-slate-700 group-hover/item:border-blue-500 group-hover/item:bg-slate-900 transition-all shadow-xl">
                                            <step.icon size={32} className="text-slate-400 group-hover/item:text-blue-400 transition-colors" />
                                        </div>
                                        <h4 className="text-white font-bold text-lg mb-2">{step.title}</h4>
                                        <p className="text-sm text-slate-400 leading-relaxed font-light max-w-[200px]">{step.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Download Cards */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <a href={TEMPLATE_PARENT_URL} target="_blank" className="group bg-slate-900 p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-amber-900/20 rounded-xl text-amber-500 border border-amber-900/50">
                                        <Download size={24}/>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white group-hover:text-amber-500 transition-colors">Veli İzin Belgesi</h4>
                                        <p className="text-xs text-slate-500">İndir, yazdır ve veliye imzalat.</p>
                                    </div>
                                </div>
                                <ExternalLink size={16} className="text-slate-600 group-hover:text-white transition-colors" />
                            </a>
                            <a href={TEMPLATE_CONSENT_URL} target="_blank" className="group bg-slate-900 p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-teal-900/20 rounded-xl text-teal-500 border border-teal-900/50">
                                        <Download size={24}/>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white group-hover:text-teal-500 transition-colors">KVKK Açık Rıza Metni</h4>
                                        <p className="text-xs text-slate-500">İndir, yazdır ve imzalat.</p>
                                    </div>
                                </div>
                                <ExternalLink size={16} className="text-slate-600 group-hover:text-white transition-colors" />
                            </a>
                        </div>

                        {/* Cast Grid */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {currentApplication.team.students.map((student, idx) => (
                                <motion.div 
                                    key={student.id} 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative"
                                >
                                    
                                    {/* Student Header */}
                                    <div className="p-6 pb-4 flex justify-between items-start">
                                        <div>
                                            <h4 className="font-black text-white text-xl leading-tight">{student.firstName} {student.lastName}</h4>
                                            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">{student.grade}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => handleOpenStudentModal(student)}
                                                className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                                                title="Düzenle"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteStudent(student.id)}
                                                className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-900/20 rounded-lg transition-colors"
                                                title="Sil"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Documents Sections */}
                                    <div className="px-6 pb-6 space-y-4">
                                        {/* 1. Parent Consent */}
                                        <div className="bg-slate-950/50 rounded-2xl border border-dashed border-slate-800 p-5 relative group/section hover:border-slate-700 transition-colors">
                                            <div className="flex justify-between items-center mb-4">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">VELİ İZİN BELGESİ</span>
                                                {student.hasParentalConsent && (
                                                    <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded border ${
                                                        student.docStatus === 'APPROVED' ? 'bg-green-900/20 text-green-500 border-green-900/50' :
                                                        student.docStatus === 'REJECTED' ? 'bg-red-900/20 text-red-500 border-red-900/50' :
                                                        'bg-blue-900/20 text-blue-500 border-blue-900/50'
                                                    }`}>
                                                        {student.docStatus === 'APPROVED' ? <CheckSquare size={12}/> : student.docStatus === 'REJECTED' ? <AlertOctagon size={12}/> : <Clock size={12}/>}
                                                        {student.docStatus === 'APPROVED' ? 'ONAYLANDI' : student.docStatus === 'REJECTED' ? 'REDDEDİLDİ' : 'İNCELEMEDE'}
                                                    </div>
                                                )}
                                            </div>

                                            {student.hasParentalConsent && student.docStatus !== 'REJECTED' ? (
                                                <div className="text-center py-4">
                                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${student.docStatus === 'APPROVED' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                                        {student.docStatus === 'APPROVED' ? <CheckCircle2 size={24} /> : <Clock size={24} />}
                                                    </div>
                                                    <p className={`text-xs font-bold ${student.docStatus === 'APPROVED' ? 'text-green-400' : 'text-blue-400'}`}>
                                                        {student.docStatus === 'APPROVED' ? 'Belge Onaylandı' : 'İnceleme Bekliyor'}
                                                    </p>
                                                    {student.docStatus !== 'APPROVED' && (
                                                        <button onClick={() => handleDeleteDoc(student.id, 'PARENT')} className="mt-4 text-[10px] text-red-400 hover:text-red-300 flex items-center justify-center gap-1 w-full py-2 hover:bg-red-900/10 rounded transition-colors">
                                                            <Trash2 size={12}/> Sil ve Yeniden Yükle
                                                        </button>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {student.docStatus === 'REJECTED' && student.rejectionReason && (
                                                        <div className="bg-red-900/20 border border-red-900/50 p-3 rounded-xl mb-3">
                                                            <p className="text-[10px] text-red-400 leading-tight">
                                                                <strong className="uppercase">Red Nedeni:</strong> {student.rejectionReason}
                                                            </p>
                                                        </div>
                                                    )}
                                                    {!student.parentalExpectedId ? (
                                                        <button onClick={() => handleGenerateCode(student.id, 'PARENT')} className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-colors border border-slate-700">
                                                            KODU OLUŞTUR
                                                        </button>
                                                    ) : (
                                                        <>
                                                            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center relative">
                                                                <span className="text-[9px] text-slate-500 uppercase tracking-wider block mb-1">Belgeye Yazılan Kod</span>
                                                                <div className="text-xl font-black text-rose-500 tracking-widest font-mono select-all">{student.parentalExpectedId}</div>
                                                                <p className="text-[9px] text-amber-500/80 mt-2 leading-tight">Bu kod hem sisteme girilmeli hem de belge üzerinde el yazısıyla yer almalıdır.</p>
                                                                <button onClick={() => copyCode(student.parentalExpectedId!)} className="absolute top-2 right-2 text-slate-600 hover:text-white"><Copy size={12}/></button>
                                                            </div>
                                                            
                                                            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2">
                                                                <span className="text-[10px] font-bold text-slate-500 uppercase">GİR:</span>
                                                                <input 
                                                                    value={verifyCodes[`${student.id}_PARENT`] || ''}
                                                                    onChange={(e) => setVerifyCodes({...verifyCodes, [`${student.id}_PARENT`]: e.target.value})}
                                                                    className="bg-transparent text-white text-sm font-bold w-full outline-none placeholder-slate-700"
                                                                    placeholder="Kodu Buraya Yazın"
                                                                    maxLength={12}
                                                                />
                                                            </div>

                                                            <input type="file" id={`file-input-${student.id}-PARENT`} className="hidden" accept=".pdf" onChange={(e) => handleFileSelect(e, `${student.id}_PARENT`)} />
                                                            
                                                            <div className="grid grid-cols-2 gap-3">
                                                                <button 
                                                                    onClick={() => document.getElementById(`file-input-${student.id}-PARENT`)?.click()}
                                                                    className={`py-3 rounded-xl text-xs font-bold transition-all border ${selectedFiles[`${student.id}_PARENT`] ? 'bg-slate-800 border-green-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                                                                >
                                                                    {selectedFiles[`${student.id}_PARENT`] ? 'Dosya Değiştir' : 'BELGEYİ SEÇ'}
                                                                </button>

                                                                <button 
                                                                    onClick={() => handleOpenDeclarationModal(student.id, 'PARENT')}
                                                                    disabled={!selectedFiles[`${student.id}_PARENT`]}
                                                                    className={`py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${selectedFiles[`${student.id}_PARENT`] ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/20 hover:bg-rose-500' : 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-800'}`}
                                                                >
                                                                    {uploadingDoc === `${student.id}_PARENT` ? <Loader2 className="animate-spin" size={14}/> : <UploadCloud size={14}/>} 
                                                                    YÜKLE
                                                                </button>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* 2. KVKK Consent */}
                                        <div className="bg-slate-950/50 rounded-2xl border border-dashed border-slate-800 p-5 relative group/section hover:border-slate-700 transition-colors">
                                            <div className="flex justify-between items-center mb-4">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">KVKK METNİ</span>
                                                {student.hasKvkkConsent && (
                                                    <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded border ${
                                                        student.docStatus === 'APPROVED' ? 'bg-green-900/20 text-green-500 border-green-900/50' :
                                                        student.docStatus === 'REJECTED' ? 'bg-red-900/20 text-red-500 border-red-900/50' :
                                                        'bg-blue-900/20 text-blue-500 border-blue-900/50'
                                                    }`}>
                                                        {student.docStatus === 'APPROVED' ? <CheckSquare size={12}/> : student.docStatus === 'REJECTED' ? <AlertOctagon size={12}/> : <Clock size={12}/>}
                                                        {student.docStatus === 'APPROVED' ? 'ONAYLANDI' : student.docStatus === 'REJECTED' ? 'REDDEDİLDİ' : 'İNCELEMEDE'}
                                                    </div>
                                                )}
                                            </div>

                                            {student.hasKvkkConsent && student.docStatus !== 'REJECTED' ? (
                                                <div className="text-center py-4">
                                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${student.docStatus === 'APPROVED' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                                        {student.docStatus === 'APPROVED' ? <CheckCircle2 size={24} /> : <Clock size={24} />}
                                                    </div>
                                                    <p className={`text-xs font-bold ${student.docStatus === 'APPROVED' ? 'text-green-400' : 'text-blue-400'}`}>
                                                        {student.docStatus === 'APPROVED' ? 'Belge Onaylandı' : 'İnceleme Bekliyor'}
                                                    </p>
                                                    {student.docStatus !== 'APPROVED' && (
                                                        <button onClick={() => handleDeleteDoc(student.id, 'KVKK')} className="mt-4 text-[10px] text-red-400 hover:text-red-300 flex items-center justify-center gap-1 w-full py-2 hover:bg-red-900/10 rounded transition-colors">
                                                            <Trash2 size={12}/> Sil ve Yeniden Yükle
                                                        </button>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {student.docStatus === 'REJECTED' && student.rejectionReason && (
                                                        <div className="bg-red-900/20 border border-red-900/50 p-3 rounded-xl mb-3">
                                                            <p className="text-[10px] text-red-400 leading-tight">
                                                                <strong className="uppercase">Red Nedeni:</strong> {student.rejectionReason}
                                                            </p>
                                                        </div>
                                                    )}
                                                    {!student.kvkkExpectedId ? (
                                                        <button onClick={() => handleGenerateCode(student.id, 'KVKK')} className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-colors border border-slate-700">
                                                            KODU OLUŞTUR
                                                        </button>
                                                    ) : (
                                                        <>
                                                            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center relative">
                                                                <span className="text-[9px] text-slate-500 uppercase tracking-wider block mb-1">Belgeye Yazılan Kod</span>
                                                                <div className="text-xl font-black text-rose-500 tracking-widest font-mono select-all">{student.kvkkExpectedId}</div>
                                                                <p className="text-[9px] text-amber-500/80 mt-2 leading-tight">Bu kod hem sisteme girilmeli hem de belge üzerinde el yazısıyla yer almalıdır.</p>
                                                                <button onClick={() => copyCode(student.kvkkExpectedId!)} className="absolute top-2 right-2 text-slate-600 hover:text-white"><Copy size={12}/></button>
                                                            </div>
                                                            
                                                            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2">
                                                                <span className="text-[10px] font-bold text-slate-500 uppercase">GİR:</span>
                                                                <input 
                                                                    value={verifyCodes[`${student.id}_KVKK`] || ''}
                                                                    onChange={(e) => setVerifyCodes({...verifyCodes, [`${student.id}_KVKK`]: e.target.value})}
                                                                    className="bg-transparent text-white text-sm font-bold w-full outline-none placeholder-slate-700"
                                                                    placeholder="Kodu Buraya Yazın"
                                                                    maxLength={12}
                                                                />
                                                            </div>

                                                            <input type="file" id={`file-input-${student.id}-KVKK`} className="hidden" accept=".pdf" onChange={(e) => handleFileSelect(e, `${student.id}_KVKK`)} />
                                                            
                                                            <div className="grid grid-cols-2 gap-3">
                                                                <button 
                                                                    onClick={() => document.getElementById(`file-input-${student.id}-KVKK`)?.click()}
                                                                    className={`py-3 rounded-xl text-xs font-bold transition-all border ${selectedFiles[`${student.id}_KVKK`] ? 'bg-slate-800 border-green-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                                                                >
                                                                    {selectedFiles[`${student.id}_KVKK`] ? 'Dosya Değiştir' : 'BELGEYİ SEÇ'}
                                                                </button>

                                                                <button 
                                                                    onClick={() => handleOpenDeclarationModal(student.id, 'KVKK')}
                                                                    disabled={!selectedFiles[`${student.id}_KVKK`]}
                                                                    className={`py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${selectedFiles[`${student.id}_KVKK`] ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/20 hover:bg-rose-500' : 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-800'}`}
                                                                >
                                                                    {uploadingDoc === `${student.id}_KVKK` ? <Loader2 className="animate-spin" size={14}/> : <UploadCloud size={14}/>} 
                                                                    YÜKLE
                                                                </button>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}

                            {/* Add Student Card */}
                            {currentApplication.team.students.length < 6 && (
                                <button 
                                    onClick={() => handleOpenStudentModal()}
                                    className="group flex flex-col items-center justify-center gap-4 bg-slate-900/30 border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-3xl transition-all min-h-[500px]"
                                >
                                    <div className="w-16 h-16 rounded-full bg-slate-800 group-hover:bg-rose-600 group-hover:text-white text-slate-600 flex items-center justify-center transition-all shadow-lg">
                                        <Plus size={32} />
                                    </div>
                                    <span className="font-bold text-slate-500 group-hover:text-white transition-colors">Yeni Öğrenci Ekle</span>
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* 3. VIDEO TAB (Cinema Room) - OPEN TO TEACHERS */}
                {activeTab === 'VIDEO' && (
                    <div className="max-w-5xl mx-auto space-y-12">
                        
                        {/* Video Upload Guide */}
                        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border-2 border-rose-500/20 rounded-[2.5rem] p-10 relative overflow-hidden shadow-2xl group">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-[100px] pointer-events-none -mr-20 -mt-20"></div>
                            <h3 className="text-xl font-black text-white uppercase tracking-widest mb-10 flex items-center gap-3">
                                <Youtube size={24} className="text-red-500"/> Video Yükleme Rehberi
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
                                {[
                                    { icon: Youtube, title: '1. YouTube\'a Yükle', desc: 'Hazırladığınız filmi kendi kanalınıza yükleyin.' },
                                    { icon: Lock, title: '2. Liste Dışı Yap', desc: 'Gizlilik ayarını "Liste Dışı" (Unlisted) olarak seçin.' },
                                    { icon: Copy, title: '3. Linki Kopyala', desc: 'Videonun izleme bağlantısını (URL) kopyalayın.' },
                                    { icon: CheckCircle2, title: '4. Panale Yapıştır', desc: 'Linki aşağıya yapıştırıp onaylayın.' }
                                ].map((step, i) => (
                                    <div key={i} className="flex flex-col items-center text-center group/item hover:-translate-y-1 transition-transform duration-300">
                                        <div className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center mb-6 border-2 border-slate-700 group-hover/item:border-rose-500 group-hover/item:bg-slate-900 transition-all shadow-xl">
                                            <step.icon size={32} className="text-slate-400 group-hover/item:text-rose-400 transition-colors" />
                                        </div>
                                        <h4 className="text-white font-bold text-lg mb-2">{step.title}</h4>
                                        <p className="text-sm text-slate-400 leading-relaxed font-light max-w-[200px]">{step.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Submission Form */}
                        <div className="relative bg-black rounded-[2rem] border-4 border-slate-800 shadow-2xl overflow-hidden group">
                            {/* Curtain Effect */}
                            <div className="absolute top-0 left-0 w-12 h-full bg-gradient-to-r from-red-950 to-transparent opacity-50 z-10"></div>
                            <div className="absolute top-0 right-0 w-12 h-full bg-gradient-to-l from-red-950 to-transparent opacity-50 z-10"></div>
                            
                            <div className="p-12 md:p-16 flex flex-col items-center justify-center text-center relative z-20">
                                <div className="w-24 h-24 bg-rose-600 rounded-full flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(225,29,72,0.5)] animate-pulse">
                                    <Film size={40} className="text-white"/>
                                </div>
                                <h3 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">Final Sahnesi</h3>
                                <p className="text-xl text-slate-400 mb-10 max-w-2xl leading-relaxed">
                                    Filminizi jüriyle buluşturmak için YouTube linkini aşağıya giriniz.
                                </p>

                                <div className="w-full max-w-2xl bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-8 text-left">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 border-b border-slate-800 pb-2">Yönetmen Kontrol Listesi</h4>
                                    
                                    <div className="mb-6">
                                        <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">YouTube Video Linki</label>
                                        <div className="flex gap-2">
                                            <input 
                                                value={videoLink}
                                                onChange={(e) => setVideoLink(e.target.value)}
                                                placeholder="https://youtu.be/..." 
                                                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl p-4 text-white focus:border-rose-500 outline-none text-sm transition-colors"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {[
                                            { id: 'resolution', label: '1080p Çözünürlük (FHD)' },
                                            { id: 'audio', label: 'Ses Dili: İngilizce' },
                                            { id: 'credits', label: 'Türkçe Altyazı & Jenerik' },
                                            { id: 'copyright', label: 'Telif Hakkı İhlali Yok' }
                                        ].map(item => (
                                            <div 
                                                key={item.id} 
                                                onClick={() => setVideoChecklist(prev => ({...prev, [item.id]: !prev[item.id as keyof typeof videoChecklist]}))}
                                                className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer border transition-all ${videoChecklist[item.id as keyof typeof videoChecklist] ? 'bg-green-900/20 border-green-500/50' : 'bg-slate-950 border-slate-800 hover:border-slate-600'}`}
                                            >
                                                <div className={`w-6 h-6 rounded flex items-center justify-center border transition-colors ${videoChecklist[item.id as keyof typeof videoChecklist] ? 'bg-green-500 border-green-500' : 'border-slate-600'}`}>
                                                    {videoChecklist[item.id as keyof typeof videoChecklist] && <CheckSquare size={16} className="text-white" />}
                                                </div>
                                                <span className={`font-bold ${videoChecklist[item.id as keyof typeof videoChecklist] ? 'text-white' : 'text-slate-400'}`}>{item.label}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <button 
                                        onClick={confirmVideoSubmission} 
                                        disabled={!allVideoChecksPassed}
                                        className={`w-full mt-8 py-5 rounded-xl font-black text-lg uppercase tracking-wider shadow-xl transition-all ${allVideoChecksPassed ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/30 hover:-translate-y-1' : 'bg-slate-800 text-slate-600 cursor-not-allowed'}`}
                                    >
                                        {currentApplication.team.videoStatus === 'SUBMITTED_LINK' ? 'Linki Güncelle' : allVideoChecksPassed ? 'Teslimi Onayla ve Bitir' : 'Listeyi Tamamlayın'}
                                    </button>
                                    
                                    {currentApplication.team.videoStatus === 'SUBMITTED_LINK' && (
                                        <p className="mt-4 text-center text-xs text-green-500 font-bold flex items-center justify-center gap-2">
                                            <CheckCircle2 size={14}/> Video linki başarıyla teslim edildi.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'CHAT' && (
                    <div className="max-w-4xl mx-auto"><ChatArea appId={currentApplication.id} /></div>
                )}

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
                            <button onClick={() => setDeclarationModal(null)} className="text-slate-500 hover:text-white transition-colors">
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
                            <button onClick={() => setDeclarationModal(null)} className="px-6 py-3 rounded-xl text-slate-400 hover:text-white font-bold text-sm transition-colors">İptal</button>
                            <button 
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
                                Büyük bir emeğin ürününü teslim ettiğiniz için teşekkür ederiz. Artık arkanıza yaslanıp gala gününü bekleyebilirsiniz.
                            </p>

                            <button 
                                onClick={() => setShowVideoSuccessModal(false)}
                                className="bg-white text-slate-900 hover:bg-slate-200 px-10 py-4 rounded-xl font-black text-lg shadow-xl hover:-translate-y-1 transition-all"
                            >
                                Harika!
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Student Edit Modal */}
            {isStudentModalOpen && editingStudent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-slate-900 w-full max-w-md rounded-2xl border border-slate-700 shadow-2xl p-8 relative">
                        <button onClick={() => setIsStudentModalOpen(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white">
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
                            <button 
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
    );
};
