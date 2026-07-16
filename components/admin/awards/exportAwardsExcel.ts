import type { Application, AwardParticipation } from '../../../types';

export async function exportAwardsExcel(
  filteredApps: Application[],
  participations: Record<string, AwardParticipation>
): Promise<void> {
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

}
