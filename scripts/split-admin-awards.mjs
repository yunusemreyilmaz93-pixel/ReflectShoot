import fs from 'fs';

const lines = fs.readFileSync('components/admin/AdminAwards.tsx', 'utf8').split(/\r?\n/);
fs.mkdirSync('components/admin/awards', { recursive: true });

// --- helpers ---
fs.writeFileSync(
  'components/admin/awards/awardsHelpers.ts',
  `import type { Application, AwardParticipation } from '../../../types';

export const normalizeTeamName = (s: string) =>
  (s || '').toLocaleLowerCase('tr-TR').trim().replace(/\\s+/g, '');

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

    output += \`\${index + 1}) Takım: \${app.team?.name}\\n\`;
    output += \`Kategori: \${app.team?.category || '-'}\\n\`;
    output += \`Ödül: \${app.team?.awardCategory || '-'}\\n\`;
    output += \`Okul: \${app.teacher?.school || '-'}\\n\`;
    output += \`Öğretmen / Danışman: \${p?.advisorName || app.teacher?.fullName || '-'}\\n\`;
    output += \`Öğrenciler:\\n\`;

    if (students.length > 0) {
      students.forEach((s: { fullName?: string; firstName?: string; lastName?: string; grade?: string }) => {
        const name = s.fullName || \`\${s.firstName || ''} \${s.lastName || ''}\`.trim();
        output += \`   - \${name} (\${s.grade || '-'})\\n\`;
      });
    } else {
      output += \`   - Öğrenci kaydı bulunamadı.\\n\`;
    }
    output += \`\\n=========================================\\n\\n\`;
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
`
);

// rankings PDF: lines 71-339 body of exportRankingsPDF
// Original: const exportRankingsPDF = () => { ... content ... printWindow }
const rankingsBody = lines.slice(71, 339).join('\n'); // inside function without wrapper
// lines[70] is "    const exportRankingsPDF = () => {"
// lines[71] starts "        const content = `"
// lines[338] is "    };" closing
const rankingsInner = lines.slice(71, 338).join('\n').replace(/^        /gm, '  ');
fs.writeFileSync(
  'components/admin/awards/exportRankingsPdf.ts',
  `/** Official rankings print HTML (unchanged markup). */
export function exportRankingsPDF(): void {
${rankingsInner}
}
`
);

// excel 358-396: const exportToExcel = async () => { ... };
const excelInner = lines
  .slice(358, 396)
  .join('\n')
  .replace(/^        /gm, '  ')
  .replace(/^    \};$/m, '');
// remove trailing };
const excelClean = excelInner.replace(/\n\s*\};\s*$/, '');
fs.writeFileSync(
  'components/admin/awards/exportAwardsExcel.ts',
  `import type { Application, AwardParticipation } from '../../../types';

export async function exportAwardsExcel(
  filteredApps: Application[],
  participations: Record<string, AwardParticipation>
): Promise<void> {
${excelClean}
}
`
);

// pdf report 398-519
const pdfInner = lines
  .slice(398, 519)
  .join('\n')
  .replace(/^        /gm, '  ')
  .replace(/^    \};$/m, '');
const pdfClean = pdfInner.replace(/\n\s*\};\s*$/, '');
fs.writeFileSync(
  'components/admin/awards/exportAwardsPdf.ts',
  `import type { Application, AwardParticipation } from '../../../types';

export async function exportAwardsPdf(
  filteredApps: Application[],
  participations: Record<string, AwardParticipation>
): Promise<void> {
${pdfClean}
}
`
);

console.log('Wrote awards modules');
console.log('rankings lines', rankingsInner.split('\\n').length);
console.log('excel sample', excelClean.slice(0, 120));
console.log('pdf sample', pdfClean.slice(0, 120));
