import React, { useMemo, useState } from 'react';
import {
  Inbox,
  Film,
  Video,
  Cpu,
  Activity,
  PieChart,
  MapPin,
  Star,
  Trophy,
  TrendingUp,
  ChevronRight,
  ListTodo,
} from 'lucide-react';
import { Category, Application } from '../../types';
import { useAppContext } from '../../context/AppContext';
import {
  buildAdminActionQueue,
  trendCountsLast30Days,
  type AdminOpsTab,
} from '../../lib/domain/adminOps';
import { SimpleTrendChart } from './AdminCharts';
import { AdminEmptyState } from './AdminEmptyState';
import type { AdminTabId } from './adminTabs';

const CARD =
  'bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-lg';

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/60';

export const AnalyticsSection = ({
  apps,
  onFilterCategory,
}: {
  apps: Application[];
  onFilterCategory: (cat: string | null) => void;
}) => {
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);

  const handleCategoryClick = (catId: string) => {
    const newFilter = selectedCategoryFilter === catId ? null : catId;
    setSelectedCategoryFilter(newFilter);
    onFilterCategory(newFilter);
  };

  const trendData = useMemo(() => trendCountsLast30Days(apps), [apps]);

  const categoryData = [
    {
      id: Category.LIVE_ACTION,
      name: 'Canlı Çekim',
      value: apps.filter((a) => a.team.category === Category.LIVE_ACTION).length,
      color: '#0d9488',
    },
    {
      id: Category.AI_ANIMATION,
      name: 'AI Animasyon',
      value: apps.filter((a) => a.team.category === Category.AI_ANIMATION).length,
      color: '#9333ea',
    },
  ];

  const cityData = useMemo(() => {
    const counts: Record<string, number> = {};
    apps.forEach((app) => {
      const city = app.teacher.city || 'Belirtilmedi';
      counts[city] = (counts[city] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value }));
  }, [apps]);

  const maxCity = cityData.length ? Math.max(...cityData.map((c) => c.value)) : 1;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <div className={`${CARD} flex flex-col justify-between`}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-semibold text-white flex items-center gap-2 text-sm">
            <TrendingUp size={16} className="text-rose-500" aria-hidden /> Başvuru Trendi
          </h3>
          <span className="text-xs font-medium bg-slate-900 text-slate-400 px-2 py-1 rounded">
            Son 30 gün
          </span>
        </div>
        <div className="flex-1 flex items-end">
          <SimpleTrendChart data={trendData} />
        </div>
      </div>

      <div className={CARD}>
        <h3 className="font-semibold text-white flex items-center gap-2 text-sm mb-6">
          <PieChart size={16} className="text-blue-500" aria-hidden /> Kategori Dağılımı
        </h3>
        <div className="space-y-3">
          {categoryData.map((slice) => (
            <button
              type="button"
              key={slice.id}
              onClick={() => handleCategoryClick(slice.id)}
              className={`w-full flex justify-between items-center text-xs p-2 rounded-lg transition-all ${focusRing} ${
                selectedCategoryFilter === slice.id
                  ? 'bg-slate-700 ring-1 ring-white/20'
                  : 'hover:bg-slate-700/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: slice.color }}
                  aria-hidden
                />
                <span className="text-slate-300">{slice.name}</span>
              </div>
              <span className="font-semibold text-white">
                {slice.value}{' '}
                <span className="text-slate-500 font-normal">
                  ({apps.length ? ((slice.value / apps.length) * 100).toFixed(0) : 0}%)
                </span>
              </span>
            </button>
          ))}
          {selectedCategoryFilter && (
            <button
              type="button"
              onClick={() => {
                setSelectedCategoryFilter(null);
                onFilterCategory(null);
              }}
              className={`w-full mt-2 py-1 text-xs text-rose-400 hover:text-rose-300 font-semibold ${focusRing} rounded-lg`}
            >
              Filtreyi temizle
            </button>
          )}
        </div>
      </div>

      <div className={`${CARD} flex flex-col h-[320px]`}>
        <h3 className="font-semibold text-white flex items-center gap-2 text-sm mb-6">
          <MapPin size={16} className="text-amber-500" aria-hidden /> Şehir Bazlı Katılım
        </h3>
        <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
          {cityData.length > 0 ? (
            cityData.map((city) => (
              <div key={city.name} className="mb-4 last:mb-0">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-semibold">{city.name}</span>
                  <span className="text-slate-500">{city.value} Takım</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all duration-1000"
                    style={{ width: `${(city.value / maxCity) * 100}%` }}
                  />
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500 text-center py-8">Henüz şehir verisi yok</p>
          )}
        </div>
      </div>
    </div>
  );
};

export const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-slate-700/50 rounded-lg ${className}`} />
);

type KpiProps = {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  iconWrap: string;
  onClick?: () => void;
  ariaLabel?: string;
};

const KpiCard = ({ label, value, icon, iconWrap, onClick, ariaLabel }: KpiProps) => {
  const inner = (
    <>
      <div className="flex justify-between items-start mb-3">
        <div className={`p-2.5 rounded-xl ${iconWrap}`}>{icon}</div>
      </div>
      <div className="text-4xl font-black text-white mb-1 tabular-nums">{value}</div>
      <div className="text-sm text-slate-400 font-medium">{label}</div>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={ariaLabel || label}
        className={`${CARD} text-left w-full transition-colors hover:border-slate-600 hover:bg-slate-800/90 ${focusRing}`}
      >
        {inner}
      </button>
    );
  }

  return <div className={CARD}>{inner}</div>;
};

type AdminDashboardProps = {
  apps: Application[];
  onFilterCategory: (cat: string | null) => void;
  onNavigateTab: (tab: AdminTabId) => void;
};

export const AdminDashboard = ({
  apps,
  onFilterCategory,
  onNavigateTab,
}: AdminDashboardProps) => {
  const { contactMessages } = useAppContext();

  const totalApps = apps.length;
  const finalistCount = apps.filter((a) => a.team.isFinalist).length;
  const videoCount = apps.filter(
    (a) => a.team.videoStatus === 'UPLOADED' || a.team.videoStatus === 'SUBMITTED_LINK'
  ).length;

  const liveActionRankings = useMemo(
    () =>
      apps
        .filter((a) => a.team.category === Category.LIVE_ACTION && a.finalScore !== undefined)
        .sort((a, b) => (b.finalScore || 0) - (a.finalScore || 0))
        .slice(0, 10),
    [apps]
  );

  const aiRankings = useMemo(
    () =>
      apps
        .filter((a) => a.team.category === Category.AI_ANIMATION && a.finalScore !== undefined)
        .sort((a, b) => (b.finalScore || 0) - (a.finalScore || 0))
        .slice(0, 10),
    [apps]
  );

  const gradedApps = apps.filter((a) => a.finalScore !== undefined && a.finalScore > 0);
  const avgScore =
    gradedApps.length > 0
      ? (
          gradedApps.reduce((acc, curr) => acc + (curr.finalScore || 0), 0) / gradedApps.length
        ).toFixed(1)
      : '0.0';

  const actionQueue = useMemo(
    () => buildAdminActionQueue(apps, contactMessages || []),
    [apps, contactMessages]
  );

  const go = (tab: AdminOpsTab | AdminTabId) => onNavigateTab(tab as AdminTabId);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Operator action queue */}
      <section className={CARD} aria-labelledby="admin-action-queue-heading">
        <div className="flex items-center gap-2 mb-4">
          <ListTodo size={18} className="text-rose-500 shrink-0" aria-hidden />
          <h3 id="admin-action-queue-heading" className="font-semibold text-white text-sm">
            Bugün ne yapılmalı?
          </h3>
        </div>
        {actionQueue.length === 0 ? (
          <p className="text-sm text-slate-400">Şu an bekleyen operasyon yok.</p>
        ) : (
          <ul className="space-y-2">
            {actionQueue.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => go(item.tab)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-700/80 hover:border-slate-600 hover:bg-slate-900 transition-colors text-left ${focusRing}`}
                >
                  <span className="min-w-[2rem] h-8 px-2 rounded-lg bg-rose-600/15 text-rose-400 text-sm font-black flex items-center justify-center tabular-nums">
                    {item.count}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{item.label}</p>
                    {item.hint && (
                      <p className="text-xs text-slate-500 truncate">{item.hint}</p>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-slate-400 flex items-center gap-0.5 shrink-0">
                    Git <ChevronRight size={14} aria-hidden />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Başvuru"
          value={totalApps}
          icon={<Inbox size={22} className="text-blue-400" aria-hidden />}
          iconWrap="bg-blue-900/30 text-blue-400"
          onClick={() => {
            onFilterCategory(null);
            go('TEAMS');
          }}
          ariaLabel={`${totalApps} başvuru — takım yönetimine git`}
        />
        <KpiCard
          label="Finalist takım"
          value={finalistCount}
          icon={<Star size={22} className="text-amber-400" aria-hidden />}
          iconWrap="bg-amber-900/30 text-amber-400"
          onClick={() => go('TEAMS')}
          ariaLabel={`${finalistCount} finalist — takım yönetimine git`}
        />
        <KpiCard
          label="Ortalama puan"
          value={avgScore}
          icon={<Activity size={22} className="text-emerald-400" aria-hidden />}
          iconWrap="bg-emerald-900/30 text-emerald-400"
          onClick={() => go('JURY_STATUS')}
          ariaLabel={`Ortalama puan ${avgScore} — jüri ilerlemelerine git`}
        />
        <KpiCard
          label="Video teslim"
          value={videoCount}
          icon={<Video size={22} className="text-rose-400" aria-hidden />}
          iconWrap="bg-rose-900/30 text-rose-400"
          onClick={() => go('JURY_ASSIGN')}
          ariaLabel={`${videoCount} video teslim — jüri atamaya git`}
        />
      </div>

      <AnalyticsSection apps={apps} onFilterCategory={onFilterCategory} />

      {/* Leaderboard */}
      <div className={`${CARD} !p-0 overflow-hidden`}>
        <div className="p-5 border-b border-slate-700 flex items-center gap-3">
          <Trophy size={18} className="text-amber-500" aria-hidden />
          <h3 className="font-semibold text-white text-base">Liderlik tablosu (Top 10)</h3>
        </div>

        <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <RankingColumn
            title="Canlı çekim"
            titleClass="text-teal-400"
            icon={<Film size={16} aria-hidden />}
            rankings={liveActionRankings}
            onEmptyCta={() => go('JURY_ASSIGN')}
          />
          <RankingColumn
            title="Yapay zeka animasyon"
            titleClass="text-purple-400"
            icon={<Cpu size={16} aria-hidden />}
            rankings={aiRankings}
            onEmptyCta={() => go('JURY_ASSIGN')}
          />
        </div>
      </div>
    </div>
  );
};

function RankingColumn({
  title,
  titleClass,
  icon,
  rankings,
  onEmptyCta,
}: {
  title: string;
  titleClass: string;
  icon: React.ReactNode;
  rankings: Application[];
  onEmptyCta: () => void;
}) {
  return (
    <div>
      <h4
        className={`text-sm font-semibold ${titleClass} tracking-wide mb-4 flex items-center gap-2`}
      >
        {icon} {title}
      </h4>
      {rankings.length > 0 ? (
        <div className="space-y-2">
          {rankings.map((app, i) => (
            <div
              key={app.id}
              className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-slate-700/50"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                    i < 3 ? 'bg-amber-500 text-black' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {i + 1}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-white text-sm truncate">{app.team.name}</div>
                  <div className="text-xs text-slate-500 truncate">{app.teacher.school}</div>
                </div>
              </div>
              <div className="text-lg font-black text-amber-500 tabular-nums shrink-0 ml-2">
                {app.finalScore?.toFixed(1)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <AdminEmptyState
          title="Henüz puanlama yok"
          hint="Jüri ataması ve değerlendirme tamamlandıkça sıralama burada görünür."
          actionLabel="Jüri Atama’ya git"
          onAction={onEmptyCta}
          className="!p-8"
        />
      )}
    </div>
  );
}
