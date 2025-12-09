
import React, { useState, useEffect } from 'react';
import { Search, Check, X, Eye, Award, FileText, Shield, Inbox, Download, Users, Film, School, Mail, AlertTriangle, Send, Clapperboard, Video, Cpu, Activity, PieChart, BarChart3, Clock, UserCheck, Star, Plus, Lock } from 'lucide-react';
import { ApplicationStatus, Category, Application, EvaluationCriteria, Theme, UserRole, UserProfile } from '../types';
import { useAppContext } from '../context/AppContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

export const Admin: React.FC = () => {
  const { mockAdminApplications, gradeApplication, updateApplication, updateUserRole, createJudgeAccount } = useAppContext();
  const [activeTab, setActiveTab] = useState<'STUDIO' | 'TEACHERS' | 'JUDGES'>('STUDIO');
  
  // -- Studio Logic --
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [detailApp, setDetailApp] = useState<Application | null>(null); 
  
  // -- Teacher Management Logic --
  const [pendingTeachers, setPendingTeachers] = useState<UserProfile[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);

  // -- Judge Management Logic --
  const [judges, setJudges] = useState<UserProfile[]>([]);
  const [loadingJudges, setLoadingJudges] = useState(false);
  const [newJudgeForm, setNewJudgeForm] = useState({ fullName: '', email: '', password: '' });
  const [isCreatingJudge, setIsCreatingJudge] = useState(false);

  useEffect(() => {
    if (activeTab === 'TEACHERS') {
      fetchPendingTeachers();
    } else if (activeTab === 'JUDGES') {
      fetchJudges();
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

  const fetchJudges = async () => {
      setLoadingJudges(true);
      try {
          const q = query(collection(db, "users"), where("role", "==", UserRole.JUDGE));
          const querySnapshot = await getDocs(q);
          const judgeList: UserProfile[] = [];
          querySnapshot.forEach((doc) => {
              judgeList.push(doc.data() as UserProfile);
          });
          setJudges(judgeList);
      } catch (error) {
          console.error("Error fetching judges", error);
      }
      setLoadingJudges(false);
  };

  const approveTeacher = async (uid: string) => {
    if (window.confirm("Bu öğretmeni onaylamak istediğinize emin misiniz?")) {
       await updateUserRole(uid, UserRole.TEACHER);
       fetchPendingTeachers(); // Refresh list
    }
  };

  const handleCreateJudge = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsCreatingJudge(true);
      try {
          await createJudgeAccount(newJudgeForm);
          setNewJudgeForm({ fullName: '', email: '', password: '' });
          fetchJudges(); // Refresh list
          alert("Jüri hesabı başarıyla oluşturuldu.");
      } catch (error) {
          alert("Jüri oluşturulurken hata oluştu. E-posta kullanımda olabilir.");
      }
      setIsCreatingJudge(false);
  };

  const toggleFinalist = async (app: Application) => {
      const newStatus = !app.team.isFinalist;
      const confirmMsg = newStatus 
          ? `${app.team.name} takımını FİNALİST olarak işaretlemek istediğinize emin misiniz?` 
          : `${app.team.name} takımının finalistliğini kaldırmak istediğinize emin misiniz?`;
      
      if(window.confirm(confirmMsg)) {
          const updated: Application = {
              ...app,
              team: {
                  ...app.team,
                  isFinalist: newStatus
              }
          };
          await updateApplication(updated);
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

  // --- Filter Logic & Sorting ---
  const filteredApps = mockAdminApplications.filter(app => {
      const matchCategory = filterCategory === 'ALL' || app.team.category === filterCategory;
      const term = searchTerm.toLowerCase();
      const matchSearch = 
        app.teacher.school.toLowerCase().includes(term) || 
        app.teacher.fullName.toLowerCase().includes(term) ||
        app.team.name.toLowerCase().includes(term);
      return matchCategory && matchSearch;
  });

  // Sort by average score (descending)
  const sortedApps = [...filteredApps].sort((a, b) => {
      const scoreA = a.finalScore || 0;
      const scoreB = b.finalScore || 0;
      return scoreB - scoreA;
  });

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
        </div>

        {/* Tab Switcher */}
        <div className="flex space-x-4 mb-8">
            <button 
                onClick={() => setActiveTab('STUDIO')}
                className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'STUDIO' ? 'bg-slate-800 text-white shadow-lg border border-slate-700' : 'text-slate-500 hover:text-white'}`}
            >
                <Clapperboard size={18}/> Başvurular & Liderlik Tablosu
            </button>
            <button 
                onClick={() => setActiveTab('TEACHERS')}
                className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'TEACHERS' ? 'bg-slate-800 text-white shadow-lg border border-slate-700' : 'text-slate-500 hover:text-white'}`}
            >
                <UserCheck size={18}/> Öğretmen Onayları
                {pendingTeachers.length > 0 && <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full">{pendingTeachers.length}</span>}
            </button>
            <button 
                onClick={() => setActiveTab('JUDGES')}
                className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'JUDGES' ? 'bg-slate-800 text-white shadow-lg border border-slate-700' : 'text-slate-500 hover:text-white'}`}
            >
                <Shield size={18}/> Jüri Yönetimi
            </button>
        </div>

        {/* --- JUDGES TAB --- */}
        {activeTab === 'JUDGES' && (
            <div className="grid md:grid-cols-3 gap-8 animate-scaleIn">
                {/* Create Judge Form */}
                <div className="md:col-span-1 bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-2xl h-fit">
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Plus className="text-rose-500"/> Yeni Jüri Ekle
                    </h2>
                    <form onSubmit={handleCreateJudge} className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Ad Soyad</label>
                            <input value={newJudgeForm.fullName} onChange={e => setNewJudgeForm({...newJudgeForm, fullName: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-rose-500 outline-none" required />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">E-posta</label>
                            <input type="email" value={newJudgeForm.email} onChange={e => setNewJudgeForm({...newJudgeForm, email: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-rose-500 outline-none" required />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Şifre</label>
                            <input type="password" value={newJudgeForm.password} onChange={e => setNewJudgeForm({...newJudgeForm, password: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-rose-500 outline-none" required minLength={6} />
                        </div>
                        <button type="submit" disabled={isCreatingJudge} className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50">
                            {isCreatingJudge ? 'Oluşturuluyor...' : 'Jüri Üyesi Oluştur'}
                        </button>
                    </form>
                </div>

                {/* Judges List */}
                <div className="md:col-span-2 bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-2xl">
                     <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Shield className="text-teal-500"/> Mevcut Jüriler
                    </h2>
                    <div className="space-y-2">
                        {loadingJudges ? (
                            <p>Yükleniyor...</p>
                        ) : judges.map(judge => (
                            <div key={judge.uid} className="flex justify-between items-center bg-slate-950 p-4 rounded-xl border border-slate-800">
                                <div>
                                    <p className="font-bold text-white">{judge.fullName}</p>
                                    <p className="text-xs text-slate-500">{judge.email}</p>
                                </div>
                                <span className="bg-slate-800 text-slate-400 text-xs px-2 py-1 rounded">Jüri Yetkisi</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {/* --- TEACHERS TAB --- */}
        {activeTab === 'TEACHERS' && (
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl animate-scaleIn">
                 <div className="p-6 border-b border-slate-800 bg-slate-950/50">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Shield className="text-amber-500"/> Bekleyen Öğretmen Onayları
                    </h2>
                 </div>
                 {/* ... Teacher list mapping ... */}
                 {pendingTeachers.length === 0 ? (
                     <div className="p-12 text-center text-slate-500"><Check size={48} className="mx-auto mb-4"/>Bekleyen onay yok.</div>
                 ) : (
                    <table className="w-full text-left">
                        <tbody className="divide-y divide-slate-800">
                            {pendingTeachers.map(teacher => (
                                <tr key={teacher.uid}>
                                    <td className="p-4 text-white">{teacher.fullName}</td>
                                    <td className="p-4 text-right">
                                        <button onClick={() => approveTeacher(teacher.uid)} className="bg-teal-600 px-4 py-2 rounded text-white text-xs font-bold">Onayla</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 )}
            </div>
        )}

        {/* --- STUDIO TAB (Leaderboard) --- */}
        {activeTab === 'STUDIO' && (
            <>
                {/* Applications List */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl animate-scaleIn">
                    {sortedApps.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-950/50 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
                                        <th className="p-5 font-bold">Takım & Kategori</th>
                                        <th className="p-5 font-bold">Danışman</th>
                                        <th className="p-5 font-bold">Durum</th>
                                        <th className="p-5 font-bold text-center">Ortalama Puan</th>
                                        <th className="p-5 font-bold text-right">İşlemler</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {sortedApps.map((app) => (
                                        <tr key={app.id} className="hover:bg-slate-800/50 transition-colors group">
                                            <td className="p-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 font-bold overflow-hidden relative">
                                                        {app.team.logoUrl ? <img src={app.team.logoUrl} className="w-full h-full object-cover"/> : app.team.name.substring(0,2).toUpperCase()}
                                                        {app.team.isFinalist && (
                                                            <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center">
                                                                <Star size={20} className="text-amber-400 fill-amber-400 drop-shadow-lg"/>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-white text-sm">{app.team.name}</p>
                                                        {app.team.isFinalist && <span className="bg-amber-500 text-slate-900 text-[9px] font-black px-1.5 py-0.5 rounded">FİNALİST</span>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <p className="font-bold text-slate-300 text-sm">{app.teacher.fullName}</p>
                                                <p className="text-xs text-slate-500">{app.teacher.school}</p>
                                            </td>
                                            <td className="p-5">
                                                {getStatusBadge(app.status)}
                                            </td>
                                            <td className="p-5 text-center">
                                                {app.finalScore ? (
                                                    <div>
                                                        <span className="text-2xl font-black text-rose-500">{app.finalScore}</span>
                                                        <p className="text-[10px] text-slate-500">{app.judgeEvaluations?.length || 0} Jüri Oyu</p>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-600 text-xs">-</span>
                                                )}
                                            </td>
                                            <td className="p-5 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button 
                                                        onClick={() => toggleFinalist(app)}
                                                        className={`p-2 rounded-lg transition-colors ${app.team.isFinalist ? 'bg-amber-500 text-slate-900 hover:bg-amber-400' : 'bg-slate-800 text-slate-500 hover:text-amber-500 hover:bg-slate-700'}`}
                                                        title={app.team.isFinalist ? "Finalistliği Kaldır" : "Finalist Yap"}
                                                    >
                                                        <Star size={16} className={app.team.isFinalist ? 'fill-current' : ''}/>
                                                    </button>
                                                    <button 
                                                    onClick={() => setDetailApp(app)}
                                                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors"
                                                    title="Detaylar"
                                                    >
                                                        <Eye size={16}/>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-12 text-center text-slate-500">Başvuru bulunamadı.</div>
                    )}
                </div>
            </>
        )}
      </div>

      {/* Read-Only Detail Modal & Voting Breakdown */}
      {detailApp && (
           <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
               <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl relative overflow-hidden animate-scaleIn max-h-[90vh] overflow-y-auto custom-scrollbar">
                   <div className="bg-slate-800 p-6 border-b border-slate-700 flex justify-between items-center sticky top-0 z-10">
                      <h3 className="font-bold text-white text-xl flex items-center gap-2">
                          <FileText className="text-slate-400"/> Başvuru Detayı & Puanlar
                      </h3>
                      <button onClick={() => setDetailApp(null)} className="text-slate-400 hover:text-white transition-colors">
                          <X size={24}/>
                      </button>
                  </div>
                  <div className="p-8 space-y-8">
                       {/* Team Info */}
                       <div className="grid grid-cols-2 gap-4">
                           <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                               <span className="text-xs text-slate-500 block mb-1">Takım Adı</span>
                               <span className="text-white font-bold">{detailApp.team.name}</span>
                           </div>
                           <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                               <span className="text-xs text-slate-500 block mb-1">Video</span>
                               <a href={detailApp.team.videoUrl} target="_blank" className="text-teal-500 hover:underline text-sm font-bold flex items-center gap-1"><Film size={14}/> İzle</a>
                           </div>
                       </div>
                       
                       {/* Judge Breakdown */}
                       <div>
                           <h4 className="text-rose-500 font-bold uppercase text-xs tracking-widest mb-4 border-b border-slate-800 pb-2">Jüri Değerlendirmeleri</h4>
                           {detailApp.judgeEvaluations && detailApp.judgeEvaluations.length > 0 ? (
                               <div className="grid grid-cols-1 gap-4">
                                   {detailApp.judgeEvaluations.map((ev, idx) => (
                                       <div key={idx} className="bg-slate-950 p-5 rounded-xl border border-slate-800 relative group">
                                           <div className="flex justify-between items-center mb-3">
                                               <div className="flex items-center gap-2">
                                                   <span className="text-white font-bold text-sm">{ev.judgeName}</span>
                                                   {ev.privateNote && (
                                                       <span className="bg-amber-500/10 text-amber-500 text-[9px] px-2 py-0.5 rounded flex items-center gap-1 border border-amber-500/20">
                                                           <Lock size={8}/> Özel Not Var
                                                       </span>
                                                   )}
                                               </div>
                                               <span className="bg-rose-900/30 text-rose-400 px-2 py-0.5 rounded text-xs font-black">{ev.totalScore} Puan</span>
                                           </div>
                                           
                                           <div className="grid grid-cols-4 gap-2 text-xs text-slate-500 mb-4">
                                               <div className="text-center bg-slate-900 rounded p-1.5 border border-slate-800">Senaryo<br/><span className="text-white font-bold text-lg">{ev.criteriaScores.script}</span></div>
                                               <div className="text-center bg-slate-900 rounded p-1.5 border border-slate-800">Teknik<br/><span className="text-white font-bold text-lg">{ev.criteriaScores.technical}</span></div>
                                               <div className="text-center bg-slate-900 rounded p-1.5 border border-slate-800">Yaratıcılık<br/><span className="text-white font-bold text-lg">{ev.criteriaScores.creativity}</span></div>
                                               <div className="text-center bg-slate-900 rounded p-1.5 border border-slate-800">Kurgu<br/><span className="text-white font-bold text-lg">{ev.criteriaScores.editing}</span></div>
                                           </div>

                                           {ev.feedback && (
                                               <div className="mb-2">
                                                   <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Geri Bildirim:</span>
                                                   <p className="text-xs text-slate-300 italic bg-slate-900/50 p-3 rounded-lg border border-slate-800">"{ev.feedback}"</p>
                                               </div>
                                           )}
                                           
                                           {ev.privateNote && (
                                               <div className="mt-3 border-t border-slate-800 pt-2">
                                                    <span className="text-[10px] text-amber-500 uppercase font-bold flex items-center gap-1 mb-1"><Lock size={10}/> Admin'e Özel Not:</span>
                                                    <p className="text-xs text-amber-200/80 bg-amber-900/20 p-3 rounded-lg border border-amber-900/30">"{ev.privateNote}"</p>
                                               </div>
                                           )}
                                       </div>
                                   ))}
                               </div>
                           ) : (
                               <p className="text-slate-500 text-sm">Henüz puanlama yapılmamış.</p>
                           )}
                           
                           {detailApp.finalScore && (
                               <div className="mt-6 bg-rose-600/10 border border-rose-500/30 p-6 rounded-2xl text-center shadow-lg">
                                   <p className="text-xs text-rose-400 font-bold uppercase tracking-widest mb-1">Genel Ortalama Puan</p>
                                   <p className="text-5xl font-black text-rose-500">{detailApp.finalScore}</p>
                               </div>
                           )}
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
