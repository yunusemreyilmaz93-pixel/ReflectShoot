
import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { ApplicationStatus, Category, Theme, UserRole, Student } from '../types';
import { CheckCircle, AlertCircle, Upload, Video, Award, Clock, Users, FileDown, Clapperboard, Film, UserPlus, BookOpen, Trophy, HeartHandshake, Cpu, Link as LinkIcon, ExternalLink, Play, AlertTriangle, CheckCircle2, ShieldCheck, PenTool, FileText, ChevronRight, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { versesList, verseDetails, VERSE_SPLITTER } from '../data/verses';
import { ChatArea } from '../components/ChatArea';
import { CertificateGenerator } from '../components/CertificateGenerator';
import { getYouTubeEmbedUrl } from '../lib/videoUtils';
import { uploadFileToR2, uploadPublicLogo } from '../lib/cloudStorage';
import jsPDF from 'jspdf';

export const Dashboard: React.FC = () => {
  const { currentApplication, updateApplication, createApplication, currentUser, currentDate, systemSettings, showToast, getSignedUrl } = useAppContext();
  const [uploading, setUploading] = useState<string | null>(null);
  
  // UI State for tracking download steps
  const [downloadedDocs, setDownloadedDocs] = useState<Set<string>>(new Set());

  const VIDEO_UPLOAD_START_DATE = new Date(systemSettings.dates.videoUploadStart);
  const VIDEO_UPLOAD_END_DATE = new Date(systemSettings.dates.videoUploadEnd);
  
  const FINALIST_REVEAL_START = new Date(systemSettings.dates.finalistRevealStart || '2026-04-01T00:00:00');
  const FINALIST_REVEAL_END = new Date(systemSettings.dates.finalistRevealEnd || '2026-04-04T23:59:59');
  
  const ACADEMY_START_DATE = new Date(systemSettings.dates.academyStart);
  
  const REVISE_UPLOAD_START = new Date(systemSettings.dates.reviseUploadStart || '2026-04-13T00:00:00');
  const REVISE_UPLOAD_END = new Date(systemSettings.dates.reviseUploadEnd || '2026-05-04T23:59:59');

  const GALA_DATE = new Date(systemSettings.dates.galaDate);

  const isVideoSystemEnabled = systemSettings.features.videoUploadActive;
  
  const isVideoUploadPhase = isVideoSystemEnabled && (currentDate >= VIDEO_UPLOAD_START_DATE && currentDate <= VIDEO_UPLOAD_END_DATE);
  const isBeforeUploadPhase = currentDate < VIDEO_UPLOAD_START_DATE;
  const isAfterFirstDeadline = currentDate > VIDEO_UPLOAD_END_DATE;
  
  const isRevealPhase = currentDate >= FINALIST_REVEAL_START && currentDate <= FINALIST_REVEAL_END;
  const isAcademyActive = currentDate >= ACADEMY_START_DATE;
  
  const isRevisePhase = isVideoSystemEnabled && (currentDate >= REVISE_UPLOAD_START && currentDate <= REVISE_UPLOAD_END);
  const isGalaPhase = currentDate >= GALA_DATE;

  const isFinalist = currentApplication?.team.isFinalist;
  const youtubeEmbedUrl = currentApplication?.team.videoUrl ? getYouTubeEmbedUrl(currentApplication.team.videoUrl) : null;

  const [isCreating, setIsCreating] = useState(false);
  const [teamForm, setTeamForm] = useState({ name: '', category: Category.LIVE_ACTION, theme: Theme.AYET, selectedVerse: '' });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  
  const [students, setStudents] = useState<{firstName: string; lastName: string; grade: string}[]>([
      { firstName: '', lastName: '', grade: '' },
      { firstName: '', lastName: '', grade: '' },
      { firstName: '', lastName: '', grade: '' } 
  ]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeContext, setActiveContext] = useState<{type: 'kvkk' | 'parent', studentId: string, docId?: string} | null>(null);
  
  const [verificationModal, setVerificationModal] = useState<{type: 'kvkk' | 'parent', studentId: string, expectedId: string} | null>(null);
  const [inputDocId, setInputDocId] = useState('');

  const [showLinkModal, setShowLinkModal] = useState(false);
  const [submissionLink, setSubmissionLink] = useState('');
  const [isSubmittingLink, setIsSubmittingLink] = useState(false);

  const [showRevealModal, setShowRevealModal] = useState(false);

  useEffect(() => {
    if (isRevealPhase && currentApplication) {
       setShowRevealModal(true);
    }
  }, [isRevealPhase, currentApplication]);

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

  const handleTeamChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setTeamForm({...teamForm, [e.target.name]: e.target.value});
  
  const handleStudentChange = (index: number, field: string, value: string) => {
      const newStudents = [...students];
      newStudents[index] = { ...newStudents[index], [field]: value };
      setStudents(newStudents);
  };

  const addStudent = () => {
      if(students.length < 6) setStudents([...students, { firstName: '', lastName: '', grade: '' }]);
  };

  const resizeImageTo128 = (file: File): Promise<File> => {
      return new Promise((resolve, reject) => {
          const img = new Image();
          img.src = URL.createObjectURL(file);
          img.onload = () => {
              const canvas = document.createElement('canvas');
              canvas.width = 128;
              canvas.height = 128;
              const ctx = canvas.getContext('2d');
              if (!ctx) {
                  reject(new Error("Canvas context failed"));
                  return;
              }
              ctx.drawImage(img, 0, 0, 128, 128);
              
              canvas.toBlob((blob) => {
                  if (blob) {
                      const resizedFile = new File([blob], "team-logo.png", { type: "image/png" });
                      resolve(resizedFile);
                  } else {
                      reject(new Error("Canvas blob failed"));
                  }
                  URL.revokeObjectURL(img.src);
              }, "image/png");
          };
          img.onerror = (err) => {
              URL.revokeObjectURL(img.src);
              reject(err);
          };
      });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          
          try {
              const resizedFile = await resizeImageTo128(file);
              setLogoFile(resizedFile);
              setFormErrors({...formErrors, logo: ''});
          } catch (error) {
              console.error("Logo işlenemedi:", error);
              alert("Resim işlenirken bir hata oluştu. Lütfen başka bir görsel deneyin.");
          }
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

  const handleSubmitTeam = async (e: React.FormEvent) => {
      e.preventDefault();
      if(validateTeamForm()) {
          setIsCreating(true);
          
          try {
              const teamId = Math.random().toString(36).substring(7);
              
              // Define logoKey as string | undefined (not null)
              let logoKey: string | undefined = undefined;

              if (logoFile) {
                  try {
                      logoKey = await uploadPublicLogo(logoFile, teamId);
                  } catch (uploadError) {
                      console.warn("Logo upload failed, proceeding with default.", uploadError);
                      showToast('Logo yüklenemedi, varsayılan logo atandı.', 'info');
                  }
              }

              await createApplication({
                  id: teamId, 
                  teamName: teamForm.name,
                  category: teamForm.category,
                  theme: teamForm.theme,
                  selectedVerse: teamForm.theme === Theme.AYET ? teamForm.selectedVerse : undefined, // Ensure undefined if empty
                  logoKey: logoKey,
                  students
              });
              
              localStorage.removeItem('teamFormDraft');
              localStorage.removeItem('teamStudentsDraft');
              
          } catch (error: any) {
              console.error(error);
              showToast(error.message || 'Takım oluşturulurken hata oluştu.', 'error');
          } finally {
              setIsCreating(false);
          }
      }
  };

  const generateAndDownloadDoc = async (type: 'kvkk' | 'parent', student: Student) => {
      if(!currentApplication) return;

      const randomCode = Math.floor(10000 + Math.random() * 90000).toString();
      const docId = type === 'kvkk' ? `RFS-AR-${randomCode}` : `RFS-VE-${randomCode}`;
      
      const updatedStudents = currentApplication.team.students.map(s => {
          if (s.id === student.id) {
              return {
                  ...s,
                  [type === 'kvkk' ? 'kvkkExpectedId' : 'parentalExpectedId']: docId
              };
          }
          return s;
      });
      
      const newApp = { ...currentApplication, team: { ...currentApplication.team, students: updatedStudents } };
      await updateApplication(newApp);

      const doc = new jsPDF();
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.text(type === 'kvkk' ? "AÇIK RIZA METNİ" : "VELI IZIN BELGESI", 105, 30, { align: "center" });
      
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`Reflect & Shoot Kisa Film Yarismasi`, 105, 40, { align: "center" });

      doc.setFontSize(10);
      doc.text("Bu belge sistem tarafindan otomatik olusturulmustur.", 105, 50, { align: "center" });

      doc.setDrawColor(0);
      doc.setFillColor(245, 245, 245);
      doc.rect(20, 60, 170, 40, "F");
      
      doc.setFont("helvetica", "bold");
      doc.text("OGRENCI BILGILERI", 25, 70);
      doc.setFont("helvetica", "normal");
      doc.text(`Ad Soyad: ${student.firstName} ${student.lastName}`, 25, 80);
      doc.text(`Okul: ${currentApplication.teacher.school}`, 25, 88);
      doc.text(`Sinif: ${student.grade}`, 25, 96);

      doc.setFontSize(10);
      const bodyText = type === 'kvkk' 
          ? "Yukarida kimlik bilgileri yer alan ogrencimin, Reflect & Shoot yarismasina katilimi surecinde kisisel verilerinin islenmesine, goruntu ve ses kayitlarinin yarisma tanitimlarinda kullanilmasina 6698 sayili KVKK kapsaminda acik riza gosteriyorum."
          : "Yukarida kimlik bilgileri yer alan velisi bulundugum ogrencinin, Konya Anadolu Imam Hatip Lisesi tarafindan duzenlenen Reflect & Shoot Kisa Film Yarismasina katilmasina, cekimlerde rol almasina ve ekipte gorev yapmasina izin veriyorum.";
      
      const splitText = doc.splitTextToSize(bodyText, 170);
      doc.text(splitText, 20, 120);

      doc.text("Tarih: ...../...../2026", 20, 160);
      doc.text("Veli Ad Soyad: .......................................", 20, 170);
      doc.text("Imza:", 20, 180);

      doc.setTextColor(200);
      doc.setFontSize(60);
      doc.text(docId, 105, 150, { align: 'center', angle: 45 });

      doc.setTextColor(0);
      doc.setFontSize(12);
      doc.setFont("courier", "bold");
      
      doc.setDrawColor(0);
      doc.rect(140, 10, 50, 15);
      doc.text(`BELGE ID:`, 142, 16);
      doc.setTextColor(220, 38, 38);
      doc.text(docId, 142, 22);

      doc.save(`${type === 'kvkk' ? 'Acik_Riza' : 'Veli_Izin'}_${student.firstName}_${student.lastName}.pdf`);
      showToast(`${type === 'kvkk' ? 'Açık Rıza' : 'Veli İzin'} belgesi oluşturuldu.`, 'success');
  };

  const handleUploadClick = (type: 'kvkk' | 'parent', student: Student) => {
      const expectedId = type === 'kvkk' ? student.kvkkExpectedId : student.parentalExpectedId;
      
      if (!expectedId) {
          alert("Lütfen önce belgeyi indiriniz. Sistem belge ID'sini oluşturmalıdır.");
          return;
      }

      setVerificationModal({ type, studentId: student.id, expectedId });
      setInputDocId('');
  };

  const verifyAndTriggerUpload = () => {
      if (!verificationModal) return;
      
      const prefix = verificationModal.type === 'kvkk' ? 'RFS-AR-' : 'RFS-VE-';
      const fullInputId = `${prefix}${inputDocId.trim()}`;

      if (fullInputId !== verificationModal.expectedId) {
          alert(`HATA: Girdiğiniz kod (${fullInputId}) belge üzerindeki kod ile uyuşmuyor. Lütfen doğru belgeyi yüklediğinizden emin olun.`);
          return;
      }

      const { type, studentId, expectedId } = verificationModal;
      setVerificationModal(null);
      
      setActiveContext({ type, studentId, docId: expectedId });
      setTimeout(() => {
          if (fileInputRef.current) {
              fileInputRef.current.value = ''; 
              fileInputRef.current.click();
          }
      }, 100);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && activeContext) {
        if(!currentApplication || !currentUser) {
            showToast("Oturum zaman aşımına uğradı veya başvuru verisi eksik.", "error");
            return;
        }

        const { type, studentId, docId } = activeContext;
        const file = e.target.files[0];
        
        if (file.type !== 'application/pdf') {
            alert('Lütfen sadece PDF formatında belge yükleyiniz.');
            return;
        }

        const uploadKey = studentId ? `${type}-${studentId}` : type;
        setUploading(uploadKey);
        
        try {
            const teamId = currentApplication.team.id;
            const customKey = `teams/${teamId}/students/${studentId}/docs/${docId || Date.now()}.pdf`;

            // Returns the key (string)
            const fileKey = await uploadFileToR2(file, customKey);

            if (!fileKey) throw new Error("Yükleme anahtarı alınamadı.");

            let updatedApp = { ...currentApplication };
            
            if (studentId) {
                updatedApp.team.students = updatedApp.team.students.map(s => {
                    if (s.id === studentId) {
                        return {
                            ...s,
                            hasKvkkConsent: type === 'kvkk' ? true : s.hasKvkkConsent,
                            hasParentalConsent: type === 'parent' ? true : s.hasParentalConsent,
                            kvkkConsentUrl: type === 'kvkk' ? fileKey : s.kvkkConsentUrl, // Use fileKey
                            parentalConsentUrl: type === 'parent' ? fileKey : s.parentalConsentUrl, // Use fileKey
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
            
            await updateApplication(updatedApp);
            showToast('Belge doğrulandı ve güvenli kasaya yüklendi.', 'success');

        } catch (err: any) {
            console.error(err);
            showToast(err.message || 'Yükleme başarısız.', 'error');
        } finally {
            setUploading(null);
            setActiveContext(null);
        }
    }
  };

  // Helper to handle download state
  const handleDownloadProcess = (type: 'kvkk' | 'parent', student: Student) => {
      generateAndDownloadDoc(type, student);
      // Mark as downloaded in UI state to enable upload button
      setDownloadedDocs(prev => new Set(prev).add(`${student.id}-${type}`));
  };

  const renderVersePreview = () => {
        if (!teamForm.selectedVerse || !verseDetails[teamForm.selectedVerse]) return null;
        const v = verseDetails[teamForm.selectedVerse];
        return (
            <div className="mt-4 p-4 bg-slate-900 rounded-xl border border-amber-500/30">
                <p className="text-amber-500 font-serif text-lg text-right mb-2" dir="rtl">{v.arabic.split(VERSE_SPLITTER)[0]}</p>
                <p className="text-slate-300 text-sm italic">{v.turkish.split(VERSE_SPLITTER)[0]}</p>
            </div>
        );
  };

  const handleSubmitLink = async () => {
        if (!submissionLink || !currentApplication) return;
        setIsSubmittingLink(true);
        try {
            const updatedApp = {
                ...currentApplication,
                team: {
                    ...currentApplication.team,
                    submissionDownloadUrl: submissionLink,
                    videoStatus: 'SUBMITTED_LINK' as const
                },
                status: ApplicationStatus.FINAL_SUBMITTED
            };
            await updateApplication(updatedApp);
            setShowLinkModal(false);
            showToast('Video linki başarıyla gönderildi.', 'success');
        } catch (error: any) {
            console.error(error);
            showToast('Video linki gönderilemedi.', 'error');
        } finally {
            setIsSubmittingLink(false);
        }
  };

  const getStatusBadge = (status: ApplicationStatus) => {
        const styles = {
            [ApplicationStatus.DRAFT]: 'bg-slate-800 text-slate-400 border-slate-700',
            [ApplicationStatus.PRELIMINARY_SUBMITTED]: 'bg-blue-900/30 text-blue-400 border-blue-800',
            [ApplicationStatus.FINAL_SUBMITTED]: 'bg-purple-900/30 text-purple-400 border-purple-800',
            [ApplicationStatus.UNDER_REVIEW]: 'bg-amber-900/30 text-amber-400 border-amber-800',
            [ApplicationStatus.APPROVED]: 'bg-emerald-900/30 text-emerald-400 border-emerald-800',
            [ApplicationStatus.GRADED]: 'bg-teal-900/30 text-teal-400 border-teal-800',
            [ApplicationStatus.REJECTED]: 'bg-red-900/30 text-red-400 border-red-800',
            [ApplicationStatus.NEEDS_FIX]: 'bg-orange-900/30 text-orange-400 border-orange-800',
            [ApplicationStatus.DISQUALIFIED]: 'bg-slate-900 text-white border-slate-700',
        };
        return <span className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${styles[status] || 'bg-slate-800'}`}>{status}</span>;
  };

  const printTeacherGuide = () => {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("Danışman Öğretmen Rehberi", 10, 10);
      doc.setFontSize(12);
      doc.text("Bu belge yapım aşamasındadır.", 10, 20);
      doc.save("ogretmen_rehberi.pdf");
  };

  const openLinkModal = () => {
      setShowLinkModal(true);
  };

  const timelineEvents = [
      { date: '15 Aralık', label: 'Ön Kayıt Dönemi' },
      { date: '20 Ocak', label: 'Başvurular Başladı' },
      { date: '13 Şubat', label: 'Son Başvuru' },
      { date: '20 Mart', label: 'Video Yükleme' },
      { date: '1 Nisan', label: 'Finalistler' },
      { date: '22 Mayıs', label: 'Gala Gecesi' }
  ];

  if (!currentApplication) {
      return (
        <div className="bg-slate-950 min-h-screen py-16 px-4 sm:px-6 lg:px-8 font-sans selection:bg-rose-600 selection:text-white relative overflow-hidden">
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
                                        
                                        {renderVersePreview()}
                                    </div>
                                )}
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">Yapım Logosu (Otomatik 128x128px)</label>
                                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 border-dashed text-center">
                                        <input type="file" onChange={handleLogoUpload} accept="image/*" className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-rose-900 file:text-rose-100 hover:file:bg-rose-800"/>
                                        <div className="mt-4 p-4 bg-teal-900/20 rounded-lg border border-teal-900/50 flex items-start gap-3 text-left">
                                            <CheckCircle2 size={20} className="text-teal-500 flex-shrink-0 mt-0.5"/>
                                            <div className="text-xs text-teal-300 leading-relaxed">
                                                <strong className="block text-teal-400 mb-1">Otomatik Formatlama</strong>
                                                Yüklediğiniz logo, sistem tarafından otomatik olarak <strong>128x128 piksel PNG</strong> formatına dönüştürülecektir. Herhangi bir resim formatı (JPG, PNG, WEBP) yükleyebilirsiniz.
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

  return (
    <div className="bg-slate-950 min-h-screen pb-20 text-slate-200">
      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="application/pdf" />

      {verificationModal && (
          <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
              <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl relative">
                  <button onClick={() => setVerificationModal(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><ExternalLink size={20} className="rotate-45"/></button>
                  
                  <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-blue-50">
                          <ShieldCheck size={32} />
                      </div>
                      <h3 className="text-xl font-black text-slate-900">Belge Doğrulama</h3>
                      <p className="text-slate-500 text-sm mt-2">
                          Lütfen belgenin üzerindeki <strong>Kırmızı ID Kodunun</strong> son 5 hanesini giriniz.
                      </p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 text-center">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Beklenen Kod Formatı</p>
                      <p className="text-lg font-mono font-bold text-slate-700 tracking-wider">
                          {verificationModal.type === 'kvkk' ? 'RFS-AR-XXXXX' : 'RFS-VE-XXXXX'}
                      </p>
                  </div>

                  <div className="flex items-stretch justify-center mb-6 shadow-sm">
                        <div className="bg-slate-200 border-y-2 border-l-2 border-slate-300 rounded-l-xl px-4 flex items-center justify-center font-mono font-bold text-slate-600 text-lg select-none">
                            {verificationModal.type === 'kvkk' ? 'RFS-AR-' : 'RFS-VE-'}
                        </div>
                        <input 
                            value={inputDocId}
                            onChange={(e) => {
                                const val = e.target.value.replace(/[^0-9]/g, '');
                                if(val.length <= 5) setInputDocId(val);
                            }}
                            placeholder="12345"
                            className="w-32 text-center text-xl font-bold tracking-wider p-4 border-2 border-slate-300 rounded-r-xl focus:border-blue-500 outline-none border-l-0 text-slate-800"
                        />
                  </div>

                  <button 
                      onClick={verifyAndTriggerUpload}
                      disabled={inputDocId.length !== 5}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all disabled:opacity-50"
                  >
                      Doğrula ve Yükle
                  </button>
              </div>
          </div>
      )}

      {showRevealModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-fadeIn">
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
      
      {showLinkModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
              <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl relative">
                   <button onClick={() => setShowLinkModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                       <ExternalLink size={20} className="rotate-180"/>
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

      {/* --- HERO SECTION --- */}
      <div className="bg-slate-900 text-white pb-32 pt-20 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }}></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="flex flex-col md:flex-row items-center gap-10 text-center md:text-left">
                  {/* Team Logo - Jeweled Look */}
                  <div className="w-32 h-32 bg-slate-800 rounded-full p-1 flex items-center justify-center overflow-hidden ring-4 ring-slate-800 shadow-2xl relative flex-shrink-0">
                      {team.logoUrl ? <img src={team.logoUrl} className="w-full h-full object-cover rounded-full opacity-90 hover:opacity-100 transition-opacity" /> : <Users className="text-gray-600" size={40} />}
                  </div>
                  
                  <div className="flex-1">
                      <h1 className="text-5xl font-black tracking-tighter flex flex-col md:flex-row items-center md:items-end justify-center md:justify-start gap-4 leading-none mb-4">
                          {team.name}
                          {isFinalist && (
                              <span className="bg-amber-500 text-black text-[10px] px-3 py-1 rounded-full font-black tracking-widest uppercase shadow-lg shadow-amber-500/20 translate-y-[-4px]">
                                  Finalist
                              </span>
                          )}
                      </h1>
                      
                      <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 text-slate-300">
                          <span className="bg-white/10 px-4 py-1.5 rounded-full border border-white/5 shadow-sm text-xs font-semibold tracking-wide backdrop-blur-sm">{team.category}</span>
                          <span className="bg-white/10 px-4 py-1.5 rounded-full border border-white/5 shadow-sm text-xs font-semibold tracking-wide backdrop-blur-sm flex items-center gap-1.5">
                              <Award size={14} className="text-amber-400"/> {team.theme}
                          </span>
                          <span className="bg-white/10 px-4 py-1.5 rounded-full border border-white/5 shadow-sm text-xs font-semibold tracking-wide backdrop-blur-sm flex items-center gap-1.5">
                              <Users size={14} className="text-teal-400"/> {team.students.length} Öğrenci
                          </span>
                      </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="flex flex-col items-center md:items-end gap-2">
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Güncel Durum</p>
                      <div className="text-xl font-bold">{isGalaPhase ? <span className="text-rose-400 animate-pulse">Gala Bekleniyor</span> : getStatusBadge(status)}</div>
                  </div>
              </div>
              
              {isFinalist && isAcademyActive && (
                  <div className="mt-10 flex justify-center md:justify-start gap-4">
                      <Link to="/academy" className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-amber-900/20 transform hover:-translate-y-1 transition-all">
                          <BookOpen size={20} /> Akademiye Giriş
                      </Link>
                  </div>
              )}
          </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20">
          
          {/* --- SUCCESS NOTIFICATION --- */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 backdrop-blur rounded-2xl p-8 shadow-2xl shadow-slate-950/50 border border-slate-700 mb-8 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
              <div className="flex items-start gap-5 relative z-10">
                   <div className="bg-teal-900/30 p-3 rounded-full text-teal-400 ring-1 ring-teal-500/20"><CheckCircle size={28} /></div>
                   <div>
                       <p className="text-white font-bold text-lg leading-tight mb-1">Takım kaydı tamamlandı.</p>
                       <p className="text-slate-400 text-sm font-medium">Süreç boyunca tüm belgeleri bu panelden yönetebilirsiniz.</p>
                   </div>
              </div>
              <div className="flex gap-3 items-center relative z-10">
                  {isGalaPhase ? (
                      <CertificateGenerator />
                  ) : (
                      <div className="relative overflow-hidden rounded-xl bg-slate-950 border border-slate-800 p-1 group">
                          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                          <div className="relative flex items-center gap-4 px-5 py-3 bg-slate-900/80 backdrop-blur-sm rounded-lg cursor-not-allowed">
                               <div className="bg-slate-800 p-2.5 rounded-full text-slate-500 group-hover:text-amber-500 group-hover:bg-amber-500/10 transition-colors">
                                   <Lock size={20} />
                               </div>
                               <div className="text-left">
                                   <div className="text-slate-300 font-bold text-sm group-hover:text-amber-400 transition-colors">Katılım Belgesi</div>
                                   <div className="text-slate-500 text-xs font-medium tracking-wide">22 Mayıs 2026'ya kadar kilitli</div>
                               </div>
                          </div>
                      </div>
                  )}
                  <button onClick={printTeacherGuide} className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold py-3 px-6 rounded-xl flex items-center text-sm transition-colors border border-slate-700 h-full">
                      <FileDown size={18} className="mr-2" /> Rehber (PDF)
                  </button>
              </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                   
                   {/* --- STAGE 1 CARD --- */}
                   <div className={`bg-slate-900/50 backdrop-blur-sm rounded-3xl shadow-xl shadow-slate-950/20 p-8 md:p-10 border border-slate-800 relative overflow-hidden transition-all duration-300 ${team.isPreliminaryStageComplete ? 'border-l-[6px] border-l-emerald-500' : ''}`}>
                      <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-5">
                          <div className="w-12 h-12 rounded-full bg-slate-800 text-white flex items-center justify-center text-lg font-bold shadow-xl shadow-slate-950/50 border border-slate-700">1</div>
                          <div>
                              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Aşama 1</span>
                              Ön Başvuru & Belgeler
                          </div>
                      </h2>
                      
                      <div className="pl-0 md:pl-[4.25rem]">
                          <div className="space-y-4">
                              {team.students.map((student) => (
                                  <div key={student.id} className="flex flex-col xl:flex-row bg-slate-800/40 rounded-xl border border-slate-700/50 p-5 gap-6 hover:border-slate-600 transition-colors">
                                      {/* Student Info */}
                                      <div className="flex items-center gap-4 min-w-[200px]">
                                          <div className="w-10 h-10 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center font-black text-sm border border-slate-600">
                                              {student.firstName[0]}
                                          </div>
                                          <div>
                                              <p className="font-bold text-white text-sm leading-tight">{student.firstName} {student.lastName}</p>
                                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{student.grade} • Öğrenci</span>
                                          </div>
                                      </div>
                                      
                                      {/* Document Actions Grid - Vertically Stacked within Cells */}
                                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                          
                                          {/* Veli İzni Group */}
                                          <div className="bg-slate-950/30 rounded-xl p-4 border border-slate-800/50 flex flex-col justify-between h-full">
                                              <div className="mb-3">
                                                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block mb-1">Adım 1</span>
                                                  <span className="text-sm font-bold text-slate-300 block">Veli İzin Belgesi</span>
                                              </div>
                                              
                                              {!student.hasParentalConsent ? (
                                                  <div className="flex flex-col gap-3">
                                                      <button 
                                                          onClick={() => handleDownloadProcess('parent', student)}
                                                          className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold py-3 px-4 rounded-lg border border-slate-700 transition-all flex items-center justify-between group"
                                                      >
                                                          <span className="flex items-center gap-2"><FileDown size={14} className="text-amber-500"/> Belgeyi İndir</span>
                                                          <span className="text-[9px] bg-slate-900 px-2 py-0.5 rounded text-slate-500 group-hover:text-slate-300 transition-colors">İmzalanacak</span>
                                                      </button>
                                                      
                                                      <button 
                                                          onClick={() => handleUploadClick('parent', student)}
                                                          disabled={!downloadedDocs.has(`${student.id}-parent`)}
                                                          className={`w-full py-3 px-4 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                                                              downloadedDocs.has(`${student.id}-parent`)
                                                              ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-500 hover:border-rose-400 shadow-lg shadow-rose-900/20 cursor-pointer transform hover:-translate-y-0.5'
                                                              : 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed opacity-50'
                                                          }`}
                                                      >
                                                          <Upload size={14}/> 2. İmzalı Yükle
                                                      </button>
                                                  </div>
                                              ) : (
                                                  <div className="flex flex-col items-center justify-center h-full min-h-[80px] bg-emerald-900/10 rounded-lg border border-emerald-500/20">
                                                      <CheckCircle2 size={24} className="text-emerald-500 mb-2"/>
                                                      <span className="text-emerald-400 font-bold text-xs">Tamamlandı</span>
                                                  </div>
                                              )}
                                          </div>

                                          {/* KVKK Group */}
                                          <div className="bg-slate-950/30 rounded-xl p-4 border border-slate-800/50 flex flex-col justify-between h-full">
                                              <div className="mb-3">
                                                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block mb-1">Adım 2</span>
                                                  <span className="text-sm font-bold text-slate-300 block">Açık Rıza Metni</span>
                                              </div>

                                              {!student.hasKvkkConsent ? (
                                                  <div className="flex flex-col gap-3">
                                                      <button 
                                                          onClick={() => handleDownloadProcess('kvkk', student)}
                                                          className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold py-3 px-4 rounded-lg border border-slate-700 transition-all flex items-center justify-between group"
                                                      >
                                                          <span className="flex items-center gap-2"><FileDown size={14} className="text-amber-500"/> Belgeyi İndir</span>
                                                          <span className="text-[9px] bg-slate-900 px-2 py-0.5 rounded text-slate-500 group-hover:text-slate-300 transition-colors">İmzalanacak</span>
                                                      </button>
                                                      
                                                      <button 
                                                          onClick={() => handleUploadClick('kvkk', student)}
                                                          disabled={!downloadedDocs.has(`${student.id}-kvkk`)}
                                                          className={`w-full py-3 px-4 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                                                              downloadedDocs.has(`${student.id}-kvkk`)
                                                              ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-500 hover:border-rose-400 shadow-lg shadow-rose-900/20 cursor-pointer transform hover:-translate-y-0.5'
                                                              : 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed opacity-50'
                                                          }`}
                                                      >
                                                          <Upload size={14}/> 2. İmzalı Yükle
                                                      </button>
                                                  </div>
                                              ) : (
                                                  <div className="flex flex-col items-center justify-center h-full min-h-[80px] bg-emerald-900/10 rounded-lg border border-emerald-500/20">
                                                      <CheckCircle2 size={24} className="text-emerald-500 mb-2"/>
                                                      <span className="text-emerald-400 font-bold text-xs">Tamamlandı</span>
                                                  </div>
                                              )}
                                          </div>

                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>

                  {/* --- STAGE 2 CARD --- */}
                  <div className={`bg-slate-900/50 backdrop-blur-sm rounded-3xl shadow-xl shadow-slate-950/20 p-8 md:p-10 border border-slate-800 transition-all duration-300 relative overflow-hidden ${!team.isPreliminaryStageComplete ? 'grayscale opacity-75' : ''}`}>
                      <h2 className="text-2xl font-black text-white mb-8 flex items-center justify-between">
                          <div className="flex items-center gap-5">
                              <span className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shadow-lg border border-slate-700 ${!team.isPreliminaryStageComplete ? 'bg-slate-800 text-slate-500' : 'bg-rose-600 text-white shadow-rose-900/50 border-rose-500'}`}>2</span>
                              <div>
                                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Aşama 2</span>
                                  {isRevisePhase && isFinalist ? "Final Kurgu (Revize)" : "Video Teslimi"}
                              </div>
                          </div>
                          {!team.isPreliminaryStageComplete && <Lock className="text-slate-600" size={24}/>}
                      </h2>
                      
                      <div className="pl-0 md:pl-[4.25rem]">
                          {!team.isPreliminaryStageComplete ? (
                              <div className="bg-slate-950/50 p-6 rounded-xl border border-slate-800 text-center">
                                  <p className="text-slate-400 font-medium text-sm leading-relaxed mb-2">
                                      Bu aşama kilitlidir.
                                  </p>
                                  <p className="text-slate-600 text-xs">
                                      Video yükleme ekranına erişmek için lütfen 1. aşamadaki tüm belgeleri tamamlayınız.
                                  </p>
                              </div>
                          ) : (
                             <>
                                {isBeforeUploadPhase && !isVideoSystemEnabled && (
                                    <div className="bg-slate-900 border-2 border-dashed border-slate-700 rounded-2xl p-8 text-center">
                                         <h3 className="text-xl font-bold text-white mb-2">Motor! Sahne Sizin.</h3>
                                         <p className="text-slate-400 text-sm mb-6">
                                             Sistem <span className="text-white font-bold">{VIDEO_UPLOAD_START_DATE.toLocaleDateString('tr-TR')}</span> tarihinde açılacaktır.
                                         </p>
                                         <div className="inline-block bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
                                            <p className="text-slate-400 font-serif italic text-sm">"Ey iman edenler! Sabır ve namazla yardım dileyin..." <span className="text-xs not-italic font-bold text-slate-500 ml-2 uppercase">Bakara: 153</span></p>
                                        </div>
                                    </div>
                                )}

                                {isAfterFirstDeadline && !isRevisePhase && team.videoStatus !== 'UPLOADED' && team.videoStatus !== 'SUBMITTED_LINK' && (
                                     <div className="bg-red-900/20 border border-red-900/50 text-red-400 p-8 rounded-2xl text-center">
                                          <Clock size={40} className="mx-auto mb-3 text-red-500"/>
                                          <h3 className="text-xl font-bold mb-2">Süre Doldu</h3>
                                          <p className="text-sm">Video yükleme süresi sona ermiştir.</p>
                                     </div>
                                )}

                                {((isVideoUploadPhase) || (isRevisePhase && isFinalist) || (team.videoStatus === 'UPLOADED' || team.videoStatus === 'SUBMITTED_LINK')) && (
                                    <div 
                                        className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all group relative ${isGalaPhase ? 'border-slate-800 bg-slate-900 opacity-50 pointer-events-none' : 'border-slate-700 hover:border-blue-500/50 bg-slate-900/50'}`} 
                                    >
                                        {team.videoStatus === 'UPLOADED' ? (
                                            <div className="py-2">
                                                {youtubeEmbedUrl ? (
                                                    <div className="mb-6 rounded-xl overflow-hidden shadow-2xl ring-4 ring-slate-800">
                                                         <iframe 
                                                            src={youtubeEmbedUrl} 
                                                            className="w-full aspect-video" 
                                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                                            allowFullScreen
                                                         ></iframe>
                                                    </div>
                                                ) : (
                                                    <div className="w-16 h-16 bg-green-900/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-green-500/20"><CheckCircle size={32} /></div>
                                                )}
                                                <h3 className="text-lg font-bold text-white">{isRevisePhase && isFinalist ? "Revize Video Yüklendi" : "Video Başarıyla Yüklendi"}</h3>
                                                {youtubeEmbedUrl && <p className="text-xs text-green-500 mt-2 font-bold uppercase tracking-wider flex items-center justify-center gap-1"><CheckCircle2 size={12}/> Yayında</p>}
                                            </div>
                                        ) : team.videoStatus === 'SUBMITTED_LINK' ? (
                                            <div className="py-2">
                                                 <div className="w-16 h-16 bg-blue-900/20 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-blue-500/20"><Clock size={32} /></div>
                                                 <h3 className="text-lg font-bold text-white">İnceleniyor</h3>
                                                 <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
                                                     Video linkiniz teknik ekip tarafından kontrol ediliyor. Onaylandığında burada görünecektir.
                                                 </p>
                                                 <div className="mt-4 bg-slate-950 px-4 py-2 rounded border border-slate-800 text-xs text-slate-500 font-mono inline-block max-w-full truncate">
                                                     {team.submissionDownloadUrl}
                                                 </div>
                                            </div>
                                        ) : (
                                            (!isAfterFirstDeadline || isRevisePhase) && !isGalaPhase && (
                                                <div 
                                                    onClick={openLinkModal}
                                                    className="cursor-pointer p-4 transition-all"
                                                >
                                                    <div className="w-20 h-20 bg-slate-800 text-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-xl shadow-blue-900/20 border border-slate-700 group-hover:border-blue-500/50">
                                                        <LinkIcon size={32} />
                                                    </div>
                                                    <h3 className="text-xl font-bold text-white mb-2">{isRevisePhase ? "Revize Linki Gönder" : "Video Linki Teslim Et"}</h3>
                                                    <p className="text-sm text-slate-400">Google Drive, WeTransfer veya Dropbox</p>
                                                </div>
                                            )
                                        )}
                                    </div>
                                )}
                             </>
                          )}
                      </div>
                  </div>
              </div>

              <div className="space-y-8">
                  <div className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-3xl shadow-lg border border-slate-800">
                      <h3 className="font-bold text-white mb-8 flex items-center text-lg"><Clock className="mr-3 text-slate-500" size={24} /> Takvim</h3>
                      <div className="space-y-8 relative pl-2">
                          <div className="absolute left-[7px] top-3 bottom-3 w-px bg-slate-800"></div>
                          {timelineEvents.map((event, idx) => {
                               const isActive = (() => {
                                   if (currentDate < new Date('2026-01-20')) return idx === 0;
                                   if (currentDate < new Date('2026-02-13')) return idx === 1;
                                   if (currentDate < new Date('2026-03-20')) return idx === 2;
                                   if (currentDate < new Date('2026-04-01')) return idx === 3;
                                   if (currentDate < new Date('2026-05-22')) return idx === 4;
                                   return idx === 5;
                               })();

                               return (
                                 <div key={idx} className="relative pl-8 flex flex-col group">
                                     <span className={`absolute left-[3px] top-1.5 w-[9px] h-[9px] rounded-full z-10 transition-colors ${isActive ? 'bg-rose-500 shadow-[0_0_0_4px_rgba(244,63,94,0.2)]' : 'bg-slate-700'}`}></span>
                                     <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${isActive ? 'text-rose-500' : 'text-slate-500'}`}>{event.date}</p>
                                     <p className={`font-bold text-sm ${isActive ? 'text-white' : 'text-slate-400'}`}>{event.label}</p>
                                 </div>
                               )
                           })}
                      </div>
                  </div>
                  
                  <ChatArea appId={currentApplication.id} theme="light" />
              </div>
          </div>
      </div>
    </div>
  );
};
