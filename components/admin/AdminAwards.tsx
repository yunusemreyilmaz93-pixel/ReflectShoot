import React, { useState, useEffect, useRef } from 'react';
import { Search, Download, Trophy, Calendar, CheckSquare, XSquare, HelpCircle, Clock, Video, ExternalLink, Youtube, Play, Eye, ChevronDown } from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, query, getDocs } from 'firebase/firestore';
import { Application, AwardParticipation } from '../../types';
import { getYouTubeEmbedUrl } from '../../lib/videoUtils';
import { getWinnerStudentsText, filterAwardApps } from './awards/awardsHelpers';
import { exportRankingsPDF } from './awards/exportRankingsPdf';
import { exportAwardsExcel } from './awards/exportAwardsExcel';
import { exportAwardsPdf } from './awards/exportAwardsPdf';

export const AdminAwards = ({ apps }: { apps: Application[] }) => {
    const [participations, setParticipations] = useState<Record<string, AwardParticipation>>({});
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterAccom, setFilterAccom] = useState<string>('all');
    const [selectedAppView, setSelectedAppView] = useState<string | null>(null);
    const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);
    const [showOfficialRankings, setShowOfficialRankings] = useState(true);
    const [showWinnerStudentsList, setShowWinnerStudentsList] = useState(false);
    const [exportMenuOpen, setExportMenuOpen] = useState(false);
    const exportMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!exportMenuOpen) return;
        const onDocClick = (e: MouseEvent) => {
            if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
                setExportMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', onDocClick);
        return () => document.removeEventListener('mousedown', onDocClick);
    }, [exportMenuOpen]);

    const winningApps = apps.filter(a => a.team.isWinner);

    useEffect(() => {
        const fetchParticipations = async () => {
            const q = query(collection(db, 'award_participations'));
            const snap = await getDocs(q);
            const data: Record<string, AwardParticipation> = {};
            snap.forEach(docSnap => {
                data[docSnap.id] = { id: docSnap.id, ...docSnap.data() } as AwardParticipation;
            });
            setParticipations(data);
            setLoading(false);
        };
        fetchParticipations();
    }, []);

    const filteredApps = filterAwardApps(winningApps, participations, {
      searchTerm,
      filterStatus,
      filterAccom,
    });

    const handleExportExcel = () => { void exportAwardsExcel(filteredApps, participations); };
    const handleExportPdf = () => { void exportAwardsPdf(filteredApps, participations); };

    return (
        <div className="space-y-6 animate-fadeIn pb-12">
            {/* 🏆 Kesinleşen Resmi Ödül/Derece Sıralamaları */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-amber-500/30 rounded-3xl overflow-hidden shadow-[0_0_30px_rgba(245,158,11,0.05)]">
                <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-950/40">
                    <div className="flex items-center gap-3">
                        <div className="bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                            <Trophy className="text-amber-500 animate-pulse" size={22} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-white flex items-center gap-2">
                                Kesinleşen Ödül ve Derece Sıralamaları
                            </h3>
                            <p className="text-xs text-slate-400 mt-0.5">Tören ve plaket hazırlığında ödül eşleştirmelerini koordine edin</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2.5 w-full sm:w-auto">
                        <button type="button"
                            onClick={() => setShowWinnerStudentsList(!showWinnerStudentsList)}
                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-750 text-amber-500 hover:text-amber-400 px-4 py-2.5 rounded-xl text-xs font-black transition-all border border-slate-700 cursor-pointer"
                        >
                            Öğrenci Listesi Göster / Kopyala
                        </button>
                        <button type="button"
                            onClick={() => setShowOfficialRankings(!showOfficialRankings)}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-colors border border-slate-700"
                        >
                            {showOfficialRankings ? 'Gizle' : 'Göster'}
                        </button>
                    </div>
                </div>

                {showWinnerStudentsList && (
                    <div className="p-6 border-b border-slate-800 bg-slate-950/40">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h4 className="text-sm font-black text-amber-400 tracking-wider uppercase">🏆 Ödül Alan Takımlar & Öğrenci Listeleri</h4>
                                <p className="text-[11px] text-slate-500 mt-0.5">Aşağıdaki listeyi kopyalayarak sertifikalar, davetiyeler veya diğer dökümanlar için doğrudan kullanabilirsiniz.</p>
                            </div>
                            <button type="button"
                                onClick={() => {
                                    const text = getWinnerStudentsText(apps, participations);
                                    navigator.clipboard.writeText(text);
                                    alert("Başarıyla panoya kopyalandı!");
                                }}
                                className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs px-3.5 py-2 rounded-xl font-bold border border-amber-500/20 transition-all cursor-pointer"
                            >
                                Tümünü Kopyala
                            </button>
                        </div>
                        <pre className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-slate-300 whitespace-pre-wrap max-h-96 overflow-y-auto custom-scrollbar select-all">
                            {getWinnerStudentsText(apps, participations)}
                        </pre>
                    </div>
                )}

                {showOfficialRankings && (
                    <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
                        {/* Canlı Çekim Ödül Sıralaması */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 pb-2 border-b border-slate-800/60">
                                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span>
                                <h4 className="text-sm font-black text-slate-200 tracking-wider uppercase">Canlı Çekim Ödül Sıralaması</h4>
                            </div>
                            <div className="space-y-3">
                                {[
                                    { rank: '1.', name: 'Sosyal Kızlar42', school: 'Konya Türk Telekom Sosyal Bilimler Lisesi', type: 'gold', badge: '1. Derece' },
                                    { rank: '2.', name: 'Diriliş Perileri', school: 'Güngören İTO Kız Anadolu İmam Hatip Lisesi', type: 'silver', badge: '2. Derece' },
                                    { rank: '3.', name: 'sinemektep', school: 'Güngören İTO Kız Anadolu İmam Hatip Lisesi', type: 'bronze', badge: '3. Derece' },
                                    { rank: 'Jüri Özel', name: 'Homines Longinqui', school: 'Uluslararası Mevlana Anadolu İmam Hatip Lisesi', type: 'special', badge: 'Jüri Özel Ödülü' },
                                    { rank: 'Mansiyon', name: 'Justice Without Doubt', school: 'Mahmut Sami Ramazanoğlu Anadolu İmam Hatip Lisesi', type: 'mention', badge: 'Mansiyon Ödülü' }
                                ].map((item, index) => (
                                    <div 
                                        key={index} 
                                        className={`flex items-start gap-4 p-3 rounded-2xl border transition-all ${
                                            item.type === 'gold' ? 'bg-amber-500/5 border-amber-500/20 hover:border-amber-500/30' :
                                            item.type === 'silver' ? 'bg-slate-400/5 border-slate-400/20 hover:border-slate-400/30' :
                                            item.type === 'bronze' ? 'bg-orange-500/5 border-orange-500/20 hover:border-orange-500/30' :
                                            'bg-slate-800/40 border-slate-800 hover:border-slate-700'
                                        }`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 border ${
                                            item.type === 'gold' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]' :
                                            item.type === 'silver' ? 'bg-slate-400/10 text-slate-300 border-slate-400/10' :
                                            item.type === 'bronze' ? 'bg-orange-500/10 text-orange-400 border-orange-500/10' :
                                            'bg-slate-900 text-slate-400 border-slate-800'
                                        }`}>
                                            {item.type === 'gold' ? '🥇' : item.type === 'silver' ? '🥈' : item.type === 'bronze' ? '🥉' : '🎬'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="font-extrabold text-white text-sm">{item.name}</span>
                                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                                                    item.type === 'gold' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                    item.type === 'silver' ? 'bg-slate-400/10 text-slate-300 border-slate-400/20' :
                                                    item.type === 'bronze' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                                                    item.type === 'special' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                    'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                }`}>
                                                    {item.badge}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-400 mt-1 line-clamp-1">{item.school}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Yapay Zekâ Ödül Sıralaması */}
                        <div className="space-y-4 pt-6 lg:pt-0 lg:pl-8">
                            <div className="flex items-center gap-2 pb-2 border-b border-slate-800/60">
                                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]"></span>
                                <h4 className="text-sm font-black text-slate-200 tracking-wider uppercase">Yapay Zekâ Ödül Sıralaması</h4>
                            </div>
                            <div className="space-y-3">
                                {[
                                    { rank: '1.', name: 'mitra', school: '15 Temmuz Şehitleri Anadolu İmam Hatip Lisesi', type: 'gold', badge: '1. Derece' },
                                    { rank: '2.', name: 'Technokasyon', school: 'Kadıköy Anadolu İmam Hatip Lisesi', type: 'silver', badge: '2. Derece' },
                                    { rank: '3.', name: 'Threee', school: 'Maltepe Kız Anadolu İmam Hatip Lisesi', type: 'bronze', badge: '3. Derece' },
                                    { rank: 'Jüri Özel', name: 'PURE INSIGHT', school: 'Selçuklu Fen Lisesi', type: 'special', badge: 'Jüri Özel Ödülü' },
                                    { rank: 'Mansiyon', name: 'Clear Vision', school: 'Konya Anadolu İmam Hatip Lisesi', type: 'mention', badge: 'Mansiyon Ödülü' }
                                ].map((item, index) => (
                                    <div 
                                        key={index} 
                                        className={`flex items-start gap-4 p-3 rounded-2xl border transition-all ${
                                            item.type === 'gold' ? 'bg-amber-500/5 border-amber-500/20 hover:border-amber-500/30' :
                                            item.type === 'silver' ? 'bg-slate-400/5 border-slate-400/20 hover:border-slate-400/30' :
                                            item.type === 'bronze' ? 'bg-orange-500/5 border-orange-500/20 hover:border-orange-500/30' :
                                            'bg-slate-800/40 border-slate-800 hover:border-slate-700'
                                        }`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 border ${
                                            item.type === 'gold' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]' :
                                            item.type === 'silver' ? 'bg-slate-400/10 text-slate-300 border-slate-400/10' :
                                            item.type === 'bronze' ? 'bg-orange-500/10 text-orange-400 border-orange-500/10' :
                                            'bg-slate-900 text-slate-400 border-slate-800'
                                        }`}>
                                            {item.type === 'gold' ? '🥇' : item.type === 'silver' ? '🥈' : item.type === 'bronze' ? '🥉' : '🤖'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="font-extrabold text-white text-sm">{item.name}</span>
                                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                                                    item.type === 'gold' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                    item.type === 'silver' ? 'bg-slate-400/10 text-slate-300 border-slate-400/20' :
                                                    item.type === 'bronze' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                                                    item.type === 'special' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                    'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                }`}>
                                                    {item.badge}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-400 mt-1 line-clamp-1">{item.school}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
                    <div className="flex gap-4 items-center">
                        <div className="bg-amber-500/10 p-4 rounded-2xl flex items-center gap-3 border border-amber-500/20">
                            <Trophy className="text-amber-500" size={24} />
                            <div>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Toplam Kazanan</p>
                                <p className="text-2xl font-black text-white">{winningApps.length} <span className="text-lg text-slate-500 font-normal">Takım</span></p>
                            </div>
                        </div>
                        <div className="bg-emerald-500/10 p-4 rounded-2xl flex items-center gap-3 border border-emerald-500/20">
                            <CheckSquare className="text-emerald-500" size={24} />
                            <div>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Form Dolduran</p>
                                <p className="text-2xl font-black text-white">{winningApps.filter(a => a.team.participationFormStatus === 'submitted').length}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="relative" ref={exportMenuRef}>
                        <button
                            type="button"
                            onClick={() => setExportMenuOpen((v) => !v)}
                            aria-haspopup="menu"
                            aria-expanded={exportMenuOpen}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-3 rounded-xl font-bold flex items-center gap-2 border border-emerald-600 transition-colors"
                        >
                            <Download size={18} /> Dışa aktar
                            <ChevronDown size={16} className={`transition-transform ${exportMenuOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {exportMenuOpen && (
                            <div
                                role="menu"
                                className="absolute right-0 mt-2 z-30 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden py-1"
                            >
                                <button
                                    type="button"
                                    role="menuitem"
                                    onClick={() => { exportRankingsPDF(); setExportMenuOpen(false); }}
                                    className="w-full text-left px-4 py-2.5 text-sm font-bold text-slate-200 hover:bg-slate-800 flex items-center gap-2"
                                >
                                    <Download size={14} className="text-amber-500" /> Derece listesi PDF
                                </button>
                                <button
                                    type="button"
                                    role="menuitem"
                                    onClick={() => { handleExportPdf(); setExportMenuOpen(false); }}
                                    className="w-full text-left px-4 py-2.5 text-sm font-bold text-slate-200 hover:bg-slate-800 flex items-center gap-2"
                                >
                                    <Download size={14} className="text-slate-400" /> Katılım formları PDF
                                </button>
                                <button
                                    type="button"
                                    role="menuitem"
                                    onClick={() => { handleExportExcel(); setExportMenuOpen(false); }}
                                    className="w-full text-left px-4 py-2.5 text-sm font-bold text-slate-200 hover:bg-slate-800 flex items-center gap-2"
                                >
                                    <Download size={14} className="text-emerald-400" /> Katılım formları Excel
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                        <input 
                            type="text" 
                            placeholder="Takım, okul veya öğretmen ara..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-white focus:border-amber-500 outline-none"
                        />
                    </div>
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none">
                        <option value="all">Tüm Durumlar (Form)</option>
                        <option value="submitted">Doldurdu</option>
                        <option value="waiting">Bekliyor</option>
                    </select>
                    <select value={filterAccom} onChange={e => setFilterAccom(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none">
                        <option value="all">Konaklama Talebi (Tümü)</option>
                        <option value="yes">Var</option>
                        <option value="no">Yok</option>
                    </select>
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                {loading ? (
                    <div className="p-10 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div></div>
                ) : filteredApps.length === 0 ? (
                    <div className="p-10 text-center text-slate-500">Kayıt bulunamadı.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-950 border-b border-slate-800 text-xs uppercase tracking-wider text-slate-400">
                                    <th className="p-4 font-bold">Takım & Okul</th>
                                    <th className="p-4 font-bold">Ödül</th>
                                    <th className="p-4 font-bold">Film / Eser</th>
                                    <th className="p-4 font-bold">Danışman</th>
                                    <th className="p-4 font-bold">Form Durumu</th>
                                    <th className="p-4 font-bold">Öğr. / Konak.</th>
                                    <th className="p-4 font-bold">Ulaşım</th>
                                    <th className="p-4 font-bold">İşlem</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {filteredApps.map(app => {
                                    const isSubmitted = app.team.participationFormStatus === 'submitted';
                                    const p = participations[app.id];
                                    return (
                                        <tr key={app.id} className="hover:bg-slate-800/50 transition-colors">
                                            <td className="p-4">
                                                <div className="font-bold text-white">{app.team.name}</div>
                                                <div className="text-xs text-slate-400 mt-1 line-clamp-1">{app.teacher.school} <span className="text-slate-600">({app.teacher.city})</span></div>
                                            </td>
                                            <td className="p-4">
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20 text-xs font-bold whitespace-nowrap">
                                                    <Trophy size={12} /> {app.team.awardCategory}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col gap-1.5">
                                                    {app.team.videoUrl ? (
                                                        <button type="button"
                                                            onClick={() => setPreviewVideoUrl(app.team.videoUrl || null)}
                                                            className="inline-flex items-center gap-1 bg-red-500/10 hover:bg-red-500/20 text-rose-400 border border-red-500/20 text-[11px] px-2 py-1 rounded font-bold transition-all w-fit cursor-pointer"
                                                            title="YouTube Üzerinden İzle"
                                                        >
                                                            <Play size={10} className="fill-rose-400" /> İzle (YouTube)
                                                        </button>
                                                    ) : null}
                                                    {app.team.submissionDownloadUrl ? (
                                                        <a
                                                            href={app.team.submissionDownloadUrl}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="inline-flex items-center gap-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 text-[11px] px-2 py-1 rounded font-bold transition-all w-fit"
                                                            title="Dosyayı Dış Bağlantıda Aç"
                                                        >
                                                            <ExternalLink size={10} /> Ham Dosya
                                                        </a>
                                                    ) : null}
                                                    {!app.team.videoUrl && !app.team.submissionDownloadUrl && (
                                                        <span className="text-xs text-slate-600 italic">Yüklenmedi</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="text-sm text-slate-300">{p?.advisorName || app.teacher.fullName}</div>
                                                <div className="text-xs text-slate-500 mt-1">{p?.advisorPhone || app.teacher.phone}</div>
                                            </td>
                                            <td className="p-4">
                                                {isSubmitted ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs font-bold whitespace-nowrap">
                                                        <CheckSquare size={12} /> Dolduruldu
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 text-slate-400 border border-slate-700 text-xs font-bold whitespace-nowrap">
                                                        <Clock size={12} /> Bekleniyor
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex gap-4">
                                                    <div className="text-center">
                                                        <div className="text-xs text-slate-500">Öğr.</div>
                                                        <div className="font-bold text-white">{p?.students ? p.students.length : app.team.students.length}</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-xs text-slate-500">Konak.</div>
                                                        <div className={`font-bold ${p?.accommodationRequired === 'Yes' ? 'text-amber-400' : 'text-slate-400'}`}>
                                                            {p?.accommodationRequired === 'Yes' ? p?.accommodationPersonCount : '-'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="text-sm text-slate-300">{p?.transportationType || '-'}</div>
                                            </td>
                                            <td className="p-4">
                                                <button type="button"
                                                    onClick={() => setSelectedAppView(app.id)}
                                                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition-colors"
                                                    title="Form Detaylarını Gör"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* View Modal */}
            {selectedAppView && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl">
                        <div className="p-6 border-b border-slate-800 flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-black text-white">Katılım Formu Detayları</h3>
                                <p className="text-sm text-slate-400 mt-1">Form verileri ve konaklama talepleri</p>
                            </div>
                            <button type="button" onClick={() => setSelectedAppView(null)} className="text-slate-500 hover:text-white p-2">
                                <XSquare size={24} />
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
                            {(() => {
                                const app = apps.find(a => a.id === selectedAppView);
                                const p = participations[selectedAppView];
                                if (!app) return <div>Data not found</div>;
                                
                                return (
                                    <>
                                        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-800">
                                            <h4 className="font-bold text-amber-500 mb-2">Takım & Danışman</h4>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div><span className="text-slate-500">Takım Adı:</span> <div className="text-white font-medium">{app.team.name}</div></div>
                                                <div><span className="text-slate-500">Ödül Kategorisi:</span> <div className="text-white font-medium">{app.team.awardCategory}</div></div>
                                                <div><span className="text-slate-500">Okul Adı:</span> <div className="text-white font-medium">{app.teacher.school}</div></div>
                                                <div><span className="text-slate-500">İl / İlçe:</span> <div className="text-white font-medium">{app.teacher.city} / {p?.schoolDistrict || '-'}</div></div>
                                                <div><span className="text-slate-500">Danışman:</span> <div className="text-white font-medium">{p?.advisorName || app.teacher.fullName}</div></div>
                                                <div><span className="text-slate-500">Danışman Tel:</span> <div className="text-white font-medium">{p?.advisorPhone || app.teacher.phone}</div></div>
                                                <div><span className="text-slate-500">Danışman E-Posta:</span> <div className="text-white font-medium">{p?.advisorEmail || app.teacher.email}</div></div>
                                                <div><span className="text-slate-500">Törene Katılım Durumu:</span> <div className="text-white font-medium">{p?.advisorParticipationStatus === 'Attending' ? 'Katılıyor' : p?.advisorParticipationStatus === 'Not_Attending' ? 'Katılmıyor' : 'Belirsiz'}</div></div>
                                            </div>
                                        </div>

                                        {(app.team.videoUrl || app.team.submissionDownloadUrl) && (
                                            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-800 space-y-4">
                                                <h4 className="font-bold text-rose-500 mb-2 flex items-center gap-2">
                                                    <Video size={16} /> Gönderilen Film / Eser
                                                </h4>
                                                {app.team.videoUrl && (
                                                    <div>
                                                        <span className="text-slate-500 text-xs font-bold block mb-2 uppercase">Tanımlanan YouTube Yayını</span>
                                                        <div className="rounded-xl overflow-hidden border border-slate-700 aspect-video">
                                                            <iframetitle="Video önizleme" 
                                                                src={getYouTubeEmbedUrl(app.team.videoUrl) || ""}
                                                                className="w-full h-full"
                                                                allowFullScreen
                                                            ></iframe>
                                                        </div>
                                                    </div>
                                                )}
                                                {app.team.submissionDownloadUrl && (
                                                    <div className="pt-2 border-t border-slate-705/50">
                                                        <span className="text-slate-500 text-xs font-bold block mb-1.5 uppercase">Öğretmen Gönderim Linki</span>
                                                        <div className="flex gap-2">
                                                            <input
                                                                readOnly
                                                                value={app.team.submissionDownloadUrl}
                                                                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-400 font-mono outline-none"
                                                            />
                                                            <a
                                                                href={app.team.submissionDownloadUrl}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                                                            >
                                                                <ExternalLink size={14} /> Bağlantıyı Aç
                                                            </a>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-800">
                                            <h4 className="font-bold text-amber-500 mb-2">Öğrenciler ({(p?.students || app.team.students).length} kişi)</h4>
                                            <div className="space-y-3">
                                                {(p?.students || app.team.students).map((s, i) => (
                                                    <div key={i} className="text-sm border-l-2 border-slate-700 pl-3">
                                                        <div className="font-bold text-white mb-1">{s.fullName} ({s.grade})</div>
                                                        <div className="grid grid-cols-2 gap-2 text-slate-400">
                                                            <div>Öğrenci Tel: <span className="text-slate-300">{s.phone || '-'}</span></div>
                                                            <div>Veli Ad/Soyad: <span className="text-slate-300">{s.parentName || '-'}</span></div>
                                                            <div>Veli Tel: <span className="text-slate-300">{s.parentPhone || '-'}</span></div>
                                                            <div>Özel Durum: <span className="text-slate-300">{s.specialCondition || 'Yok'}</span></div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-800">
                                            <h4 className="font-bold text-amber-500 mb-2">Ulaşım ve Konaklama</h4>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div><span className="text-slate-500">Ulaşım Şekli:</span> <div className="text-white font-medium">{p?.transportationType || '-'} {p?.transportationOtherDesc ? `(${p.transportationOtherDesc})` : ''}</div></div>
                                                <div><span className="text-slate-500">Konaklama Talebi:</span> <div className="text-white font-medium">{p?.accommodationRequired === 'Yes' ? 'Var' : p?.accommodationRequired === 'No' ? 'Yok' : 'Belirsiz'}</div></div>
                                                <div className="col-span-2"><span className="text-slate-500">Konaklayacak Kişi Sayısı:</span> <div className="text-white font-medium">{p?.accommodationPersonCount || '-'} Kişi</div></div>
                                                <div><span className="text-slate-500">Tahmini Varış:</span> <div className="text-white font-medium">{p?.arrivalDate || '-'} {p?.arrivalTime || '-'}</div></div>
                                                <div><span className="text-slate-500">Tahmini Gidiş:</span> <div className="text-white font-medium">{p?.departureDate || '-'} {p?.departureTime || '-'}</div></div>
                                            </div>
                                        </div>

                                        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-800">
                                            <h4 className="font-bold text-amber-500 mb-2">Ek Notlar / Talepler</h4>
                                            <p className="text-sm text-slate-300 whitespace-pre-wrap">{p?.additionalNotes || 'Herhangi bir not bulunmamaktadır.'}</p>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            )}

            {/* YouTube Video Preview Modal */}
            {previewVideoUrl && (
                <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-fadeIn">
                    <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-3xl w-full flex flex-col shadow-2xl overflow-hidden animate-scaleIn">
                        <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
                            <h4 className="font-bold text-white text-sm flex items-center gap-2">
                                <Video className="text-rose-500 animate-pulse" size={16} /> Film Ön İzleme
                            </h4>
                            <button type="button" 
                                onClick={() => setPreviewVideoUrl(null)} 
                                className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                <XSquare size={20} />
                            </button>
                        </div>
                        <div className="aspect-video w-full bg-black">
                            <iframetitle="Video önizleme" 
                                src={getYouTubeEmbedUrl(previewVideoUrl) || ""}
                                className="w-full h-full"
                                allowFullScreen
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            ></iframe>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

