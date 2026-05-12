import React, { useEffect, useState, useMemo } from 'react';
import { Application, UserProfile, ScoreDocument, ApplicationStatus } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { collectionGroup, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Activity, CheckCircle, Clock, Search, XCircle, AlertCircle, FileEdit, UserCheck } from 'lucide-react';

interface Props {
    apps: Application[];
}

export const AdminJuryStatus = ({ apps }: Props) => {
    const { allUsers } = useAppContext();
    const [allScores, setAllScores] = useState<ScoreDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'JURY' | 'TEAM'>('JURY');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchScores = async () => {
            try {
                const snap = await getDocs(collectionGroup(db, 'scores'));
                const scoresList = snap.docs.map(doc => {
                    const pathSegments = doc.ref.path.split('/');
                    const appId = pathSegments[pathSegments.length - 3]; // .../applications/{appId}/scores/{juryId}
                    return { ...doc.data(), appId } as ScoreDocument & { appId: string };
                });
                setAllScores(scoresList);
            } catch (err) {
                console.error("Error fetching scores:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchScores();
    }, []);

    const juries = useMemo(() => allUsers.filter(u => u.role === 'JUDGE'), [allUsers]);

    // Data Aggregation
    const juryStats = useMemo(() => {
        return juries.map(jury => {
            const assignedApps = apps.filter(a => a.assignedJuryIds?.includes(jury.uid));
            const assignedCount = assignedApps.length;

            const juryS= allScores.filter(s => s.juryId === jury.uid);
            
            const drafted = juryS.filter(s => s.isDraft).length;
            const recused = juryS.filter(s => s.isRecused).length;
            const completed = juryS.filter(s => !s.isDraft && !s.isRecused).length;

            const evaluatedTotal = drafted + recused + completed;
            const pendingCount = assignedCount - evaluatedTotal;
            const progress = assignedCount > 0 ? Math.round((completed / assignedCount) * 100) : 0;

            return {
                jury,
                assignedCount,
                drafted,
                recused,
                completed,
                pendingCount: pendingCount > 0 ? pendingCount : 0,
                progress
            };
        }).sort((a, b) => b.progress - a.progress)
          .filter(j => 
             searchTerm === '' || 
             j.jury.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
             j.jury.email.toLowerCase().includes(searchTerm.toLowerCase())
          );
    }, [juries, apps, allScores, searchTerm]);

    const appStats = useMemo(() => {
        const activeApps = apps.filter(a => a.status !== ApplicationStatus.DRAFT);
        return activeApps.map(app => {
            const assignedCount = app.assignedJuryIds?.length || 0;
            const myScores = allScores.filter(s => (s as any).appId === app.id);
            
            const getNames = (ids: string[]) => {
                if(!ids || ids.length === 0) return '-';
                return ids.map(id => juries.find(j => j.uid === id)?.fullName || 'Bilinmeyen').join(', ');
            };

            const draftedJuryIds = myScores.filter(s => s.isDraft).map(s => s.juryId);
            const recusedJuryIds = myScores.filter(s => s.isRecused).map(s => s.juryId);
            const completedJuryIds = myScores.filter(s => !s.isDraft && !s.isRecused).map(s => s.juryId);

            const evaluatedJuryIds = [...draftedJuryIds, ...recusedJuryIds, ...completedJuryIds];
            
            const pIds = (app.assignedJuryIds || []).filter(jId => !evaluatedJuryIds.includes(jId));
            
            const missingNames = getNames(pIds);
            const draftedNames = getNames(draftedJuryIds);
            const recusedNames = getNames(recusedJuryIds);
            const completedNames = getNames(completedJuryIds);

            const progress = assignedCount > 0 ? Math.round((completedJuryIds.length / assignedCount) * 100) : 0;

            return {
                app,
                assignedCount,
                completedCount: completedJuryIds.length,
                pendingCount: pIds.length,
                draftedCount: draftedJuryIds.length,
                missingNames,
                draftedNames,
                recusedNames,
                completedNames,
                progress
            };
        }).sort((a,b) => a.pendingCount - b.pendingCount).filter(a => 
             searchTerm === '' || 
             a.app.team.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [apps, allScores, juries, searchTerm]);

    const overallAssigned = apps.reduce((acc, a) => acc + (a.assignedJuryIds?.length || 0), 0);
    const overallCompleted = appStats.reduce((acc, a) => acc + a.completedCount, 0);
    const overallDrafted = appStats.reduce((acc, a) => acc + a.draftedCount, 0);
    const overallProgress = overallAssigned > 0 ? Math.round((overallCompleted / overallAssigned) * 100) : 0;

    if (loading) {
        return <div className="text-white p-8 text-center animate-pulse">Veriler yükleniyor...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-black text-white flex items-center gap-2">
                        <Activity className="text-emerald-500" />
                        Jüri Değerlendirme Takibi
                    </h2>
                    <p className="text-slate-400 mt-1">Jürilerin değerlendirme ilerlemesini ve bekleyen filmleri takip edin.</p>
                </div>
            </div>

            {/* Overall Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700/50">
                    <div className="text-slate-400 text-sm font-bold uppercase mb-1">Toplam Atama</div>
                    <div className="text-3xl font-black text-white">{overallAssigned}</div>
                </div>
                <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700/50">
                    <div className="text-slate-400 text-sm font-bold uppercase mb-1">Tamamlanan</div>
                    <div className="text-3xl font-black text-emerald-400">{overallCompleted}</div>
                </div>
                <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700/50">
                    <div className="text-slate-400 text-sm font-bold uppercase mb-1">Taslaklar</div>
                    <div className="text-3xl font-black text-amber-400">{overallDrafted}</div>
                </div>
                <div className="bg-slate-800 p-4 rounded-2xl border border-rose-500/30 bg-rose-900/10">
                    <div className="text-slate-400 text-sm font-bold uppercase mb-1">Genel İlerleme</div>
                    <div className="text-3xl font-black text-rose-500 flex items-center gap-2">
                        %{overallProgress}
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-800 p-2 rounded-xl">
                <div className="flex bg-slate-900 rounded-lg p-1 w-full sm:w-auto">
                    <button 
                        onClick={() => setViewMode('JURY')}
                        className={`flex-1 sm:flex-none px-6 py-2 rounded-md font-bold text-sm transition-all ${viewMode === 'JURY' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                        Jüri Bazlı
                    </button>
                    <button 
                        onClick={() => setViewMode('TEAM')}
                        className={`flex-1 sm:flex-none px-6 py-2 rounded-md font-bold text-sm transition-all ${viewMode === 'TEAM' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                        Takım Bazlı
                    </button>
                </div>

                <div className="flex-1 relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                        type="text"
                        placeholder={viewMode === 'JURY' ? "Jüri Adı ile ara..." : "Takım Adı ile ara..."}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-white focus:border-rose-500 outline-none placeholder:text-slate-600"
                    />
                </div>
            </div>

            {/* View Render */}
            {viewMode === 'JURY' ? (
                <div className="bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase font-bold">
                                <tr>
                                    <th className="p-4 rounded-tl-2xl">Jüri</th>
                                    <th className="p-4 text-center">Atanan</th>
                                    <th className="p-4 text-center text-emerald-400">Puanlanan</th>
                                    <th className="p-4 text-center text-amber-500">Taslak</th>
                                    <th className="p-4 text-center text-slate-500">Çekimser</th>
                                    <th className="p-4 text-center text-rose-400">Kalan</th>
                                    <th className="p-4">Durum</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {juryStats.map(stat => (
                                    <tr key={stat.jury.uid} className="hover:bg-slate-700/30 transition-colors">
                                        <td className="p-4">
                                            <div className="font-bold text-white">{stat.jury.fullName}</div>
                                            <div className="text-xs text-slate-500">{stat.jury.email}</div>
                                        </td>
                                        <td className="p-4 text-center font-bold text-slate-300">{stat.assignedCount}</td>
                                        <td className="p-4 text-center font-bold text-emerald-400">{stat.completed}</td>
                                        <td className="p-4 text-center font-bold text-amber-500">{stat.drafted}</td>
                                        <td className="p-4 text-center font-bold text-slate-500">{stat.recused}</td>
                                        <td className="p-4 text-center font-bold text-rose-400">{stat.pendingCount}</td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 h-2 bg-slate-900 rounded-full overflow-hidden w-24">
                                                    <div 
                                                        className={`h-full ${stat.progress === 100 ? 'bg-emerald-500' : 'bg-rose-500'}`} 
                                                        style={{ width: `${stat.progress}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-xs font-bold text-slate-300">%{stat.progress}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {juryStats.length === 0 && (
                                    <tr><td colSpan={7} className="p-8 text-center text-slate-500">Kayıt bulunamadı.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase font-bold">
                                <tr>
                                    <th className="p-4 rounded-tl-2xl">Takım / Film</th>
                                    <th className="p-4 text-center">Atanan Jüri</th>
                                    <th className="p-4 text-center">İlerleme</th>
                                    <th className="p-4">Beklenen Jüriler</th>
                                    <th className="p-4">Taslak Bırakanlar</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700 text-sm">
                                {appStats.map(stat => (
                                    <tr key={stat.app.id} className="hover:bg-slate-700/30 transition-colors">
                                        <td className="p-4">
                                            <div className="font-bold text-white">{stat.app.team.name}</div>
                                            <div className="text-xs text-slate-500 line-clamp-1 flex gap-2">
                                                {stat.app.status === ApplicationStatus.GRADED && <CheckCircle size={14} className="text-emerald-500 inline"/>}
                                                {stat.app.status === ApplicationStatus.UNDER_REVIEW && <Clock size={14} className="text-amber-500 inline"/>}
                                                {stat.app.team.videoUrl ? 'Video Eklendi' : 'Video Bekleniyor'}
                                            </div>
                                        </td>
                                        <td className="p-4 text-center font-bold text-slate-300">
                                            {stat.completedCount} / {stat.assignedCount}
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex flex-col items-center gap-1">
                                                <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden max-w-[80px]">
                                                    <div 
                                                        className={`h-full ${stat.progress === 100 ? 'bg-emerald-500' : 'bg-rose-500'}`} 
                                                        style={{ width: `${stat.progress}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-[10px] font-bold text-slate-400">%{stat.progress}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-rose-400 font-medium">
                                                {stat.missingNames}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-amber-500 font-medium text-xs">
                                                {stat.draftedNames}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {appStats.length === 0 && (
                                    <tr><td colSpan={5} className="p-8 text-center text-slate-500">Kayıt bulunamadı.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

        </div>
    );
};
