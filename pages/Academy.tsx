
import React, { useState } from 'react';
import { 
  BookOpen, Film, Video, Link as LinkIcon, FileText, Search, Sprout, Star, PlayCircle, ChevronRight, Bookmark, Library,
  CheckCircle2, Lock, Camera, MonitorPlay, Scissors, Download
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';

// Category Color Mapping - High Contrast for Dark Mode
const categoryStyles: Record<string, { bg: string, text: string, border: string, shadow: string, hoverText: string }> = {
    'Senaryo & Tema': { bg: 'bg-amber-500', text: 'text-amber-400', hoverText: 'group-hover:text-amber-400', border: 'border-amber-500', shadow: 'shadow-amber-500/20' },
    'Teknik & Kurgu': { bg: 'bg-emerald-500', text: 'text-emerald-400', hoverText: 'group-hover:text-emerald-400', border: 'border-emerald-500', shadow: 'shadow-emerald-500/20' },
    'Yapay Zeka': { bg: 'bg-purple-500', text: 'text-purple-400', hoverText: 'group-hover:text-purple-400', border: 'border-purple-500', shadow: 'shadow-purple-500/20' },
    'İlham & Rehber': { bg: 'bg-cyan-500', text: 'text-cyan-400', hoverText: 'group-hover:text-cyan-400', border: 'border-cyan-500', shadow: 'shadow-cyan-500/20' },
    'Default': { bg: 'bg-slate-500', text: 'text-slate-400', hoverText: 'group-hover:text-slate-400', border: 'border-slate-500', shadow: 'shadow-slate-500/20' }
};

// Title-Based Image Mapping for Unique Cards
const getTitleImage = (title: string): string => {
    const map: Record<string, string> = {
        // Senaryo & Tema
        'Kahramanın Yolculuğu ve Maneviyat': 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=800', // Path/Journey
        'Ayetlerden Senaryoya: Uyarlama Rehberi': 'https://images.unsplash.com/photo-1628147879590-33230b924296?auto=format&fit=crop&q=80&w=800', // Quran/Book
        'Karakter Yaratma: Derinlik ve Dönüşüm': 'https://images.unsplash.com/photo-1535905557558-afc4877a26fc?auto=format&fit=crop&q=80&w=800', // Silhouette/Person
        'Diyalog Yazımı: Az Söz Çok Şey': 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=800', // Writing/Script
        
        // Teknik & Kurgu
        'DaVinci Resolve ile Renk Düzenleme': 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=800&auto=format&fit=crop', // Color Grading
        'Sinematik Işık ve Kompozisyon': 'https://images.unsplash.com/photo-1550948537-130a1ce83314?auto=format&fit=crop&q=80&w=800', // Neon Light
        'Ses Tasarımı: Filmin Gizli Kahramanı': 'https://images.unsplash.com/photo-1590845947698-8924d7409b56?auto=format&fit=crop&q=80&w=800', // Microphone
        'Kurguda Ritm ve Duygu Akışı': 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44c?auto=format&fit=crop&q=80&w=800', // Film Editing
        
        // Yapay Zeka
        'Midjourney ile Storyboard Oluşturma': 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=800', // AI Art
        'Runway Gen-2 ile Video Üretimi': 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800', // Abstract Tech
        'Suno AI ile Film Müziği Besteleme': 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&q=80&w=800', // Music/Sound wave
        'AI Destekli Seslendirme ve Lip Sync': 'https://images.unsplash.com/photo-1589903308904-7166d310922f?auto=format&fit=crop&q=80&w=800', // Microphone/Lip
        
        // İlham & Rehber
        'Teknik Şartname ve Teslim Kriterleri': 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=800', // Meeting/Checklist
        'Set Çantası Kontrol Listesi': 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800', // Camera Bag
        'Ödüllü Kısa Film Analizleri': 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=800', // Cinema Theater
        'Usta Yönetmenlerden Tavsiyeler': 'https://images.unsplash.com/photo-1515634928627-2a4e0dae3ddf?auto=format&fit=crop&q=80&w=800', // Director Chair
        
        // Finalist
        'İleri Düzey Senaryo Doktorluğu': 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=800', // Writing Hand
        'Festival Stratejileri ve Dağıtım': 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=800' // Red Carpet/Film Strip
    };
    return map[title] || 'https://images.unsplash.com/photo-1478720568477-152d9b164e63?auto=format&fit=crop&q=80&w=800'; // Default Starry Sky
};

export const Academy: React.FC = () => {
  const { cmsAcademy, currentApplication } = useAppContext();
  
  // -- Filter State --
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Tümü');

  // Consolidated Filter Options
  const filterOptions = [
      'Tümü',
      'Senaryo & Tema',
      'Teknik & Kurgu',
      'Yapay Zeka',
      'İlham & Rehber'
  ];

  const isFinalist = currentApplication?.team.isFinalist;

  // -- Filter Logic --
  const generalItems = cmsAcademy.filter(i => {
      if (i.isFinalistContent) return false;

      const q = searchQuery.toLowerCase();
      const matchesSearch = i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q);
      
      const matchesFilter = activeFilter === 'Tümü' || i.category === activeFilter;
      
      return matchesSearch && matchesFilter;
  });
  
  const hasContent = generalItems.length > 0;

  const handleOpen = (url: string) => {
      if (url && url !== '#') {
          window.open(url, '_blank');
      } else {
          alert('Bu kaynak yakında erişime açılacaktır.');
      }
  };

  const handleCategoryClick = (e: React.MouseEvent, category: string) => {
      e.stopPropagation(); // Prevent opening the link
      setActiveFilter(category);
      document.getElementById('resources-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const clearFilters = () => {
      setSearchQuery('');
      setActiveFilter('Tümü');
  };

  const getMicroCopy = (cat: string) => {
      if(cat === 'İlham & Rehber') return { text: "Yarışma kuralları ve ipuçları", color: "text-cyan-400" };
      if(cat === 'Teknik & Kurgu') return { text: "Teknik puanı artıran içerikler", color: "text-emerald-400" };
      if(cat === 'Yapay Zeka') return { text: "AI kategorisi için önerilir", color: "text-purple-400" };
      if(cat === 'Senaryo & Tema') return { text: "Hikaye puanını artıran içerikler", color: "text-amber-400" };
      return { text: "Jüri Değerlendirme Kriteri", color: "text-slate-400" };
  };

  return (
    <div className="bg-slate-900 min-h-screen font-sans selection:bg-rose-500 selection:text-white pb-24">
      
      {/* 1. Cinematic Hero Section */}
      <div className="bg-gradient-to-b from-rose-950 via-slate-900 to-slate-950 text-white pt-32 pb-16 relative overflow-hidden">
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
                Yarışma sürecinde size rehberlik edecek temel eğitim içerikleri.
            </p>
        </div>
      </div>

      {/* 2. Simplified Filter Bar */}
      <div className="sticky top-20 z-30 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800 shadow-2xl transition-all">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              
              <div className="flex flex-col gap-6">
                  {/* Secondary Filters & Search */}
                  <div className="flex flex-col md:flex-row gap-4 items-center">
                      
                      {/* Search */}
                      <div className="relative w-full md:w-64 flex-shrink-0">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                          <input 
                            type="text" 
                            placeholder="Konu ara..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:border-teal-500 outline-none transition-colors"
                          />
                      </div>

                      <div className="w-px h-8 bg-slate-800 hidden md:block"></div>

                      {/* Horizontal Categories - Added padding-right to fix clipping */}
                      <div className="flex items-center gap-2 w-full overflow-x-auto pb-2 scrollbar-hide pr-12">
                          {filterOptions.map(opt => {
                              const styles = categoryStyles[opt] || categoryStyles['Default'];
                              const isActive = activeFilter === opt;
                              
                              if (opt === 'Tümü') {
                                  return (
                                      <button
                                        key={opt}
                                        onClick={() => setActiveFilter('Tümü')}
                                        className={`flex-shrink-0 whitespace-nowrap px-4 py-2 rounded-lg text-xs font-bold transition-all border ${isActive ? 'bg-slate-200 text-slate-900 border-white' : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-500'}`}
                                      >
                                          Tümü
                                      </button>
                                  );
                              }

                              return (
                                  <button
                                    key={opt}
                                    onClick={() => setActiveFilter(opt)}
                                    className={`flex-shrink-0 whitespace-nowrap px-4 py-2 rounded-lg text-xs font-bold transition-all border flex items-center gap-2 ${isActive ? `${styles.bg} text-white border-transparent shadow-lg` : `bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-500 hover:text-white`}`}
                                  >
                                      {opt}
                                  </button>
                              );
                          })}
                          {/* Invisible spacer to ensure last item isn't flush with edge */}
                          <div className="w-4 flex-shrink-0"></div>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      {/* 3. Cards Grid */}
      <section id="resources-grid" className="py-12 bg-slate-900 relative">
         {/* Subtle Grid Background */}
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>

         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
             
             {/* Section Title */}
             <div className="mb-8">
                 <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                     <Sprout className="text-green-500"/> Yarışmaya Hazırlık Seti
                 </h2>
                 <p className="text-slate-400 text-sm mt-1">
                     Başlangıç seviyesindeki ekipler için seçilmiş temel ve zorunlu içerikler.
                 </p>
             </div>

             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {!hasContent && (
                    <div className="col-span-full py-24 text-center bg-slate-800/30 rounded-3xl border border-slate-700 border-dashed flex flex-col items-center animate-fadeIn">
                        <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4 border border-slate-700">
                            <Search size={32} className="text-slate-500"/>
                        </div>
                        <h3 className="text-white font-bold text-xl mb-2">Kaynak Bulunamadı</h3>
                        <p className="text-slate-500 text-sm mb-6">Seçilen kriterlere uygun içerik mevcut değil.</p>
                        <button onClick={clearFilters} className="px-8 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold transition-colors shadow-lg flex items-center gap-2">
                            Filtreleri Temizle
                        </button>
                    </div>
                )}
                
                {generalItems.map((item, idx) => {
                    const styles = categoryStyles[item.category] || categoryStyles['Default'];
                    const microCopy = getMicroCopy(item.category);
                    const imageUrl = getTitleImage(item.title);

                    return (
                        <div 
                            key={idx} 
                            onClick={() => handleOpen(item.url)} 
                            className={`group relative flex flex-col bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] hover:border-slate-600`}
                        >
                            {/* Hover Gradient Overlay */}
                            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${styles.bg.replace('bg-', 'from-').replace('500', '900/10')} to-transparent pointer-events-none z-0`}></div>

                            {/* Image Visual */}
                            <div className={`relative overflow-hidden h-48`}>
                                <img 
                                    src={imageUrl} 
                                    alt={item.title} 
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100" 
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent"></div>
                                
                                <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-sm p-2 rounded-full border border-white/10 text-white z-10 shadow-lg">
                                    {item.type === 'VIDEO' ? <PlayCircle size={18}/> : item.type === 'PDF' ? <FileText size={18}/> : <LinkIcon size={18}/>}
                                </div>
                            </div>
                            
                            {/* Content */}
                            <div className={`p-8 flex flex-col flex-1 relative z-10 bg-slate-900`}>
                                <div className="flex flex-wrap items-center gap-2 mb-4">
                                    <span 
                                        onClick={(e) => handleCategoryClick(e, item.category)}
                                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles.border} ${styles.text} bg-slate-950 cursor-pointer hover:bg-slate-800 transition-colors z-20`}
                                    >
                                        {item.category}
                                    </span>
                                </div>

                                <h3 className={`font-bold text-white mb-3 transition-colors leading-tight ${styles.hoverText} text-xl`}>
                                    {item.title}
                                </h3>
                                <p className="text-slate-400 text-sm leading-relaxed mb-6 line-clamp-3 font-light">
                                    {item.description}
                                </p>
                                
                                <div className="mt-auto pt-6 border-t border-slate-800 flex items-center justify-between">
                                    <div className={`flex items-center gap-2 text-xs font-bold ${microCopy.color}`}>
                                        <Bookmark size={14} /> {microCopy.text}
                                    </div>
                                    <div className={`w-8 h-8 rounded-full border border-slate-700 flex items-center justify-center text-slate-500 group-hover:bg-slate-800 group-hover:text-white transition-all`}>
                                        <ChevronRight size={16} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
             </div>

             {/* Bottom Info Banner */}
             <div className="mt-16 bg-slate-800/50 border border-slate-800 rounded-xl p-4 flex items-center justify-center gap-3 text-sm text-slate-400 animate-fadeIn">
                 <CheckCircle2 size={18} className="text-teal-500"/>
                 <span>Bu bölümdeki içerikler, jüri değerlendirme kriterleriyle ve puanlama sistemiyle %100 uyumludur.</span>
             </div>

         </div>
      </section>

      {/* 4. FINALIST MASTERCLASS (Locked) */}
      <section className="relative z-20 mt-12 pt-20 border-t border-slate-800 bg-slate-950/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
              <div className="text-center mb-10">
                  <span className="bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg shadow-rose-600/30 flex items-center gap-2 mx-auto w-fit mb-4">
                      <Star size={12} className="fill-white"/> SADECE FİNALİSTLER
                  </span>
                  <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4 drop-shadow-xl">
                      Finalistlere Özel Akademi
                  </h2>
                  <p className="text-slate-400 font-light text-lg max-w-2xl mx-auto">
                      Finale kalan <strong>10 Canlı Çekim</strong> ve <strong>10 Yapay Zeka</strong> ekibi için özel olarak kurgulanmış, sektör profesyonelleri ile buluşma noktası.
                  </p>
              </div>

              {/* Info Box */}
              <div className="max-w-3xl mx-auto bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-2xl p-4 mb-16 flex items-center justify-center gap-4 text-center shadow-2xl">
                  <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-rose-500">
                      <Lock size={18} />
                  </div>
                  <p className="text-slate-300 text-sm font-medium">
                      Bu bölümdeki içerikler, <span className="text-white font-bold">1 Nisan</span> tarihinde açıklanacak 20 finalist takıma özel olarak erişime açılacaktır.
                  </p>
              </div>

              {/* REVISION KIT BLOCK */}
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 md:p-10 border border-slate-700 shadow-2xl flex flex-col md:flex-row items-center gap-10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                  
                  <div className="flex-1 relative z-10">
                      <div className="w-14 h-14 bg-rose-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-rose-600/30">
                          <CheckCircle2 size={32} />
                      </div>
                      <h3 className="text-3xl font-black text-white mb-2">Revize Hazırlık Kiti</h3>
                      <p className="text-slate-400 leading-relaxed mb-8 max-w-md">
                          Final tesliminden önce projenizi teknik ve sanatsal açıdan kusursuz hale getirmek için bu kontrol listesini kullanın.
                      </p>
                      <button disabled={!isFinalist} className="bg-slate-200 hover:bg-white text-slate-900 px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                          <Download size={18} /> Kiti İndir (PDF)
                      </button>
                  </div>

                  <div className="flex-1 w-full relative z-10">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {[
                              'Renk Düzenleme (Color Grading)', 'Ses Temizliği & Final Miksaj', 
                              'Altyazı & Jenerik Kontrolü', 'AI Tutarlılık & Glitch Temizliği',
                              'Telif & Lisans Uyumluluğu', 'Dosya İsimlendirme & Format',
                              'Final Export Ayarları (Bitrate)', 'Frame Rate Tutarlılığı'
                          ].map((item, idx) => (
                              <div key={idx} className="flex items-center gap-3 bg-slate-950/50 p-3 rounded-lg border border-slate-700/50">
                                  <div className="w-4 h-4 rounded border border-slate-600"></div>
                                  <span className="text-xs font-bold text-slate-300">{item}</span>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
      </section>

      <style>{`
        .animate-fadeIn { animation: fadeIn 0.8s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};
