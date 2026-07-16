import fs from 'fs';

const lines = fs.readFileSync('components/admin/AdminAwards.tsx', 'utf8').split(/\r?\n/);
// If already rewritten, re-read from git? Assume original still has full content until we overwrite.
// Prefer backup if shell was partial - check for exportAwardsExcel import
const raw = fs.readFileSync('components/admin/AdminAwards.tsx', 'utf8');
if (raw.includes("from './awards/exportAwardsExcel'")) {
  console.log('Already slim; skip JSX extract from current file');
  process.exit(0);
}

const jsx = lines.slice(535).join('\n'); // from "return (" 

const shell = `import React, { useState, useEffect } from 'react';
import { Search, Download, Trophy, Calendar, CheckSquare, XSquare, HelpCircle, Clock, Video, ExternalLink, Youtube } from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, query, getDocs } from 'firebase/firestore';
import { Application, AwardParticipation } from '../../types';
import { getYouTubeEmbedUrl } from '../../lib/videoUtils';
import { getWinnerStudentsText, filterAwardApps } from './awards/awardsHelpers';
import { exportRankingsPDF } from './awards/exportRankingsPdf';
import { exportAwardsExcel } from './awards/exportAwardsExcel';
import { exportAwardsPdf } from './awards/exportAwardsPdf';

export const AdminAwards = ({ apps }: { apps: Application[] }) => {
    const [participations, setParticipations] = useState<Record<string, AwardParticipation>>({});
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterAccom, setFilterAccom] = useState<string>('all');
    const [selectedAppView, setSelectedAppView] = useState<string | null>(null);
    const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);
    const [showOfficialRankings, setShowOfficialRankings] = useState(true);
    const [showWinnerStudentsList, setShowWinnerStudentsList] = useState(false);

    const winningApps = apps.filter(a => a.team.isWinner);

    useEffect(() => {
        const fetchParticipations = async () => {
            const q = query(collection(db, 'award_participations'));
            const snap = await getDocs(q);
            const data: Record<string, AwardParticipation> = {};
            snap.forEach(docSnap => {
                data[docSnap.id] = { id: docSnap.id, ...docSnap.data() } as AwardParticipation;
            });
            setParticipations(data);
            setLoading(false);
        };
        fetchParticipations();
    }, []);

    const filteredApps = filterAwardApps(winningApps, participations, {
      searchTerm,
      filterStatus,
      filterAccom,
    });

    const handleExportExcel = () => { void exportAwardsExcel(filteredApps, participations); };
    const handleExportPdf = () => { void exportAwardsPdf(filteredApps, participations); };

${jsx
  .replace(/onClick=\{exportToExcel\}/g, 'onClick={handleExportExcel}')
  .replace(/onClick=\{exportToPDF\}/g, 'onClick={handleExportPdf}')
  .replace(/getWinnerStudentsText\(\)/g, 'getWinnerStudentsText(apps, participations)')
}
`;

fs.writeFileSync('components/admin/AdminAwards.tsx', shell);
console.log('AdminAwards.tsx lines', shell.split('\\n').length);
