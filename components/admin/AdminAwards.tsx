import React, { useState, useEffect } from 'react';
import { Search, Download, Filter, Eye, Trophy, Calendar, CheckSquare, XSquare, HelpCircle, EyeOff, Clock } from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, query, getDocs } from 'firebase/firestore';
import { Application, AwardParticipation } from '../../types';

export const AdminAwards = ({ apps }: { apps: Application[] }) => {
    const [participations, setParticipations] = useState<Record<string, AwardParticipation>>({});
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all'); // all, submitted, waiting
    const [filterAccom, setFilterAccom] = useState<string>('all'); // all, yes, no

    const winningApps = apps.filter(a => a.team.isWinner);

    useEffect(() => {
        const fetchParticipations = async () => {
            const q = query(collection(db, 'award_participations'));
            const snap = await getDocs(q);
            const data: Record<string, AwardParticipation> = {};
            snap.forEach(doc => {
                data[doc.id] = doc.data() as AwardParticipation;
            });
            setParticipations(data);
            setLoading(false);
        };
        fetchParticipations();
    }, [apps]);

    const exportToCSV = () => {
        const data = filteredApps.map(app => {
            const p = participations[app.id];
            return {
                "Takım Adı": app.team.name,
                "Ödül Kategorisi": app.team.awardCategory || '-',
                "Okul Adı": app.teacher.school,
                "İl / İlçe": `${app.teacher.city} / ${p?.schoolDistrict || '-'}`,
                "Danışman": p?.advisorName || app.teacher.fullName,
                "Danışman Tel": p?.advisorPhone || app.teacher.phone,
                "Danışman Katılım Durumu": p?.advisorParticipationStatus === 'Attending' ? 'Katılıyor' : p?.advisorParticipationStatus === 'Not_Attending' ? 'Katılmıyor' : 'Belirsiz',
                "Öğrenci Sayısı": app.team.students.length,
                "Katılacak Toplam Kişi (Konaklama)": p?.accommodationPersonCount || 0,
                "Ulaşım Yöntemi": p?.transportationType || '-',
                "Konaklama Talebi": p?.accommodationRequired === 'Yes' ? 'Var' : p?.accommodationRequired === 'No' ? 'Yok' : 'Belirsiz',
                "Form Durumu": app.team.participationFormStatus === 'submitted' ? 'Dolduruldu' : 'Bekliyor',
                "Ek Notlar": "\"" + (p?.additionalNotes || '').replace(/"/g, '""') + "\""
            };
        });

        if (data.length === 0) return;
        
        const headers = Object.keys(data[0]).join(",");
        const csvRows = data.map(row => Object.values(row).join(","));
        const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + headers + "\n" + csvRows.join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `odul_toreni_katilim_raporu_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredApps = winningApps.filter(app => {
        const matchesSearch = app.team.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              app.teacher.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              app.teacher.school.toLowerCase().includes(searchTerm.toLowerCase());
        
        const pStatus = app.team.participationFormStatus === 'submitted' ? 'submitted' : 'waiting';
        const matchesStatus = filterStatus === 'all' || pStatus === filterStatus;
        
        const p = participations[app.id];
        const aStatus = p?.accommodationRequired === 'Yes' ? 'yes' : p?.accommodationRequired === 'No' ? 'no' : 'not_sure';
        const matchesAccom = filterAccom === 'all' || aStatus === filterAccom;

        return matchesSearch && matchesStatus && matchesAccom;
    });

    return (
        <div className="space-y-6 animate-fadeIn pb-12">
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
                    
                    <button onClick={exportToCSV} className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 border border-slate-700 transition-colors">
                        <Download size={18} /> Raporu İndir (CSV)
                    </button>
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
                                    <th className="p-4 font-bold">Danışman</th>
                                    <th className="p-4 font-bold">Form Durumu</th>
                                    <th className="p-4 font-bold">Öğr. / Konak.</th>
                                    <th className="p-4 font-bold">Ulaşım</th>
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
                                                        <div className="font-bold text-white">{app.team.students.length}</div>
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
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
