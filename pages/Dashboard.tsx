
import React, { useState, useEffect, useRef } from 'react';
import { 
    Clapperboard, Users, FileText, Video, MessageSquare, AlertCircle, 
    CheckCircle2, Clock, Upload, X, Save, Film, HelpCircle, LogOut, Ban, ShieldAlert,
    Download, Lock, ExternalLink, RefreshCw, FileCheck, BookOpen, Eye, Calendar, Bell, Copy, Info, Loader2, File,
    Plus, Trash2, Edit, AlertOctagon, CheckSquare, Camera, PenTool, Printer, ShieldCheck,
    Sparkles, ArrowRight, UploadCloud, Megaphone, Star, PartyPopper, User, RefreshCcw
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Category, Theme, ApplicationStatus, Student } from '../types';
import { versesList, verseDetails, VERSE_SPLITTER } from '../data/verses';
import { ChatArea } from '../components/ChatArea';
import { uploadFileToR2, uploadPublicLogo } from '../lib/cloudStorage';
import { CertificateGenerator } from '../components/CertificateGenerator';

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
    if (!app.team.logoUrl) {
        // Logo is usually part of settings, but for now let's assume it's done via settings or not blocking.
        // Skipping logo check for blocking action to focus on docs.
    }
    
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

export const Dashboard: React.FC = () => {
    const { currentUser, currentApplication, createApplication, updateApplication, showToast, systemSettings } = useAppContext();
    const [activeTab, setActiveTab] = useState('STATUS');
    
    // Create App Form State
    const [teamForm, setTeamForm] = useState({
        teamName: '',
        category: Category.LIVE_ACTION,
        theme: Theme.AYET,
        selectedVerse: versesList[0],
        students: [
            { firstName: '', lastName: '', grade: '' },
            { firstName: '', lastName: '', grade: '' },
            { firstName: '', lastName: '', grade: '' }
        ]
    });
    const [formErrors, setFormErrors] = useState<any>({});
    const [isCreating, setIsCreating] = useState(false);

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
    }, [currentApplication?.id]);

    // Progress Calculation
    const calculateProgress = () => {
        if (!currentApplication) return 0;
        const students = currentApplication.team.students;
        const totalDocs = students.length * 2;
        const uploadedDocs = students.reduce((acc, s) => acc + (s.hasParentalConsent ? 1 : 0) + (s.hasKvkkConsent ? 1 : 0), 0);
        const hasLogo = currentApplication.team.logoUrl ? 1 : 0;
        const hasVideo = currentApplication.team.videoStatus !== 'PENDING' ? 1 : 0;
        
        const totalItems = totalDocs + 2; // Docs + Logo + Video
        const completedItems = uploadedDocs + hasLogo + hasVideo;
        
        // Avoid division by zero
        if(totalItems === 0) return 0;
        
        return Math.round((completedItems / totalItems) * 100);
    };

    const isVideoTime = () => {
        const now = new Date();
        const start = new Date(systemSettings.dates.videoUploadStart);
        const end = new Date(systemSettings.dates.videoUploadEnd);
        return now >= start && now <= end && systemSettings.features.videoUploadActive;
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
        const inputId = `file-input-${declarationModal.studentId}-${declarationModal.type}`;
        const inputElement = document.getElementById(inputId);
        if (inputElement) { inputElement.click(); }
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
                    return type === 'PARENT' ? { ...s, hasParentalConsent: true, parentalConsentUrl: r2Key, docStatus: 'PENDING' } : { ...s, hasKvkkConsent: true, kvkkConsentUrl: r2Key, docStatus: 'PENDING' };
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
                    return { ...s, hasParentalConsent: false, parentalConsentUrl: undefined, docStatus: undefined };
                } else {
                    return { ...s, hasKvkkConsent: false, kvkkConsentUrl: undefined, docStatus: undefined };
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
        try {
            const updated = { 
                ...currentApplication, 
                team: { ...currentApplication.team, videoStatus: 'SUBMITTED_LINK' as const },
                status: ApplicationStatus.FINAL_SUBMITTED 
            };
            await updateApplication(updated);
            showToast("Video teslim edildi!", 'success');
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
    if (!currentApplication) {
        const handleCreateSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            if(!validateCreate()) return;
            setIsCreating(true);
            try { await createApplication(teamForm); } catch (e: any) { showToast(e.message, 'error'); } finally { setIsCreating(false); }
        };
        const validateCreate = () => {
            const errs: any = {};
            if(!teamForm.teamName) errs.teamName = "Takım adı gereklidir.";
            if(teamForm.students.some(s => !s.firstName || !s.lastName || !s.grade)) errs.students = "Tüm öğrenci bilgileri doldurulmalıdır.";
            setFormErrors(errs);
            return Object.keys(errs).length === 0;
        };

        return (
            <div className="max-w-4xl mx-auto px-4 py-12 animate-fadeIn min-h-screen flex items-center">
                <div className="w-full bg-slate-900 border border-slate-700 rounded-[2rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-[80px] pointer-events-none -mr-20 -mt-20"></div>
                    <h2 className="text-3xl md:text-4xl font-black text-white mb-8 flex items-center gap-4">
                        <Clapperboard className="text-rose-500" size={40}/> Prodüksiyonu Başlat
                    </h2>
                    <form onSubmit={handleCreateSubmit} className="space-y-8 relative z-10">
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
    const allVideoChecksPassed = videoChecklist.resolution && videoChecklist.audio && videoChecklist.credits && videoChecklist.copyright;
    const missingDocsCount = getMissingDocsCount();
    const remainingDays = getRemainingDays();

    return (
        <div className="bg-slate-950 min-h-screen text-slate-200 font-sans pb-24 relative overflow-x-hidden">
            {/* Background Texture */}
            <div className="fixed inset-0 pointer-events-none z-[0] opacity-[0.03] mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>

            {/* --- HERO SECTION: Director's Cut Style --- */}
            <div className="relative pt-8 pb-12 bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {/* Top Bar: Identity */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                        <div className="flex items-center gap-6">
                            <div className="relative group">
                                <div className="absolute inset-0 bg-rose-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                                {currentApplication.team.logoUrl ? (
                                    <img src={currentApplication.team.logoUrl} className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-700 relative z-10 shadow-2xl" alt="Logo" />
                                ) : (
                                    <div className="w-20 h-20 rounded-2xl bg-slate-800 border-2 border-slate-700 flex items-center justify-center relative z-10 text-slate-500">
                                        <Camera size={32} />
                                    </div>
                                )}
                            </div>
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
                            <div className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 shadow-xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity"><BookOpen size={100} /></div>
                                <h3 className="font-bold text-white mb-6 flex items-center gap-3 text-lg"><Info size={22} className="text-teal-500"/> Proje Teması</h3>
                                <div className="space-y-6 relative z-10">
                                    <div className="flex justify-between border-b border-slate-800 pb-4">
                                        <span className="text-slate-500 font-medium">Seçilen Tema</span>
                                        <span className="text-white font-bold text-lg">{currentApplication.team.theme}</span>
                                    </div>
                                    {currentApplication.team.theme === Theme.AYET && currentApplication.team.selectedVerse && verseDetails[currentApplication.team.selectedVerse] && (
                                        <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl space-y-4 shadow-inner">
                                            <p className="text-right text-2xl font-serif text-amber-400 leading-loose" dir="rtl">{renderVerseText(verseDetails[currentApplication.team.selectedVerse].arabic, true)}</p>
                                            <div className="w-full h-px bg-slate-800"></div>
                                            <p className="text-sm text-slate-300 italic leading-relaxed">"{renderVerseText(verseDetails[currentApplication.team.selectedVerse].turkish, false)}"</p>
                                        </div>
                                    )}
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

                {/* 2. DOCUMENTS TAB (Cast & Crew) - REDESIGNED */}
                {activeTab === 'DOCUMENTS' && (
                    <div className="space-y-12">
                        
                        {/* Guide Section */}
                        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-slate-800 rounded-full blur-[80px] pointer-events-none -mr-20 -mt-20"></div>
                            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-8 flex items-center gap-2">
                                <Info size={16} className="text-blue-500"/> Belge Yükleme Rehberi
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
                                {[
                                    { icon: RefreshCw, title: '1. Kodu Oluştur', desc: 'Sistemden her belge için benzersiz kod üret.' },
                                    { icon: PenTool, title: '2. Belgeye Yaz', desc: 'Kodu çıktısını aldığın belgenin üzerine el yazısıyla yaz.' },
                                    { icon: Camera, title: '3. Fotoğraf/PDF', desc: 'İmzalı ve kodlu belgenin fotoğrafını çek veya tarat.' },
                                    { icon: Upload, title: '4. Sisteme Yükle', desc: 'Beyanı onayla ve dosyayı yükle.' }
                                ].map((step, i) => (
                                    <div key={i} className="text-center group">
                                        <div className="w-14 h-14 mx-auto bg-slate-800 rounded-2xl flex items-center justify-center mb-4 border border-slate-700 group-hover:border-blue-500/50 group-hover:bg-slate-900 transition-all shadow-lg">
                                            <step.icon size={24} className="text-slate-400 group-hover:text-blue-400 transition-colors" />
                                        </div>
                                        <h4 className="text-white font-bold text-sm mb-1">{step.title}</h4>
                                        <p className="text-[10px] text-slate-500 max-w-[150px] mx-auto leading-relaxed">{step.desc}</p>
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
                            {currentApplication.team.students.map((student) => (
                                <div key={student.id} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
                                    
                                    {/* Student Header */}
                                    <div className="p-6 pb-4 flex justify-between items-start">
                                        <div>
                                            <h4 className="font-black text-white text-xl leading-tight">{student.firstName} {student.lastName}</h4>
                                            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">{student.grade}</span>
                                        </div>
                                        {/* Actions */}
                                        <div className="flex gap-1">
                                            {/* Edit/Delete can be here if needed */}
                                        </div>
                                    </div>

                                    {/* Documents Sections */}
                                    <div className="px-6 pb-6 space-y-4">
                                        {/* 1. Parent Consent */}
                                        <div className="bg-slate-950/50 rounded-2xl border border-dashed border-slate-800 p-5 relative group/section hover:border-slate-700 transition-colors">
                                            <div className="flex justify-between items-center mb-4">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">VELİ İZİN BELGESİ</span>
                                                {student.hasParentalConsent && (
                                                    <div className="flex items-center gap-1 bg-green-900/20 text-green-500 text-[10px] font-bold px-2 py-1 rounded border border-green-900/50">
                                                        <CheckSquare size={12}/> TESLİM EDİLDİ
                                                    </div>
                                                )}
                                            </div>

                                            {student.hasParentalConsent ? (
                                                <div className="text-center py-4">
                                                    <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-2 text-green-500">
                                                        <CheckCircle2 size={24} />
                                                    </div>
                                                    <p className="text-xs text-green-400 font-bold">Belge Geçerli</p>
                                                    <button onClick={() => handleDeleteDoc(student.id, 'PARENT')} className="mt-4 text-[10px] text-red-400 hover:text-red-300 flex items-center justify-center gap-1 w-full py-2 hover:bg-red-900/10 rounded transition-colors">
                                                        <Trash2 size={12}/> Sil ve Yeniden Yükle
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
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
                                                                    maxLength={5}
                                                                />
                                                            </div>

                                                            <input type="file" id={`file-input-${student.id}-PARENT`} className="hidden" accept=".pdf" onChange={(e) => handleFileSelect(e, `${student.id}_PARENT`)} />
                                                            
                                                            <button 
                                                                onClick={() => handleOpenDeclarationModal(student.id, 'PARENT')}
                                                                className="w-full py-3 border border-slate-700 hover:border-slate-500 border-dashed rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-all flex items-center justify-center gap-2 group/btn"
                                                            >
                                                                {uploadingDoc === `${student.id}_PARENT` ? <Loader2 className="animate-spin" size={14}/> : <UploadCloud size={14} className="group-hover/btn:text-rose-500 transition-colors"/>} 
                                                                {selectedFiles[`${student.id}_PARENT`] ? 'Dosya Seçildi - Yükle' : 'BELGEYİ SEÇ & YÜKLE'}
                                                            </button>
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
                                                    <div className="flex items-center gap-1 bg-green-900/20 text-green-500 text-[10px] font-bold px-2 py-1 rounded border border-green-900/50">
                                                        <CheckSquare size={12}/> TESLİM EDİLDİ
                                                    </div>
                                                )}
                                            </div>

                                            {student.hasKvkkConsent ? (
                                                <div className="text-center py-4">
                                                    <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-2 text-green-500">
                                                        <CheckCircle2 size={24} />
                                                    </div>
                                                    <p className="text-xs text-green-400 font-bold">Belge Geçerli</p>
                                                    <button onClick={() => handleDeleteDoc(student.id, 'KVKK')} className="mt-4 text-[10px] text-red-400 hover:text-red-300 flex items-center justify-center gap-1 w-full py-2 hover:bg-red-900/10 rounded transition-colors">
                                                        <Trash2 size={12}/> Sil ve Yeniden Yükle
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
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
                                                                    maxLength={5}
                                                                />
                                                            </div>

                                                            <input type="file" id={`file-input-${student.id}-KVKK`} className="hidden" accept=".pdf" onChange={(e) => handleFileSelect(e, `${student.id}_KVKK`)} />
                                                            
                                                            <button 
                                                                onClick={() => handleOpenDeclarationModal(student.id, 'KVKK')}
                                                                className="w-full py-3 border border-slate-700 hover:border-slate-500 border-dashed rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-all flex items-center justify-center gap-2 group/btn"
                                                            >
                                                                {uploadingDoc === `${student.id}_KVKK` ? <Loader2 className="animate-spin" size={14}/> : <UploadCloud size={14} className="group-hover/btn:text-rose-500 transition-colors"/>} 
                                                                {selectedFiles[`${student.id}_KVKK`] ? 'Dosya Seçildi - Yükle' : 'BELGEYİ SEÇ & YÜKLE'}
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
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

                {/* 3. VIDEO TAB (Cinema Room) */}
                {activeTab === 'VIDEO' && (
                    <div className="max-w-5xl mx-auto">
                        {!isVideoTime() ? (
                            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-16 shadow-2xl text-center flex flex-col items-center relative overflow-hidden">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-5 pointer-events-none"></div>
                                <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mb-8 border border-slate-700 shadow-inner relative z-10">
                                    <Lock size={40} className="text-slate-500" />
                                </div>
                                <h3 className="text-3xl font-black text-white mb-4 relative z-10">Sinema Salonu Kapalı</h3>
                                <p className="text-slate-400 max-w-sm leading-relaxed font-light relative z-10">
                                    Video teslim süreci <strong>{new Date(systemSettings.dates.videoUploadStart).toLocaleDateString('tr-TR')}</strong> tarihinde başlayacaktır.
                                </p>
                            </div>
                        ) : (
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
                                        Filminizi Google Drive'a yükleyin, bağlantıyı alın ve aşağıdaki adımları tamamlayarak galaya adınızı yazdırın.
                                    </p>

                                    <a href="https://drive.google.com/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-3 bg-white text-black px-8 py-4 rounded-xl font-black text-lg hover:bg-slate-200 transition-all shadow-xl hover:-translate-y-1 mb-12">
                                        <ExternalLink size={20}/> Drive'a Git
                                    </a>

                                    <div className="w-full max-w-2xl bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-8 text-left">
                                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 border-b border-slate-800 pb-2">Yönetmen Kontrol Listesi</h4>
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
                                            {allVideoChecksPassed ? 'Teslimi Onayla ve Bitir' : 'Listeyi Tamamlayın'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
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
                                Onaylıyorum ve Dosya Seç
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
