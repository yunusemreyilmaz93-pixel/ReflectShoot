import React, { useState, useEffect } from 'react';
import { 
    Search, Check, X, Eye, Award, FileText, Shield, Inbox, Download, 
    Users, Film, School, Mail, AlertTriangle, Send, Clapperboard, Video, 
    Cpu, Activity, PieChart, BarChart3, Clock, UserCheck, Star, Plus, Lock, 
    Menu, LayoutDashboard, Settings, LogOut, FileDown, Trash2, MapPin, List, RefreshCw, ChevronRight, UserCog, MessageSquare, ExternalLink, Link as LinkIcon, Save, Youtube, PenTool, LayoutTemplate, HelpCircle, Bell, Image as ImageIcon, Megaphone, BookOpen, Calendar, Trophy, CheckCircle2, AlertOctagon, Info, ToggleRight, ToggleLeft, Power, Globe, Upload, LayoutGrid, Filter
} from 'lucide-react';
import { ApplicationStatus, Category, Application, UserRole, LogEntry, SystemSettings, ScoreDocument, CMSGeneral, CMSFaqItem, FAQCategory, NotificationTarget, CMSGalleryItem, CMSAcademyItem, CMSTimelineItem, CMSPrize, CMSLinks } from '../types';
import { useAppContext } from '../context/AppContext';
import { ChatArea } from '../components/ChatArea';
import { getYouTubeEmbedUrl } from '../lib/videoUtils';
import { AdminCMS } from '../components/admin/AdminCMS';

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

// Independent Toggle Switch Component (Moved outside to prevent re-render issues)
const ToggleSwitch = ({ checked, onChange, label, activeColor = 'bg-green-500' }: { checked: boolean, onChange: () => void, label: string, activeColor?: string }) => (
    <div 
        onClick={onChange}
        className="flex items-center justify-between bg-slate-900 p-4 rounded-xl border border-slate-700 cursor-pointer hover:border-slate-500 transition-colors group"
    >
        <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">{label}</span>
        <div className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${checked ? activeColor : 'bg-slate-700'}`}>
            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${checked ? 'translate-x-6' : 'translate-x-0'}`}></div>
        </div>
    </div>
);

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
        { id: 'ANNOUNCEMENTS', icon: Megaphone, label: 'Duyurular' },
        { id: 'TEAMS', icon: Clapperboard, label: 'Takım Yönetimi' },
        { id: 'JURY_ASSIGN', icon: UserCheck, label: 'Jüri Atama' },
        { id: 'USERS', icon: Users, label: 'Kullanıcılar & Jüri' },
        { id: 'CONTENT', icon: LayoutTemplate, label: 'İçerik Yönetimi (CMS)' },
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
    const cities: Record<string, number> = {};
    apps.forEach(app => {
        const city = app.teacher.city || 'Belirtilmedi';
        cities[city] = (cities[city] || 0) + 1;
    });
    const sortedCities = Object.entries(cities).sort((a,b) => b[1] - a[1]).slice(0, 5);
    const leaderboard = [...scoredApps].sort((a,b) => (b.finalScore || 0) - (a.finalScore || 0)).slice(0, 5);

    return (
        <div className="space-y-6 animate-fadeIn">
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

const AdminUsers = () => {
    const { allUsers, updateUserRole, showToast } = useAppContext();
    const [filter, setFilter] = useState('');
    const filteredUsers = allUsers.filter(u => u.fullName.toLowerCase().includes(filter.toLowerCase()) || u.email.toLowerCase().includes(filter.toLowerCase()));
    const handleRoleUpdate = async (uid: string, role: UserRole) => { try { await updateUserRole(uid, role); showToast(`Kullanıcı rolü ${role} olarak güncellendi`, 'success'); } catch (e) { showToast('Rol güncellenirken hata oluştu', 'error'); } };
    return (
        <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-xl overflow-hidden animate-fadeIn">
            <div className="p-6 border-b border-slate-700 flex flex-col md:flex-row justify-between gap-4">
                <h3 className="font-bold text-white flex items-center gap-2"><UserCog size={20}/> Kullanıcı ve Rol Yönetimi</h3>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input type="text" placeholder="İsim veya E-posta ara..." value={filter} onChange={(e) => setFilter(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:border-rose-500 outline-none w-full md:w-64"/>
                </div>
            </div>
            <div className="overflow-x-auto"><table className="w-full text-left min-w-[700px]"><thead className="bg-slate-900/50 text-slate-400 text-xs uppercase font-bold"><tr><th className="p-4">Kullanıcı</th><th className="p-4">Okul / Şehir</th><th className="p-4">Mevcut Rol</th><th className="p-4 text-right">Rol İşlemleri</th></tr></thead><tbody className="divide-y divide-slate-700">{filteredUsers.map(user => (<tr key={user.uid} className="hover:bg-slate-700/20"><td className="p-4"><div className="font-bold text-white text-sm">{user.fullName}</div><div className="text-xs text-slate-500">{user.email}</div></td><td className="p-4"><div className="text-sm text-slate-300">{user.school || '-'}</div><div className="text-xs text-slate-500">{user.city || '-'}</div></td><td className="p-4"><span className={`text-[10px] font-black uppercase px-2 py-1 rounded border ${user.role === UserRole.ADMIN ? 'bg-rose-900/30 text-rose-400 border-rose-800' : user.role === UserRole.JUDGE ? 'bg-amber-900/30 text-amber-400 border-amber-800' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>{user.role}</span></td><td className="p-4 text-right"><div className="flex justify-end gap-2">{user.role !== UserRole.TEACHER && (<button onClick={() => handleRoleUpdate(user.uid, UserRole.TEACHER)} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded border border-slate-700">Öğretmen Yap</button>)}{user.role !== UserRole.JUDGE && (<button onClick={() => handleRoleUpdate(user.uid, UserRole.JUDGE)} className="px-3 py-1 bg-amber-900/20 hover:bg-amber-800/30 text-amber-500 hover:text-amber-400 text-xs rounded border border-amber-900/50">Jüri Yap</button>)}{user.role !== UserRole.ADMIN && (<button onClick={() => handleRoleUpdate(user.uid, UserRole.ADMIN)} className="px-3 py-1 bg-rose-900/20 hover:bg-rose-800/30 text-rose-500 hover:text-rose-400 text-xs rounded border border-rose-900/50">Admin Yap</button>)}</div></td></tr>))}</tbody></table></div>
        </div>
    );
};

const AdminTeams = ({ apps, onSelectApp, onToggleFinalist }: { apps: Application[], onSelectApp: (app: Application) => void, onToggleFinalist: (app: Application) => void }) => {
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [filter, setFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');

    const filtered = apps.filter(app => {
        const matchSearch = app.team.name.toLowerCase().includes(filter.toLowerCase()) || app.teacher.school.toLowerCase().includes(filter.toLowerCase());
        const matchCat = categoryFilter === 'ALL' || app.team.category === categoryFilter;
        const matchStatus = statusFilter === 'ALL' 
            ? true 
            : statusFilter === 'FINALIST' 
                ? app.team.isFinalist 
                : app.status === statusFilter;
        return matchSearch && matchCat && matchStatus;
    });

    const handleExport = () => {
        const data = filtered.map(app => ({ TeamID: app.team.id, Name: app.team.name, Category: app.team.category, School: app.teacher.school, Teacher: app.teacher.fullName, TeacherEmail: app.teacher.email, Status: app.status, Score: app.finalScore || 0, Finalist: app.team.isFinalist ? 'YES' : 'NO' }));
        exportToCSV(data, 'ReflectShoot_Teams_Export.csv');
    };

    const getStatusColor = (status: ApplicationStatus) => {
        switch(status) { case ApplicationStatus.APPROVED: return "bg-green-500/10 text-green-400 border-green-500/20"; case ApplicationStatus.REJECTED: return "bg-red-500/10 text-red-400 border-red-500/20"; case ApplicationStatus.DISQUALIFIED: return "bg-red-900/20 text-red-600 border-red-900/40 line-through"; case ApplicationStatus.FINAL_SUBMITTED: return "bg-blue-500/10 text-blue-400 border-blue-500/20"; case ApplicationStatus.GRADED: return "bg-purple-500/10 text-purple-400 border-purple-500/20"; default: return "bg-slate-800 text-slate-400 border-slate-700"; }
    };

    return (
        <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-xl overflow-hidden animate-fadeIn flex flex-col h-full">
            {/* Toolbar */}
            <div className="p-4 md:p-6 border-b border-slate-700 flex flex-col xl:flex-row justify-between gap-4 sticky top-0 bg-slate-800 z-10">
                <div className="flex flex-col md:flex-row gap-4 flex-1">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input type="text" placeholder="Takım veya okul ara..." value={filter} onChange={(e) => setFilter(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white focus:border-rose-500 outline-none text-sm"/>
                    </div>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:border-rose-500 outline-none text-sm">
                        <option value="ALL">Tüm Durumlar</option>
                        <option value="FINALIST">★ Sadece Finalistler</option>
                        <option value={ApplicationStatus.FINAL_SUBMITTED}>Video İnceleniyor</option>
                        <option value={ApplicationStatus.GRADED}>Puanlandı</option>
                        <option value={ApplicationStatus.APPROVED}>Onaylandı</option>
                        <option value={ApplicationStatus.REJECTED}>Reddedildi</option>
                    </select>
                    <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:border-rose-500 outline-none text-sm"><option value="ALL">Tüm Kategoriler</option><option value={Category.LIVE_ACTION}>Canlı Çekim</option><option value={Category.AI_ANIMATION}>AI Animasyon</option></select>
                </div>
                
                <div className="flex gap-2">
                    <div className="flex bg-slate-900 rounded-xl p-1 border border-slate-700">
                        <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}><List size={18}/></button>
                        <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}><LayoutGrid size={18}/></button>
                    </div>
                    <button onClick={handleExport} className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-colors"><FileDown size={18} /> Excel</button>
                </div>
            </div>

            {/* Quick Stats Bar */}
            <div className="bg-slate-900/50 px-6 py-2 border-b border-slate-700 flex gap-6 text-xs font-bold text-slate-400">
                <span>Gösterilen: <span className="text-white">{filtered.length}</span></span>
                <span>Finalist: <span className="text-amber-500">{filtered.filter(a => a.team.isFinalist).length}</span></span>
                <span>Video Yükleyen: <span className="text-blue-400">{filtered.filter(a => a.team.videoStatus === 'UPLOADED' || a.team.videoStatus === 'SUBMITTED_LINK').length}</span></span>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-auto bg-slate-900/30 p-4">
                {viewMode === 'list' ? (
                    <div className="overflow-x-auto w-full bg-slate-800 rounded-xl border border-slate-700">
                        <table className="w-full text-left min-w-[800px]">
                            <thead className="bg-slate-900 text-slate-400 text-xs uppercase font-bold"><tr><th className="p-4">Takım</th><th className="p-4">Kategori</th><th className="p-4">Video</th><th className="p-4">Durum</th><th className="p-4 text-center">Puan</th><th className="p-4 text-right">İşlem</th></tr></thead>
                            <tbody className="divide-y divide-slate-700">
                                {filtered.map(app => (
                                    <tr key={app.id} className="hover:bg-slate-700/30 transition-colors group">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <button onClick={(e) => { e.stopPropagation(); onToggleFinalist(app); }} className={`p-1.5 rounded-lg transition-colors ${app.team.isFinalist ? 'text-amber-500 bg-amber-500/10' : 'text-slate-600 hover:text-amber-500 hover:bg-slate-700'}`}>
                                                    <Star size={16} className={app.team.isFinalist ? "fill-current" : ""}/>
                                                </button>
                                                <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center overflow-hidden flex-shrink-0 border border-slate-700">
                                                    {app.team.logoUrl ? <img src={app.team.logoUrl} className="w-full h-full object-cover"/> : <span className="font-bold text-slate-500">{app.team.name.substring(0,2)}</span>}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white text-sm">{app.team.name}</div>
                                                    <div className="text-xs text-slate-500">{app.teacher.school}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4"><span className="text-xs font-bold text-slate-400">{app.team.category}</span></td>
                                        <td className="p-4">
                                            {app.team.videoStatus === 'UPLOADED' ? <span className="text-green-500 flex items-center gap-1 text-xs font-bold"><CheckCircle2 size={14}/> Yüklendi</span> : 
                                             app.team.videoStatus === 'SUBMITTED_LINK' ? <span className="text-blue-400 flex items-center gap-1 text-xs font-bold"><LinkIcon size={14}/> Link</span> :
                                             <span className="text-slate-600 text-xs">Bekleniyor</span>}
                                        </td>
                                        <td className="p-4"><span className={`text-[10px] font-black uppercase px-2 py-1 rounded border whitespace-nowrap ${getStatusColor(app.status)}`}>{app.status}</span></td>
                                        <td className="p-4 text-center">
                                            <span className="font-black text-white">{app.finalScore || '-'}</span>
                                            {app.juryCount ? <span className="text-[9px] text-slate-500 block">({app.juryCount} jüri)</span> : null}
                                        </td>
                                        <td className="p-4 text-right">
                                            <button onClick={() => onSelectApp(app)} className="bg-slate-900 hover:bg-rose-600 text-slate-400 hover:text-white p-2 rounded-lg transition-colors"><Eye size={18} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filtered.map(app => (
                            <div key={app.id} className="bg-slate-800 rounded-xl border border-slate-700 p-5 hover:border-slate-500 transition-all shadow-lg group relative">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-14 h-14 rounded-xl bg-slate-900 border border-slate-600 flex items-center justify-center overflow-hidden">
                                        {app.team.logoUrl ? <img src={app.team.logoUrl} className="w-full h-full object-cover"/> : <span className="font-bold text-slate-500 text-lg">{app.team.name.substring(0,2)}</span>}
                                    </div>
                                    <button onClick={(e) => { e.stopPropagation(); onToggleFinalist(app); }} className={`p-2 rounded-full transition-colors ${app.team.isFinalist ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'bg-slate-700 text-slate-400 hover:bg-amber-500 hover:text-black'}`}>
                                        <Star size={18} className={app.team.isFinalist ? "fill-current" : ""}/>
                                    </button>
                                </div>
                                <h3 className="font-bold text-white text-lg mb-1 truncate">{app.team.name}</h3>
                                <p className="text-xs text-slate-400 mb-4 truncate">{app.teacher.school}</p>
                                
                                <div className="flex items-center gap-2 mb-4">
                                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded border ${getStatusColor(app.status)}`}>{app.status}</span>
                                    <span className="text-[10px] font-bold bg-slate-900 border border-slate-700 px-2 py-1 rounded text-slate-400">{app.team.category}</span>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                                    <div className="text-center">
                                        <span className="block text-[10px] uppercase text-slate-500 font-bold">Puan</span>
                                        <span className="text-lg font-black text-white">{app.finalScore || '-'}</span>
                                    </div>
                                    <button onClick={() => onSelectApp(app)} className="bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors shadow-lg shadow-rose-900/20">
                                        Detayları Gör
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const AdminJuryAssign = ({ apps }: { apps: Application[] }) => {
    const { allUsers, assignJury, showToast } = useAppContext();
    const juries = allUsers.filter(u => u.role === UserRole.JUDGE);
    const [filter, setFilter] = useState('');
    const [selectedApp, setSelectedApp] = useState<Application | null>(null);
    const [tempAssignments, setTempAssignments] = useState<string[]>([]);

    const filteredApps = apps.filter(app => 
        app.team.name.toLowerCase().includes(filter.toLowerCase()) || 
        app.teacher.school.toLowerCase().includes(filter.toLowerCase())
    );

    const openAssignModal = (app: Application) => {
        setSelectedApp(app);
        setTempAssignments(app.assignedJuryIds || []);
    };

    const toggleJury = (juryId: string) => {
        if (tempAssignments.includes(juryId)) {
            setTempAssignments(tempAssignments.filter(id => id !== juryId));
        } else {
            setTempAssignments([...tempAssignments, juryId]);
        }
    };

    const handleSave = async () => {
        if (!selectedApp) return;
        await assignJury(selectedApp.id, tempAssignments);
        setSelectedApp(null);
    };

    return (
        <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-xl overflow-hidden animate-fadeIn">
            <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                <h3 className="font-bold text-white flex items-center gap-2"><UserCheck size={20}/> Jüri Atama ve Dağıtım</h3>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input type="text" placeholder="Takım ara..." value={filter} onChange={(e) => setFilter(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:border-rose-500 outline-none w-64"/>
                </div>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[700px]">
                    <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase font-bold">
                        <tr>
                            <th className="p-4">Takım</th>
                            <th className="p-4">Kategori</th>
                            <th className="p-4">Atanan Jüriler</th>
                            <th className="p-4 text-right">İşlem</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {filteredApps.map(app => (
                            <tr key={app.id} className="hover:bg-slate-700/20">
                                <td className="p-4 font-bold text-white">{app.team.name}</td>
                                <td className="p-4 text-slate-400 text-xs">{app.team.category}</td>
                                <td className="p-4">
                                    <div className="flex flex-wrap gap-1">
                                        {app.assignedJuryIds && app.assignedJuryIds.length > 0 ? (
                                            app.assignedJuryIds.map(jid => {
                                                const jury = juries.find(j => j.uid === jid);
                                                return <span key={jid} className="text-[10px] bg-amber-900/30 text-amber-400 px-2 py-1 rounded border border-amber-800">{jury?.fullName || 'Bilinmeyen'}</span>
                                            })
                                        ) : (
                                            <span className="text-xs text-slate-500 italic">Henüz atanmadı</span>
                                        )}
                                    </div>
                                </td>
                                <td className="p-4 text-right">
                                    <button onClick={() => openAssignModal(app)} className="bg-slate-900 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-700">
                                        Düzenle
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {selectedApp && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                    <div className="bg-slate-900 rounded-2xl border border-slate-700 max-w-lg w-full p-6 shadow-2xl">
                        <h3 className="text-xl font-bold text-white mb-2">Jüri Seçimi</h3>
                        <p className="text-slate-400 text-sm mb-6">"{selectedApp.team.name}" takımı için jürileri seçiniz.</p>
                        
                        <div className="space-y-2 max-h-60 overflow-y-auto mb-6 pr-2 custom-scrollbar">
                            {juries.map(jury => (
                                <div key={jury.uid} onClick={() => toggleJury(jury.uid)} className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${tempAssignments.includes(jury.uid) ? 'bg-amber-900/20 border-amber-500/50' : 'bg-slate-950 border-slate-800 hover:border-slate-600'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${tempAssignments.includes(jury.uid) ? 'bg-amber-500 text-black' : 'bg-slate-800 text-slate-400'}`}>
                                            {jury.fullName.charAt(0)}
                                        </div>
                                        <div>
                                            <p className={`text-sm font-bold ${tempAssignments.includes(jury.uid) ? 'text-white' : 'text-slate-400'}`}>{jury.fullName}</p>
                                            <p className="text-[10px] text-slate-500">{jury.email}</p>
                                        </div>
                                    </div>
                                    {tempAssignments.includes(jury.uid) && <Check size={16} className="text-amber-500"/>}
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end gap-3">
                            <button onClick={() => setSelectedApp(null)} className="px-4 py-2 text-slate-400 hover:text-white">İptal</button>
                            <button onClick={handleSave} className="bg-amber-600 hover:bg-amber-500 text-white px-6 py-2 rounded-xl font-bold">Kaydet</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const AdminAnnouncements = () => {
    const { sendAnnouncement } = useAppContext();
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [target, setTarget] = useState<NotificationTarget>('ALL');
    const [type, setType] = useState<'info' | 'success' | 'warning' | 'error'>('info');
    const [isSending, setIsSending] = useState(false);

    // Helpers for Visual Selection
    const typeOptions = [
        { id: 'info', label: 'Bilgi', icon: Info, color: 'text-blue-400', bg: 'bg-blue-900/20', border: 'border-blue-900/50', activeBorder: 'border-blue-500' },
        { id: 'success', label: 'Başarı', icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-900/20', border: 'border-green-900/50', activeBorder: 'border-green-500' },
        { id: 'warning', label: 'Uyarı', icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-900/20', border: 'border-amber-900/50', activeBorder: 'border-amber-500' },
        { id: 'error', label: 'Kritik', icon: AlertOctagon, color: 'text-red-400', bg: 'bg-red-900/20', border: 'border-red-900/50', activeBorder: 'border-red-500' }
    ];

    const targetOptions = [
        { id: 'ALL', label: 'Herkese', icon: Users, desc: 'Tüm kullanıcılar' },
        { id: 'TEACHERS', label: 'Öğretmenler', icon: School, desc: 'Sadece danışmanlar' },
        { id: 'FINALISTS', label: 'Finalistler', icon: Star, desc: 'Finale kalan ekipler' },
        { id: 'JUDGES', label: 'Jüriler', icon: UserCheck, desc: 'Değerlendirme ekibi' }
    ];

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!title || !message) return;
        setIsSending(true);
        await sendAnnouncement(target, title, message, type);
        setTitle('');
        setMessage('');
        setIsSending(false);
    };

    const activeTypeStyle = typeOptions.find(t => t.id === type) || typeOptions[0];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-xl">
                    <div className="flex items-center gap-3 mb-8 border-b border-slate-700 pb-4">
                        <div className="p-3 bg-rose-900/20 text-rose-500 rounded-xl border border-rose-500/20 shadow-lg shadow-rose-900/10">
                            <Megaphone size={24}/>
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-xl">Yeni Duyuru Oluştur</h3>
                            <p className="text-slate-400 text-xs mt-1">Kullanıcı panellerine anlık bildirim gönderin.</p>
                        </div>
                    </div>

                    <form onSubmit={handleSend} className="space-y-8">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-3 block">Hedef Kitle</label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {targetOptions.map((t) => (
                                    <div 
                                        key={t.id}
                                        onClick={() => setTarget(t.id as NotificationTarget)}
                                        className={`cursor-pointer rounded-xl p-3 border transition-all duration-200 flex flex-col items-center text-center gap-2 ${target === t.id ? 'bg-slate-700 border-rose-500 shadow-lg shadow-rose-900/20' : 'bg-slate-900 border-slate-700 hover:border-slate-500'}`}
                                    >
                                        <t.icon size={20} className={target === t.id ? 'text-white' : 'text-slate-400'} />
                                        <div>
                                            <span className={`block text-xs font-bold ${target === t.id ? 'text-white' : 'text-slate-300'}`}>{t.label}</span>
                                            <span className="block text-[9px] text-slate-500 leading-tight mt-1">{t.desc}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-3 block">Bildirim Tipi</label>
                            <div className="flex flex-wrap gap-3">
                                {typeOptions.map((t) => (
                                    <div 
                                        key={t.id}
                                        onClick={() => setType(t.id as any)}
                                        className={`cursor-pointer rounded-lg px-4 py-2 border transition-all duration-200 flex items-center gap-2 text-xs font-bold ${type === t.id ? `${t.bg} ${t.activeBorder} ${t.color}` : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                                    >
                                        <t.icon size={14} />
                                        {t.label}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Başlık</label>
                                <input 
                                    required 
                                    value={title} 
                                    onChange={(e) => setTitle(e.target.value)} 
                                    placeholder="Örn: Son Başvuru Tarihi Uzatıldı" 
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white focus:border-rose-500 outline-none transition-colors font-bold placeholder-slate-700" 
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Mesaj İçeriği</label>
                                <textarea 
                                    required 
                                    value={message} 
                                    onChange={(e) => setMessage(e.target.value)} 
                                    placeholder="Duyuru detaylarını buraya yazınız..." 
                                    rows={5} 
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white focus:border-rose-500 outline-none transition-colors resize-none text-sm leading-relaxed placeholder-slate-700" 
                                />
                                <div className="text-right mt-2">
                                    <span className={`text-xs font-bold ${message.length > 200 ? 'text-amber-500' : 'text-slate-600'}`}>{message.length} karakter</span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-700 flex justify-end">
                            <button 
                                type="submit" 
                                disabled={isSending || !title || !message} 
                                className="bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-rose-900/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
                            >
                                {isSending ? (
                                    <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div> Gönderiliyor...</>
                                ) : (
                                    <><Send size={18} /> Duyuruyu Yayınla</>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="lg:col-span-1">
                <div className="sticky top-8 space-y-6">
                    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-4 flex items-center gap-2">
                            <Eye size={14}/> Canlı Önizleme
                        </h4>
                        
                        <div className="relative overflow-hidden rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl">
                            <div className="h-12 bg-slate-900 border-b border-slate-800 flex items-center px-4 justify-between">
                                <span className="w-20 h-2 bg-slate-800 rounded-full"></span>
                                <div className="flex gap-2">
                                    <div className="relative">
                                        <Bell size={16} className="text-white"/>
                                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-rose-500 rounded-full border border-slate-900"></span>
                                    </div>
                                    <div className="w-6 h-6 bg-rose-600 rounded-full"></div>
                                </div>
                            </div>

                            <div className="p-2">
                                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg transform transition-all duration-300">
                                    <div className={`p-4 flex gap-3 border-l-4 ${activeTypeStyle.color.replace('text-', 'border-')}`}>
                                        <div className="mt-0.5 flex-shrink-0">
                                            <activeTypeStyle.icon size={18} className={activeTypeStyle.color} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-bold text-white truncate pr-2">
                                                {title || "Duyuru Başlığı"}
                                            </h4>
                                            <p className="text-xs text-slate-400 mt-1 leading-relaxed break-words">
                                                {message || "Duyuru içeriği buraya gelecek..."}
                                            </p>
                                            <span className="text-[9px] text-slate-600 mt-2 block">Şimdi</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="h-32 bg-slate-950/50 p-4 space-y-3 opacity-30 pointer-events-none grayscale">
                                 <div className="h-20 bg-slate-900 rounded-xl w-full"></div>
                                 <div className="h-20 bg-slate-900 rounded-xl w-full"></div>
                            </div>
                        </div>

                        <div className="mt-4 p-4 bg-blue-900/10 rounded-xl border border-blue-900/30 text-xs text-blue-300 leading-relaxed flex gap-3">
                            <Info size={16} className="flex-shrink-0 mt-0.5"/>
                            Bu bildirim, seçilen hedef kitledeki kullanıcıların panelindeki zil ikonuna düşecektir.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const Admin: React.FC = () => {
  const { allApplications, updateApplication, logAction, systemSettings, updateSystemSettings, auditLogs, logout, fetchJuryScores, loading, showToast } = useAppContext();
  const [activeTab, setActiveTab] = useState('DASHBOARD');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [appScores, setAppScores] = useState<ScoreDocument[]>([]);
  const [youtubeLinkInput, setYoutubeLinkInput] = useState('');

  useEffect(() => {
      if (selectedApp) {
          fetchJuryScores(selectedApp.id).then(setAppScores);
          setYoutubeLinkInput(selectedApp.team.videoUrl || '');
      } else {
          setAppScores([]);
          setYoutubeLinkInput('');
      }
  }, [selectedApp]);

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
      if(selectedApp && selectedApp.id === app.id) {
          setSelectedApp(updated);
      }
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
          team: { ...selectedApp.team, videoUrl: youtubeLinkInput, videoStatus: 'UPLOADED' as const },
          status: ApplicationStatus.APPROVED 
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
      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto w-full transition-all duration-300">
          <header className="flex justify-between items-center mb-6 md:mb-8">
              <div className="flex items-center gap-3">
                  <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 text-slate-400 hover:text-white bg-slate-800 rounded-lg"><Menu size={24} /></button>
                  <h2 className="text-xl md:text-2xl font-black text-white tracking-tight truncate">
                      {activeTab === 'DASHBOARD' && 'Genel Bakış'}
                      {activeTab === 'ANNOUNCEMENTS' && 'Duyuru Merkezi'}
                      {activeTab === 'TEAMS' && 'Takım Yönetimi'}
                      {activeTab === 'JURY_ASSIGN' && 'Jüri Atama'}
                      {activeTab === 'USERS' && 'Kullanıcılar & Jüri'}
                      {activeTab === 'CONTENT' && 'İçerik Yönetimi (CMS)'}
                      {activeTab === 'SETTINGS' && 'Sistem Ayarları'}
                      {activeTab === 'LOGS' && 'Denetim Kayıtları'}
                  </h2>
              </div>
          </header>

          <div className="w-full h-[calc(100vh-140px)]">
            {loading ? <AdminSkeleton /> : (
                <>
                    {activeTab === 'DASHBOARD' && <AdminDashboard apps={allApplications} />}
                    {activeTab === 'ANNOUNCEMENTS' && <AdminAnnouncements />}
                    {activeTab === 'TEAMS' && <AdminTeams apps={allApplications} onSelectApp={setSelectedApp} onToggleFinalist={toggleFinalist} />}
                    {activeTab === 'JURY_ASSIGN' && <AdminJuryAssign apps={allApplications} />}
                    {activeTab === 'USERS' && <AdminUsers />}
                    {activeTab === 'CONTENT' && <AdminCMS />}
                    {activeTab === 'SETTINGS' && (
                        <form onSubmit={handleSettingsUpdate} className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-10">
                             <div className="flex items-center justify-between bg-slate-800 p-6 rounded-2xl border border-slate-700">
                                 <div>
                                     <h3 className="font-bold text-white text-lg">Yarışma Takvimi & Kurallar</h3>
                                     <p className="text-slate-400 text-xs mt-1">Tüm süreçleri buradan tek bir yerden yönetebilirsiniz.</p>
                                 </div>
                                 <button type="submit" className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2">
                                     <Save size={20} /> Değişiklikleri Kaydet
                                 </button>
                             </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                 <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 flex flex-col h-full">
                                     <h4 className="font-bold text-white mb-6 flex items-center gap-2 pb-4 border-b border-slate-700"><UserCheck size={20} className="text-blue-500"/> Başvuru Süreci</h4>
                                     <div className="space-y-4 flex-1">
                                         <div className="grid grid-cols-2 gap-4">
                                             <div><label className="label-text">Başlangıç</label><input type="datetime-local" value={systemSettings.dates.applicationStart} onChange={(e) => updateSystemSettings({...systemSettings, dates: {...systemSettings.dates, applicationStart: e.target.value}})} className="input-field" /></div>
                                             <div><label className="label-text">Bitiş</label><input type="datetime-local" value={systemSettings.dates.applicationEnd} onChange={(e) => updateSystemSettings({...systemSettings, dates: {...systemSettings.dates, applicationEnd: e.target.value}})} className="input-field" /></div>
                                         </div>
                                         <ToggleSwitch label="Yeni Kayıtları Kabul Et" checked={systemSettings.features.allowNewRegistrations} onChange={() => updateSystemSettings({...systemSettings, features: {...systemSettings.features, allowNewRegistrations: !systemSettings.features.allowNewRegistrations}})} activeColor="bg-blue-500"/>
                                     </div>
                                 </div>
                                 <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 flex flex-col h-full">
                                     <h4 className="font-bold text-white mb-6 flex items-center gap-2 pb-4 border-b border-slate-700"><Upload size={20} className="text-purple-500"/> Video Yükleme</h4>
                                     <div className="space-y-4 flex-1">
                                         <div className="grid grid-cols-2 gap-4">
                                             <div><label className="label-text">Yükleme Başlangıç</label><input type="datetime-local" value={systemSettings.dates.videoUploadStart} onChange={(e) => updateSystemSettings({...systemSettings, dates: {...systemSettings.dates, videoUploadStart: e.target.value}})} className="input-field" /></div>
                                             <div><label className="label-text">Yükleme Bitiş</label><input type="datetime-local" value={systemSettings.dates.videoUploadEnd} onChange={(e) => updateSystemSettings({...systemSettings, dates: {...systemSettings.dates, videoUploadEnd: e.target.value}})} className="input-field" /></div>
                                         </div>
                                         <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 text-xs text-slate-400">* Bu tarihler arasında takımlar panelden video linklerini gönderebilir.</div>
                                     </div>
                                 </div>
                                 <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 flex flex-col h-full">
                                     <h4 className="font-bold text-white mb-6 flex items-center gap-2 pb-4 border-b border-slate-700"><Star size={20} className="text-amber-500"/> Oylama & Etkinlik</h4>
                                     <div className="space-y-4 flex-1">
                                         <div className="grid grid-cols-2 gap-4">
                                             <div><label className="label-text">Oylama Başlangıç</label><input type="datetime-local" value={systemSettings.dates.publicVoteStart || ''} onChange={(e) => updateSystemSettings({...systemSettings, dates: {...systemSettings.dates, publicVoteStart: e.target.value}})} className="input-field" /></div>
                                             <div><label className="label-text">Oylama Bitiş</label><input type="datetime-local" value={systemSettings.dates.publicVoteEnd || ''} onChange={(e) => updateSystemSettings({...systemSettings, dates: {...systemSettings.dates, publicVoteEnd: e.target.value}})} className="input-field" /></div>
                                         </div>
                                         <div className="grid grid-cols-2 gap-4">
                                             <div><label className="label-text">Akademi Başlangıç</label><input type="datetime-local" value={systemSettings.dates.academyStart} onChange={(e) => updateSystemSettings({...systemSettings, dates: {...systemSettings.dates, academyStart: e.target.value}})} className="input-field" /></div>
                                             <div><label className="label-text text-rose-400">Gala Tarihi</label><input type="datetime-local" value={systemSettings.dates.galaDate} onChange={(e) => updateSystemSettings({...systemSettings, dates: {...systemSettings.dates, galaDate: e.target.value}})} className="input-field border-rose-900/50 focus:border-rose-500" /></div>
                                         </div>
                                         <ToggleSwitch label="Halk Oylamasını Aktif Et" checked={!!systemSettings.features.publicVotingActive} onChange={() => updateSystemSettings({...systemSettings, features: {...systemSettings.features, publicVotingActive: !systemSettings.features.publicVotingActive}})} activeColor="bg-amber-500"/>
                                     </div>
                                 </div>
                                 <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 flex flex-col h-full">
                                     <h4 className="font-bold text-white mb-6 flex items-center gap-2 pb-4 border-b border-slate-700"><Power size={20} className="text-red-500"/> Sistem Kontrolleri</h4>
                                     <div className="space-y-4 flex-1">
                                         <ToggleSwitch label="Jüri Değerlendirme Sistemi" checked={systemSettings.features.judgeSystemActive} onChange={() => updateSystemSettings({...systemSettings, features: {...systemSettings.features, judgeSystemActive: !systemSettings.features.judgeSystemActive}})} activeColor="bg-green-500"/>
                                         <ToggleSwitch label="Sonuçları Herkese İlan Et" checked={systemSettings.features.publicResultReveal} onChange={() => updateSystemSettings({...systemSettings, features: {...systemSettings.features, publicResultReveal: !systemSettings.features.publicResultReveal}})} activeColor="bg-rose-500"/>
                                         <div className="bg-rose-900/20 p-4 rounded-xl border border-rose-900/50 text-xs text-rose-300 mt-auto"><Info size={14} className="inline mr-1 mb-0.5"/><strong>Dikkat:</strong> "Sonuçları İlan Et" seçeneği açıldığında, kazananlar ana sayfada herkese açık olarak listelenir.</div>
                                     </div>
                                 </div>
                             </div>
                        </form>
                    )}
                    {activeTab === 'LOGS' && (
                        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden animate-fadeIn">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left min-w-[600px]">
                                    <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase"><tr><th className="p-4">Zaman</th><th className="p-4">İşlem</th><th className="p-4">Detay</th><th className="p-4">Yapan</th></tr></thead>
                                    <tbody className="divide-y divide-slate-700">
                                        {auditLogs.map(log => (<tr key={log.id} className="hover:bg-slate-700/20"><td className="p-4 text-xs text-slate-500 font-mono whitespace-nowrap">{new Date(log.timestamp).toLocaleString('tr-TR')}</td><td className="p-4"><span className="bg-slate-900 text-white text-xs px-2 py-1 rounded border border-slate-700 font-bold whitespace-nowrap">{log.action}</span></td><td className="p-4 text-sm text-slate-300 min-w-[200px]">{log.details}</td><td className="p-4 text-xs text-slate-400 whitespace-nowrap">{log.performedBy}</td></tr>))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}
          </div>
      </main>
      {selectedApp && (
          <div className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-sm flex justify-end animate-fadeIn">
              <div className="w-full max-w-2xl bg-slate-900 h-full border-l border-slate-700 p-6 md:p-8 overflow-y-auto shadow-2xl relative">
                  <button onClick={() => setSelectedApp(null)} className="absolute top-4 right-4 bg-slate-800 p-2 rounded-full text-slate-400 hover:text-white hover:bg-rose-600 transition-all z-10"><X size={20} /></button>
                  <div className="mb-8 pb-8 border-b border-slate-800 mt-8 md:mt-0">
                      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-4">
                          {selectedApp.team.logoUrl && <img src={selectedApp.team.logoUrl} className="w-20 h-20 rounded-xl object-cover bg-slate-800 border border-slate-700" />}
                          <div><h2 className="text-2xl md:text-3xl font-black text-white leading-tight">{selectedApp.team.name}</h2><p className="text-slate-400 text-sm mt-1">{selectedApp.teacher.school}</p></div>
                      </div>
                      <div className="flex flex-wrap gap-2"><span className="bg-slate-800 text-slate-300 text-xs px-3 py-1 rounded-full font-bold">{selectedApp.team.category}</span><span className="bg-slate-800 text-slate-300 text-xs px-3 py-1 rounded-full font-bold">{selectedApp.teacher.city}</span><span className={`text-xs px-3 py-1 rounded-full font-bold text-white ${selectedApp.team.isFinalist ? 'bg-amber-500' : 'bg-slate-700'}`}>{selectedApp.team.isFinalist ? 'FİNALİST' : 'Aday'}</span></div>
                  </div>
                  <div className="mb-8"><ChatArea appId={selectedApp.id} /></div>
                  <div className="mb-8 bg-slate-950 p-6 rounded-xl border border-slate-800">
                      <h3 className="text-sm font-bold text-white uppercase mb-4 flex items-center gap-2"><Video size={16} className="text-rose-500"/> Video İşlemleri</h3>
                      {selectedApp.team.submissionDownloadUrl && (
                          <div className="mb-6 p-4 bg-blue-900/20 border border-blue-900/50 rounded-xl">
                              <label className="text-xs font-bold text-blue-400 uppercase mb-2 flex items-center gap-2"><LinkIcon size={12}/> Öğretmen Teslim Linki</label>
                              <div className="flex gap-2"><input readOnly value={selectedApp.team.submissionDownloadUrl} className="flex-1 bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs text-slate-300 font-mono" /><a href={selectedApp.team.submissionDownloadUrl} target="_blank" rel="noreferrer" className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded text-xs font-bold flex items-center gap-2"><ExternalLink size={14}/> Aç</a></div>
                              <p className="text-[10px] text-slate-500 mt-2">* Bu linkten videoyu indirin, YouTube kanalına "Liste Dışı" yükleyin ve aşağıdaki alana ekleyin.</p>
                          </div>
                      )}
                      <div>
                           <label className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2"><Youtube size={14} className="text-red-500"/> YouTube Linki Tanımla</label>
                           <div className="flex gap-2"><input value={youtubeLinkInput} onChange={(e) => setYoutubeLinkInput(e.target.value)} placeholder="https://youtu.be/..." className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-rose-500 outline-none" /><button onClick={saveYoutubeLink} className="bg-slate-800 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-bold transition-colors flex items-center gap-2"><Save size={16} /> Kaydet</button></div>
                           {selectedApp.team.videoUrl && (<div className="mt-4 rounded-lg overflow-hidden border border-slate-800"><iframe src={getYouTubeEmbedUrl(selectedApp.team.videoUrl) || ""} className="w-full aspect-video" allowFullScreen></iframe></div>)}
                      </div>
                  </div>
                  <div className="mb-8">
                      <h3 className="text-sm font-bold text-slate-500 uppercase mb-4 flex items-center gap-2"><Star size={16}/> Jüri Puanları</h3>
                      {appScores.length > 0 ? (
                          <div className="space-y-3">
                              {appScores.map((score, i) => (
                                  <div key={i} className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                                      <div className="flex justify-between items-center mb-2"><span className="font-bold text-white text-sm">{score.juryName}</span><span className="text-lg font-black text-amber-500">{score.total}</span></div>
                                      <div className="grid grid-cols-4 gap-2 text-[10px] text-slate-500 mb-2"><div>Hikaye: {score.criteria.story}</div><div>Teknik: {score.criteria.technical}</div><div>Özgünlük: {score.criteria.originality}</div><div>Tema: {score.criteria.themeFit}</div></div>
                                      {score.notes && (<p className="text-xs text-slate-400 italic border-t border-slate-800 pt-2 mt-2">"{score.notes}"</p>)}
                                  </div>
                              ))}
                              <div className="flex justify-between items-center bg-slate-800 p-4 rounded-xl"><span className="font-bold text-white">Ortalama Puan</span><span className="text-2xl font-black text-green-500">{selectedApp.finalScore}</span></div>
                          </div>
                      ) : (<div className="text-slate-500 text-sm italic">Henüz puanlama yapılmamış.</div>)}
                  </div>
                  <div className="mt-auto pt-6 border-t border-slate-800 pb-10 md:pb-0">
                      <h3 className="text-sm font-bold text-slate-500 uppercase mb-4">Yönetim İşlemleri</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                           <button onClick={() => toggleFinalist(selectedApp)} className={`p-4 rounded-xl font-bold flex flex-col items-center justify-center gap-2 transition-all ${selectedApp.team.isFinalist ? 'bg-amber-500/10 text-amber-500 border border-amber-500/50' : 'bg-slate-800 text-slate-400 hover:bg-amber-500 hover:text-black'}`}><Star size={24} className={selectedApp.team.isFinalist ? "fill-current" : ""}/>{selectedApp.team.isFinalist ? "Finalistliği Kaldır" : "Finalist Yap"}</button>
                           <button onClick={() => handleStatusChange(selectedApp, ApplicationStatus.DISQUALIFIED)} className="bg-slate-800 hover:bg-red-900/30 text-slate-400 hover:text-red-500 p-4 rounded-xl font-bold flex flex-col items-center justify-center gap-2 border border-slate-800 hover:border-red-500/30 transition-all"><Trash2 size={24} />Diskalifiye Et</button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};