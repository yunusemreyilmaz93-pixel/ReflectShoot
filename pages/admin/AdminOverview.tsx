
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Search, Check, X, Eye, Award, FileText, Shield, Inbox, Download, 
    Users, Film, School, Mail, AlertTriangle, Send, Clapperboard, Video, 
    Cpu, Activity, PieChart, BarChart3, Clock, UserCheck, Star, Plus, Lock, 
    Menu, LayoutDashboard, Settings, LogOut, FileDown, Trash2, MapPin, List, RefreshCw, ChevronRight, UserCog, MessageSquare, ExternalLink, Link as LinkIcon, Save, Youtube, PenTool, LayoutTemplate, HelpCircle, Bell, Image as ImageIcon, Megaphone, BookOpen, Calendar, Trophy, CheckCircle2, AlertOctagon, Info, ToggleRight, ToggleLeft, Power, Globe, Upload, LayoutGrid, Filter, TrendingUp, Wand2, Square, CheckSquare, MailOpen, Database, Construction, ChevronDown, Copy, AlertCircle
} from 'lucide-react';
import { ApplicationStatus, Category, Theme, Application, UserRole, LogEntry, SystemSettings, ScoreDocument, CMSGeneral, CMSFaqItem, FAQCategory, NotificationTarget, CMSGalleryItem, CMSAcademyItem, CMSTimelineItem, CMSPrize, CMSLinks, ContactMessage } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { ChatArea } from '../../components/ChatArea';
import { getYouTubeEmbedUrl } from '../../lib/videoUtils';
import { AdminCMS } from '../../components/admin/AdminCMS';
import { TurkeyMap } from '../../components/TurkeyMap';
import { AdminJuryStatus } from '../../components/admin/AdminJuryStatus';
import { AdminAwards } from '../../components/admin/AdminAwards';
import { AcademicJuryScorePanel } from '../../components/AcademicJuryScorePanel';
import { AdminCertificates } from '../../components/admin/AdminCertificates';
import { writeBatch, doc, collection } from 'firebase/firestore'; // Import needed for direct batch writing
import { db } from '../../lib/firebase'; // Import db
import { authenticatedFetch } from '../../lib/authenticatedFetch';

// Removed CSV Export function since we use xlsx and jspdf now

import { SimpleTrendChart, SimpleDonutChart } from './AdminCharts';
export const AnalyticsSection = ({ apps, onFilterCategory }: { apps: Application[], onFilterCategory: (cat: string | null) => void }) => {
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
                        <button type="button" 
                            onClick={() => { setSelectedCategoryFilter(null); onFilterCategory(null); }}
                            className="w-full mt-2 py-1 text-[10px] text-rose-400 hover:text-rose-300 font-bold uppercase tracking-widest"
                        >
                            Filtreyi Temizle
                        </button>
                    )}
                </div>
            </div>
            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl flex flex-col h-[320px]">
                <h3 className="font-bold text-white flex items-center gap-2 text-sm mb-6">
                    <MapPin size={16} className="text-amber-500"/> Şehir Bazlı Katılım
                </h3>
                <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    {cityData.length > 0 ? cityData.map((city, i) => (
                        <div key={i} className="mb-4 last:mb-0">
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

export const Skeleton = ({ className }: { className?: string }) => (
    <div className={`animate-pulse bg-slate-700/50 rounded-lg ${className}`}></div>
);

export const AdminDashboard = ({ apps, onFilterCategory }: { apps: Application[], onFilterCategory: (cat: string | null) => void }) => {
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
                    <button type="button" 
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

