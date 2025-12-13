
import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { ApplicationStatus, Category, Theme, UserRole } from '../types';
import { CheckCircle, AlertCircle, Upload, Video, Award, Clock, Users, FileDown, Clapperboard, Film, UserPlus, BookOpen, Trophy, HeartHandshake, Cpu, Link as LinkIcon, ExternalLink, Play, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { versesList, verseDetails, VERSE_SPLITTER } from '../data/verses';
import { ChatArea } from '../components/ChatArea';
import { CertificateGenerator } from '../components/CertificateGenerator';
import { getYouTubeEmbedUrl } from '../lib/videoUtils';

export const Dashboard: React.FC = () => {
  const { currentApplication, updateApplication, createApplication, currentUser, currentDate, systemSettings, showToast } = useAppContext();
  const [uploading, setUploading] = useState<string | null>(null);

  // -- Dynamic Dates from System Settings --
  const VIDEO_UPLOAD_START_DATE = new Date(systemSettings.dates.videoUploadStart);
  const VIDEO_UPLOAD_END_DATE = new Date(systemSettings.dates.videoUploadEnd);
  
  const FINALIST_REVEAL_START = new Date(systemSettings.dates.finalistRevealStart || '2026-04-01T00:00:00');
  const FINALIST_REVEAL_END = new Date(systemSettings.dates.finalistRevealEnd || '2026-04-04T23:59:59');
  
  const ACADEMY_START_DATE = new Date(systemSettings.dates.academyStart);
  
  const REVISE_UPLOAD_START = new Date(systemSettings.dates.reviseUploadStart || '2026-04-13T00:00:00');
  const REVISE_UPLOAD_END = new Date(systemSettings.dates.reviseUploadEnd || '2026-05-04T23:59:59');

  const GALA_DATE = new Date(systemSettings.dates.galaDate);

  // Computed Phase Checks
  // New Logic: Video Upload is active ONLY if the master switch is ON AND we are within dates (or master switch forces it open?)
  // Requirement was "I want to open/close video upload whenever I want". 
  // Let's make it: if master switch is OFF, it's closed. If ON, it checks dates.
  // Actually, for full control, if switch is ON, we might want to bypass dates? 
  // Standard practice: Switch Enables the feature availability. Dates control the window.
  // BUT to satisfy "istediğim zaman açıp kapatabileyim", the switch effectively acts as the gatekeeper.
  
  const isVideoSystemEnabled = systemSettings.features.videoUploadActive;
  
  const isVideoUploadPhase = isVideoSystemEnabled && (currentDate >= VIDEO_UPLOAD_START_DATE && currentDate <= VIDEO_UPLOAD_END_DATE);
  const isBeforeUploadPhase = currentDate < VIDEO_UPLOAD_START_DATE;
  const isAfterFirstDeadline = currentDate > VIDEO_UPLOAD_END_DATE;
  
  const isRevealPhase = currentDate >= FINALIST_REVEAL_START && currentDate <= FINALIST_REVEAL_END;
  const isAcademyActive = currentDate >= ACADEMY_START_DATE;
  
  const isRevisePhase = isVideoSystemEnabled && (currentDate >= REVISE_UPLOAD_START && currentDate <= REVISE_UPLOAD_END);
  const isGalaPhase = currentDate >= GALA_DATE;

  // -- Team Creation State --
  const [isCreating, setIsCreating] = useState(false);
  const [teamForm, setTeamForm] = useState({ name: '', category: Category.LIVE_ACTION, theme: Theme.AYET, selectedVerse: '' });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  
  const [students, setStudents] = useState<{firstName: string; lastName: string; grade: string}[]>([
      { firstName: '', lastName: '', grade: '' },
      { firstName: '', lastName: '', grade: '' },
      { firstName: '', lastName: '', grade: '' } // Min 3 start
  ]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // -- Upload State --
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeContext, setActiveContext] = useState<{type: 'kvkk' | 'parent', studentId?: string} | null>(null);

  // -- Link Submission State --
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [submissionLink, setSubmissionLink] = useState('');
  const [isSubmittingLink, setIsSubmittingLink] = useState(false);

  // -- Finalist Reveal Modal State --
  const [showRevealModal, setShowRevealModal] = useState(false);

  // Trigger Reveal Modal on Phase Entry
  useEffect(() => {
    if (isRevealPhase && currentApplication) {
       setShowRevealModal(true);
    }
  }, [isRevealPhase, currentApplication]);

  // Autosave Logic for Team Wizard
  useEffect(() => {
    if (currentUser?.role === UserRole.TEACHER && !currentApplication) {
        const savedForm = localStorage.getItem('teamFormDraft');
        const savedStudents = localStorage.getItem('teamStudentsDraft');
        if (savedForm) setTeamForm(JSON.parse(savedForm));
        if (savedStudents) setStudents(JSON.parse(savedStudents));
    }
  }, [currentApplication, currentUser]);

  useEffect(() => {
    if (currentUser?.role === UserRole.TEACHER && !currentApplication) {
        localStorage.setItem('teamFormDraft', JSON.stringify(teamForm));
        localStorage.setItem('teamStudentsDraft', JSON.stringify(students));
    }
  }, [teamForm, students, currentApplication, currentUser]);

  // --- TEACHER & STUDENT DASHBOARD LOGIC START ---

  const handleTeamChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setTeamForm({...teamForm, [e.target.name]: e.target.value});
  
  const handleStudentChange = (index: number, field: string, value: string) => {
      const newStudents = [...students];
      newStudents[index] = { ...newStudents[index], [field]: value };
      setStudents(newStudents);
  };

  const addStudent = () => {
      if(students.length < 6) setStudents([...students, { firstName: '', lastName: '', grade: '' }]);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          
          // 1. Format Check
          if (file.type !== 'image/png') {
              alert('HATA: Logo sadece PNG formatında olabilir.');
              e.target.value = ''; // Reset input
              setLogoFile(null);
              return;
          }

          const img = new Image();
          const objectUrl = URL.createObjectURL(file);
          
          img.onload = () => {
              // 2. Dimension Check (Strict 128x128)
              if (img.width !== 128 || img.height !== 128) {
                  alert(`HATA: Logo boyutları tam olarak 128x128 piksel olmalıdır.\nSizin görseliniz: ${img.width}x${img.height} piksel.`);
                  e.target.value = ''; // Reset input
                  setLogoFile(null);
                  URL.revokeObjectURL(objectUrl);
                  return;
              }

              // Success
              setLogoFile(file);
              setFormErrors({...formErrors, logo: ''});
              URL.revokeObjectURL(objectUrl);
          };

          img.onerror = () => {
              alert('Görsel dosyası okunamadı.');
              URL.revokeObjectURL(objectUrl);
          };

          img.src = objectUrl;
      }
  };

  const validateTeamForm = () => {
      const errors: Record<string, string> = {};
      if (!teamForm.name) errors.teamName = "Takım adı gereklidir";
      if (!logoFile) errors.logo = "Takım logosu zorunludur";
      if (teamForm.theme === Theme.AYET && !teamForm.selectedVerse) errors.verse = "Lütfen bir ayet seçiniz";
      
      students.forEach((s, i) => {
          if(!s.firstName || !s.lastName || !s.grade) errors[`student_${i}`] = "Eksik öğrenci bilgisi";
      });
      setFormErrors(errors);
      return Object.keys(errors).length === 0;
  };

  const handleSubmitTeam = (e: React.FormEvent) => {
      e.preventDefault();
      if(validateTeamForm()) {
          setIsCreating(true);
          setTimeout(() => {
              createApplication({
                  teamName: teamForm.name,
                  category: teamForm.category,
                  theme: teamForm.theme,
                  selectedVerse: teamForm.theme === Theme.AYET ? teamForm.selectedVerse : undefined,
                  logoFile,
                  students
              });
              
              localStorage.removeItem('teamFormDraft');
              localStorage.removeItem('teamStudentsDraft');
              
              setIsCreating(false);
          }, 1500);
      }
  };

  const printTeacherGuide = () => {
      if (!currentApplication) return;
      
      const content = `
        <html>
        <head>
          <title>Reflect&Shoot - Takım Görev Rehberi</title>
          <style>
             body { font-family: 'Helvetica', sans-serif; padding: 40px; }
             h1 { color: #881337; border-bottom: 2px solid #fbbf24; padding-bottom: 10px; }
             .team-info { background: #fff1f2; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
             .student-row { display: flex; justify-content: space-between; border-bottom: 1px solid #ddd; padding: 10px 0; }
             .checkbox { width: 20px; height: 20px; border: 1px solid #000; display: inline-block; margin-right: 10px; }
             .footer { margin-top: 50px; font-size: 12px; color: #666; text-align: center; }
          </style>
        </head>
        <body>
          <h1>Reflect&Shoot Takım Rehberi</h1>
          <div class="team-info">
             <p><strong>Takım Adı:</strong> ${currentApplication.team.name}</p>
             <p><strong>Danışman:</strong> ${currentApplication.teacher.fullName}</p>
             <p><strong>Okul:</strong> ${currentApplication.teacher.school}</p>
          </div>
          
          <h3>Öğrenci Belge Takip Listesi</h3>
          <p>Lütfen aşağıdaki belgelerin her öğrenci için imzalanıp sisteme yüklendiğinden emin olunuz.</p>
          <br/>
          
          <div style="border: 1px solid #ddd; padding: 20px;">
             <div style="font-weight: bold; display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span style="width: 40%">Öğrenci</span>
                <span style="width: 30%">Veli İzni</span>
                <span style="width: 30%">KVKK Metni</span>
             </div>
             ${currentApplication.team.students.map(s => `
                <div class="student-row">
                    <span style="width: 40%">${s.firstName} ${s.lastName}</span>
                    <span style="width: 30%"><span class="checkbox"></span> İmzalandı</span>
                    <span style="width: 30%"><span class="checkbox"></span> İmzalandı</span>
                </div>
             `).join('')}
          </div>

          <div class="footer">
             Bu belge danışman öğretmen takibi içindir. Resmi evrak niteliği taşımaz.<br/>
             Reflect&Shoot 2026 Platformu
          </div>
          
          <script>window.print();</script>
        </body>
        </html>
      `;

      const printWindow = window.open('', '_blank');
      if(printWindow) {
          printWindow.document.write(content);
          printWindow.document.close();
      }
  };

  // --- Upload Logic (Documents) ---
  const handleUploadClick = (type: 'kvkk' | 'parent', studentId?: string) => {
      if (uploading) return;
      setActiveContext({ type, studentId });
      if (fileInputRef.current) {
          fileInputRef.current.value = ''; 
          fileInputRef.current.click();
      }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && activeContext) {
        const { type, studentId } = activeContext;
        const file = e.target.files[0];
        
        if (file.type !== 'application/pdf') {
            alert('Lütfen sadece PDF formatında belge yükleyiniz.');
            return;
        }

        const uploadKey = studentId ? `${type}-${studentId}` : type;
        setUploading(uploadKey);
        
        setTimeout(() => {
            if (!currentApplication) return;
            let updatedApp = { ...currentApplication };
            
            if (studentId) {
                updatedApp.team.students = updatedApp.team.students.map(s => {
                    if (s.id === studentId) {
                        return {
                            ...s,
                            hasKvkkConsent: type === 'kvkk' ? true : s.hasKvkkConsent,
                            hasParentalConsent: type === 'parent' ? true : s.hasParentalConsent,
                            kvkkConsentUrl: type === 'kvkk' ? URL.createObjectURL(file) : s.kvkkConsentUrl,
                            parentalConsentUrl: type === 'parent' ? URL.createObjectURL(file) : s.parentalConsentUrl,
                        };
                    }
                    return s;
                });
                
                const allDocs = updatedApp.team.students.every(s => s.hasKvkkConsent && s.hasParentalConsent);
                if (allDocs) {
                    updatedApp.team.isPreliminaryStageComplete = true;
                    if ([ApplicationStatus.DRAFT, ApplicationStatus.PRELIMINARY_SUBMITTED].includes(updatedApp.status)) {
                         updatedApp.status = ApplicationStatus.PRELIMINARY_SUBMITTED;
                    }
                }
            }
            
            updateApplication(updatedApp);
            setUploading(null);
            setActiveContext(null);
        }, 1500);
    }
  };

  // --- Link Submission Logic ---
  const openLinkModal = () => {
    // 1. Master Switch Check
    if (!isVideoSystemEnabled) {
        showToast('Video yükleme sistemi şu anda kapalıdır.', 'error');
        return;
    }

    // 2. Date Checks
    if (isRevisePhase) {
        if (!currentApplication?.team.isFinalist) {
            showToast('Revize yükleme hakkı sadece finalistler içindir.', 'error');
            return;
        }
    } else {
        if (currentDate > VIDEO_UPLOAD_END_DATE) {
            showToast('Video teslim süresi sona ermiştir.', 'error');
            return;
        }
        if (currentDate < VIDEO_UPLOAD_START_DATE) {
            const formattedDate = VIDEO_UPLOAD_START_DATE.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
            showToast(`Video yükleme sistemi ${formattedDate} tarihinde açılacaktır.`, 'info');
            return;
        }
    }
    setShowLinkModal(true);
  };

  const handleSubmitLink = async () => {
      if(!submissionLink) {
          showToast('Lütfen geçerli bir link giriniz.', 'error');
          return;
      }
      
      setIsSubmittingLink(true);
      
      try {
          if(!currentApplication) return;
          const updatedApp = { ...currentApplication };
          
          updatedApp.team.submissionDownloadUrl = submissionLink;
          updatedApp.team.videoStatus = 'SUBMITTED_LINK';
          updatedApp.team.isFinalStageComplete = true; // Teacher's part is done
          updatedApp.status = ApplicationStatus.FINAL_SUBMITTED; // "Video İnceleniyor"
          
          await updateApplication(updatedApp);
          setShowLinkModal(false);
          showToast('Video linki başarıyla teslim edildi. Teknik ekip tarafından incelenecek.', 'success');
      } catch(e) {
          showToast('Bir hata oluştu.', 'error');
      } finally {
          setIsSubmittingLink(false);
      }
  };


  const getStatusBadge = (status: ApplicationStatus) => {
    switch(status) {
        case ApplicationStatus.DRAFT: return <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold border border-gray-300">Taslak</span>;
        case ApplicationStatus.PRELIMINARY_SUBMITTED: return <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold border border-yellow-200">Evraklar Tamam</span>;
        case ApplicationStatus.FINAL_SUBMITTED: return <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold border border-blue-200">Video İnceleniyor</span>;
        case ApplicationStatus.APPROVED: return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold border border-green-200">Onaylandı</span>;
        case ApplicationStatus.GRADED: return <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-bold border border-purple-200">Puanlandı</span>;
        default: return <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-bold">{status}</span>;
    }
  };

  const timelineEvents = [
    { date: new Date(systemSettings.dates.applicationEnd).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }), label: 'Son Başvuru' },
    { date: new Date(systemSettings.dates.videoUploadStart).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }), label: 'Video Teslim Başlangıç' },
    { date: new Date(systemSettings.dates.videoUploadEnd).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }), label: 'Son Video Teslim' },
    { date: '1 Nis', label: 'Finalist Açıklanması' }, // Example for manual ones
    { date: '6-8-10 Nis', label: 'Online Workshoplar' },
    { date: new Date(systemSettings.dates.galaDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' }), label: 'Gala Gecesi' }
  ];

  const renderVersePreview = () => {
      const verse = teamForm.selectedVerse;
      if (!verse || !verseDetails[verse]) return null;
      
      const detail = verseDetails[verse];
      const renderText = (text: string, isArabic: boolean) => {
        return text.split(VERSE_SPLITTER).map((part, index) => (
          <React.Fragment key={index}>
            {index > 0 && <span className={`mx-2 inline-block ${isArabic ? 'text-amber-500 text-xl' : 'text-amber-500/50 text-xs'}`}>{isArabic ? ' ۞ ' : ' ✦ '}</span>}
            {part}
          </React.Fragment>
        ));
      };

      // Cinematic Card Style from Home.tsx
      return (
          <div className="mt-6 relative w-full p-6 bg-slate-900 rounded-2xl border border-amber-500/40 shadow-[0_0_40px_rgba(245,158,11,0.15)] animate-fadeIn overflow-hidden group">
                <div className="absolute -bottom-10 -right-10 text-amber-500/5 rotate-12">
                    <BookOpen size={150} />
                </div>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>
                
                <div className="relative z-10 flex flex-col gap-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <span className="text-amber-500 text-xs font-bold uppercase tracking-[0.3em] flex items-center gap-2 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                            <BookOpen size={12}/> Seçilen Ayet
                        </span>
                    </div>
                    <p className="font-serif text-xl md:text-2xl text-amber-400 leading-loose drop-shadow-sm" dir="rtl">
                        {renderText(detail.arabic, true)}
                    </p>
                    <div className="w-16 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent mx-auto"></div>
                    <p className="text-slate-200 text-sm italic font-light leading-relaxed font-serif">
                        "{renderText(detail.turkish, false)}"
                    </p>
                    {detail.english && (
                        <p className="text-slate-400 text-xs italic font-light leading-relaxed opacity-80">
                            "{renderText(detail.english, false)}"
                        </p>
                    )}
                </div>
          </div>
      );
  };

  // If user is a Student or Teacher but no application exists
  if (!currentApplication) {
    return (
        <div className="bg-slate-950 min-h-screen py-16 px-4 sm:px-6 lg:px-8 font-sans selection:bg-rose-600 selection:text-white relative overflow-hidden">
            {/* Same Welcome UI ... */}
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }}></div>
            
            <div className="max-w-4xl mx-auto relative z-10">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center p-4 bg-rose-900/20 text-rose-500 rounded-2xl mb-6 border border-rose-900/50 shadow-lg">
                        <Clapperboard size={36} />
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tight">Set Kurulumuna Hoş Geldiniz, {currentUser?.fullName}</h1>
                    <p className="text-slate-400 mt-2 text-lg font-light">Yönetmen koltuğuna oturmadan önce yapım ekibini oluştur.</p>
                </div>

                <div className="bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-800 ring-1 ring-white/5">
                     <div className="bg-gradient-to-r from-rose-950 to-rose-900 px-8 py-6 border-b border-rose-900 flex items-center justify-between">
                         <h2 className="text-xl font-bold text-white flex items-center"><Film className="mr-3 text-rose-400"/> Film Seti Kurulum Sihirbazı</h2>
                         <div className="text-xs font-bold text-rose-200 bg-white/10 px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm">Adım 1/2</div>
                    </div>
                    
                    <form onSubmit={handleSubmitTeam} className="p-8 md:p-10 space-y-12">
                          <section>
                            <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-4 mb-8 flex items-center gap-3">
                                <span className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs border border-slate-700 font-bold">1</span>
                                🎬 Yapım Ekibini Oluştur
                            </h3>
                            <div className="space-y-8">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-4 uppercase tracking-widest">Film Türü (Kategori)</label>
                                    <div className="grid md:grid-cols-2 gap-5">
                                        <div 
                                            onClick={() => setTeamForm({...teamForm, category: Category.LIVE_ACTION})}
                                            className={`cursor-pointer rounded-2xl border-2 p-6 transition-all relative overflow-hidden group ${teamForm.category === Category.LIVE_ACTION ? 'border-amber-500 bg-amber-900/10 shadow-lg' : 'border-slate-800 bg-slate-800/50 hover:border-slate-600'}`}
                                        >
                                             <div className="flex items-center gap-4 mb-3">
                                                <div className={`p-3 rounded-xl ${teamForm.category === Category.LIVE_ACTION ? 'bg-amber-500 text-black' : 'bg-slate-700 text-slate-400'}`}>
                                                    <Video size={24} />
                                                </div>
                                                <h4 className={`text-lg font-bold ${teamForm.category === Category.LIVE_ACTION ? 'text-white' : 'text-slate-300'}`}>Canlı Çekim Filmi</h4>
                                            </div>
                                        </div>
                                         <div 
                                            onClick={() => setTeamForm({...teamForm, category: Category.AI_ANIMATION})}
                                            className={`cursor-pointer rounded-2xl border-2 p-6 transition-all relative overflow-hidden group ${teamForm.category === Category.AI_ANIMATION ? 'border-purple-500 bg-purple-900/10 shadow-lg' : 'border-slate-800 bg-slate-800/50 hover:border-slate-600'}`}
                                        >
                                            <div className="flex items-center gap-4 mb-3">
                                                <div className={`p-3 rounded-xl ${teamForm.category === Category.AI_ANIMATION ? 'bg-purple-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                                                    <Cpu size={24} />
                                                </div>
                                                <h4 className={`text-lg font-bold ${teamForm.category === Category.AI_ANIMATION ? 'text-white' : 'text-slate-300'}`}>AI Animasyon</h4>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">Yapım Adı (Takım)</label>
                                        <input name="name" value={teamForm.name} onChange={handleTeamChange} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3.5 outline-none text-white placeholder-slate-600 font-medium" placeholder="Örn: Kuzey Yıldızı" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">Tema Seçimi</label>
                                        <select name="theme" value={teamForm.theme} onChange={handleTeamChange} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3.5 outline-none text-white font-medium">
                                            {Object.values(Theme).map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                </div>
                                {teamForm.theme === Theme.AYET && (
                                    <div className="bg-amber-900/10 p-5 rounded-xl border border-amber-900/30 transition-all">
                                        <label className="block text-sm font-bold text-amber-500 mb-2 flex items-center gap-2"><BookOpen size={16}/> Hangi Ayet?</label>
                                        <select name="selectedVerse" value={teamForm.selectedVerse} onChange={handleTeamChange} className="w-full bg-slate-900 border border-amber-500/30 rounded-xl p-3.5 outline-none text-white focus:border-amber-500">
                                            <option value="">Senaryonun temelini oluşturan ayeti seçiniz</option>
                                            {versesList.map(v => <option key={v} value={v}>{v}</option>)}
                                        </select>
                                        
                                        {/* Cinematic Verse Preview */}
                                        {renderVersePreview()}
                                    </div>
                                )}
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">Yapım Logosu (128x128 PNG Zorunlu)</label>
                                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 border-dashed text-center">
                                        <input type="file" onChange={handleLogoUpload} accept="image/png" className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-rose-900 file:text-rose-100 hover:file:bg-rose-800"/>
                                        <div className="mt-4 p-4 bg-rose-900/20 rounded-lg border border-rose-900/50 flex items-start gap-3 text-left">
                                            <AlertTriangle size={20} className="text-rose-500 flex-shrink-0 mt-0.5"/>
                                            <div className="text-xs text-rose-300 leading-relaxed">
                                                <strong className="block text-rose-400 mb-1">DİKKAT: Katı Format Kuralı</strong>
                                                Yükleyeceğiniz logo dosyası kesinlikle <strong>PNG formatında</strong> ve tam olarak <strong>128x128 piksel</strong> boyutunda olmalıdır. Aksi takdirde sistem dosyayı reddeder.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                        <section>
                            <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-8">
                                <h3 className="text-lg font-bold text-white flex items-center gap-3">
                                    <span className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs border border-slate-700 font-bold">2</span>
                                    🎭 Cast & Ekip Seçimi
                                </h3>
                                <span className="bg-teal-900/30 text-teal-400 text-xs font-bold px-3 py-1.5 rounded-full border border-teal-500/30 shadow-sm">{students.length} / 6 Üye</span>
                            </div>
                            <div className="grid md:grid-cols-1 gap-5">
                                {students.map((student, idx) => (
                                    <div key={idx} className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 flex flex-col md:flex-row gap-5 items-end">
                                        <div className="flex-1 w-full"><input value={student.firstName} onChange={(e) => handleStudentChange(idx, 'firstName', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white" placeholder="Ad" /></div>
                                        <div className="flex-1 w-full"><input value={student.lastName} onChange={(e) => handleStudentChange(idx, 'lastName', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white" placeholder="Soyad" /></div>
                                        <div className="w-full md:w-32"><input value={student.grade} onChange={(e) => handleStudentChange(idx, 'grade', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white" placeholder="Sınıf" /></div>
                                    </div>
                                ))}
                            </div>
                             {students.length < 6 && (
                                <button type="button" onClick={addStudent} className="mt-6 w-full py-4 border-2 border-dashed border-slate-700 rounded-2xl text-slate-400 font-medium hover:border-teal-500 hover:text-teal-400 hover:bg-slate-800/50 transition-all flex items-center justify-center gap-2">
                                    <UserPlus size={20} /> Yeni Ekip Üyesi Ekle
                                </button>
                            )}
                        </section>
                        <div className="pt-6 border-t border-slate-800">
                            <button type="submit" disabled={isCreating} className="w-full bg-gradient-to-r from-rose-700 to-rose-600 hover:from-rose-600 hover:to-rose-500 text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center shadow-lg shadow-rose-900/30 transform transition hover:scale-[1.01] disabled:opacity-70 disabled:cursor-not-allowed text-lg">
                                {isCreating ? 'Set Kuruluyor...' : 'Kayıt ve Motor!'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
  }

  const { team, status } = currentApplication;
  const isFinalist = team.isFinalist;
  const youtubeEmbedUrl = team.videoUrl ? getYouTubeEmbedUrl(team.videoUrl) : null;

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="application/pdf" />

      {/* REVEAL MODAL */}
      {showRevealModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-fadeIn">
              {/* ... existing modal code ... */}
               <div className={`relative w-full max-w-3xl bg-white rounded-3xl p-10 md:p-14 text-center shadow-2xl overflow-hidden border-8 ${isFinalist ? 'border-amber-400' : 'border-slate-200'}`}>
                   {isFinalist ? (
                       <>
                           <div className="w-32 h-32 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce shadow-xl">
                               <Trophy size={64} className="drop-shadow-sm" />
                           </div>
                           <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">TEBRİKLER!</h2>
                           <h3 className="text-2xl md:text-3xl font-bold text-amber-500 mb-6">Büyük Finale Kaldınız!</h3>
                           <p className="text-lg text-slate-600 mb-10 max-w-lg mx-auto leading-relaxed">
                               Jüri ön elemeyi başarıyla geçtiniz. Artık <strong>Reflect&Shoot Akademi</strong> kapıları sizin için açıldı.
                           </p>
                           <button onClick={() => setShowRevealModal(false)} className="bg-amber-500 hover:bg-amber-400 text-white font-black py-4 px-10 rounded-full shadow-lg shadow-amber-500/30 transform hover:scale-105 transition-all text-lg">
                               Akademiye Giriş Yap
                           </button>
                       </>
                   ) : (
                       <>
                           <div className="w-24 h-24 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-6">
                               <HeartHandshake size={48} />
                           </div>
                           <h2 className="text-3xl font-black text-slate-800 mb-4">Teşekkür Ederiz</h2>
                           <p className="text-slate-600 mb-8 max-w-lg mx-auto leading-relaxed">
                               Bu yıl finale kalan ekipler arasında yer alamadınız. Ancak hikayenizi bizimle paylaştığınız için minnettarız.
                           </p>
                           <button onClick={() => setShowRevealModal(false)} className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-8 rounded-xl transition-all">
                               Panele Dön
                           </button>
                       </>
                   )}
              </div>
          </div>
      )}
      
      {/* LINK SUBMISSION MODAL */}
      {showLinkModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
              <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl relative">
                   <button onClick={() => setShowLinkModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                       <ExternalLink size={20} className="rotate-180"/> {/* Close Icon */}
                   </button>
                   <div className="text-center mb-6">
                       <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                           <LinkIcon size={32} />
                       </div>
                       <h3 className="text-2xl font-black text-slate-900">Video Teslimi</h3>
                       <p className="text-slate-500 text-sm mt-2">
                           Videonuzu Google Drive, WeTransfer veya Dropbox gibi bir servise yükleyip, <strong>indirme bağlantısını</strong> buraya yapıştırın.
                       </p>
                   </div>
                   
                   <div className="space-y-4">
                       <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase mb-2">İndirme Bağlantısı</label>
                           <input 
                              type="url" 
                              value={submissionLink}
                              onChange={(e) => setSubmissionLink(e.target.value)}
                              placeholder="https://drive.google.com/..."
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-blue-500 text-slate-900"
                           />
                       </div>
                       
                       <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 text-xs text-amber-800 flex gap-2">
                           <AlertCircle size={16} className="flex-shrink-0" />
                           Linkin herkese açık olduğundan veya şifre gerektirmediğinden emin olunuz.
                       </div>

                       <button 
                         onClick={handleSubmitLink} 
                         disabled={isSubmittingLink}
                         className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold shadow-lg transition-all disabled:opacity-70"
                       >
                           {isSubmittingLink ? 'Gönderiliyor...' : 'Linki Gönder'}
                       </button>
                   </div>
              </div>
          </div>
      )}

      {/* Header Banner */}
      <div className="bg-slate-900 text-white pb-32 pt-16 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }}></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                  <div className="w-28 h-28 bg-white rounded-full p-1 flex items-center justify-center overflow-hidden border-4 border-amber-400 shadow-2xl relative">
                      {team.logoUrl ? <img src={team.logoUrl} className="w-full h-full object-cover rounded-full" /> : <Users className="text-gray-300" size={40} />}
                  </div>
                  <div className="flex-1">
                      <h1 className="text-4xl font-black tracking-tight flex items-center justify-center md:justify-start gap-3">
                          {team.name}
                          {isFinalist && <span className="bg-amber-500 text-black text-xs px-3 py-1 rounded-full font-black tracking-widest uppercase shadow-lg shadow-amber-500/20">Finalist</span>}
                      </h1>
                      <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-slate-300 mt-3 text-sm font-medium">
                          <span className="bg-slate-800 px-3 py-1 rounded-full border border-slate-700 shadow-sm">{team.category}</span>
                          <span className="flex items-center"><Award size={16} className="mr-1 text-amber-500"/> {team.theme}</span>
                          <span className="flex items-center"><Users size={16} className="mr-1 text-teal-500"/> {team.students.length} Öğrenci</span>
                      </div>
                  </div>
                  <div className="bg-white/5 backdrop-blur-md px-8 py-5 rounded-2xl border border-white/10 text-center shadow-xl">
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Başvuru Durumu</p>
                      <div className="text-xl font-bold">{isGalaPhase ? <span className="text-rose-400">Gala Bekleniyor</span> : getStatusBadge(status)}</div>
                  </div>
              </div>
              
              {isFinalist && isAcademyActive && (
                  <div className="mt-12 flex justify-center md:justify-start gap-4">
                      <Link to="/academy" className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-amber-900/20 transform hover:-translate-y-1 transition-all">
                          <BookOpen size={20} /> Online Akademi Paneli
                      </Link>
                  </div>
              )}
          </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20">
          <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                   <div className="bg-teal-50 p-3 rounded-full text-teal-600 border border-teal-100"><CheckCircle size={24} /></div>
                   <p className="text-slate-800 font-bold text-lg">Takımınız başarıyla oluşturulmuştur.</p>
              </div>
              <div className="flex gap-3">
                  <CertificateGenerator />
                  <button onClick={printTeacherGuide} className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold py-3 px-6 rounded-xl flex items-center text-sm transition-colors border border-slate-200 shadow-sm">
                      <FileDown size={18} className="mr-2" /> Görev Rehberi İndir (PDF)
                  </button>
              </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                   <div className={`bg-white rounded-3xl shadow-lg p-8 border border-gray-100 relative overflow-hidden transition-all duration-300 ${team.isPreliminaryStageComplete ? 'border-l-8 border-l-green-500' : ''}`}>
                      <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center">
                          <span className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center mr-4 text-sm font-bold shadow-md">1</span>
                          Ön Başvuru & Belgeler
                      </h2>
                      <div className="space-y-4 pl-0 sm:pl-14">
                          {team.students.map((student) => (
                              <div key={student.id} className="bg-gray-50 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-gray-100">
                                  <div className="flex items-center gap-4 w-full sm:w-auto">
                                      <div className="w-12 h-12 rounded-full bg-white text-slate-700 flex items-center justify-center font-bold text-lg shadow-sm border border-gray-100">{student.firstName[0]}</div>
                                      <div><p className="font-bold text-slate-900 text-base">{student.firstName} {student.lastName}</p></div>
                                  </div>
                                  <div className="flex gap-3 w-full sm:w-auto">
                                      <button onClick={() => handleUploadClick('parent', student.id)} className={`flex-1 sm:flex-none flex items-center justify-center px-4 py-2.5 rounded-xl text-xs font-bold transition-all border shadow-sm ${student.hasParentalConsent ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white border-gray-200'}`}>
                                          {student.hasParentalConsent ? <CheckCircle size={14} className="mr-2"/> : <Upload size={14} className="mr-2"/>} {student.hasParentalConsent ? 'Yüklendi' : 'Veli İzni (PDF)'}
                                      </button>
                                      <button onClick={() => handleUploadClick('kvkk', student.id)} className={`flex-1 sm:flex-none flex items-center justify-center px-4 py-2.5 rounded-xl text-xs font-bold transition-all border shadow-sm ${student.hasKvkkConsent ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white border-gray-200'}`}>
                                          {student.hasKvkkConsent ? <CheckCircle size={14} className="mr-2"/> : <Upload size={14} className="mr-2"/>} {student.hasKvkkConsent ? 'Yüklendi' : 'KVKK (PDF)'}
                                      </button>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>

                  <div className={`bg-white rounded-3xl shadow-lg p-8 border border-gray-100 transition-all duration-300 ${!team.isPreliminaryStageComplete ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
                      <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center justify-between">
                          <div className="flex items-center">
                              <span className="w-10 h-10 rounded-full bg-rose-100 text-rose-900 flex items-center justify-center mr-4 text-sm font-bold shadow-md">2</span>
                              {isRevisePhase && isFinalist ? "Final Kurgu (Revize) Teslimi" : "Video Teslimi"}
                          </div>
                      </h2>
                      
                      {!team.isPreliminaryStageComplete ? (
                          <div className="bg-amber-50 text-amber-800 p-4 rounded-xl text-sm mb-6 flex items-center font-medium ml-14 border border-amber-100">
                              <AlertCircle size={18} className="mr-3 flex-shrink-0"/>
                              Video yüklemesi yapabilmek için önce 1. Aşamada tüm belgeleri tamamlamanız gerekmektedir.
                          </div>
                      ) : (
                         <>
                            {isBeforeUploadPhase && !isVideoSystemEnabled && (
                                <div className="ml-0 sm:ml-14 bg-white border border-gray-200 text-slate-800 rounded-2xl p-8 relative overflow-hidden group shadow-lg">
                                     <div className="relative z-10 text-center">
                                         <h3 className="text-2xl font-black text-slate-900 mb-2">Motor! Şimdi Sahne Sizin.</h3>
                                         <p className="text-slate-500 mb-6 text-lg font-light max-w-lg mx-auto">
                                             Yükleme ekranı <span className="text-amber-600 font-bold border-b border-amber-200">{VIDEO_UPLOAD_START_DATE.toLocaleDateString('tr-TR')}</span> tarihinde açılacaktır.
                                         </p>
                                         <div className="mt-8 pt-6 border-t border-gray-100">
                                            <p className="text-amber-600 font-serif italic text-lg leading-relaxed">"Ey iman edenler! Sabır ve namazla yardım dileyin. Şüphesiz Allah sabredenlerin yanındadır."</p>
                                            <div className="flex items-center justify-center gap-2 mt-3 text-amber-600/60 text-xs font-bold uppercase tracking-widest"><BookOpen size={14} /> Bakara: 153</div>
                                        </div>
                                     </div>
                                </div>
                            )}

                            {isAfterFirstDeadline && !isRevisePhase && team.videoStatus !== 'UPLOADED' && team.videoStatus !== 'SUBMITTED_LINK' && (
                                 <div className="ml-0 sm:ml-14 bg-red-50 border border-red-100 text-red-800 p-8 rounded-2xl text-center">
                                      <Clock size={40} className="mx-auto mb-3 text-red-400"/>
                                      <h3 className="text-xl font-bold mb-2">Süre Doldu</h3>
                                      <p className="text-sm">Video yükleme süresi sona ermiştir.</p>
                                 </div>
                            )}

                            {((isVideoUploadPhase) || (isRevisePhase && isFinalist) || (team.videoStatus === 'UPLOADED' || team.videoStatus === 'SUBMITTED_LINK')) && (
                                <div 
                                    className={`ml-0 sm:ml-14 border-2 border-dashed rounded-2xl p-10 text-center transition-all group relative ${isGalaPhase ? 'border-gray-200 bg-gray-50 opacity-80 pointer-events-none' : 'border-gray-300 bg-white'}`} 
                                >
                                    {team.videoStatus === 'UPLOADED' ? (
                                        <div className="py-2">
                                            {/* Final YouTube Embed or Uploaded Success */}
                                            {youtubeEmbedUrl ? (
                                                <div className="mb-4 rounded-xl overflow-hidden shadow-lg">
                                                     <iframe 
                                                        src={youtubeEmbedUrl} 
                                                        className="w-full aspect-video" 
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                                        allowFullScreen
                                                     ></iframe>
                                                </div>
                                            ) : (
                                                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm"><CheckCircle size={40} /></div>
                                            )}
                                            <h3 className="text-xl font-bold text-gray-900">{isRevisePhase && isFinalist ? "Revize Video Yüklendi" : "Video Başarıyla Yüklendi"}</h3>
                                            {youtubeEmbedUrl && <p className="text-sm text-green-600 mt-2 font-medium">Yayınlandı</p>}
                                        </div>
                                    ) : team.videoStatus === 'SUBMITTED_LINK' ? (
                                        <div className="py-2">
                                             <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm"><Clock size={40} /></div>
                                             <h3 className="text-xl font-bold text-gray-900">İnceleniyor...</h3>
                                             <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">
                                                 Video linkiniz alındı. Teknik ekibimiz dosyayı kontrol edip sisteme yükleyecektir.
                                             </p>
                                             <div className="mt-4 bg-slate-100 p-2 rounded text-xs text-slate-500 truncate max-w-xs mx-auto border border-gray-200">
                                                 {team.submissionDownloadUrl}
                                             </div>
                                        </div>
                                    ) : (
                                        (!isAfterFirstDeadline || isRevisePhase) && !isGalaPhase && (
                                            <div 
                                                onClick={openLinkModal}
                                                className="cursor-pointer hover:bg-slate-50 hover:border-blue-500 p-4 -m-4 rounded-2xl transition-all"
                                            >
                                                <div className="w-20 h-20 bg-white text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-md border border-gray-100">
                                                    <LinkIcon size={36} />
                                                </div>
                                                <h3 className="text-xl font-bold text-gray-900">{isRevisePhase ? "Revize Linki Gönder" : "Video Linki Teslim Et"}</h3>
                                                <p className="text-sm text-slate-500 mt-2">Drive, WeTransfer veya Dropbox linki</p>
                                            </div>
                                        )
                                    )}
                                </div>
                            )}
                         </>
                      )}
                  </div>
              </div>

              <div className="space-y-6">
                  <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100">
                      <h3 className="font-bold text-gray-900 mb-6 flex items-center"><Clock className="mr-2 text-teal-500" size={20} /> Takvim</h3>
                      <div className="space-y-6 relative pl-2">
                          <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-gray-100"></div>
                          {timelineEvents.map((event, idx) => (
                                 <div key={idx} className="relative pl-8 flex flex-col">
                                     <span className={`absolute left-[13px] top-1.5 w-3.5 h-3.5 rounded-full border-2 z-10 ${currentDate >= new Date() /* Simplified check */ ? 'bg-teal-500 border-teal-500' : 'bg-white border-teal-500'}`}></span>
                                     <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">{event.date}</p>
                                     <p className={`font-bold text-sm text-gray-800`}>{event.label}</p>
                                 </div>
                             ))}
                      </div>
                  </div>
                  
                  {/* Chat Area on Dashboard - LIGHT MODE (Fixed Prop Passing) */}
                  <ChatArea appId={currentApplication.id} theme="light" />

              </div>
          </div>
      </div>
    </div>
  );
};
