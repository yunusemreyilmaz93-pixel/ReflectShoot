import fs from 'fs';
import path from 'path';

const srcPath = 'pages/Admin.tsx';
const raw = fs.readFileSync(srcPath, 'utf8');
const lines = raw.split(/\r?\n/);

const firstConst = lines.findIndex((l) => /^const SimpleTrendChart/.test(l));
const header = lines.slice(0, firstConst).join('\n');
const extract = (start, end) => lines.slice(start - 1, end).join('\n');

const outDir = 'pages/admin';
fs.mkdirSync(outDir, { recursive: true });

const files = {
  'AdminCharts.tsx':
    header + '\n' + extract(26, 125).replace(/^const /gm, 'export const ') + '\n',

  'AdminFormControls.tsx':
    header + '\n' + extract(126, 152).replace(/^const /gm, 'export const ') + '\n',

  'AdminSkeleton.tsx':
    header + '\n' + extract(153, 167).replace(/^const /gm, 'export const ') + '\n',

  'AdminSidebar.tsx':
    header +
    '\n' +
    extract(169, 257).replace(/^const AdminSidebar/, 'export const AdminSidebar') +
    '\n',

  'AdminOverview.tsx':
    header +
    "\nimport { SimpleTrendChart, SimpleDonutChart } from './AdminCharts';\n" +
    extract(258, 546)
      .replace(/^const AnalyticsSection/, 'export const AnalyticsSection')
      .replace(/^const Skeleton/, 'export const Skeleton')
      .replace(/^const AdminDashboard/, 'export const AdminDashboard') +
    '\n',

  'AdminTeamsSection.tsx':
    header + '\n' + extract(547, 1005).replace(/^const AdminTeams/, 'export const AdminTeams') + '\n',

  'AdminJuryAssignSection.tsx':
    header +
    '\n' +
    extract(1006, 1208).replace(/^const AdminJuryAssign/, 'export const AdminJuryAssign') +
    '\n',

  'AdminUsersSection.tsx':
    header + '\n' + extract(1209, 1372).replace(/^const AdminUsers/, 'export const AdminUsers') + '\n',

  'AdminInboxSection.tsx':
    header + '\n' + extract(1373, 1462).replace(/^const AdminInbox/, 'export const AdminInbox') + '\n',

  'AdminAnnouncementsSection.tsx':
    header +
    '\n' +
    extract(1463, 1524).replace(/^const AdminAnnouncements/, 'export const AdminAnnouncements') +
    '\n',

  'AdminAcademicResultsSection.tsx':
    header +
    '\n' +
    extract(2234, 2356).replace(/^const AdminAcademicResults/, 'export const AdminAcademicResults') +
    '\n',
};

const extras = [
  "import { ToggleSwitch, DateInput } from './AdminFormControls';",
  "import { AdminSkeleton } from './AdminSkeleton';",
  "import { AdminSidebar } from './AdminSidebar';",
  "import { AdminDashboard } from './AdminOverview';",
  "import { AdminTeams } from './AdminTeamsSection';",
  "import { AdminJuryAssign } from './AdminJuryAssignSection';",
  "import { AdminUsers } from './AdminUsersSection';",
  "import { AdminInbox } from './AdminInboxSection';",
  "import { AdminAnnouncements } from './AdminAnnouncementsSection';",
  "import { AdminAcademicResults } from './AdminAcademicResultsSection';",
].join('\n');

files['AdminPage.tsx'] = header + '\n' + extras + '\n' + extract(1525, 2233) + '\n';

for (const [name, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(outDir, name), content);
  console.log('Wrote', name, content.split('\n').length, 'lines');
}

fs.writeFileSync(srcPath, "export { Admin } from './admin/AdminPage';\n");
console.log('Rewrote pages/Admin.tsx as re-export');
