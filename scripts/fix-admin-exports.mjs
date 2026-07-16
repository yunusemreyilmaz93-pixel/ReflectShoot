import fs from 'fs';

const exportFixes = {
  'pages/admin/AdminSidebar.tsx': ['AdminSidebar'],
  'pages/admin/AdminOverview.tsx': ['Skeleton', 'AdminDashboard'],
  'pages/admin/AdminAcademicResultsSection.tsx': ['AdminAcademicResults'],
};

for (const [p, names] of Object.entries(exportFixes)) {
  let c = fs.readFileSync(p, 'utf8');
  for (const n of names) {
    // Avoid double-export
    c = c.replace(new RegExp(`(?<!export )const ${n} =`), `export const ${n} =`);
  }
  fs.writeFileSync(p, c);
  console.log('exported', p, names);
}

let page = fs.readFileSync('pages/admin/AdminPage.tsx', 'utf8');
page = page.replaceAll("from '../lib/firebase'", "from '../../lib/firebase'");
page = page.replaceAll('from "../lib/firebase"', 'from "../../lib/firebase"');
// Any remaining single-level relative imports that should go up two
page = page.replaceAll("from '../types'", "from '../../types'");
page = page.replaceAll("from '../context/", "from '../../context/");
page = page.replaceAll("from '../components/", "from '../../components/");
page = page.replaceAll("from '../lib/", "from '../../lib/");
fs.writeFileSync('pages/admin/AdminPage.tsx', page);
console.log('AdminPage paths fixed');
