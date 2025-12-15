
import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { ApplicationStatus, Category, Theme, UserRole, Student } from '../types';
import { CheckCircle, AlertCircle, Upload, Video, Award, Clock, Users, FileDown, Clapperboard, Film, UserPlus, BookOpen, Trophy, HeartHandshake, Cpu, Link as LinkIcon, ExternalLink, Play, CheckCircle2, ShieldCheck, X, Save, Plus, AlertTriangle, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { versesList, verseDetails, VERSE_SPLITTER } from '../data/verses';
import { ChatArea } from '../components/ChatArea';
import { CertificateGenerator } from '../components/CertificateGenerator';
import { getYouTubeEmbedUrl } from '../lib/videoUtils';
import { uploadFileToR2, uploadPublicLogo } from '../lib/cloudStorage';
import jsPDF from 'jspdf';

// Global cache for the font to prevent re-downloading
let cachedFontBase64: string | null = null;

export const Dashboard: React.FC = () => {
  const { currentApplication, updateApplication, createApplication, currentUser, currentDate, systemSettings, showToast } = useAppContext();
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

  // Derived state to fix "Cannot find name" errors
  const team = currentApplication?.team;
  const status = currentApplication?.status;

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
                  selectedVerse: teamForm.theme === Theme.AYET ? teamForm.selectedVerse : undefined, 
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

  // Helper functions
  const getStatusBadge = (s: ApplicationStatus | undefined) => {
      switch(s) {
          case ApplicationStatus.DRAFT: return <span className="text-slate-400 bg-slate-800 px-3 py-1 rounded border border-slate-700 text-sm">Taslak</span>;
          case ApplicationStatus.PRELIMINARY_SUBMITTED: return <span className="text-blue-400 bg-blue-900/30 px-3 py-1 rounded border border-blue-500/50 text-sm">Ön Başvuru</span>;
          case ApplicationStatus.FINAL_SUBMITTED: return <span className="text-amber-400 bg-amber-900/30 px-3 py-1 rounded border border-amber-500/50 text-sm">Video İnceleniyor</span>;
          case ApplicationStatus.UNDER_REVIEW: return <span className="text-purple-400 bg-purple-900/30 px-3 py-1 rounded border border-purple-500/50 text-sm">Değerlendiriliyor</span>;
          case ApplicationStatus.APPROVED: return <span className="text-green-400 bg-green-900/30 px-3 py-1 rounded border border-green-500/50 text-sm">Onaylandı</span>;
          case ApplicationStatus.GRADED: return <span className="text-teal-400 bg-teal-900/30 px-3 py-1 rounded border border-teal-500/50 text-sm">Puanlandı</span>;
          case ApplicationStatus.REJECTED: return <span className="text-red-400 bg-red-900/30 px-3 py-1 rounded border border-red-500/50 text-sm">Reddedildi</span>;
          case ApplicationStatus.NEEDS_FIX: return <span className="text-orange-400 bg-orange-900/30 px-3 py-1 rounded border border-orange-500/50 text-sm">Düzeltme Gerekli</span>;
          case ApplicationStatus.DISQUALIFIED: return <span className="text-red-600 bg-red-950 px-3 py-1 rounded border border-red-800 text-sm">Diskalifiye</span>;
          default: return null;
      }
  };

  const printTeacherGuide = () => {
      window.open('https://pub-445f38f2d68348d4914aa2bac116cf06.r2.dev/Reflect_Shoot_Yarisma_Kilavuzu.pdf', '_blank');
  };

  const openLinkModal = () => {
      setSubmissionLink(currentApplication?.team.submissionDownloadUrl || '');
      setShowLinkModal(true);
  };

  const submitLink = async () => {
      if(!submissionLink) return;
      setIsSubmittingLink(true);
      try {
          if (currentApplication) {
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
              showToast('Video linki gönderildi.', 'success');
              setShowLinkModal(false);
          }
      } catch (error) {
          console.error(error);
          showToast('Link gönderilemedi.', 'error');
      } finally {
          setIsSubmittingLink(false);
      }
  };

  const timelineEvents = [
      { date: '20 Ocak', label: 'Başvurular' },
      { date: '13 Şubat', label: 'Son Kayıt' },
      { date: '20 Mart', label: 'Video Teslim' },
      { date: '1 Nisan', label: 'Finalistler' },
      { date: '6 Nisan', label: 'Akademi' },
      { date: '22 Mayıs', label: 'Gala' }
  ];

  const generateAndDownloadDoc = async (type: 'kvkk' | 'parent', student: Student) => {
      if(!currentApplication) return;

      showToast("Belge oluşturuluyor, lütfen bekleyiniz...", "info");

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

      // --- ADD TURKISH FONT SUPPORT ---
      try {
          if (!cachedFontBase64) {
              const response = await fetch('/fonts/Roboto-Regular.ttf');
              if (!response.ok) {
                  throw new Error(`Font dosyası indirilemedi: ${response.statusText}`);
              }
              const blob = await response.blob();
              cachedFontBase64 = await new Promise<string>((resolve, reject) => {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                      const result = reader.result as string;
                      if (!result) {
                          reject(new Error("Font verisi okunamadı"));
                          return;
                      }
                      // Remove "data:application/octet-stream;base64," prefix
                      const base64 = result.split(',')[1];
                      resolve(base64);
                  };
                  reader.onerror = () => reject(new Error("Font okuma hatası"));
                  reader.readAsDataURL(blob);
              });
          }

          if (cachedFontBase64) {
              doc.addFileToVFS('Roboto-Regular.ttf', cachedFontBase64);
              doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
              doc.setFont('Roboto'); 
          }
      } catch (e) {
          console.error("Font Yükleme Hatası:", e);
          showToast("Belge oluşturulamadı: Türkçe karakter fontu yüklenemedi. Lütfen internet bağlantınızı kontrol edip sayfayı yenileyiniz.", "error");
          // STOP PROCESS - Do not generate broken PDF
          return; 
      }
      // ---------------------------------

      if (type === 'parent') {
          // --- VELİ İZİN BELGESİ ---
          
          // 1. Header
          doc.setFontSize(16);
          doc.text("VELİ İZİN BELGESİ", 105, 20, { align: "center" });
          
          doc.setFontSize(12);
          doc.text("Reflect & Shoot Kısa Film Yarışması (2026)", 105, 28, { align: "center" });

          // 2. Body Text
          doc.setFontSize(10);
          
          const margin = 20;
          const pageWidth = 170; // 210 - 2*20
          let yPos = 45;

          const p1 = `Ben, aşağıda bilgileri yer alan öğrencinin velisi olarak; öğrencimin Reflect & Shoot Kısa Film Yarışması kapsamında yürütülecek olan kısa film üretim sürecine katılmasına izin verdiğimi beyan ederim.`;
          
          const p2 = `Bu kapsamda öğrencimin; yarışmaya başvuru sürecinde, film üretimi sırasında ve yarışma süresince gerçekleştirilecek olan görüntü ve ses kayıtlarında (video, fotoğraf, ses kaydı vb.) yer almasını, bu kayıtların yarışma organizasyonu tarafından yarışmanın yürütülmesi, değerlendirilmesi, sonuçların açıklanması ve yarışmanın tanıtımı amacıyla kullanılmasını kabul ediyorum.`;

          const p3 = `Öğrencimin yarışma kapsamında ürettiği kısa filmde yer alan görüntü ve ses kayıtlarının;\n• Yarışmanın resmî internet sitesi,\n• Yarışmaya ait resmî sosyal medya hesapları,\n• Yarışma ile ilişkili dijital ve basılı tanıtım materyalleri\nüzerinde ticari olmayan amaçlarla paylaşılmasına, yayımlanmasına ve arşivlenmesine izin verdiğimi kabul ve beyan ederim.`;

          const p4 = `Yarışma sürecinde öğrencimin, danışman öğretmen gözetiminde ve yarışma kurallarına uygun şekilde hareket edeceğini; yarışma kapsamında gerçekleştirilecek faaliyetlere katılımından doğabilecek olağan risklerin tarafımca bilindiğini ve kabul edildiğini belirtirim.`;

          const p5 = `Bu izin, Reflect & Shoot Kısa Film Yarışması ve yarışma ile doğrudan bağlantılı tanıtım ve bilgilendirme faaliyetleri ile sınırlıdır.`;

          doc.text(doc.splitTextToSize(p1, pageWidth), margin, yPos);
          yPos += 15;
          doc.text(doc.splitTextToSize(p2, pageWidth), margin, yPos);
          yPos += 25;
          doc.text(doc.splitTextToSize(p3, pageWidth), margin, yPos);
          yPos += 30;
          doc.text(doc.splitTextToSize(p4, pageWidth), margin, yPos);
          yPos += 20;
          doc.text(doc.splitTextToSize(p5, pageWidth), margin, yPos);
          yPos += 15;

          // 3. Student Info Block
          doc.setDrawColor(0);
          doc.setFillColor(245, 245, 245);
          doc.rect(margin, yPos, pageWidth, 60, "F");
          doc.rect(margin, yPos, pageWidth, 60, "S"); 

          let infoY = yPos + 8;
          doc.setFontSize(11);
          doc.text("Öğrenci Bilgileri", margin + 5, infoY);
          infoY += 8;
          
          doc.setFontSize(10);
          const labels = [
              `Öğrenci Ad Soyad: ${student.firstName} ${student.lastName}`,
              `Sınıf: ${student.grade}`,
              `Okul Adı: ${currentApplication.teacher.school}`,
              `Takım Adı: ${currentApplication.team.name}`,
              `Kategori: ${currentApplication.team.category}`,
              `Tema: ${currentApplication.team.theme}`,
              `(Varsa) Seçilen Ayet: ${currentApplication.team.selectedVerse || '-'}`
          ];

          labels.forEach(line => {
              doc.text(line, margin + 5, infoY);
              infoY += 6;
          });

          yPos += 70; 

          // 4. Parent Info Block
          doc.setFontSize(11);
          doc.text("Veli Bilgileri", margin, yPos);
          yPos += 8;
          
          doc.setFontSize(10);
          doc.text("Veli Ad Soyad: .................................................................", margin, yPos);
          yPos += 8;
          doc.text("Telefon Numarası: ..........................................................", margin, yPos);
          yPos += 8;
          doc.text("İmza: ...........................................................................", margin, yPos);
          yPos += 8;
          doc.text("Tarih: ...... / ...... / 2026", margin, yPos);

          // 5. Footer Code
          const footerY = 280;
          doc.setFontSize(8);
          doc.setTextColor(100);
          doc.text("Bu belge Reflect & Shoot dijital sistemi tarafından üretilmiştir.", 105, footerY, { align: "center" });
          doc.setTextColor(200, 0, 0); 
          doc.text(`Belge Kodu: ${docId}`, 105, footerY + 5, { align: "center" });

      } else {
          // --- KVKK AÇIK RIZA METNİ (SINGLE PAGE OPTIMIZED) ---
          
          // 1. Header
          doc.setFontSize(16);
          doc.text("KİŞİSEL VERİLERİN İŞLENMESİNE İLİŞKİN", 105, 20, { align: "center" });
          doc.text("AYDINLATMA VE AÇIK RIZA METNİ", 105, 28, { align: "center" });
          
          doc.setFontSize(12);
          doc.text("Reflect & Shoot Kısa Film Yarışması (2026)", 105, 36, { align: "center" });

          // 2. Body Text
          doc.setFontSize(10);
          
          const margin = 20;
          const pageWidth = 170; 
          let yPos = 42; // Raised to fit single page

          const p1 = `6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) kapsamında; aşağıda bilgileri yer alan öğrencinin velisi olarak, öğrencimin Reflect & Shoot Kısa Film Yarışması’na katılımı sürecinde işlenecek kişisel veriler hakkında tarafıma gerekli bilgilendirmenin yapıldığını, bu doğrultuda aşağıdaki hususları okuyup anladığımı beyan ederim.`;
          
          const p2 = `Yarışma süreci kapsamında öğrencime ait aşağıdaki kişisel verilerin işlenebileceğini kabul ederim:\nöğrenci kimlik bilgileri (ad, soyad, sınıf), okul bilgisi, takım bilgileri ile yarışma kapsamında üretilen kısa filmde yer alan görüntü ve ses kayıtları (video, fotoğraf, ses).`;

          const p3 = `Bu kişisel verilerin; yarışmaya başvuru ve katılım süreçlerinin yürütülmesi, organizasyonun planlanması ve yönetilmesi, jüri değerlendirme süreçlerinin gerçekleştirilmesi, yarışma sonuçlarının ilan edilmesi, bilgilendirme ve duyuru faaliyetlerinin yapılması ile yarışmanın tanıtımı ve arşivlenmesi amaçlarıyla işlenmesine açık rıza verdiğimi kabul ederim.`;

          const p4 = `Öğrencimin yarışma kapsamında ürettiği kısa filmde yer alan görüntü ve ses kayıtlarının; yarışmanın resmî internet sitesi, yarışmaya ait resmî sosyal medya hesapları ve yarışma ile ilişkili dijital veya basılı tanıtım materyallerinde ticari olmayan amaçlarla kullanılmasına, paylaşılmasına ve yayımlanmasına onay veririm.`;

          const p5 = `Kişisel verilerin, yarışmanın yürütülmesi amacıyla yalnızca gerekli olması hâlinde ve KVKK’da öngörülen şartlara uygun olarak, yarışma organizasyonu bünyesinde görevli yetkililer ile sınırlı olmak kaydıyla paylaşılabileceği tarafıma bildirilmiştir.`;

          const p6 = `Kişisel verilerin, ilgili mevzuatta öngörülen süreler boyunca veya işlenme amacının gerektirdiği süre ile sınırlı olmak üzere saklanacağını; KVKK’nın 11. maddesi kapsamında sahip olduğum haklar hakkında bilgilendirildiğimi ve bu hakları kullanabileceğimi kabul ederim.`;

          const p7 = `Yukarıda belirtilen tüm hususları okuyup anladığımı; öğrencime ait kişisel verilerin ve yarışma kapsamında üretilen görüntü ve ses kayıtlarının belirtilen amaçlar doğrultusunda işlenmesine özgür irademle açık rıza verdiğimi kabul, beyan ve taahhüt ederim.`;

          const paragraphs = [p1, p2, p3, p4, p5, p6, p7];

          paragraphs.forEach((p) => {
              const lines = doc.splitTextToSize(p, pageWidth);
              // Check if need new page
              if (yPos + (lines.length * 5) > 280) {
                  doc.addPage();
                  yPos = 20;
              }
              doc.text(lines, margin, yPos);
              yPos += (lines.length * 5) + 3; // Reduced spacing from 6 to 3 to fit single page
          });

          // 3. Student Info Block (Matching Veli İzin Style)
          if (yPos + 50 > 280) {
              doc.addPage();
              yPos = 20;
          }

          doc.setDrawColor(0);
          doc.setFillColor(245, 245, 245);
          doc.rect(margin, yPos, pageWidth, 45, "F");
          doc.rect(margin, yPos, pageWidth, 45, "S"); 

          let infoY = yPos + 8;
          doc.setFontSize(11);
          doc.text("Öğrenci Bilgileri", margin + 5, infoY);
          infoY += 8;
          
          doc.setFontSize(10);
          const labels = [
              `Öğrenci Ad Soyad: ${student.firstName} ${student.lastName}`,
              `Sınıf: ${student.grade}`,
              `Okul Adı: ${currentApplication.teacher.school}`,
              `Takım Adı: ${currentApplication.team.name}`
          ];

          labels.forEach(line => {
              doc.text(line, margin + 5, infoY);
              infoY += 6;
          });

          yPos += 50; // Reduced margin from 55 to 50

          // 4. Parent Approval
          if (yPos + 40 > 280) {
              doc.addPage();
              yPos = 20;
          }

          doc.setFontSize(11);
          doc.text("Veli Onayı", margin, yPos);
          yPos += 8;
          
          doc.setFontSize(10);
          doc.text("Veli Ad Soyad: .................................................................", margin, yPos);
          yPos += 8;
          doc.text("İmza: ...........................................................................", margin, yPos);
          yPos += 8;
          doc.text("Tarih: ...... / ...... / 2026", margin, yPos);

          // 5. Footer Code
          const footerY = 280;
          doc.setFontSize(8);
          doc.setTextColor(100);
          doc.text("Bu belge Reflect & Shoot dijital sistemi tarafından üretilmiştir.", 105, footerY, { align: "center" });
          doc.setTextColor(200, 0, 0); 
          doc.text(`Belge Kodu: ${docId}`, 105, footerY + 5, { align: "center" });
      }

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
                            kvkkConsentUrl: type === 'kvkk' ? fileKey : s.kvkkConsentUrl, 
                            parentalConsentUrl: type === 'parent' ? fileKey : s.parentalConsentUrl, 
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

  const handleDownloadProcess = (type: 'kvkk' | 'parent', student: Student) => {
      generateAndDownloadDoc(type, student);
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

  // Render Create Team Form if no application
  if (!currentApplication) {
      return (
          <div className="bg-slate-950 min-h-screen py-20 px-4 flex justify-center items-center">
              <div className="max-w-4xl w-full bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-2xl animate-fadeIn">
                  <div className="text-center mb-8">
                      <h1 className="text-3xl font-black text-white mb-2">Takımını Oluştur</h1>
                      <p className="text-slate-400">Yarışmaya katılmak için takım ve öğrenci bilgilerini giriniz.</p>
                  </div>

                  <form onSubmit={handleSubmitTeam} className="space-y-8">
                      
                      {/* Team Info */}
                      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
                          <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Clapperboard size={20} className="text-rose-500"/> Takım & Proje</h3>
                          <div className="grid md:grid-cols-2 gap-5">
                              <div>
                                  <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Takım Adı</label>
                                  <input name="name" value={teamForm.name} onChange={handleTeamChange} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-rose-500 outline-none" placeholder="Yaratıcı bir isim..." />
                                  {formErrors.teamName && <p className="text-red-500 text-xs mt-1">{formErrors.teamName}</p>}
                              </div>
                              <div>
                                  <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Kategori</label>
                                  <select name="category" value={teamForm.category} onChange={handleTeamChange} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-rose-500 outline-none">
                                      {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
                                  </select>
                              </div>
                              <div>
                                  <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Tema</label>
                                  <select name="theme" value={teamForm.theme} onChange={handleTeamChange} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-rose-500 outline-none">
                                      {Object.values(Theme).map(t => <option key={t} value={t}>{t}</option>)}
                                  </select>
                              </div>
                              {teamForm.theme === Theme.AYET && (
                                  <div>
                                      <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Ayet Seçimi</label>
                                      <select name="selectedVerse" value={teamForm.selectedVerse} onChange={handleTeamChange} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-rose-500 outline-none">
                                          <option value="">Seçiniz...</option>
                                          {versesList.map(v => <option key={v} value={v}>{v}</option>)}
                                      </select>
                                      {formErrors.verse && <p className="text-red-500 text-xs mt-1">{formErrors.verse}</p>}
                                  </div>
                              )}
                          </div>
                          {renderVersePreview()}
                          
                          <div className="mt-5">
                              <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Takım Logosu</label>
                              <div className="flex items-center gap-4">
                                  <div className="w-20 h-20 bg-slate-800 rounded-xl flex items-center justify-center border border-slate-700 overflow-hidden">
                                      {logoFile ? <img src={URL.createObjectURL(logoFile)} className="w-full h-full object-cover" /> : <Upload size={24} className="text-slate-600"/>}
                                  </div>
                                  <div>
                                      <input type="file" onChange={handleLogoUpload} accept="image/*" id="logo-upload" className="hidden" />
                                      <label htmlFor="logo-upload" className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition-colors border border-slate-700">Logo Seç</label>
                                      <p className="text-[10px] text-slate-500 mt-2">Max 2MB, kare format önerilir.</p>
                                  </div>
                              </div>
                              {formErrors.logo && <p className="text-red-500 text-xs mt-1">{formErrors.logo}</p>}
                          </div>
                      </div>

                      {/* Students */}
                      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
                          <div className="flex justify-between items-center mb-4">
                              <h3 className="font-bold text-white flex items-center gap-2"><UserPlus size={20} className="text-teal-500"/> Öğrenci Listesi</h3>
                              <button type="button" onClick={addStudent} disabled={students.length >= 6} className="text-xs bg-slate-800 hover:bg-slate-700 text-white px-3 py-1 rounded-lg transition-colors border border-slate-700 flex items-center gap-1 disabled:opacity-50">
                                  <Plus size={14}/> Öğrenci Ekle
                              </button>
                          </div>
                          
                          <div className="space-y-3">
                              {students.map((student, i) => (
                                  <div key={i} className="grid grid-cols-3 gap-3">
                                      <input 
                                          placeholder="Ad" 
                                          value={student.firstName} 
                                          onChange={(e) => handleStudentChange(i, 'firstName', e.target.value)}
                                          className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white focus:border-teal-500 outline-none"
                                      />
                                      <input 
                                          placeholder="Soyad" 
                                          value={student.lastName} 
                                          onChange={(e) => handleStudentChange(i, 'lastName', e.target.value)}
                                          className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white focus:border-teal-500 outline-none"
                                      />
                                      <input 
                                          placeholder="Sınıf (Örn: 11-A)" 
                                          value={student.grade} 
                                          onChange={(e) => handleStudentChange(i, 'grade', e.target.value)}
                                          className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white focus:border-teal-500 outline-none"
                                      />
                                  </div>
                              ))}
                          </div>
                          {Object.keys(formErrors).some(k => k.startsWith('student')) && <p className="text-red-500 text-xs mt-2">Tüm öğrenci bilgilerini eksiksiz doldurunuz.</p>}
                      </div>

                      <div className="flex items-center gap-4 p-4 bg-amber-900/20 border border-amber-900/50 rounded-xl">
                          <AlertTriangle size={24} className="text-amber-500 flex-shrink-0" />
                          <p className="text-xs text-amber-200">
                              <strong>Dikkat:</strong> Kayıt sonrası takım bilgileri ve öğrenci listesi değiştirilemez. Lütfen bilgileri kontrol edip onaylayınız.
                          </p>
                      </div>

                      <button type="submit" disabled={isCreating} className="w-full bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold py-4 rounded-xl shadow-lg transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2">
                          {isCreating ? 'Oluşturuluyor...' : <><Save size={20}/> Takımı Kaydet ve Başla</>}
                      </button>
                  </form>
              </div>
          </div>
      )
  }

  // Ensure team is defined here implicitly because of the check above
  if (!team) return null; 

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

      {/* --- HERO SECTION --- */}
      <div className="bg-slate-900 text-white pb-32 pt-20 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }}></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="flex flex-col md:flex-row items-center gap-10 text-center md:text-left">
                  {/* Team Logo */}
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
                                      
                                      {/* Document Actions Grid */}
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
                          {!team.isPreliminaryStageComplete && (
                              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                                <ShieldCheck className="text-slate-600" size={24}/>
                              </div>
                          )}
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

      {showLinkModal && (
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
              <div className="bg-slate-900 rounded-2xl p-8 max-w-md w-full shadow-2xl border border-slate-700 relative">
                  <button onClick={() => setShowLinkModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={20}/></button>
                  <h3 className="text-xl font-bold text-white mb-2">Video Linki Gönder</h3>
                  <p className="text-slate-400 text-sm mb-6">Lütfen videonuzu buluta yükleyip (Google Drive, WeTransfer vb.) indirme linkini paylaşın.</p>
                  
                  <input 
                      value={submissionLink}
                      onChange={(e) => setSubmissionLink(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white focus:border-blue-500 outline-none mb-4 font-mono text-sm"
                  />
                  
                  <button 
                      onClick={submitLink}
                      disabled={isSubmittingLink || !submissionLink}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                      {isSubmittingLink ? 'Gönderiliyor...' : <><LinkIcon size={18}/> Linki Teslim Et</>}
                  </button>
              </div>
          </div>
      )}

      {showRevealModal && (
          <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-fadeIn">
              <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-3xl p-10 max-w-lg w-full shadow-2xl border border-amber-500/20 text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none"></div>
                  
                  <button onClick={() => setShowRevealModal(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white z-20"><X size={24}/></button>

                  <div className="mb-8 relative z-10">
                      <div className="w-24 h-24 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-amber-500/20 animate-pulse">
                          {isFinalist ? <Trophy size={48} className="text-amber-500 drop-shadow-lg" /> : <HeartHandshake size={48} className="text-slate-400" />}
                      </div>
                      <h2 className="text-3xl font-black text-white mb-2 tracking-tight">
                          {isFinalist ? "Tebrikler Finalist!" : "Teşekkürler"}
                      </h2>
                      <p className="text-lg text-slate-400 font-light">
                          {isFinalist 
                              ? "Eseriniz jüri değerlendirmesini başarıyla geçti ve finale kaldı." 
                              : "Bu yıl finalistler arasında yer alamadınız, ancak katılımınız bizim için çok değerliydi."}
                      </p>
                  </div>

                  {isFinalist ? (
                      <div className="bg-amber-900/20 border border-amber-500/30 p-4 rounded-xl mb-6">
                          <p className="text-amber-200 text-sm font-medium">Akademi paneli erişiminize açılmıştır. Gala gecesi detayları yakında paylaşılacaktır.</p>
                      </div>
                  ) : (
                      <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl mb-6">
                          <p className="text-slate-300 text-sm">Gelecek yıl tekrar görüşmek dileğiyle.</p>
                      </div>
                  )}

                  <button onClick={() => setShowRevealModal(false)} className="bg-slate-100 hover:bg-white text-slate-900 px-8 py-3 rounded-xl font-bold transition-all shadow-lg w-full">
                      Paneli Görüntüle
                  </button>
              </div>
          </div>
      )}

    </div>
  );
};
