
import React, { useState } from 'react';
import { 
  BookOpen, Clapperboard, Download, 
  ChevronRight, CheckCircle2, Award, Star, Film, 
  Camera, PenTool, Scissors, Play, Wand2, Layers, 
  Mic2, Settings, MessageCircle, Music, Tv, Users, MonitorPlay, Lightbulb, FileText, Share2, Video
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export const Academy: React.FC = () => {
  const { cmsAcademy } = useAppContext();
  const [activeWorkshop, setActiveWorkshop] = useState<'AI' | 'LIVE'>('AI');

  // Group Academy Items
  const prepItems = cmsAcademy.filter(i => i.category === 'Hazırlık');
  const prodItems = cmsAcademy.filter(i => i.category === 'Prodüksiyon');
  const postItems = cmsAcademy.filter(i => i.category === 'Post-Prodüksiyon');

  // Fallback for demo if CMS is empty
  const hasContent = cmsAcademy.length > 0;

  const renderIcon = (type: string) => {
      switch(type) {
          case 'PDF': return <FileText size={80} />;
          case 'VIDEO': return <Video size={80} />;
          default: return <BookOpen size={80} />;
      }
  };

  const handleOpen = (url: string) => {
      window.open(url, '_blank');
  };

  return (
    <div className="bg-slate-900 min-h-screen font-sans selection:bg-rose-500 selection:text-white">
      
      {/* 1. Cinematic Hero Section */}
      <div className="bg-gradient-to-b from-rose-950 via-slate-900 to-slate-950 text-white pt-32 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[500px] bg-rose-500/10 blur-[120px] rounded-full pointer-events-none mix-blend-screen"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 animate-fadeIn">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold tracking-[0.2em] uppercase mb-6 shadow-[0_0_15px_rgba(245,158,11,0.2)] backdrop-blur-sm">
               <Film size={14} /> SİNEMA ATÖLYESİ
            </div>
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight animate-fadeIn delay-100">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-500 to-amber-300 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                    Reflect&Shoot Akademi
                </span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed mb-10 font-light animate-fadeIn delay-200">
                Fikirden perdeye uzanan yolculukta ihtiyacınız olan <span className="font-semibold text-white">teknik</span> ve <span className="font-semibold text-white">teorik</span> donanım.
            </p>
        </div>
      </div>

      {/* 2. LEVEL 1: OPEN SOURCES (CMS Driven) */}
      <section className="bg-slate-900 py-24 relative z-20">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
             
             {/* Section Header */}
             <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                 <div>
                     <h2 className="text-3xl font-black text-white mb-4 flex items-center gap-3">
                        <span className="w-10 h-10 bg-teal-900/30 text-teal-400 rounded-lg flex items-center justify-center border border-teal-500/30">
                            <BookOpen size={24} />
                        </span>
                        Temel Hazırlık Seti
                     </h2>
                     <p className="text-slate-400 text-lg max-w-xl">
                        Yarışmaya başvuran herkesin erişimine açık, sinemanın ABC'sini oluşturan temel kaynak kütüphanesi.
                     </p>
                 </div>
                 <div className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 shadow-sm text-sm font-semibold text-slate-400 flex items-center gap-2">
                     <CheckCircle2 size={16} className="text-teal-500" /> Herkese Açık Erişim
                 </div>
             </div>

             {/* Cards Grid - CMS Content */}
             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {!hasContent && (
                    <div className="col-span-3 text-center py-10 text-slate-500">İçerik yükleniyor veya henüz eklenmemiş.</div>
                )}
                {prepItems.map((item, idx) => (
                    <div key={idx} onClick={() => handleOpen(item.url)} className="cursor-pointer group bg-slate-800/50 p-8 rounded-2xl border border-slate-700 shadow-lg hover:shadow-2xl hover:border-teal-500/50 hover:bg-slate-800 transition-all duration-300 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 text-white">
                            {renderIcon(item.type)}
                        </div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 rounded-full bg-slate-900 text-slate-400 border border-slate-700 text-xs font-bold uppercase tracking-wider group-hover:bg-teal-900/30 group-hover:text-teal-400 group-hover:border-teal-500/30 transition-colors">
                                {item.type}
                            </span>
                        </div>
                        <h3 className="font-bold text-white text-xl mb-3 group-hover:text-teal-400 transition-colors">{item.title}</h3>
                        <p className="text-slate-400 leading-relaxed mb-6">
                            {item.description}
                        </p>
                        <button className="text-slate-500 font-bold text-sm flex items-center gap-2 group-hover:text-teal-500 transition-colors">
                            Kaynağı İncele <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                ))}
             </div>
         </div>
      </section>

      {/* 4. LEVEL 2: PRODUCTION & POST (CMS Driven) */}
      <div className="bg-slate-900 text-slate-300 relative overflow-hidden pb-32 pt-10 border-t border-slate-800">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }}></div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-rose-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              
              <div className="text-center mb-24">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800 border border-slate-700 text-amber-400 text-sm font-bold tracking-widest uppercase mb-6 shadow-[0_0_15px_rgba(251,191,36,0.1)]">
                      <Star size={14} className="fill-current" /> İleri Seviye Kaynaklar
                  </div>
                  <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4 drop-shadow-2xl">
                    Prodüksiyon & Post
                  </h2>
              </div>

              {/* Prod & Post Grid */}
              <div className="grid md:grid-cols-2 gap-12">
                  {/* Prodüksiyon Column */}
                  <div>
                      <h3 className="text-2xl font-bold text-white mb-6 border-b border-slate-700 pb-2 flex items-center gap-3">
                          <Camera size={24} className="text-rose-500" /> Prodüksiyon
                      </h3>
                      <div className="space-y-4">
                          {prodItems.map((item, idx) => (
                              <div key={idx} onClick={() => handleOpen(item.url)} className="bg-slate-800/40 border border-slate-700 hover:border-rose-500/50 p-5 rounded-xl cursor-pointer hover:bg-slate-800 transition-all group">
                                  <h4 className="font-bold text-white mb-1 group-hover:text-rose-400 transition-colors">{item.title}</h4>
                                  <p className="text-sm text-slate-400">{item.description}</p>
                              </div>
                          ))}
                          {prodItems.length === 0 && <p className="text-slate-500 italic">Yakında eklenecek.</p>}
                      </div>
                  </div>

                  {/* Post-Prodüksiyon Column */}
                  <div>
                      <h3 className="text-2xl font-bold text-white mb-6 border-b border-slate-700 pb-2 flex items-center gap-3">
                          <MonitorPlay size={24} className="text-amber-500" /> Post-Prodüksiyon
                      </h3>
                      <div className="space-y-4">
                          {postItems.map((item, idx) => (
                              <div key={idx} onClick={() => handleOpen(item.url)} className="bg-slate-800/40 border border-slate-700 hover:border-amber-500/50 p-5 rounded-xl cursor-pointer hover:bg-slate-800 transition-all group">
                                  <h4 className="font-bold text-white mb-1 group-hover:text-amber-400 transition-colors">{item.title}</h4>
                                  <p className="text-sm text-slate-400">{item.description}</p>
                              </div>
                          ))}
                          {postItems.length === 0 && <p className="text-slate-500 italic">Yakında eklenecek.</p>}
                      </div>
                  </div>
              </div>

          </div>
      </div>

      <style>{`
        .animate-fadeIn {
            animation: fadeIn 0.8s ease-out forwards;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
      `}</style>
    </div>
  );
};
