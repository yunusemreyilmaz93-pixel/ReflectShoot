import React, { useState } from 'react';
import { 
  BookOpen, Clapperboard, Download, 
  ChevronRight, CheckCircle2, Award, Star, Film, 
  Camera, PenTool, Scissors, Play, Wand2, Layers, 
  Mic2, Settings, MessageCircle, Music, Tv, Users, MonitorPlay, Lightbulb, FileText, Share2
} from 'lucide-react';

export const Academy: React.FC = () => {
  const [activeWorkshop, setActiveWorkshop] = useState<'AI' | 'LIVE'>('AI');

  return (
    <div className="bg-slate-900 min-h-screen font-sans selection:bg-rose-500 selection:text-white">
      
      {/* 1. Cinematic Hero Section - MATCHING FINAL PAGE */}
      <div className="bg-gradient-to-b from-rose-950 via-slate-900 to-slate-950 text-white pt-32 pb-24 relative overflow-hidden">
        {/* Texture & Effects */}
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
            <div className="flex justify-center animate-fadeIn delay-300">
                <button className="bg-white text-rose-950 hover:bg-rose-100 font-bold py-4 px-8 rounded-full shadow-2xl shadow-rose-900/20 transition-all hover:-translate-y-1 hover:shadow-3xl flex items-center gap-3 group">
                    <div className="bg-rose-100 p-2 rounded-full group-hover:bg-rose-200 transition-colors">
                        <Download size={20} className="text-rose-600" />
                    </div>
                    <span>Akademi Programını İndir (PDF)</span>
                </button>
            </div>
        </div>
      </div>

      {/* 2. LEVEL 1: OPEN SOURCES (Foundation / Converted to Dark Theme) */}
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

             {/* Cards Grid - Dark Mode */}
             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                    { icon: PenTool, title: "Senaryo Yazımı 101", desc: "Kahramanın yolculuğu, olay örgüsü kurma ve format standartları.", tag: "Senaryo" },
                    { icon: Camera, title: "Sinematografi Temelleri", desc: "Kompozisyon kuralları, ışık türleri ve kamera açıları.", tag: "Görüntü" },
                    { icon: Wand2, title: "AI Video Üretimine Giriş", desc: "Prompt mühendisliği ve yapay zeka araçları (Midjourney, Runway) rehberi.", tag: "Teknoloji" },
                    { icon: MessageCircle, title: "Diyalog Yazım Rehberi", desc: "Karakter sesini bulma ve İngilizce diyalog şablonları.", tag: "Yazım" }, 
                    { icon: FileText, title: "Storyboard & Shotlist", desc: "Çekim öncesi planlama dosyaları ve örnek şablonlar.", tag: "Prodüksiyon" },
                    { icon: Music, title: "Ses & Müzik Arşivi", desc: "Telif hakkı sorunu olmayan güvenli müzik ve ses efekti kaynakları.", tag: "Post" },
                ].map((item, idx) => (
                    <div key={idx} className="group bg-slate-800/50 p-8 rounded-2xl border border-slate-700 shadow-lg hover:shadow-2xl hover:border-teal-500/50 hover:bg-slate-800 transition-all duration-300 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 text-white">
                            <item.icon size={80} />
                        </div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 rounded-full bg-slate-900 text-slate-400 border border-slate-700 text-xs font-bold uppercase tracking-wider group-hover:bg-teal-900/30 group-hover:text-teal-400 group-hover:border-teal-500/30 transition-colors">
                                {item.tag}
                            </span>
                        </div>
                        <h3 className="font-bold text-white text-xl mb-3 group-hover:text-teal-400 transition-colors">{item.title}</h3>
                        <p className="text-slate-400 leading-relaxed mb-6">
                            {item.desc}
                        </p>
                        <button className="text-slate-500 font-bold text-sm flex items-center gap-2 group-hover:text-teal-500 transition-colors">
                            Kaynağı İncele <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                ))}
             </div>
         </div>
      </section>

      {/* 4. LEVEL 2: FINALIST JOURNEY (Advanced / Dark Cinematic Theme) */}
      <div className="bg-slate-900 text-slate-300 relative overflow-hidden pb-32 pt-10 border-t border-slate-800">
          
          {/* Cinematic Atmospherics */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }}></div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-rose-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              
              {/* Header */}
              <div className="text-center mb-24">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800 border border-slate-700 text-amber-400 text-sm font-bold tracking-widest uppercase mb-6 shadow-[0_0_15px_rgba(251,191,36,0.1)]">
                      <Star size={14} className="fill-current" /> Premium Erişim
                  </div>
                  <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4 drop-shadow-2xl">
                    Finalist Gelişim Süreci
                  </h2>
                  <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-light">
                      Sadece finale kalan ekipler için tasarlanmış, profesyonel bir <br className="hidden md:block"/>film üretim simülasyonu.
                  </p>
              </div>

              {/* PHASE 1: PRE-PRODUCTION (Re-engineered Timeline) */}
              <div className="mb-32 relative">
                  <div className="flex items-center gap-4 mb-16">
                      <div className="text-8xl font-black text-slate-800/50 absolute -left-4 -top-10 md:static md:text-slate-800 select-none">01</div>
                      <div className="relative z-10">
                          <h3 className="text-3xl font-bold text-white">Ön Hazırlık</h3>
                          <p className="text-rose-400 font-medium">Akademi Kampı (3 Gün)</p>
                      </div>
                  </div>

                  {/* Desktop Timeline Visual */}
                  <div className="hidden md:block absolute top-[180px] left-0 w-full h-0.5 bg-gradient-to-r from-slate-800 via-rose-900/50 to-slate-800"></div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                      {[
                          { 
                              day: "1. Gün", 
                              title: "Sahne 1: Senaryo", 
                              subtitle: "Hikaye & Olay Örgüsü",
                              icon: PenTool,
                              details: ["Karakter Arkı Oluşturma", "Diyalog Yazım Teknikleri", "Logline & Sinopsis"]
                          },
                          { 
                              day: "2. Gün", 
                              title: "Sahne 2: Set Tasarımı", 
                              subtitle: "Prodüksiyon Planlama",
                              icon: Clapperboard,
                              details: ["Shotlist Hazırlama", "Prodüksiyon Takvimi", "Ekip Rolleri & Görevler"]
                          },
                          { 
                              day: "3. Gün", 
                              title: "Sahne 3: Sunum", 
                              subtitle: "Pitching & Vizyon",
                              icon: Share2, // Pitching
                              details: ["Proje Sunum Teknikleri", "Yönetmen Vizyonu", "İngilizce Pitching"]
                          }
                      ].map((item, i) => (
                          <div key={i} className="relative group">
                              {/* Connector Dot (Desktop) */}
                              <div className="hidden md:flex justify-center mb-12 relative z-10">
                                  <div className="w-4 h-4 rounded-full bg-slate-900 border-2 border-rose-500 shadow-[0_0_15px_rgba(225,29,72,0.6)] group-hover:scale-150 transition-transform duration-300"></div>
                              </div>

                              {/* Mobile Connector */}
                              <div className="md:hidden absolute left-0 top-0 bottom-0 w-0.5 bg-slate-800"></div>
                              <div className="md:hidden absolute left-[-5px] top-8 w-3 h-3 rounded-full bg-rose-500"></div>

                              {/* Card */}
                              <div className="ml-8 md:ml-0 bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 p-8 rounded-2xl hover:bg-slate-800 hover:border-rose-500/30 transition-all duration-300 group-hover:-translate-y-2 shadow-2xl relative overflow-hidden">
                                  {/* Hover Glow */}
                                  <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                  
                                  <div className="relative z-10">
                                      <div className="flex items-center justify-between mb-6">
                                          <span className="px-3 py-1 rounded text-xs font-bold bg-slate-900 text-rose-400 border border-slate-700">{item.day}</span>
                                          <item.icon className="text-slate-500 group-hover:text-rose-400 transition-colors" size={24} />
                                      </div>
                                      <h4 className="text-xl font-bold text-white mb-2">{item.title}</h4>
                                      <p className="text-slate-400 text-sm mb-6 pb-6 border-b border-slate-700/50">{item.subtitle}</p>
                                      <ul className="space-y-3">
                                          {item.details.map((d, idx) => (
                                              <li key={idx} className="flex items-start text-sm text-slate-300 group-hover:text-white transition-colors">
                                                  <div className="w-1.5 h-1.5 bg-rose-500 rounded-full mr-3 mt-1.5 flex-shrink-0"></div>
                                                  {d}
                                              </li>
                                          ))}
                                      </ul>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>

              {/* PHASE 2: PRODUCTION (Interactive Workshops) */}
              <div className="mb-32">
                   <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
                        <div className="flex items-center gap-4">
                            <div className="text-8xl font-black text-slate-800/50 absolute -left-4 md:static md:text-slate-800 select-none">02</div>
                            <div className="relative z-10 pl-12 md:pl-0">
                                <h3 className="text-3xl font-bold text-white">Yapım Aşaması</h3>
                                <p className="text-amber-400 font-medium">Uzmanlık Atölyeleri</p>
                            </div>
                        </div>
                        
                        {/* Interactive Switcher */}
                        <div className="bg-slate-950 p-1.5 rounded-xl inline-flex border border-slate-800 relative z-10 mx-auto md:mx-0">
                            <button 
                                onClick={() => setActiveWorkshop('AI')}
                                className={`px-6 py-3 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${activeWorkshop === 'AI' ? 'bg-amber-500 text-slate-900 shadow-[0_0_20px_rgba(245,158,11,0.3)]' : 'text-slate-500 hover:text-white'}`}
                            >
                                <Wand2 size={16} /> Yapay Zeka
                            </button>
                            <button 
                                onClick={() => setActiveWorkshop('LIVE')}
                                className={`px-6 py-3 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${activeWorkshop === 'LIVE' ? 'bg-teal-500 text-white shadow-[0_0_20px_rgba(20,184,166,0.3)]' : 'text-slate-500 hover:text-white'}`}
                            >
                                <Camera size={16} /> Canlı Çekim
                            </button>
                        </div>
                   </div>

                   <div className="grid md:grid-cols-3 gap-6">
                       {/* Animated Content based on Selection */}
                       {activeWorkshop === 'AI' ? (
                           <>
                               {[
                                   { icon: Tv, title: "Prompt Yönetmenliği", desc: "Yönetmen vizyonunu yapay zeka araçlarına (Midjourney, Runway) aktarma dili.", sub: "Hikaye Anlatımı" },
                                   { icon: Users, title: "Dijital Oyuncu Seçimi", desc: "Karakter tutarlılığı sağlama, yüz modelleme ve dijital aktör yaratımı.", sub: "Karakter Tasarımı" },
                                   { icon: Layers, title: "Sentetik Sinematografi", desc: "Sanal kamera açıları, ışıklandırma simülasyonları ve atmosfer tasarımı teknikleri.", sub: "Görsel Yönetim" }
                               ].map((card, idx) => (
                                   <div key={idx} className="bg-slate-800/30 border border-slate-700/50 hover:border-amber-500/50 rounded-2xl p-8 hover:bg-slate-800 transition-all duration-300 group">
                                       <div className="flex items-center gap-4 mb-6">
                                           <div className="p-3 bg-amber-500/10 text-amber-500 rounded-lg group-hover:scale-110 transition-transform">
                                               <card.icon size={24} />
                                           </div>
                                           <h4 className="text-lg font-bold text-white">{card.title}</h4>
                                       </div>
                                       <p className="text-slate-400 text-sm leading-relaxed mb-6 border-b border-slate-700/50 pb-6 min-h-[5rem]">
                                           {card.desc}
                                       </p>
                                       <div className="text-xs font-bold text-amber-500 uppercase tracking-widest flex items-center gap-2">
                                           <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                                           {card.sub}
                                       </div>
                                   </div>
                               ))}
                           </>
                       ) : (
                           <>
                               {[
                                   { icon: Users, title: "Set Dinamikleri", desc: "Yönetmen-Oyuncu iletişimi, set hiyerarşisi, zaman yönetimi ve çekim akışı.", sub: "Ekip Yönetimi" },
                                   { icon: Lightbulb, title: "Pratik Işıklandırma", desc: "Doğal ışık kullanımı, 3 nokta aydınlatma kurulumu ve atmosfer oluşturma.", sub: "Görüntü Yönetimi" },
                                   { icon: MonitorPlay, title: "Kurgu Masası", desc: "Adobe Premiere / DaVinci Resolve ile kurgu ritmi, renk düzenleme ve ses miksajı.", sub: "Post Prodüksiyon" }
                               ].map((card, idx) => (
                                   <div key={idx} className="bg-slate-800/30 border border-slate-700/50 hover:border-teal-500/50 rounded-2xl p-8 hover:bg-slate-800 transition-all duration-300 group">
                                       <div className="flex items-center gap-4 mb-6">
                                           <div className="p-3 bg-teal-500/10 text-teal-500 rounded-lg group-hover:scale-110 transition-transform">
                                               <card.icon size={24} />
                                           </div>
                                           <h4 className="text-lg font-bold text-white">{card.title}</h4>
                                       </div>
                                       <p className="text-slate-400 text-sm leading-relaxed mb-6 border-b border-slate-700/50 pb-6 min-h-[5rem]">
                                           {card.desc}
                                       </p>
                                       <div className="text-xs font-bold text-teal-500 uppercase tracking-widest flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
                                            {card.sub}
                                       </div>
                                   </div>
                               ))}
                           </>
                       )}
                   </div>
              </div>

              {/* PHASE 3: THE PREMIERE (Final Cut) */}
              <div className="relative rounded-3xl overflow-hidden border border-slate-700 bg-slate-800/50 group hover:border-slate-500 transition-colors">
                  {/* Background Accents */}
                  <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                      <Film size={300} />
                  </div>
                  <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-rose-600/20 rounded-full blur-[80px]"></div>
                  
                  <div className="flex flex-col lg:flex-row items-center p-10 md:p-16 gap-12 relative z-10">
                       <div className="flex-shrink-0">
                           <div className="w-32 h-32 bg-rose-600 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(225,29,72,0.5)] animate-pulse group-hover:scale-105 transition-transform border-4 border-slate-900">
                               <Play size={48} className="text-white ml-2 fill-current" />
                           </div>
                       </div>
                       
                       <div className="flex-1 text-center lg:text-left">
                           <div className="flex items-center justify-center lg:justify-start gap-4 mb-4">
                                <div className="text-6xl font-black text-slate-700">03</div>
                                <h3 className="text-3xl md:text-4xl font-black text-white">Büyük Gala <span className="text-rose-500">&</span> Final Cut</h3>
                           </div>
                           
                           <p className="text-slate-300 text-lg leading-relaxed mb-10 max-w-2xl">
                               Tüm finalist ekiplerin projeleri, uzman jüri üyeleri ile yapılan <strong>"Final Cut"</strong> oturumunda son kez değerlendirilir.
                               Eksikler tamamlanır, renk ve ses miksajı kontrol edilir ve film gala gecesine hazır hale getirilir.
                           </p>
                           
                           <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                               <div className="bg-slate-900 px-6 py-4 rounded-xl border border-slate-700 flex items-center justify-center sm:justify-start gap-3 text-sm font-bold text-slate-300 hover:border-rose-500/50 transition-colors">
                                   <Settings size={18} className="text-rose-500" /> Teknik Kontrol
                               </div>
                               <div className="bg-slate-900 px-6 py-4 rounded-xl border border-slate-700 flex items-center justify-center sm:justify-start gap-3 text-sm font-bold text-slate-300 hover:border-amber-500/50 transition-colors">
                                   <Award size={18} className="text-amber-500" /> Jüri İncelemesi
                               </div>
                               <div className="bg-slate-900 px-6 py-4 rounded-xl border border-slate-700 flex items-center justify-center sm:justify-start gap-3 text-sm font-bold text-slate-300 hover:border-teal-500/50 transition-colors">
                                   <Star size={18} className="text-teal-500" /> Gala Hazırlığı
                               </div>
                           </div>
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
        .delay-300 { animation-delay: 0.3s; }
      `}</style>
    </div>
  );
};