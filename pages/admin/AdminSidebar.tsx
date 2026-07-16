import React from 'react';
import {
  X,
  Shield,
  LayoutDashboard,
  Mail,
  Megaphone,
  Clapperboard,
  Trophy,
  Award,
  UserCheck,
  Activity,
  Users,
  LayoutTemplate,
  FileText,
  Settings,
  List,
  LogOut,
  type LucideIcon,
} from 'lucide-react';
import { ADMIN_NAV_GROUPS, type AdminTabId } from './adminTabs';

const ICONS: Record<string, LucideIcon> = {
  LayoutDashboard,
  Mail,
  Megaphone,
  Clapperboard,
  Trophy,
  Award,
  UserCheck,
  Activity,
  Users,
  LayoutTemplate,
  FileText,
  Settings,
  List,
};

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const AdminSidebar = ({ activeTab, setActiveTab, onLogout, isOpen, onClose }: SidebarProps) => {
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
                fixed top-0 left-0 h-full w-64 bg-slate-900 border-r border-slate-800 
                flex flex-col z-50 transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
                md:translate-x-0
            `}
      >
        <div className="p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="bg-rose-600 p-2 rounded-lg">
              <Shield size={20} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white tracking-tight leading-tight">Yönetici</h1>
              <p className="text-slate-500 text-sm font-medium">Reflect&Shoot</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="md:hidden text-slate-400 hover:text-white"
            aria-label="Menüyü kapat"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-5 overflow-y-auto" aria-label="Yönetici menü">
          {ADMIN_NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="px-4 mb-2 text-[10px] font-black uppercase tracking-widest text-slate-600">
                {group.label}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = ICONS[item.icon] || LayoutDashboard;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id as AdminTabId);
                        onClose();
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                        isActive
                          ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/20'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <Icon size={18} />
                      {item.label}
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
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <LogOut size={18} />
            Çıkış Yap
          </button>
        </div>
      </div>
    </>
  );
};
