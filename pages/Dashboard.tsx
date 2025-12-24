import React, { useState, useEffect } from 'react';
import { 
    Clapperboard, Users, FileText, Video, MessageSquare, AlertCircle, 
    CheckCircle2, Clock, Upload, X, Save, Film, HelpCircle, LogOut, Ban, ShieldAlert,
    Download, Lock, ExternalLink, RefreshCw, FileCheck
} from 'lucide-react';
import { jsPDF } from "jspdf";
import { useAppContext } from '../context/AppContext';
import { Category, Theme, ApplicationStatus } from '../types';
import { versesList } from '../data/verses';
import { ChatArea } from '../components/ChatArea';
import { uploadFileToR2, uploadPublicLogo } from '../lib/cloudStorage';
import { CertificateGenerator } from '../components/CertificateGenerator';

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

    // Edit & Upload State
    const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
    
    // Verification Codes Input State
    const [verifyCodes, setVerifyCodes] = useState<Record<string, string>>({});

    useEffect(() => {
        // Reset verify codes when app loads
        setVerifyCodes({});
    }, [currentApplication?.id]);

    // --- DISQUALIFIED CHECK ---
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
                    
                    <h1 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">
                        Erişim Engellendi
                    </h1>
                    
                    <p className="text-lg text-slate-300 mb-8 leading-relaxed font-light">
                        Üzgünüz, yarışmamıza katılım sağlamanız mümkün değildir.
                    </p>

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

    // --- HANDLERS ---

    const handleCreateChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setTeamForm({...teamForm, [e.target.name]: e.target.value});
    };

    const handleStudentChange = (idx: number, field: string, val: string) => {
        const newStudents = [...teamForm.students];
        (newStudents[idx] as any)[field] = val;
        setTeamForm({...teamForm, students: newStudents});
    };

    const addStudent = () => {
        if(teamForm.students.length < 6) {
            setTeamForm({...teamForm, students: [...teamForm.students, { firstName: '', lastName: '', grade: '' }]});
        }
    };

    const removeStudent = (idx: number) => {
        if(teamForm.students.length > 3) {
            const newStudents = teamForm.students.filter((_, i) => i !== idx);
            setTeamForm({...teamForm, students: newStudents});
        }
    };

    const validateCreate = () => {
        const errs: any = {};
        if(!teamForm.teamName) errs.teamName = "Takım adı gereklidir.";
        if(teamForm.students.some(s => !s.firstName || !s.lastName || !s.grade)) errs.students = "Tüm öğrenci bilgileri doldurulmalıdır.";
        setFormErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!validateCreate()) return;
        if(!systemSettings.features.allowNewRegistrations) {
            showToast("Yeni kayıtlar şu an kapalıdır.", 'error');
            return;
        }

        setIsCreating(true);
        try {
            await createApplication(teamForm);
        } catch (e: any) {
            showToast(e.message, 'error');
        } finally {
            setIsCreating(false);
        }
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if(!e.target.files?.[0] || !currentApplication) return;
        const file = e.target.files[0];
        try {
            showToast("Logo yükleniyor...", 'info');
            const key = await uploadPublicLogo(file, currentApplication.team.id);
            const url = `https://pub-445f38f2d68348d4914aa2bac116cf06.r2.dev/${key}`;
            
            await updateApplication({
                ...currentApplication,
                team: { ...currentApplication.team, logoKey: key, logoUrl: url }
            });
            showToast("Logo güncellendi.", 'success');
        } catch(err: any) {
            showToast(err.message, 'error');
        }
    };

    // --- DOCUMENT LOGIC ---

    const generateAndDownloadDoc = async (studentId: string, type: 'PARENT' | 'KVKK') => {
        if (!currentApplication) return;
        
        // 1. Generate unique 5-digit code
        const code = Math.floor(10000 + Math.random() * 90000).toString();
        
        // Formatted Full Code
        const fullCode = type === 'PARENT' 
            ? `RFS-VI-${code}` 
            : `RFS-KV-${code}`;

        // 2. Update Application State with the expected code
        const updatedStudents = currentApplication.team.students.map(s => {
            if (s.id === studentId) {
                return type === 'PARENT' 
                    ? { ...s, parentalExpectedId: code } 
                    : { ...s, kvkkExpectedId: code };
            }
            return s;
        });
        
        const updatedApp = { ...currentApplication, team: { ...currentApplication.team, students: updatedStudents } };
        await updateApplication(updatedApp);

        // 3. Generate PDF
        const student = updatedStudents.find(s => s.id === studentId);
        if(!student) return;

        const doc = new jsPDF();

        // Standard fonts don't support Turkish chars. Using Helvetica and replacing non-supported ones for better outcome if custom font fails.
        doc.setFont("helvetica", "normal");

        // Configuration
        doc.setFontSize(14);
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;
        const maxLineWidth = pageWidth - (margin * 2);
        
        // Header
        doc.setFontSize(16);
        if (type === 'PARENT') {
            doc.text("VELI IZIN BELGESI", pageWidth / 2, 20, { align: "center" });
        } else {
            doc.text("KVKK AYDINLATMA VE RIZA METNI", pageWidth / 2, 20, { align: "center" });
        }
        
        doc.setFontSize(12);
        doc.text("Reflect & Shoot Kisa Film Yarismasi", pageWidth / 2, 28, { align: "center" });

        // Content Body
        doc.setFontSize(10);
        let yPos = 40;

        const veliText = `Ben, asagida bilgileri yer alan ogrencinin velisi / yasal temsilcisi olarak; ogrencimin, Konya Anadolu Imam Hatip Lisesi tarafindan duzenlenen Reflect & Shoot Kisa Film Yarismasi’na katilmasina, yarismasi kapsaminda gerceklestirilecek egitim, hazirlik ve kisa film uretim sureclerinde aktif olarak yer almasina izin verdigimi beyan ederim.

Bu yarisma kapsaminda ogrencimin; kisa film calismasinda goruntusunun, sesinin ve performansinin yer alabilecegini, hazirlanan filmin juri degerlendirmesi, on eleme, arsivleme ve yarisma surecinin yurutulmesi amaciyla izlenebilecegini ve saklanabilecegini kabul ederim. Ayrica soz konusu filmin veya filmden alinacak goruntulerin, yarismamin ve duzenleyici kurumun tanitimi kapsaminda; resmi internet siteleri, sosyal medya hesaplari, egitim ve tanitim amacli sunumlar ile benzeri ticari olmayan mecralarda yayinlanabilecegini bildigimi ve buna muvafakat ettigimi beyan ederim.

Ogrencimin yarisma surecine katilimi sirasinda yururlukteki yarisma kurallarina uyacagini, danisman ogretmen rehberliginde hareket edecegini ve bu surecte dogabilecek her turlu sorumlulugun tarafimca bilindigini kabul ederim. Isbu belge ile verdigim izin, yarisma suresiyle sinirli olmak uzere gecerlidir ve tarafimca ozgur irade ile imzalanmistir.`;

        const bodyText = type === 'PARENT' ? veliText : veliText.replace("VELI IZIN BELGESI", "KVKK METNI");

        const splitText = doc.splitTextToSize(bodyText, maxLineWidth);
        doc.text(splitText, margin, yPos);
        yPos += (splitText.length * 5) + 10;

        // Student Info
        doc.text("OGRENCI VE PROJE BILGILERI", margin, yPos);
        yPos += 6;
        
        doc.text(`Ogrencinin Adi Soyadi: ${student.firstName} ${student.lastName}`, margin, yPos);
        yPos += 6;
        doc.text(`Sinifi: ${student.grade}`, margin, yPos);
        yPos += 6;
        doc.text(`Okulu: ${currentApplication.teacher.school}`, margin, yPos);
        yPos += 6;
        doc.text(`Takim Adi: ${currentApplication.team.name}`, margin, yPos);
        yPos += 6;
        doc.text(`Danisman Ogretmen: ${currentApplication.teacher.fullName}`, margin, yPos);
        yPos += 15;

        // Signatures
        doc.text("ONAY VE IMZA", margin, yPos);
        yPos += 10;

        doc.text(`Veli Adi Soyadi: .........................................................`, margin, yPos);
        yPos += 8;
        doc.text(`Imza: .........................................................`, margin, yPos);
        yPos += 8;
        doc.text(`Tarih: .... / .... / 20....`, margin, yPos);
        yPos += 15;

        doc.text(`Danisman Ogretmen Adi Soyadi: .........................................................`, margin, yPos);
        yPos += 8;
        doc.text(`Imza: .........................................................`, margin, yPos);
        yPos += 8;
        doc.text(`Tarih: .... / .... / 20....`, margin, yPos);
        
        // Code Section (Bottom Center)
        const pageHeight = doc.internal.pageSize.getHeight();
        const bottomY = pageHeight - 30;

        doc.setFontSize(18);
        doc.text(fullCode, pageWidth / 2, bottomY, { align: "center" });
        
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text("Sisteme yuklerken bu kodun sadece son 5 hanesini girmeniz yeterlidir.", pageWidth / 2, bottomY + 6, { align: "center" });

        doc.save(`${type}_${student.firstName}_${student.lastName}.pdf`);
        showToast(`${type === 'PARENT' ? 'Veli İzin' : 'KVKK'} belgesi indirildi.`, 'success');
    };

    const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>, studentId: string, type: 'PARENT' | 'KVKK') => {
        if(!e.target.files?.[0] || !currentApplication) return;
        
        const file = e.target.files[0];
        const enteredCode = verifyCodes[`${studentId}_${type}`];
        const student = currentApplication.team.students.find(s => s.id === studentId);
        
        const expectedCode = type === 'PARENT' ? student?.parentalExpectedId : student?.kvkkExpectedId;
        
        if (!expectedCode) {
            showToast("Lütfen önce belgeyi sistemden oluşturunuz.", 'error');
            return;
        }
        if (enteredCode !== expectedCode) {
            showToast("Hatalı onay kodu! Belge üzerindeki son 5 haneyi kontrol ediniz.", 'error');
            return;
        }

        setUploadingDoc(studentId + type);
        
        try {
            // Document uploads go to PRIVATE bucket via uploadFileToR2
            const key = await uploadFileToR2(file, `consents/${currentApplication.id}/${studentId}_${type}.pdf`);
            
            const updatedStudents = currentApplication.team.students.map(s => {
                if(s.id === studentId) {
                    return type === 'PARENT' 
                        ? { ...s, hasParentalConsent: true, parentalConsentUrl: key }
                        : { ...s, hasKvkkConsent: true, kvkkConsentUrl: key };
                }
                return s;
            });

            await updateApplication({
                ...currentApplication,
                team: { ...currentApplication.team, students: updatedStudents }
            });
            showToast("Belge başarıyla doğrulandı ve yüklendi.", 'success');
            setVerifyCodes({...verifyCodes, [`${studentId}_${type}`]: ''});
        } catch(err: any) {
            showToast("Yükleme hatası: " + err.message, 'error');
        } finally {
            setUploadingDoc(null);
        }
    };

    // --- VIDEO SUBMISSION LOGIC ---

    const isVideoTime = () => {
        const now = new Date();
        const start = new Date(systemSettings.dates.videoUploadStart);
        const end = new Date(systemSettings.dates.videoUploadEnd);
        return now >= start && now <= end && systemSettings.features.videoUploadActive;
    };

    const confirmVideoSubmission = async () => {
        if(!currentApplication) return;
        if (!window.confirm("Drive klasörüne videonuzu yüklediğinizi onaylıyor musunuz?")) return;

        try {
            await updateApplication({
                ...currentApplication,
                team: { ...currentApplication.team, videoStatus: 'SUBMITTED_LINK' }, 
                status: ApplicationStatus.FINAL_SUBMITTED
            });
            showToast("Video teslim bildirimi alındı.", 'success');
        } catch(err: any) {
            showToast(err.message, 'error');
        }
    };

    if (!currentApplication) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-12 animate-fadeIn">
                <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 shadow-2xl">
                    <h2 className="text-3xl font-black text-white mb-6 flex items-center gap-3">
                        <Clapperboard className="text-rose-500" size={32}/> Takımını Kur
                    </h2>
                    <p className="text-slate-400 mb-8">
                        Yarışmaya katılmak için takım bilgilerini eksiksiz doldurunuz. Bu bilgiler daha sonra değiştirilemez (öğrenci ekleme/çıkarma hariç).
                    </p>
                    
                    <form onSubmit={handleCreateSubmit} className="space-y-8">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-400 mb-2">Takım Adı</label>
                                <input name="teamName" value={teamForm.teamName} onChange={handleCreateChange} maxLength={40} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-rose-500 outline-none" placeholder="Yaratıcı bir isim..." />
                                {formErrors.teamName && <p className="text-red-500 text-xs mt-1">{formErrors.teamName}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-400 mb-2">Kategori</label>
                                <select name="category" value={teamForm.category} onChange={handleCreateChange} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-rose-500 outline-none">
                                    {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-400 mb-2">Tema</label>
                                <select name="theme" value={teamForm.theme} onChange={handleCreateChange} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-rose-500 outline-none">
                                    {Object.values(Theme).map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            {teamForm.theme === Theme.AYET && (
                                <div>
                                    <label className="block text-sm font-bold text-slate-400 mb-2">Seçilen Ayet</label>
                                    <select name="selectedVerse" value={teamForm.selectedVerse} onChange={handleCreateChange} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-rose-500 outline-none">
                                        {versesList.map(v => <option key={v} value={v}>{v}</option>)}
                                    </select>
                                </div>
                            )}
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <label className="block text-sm font-bold text-slate-400">Öğrenci Listesi (3-6 Kişi)</label>
                                <button type="button" onClick={addStudent} className="text-xs bg-slate-800 text-white px-3 py-1 rounded hover:bg-slate-700 transition-colors" disabled={teamForm.students.length >= 6}>+ Öğrenci Ekle</button>
                            </div>
                            <div className="space-y-3">
                                {teamForm.students.map((student, idx) => (
                                    <div key={idx} className="flex gap-3 items-center bg-slate-950 p-3 rounded-xl border border-slate-800">
                                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500">{idx + 1}</div>
                                        <input value={student.firstName} onChange={(e) => handleStudentChange(idx, 'firstName', e.target.value)} placeholder="Ad" className="flex-1 bg-transparent border-b border-slate-700 focus:border-rose-500 outline-none text-sm text-white py-1" />
                                        <input value={student.lastName} onChange={(e) => handleStudentChange(idx, 'lastName', e.target.value)} placeholder="Soyad" className="flex-1 bg-transparent border-b border-slate-700 focus:border-rose-500 outline-none text-sm text-white py-1" />
                                        <input value={student.grade} onChange={(e) => handleStudentChange(idx, 'grade', e.target.value)} placeholder="Sınıf (11-A)" className="w-24 bg-transparent border-b border-slate-700 focus:border-rose-500 outline-none text-sm text-white py-1" />
                                        {teamForm.students.length > 3 && (
                                            <button type="button" onClick={() => removeStudent(idx)} className="text-slate-600 hover:text-red-500"><X size={16}/></button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {formErrors.students && <p className="text-red-500 text-xs mt-2">{formErrors.students}</p>}
                        </div>

                        <button type="submit" disabled={isCreating} className="w-full bg-rose-600 hover:bg-rose-500 text-white py-4 rounded-xl font-bold shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                            {isCreating ? 'Oluşturuluyor...' : 'Takımı Oluştur ve Başvur'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // --- DASHBOARD VIEW ---

    const statusColors = {
        [ApplicationStatus.DRAFT]: 'bg-slate-700',
        [ApplicationStatus.PRELIMINARY_SUBMITTED]: 'bg-blue-600',
        [ApplicationStatus.FINAL_SUBMITTED]: 'bg-purple-600',
        [ApplicationStatus.APPROVED]: 'bg-green-600',
        [ApplicationStatus.REJECTED]: 'bg-red-600',
        [ApplicationStatus.GRADED]: 'bg-teal-600',
        [ApplicationStatus.DISQUALIFIED]: 'bg-red-900',
        [ApplicationStatus.NEEDS_FIX]: 'bg-amber-500',
        [ApplicationStatus.UNDER_REVIEW]: 'bg-indigo-500'
    };

    return (
        <div className="bg-slate-950 min-h-screen text-slate-200 font-sans pb-20">
            {/* Header */}
            <div className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden relative group">
                                {currentApplication.team.logoUrl ? (
                                    <img src={currentApplication.team.logoUrl} className="w-full h-full object-cover" />
                                ) : <Users className="text-slate-600" />}
                                <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                                    <Upload size={20} className="text-white"/>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload}/>
                                </label>
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-white leading-tight">{currentApplication.team.name}</h1>
                                <p className="text-slate-400 text-sm flex items-center gap-2">
                                    {currentApplication.teacher.school} <span className="w-1 h-1 rounded-full bg-slate-600"></span> {currentApplication.team.category}
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <div className={`px-4 py-2 rounded-lg text-xs font-bold text-white uppercase tracking-wider ${statusColors[currentApplication.status] || 'bg-slate-700'}`}>
                                {currentApplication.status}
                            </div>
                            {currentApplication.team.isFinalist && (
                                <div className="px-4 py-2 rounded-lg text-xs font-bold bg-amber-500 text-black uppercase tracking-wider flex items-center gap-2 animate-pulse">
                                    <Clapperboard size={14}/> FİNALİST
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex gap-6 mt-8 overflow-x-auto">
                        {['STATUS', 'DOCUMENTS', 'VIDEO', 'CHAT'].map(tab => (
                            <button 
                                key={tab} 
                                onClick={() => setActiveTab(tab)}
                                className={`pb-3 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${activeTab === tab ? 'text-rose-500 border-rose-500' : 'text-slate-400 border-transparent hover:text-white'}`}
                            >
                                {tab === 'STATUS' && 'Genel Bakış'}
                                {tab === 'DOCUMENTS' && 'Belgeler & Takım'}
                                {tab === 'VIDEO' && 'Video Teslim'}
                                {tab === 'CHAT' && 'İletişim'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
                
                {activeTab === 'STATUS' && (
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                                <h3 className="font-bold text-white mb-4 flex items-center gap-2"><HelpCircle size={20} className="text-teal-500"/> Proje Künyesi</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between border-b border-slate-800 pb-2">
                                        <span className="text-slate-500 text-sm">Tema</span>
                                        <span className="text-white text-sm font-medium">{currentApplication.team.theme}</span>
                                    </div>
                                    {currentApplication.team.selectedVerse && (
                                        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                                            <p className="text-amber-500 text-xs italic font-medium">"{currentApplication.team.selectedVerse}"</p>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center pt-2">
                                        <span className="text-slate-500 text-sm">Takım Üye Sayısı</span>
                                        <span className="text-white text-sm font-bold bg-slate-800 px-3 py-1 rounded-full">{currentApplication.team.students.length}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Katılım Belgesi (Only available after gala) */}
                            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-white mb-1">Katılım Belgesi</h3>
                                    <p className="text-xs text-slate-500">22 Mayıs 2026'dan sonra aktif olur.</p>
                                </div>
                                <div className="opacity-50 pointer-events-none">
                                    <CertificateGenerator />
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                            <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Clock size={20} className="text-blue-500"/> Süreç Takibi</h3>
                            <div className="space-y-6 relative pl-4 border-l-2 border-slate-800 ml-2">
                                {[
                                    { label: 'Başvuru Oluşturuldu', done: true, date: new Date(currentApplication.submittedAt).toLocaleDateString() },
                                    { label: 'Belgeler Tamamlandı', done: currentApplication.team.students.every(s => s.hasParentalConsent && s.hasKvkkConsent) },
                                    { label: 'Video Teslim Edildi', done: currentApplication.team.videoStatus !== 'PENDING' },
                                    { label: 'Ön Eleme', done: currentApplication.team.isPreliminaryStageComplete },
                                    { label: 'Finalist Açıklaması', done: currentApplication.team.isFinalist },
                                    { label: 'Gala Gecesi', done: false }
                                ].map((step, i) => (
                                    <div key={i} className="relative">
                                        <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 ${step.done ? 'bg-green-500 border-green-500' : 'bg-slate-900 border-slate-600'}`}></div>
                                        <p className={`text-sm font-medium ${step.done ? 'text-white' : 'text-slate-500'}`}>{step.label}</p>
                                        {step.date && <p className="text-[10px] text-slate-600">{step.date}</p>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'DOCUMENTS' && (
                    <div className="space-y-6">
                        <div className="bg-blue-900/20 border border-blue-900/50 p-4 rounded-xl flex items-start gap-3">
                            <AlertCircle className="text-blue-400 flex-shrink-0" size={20} />
                            <div className="text-sm text-blue-200">
                                Her öğrenci için <strong>Veli İzin Belgesi</strong> ve <strong>KVKK Metni</strong> indirilip imzalandıktan sonra sisteme yüklenmelidir. <br/>
                                "Belge Oluştur" butonuna basarak belgeyi indirin, imzaladıktan sonra üzerinde yazan kodu girerek yükleyiniz.
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {currentApplication.team.students.map((student) => (
                                <div key={student.id} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 relative group hover:border-slate-600 transition-colors">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h4 className="font-bold text-white text-lg">{student.firstName} {student.lastName}</h4>
                                            <p className="text-sm text-slate-500">{student.grade}</p>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center text-xs font-bold border border-slate-700">
                                            {student.firstName[0]}{student.lastName[0]}
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        {/* Parental Consent */}
                                        <div className="border-t border-slate-800 pt-4">
                                            <div className="flex justify-between text-xs mb-2">
                                                <span className="font-bold text-slate-300">Veli İzin Belgesi</span>
                                                {student.hasParentalConsent && <CheckCircle2 size={14} className="text-green-500"/>}
                                            </div>
                                            
                                            <div className="flex gap-2 mb-2">
                                                <button onClick={() => generateAndDownloadDoc(student.id, 'PARENT')} className="bg-slate-800 text-slate-400 text-[10px] px-2 py-1 rounded border border-slate-700 hover:text-white flex items-center gap-1">
                                                    <RefreshCw size={10}/> Belge Oluştur & İndir
                                                </button>
                                            </div>

                                            {!student.hasParentalConsent && (
                                                <div className="flex items-center bg-slate-950 border border-slate-700 rounded-lg overflow-hidden mb-2">
                                                   <span className="bg-slate-800 px-2 py-2 text-[10px] font-bold text-slate-400 border-r border-slate-700">RFS-VI-</span>
                                                   <input 
                                                        value={verifyCodes[`${student.id}_PARENT`] || ''} 
                                                        onChange={(e) => setVerifyCodes({...verifyCodes, [`${student.id}_PARENT`]: e.target.value})}
                                                        placeholder="Son 5 Hane" 
                                                        className="bg-transparent flex-1 p-2 text-xs text-white outline-none text-center tracking-widest font-mono"
                                                        maxLength={5}
                                                    />
                                                </div>
                                            )}

                                            <label className={`block w-full border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition-all ${student.hasParentalConsent ? 'border-green-900/50 bg-green-900/10' : 'border-slate-700 hover:border-rose-500 hover:bg-slate-800'}`}>
                                                <input type="file" className="hidden" accept=".pdf,.jpg,.png" onChange={(e) => handleDocUpload(e, student.id, 'PARENT')} disabled={uploadingDoc === student.id + 'PARENT'} />
                                                <span className="text-xs font-bold text-slate-500 flex items-center justify-center gap-2">
                                                    {uploadingDoc === student.id + 'PARENT' ? 'Yükleniyor...' : student.hasParentalConsent ? <><FileCheck size={14}/> Yüklendi</> : 'İmzalı Belgeyi Yükle'}
                                                </span>
                                            </label>
                                        </div>

                                        {/* KVKK Consent */}
                                        <div className="border-t border-slate-800 pt-4">
                                            <div className="flex justify-between text-xs mb-2">
                                                <span className="font-bold text-slate-300">KVKK Metni</span>
                                                {student.hasKvkkConsent && <CheckCircle2 size={14} className="text-green-500"/>}
                                            </div>

                                            <div className="flex gap-2 mb-2">
                                                <button onClick={() => generateAndDownloadDoc(student.id, 'KVKK')} className="bg-slate-800 text-slate-400 text-[10px] px-2 py-1 rounded border border-slate-700 hover:text-white flex items-center gap-1">
                                                    <RefreshCw size={10}/> Belge Oluştur & İndir
                                                </button>
                                            </div>

                                            {!student.hasKvkkConsent && (
                                                <div className="flex items-center bg-slate-950 border border-slate-700 rounded-lg overflow-hidden mb-2">
                                                   <span className="bg-slate-800 px-2 py-2 text-[10px] font-bold text-slate-400 border-r border-slate-700">RFS-KV-</span>
                                                   <input 
                                                        value={verifyCodes[`${student.id}_KVKK`] || ''} 
                                                        onChange={(e) => setVerifyCodes({...verifyCodes, [`${student.id}_KVKK`]: e.target.value})}
                                                        placeholder="Son 5 Hane" 
                                                        className="bg-transparent flex-1 p-2 text-xs text-white outline-none text-center tracking-widest font-mono"
                                                        maxLength={5}
                                                    />
                                                </div>
                                            )}

                                            <label className={`block w-full border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition-all ${student.hasKvkkConsent ? 'border-green-900/50 bg-green-900/10' : 'border-slate-700 hover:border-rose-500 hover:bg-slate-800'}`}>
                                                <input type="file" className="hidden" accept=".pdf,.jpg,.png" onChange={(e) => handleDocUpload(e, student.id, 'KVKK')} disabled={uploadingDoc === student.id + 'KVKK'} />
                                                <span className="text-xs font-bold text-slate-500 flex items-center justify-center gap-2">
                                                    {uploadingDoc === student.id + 'KVKK' ? 'Yükleniyor...' : student.hasKvkkConsent ? <><FileCheck size={14}/> Yüklendi</> : 'İmzalı Belgeyi Yükle'}
                                                </span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'VIDEO' && (
                    <div className="max-w-3xl mx-auto">
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl text-center">
                            <h3 className="text-2xl font-bold text-white mb-6 flex items-center justify-center gap-3">
                                <Film size={24} className="text-rose-500"/> Video Teslimi
                            </h3>
                            
                            {!isVideoTime() ? (
                                <div className="py-12 flex flex-col items-center">
                                    <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6 border border-slate-700">
                                        <Lock size={32} className="text-slate-500" />
                                    </div>
                                    <h4 className="text-xl font-bold text-white mb-2">Teslim Süreci Aktif Değil</h4>
                                    <p className="text-slate-400">
                                        Video teslimleri <strong>{new Date(systemSettings.dates.videoUploadStart).toLocaleDateString('tr-TR')}</strong> tarihinde başlayacaktır.
                                    </p>
                                </div>
                            ) : (
                                <div className="py-8">
                                    <div className="bg-blue-900/20 border border-blue-900/50 rounded-xl p-6 mb-8 text-left">
                                        <h4 className="text-blue-400 font-bold mb-2 flex items-center gap-2"><Upload size={18}/> Nasıl Yüklenir?</h4>
                                        <p className="text-sm text-slate-300 leading-relaxed">
                                            Filminizi doğrudan YouTube'a yüklemeyiniz. Aşağıdaki butona tıklayarak takımınız için oluşturulmuş <strong>Ortak Drive Klasörü</strong>'ne gidiniz ve video dosyanızı oraya yükleyiniz.
                                            Yükleme tamamlandıktan sonra aşağıdaki "Yüklemeyi Tamamladım" butonuna basarak süreci bitiriniz.
                                        </p>
                                    </div>

                                    <a 
                                        href="https://drive.google.com/" 
                                        target="_blank" 
                                        rel="noreferrer" 
                                        className="inline-flex items-center gap-3 bg-white text-slate-900 px-8 py-4 rounded-xl font-black text-lg hover:bg-slate-200 transition-all shadow-lg transform hover:-translate-y-1 mb-8"
                                    >
                                        <ExternalLink size={24}/> Drive Klasörüne Git
                                    </a>

                                    <div className="border-t border-slate-800 pt-8">
                                        <button 
                                            onClick={confirmVideoSubmission}
                                            className="w-full bg-green-600 hover:bg-green-500 text-white py-4 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle2 size={20}/> Dosyaları Yükledim, Teslimi Tamamla
                                        </button>
                                        <p className="text-xs text-slate-500 mt-4">
                                            * Butona bastığınızda proje durumunuz "İnceleniyor" olarak güncellenecektir.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'CHAT' && (
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl min-h-[600px] flex flex-col">
                            <ChatArea appId={currentApplication.id} />
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};