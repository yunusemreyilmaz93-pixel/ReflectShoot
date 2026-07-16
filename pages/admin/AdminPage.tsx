import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Application } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { AdminCMS } from '../../components/admin/AdminCMS';
import { AdminJuryStatus } from '../../components/admin/AdminJuryStatus';
import { AdminAwards } from '../../components/admin/AdminAwards';
import { AdminCertificates } from '../../components/admin/AdminCertificates';
import { AdminSkeleton } from './AdminSkeleton';
import { AdminSidebar } from './AdminSidebar';
import { AdminDashboard } from './AdminOverview';
import { AdminTeams } from './AdminTeamsSection';
import { AdminJuryAssign } from './AdminJuryAssignSection';
import { AdminUsers } from './AdminUsersSection';
import { AdminInbox } from './AdminInboxSection';
import { AdminAnnouncements } from './AdminAnnouncementsSection';
import { AdminAcademicResults } from './AdminAcademicResultsSection';
import { AdminSettings } from './AdminSettingsSection';
import { AdminLogs } from './AdminLogsSection';
import { AdminTeamDetailDrawer } from './AdminTeamDetailDrawer';
import { ADMIN_TAB_TITLES, isAdminTabId, type AdminTabId } from './adminTabs';

export const Admin: React.FC = () => {
  const {
    allApplications,
    logout,
    loading,
    setSimulatedApplicationId,
    updateApplication,
    logAction,
  } = useAppContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const activeTab: AdminTabId = isAdminTabId(tabFromUrl) ? tabFromUrl : 'DASHBOARD';

  const setActiveTab = useCallback(
    (tab: string) => {
      const next = isAdminTabId(tab) ? tab : 'DASHBOARD';
      setSearchParams(next === 'DASHBOARD' ? {} : { tab: next }, { replace: true });
    },
    [setSearchParams]
  );

  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [globalCategoryFilter, setGlobalCategoryFilter] = useState<string | null>(null);

  useEffect(() => {
    setSimulatedApplicationId(null);
  }, [setSimulatedApplicationId]);

  // Production one-off data patches must never run from Admin mount.
  // See scripts/ops-oneoffs/ and markWinners.ts for manual ops.

  const handleFilterCategory = (cat: string | null) => {
    setGlobalCategoryFilter(cat);
    setActiveTab('TEAMS');
  };

  const toggleFinalist = async (app: Application) => {
    const newState = !app.team.isFinalist;
    const updated = { ...app, team: { ...app.team, isFinalist: newState } };
    await updateApplication(updated);
    await logAction(
      'TOGGLE_FINALIST',
      `${app.team.name} finalist durumu: ${newState ? 'EVET' : 'HAYIR'}`,
      app.id
    );
    if (selectedApp?.id === app.id) {
      setSelectedApp(updated);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex font-sans text-slate-200 selection:bg-rose-500 selection:text-white">
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={logout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto w-full transition-all duration-300">
        <header className="flex justify-between items-center mb-6 md:mb-8">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 text-slate-400 hover:text-white bg-slate-800 rounded-lg shrink-0"
              aria-label="Menüyü aç"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight truncate">
              {ADMIN_TAB_TITLES[activeTab]}
            </h2>
          </div>
        </header>

        <div className="w-full h-[calc(100vh-140px)]">
          {loading ? (
            <AdminSkeleton />
          ) : (
            <>
              {activeTab === 'DASHBOARD' && (
                <AdminDashboard apps={allApplications} onFilterCategory={handleFilterCategory} />
              )}
              {activeTab === 'ANNOUNCEMENTS' && <AdminAnnouncements />}
              {activeTab === 'INBOX' && <AdminInbox />}
              {activeTab === 'TEAMS' && (
                <AdminTeams
                  apps={allApplications}
                  onSelectApp={setSelectedApp}
                  onToggleFinalist={toggleFinalist}
                  initialCategoryFilter={globalCategoryFilter}
                />
              )}
              {activeTab === 'AWARDS' && <AdminAwards apps={allApplications} />}
              {activeTab === 'ACADEMIC_RESULTS' && (
                <AdminAcademicResults apps={allApplications} />
              )}
              {activeTab === 'JURY_ASSIGN' && <AdminJuryAssign apps={allApplications} />}
              {activeTab === 'JURY_STATUS' && <AdminJuryStatus apps={allApplications} />}
              {activeTab === 'USERS' && <AdminUsers />}
              {activeTab === 'CONTENT' && <AdminCMS />}
              {activeTab === 'CERTIFICATES' && <AdminCertificates />}
              {activeTab === 'SETTINGS' && <AdminSettings />}
              {activeTab === 'LOGS' && <AdminLogs />}
            </>
          )}
        </div>
      </main>

      {selectedApp && (
        <AdminTeamDetailDrawer
          app={selectedApp}
          onClose={() => setSelectedApp(null)}
          onAppUpdated={setSelectedApp}
        />
      )}
    </div>
  );
};
