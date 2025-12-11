import React, { useState, useEffect } from 'react';
import { 
    Search, Check, X, Eye, Award, FileText, Shield, Inbox, Download, 
    Users, Film, School, Mail, AlertTriangle, Send, Clapperboard, Video, 
    Cpu, Activity, PieChart, BarChart3, Clock, UserCheck, Star, Plus, Lock, 
    Menu, LayoutDashboard, Settings, LogOut, FileDown, Trash2, MapPin, List, RefreshCw, ChevronRight, UserCog, MessageSquare, ExternalLink, Link as LinkIcon, Save, Youtube,
    LayoutTemplate // <-- YENİ: İkon eklendi
} from 'lucide-react';
import { ApplicationStatus, Category, Application, UserRole, LogEntry, SystemSettings, ScoreDocument } from '../types';
import { useAppContext } from '../context/AppContext';
import { ChatArea } from '../components/ChatArea';
import { CMSPanel } from '../components/CMSPanel'; // <-- YENİ: CMS Paneli import edildi
import { getYouTubeEmbedUrl } from '../lib/videoUtils';

// Helper for CSV Export
const exportToCSV = (data: any[], filename: string) => {
    const csvContent = "data:text/csv;charset=utf-8," 
        + data.map(e => Object.values(e).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// Skeleton Loader Component
const AdminSkeleton = () => {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[1,2,3,4].map(i => (
                    <div key={i} className="bg-slate-800/50 rounded-2xl h-32 border border-slate-700/50"></div>
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-800/50 rounded-2xl h-80 border border-slate-700/50"></div>
                <div className="bg-slate-800/50 rounded-2xl h-80 border border-slate-700/50"></div>
            </div>
        </div>
    );
};

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    onLogout: () => void;
    isOpen: boolean;
    onClose: () => void;
}

const AdminSidebar = ({ activeTab, setActiveTab, onLogout, isOpen, onClose }: SidebarProps) => {
    const navItems = [
        { id: 'DASHBOARD', icon: LayoutDashboard, label: 'Panel Özeti' },
        { id: 'TEAMS', icon: Clapperboard, label: 'Takım Yönetimi' },
        { id: 'USERS', icon: Users, label: 'Kullanıcılar & Jüri' },
        { id: 'CMS', icon: LayoutTemplate, label: 'İçerik Yönetimi' }, // <-- YENİ: CMS Sekmesi
        { id: 'SETTINGS', icon: Settings, label: 'Sistem Ayarları' },
        { id: 'LOGS', icon: List, label: 'Denetim Kayıtları' },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
                    onClick={onClose}
                ></div>
            )}

            {/* Sidebar Container */}
            <div className={`
                fixed top-0 left-0 h-full w-64 bg-slate-900 border-r border-slate-800 
                flex flex-col z-50 transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
                md:translate-x-0
            `}>
                <div className="p-6 flex items-center justify-between border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="bg-rose-600 p-2 rounded-lg">
                            <Shield size={20} className="text-white"/>
                        </div>
                        <div>
                            <h1 className="font-bold text-white tracking-tight leading-tight">Yönetici</h1>
                            <p className="text-[10px] text-slate-500 font-medium">Reflect&Shoot Admin</p>
                        </div>
                    </div>
                    {/* Mobile Close Button */}
                    <button onClick={onClose} className="md:hidden text-slate-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>
                
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setActiveTab(item.id);
                                onClose(); // Close on mobile when clicked
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                                activeTab === item.id 
                                ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/20' 
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                        >
                            <item.icon size={18} />
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-all">
                        <LogOut size={18} />
                        Çıkış Yap
                    </button>
                </div>
            </div>
        </>
    );
};

const AdminDashboard = ({ apps }: { apps: Application[] }) => {
    const totalApps = apps.length;
    const finalists = apps.filter(a => a.team.isFinalist).length;
    const scoredApps = apps.filter(a => a.finalScore && a.finalScore > 0);
    const avgScore = scoredApps.length > 0 
        ? scoredApps.reduce((acc, curr) => acc + (curr.finalScore || 0), 0) / scoredApps.length 
        : 0;
    
    // City Stats
    const cities: Record<string, number> = {};
    apps.forEach(app => {
        const city = app.teacher.city || 'Belirtilmedi';
        cities[city] = (cities[city] || 0) + 1;
    });
    const sortedCities = Object.entries(cities).sort((a,b) => b[1] - a[1]).slice(0, 5);

    // Leaderboard (Top 5)
    const leaderboard = [...scoredApps].sort((a,b) => (b.finalScore || 0) - (a.finalScore || 0)).slice(0, 5);

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500"><Inbox size={24}/></div>
                        <span className="text-xs font-bold text-slate-500 bg-slate-900 px-2 py-1 rounded">Toplam</span>
                    </div>
                    <h3 className="text-3xl font-black text-white">{totalApps}</h3>
                    <p className="text-slate-400 text-sm">Başvuru</p>
                </div>
                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500"><Star size={24}/></div>
                        <span className="text-xs font-bold text-slate-500 bg-slate-900 px-2 py-1 rounded">Final</span>
                    </div>
                    <h3 className="text-3xl font-black text-white">{finalists}</h3>
                    <p className="text-slate-400 text-sm">Finalist Takım</p>
                </div>
                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500"><Activity size={24}/></div>
                        <span className="text-xs font-bold text-slate-500 bg-slate-900 px-2 py-1 rounded">Skor</span>
                    </div>
                    <h3 className="text-3xl font-black text-white">{avgScore.toFixed(1)}</h3>
                    <p className="text-slate-400 text-sm">Ortalama Puan</p>
                </div>
                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-rose-500/10 rounded-xl text-rose-500"><Video size={24}/></div>
                        <span className="text-xs font-bold text-slate-500 bg-slate-900 px-2 py-1 rounded">Teslim</span>
                    </div>
                    <h3 className="text-3xl font-black text-white">{apps.filter(a => a.team.videoStatus === 'UPLOADED' || a.team.videoStatus === 'SUBMITTED_LINK').length}</h3>
                    <p className="text-slate-400 text-sm">Video Teslim</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {/* Leaderboard */}
                 <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                     <h3 className="font-bold text-white mb-6 flex items-center gap-2"><Award size={18} className="text-amber-500"/> Liderlik Tablosu (Top 5)</h3>
                     <div className="space-y-3">
                         {leaderboard.length > 0 ? leaderboard.map((app, idx) => (
                             <div key={app.id} className="flex justify-between items-center p-4 bg-slate-900 rounded-xl border border-slate-800">
                                 <div className="flex items-center gap-4">
                                     <span className="font-black text-slate-600 text-lg w-6">#{idx + 1}</span>
                                     <div>
                                         <p className="font-bold text-white text-sm">{app.team.name}</p>
                                         <p className="text-xs text-slate-500">{app.team.category} • {app.teacher.school}</p>
                                     </div>
                                 </div>
                                 <div className="text-right">
                                     <span className="block font-black text-amber-500 text-lg">{app.finalScore}</span>
                                     <span className="text-[10px] text-slate-500 uppercase font-bold">{app.juryCount || 0} Jüri</span>
                                 </div>
                             </div>
                         )) : (
                             <div className="text-center py-8 text-slate-500 text-sm">Henüz puanlama yapılmadı.</div>
                         )}
                     </div>
                 </div>

                 {/* Top Cities */}
                 <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                     <h3 className="font-bold text-white mb-6 flex items-center gap-2"><MapPin size={18} className="text-slate-400"/> Şehir Bazlı Başvurular</h3>
                     <div className="space-y-3">
                         {sortedCities.map(([city, count], idx) => (
                             <div key={idx} className="flex justify-between items-center p-3 bg-slate-900 rounded-xl border border-slate-800">
                                 <span className="text-slate-300 font-bold text-sm">{city}</span>
                                 <span className="bg-slate-800 text-white text-xs font-bold px-2 py-1 rounded border border-slate-700">{count} Takım</span>
                             </div>
                         ))}
                     </div>
                 </div>
            </div>
        </div>
    );
};

// ... (AdminUsers component remains unchanged) ...
const AdminUsers = () => {
    const { allUsers, updateUserRole, showToast } = useAppContext();
    const [filter, setFilter] = useState('');

    const filteredUsers = allUsers.filter(u => 
        u.fullName.toLowerCase().includes(filter.toLowerCase()) || 
        u.email.toLowerCase().includes(filter.toLowerCase())
    );
    
    const handleRoleUpdate = async (uid: string, role: UserRole) => {
        try {
            await updateUserRole(uid, role);
            showToast(`Kullanıcı rolü ${role} olarak güncellendi`, 'success');
        } catch (e) {
            showToast('Rol güncellenirken hata oluştu', 'error');
        }
    };

    return (
        <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-xl overflow-hidden animate-fadeIn">
            <div className="p-6 border-b border-slate-700 flex flex-col md:flex-row justify-between gap-4">
                <h3 className="font-bold text-white flex items-center gap-2"><UserCog size={20}/> Kullanıcı ve Rol Yönetimi</h3>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input 
                        type="text" 
                        placeholder="İsim veya E-posta ara..." 
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:border-rose-500 outline-none w-full md:w-64"
                    />
                </div>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[700px]">
                    <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase font-bold">
                        <tr>
                            <th className="p-4">Kullanıcı</th>
                            <th className="p-4">Okul / Şehir</th>
                            <th className="p-4">Mevcut Rol</th>
                            <th className="p-4 text-right">Rol İşlemleri</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {filteredUsers.map(user => (
                            <tr key={user.uid} className="hover:bg-slate-700/20">
                                <td className="p-4">
                                    <div className="font-bold text-white text-sm">{user.fullName}</div>
                                    <div className="text-xs text-slate-500">{user.email}</div>
                                </td>
                                <td className="p-4">
                                    <div className="text-sm text-slate-300">{user.school || '-'}</div>
                                    <div className="text-xs text-slate-500">{user.city || '-'}</div>
                                </td>
                                <td className="p-4">
                                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded border ${
                                        user.role === UserRole.ADMIN ? 'bg-rose-900/30 text-rose-400 border-rose-800' :
                                        user.role === UserRole.JUDGE ? 'bg-amber-900/30 text-amber-400 border-amber-800' :
                                        'bg-slate-800 text-slate-400 border-slate-700'
                                    }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        {user.role !== UserRole.TEACHER && (
                                            <button onClick={() => handleRoleUpdate(user.uid, UserRole.TEACHER)} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded border border-slate-700">
                                                Öğretmen Yap
                                            </button>
                                        )}
                                        {user.role !== UserRole.JUDGE && (
                                            <button onClick={() => handleRoleUpdate(user.uid, UserRole.JUDGE)} className="px-3 py-1 bg-amber-900/20 hover:bg-amber-800/30 text-amber-500 hover:text-amber-400 text-xs rounded border border-amber-900/50">
                                                Jüri Yap
                                            </button>
                                        )}
                                        {user.role !== UserRole.ADMIN && (
                                            <button onClick={() => handleRoleUpdate(user.uid, UserRole.ADMIN)} className="px-3 py-1 bg-rose-900/20 hover:bg-rose-800/30 text-rose-500 hover:text-rose-400 text-xs rounded border border-rose-900/50">
                                                Admin Yap
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// --- TEAM MANAGEMENT ---

const AdminTeams = ({ apps, onSelectApp }: { apps: Application[], onSelectApp: (app: Application) => void }) => {
    const [filter, setFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('ALL');

    const filtered = apps.filter(app => {
        const matchSearch = app.team.name.toLowerCase().includes(filter.toLowerCase()) || 
                            app.teacher.school.toLowerCase().includes(filter.toLowerCase());
        const matchCat = categoryFilter === 'ALL' || app.team.category === categoryFilter;
        return matchSearch && matchCat;
    });

    const handleExport = () => {
        const data = filtered.map(app => ({
            TeamID: app.team.id,
            Name: app.team.name,
            Category: app.team.category,
            School: app.teacher.school,
            Teacher: app.teacher.fullName,
            TeacherEmail: app.teacher.email,
            Status: app.status,
            Score: app.finalScore || 0,
            Finalist: app.team.isFinalist ? 'YES' : 'NO'
        }));
        exportToCSV(data, 'ReflectShoot_Teams_Export.csv');
    };

    const getStatusColor = (status: ApplicationStatus) => {
        switch(status) {
            case ApplicationStatus.APPROVED: return "bg-green-500/10 text-green-400 border-green-500/20";
            case ApplicationStatus.REJECTED: return "bg-red-500/10 text-red-400 border-red-500/20";
            case ApplicationStatus.DISQUALIFIED: return "bg-red-900/20 text-red-600 border-red-900/40 line-through";
            case ApplicationStatus.FINAL_SUBMITTED: return "bg-blue-500/10 text-blue-400 border-blue-500/20";
            case ApplicationStatus.GRADED: return "bg-purple-500/10 text-purple-400 border-purple-500/20";
            default: return "bg-slate-800 text-slate-400 border-slate-700";
        }
    };

    return (
        <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-xl overflow-hidden animate-fadeIn">
            <div className="p-4 md:p-6 border-b border-slate-700 flex flex-col lg:flex-row justify-between gap-4">
                <div className="flex flex-col md:flex-row gap-4 flex-1">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input 
                            type="text" 
                            placeholder="Takım veya okul ara..." 
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white focus:border-rose-500 outline-none text-sm"
                        />
                    </div>
                    <select 
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:border-rose-500 outline-none text-sm w-full md:w-auto"
                    >
                        <option value="ALL">Tüm Kategoriler</option>
                        <option value={Category.LIVE_ACTION}>Canlı Çekim</option>
                        <option value={Category.AI_ANIMATION}>AI Animasyon</option>
                    </select>
                </div>
                <button onClick={handleExport} className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-colors w-full lg:w-auto">
                    <FileDown size={18} /> Excel İndir
                </button>
            </div>
            
            <div className="overflow-x-auto w-full">
                <table className="w-full text-left min-w-[800px]">
                    <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase font-bold">
                        <tr>
                            <th className="p-4">Takım</th>
                            <th className="p-4">Kategori</th>
                            <th className="p-4">Danışman & Okul</th>
                            <th className="p-4">Durum</th>
                            <th className="p-4 text-center">Puan</th>
                            <th className="p-4 text-right">İşlem</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {filtered.map(app => (
                            <tr key={app.id} className="hover:bg-slate-700/30 transition-colors">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center text-xs font-bold text-slate-500 overflow-hidden flex-shrink-0">
                                            {app.team.logoUrl ? <img src={app.team.logoUrl} className="w-full h-full object-cover"/> : app.team.name.substring(0,2)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-white text-sm flex items-center gap-2">
                                                {app.team.name}
                                                {app.team.isFinalist && <Star size={12} className="text-amber-500 fill-amber-500"/>}
                                            </div>
                                            <div className="text-xs text-slate-500">ID: {app.team.id.slice(-6)}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className="text-xs font-bold text-slate-300 bg-slate-900 px-2 py-1 rounded border border-slate-700 whitespace-nowrap">
                                        {app.team.category === Category.LIVE_ACTION ? <Video size={12} className="inline mr-1"/> : <Cpu size={12} className="inline mr-1"/>}
                                        {app.team.category}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <div className="text-sm text-slate-300 font-bold">{app.teacher.fullName}</div>
                                    <div className="text-xs text-slate-500 truncate max-w-[150px]">{app.teacher.school}</div>
                                </td>
                                <td className="p-4">
                                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded border whitespace-nowrap ${getStatusColor(app.status)}`}>
                                        {app.status}
                                    </span>
                                </td>
                                <td className="p-4 text-center">
                                    <span className="font-black text-white">{app.finalScore || '-'}</span>
                                    {app.juryCount ? <span className="text-[9px] text-slate-500 block">({app.juryCount} jüri)</span> : null}
                                </td>
                                <td className="p-4 text-right">
                                    <button onClick={() => onSelectApp(app)} className="bg-slate-900 hover:bg-rose-600 text-slate-400 hover:text-white p-2 rounded-lg transition-colors">
                                        <Eye size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// --- MAIN PAGE ---

export const Admin: React.FC = () => {
  const { allApplications, updateApplication, logAction, systemSettings, updateSystemSettings, auditLogs, logout, fetchJuryScores, loading, showToast } = useAppContext();
  const [activeTab, setActiveTab] = useState('DASHBOARD');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [appScores, setAppScores] = useState<ScoreDocument[]>([]);
  
  // YouTube Link State
  const [youtubeLinkInput, setYoutubeLinkInput] = useState('');

  // When selected app changes, fetch scores
  useEffect(() => {
      if (selectedApp) {
          fetchJuryScores(selectedApp.id).then(setAppScores);
          setYoutubeLinkInput(selectedApp.team.videoUrl || '');
      } else {
          setAppScores([]);
          setYoutubeLinkInput('');
      }
  }, [selectedApp]);

  // App Actions
  const handleStatusChange = async (app: Application, newStatus: ApplicationStatus) => {
      const updated = { ...app, status: newStatus };
      await updateApplication(updated);
      await logAction("UPDATE_STATUS", `Takım ${app.team.name} durumu ${newStatus} olarak güncellendi.`, app.id);
      setSelectedApp(updated); 
  };

  const toggleFinalist = async (app: Application) => {
      const newState = !app.team.isFinalist;
      const updated = { ...app, team: { ...app.team, isFinalist: newState } };
      await updateApplication(updated);
      await logAction("TOGGLE_FINALIST", `${app.team.name} finalist durumu: ${newState ? 'EVET' : 'HAYIR'}`, app.id);
      setSelectedApp(updated);
  };

  const saveYoutubeLink = async () => {
      if (!selectedApp) return;
      
      const embedUrl = getYouTubeEmbedUrl(youtubeLinkInput);
      
      if (!embedUrl) {
          showToast('Geçersiz YouTube linki.', 'error');
          return;
      }

      const updated = { 
          ...selectedApp, 
          team: { 
              ...selectedApp.team, 
              videoUrl: youtubeLinkInput, // Store original link for edit input
              videoStatus: 'UPLOADED' as const 
          },
          status: ApplicationStatus.APPROVED // Video is published
      };
      
      await updateApplication(updated);
      await logAction("VIDEO_PUBLISH", `${selectedApp.team.name} videosu YouTube linki olarak eklendi.`, selectedApp.id);
      setSelectedApp(updated);
      showToast('Video linki kaydedildi ve yayınlandı.', 'success');
  };

  const handleSettingsUpdate = async (e: React.FormEvent) => {
      e.preventDefault();
      await updateSystemSettings(systemSettings); 
  };

  return (
    <div className="min-h-screen bg-slate-950 flex font-sans text-slate-200 selection:bg-rose-500 selection:text-white">
      <AdminSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={logout} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto w-full transition-all duration-300">
          <header className="flex justify-between items-center mb-6 md:mb-8">
              <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setIsSidebarOpen(true)}
                    className="md:hidden p-2 text-slate-400 hover:text-white bg-slate-800 rounded-lg"
                  >
                      <Menu size={24} />
                  </button>
                  <h2 className="text-xl md:text-2xl font-black text-white tracking-tight truncate">
                      {activeTab === 'DASHBOARD' && 'Genel Bakış'}
                      {activeTab === 'TEAMS' && 'Takım Yönetimi'}
                      {activeTab === 'USERS' && 'Kullanıcılar & Jüri'}
                      {activeTab === 'CMS' && 'İçerik Yönetimi'} {/* <-- YENİ: Başlık eklendi */}
                      {activeTab === 'SETTINGS' && 'Sistem Ayarları'}
                      {activeTab === 'LOGS' && 'Denetim Kayıtları'}
                  </h2>
              </div>
          </header>

          <div className="w-full">
            {loading ? (
                <AdminSkeleton />
            ) : (
                <>
                    {activeTab === 'DASHBOARD' && <AdminDashboard apps={allApplications} />}
                    {activeTab === 'TEAMS' && <AdminTeams apps={allApplications} onSelectApp={setSelectedApp} />}
                    {activeTab === 'USERS' && <AdminUsers />}
                    {activeTab === 'CMS' && <CMSPanel />} {/* <-- YENİ: Panel burada gösteriliyor */}
                    
                    {activeTab === 'SETTINGS' && (
                        <div className="bg-slate-800 p-6 md:p-8 rounded-2xl border border-slate-700 max-w-2xl animate-fadeIn">
                             {/* ... Settings Form ... */}
                             <h3 className="font-bold text-white mb-6 border-b border-slate-700 pb-4">Yarışma Takvimi</h3>
                             <form onSubmit={handleSettingsUpdate} className="space-y-6">
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                     <div>
                                         <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Başvuru Başlangıç</label>
                                         <input type="datetime-local" defaultValue={systemSettings.dates.applicationStart} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-sm" />
                                     </div>
                                     <div>
                                         <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Başvuru Bitiş</label>
                                         <input type="datetime-local" defaultValue={systemSettings.dates.applicationEnd} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-sm" />
                                     </div>
                                 </div>
                                 
                                 <div className="pt-4 border-t border-slate-800">
                                     <h4 className="text-white font-bold mb-4">Özellikler</h4>
                                     <div className="flex items-center gap-2 mb-4">
                                         <input 
                                             type="checkbox" 
                                             checked={systemSettings.features.publicVotingActive}
                                             onChange={(e) => updateSystemSettings({...systemSettings, features: {...systemSettings.features, publicVotingActive: e.target.checked}})}
                                             className="w-5 h-5 rounded border-slate-700 bg-slate-900 accent-rose-600"
                                         />
                                         <label className="text-slate-300 text-sm">Halk Oylaması Aktif</label>
                                     </div>
                                 </div>

                                 <div className="pt-4">
                                     <button type="submit" className="w-full md:w-auto bg-rose-600 hover:bg-rose-500 text-white px-6 py-3 rounded-xl font-bold transition-all">
                                         Ayarları Kaydet
                                     </button>
                                 </div>
                             </form>
                        </div>
                    )}

                    {activeTab === 'LOGS' && (
                        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden animate-fadeIn">
                            {/* ... Logs Table ... */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left min-w-[600px]">
                                    <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase">
                                        <tr>
                                            <th className="p-4">Zaman</th>
                                            <th className="p-4">İşlem</th>
                                            <th className="p-4">Detay</th>
                                            <th className="p-4">Yapan</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700">
                                        {auditLogs.map(log => (
                                            <tr key={log.id} className="hover:bg-slate-700/20">
                                                <td className="p-4 text-xs text-slate-500 font-mono whitespace-nowrap">{new Date(log.timestamp).toLocaleString('tr-TR')}</td>
                                                <td className="p-4"><span className="bg-slate-900 text-white text-xs px-2 py-1 rounded border border-slate-700 font-bold whitespace-nowrap">{log.action}</span></td>
                                                <td className="p-4 text-sm text-slate-300 min-w-[200px]">{log.details}</td>
                                                <td className="p-4 text-xs text-slate-400 whitespace-nowrap">{log.performedBy}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}
          </div>
      </main>

      {/* Team Detail Modal */}
      {selectedApp && (
          <div className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-sm flex justify-end animate-fadeIn">
              <div className="w-full max-w-2xl bg-slate-900 h-full border-l border-slate-700 p-6 md:p-8 overflow-y-auto shadow-2xl relative">
                  <button onClick={() => setSelectedApp(null)} className="absolute top-4 right-4 bg-slate-800 p-2 rounded-full text-slate-400 hover:text-white hover:bg-rose-600 transition-all z-10">
                      <X size={20} />
                  </button>

                  <div className="mb-8 pb-8 border-b border-slate-800 mt-8 md:mt-0">
                      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-4">
                          {selectedApp.team.logoUrl && <img src={selectedApp.team.logoUrl} className="w-20 h-20 rounded-xl object-cover bg-slate-800 border border-slate-700" />}
                          <div>
                              <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">{selectedApp.team.name}</h2>
                              <p className="text-slate-400 text-sm mt-1">{selectedApp.teacher.school}</p>
                          </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                          <span className="bg-slate-800 text-slate-300 text-xs px-3 py-1 rounded-full font-bold">{selectedApp.team.category}</span>
                          <span className="bg-slate-800 text-slate-300 text-xs px-3 py-1 rounded-full font-bold">{selectedApp.teacher.city}</span>
                          <span className={`text-xs px-3 py-1 rounded-full font-bold text-white ${selectedApp.team.isFinalist ? 'bg-amber-500' : 'bg-slate-700'}`}>
                              {selectedApp.team.isFinalist ? 'FİNALİST' : 'Aday'}
                          </span>
                      </div>
                  </div>

                  {/* Messaging Section */}
                  <div className="mb-8">
                        <ChatArea appId={selectedApp.id} />
                  </div>
                  
                  {/* VIDEO MANAGEMENT SECTION */}
                  <div className="mb-8 bg-slate-950 p-6 rounded-xl border border-slate-800">
                      <h3 className="text-sm font-bold text-white uppercase mb-4 flex items-center gap-2"><Video size={16} className="text-rose-500"/> Video İşlemleri</h3>
                      
                      {/* Teacher Submission Link Display */}
                      {selectedApp.team.submissionDownloadUrl && (
                          <div className="mb-6 p-4 bg-blue-900/20 border border-blue-900/50 rounded-xl">
                              <label className="text-xs font-bold text-blue-400 uppercase mb-2 flex items-center gap-2">
                                  <LinkIcon size={12}/> Öğretmen Teslim Linki
                              </label>
                              <div className="flex gap-2">
                                  <input 
                                    readOnly 
                                    value={selectedApp.team.submissionDownloadUrl}
                                    className="flex-1 bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs text-slate-300 font-mono"
                                  />
                                  <a 
                                    href={selectedApp.team.submissionDownloadUrl} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded text-xs font-bold flex items-center gap-2"
                                  >
                                      <ExternalLink size={14}/> Aç
                                  </a>
                              </div>
                              <p className="text-[10px] text-slate-500 mt-2">
                                  * Bu linkten videoyu indirin, YouTube kanalına "Liste Dışı" yükleyin ve aşağıdaki alana ekleyin.
                              </p>
                          </div>
                      )}

                      {/* YouTube Link Input */}
                      <div>
                           <label className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
                               <Youtube size={14} className="text-red-500"/> YouTube Linki Tanımla
                           </label>
                           <div className="flex gap-2">
                               <input 
                                  value={youtubeLinkInput}
                                  onChange={(e) => setYoutubeLinkInput(e.target.value)}
                                  placeholder="https://youtu.be/..."
                                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-rose-500 outline-none"
                               />
                               <button 
                                 onClick={saveYoutubeLink}
                                 className="bg-slate-800 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-bold transition-colors flex items-center gap-2"
                               >
                                   <Save size={16} /> Kaydet
                               </button>
                           </div>
                           {selectedApp.team.videoUrl && (
                               <div className="mt-4 rounded-lg overflow-hidden border border-slate-800">
                                   <iframe 
                                     src={getYouTubeEmbedUrl(selectedApp.team.videoUrl) || ""} 
                                     className="w-full aspect-video" 
                                     allowFullScreen
                                   ></iframe>
                               </div>
                           )}
                      </div>
                  </div>


                  {/* Scoring Section */}
                  <div className="mb-8">
                      <h3 className="text-sm font-bold text-slate-500 uppercase mb-4 flex items-center gap-2"><Star size={16}/> Jüri Puanları</h3>
                      {appScores.length > 0 ? (
                          <div className="space-y-3">
                              {appScores.map((score, i) => (
                                  <div key={i} className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                                      <div className="flex justify-between items-center mb-2">
                                          <span className="font-bold text-white text-sm">{score.juryName}</span>
                                          <span className="text-lg font-black text-amber-500">{score.total}</span>
                                      </div>
                                      <div className="grid grid-cols-4 gap-2 text-[10px] text-slate-500 mb-2">
                                          <div>Hikaye: {score.criteria.story}</div>
                                          <div>Teknik: {score.criteria.technical}</div>
                                          <div>Özgünlük: {score.criteria.originality}</div>
                                          <div>Tema: {score.criteria.themeFit}</div>
                                      </div>
                                      {score.notes && (
                                          <p className="text-xs text-slate-400 italic border-t border-slate-800 pt-2 mt-2">"{score.notes}"</p>
                                      )}
                                  </div>
                              ))}
                              <div className="flex justify-between items-center bg-slate-800 p-4 rounded-xl">
                                  <span className="font-bold text-white">Ortalama Puan</span>
                                  <span
