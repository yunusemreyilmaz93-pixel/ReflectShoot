
import React, { useState } from 'react';
import { 
  BookOpen, Clapperboard, Download, 
  ChevronRight, CheckCircle2, Award, Star, Film, 
  Camera, PenTool, Scissors, Play, Wand2, Layers, 
  Mic2, Settings, MessageCircle, Music, Tv, Users, MonitorPlay, Lightbulb, FileText, Share2, Video, Cpu, Link as LinkIcon, Calendar, Lock, Search, Filter, HelpCircle, ListChecks, Sparkles, MoveRight
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { CMSAcademyItem } from '../types';
import { Link } from 'react-router-dom';

export const Academy: React.FC = () => {
  const { cmsAcademy } = useAppContext();
  
  // -- Filter State --
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Tümü');

  const filterOptions = ['Tümü', 'Senaryo', 'Çekim', 'Ses', 'Kurgu', 'Yapay Zeka'];

  // -- Filter Logic --
  const prepItems = cmsAcademy.filter(i => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q);
      
      const t = i.title.toLowerCase();
      const sub = i.subTag || '';
      
      let matchesFilter = activeFilter === 'Tümü';
      if (activeFilter === 'Senaryo') matchesFilter = t.includes('senaryo') || t.includes('hikaye') || t.includes('yazım');
      if (activeFilter === 'Çekim') matchesFilter = t.includes('çekim') || t.includes('kamera') || t.includes('ışık') || sub === 'Canlı Çekim';
      if (activeFilter === 'Ses') matchesFilter = t.includes('ses') || t.includes('mikrofon') || t.includes('foley');
      if (activeFilter === 'Kurgu') matchesFilter = t.includes('kurgu') || t.includes('montaj') || t.includes('renk');
      if (activeFilter === 'Yapay Zeka') matchesFilter = sub === 'Yapay Zeka' || t.includes('ai') || t.includes('prompt');

      return i.category === 'Hazırlık' && matchesSearch && matchesFilter;
  });
  
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
                    Akademi
                </span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed mb-10 font-light animate-fadeIn delay-200">
                Fikirden perdeye uzanan yolculukta ihtiyacınız olan <span className="font-semibold text-white">teknik</span> ve <span className="font-semibold text-white">teorik</span> donanım.
            </p>
        </div>
      </div>

      {/* 2. LEVEL 1: OPEN SOURCES (Filtered) */}
      <section className="bg-slate-900 py-16 relative z-20">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
             
             {/* Header & Controls */}
             <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-8">
                 <div>
                     <h2 className="text-3xl font-black text-white mb-4 flex items-center gap-3">
                        <span className="w-10 h-10 bg-teal-900/30 text-teal-400 rounded-lg flex items-center justify-center border border-teal-500/30">
                            <BookOpen size={24} />
                        </span>
                        Temel Hazırlık Seti
                     </h2>
                     <p className="text-slate-400 text-lg max-w-xl">
                        Yarışmaya başvuran herkesin erişimine açık, sinemanın ABC'sini oluşturan kaynak kütüphanesi.
                     </p>
                 </div>
                 
                 <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                     {/* Search */}
                     <div className="relative">
                         <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                         <input 
                            type="text" 
                            placeholder="Kaynak ara..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full sm:w-64 bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:border-teal-500 outline-none transition-colors"
                         />
                     </div>
                     {/* Category Filters */}
                     <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
                         {filterOptions.map(opt => (
                             <button
                                key={opt}
                                onClick={() => setActiveFilter(opt)}
                                className={`whitespace-nowrap px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${activeFilter === opt ? 'bg-teal-600 text-white border-teal-500 shadow-lg shadow-teal-900/20' : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-600 hover:text-white'}`}
                             >
                                 {opt}
                             </button>
                         ))}
                     </div>
                 </div>
             </div>

             {/* Cards Grid */}
             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {!hasContent && (
                    <div className="col-span-full py-20 text-center bg-slate-950/50 rounded-2xl border border-slate-800 border-dashed">
                        <Search size={48} className="mx-auto text-slate-700 mb-4"/>
                        <p className="text-slate-500 font-medium">Aradığınız kriterlere uygun kaynak bulunamadı.</p>
                        <button onClick={() => {setSearchQuery(''); setActiveFilter('Tümü')}} className="mt-4 text-teal-500 hover:underline text-sm font-bold">Filtreleri Temizle</button>
                    </div>
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
                        <p className="text-slate-400 text-sm leading-relaxed mb-6 flex-1 line-clamp-3">
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

      {/* 4. LEVEL 2: FINALIST ACADEMY SCHEDULE */}
      <div className="bg-slate-950 text-slate-300 relative overflow-hidden pb-40 pt-32 border-t border-slate-800">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }}></div>
          <div className="absolute top-0 center w-full h-[800px] bg-rose-600/5 blur-[150px] pointer-events-none mix-blend-screen"></div>
          
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              
              <div className="text-center mb-20">
                  <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-rose-600 shadow-[0_0_30px_rgba(225,29,72,0.4)] text-white text-xs font-black tracking-[0.2em] uppercase mb-8 animate-pulse">
                      <Star size={14} className="fill-current" /> SADECE FİNALİSTLER
                  </div>
                  <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-8 drop-shadow-2xl">
                    Finalistlere Özel Akademi
                  </h2>
                  <p className="text-2xl text-slate-400 max-w-4xl mx-auto font-light leading-relaxed">
                      Finale kalan <strong>10 Canlı Çekim</strong> ve <strong>10 Yapay Zeka</strong> ekibi için özel olarak kurgulanmış, sektör profesyonelleri ile buluşma noktası.
                  </p>
              </div>

              {/* VIP Access Notice */}
              <div className="max-w-2xl mx-auto mb-20 bg-slate-900/80 backdrop-blur-sm border border-rose-900/30 p-5 rounded-2xl flex items-center justify-center gap-4 shadow-2xl">
                  <div className="p-2 bg-rose-900/20 rounded-full text-rose-500">
                      <Lock size={20} />
                  </div>
                  <span className="text-slate-300 font-medium">Bu bölümdeki içerikler, <strong>1 Nisan</strong> tarihinde açıklanacak 20 finalist takıma özel olarak erişime açılacaktır.</span>
              </div>

              {/* 1. ROW: WORKSHOPS (3 Cards) */}
              <div className="grid lg:grid-cols-3 gap-8 mb-16 items-stretch">
                  
                  {/* Workshop 1 */}
                  <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-10 rounded-[2.5rem] relative overflow-hidden group hover:border-amber-500/50 hover:shadow-[0_0_50px_rgba(245,158,11,0.15)] transition-all duration-500 flex flex-col h-full min-h-[600px]">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[80px] -mr-20 -mt-20 group-hover:bg-amber-500/10 transition-colors duration-500"></div>
                      
                      <div className="flex justify-between items-start mb-10 relative z-10">
                          <span className="text-7xl font-black text-slate-800 group-hover:text-amber-500/20 transition-colors duration-500 select-none -ml-2 -mt-2">01</span>
                          <div className="flex flex-col items-end">
                              <span className="text-3xl font-black text-white mb-1">6 NİSAN</span>
                              <span className="text-sm font-bold text-amber-500 uppercase tracking-widest bg-amber-900/10 px-3 py-1 rounded-lg border border-amber-900/30">20:00 - 22:00</span>
                          </div>
                      </div>
                      
                      <div className="mb-8 relative z-10">
                          <div className="w-16 h-16 bg-amber-900/20 rounded-2xl flex items-center justify-center text-amber-500 mb-6 border border-amber-500/20 group-hover:scale-110 transition-transform duration-500 shadow-lg">
                              <BookOpen size={32} />
                          </div>
                          <h3 className="text-3xl font-black text-white mb-3 leading-tight group-hover:text-amber-400 transition-colors">İleri Senaryo & Dramaturji</h3>
                          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-amber-500"></span> Online Atölye
                          </p>
                      </div>
                      
                      <div className="space-y-5 mb-10 flex-1 relative z-10">
                          <p className="text-base text-slate-400 leading-relaxed font-light border-l-2 border-amber-900/50 pl-4 mb-6">
                              Hikayenizi jürinin kalbine dokunacak bir yapıya nasıl dönüştürürsünüz?
                          </p>
                          {[
                              "Senaryo Matematiği ve Yapı",
                              "Karakter Derinliği & Dönüşüm",
                              "Çatışma ve Dramatik Tansiyon",
                              "Diyalog Yazımı & Alt Metin"
                          ].map((item, i) => (
                              <div key={i} className="flex items-center text-sm text-slate-300 font-medium group/item">
                                  <ChevronRight size={16} className="text-amber-500 mr-3 opacity-50 group-hover/item:opacity-100 group-hover/item:translate-x-1 transition-all"/>
                                  {item}
                              </div>
                          ))}
                      </div>

                      <div className="mt-auto relative z-10">
                          <button disabled className="w-full py-5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 font-bold flex items-center justify-center gap-3 cursor-not-allowed group-hover:border-amber-500/30 group-hover:text-amber-500 transition-all hover:bg-amber-900/10">
                              <Lock size={18}/> Canlı Yayına Katıl
                          </button>
                      </div>
                  </div>

                  {/* Workshop 2 */}
                  <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-10 rounded-[2.5rem] relative overflow-hidden group hover:border-teal-500/50 hover:shadow-[0_0_50px_rgba(20,184,166,0.15)] transition-all duration-500 flex flex-col h-full min-h-[600px]">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-[80px] -mr-20 -mt-20 group-hover:bg-teal-500/10 transition-colors duration-500"></div>
                      
                      <div className="flex justify-between items-start mb-10 relative z-10">
                          <span className="text-7xl font-black text-slate-800 group-hover:text-teal-500/20 transition-colors duration-500 select-none -ml-2 -mt-2">02</span>
                          <div className="flex flex-col items-end">
                              <span className="text-3xl font-black text-white mb-1">8 NİSAN</span>
                              <span className="text-sm font-bold text-teal-500 uppercase tracking-widest bg-teal-900/10 px-3 py-1 rounded-lg border border-teal-900/30">20:00 - 22:00</span>
                          </div>
                      </div>
                      
                      <div className="mb-8 relative z-10">
                          <div className="w-16 h-16 bg-teal-900/20 rounded-2xl flex items-center justify-center text-teal-400 mb-6 border border-teal-500/20 group-hover:scale-110 transition-transform duration-500 shadow-lg">
                              <Camera size={32} />
                          </div>
                          <h3 className="text-3xl font-black text-white mb-3 leading-tight group-hover:text-teal-400 transition-colors">Görsel Yönetim & Sinematografi</h3>
                          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-teal-500"></span> Teknik Atölye
                          </p>
                      </div>
                      
                      <div className="space-y-5 mb-10 flex-1 relative z-10">
                          <p className="text-base text-slate-400 leading-relaxed font-light border-l-2 border-teal-900/50 pl-4 mb-6">
                              Kameranın veya yapay zekanın gözünden atmosfer ve anlam yaratmak.
                          </p>
                          {[
                              "Kompozisyon ve Kadraj Estetiği",
                              "Işık Kullanımı ve Renk Psikolojisi",
                              "AI: Prompt Tutarlılığı (Consistency)",
                              "Kamera Hareketleri ve Anlamı"
                          ].map((item, i) => (
                              <div key={i} className="flex items-center text-sm text-slate-300 font-medium group/item">
                                  <ChevronRight size={16} className="text-teal-500 mr-3 opacity-50 group-hover/item:opacity-100 group-hover/item:translate-x-1 transition-all"/>
                                  {item}
                              </div>
                          ))}
                      </div>

                      <div className="mt-auto relative z-10">
                          <button disabled className="w-full py-5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 font-bold flex items-center justify-center gap-3 cursor-not-allowed group-hover:border-teal-500/30 group-hover:text-teal-500 transition-all hover:bg-teal-900/10">
                              <Lock size={18}/> Canlı Yayına Katıl
                          </button>
                      </div>
                  </div>

                  {/* Workshop 3 */}
                  <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-10 rounded-[2.5rem] relative overflow-hidden group hover:border-purple-500/50 hover:shadow-[0_0_50px_rgba(168,85,247,0.15)] transition-all duration-500 flex flex-col h-full min-h-[600px]">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-[80px] -mr-20 -mt-20 group-hover:bg-purple-500/10 transition-colors duration-500"></div>
                      
                      <div className="flex justify-between items-start mb-10 relative z-10">
                          <span className="text-7xl font-black text-slate-800 group-hover:text-purple-500/20 transition-colors duration-500 select-none -ml-2 -mt-2">03</span>
                          <div className="flex flex-col items-end">
                              <span className="text-3xl font-black text-white mb-1">10 NİSAN</span>
                              <span className="text-sm font-bold text-purple-500 uppercase tracking-widest bg-purple-900/10 px-3 py-1 rounded-lg border border-purple-900/30">20:00 - 22:00</span>
                          </div>
                      </div>
                      
                      <div className="mb-8 relative z-10">
                          <div className="w-16 h-16 bg-purple-900/20 rounded-2xl flex items-center justify-center text-purple-400 mb-6 border border-purple-500/20 group-hover:scale-110 transition-transform duration-500 shadow-lg">
                              <Scissors size={32} />
                          </div>
                          <h3 className="text-3xl font-black text-white mb-3 leading-tight group-hover:text-purple-400 transition-colors">Kurgu Ritmi & Ses Tasarımı</h3>
                          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-purple-500"></span> Post-Prodüksiyon
                          </p>
                      </div>
                      
                      <div className="space-y-5 mb-10 flex-1 relative z-10">
                          <p className="text-base text-slate-400 leading-relaxed font-light border-l-2 border-purple-900/50 pl-4 mb-6">
                              Filmin kalbi kurgu masasında atar. Görüntüyü sesle bütünleştirme sanatı.
                          </p>
                          {[
                              "Kurgu Ritmi ve Zamanlama",
                              "Ses Tasarımı (SFX) ve Miksaj",
                              "Müzik Kullanımı ve Duygu",
                              "Color Grading (Renk Düzenleme)"
                          ].map((item, i) => (
                              <div key={i} className="flex items-center text-sm text-slate-300 font-medium group/item">
                                  <ChevronRight size={16} className="text-purple-500 mr-3 opacity-50 group-hover/item:opacity-100 group-hover/item:translate-x-1 transition-all"/>
                                  {item}
                              </div>
                          ))}
                      </div>

                      <div className="mt-auto relative z-10">
                          <button disabled className="w-full py-5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 font-bold flex items-center justify-center gap-3 cursor-not-allowed group-hover:border-purple-500/30 group-hover:text-purple-500 transition-all hover:bg-purple-900/10">
                              <Lock size={18}/> Canlı Yayına Katıl
                          </button>
                      </div>
                  </div>

              </div>

              {/* 2. ROW: REVISION KIT (Full Width) */}
              <div className="relative w-full max-w-5xl mx-auto bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-rose-500/30 rounded-[3rem] p-10 md:p-14 overflow-hidden shadow-2xl group">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
                  <div className="absolute right-0 top-0 w-96 h-96 bg-rose-600/10 rounded-full blur-[100px] pointer-events-none translate-x-1/3 -translate-y-1/3"></div>
                  
                  <div className="flex flex-col md:flex-row gap-12 relative z-10 items-center">
                      <div className="md:w-1/3 text-center md:text-left">
                          <div className="inline-flex p-4 bg-rose-600 text-white rounded-3xl shadow-[0_10px_30px_rgba(225,29,72,0.4)] mb-6 transform group-hover:scale-110 transition-transform duration-500">
                              <ListChecks size={40} />
                          </div>
                          <h3 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">Revize Hazırlık Kiti</h3>
                          <p className="text-slate-400 text-lg font-light leading-relaxed">
                              Final tesliminden önce projenizi teknik ve sanatsal açıdan kusursuz hale getirin.
                          </p>
                          <button disabled className="mt-8 bg-white text-slate-900 px-8 py-4 rounded-xl font-bold flex items-center gap-3 mx-auto md:mx-0 opacity-50 cursor-not-allowed hover:bg-slate-200 transition-colors shadow-lg">
                              <Lock size={20}/> Kiti İndir (PDF)
                          </button>
                      </div>

                      <div className="md:w-2/3 grid sm:grid-cols-2 gap-4 w-full">
                          {[
                              "Renk Düzenleme (Color Grading)",
                              "Ses Temizliği & Final Miksaj",
                              "Altyazı & Jenerik Kontrolü",
                              "AI Tutarlılık & Glitch Temizliği",
                              "Telif & Lisans Uyumluluğu",
                              "Dosya İsimlendirme & Format",
                              "Final Export Ayarları (Bitrate)",
                              "Frame Rate Tutarlılığı"
                          ].map((item, i) => (
                              <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/50 border border-slate-700/50 hover:bg-slate-800 hover:border-rose-500/30 transition-all cursor-default">
                                  <div className="w-6 h-6 rounded-lg border-2 border-rose-500/30 flex items-center justify-center flex-shrink-0 bg-slate-900">
                                      <div className="w-2.5 h-2.5 bg-rose-500 rounded sm:rounded-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                  </div>
                                  <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">{item}</span>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>

              {/* Support Shortcut */}
              <div className="mt-24 text-center">
                  <div className="inline-flex items-center gap-4 p-1 pl-6 pr-2 bg-slate-900 border border-slate-800 rounded-full shadow-lg hover:border-slate-700 transition-colors">
                      <span className="text-slate-400 text-sm font-medium">Akademi hakkında sorularınız mı var?</span>
                      <Link to="/faq" className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-full text-xs font-bold transition-colors border border-slate-700">
                          Destek Merkezine Git
                      </Link>
                  </div>
              </div>

          </div>
      </div>

      <style>{`
        .animate-fadeIn { animation: fadeIn 0.8s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};
