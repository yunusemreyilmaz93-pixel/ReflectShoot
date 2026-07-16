
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

export const AdminJuryAssign = ({ apps }: { apps: Application[] }) => {
    const { allUsers, bulkAssignJury, assignJury, showToast, systemSettings } = useAppContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [listFilter, setListFilter] = useState<'ALL' | 'VIDEO' | 'UNASSIGNED' | 'ASSIGNED'>('VIDEO');
    const [editingApp, setEditingApp] = useState<Application | null>(null);
    const [selectedJuries, setSelectedJuries] = useState<Set<string>>(new Set());
    const [isAutoAssigning, setIsAutoAssigning] = useState(false);

    const juries = useMemo(() => allUsers.filter(u => u.role === UserRole.JUDGE), [allUsers]);

    const activeApps = useMemo(
      () => apps.filter((a) => !a.archived),
      [apps]
    );

    const stats = useMemo(() => {
      const withVideo = activeApps.filter(
        (a) => a.team.videoStatus === 'UPLOADED' || a.team.videoStatus === 'SUBMITTED_LINK'
      );
      const unassigned = withVideo.filter((a) => !a.assignedJuryIds?.length);
      const assigned = withVideo.filter((a) => (a.assignedJuryIds?.length || 0) > 0);
      return {
        juries: juries.length,
        withVideo: withVideo.length,
        unassigned: unassigned.length,
        assigned: assigned.length,
      };
    }, [activeApps, juries.length]);

    const filteredApps = useMemo(() => {
      return activeApps.filter((app) => {
        const matchesSearch =
          app.team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (app.teacher?.school || '').toLowerCase().includes(searchTerm.toLowerCase());
        if (!matchesSearch) return false;
        const hasVideo =
          app.team.videoStatus === 'UPLOADED' || app.team.videoStatus === 'SUBMITTED_LINK';
        const n = app.assignedJuryIds?.length || 0;
        if (listFilter === 'VIDEO') return hasVideo;
        if (listFilter === 'UNASSIGNED') return hasVideo && n === 0;
        if (listFilter === 'ASSIGNED') return n > 0;
        return true;
      });
    }, [activeApps, searchTerm, listFilter]);

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

        // Only unassigned with video — don't overwrite existing jury work
        const validApps = activeApps.filter(
          (a) =>
            (a.team.videoStatus === 'UPLOADED' || a.team.videoStatus === 'SUBMITTED_LINK') &&
            !(a.assignedJuryIds && a.assignedJuryIds.length > 0)
        );
        
        if (validApps.length === 0) {
            showToast('Atanacak (video var, jüri yok) takım bulunamadı.', 'error');
            return;
        }
        
        if (!window.confirm(`Videosu teslim edilmiş ve jürisi olmayan ${validApps.length} takıma otomatik dağıtım yapılacak. Her filme en fazla 4 jüri. Onaylıyor musunuz?`)) return;

        setIsAutoAssigning(true);
        try {
            const shuffledJuries = [...juries].sort(() => 0.5 - Math.random());
            let juryIndex = 0;
            const needed = Math.min(4, shuffledJuries.length);

            const assignments = validApps.map(app => {
                const selectedIds: string[] = [];
                for (let i = 0; i < needed; i++) {
                    selectedIds.push(shuffledJuries[juryIndex].uid);
                    juryIndex = (juryIndex + 1) % shuffledJuries.length;
                }
                return { appId: app.id, juryIds: selectedIds };
            });

            await bulkAssignJury(assignments);
            showToast(`${validApps.length} takıma otomatik jüri atandı.`, 'success');
        } catch (error) {
            console.error(error);
            showToast('Otomatik atama sırasında hata oluştu.', 'error');
        } finally {
            setIsAutoAssigning(false);
        }
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Jüri', value: stats.juries, color: 'text-purple-400' },
                { label: 'Video teslim', value: stats.withVideo, color: 'text-blue-400' },
                { label: 'Atanmamış', value: stats.unassigned, color: 'text-amber-400' },
                { label: 'Atanmış', value: stats.assigned, color: 'text-emerald-400' },
              ].map((s) => (
                <div key={s.label} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{s.label}</p>
                  <p className={`text-2xl font-black mt-1 ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Header / Toolbar */}
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
                <div className="flex items-center gap-2 text-white font-bold">
                    <UserCheck size={20} className="text-slate-400"/>
                    Jüri Atama
                    {systemSettings?.season?.label && (
                      <span className="text-[10px] font-bold text-slate-500 uppercase ml-2">{systemSettings.season.label}</span>
                    )}
                </div>
                
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                    <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700 text-[10px] font-bold">
                      {([
                        ['VIDEO', 'Video'],
                        ['UNASSIGNED', 'Atanmamış'],
                        ['ASSIGNED', 'Atanmış'],
                        ['ALL', 'Tümü'],
                      ] as const).map(([id, label]) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setListFilter(id)}
                          className={`px-3 py-1.5 rounded-md transition-colors ${listFilter === id ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-white'}`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    <div className="relative flex-1 sm:w-56">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Takım veya okul ara..." 
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:border-rose-500 outline-none"
                        />
                    </div>
                    <div className="flex flex-col items-stretch sm:items-end gap-1">
                        <button type="button" 
                            onClick={handleAutoAssign}
                            disabled={isAutoAssigning || stats.juries === 0 || stats.unassigned === 0}
                            title={
                              stats.juries === 0
                                ? 'Önce jüri ekleyin'
                                : stats.unassigned === 0
                                  ? 'Atanmamış takım yok'
                                  : undefined
                            }
                            className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-lg shadow-purple-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isAutoAssigning ? 'Dağıtılıyor...' : <><Wand2 size={16}/> Otomatik Dağıt</>}
                        </button>
                        {stats.unassigned === 0 && stats.withVideo > 0 && (
                          <p className="text-[11px] text-emerald-400/90 font-medium max-w-xs sm:text-right">
                            Tüm video teslimleri jüriye atanmış — otomatik dağıtım gerekmiyor.
                          </p>
                        )}
                        {stats.unassigned === 0 && stats.withVideo === 0 && (
                          <p className="text-[11px] text-slate-500 font-medium max-w-xs sm:text-right">
                            Video teslimi olan takım yok; atama için önce video bekleniyor.
                          </p>
                        )}
                        {stats.juries === 0 && (
                          <p className="text-[11px] text-amber-400/90 font-medium max-w-xs sm:text-right">
                            Sistemde jüri yok — önce Kullanıcılar’dan jüri ekleyin.
                          </p>
                        )}
                    </div>
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
                                    <td colSpan={4} className="p-10 text-center">
                                      <p className="text-slate-300 font-bold mb-1">Eşleşen takım yok</p>
                                      <p className="text-slate-500 text-sm">
                                        Filtreyi değiştirin veya video teslimi / jüri eklemeyi kontrol edin.
                                      </p>
                                    </td>
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
                                                <button type="button" 
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
                            <button type="button" onClick={() => setEditingApp(null)} className="text-slate-500 hover:text-white">
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
                            <button type="button" onClick={() => setEditingApp(null)} className="px-4 py-2 rounded-lg text-slate-400 hover:text-white text-sm font-bold">İptal</button>
                            <button type="button" onClick={saveManualAssignment} className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-lg">Kaydet</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

