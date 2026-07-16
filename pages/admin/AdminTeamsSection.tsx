
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
import { countMissingDocs } from '../../lib/adminExport';

// Removed CSV Export function since we use xlsx and jspdf now

export const AdminTeams = ({ apps, onSelectApp, onToggleFinalist, initialCategoryFilter }: { apps: Application[], onSelectApp: (app: Application) => void, onToggleFinalist: (app: Application) => void, initialCategoryFilter?: string | null }) => {
    const { deleteApplication, updateApplicationStatus, showToast, setSimulatedApplicationId, systemSettings, setApplicationArchived } = useAppContext();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [categoryFilter, setCategoryFilter] = useState<string>(initialCategoryFilter || 'ALL');
    const [seasonFilter, setSeasonFilter] = useState<string>('current');
    const [showArchived, setShowArchived] = useState(false);
    /** Support ops default: focus teams with missing parent/KVKK docs */
    const [missingDocsOnly, setMissingDocsOnly] = useState(false);
    const [viewMode, setViewMode] = useState<'LIST' | 'MAP'>('LIST');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isBulkProcessing, setIsBulkProcessing] = useState(false);

    useEffect(() => {
        if (initialCategoryFilter) {
            setCategoryFilter(initialCategoryFilter);
        }
    }, [initialCategoryFilter]);

    const activeSeasonId = systemSettings.season?.id || '2026';

    // Filtering
    const filteredApps = apps.filter(app => {
        const matchesSearch = app.team.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              app.teacher.school.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
        const matchesCategory = categoryFilter === 'ALL' || app.team.category === categoryFilter;
        const matchesArchive = showArchived ? true : !app.archived;
        let matchesSeason = true;
        if (seasonFilter === 'current') {
          // Current season + untagged legacy apps
          matchesSeason = !app.seasonId || app.seasonId === activeSeasonId;
        } else if (seasonFilter === 'legacy') {
          matchesSeason = !app.seasonId;
        } else if (seasonFilter !== 'all') {
          matchesSeason = app.seasonId === seasonFilter;
        }
        const matchesMissingDocs = !missingDocsOnly || countMissingDocs(app) > 0;
        
        return matchesSearch && matchesStatus && matchesCategory && matchesArchive && matchesSeason && matchesMissingDocs;
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

    const handleBulkArchive = async (archived: boolean) => {
        if (selectedIds.size === 0) return;
        const label = archived ? 'arşivlemek' : 'arşivden çıkarmak';
        if (!window.confirm(`Seçili ${selectedIds.size} takımı ${label} istediğinize emin misiniz?`)) return;

        setIsBulkProcessing(true);
        try {
            await Promise.all(Array.from(selectedIds).map((id) => setApplicationArchived(id, archived)));
            showToast(`${selectedIds.size} takım ${archived ? 'arşivlendi' : 'arşivden çıkarıldı'}.`, 'success');
            setSelectedIds(new Set());
        } catch (error) {
            console.error(error);
            showToast('Toplu arşiv işlemi başarısız.', 'error');
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

    const cityStats = useMemo(() => {
        const counts: Record<string, number> = {};
        filteredApps.forEach(app => {
            const city = app.teacher.city;
            if(city) counts[city] = (counts[city] || 0) + 1;
        });
        return counts;
    }, [filteredApps]);

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

    const handleExportExcel = async () => {
        const { exportApplicationsExcel } = await import('../../lib/adminExport');
        exportApplicationsExcel(filteredApps, {
          filename: `takim_listesi_${new Date().toISOString().split('T')[0]}.xlsx`,
          sheetName: 'Takımlar',
        });
        showToast('Excel indirildi (eksik belge, video, jüri sütunları dahil).', 'success');
    };

    const handleExportPDF = async () => {
        const { default: jsPDF } = await import('jspdf');
        const { default: autoTable } = await import('jspdf-autotable');

        const doc = new jsPDF('landscape');
        
        try {
            const fetchFont = async (url: string) => {
                const response = await fetch(url);
                const buffer = await response.arrayBuffer();
                let binary = '';
                const bytes = new Uint8Array(buffer);
                for (let i = 0; i < bytes.byteLength; i++) {
                    binary += String.fromCharCode(bytes[i]);
                }
                return window.btoa(binary);
            };

            const [regFont, boldFont] = await Promise.all([
                fetchFont("https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Regular.ttf"),
                fetchFont("https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Medium.ttf")
            ]);

            doc.addFileToVFS('Roboto-Regular.ttf', regFont);
            doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
            
            doc.addFileToVFS('Roboto-Medium.ttf', boldFont);
            doc.addFont('Roboto-Medium.ttf', 'Roboto', 'bold');
            
            doc.setFont('Roboto', 'bold');
        } catch (e) {
            console.warn("Font yüklenemedi", e);
        }

        doc.text("Takım Listesi Raporu", 14, 15);

        const data = filteredApps.map(app => [
            app.team.name,
            app.teacher.school.substring(0, 30),
            app.team.category,
            app.status,
            (app.finalScore || 0).toString(),
            app.teacher.email,
            app.teacher.phone
        ]);

        autoTable(doc, {
            head: [['Takım', 'Okul', 'Kategori', 'Durum', 'Puan', 'E-Posta', 'Telefon']],
            body: data,
            startY: 20,
            styles: { font: 'Roboto', fontSize: 8 },
            headStyles: { font: 'Roboto', fontStyle: 'bold' }
        });

        doc.save(`takim_listesi_${new Date().toISOString().split('T')[0]}.pdf`);
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
                        aria-label="Kategori filtresi"
                    >
                        <option value="ALL">Tüm Kategoriler</option>
                        {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>

                    <select
                        value={seasonFilter}
                        onChange={(e) => setSeasonFilter(e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-300 outline-none focus:border-rose-500"
                        aria-label="Sezon filtresi"
                    >
                        <option value="current">Aktif sezon ({activeSeasonId})</option>
                        <option value="all">Tüm sezonlar</option>
                        <option value="legacy">Etiketsiz (legacy)</option>
                    </select>

                    <label className="flex items-center gap-2 text-xs text-slate-400 whitespace-nowrap cursor-pointer">
                        <input
                            type="checkbox"
                            checked={showArchived}
                            onChange={(e) => setShowArchived(e.target.checked)}
                            className="rounded border-slate-600"
                        />
                        Arşiv
                    </label>

                    <label
                      className={`flex items-center gap-2 text-xs whitespace-nowrap cursor-pointer px-2.5 py-1.5 rounded-lg border transition-colors ${
                        missingDocsOnly
                          ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                          : 'border-slate-700 text-slate-400 hover:border-slate-500'
                      }`}
                      title="Eksik veli izni veya KVKK olan takımlar"
                    >
                        <input
                            type="checkbox"
                            checked={missingDocsOnly}
                            onChange={(e) => setMissingDocsOnly(e.target.checked)}
                            className="rounded border-slate-600"
                        />
                        Eksik belge &gt; 0
                    </label>

                    <div className="h-8 w-px bg-slate-700 mx-1"></div>

                    <button type="button" 
                        onClick={() => setViewMode('LIST')}
                        className={`p-2.5 bg-slate-900 border rounded-lg transition-colors ${viewMode === 'LIST' ? 'text-amber-500 border-amber-500/50 bg-amber-500/5' : 'text-slate-400 border-slate-700 hover:text-white hover:border-slate-500'}`}
                        title="Liste Görünümü"
                    >
                        <List size={18} />
                    </button>
                    <button type="button" 
                        onClick={() => setViewMode('MAP')}
                        className={`p-2.5 bg-slate-900 border rounded-lg transition-colors ${viewMode === 'MAP' ? 'text-amber-500 border-amber-500/50 bg-amber-500/5' : 'text-slate-400 border-slate-700 hover:text-white hover:border-slate-500'}`}
                        title="Harita Görünümü"
                    >
                        <Globe size={18} />
                    </button>

                    <button type="button" onClick={handleExportPDF} className="flex items-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-bold transition-colors border border-slate-600">
                        <Download size={16}/> PDF Olarak İndir
                    </button>
                    <button type="button" onClick={handleExportExcel} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-bold transition-colors border border-emerald-600">
                        <Download size={16}/> Excel Olarak İndir
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
                        <button type="button" 
                            disabled={isBulkProcessing}
                            onClick={() => handleBulkStatusUpdate(ApplicationStatus.APPROVED)}
                            className="px-4 py-2 bg-white text-rose-600 rounded-lg text-xs font-bold hover:bg-rose-50 transition-colors disabled:opacity-50"
                        >
                            Hepsini Onayla
                        </button>
                        <button type="button" 
                            disabled={isBulkProcessing}
                            onClick={() => handleBulkStatusUpdate(ApplicationStatus.REJECTED)}
                            className="px-4 py-2 bg-rose-800 text-white rounded-lg text-xs font-bold hover:bg-rose-900 transition-colors disabled:opacity-50"
                        >
                            Hepsini Reddet
                        </button>
                        <button type="button"
                            disabled={isBulkProcessing}
                            onClick={() => handleBulkArchive(true)}
                            className="px-4 py-2 bg-slate-900/40 text-white rounded-lg text-xs font-bold hover:bg-slate-900/60 transition-colors disabled:opacity-50"
                        >
                            Arşivle
                        </button>
                        <button type="button"
                            disabled={isBulkProcessing}
                            onClick={() => handleBulkArchive(false)}
                            className="px-4 py-2 bg-slate-900/40 text-white rounded-lg text-xs font-bold hover:bg-slate-900/60 transition-colors disabled:opacity-50"
                        >
                            Arşivden Çıkar
                        </button>
                        <div className="w-px h-8 bg-white/20 mx-1"></div>
                        <button type="button" 
                            disabled={isBulkProcessing}
                            onClick={handleBulkDelete}
                            className="p-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50"
                            title="Seçilenleri Sil" aria-label="Sil">
                            <Trash2 size={18} />
                        </button>
                        <button type="button" 
                            onClick={() => setSelectedIds(new Set())}
                            className="p-2 text-white/60 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
            )}

            {/* Content Area */}
            {viewMode === 'MAP' ? (
                <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 animate-fadeIn">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-white font-bold text-lg">Başvuru Yoğunluk Haritası</h3>
                            <p className="text-xs text-slate-500">Uygulanan filtrelere göre şehir bazlı başvuru dağılımı.</p>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] text-slate-500 uppercase font-black block">Toplam Şehir</span>
                            <span className="text-2xl font-black text-amber-500">
                                {Object.keys(cityStats).length}
                            </span>
                        </div>
                    </div>
                    
                    <div className="h-[500px]">
                        <TurkeyMap 
                            data={cityStats} 
                            onCityClick={(city) => {
                                setSearchTerm(city);
                                setViewMode('LIST');
                            }}
                        />
                    </div>
                    
                    <div className="mt-6 flex flex-wrap gap-2">
                        {Object.entries(cityStats)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 5)
                        .map(([city, count]) => (
                            <div key={city} className="px-3 py-1 bg-slate-900 border border-slate-700 rounded-full text-[10px] font-bold text-slate-400">
                                <span className="text-amber-500 mr-2">{count}</span> {city}
                            </div>
                        ))}
                        <span className="text-[10px] text-slate-600 mt-1 ml-2">...ve diğer şehirler</span>
                    </div>
                </div>
            ) : (
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
                                    <td colSpan={8} className="p-12 text-center">
                                        <p className="text-slate-300 font-bold mb-1">Eşleşen takım yok</p>
                                        <p className="text-slate-500 text-sm max-w-md mx-auto">
                                            Arama / sezon / durum filtrelerini gevşetin veya &quot;Tüm sezonlar&quot; seçin.
                                            Yeni başvuru kapalıysa Sistem Ayarları&apos;ndan kilitleri kontrol edin.
                                        </p>
                                    </td>
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
                                                <button
                                                    type="button"
                                                    title={app.archived ? 'Arşivden çıkar' : 'Arşivle'}
                                                    aria-label={app.archived ? 'Arşivden çıkar' : 'Arşivle'}
                                                    onClick={async (e) => {
                                                        e.stopPropagation();
                                                        await setApplicationArchived(app.id, !app.archived);
                                                    }}
                                                    className="text-slate-600 hover:text-slate-300 transition-colors"
                                                >
                                                    <Database size={16} className={app.archived ? 'text-amber-500' : ''} />
                                                </button>
                                                <button type="button" onClick={(e) => { e.stopPropagation(); onToggleFinalist(app); }} className="text-slate-600 hover:text-amber-500 transition-colors" aria-label="Finalist işaretle">
                                                    <Star size={18} className={app.team.isFinalist ? "fill-amber-500 text-amber-500" : ""} />
                                                </button>
                                                <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                    {app.team.logoUrl ? <img alt="" src={app.team.logoUrl} className="w-full h-full object-cover" /> : <Users size={20} className="text-slate-600"/>}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="font-bold text-white text-sm">{app.team.name}</div>
                                                        <button type="button" 
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
                                                <button type="button" 
                                                    onClick={(e) => { 
                                                        e.stopPropagation(); 
                                                        setSimulatedApplicationId(app.id); 
                                                        navigate('/dashboard'); 
                                                    }}
                                                    className="p-2 rounded-lg bg-teal-950/40 border border-teal-800/60 text-teal-400 hover:text-white hover:bg-teal-500/20 hover:border-teal-500 transition-all"
                                                    title="Öğretmen Gözünden Gör (Ekranını Önizle)"
                                                >
                                                    <LayoutDashboard size={16} />
                                                </button>
                                                <button type="button" 
                                                    onClick={() => onSelectApp(app)}
                                                    className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-all"
                                                    title="İncele"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button type="button" 
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
            )}
        </div>
    );
};

