import * as XLSX from 'xlsx';
import type { Application } from '../types';
import { getActiveSeason, isInSeason } from './domain/season';
import type { SystemSettings } from '../types';

/** Count missing parent/KVKK consents for ops filters & Excel. */
export function countMissingDocs(app: Application): number {
  let n = 0;
  (app.team.students || []).forEach((s) => {
    if (!s.hasParentalConsent) n++;
    if (!s.hasKvkkConsent) n++;
  });
  return n;
}

/** @deprecated use countMissingDocs */
function missingDocs(app: Application): number {
  return countMissingDocs(app);
}

/** Export filtered applications to Excel (operasyon raporu). */
export function exportApplicationsExcel(
  apps: Application[],
  opts: { filename?: string; sheetName?: string } = {}
): void {
  const rows = apps.map((app) => ({
    Takım: app.team.name,
    Sezon: app.seasonId || 'legacy',
    Arşiv: app.archived ? 'Evet' : 'Hayır',
    Kategori: app.team.category,
    Durum: app.status,
    Finalist: app.team.isFinalist ? 'Evet' : 'Hayır',
    Kazanan: app.team.isWinner ? 'Evet' : 'Hayır',
    Video: app.team.videoStatus,
    VideoUrl: app.team.videoUrl || '',
    EksikBelge: missingDocs(app),
    ÖğrenciSayısı: app.team.students?.length || 0,
    Danışman: app.teacher.fullName,
    Okul: app.teacher.school,
    Şehir: app.teacher.city,
    Eposta: app.teacher.email,
    Puan: app.finalScore ?? '',
    JüriSayısı: app.assignedJuryIds?.length || 0,
    BaşvuruTarihi: app.submittedAt || '',
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, opts.sheetName || 'Takımlar');
  const name =
    opts.filename ||
    `reflect-shoot-rapor-${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, name);
}

export function exportCurrentSeasonOpsReport(
  apps: Application[],
  settings: SystemSettings
): void {
  const season = getActiveSeason(settings);
  const current = apps.filter((a) => isInSeason(a, season.id));
  exportApplicationsExcel(current, {
    filename: `ops-${season.id}-${new Date().toISOString().slice(0, 10)}.xlsx`,
    sheetName: season.id,
  });
}
