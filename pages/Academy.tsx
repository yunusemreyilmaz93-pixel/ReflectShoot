import React, { useState } from 'react';
import { 
  BookOpen, Film, Video, Link as LinkIcon, FileText, Search, Sprout, Star, PlayCircle, ChevronRight, Bookmark, Library,
  CheckCircle2, Lock, Camera, MonitorPlay, Scissors, Download, Calendar, Mic2, Palette, Cpu, Layers, Zap, Clock,
  Clapperboard, Aperture, Bot, Rocket, Sparkles, MoveRight, ArrowRight, ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

// Title-Based Image Mapping for Unique Cards (Fallback if no coverImage)
const getTitleImage = (title: string): string => {
    const map: Record<string, string> = {
        'Mobil Sinemacılık: Telefonla Film Çekmek': 'https://pub-445f38f2d68348d4914aa2bac116cf06.r2.dev/academycontent/Mobil%20Sinemac%C4%B1l%C4%B1k-Telefonla%20Film%20%C3%87ekmek%20Cover.png',
        'Karakter Oluşturma Tip Değil Karakter': 'https://assets.reflectandshoot.com/academycontent/Karakter_Olusturma_Tip_Degil_Karakter_Cover.png',
        'Senaryoda Diyalog Sanatı: Kelimelerin Ötesini Konuşmak': 'https://assets.reflectandshoot.com/academycontent/Senaryoda-Diyalog-Sanati-Kelimelerin-Otesini-Konusmak_cover.png'
    };
    return map[title] || 'https://images.unsplash.com/photo-1478720568477-152d9b164e63?auto=format&fit=crop&q=80&w=800'; 
};

export const Academy: React.FC = () => {
  const { cmsAcademy, currentApplication } = useAppContext();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('Tümü');
  
  const isFinalist = currentApplication?.team.isFinalist;

  // Filter out finalist content for general view
  const publicAcademyItems = cmsAcademy.filter(item => !item.isFinalistContent);

  // Apply Category Filter
  const filteredItems = publicAcademyItems.filter(item => activeCategory === 'Tümü' || item.category === activeCategory);

  const handleCardClick = (item: any) => {
      // Direct access to PDF if available, otherwise open URL
      if (item.pdfFile) {
          window.open(item.pdfFile, '_blank');
      } else if (item.url) {
          window.open(item.url, '_blank');
      }
  };

  // Helper to determine styles based on category
  const getCategoryStyle = (category: string) => {
      switch(category) {
          case 'Senaryo & Tema': return { 
              badge: 'bg-slate-950 text-amber-500 border-amber-500/50 shadow-lg shadow-amber-900/20', 
              btn: 'text-amber-500 hover:text-amber-400', 
              title: 'group-hover:text-amber-400',
              activeBtn: 'bg-amber-500 text-slate-900 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]',
              inactiveBtn: 'text-amber-500 border-amber-500/30 hover:bg-amber-500/10'
          };
          case 'Teknik & Kurgu': return { 
              badge: 'bg-slate-950 text-cyan-500 border-cyan-500/50 shadow-lg shadow-cyan-900/20', 
              btn: 'text-cyan-500 hover:text-cyan-400', 
              title: 'group-hover:text-cyan-400',
              activeBtn: 'bg-cyan-500 text-slate-900 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)]',
              inactiveBtn: 'text-cyan-500 border-cyan-500/30 hover:bg-cyan-500/10'
          };
          case 'Yapay Zeka': return { 
              badge: 'bg-slate-950 text-purple-500 border-purple-500/50 shadow-lg shadow-purple-900/20', 
              btn: 'text-purple-500 hover:text-purple-400', 
              title: 'group-hover:text-purple-400',
              activeBtn: 'bg-purple-500 text-white border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]',
              inactiveBtn: 'text-purple-500 border-purple-500/30 hover:bg-purple-500/10'
          };
          case 'İlham & Rehber': return { 
              badge: 'bg-slate-950 text-rose-500 border-rose-500/50 shadow-lg shadow-rose-900/20', 
              btn: 'text-rose-500 hover:text-rose-400', 
              title: 'group-hover:text-rose-400',
              activeBtn: 'bg-rose-500 text-white border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)]',
              inactiveBtn: 'text-rose-500 border-rose-500/30 hover:bg-rose-500/10'
          };
          default: return { 
              badge: 'bg-slate-950 text-slate-300 border-slate-600 shadow-lg', 
              btn: 'text-blue-400 hover:text-blue-300', 
              title: 'group-hover:text-emerald-400',
              activeBtn: 'bg-slate-200 text-slate-900 border-slate-200',
              inactiveBtn: 'text-slate-400 border-slate-700 hover:bg-slate-800'
          };
      }
  };

  const categories = [
      { id: 'Tümü', label: 'Tümü' },
      { id: 'Senaryo & Tema', label: 'Senaryo' },
      { id: 'Teknik & Kurgu', label: 'Teknik' },
      { id: 'Yapay Zeka', label: 'Yapay Zeka' },
      { id: 'İlham & Rehber', label: 'İlham' }
  ];

  // -- Finalist Masterclass Data --
  const masterclassSchedule = [
      {
          date: '20 Nisan',
          type: 'ORTAK',
          title: 'Sinematik Anlatı & Kurgu Mantığı',
          desc: 'Kurgu masasında hikâyenin duygusal yeniden inşası: Ritim, zamanlama ve izleyiciyle kurulan o görünmez bağın matematiği.',
          icon: Film, // Premium Icon
          color: 'from-blue-600 to-cyan-500',
          shadow: 'shadow-blue-500/20'
      },
      {
          date: '21 Nisan',
          type: 'CANLI ÇEKİM',
          title: 'Color Grading & Ses Miksajı',
          desc: 'DaVinci Resolve ile sinematik atmosferin inşası ve festival standartlarında "Final Look" için ses-görüntü tasarımı.',
          icon: Palette, // Premium Icon
          color: 'from-emerald-500 to-teal-400',
          shadow: 'shadow-emerald-500/20'
      },
      {
          date: '21 Nisan',
          type: 'YAPAY ZEKA',
          title: 'AI Tutarlılık & Motion Brush',
          desc: 'Hikâye evreninde görsel bütünlük: Karakter tutarlılığını koruma ve yapay zeka ile sahneler arası akışkanlık sanatı.',
          icon: Sparkles, // Premium Icon
          color: 'from-purple-600 to-fuchsia-500',
          shadow: 'shadow-purple-500/20'
      },
      {
          date: '22 Nisan',
          type: 'ORTAK',
          title: 'Final Export & Dağıtım',
          desc: 'Filminizin ekran yolculuğunu profesyonelce planlamak: DCP hazırlığı, teknik teslimat standartları ve festival stratejileri.',
          icon: Rocket, // Premium Icon
          color: 'from-amber-500 to-orange-600',
          shadow: 'shadow-amber-500/20'
      }
  ];

  return (
    <div className="bg-slate-900 min-h-screen font-sans selection:bg-rose-500 selection:text-white pb-24">
      
      {/* 1. Cinematic Hero Section */}
      <div className="bg-gradient-to-b from-rose-950 via-slate-900 to-slate-950 text-white pt-32 pb-16 relative overflow-hidden">
        {/* Texture & Effects */}
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

      {/* 3. Cards Grid */}
      <section id="resources-grid" className="py-12 bg-slate-900 relative">
         {/* Subtle Grid Background */}
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>

         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
             
             {/* Section Title & Filters */}
             <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
                 <div>
                     <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                         <Sprout className="text-green-500"/> Yarışmaya Hazırlık Seti
                     </h2>
                     <p className="text-slate-400 text-sm mt-1 max-w-md">
                         Başlangıç seviyesindeki ekipler için seçilmiş temel ve zorunlu içerikler.
                     </p>
                 </div>
                 
                 <div className="flex flex-wrap gap-2 justify-end">
                     {categories.map((cat) => {
                         const style = getCategoryStyle(cat.id);
                         const isActive = activeCategory === cat.id;
                         return (
                             <button
                                 key={cat.id}
                                 onClick={() => setActiveCategory(cat.id)}
                                 className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all ${isActive ? style.activeBtn : style.inactiveBtn}`}
                             >
                                 {cat.label}
                             </button>
                         );
                     })}
                 </div>
             </div>

             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredItems.length === 0 && (
                    <div className="col-span-full py-24 text-center bg-slate-800/30 rounded-3xl border border-slate-700 border-dashed flex flex-col items-center animate-fadeIn">
                        <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4 border border-slate-700">
                            <Search size={32} className="text-slate-500"/>
                        </div>
                        <h3 className="text-white font-bold text-xl mb-2">İçerik Bulunamadı</h3>
                        <p className="text-slate-500 text-sm mb-6">Bu kategoride henüz eğitim materyali eklenmemiş.</p>
                        <button onClick={() => setActiveCategory('Tümü')} className="text-blue-400 text-sm font-bold hover:underline">Tümünü Göster</button>
                    </div>
                )}
                
                {filteredItems.map((item) => {
                    const imageUrl = item.coverImage || getTitleImage(item.title);
                    const styles = getCategoryStyle(item.category);

                    return (
                        <div 
                            key={item.id} 
                            onClick={() => handleCardClick(item)} 
                            className={`group relative flex flex-col bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] hover:border-slate-600`}
                        >
                            {/* Hover Gradient Overlay */}
                            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-emerald-900/10 to-transparent pointer-events-none z-0`}></div>

                            {/* Image Visual */}
                            <div className={`relative overflow-hidden h-48`}>
                                <img 
                                    src={imageUrl} 
                                    alt={item.title} 
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100" 
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent"></div>
                                
                                <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-sm p-2 rounded-full border border-white/10 text-white z-10 shadow-lg">
                                    <BookOpen size={18}/>
                                </div>
                                <div className="absolute top-4 left-4">
                                    <span className={`text-[10px] px-3 py-1.5 rounded-lg border uppercase tracking-wider font-bold ${styles.badge}`}>
                                        {item.category}
                                    </span>
                                </div>
                            </div>
                            
                            {/* Content */}
                            <div className={`p-8 flex flex-col flex-1 relative z-10 bg-slate-900`}>
                                <h3 className={`font-bold text-white mb-3 transition-colors leading-tight text-xl ${styles.title}`}>
                                    {item.title}
                                </h3>
                                <p className="text-slate-400 text-sm leading-relaxed mb-6 line-clamp-3 font-light">
                                    {item.description}
                                </p>
                                
                                <div className="mt-auto pt-6 border-t border-slate-800 flex items-center justify-between">
                                    <div className="flex gap-2">
                                        <button 
                                            className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1 hover:underline ${styles.btn}`}
                                            onClick={(e) => { e.stopPropagation(); handleCardClick(item); }}
                                        >
                                            Görüntüle <ExternalLink size={12}/>
                                        </button>
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

      {/* 4. FINALIST MASTERCLASS (Redesigned & Premium) */}
      <section className="relative z-20 mt-12 pt-24 border-t border-slate-800 bg-slate-900 overflow-hidden">
          {/* Ambient Glows */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-amber-900/10 blur-[120px] rounded-full pointer-events-none"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-32 relative z-10">
              
              {/* Header Block */}
              <div className="text-center mb-16 relative">
                  <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-slate-900 border border-amber-500/30 text-amber-500 text-xs font-bold tracking-[0.25em] uppercase mb-6 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
                      <Star size={14} className="fill-amber-500 text-amber-500"/> İleri Düzey Eğitimler
                  </div>
                  <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6">
                      Finalist <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-500 to-amber-200">Akademisi</span>
                  </h2>
                  <p className="text-slate-400 font-light text-lg max-w-2xl mx-auto leading-relaxed">
                      Sektör profesyonelleri ile buluşma noktası. Finale kalan 20 takım için özel olarak kurgulanmış canlı atölyeler.
                  </p>
              </div>

              {/* Masterclass Schedule Grid - Premium Update */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
                  {masterclassSchedule.map((item, idx) => (
                      <div key={idx} className={`group relative flex flex-col bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:${item.shadow}`}>
                          
                          {/* Top Gradient Line */}
                          <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${item.color}`}></div>

                          {/* Inner Glow (Hover) */}
                          <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none`}></div>

                          <div className="p-8 flex flex-col h-full relative z-10">
                              
                              {/* Header */}
                              <div className="flex justify-between items-start mb-6">
                                  {/* Date & Category */}
                                  <div className="flex items-center gap-4">
                                      <div className="flex flex-col items-center justify-center bg-slate-800 rounded-2xl p-3 min-w-[4.5rem] border border-slate-700 group-hover:border-slate-600 transition-colors">
                                          <span className="text-2xl font-black text-white leading-none mb-1">{item.date.split(' ')[0]}</span>
                                          <span className={`text-[10px] font-bold uppercase tracking-widest bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>{item.date.split(' ')[1].toUpperCase()}</span>
                                      </div>
                                      <div>
                                          <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-950 border border-slate-800 ${
                                              item.type === 'ORTAK' ? 'text-slate-400' : 'text-white'
                                          }`}>
                                              {item.type}
                                          </span>
                                      </div>
                                  </div>

                                  {/* Colorful Icon Box */}
                                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br ${item.color} shadow-lg shadow-black/30 group-hover:scale-110 transition-transform duration-300`}>
                                      <item.icon size={32} className="text-white drop-shadow-md" strokeWidth={1.5} />
                                  </div>
                              </div>

                              {/* Title & Desc */}
                              <div className="mb-6">
                                  <h3 className="text-2xl md:text-3xl font-black text-white mb-3 leading-tight tracking-tight">
                                      {item.title}
                                  </h3>
                                  <p className="text-slate-400 text-sm font-medium leading-relaxed">
                                      {item.desc}
                                  </p>
                              </div>

                              {/* Footer */}
                              <div className="mt-auto pt-6 border-t border-slate-800/50 flex items-center justify-between">
                                  <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                                      <Clock size={16} className={`bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}/> 20:00
                                  </div>
                                  
                                  {/* Button */}
                                  {isFinalist ? (
                                      <button className={`flex items-center gap-2 px-5 py-2 rounded-full bg-slate-950 border border-slate-800 text-white text-xs font-bold uppercase tracking-wider hover:bg-white hover:text-black transition-all group/btn`}>
                                          Katıl <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${item.color} group-hover/btn:scale-125 transition-transform`}></div>
                                      </button>
                                  ) : (
                                      <span className="text-slate-600 text-xs flex items-center gap-1"><Lock size={12}/> Kilitli</span>
                                  )}
                              </div>
                          </div>
                      </div>
                  ))}
              </div>

              {/* Exclusive Revision Kit - Premium Box Design */}
              <div className="relative max-w-5xl mx-auto">
                  <div className={`absolute inset-0 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 blur-2xl rounded-full transform -rotate-1 ${!isFinalist ? 'opacity-5' : 'opacity-20'}`}></div>
                  
                  <div className={`relative bg-gradient-to-br from-slate-900 to-slate-950 border rounded-[2.5rem] p-10 md:p-14 overflow-hidden shadow-2xl group ${!isFinalist ? 'border-slate-800' : 'border-slate-700'}`}>
                      {/* Decorative Elements */}
                      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500/0 via-amber-500/50 to-amber-500/0"></div>

                      <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
                          
                          {/* Left: Content */}
                          <div className="flex-1 text-center md:text-left">
                              <div className="inline-flex items-center gap-2 text-amber-500 font-bold text-xs uppercase tracking-widest mb-4">
                                  <Star size={14} className="fill-amber-500" /> Özel Erişim
                              </div>
                              <h3 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
                                  Revize Hazırlık Kiti
                              </h3>
                              <p className="text-slate-400 text-lg font-light leading-relaxed mb-8">
                                  Final tesliminden önce projenizi teknik ve sanatsal açıdan kusursuz hale getirmek için hazırlanan, sadece finalistlerin erişebildiği özel kontrol listesi ve teknik dökümanlar.
                              </p>
                              
                              <button disabled={!isFinalist} className={`inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold transition-all shadow-lg transform ${!isFinalist ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' : 'bg-white text-slate-950 hover:bg-amber-400 hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] hover:-translate-y-1'}`}>
                                  {!isFinalist ? <Lock size={20} /> : <Download size={20} />} 
                                  {!isFinalist ? 'Erişim Kısıtlı' : 'Kiti İndir (PDF)'}
                              </button>
                          </div>

                          {/* Right: Visual Checklist */}
                          <div className="flex-1 w-full bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 backdrop-blur-md">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  {[
                                      'Renk Düzenleme (Color Grading)', 'Ses Temizliği & Final Miksaj', 
                                      'Altyazı & Jenerik Standartları', 'AI Tutarlılık & Glitch Temizliği',
                                      'Telif & Lisans Uyumluluğu', 'Dosya İsimlendirme & Format',
                                      'Final Export Ayarları (Bitrate)', 'DCP Hazırlık Öncesi Kontrol'
                                  ].map((item, idx) => (
                                      <div key={idx} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors group/item">
                                          <div className="w-5 h-5 rounded-full border-2 border-slate-600 flex items-center justify-center group-hover/item:border-amber-500 group-hover/item:bg-amber-500/20 transition-colors">
                                              <div className="w-2 h-2 rounded-full bg-transparent group-hover/item:bg-amber-500 transition-colors"></div>
                                          </div>
                                          <span className="text-xs font-bold text-slate-400 group-hover/item:text-slate-200 transition-colors">{item}</span>
                                      </div>
                                  ))}
                              </div>
                          </div>

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
