import type { Application, AwardParticipation } from '../../../types';

export const normalizeTeamName = (s: string) =>
  (s || '').toLocaleLowerCase('tr-TR').trim().replace(/\s+/g, '');

/** Known winner name keys (normalized) — historical list for student export. */
export const WINNER_NAMES_NORMALIZED = [
  'dirilişperileri',
  'sinemektep',
  'msrjusticewithoutdoubt',
  'justicewithoutdoubt',
  'sosyalkızlar42',
  'homineslonginqui',
  'mitra',
  'technokasyon',
  'threee',
  'pureinsight',
  'clearvision',
] as const;

export function getWinnerStudentsText(
  apps: Application[],
  participations: Record<string, AwardParticipation>
): string {
  const winnerApps = apps.filter((app) => {
    const normName = normalizeTeamName(app.team?.name || '');
    return (WINNER_NAMES_NORMALIZED as readonly string[]).includes(normName);
  });

  if (winnerApps.length === 0) {
    return 'Veritabanında ödül alan takım bilgisi bulunamadı veya henüz yüklenmedi.';
  }

  let output = '';
  winnerApps.forEach((app, index) => {
    const p = participations[app.id];
    const students = p?.students || app.team?.students || [];

    output += `${index + 1}) Takım: ${app.team?.name}\n`;
    output += `Kategori: ${app.team?.category || '-'}\n`;
    output += `Ödül: ${app.team?.awardCategory || '-'}\n`;
    output += `Okul: ${app.teacher?.school || '-'}\n`;
    output += `Öğretmen / Danışman: ${p?.advisorName || app.teacher?.fullName || '-'}\n`;
    output += `Öğrenciler:\n`;

    if (students.length > 0) {
      students.forEach((s: { fullName?: string; firstName?: string; lastName?: string; grade?: string }) => {
        const name = s.fullName || `${s.firstName || ''} ${s.lastName || ''}`.trim();
        output += `   - ${name} (${s.grade || '-'})\n`;
      });
    } else {
      output += `   - Öğrenci kaydı bulunamadı.\n`;
    }
    output += `\n=========================================\n\n`;
  });

  return output;
}

export function filterAwardApps(
  winningApps: Application[],
  participations: Record<string, AwardParticipation>,
  opts: { searchTerm: string; filterStatus: string; filterAccom: string }
): Application[] {
  return winningApps.filter((app) => {
    const matchesSearch =
      app.team.name.toLowerCase().includes(opts.searchTerm.toLowerCase()) ||
      app.teacher.school.toLowerCase().includes(opts.searchTerm.toLowerCase());

    const pStatus = app.team.participationFormStatus === 'submitted' ? 'submitted' : 'waiting';
    const matchesStatus = opts.filterStatus === 'all' || pStatus === opts.filterStatus;

    const p = participations[app.id];
    const aStatus =
      p?.accommodationRequired === 'Yes'
        ? 'yes'
        : p?.accommodationRequired === 'No'
          ? 'no'
          : 'not_sure';
    const matchesAccom = opts.filterAccom === 'all' || aStatus === opts.filterAccom;

    return matchesSearch && matchesStatus && matchesAccom;
  });
}
