import React from 'react';
import { Ban } from 'lucide-react';
import type { Application } from '../../types';
import { TeamSwitcher } from './DashboardWidgets';

type Props = {
  app: Application;
  myApplications: Application[];
  activeApplicationId: string | null;
  canCreateTeam: boolean;
  createBlockedReason: string | null;
  onSwitch: (id: string) => void;
  onCreate: () => void;
};

export function DashboardDisqualifiedView({
  app,
  myApplications,
  activeApplicationId,
  canCreateTeam,
  createBlockedReason,
  onSwitch,
  onCreate,
}: Props) {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center animate-fadeIn relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none" />
      <div className="relative z-10 max-w-2xl w-full">
        {myApplications.length > 1 && (
          <div className="mb-6 text-left">
            <TeamSwitcher
              applications={myApplications}
              activeId={activeApplicationId}
              onSwitch={onSwitch}
              onCreate={onCreate}
              canCreate={canCreateTeam}
              createBlockedReason={createBlockedReason}
            />
          </div>
        )}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-red-900/30 p-10 rounded-3xl shadow-2xl flex flex-col items-center">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full animate-pulse" />
            <div className="relative w-24 h-24 bg-slate-950 border border-red-500/50 rounded-full flex items-center justify-center shadow-2xl">
              <Ban size={48} className="text-red-500" />
            </div>
          </div>
          <h1 className="text-3xl font-black text-white mb-4">Erişim Engellendi</h1>
          <p className="text-lg text-slate-300 mb-2 font-light">
            Üzgünüz, <strong className="text-white">{app.team.name}</strong> takımı diskalifiye
            edilmiştir.
          </p>
          {myApplications.length > 1 && (
            <p className="text-sm text-slate-500 mb-4">
              Diğer takımlarınıza yukarıdaki listeden geçebilirsiniz.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
