import fs from 'fs';
import path from 'path';

const dir = 'pages/dashboard/tabs';
for (const f of fs.readdirSync(dir)) {
  const p = path.join(dir, f);
  let c = fs.readFileSync(p, 'utf8');
  c = c
    .replaceAll("from '../../types'", "from '../../../types'")
    .replaceAll("from '../../data/", "from '../../../data/")
    .replaceAll("from '../../components/", "from '../../../components/")
    .replaceAll("from '../../lib/", "from '../../../lib/");
  fs.writeFileSync(p, c);
  console.log('fixed paths', f);
}

// Extend DashboardUI with missing fields
let ctx = fs.readFileSync('pages/dashboard/DashboardUIContext.tsx', 'utf8');
if (!ctx.includes('showToast:')) {
  ctx = ctx.replace(
    'TEMPLATE_CONSENT_URL: string;\n};',
    `TEMPLATE_CONSENT_URL: string;
  showToast: (msg: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  setVerifyCodes: React.Dispatch<React.SetStateAction<Record<string, string>>>;
};`
  );
  fs.writeFileSync('pages/dashboard/DashboardUIContext.tsx', ctx);
  console.log('extended DashboardUI');
}

// Patch Dashboard dashboardUI object
let dash = fs.readFileSync('pages/Dashboard.tsx', 'utf8');
if (!dash.includes('showToast,') || !dash.includes('setVerifyCodes,')) {
  dash = dash.replace(
    'TEMPLATE_PARENT_URL, TEMPLATE_CONSENT_URL,\n    };',
    'TEMPLATE_PARENT_URL, TEMPLATE_CONSENT_URL,\n      showToast, setVerifyCodes,\n    };'
  );
  fs.writeFileSync('pages/Dashboard.tsx', dash);
  console.log('patched dashboardUI bag');
}

// Ensure tabs destructure showToast and setVerifyCodes
for (const f of ['DashboardStatusTab.tsx', 'DashboardDocumentsTab.tsx']) {
  const p = path.join(dir, f);
  let c = fs.readFileSync(p, 'utf8');
  if (!c.includes('showToast')) {
    c = c.replace(
      'TEMPLATE_PARENT_URL, TEMPLATE_CONSENT_URL,',
      'TEMPLATE_PARENT_URL, TEMPLATE_CONSENT_URL,\n    showToast, setVerifyCodes,'
    );
    fs.writeFileSync(p, c);
    console.log('destructure', f);
  }
}
