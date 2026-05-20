import React, { useState, useEffect } from 'react';
import { Search, Download, Filter, Eye, Trophy, Calendar, CheckSquare, XSquare, HelpCircle, EyeOff, Clock, Play, Video, ExternalLink, Youtube, Link as LinkIcon } from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, query, getDocs } from 'firebase/firestore';
import { Application, AwardParticipation } from '../../types';
import { getYouTubeEmbedUrl } from '../../lib/videoUtils';

export const AdminAwards = ({ apps }: { apps: Application[] }) => {
    const [participations, setParticipations] = useState<Record<string, AwardParticipation>>({});
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all'); // all, submitted, waiting
    const [filterAccom, setFilterAccom] = useState<string>('all'); // all, yes, no

    const [selectedAppView, setSelectedAppView] = useState<string | null>(null);
    const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);
    const [showOfficialRankings, setShowOfficialRankings] = useState(true);

    const exportRankingsPDF = () => {
        const content = `
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="UTF-8">
        <title>Reflect & Shoot - Resmi Ödül Sıralama Listesi</title>
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;800&family=Inter:wght@400;500;700;800&display=swap" rel="stylesheet">
        <style>
           @page { size: A4 portrait; margin: 10mm; }
           body {
             font-family: 'Inter', sans-serif;
             color: #0f172a;
             background-color: #ffffff;
             margin: 0;
             padding: 0;
             -webkit-print-color-adjust: exact;
             print-color-adjust: exact;
           }
           .page {
             page-break-after: always;
             border: 3px double #d4af37;
             padding: 40px;
             border-radius: 8px;
             box-sizing: border-box;
             min-height: 275mm;
             display: flex;
             flex-direction: column;
             justify-content: flex-start;
             margin-bottom: 20px;
           }
           .page:last-child {
             page-break-after: avoid;
             margin-bottom: 0;
           }
           .logo-table {
             width: 100%;
             border-collapse: collapse;
             margin-bottom: 25px;
           }
           .header-logo {
             height: 65px;
             object-fit: contain;
           }
           .header-section {
             text-align: center;
             border-bottom: 2px solid #e2e8f0;
             padding-bottom: 15px;
             margin-bottom: 30px;
           }
           .main-title {
             font-family: 'Cinzel', serif;
             font-size: 22pt;
             color: #0f172a;
             margin: 5px 0;
             letter-spacing: 1.5px;
             font-weight: 800;
           }
           .sub-title {
             font-family: 'Cinzel', serif;
             font-size: 13pt;
             color: #b45309;
             margin: 0 0 10px 0;
             letter-spacing: 4px;
             font-weight: 600;
             text-transform: uppercase;
           }
           .doc-date {
             font-size: 10pt;
             color: #64748b;
             font-weight: 500;
           }
           .category-title {
             font-family: 'Cinzel', serif;
             font-size: 14pt;
             color: #1e293b;
             border-bottom: 2px solid #b45309;
             padding-bottom: 6px;
             margin-top: 20px;
             margin-bottom: 20px;
             text-transform: uppercase;
             font-weight: bold;
           }
           .data-table {
             width: 100%;
             border-collapse: collapse;
             margin-top: 10px;
           }
           .data-table th {
             background-color: #f8fafc;
             border-bottom: 2px solid #cbd5e1;
             color: #334155;
             font-weight: 700;
             font-size: 10pt;
             text-align: left;
             padding: 12px;
           }
           .data-table td {
             font-size: 10pt;
             padding: 14px 12px;
             border-bottom: 1px solid #f1f5f9;
           }
           .rank-cell {
             width: 25%;
           }
           .team-cell {
             font-weight: 700;
             width: 35%;
             color: #0f172a;
           }
           .school-cell {
             color: #475569;
             width: 40%;
           }
           .badge-rank {
             display: inline-block;
             padding: 4px 12px;
             border-radius: 99px;
             font-size: 9.5pt;
             font-weight: 800;
             text-align: center;
           }
           .badge-rank.gold {
             background: #fef3c7;
             color: #92400e;
             border: 1px solid #fde68a;
           }
           .badge-rank.special {
             background: #f0fdf4;
             color: #166534;
             border: 1px solid #bbf7d0;
           }
           .badge-rank.mention {
             background: #eff6ff;
             color: #1e40af;
             border: 1px solid #bfdbfe;
           }
        </style>
      </head>
      <body>
        <!-- PAGE 1: CANLI ÇEKİM -->
        <div class="page">
          <table class="logo-table">
            <tr>
              <td style="text-align:left; border:none; padding:0;">
                <img class="header-logo" src="https://assets.reflectandshoot.com/Reflect_Shoot_Logo.png" alt="Reflect & Shoot">
              </td>
              <td style="text-align:right; border:none; padding:0;">
                <img class="header-logo" src="https://assets.reflectandshoot.com/20113118_yeni_logo_konyaihl.png" alt="Konya Anadolu İHL">
              </td>
            </tr>
          </table>

          <div class="header-section">
            <div class="main-title">REFLECT & SHOOT YARIŞMASI</div>
            <div class="sub-title">Resmi Ödül Sıralama Listesi</div>
            <div class="doc-date">Tarih: 22 Mayıs 2026</div>
          </div>

          <div class="category-title">🏆 CANLI ÇEKİM ÖDÜL SIRALAMASI</div>
          <table class="data-table">
            <thead>
              <tr>
                <th>Derece / Ödül</th>
                <th>Takım Adı</th>
                <th>Okul Adı</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="rank-cell"><span class="badge-rank gold">1. Derece</span></td>
                <td class="team-cell">Sosyal Kızlar42</td>
                <td class="school-cell">Konya Türk Telekom Sosyal Bilimler Lisesi</td>
              </tr>
              <tr>
                <td class="rank-cell"><span class="badge-rank gold">2. Derece</span></td>
                <td class="team-cell">Diriliş Perileri</td>
                <td class="school-cell">Güngören İTO Kız Anadolu İmam Hatip Lisesi</td>
              </tr>
              <tr>
                <td class="rank-cell"><span class="badge-rank gold">3. Derece</span></td>
                <td class="team-cell">sinemektep</td>
                <td class="school-cell">Güngören İTO Kız Anadolu İmam Hatip Lisesi</td>
              </tr>
              <tr>
                <td class="rank-cell"><span class="badge-rank special">Jüri Özel</span></td>
                <td class="team-cell">Homines Longinqui</td>
                <td class="school-cell">Uluslararası Mevlana Anadolu İmam Hatip Lisesi</td>
              </tr>
              <tr>
                <td class="rank-cell"><span class="badge-rank mention">Mansiyon</span></td>
                <td class="team-cell">Justice Without Doubt</td>
                <td class="school-cell">Mahmut Sami Ramazanoğlu Anadolu İmam Hatip Lisesi</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- PAGE 2: YAPAY ZEKÂ -->
        <div class="page">
          <table class="logo-table">
            <tr>
              <td style="text-align:left; border:none; padding:0;">
                <img class="header-logo" src="https://assets.reflectandshoot.com/Reflect_Shoot_Logo.png" alt="Reflect & Shoot">
              </td>
              <td style="text-align:right; border:none; padding:0;">
                <img class="header-logo" src="https://assets.reflectandshoot.com/20113118_yeni_logo_konyaihl.png" alt="Konya Anadolu İHL">
              </td>
            </tr>
          </table>

          <div class="header-section">
            <div class="main-title">REFLECT & SHOOT YARIŞMASI</div>
            <div class="sub-title">Resmi Ödül Sıralama Listesi</div>
            <div class="doc-date">Tarih: 22 Mayıs 2026</div>
          </div>

          <div class="category-title">🤖 YAPAY ZEKÂ ÖDÜL SIRALAMASI</div>
          <table class="data-table">
            <thead>
              <tr>
                <th>Derece / Ödül</th>
                <th>Takım Adı</th>
                <th>Okul Adı</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="rank-cell"><span class="badge-rank gold">1. Derece</span></td>
                <td class="team-cell">mitra</td>
                <td class="school-cell">15 Temmuz Şehitleri Anadolu İmam Hatip Lisesi</td>
              </tr>
              <tr>
                <td class="rank-cell"><span class="badge-rank gold">2. Derece</span></td>
                <td class="team-cell">Technokasyon</td>
                <td class="school-cell">Kadıköy Anadolu İmam Hatip Lisesi</td>
              </tr>
              <tr>
                <td class="rank-cell"><span class="badge-rank gold">3. Derece</span></td>
                <td class="team-cell">Threee</td>
                <td class="school-cell">Maltepe Kız Anadolu İmam Hatip Lisesi</td>
              </tr>
              <tr>
                <td class="rank-cell"><span class="badge-rank special">Jüri Özel</span></td>
                <td class="team-cell">PURE INSIGHT</td>
                <td class="school-cell">Selçuklu Fen Lisesi</td>
              </tr>
              <tr>
                <td class="rank-cell"><span class="badge-rank mention">Mansiyon</span></td>
                <td class="team-cell">Clear Vision</td>
                <td class="school-cell">Konya Anadolu İmam Hatip Lisesi</td>
              </tr>
            </tbody>
          </table>
        </div>

        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `;
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(content);
            printWindow.document.close();
        }
    };

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
                    <div className="flex gap-2.5 w-full sm:w-auto">
                        <button
                            onClick={exportRankingsPDF}
                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 px-4 py-2.5 rounded-xl text-xs font-black transition-all shadow-md shadow-amber-500/10 active:scale-95 cursor-pointer"
                        >
                            <Download size={14} className="stroke-[3]" /> Derece Listesi PDF İndir
                        </button>
                        <button
                            onClick={() => setShowOfficialRankings(!showOfficialRankings)}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-colors border border-slate-700"
                        >
                            {showOfficialRankings ? 'Gizle' : 'Göster'}
                        </button>
                    </div>
                </div>

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
                                                        <button
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

                                        {(app.team.videoUrl || app.team.submissionDownloadUrl) && (
                                            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-800 space-y-4">
                                                <h4 className="font-bold text-rose-500 mb-2 flex items-center gap-2">
                                                    <Video size={16} /> Gönderilen Film / Eser
                                                </h4>
                                                {app.team.videoUrl && (
                                                    <div>
                                                        <span className="text-slate-500 text-xs font-bold block mb-2 uppercase">Tanımlanan YouTube Yayını</span>
                                                        <div className="rounded-xl overflow-hidden border border-slate-700 aspect-video">
                                                            <iframe
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
                            <button 
                                onClick={() => setPreviewVideoUrl(null)} 
                                className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                <XSquare size={20} />
                            </button>
                        </div>
                        <div className="aspect-video w-full bg-black">
                            <iframe
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
