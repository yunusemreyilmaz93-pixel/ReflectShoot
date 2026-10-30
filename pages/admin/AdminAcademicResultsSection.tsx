
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Search, Check, X, Eye, Award, FileText, Shield, Inbox, Download, 
    Users, Film, School, Mail, AlertTriangle, Send, Clapperboard, Video, 
    Cpu, Activity, PieChart, BarChart3, Clock, UserCheck, Star, Plus, Lock, 
    Menu, LayoutDashboard, Settings, LogOut, FileDown, Trash2, MapPin, List, RefreshCw, ChevronRight, UserCog, MessageSquare, ExternalLink, Link as LinkIcon, Save, Youtube, PenTool, LayoutTemplate, HelpCircle, Bell, Image as ImageIcon, Megaphone, BookOpen, Calendar, Trophy, CheckCircle2, AlertOctagon, Info, ToggleRight, ToggleLeft, Power, Globe, Upload, LayoutGrid, Filter, TrendingUp,  Square, CheckSquare, MailOpen, Database, Construction, ChevronDown, Copy, AlertCircle
} from 'lucide-react';
import { Category, Application } from '../../types';
import { AcademicJuryScorePanel } from '../../components/AcademicJuryScorePanel';
import { academicJuryScores } from '../../data/academicJuryScores';

interface AdminAcademicResultsProps {
  apps: Application[];
}

export const AdminAcademicResults = ({ apps }: AdminAcademicResultsProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Data-driven: team names come from academicJuryScores (no hard-coded season list)
  const filteredTeams = useMemo(() => {
    const academicFinalistNames = academicJuryScores.map((r) => r.teamName);
    const normalize = (s: string) => s.toLocaleLowerCase('tr-TR').trim().replace(/\s+/g, '');
    
    return apps.filter(app => {
      const match = academicFinalistNames.some(name => normalize(name) === normalize(app.team.name));
      const matchesCategory = selectedCategory === 'all' || 
                             (selectedCategory === 'canli' && app.team.category === Category.LIVE_ACTION) ||
                             (selectedCategory === 'yz' && app.team.category === Category.AI_ANIMATION);
      const matchesSearch = app.team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (app.teacher?.school || '').toLowerCase().includes(searchQuery.toLowerCase());
      return match && matchesCategory && matchesSearch;
    });
  }, [apps, selectedCategory, searchQuery]);

  return (
    <div className="space-y-6 h-full overflow-y-auto pb-24 px-4 sm:px-6 lg:px-8">
      {/* Top Controls */}
      <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800/85 flex flex-col md:flex-row justify-between gap-4 items-center">
        <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800 w-full md:w-auto">
          <button 
            type="button"
            onClick={() => setSelectedCategory('all')} 
            className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${selectedCategory === 'all' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            TÜMÜ
          </button>
          <button 
            type="button"
            onClick={() => setSelectedCategory('canli')} 
            className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${selectedCategory === 'canli' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            CANLI ÇEKİM
          </button>
          <button 
            type="button"
            onClick={() => setSelectedCategory('yz')} 
            className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${selectedCategory === 'yz' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            YAPAY ZEKA
          </button>
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-4 top-3.5 text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder="Takım veya okul adı ile ara..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950/80 border border-slate-800 rounded-2xl pl-11 pr-4 py-3 text-xs text-white w-full focus:outline-none focus:border-slate-700 transition-colors"
            />
          </div>
        </div>
      </div>

      {filteredTeams.length === 0 ? (
        <div className="bg-slate-900/40 p-12 rounded-3xl border border-dashed border-slate-700 text-center">
          <p className="text-slate-400 font-bold mb-2">Sonuç yok</p>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            Akademik jüri finalist listesinde eşleşen takım bulunamadı veya filtreler çok dar.
            Sezon finalist verisini güncelleyip tekrar deneyin.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {filteredTeams.map((app) => (
            <div key={app.id} className="bg-slate-900 p-8 rounded-[2.2rem] border border-slate-800/80 relative overflow-hidden group hover:border-slate-700/60 transition-colors">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-[40px] pointer-events-none"></div>
              
              {/* Header */}
              <div className="flex justify-between items-start mb-6 border-b border-slate-800/80 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${app.team.category === Category.LIVE_ACTION ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                      {app.team.category}
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{app.teacher?.school}</span>
                  </div>
                  <h3 className="text-lg font-black text-white">{app.team.name}</h3>
                </div>
                <div className="px-3.5 py-1.5 bg-amber-500/10 text-amber-400 text-xs font-black rounded-xl border border-amber-500/20 whitespace-nowrap">
                  {app.team.category === Category.LIVE_ACTION ? (
                    app.team.name.toLowerCase().includes("perileri") ? "Birincilik Ödülü" :
                    app.team.name.toLowerCase().includes("sinemektep") ? "İkincilik Ödülü" :
                    app.team.name.toLowerCase().includes("doubt") ? "Üçüncülük Ödülü" :
                    app.team.name.toLowerCase().includes("kızlar") ? "Jüri Özel Ödülü" :
                    "Mansiyon Ödülü"
                                  ) : (
                    app.team.name.toLowerCase().includes("mitra") ? "Birincilik Ödülü" :
                    app.team.name.toLowerCase().includes("technokasyon") ? "İkincilik Ödülü" :
                    app.team.name.toLowerCase().includes("three") ? "Üçüncülük Ödülü" :
                    app.team.name.toLowerCase().includes("insight") ? "Jüri Özel Ödülü" :
                    "Mansiyon Ödülü"
                  )}
                </div>
              </div>

              {/* Score Component with stateful breakdowns */}
              <AcademicJuryScorePanel 
                teamName={app.team.name} 
                category={app.team.category} 
                hideMetaData={true} 
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
