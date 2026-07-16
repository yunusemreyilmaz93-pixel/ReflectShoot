import fs from 'fs';

fs.mkdirSync('pages/city-guide', { recursive: true });
fs.mkdirSync('pages/cinema', { recursive: true });
fs.mkdirSync('pages/award-form', { recursive: true });

// ——— CityGuide data ———
const cg = fs.readFileSync('pages/CityGuide.tsx', 'utf8').split(/\r?\n/);
const ret = cg.findIndex((l, i) => i > 40 && l.trim() === 'return (');
const tStart = cg.findIndex((l) => l.includes('const touristLocations'));
const typesPart = cg.slice(5, 23).join('\n');
const dataPart = cg
  .slice(tStart, ret)
  .join('\n')
  .replace('const touristLocations', 'export const touristLocations')
  .replace('const itineraries', 'export const itineraries')
  .replace('const travelTasks', 'export const travelTasks');

const cityData =
  typesPart
    .replace('interface LocationDetail', 'export interface LocationDetail')
    .replace('interface TouristLocation', 'export interface TouristLocation') +
  '\n\n' +
  dataPart +
  '\n';
fs.writeFileSync('pages/city-guide/cityGuideData.ts', cityData);

// strip data from CityGuide.tsx
const cgHead = cg.slice(0, 5).join('\n');
const cgComponentStart = cg.slice(24, tStart).join('\n'); // export const CityGuide... before arrays
const cgTail = cg.slice(ret).join('\n');
const cityMain = `${cgHead}
import {
  touristLocations,
  itineraries,
  travelTasks,
  type TouristLocation,
} from './city-guide/cityGuideData';

${cgComponentStart}
  ${cgTail}
`;
// Fix double export and broken structure - rewrite carefully
// Actually cg slice 24 is "export const CityGuide..." which includes hooks until touristLocations
const hooksOnly = cg.slice(24, tStart).join('\n');
const cityMain2 = `import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Camera, Train, Utensils, Bed, Compass, Landmark, Bus, Info, CloudSun, ShoppingBag, Thermometer, Shirt, Map, Clock, Navigation, Wifi, BatteryCharging, Phone, X, AlertCircle, Footprints, History, Coffee, Moon, ExternalLink, Aperture, CheckSquare, Share2, Ticket, ArrowRight, MapPin, Trophy, Cpu, Users as UsersIcon } from 'lucide-react';
import {
  touristLocations,
  itineraries,
  travelTasks,
  type TouristLocation,
} from './city-guide/cityGuideData';

${hooksOnly}
${cgTail}
`;
fs.writeFileSync('pages/CityGuide.tsx', cityMain2);
console.log('CityGuide ok', cityMain2.split('\n').length, 'cityData', cityData.split('\n').length);

// ——— Cinema winners + unlock ———
const cs = fs.readFileSync('pages/CinemaShowcase.tsx', 'utf8');
const cinemaData = `import { Category } from '../../types';

export const UNLOCK_DATE = new Date('2026-05-23T18:30:00+03:00');

export type OfficialWinner = {
  rank: string;
  name: string;
  school: string;
  award: string;
};

export const officialLiveActionWinners: OfficialWinner[] = [
  { rank: '1.', name: 'Sosyal Kızlar42', school: 'Konya Türk Telekom Sosyal Bilimler Lisesi', award: 'Birincilik Ödülü' },
  { rank: '2.', name: 'Diriliş Perileri', school: 'Güngören İTO Kız Anadolu İmam Hatip Lisesi', award: 'İkincilik Ödülü' },
  { rank: '3.', name: 'sinemektep', school: 'Güngören İTO Kız Anadolu İmam Hatip Lisesi', award: 'Üçüncülük Ödülü' },
  { rank: 'Jüri Özel', name: 'Homines Longinqui', school: 'Uluslararası Mevlana Anadolu İmam Hatip Lisesi', award: 'Jüri Özel Ödülü' },
  { rank: 'Mansiyon', name: 'Justice Without Doubt', school: 'Mahmut Sami Ramazanoğlu Anadolu İmam Hatip Lisesi', award: 'Mansiyon Ödülü' },
];

export const officialAiWinners: OfficialWinner[] = [
  { rank: '1.', name: 'mitra', school: '15 Temmuz Şehitleri Anadolu İmam Hatip Lisesi', award: 'Birincilik Ödülü' },
  { rank: '2.', name: 'Technokasyon', school: 'Kadıköy Anadolu İmam Hatip Lisesi', award: 'İkincilik Ödülü' },
  { rank: '3.', name: 'Threee', school: 'Maltepe Kız Anadolu İmam Hatip Lisesi', award: 'Üçüncülük Ödülü' },
  { rank: 'Jüri Özel', name: 'PURE INSIGHT', school: 'Selçuklu Fen Lisesi', award: 'Jüri Özel Ödülü' },
  { rank: 'Mansiyon', name: 'Clear Vision', school: 'Konya Anadolu İmam Hatip Lisesi', award: 'Mansiyon Ödülü' },
];

export const LIVE_ACTION_WINNER_NAMES = officialLiveActionWinners.map((w) =>
  w.name.trim().toLowerCase()
);

export function getCinemaEmbedUrl(rawUrl?: string): string | null {
  if (!rawUrl) return null;
  if (rawUrl.includes('embed/')) return rawUrl;
  try {
    const regExp = /^.*(youtu.be\\/|v\\/|u\\/\\w\\/|embed\\/|watch\\?v=|\\&v=)([^#\\&\\?]*).*/;
    const match = rawUrl.match(regExp);
    if (match && match[2].length === 11) {
      return \`https://www.youtube.com/embed/\${match[2]}?autoplay=1\`;
    }
  } catch {
    /* ignore */
  }
  return rawUrl;
}

export { Category };
`;
// Read actual winners from file to preserve exact award strings
const csLines = cs.split(/\r?\n/);
// keep original arrays by slicing lines 80-94
const winnersBlock = csLines.slice(79, 94).join('\n');
fs.writeFileSync(
  'pages/cinema/showcaseData.ts',
  `export const UNLOCK_DATE = new Date('2026-05-23T18:30:00+03:00');

export ${winnersBlock.replace('const officialLiveActionWinners', 'const officialLiveActionWinners').replace(/^  const /gm, 'export const ')}

export const LIVE_ACTION_WINNER_NAMES = officialLiveActionWinners.map((w: { name: string }) =>
  w.name.trim().toLowerCase()
);

export function getCinemaEmbedUrl(rawUrl?: string): string | null {
  if (!rawUrl) return null;
  if (rawUrl.includes('embed/')) return rawUrl;
  try {
    const regExp = /^.*(youtu.be\\/|v\\/|u\\/\\w\\/|embed\\/|watch\\?v=|\\&v=)([^#\\&\\?]*).*/;
    const match = rawUrl.match(regExp);
    if (match && match[2].length === 11) {
      return \`https://www.youtube.com/embed/\${match[2]}?autoplay=1\`;
    }
  } catch {
    /* ignore */
  }
  return rawUrl;
}
`
);
// Fix winners export - the slice includes "const official..."
let showcaseData = fs.readFileSync('pages/cinema/showcaseData.ts', 'utf8');
showcaseData = showcaseData
  .replace('export const officialLiveActionWinners', 'export const officialLiveActionWinners')
  .replace(/\n  const official/g, '\nexport const official')
  .replace('export const officialLiveActionWinners = [', 'export const officialLiveActionWinners = [')
  .replace(/^export const UNLOCK_DATE[\s\S]*?export const officialLiveActionWinners/, (m) => {
    // already have unlock
    return m;
  });
// manual fix: first array might still be "export const officialLiveActionWinners" if we used export const from replace of "  const"
// Read file
showcaseData = fs.readFileSync('pages/cinema/showcaseData.ts', 'utf8');
// The winnersBlock started with "  const officialLiveActionWinners"
showcaseData = showcaseData.replace(
  'export   const officialLiveActionWinners',
  'export const officialLiveActionWinners'
);
showcaseData = showcaseData.replace(
  /\n  const officialAiWinners/,
  '\nexport const officialAiWinners'
);
// If still "export const officialLiveActionWinners" from `export ${winnersBlock}` prefix wrong:
showcaseData = showcaseData.replace('export   const', 'export const');
showcaseData = showcaseData.replace('export const officialLiveActionWinners = [', 'export const officialLiveActionWinners = [');
// Remove erroneous "export " prefix line if "export   const"
if (!showcaseData.includes('export const officialLiveActionWinners')) {
  showcaseData = showcaseData.replace(/const officialLiveActionWinners/, 'export const officialLiveActionWinners');
}
if (!showcaseData.includes('export const officialAiWinners')) {
  showcaseData = showcaseData.replace(/const officialAiWinners/, 'export const officialAiWinners');
}
fs.writeFileSync('pages/cinema/showcaseData.ts', showcaseData);
console.log('showcaseData head', showcaseData.slice(0, 400));

// Patch CinemaShowcase to import
let cinema = fs.readFileSync('pages/CinemaShowcase.tsx', 'utf8');
cinema = cinema.replace(
  "import { AcademicJuryScorePanel } from '../components/AcademicJuryScorePanel';\n\nconst UNLOCK_DATE = new Date('2026-05-23T18:30:00+03:00'); // Turkey timezone\n",
  `import { AcademicJuryScorePanel } from '../components/AcademicJuryScorePanel';
import {
  UNLOCK_DATE,
  officialLiveActionWinners,
  officialAiWinners,
  LIVE_ACTION_WINNER_NAMES,
  getCinemaEmbedUrl,
} from './cinema/showcaseData';
`
);
// Remove local winner arrays and getEmbedUrl - from "// Official rankings" through getEmbedUrl function end
cinema = cinema.replace(
  /\n  \/\/ Official rankings definition\n  const officialLiveActionWinners = \[[\s\S]*?\];\n\n  const officialAiWinners = \[[\s\S]*?\];\n\n  \/\/ Helper to extract YouTube ID or embed URL safely\n  const getEmbedUrl = \(rawUrl\?: string\): string \| null => \{[\s\S]*?return rawUrl;\n  \};\n/,
  '\n'
);
cinema = cinema.replace(/getEmbedUrl\(/g, 'getCinemaEmbedUrl(');
// Replace local liveActionWinnerNames with LIVE_ACTION_WINNER_NAMES
cinema = cinema.replace(
  /const liveActionWinnerNames = \[[\s\S]*?\]\.map\(w => w\.trim\(\)\.toLowerCase\(\)\);/g,
  'const liveActionWinnerNames = LIVE_ACTION_WINNER_NAMES;'
);
fs.writeFileSync('pages/CinemaShowcase.tsx', cinema);
console.log('CinemaShowcase lines', cinema.split('\n').length);

// ——— Award form constants + StudentCard ———
const ap = fs.readFileSync('pages/AwardParticipationForm.tsx', 'utf8').split(/\r?\n/);
// lines 1-217 approximately before export const AwardParticipationForm
const formStart = ap.findIndex((l) => l.includes('export const AwardParticipationForm'));
console.log('form starts', formStart + 1);
// StudentCard is lines 70-192 area, ValidationErrors 193-218
// Extract constants 14-31, UI 37-68, StudentCard 70-191

const constants = `export const DEADLINE = new Date('2026-05-11T13:00:00');

export const TRANSPORTATION_OPTIONS = [
  'Kendi imkânlarıyla',
  'Otobüs',
  'Tren',
  'Uçak',
  'Diğer',
];

export const SPECIAL_CONDITIONS = [
  'Yok',
  'Sağlık durumu',
  'Alerji',
  'Düzenli kullanılan ilaç',
  'Beslenme hassasiyeti',
  'Diğer',
];

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export const inputCls =
  'w-full bg-slate-800/60 border border-slate-700 focus:border-amber-500 focus:bg-slate-800 rounded-xl p-3.5 text-white outline-none transition-colors placeholder:text-slate-600 text-sm';
export const readonlyCls =
  'w-full bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 text-slate-400 text-sm cursor-not-allowed';
`;
fs.writeFileSync('pages/award-form/constants.ts', constants);

// Extract StudentCard + Field components from original (lines 37-191)
const formUi = ap.slice(36, formStart).join('\n');
fs.writeFileSync(
  'pages/award-form/AwardFormUi.tsx',
  `import React, { useState } from 'react';
import { User, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import type { AwardParticipation } from '../../types';
import { SPECIAL_CONDITIONS, inputCls } from './constants';

${formUi}
`
);
// formUi already has SectionHeader Field StudentCard ValidationErrors - need export them
let formUiFile = fs.readFileSync('pages/award-form/AwardFormUi.tsx', 'utf8');
formUiFile = formUiFile
  .replace('const SectionHeader', 'export const SectionHeader')
  .replace('const FieldLabel', 'export const FieldLabel')
  .replace('const inputCls =', '// inputCls from constants\nconst _unused_input =')
  .replace('const readonlyCls =', '// readonlyCls from constants\nconst _unused_ro =')
  .replace('const Field =', 'export const Field =')
  .replace('const StudentCard =', 'export const StudentCard =')
  .replace('interface ValidationErrors', 'export interface ValidationErrors')
  .replace(/const inputCls[\s\S]*?;\n/, '')
  .replace(/const readonlyCls[\s\S]*?;\n/, '');
// StudentCard uses inputCls SPECIAL_CONDITIONS - import already
// Remove duplicate SPECIAL_CONDITIONS if any
formUiFile = formUiFile.replace(
  "import { SPECIAL_CONDITIONS, inputCls } from './constants';",
  "import { SPECIAL_CONDITIONS, inputCls, readonlyCls } from './constants';"
);
fs.writeFileSync('pages/award-form/AwardFormUi.tsx', formUiFile);

// Rewrite AwardParticipationForm header imports
let award = fs.readFileSync('pages/AwardParticipationForm.tsx', 'utf8');
// Remove lines from constants through StudentCard/ValidationErrors before export
const awardLines = award.split(/\r?\n/);
const expIdx = awardLines.findIndex((l) => l.includes('export const AwardParticipationForm'));
const head = `import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { AwardParticipation } from '../types';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import {
  ShieldCheck, Save, Clock, AlertTriangle, Send,
  User, Compass, Home, CheckCircle2, Trash2,
  ChevronDown, ChevronUp, Loader2, Info
} from 'lucide-react';
import {
  DEADLINE,
  TRANSPORTATION_OPTIONS,
  SPECIAL_CONDITIONS,
  inputCls,
  readonlyCls,
  type SaveStatus,
} from './award-form/constants';
import {
  SectionHeader,
  Field,
  StudentCard,
  type ValidationErrors,
} from './award-form/AwardFormUi';

`;
const body = awardLines.slice(expIdx).join('\n');
fs.writeFileSync('pages/AwardParticipationForm.tsx', head + body);
console.log('Award form lines', (head + body).split('\n').length);
console.log('done');
