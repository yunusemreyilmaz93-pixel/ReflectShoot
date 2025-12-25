import React, { useState, useEffect } from 'react';
import { 
    Clapperboard, Users, FileText, Video, MessageSquare, AlertCircle, 
    CheckCircle2, Clock, Upload, X, Save, Film, HelpCircle, LogOut, Ban, ShieldAlert,
    Download, Lock, ExternalLink, RefreshCw, FileCheck, BookOpen, Eye, Calendar, Bell
} from 'lucide-react';
import { jsPDF } from "jspdf";
import { useAppContext } from '../context/AppContext';
import { Category, Theme, ApplicationStatus } from '../types';
import { versesList, verseDetails, VERSE_SPLITTER } from '../data/verses';
import { ChatArea } from '../components/ChatArea';
import { uploadFileToR2, uploadPublicLogo } from '../lib/cloudStorage';
import { CertificateGenerator } from '../components/CertificateGenerator';

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

    // Edit & Upload State
    const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
    
    // Verification Codes Input State
    const [verifyCodes, setVerifyCodes] = useState<Record<string, string>>({});

    useEffect(() => {
        setVerifyCodes({});
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

    if (currentApplication?.status === ApplicationStatus.DISQUALIFIED) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center animate-fadeIn relative overflow-hidden">
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

    const handleDownloadDoc = async (studentId: string, type: 'PARENT' | 'KVKK') => {
        showToast("Belge hazırlanıyor...", 'info');
        try {
            const student = currentApplication!.team.students.find(s => s.id === studentId)!;
            const code = Math.floor(10000 + Math.random() * 90000).toString();
            const fullCode = type === 'PARENT' ? `RFS-VI-${code}` : `RFS-KV-${code}`;

            const fontResponse = await fetch('https://www.reflectandshoot.com/fonts/Roboto-Regular.ttf');
            const fontBuffer = await fontResponse.arrayBuffer();
            let binary = '';
            const bytes = new Uint8Array(fontBuffer);
            for (let i = 0; i < bytes.byteLength; i++) { binary += String.fromCharCode(bytes[i]); }
            const base64Font = window.btoa(binary);

            const doc = new jsPDF();
            doc.addFileToVFS("Roboto-Regular.ttf", base64Font);
            doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
            doc.setFont("Roboto", "normal");

            const margin = 20;
            const pageWidth = doc.internal.pageSize.getWidth();
            const maxLineWidth = pageWidth - (margin * 2);

            doc.setFontSize(12);
            const title = type === 'PARENT' ? "VELİ İZİN BELGESİ" : "KVKK AÇIK RIZA METNİ";
            doc.text(title, pageWidth / 2, 20, { align: "center" });
            
            doc.setFontSize(10);
            const bodyText = type === 'PARENT' 
                ? "Ben, aşağıda bilgileri yer alan öğrencinin velisi olarak; öğrencimin yarışmaya katılmasına izin verdiğimi beyan ederim..." 
                : "Öğrencime ait kişisel verilerin yarışma kapsamında işlenmesine açık rıza verdiğimi beyan ederim...";
            const splitText = doc.splitTextToSize(bodyText, maxLineWidth);
            doc.text(splitText, margin, 40);

            doc.text(`Öğrenci: ${student.firstName} ${student.lastName}`, margin, 100);
            doc.text(`Takım: ${currentApplication!.team.name}`, margin, 110);
            
            doc.setFontSize(18);
            doc.text(fullCode, pageWidth / 2, 250, { align: "center" });

            // Update state with expected code immediately
            const updatedStudents = currentApplication!.team.students.map(s => {
                if (s.id === studentId) {
                    return type === 'PARENT' ? { ...s, parentalExpectedId: code } : { ...s, kvkkExpectedId: code };
                }
                return s;
            });
            await updateApplication({ ...currentApplication!, team: { ...currentApplication!.team, students: updatedStudents } });
            
            doc.save(`${type === 'PARENT' ? 'Veli_Izin' : 'KVKK'}_${student.firstName}.pdf`);
            showToast("Belge indirildi. İmzalandıktan sonra kodu girerek yükleyiniz.", 'success');
        } catch (e) {
            showToast("Hata oluştu", 'error');
        }
    };

    const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>, studentId: string, type: 'PARENT' | 'KVKK') => {
        const fileInput = e.target;
        if(!fileInput.files?.[0] || !currentApplication) return;
        
        const file = fileInput.files[0];
        const enteredCode = (verifyCodes[`${studentId}_${type}`] || '').trim();
        const student = currentApplication.team.students.find(s => s.id === studentId);
        const expectedCode = type === 'PARENT' ? student?.parentalExpectedId : student?.kvkkExpectedId;
        
        if (!expectedCode) { showToast("Lütfen önce belgeyi oluşturup indiriniz.", 'error'); return; }
        if (enteredCode !== expectedCode) { showToast("Hatalı onay kodu!", 'error'); return; }

        setUploadingDoc(studentId + type);
        try {
            const storagePath = `teams/${currentApplication.id}/students/${studentId}/docs/${type.toLowerCase()}.pdf`;
            const key = await uploadFileToR2(file, storagePath);
            const updatedStudents = currentApplication.team.students.map(s => {
                if(s.id === studentId) {
                    return type === 'PARENT' ? { ...s, hasParentalConsent: true, parentalConsentUrl: key } : { ...s, hasKvkkConsent: true, kvkkConsentUrl: key };
                }
                return s;
            });
            await updateApplication({ ...currentApplication, team: { ...currentApplication.team, students: updatedStudents } });
            showToast("Belge yüklendi.", 'success');
        } catch(err: any) { showToast("Hata: " + err.message, 'error'); } finally { setUploadingDoc(null); }
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

    if (!currentApplication) {
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
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {currentApplication.team.students.map((student) => (
                            <div key={student.id} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 group hover:border-rose-500/50 transition-colors shadow-lg">
                                <div className="flex justify-between items-center mb-6">
                                    <h4 className="font-bold text-white text-lg">{student.firstName} {student.lastName}</h4>
                                    <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center text-[10px] font-bold">{student.grade}</div>
                                </div>

                                <div className="space-y-6">
                                    {['PARENT', 'KVKK'].map((type) => {
                                        const isDone = type === 'PARENT' ? student.hasParentalConsent : student.hasKvkkConsent;
                                        return (
                                            <div key={type} className="pt-4 border-t border-slate-800">
                                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">
                                                    <span>{type === 'PARENT' ? 'Veli İzin Belgesi' : 'KVKK Metni'}</span>
                                                    {isDone && <CheckCircle2 size={14} className="text-green-500"/>}
                                                </div>
                                                
                                                <div className="flex gap-2 mb-3">
                                                    <button onClick={() => handleDownloadDoc(student.id, type as any)} className="bg-slate-800 hover:bg-slate-700 text-white text-[10px] px-3 py-2 rounded-lg border border-slate-700 flex items-center gap-2 transition-all">
                                                        <Download size={12}/> Belgeyi Oluştur & İndir
                                                    </button>
                                                </div>

                                                {!isDone && (
                                                    <div className="flex items-center bg-slate-950 border border-slate-700 rounded-xl overflow-hidden mb-3">
                                                       <span className="bg-slate-800 px-3 py-2 text-[10px] font-black text-slate-500 border-r border-slate-700">KOD:</span>
                                                       <input value={verifyCodes[`${student.id}_${type}`] || ''} onChange={(e) => setVerifyCodes({...verifyCodes, [`${student.id}_${type}`]: e.target.value})} placeholder="5 Hane" className="bg-transparent flex-1 p-2 text-xs text-white outline-none text-center font-mono tracking-widest" maxLength={5} />
                                                    </div>
                                                )}

                                                <label className={`block w-full border-2 border-dashed rounded-xl p-3 text-center transition-all ${isDone ? 'border-green-900/30 bg-green-900/5 cursor-default' : 'border-slate-800 hover:border-rose-500/50 hover:bg-slate-800 cursor-pointer'}`}>
                                                    <input type="file" className="hidden" accept=".pdf" onChange={(e) => handleDocUpload(e, student.id, type as any)} disabled={isDone} />
                                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center justify-center gap-2">
                                                        {isDone ? <><FileCheck size={14} className="text-green-500"/> Tamamlandı</> : <><Upload size={14}/> PDF Yükle</>}
                                                    </span>
                                                </label>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
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
                                <p className="text-slate-400 mb-10 leading-relaxed font-light">Videonuzu ortak klasöre yükledikten sonra mutlaka onay butonuna basınız.</p>
                                
                                <a href="https://drive.google.com/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-4 bg-white text-slate-900 px-12 py-5 rounded-2xl font-black text-xl hover:bg-slate-200 transition-all shadow-xl mb-10">
                                    <ExternalLink size={24}/> Drive Klasörüne Git
                                </a>

                                <button onClick={confirmVideoSubmission} className="w-full bg-green-600 hover:bg-green-500 text-white py-5 rounded-2xl font-black text-lg shadow-lg shadow-green-900/20 transition-all">
                                    Teslimi Tamamla
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'CHAT' && (
                    <div className="max-w-4xl mx-auto"><ChatArea appId={currentApplication.id} /></div>
                )}

            </div>

            <style>{`
                .animate-slideDown { animation: slideDown 0.8s ease-out forwards; }
                @keyframes slideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
            `}</style>
        </div>
    );
};