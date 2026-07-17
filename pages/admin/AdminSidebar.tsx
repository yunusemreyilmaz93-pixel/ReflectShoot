import React, { useMemo } from 'react';
import {
  X,
  Shield,
  LayoutDashboard,
  Mail,
  Megaphone,
  Medal,
  GraduationCap,
  UserCheck,
  ListChecks,
  Users,
  UsersRound,
  LayoutTemplate,
  ScrollText,
  Settings,
  History,
  LogOut,
  type LucideIcon,
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import {
  countUnassignedWithVideo,
  countUnreadMessages,
} from '../../lib/domain/adminOps';
import { ADMIN_NAV_GROUPS, ADMIN_TAB_TITLES, type AdminTabId } from './adminTabs';

const ICONS: Record<string, LucideIcon> = {
  LayoutDashboard,
  Mail,
  Megaphone,
  UsersRound,
  Medal,
  GraduationCap,
  UserCheck,
  ListChecks,
  Users,
  LayoutTemplate,
  ScrollText,
  Settings,
  History,
};

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const AdminSidebar = ({
  activeTab,
  setActiveTab,
  onLogout,
  isOpen,
  onClose,
}: SidebarProps) => {
  const { allApplications, contactMessages } = useAppContext();

  const badges = useMemo(() => {
    const unread = countUnreadMessages(contactMessages || []);
    const unassigned = countUnassignedWithVideo(allApplications || []);
    const map: Partial<Record<AdminTabId, number>> = {};
    if (unread > 0) map.INBOX = unread;
    if (unassigned > 0) map.JURY_ASSIGN = unassigned;
    return map;
  }, [allApplications, contactMessages]);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <div
        className={`
                fixed top-0 left-0 h-full w-72 bg-slate-900 border-r border-slate-800 
                flex flex-col z-50 transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
                md:translate-x-0
            `}
      >
        <div className="p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="bg-rose-600 p-2 rounded-lg">
              <Shield size={20} className="text-white" aria-hidden />
            </div>
            <div>
              <h1 className="font-bold text-white tracking-tight leading-tight">Yönetici</h1>
              <p className="text-slate-500 text-sm font-medium">Reflect&Shoot</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="md:hidden text-slate-400 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/60 rounded-lg"
            aria-label="Menüyü kapat"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-5 overflow-y-auto" aria-label="Yönetici menü">
          {ADMIN_NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                {group.label}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = ICONS[item.icon] || LayoutDashboard;
                  const isActive = activeTab === item.id;
                  const label = ADMIN_TAB_TITLES[item.id];
                  const badge = badges[item.id];
                  const accessibleName =
                    badge && badge > 0 ? `${label}, ${badge} bekleyen` : label;

                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id as AdminTabId);
                        onClose();
                      }}
                      aria-label={accessibleName}
                      aria-current={isActive ? 'page' : undefined}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/60 ${
                        isActive
                          ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/20'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <Icon size={18} className="shrink-0" aria-hidden />
                      <span className="truncate whitespace-nowrap leading-none flex-1 text-left">
                        {label}
                      </span>
                      {badge != null && badge > 0 && (
                        <span
                          className={`shrink-0 min-w-[1.25rem] h-5 px-1.5 rounded-full text-[11px] font-bold flex items-center justify-center ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-rose-600/90 text-white'
                          }`}
                          aria-hidden
                        >
                          {badge > 99 ? '99+' : badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-3 py-3 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/60"
          >
            <LogOut size={18} className="shrink-0" aria-hidden />
            <span className="leading-none">Çıkış Yap</span>
          </button>
        </div>
      </div>
    </>
  );
};
