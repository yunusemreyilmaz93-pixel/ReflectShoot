
import React, { useState, useEffect } from 'react';
import { Search, Check, X, Eye, Award, FileText, Shield, Inbox, Download, Users, Film, School, Mail, AlertTriangle, Send, Clapperboard, Video, Cpu, Activity, PieChart, BarChart3, Clock, UserCheck } from 'lucide-react';
import { ApplicationStatus, Category, Application, EvaluationCriteria, Theme, UserRole, UserProfile } from '../types';
import { useAppContext } from '../context/AppContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

export const Admin: React.FC = () => {
  const { mockAdminApplications, gradeApplication, updateApplication, updateUserRole } = useAppContext();
  const [activeTab, setActiveTab] = useState<'STUDIO' | 'TEACHERS'>('STUDIO');
  
  // -- Studio Logic --
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [detailApp, setDetailApp] = useState<Application | null>(null); 
  const [criteria, setCriteria] = useState<EvaluationCriteria>({ script: 0, technical: 0, creativity: 0, editing: 0 });
  const [feedback, setFeedback] = useState('');
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');

  // -- Teacher Management Logic --
  const [pendingTeachers, setPendingTeachers] = useState<UserProfile[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);

  useEffect(() => {
    if (activeTab === 'TEACHERS') {
      fetchPendingTeachers();
    }
  }, [activeTab]);

  const fetchPendingTeachers = async () => {
    setLoadingTeachers(true);
    try {
      const q = query(collection(db, "users"), where("role", "==", UserRole.PENDING_TEACHER));
      const querySnapshot = await getDocs(q);
      const teachers: UserProfile[] = [];
      querySnapshot.forEach((doc) => {
        teachers.push(doc.data() as UserProfile);
      });
      setPendingTeachers(teachers);
    } catch (error) {
      console.error("Error fetching teachers", error);
    }
    setLoadingTeachers(false);
  };

  const approveTeacher = async (uid: string) => {
    if (window.confirm("Bu öğretmeni onaylamak istediğinize emin misiniz?")) {
       await updateUserRole(uid, UserRole.TEACHER);
       fetchPendingTeachers(); // Refresh list
    }
  };

  // ... (Existing Helper Functions: getStatusBadge, handleUpdateStatus, etc.) ...
  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.GRADED: return <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm">PUANLANDI</span>;
      case ApplicationStatus.APPROVED: return <span className="bg-teal-500/10 text-teal-400 border border-teal-500/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm">ONAYLANDI</span>;
      case ApplicationStatus.FINAL_SUBMITTED: return <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm">VİDEO YÜKLENDİ</span>;
      case ApplicationStatus.PRELIMINARY_SUBMITTED: return <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm">ÖN BAŞVURU</span>;
      default: return <span className="bg-slate-800 text-slate-400 border border-slate-700 px-3 py-1 rounded-full text-[10px] uppercase font-bold">{status}</span>;
    }
  };

  const sendMissingDocWarning = (app: Application) => {
      alert(`Uyarı E-postası Gönderildi: ${app.teacher.email}\nKonu: Eksik Belge Uyarısı\n\nSayın ${app.teacher.fullName}, takımınızın bazı belgeleri eksiktir. Lütfen kontrol ediniz.`);
  };

  const handleBulkEmailSend = () => {
      alert(`Toplu E-posta Gönderildi!\nKonu: ${emailSubject}`);
      setIsEmailModalOpen(false);
      setEmailSubject('');
      setEmailMessage('');
  };

  const openGrading = (app: Application) => {
      setSelectedApp(app);
      if (app.evaluation?.criteriaScores) {
          setCriteria(app.evaluation.criteriaScores);
      } else {
          setCriteria({ script: 0, technical: 0, creativity: 0, editing: 0 });
      }
      setFeedback(app.evaluation?.feedback || '');
  };

  const submitGrade = () => {
      if(selectedApp) {
          gradeApplication(selectedApp.id, criteria, feedback);
          setSelectedApp(null);
      }
  };

  const handleExport = () => {
      const headers = ["Takım Adı", "Kategori", "Okul", "Şehir", "Danışman", "E-posta", "Öğrenci Sayısı", "Durum", "Video Linki"];
      const rows = mockAdminApplications.map(app => [
          app.team.name,
          app.team.category,
          app.teacher.school,
          app.teacher.city,
          app.teacher.fullName,
          app.teacher.email,
          app.team.students.length,
          app.status,
          app.team.videoUrl || "Yok"
      ]);

      const csvContent = "data:text/csv;charset=utf-8," 
          + headers.join(",") + "\n" 
          + rows.map(e => e.join(",")).join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `reflect_shoot_kayitlar_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  // --- Filter Logic ---
  const filteredApps = mockAdminApplications.filter(app => {
      const matchCategory = filterCategory === 'ALL' || app.team.category === filterCategory;
      const term = searchTerm.toLowerCase();
      const matchSearch = 
        app.teacher.school.toLowerCase().includes(term) || 
        app.teacher.fullName.toLowerCase().includes(term) ||
        app.team.name.toLowerCase().includes(term);
      return matchCategory && matchSearch;
  });

  const totalScore = criteria.script + criteria.technical + criteria.creativity + criteria.editing;
  const totalTeachers = new Set(mockAdminApplications.map(a => a.teacher.email)).size;
  const totalTeams = mockAdminApplications.length;
  const liveActionCount = mockAdminApplications.filter(a => a.team.category === Category.LIVE_ACTION).length;
  const aiCount = mockAdminApplications.filter(a => a.team.category === Category.AI_ANIMATION).length;

  const calculateMostPopularTheme = () => {
      if (mockAdminApplications.length === 0) return "Veri Yok";
      const themes: Record<string, number> = {};
      mockAdminApplications.forEach(app => {
          themes[app.team.theme] = (themes[app.team.theme] || 0) + 1;
      });
      return Object.keys(themes).reduce((a, b) => themes[a] > themes[b] ? a : b);
  };
  const popularTheme = calculateMostPopularTheme();

  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-8 font-sans text-slate-200 selection:bg-rose-500 selection:text-white">
      {/* Background Texture */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }}></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 border-b border-slate-800 pb-6 gap-6">
            <div>
                 <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                    <Clapperboard className="text-rose-500" /> Stüdyo Yönetimi
                 </h1>
                 <p className="text-slate-500 text-sm mt-1 font-medium">Reflect&Shoot Prodüksiyon Merkezi</p>
            </div>
            
            <div className="flex gap-4">
                <button onClick={() => setIsEmailModalOpen(true)} className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-3 rounded-xl font-bold flex items-center shadow-lg border border-slate-700 transition-all hover:border-teal-500/50 text-sm">
                   <Mail size={16} className="mr-2 text-teal-400"/> Stüdyo Duyurusu
                </button>
                <button onClick={handleExport} className="bg-gradient-to-r from-rose-700 to-rose-600 hover:from-rose-600 hover:to-rose-500 text-white px-5 py-3 rounded-xl font-bold flex items-center shadow-lg shadow-rose-900/20 transition-all text-sm">
                    <Download size={16} className="mr-2"/> Raporu Dışa Aktar
                </button>
            </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex space-x-4 mb-8">
            <button 
                onClick={() => setActiveTab('STUDIO')}
                className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'STUDIO' ? 'bg-slate-800 text-white shadow-lg border border-slate-700' : 'text-slate-500 hover:text-white'}`}
            >
                <Clapperboard size={18}/> Başvurular & Stüdyo
            </button>
            <button 
                onClick={() => setActiveTab('TEACHERS')}
                className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'TEACHERS' ? 'bg-slate-800 text-white shadow-lg border border-slate-700' : 'text-slate-500 hover:text-white'}`}
            >
                <UserCheck size={18}/> Öğretmen Onayları
                {pendingTeachers.length > 0 && <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full">{pendingTeachers.length}</span>}
            </button>
        </div>

        {activeTab === 'TEACHERS' && (
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl animate-scaleIn">
                 <div className="p-6 border-b border-slate-800 bg-slate-950/50">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Shield className="text-amber-500"/> Bekleyen Öğretmen Onayları
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">k12.tr uzantılı olmayan e-posta adresleri manuel onay gerektirir.</p>
                 </div>
                 
                 {loadingTeachers ? (
                     <div className="p-12 text-center">
                         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500 mx-auto"></div>
                     </div>
                 ) : pendingTeachers.length === 0 ? (
                     <div className="p-12 text-center text-slate-500">
                         <Check size={48} className="mx-auto mb-4 text-green-500/50"/>
                         <p>Bekleyen onay bulunmamaktadır.</p>
                     </div>
                 ) : (
                    <table className="w-full text-left">
                        <thead className="bg-slate-950 text-slate-400 text-xs uppercase">
                            <tr>
                                <th className="p-4">Ad Soyad</th>
                                <th className="p-4">Okul</th>
                                <th className="p-4">E-posta</th>
                                <th className="p-4">Şehir</th>
                                <th className="p-4 text-right">İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {pendingTeachers.map(teacher => (
                                <tr key={teacher.uid} className="hover:bg-slate-800/50">
                                    <td className="p-4 font-bold text-white">{teacher.fullName}</td>
                                    <td className="p-4 text-slate-300">{teacher.school}</td>
                                    <td className="p-4 text-slate-400 font-mono text-sm">{teacher.email}</td>
                                    <td className="p-4 text-slate-400">{teacher.city}</td>
                                    <td className="p-4 text-right">
                                        <button 
                                            onClick={() => approveTeacher(teacher.uid)}
                                            className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-lg transition-all flex items-center gap-2 ml-auto"
                                        >
                                            <Check size={14}/> Onayla
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 )}
            </div>
        )}

        {activeTab === 'STUDIO' && (
            <>
                {/* Cinematic Metrics Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {/* Metric 1 */}
                    <div className="bg-slate-900/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.2)] group hover:border-teal-500/30 transition-all relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-teal-500/10 transition-colors"></div>
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Yapım Ekipleri</p>
                            <Users size={18} className="text-teal-500 opacity-80"/>
                        </div>
                        <p className="text-4xl font-black text-white tracking-tight">{totalTeams}</p>
                        <div className="h-1 w-full bg-slate-800 mt-4 rounded-full overflow-hidden">
                            <div className="h-full bg-teal-500 w-full opacity-50"></div>
                        </div>
                    </div>

                    {/* Metric 2 */}
                    <div className="bg-slate-900/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.2)] group hover:border-rose-500/30 transition-all relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-rose-500/10 transition-colors"></div>
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Danışman Yönetmenler</p>
                            <School size={18} className="text-rose-500 opacity-80"/>
                        </div>
                        <p className="text-4xl font-black text-white tracking-tight">{totalTeachers}</p>
                        <div className="h-1 w-full bg-slate-800 mt-4 rounded-full overflow-hidden">
                            <div className="h-full bg-rose-500 w-full opacity-50"></div>
                        </div>
                    </div>

                    {/* Metric 3 */}
                    <div className="bg-slate-900/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.2)] group hover:border-amber-500/30 transition-all relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-amber-500/10 transition-colors"></div>
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Live Action</p>
                            <Video size={18} className="text-amber-500 opacity-80"/>
                        </div>
                        <p className="text-4xl font-black text-white tracking-tight">{liveActionCount}</p>
                        <div className="h-1 w-full bg-slate-800 mt-4 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 opacity-50" style={{ width: `${totalTeams ? (liveActionCount / totalTeams) * 100 : 0}%` }}></div>
                        </div>
                    </div>

                    {/* Metric 4 */}
                    <div className="bg-slate-900/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.2)] group hover:border-purple-500/30 transition-all relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-purple-500/10 transition-colors"></div>
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">AI Filmmaking</p>
                            <Cpu size={18} className="text-purple-500 opacity-80"/>
                        </div>
                        <p className="text-4xl font-black text-white tracking-tight">{aiCount}</p>
                        <div className="h-1 w-full bg-slate-800 mt-4 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500 opacity-50" style={{ width: `${totalTeams ? (aiCount / totalTeams) * 100 : 0}%` }}></div>
                        </div>
                    </div>
                </div>

                {/* Filters & Toolbar */}
                <div className="bg-slate-900 rounded-t-2xl p-5 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                        <button 
                        onClick={() => setFilterCategory('ALL')} 
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${filterCategory === 'ALL' ? 'bg-slate-700 text-white shadow-md' : 'bg-transparent text-slate-500 hover:text-white hover:bg-slate-800'}`}
                        >
                            <Film size={14}/> Tümü
                        </button>
                        <button 
                        onClick={() => setFilterCategory(Category.LIVE_ACTION)} 
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${filterCategory === Category.LIVE_ACTION ? 'bg-amber-900/40 text-amber-400 border border-amber-500/50' : 'bg-transparent text-slate-500 hover:text-white hover:bg-slate-800'}`}
                        >
                            <Video size={14}/> Canlı Çekim
                        </button>
                        <button 
                        onClick={() => setFilterCategory(Category.AI_ANIMATION)} 
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${filterCategory === Category.AI_ANIMATION ? 'bg-purple-900/40 text-purple-400 border border-purple-500/50' : 'bg-transparent text-slate-500 hover:text-white hover:bg-slate-800'}`}
                        >
                            <Cpu size={14}/> AI Animasyon
                        </button>
                    </div>

                    <div className="relative w-full md:w-auto">
                        <input 
                            type="text" 
                            placeholder="Okul, Takım veya Danışman Ara..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-slate-800 text-white pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 focus:border-rose-500 outline-none w-full md:w-72 transition-colors text-sm font-medium"
                        />
                        <Search className="absolute left-3 top-2.5 text-slate-500" size={18} />
                    </div>
                </div>

                {/* Applications List */}
                <div className="bg-slate-900 rounded-b-2xl border-x border-b border-slate-800 overflow-hidden shadow-2xl">
                    {filteredApps.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-950/50 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
                                        <th className="p-5 font-bold">Takım & Kategori</th>
                                        <th className="p-5 font-bold">Danışman & Okul</th>
                                        <th className="p-5 font-bold">Durum</th>
                                        <th className="p-5 font-bold">Video</th>
                                        <th className="p-5 font-bold text-right">İşlemler</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {filteredApps.map((app) => (
                                        <tr key={app.id} className="hover:bg-slate-800/50 transition-colors group">
                                            <td className="p-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 font-bold overflow-hidden">
                                                        {app.team.logoUrl ? <img src={app.team.logoUrl} className="w-full h-full object-cover"/> : app.team.name.substring(0,2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-white text-sm">{app.team.name}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${app.team.category === Category.LIVE_ACTION ? 'bg-amber-900/20 text-amber-500 border-amber-500/20' : 'bg-purple-900/20 text-purple-500 border-purple-500/20'}`}>
                                                                {app.team.category === Category.LIVE_ACTION ? 'Live' : 'AI'}
                                                            </span>
                                                            <span className="text-[10px] text-slate-500 font-medium">{app.team.theme.substring(0, 15)}...</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <p className="font-bold text-slate-300 text-sm">{app.teacher.fullName}</p>
                                                <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                                                    <School size={12}/> {app.teacher.school}
                                                </p>
                                                <p className="text-[10px] text-slate-600 mt-0.5">{app.teacher.city}</p>
                                            </td>
                                            <td className="p-5">
                                                {getStatusBadge(app.status)}
                                            </td>
                                            <td className="p-5">
                                                {app.team.videoStatus === 'UPLOADED' ? (
                                                    <div className="flex items-center gap-2">
                                                        <a href="#" className="text-teal-500 hover:text-teal-400 font-bold text-xs flex items-center gap-1 underline decoration-teal-500/30">
                                                            <Film size={12}/> İzle
                                                        </a>
                                                        <span className="text-[10px] text-slate-600 px-1.5 py-0.5 bg-slate-800 rounded">{app.team.videoResolution || 'FHD'}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-600 text-xs italic">Bekleniyor</span>
                                                )}
                                            </td>
                                            <td className="p-5 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button 
                                                    onClick={() => setDetailApp(app)}
                                                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors"
                                                    title="Detaylar"
                                                    >
                                                        <Eye size={16}/>
                                                    </button>
                                                    
                                                    {app.team.videoStatus === 'UPLOADED' && app.status !== ApplicationStatus.GRADED && (
                                                        <button 
                                                        onClick={() => openGrading(app)}
                                                        className="p-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg shadow-lg shadow-rose-900/20 transition-colors"
                                                        title="Puanla"
                                                        >
                                                            <Award size={16}/>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-12 text-center">
                            <Inbox size={48} className="mx-auto text-slate-700 mb-4" />
                            <h3 className="text-slate-300 font-bold text-lg">Başvuru Bulunamadı</h3>
                            <p className="text-slate-500 text-sm mt-2">Arama kriterlerinizi değiştirerek tekrar deneyiniz.</p>
                        </div>
                    )}
                </div>
            </>
        )}
      </div>

      {/* Grading Modal */}
      {selectedApp && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl relative overflow-hidden animate-scaleIn">
                  <div className="bg-slate-800 p-6 border-b border-slate-700 flex justify-between items-center">
                      <h3 className="font-bold text-white text-xl flex items-center gap-2">
                          <Award className="text-rose-500"/> Jüri Değerlendirmesi
                      </h3>
                      <button onClick={() => setSelectedApp(null)} className="text-slate-400 hover:text-white transition-colors">
                          <X size={24}/>
                      </button>
                  </div>
                  
                  <div className="p-8 max-h-[80vh] overflow-y-auto">
                      <div className="mb-6 bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
                          <div>
                              <p className="text-xs text-slate-500 font-bold uppercase">Proje</p>
                              <p className="text-white font-bold text-lg">{selectedApp.team.name}</p>
                          </div>
                          <div className="text-right">
                              <p className="text-xs text-slate-500 font-bold uppercase">Kategori</p>
                              <p className="text-amber-500 font-bold">{selectedApp.team.category}</p>
                          </div>
                      </div>

                      <div className="space-y-6 mb-8">
                           {[
                               { id: 'script', label: 'Senaryo & Hikaye', max: 30, desc: 'Olay örgüsü, karakter derinliği ve diyalog.' },
                               { id: 'technical', label: 'Teknik Kalite', max: 25, desc: 'Görüntü, ışık, ses ve kamera kullanımı.' },
                               { id: 'creativity', label: 'Yaratıcılık', max: 25, desc: 'Özgünlük, sanatsal bakış açısı ve yorum.' },
                               { id: 'editing', label: 'Kurgu & Montaj', max: 20, desc: 'Ritim, geçişler ve bütünlük.' }
                           ].map((c) => (
                               <div key={c.id}>
                                   <div className="flex justify-between mb-2">
                                       <label className="text-sm font-bold text-slate-300">{c.label}</label>
                                       <span className="text-xs font-bold text-slate-500">{criteria[c.id as keyof EvaluationCriteria]} / {c.max}</span>
                                   </div>
                                   <input 
                                     type="range" 
                                     min="0" 
                                     max={c.max} 
                                     value={criteria[c.id as keyof EvaluationCriteria]}
                                     onChange={(e) => setCriteria({...criteria, [c.id]: parseInt(e.target.value)})}
                                     className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                                   />
                                   <p className="text-[10px] text-slate-500 mt-1">{c.desc}</p>
                               </div>
                           ))}
                      </div>

                      <div className="mb-8">
                          <label className="block text-sm font-bold text-slate-300 mb-2">Jüri Notu / Geri Bildirim</label>
                          <textarea 
                             value={feedback}
                             onChange={(e) => setFeedback(e.target.value)}
                             className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-slate-300 text-sm focus:border-rose-500 outline-none h-24 resize-none"
                             placeholder="Takım için geliştirici notlarınızı buraya yazın..."
                          ></textarea>
                      </div>

                      <div className="flex justify-between items-center pt-6 border-t border-slate-800">
                          <div className="text-center">
                              <p className="text-xs text-slate-500 font-bold uppercase">Toplam Puan</p>
                              <p className="text-3xl font-black text-white">{totalScore} <span className="text-sm text-slate-600 font-normal">/ 100</span></p>
                          </div>
                          <button 
                            onClick={submitGrade}
                            className="bg-rose-600 hover:bg-rose-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-rose-900/20 transition-all"
                          >
                              Değerlendirmeyi Kaydet
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Email Modal */}
      {isEmailModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl relative overflow-hidden animate-scaleIn">
                  <div className="bg-slate-800 p-6 border-b border-slate-700 flex justify-between items-center">
                      <h3 className="font-bold text-white text-xl flex items-center gap-2">
                          <Mail className="text-teal-500"/> Toplu Duyuru
                      </h3>
                      <button onClick={() => setIsEmailModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                          <X size={24}/>
                      </button>
                  </div>
                  
                  <div className="p-8">
                      <div className="bg-teal-900/20 text-teal-400 p-4 rounded-xl mb-6 text-sm flex items-center gap-3 border border-teal-500/20">
                          <Users size={20}/>
                          <span>Bu e-posta <strong>{totalTeachers}</strong> danışman öğretmene gönderilecektir.</span>
                      </div>
                      
                      <div className="space-y-4 mb-6">
                          <div>
                              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Konu Başlığı</label>
                              <input 
                                value={emailSubject}
                                onChange={(e) => setEmailSubject(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-teal-500 outline-none"
                                placeholder="Örn: Final Tarihleri Güncellendi"
                              />
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Mesaj İçeriği</label>
                              <textarea 
                                value={emailMessage}
                                onChange={(e) => setEmailMessage(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-teal-500 outline-none h-32 resize-none"
                                placeholder="Duyuru metnini buraya yazınız..."
                              ></textarea>
                          </div>
                      </div>

                      <button 
                        onClick={handleBulkEmailSend}
                        className="w-full bg-teal-600 hover:bg-teal-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-teal-900/20 transition-all flex items-center justify-center gap-2"
                      >
                          <Send size={18}/> Gönder
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Read-Only Detail Modal */}
      {detailApp && (
           <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
               <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl relative overflow-hidden animate-scaleIn max-h-[90vh] overflow-y-auto">
                   <div className="bg-slate-800 p-6 border-b border-slate-700 flex justify-between items-center sticky top-0 z-10">
                      <h3 className="font-bold text-white text-xl flex items-center gap-2">
                          <FileText className="text-slate-400"/> Başvuru Detayı
                      </h3>
                      <button onClick={() => setDetailApp(null)} className="text-slate-400 hover:text-white transition-colors">
                          <X size={24}/>
                      </button>
                  </div>
                  <div className="p-8 space-y-8">
                       {/* Team Info */}
                       <div>
                           <h4 className="text-rose-500 font-bold uppercase text-xs tracking-widest mb-4 border-b border-slate-800 pb-2">Takım Bilgileri</h4>
                           <div className="grid grid-cols-2 gap-4">
                               <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                                   <span className="text-xs text-slate-500 block mb-1">Takım Adı</span>
                                   <span className="text-white font-bold">{detailApp.team.name}</span>
                               </div>
                               <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                                   <span className="text-xs text-slate-500 block mb-1">Kategori</span>
                                   <span className="text-white font-bold">{detailApp.team.category}</span>
                               </div>
                               <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                                   <span className="text-xs text-slate-500 block mb-1">Tema</span>
                                   <span className="text-white font-bold">{detailApp.team.theme}</span>
                               </div>
                               <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                                   <span className="text-xs text-slate-500 block mb-1">Ayet / Kaynak</span>
                                   <span className="text-white font-bold">{detailApp.team.selectedVerse || '-'}</span>
                               </div>
                           </div>
                       </div>
                       
                       {/* Teacher Info */}
                       <div>
                           <h4 className="text-rose-500 font-bold uppercase text-xs tracking-widest mb-4 border-b border-slate-800 pb-2">Danışman Bilgileri</h4>
                           <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 flex justify-between items-center">
                                <div>
                                    <p className="text-white font-bold text-lg">{detailApp.teacher.fullName}</p>
                                    <p className="text-slate-400 text-sm">{detailApp.teacher.school}</p>
                                    <p className="text-slate-500 text-xs mt-1">{detailApp.teacher.city}</p>
                                </div>
                                <div className="text-right">
                                    <a href={`mailto:${detailApp.teacher.email}`} className="text-teal-500 hover:text-teal-400 text-sm font-bold flex items-center justify-end gap-2">
                                        <Mail size={14}/> {detailApp.teacher.email}
                                    </a>
                                </div>
                           </div>
                       </div>

                       {/* Students */}
                       <div>
                           <h4 className="text-rose-500 font-bold uppercase text-xs tracking-widest mb-4 border-b border-slate-800 pb-2">Öğrenci Listesi</h4>
                           <div className="space-y-2">
                               {detailApp.team.students.map(s => (
                                   <div key={s.id} className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
                                       <span className="text-white font-medium">{s.firstName} {s.lastName}</span>
                                       <span className="text-slate-500 text-sm">{s.grade}</span>
                                   </div>
                               ))}
                           </div>
                       </div>

                        {/* Docs Status */}
                       <div>
                           <h4 className="text-rose-500 font-bold uppercase text-xs tracking-widest mb-4 border-b border-slate-800 pb-2">Evrak & Dosya Durumu</h4>
                           <div className="grid grid-cols-2 gap-4">
                                <div className={`p-4 rounded-xl border ${detailApp.team.isPreliminaryStageComplete ? 'bg-green-900/20 border-green-500/30 text-green-400' : 'bg-red-900/20 border-red-500/30 text-red-400'}`}>
                                    <p className="text-xs font-bold uppercase mb-1">İzin Belgeleri</p>
                                    <p className="font-bold flex items-center gap-2">
                                        {detailApp.team.isPreliminaryStageComplete ? <Check size={16}/> : <AlertTriangle size={16}/>}
                                        {detailApp.team.isPreliminaryStageComplete ? 'Tamamlandı' : 'Eksik Var'}
                                    </p>
                                    {!detailApp.team.isPreliminaryStageComplete && (
                                        <button onClick={() => sendMissingDocWarning(detailApp)} className="mt-2 text-[10px] bg-red-500/20 hover:bg-red-500/40 px-2 py-1 rounded text-red-300 transition-colors">
                                            Uyarı Gönder
                                        </button>
                                    )}
                                </div>
                                <div className={`p-4 rounded-xl border ${detailApp.team.videoStatus === 'UPLOADED' ? 'bg-blue-900/20 border-blue-500/30 text-blue-400' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                                    <p className="text-xs font-bold uppercase mb-1">Video Dosyası</p>
                                    <p className="font-bold flex items-center gap-2">
                                        {detailApp.team.videoStatus === 'UPLOADED' ? <Video size={16}/> : <Clock size={16}/>}
                                        {detailApp.team.videoStatus === 'UPLOADED' ? 'Yüklendi' : 'Bekleniyor'}
                                    </p>
                                    {detailApp.team.videoStatus === 'UPLOADED' && (
                                        <p className="text-[10px] mt-1 opacity-70">{detailApp.team.videoSize} • {detailApp.team.videoResolution}</p>
                                    )}
                                </div>
                           </div>
                       </div>
                  </div>
               </div>
           </div>
      )}

      <style>{`
        @keyframes scaleIn {
            from { transform: scale(0.95); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }
        .animate-scaleIn {
            animation: scaleIn 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};