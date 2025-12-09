
import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { ApplicationStatus, Category, Theme } from '../types';
import { CheckCircle, AlertCircle, Upload, Video, Award, Clock, Users, Plus, Trash2, Image as ImageIcon, Layout, ArrowRight, XCircle, Info, FileText, Printer, FileDown, Clapperboard, PenTool, Cpu, Star, Megaphone, Film, UserPlus, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { currentApplication, updateApplication, createApplication, currentUser } = useAppContext();
  const [uploading, setUploading] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // -- Team Creation State --
  const [isCreating, setIsCreating] = useState(false);
  const [teamForm, setTeamForm] = useState({ name: '', category: Category.LIVE_ACTION, theme: Theme.AYET, selectedVerse: '' });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  
  const [students, setStudents] = useState<{firstName: string; lastName: string; grade: string}[]>([
      { firstName: '', lastName: '', grade: '' },
      { firstName: '', lastName: '', grade: '' },
      { firstName: '', lastName: '', grade: '' } // Min 3 start
  ]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // -- Upload State --
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeContext, setActiveContext] = useState<{type: 'kvkk' | 'parent' | 'video', studentId?: string} | null>(null);

  // Autosave Logic for Team Wizard
  useEffect(() => {
    if (!currentApplication) {
        const savedForm = localStorage.getItem('teamFormDraft');
        const savedStudents = localStorage.getItem('teamStudentsDraft');
        if (savedForm) setTeamForm(JSON.parse(savedForm));
        if (savedStudents) setStudents(JSON.parse(savedStudents));
    }
  }, [currentApplication]);

  useEffect(() => {
    if (!currentApplication) {
        localStorage.setItem('teamFormDraft', JSON.stringify(teamForm));
        localStorage.setItem('teamStudentsDraft', JSON.stringify(students));
    }
  }, [teamForm, students, currentApplication]);


  // Verse List
  const verses = [
    "Al-i İmran: 92", "Al-i İmran: 103", "Al-i İmran: 190-191",
    "Ankebut: 41", "Araf: 27", "Asr: 1-3",
    "Bakara: 138", "Bakara: 168", "Enfal: 46",
    "Furkan: 63", "Hac: 42", "Hucurat: 10-11",
    "İbrahim: 24", "İsra: 24", "İsra: 81",
    "İnşirah: 5-9", "Kasas: 72", "Lokman: 18",
    "Maide: 2", "Yasin: 82", "Yunus: 57",
    "Zariyat: 50", "Zariyat: 55", "Zümer: 9"
  ];

  // --- Team Creation Logic ---
  const handleTeamChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setTeamForm({...teamForm, [e.target.name]: e.target.value});
  
  const handleStudentChange = (index: number, field: string, value: string) => {
      const newStudents = [...students];
      newStudents[index] = { ...newStudents[index], [field]: value };
      setStudents(newStudents);
  };

  const addStudent = () => {
      if(students.length < 6) setStudents([...students, { firstName: '', lastName: '', grade: '' }]);
  };

  const removeStudent = (index: number) => {
      if(students.length > 3) setStudents(students.filter((_, i) => i !== index));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          
          if (file.type !== 'image/png' && file.type !== 'image/jpeg') {
              alert('Sadece PNG veya JPEG formatında dosya yükleyebilirsiniz.');
              return;
          }

          // Auto-Crop & Resize Logic (128x128)
          const reader = new FileReader();
          reader.onload = (readerEvent) => {
              const img = new Image();
              img.onload = () => {
                  const canvas = document.createElement('canvas');
                  canvas.width = 128;
                  canvas.height = 128;
                  const ctx = canvas.getContext('2d');
                  
                  if (ctx) {
                       // Draw white background first (for transparency safety)
                      ctx.fillStyle = '#FFFFFF';
                      ctx.fillRect(0, 0, 128, 128);

                      // Calculate "cover" aspect ratio
                      const ratio = Math.max(128 / img.width, 128 / img.height);
                      const centerShift_x = (128 - img.width * ratio) / 2;
                      const centerShift_y = (128 - img.height * ratio) / 2;
                      
                      ctx.drawImage(img, 0, 0, img.width, img.height, centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);
                      
                      canvas.toBlob((blob) => {
                          if (blob) {
                              const newFile = new File([blob], "team_logo_128.png", { type: 'image/png' });
                              setLogoFile(newFile);
                              setLogoPreview(URL.createObjectURL(newFile));
                              setFormErrors({...formErrors, logo: ''});
                          }
                      }, 'image/png');
                  }
              };
              img.src = readerEvent.target?.result as string;
          };
          reader.readAsDataURL(file);
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
              
              // Clear draft
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

  // --- Upload Logic ---
  const handleUploadClick = (type: 'kvkk' | 'parent' | 'video', studentId?: string) => {
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
        
        // Strict PDF Check for Documents
        if ((type === 'kvkk' || type === 'parent') && file.type !== 'application/pdf') {
            alert('Lütfen sadece PDF formatında belge yükleyiniz.');
            return;
        }

        const uploadKey = studentId ? `${type}-${studentId}` : type;
        
        setUploading(uploadKey);
        
        setTimeout(() => {
            if (!currentApplication) return;
            let updatedApp = { ...currentApplication };
            
            if (type === 'video') {
                updatedApp.team.videoStatus = 'UPLOADED';
                updatedApp.team.isFinalStageComplete = true;
                updatedApp.status = ApplicationStatus.FINAL_SUBMITTED;
                updatedApp.team.videoUrl = file.name;
                // Add mock metadata for admin view
                updatedApp.team.videoSize = `${(file.size / (1024 * 1024)).toFixed(2)} MB`;
                updatedApp.team.videoResolution = '1920x1080 (FHD)'; 
            } else if (studentId) {
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

  const getStatusBadge = (status: ApplicationStatus) => {
    switch(status) {
        case ApplicationStatus.DRAFT: return <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold border border-gray-300">Taslak</span>;
        case ApplicationStatus.PRELIMINARY_SUBMITTED: return <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold border border-yellow-200">Evraklar Tamam</span>;
        case ApplicationStatus.FINAL_SUBMITTED: return <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold border border-blue-200">Video Yüklendi</span>;
        case ApplicationStatus.APPROVED: return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold border border-green-200">Onaylandı</span>;
        case ApplicationStatus.GRADED: return <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-bold border border-purple-200">Puanlandı</span>;
        default: return <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-bold">{status}</span>;
    }
  };

  // --- Timeline Data (Simplified) ---
  const timelineEvents = [
    { date: '13 Şub 2026', label: 'Son Başvuru' },
    { date: '20 Mar 2026', label: '1. Video' },
    { date: '4 May 2026', label: 'Final' },
  ];

  if (!currentApplication) {
    // RENDER: No Application -> Show "Film Set Creation" Wizard (Dark Cinematic Theme)
    return (
        <div className="bg-slate-950 min-h-screen py-16 px-4 sm:px-6 lg:px-8 font-sans selection:bg-rose-600 selection:text-white relative overflow-hidden">
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }}></div>
            
            <div className="max-w-4xl mx-auto relative z-10">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center p-4 bg-rose-900/20 text-rose-500 rounded-2xl mb-6 border border-rose-900/50 shadow-lg">
                        <Clapperboard size={36} />
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tight">Set Kurulumuna Hoş Geldiniz, {currentUser?.fullName}</h1>
                    <p className="text-slate-400 mt-2 text-lg font-light">Yönetmen koltuğuna oturmadan önce yapım ekibini oluştur.</p>
                </div>

                {/* Team Status Summary Card (Empty State) */}
                <div className="bg-slate-900/60 rounded-2xl p-6 shadow-xl border border-slate-800 mb-10 flex items-center justify-between backdrop-blur-md">
                     <div className="flex items-center gap-5">
                         <div className="bg-slate-800 p-3 rounded-xl text-slate-500 shadow-inner">
                             <Video size={28} />
                         </div>
                         <div>
                             <h3 className="font-bold text-white text-lg">Prodüksiyon Durumu</h3>
                             <p className="text-rose-500 font-bold flex items-center text-xs mt-1 uppercase tracking-wide">
                                 <XCircle size={14} className="mr-1"/> Henüz aktif bir set yok
                             </p>
                         </div>
                     </div>
                     <div className="hidden md:block text-sm text-slate-500 italic font-medium">Sihirbazı başlatarak ilk sahneye hazırlan.</div>
                </div>

                <div className="bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-800 ring-1 ring-white/5">
                    <div className="bg-gradient-to-r from-rose-950 to-rose-900 px-8 py-6 border-b border-rose-900 flex items-center justify-between">
                         <h2 className="text-xl font-bold text-white flex items-center"><Film className="mr-3 text-rose-400"/> Film Seti Kurulum Sihirbazı</h2>
                         <div className="text-xs font-bold text-rose-200 bg-white/10 px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm">Adım 1/2</div>
                    </div>
                    
                    <div className="bg-amber-950/20 border-b border-amber-900/30 p-5 flex items-start gap-3">
                        <Megaphone className="text-amber-500 flex-shrink-0 mt-0.5" size={20} />
                        <div>
                            <p className="text-amber-400 font-bold text-sm">Yönetmen Notu:</p>
                            <p className="text-amber-500/80 text-xs mt-1 font-medium">
                                🎬 Çekim başladıktan sonra (kayıt sonrası) senaryo bilgileri değiştirilemez. Lütfen ekibini dikkatli seç.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmitTeam} className="p-8 md:p-10 space-y-12">
                        {/* Team Details */}
                        <section>
                            <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-4 mb-8 flex items-center gap-3">
                                <span className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs border border-slate-700 font-bold">1</span>
                                🎬 Yapım Ekibini Oluştur
                            </h3>
                            
                            <div className="space-y-8">
                                {/* Category Selection Cards */}
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
                                            <p className="text-xs text-slate-500 leading-relaxed font-medium">Geleneksel sinema, kamera, ışık ve gerçek oyuncular.</p>
                                            {teamForm.category === Category.LIVE_ACTION && <div className="absolute top-4 right-4 text-amber-500"><CheckCircle size={20} /></div>}
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
                                            <p className="text-xs text-slate-500 leading-relaxed font-medium">Yapay zeka araçları ile oluşturulan dijital hikaye anlatımı.</p>
                                            {teamForm.category === Category.AI_ANIMATION && <div className="absolute top-4 right-4 text-purple-500"><CheckCircle size={20} /></div>}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">Yapım Adı (Takım)</label>
                                        <input name="name" value={teamForm.name} onChange={handleTeamChange} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3.5 outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 text-white placeholder-slate-600 font-medium transition-all" placeholder="Örn: Kuzey Yıldızı Prodüksiyon" />
                                        {formErrors.teamName && <p className="text-rose-500 text-xs mt-1">{formErrors.teamName}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">Tema Seçimi</label>
                                        <select name="theme" value={teamForm.theme} onChange={handleTeamChange} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3.5 outline-none focus:border-rose-500 text-white font-medium transition-all">
                                            {Object.values(Theme).map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                </div>

                                {/* Conditional Verse Dropdown */}
                                {teamForm.theme === Theme.AYET && (
                                    <div className="bg-amber-900/10 p-5 rounded-xl border border-amber-900/30 animate-fadeIn">
                                        <label className="block text-sm font-bold text-amber-500 mb-2 flex items-center gap-2"><BookOpen size={16}/> Hangi Ayet?</label>
                                        <select name="selectedVerse" value={teamForm.selectedVerse} onChange={handleTeamChange} className="w-full bg-slate-900 border border-amber-500/30 rounded-xl p-3.5 outline-none text-white focus:border-amber-500">
                                            <option value="">Senaryonun temelini oluşturan ayeti seçiniz</option>
                                            {verses.map(v => <option key={v} value={v}>{v}</option>)}
                                        </select>
                                        {formErrors.verse && <p className="text-rose-500 text-xs mt-1">{formErrors.verse}</p>}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">Yapım Logosu</label>
                                    <div className="flex items-center gap-4 bg-slate-800/50 p-4 rounded-xl border-2 border-dashed border-slate-700 hover:border-slate-500 transition-colors">
                                        <div className="w-16 h-16 bg-slate-900 rounded-lg flex items-center justify-center border border-slate-700 overflow-hidden shadow-inner relative">
                                            {/* Film sprocket holes simulation */}
                                            <div className="absolute left-0 top-0 bottom-0 w-2 border-r border-dashed border-slate-800"></div>
                                            <div className="absolute right-0 top-0 bottom-0 w-2 border-l border-dashed border-slate-800"></div>
                                            
                                            {logoPreview ? <img src={logoPreview} className="w-full h-full object-cover z-10"/> : <ImageIcon size={24} className="text-slate-600"/>}
                                        </div>
                                        <div className="flex-1">
                                            <input type="file" onChange={handleLogoUpload} accept="image/png, image/jpeg" className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-rose-900 file:text-rose-100 hover:file:bg-rose-800 transition-colors cursor-pointer"/>
                                            <p className="text-xs text-slate-600 mt-2 font-medium">* 128x128px boyutuna otomatik ölçeklenir.</p>
                                        </div>
                                    </div>
                                    {formErrors.logo && <p className="text-rose-500 text-xs mt-1 font-bold">{formErrors.logo}</p>}
                                </div>
                            </div>
                        </section>

                        {/* Students */}
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
                                    <div key={idx} className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 hover:border-teal-500/50 transition-all group relative overflow-hidden shadow-sm">
                                        {/* Spotlight Effect */}
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        
                                        <div className="flex flex-col md:flex-row gap-5 items-end relative z-10">
                                            <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-slate-500 font-bold border border-slate-700 shadow-inner">
                                                {idx + 1}
                                            </div>
                                            <div className="flex-1 w-full">
                                                <label className="text-[10px] font-bold text-slate-500 mb-1.5 block uppercase tracking-wider">Ad</label>
                                                <input value={student.firstName} onChange={(e) => handleStudentChange(idx, 'firstName', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm focus:border-teal-500 outline-none text-white placeholder-slate-600 transition-colors" placeholder="Oyuncu Adı" />
                                            </div>
                                            <div className="flex-1 w-full">
                                                <label className="text-[10px] font-bold text-slate-500 mb-1.5 block uppercase tracking-wider">Soyad</label>
                                                <input value={student.lastName} onChange={(e) => handleStudentChange(idx, 'lastName', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm focus:border-teal-500 outline-none text-white placeholder-slate-600 transition-colors" placeholder="Oyuncu Soyadı" />
                                            </div>
                                            <div className="w-full md:w-32">
                                                <label className="text-[10px] font-bold text-slate-500 mb-1.5 block uppercase tracking-wider">Sınıf</label>
                                                <input value={student.grade} onChange={(e) => handleStudentChange(idx, 'grade', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm focus:border-teal-500 outline-none text-white placeholder-slate-600 transition-colors" placeholder="11-A" />
                                            </div>
                                            {students.length > 3 && (
                                                <button type="button" onClick={() => removeStudent(idx)} className="p-2.5 text-rose-500 hover:bg-rose-900/20 rounded-lg bg-slate-900 border border-slate-700 hover:border-rose-500/50 transition-colors shadow-sm">
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                             {students.length < 6 && (
                                <button type="button" onClick={addStudent} className="mt-6 w-full py-4 border-2 border-dashed border-slate-700 rounded-2xl text-slate-400 font-medium hover:border-teal-500 hover:text-teal-400 hover:bg-slate-800/50 transition-all flex items-center justify-center gap-2">
                                    <UserPlus size={20} /> Yeni Ekip Üyesi Ekle
                                </button>
                            )}
                            {formErrors.student_0 && <p className="text-rose-500 text-sm mt-3 text-center font-bold bg-rose-900/10 py-2 rounded-lg border border-rose-900/20">Lütfen tüm ekip bilgilerini eksiksiz doldurun.</p>}
                        </section>

                        <div className="pt-6 border-t border-slate-800">
                            <button type="submit" disabled={isCreating} className="w-full bg-gradient-to-r from-rose-700 to-rose-600 hover:from-rose-600 hover:to-rose-500 text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center shadow-lg shadow-rose-900/30 transform transition hover:scale-[1.01] disabled:opacity-70 disabled:cursor-not-allowed text-lg">
                                {isCreating ? (
                                    <><div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div> Set Kuruluyor...</>
                                ) : (
                                    <>Kayıt ve Motor! <Clapperboard className="ml-2" size={24}/></>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
  }

  const { team, status, evaluation } = currentApplication;

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        onChange={handleFileChange} 
        accept={activeContext?.type === 'video' ? 'video/mp4,video/quicktime' : 'application/pdf'}
      />

      {/* Header Banner */}
      <div className="bg-slate-900 text-white pb-32 pt-16 relative overflow-hidden">
          {/* Background Texture */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }}></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-rose-900/20 blur-[100px] rounded-full"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                  <div className="w-28 h-28 bg-white rounded-full p-1 flex items-center justify-center overflow-hidden border-4 border-amber-400 shadow-2xl relative">
                      {team.logoUrl ? (
                          <img src={team.logoUrl} alt="Team Logo" className="w-full h-full object-cover rounded-full" />
                      ) : (
                          <Users className="text-gray-300" size={40} />
                      )}
                  </div>
                  <div className="flex-1">
                      <h1 className="text-4xl font-black tracking-tight">{team.name}</h1>
                      <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-slate-300 mt-3 text-sm font-medium">
                          <span className="bg-slate-800 px-3 py-1 rounded-full border border-slate-700 shadow-sm">{team.category}</span>
                          <span className="flex items-center"><Award size={16} className="mr-1 text-amber-500"/> Tema: {team.theme}</span>
                          <span className="flex items-center"><Users size={16} className="mr-1 text-teal-500"/> {team.students.length} Öğrenci</span>
                      </div>
                  </div>
                  <div className="bg-white/5 backdrop-blur-md px-8 py-5 rounded-2xl border border-white/10 text-center shadow-xl">
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Başvuru Durumu</p>
                      <div className="text-xl font-bold">{getStatusBadge(status)}</div>
                  </div>
              </div>
          </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20">
          
          {/* Dashboard Summary Area */}
          <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                   <div className="bg-teal-50 p-3 rounded-full text-teal-600 border border-teal-100">
                       <CheckCircle size={24} />
                   </div>
                   <p className="text-slate-800 font-bold text-lg">Takımınız başarıyla oluşturulmuştur.</p>
              </div>
              <button onClick={printTeacherGuide} className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold py-3 px-6 rounded-xl flex items-center text-sm transition-colors border border-slate-200 shadow-sm">
                  <FileDown size={18} className="mr-2" />
                  Görev Rehberi İndir (PDF)
              </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Main Content: Stages */}
              <div className="lg:col-span-2 space-y-8">
                  
                  {/* Evaluation Result Card */}
                  {status === ApplicationStatus.GRADED && evaluation && (
                      <div className="bg-white rounded-3xl shadow-xl p-8 border-t-8 border-amber-500">
                          <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center">
                              <Award className="mr-3 text-amber-500" size={32} />
                              Jüri Değerlendirmesi
                          </h2>
                          <div className="flex flex-col sm:flex-row items-start gap-8">
                              <div className="bg-amber-50 p-8 rounded-2xl text-center min-w-[160px] border border-amber-100">
                                  <span className="block text-6xl font-black text-amber-500">{evaluation.score}</span>
                                  <span className="text-xs text-amber-800 font-bold mt-2 uppercase tracking-wide">Toplam Puan</span>
                              </div>
                              <div className="flex-1 w-full">
                                  <h4 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide">Jüri Geri Bildirimi:</h4>
                                  <p className="text-gray-600 italic bg-gray-50 p-5 rounded-xl border border-gray-200 leading-relaxed">
                                      "{evaluation.feedback}"
                                  </p>
                                  <div className="grid grid-cols-2 gap-4 mt-6 text-sm">
                                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex justify-between"><span className="font-bold text-slate-600">Senaryo:</span> <span className="font-bold">{evaluation.criteriaScores?.script}/30</span></div>
                                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex justify-between"><span className="font-bold text-slate-600">Teknik:</span> <span className="font-bold">{evaluation.criteriaScores?.technical}/25</span></div>
                                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex justify-between"><span className="font-bold text-slate-600">Yaratıcılık:</span> <span className="font-bold">{evaluation.criteriaScores?.creativity}/25</span></div>
                                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex justify-between"><span className="font-bold text-slate-600">Kurgu:</span> <span className="font-bold">{evaluation.criteriaScores?.editing}/20</span></div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  )}

                  {/* Stage 1: Preliminary */}
                  <div className={`bg-white rounded-3xl shadow-lg p-8 border border-gray-100 relative overflow-hidden transition-all duration-300 ${team.isPreliminaryStageComplete ? 'border-l-8 border-l-green-500' : ''}`}>
                      {team.isPreliminaryStageComplete && (
                          <div className="absolute top-0 right-0 bg-green-500 text-white px-4 py-1.5 rounded-bl-2xl text-[10px] font-black uppercase tracking-widest flex items-center shadow-md">
                              <CheckCircle size={12} className="mr-1.5" /> TAMAMLANDI
                          </div>
                      )}
                      <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center">
                          <span className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center mr-4 text-sm font-bold shadow-md">1</span>
                          Ön Başvuru & Belgeler
                      </h2>
                      <p className="text-gray-500 mb-8 text-sm leading-relaxed pl-14">
                          Yarışmaya katılım için her öğrencinin Veli İzin ve KVKK Aydınlatma metinlerini imzalı olarak yüklemesi gerekmektedir. (Sadece PDF kabul edilir)
                          <button className="text-rose-600 font-bold ml-2 hover:underline">Belge Şablonlarını İndir</button>
                      </p>

                      <div className="space-y-4 pl-0 sm:pl-14">
                          {team.students.map((student) => (
                              <div key={student.id} className="bg-gray-50 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-gray-100 hover:border-gray-200 transition-colors">
                                  <div className="flex items-center gap-4 w-full sm:w-auto">
                                      <div className="w-12 h-12 rounded-full bg-white text-slate-700 flex items-center justify-center font-bold text-lg shadow-sm border border-gray-100">
                                          {student.firstName[0]}{student.lastName[0]}
                                      </div>
                                      <div>
                                          <p className="font-bold text-slate-900 text-base">{student.firstName} {student.lastName}</p>
                                          <p className="text-xs text-gray-500 font-medium">{student.grade}</p>
                                      </div>
                                  </div>
                                  <div className="flex gap-3 w-full sm:w-auto">
                                      {/* Parent Consent */}
                                      <button 
                                        onClick={() => handleUploadClick('parent', student.id)}
                                        disabled={uploading !== null && uploading !== `parent-${student.id}`}
                                        className={`flex-1 sm:flex-none flex items-center justify-center px-4 py-2.5 rounded-xl text-xs font-bold transition-all border shadow-sm ${
                                            student.hasParentalConsent 
                                            ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100' 
                                            : 'bg-white border-gray-200 hover:border-rose-500 text-gray-600 hover:text-rose-600 hover:bg-rose-50'
                                        }`}
                                      >
                                          {uploading === `parent-${student.id}` ? (
                                               <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                                          ) : student.hasParentalConsent ? (
                                               <CheckCircle size={14} className="mr-2"/> 
                                          ) : (
                                               <Upload size={14} className="mr-2"/> 
                                          )}
                                          {uploading === `parent-${student.id}` ? 'Yükleniyor...' : student.hasParentalConsent ? 'Yüklendi' : 'Veli İzni (PDF)'}
                                      </button>
                                      
                                      {/* KVKK */}
                                      <button 
                                        onClick={() => handleUploadClick('kvkk', student.id)}
                                        disabled={uploading !== null && uploading !== `kvkk-${student.id}`}
                                        className={`flex-1 sm:flex-none flex items-center justify-center px-4 py-2.5 rounded-xl text-xs font-bold transition-all border shadow-sm ${
                                            student.hasKvkkConsent 
                                            ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100' 
                                            : 'bg-white border-gray-200 hover:border-rose-500 text-gray-600 hover:text-rose-600 hover:bg-rose-50'
                                        }`}
                                      >
                                          {uploading === `kvkk-${student.id}` ? (
                                               <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                                          ) : student.hasKvkkConsent ? (
                                               <CheckCircle size={14} className="mr-2"/> 
                                          ) : (
                                               <Upload size={14} className="mr-2"/> 
                                          )}
                                          {uploading === `kvkk-${student.id}` ? 'Yükleniyor...' : student.hasKvkkConsent ? 'Yüklendi' : 'KVKK (PDF)'}
                                      </button>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>

                  {/* Stage 2: Video Submission */}
                  <div className={`bg-white rounded-3xl shadow-lg p-8 border border-gray-100 ${!team.isPreliminaryStageComplete ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
                      <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center">
                          <span className="w-10 h-10 rounded-full bg-rose-100 text-rose-900 flex items-center justify-center mr-4 text-sm font-bold shadow-md">2</span>
                          Final Video Teslimi
                      </h2>
                      
                      {!team.isPreliminaryStageComplete && (
                          <div className="bg-amber-50 text-amber-800 p-4 rounded-xl text-sm mb-6 flex items-center font-medium ml-14 border border-amber-100">
                              <AlertCircle size={18} className="mr-3 flex-shrink-0"/>
                              Video yüklemesi yapabilmek için önce 1. Aşamada tüm belgeleri tamamlamanız gerekmektedir.
                          </div>
                      )}

                      <div className="ml-0 sm:ml-14 border-2 border-dashed border-gray-300 rounded-2xl p-10 text-center bg-gray-50 hover:bg-white hover:border-teal-500 transition-all group cursor-pointer" onClick={() => handleUploadClick('video')}>
                          {team.videoStatus === 'UPLOADED' ? (
                              <div className="py-2">
                                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                      <CheckCircle size={40} />
                                  </div>
                                  <h3 className="text-xl font-bold text-gray-900">Video Başarıyla Yüklendi</h3>
                                  <p className="text-sm text-gray-500 mb-6 font-medium">Dosya: {team.videoUrl || 'video.mp4'}</p>
                                  <button onClick={(e) => { e.stopPropagation(); handleUploadClick('video'); }} className="text-teal-600 text-sm hover:underline font-bold bg-teal-50 px-4 py-2 rounded-lg">Yeni Video Yükle (Güncelle)</button>
                              </div>
                          ) : (
                              <div>
                                  <div className="w-20 h-20 bg-white text-teal-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-md border border-gray-100">
                                      {uploading === 'video' ? <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div> : <Video size={36} />}
                                  </div>
                                  <h3 className="text-xl font-bold text-gray-900">Video Dosyası Yükle</h3>
                                  <p className="text-sm text-gray-500 mt-2 font-medium">MP4/MOV, 1080p, Max 2GB</p>
                                  <p className="text-xs text-amber-600 mt-4 font-bold bg-amber-50 inline-block px-3 py-1 rounded-full border border-amber-100">Son Teslim: 4 Mayıs 2026</p>
                              </div>
                          )}
                      </div>
                  </div>

              </div>

              {/* Sidebar: Timeline */}
              <div className="space-y-6">
                  {/* Status Box */}
                  <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100">
                      <h3 className="font-bold text-gray-900 mb-6 flex items-center">
                          <Clock className="mr-2 text-teal-500" size={20} /> Takvim
                      </h3>
                      <div className="space-y-6 relative pl-2">
                          <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-gray-100"></div>
                          {timelineEvents.map((event, idx) => (
                                 <div key={idx} className="relative pl-8 flex flex-col">
                                     <span className="absolute left-[13px] top-1.5 w-3.5 h-3.5 rounded-full bg-white border-2 border-teal-500 z-10"></span>
                                     <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">{event.date}</p>
                                     <p className="font-bold text-sm text-gray-800">{event.label}</p>
                                 </div>
                             ))}
                      </div>
                  </div>

                  {/* Quick Info */}
                  <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
                      <h3 className="font-bold text-gray-900 mb-6">Takım Bilgileri</h3>
                      <div className="bg-rose-50 p-3 rounded-xl text-xs text-rose-700 mb-6 border border-rose-100 flex items-start font-medium">
                          <Info size={14} className="mr-2 flex-shrink-0 mt-0.5"/>
                          Kayıt sonrası bilgiler değiştirilemez.
                      </div>
                      <div className="space-y-4 text-sm">
                           <div className="flex justify-between border-b border-gray-100 pb-3">
                               <span className="text-gray-500 font-medium">Danışman</span>
                               <span className="font-bold text-slate-800 text-right">{currentApplication.teacher.fullName}</span>
                           </div>
                           <div className="flex justify-between border-b border-gray-100 pb-3">
                               <span className="text-gray-500 font-medium">Okul</span>
                               <span className="font-bold text-slate-800 text-right">{currentApplication.teacher.school}</span>
                           </div>
                           <div className="flex justify-between border-b border-gray-100 pb-3">
                               <span className="text-gray-500 font-medium">Kategori</span>
                               <span className="font-bold text-slate-800 text-right">{team.category}</span>
                           </div>
                           <div className="flex justify-between">
                               <span className="text-gray-500 font-medium">Tema</span>
                               <span className="font-bold text-slate-800 text-right">{team.theme}</span>
                           </div>
                           {team.selectedVerse && (
                               <div className="flex justify-between pt-3 border-t border-gray-100 items-center">
                                   <span className="text-gray-500 font-medium">Ayet</span>
                                   <span className="font-bold text-[10px] bg-amber-50 px-2 py-1 rounded text-amber-800 text-right border border-amber-100">{team.selectedVerse}</span>
                               </div>
                           )}
                      </div>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};
