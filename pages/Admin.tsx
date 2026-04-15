
import React, { useState, useEffect, useMemo } from 'react';
import { 
    Search, Check, X, Eye, Award, FileText, Shield, Inbox, Download, 
    Users, Film, School, Mail, AlertTriangle, Send, Clapperboard, Video, 
    Cpu, Activity, PieChart, BarChart3, Clock, UserCheck, Star, Plus, Lock, 
    Menu, LayoutDashboard, Settings, LogOut, FileDown, Trash2, MapPin, List, RefreshCw, ChevronRight, UserCog, MessageSquare, ExternalLink, Link as LinkIcon, Save, Youtube, PenTool, LayoutTemplate, HelpCircle, Bell, Image as ImageIcon, Megaphone, BookOpen, Calendar, Trophy, CheckCircle2, AlertOctagon, Info, ToggleRight, ToggleLeft, Power, Globe, Upload, LayoutGrid, Filter, TrendingUp, Wand2, Square, CheckSquare, MailOpen, Database, Construction, ChevronDown, Copy, AlertCircle
} from 'lucide-react';
import { ApplicationStatus, Category, Theme, Application, UserRole, LogEntry, SystemSettings, ScoreDocument, CMSGeneral, CMSFaqItem, FAQCategory, NotificationTarget, CMSGalleryItem, CMSAcademyItem, CMSTimelineItem, CMSPrize, CMSLinks, ContactMessage } from '../types';
import { useAppContext } from '../context/AppContext';
import { ChatArea } from '../components/ChatArea';
import { getYouTubeEmbedUrl } from '../lib/videoUtils';
import { AdminCMS } from '../components/admin/AdminCMS';
import { writeBatch, doc, collection } from 'firebase/firestore'; // Import needed for direct batch writing
import { db } from '../lib/firebase'; // Import db

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

const SimpleTrendChart = ({ data, color = "#f43f5e" }: { data: number[], color?: string }) => {
    if (data.length < 2) return <div className="h-32 flex items-center justify-center text-slate-600 text-xs">Yeterli veri yok</div>;

    const max = Math.max(...data, 1);
    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = 100 - (val / max) * 100;
        return `${x},${y}`;
    }).join(' ');

    const fillPath = `M0,100 ${points.split(' ').map(p => `L${p}`).join(' ')} L100,100 Z`;

    return (
        <div className="h-40 w-full relative overflow-hidden">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                {/* Gradient Definition */}
                <defs>
                    <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                        <stop offset="100%" stopColor={color} stopOpacity="0" />
                    </linearGradient>
                </defs>
                {/* Area Fill */}
                <path d={fillPath} fill="url(#chartGradient)" stroke="none" />
                {/* Line */}
                <polyline 
                    fill="none" 
                    stroke={color} 
                    strokeWidth="2" 
                    points={points} 
                    vectorEffect="non-scaling-stroke"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
            {/* Tooltip hint lines (vertical grid) */}
            <div className="absolute inset-0 flex justify-between pointer-events-none opacity-10">
                {data.map((_, i) => <div key={i} className="w-px h-full bg-slate-400"></div>)}
            </div>
        </div>
    );
};

const SimpleDonutChart = ({ data }: { data: { name: string, value: number, color: string }[] }) => {
    const total = data.reduce((acc, cur) => acc + cur.value, 0);
    let cumulativeAngle = 0;

    if (total === 0) return <div className="h-32 flex items-center justify-center text-slate-600 text-xs">Veri yok</div>;

    return (
        <div className="flex items-center gap-6">
            <div className="relative w-32 h-32 flex-shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    {data.map((slice, i) => {
                        const angle = (slice.value / total) * 360;
                        const x1 = 50 + 40 * Math.cos(Math.PI * cumulativeAngle / 180);
                        const y1 = 50 + 40 * Math.sin(Math.PI * cumulativeAngle / 180);
                        const x2 = 50 + 40 * Math.cos(Math.PI * (cumulativeAngle + angle) / 180);
                        const y2 = 50 + 40 * Math.sin(Math.PI * (cumulativeAngle + angle) / 180);
                        
                        // SVG Arc Path Command
                        const largeArcFlag = angle > 180 ? 1 : 0;
                        const pathData = total === slice.value 
                            ? "M 50, 50 m -40, 0 a 40,40 0 1,0 80,0 a 40,40 0 1,0 -80,0" // Full circle
                            : `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

                        cumulativeAngle += angle;

                        return (
                            <path 
                                key={i} 
                                d={pathData} 
                                fill={slice.color} 
                                stroke="#1e293b" 
                                strokeWidth="2"
                                className="transition-all hover:opacity-80"
                            />
                        );
                    })}
                    <circle cx="50" cy="50" r="25" fill="#1e293b" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-xs font-bold text-white">{total}</span>
                </div>
            </div>
            <div className="space-y-3 flex-1">
                {data.map((slice, i) => (
                    <div key={i} className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: slice.color }}></span>
                            <span className="text-slate-300">{slice.name}</span>
                        </div>
                        <span className="font-bold text-white">{slice.value} <span className="text-slate-500 font-normal">({((slice.value/total)*100).toFixed(0)}%)</span></span>
                    </div>
                ))}
            </div>
        </div>
    );
};

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

const DateInput = ({ label, value, onChange }: { label: string, value: string, onChange: (val: string) => void }) => (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 flex flex-col gap-1 transition-all hover:border-slate-500">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</label>
        <div className="flex items-center gap-2">
            <Calendar size={16} className="text-slate-400" />
            <input 
                type="datetime-local" 
                value={value} 
                onChange={(e) => onChange(e.target.value)} 
                className="bg-transparent text-white text-sm font-bold outline-none w-full [color-scheme:dark]"
            />
        </div>
    </div>
);

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
        { id: 'INBOX', icon: Mail, label: 'Gelen Kutusu' },
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
                            <p className="text-slate-500 text-sm font-medium">Reflect&Shoot</p>
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

const AnalyticsSection = ({ apps, onFilterCategory }: { apps: Application[], onFilterCategory: (cat: string | null) => void }) => {
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);

    const handleCategoryClick = (catId: string) => {
        const newFilter = selectedCategoryFilter === catId ? null : catId;
        setSelectedCategoryFilter(newFilter);
        onFilterCategory(newFilter);
    };

    const trendData = useMemo(() => {
        const groups: Record<string, number> = {};
        apps.forEach(app => {
            const date = app.submittedAt.split('T')[0];
            groups[date] = (groups[date] || 0) + 1;
        });
        const sortedDates = Object.keys(groups).sort();
        return sortedDates.map(d => groups[d]);
    }, [apps]);

    const categoryData = [
        { id: Category.LIVE_ACTION, name: 'Canlı Çekim', value: apps.filter(a => a.team.category === Category.LIVE_ACTION).length, color: '#0d9488' }, 
        { id: Category.AI_ANIMATION, name: 'AI Animasyon', value: apps.filter(a => a.team.category === Category.AI_ANIMATION).length, color: '#9333ea' } 
    ];

    const cityData = useMemo(() => {
        const counts: Record<string, number> = {};
        apps.forEach(app => {
            const city = app.teacher.city || 'Belirtilmedi';
            counts[city] = (counts[city] || 0) + 1;
        });
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, value]) => ({ name, value }));
    }, [apps]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl flex flex-col justify-between">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-white flex items-center gap-2 text-sm">
                        <TrendingUp size={16} className="text-rose-500"/> Başvuru Trendi
                    </h3>
                    <span className="text-[10px] bg-slate-900 text-slate-400 px-2 py-1 rounded">Son 30 Gün</span>
                </div>
                <div className="flex-1 flex items-end">
                    <SimpleTrendChart data={trendData} />
                </div>
            </div>
            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
                <h3 className="font-bold text-white flex items-center gap-2 text-sm mb-6">
                    <PieChart size={16} className="text-blue-500"/> Kategori Dağılımı
                </h3>
                <div className="space-y-3">
                    {categoryData.map((slice, i) => (
                        <div 
                            key={i} 
                            onClick={() => handleCategoryClick(slice.id)}
                            className={`flex justify-between items-center text-xs p-2 rounded-lg cursor-pointer transition-all ${selectedCategoryFilter === slice.id ? 'bg-slate-700 ring-1 ring-white/20' : 'hover:bg-slate-700/50'}`}
                        >
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: slice.color }}></span>
                                <span className="text-slate-300">{slice.name}</span>
                            </div>
                            <span className="font-bold text-white">{slice.value} <span className="text-slate-500 font-normal">({((slice.value/apps.length || 1)*100).toFixed(0)}%)</span></span>
                        </div>
                    ))}
                    {selectedCategoryFilter && (
                        <button 
                            onClick={() => { setSelectedCategoryFilter(null); onFilterCategory(null); }}
                            className="w-full mt-2 py-1 text-[10px] text-rose-400 hover:text-rose-300 font-bold uppercase tracking-widest"
                        >
                            Filtreyi Temizle
                        </button>
                    )}
                </div>
            </div>
            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
                <h3 className="font-bold text-white flex items-center gap-2 text-sm mb-6">
                    <MapPin size={16} className="text-amber-500"/> Şehir Bazlı Katılım
                </h3>
                <div className="space-y-4">
                    {cityData.length > 0 ? cityData.map((city, i) => (
                        <div key={i}>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-slate-300 font-bold">{city.name}</span>
                                <span className="text-slate-500">{city.value} Takım</span>
                            </div>
                            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                                <div 
                                    className="bg-amber-500 h-full rounded-full transition-all duration-1000" 
                                    style={{ width: `${(city.value / Math.max(...cityData.map(c=>c.value))) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    )) : <p className="text-xs text-slate-500 text-center py-8">Veri yok</p>}
                </div>
            </div>
        </div>
    );
};

const Skeleton = ({ className }: { className?: string }) => (
    <div className={`animate-pulse bg-slate-700/50 rounded-lg ${className}`}></div>
);

const AdminDashboard = ({ apps, onFilterCategory }: { apps: Application[], onFilterCategory: (cat: string | null) => void }) => {
    // Calculations
    const totalApps = apps.length;
    const finalistCount = apps.filter(a => a.team.isFinalist).length;
    const videoCount = apps.filter(a => a.team.videoStatus === 'UPLOADED' || a.team.videoStatus === 'SUBMITTED_LINK').length;
    
    const liveActionRankings = useMemo(() => apps
        .filter(a => a.team.category === Category.LIVE_ACTION && a.finalScore !== undefined)
        .sort((a, b) => (b.finalScore || 0) - (a.finalScore || 0))
        .slice(0, 10), [apps]);

    const aiRankings = useMemo(() => apps
        .filter(a => a.team.category === Category.AI_ANIMATION && a.finalScore !== undefined)
        .sort((a, b) => (b.finalScore || 0) - (a.finalScore || 0))
        .slice(0, 10), [apps]);

    const gradedApps = apps.filter(a => a.finalScore !== undefined && a.finalScore > 0);
    const avgScore = gradedApps.length > 0 
        ? (gradedApps.reduce((acc, curr) => acc + (curr.finalScore || 0), 0) / gradedApps.length).toFixed(1) 
        : "0.0";

    const { updateApplication, showToast } = useAppContext();
    const mevechoTeam = apps.find(a => a.team.name.toLowerCase().includes('mevecho'));

    const fixMevecho = async () => {
        if (!mevechoTeam) {
            showToast("Mevecho takımı bulunamadı.", "info");
            return;
        }
        try {
            await updateApplication({
                ...mevechoTeam,
                team: {
                    ...mevechoTeam.team,
                    theme: Theme.AYET,
                    selectedVerse: 'Asr 1-3'
                }
            });
            showToast("Mevecho takımı düzeltildi.", "success");
        } catch (e) {
            showToast("Düzeltme başarısız.", "error");
        }
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            {mevechoTeam && mevechoTeam.team.selectedVerse !== 'Asr 1-3' && (
                <div className="bg-amber-900/20 border border-amber-500/30 p-4 rounded-xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="text-amber-500" size={24} />
                        <div>
                            <p className="text-sm font-bold text-white">Mevecho Takımı Tema Düzeltmesi</p>
                            <p className="text-xs text-slate-400">Bu takımın teması "Asr 1-3" olarak güncellenmelidir.</p>
                        </div>
                    </div>
                    <button 
                        onClick={fixMevecho}
                        className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors"
                    >
                        Şimdi Düzelt
                    </button>
                </div>
            )}
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Apps */}
                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><Inbox size={64} /></div>
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-900/30 rounded-xl text-blue-400"><Inbox size={24}/></div>
                        <span className="text-[10px] font-bold uppercase tracking-widest bg-slate-900 text-slate-400 px-2 py-1 rounded">Toplam</span>
                    </div>
                    <div className="text-4xl font-black text-white mb-1">{totalApps}</div>
                    <div className="text-sm text-slate-400 font-medium">Başvuru</div>
                </div>

                {/* Finalists */}
                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><Star size={64} className="text-amber-500"/></div>
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-amber-900/30 rounded-xl text-amber-400"><Star size={24}/></div>
                        <span className="text-[10px] font-bold uppercase tracking-widest bg-slate-900 text-slate-400 px-2 py-1 rounded">Final</span>
                    </div>
                    <div className="text-4xl font-black text-white mb-1">{finalistCount}</div>
                    <div className="text-sm text-slate-400 font-medium">Finalist Takım</div>
                </div>

                {/* Avg Score */}
                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><Activity size={64} className="text-emerald-500"/></div>
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-emerald-900/30 rounded-xl text-emerald-400"><Activity size={24}/></div>
                        <span className="text-[10px] font-bold uppercase tracking-widest bg-slate-900 text-slate-400 px-2 py-1 rounded">Skor</span>
                    </div>
                    <div className="text-4xl font-black text-white mb-1">{avgScore}</div>
                    <div className="text-sm text-slate-400 font-medium">Ortalama Puan</div>
                </div>

                {/* Video Submissions */}
                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><Video size={64} className="text-rose-500"/></div>
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-rose-900/30 rounded-xl text-rose-400"><Video size={24}/></div>
                        <span className="text-[10px] font-bold uppercase tracking-widest bg-slate-900 text-slate-400 px-2 py-1 rounded">Teslim</span>
                    </div>
                    <div className="text-4xl font-black text-white mb-1">{videoCount}</div>
                    <div className="text-sm text-slate-400 font-medium">Video Teslim</div>
                </div>
            </div>

            {/* Charts Section */}
            <AnalyticsSection apps={apps} onFilterCategory={onFilterCategory} />

            {/* Leaderboard */}
            <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-xl overflow-hidden">
                <div className="p-6 border-b border-slate-700 flex items-center gap-3">
                    <Trophy size={20} className="text-amber-500" />
                    <h3 className="font-bold text-white text-lg">Liderlik Tablosu (Top 10)</h3>
                </div>
                
                <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Live Action Column */}
                    <div>
                        <h4 className="text-sm font-bold text-teal-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Film size={16}/> Canlı Çekim
                        </h4>
                        {liveActionRankings.length > 0 ? (
                            <div className="space-y-2">
                                {liveActionRankings.map((app, i) => (
                                    <div key={app.id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-slate-700/50">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${i < 3 ? 'bg-amber-500 text-black' : 'bg-slate-800 text-slate-400'}`}>
                                                {i + 1}
                                            </div>
                                            <div>
                                                <div className="font-bold text-white text-sm">{app.team.name}</div>
                                                <div className="text-[10px] text-slate-500">{app.teacher.school}</div>
                                            </div>
                                        </div>
                                        <div className="text-lg font-black text-amber-500">{app.finalScore?.toFixed(1)}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-32 flex items-center justify-center text-slate-500 text-sm italic border-2 border-dashed border-slate-700 rounded-xl">
                                Henüz puanlama yapılmadı.
                            </div>
                        )}
                    </div>

                    {/* AI Animation Column */}
                    <div>
                        <h4 className="text-sm font-bold text-purple-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Cpu size={16}/> Yapay Zeka Animasyon
                        </h4>
                        {aiRankings.length > 0 ? (
                            <div className="space-y-2">
                                {aiRankings.map((app, i) => (
                                    <div key={app.id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-slate-700/50">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${i < 3 ? 'bg-amber-500 text-black' : 'bg-slate-800 text-slate-400'}`}>
                                                {i + 1}
                                            </div>
                                            <div>
                                                <div className="font-bold text-white text-sm">{app.team.name}</div>
                                                <div className="text-[10px] text-slate-500">{app.teacher.school}</div>
                                            </div>
                                        </div>
                                        <div className="text-lg font-black text-amber-500">{app.finalScore?.toFixed(1)}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-32 flex items-center justify-center text-slate-500 text-sm italic border-2 border-dashed border-slate-700 rounded-xl">
                                Henüz puanlama yapılmadı.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const AdminTeams = ({ apps, onSelectApp, onToggleFinalist, initialCategoryFilter }: { apps: Application[], onSelectApp: (app: Application) => void, onToggleFinalist: (app: Application) => void, initialCategoryFilter?: string | null }) => {
    const { deleteApplication, updateApplicationStatus, showToast } = useAppContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [categoryFilter, setCategoryFilter] = useState<string>(initialCategoryFilter || 'ALL');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isBulkProcessing, setIsBulkProcessing] = useState(false);

    useEffect(() => {
        if (initialCategoryFilter) {
            setCategoryFilter(initialCategoryFilter);
        }
    }, [initialCategoryFilter]);

    // Filtering
    const filteredApps = apps.filter(app => {
        const matchesSearch = app.team.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              app.teacher.school.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
        const matchesCategory = categoryFilter === 'ALL' || app.team.category === categoryFilter;
        
        return matchesSearch && matchesStatus && matchesCategory;
    });

    const handleBulkStatusUpdate = async (newStatus: ApplicationStatus) => {
        if (selectedIds.size === 0) return;
        if (!window.confirm(`Seçili ${selectedIds.size} takımı "${newStatus}" durumuna getirmek istediğinize emin misiniz?`)) return;

        setIsBulkProcessing(true);
        try {
            const promises = Array.from(selectedIds).map(id => updateApplicationStatus(id, newStatus));
            await Promise.all(promises);
            showToast(`${selectedIds.size} takım güncellendi.`, 'success');
            setSelectedIds(new Set());
        } catch (error) {
            console.error(error);
            showToast('Toplu işlem sırasında hata oluştu.', 'error');
        } finally {
            setIsBulkProcessing(false);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) return;
        if (!window.confirm(`Seçili ${selectedIds.size} takımı tamamen silmek istediğinize emin misiniz? Bu işlem geri alınamaz!`)) return;

        setIsBulkProcessing(true);
        try {
            const promises = Array.from(selectedIds).map(id => deleteApplication(id));
            await Promise.all(promises);
            showToast(`${selectedIds.size} takım silindi.`, 'success');
            setSelectedIds(new Set());
        } catch (error) {
            console.error(error);
            showToast('Toplu silme sırasında hata oluştu.', 'error');
        } finally {
            setIsBulkProcessing(false);
        }
    };

    // Stats
    const stats = {
        shown: filteredApps.length,
        finalist: filteredApps.filter(a => a.team.isFinalist).length,
        videoUploaded: filteredApps.filter(a => a.team.videoStatus === 'UPLOADED' || a.team.videoStatus === 'SUBMITTED_LINK').length
    };

    const toggleSelection = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    const toggleAll = () => {
        if (selectedIds.size === filteredApps.length) setSelectedIds(new Set());
        else setSelectedIds(new Set(filteredApps.map(a => a.id)));
    };

    const handleExport = () => {
        const data = filteredApps.map(app => ({
            Team: app.team.name,
            School: app.teacher.school,
            Category: app.team.category,
            Status: app.status,
            Score: app.finalScore || 0,
            Email: app.teacher.email,
            Phone: app.teacher.phone
        }));
        exportToCSV(data, 'takim_listesi.csv');
    };

    const handleDelete = async (appId: string) => {
        if (!window.confirm("Bu takımı ve tüm verilerini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.")) return;
        await deleteApplication(appId);
    };

    const renderStatus = (status: ApplicationStatus) => {
        let classes = "bg-slate-800 text-slate-400 border-slate-700";
        if(status === ApplicationStatus.DRAFT) classes = "bg-slate-800 text-slate-500 border-slate-700";
        else if(status === ApplicationStatus.PRELIMINARY_SUBMITTED) classes = "bg-slate-800 text-white border-slate-600";
        else if(status === ApplicationStatus.APPROVED) classes = "bg-green-900/20 text-green-400 border-green-900/50";
        else if(status === ApplicationStatus.REJECTED) classes = "bg-red-900/20 text-red-400 border-red-900/50";
        else if(status === ApplicationStatus.DISQUALIFIED) classes = "bg-red-950 text-red-500 border-red-900";
        
        return <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded border ${classes}`}>{status}</span>
    };

    return (
        <div className="space-y-4 animate-fadeIn">
            {/* Toolbar */}
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Takım veya okul ara..." 
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:border-rose-500 outline-none"
                    />
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
                    <select 
                        value={statusFilter} 
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-300 outline-none focus:border-rose-500"
                    >
                        <option value="ALL">Tüm Durumlar</option>
                        {Object.values(ApplicationStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>

                    <select 
                        value={categoryFilter} 
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-300 outline-none focus:border-rose-500"
                    >
                        <option value="ALL">Tüm Kategoriler</option>
                        {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>

                    <div className="h-8 w-px bg-slate-700 mx-1"></div>

                    <button className="p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-400 hover:text-white hover:border-slate-500 transition-colors">
                        <List size={18} />
                    </button>
                    <button className="p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-400 hover:text-white hover:border-slate-500 transition-colors">
                        <LayoutGrid size={18} />
                    </button>

                    <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-bold transition-colors border border-slate-600">
                        <FileText size={16}/> Excel
                    </button>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="flex items-center gap-6 px-2 text-xs font-medium text-slate-500">
                <span>Gösterilen: <strong className="text-white">{stats.shown}</strong></span>
                <span>Finalist: <strong className="text-amber-500">{stats.finalist}</strong></span>
                <span>Video Yükleyen: <strong className="text-blue-500">{stats.videoUploaded}</strong></span>
            </div>

            {/* Bulk Actions Bar */}
            {selectedIds.size > 0 && (
                <div className="bg-rose-600 p-4 rounded-xl shadow-lg flex items-center justify-between animate-fadeInUp mb-4">
                    <div className="flex items-center gap-4">
                        <div className="bg-white/20 p-2 rounded-lg text-white">
                            <CheckSquare size={20} />
                        </div>
                        <div>
                            <div className="text-white font-bold text-sm">{selectedIds.size} Takım Seçildi</div>
                            <div className="text-rose-100 text-[10px] uppercase tracking-widest font-bold">Toplu İşlem Menüsü</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            disabled={isBulkProcessing}
                            onClick={() => handleBulkStatusUpdate(ApplicationStatus.APPROVED)}
                            className="px-4 py-2 bg-white text-rose-600 rounded-lg text-xs font-bold hover:bg-rose-50 transition-colors disabled:opacity-50"
                        >
                            Hepsini Onayla
                        </button>
                        <button 
                            disabled={isBulkProcessing}
                            onClick={() => handleBulkStatusUpdate(ApplicationStatus.REJECTED)}
                            className="px-4 py-2 bg-rose-800 text-white rounded-lg text-xs font-bold hover:bg-rose-900 transition-colors disabled:opacity-50"
                        >
                            Hepsini Reddet
                        </button>
                        <div className="w-px h-8 bg-white/20 mx-1"></div>
                        <button 
                            disabled={isBulkProcessing}
                            onClick={handleBulkDelete}
                            className="p-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50"
                            title="Seçilenleri Sil"
                        >
                            <Trash2 size={18} />
                        </button>
                        <button 
                            onClick={() => setSelectedIds(new Set())}
                            className="p-2 text-white/60 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-700 bg-slate-900/50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                <th className="p-4 w-12 text-center">
                                    <input type="checkbox" onChange={toggleAll} checked={selectedIds.size === filteredApps.length && filteredApps.length > 0} className="rounded border-slate-700 bg-slate-800" />
                                </th>
                                <th className="p-4">Takım</th>
                                <th className="p-4">Danışman</th>
                                <th className="p-4">Kategori & Tema</th>
                                <th className="p-4">Video</th>
                                <th className="p-4">Durum</th>
                                <th className="p-4 text-center">Puan</th>
                                <th className="p-4 text-right">İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {filteredApps.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-12 text-center text-slate-500">Kayıt bulunamadı.</td>
                                </tr>
                            ) : (
                                filteredApps.map(app => (
                                    <tr key={app.id} className="hover:bg-slate-700/30 transition-colors group">
                                        <td className="p-4 text-center">
                                            <input 
                                                type="checkbox" 
                                                checked={selectedIds.has(app.id)}
                                                onChange={() => toggleSelection(app.id)}
                                                className="rounded border-slate-700 bg-slate-800 accent-rose-600" 
                                            />
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <button onClick={(e) => { e.stopPropagation(); onToggleFinalist(app); }} className="text-slate-600 hover:text-amber-500 transition-colors">
                                                    <Star size={18} className={app.team.isFinalist ? "fill-amber-500 text-amber-500" : ""} />
                                                </button>
                                                <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                    {app.team.logoUrl ? <img src={app.team.logoUrl} className="w-full h-full object-cover" /> : <Users size={20} className="text-slate-600"/>}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="font-bold text-white text-sm">{app.team.name}</div>
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(app.team.name); }}
                                                            className="text-slate-600 hover:text-white transition-colors"
                                                            title="İsmi Kopyala"
                                                        >
                                                            <Copy size={12} />
                                                        </button>
                                                    </div>
                                                    <div className="text-xs text-slate-500">{app.teacher.school}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm text-white font-medium">{app.teacher.fullName}</div>
                                            <div className="text-xs text-slate-500">{app.teacher.email}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-xs text-slate-300 font-medium">{app.team.category}</div>
                                            <div className="text-xs text-slate-500">{app.team.theme}</div>
                                            {app.team.theme === Theme.AYET && app.team.selectedVerse && (
                                                <div className="text-[10px] text-rose-400 mt-1 truncate max-w-[150px]" title={app.team.selectedVerse}>
                                                    {app.team.selectedVerse}
                                                </div>
                                            )}
                                            {(app.team.theme === Theme.HADITH || app.team.theme === Theme.SAHABE) && app.team.selectedTopic && (
                                                <div className="text-[10px] text-amber-400 mt-1 truncate max-w-[150px]" title={app.team.selectedTopic}>
                                                    {app.team.selectedTopic}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <span className={`text-xs font-bold ${app.team.videoStatus === 'UPLOADED' ? 'text-green-500' : app.team.videoStatus === 'SUBMITTED_LINK' ? 'text-blue-500' : 'text-slate-600'}`}>
                                                {app.team.videoStatus === 'UPLOADED' ? 'Yüklendi' : app.team.videoStatus === 'SUBMITTED_LINK' ? 'Link Var' : 'Bekleniyor'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {renderStatus(app.status)}
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`font-mono font-bold ${app.finalScore ? 'text-white' : 'text-slate-600'}`}>
                                                {app.finalScore ? app.finalScore.toFixed(1) : '-'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    onClick={() => onSelectApp(app)}
                                                    className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-all"
                                                    title="İncele"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(app.id); }}
                                                    className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-red-500 hover:border-red-500/50 transition-all"
                                                    title="Sil"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const AdminJuryAssign = ({ apps }: { apps: Application[] }) => {
    const { allUsers, bulkAssignJury, assignJury, showToast } = useAppContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [editingApp, setEditingApp] = useState<Application | null>(null);
    const [selectedJuries, setSelectedJuries] = useState<Set<string>>(new Set());
    const [isAutoAssigning, setIsAutoAssigning] = useState(false);

    const juries = useMemo(() => allUsers.filter(u => u.role === UserRole.JUDGE), [allUsers]);

    const filteredApps = apps.filter(app => 
        app.team.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const openEditModal = (app: Application) => {
        setEditingApp(app);
        setSelectedJuries(new Set(app.assignedJuryIds || []));
    };

    const toggleJurySelection = (juryId: string) => {
        const newSet = new Set(selectedJuries);
        if (newSet.has(juryId)) newSet.delete(juryId);
        else newSet.add(juryId);
        setSelectedJuries(newSet);
    };

    const saveManualAssignment = async () => {
        if (!editingApp) return;
        try {
            await assignJury(editingApp.id, Array.from(selectedJuries));
            setEditingApp(null);
        } catch (error) {
            console.error(error);
            showToast('Kayıt başarısız.', 'error');
        }
    };

    const handleAutoAssign = async () => {
        if (juries.length === 0) {
            showToast('Sistemde kayıtlı jüri bulunamadı. Lütfen önce jüri ekleyin.', 'error');
            return;
        }
        
        if (!window.confirm('Tüm takımlara otomatik jüri ataması yapılacaktır. Her takıma rastgele 3 jüri atanır. Onaylıyor musunuz?')) return;

        setIsAutoAssigning(true);
        try {
            const assignments = apps.map(app => {
                // Simple random assignment logic: 3 juries per team
                // If juries count < 3, assign all.
                const needed = Math.min(3, juries.length);
                const shuffled = [...juries].sort(() => 0.5 - Math.random());
                const selectedIds = shuffled.slice(0, needed).map(j => j.uid);
                return { appId: app.id, juryIds: selectedIds };
            });

            await bulkAssignJury(assignments);
            showToast('Otomatik dağıtım tamamlandı.', 'success');
        } catch (error) {
            console.error(error);
            showToast('Otomatik atama sırasında hata oluştu.', 'error');
        } finally {
            setIsAutoAssigning(false);
        }
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header / Toolbar */}
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2 text-white font-bold">
                    <UserCheck size={20} className="text-slate-400"/>
                    Jüri Atama ve Dağıtım
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Takım ara..." 
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:border-rose-500 outline-none"
                        />
                    </div>
                    <button 
                        onClick={handleAutoAssign}
                        disabled={isAutoAssigning}
                        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-lg shadow-purple-900/20 disabled:opacity-50"
                    >
                        {isAutoAssigning ? 'Dağıtılıyor...' : <><Wand2 size={16}/> Otomatik Dağıt</>}
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-900/50 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-700">
                            <tr>
                                <th className="p-4">Takım</th>
                                <th className="p-4">Kategori</th>
                                <th className="p-4">Atanan Jüriler</th>
                                <th className="p-4 text-right">İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {filteredApps.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-slate-500">Kayıt bulunamadı.</td>
                                </tr>
                            ) : (
                                filteredApps.map(app => {
                                    const assignedJuryNames = app.assignedJuryIds?.map(id => {
                                        const j = juries.find(u => u.uid === id);
                                        return j ? j.fullName : 'Bilinmeyen';
                                    }).join(', ');

                                    return (
                                        <tr key={app.id} className="hover:bg-slate-700/20 transition-colors">
                                            <td className="p-4 font-bold text-white">{app.team.name}</td>
                                            <td className="p-4 text-sm text-slate-400">{app.team.category}</td>
                                            <td className="p-4 text-sm text-slate-300">
                                                {assignedJuryNames && assignedJuryNames.length > 0 ? (
                                                    <span className="line-clamp-1">{assignedJuryNames}</span>
                                                ) : (
                                                    <span className="text-slate-600 italic">Henüz atanmadı</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-right">
                                                <button 
                                                    onClick={() => openEditModal(app)}
                                                    className="px-4 py-1.5 rounded-lg border border-slate-600 text-slate-300 text-xs font-bold hover:bg-slate-700 hover:text-white transition-all"
                                                >
                                                    Düzenle
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Modal */}
            {editingApp && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 w-full max-w-lg rounded-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold text-white">Jüri Atama</h3>
                                <p className="text-sm text-slate-400">{editingApp.team.name}</p>
                            </div>
                            <button onClick={() => setEditingApp(null)} className="text-slate-500 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto custom-scrollbar space-y-2">
                            {juries.length === 0 && <p className="text-slate-500 text-center">Sistemde kayıtlı jüri yok.</p>}
                            {juries.map(jury => (
                                <label key={jury.uid} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 cursor-pointer border border-transparent hover:border-slate-700 transition-all">
                                    <div className={`w-5 h-5 rounded flex items-center justify-center border ${selectedJuries.has(jury.uid) ? 'bg-purple-600 border-purple-600' : 'border-slate-600'}`}>
                                        {selectedJuries.has(jury.uid) && <Check size={14} className="text-white"/>}
                                    </div>
                                    <input 
                                        type="checkbox" 
                                        className="hidden" 
                                        checked={selectedJuries.has(jury.uid)} 
                                        onChange={() => toggleJurySelection(jury.uid)}
                                    />
                                    <div>
                                        <p className={`text-sm font-bold ${selectedJuries.has(jury.uid) ? 'text-white' : 'text-slate-400'}`}>{jury.fullName}</p>
                                        <p className="text-xs text-slate-500">{jury.email}</p>
                                    </div>
                                </label>
                            ))}
                        </div>

                        <div className="p-6 border-t border-slate-800 bg-slate-950 flex justify-end gap-3">
                            <button onClick={() => setEditingApp(null)} className="px-4 py-2 rounded-lg text-slate-400 hover:text-white text-sm font-bold">İptal</button>
                            <button onClick={saveManualAssignment} className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-lg">Kaydet</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const AdminUsers = () => {
    const { allUsers, updateUserRole, deleteUser, showToast } = useAppContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('ALL');
    const [processingId, setProcessingId] = useState<string | null>(null);

    const filteredUsers = allUsers.filter(u => {
        const matchesSearch = u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              u.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const handleRoleChange = async (uid: string, newRole: UserRole) => {
        setProcessingId(uid);
        try {
            await updateUserRole(uid, newRole);
            showToast(`Kullanıcı rolü güncellendi: ${newRole}`, 'success');
        } catch (error) {
            console.error(error);
            showToast('Rol güncellenemedi.', 'error');
        } finally {
            setProcessingId(null);
        }
    };

    const handleDeleteUser = async (uid: string) => {
        if (!window.confirm("Bu kullanıcıyı tamamen silmek istediğinize emin misiniz? Bu işlem geri alınamaz.")) return;
        setProcessingId(uid);
        try {
            await deleteUser(uid);
        } catch (error) {
            console.error(error);
            showToast('Kullanıcı silinemedi.', 'error');
        } finally {
            setProcessingId(null);
        }
    };

    const getRoleBadge = (role: UserRole) => {
        switch (role) {
            case UserRole.ADMIN: return <span className="bg-rose-900/30 text-rose-400 border border-rose-500/30 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">ADMIN</span>;
            case UserRole.JUDGE: return <span className="bg-amber-900/30 text-amber-400 border border-amber-500/30 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">JUDGE</span>;
            case UserRole.TEACHER: return <span className="bg-blue-900/30 text-blue-400 border border-blue-500/30 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">TEACHER</span>;
            case UserRole.PENDING_TEACHER: return <span className="bg-slate-800 text-slate-400 border border-slate-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">ONAY BEKLİYOR</span>;
            default: return <span className="bg-slate-800 text-slate-500 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">{role}</span>;
        }
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2 text-white font-bold">
                    <UserCog size={20} className="text-slate-400"/>
                    Kullanıcı ve Rol Yönetimi
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <select 
                        value={roleFilter} 
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-300 outline-none focus:border-rose-500"
                    >
                        <option value="ALL">Tüm Roller</option>
                        <option value={UserRole.ADMIN}>Admin</option>
                        <option value={UserRole.JUDGE}>Jüri</option>
                        <option value={UserRole.TEACHER}>Öğretmen</option>
                        <option value={UserRole.STUDENT}>Öğrenci</option>
                        <option value={UserRole.PENDING_TEACHER}>Onay Bekleyen</option>
                    </select>

                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="İsim veya E-posta ara..." 
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:border-rose-500 outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-900/50 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-700">
                            <tr>
                                <th className="p-4">KULLANICI</th>
                                <th className="p-4">OKUL / ŞEHİR</th>
                                <th className="p-4">MEVCUT ROL</th>
                                <th className="p-4 text-right">ROL İŞLEMLERİ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-slate-500">Kullanıcı bulunamadı.</td>
                                </tr>
                            ) : (
                                filteredUsers.map(user => (
                                    <tr key={user.uid} className="hover:bg-slate-700/20 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-sm border border-slate-600">
                                                    {user.fullName.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white text-sm">{user.fullName}</div>
                                                    <div className="text-xs text-slate-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm text-slate-300">{user.school || '-'}</div>
                                            <div className="text-xs text-slate-500">{user.city || '-'}</div>
                                        </td>
                                        <td className="p-4">
                                            {getRoleBadge(user.role)}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {user.role !== UserRole.TEACHER && (
                                                    <button 
                                                        onClick={() => handleRoleChange(user.uid, UserRole.TEACHER)}
                                                        disabled={processingId === user.uid}
                                                        className="px-3 py-1.5 rounded-lg border border-slate-600 text-slate-400 text-[10px] font-bold hover:bg-slate-700 hover:text-white transition-all disabled:opacity-50"
                                                    >
                                                        Öğretmen Yap
                                                    </button>
                                                )}
                                                {user.role !== UserRole.JUDGE && (
                                                    <button 
                                                        onClick={() => handleRoleChange(user.uid, UserRole.JUDGE)}
                                                        disabled={processingId === user.uid}
                                                        className="px-3 py-1.5 rounded-lg border border-amber-900/50 text-amber-500 text-[10px] font-bold hover:bg-amber-900/20 transition-all disabled:opacity-50"
                                                    >
                                                        Jüri Yap
                                                    </button>
                                                )}
                                                {user.role !== UserRole.ADMIN && (
                                                    <button 
                                                        onClick={() => handleDeleteUser(user.uid)}
                                                        disabled={processingId === user.uid}
                                                        className="px-3 py-1.5 rounded-lg border border-red-900/50 text-red-500 text-[10px] font-bold hover:bg-red-900/20 transition-all disabled:opacity-50"
                                                    >
                                                        Sil
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const AdminInbox = () => {
    const { contactMessages, markContactMessageAsRead, replyToContactMessage, deleteContactMessage } = useAppContext();
    const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');

    const filtered = contactMessages.filter(m => filter === 'ALL' || (filter === 'UNREAD' && m.status === 'UNREAD'));

    const handleReply = async (msgId: string) => {
        if (!replyText.trim()) return;
        await replyToContactMessage(msgId, replyText);
        setReplyingTo(null);
        setReplyText('');
    };

    const handleDelete = async (msgId: string) => {
        if (!window.confirm("Bu mesajı silmek istediğinize emin misiniz?")) return;
        await deleteContactMessage(msgId);
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex gap-4 border-b border-slate-700 pb-4">
                <button onClick={() => setFilter('ALL')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${filter === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}>Tümü</button>
                <button onClick={() => setFilter('UNREAD')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${filter === 'UNREAD' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}>Okunmamış</button>
            </div>
            
            <div className="grid gap-4">
                {filtered.length === 0 && <p className="text-slate-500 text-center py-8">Mesaj yok.</p>}
                {filtered.map(msg => (
                    <div key={msg.id} className={`bg-slate-800 p-6 rounded-xl border transition-all ${msg.status === 'UNREAD' ? 'border-rose-500/50 shadow-lg shadow-rose-900/10' : 'border-slate-700 opacity-75'}`}>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h4 className="font-bold text-white text-lg flex items-center gap-2">
                                    {msg.title}
                                    {msg.source === 'DASHBOARD_CHAT' && <span className="text-[10px] bg-blue-900/30 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30">PANEL</span>}
                                    {msg.status === 'REPLIED' && <span className="text-[10px] bg-green-900/30 text-green-400 px-2 py-0.5 rounded border border-green-500/30">CEVAPLANDI</span>}
                                </h4>
                                <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                                    <span className="text-slate-300 font-bold">{msg.name}</span> &bull; {msg.email} &bull; {new Date(msg.createdAt).toLocaleString('tr-TR')}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {msg.status === 'UNREAD' && (
                                    <button onClick={() => markContactMessageAsRead(msg.id)} className="text-xs bg-slate-700 text-slate-300 px-3 py-1.5 rounded hover:bg-slate-600 transition-colors flex items-center gap-1">
                                        <MailOpen size={12} /> Okundu
                                    </button>
                                )}
                                {msg.source === 'DASHBOARD_CHAT' && (
                                    <button onClick={() => { setReplyingTo(replyingTo === msg.id ? null : msg.id); setReplyText(''); }} className="text-xs bg-rose-600 text-white px-3 py-1.5 rounded hover:bg-rose-500 transition-colors flex items-center gap-1 font-bold">
                                        <Send size={12} /> Cevapla
                                    </button>
                                )}
                                {msg.source !== 'DASHBOARD_CHAT' && (
                                    <a href={`mailto:${msg.email}?subject=Re: ${msg.title}`} className="text-xs bg-slate-700 text-slate-300 px-3 py-1.5 rounded hover:bg-slate-600 transition-colors flex items-center gap-1">
                                        <Mail size={12} /> E-posta At
                                    </a>
                                )}
                                <button onClick={() => handleDelete(msg.id)} className="text-xs bg-red-900/30 text-red-400 border border-red-900/50 px-3 py-1.5 rounded hover:bg-red-900/50 transition-colors flex items-center gap-1 font-bold">
                                    <Trash2 size={12} /> Sil
                                </button>
                            </div>
                        </div>
                        <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap mb-4">{msg.message}</p>
                        
                        {/* Reply Area */}
                        {replyingTo === msg.id && (
                            <div className="mt-4 pt-4 border-t border-slate-700 bg-slate-900/50 p-4 rounded-xl">
                                <label className="text-xs font-bold text-slate-400 mb-2 block">Cevabınız (Panele iletilir)</label>
                                <textarea 
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm focus:border-rose-500 outline-none min-h-[100px]"
                                    placeholder="Mesajınızı yazın..."
                                />
                                <div className="flex justify-end gap-2 mt-3">
                                    <button onClick={() => setReplyingTo(null)} className="text-xs text-slate-400 hover:text-white px-3 py-2">İptal</button>
                                    <button onClick={() => handleReply(msg.id)} className="bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2">
                                        <Send size={14}/> Gönder
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

const AdminAnnouncements = () => {
    const { sendAnnouncement } = useAppContext();
    const [form, setForm] = useState({ title: '', message: '', target: 'ALL' as NotificationTarget, type: 'info' });
    const [isSending, setIsSending] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSending(true);
        // Assuming sendAnnouncement handles the backend logic (Firestore add)
        await sendAnnouncement(form.target, form.title, form.message, form.type);
        setForm({ title: '', message: '', target: 'ALL', type: 'info' });
        setIsSending(false);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn">
            <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-xl">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                    <Megaphone size={24} className="text-rose-500"/> Duyuru Gönder
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Başlık</label>
                        <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-rose-500 outline-none" placeholder="Duyuru Başlığı"/>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Hedef Kitle</label>
                            <select value={form.target} onChange={e => setForm({...form, target: e.target.value as NotificationTarget})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-rose-500 outline-none">
                                <option value="ALL">Herkese</option>
                                <option value="TEACHERS">Öğretmenlere</option>
                                <option value="JUDGES">Jürilere</option>
                                <option value="FINALISTS">Finalistlere</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Tür</label>
                            <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-rose-500 outline-none">
                                <option value="info">Bilgi (Mavi)</option>
                                <option value="success">Başarı (Yeşil)</option>
                                <option value="warning">Uyarı (Sarı)</option>
                                <option value="error">Kritik (Kırmızı)</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Mesaj İçeriği</label>
                        <textarea required value={form.message} onChange={e => setForm({...form, message: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-rose-500 outline-none h-32" placeholder="Duyuru metni..."/>
                    </div>

                    <button type="submit" disabled={isSending} className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                        {isSending ? 'Gönderiliyor...' : <><Send size={20}/> Duyuruyu Yayınla</>}
                    </button>
                </form>
            </div>
        </div>
    );
};

export const Admin: React.FC = () => {
  const { allApplications, updateApplication, logAction, systemSettings, updateSystemSettings, auditLogs, logout, fetchJuryScores, loading, showToast, downloadFullBackup, seedAcademyContent } = useAppContext();
  const [activeTab, setActiveTab] = useState('DASHBOARD');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [appScores, setAppScores] = useState<ScoreDocument[]>([]);
  const [youtubeLinkInput, setYoutubeLinkInput] = useState('');
  const [globalCategoryFilter, setGlobalCategoryFilter] = useState<string | null>(null);
  const [rejectingDoc, setRejectingDoc] = useState<{ studentId: string, type: 'PARENT' | 'KVKK' } | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');

  const handleFilterCategory = (cat: string | null) => {
      setGlobalCategoryFilter(cat);
      setActiveTab('TEAMS');
  };

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

  const handleDocStatus = async (studentId: string, type: 'PARENT' | 'KVKK', status: 'APPROVED' | 'REJECTED', reason?: string) => {
      if (!selectedApp) return;

      const updatedStudents = selectedApp.team.students.map(s => {
          if (s.id === studentId) {
              return { 
                  ...s, 
                  docStatus: status, 
                  rejectionReason: status === 'REJECTED' ? reason : undefined 
              };
          }
          return s;
      });

      const updatedApp = {
          ...selectedApp,
          team: { ...selectedApp.team, students: updatedStudents }
      };

      try {
          await updateApplication(updatedApp);
          setSelectedApp(updatedApp);
          setRejectingDoc(null);
          setRejectionReasonInput('');
          showToast(`Belge ${status === 'APPROVED' ? 'onaylandı' : 'reddedildi'}.`, 'success');
          await logAction("DOC_REVIEW", `${selectedApp.team.name} - Öğrenci belgesi ${status === 'APPROVED' ? 'ONAYLANDI' : 'REDDEDİLDİ'}`, selectedApp.id);
      } catch (error) {
          showToast('İşlem başarısız.', 'error');
      }
  };

  const handleViewDoc = async (key: string) => {
      try {
          const res = await fetch(`/api/view?key=${encodeURIComponent(key)}`);
          const data = await res.json();
          if (data.signedUrl) {
              window.open(data.signedUrl, '_blank');
          } else {
              showToast('Belge linki alınamadı.', 'error');
          }
      } catch (error) {
          showToast('Hata oluştu.', 'error');
      }
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
                      {activeTab === 'INBOX' && 'Gelen Kutusu'}
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
                    {activeTab === 'DASHBOARD' && <AdminDashboard apps={allApplications} onFilterCategory={handleFilterCategory} />}
                    {activeTab === 'ANNOUNCEMENTS' && <AdminAnnouncements />}
                    {activeTab === 'INBOX' && <AdminInbox />}
                    {activeTab === 'TEAMS' && <AdminTeams apps={allApplications} onSelectApp={setSelectedApp} onToggleFinalist={toggleFinalist} initialCategoryFilter={globalCategoryFilter} />}
                    {activeTab === 'JURY_ASSIGN' && <AdminJuryAssign apps={allApplications} />}
                    {activeTab === 'USERS' && <AdminUsers />}
                    {activeTab === 'CONTENT' && <AdminCMS />}
                    {activeTab === 'SETTINGS' && (
                        <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-10">
                             
                             <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 flex justify-between items-center">
                                 <div>
                                     <h3 className="font-bold text-white text-lg">Yapılandırma Merkezi</h3>
                                     <p className="text-slate-400 text-xs mt-1">Yarışma kurallarını, tarihleri ve sistem kilitlerini buradan yönetebilirsiniz.</p>
                                 </div>
                                 <button onClick={handleSettingsUpdate} className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2 transform hover:-translate-y-1">
                                     <Save size={20} /> Ayarları Kaydet
                                 </button>
                             </div>

                             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                 
                                 {/* Dates Column */}
                                 <div className="space-y-6">
                                     
                                     {/* Registration Dates */}
                                     <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                                         <h4 className="font-bold text-white mb-6 pb-2 border-b border-slate-700 flex items-center gap-2 text-sm uppercase tracking-wider">
                                             <Users size={18} className="text-blue-500"/> Başvuru Süreci
                                         </h4>
                                         <div className="grid grid-cols-2 gap-4">
                                             <DateInput label="Başvuru Başlangıç" value={systemSettings.dates.applicationStart} onChange={(val) => updateSystemSettings({...systemSettings, dates: {...systemSettings.dates, applicationStart: val}})} />
                                             <DateInput label="Başvuru Bitiş" value={systemSettings.dates.applicationEnd} onChange={(val) => updateSystemSettings({...systemSettings, dates: {...systemSettings.dates, applicationEnd: val}})} />
                                         </div>
                                     </div>

                                     {/* Video Upload Dates */}
                                     <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                                         <h4 className="font-bold text-white mb-6 pb-2 border-b border-slate-700 flex items-center gap-2 text-sm uppercase tracking-wider">
                                             <Upload size={18} className="text-purple-500"/> Eser Yükleme (Eş Zamanlı)
                                         </h4>
                                         <div className="grid grid-cols-2 gap-4">
                                             <DateInput label="Yükleme Başlangıç" value={systemSettings.dates.videoUploadStart} onChange={(val) => updateSystemSettings({...systemSettings, dates: {...systemSettings.dates, videoUploadStart: val}})} />
                                             <DateInput label="Yükleme Bitiş" value={systemSettings.dates.videoUploadEnd} onChange={(val) => updateSystemSettings({...systemSettings, dates: {...systemSettings.dates, videoUploadEnd: val}})} />
                                         </div>
                                     </div>

                                     {/* Finals & Gala */}
                                     <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                                         <h4 className="font-bold text-white mb-6 pb-2 border-b border-slate-700 flex items-center gap-2 text-sm uppercase tracking-wider">
                                             <Star size={18} className="text-amber-500"/> Final & Etkinlik
                                         </h4>
                                         <div className="space-y-4">
                                             <div className="grid grid-cols-2 gap-4">
                                                 <DateInput label="Finalistleri Açıkla" value={systemSettings.dates.finalistRevealStart || ''} onChange={(val) => updateSystemSettings({...systemSettings, dates: {...systemSettings.dates, finalistRevealStart: val}})} />
                                                 <DateInput label="Akademi Başlangıç" value={systemSettings.dates.academyStart} onChange={(val) => updateSystemSettings({...systemSettings, dates: {...systemSettings.dates, academyStart: val}})} />
                                             </div>
                                             <div className="grid grid-cols-2 gap-4">
                                                 <DateInput label="Oylama Başlangıç" value={systemSettings.dates.publicVoteStart || ''} onChange={(val) => updateSystemSettings({...systemSettings, dates: {...systemSettings.dates, publicVoteStart: val}})} />
                                                 <DateInput label="Oylama Bitiş" value={systemSettings.dates.publicVoteEnd || ''} onChange={(val) => updateSystemSettings({...systemSettings, dates: {...systemSettings.dates, publicVoteEnd: val}})} />
                                             </div>
                                             <div className="grid grid-cols-1">
                                                 <DateInput label="Gala Tarihi" value={systemSettings.dates.galaDate} onChange={(val) => updateSystemSettings({...systemSettings, dates: {...systemSettings.dates, galaDate: val}})} />
                                             </div>
                                         </div>
                                     </div>

                                 </div>

                                 {/* Controls Column */}
                                 <div className="space-y-6">
                                     
                                     {/* Security & Backup */}
                                     <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                                         <h4 className="font-bold text-white mb-6 pb-2 border-b border-slate-700 flex items-center gap-2 text-sm uppercase tracking-wider">
                                             <Database size={18} className="text-amber-500"/> Veri & Güvenlik
                                         </h4>
                                         <div className="space-y-4">
                                             <div className="flex items-center justify-between">
                                                 <div>
                                                     <p className="text-sm font-bold text-slate-300">Veri Yedekleme</p>
                                                     <p className="text-[10px] text-slate-500">Tüm veritabanını JSON formatında indir.</p>
                                                 </div>
                                                 <button 
                                                    onClick={downloadFullBackup}
                                                    className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors border border-slate-600"
                                                 >
                                                     <Download size={14}/> Yedek İndir
                                                 </button>
                                             </div>

                                             <div className="border-t border-slate-700 my-2"></div>

                                             <div className="flex items-center justify-between">
                                                 <div>
                                                     <p className="text-sm font-bold text-slate-300">İçerik Başlatma</p>
                                                     <p className="text-[10px] text-slate-500">Varsayılan akademi içeriklerini yükler.</p>
                                                 </div>
                                                 <button 
                                                    onClick={seedAcademyContent}
                                                    className="bg-slate-700 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors border border-slate-600"
                                                 >
                                                     <Plus size={14}/> İçerik Yükle
                                                 </button>
                                             </div>

                                             <div className="border-t border-slate-700 my-4"></div>

                                             <ToggleSwitch 
                                                label="Bakım Modu (Maintenance)" 
                                                checked={systemSettings.features.maintenanceMode} 
                                                onChange={() => updateSystemSettings({...systemSettings, features: {...systemSettings.features, maintenanceMode: !systemSettings.features.maintenanceMode}})} 
                                                activeColor="bg-red-500"
                                             />
                                             <div className="bg-red-900/20 p-3 rounded-lg border border-red-900/50 text-xs text-red-300 mt-2 flex gap-2">
                                                 <AlertTriangle size={16} className="flex-shrink-0"/>
                                                 <strong>Dikkat:</strong> Bakım modu açıldığında, Admin dışındaki tüm kullanıcılar "Bakımdayız" sayfasına yönlendirilir ve sisteme erişemezler.
                                             </div>
                                         </div>
                                     </div>

                                     <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 h-full">
                                         <h4 className="font-bold text-white mb-6 pb-2 border-b border-slate-700 flex items-center gap-2 text-sm uppercase tracking-wider">
                                             <Power size={18} className="text-rose-500"/> Diğer Kontroller
                                         </h4>
                                         <div className="space-y-4">
                                             <ToggleSwitch 
                                                label="Yeni Kayıtları Kabul Et" 
                                                checked={systemSettings.features.allowNewRegistrations} 
                                                onChange={() => updateSystemSettings({...systemSettings, features: {...systemSettings.features, allowNewRegistrations: !systemSettings.features.allowNewRegistrations}})} 
                                                activeColor="bg-blue-500"
                                             />
                                             
                                             <ToggleSwitch 
                                                label="Video Yüklemeyi Aktif Et" 
                                                checked={systemSettings.features.videoUploadActive} 
                                                onChange={() => updateSystemSettings({...systemSettings, features: {...systemSettings.features, videoUploadActive: !systemSettings.features.videoUploadActive}})} 
                                                activeColor="bg-purple-500"
                                             />
                                             <p className="text-[10px] text-slate-500 px-2 -mt-2 mb-4">
                                                 * Bu seçenek kapalıysa, tarih aralığı uygun olsa bile öğrenciler video yükleyemez. Açık ise tarih aralığı kontrol edilir.
                                             </p>

                                             <ToggleSwitch 
                                                label="Halk Oylamasını Aktif Et" 
                                                checked={!!systemSettings.features.publicVotingActive} 
                                                onChange={() => updateSystemSettings({...systemSettings, features: {...systemSettings.features, publicVotingActive: !systemSettings.features.publicVotingActive}})} 
                                                activeColor="bg-amber-500"
                                             />

                                             <ToggleSwitch 
                                                label="Jüri Değerlendirme Sistemi" 
                                                checked={systemSettings.features.judgeSystemActive} 
                                                onChange={() => updateSystemSettings({...systemSettings, features: {...systemSettings.features, judgeSystemActive: !systemSettings.features.judgeSystemActive}})} 
                                                activeColor="bg-green-500"
                                             />

                                             <div className="pt-4 mt-4 border-t border-slate-700">
                                                 <ToggleSwitch 
                                                    label="Sonuçları Herkese İlan Et" 
                                                    checked={systemSettings.features.publicResultReveal} 
                                                    onChange={() => updateSystemSettings({...systemSettings, features: {...systemSettings.features, publicResultReveal: !systemSettings.features.publicResultReveal}})} 
                                                    activeColor="bg-rose-500"
                                                 />
                                                 <div className="bg-rose-900/20 p-3 rounded-lg border border-rose-900/50 text-xs text-rose-300 mt-3 flex gap-2">
                                                     <AlertTriangle size={16} className="flex-shrink-0"/>
                                                     <strong>Dikkat:</strong> Bu seçenek açıldığında, kazananlar ana sayfada herkese açık olarak listelenir. Genellikle Gala gecesi sonrası açılmalıdır.
                                                 </div>
                                             </div>
                                         </div>
                                     </div>
                                 </div>

                             </div>
                        </div>
                    )}
                    {activeTab === 'LOGS' && (
                        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden animate-fadeIn">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left min-w-[600px]">
                                    <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase"><tr><th className="p-4">Zaman</th><th className="p-4">İşlem</th><th className="p-4">Detay</th><th className="p-4">Yapan</th></tr></thead>
                                    <tbody className="divide-y divide-slate-700">
                                        {auditLogs.map(log => (
                                            <tr key={log.id} className="hover:bg-slate-700/20">
                                                <td className="p-4 text-xs text-slate-500 font-mono whitespace-nowrap">{new Date(log.timestamp).toLocaleString('tr-TR')}</td>
                                                <td className="p-4">
                                                    <span className="bg-slate-900 text-white text-xs px-2 py-1 rounded border border-slate-700 font-bold whitespace-nowrap">{log.action}</span>
                                                </td>
                                                <td className="p-4 text-sm text-slate-300 min-w-[200px]">
                                                    {log.details}
                                                    {log.metadata && (
                                                        <div className="mt-1 text-[10px] text-slate-500 font-mono bg-slate-900/50 p-1 rounded">
                                                            {JSON.stringify(log.metadata)}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="p-4 text-xs text-slate-400 whitespace-nowrap">
                                                    <div className="font-bold text-slate-200">{log.performedBy}</div>
                                                    <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-1">
                                                        <Globe size={10} className="text-slate-600" /> {log.ip || 'N/A'}
                                                        <span className="opacity-30">|</span>
                                                        <span className="truncate max-w-[120px]" title={log.userAgent}>{log.userAgent?.split(') ')[1] || log.userAgent?.split(' ')[0] || 'N/A'}</span>
                                                    </div>
                                                </td>
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
                  <div className="mb-8 bg-slate-950 p-6 rounded-xl border border-slate-800">
                      <h3 className="text-sm font-bold text-white uppercase mb-4 flex items-center gap-2"><Users size={16} className="text-rose-500"/> Öğrenci Belgeleri</h3>
                      <div className="space-y-6">
                          {selectedApp.team.students.map((student) => (
                              <div key={student.id} className="border-b border-slate-800 pb-6 last:border-0 last:pb-0">
                                  <div className="flex justify-between items-start mb-4">
                                      <div>
                                          <h4 className="font-bold text-white">{student.firstName} {student.lastName}</h4>
                                          <p className="text-xs text-slate-500">{student.grade}. Sınıf</p>
                                      </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      {/* Parental Consent */}
                                      <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                                          <div className="flex justify-between items-center mb-2">
                                              <span className="text-[10px] font-bold text-slate-400 uppercase">Veli İzin Belgesi</span>
                                              {student.docStatus === 'APPROVED' && <CheckCircle2 size={14} className="text-green-500" />}
                                              {student.docStatus === 'REJECTED' && <AlertOctagon size={14} className="text-red-500" />}
                                          </div>
                                          {student.parentalConsentUrl ? (
                                              <div className="space-y-2">
                                                  <button 
                                                      onClick={() => handleViewDoc(student.parentalConsentUrl!)}
                                                      className="w-full text-left px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded text-xs text-slate-300 flex items-center gap-2 transition-colors"
                                                  >
                                                      <FileText size={14} /> Belgeyi Görüntüle
                                                  </button>
                                                  <div className="flex gap-2">
                                                      <button 
                                                          onClick={() => handleDocStatus(student.id, 'PARENT', 'APPROVED')}
                                                          className="flex-1 bg-green-900/20 hover:bg-green-900/40 text-green-400 py-1.5 rounded text-[10px] font-bold border border-green-900/50 transition-all"
                                                      >
                                                          Onayla
                                                      </button>
                                                      <button 
                                                          onClick={() => setRejectingDoc({ studentId: student.id, type: 'PARENT' })}
                                                          className="flex-1 bg-red-900/20 hover:bg-red-900/40 text-red-400 py-1.5 rounded text-[10px] font-bold border border-red-900/50 transition-all"
                                                      >
                                                          Reddet
                                                      </button>
                                                  </div>
                                              </div>
                                          ) : (
                                              <span className="text-[10px] text-slate-600 italic">Yüklenmedi</span>
                                          )}
                                      </div>

                                      {/* KVKK Consent */}
                                      <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                                          <div className="flex justify-between items-center mb-2">
                                              <span className="text-[10px] font-bold text-slate-400 uppercase">KVKK Belgesi</span>
                                              {student.docStatus === 'APPROVED' && <CheckCircle2 size={14} className="text-green-500" />}
                                              {student.docStatus === 'REJECTED' && <AlertOctagon size={14} className="text-red-500" />}
                                          </div>
                                          {student.kvkkConsentUrl ? (
                                              <div className="space-y-2">
                                                  <button 
                                                      onClick={() => handleViewDoc(student.kvkkConsentUrl!)}
                                                      className="w-full text-left px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded text-xs text-slate-300 flex items-center gap-2 transition-colors"
                                                  >
                                                      <FileText size={14} /> Belgeyi Görüntüle
                                                  </button>
                                                  <div className="flex gap-2">
                                                      <button 
                                                          onClick={() => handleDocStatus(student.id, 'KVKK', 'APPROVED')}
                                                          className="flex-1 bg-green-900/20 hover:bg-green-900/40 text-green-400 py-1.5 rounded text-[10px] font-bold border border-green-900/50 transition-all"
                                                      >
                                                          Onayla
                                                      </button>
                                                      <button 
                                                          onClick={() => setRejectingDoc({ studentId: student.id, type: 'KVKK' })}
                                                          className="flex-1 bg-red-900/20 hover:bg-red-900/40 text-red-400 py-1.5 rounded text-[10px] font-bold border border-red-900/50 transition-all"
                                                      >
                                                          Reddet
                                                      </button>
                                                  </div>
                                              </div>
                                          ) : (
                                              <span className="text-[10px] text-slate-600 italic">Yüklenmedi</span>
                                          )}
                                      </div>
                                  </div>

                                  {/* Rejection Reason Input */}
                                  {rejectingDoc?.studentId === student.id && (
                                      <div className="mt-4 p-4 bg-red-900/10 border border-red-900/30 rounded-xl animate-fadeIn">
                                          <label className="text-[10px] font-bold text-red-400 uppercase mb-2 block">Red Nedeni ({rejectingDoc.type === 'PARENT' ? 'Veli İzin' : 'KVKK'})</label>
                                          <textarea 
                                              value={rejectionReasonInput}
                                              onChange={(e) => setRejectionReasonInput(e.target.value)}
                                              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white text-xs focus:border-red-500 outline-none min-h-[80px]"
                                              placeholder="Lütfen red nedenini açıklayın..."
                                          />
                                          <div className="flex justify-end gap-2 mt-3">
                                              <button onClick={() => setRejectingDoc(null)} className="text-[10px] text-slate-400 hover:text-white px-3 py-2">İptal</button>
                                              <button 
                                                  onClick={() => handleDocStatus(student.id, rejectingDoc.type, 'REJECTED', rejectionReasonInput)}
                                                  className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-[10px] font-bold"
                                              >
                                                  Reddet ve Bildir
                                              </button>
                                          </div>
                                      </div>
                                  )}

                                  {student.docStatus === 'REJECTED' && student.rejectionReason && !rejectingDoc && (
                                      <div className="mt-3 p-3 bg-red-900/5 border border-red-900/20 rounded-lg">
                                          <p className="text-[10px] text-red-400 italic"><strong>Red Nedeni:</strong> {student.rejectionReason}</p>
                                      </div>
                                  )}
                              </div>
                          ))}
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
