
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

        const validApps = apps.filter(a => a.team.videoStatus === 'UPLOADED' || a.team.videoStatus === 'SUBMITTED_LINK');
        
        if (validApps.length === 0) {
            showToast('Videosunu teslim etmiş hiçbir takım bulunamadı.', 'error');
            return;
        }
        
        if (!window.confirm(`Sadece videosunu teslim etmiş olan (${validApps.length}) takıma otomatik dağıtım yapılacaktır. Adil dağılım algoritması ile her filme 4 jüri atanacaktır. Onaylıyor musunuz?`)) return;

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
            showToast('Otomatik dağıtım tamamlandı. Adaletli dağılım yapıldı.', 'success');
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
                    <button type="button" 
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

