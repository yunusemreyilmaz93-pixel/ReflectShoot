import fs from 'fs';
import path from 'path';

const srcPath = 'pages/Dashboard.tsx';
const raw = fs.readFileSync(srcPath, 'utf8');
const lines = raw.split(/\r?\n/);

// Header: lines 1-30 (imports through templates)
const header = lines.slice(0, 30).join('\n');

const extract = (start, end) => lines.slice(start - 1, end).join('\n');

const outDir = 'pages/dashboard';
fs.mkdirSync(outDir, { recursive: true });

// ProductionStatusRing: 32-68
// NextActionCard: 71-130
// TeamSwitcher: 133-202
// Dashboard export: 204-end

const widgetsHeader = `import React from 'react';
import { 
    CheckCircle2, PartyPopper, Megaphone, ArrowRight, Plus, Clapperboard
} from 'lucide-react';
import { ApplicationStatus, Student } from '../../types';
`;

const production = extract(32, 68).replace(/^const ProductionStatusRing/, 'export const ProductionStatusRing');
const nextAction = extract(71, 130).replace(/^const NextActionCard/, 'export const NextActionCard');
const teamSwitcher = extract(133, 202).replace(/^const TeamSwitcher/, 'export const TeamSwitcher');

fs.writeFileSync(
  path.join(outDir, 'DashboardWidgets.tsx'),
  widgetsHeader + '\n' + production + '\n\n' + nextAction + '\n\n' + teamSwitcher + '\n'
);

// Rebuild Dashboard.tsx: original header + import widgets + rest from export Dashboard
const dashboardRest = extract(204, lines.length);
const newDashboard =
  lines.slice(0, 24).join('\n') +
  `\nimport { ProductionStatusRing, NextActionCard, TeamSwitcher } from './dashboard/DashboardWidgets';\n` +
  // skip lines 25-203 (templates stay if needed — templates are 26-27)
  '\n// Placeholder Template URLs\n' +
  extract(26, 27) +
  '\n\n' +
  dashboardRest +
  '\n';

fs.writeFileSync(srcPath, newDashboard);
console.log('Dashboard split complete');
console.log('Widgets lines', (production + nextAction + teamSwitcher).split('\n').length);
console.log('Dashboard lines', newDashboard.split('\n').length);
