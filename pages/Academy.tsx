
import React, { useState } from 'react';
import { 
  BookOpen, Clapperboard, Download, 
  ChevronRight, CheckCircle2, Award, Star, Film, 
  Camera, PenTool, Scissors, Play, Wand2, Layers, 
  Mic2, Settings, MessageCircle, Music, Tv, Users, MonitorPlay, Lightbulb, FileText, Share2, Video, Cpu, Link as LinkIcon, Calendar, Lock
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { CMSAcademyItem } from '../types';

export const Academy: React.FC = () => {
  const { cmsAcademy } = useAppContext();
  
  // Group Academy Items (from CMS)
  const prepItems = cmsAcademy.filter(i => i.category === 'Hazırlık');
  
  const hasContent = prepItems.length > 0;

  const renderIcon = (type: string) => {
      switch(type) {
          case 'PDF': return <FileText size={80} />;
          case 'VIDEO': return <Video size={80} />;
          case 'LINK': return <LinkIcon size={80} />;
          default: return <BookOpen size={80} />;
      }
  };

  const getSubTagColor = (tag?: string) => {
      switch(tag) {
          case 'Yapay Zeka': return 'bg-purple-900/50 text-purple-300 border-purple-500/30';
          case 'Canlı Çekim': return 'bg-teal-900/50 text-teal-300 border-teal-500/30';
          default: return 'bg-amber-900/30 text-amber-300 border-amber-500/30';
      }
  };

  const getSubTagIcon = (tag?: string) => {
      switch(tag) {
          case 'Yapay Zeka': return <Cpu size={12} className="mr-1"/>;
          case 'Canlı Çekim': return <Camera size={12} className="mr-1"/>;
          default: return <BookOpen size={12} className="mr-1"/>;
      }
  };

  const handleOpen = (url: string) => {
      if (url && url !== '#') {
          window.open(url, '_blank');
      } else {
          alert('Bu kaynak yakında erişime açılacaktır.');
      }
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
                    <div key={idx} onClick={() => handleOpen(item.url)} className="cursor-pointer group bg-slate-800/50 p-8 rounded-2xl border border-slate-700 shadow-lg hover:shadow-2xl hover:border-teal-500/50 hover:bg-slate-800 transition-all duration-300 relative overflow-hidden flex flex-col h-full">
                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 text-white">
                            {renderIcon(item.type)}
                        </div>
                        
                        <div className="flex items-center gap-2 mb-4">
                            <span className="px-3 py-1 rounded-full bg-slate-950 text-slate-400 border border-slate-700 text-[10px] font-bold uppercase tracking-wider group-hover:bg-slate-900 transition-colors">
                                {item.type}
                            </span>
                            {/* Sub Tag Badge */}
                            {(item.subTag || item.category === 'Hazırlık') && (
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center ${getSubTagColor(item.subTag)}`}>
                                    {getSubTagIcon(item.subTag)}
                                    {item.subTag || 'Genel'}
                                </span>
                            )}
                        </div>

                        <h3 className="font-bold text-white text-xl mb-3 group-hover:text-teal-400 transition-colors leading-tight">
                            {item.title}
                        </h3>
                        <p className="text-slate-400 text-sm leading-relaxed mb-6 flex-1">
                            {item.description}
                        </p>
                        
                        <div className="mt-auto pt-4 border-t border-slate-700/50">
                            <button className="text-slate-500 font-bold text-xs uppercase tracking-widest flex items-center gap-2 group-hover:text-teal-500 transition-colors">
                                Kaynağı İncele <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                ))}
             </div>
         </div>
      </section>

      {/* 4. LEVEL 2: FINALIST ACADEMY SCHEDULE (New Feature) */}
      <div className="bg-slate-900 text-slate-300 relative overflow-hidden pb-32 pt-10 border-t border-slate-800">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }}></div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-rose-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              
              <div className="text-center mb-16">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-900/30 border border-rose-500/30 text-rose-400 text-xs font-bold tracking-widest uppercase mb-6 shadow-lg">
                      <Star size={14} className="fill-current" /> Sadece Finalistler İçin
                  </div>
                  <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6 drop-shadow-2xl">
                    Finalistlere Özel Akademi
                  </h2>
                  <p className="text-xl text-slate-400 max-w-3xl mx-auto font-light leading-relaxed">
                      Finale kalan <span className="text-teal-400 font-bold">10 Canlı Çekim</span> ve <span className="text-purple-400 font-bold">10 Yapay Zeka</span> ekibi için, 
                      sektör profesyonelleriyle gerçekleştirilecek 3 günlük yoğunlaştırılmış online atölye programı.
                  </p>
              </div>

              {/* Schedule Grid */}
              <div className="grid md:grid-cols-3 gap-8 relative">
                  
                  {/* Connection Line (Desktop) */}
                  <div className="absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-rose-900/50 to-transparent hidden md:block -z-10"></div>

                  {/* Day 1 */}
                  <div className="bg-slate-800/50 border border-slate-700 p-8 rounded-3xl relative overflow-hidden group hover:bg-slate-800 hover:border-amber-500/50 transition-all duration-300">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-amber-500/10 transition-colors"></div>
                      
                      <div className="flex justify-between items-start mb-6">
                          <div className="bg-amber-900/30 text-amber-500 px-4 py-1.5 rounded-lg text-sm font-bold border border-amber-500/30">
                              6 Nisan
                          </div>
                          <div className="p-3 bg-slate-900 rounded-xl text-slate-400 group-hover:text-white border border-slate-800 transition-colors">
                              <BookOpen size={24} />
                          </div>
                      </div>
                      
                      <h3 className="text-2xl font-black text-white mb-2 leading-tight">Hikaye & Senaryo</h3>
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-6">Online • 20:00 - 22:00</p>
                      
                      <ul className="space-y-4 mb-8">
                          <li className="flex items-start text-sm text-slate-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 mr-3 flex-shrink-0 shadow-[0_0_5px_rgba(245,158,11,0.5)]"></span>
                              Senaryo Matematiği ve Çatışma
                          </li>
                          <li className="flex items-start text-sm text-slate-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 mr-3 flex-shrink-0"></span>
                              Karakter Derinliği Oluşturma
                          </li>
                          <li className="flex items-start text-sm text-slate-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 mr-3 flex-shrink-0"></span>
                              Tema ve Mesaj Dengesi
                          </li>
                      </ul>

                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-t border-slate-700/50 pt-4">
                          <Lock size={12} className="text-rose-500"/> Sadece Davetliler
                      </div>
                  </div>

                  {/* Day 2 */}
                  <div className="bg-slate-800/50 border border-slate-700 p-8 rounded-3xl relative overflow-hidden group hover:bg-slate-800 hover:border-teal-500/50 transition-all duration-300 transform md:-translate-y-4">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-teal-500/10 transition-colors"></div>
                      
                      <div className="flex justify-between items-start mb-6">
                          <div className="bg-teal-900/30 text-teal-400 px-4 py-1.5 rounded-lg text-sm font-bold border border-teal-500/30">
                              8 Nisan
                          </div>
                          <div className="p-3 bg-slate-900 rounded-xl text-slate-400 group-hover:text-white border border-slate-800 transition-colors">
                              <Camera size={24} />
                          </div>
                      </div>
                      
                      <h3 className="text-2xl font-black text-white mb-2 leading-tight">Görüntü & Teknik</h3>
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-6">Online • 20:00 - 22:00</p>
                      
                      <ul className="space-y-4 mb-8">
                          <li className="flex items-start text-sm text-slate-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-2 mr-3 flex-shrink-0 shadow-[0_0_5px_rgba(20,184,166,0.5)]"></span>
                              Sinematografik Aydınlatma (Live)
                          </li>
                          <li className="flex items-start text-sm text-slate-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-2 mr-3 flex-shrink-0"></span>
                              İleri Seviye Prompt Yazımı (AI)
                          </li>
                          <li className="flex items-start text-sm text-slate-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-2 mr-3 flex-shrink-0"></span>
                              Görsel Tutarlılık ve Stil
                          </li>
                      </ul>

                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-t border-slate-700/50 pt-4">
                          <Lock size={12} className="text-rose-500"/> Sadece Davetliler
                      </div>
                  </div>

                  {/* Day 3 */}
                  <div className="bg-slate-800/50 border border-slate-700 p-8 rounded-3xl relative overflow-hidden group hover:bg-slate-800 hover:border-purple-500/50 transition-all duration-300">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-purple-500/10 transition-colors"></div>
                      
                      <div className="flex justify-between items-start mb-6">
                          <div className="bg-purple-900/30 text-purple-400 px-4 py-1.5 rounded-lg text-sm font-bold border border-purple-500/30">
                              10 Nisan
                          </div>
                          <div className="p-3 bg-slate-900 rounded-xl text-slate-400 group-hover:text-white border border-slate-800 transition-colors">
                              <Scissors size={24} />
                          </div>
                      </div>
                      
                      <h3 className="text-2xl font-black text-white mb-2 leading-tight">Kurgu & Ses</h3>
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-6">Online • 20:00 - 22:00</p>
                      
                      <ul className="space-y-4 mb-8">
                          <li className="flex items-start text-sm text-slate-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 mr-3 flex-shrink-0 shadow-[0_0_5px_rgba(168,85,247,0.5)]"></span>
                              Ritmik Kurgu Teknikleri
                          </li>
                          <li className="flex items-start text-sm text-slate-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 mr-3 flex-shrink-0"></span>
                              Ses Tasarımı ve Foley
                          </li>
                          <li className="flex items-start text-sm text-slate-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 mr-3 flex-shrink-0"></span>
                              Renk Düzenleme (Color Grading)
                          </li>
                      </ul>

                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-t border-slate-700/50 pt-4">
                          <Lock size={12} className="text-rose-500"/> Sadece Davetliler
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
