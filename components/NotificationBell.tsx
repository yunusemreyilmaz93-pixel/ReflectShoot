
import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Info, CheckCircle2, AlertTriangle, AlertOctagon } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export const NotificationBell: React.FC = () => {
  const { notifications, markNotificationAsRead } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRead = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      markNotificationAsRead(id);
  };

  const getIcon = (type: string) => {
      switch(type) {
          case 'success': return <CheckCircle2 size={16} className="text-green-500" />;
          case 'error': return <AlertOctagon size={16} className="text-red-500" />;
          case 'warning': return <AlertTriangle size={16} className="text-amber-500" />;
          default: return <Info size={16} className="text-blue-500" />;
      }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button type="button" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Bildirimler"
        aria-expanded={isOpen}
        className="relative p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse border border-slate-900"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fadeIn origin-top-right">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
             <h3 className="font-bold text-white text-sm">Bildirimler</h3>
             <span className="text-xs text-slate-500">{unreadCount} okunmamış</span>
          </div>
          
          <div className="max-h-80 overflow-y-auto custom-scrollbar">
              {notifications.length > 0 ? (
                  notifications.map(n => (
                      <div 
                        key={n.id} 
                        className={`p-4 border-b border-slate-800 hover:bg-slate-800 transition-colors flex gap-3 ${n.read ? 'opacity-50' : 'bg-slate-800/30'}`}
                      >
                          <div className="mt-1 flex-shrink-0">{getIcon(n.type)}</div>
                          <div className="flex-1">
                              <h4 className={`text-sm font-bold ${n.read ? 'text-slate-400' : 'text-white'}`}>{n.title}</h4>
                              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{n.message}</p>
                              <span className="text-[10px] text-slate-600 mt-2 block">{new Date(n.createdAt).toLocaleString('tr-TR')}</span>
                          </div>
                          {!n.read && (
                              <button type="button" onClick={(e) => handleRead(e, n.id)} className="text-slate-500 hover:text-green-500 p-1" title="Okundu işaretle">
                                  <Check size={14} />
                              </button>
                          )}
                      </div>
                  ))
              ) : (
                  <div className="p-8 text-center text-slate-500 text-sm">
                      <Bell size={24} className="mx-auto mb-2 opacity-50"/>
                      Henüz bildiriminiz yok.
                  </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
};
