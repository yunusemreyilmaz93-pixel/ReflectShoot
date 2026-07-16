import React from 'react';
import {
  Clapperboard,
  Users,
  MessageSquare,
  Film,
  BookOpen,
  AlertOctagon,
  type LucideIcon,
} from 'lucide-react';
import type { Application } from '../../types';
import type { TeacherProgressBreakdown } from '../../lib/domain/teacherDashboard';
import { ProductionStatusRing, NextActionCard, TeamSwitcher } from './DashboardWidgets';
import { DASHBOARD_TAB_LABELS, type DashboardTabId } from './dashboardTabs';

const NAV_TABS: { id: DashboardTabId; icon: LucideIcon }[] = [
  { id: 'STATUS', icon: AlertOctagon },
  { id: 'ACADEMY', icon: BookOpen },
  { id: 'DOCUMENTS', icon: Users },
  { id: 'VIDEO', icon: Film },
  { id: 'CHAT', icon: MessageSquare },
];

type Props = {
  app: Application;
  myApplications: Application[];
  activeApplicationId: string | null;
  canCreateTeam: boolean;
  createBlockedReason: string | null;
  seasonLabel?: string;
  progress: number;
  progressParts: TeacherProgressBreakdown;
  isDeadlinePassed: boolean;
  activeTab: DashboardTabId;
  showRedDot: boolean;
  onSwitchTeam: (id: string) => void;
  onCreateTeam: () => void;
  onAction: (tab: string) => void;
  onTabChange: (tab: DashboardTabId) => void;
};

export function DashboardHero({
  app,
  myApplications,
  activeApplicationId,
  canCreateTeam,
  createBlockedReason,
  seasonLabel,
  progress,
  progressParts,
  isDeadlinePassed,
  activeTab,
  showRedDot,
  onSwitchTeam,
  onCreateTeam,
  onAction,
  onTabChange,
}: Props) {
  return (
    <div className="relative pt-8 pb-12 bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <TeamSwitcher
          applications={myApplications}
          activeId={activeApplicationId}
          onSwitch={onSwitchTeam}
          onCreate={onCreateTeam}
          canCreate={canCreateTeam}
          createBlockedReason={createBlockedReason}
        />

        {app.archived && (
          <div
            role="status"
            className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100"
          >
            <p className="font-medium">
              <span className="font-black text-amber-300">Bu sezon arşiv</span>
              {' — '}yeni takım için + butonunu kullanın
              {seasonLabel ? ` (${seasonLabel} aktif sezonda).` : '.'}
            </p>
            {canCreateTeam && (
              <button
                type="button"
                onClick={onCreateTeam}
                className="shrink-0 inline-flex items-center justify-center gap-1 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black"
              >
                + Yeni takım
              </button>
            )}
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div className="flex items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-1 flex-wrap">
                <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                  {app.team.name}
                </h1>
                <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  {app.team.category}
                </span>
                {seasonLabel && (
                  <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    {seasonLabel}
                  </span>
                )}
              </div>
              <p className="text-slate-400 font-medium flex items-center gap-2">
                <Clapperboard size={14} className="text-rose-500" /> {app.teacher.school}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 bg-slate-900/50 p-4 rounded-3xl border border-slate-800/50 backdrop-blur-sm">
            <div className="text-right hidden sm:block">
              <span className="block text-white font-bold text-lg leading-none mb-1">
                Hazırlık Süreci
              </span>
              <span className="block text-slate-500 text-xs font-medium uppercase tracking-wider">
                {progress === 100 ? 'Tamamlandı' : 'Devam Ediyor'}
              </span>
              <span className="block text-[10px] text-slate-600 mt-1.5 font-medium">
                Belgeler {progressParts.docsDone}/{progressParts.docsTotal}
                {' · '}
                Video {progressParts.videoDone ? '✓' : '—'}
              </span>
            </div>
            <ProductionStatusRing progress={progress} />
          </div>
        </div>

        <div className="mb-8">
          <NextActionCard app={app} isDeadlinePassed={isDeadlinePassed} onAction={onAction} />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide" role="tablist" aria-label="Panel sekmeleri">
          {NAV_TABS.map((tab) => {
            const selected = activeTab === tab.id;
            return (
              <button
                type="button"
                key={tab.id}
                role="tab"
                aria-selected={selected}
                onClick={() => onTabChange(tab.id)}
                className={`
                  flex items-center gap-2 px-6 py-4 rounded-xl font-bold text-sm transition-all whitespace-nowrap border-b-4
                  ${
                    selected
                      ? 'bg-slate-800 text-white border-rose-500 shadow-lg'
                      : 'bg-transparent text-slate-500 border-transparent hover:bg-slate-900 hover:text-white'
                  }
                `}
              >
                <tab.icon size={18} className={selected ? 'text-rose-500' : ''} />
                {DASHBOARD_TAB_LABELS[tab.id]}
                {tab.id === 'CHAT' &&
                  (activeTab === 'CHAT' ? (
                    <span className="ml-2 relative inline-flex rounded-full h-3 w-3 bg-green-500 shadow-[0_0_10px_#22c55e]" />
                  ) : showRedDot ? (
                    <span className="ml-2 relative flex h-3 w-3" aria-label="Yeni mesaj">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
                    </span>
                  ) : null)}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
