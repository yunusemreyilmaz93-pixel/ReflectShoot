
import React, { useState } from 'react';
import { 
  BookOpen, Film, Video, Link as LinkIcon, FileText, Search, Sparkles, Sprout, Lock, Star, Calendar, Mic2, MonitorPlay, Sliders, CheckCircle2, Download, AlertCircle, PlayCircle, Camera, Scissors
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
  const { cmsAcademy, currentApplication } = useAppContext();
  
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
  // We only use CMS for the General Items now, as Finalist section is static layout
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

  const handleOpen = (url: string) => {
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
                Fikirden perdeye uzanan yolculukta ihtiyacınız olan <span className="font-semibold text-white">teknik</span> ve <span className="font-semibold text-white">teorik</span> donanım.
            </p>
        </div>
      </div>

      {/* 2. Sticky Search & Filter Bar (Temel Hazırlık Seti) */}
      <div className="sticky top-20 z-30 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              
              <div className="flex items-center gap-2 mb-4">
                  <BookOpen size={20} className="text-teal-500" />
                  <h2 className="text-lg font-bold text-white">Temel Hazırlık Seti</h2>
              </div>
              <p className="text-slate-400 text-xs mb-4">Yarışmaya başvuran herkesin erişimine açık, sinemanın ABC'sini oluşturan kaynak kütüphanesi.</p>

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

      {/* 3. Cards Grid (General Items Only) */}
      <section className="py-12">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
             
             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {!hasContent && (
                    <div className="col-span-full py-24 text-center bg-slate-800/30 rounded-3xl border border-slate-700 border-dashed flex flex-col items-center">
                        <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                            <Search size={32} className="text-slate-500"/>
                        </div>
                        <h3 className="text-white font-bold text-xl mb-2">Aradığınız kriterlere uygun kaynak bulunamadı.</h3>
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

      {/* 4. FINALIST MASTERCLASS (Moved to Bottom) */}
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

              {/* WORKSHOP CARDS (Restored) */}
              <div className="grid lg:grid-cols-3 gap-6 mb-12">
                  
                  {/* Card 1 */}
                  <div className="group bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-8 rounded-3xl relative overflow-hidden hover:border-amber-500/30 transition-all duration-300 hover:-translate-y-2 shadow-2xl">
                      <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                          <BookOpen size={100} className="text-white"/>
                      </div>
                      
                      <div className="flex justify-between items-start mb-8 relative z-10">
                          <div className="text-5xl font-black text-slate-800 group-hover:text-slate-700 transition-colors">01</div>
                          <div className="text-right">
                              <div className="text-xl font-bold text-white">6 NİSAN</div>
                              <div className="text-amber-500 text-xs font-bold tracking-widest">20:00 - 22:00</div>
                          </div>
                      </div>

                      <div className="relative z-10 mb-8 min-h-[160px]">
                          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-amber-500 mb-4 border border-slate-700">
                              <BookOpen size={20} />
                          </div>
                          <h3 className="text-2xl font-bold text-white mb-2 leading-tight">İleri Senaryo & Dramaturji</h3>
                          <div className="flex items-center gap-2 mb-4">
                              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">ONLINE ATÖLYE</span>
                          </div>
                          <div className="space-y-2">
                              <p className="text-sm text-slate-400 flex items-center gap-2"><span className="text-slate-600">›</span> Senaryo Matematiği ve Yapı</p>
                              <p className="text-sm text-slate-400 flex items-center gap-2"><span className="text-slate-600">›</span> Karakter Derinliği & Dönüşüm</p>
                              <p className="text-sm text-slate-400 flex items-center gap-2"><span className="text-slate-600">›</span> Çatışma ve Dramatik Tansiyon</p>
                              <p className="text-sm text-slate-400 flex items-center gap-2"><span className="text-slate-600">›</span> Diyalog Yazımı & Alt Metin</p>
                          </div>
                      </div>

                      <button disabled={!isFinalist} className="w-full py-4 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-800 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                          <Lock size={14} /> Canlı Yayına Katıl
                      </button>
                  </div>

                  {/* Card 2 */}
                  <div className="group bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-8 rounded-3xl relative overflow-hidden hover:border-teal-500/30 transition-all duration-300 hover:-translate-y-2 shadow-2xl">
                      <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                          <Camera size={100} className="text-white"/>
                      </div>
                      
                      <div className="flex justify-between items-start mb-8 relative z-10">
                          <div className="text-5xl font-black text-slate-800 group-hover:text-slate-700 transition-colors">02</div>
                          <div className="text-right">
                              <div className="text-xl font-bold text-white">8 NİSAN</div>
                              <div className="text-teal-500 text-xs font-bold tracking-widest">20:00 - 22:00</div>
                          </div>
                      </div>

                      <div className="relative z-10 mb-8 min-h-[160px]">
                          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-teal-500 mb-4 border border-slate-700">
                              <MonitorPlay size={20} />
                          </div>
                          <h3 className="text-2xl font-bold text-white mb-2 leading-tight">Görsel Yönetim & Sinematografi</h3>
                          <div className="flex items-center gap-2 mb-4">
                              <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">TEKNİK ATÖLYE</span>
                          </div>
                          <div className="space-y-2">
                              <p className="text-sm text-slate-400 flex items-center gap-2"><span className="text-slate-600">›</span> Kameranın veya yapay zekanın gözünden atmosfer yaratmak.</p>
                              <p className="text-sm text-slate-400 flex items-center gap-2"><span className="text-slate-600">›</span> Kompozisyon ve Kadraj Estetiği</p>
                              <p className="text-sm text-slate-400 flex items-center gap-2"><span className="text-slate-600">›</span> Işık Kullanımı ve Renk Psikolojisi</p>
                              <p className="text-sm text-slate-400 flex items-center gap-2"><span className="text-slate-600">›</span> AI: Prompt Tutarlılığı (Consistency)</p>
                              <p className="text-sm text-slate-400 flex items-center gap-2"><span className="text-slate-600">›</span> Kamera Hareketleri ve Anlamı</p>
                          </div>
                      </div>

                      <button disabled={!isFinalist} className="w-full py-4 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-800 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                          <Lock size={14} /> Canlı Yayına Katıl
                      </button>
                  </div>

                  {/* Card 3 */}
                  <div className="group bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-8 rounded-3xl relative overflow-hidden hover:border-indigo-500/30 transition-all duration-300 hover:-translate-y-2 shadow-2xl">
                      <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                          <Sliders size={100} className="text-white"/>
                      </div>
                      
                      <div className="flex justify-between items-start mb-8 relative z-10">
                          <div className="text-5xl font-black text-slate-800 group-hover:text-slate-700 transition-colors">03</div>
                          <div className="text-right">
                              <div className="text-xl font-bold text-white">10 NİSAN</div>
                              <div className="text-indigo-500 text-xs font-bold tracking-widest">20:00 - 22:00</div>
                          </div>
                      </div>

                      <div className="relative z-10 mb-8 min-h-[160px]">
                          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-indigo-500 mb-4 border border-slate-700">
                              <Scissors size={20} />
                          </div>
                          <h3 className="text-2xl font-bold text-white mb-2 leading-tight">Kurgu Ritmi & Ses Tasarımı</h3>
                          <div className="flex items-center gap-2 mb-4">
                              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">POST-PRODÜKSİYON</span>
                          </div>
                          <div className="space-y-2">
                              <p className="text-sm text-slate-400 flex items-center gap-2"><span className="text-slate-600">›</span> Filmin kalbi kurgu masasında atar. Görüntüyü sesle bütünleştirme sanatı.</p>
                              <p className="text-sm text-slate-400 flex items-center gap-2"><span className="text-slate-600">›</span> Kurgu Ritmi ve Zamanlama</p>
                              <p className="text-sm text-slate-400 flex items-center gap-2"><span className="text-slate-600">›</span> Ses Tasarımı (SFX) ve Miksaj</p>
                              <p className="text-sm text-slate-400 flex items-center gap-2"><span className="text-slate-600">›</span> Müzik Kullanımı ve Duygu</p>
                              <p className="text-sm text-slate-400 flex items-center gap-2"><span className="text-slate-600">›</span> Color Grading (Renk Düzenleme)</p>
                          </div>
                      </div>

                      <button disabled={!isFinalist} className="w-full py-4 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-800 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                          <Lock size={14} /> Canlı Yayına Katıl
                      </button>
                  </div>

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
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .mask-gradient { mask-image: linear-gradient(to right, transparent, black 20px, black 90%, transparent); }
      `}</style>
    </div>
  );
};
