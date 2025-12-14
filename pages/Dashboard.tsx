
import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { ApplicationStatus, Category, Theme, UserRole, Student } from '../types';
import { CheckCircle, AlertCircle, Upload, Video, Award, Clock, Users, FileDown, Clapperboard, Film, UserPlus, BookOpen, Trophy, HeartHandshake, Cpu, Link as LinkIcon, ExternalLink, Play, AlertTriangle, CheckCircle2, ShieldCheck } from 'lucide-react';
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
      doc.text(type === 'kvkk' ? "KVKK AYDINLATMA VE RIZA METNI" : "VELI IZIN BELGESI", 105, 30, { align: "center" });
      
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

      doc.save(`${type}_${student.firstName}_${student.lastName}.pdf`);
      showToast(`${type === 'kvkk' ? 'KVKK' : 'Veli İzin'} belgesi oluşturuldu.`, 'success');
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
            [ApplicationStatus.DRAFT]: 'bg-slate-100 text-slate-600',
            [ApplicationStatus.PRELIMINARY_SUBMITTED]: 'bg-blue-100 text-blue-700',
            [ApplicationStatus.FINAL_SUBMITTED]: 'bg-purple-100 text-purple-700',
            [ApplicationStatus.UNDER_REVIEW]: 'bg-amber-100 text-amber-700',
            [ApplicationStatus.APPROVED]: 'bg-green-100 text-green-700',
            [ApplicationStatus.GRADED]: 'bg-teal-100 text-teal-700',
            [ApplicationStatus.REJECTED]: 'bg-red-100 text-red-700',
            [ApplicationStatus.NEEDS_FIX]: 'bg-orange-100 text-orange-700',
            [ApplicationStatus.DISQUALIFIED]: 'bg-gray-800 text-white',
        };
        return <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${styles[status] || 'bg-gray-100'}`}>{status}</span>;
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
      { date: '20 Ocak', label: 'Başvurular Başladı' },
      { date: '13 Şubat', label: 'Son Başvuru' },
      { date: '20 Mart', label: 'Video Yükleme Başlangıç' },
      { date: '1 Nisan', label: 'Finalistler İlanı' },
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
    <div className="bg-gray-50 min-h-screen pb-12">
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
                                      <div>
                                          <p className="font-bold text-slate-900 text-base">{student.firstName} {student.lastName}</p>
                                          <p className="text-xs text-slate-500">Öğrenci</p>
                                      </div>
                                  </div>
                                  <div className="flex gap-3 w-full sm:w-auto">
                                      <div className="flex flex-col gap-1 w-full">
                                          {!student.hasParentalConsent ? (
                                              <>
                                                <button 
                                                    onClick={() => generateAndDownloadDoc('parent', student)}
                                                    className="w-full px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors border border-slate-200 flex items-center justify-center"
                                                >
                                                    <FileDown size={12} className="mr-1"/> Veli İzni İndir
                                                </button>
                                                <button 
                                                    onClick={() => handleUploadClick('parent', student)}
                                                    className="w-full px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition-colors border border-blue-200 flex items-center justify-center"
                                                >
                                                    <Upload size={12} className="mr-1"/> Yükle
                                                </button>
                                              </>
                                          ) : (
                                              <div className="flex items-center justify-center h-full bg-green-50 text-green-700 rounded-lg border border-green-200 font-bold text-xs p-2">
                                                  <CheckCircle size={14} className="mr-2"/> Veli İzni Tamam
                                              </div>
                                          )}
                                      </div>

                                      <div className="flex flex-col gap-1 w-full">
                                          {!student.hasKvkkConsent ? (
                                              <>
                                                <button 
                                                    onClick={() => generateAndDownloadDoc('kvkk', student)}
                                                    className="w-full px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors border border-slate-200 flex items-center justify-center"
                                                >
                                                    <FileDown size={12} className="mr-1"/> KVKK İndir
                                                </button>
                                                <button 
                                                    onClick={() => handleUploadClick('kvkk', student)}
                                                    className="w-full px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition-colors border border-blue-200 flex items-center justify-center"
                                                >
                                                    <Upload size={12} className="mr-1"/> Yükle
                                                </button>
                                              </>
                                          ) : (
                                              <div className="flex items-center justify-center h-full bg-green-50 text-green-700 rounded-lg border border-green-200 font-bold text-xs p-2">
                                                  <CheckCircle size={14} className="mr-2"/> KVKK Tamam
                                              </div>
                                          )}
                                      </div>
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
                                     <span className={`absolute left-[13px] top-1.5 w-3.5 h-3.5 rounded-full border-2 z-10 ${currentDate >= new Date() ? 'bg-teal-500 border-teal-500' : 'bg-white border-teal-500'}`}></span>
                                     <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">{event.date}</p>
                                     <p className={`font-bold text-sm text-gray-800`}>{event.label}</p>
                                 </div>
                             ))}
                      </div>
                  </div>
                  
                  <ChatArea appId={currentApplication.id} theme="light" />
              </div>
          </div>
      </div>
    </div>
  );
};
