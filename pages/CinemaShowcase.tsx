import React, { useState, useEffect, useMemo } from 'react';
import { 
  Film, Trophy, Lock, Unlock, Eye, Clock, Calendar, 
  Play, X, Zap, Star, Award, ShieldAlert, Cpu,
  Search, SlidersHorizontal, MonitorPlay, ExternalLink, RotateCw
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Application, Category } from '../types';
import { getActiveSeason } from '../lib/domain/season';
import { splitShowcaseBySeason } from './cinema/showcaseSeasons';
import { getJuryFeedback } from '../data/juryFeedback';
import { AcademicJuryScorePanel } from '../components/AcademicJuryScorePanel';
import {
  officialLiveActionWinners,
  officialAiWinners,
  LIVE_ACTION_WINNER_NAMES,
  getCinemaEmbedUrl,
} from './cinema/showcaseData';

export const CinemaShowcase: React.FC = () => {
  const { systemSettings } = useAppContext();
  const activeSeasonId = getActiveSeason(systemSettings).id;
  const [publicApps, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [allJuryScores, setAllJuryScores] = useState<Record<string, any[]>>({});
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [selectedTeamName, setSelectedTeamName] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<Category>(Category.LIVE_ACTION);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterWinnerStatus, setFilterWinnerStatus] = useState<'all' | 'winners' | 'others'>('all');
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [selectedSeason, setSelectedSeason] = useState<'2025-2026' | '2026-2027'>('2025-2026');

  // Archived 2025-26 films keep the full results view; the active season lists only AI films.
  const { archive: applications, current: currentFilms } = useMemo(
    () => splitShowcaseBySeason(publicApps, activeSeasonId),
    [publicApps, activeSeasonId]
  );

  // Fetch all applications & jury scores in a single clean load flow
  useEffect(() => {
    const fetchAppsAndScores = async () => {
      try {
        const response = await fetch('/api/public-showcase');
        if (!response.ok) {
          throw new Error('Public showcase could not be loaded');
        }

        const data = await response.json();
        setApplications((data.applications || []) as Application[]);
        setAllJuryScores((data.scores || {}) as Record<string, any[]>);
      } catch (err) {
        console.error('Applications could not be fetched:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppsAndScores();
  }, []);

  // Helper to toggle flipped card state
  const toggleCardFlip = (teamName: string) => {
    setFlippedCards(prev => ({
      ...prev,
      [teamName]: !prev[teamName]
    }));
  };

  // Memoized adjusted data to handle jury score adjustment (dropping 5th jury's 87 score for the 8th film overall in LIVE_ACTION)
  const adjustedData = useMemo(() => {
    // Clone allJuryScores map to avoid raw state mutations
    const cleanScores: Record<string, any[]> = {};
    Object.keys(allJuryScores).forEach(key => {
      cleanScores[key] = [...allJuryScores[key]];
    });

    // We need to identify who is the 8th film in LIVE_ACTION overall.
    // In LIVE_ACTION, we have 5 winners. The 8th overall film will be index 2 of non-winners under Category.LIVE_ACTION.
    const liveActionWinnerNames = LIVE_ACTION_WINNER_NAMES;

    const rawLiveApps = applications.filter(app => {
      if (!app?.team || app.team.category !== Category.LIVE_ACTION) return false;
      const appName = app.team.name?.trim().toLowerCase();
      if (!appName) return false;
      const isWinner = liveActionWinnerNames.some(w => appName === w || appName.includes(w) || w.includes(appName));
      return !isWinner;
    });

    // Compute raw average to determine rank before adjustment
    const appsWithRawScores = rawLiveApps.map(app => {
      const scores = app.id ? cleanScores[app.id] : undefined;
      let calculatedAvg = app.finalScore || 0;
      if (scores && scores.length > 0) {
        calculatedAvg = scores.reduce((sum, s) => sum + s.total, 0) / scores.length;
      }
      return { app, calculatedAvg };
    });

    // Sort descending to find rank
    appsWithRawScores.sort((a, b) => b.calculatedAvg - a.calculatedAvg);

    // Filter index 2 is overall 8th (since 1st-5th are winners, index 0 is 6th, index 1 is 7th, index 2 is 8th)
    if (appsWithRawScores.length > 2) {
      const eighthItem = appsWithRawScores[2];
      const targetId = eighthItem.app?.id;
      if (targetId && cleanScores[targetId]) {
        const rawScores = cleanScores[targetId];
        // 5. jüri page can have score with total === 87. Let's filter it out.
        const index87 = rawScores.findIndex(s => s.total === 87);
        if (index87 !== -1) {
          cleanScores[targetId] = rawScores.filter((_, idx) => idx !== index87);
        }
      }
    }

    // Find Clear Vision application (Yapay Zeka Mansiyon) and exclude 4th (idx 3) and 6th (idx 5) pre-jury scores
    const clearVisionApp = applications.find(app => {
      if (!app?.team?.name) return false;
      const dbName = app.team.name.trim().toLowerCase();
      const targetName = "clear vision";
      return dbName === targetName || dbName.includes(targetName) || targetName.includes(dbName);
    });
    if (clearVisionApp && clearVisionApp.id && cleanScores[clearVisionApp.id]) {
      const rawScores = cleanScores[clearVisionApp.id];
      // Exclude 4th (idx 3) and 6th (idx 5)
      cleanScores[clearVisionApp.id] = rawScores.filter((_, idx) => idx !== 3 && idx !== 5);
    }

    // Now compute the final clean application scores
    const adjustedApps = applications.map(app => {
      const scores = app.id ? cleanScores[app.id] : undefined;
      let finalAvg = app.finalScore;
      if (scores && scores.length > 0) {
        const totalSum = scores.reduce((sum, s) => sum + s.total, 0);
        finalAvg = totalSum / scores.length;
      }
      return {
        ...app,
        finalScore: finalAvg
      };
    });

    return {
      applications: adjustedApps,
      allJuryScores: cleanScores
    };
  }, [applications, allJuryScores]);

  // Get current category official top 5
  const officialWinners = activeCategory === Category.LIVE_ACTION ? officialLiveActionWinners : officialAiWinners;

  // Match database applications with the official winners to extract actual video urls and logos
  const getRichWinnerData = () => {
    return officialWinners.map((winner) => {
      // Try to find in database by team name (handling prefixes like MSR)
      const matchedApp = adjustedData.applications.find((app) => {
        if (!app?.team?.name) return false;
        const dbName = app.team.name.trim().toLowerCase();
        const winName = winner.name.trim().toLowerCase();
        return dbName === winName || dbName.includes(winName) || winName.includes(dbName);
      });

      return {
        ...winner,
        appId: matchedApp?.id || null,
        videoUrl: matchedApp?.team?.videoUrl || null,
        logoUrl: matchedApp?.team?.logoUrl || null,
        verse: matchedApp?.team?.selectedVerse || matchedApp?.team?.selectedTopic || null,
        finalScore: matchedApp?.finalScore || null
      };
    });
  };

  // Filter other participants that are NOT in the top 5
  const getOtherParticipants = () => {
    const winnersList = getRichWinnerData();
    const winnerAppIds = winnersList.map(w => w.appId).filter(Boolean);
    
    // Sort applications by final score descending
    const filteredApps = adjustedData.applications
      .filter((app) => {
        if (!app?.team?.name) return false;
        // Must match active category
        if (app.team.category !== activeCategory) return false;
        
        // Exclude officially matched winners by ID
        if (app.id && winnerAppIds.includes(app.id)) return false;
        
        // Secondary backup check by team name containing/contained by winner name
        const appTeamName = app.team.name.toLowerCase().trim();
        const isNameMatch = winnersList.some(w => {
          const wName = w.name.toLowerCase().trim();
          return appTeamName === wName || appTeamName.includes(wName) || wName.includes(appTeamName);
        });
        if (isNameMatch) return false;

        return true;
      })
      .sort((a, b) => (b.finalScore || 0) - (a.finalScore || 0));

    // Map their relative rank starting from 6, filtering out index 23 (which corresponds to 29th film overall)
    return filteredApps
      .filter((_, idx) => idx !== 23) // Filter out the 29th overall film (since 5 winners + index 23 = 29th item)
      .map((app, index) => ({
        rank: `${index + 6}.`,
        name: app.team?.name || '',
        school: app.teacher?.school || '',
        city: app.teacher?.city || 'Konya',
        finalScore: app.finalScore,
        videoUrl: app.team?.videoUrl || null,
        logoUrl: app.team?.logoUrl || null,
        verse: app.team?.selectedVerse || app.team?.selectedTopic || null,
        appId: app.id,
        category: app.team?.category || activeCategory,
        theme: app.team?.theme
      }));
  };

  // Search and filter final list
  const richWinners = getRichWinnerData();
  const otherParticipants = getOtherParticipants();

  // Combine lists based on active filters
  const getFilteredList = () => {
    let result: any[] = [];
    if (filterWinnerStatus === 'all') {
      result = [...richWinners.map(w => ({ ...w, isTop5: true })), ...otherParticipants.map(o => ({ ...o, isTop5: false }))];
    } else if (filterWinnerStatus === 'winners') {
      result = richWinners.map(w => ({ ...w, isTop5: true }));
    } else {
      result = otherParticipants.map(o => ({ ...o, isTop5: false }));
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        item => 
          item.name.toLowerCase().includes(q) || 
          item.school.toLowerCase().includes(q) ||
          (item.verse && item.verse.toLowerCase().includes(q))
      );
    }

    return result;
  };

  const finalCards = getFilteredList();

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans relative overflow-hidden pb-32">
      {/* Background Graphic Effects */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-5 pointer-events-none"></div>
      <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-amber-500/5 blur-[150px] rounded-full pointer-events-none mix-blend-screen"></div>

      {/* Cinematic Hero Header Section - Aligned with FAQ style, logo free */}
      <div className="bg-gradient-to-b from-rose-950 via-slate-900 to-slate-950 text-white pt-32 pb-32 relative overflow-hidden shadow-2xl z-10 border-b border-slate-900">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[500px] bg-rose-500/10 blur-[120px] rounded-full pointer-events-none mix-blend-screen"></div>

        <div className="max-w-4xl mx-auto text-center animate-fadeIn relative z-10 px-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold tracking-[0.2em] uppercase mb-6 shadow-[0_0_15px_rgba(245,158,11,0.2)] backdrop-blur-sm">
            <MonitorPlay size={14} /> GALA SALONU & SONUÇLAR
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tight animate-fadeIn delay-100">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-500 to-amber-300 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">
              Gala Salonu
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
            Seçici Kurul jüri puanları ve resmi derecelendirmeler doğrultusunda kesinleşen sonuç listesi. 
            Yarışmaya katılan tüm eserleri sinema kalitesiyle buradan seyredebilirsiniz.
          </p>
        </div>
      </div>

      {/* Season Selector */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 relative z-20">
        <div className="flex flex-col sm:flex-row justify-between items-center bg-slate-900/60 p-6 rounded-[2rem] border border-slate-800/80 gap-6">
          <div className="flex items-center gap-4">
            <span className="text-amber-500 bg-amber-500/10 border border-amber-500/20 px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider">
              Sezon Seçimi
            </span>
            <p className="text-sm text-slate-300 font-medium">Yarışma sezonları arasında geçiş yapın:</p>
          </div>
          
          <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-850 w-full sm:w-auto">
            <button type="button"
              onClick={() => setSelectedSeason('2025-2026')}
              className={`flex-1 sm:flex-none px-6 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 ${
                selectedSeason === '2025-2026'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/10 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Trophy size={14} /> 2025-2026 Sezonu (Arşiv)
            </button>
            
            <button type="button"
              onClick={() => setSelectedSeason('2026-2027')}
              className={`flex-1 sm:flex-none px-6 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 ${
                selectedSeason === '2026-2027'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/10 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Film size={13} /> 2026-2027 Sezonu
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Seasonal Layout conditional */}
      {selectedSeason === '2026-2027' ? (
        currentFilms.length > 0 ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
            <h3 className="text-2xl font-black text-white mb-2">2026-2027 Sezonu Yapay Zekâ Filmleri</h3>
            <p className="text-sm text-slate-400 mb-8">Asr ve Beled surelerinden ilham alan yapay zekâ animasyon filmleri.</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentFilms.map((film) => (
                <div key={film.id} className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 flex flex-col gap-4">
                  <div>
                    <h4 className="text-lg font-black text-white leading-tight">{film.team.name}</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      {[film.teacher?.school, film.teacher?.city].filter(Boolean).join(' • ')}
                    </p>
                  </div>
                  {film.team.videoUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedVideo(film.team.videoUrl || null);
                        setSelectedTeamName(film.team.name);
                      }}
                      className="mt-auto inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl py-3 transition-colors"
                    >
                      <Play size={14} /> Filmi İzle
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto px-4 mt-16 text-center py-24 bg-slate-900/40 rounded-[2.5rem] border border-slate-800/80 backdrop-blur-sm relative overflow-hidden">
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-3xl w-16 h-16 flex items-center justify-center mx-auto mb-8 shadow-2xl">
              <Film size={32} />
            </div>

            <h3 className="text-3xl font-black text-white mb-4 tracking-tight leading-none">
              2026-2027 Sezonu Filmleri Burada Yer Alacak
            </h3>

            <p className="text-slate-300 text-base md:text-lg font-light leading-relaxed max-w-2xl mx-auto">
              Yeni sezonda yalnızca yapay zekâ animasyon filmleri yarışacak ve eserler Asr ile Beled surelerinden ilham alacak.
              Başvuru ve sonuç tarihleri yakında açıklanacaktır. Bu sırada 2025-2026 sezonu filmlerini arşivden izleyerek ilham alabilirsiniz.
            </p>
          </div>
        )
      ) : (
        <>
          {/* Navigation Subbar / Tabs */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="flex flex-col sm:flex-row gap-6 justify-between items-center bg-slate-900/40 p-4 rounded-3xl border border-slate-900 backdrop-blur-sm">
          {/* Category Switches */}
          <div className="flex p-1 bg-slate-950 rounded-2xl border border-slate-800 w-full sm:w-auto">
            <button type="button"
              onClick={() => {
                setActiveCategory(Category.LIVE_ACTION);
                setFilterWinnerStatus('all');
              }}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 whitespace-nowrap cursor-pointer ${
                activeCategory === Category.LIVE_ACTION
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-slate-950 shadow-lg shadow-teal-500/10'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Film size={14} /> Canlı Çekim
            </button>
            <button type="button"
              onClick={() => {
                setActiveCategory(Category.AI_ANIMATION);
                setFilterWinnerStatus('all');
              }}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 whitespace-nowrap cursor-pointer ${
                activeCategory === Category.AI_ANIMATION
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-slate-950 shadow-lg shadow-purple-500/10'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Cpu size={14} /> Yapay Zekâ
            </button>
          </div>

          {/* Winner Filter Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-[10px] uppercase font-black text-slate-500 mr-2 tracking-widest hidden md:inline">SÜREÇ:</span>
            <div className="grid grid-cols-3 bg-slate-950 p-1 rounded-2xl border border-slate-800 w-full sm:w-auto">
              {[
                { id: 'all', label: 'Tümü' },
                { id: 'winners', label: 'İlk 5' },
                { id: 'others', label: 'Katılımcılar' }
              ].map((tab) => (
                <button type="button"
                  key={tab.id}
                  onClick={() => setFilterWinnerStatus(tab.id as any)}
                  className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                    filterWinnerStatus === tab.id
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live-action Search Toolbar */}
        <div className="mt-6 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Takım adı, okul veya eser ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-3 pl-10 pr-4 text-sm text-slate-300 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-colors"
            />
          </div>
          <div className="text-xs text-slate-500 font-bold self-end md:self-center">
            Toplam <span className="text-white font-black">{finalCards.length}</span> kayıt gösteriliyor
          </div>
        </div>

        {/* Academic Jury Evaluation Notice Banner */}
        <div className="mt-8 p-5 bg-teal-500/[0.03] border border-teal-500/15 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex gap-4 items-start">
            <div className="p-2.5 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-2xl shrink-0">
              <Trophy size={18} className="text-teal-400" />
            </div>
            <div>
              <h4 className="text-sm font-black text-teal-400 uppercase tracking-wider mb-1">Kürsü Sıralaması & Akademik Jüri Değerlendirmesi</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Detay sekmesinde ve her takımın puan kartında sergilenen puan kırılımları ile ortalamaları, festivalimizin <strong>Değerlendirme Jürisi (Ön Jüri)</strong> tarafından verilen puanlardır. Yarışma şartnamemiz gereğince ön değerlendirme barajını başarıyla aşan ilk 5 finalist eser; <strong>Selçuk Üniversitesi İletişim Fakültesi Radyo, Televizyon ve Sinema Bölümü</strong> akademisyenlerinden oluşan bağımsız bir heyetin nihai değerlendirmesine sunulmuştur. Bu doğrultuda birincilik, ikincilik, üçüncülük, jüri özel ve mansiyon ödülü kazanan ekiplerin kürsü sıralamaları doğrudan bu bağımsız akademik kurulun kararıyla belirlenmiştir. Bu kapsamda ilk 5 derecesindeki nihai kürsü yerleşimleri, ön jüri sıralamasından farklılık gösterebilmektedir.
              </p>
            </div>
          </div>
        </div>

        {/* Technical Requirements & Evaluation Notice Banner */}
        <div className="mt-4 p-5 bg-amber-500/[0.03] border border-amber-500/15 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex gap-4 items-start">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-2xl shrink-0 animate-pulse">
              <ShieldAlert size={18} />
            </div>
            <div>
              <h4 className="text-sm font-black text-amber-500 uppercase tracking-wider mb-1">Değerlendirme ve Katılım Bilgilendirmesi</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Gala Salonu listemizde yer almayan bazı katılımcı filmlerimiz, resmi kısa film yarışması şartnamesinde yer alan asgari teknik kriterleri (format, süre sınırları ya da telif koşulları gibi) tam olarak karşılayamadığından jüri heyetimiz tarafından değerlendirmeye dahil edilememiş ve dolayısıyla burada sıralanamamıştır. Projeye başvuran ve büyük özveri gösteren tüm öğrencilerimize ve danışman öğretmenlerimize teşekkür ederiz.
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mb-4"></div>
            <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Veriler Yükleniyor...</p>
          </div>
        ) : (
          <div className="mt-12">
            {finalCards.length === 0 ? (
              <div className="text-center py-20 bg-slate-900/10 border border-dashed border-slate-800 rounded-3xl">
                <SlidersHorizontal size={40} className="mx-auto text-slate-600 mb-4" />
                <h3 className="text-lg font-black text-slate-300">Aramayla Eşleşen Sonuç Bulunamadı</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">Kayıt filtrelerini veya girdiğiniz anahtar kelimeleri değiştirmeyi deneyebilirsiniz.</p>
              </div>
            ) : (
              /* Upgraded Grid: Changes col counts to 2 on lg screens for larger, clearer cards, with generous vertical spacing */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-y-16 md:gap-y-20 gap-x-10">
                {finalCards.map((team, idx) => {
                  const hasVideo = !!team.videoUrl;
                  const isTop5Winner = team.isTop5;
                  const isFlipped = !!flippedCards[team.name];

                  return (
                    <div 
                      key={team.name}
                      onClick={() => toggleCardFlip(team.name)}
                      className="group cursor-pointer card-perspective min-h-[580px] select-none h-full"
                    >
                      <div className={`card-inner relative w-full h-full duration-700 ${isFlipped ? 'card-flipped' : ''}`}>
                        
                        {/* 1. FRONT SIDE OF CARD */}
                        <div className={`card-front flex flex-col justify-between bg-slate-900/60 border rounded-[2rem] overflow-hidden hover:shadow-2xl transition-all duration-500 ${
                          isTop5Winner 
                            ? team.type === 'gold' ? 'border-amber-500/30 bg-gradient-to-b from-amber-500/[0.04] to-transparent' :
                              team.type === 'silver' ? 'border-slate-500/30' :
                              team.type === 'bronze' ? 'border-orange-500/20' :
                              team.type === 'special' ? 'border-emerald-500/20 bg-gradient-to-b from-emerald-500/[0.02] to-transparent' :
                              'border-blue-500/20 bg-gradient-to-b from-blue-500/[0.02] to-transparent'
                            : 'border-slate-900 hover:border-slate-850 bg-slate-900/40'
                        }`}>
                          {/* Top Part */}
                          <div>
                            {/* Film Cover */}
                            <div className="relative aspect-video w-full bg-slate-950 overflow-hidden flex items-center justify-center">
                              {team.videoUrl ? (
                                <div className="absolute inset-0 w-full h-full group-hover:scale-105 transition-transform duration-700">
                                  {team.videoUrl.includes('youtu') ? (
                                    <img 
                                      src={`https://img.youtube.com/vi/${getCinemaEmbedUrl(team.videoUrl)?.split('/embed/')[1]?.split('?')[0]}/hqdefault.jpg`} 
                                      alt={team.name}
                                      className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-300"
                                      referrerPolicy="no-referrer"
                                    />
                                  ) : (
                                    <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
                                      <Film size={24} className="text-slate-700" />
                                    </div>
                                  )}
                                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-black/30"></div>
                                </div>
                              ) : (
                                <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center text-slate-700 p-4 border-b border-slate-900/50">
                                  <Film size={32} className="stroke-[1.5] text-slate-800 mb-2" />
                                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Video Yükleniyor</span>
                                </div>
                              )}

                              {/* Badges */}
                              <div className="absolute top-4 left-4 z-10">
                                {isTop5Winner ? (
                                  <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider border shadow-md ${
                                    team.type === 'gold' ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-amber-500/10' :
                                    team.type === 'silver' ? 'bg-slate-300 text-slate-950 border-white' :
                                    team.type === 'bronze' ? 'bg-orange-500 text-white border-orange-400' :
                                    team.type === 'special' ? 'bg-emerald-600 text-white border-emerald-400' :
                                    'bg-blue-600 text-white border-blue-400'
                                  }`}>
                                    {team.type === 'gold' ? '🥇' : team.type === 'silver' ? '🥈' : team.type === 'bronze' ? '🥉' : '✨'} {team.award}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider bg-slate-950/95 border border-slate-800 text-slate-300 shadow-lg font-mono">
                                    🎬 {team.rank}
                                  </span>
                                )}
                              </div>

                              {/* Play Buttons overlay */}
                              {hasVideo && (
                                <button type="button"
                                  onClick={(e) => {
                                    e.stopPropagation(); // Stop card flipping
                                    setSelectedVideo(team.videoUrl);
                                    setSelectedTeamName(team.name);
                                  }}
                                  className="absolute inset-0 m-auto w-14 h-14 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 transform scale-90 group-hover:scale-100 opacity-80 group-hover:opacity-100 pointer-events-auto cursor-pointer"
                                  title="Filmi Seçici Kurul Kalitesiyle İzle"
                                >
                                  <Play size={22} fill="currentColor" className="ml-1" />
                                </button>
                              )}
                            </div>

                            {/* Info */}
                            <div className="p-6">
                              <h4 className="text-xl font-extrabold text-white group-hover:text-amber-400 transition-colors line-clamp-1 leading-snug">
                                {team.name}
                              </h4>
                              <p className="text-xs text-slate-400 font-bold mt-1 line-clamp-1 leading-relaxed">
                                🏫 {team.school}
                              </p>
                              <span className="inline-block mt-3 text-[10px] text-slate-500 font-black tracking-widest uppercase">
                                📍 {team.city || 'Konya'}
                              </span>

                              {team.verse && (
                                <div className="mt-4 p-3 bg-slate-950/60 rounded-xl border border-slate-900/60">
                                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest leading-none mb-1 text-left">Eser Teması / Referans</p>
                                  <p className="text-xs text-slate-400 font-medium italic line-clamp-2 text-left">&ldquo;{team.verse}&rdquo;</p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Footer and Scores */}
                          <div className="p-6 pt-0 border-t border-slate-900/40 mt-4 flex flex-col justify-end">
                            <div className="flex items-center justify-between gap-4 mt-4">
                              <div className="flex-1 font-sans">
                                {team.finalScore !== null && team.finalScore !== undefined ? (
                                  <div className="space-y-1.5">
                                    <div className="flex justify-between items-center flex-wrap gap-1">
                                      <span className="text-[11px] uppercase font-black text-slate-400 tracking-wider block">
                                        {isTop5Winner ? "Ön Jüri Puan Ortalaması" : "Seçici Kurul Puan Ortalaması"}
                                      </span>
                                      {isTop5Winner && (
                                        <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-wider whitespace-nowrap">
                                          Nihai Kürsü: {team.rank || ''}
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="text-lg font-black text-teal-400 font-mono">
                                        {(team.finalScore).toFixed(2)} <span className="text-xs text-slate-400 font-normal">/ 100</span>
                                      </span>
                                      {team.appId && adjustedData.allJuryScores[team.appId] && adjustedData.allJuryScores[team.appId].length > 0 && (
                                        <span className="px-2 py-0.5 rounded bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[11px] font-black uppercase tracking-wider">
                                          {adjustedData.allJuryScores[team.appId].length} Jüri
                                        </span>
                                      )}
                                    </div>
                                    {team.appId && adjustedData.allJuryScores[team.appId] && adjustedData.allJuryScores[team.appId].length > 0 && (
                                      <div className="flex flex-wrap gap-1.5 mt-2">
                                        {adjustedData.allJuryScores[team.appId].map((scoreObj, sIdx) => {
                                          const story = scoreObj.criteria?.story || 0;
                                          const tech = scoreObj.criteria?.technical || 0;
                                          const orig = scoreObj.criteria?.originality || 0;
                                          const theme = scoreObj.criteria?.themeFit || 0;
                                          return (
                                            <span 
                                              key={sIdx} 
                                              className="text-[12px] bg-slate-950 font-bold border border-slate-800 text-slate-300 px-2.5 py-1 rounded whitespace-nowrap"
                                              title={`Senaryo: ${story}, Teknik: ${tech}, Özgünlük: ${orig}, Tema: ${theme}`}
                                            >
                                              {sIdx + 1}. Jüri: <strong className="text-teal-400 font-mono font-black">{scoreObj.total}</strong>
                                            </span>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div>
                                    <span className="text-[11px] uppercase font-black text-slate-400 tracking-wider block">Değerlendirme</span>
                                    <span className="text-xs font-bold text-slate-600 italic">Puan Hesaplanıyor</span>
                                  </div>
                                )}
                              </div>

                              {hasVideo ? (
                                <button type="button"
                                  onClick={(e) => {
                                    e.stopPropagation(); // Stop flipping
                                    setSelectedVideo(team.videoUrl);
                                    setSelectedTeamName(team.name);
                                  }}
                                  className="inline-flex items-center gap-1.5 text-xs font-black text-amber-400 hover:text-amber-300 transition-colors cursor-pointer uppercase tracking-wider bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 shadow"
                                >
                                  Filmi İzle <ExternalLink size={12} />
                                </button>
                              ) : (
                                <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Eser Bekleniyor</span>
                              )}
                            </div>

                            <div className="text-xs text-amber-500 font-black text-right mt-3 uppercase tracking-widest flex items-center justify-end gap-1.5 select-none opacity-80 group-hover:opacity-100 transition-opacity">
                              Değerlendirme Raporu İçin Tıkla <RotateCw size={11} className="text-amber-500 animate-spin-slow" />
                            </div>
                          </div>
                        </div>

                        {/* 2. BACK SIDE OF CARD (Jury Feedback & Metrics) */}
                        <div className="card-back absolute inset-0 w-full h-full bg-slate-950 border border-slate-800 rounded-[2rem] p-6 flex flex-col justify-between overflow-y-auto z-20">
                          <div>
                            {/* Header */}
                            <div className="flex justify-between items-center mb-4 border-b border-slate-900 pb-3">
                              <div>
                                <h3 className="text-xs font-black text-amber-500 uppercase tracking-widest">Seçici Kurul Değerlendirmesi</h3>
                                <p className="text-xs text-slate-500 font-bold mt-0.5">{team.name}</p>
                              </div>
                              <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400">
                                <Award size={16} />
                              </div>
                            </div>

                            {/* Metrics & Evaluation Section */}
                            <div className="space-y-6 my-4">
                              {/* 1. Pre-Jury (Ön Jüri) section (shown if scores exist) */}
                              {team.appId && adjustedData.allJuryScores[team.appId] && adjustedData.allJuryScores[team.appId].length > 0 ? (
                                <div className="space-y-2">
                                  <span className="text-[11px] font-black uppercase text-teal-400 tracking-wider block">
                                    Seçici Kurul (Ön Jüri) Puan Detayı
                                  </span>
                                  {(() => {
                                    const jScores = adjustedData.allJuryScores[team.appId];
                                    const totalJuries = jScores.length;
                                    
                                    const avgStory = (jScores.reduce((sum, s) => sum + (s.criteria?.story || 0), 0) / totalJuries).toFixed(1);
                                    const avgTech = (jScores.reduce((sum, s) => sum + (s.criteria?.technical || 0), 0) / totalJuries).toFixed(1);
                                    const avgOrig = (jScores.reduce((sum, s) => sum + (s.criteria?.originality || 0), 0) / totalJuries).toFixed(1);
                                    const avgTheme = (jScores.reduce((sum, s) => sum + (s.criteria?.themeFit || 0), 0) / totalJuries).toFixed(1);

                                    const criteriaList = [
                                      { label: "Senaryo & Anlatım", val: parseFloat(avgStory), max: 25, color: "from-teal-500 to-emerald-500" },
                                      { label: "Teknik & Estetik", val: parseFloat(avgTech), max: 25, color: "from-blue-500 to-indigo-500" },
                                      { label: "Özgünlük & Yaratıcılık", val: parseFloat(avgOrig), max: 25, color: "from-purple-500 to-pink-500" },
                                      { label: "Tematik Uyum", val: parseFloat(avgTheme), max: 25, color: "from-amber-500 to-orange-500" }
                                    ];

                                    return (
                                      <div className="space-y-2 bg-slate-900/40 p-3 rounded-2xl border border-slate-900">
                                        <div className="flex justify-between items-center text-[11px] font-bold text-slate-400 mb-1 pb-1 border-b border-slate-900">
                                          <span>Ön Jüri Genel Ortalaması:</span>
                                          <span className="text-teal-400 font-mono font-black">{(team.finalScore || 0).toFixed(2)} / 100</span>
                                        </div>
                                        {criteriaList.map((crit, cIdx) => (
                                          <div key={cIdx} className="space-y-1">
                                            <div className="flex justify-between items-center text-[12px] font-extrabold pb-0.5">
                                              <span className="text-slate-300">{crit.label}</span>
                                              <span className="text-amber-400">{crit.val} <span className="text-slate-500 font-normal">/ {crit.max}</span></span>
                                            </div>
                                            <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                                              <div 
                                                className={`bg-gradient-to-r ${crit.color} h-full rounded-full transition-all duration-1000`}
                                                style={{ width: `${(crit.val / crit.max) * 100}%` }}
                                              ></div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    );
                                  })()}
                                </div>
                              ) : null}

                              {/* 2. Academic Jury section (only for winner teams) */}
                              {isTop5Winner ? (
                                <div className="space-y-2 pt-3 border-t border-slate-900/50">
                                  <span className="text-[11px] font-black uppercase text-amber-500 tracking-wider block">
                                    Akademisyen Değerlendirme Raporu
                                  </span>
                                  <AcademicJuryScorePanel teamName={team.name} category={team.category} hideMetaData={true} />
                                </div>
                              ) : null}
                            </div>

                            {/* Feedback Text Area */}
                            <div className="mt-4">
                              <span className="text-[12.5px] font-black uppercase text-slate-400 tracking-wider">Seçici Kurul Görüşü</span>
                              <p className="text-[13px] md:text-[13px] text-slate-200 leading-relaxed font-medium mt-1.5 bg-slate-900/80 p-5 border border-slate-800 rounded-2xl text-justify leading-relaxed select-text">
                                {getJuryFeedback(team.name, team.category, adjustedData.allJuryScores[team.appId] || [], team.finalScore, team.rank)}
                              </p>
                            </div>
                          </div>

                          {/* Footer return advice */}
                          <div className="border-t border-slate-900/60 pt-4 mt-4 flex items-center justify-between">
                            <span className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5 font-sans">
                              <RotateCw size={11} className="text-amber-500/60 animate-spin-slow" /> KARTI ÇEVİR
                            </span>
                            <span className="text-xs text-teal-400 font-mono font-black">
                              {team.finalScore ? `Skor: ${team.finalScore.toFixed(2)}` : 'Skor Alınamadı'}
                            </span>
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
      </>
      )}

      {/* Cinematic Modal Video Player Overlay */}
      {selectedVideo && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-fadeIn"
          onClick={() => {
            setSelectedVideo(null);
            setSelectedTeamName(null);
          }}
        >
          {/* Close button */}
          <button type="button" 
            className="absolute top-6 right-6 text-slate-400 hover:text-white transition-all p-3 hover:bg-slate-900 rounded-full"
            onClick={() => {
              setSelectedVideo(null);
              setSelectedTeamName(null);
            }}
          >
            <X size={32} />
          </button>
          
          <div 
            className="w-full max-w-5xl aspect-video rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl relative overflow-hidden animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            {getCinemaEmbedUrl(selectedVideo) ? (
              <iframe
                src={getCinemaEmbedUrl(selectedVideo) || ''}
                title={`${selectedTeamName || 'Eser'} - Reflect & Shoot Gala Salonu`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="no-referrer"
              ></iframe>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-8">
                <Film size={48} className="text-slate-800 mb-4 animate-pulse" />
                <p className="text-lg font-black">{selectedTeamName}</p>
                <p className="text-xs text-slate-600 mt-2">Bu film doğrudan izlenememektedir. Lütfen bağlantıyı harici sekmede açınız:</p>
                <a 
                  href={selectedVideo} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider"
                >
                  Tarayıcıda Aç <ExternalLink size={14} />
                </a>
              </div>
            )}
            
            {/* Title card footer in modal */}
            {selectedTeamName && (
              <div className="absolute bottom-0 left-0 right-0 bg-slate-950/80 backdrop-blur-md p-4 px-6 border-t border-slate-900 border-dashed text-left flex justify-between items-center">
                <span className="text-sm font-black text-white">{selectedTeamName} &mdash; Festival Yayını</span>
                <span className="text-[10px] text-amber-500 font-extrabold uppercase tracking-widest">Reflect & Shoot 2026</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Embedded generic animations inside standard CSS */}
      <style>{`
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes scaleIn {
            from { transform: scale(0.95); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }
        .animate-fadeIn {
            animation: fadeIn 0.4s ease-out forwards;
        }
        .animate-scaleIn {
            animation: scaleIn 0.3s ease-out forwards;
        }
        .card-perspective {
            perspective: 1500px;
        }
        .card-inner {
            transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
            transform-style: preserve-3d;
            height: 100%;
            width: 100%;
        }
        .card-flipped {
            transform: rotateY(180deg);
        }
        .card-front, .card-back {
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        }
        .card-front {
            position: relative;
            transform: rotateY(0deg);
        }
        .card-back {
            transform: rotateY(180deg);
        }
        .animate-spin-slow {
            animation: spin 6s linear infinite;
        }
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
