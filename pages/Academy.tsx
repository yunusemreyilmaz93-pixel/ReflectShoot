
import React, { useState } from 'react';
import { 
  BookOpen, Film, Video, Cpu, Link as LinkIcon, FileText, Search, Sparkles, Sprout, Lock, Crown, Star
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { CMSAcademyItem } from '../types';

// Category Color Mapping
const categoryStyles: Record<string, { bg: string, text: string, border: string, shadow: string }> = {
    'Senaryo & Tema': { bg: 'bg-amber-500', text: 'text-amber-400', border: 'border-amber-500', shadow: 'shadow-amber-500/20' },
    'Çekim & Ses': { bg: 'bg-emerald-500', text: 'text-emerald-400', border: 'border-emerald-500', shadow: 'shadow-emerald-500/20' },
    'Kurgu & Montaj': { bg: 'bg-indigo-500', text: 'text-indigo-400', border: 'border-indigo-500', shadow: 'shadow-indigo-500/20' },
    'Yapay Zeka': { bg: 'bg-purple-500', text: 'text-purple-400', border: 'border-purple-500', shadow: 'shadow-purple-500/20' },
    'Yarışma Rehberi': { bg: 'bg-rose-500', text: 'text-rose-400', border: 'border-rose-500', shadow: 'shadow-rose-500/20' },
    'İlham & Analiz': { bg: 'bg-cyan-500', text: 'text-cyan-400', border: 'border-cyan-500', shadow: 'shadow-cyan-500/20' },
    'Default': { bg: 'bg-slate-500', text: 'text-slate-400', border: 'border-slate-500', shadow: 'shadow-slate-500/20' }
};

export const Academy: React.FC = () => {
  const { cmsAcademy, currentApplication, currentUser } = useAppContext();
  
  // -- Filter State --
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Tümü');
  const [showStarterPack, setShowStarterPack] = useState(false);

  const filterOptions = [
      'Tümü',
      'Senaryo & Tema',
      'Çekim & Ses',
      'Kurgu & Montaj',
      'Yapay Zeka',
      'Yarışma Rehberi',
      'İlham & Analiz'
  ];

  const isFinalist = currentApplication?.team.isFinalist;

  // -- Filter Logic --
  // Separate Finalist Content from General Grid
  const finalistItems = cmsAcademy.filter(i => i.isFinalistContent);
  
  const generalItems = cmsAcademy.filter(i => {
      if (i.isFinalistContent) return false; // Don't show in main grid

      const q = searchQuery.toLowerCase();
      const matchesSearch = i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q);
      
      const matchesFilter = activeFilter === 'Tümü' || i.category === activeFilter;
      const matchesStarter = showStarterPack ? i.isStarterPack : true;

      return matchesSearch && matchesFilter && matchesStarter;
  });
  
  const hasContent = generalItems.length > 0;

  const renderIcon = (type: string) => {
      switch(type) {
          case 'PDF': return <FileText size={80} />;
          case 'VIDEO': return <Video size={80} />;
          case 'LINK': return <LinkIcon size={80} />;
          default: return <BookOpen size={80} />;
      }
  };

  const handleOpen = (url: string, locked: boolean = false) => {
      if(locked) {
          alert('Bu içerik sadece finalist takımlar içindir.');
          return;
      }
      if (url && url !== '#') {
          window.open(url, '_blank');
      } else {
          alert('Bu kaynak yakında erişime açılacaktır.');
      }
  };

  const clearFilters = () => {
      setSearchQuery('');
      setActiveFilter('Tümü');
      setShowStarterPack(false);
  };

  return (
    <div className="bg-slate-900 min-h-screen font-sans selection:bg-rose-500 selection:text-white pb-24">
      
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
                    Akademi
                </span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed mb-10 font-light animate-fadeIn delay-200">
                Fikirden perdeye uzanan yolculukta ihtiyacınız olan <span className="font-semibold text-white">teknik</span> ve <span className="font-semibold text-white">teorik</span> donanım.
            </p>
        </div>
      </div>

      {/* 2. FINALIST LOUNGE (Restored & Enhanced) */}
      <section className="relative z-20 -mt-16 mb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-amber-950/80 to-slate-900 border-2 border-amber-500/30 rounded-[2rem] p-8 md:p-12 relative overflow-hidden shadow-[0_0_50px_rgba(245,158,11,0.15)] group">
              {/* Animated Glow */}
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none -mr-20 -mt-20 group-hover:bg-amber-500/20 transition-colors duration-700"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-8 border-b border-amber-500/20 pb-8">
                  <div>
                      <div className="flex items-center gap-3 mb-2">
                          <Crown size={24} className="text-amber-400 fill-amber-400" />
                          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">Finalist Masterclass</h2>
                      </div>
                      <p className="text-amber-200/60 font-medium">Sadece ön elemeyi geçen takımların erişimine açık özel ileri düzey eğitimler.</p>
                  </div>
                  {!isFinalist && (
                      <div className="px-4 py-2 bg-slate-950/50 rounded-lg border border-amber-500/30 text-amber-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                          <Lock size={14} /> Erişim Kısıtlı
                      </div>
                  )}
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {finalistItems.length > 0 ? finalistItems.map((item, idx) => (
                      <div 
                          key={idx} 
                          onClick={() => handleOpen(item.url, !isFinalist)}
                          className={`relative p-6 rounded-xl border transition-all duration-300 group/card ${isFinalist ? 'bg-amber-900/10 border-amber-500/30 hover:bg-amber-900/20 hover:border-amber-500/60 cursor-pointer' : 'bg-slate-950/50 border-slate-800 opacity-60 grayscale cursor-not-allowed'}`}
                      >
                          <div className="flex justify-between items-start mb-4">
                              <div className={`p-3 rounded-lg ${isFinalist ? 'bg-amber-500 text-black' : 'bg-slate-800 text-slate-500'}`}>
                                  {item.type === 'VIDEO' ? <Video size={20}/> : <FileText size={20}/>}
                              </div>
                              {!isFinalist && <Lock size={20} className="text-slate-600"/>}
                          </div>
                          <h4 className="font-bold text-white text-lg mb-2 group-hover/card:text-amber-400 transition-colors">{item.title}</h4>
                          <p className="text-sm text-slate-400 leading-relaxed">{item.description}</p>
                      </div>
                  )) : (
                      <div className="col-span-full text-center py-8 text-amber-500/50 text-sm italic">
                          Finalist içerikleri yakında eklenecektir.
                      </div>
                  )}
              </div>
          </div>
      </section>

      {/* 3. Sticky Search & Filter Bar */}
      <div className="sticky top-20 z-30 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  
                  {/* Search */}
                  <div className="relative w-full md:w-1/3">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                      <input 
                        type="text" 
                        placeholder="Kaynak ara..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:border-teal-500 outline-none transition-colors shadow-sm"
                      />
                  </div>

                  {/* Starter Pack Toggle */}
                  <button 
                      onClick={() => setShowStarterPack(!showStarterPack)}
                      className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all border ${showStarterPack ? 'bg-green-600 text-white border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-green-500/50 hover:text-green-400'}`}
                  >
                      <Sprout size={18} />
                      Yeni Başlayanlar için
                  </button>
              </div>

              {/* Categories Scrollable - Color Coded Pills */}
              <div className="mt-4 flex gap-2 overflow-x-auto pb-2 no-scrollbar mask-gradient">
                  {filterOptions.map(opt => {
                      const styles = categoryStyles[opt] || categoryStyles['Default'];
                      const isActive = activeFilter === opt;
                      return (
                          <button
                            key={opt}
                            onClick={() => setActiveFilter(opt)}
                            className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all border flex items-center gap-2 ${isActive ? `${styles.bg} text-white border-transparent ${styles.shadow}` : `bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-500 hover:text-white`}`}
                          >
                              {activeFilter === opt && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>}
                              {opt}
                          </button>
                      );
                  })}
              </div>
          </div>
      </div>

      {/* 4. Cards Grid */}
      <section className="py-12">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
             
             {/* Header Info */}
             <div className="mb-8 flex items-center gap-3">
                 <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <BookOpen size={24} className="text-teal-500"/> 
                    {showStarterPack ? 'Başlangıç Seti' : activeFilter}
                 </h2>
                 <span className="bg-slate-800 text-slate-400 text-xs px-3 py-1 rounded-full border border-slate-700 font-medium">
                     {generalItems.length} Kaynak
                 </span>
             </div>

             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {!hasContent && (
                    <div className="col-span-full py-24 text-center bg-slate-800/30 rounded-3xl border border-slate-700 border-dashed flex flex-col items-center">
                        <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                            <Search size={32} className="text-slate-500"/>
                        </div>
                        <h3 className="text-white font-bold text-xl mb-2">Sonuç Bulunamadı</h3>
                        <p className="text-slate-500 font-medium max-w-md mx-auto">Aradığınız kriterlere uygun kaynak mevcut değil. Farklı bir arama yapabilir veya filtreleri temizleyebilirsiniz.</p>
                        <button onClick={clearFilters} className="mt-6 px-8 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold transition-colors shadow-lg">
                            Filtreleri Temizle
                        </button>
                    </div>
                )}
                
                {generalItems.map((item, idx) => {
                    const styles = categoryStyles[item.category] || categoryStyles['Default'];
                    return (
                        <div key={idx} onClick={() => handleOpen(item.url)} className={`cursor-pointer group bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden flex flex-col h-full transform hover:-translate-y-1 hover:${styles.border.replace('border-', 'border-opacity-50 ')}`}>
                            {/* Icon Background */}
                            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 text-white pointer-events-none">
                                {renderIcon(item.type)}
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-2 mb-4">
                                <span className="px-3 py-1 rounded-full bg-slate-950 text-slate-400 border border-slate-700 text-[10px] font-bold uppercase tracking-wider group-hover:bg-slate-900 transition-colors">
                                    {item.type}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles.border.replace('border-', 'border-opacity-30 ')} ${styles.text.replace('text-', 'text-opacity-90 ')} ${styles.bg.replace('bg-', 'bg-opacity-10 ')}`}>
                                    {item.category}
                                </span>
                                {item.isStarterPack && (
                                    <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-900/30 text-green-400 border border-green-900/30 text-[10px] font-bold uppercase tracking-wider">
                                        <Sprout size={10}/> Başlangıç
                                    </span>
                                )}
                            </div>

                            <h3 className={`font-bold text-white text-xl mb-3 transition-colors leading-tight group-hover:${styles.text}`}>
                                {item.title}
                            </h3>
                            <p className="text-slate-400 text-sm leading-relaxed mb-6 flex-1 line-clamp-3">
                                {item.description}
                            </p>
                            
                            <div className="mt-auto pt-4 border-t border-slate-700/50 flex justify-between items-center">
                                <span className="text-slate-500 text-xs font-mono opacity-60">ID: {item.id}</span>
                                <button className={`font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-colors ${styles.text}`}>
                                    İncele <Sparkles size={14} />
                                </button>
                            </div>
                        </div>
                    );
                })}
             </div>
         </div>
      </section>

      <style>{`
        .animate-fadeIn { animation: fadeIn 0.8s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .mask-gradient { mask-image: linear-gradient(to right, transparent, black 20px, black 90%, transparent); }
      `}</style>
    </div>
  );
};
