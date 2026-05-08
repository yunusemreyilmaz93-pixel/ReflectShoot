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

    const [selectedAppView, setSelectedAppView] = useState<string | null>(null);

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

    const exportToExcel = async () => {
        const XLSX = await import('xlsx');
        const data = filteredApps.map(app => {
            const p = participations[app.id];
            
            const studentInfo = (p?.students || app.team.students || []).map((s, i) =>
                `${i + 1}. Öğrenci: ${s.fullName} (${s.grade}) | Tel: ${s.phone || '-'} | Veli: ${s.parentName || '-'} (${s.parentPhone || '-'}) | Özel Durum: ${s.specialCondition || 'Yok'} ${s.specialConditionDescription ? `(${s.specialConditionDescription})` : ''}`
            ).join('\n');

            return {
                "Takım Adı": app.team.name,
                "Ödül Kategorisi": app.team.awardCategory || '-',
                "Okul Adı": app.teacher.school,
                "İl": app.teacher.city,
                "İlçe": p?.schoolDistrict || '-',
                "Danışman": p?.advisorName || app.teacher.fullName,
                "Danışman Tel": p?.advisorPhone || app.teacher.phone,
                "Danışman E-Posta": p?.advisorEmail || app.teacher.email,
                "Danışman Katılım": p?.advisorParticipationStatus === 'Attending' ? 'Katılıyor' : p?.advisorParticipationStatus === 'Not_Attending' ? 'Katılmıyor' : 'Belirsiz',
                "Öğrenci Sayısı": (p?.students || app.team.students).length,
                "Konaklayacak Kişi (Toplam)": p?.accommodationPersonCount || 0,
                "Ulaşım Yöntemi": p?.transportationType || '-',
                "Ulaşım Detayı": p?.transportationOtherDesc || '-',
                "Tahmini Varış": `${p?.arrivalDate || '-'} ${p?.arrivalTime || '-'}`,
                "Tahmini Dönüş": `${p?.departureDate || '-'} ${p?.departureTime || '-'}`,
                "Konaklama Talebi": p?.accommodationRequired === 'Yes' ? 'Var' : p?.accommodationRequired === 'No' ? 'Yok' : 'Belirsiz',
                "Form Durumu": app.team.participationFormStatus === 'submitted' ? 'Dolduruldu' : 'Bekliyor',
                "Ek Notlar": p?.additionalNotes || '',
                "Öğrenci ve Veli Bilgileri": studentInfo
            };
        });

        if (data.length === 0) return;
        
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Katılım Raporu");
        XLSX.writeFile(workbook, `odul_toreni_katilim_raporu_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const exportToPDF = async () => {
        const { default: jsPDF } = await import('jspdf');
        const { default: autoTable } = await import('jspdf-autotable');

        // Dikey mod (portrait) yapıyoruz ki sayfaya daha rahat sığsın takım bazlı yapı
        const doc = new jsPDF('portrait');
        
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
        
        doc.setFontSize(16);
        doc.text("Ödül Töreni Katılım Detay Raporu", 14, 20);

        let currentY = 30;

        filteredApps.forEach((app, index) => {
            const p = participations[app.id];

            // Sayfa sonuna yaklaşıldıysa yeni sayfa aç
            if (currentY > 210) {
                doc.addPage();
                currentY = 20;
            }

            // Takım Başlığı
            doc.setFontSize(13);
            doc.setFont('Roboto', 'bold');
            doc.setTextColor(30, 41, 59);
            doc.text(`${index + 1}. Takım: ${app.team.name}`, 14, currentY);
            currentY += 6;

            // Genel Bilgiler Tablosu
            const generalInfo = [
                ['Okul:', app.teacher.school, 'Danışman:', p?.advisorName || app.teacher.fullName],
                ['İl / İlçe:', `${app.teacher.city} / ${p?.schoolDistrict || '-'}`, 'Danışman Tel:', p?.advisorPhone || app.teacher.phone],
                ['Ulaşım:', p?.transportationType || '-', 'Danışman E-Posta:', p?.advisorEmail || app.teacher.email],
                ['Konaklama İhtiyacı:', p?.accommodationRequired === 'Yes' ? 'Var' : p?.accommodationRequired === 'No' ? 'Yok' : 'Belirsiz', 'Törene Katılım Durumu:', p?.advisorParticipationStatus === 'Attending' ? 'Katılıyor' : p?.advisorParticipationStatus === 'Not_Attending' ? 'Katılmıyor' : 'Belirsiz'],
                ['Konaklayacak Kişi:', (p?.accommodationPersonCount || 0).toString(), 'Form Durumu:', app.team.participationFormStatus === 'submitted' ? 'Dolduruldu' : 'Bekliyor'],
                ['Tahmini Varış:', `${p?.arrivalDate || '-'} ${p?.arrivalTime || '-'}`, 'Tahmini Kalkış:', `${p?.departureDate || '-'} ${p?.departureTime || '-'}`],
                ['Ek Notlar:', { content: p?.additionalNotes || 'Yok', colSpan: 3 }]
            ];

            autoTable(doc, {
                startY: currentY,
                body: generalInfo,
                theme: 'plain',
                styles: { font: 'Roboto', fontSize: 9, cellPadding: 2, textColor: [51, 65, 85] },
                columnStyles: {
                    0: { fontStyle: 'bold', cellWidth: 35 },
                    1: { cellWidth: 55 },
                    2: { fontStyle: 'bold', cellWidth: 35 },
                    3: { cellWidth: 'auto' }
                },
                margin: { left: 14, right: 14 }
            });

            currentY = (doc as any).lastAutoTable.finalY + 3;

            // Öğrenci Bilgileri Tablosu
            const students = p?.students || app.team.students || [];
            if (students.length > 0) {
                const studentData = students.map((s, i) => [
                    (i + 1).toString(),
                    s.fullName || '-',
                    s.grade || '-',
                    s.phone || '-',
                    s.parentName || '-',
                    s.parentPhone || '-',
                    s.specialCondition === 'Diğer' && s.specialConditionDescription 
                        ? `Diğer - ${s.specialConditionDescription}` 
                        : (s.specialCondition || 'Yok')
                ]);

                autoTable(doc, {
                    startY: currentY,
                    head: [['#', 'Öğrenci', 'Sınıf', 'Öğr. Tel', 'Veli', 'Veli Tel', 'Özel Durum']],
                    body: studentData,
                    theme: 'grid',
                    styles: { font: 'Roboto', fontSize: 8, cellPadding: 2 },
                    headStyles: { fillColor: [71, 85, 105], textColor: 255, fontStyle: 'bold' },
                    margin: { left: 14, right: 14 }
                });
                currentY = (doc as any).lastAutoTable.finalY + 10;
            } else {
                currentY += 5;
            }

            // Sayfada yer varsa takımlar arasına ayırıcı çizgi koy
            if (currentY < 270 && index < filteredApps.length - 1) {
                doc.setDrawColor(203, 213, 225);
                doc.line(14, currentY - 3, 196, currentY - 3);
                currentY += 5;
            }
        });

        doc.save(`toren_katilim_raporu_${new Date().toISOString().split('T')[0]}.pdf`);
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
                    
                    <div className="flex gap-2">
                        <button onClick={exportToPDF} className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-3 rounded-xl font-bold flex items-center gap-2 border border-slate-700 transition-colors">
                            <Download size={18} /> PDF Olarak İndir
                        </button>
                        <button onClick={exportToExcel} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-3 rounded-xl font-bold flex items-center gap-2 border border-emerald-600 transition-colors">
                            <Download size={18} /> Excel Olarak İndir
                        </button>
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
                                                <button
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
                            <button onClick={() => setSelectedAppView(null)} className="text-slate-500 hover:text-white p-2">
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
        </div>
    );
};
