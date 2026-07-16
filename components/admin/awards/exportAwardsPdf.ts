import type { Application, AwardParticipation } from '../../../types';

export async function exportAwardsPdf(
  filteredApps: Application[],
  participations: Record<string, AwardParticipation>
): Promise<void> {
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

}
