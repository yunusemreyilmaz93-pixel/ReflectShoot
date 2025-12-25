import React, { useState, useEffect, useRef } from 'react';
import { 
    Clapperboard, Users, FileText, Video, MessageSquare, AlertCircle, 
    CheckCircle2, Clock, Upload, X, Save, Film, HelpCircle, LogOut, Ban, ShieldAlert,
    Download, Lock, ExternalLink, RefreshCw, FileCheck, BookOpen, Eye, Calendar, Bell, Copy, Info, Loader2, File,
    Plus, Trash2, Edit, AlertOctagon, CheckSquare, Camera, PenTool, Printer, ShieldCheck
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

// Circular Progress Component
const ProgressRing = ({ progress, size = 60, stroke = 4 }: { progress: number, size?: number, stroke?: number }) => {
    const radius = (size / 2) - stroke;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="transform -rotate-90">
                <circle cx={size/2} cy={size/2} r={radius} stroke="currentColor" strokeWidth={stroke} fill="transparent" className="text-slate-800" />
                <circle 
                    cx={size/2} cy={size/2} r={radius} stroke="currentColor" strokeWidth={stroke} fill="transparent" 
                    strokeDasharray={circumference}
                    style={{ strokeDashoffset: offset, transition: 'stroke-dashoffset 1s ease-in-out' }}
                    strokeLinecap="round"
                    className="text-rose-500" 
                />
            </svg>
            <span className="absolute text-[10px] font-black text-white">{progress}%</span>
        </div>
    );
};

// Process Steps Visual Component
const ProcessSteps = () => (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><Printer size={100} /></div>
        <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
            <Info size={16} className="text-blue-500" /> Belge Yükleme Rehberi
        </h4>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 relative z-10">
            {[
                { icon: RefreshCw, title: "1. Kodu Oluştur", desc: "Sistemden her belge için benzersiz kod üret." },
                { icon: PenTool, title: "2. Belgeye Yaz", desc: "Kodu çıktısını aldığın belgenin üzerine el yazısıyla yaz." },
                { icon: Camera, title: "3. Fotoğraf/PDF", desc: "İmzalı ve kodlu belgenin fotoğrafını çek veya tarat." },
                { icon: Upload, title: "4. Sisteme Yükle", desc: "Beyanı onayla ve dosyayı yükle." }
            ].map((step, i) => (
                <div key={i} className="flex flex-col items-center text-center group w-full md:w-1/4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-400 group-hover:text-amber-500 group-hover:border-amber-500/50 transition-all mb-3 shadow-lg">
                        <step.icon size={20} />
                    </div>
                    <h5 className="text-xs font-black text-white mb-1">{step.title}</h5>
                    <p className="text-[10px] text-slate-500 leading-tight px-2">{step.desc}</p>
                    {i < 3 && <div className="hidden md:block absolute top-6 w-8 h-0.5 bg-slate-800 -right-4 transform translate-x-1/2"></div>} 
                </div>
            ))}
        </div>
    </div>
);

export const Dashboard: React.FC = () => {
    const { currentUser, currentApplication, createApplication, updateApplication, showToast, systemSettings } = useAppContext();
    const [activeTab, setActiveTab] = useState('STATUS');
    
    // UI States
    const [isGrainEnabled] = useState(true);

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
    
    // -- NEW: Declaration Modal State --
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
        
        const totalItems = totalDocs + 2;
        const completedItems = uploadedDocs + hasLogo + hasVideo;
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

    // --- Student Management Logic ---

    const handleOpenStudentModal = (student?: Student) => {
        if (student) {
            setEditingStudent(student);
        } else {
            // New Student
            setEditingStudent({ firstName: '', lastName: '', grade: '' });
        }
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
            // Update existing
            updatedStudents = updatedStudents.map(s => s.id === editingStudent.id ? { ...s, ...editingStudent } as Student : s);
        } else {
            // Add new
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
            showToast("Öğrenci listesi güncellendi.", "success");
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
        if (!window.confirm("Bu öğrenciyi takımdan çıkarmak istediğinize emin misiniz? Yüklenen belgeler de silinecektir.")) return;

        const updatedStudents = currentApplication.team.students.filter(s => s.id !== studentId);
        try {
            await updateApplication({ ...currentApplication, team: { ...currentApplication.team, students: updatedStudents } });
            showToast("Öğrenci çıkarıldı.", "success");
        } catch (e) {
            showToast("Silme işlemi başarısız.", "error");
        }
    };

    // --- Code Generation & Upload Logic ---

    const handleGenerateCode = async (studentId: string, type: 'PARENT' | 'KVKK') => {
        if (!currentApplication) return;
        
        const generateRandomString = () => {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let res = '';
            for (let i = 0; i < 5; i++) {
                res += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return res;
        };

        const prefix = type === 'PARENT' ? 'RFS-VI-' : 'RFS-AR-';
        let newCode = prefix + generateRandomString();

        const isCodeTaken = currentApplication.team.students.some(s => 
            s.parentalExpectedId === newCode || s.kvkkExpectedId === newCode
        );

        if (isCodeTaken) {
            handleGenerateCode(studentId, type);
            return;
        }

        const updatedStudents = currentApplication.team.students.map(s => {
            if (s.id === studentId) {
                return type === 'PARENT' ? { ...s, parentalExpectedId: newCode } : { ...s, kvkkExpectedId: newCode };
            }
            return s;
        });

        try {
            await updateApplication({ ...currentApplication, team: { ...currentApplication.team, students: updatedStudents } });
            showToast("Belge onay kodu oluşturuldu.", 'success');
        } catch (e) {
            showToast("Kod oluşturulurken bir hata oluştu.", 'error');
        }
    };

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        showToast("Kod kopyalandı!", 'success');
    };

    if (currentApplication?.status === ApplicationStatus.DISQUALIFIED) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center animate-fadeIn relative overflow-hidden">
                {/* Disqualified UI remains the same */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-red-900/10 blur-[150px] rounded-full pointer-events-none"></div>
                <div className="relative z-10 max-w-lg w-full bg-slate-900/80 backdrop-blur-xl border border-red-900/30 p-10 rounded-3xl shadow-2xl flex flex-col items-center">
                    <div className="relative mb-8">
                        <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full animate-pulse"></div>
                        <div className="relative w-24 h-24 bg-slate-950 border border-red-500/50 rounded-full flex items-center justify-center shadow-2xl">
                            <Ban size={48} className="text-red-500" />
                        </div>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">Erişim Engellendi</h1>
                    <p className="text-lg text-slate-300 mb-8 leading-relaxed font-light">Üzgünüz, yarışmamıza katılım sağlamanız mümkün değildir.</p>
                    <div className="bg-red-950/30 border border-red-900/50 p-5 rounded-2xl flex items-start gap-4 text-left w-full">
                        <ShieldAlert className="text-red-500 flex-shrink-0 mt-1" size={24} />
                        <div>
                            <strong className="text-red-400 block mb-1 text-sm font-bold uppercase tracking-wider">DİSKALİFİYE EDİLDİ</strong>
                            <p className="text-xs text-red-200/70 leading-relaxed">
                                Yarışma kurallarına aykırı durumlar tespit edildiği için <strong>{currentApplication.team.name}</strong> takımının kaydı dondurulmuştur. Bu panel üzerinden işlem yapılamaz.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

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

    // --- New Responsibility Logic ---

    const handleOpenDeclarationModal = (studentId: string, type: 'PARENT' | 'KVKK') => {
        setDeclarationModal({ studentId, type });
        setDeclarationAccepted(false);
    };

    const handleConfirmDeclaration = () => {
        if (!declarationModal) return;
        // Trigger the hidden input
        const inputId = `file-input-${declarationModal.studentId}-${declarationModal.type}`;
        const inputElement = document.getElementById(inputId);
        if (inputElement) {
            inputElement.click();
        }
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
        
        if(!file || !currentApplication) {
            showToast("Lütfen bir dosya seçiniz.", 'error');
            return;
        }
        
        const enteredCode = (verifyCodes[keyMap] || '').trim().toUpperCase();
        const student = currentApplication.team.students.find(s => s.id === studentId);
        const expectedCode = type === 'PARENT' ? student?.parentalExpectedId : student?.kvkkExpectedId;
        
        if (!expectedCode) { showToast("Lütfen önce bu belge için bir kod oluşturun.", 'error'); return; }
        if (enteredCode !== expectedCode) { showToast("Kod uyuşmuyor! Lütfen belgeye yazdığınız kodu kontrol edin.", 'error'); return; }

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
            
            // Cleanup
            setSelectedFiles(prev => {
                const newState = { ...prev };
                delete newState[keyMap];
                return newState;
            });
            setVerifyCodes(prev => ({ ...prev, [keyMap]: '' }));
            
            showToast("Belge başarıyla yüklendi.", 'success');
        } catch(err: any) { 
            showToast("Hata: " + err.message, 'error'); 
        } finally { 
            setUploadingDoc(null);
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
            showToast("Video teslimi başarıyla tamamlandı. Yönetici onayı bekleniyor.", 'success');
        } catch (error) {
            showToast("Video teslimi sırasında bir hata oluştu.", 'error');
        }
    };

    const allVideoChecksPassed = videoChecklist.resolution && videoChecklist.audio && videoChecklist.credits && videoChecklist.copyright;

    if (!currentApplication) {
        // ... (existing Create App UI) ...
        return (
            <div className="max-w-4xl mx-auto px-4 py-12 animate-fadeIn">
                <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 shadow-2xl">
                    <h2 className="text-3xl font-black text-white mb-6 flex items-center gap-3">
                        <Clapperboard className="text-rose-500" size={32}/> Takımını Kur
                    </h2>
                    <form onSubmit={handleCreateSubmit} className="space-y-8">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-400 mb-2">Takım Adı</label>
                                <input name="teamName" value={teamForm.teamName} onChange={(e) => setTeamForm({...teamForm, teamName: e.target.value})} maxLength={40} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-rose-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-400 mb-2">Kategori</label>
                                <select name="category" value={teamForm.category} onChange={(e) => setTeamForm({...teamForm, category: e.target.value as Category})} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-rose-500 outline-none">
                                    {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>
                        <button type="submit" disabled={isCreating} className="w-full bg-rose-600 hover:bg-rose-500 text-white py-4 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2">
                            {isCreating ? 'Oluşturuluyor...' : 'Takımı Oluştur ve Başvur'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    const progress = calculateProgress();

    return (
        <div className="bg-slate-950 min-h-screen text-slate-200 font-sans pb-20 relative">
            {/* Cinematic Grain Effect */}
            {isGrainEnabled && (
                <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.03] mix-blend-overlay" 
                     style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }}></div>
            )}

            {/* Header */}
            <div className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-4">
                                {currentApplication.team.logoUrl && (
                                    <img src={currentApplication.team.logoUrl} className="w-12 h-12 rounded-lg object-cover border border-slate-700 shadow-lg" alt="Logo" />
                                )}
                                <div>
                                    <h1 className="text-2xl font-black text-white leading-tight flex items-center gap-3">
                                        {currentApplication.team.name}
                                        {progress === 100 && <CheckCircle2 className="text-green-500" size={20}/>}
                                    </h1>
                                    <p className="text-slate-400 text-sm flex items-center gap-2">
                                        {currentApplication.teacher.school} <span className="w-1 h-1 rounded-full bg-slate-600"></span> {currentApplication.team.category}
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <div className="bg-slate-800 border border-slate-700 px-6 py-2 rounded-xl text-center hidden sm:flex flex-col items-center justify-center gap-1.5">
                                <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest">Hazırlık Oranı</span>
                                <ProgressRing progress={progress} size={44} stroke={4} />
                            </div>
                            <div className={`px-4 py-3 rounded-xl text-xs font-bold text-white uppercase tracking-wider bg-slate-700`}>
                                {currentApplication.status}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-6 mt-8 overflow-x-auto">
                        {['STATUS', 'DOCUMENTS', 'VIDEO', 'CHAT'].map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-3 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${activeTab === tab ? 'text-rose-500 border-rose-500' : 'text-slate-400 border-transparent hover:text-white'}`}>
                                {tab === 'STATUS' ? 'Genel Bakış' : tab === 'DOCUMENTS' ? 'Belgeler & Takım' : tab === 'VIDEO' ? 'Video Teslim' : 'İletişim'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
                
                {/* ... (STATUS TAB IS THE SAME) ... */}
                {activeTab === 'STATUS' && (
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
                                <h3 className="font-bold text-white mb-6 flex items-center gap-2"><HelpCircle size={20} className="text-teal-500"/> Proje Künyesi</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between border-b border-slate-800 pb-3">
                                        <span className="text-slate-500 text-sm">Tema</span>
                                        <span className="text-white text-sm font-bold">{currentApplication.team.theme}</span>
                                    </div>
                                    {currentApplication.team.theme === Theme.AYET && currentApplication.team.selectedVerse && verseDetails[currentApplication.team.selectedVerse] && (
                                        <div className="mt-4 p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-4 shadow-inner">
                                            <p className="text-right text-2xl font-serif text-amber-400 leading-loose" dir="rtl">{renderVerseText(verseDetails[currentApplication.team.selectedVerse].arabic, true)}</p>
                                            <p className="text-sm text-slate-300 italic">"{renderVerseText(verseDetails[currentApplication.team.selectedVerse].turkish, false)}"</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Team Calendar / Reminders */}
                            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl overflow-hidden relative group">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Calendar size={80}/></div>
                                <h3 className="font-bold text-white mb-6 flex items-center gap-2"><Bell size={20} className="text-amber-500"/> Hatırlatıcılar</h3>
                                <div className="space-y-4">
                                    <div className="p-4 bg-rose-900/10 border border-rose-500/20 rounded-xl flex gap-3">
                                        <div className="w-10 h-10 bg-rose-500/20 rounded-lg flex items-center justify-center flex-shrink-0"><Clock className="text-rose-500" size={20}/></div>
                                        <div>
                                            <p className="text-sm font-bold text-rose-200">Video Teslimi İçin Son Günler</p>
                                            <p className="text-xs text-slate-500">20 Mart tarihine kadar videonuzu yüklediğinizden emin olun.</p>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-teal-900/10 border border-teal-500/20 rounded-xl flex gap-3">
                                        <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center flex-shrink-0"><FileCheck className="text-teal-500" size={20}/></div>
                                        <div>
                                            <p className="text-sm font-bold text-teal-200">Belge Onayları</p>
                                            <p className="text-xs text-slate-500">Tüm öğrencilerin belgelerini sisteme girmeyi unutmayın. (%{progress})</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
                            <h3 className="font-bold text-white mb-6 flex items-center gap-2"><Clock size={20} className="text-blue-500"/> Süreç Takibi</h3>
                            <div className="space-y-8 relative pl-6 border-l-2 border-slate-800 ml-3 animate-slideDown">
                                {[
                                    { label: 'Başvuru Oluşturuldu', done: true, date: new Date(currentApplication.submittedAt).toLocaleDateString() },
                                    { label: 'Belgeler Tamamlandı', done: currentApplication.team.students.every(s => s.hasParentalConsent && s.hasKvkkConsent) },
                                    { label: 'Video Teslim Edildi', done: currentApplication.team.videoStatus !== 'PENDING' },
                                    { label: 'Ön Eleme Sonucu', done: currentApplication.team.isPreliminaryStageComplete },
                                    { label: 'Gala Gecesi', done: false }
                                ].map((step, i) => (
                                    <div key={i} className="relative">
                                        <div className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-4 shadow-lg transition-colors duration-500 ${step.done ? 'bg-green-500 border-slate-900' : 'bg-slate-800 border-slate-900'}`}></div>
                                        <p className={`text-sm font-bold ${step.done ? 'text-white' : 'text-slate-500'}`}>{step.label}</p>
                                        {step.date && <p className="text-[10px] text-slate-600 mt-1">{step.date}</p>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'DOCUMENTS' && (
                    <div className="space-y-8">
                        <ProcessSteps />

                        {/* Template Download Section */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <a href={TEMPLATE_PARENT_URL} target="_blank" className="flex items-center justify-between p-6 bg-slate-900 border border-slate-800 rounded-3xl hover:border-amber-500/50 transition-all group shadow-xl">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500 border border-amber-500/20">
                                        <Download size={24} />
                                    </div>
                                    <div>
                                        <p className="text-lg font-black text-white leading-tight">Veli İzin Belgesi</p>
                                        <p className="text-xs text-slate-500 mt-1">İndir, yazdır ve veliye imzalat.</p>
                                    </div>
                                </div>
                                <ExternalLink size={20} className="text-slate-700 group-hover:text-amber-500 transition-colors" />
                            </a>
                            <a href={TEMPLATE_CONSENT_URL} target="_blank" className="flex items-center justify-between p-6 bg-slate-900 border border-slate-800 rounded-3xl hover:border-teal-500/50 transition-all group shadow-xl">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-teal-500/10 rounded-2xl text-teal-500 border border-teal-500/20">
                                        <Download size={24} />
                                    </div>
                                    <div>
                                        <p className="text-lg font-black text-white leading-tight">KVKK Açık Rıza Metni</p>
                                        <p className="text-xs text-slate-500 mt-1">İndir, yazdır ve imzalat.</p>
                                    </div>
                                </div>
                                <ExternalLink size={20} className="text-slate-700 group-hover:text-teal-500 transition-colors" />
                            </a>
                        </div>

                        {/* Students Grid */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {currentApplication.team.students.map((student) => (
                                <div key={student.id} className="bg-slate-900 p-6 rounded-3xl border border-slate-800 group hover:border-rose-500/50 transition-all shadow-xl flex flex-col relative overflow-hidden">
                                    
                                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleOpenStudentModal(student)} className="p-1.5 bg-slate-800 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700" title="Düzenle">
                                            <Edit size={14} />
                                        </button>
                                        <button onClick={() => handleDeleteStudent(student.id)} className="p-1.5 bg-slate-800 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-700" title="Sil">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>

                                    <div className="flex justify-between items-center mb-6">
                                        <div>
                                            <h4 className="font-black text-white text-xl">{student.firstName} {student.lastName}</h4>
                                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">{student.grade}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-8 flex-1">
                                        {['PARENT', 'KVKK'].map((type) => {
                                            const isDone = type === 'PARENT' ? student.hasParentalConsent : student.hasKvkkConsent;
                                            const code = type === 'PARENT' ? student.parentalExpectedId : student.kvkkExpectedId;
                                            const confirmationKey = `${student.id}_${type}`;
                                            const isUploading = uploadingDoc === confirmationKey;
                                            const selectedFile = selectedFiles[confirmationKey];
                                            const isRejected = student.docStatus === 'REJECTED';
                                            
                                            // Hidden file input ID
                                            const hiddenInputId = `file-input-${student.id}-${type}`;

                                            return (
                                                <div key={type} className="pt-6 border-t border-slate-800 first:border-t-0 first:pt-0">
                                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">
                                                        <span>{type === 'PARENT' ? 'Veli İzin Belgesi' : 'KVKK Metni'}</span>
                                                        {isDone && !isRejected && <span className="bg-green-900/30 text-green-500 px-2 py-1 rounded flex items-center gap-1 border border-green-900/50"><FileCheck size={12}/> Teslim Edildi</span>}
                                                        {isRejected && <span className="bg-red-900/30 text-red-500 px-2 py-1 rounded flex items-center gap-1 border border-red-900/50 animate-pulse"><AlertOctagon size={12}/> Reddedildi</span>}
                                                    </div>

                                                    {isRejected && (
                                                        <div className="bg-red-900/20 border border-red-900/50 p-3 rounded-xl mb-4 text-xs text-red-300 flex gap-2 items-start">
                                                            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                                                            <div>
                                                                <strong>Belge Reddedildi:</strong> Lütfen belgeyi kontrol edip, eksiksiz ve okunaklı olduğundan emin olarak tekrar yükleyiniz.
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 mb-4">
                                                        {!code ? (
                                                            <button 
                                                                onClick={() => handleGenerateCode(student.id, type as any)}
                                                                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-all"
                                                            >
                                                                <RefreshCw size={14} className="text-rose-500"/> Doğrulama Kodu Oluştur
                                                            </button>
                                                        ) : (
                                                            <div className="flex flex-col gap-2">
                                                                <div className="flex flex-col gap-1">
                                                                    <div className="flex items-center justify-between">
                                                                        <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Belgeye Yazılan Kod</span>
                                                                        <button onClick={() => copyCode(code)} className="text-slate-500 hover:text-white transition-colors" title="Kodu Kopyala">
                                                                            <Copy size={14} />
                                                                        </button>
                                                                    </div>
                                                                    <p className="text-[10px] font-bold text-amber-500 leading-tight">Bu kod hem sisteme girilmeli hem de belge üzerinde el yazısıyla yer almalıdır.</p>
                                                                </div>
                                                                <div className="text-center py-2 bg-slate-900 rounded-lg font-mono text-lg font-black text-rose-500 tracking-widest">
                                                                    {code}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {(!isDone || isRejected) && (
                                                        <>
                                                            <div className="flex items-center bg-slate-950 border border-slate-700 rounded-2xl overflow-hidden mb-4 group-focus-within:border-rose-500/50 transition-all">
                                                                <span className="bg-slate-900 px-3 py-3 text-[10px] font-black text-slate-500 border-r border-slate-800">GİR:</span>
                                                                <input 
                                                                    value={verifyCodes[`${student.id}_${type}`] || ''} 
                                                                    onChange={(e) => setVerifyCodes({...verifyCodes, [`${student.id}_${type}`]: e.target.value.toUpperCase()})} 
                                                                    placeholder="Kodu Buraya Yazın" 
                                                                    className="bg-transparent flex-1 p-3 text-xs text-white outline-none font-black tracking-widest placeholder-slate-700" 
                                                                    maxLength={12} 
                                                                />
                                                            </div>

                                                            {isUploading ? (
                                                                <div className="border-2 border-dashed border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 bg-slate-900/50 animate-pulse">
                                                                    <Loader2 className="animate-spin text-rose-500" size={20} />
                                                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Yükleniyor...</span>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    {/* Hidden File Input */}
                                                                    <input 
                                                                        type="file" 
                                                                        id={hiddenInputId}
                                                                        className="hidden" 
                                                                        accept=".pdf" 
                                                                        onChange={(e) => handleFileSelect(e, confirmationKey)} 
                                                                    />

                                                                    <button 
                                                                        onClick={() => handleOpenDeclarationModal(student.id, type as any)}
                                                                        className="block w-full border-2 border-dashed border-slate-800 hover:border-rose-500/30 hover:bg-slate-800/30 rounded-2xl p-4 text-center cursor-pointer transition-all"
                                                                    >
                                                                        <div className="flex flex-col items-center gap-2">
                                                                            {selectedFile ? (
                                                                                <>
                                                                                    <File size={20} className="text-amber-500" />
                                                                                    <span className="text-[10px] font-bold text-white max-w-[150px] truncate">{selectedFile.name}</span>
                                                                                    <span className="text-[9px] text-slate-500">Değiştirmek için tıklayın</span>
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <Upload size={20} className="text-slate-600 group-hover:text-rose-500" />
                                                                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Belgeyi Seç & Yükle</span>
                                                                                </>
                                                                            )}
                                                                        </div>
                                                                    </button>
                                                                    
                                                                    {selectedFile && (
                                                                        <button 
                                                                            onClick={() => handleDocUpload(student.id, type as any)}
                                                                            className="w-full mt-2 bg-rose-600 hover:bg-rose-500 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-rose-900/20"
                                                                        >
                                                                            Yüklemeyi Tamamla
                                                                        </button>
                                                                    )}
                                                                </>
                                                            )}
                                                        </>
                                                    )}

                                                    {isDone && !isRejected && (
                                                        <div className="p-4 bg-green-950/20 border border-green-900/30 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-bold text-green-500 uppercase tracking-widest">
                                                            <CheckCircle2 size={16}/> Belge Geçerli
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}

                            {/* Add Student Button */}
                            {currentApplication.team.students.length < 6 && (
                                <button 
                                    onClick={() => handleOpenStudentModal()}
                                    className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 border-dashed hover:border-rose-500/50 hover:bg-slate-900 transition-all flex flex-col items-center justify-center gap-4 group min-h-[400px]"
                                >
                                    <div className="w-16 h-16 rounded-full bg-slate-800 group-hover:bg-rose-600 group-hover:text-white text-slate-500 flex items-center justify-center transition-colors shadow-lg">
                                        <Plus size={32} />
                                    </div>
                                    <span className="font-bold text-slate-400 group-hover:text-white transition-colors">Yeni Öğrenci Ekle</span>
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'VIDEO' && (
                    <div className="max-w-3xl mx-auto">
                        {!isVideoTime() ? (
                            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-16 shadow-2xl text-center flex flex-col items-center">
                                <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mb-8 border border-slate-700 shadow-inner">
                                    <Lock size={40} className="text-slate-500" />
                                </div>
                                <h3 className="text-3xl font-black text-white mb-4">Video Teslimi Henüz Kapalı</h3>
                                <p className="text-slate-400 max-w-sm leading-relaxed font-light">
                                    Video teslim süreci <strong>{new Date(systemSettings.dates.videoUploadStart).toLocaleDateString('tr-TR')}</strong> tarihinde başlayacaktır.
                                </p>
                                <div className="mt-8 px-6 py-3 bg-rose-900/20 border border-rose-500/20 rounded-full text-xs font-bold text-rose-400 uppercase tracking-widest">
                                    Sistem Beklemede
                                </div>
                            </div>
                        ) : (
                            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-12 shadow-2xl text-center">
                                <div className="w-20 h-20 bg-rose-600/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-8 border border-rose-500/20 shadow-lg shadow-rose-900/10">
                                    <Film size={36}/>
                                </div>
                                <h3 className="text-3xl font-black text-white mb-4">Video Teslim Paneli</h3>
                                <p className="text-slate-400 mb-10 leading-relaxed font-light">Videonuzu ortak klasöre yükledikten sonra aşağıdaki kontrol listesini tamamlayıp onaylayınız.</p>
                                
                                <a href="https://drive.google.com/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-4 bg-white text-slate-900 px-12 py-5 rounded-2xl font-black text-xl hover:bg-slate-200 transition-all shadow-xl mb-10">
                                    <ExternalLink size={24}/> Drive Klasörüne Git
                                </a>

                                {/* Checklist */}
                                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 mb-8 text-left space-y-3">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Teslim Öncesi Kontrol Listesi</h4>
                                    {[
                                        { id: 'resolution', label: 'Video 1080p çözünürlükte render alındı.' },
                                        { id: 'audio', label: 'Ses dili İngilizce ve anlaşılır.' },
                                        { id: 'credits', label: 'Türkçe altyazı ve kapanış jeneriği eklendi.' },
                                        { id: 'copyright', label: 'Telif hakkı içeren materyal kullanılmadı.' }
                                    ].map(item => (
                                        <div key={item.id} 
                                             onClick={() => setVideoChecklist(prev => ({...prev, [item.id]: !prev[item.id as keyof typeof videoChecklist]}))}
                                             className="flex items-center gap-3 cursor-pointer group"
                                        >
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${videoChecklist[item.id as keyof typeof videoChecklist] ? 'bg-green-500 border-green-500' : 'border-slate-700 group-hover:border-slate-500'}`}>
                                                {videoChecklist[item.id as keyof typeof videoChecklist] && <CheckCircle2 size={14} className="text-black" />}
                                            </div>
                                            <span className={`text-sm ${videoChecklist[item.id as keyof typeof videoChecklist] ? 'text-white' : 'text-slate-400'}`}>{item.label}</span>
                                        </div>
                                    ))}
                                </div>

                                <button 
                                    onClick={confirmVideoSubmission} 
                                    disabled={!allVideoChecksPassed}
                                    className={`w-full py-5 rounded-2xl font-black text-lg shadow-lg transition-all ${allVideoChecksPassed ? 'bg-green-600 hover:bg-green-500 text-white shadow-green-900/20' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
                                >
                                    {allVideoChecksPassed ? 'Teslimi Tamamla' : 'Lütfen Kontrol Listesini Onaylayın'}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'CHAT' && (
                    <div className="max-w-4xl mx-auto"><ChatArea appId={currentApplication.id} /></div>
                )}

            </div>

            {/* Responsibility Declaration Modal */}
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
                                "Yüklemekte olduğum bu belgenin; orijinalinin tarafımda saklandığını, üzerindeki bilgilerin ve imzaların gerçek olduğunu, KVKK ve yarışma şartnamesine uygun olduğunu beyan ederim. Olası bir usulsüzlük durumunda tüm hukuki sorumluluğun şahsıma/kurumuma ait olduğunu kabul ediyorum."
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

            {/* Student Edit/Add Modal */}
            {isStudentModalOpen && editingStudent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-slate-900 w-full max-w-md rounded-2xl border border-slate-700 shadow-2xl p-8 relative">
                        <button onClick={() => setIsStudentModalOpen(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white">
                            <X size={20} />
                        </button>
                        <h3 className="text-xl font-bold text-white mb-6">
                            {editingStudent.id ? 'Öğrenci Bilgilerini Düzenle' : 'Yeni Öğrenci Ekle'}
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
                                Kaydet
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .animate-slideDown { animation: slideDown 0.8s ease-out forwards; }
                @keyframes slideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
            `}</style>
        </div>
    );
};