
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Cpu, Clapperboard, BookOpen, ScrollText, Users, CalendarDays, Download, ChevronDown, PlayCircle, School, Layout, X, CheckCircle2, AlertTriangle, ExternalLink, FileText, Trophy, Film, PenTool, Target, HelpCircle } from 'lucide-react';
import { Timeline } from '../components/Timeline';
import { versesList, verseDetails, VERSE_SPLITTER } from '../data/verses';
import { useAppContext } from '../context/AppContext';

// Competition Schedule Configuration
const COMPETITION_PHASES = [
  { label: 'Başvuruların Başlaması', date: '2026-01-20T09:00:00' },
  { label: 'Son Başvuru Tarihi', date: '2026-02-13T23:59:59' },
  { label: '1. Video Teslimi', date: '2026-03-20T23:59:59' },
  { label: 'Finalistlerin Açıklanması', date: '2026-04-01T12:00:00' },
  { label: 'Akademi & Workshoplar', date: '2026-04-06T09:00:00' },
  { label: 'Revize Video Teslimi', date: '2026-05-04T23:59:59' },
  { label: 'Sonuçların Açıklanması', date: '2026-05-11T10:00:00' },
  { label: 'Büyük Final & Ödül Töreni', date: '2026-05-22T19:00:00' }
];

// Helper to find the next active phase
const getNextPhase = () => {
  const now = new Date();
  const nextEvent = COMPETITION_PHASES.find(phase => new Date(phase.date) > now);
  return nextEvent || COMPETITION_PHASES[COMPETITION_PHASES.length - 1];
};

// Countdown Component
const CountdownTimer = ({ targetDate }: { targetDate: string }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const target = new Date(targetDate).getTime();
    const calculateTime = () => {
      const now = new Date().getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };
    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="flex gap-3 md:gap-6 justify-center text-white/90">
      {[
        { value: timeLeft.days, label: 'GÜN' },
        { value: timeLeft.hours, label: 'SAAT' },
        { value: timeLeft.minutes, label: 'DK' },
        { value: timeLeft.seconds, label: 'SN' },
      ].map((item, idx) => (
        <div key={idx} className="flex flex-col items-center">
          <div className="text-2xl md:text-4xl font-light tabular-nums tracking-tight bg-white/5 rounded-lg py-2 px-3 min-w-[3.5rem] md:min-w-[4.5rem] text-center backdrop-blur-sm border border-white/10 shadow-inner">
             {item.value.toString().padStart(2, '0')}
          </div>
          <span className="text-[10px] font-bold tracking-widest opacity-60 mt-2 text-amber-500">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

interface CategoryData {
  id: string;
  title: string;
  badge: string;
  shortDesc: string;
  icon: React.ElementType;
  color: string;
  techSpecs: { icon: React.ElementType, label: string }[];
  details: {
    description: string[];
    warnings: string[];
  }
}

export const Home: React.FC = () => {
  const { cmsLinks } = useAppContext();
  const [activePhase, setActivePhase] = useState(getNextPhase());
  const [selectedCategory, setSelectedCategory] = useState<CategoryData | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setActivePhase(getNextPhase());
    }, 60000); 
    return () => clearInterval(interval);
  }, []);

  const renderVerseText = (text: string, isArabic: boolean) => {
    if (!text) return null;
    return text.split(VERSE_SPLITTER).map((part, index) => (
      <React.Fragment key={index}>
        {index > 0 && (
          <span className={`mx-2 inline-block ${isArabic ? 'text-amber-500 text-xl' : 'text-amber-500/50 text-xs'} select-none`}>
             {isArabic ? ' ۞ ' : ' ✦ '}
          </span>
        )}
        {part}
      </React.Fragment>
    ));
  };

  const categories: CategoryData[] = [
    {
      id: 'live-action',
      title: 'Canlı Çekim',
      badge: 'SİNEMATOGRAFİ',
      shortDesc: 'Gerçek oyuncular, set ışıkları ve kamera lensinin gücü ile fikrini filme dönüştür.',
      icon: Film,
      color: 'teal',
      techSpecs: [
        { icon: Clapperboard, label: 'Kurmaca / Belgesel' },
        { icon: Layout, label: '1920x1080 FHD' },
        { icon: CalendarDays, label: '3-8 Dakika' }
      ],
      details: {
        description: [
           "Geleneksel sinema teknikleri kullanılarak üretilmelidir.",
           "Senaryo özgün olmalı ve belirlenen temalardan birini işlemelidir.",
           "Oyuncu yönetimi, ışık kullanımı ve ses kalitesi değerlendirmede önemlidir."
        ],
        warnings: [
          "Telif hakkı içeren müzik veya görüntü kullanılamaz.",
          "Okul ve genel ahlak kurallarına aykırı içerikler diskalifiye sebebidir.",
          "Filmin dili İngilizce, altyazılar Türkçe olmalıdır."
        ]
      }
    },
    {
      id: 'ai-animation',
      title: 'Yapay Zeka Animasyon',
      badge: 'SENTETİK MEDYA',
      shortDesc: 'Prompt mühendisliği ile oluşturulan dijital hikayeler ve görsel anlatım.',
      icon: Cpu,
      color: 'purple',
      techSpecs: [
        { icon: Layout, label: 'Yapay Zeka' },
        { icon: Layout, label: '1920x1080 FHD' },
        { icon: CalendarDays, label: '3-8 Dakika' }
      ],
      details: {
        description: [
           "Görüntü oluşturma ve video üretiminde Yapay Zeka araçları (Midjourney, Runway, Pika vb.) kullanılmalıdır.",
           "Prompt mühendisliği ve görsel tutarlılık esas alınır.",
           "Senaryo ve kurgu bütünlüğü teknik kapasite kadar önemlidir."
        ],
        warnings: [
          "Tamamen stok görüntülerden oluşan kolajlar kabul edilmez.",
          "Yapay zeka tarafından üretilen içeriklerin etik kullanımı esastır.",
          "Filmin dili İngilizce (AI Seslendirme kabul edilir), altyazılar Türkçe olmalıdır."
        ]
      }
    }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const handleDownload = (link: string) => {
    if (link) {
        window.open(link, "_blank");
    } else {
        alert("Link henüz eklenmemiş.");
    }
  };

  const scrollToContent = () => {
    const element = document.getElementById('categories');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-slate-950 min-h-screen relative overflow-x-hidden font-sans">
      
      {/* Global Cinematic Grain */}
      <div className="fixed inset-0 pointer-events-none z-[100] mix-blend-overlay opacity-5" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }}></div>

      {/* 1. Cinematic Hero Section - MATCHING OTHER PAGES */}
      <div className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-rose-950 via-slate-900 to-slate-950 overflow-hidden text-center px-4 pt-32 pb-24">
        
        {/* Spotlights */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[500px] bg-rose-500/10 blur-[120px] rounded-full pointer-events-none mix-blend-screen"></div>

        {/* Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto flex flex-col items-center justify-center h-full">
          
          {/* Stats Cards Section - REVISED & ENLARGED */}
          <div className="flex flex-col items-center gap-4 mb-16 animate-fadeInDown w-full">
              
              {/* Top Text */}
              <div className="relative">
                 <span className="text-amber-500 font-bold tracking-[0.4em] text-sm md:text-base uppercase flex items-center gap-4 drop-shadow-md">
                    <span className="w-12 md:w-20 h-px bg-gradient-to-l from-amber-500 to-transparent opacity-50"></span>
                    2025 YILINDA
                    <span className="w-12 md:w-20 h-px bg-gradient-to-r from-amber-500 to-transparent opacity-50"></span>
                 </span>
              </div>

              {/* Huge Cards Row */}
              <div className="flex flex-wrap justify-center gap-6 my-2">
                  {[
                    { icon: Clapperboard, val: "27", label: "Takım" },
                    { icon: School, val: "10+", label: "Okul" },
                    { icon: Users, val: "150+", label: "Öğrenci" }
                  ].map((stat, i) => (
                    <div key={i} className="flex flex-col items-center justify-center px-8 py-5 md:px-10 md:py-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-amber-500/50 hover:bg-white/10 hover:scale-105 transition-all duration-300 group min-w-[140px] md:min-w-[180px]">
                        <div className="text-amber-500 group-hover:scale-110 transition-transform mb-2">
                            <stat.icon size={32} />
                        </div>
                        <div className="text-center">
                            <div className="text-white font-black text-3xl md:text-5xl leading-none drop-shadow-xl">{stat.val}</div>
                            <div className="text-slate-400 text-xs md:text-sm uppercase tracking-widest font-bold mt-2 group-hover:text-white transition-colors">{stat.label}</div>
                        </div>
                    </div>
                  ))}
              </div>

               {/* Bottom Text */}
               <div className="relative">
                 <span className="text-amber-500 font-bold tracking-[0.4em] text-sm md:text-base uppercase flex items-center gap-4 drop-shadow-md">
                    <span className="w-12 md:w-20 h-px bg-gradient-to-l from-amber-500 to-transparent opacity-50"></span>
                    YARIŞTI
                    <span className="w-12 md:w-20 h-px bg-gradient-to-r from-amber-500 to-transparent opacity-50"></span>
                 </span>
              </div>
          </div>

          {/* Typography */}
          <div className="animate-fadeInUp space-y-4 mb-16 relative z-20 flex flex-col items-center">
            <div className="text-center">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tighter leading-tight relative drop-shadow-2xl mb-2">
                  Oku, Anla, <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 drop-shadow-[0_0_20px_rgba(245,158,11,0.5)]">Anlat!</span>
                </h1>
                <h2 className="text-xl md:text-2xl lg:text-3xl font-black text-slate-400 tracking-tight mt-1 drop-shadow-lg flex items-center justify-center gap-2 md:gap-4">
                  Read, Grasp, <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500/70 via-amber-400/70 to-amber-500/70">Narrate!</span>
                </h2>
            </div>
            
            <div className="text-center max-w-5xl mx-auto space-y-4 mt-8">
                <p className="text-2xl md:text-3xl font-light italic text-slate-200 tracking-tight leading-relaxed">
                   "Kelime iner, düşünce uyanır, <span className="font-semibold text-white border-b-2 border-amber-500/50 italic">mânâ açılır</span>."
                </p>
                <p className="text-lg md:text-xl font-light italic text-slate-500 tracking-wide">
                   "The word descends, thought awakens, <span className="font-bold text-slate-300 border-b-2 border-amber-500/80">meaning unfolds</span>."
                </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-5 items-center justify-center mb-24 animate-fadeInUp delay-100 w-full sm:w-auto relative z-20">
             <Link 
               to="/apply" 
               className="group relative px-10 py-5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-full transition-all duration-300 shadow-[0_10px_40px_rgba(225,29,72,0.3)] hover:shadow-[0_10px_50px_rgba(225,29,72,0.5)] hover:-translate-y-1 w-full sm:w-auto flex items-center justify-center overflow-hidden"
             >
                <span className="flex items-center gap-3 relative z-10">
                  <PlayCircle size={24} className="fill-white text-rose-600"/> PROJEYİ BAŞLAT
                </span>
             </Link>
             
             <button 
               onClick={() => handleDownload(cmsLinks.specUrl)}
               className="px-10 py-5 border border-white/20 text-slate-300 hover:text-white hover:border-white/50 rounded-full font-bold transition-all duration-300 hover:bg-white/5 flex items-center justify-center gap-2 w-full sm:w-auto"
             >
                <Download size={20}/> Şartnameyi İndir
             </button>
          </div>

          {/* Premium Countdown Card */}
          <div className="mt-auto animate-fadeInUp delay-200 w-full max-w-4xl relative z-20">
              <div className="flex flex-col md:flex-row items-center justify-between bg-slate-900/60 backdrop-blur-xl rounded-[2rem] border border-white/10 p-8 gap-8 shadow-2xl">
                 <div className="text-left flex items-center gap-6 w-full md:w-auto">
                    <div className="p-5 bg-amber-500/10 rounded-2xl text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.1)] hidden sm:block border border-amber-500/20">
                        <CalendarDays size={36} />
                    </div>
                    <div>
                        <p className="text-amber-500 text-[10px] font-bold uppercase tracking-[0.25em] mb-2 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_5px_#f59e0b]"></span>
                          Sıradaki Aşama
                        </p>
                        <p className="text-white font-bold text-2xl md:text-3xl tracking-tight leading-none">{activePhase.label}</p>
                        <p className="text-slate-400 text-sm font-medium mt-1">{formatDate(activePhase.date)}</p>
                    </div>
                 </div>
                 
                 <div className="w-full h-px md:w-px md:h-24 bg-gradient-to-r md:bg-gradient-to-b from-transparent via-white/10 to-transparent"></div>
                 
                 <div className="flex-shrink-0">
                    <CountdownTimer targetDate={activePhase.date} />
                 </div>
              </div>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-40">
           <button onClick={scrollToContent} className="text-slate-500 hover:text-amber-500 transition-colors animate-bounce">
              <ChevronDown size={32} />
           </button>
        </div>

        <style>{`
          @keyframes fadeInDown {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeInDown { animation: fadeInDown 0.8s ease-out forwards; }
          .animate-fadeInUp { animation: fadeInUp 0.8s ease-out forwards; }
          .delay-100 { animation-delay: 0.1s; }
          .delay-200 { animation-delay: 0.2s; }
        `}</style>
      </div>

      {/* 2. Categories Section - Improved Visibility */}
      <section id="categories" className="py-24 bg-slate-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
             <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-200 text-slate-600 text-xs font-bold tracking-widest uppercase mb-6">
                 <Clapperboard size={14} /> Kategori Seçimi
             </div>
             <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-4">
               Hikâyeni Hangi Yolla <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600">Sahneye Taşıyacaksın?</span>
             </h2>
             <p className="mt-6 text-xl text-slate-500 max-w-2xl mx-auto font-light leading-relaxed">
               İster kamera lensinden, ister kodların gücünden. Senin sahnen hangisi?
             </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
            {categories.map((cat) => (
              <div 
                key={cat.id} 
                className="group relative bg-white rounded-[2rem] p-2 overflow-hidden transition-all duration-500 hover:-translate-y-2 shadow-2xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.15)]"
              >
                <div className="bg-slate-50 h-full rounded-[1.5rem] p-8 md:p-12 flex flex-col relative overflow-hidden">
                    <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/concrete-wall.png')] mix-blend-multiply"></div>
                    
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-8">
                            <span className={`inline-block px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] border ${cat.color === 'teal' ? 'bg-teal-900 text-teal-100 border-teal-700' : 'bg-purple-900 text-purple-100 border-purple-700'}`}>
                                {cat.badge}
                            </span>
                            <div className={`p-5 rounded-2xl bg-white shadow-xl border border-slate-100 group-hover:scale-110 transition-transform duration-300 ${cat.color === 'teal' ? 'text-teal-600' : 'text-purple-600'}`}>
                                <cat.icon size={36} />
                            </div>
                        </div>

                        <h3 className="text-3xl font-black text-slate-900 mb-4 group-hover:text-amber-600 transition-colors">
                            {cat.title}
                        </h3>
                        <p className="text-slate-600 text-lg leading-relaxed mb-10 font-medium">
                            {cat.shortDesc}
                        </p>

                        <div className="grid grid-cols-3 gap-4 mb-10">
                            {cat.techSpecs.map((spec, i) => (
                                <div key={i} className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-slate-200 text-center group-hover:border-amber-500/30 transition-colors shadow-sm">
                                    <spec.icon size={20} className="mx-auto mb-2 text-slate-400 group-hover:text-slate-800" />
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">{spec.label}</span>
                                </div>
                            ))}
                        </div>

                        <button 
                            onClick={() => setSelectedCategory(cat)}
                            className="w-full py-5 bg-slate-900 text-white font-bold rounded-xl hover:bg-rose-600 transition-colors flex items-center justify-center gap-2 group-hover:shadow-lg text-sm tracking-wide uppercase"
                        >
                            Teknik Detayları İncele <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Themes Section - Dark Cinematic (Matches About) */}
      <section className="py-24 bg-slate-950 relative overflow-visible">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(30,41,59,0.4)_0%,rgba(2,6,23,1)_100%)]"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6 pt-12 border-t border-slate-800/50">
             <div>
                <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4 mt-8">
                    Yarışma <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500">Temaları</span>
                </h2>
                <p className="text-slate-400 text-lg font-light leading-relaxed max-w-2xl">
                    Kutsal kaynaklardan beslenen, sinema diliyle günümüze taşınan özgün hikayeler.
                </p>
             </div>
             <div className="bg-slate-900 px-5 py-3 rounded-xl border border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                 <PenTool size={14} /> İlham Kaynakları
             </div>
          </div>

          <div className="space-y-12">
            
            {/* Ayetler - Fixed Layout */}
            <div className="relative bg-slate-900 p-8 md:p-12 rounded-[2rem] shadow-2xl border border-slate-800 border-t-4 border-t-amber-500/80 overflow-visible">
               <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/cardboard-flat.png')] pointer-events-none"></div>
               
               <div className="relative z-10">
                   <div className="flex items-center gap-6 mb-10">
                       <div className="w-20 h-20 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
                           <BookOpen className="text-amber-500" size={36} />
                       </div>
                       <div>
                           <h3 className="text-3xl font-black text-white">Kur'an'dan Ayetler</h3>
                           <p className="text-slate-400 font-medium mt-1">Senaryo Temeli: Vahiy</p>
                       </div>
                   </div>
                   
                   <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                       {versesList.map((verse, idx) => (
                           <div key={idx} className="bg-slate-950 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-900 transition-all cursor-default p-6 rounded-xl flex items-center justify-center text-center shadow-lg group relative overflow-visible hover:z-50">
                               <span className="font-bold text-slate-400 text-sm group-hover:text-white transition-colors">{verse}</span>
                               
                               {/* Tooltip for specific verses */}
                               {verseDetails[verse] && (
                                   <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-[90vw] md:w-[400px] p-6 bg-slate-900/95 backdrop-blur-md rounded-2xl border border-amber-500/40 shadow-[0_0_40px_rgba(245,158,11,0.25)] opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none group-hover:pointer-events-auto z-50 text-center transform -translate-y-2 mb-2">
                                       <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-900 border-r border-b border-amber-500/40 rotate-45"></div>
                                       <div className="relative z-10 flex flex-col gap-4">
                                           <p className="font-serif text-xl text-amber-400 leading-loose drop-shadow-sm" dir="rtl">
                                              {renderVerseText(verseDetails[verse].arabic, true)}
                                           </p>
                                           <div className="w-16 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent mx-auto"></div>
                                           <p className="text-slate-200 text-sm italic font-light leading-relaxed font-serif">
                                             "{renderVerseText(verseDetails[verse].turkish, false)}"
                                           </p>
                                            {verseDetails[verse].english && (
                                               <p className="text-slate-400 text-xs italic font-light leading-relaxed opacity-80">
                                                 "{renderVerseText(verseDetails[verse].english, false)}"
                                               </p>
                                            )}
                                       </div>
                                   </div>
                               )}
                           </div>
                       ))}
                   </div>
               </div>
            </div>

            {/* Hadith & Sahabe - Cinematic Cards */}
            <div className="grid md:grid-cols-2 gap-8">
                {/* Hadisler */}
                <div className="bg-slate-900 p-10 rounded-[2rem] shadow-2xl border border-slate-800 hover:border-teal-500/30 transition-all duration-300 group hover:-translate-y-1">
                    <div className="flex items-center gap-5 mb-8">
                        <div className="bg-teal-900/20 p-5 rounded-2xl text-teal-400 border border-teal-500/20 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(20,184,166,0.1)]">
                            <ScrollText size={32} />
                        </div>
                        <h3 className="text-2xl font-black text-white">Hadisler</h3>
                    </div>
                    <p className="text-slate-400 leading-relaxed mb-8 font-light text-lg">
                        Peygamber Efendimiz'in (s.a.v) sözlerinden, hayatından ve tavsiyelerinden yola çıkarak günümüze ışık tutan hikayeler.
                    </p>
                    <div className="bg-slate-950 p-5 rounded-xl border-l-4 border-teal-500 text-xs text-slate-400 italic">
                        "En güvenilir kaynaklardan seçilen rivayetler esastır."
                    </div>
                </div>

                {/* Sahabeler */}
                <div className="bg-slate-900 p-10 rounded-[2rem] shadow-2xl border border-slate-800 hover:border-rose-500/30 transition-all duration-300 group hover:-translate-y-1">
                    <div className="flex items-center gap-5 mb-8">
                         <div className="bg-rose-900/20 p-5 rounded-2xl text-rose-400 border border-rose-500/20 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(225,29,72,0.1)]">
                            <Users size={32} />
                        </div>
                        <h3 className="text-2xl font-black text-white">Sahabelerden Hikayeler</h3>
                    </div>
                    <p className="text-slate-400 leading-relaxed mb-8 font-light text-lg">
                        Asr-ı Saadet'in yıldızları olan sahabelerin hayatlarından, fedakarlıklarından ve erdemli duruşlarından kesitler.
                    </p>
                    <div className="bg-slate-950 p-5 rounded-xl border-l-4 border-rose-500 text-xs text-slate-400 italic">
                        "Tarihsel gerçekliğe sadık kalınarak dramatize edilmelidir."
                    </div>
                </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. Timeline Section */}
      <Timeline />

      {/* 5. Preparation Guide Section (Replaces Documents) */}
      <section className="py-24 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
             <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-4">
               Yarışmaya Hazırlık Rehberi
             </h2>
             <p className="text-slate-500 text-lg max-w-2xl mx-auto font-light">
               Hikâyeni çekmeden önce bilmen gereken temel adımlar.
             </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
             {/* Card 1: Akademi */}
             <Link to="/academy" className="group bg-white p-8 rounded-[2rem] border border-slate-200 shadow-lg hover:shadow-2xl hover:border-amber-500/30 transition-all duration-300 transform hover:-translate-y-2 flex flex-col h-full">
                <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner">
                   <BookOpen size={32} />
                </div>
                <h3 className="font-bold text-slate-900 text-2xl mb-3">Akademi</h3>
                <p className="text-slate-500 text-base leading-relaxed mb-8 flex-1">
                   Hazırlık seti, içerikler, videolar.
                </p>
                <span className="text-amber-600 text-sm font-bold uppercase tracking-wider flex items-center gap-2 group-hover:gap-3 transition-all">
                   İçeriklere Git <ArrowRight size={16}/>
                </span>
             </Link>

             {/* Card 2: Hakkında */}
             <Link to="/about" className="group bg-white p-8 rounded-[2rem] border border-slate-200 shadow-lg hover:shadow-2xl hover:border-blue-500/30 transition-all duration-300 transform hover:-translate-y-2 flex flex-col h-full">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner">
                   <Target size={32} />
                </div>
                <h3 className="font-bold text-slate-900 text-2xl mb-3">Hakkında</h3>
                <p className="text-slate-500 text-base leading-relaxed mb-8 flex-1">
                   Yarışmanın amacı, felsefesi, temalar.
                </p>
                <span className="text-blue-600 text-sm font-bold uppercase tracking-wider flex items-center gap-2 group-hover:gap-3 transition-all">
                   Yarışmayı Tanı <ArrowRight size={16}/>
                </span>
             </Link>

             {/* Card 3: SSS */}
             <Link to="/faq" className="group bg-white p-8 rounded-[2rem] border border-slate-200 shadow-lg hover:shadow-2xl hover:border-emerald-500/30 transition-all duration-300 transform hover:-translate-y-2 flex flex-col h-full">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner">
                   <HelpCircle size={32} />
                </div>
                <h3 className="font-bold text-slate-900 text-2xl mb-3">Sık Sorulan Sorular</h3>
                <p className="text-slate-500 text-base leading-relaxed mb-8 flex-1">
                   Ben ne yapacağım, nasıl katılacağım?
                </p>
                <span className="text-emerald-600 text-sm font-bold uppercase tracking-wider flex items-center gap-2 group-hover:gap-3 transition-all">
                   Sorularına Yanıt Bul <ArrowRight size={16}/>
                </span>
             </Link>

             {/* Card 4: Şartname */}
             <button onClick={() => handleDownload(cmsLinks.specUrl)} className="group bg-white p-8 rounded-[2rem] border border-slate-200 shadow-lg hover:shadow-2xl hover:border-rose-500/30 transition-all duration-300 transform hover:-translate-y-2 flex flex-col h-full text-left">
                <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner">
                   <ScrollText size={32} />
                </div>
                <h3 className="font-bold text-slate-900 text-2xl mb-3">Yarışma Şartnamesi</h3>
                <p className="text-slate-500 text-base leading-relaxed mb-8 flex-1">
                   Yarışma kuralları ve teknik detaylar.
                </p>
                <span className="text-rose-600 text-sm font-bold uppercase tracking-wider flex items-center gap-2 group-hover:gap-3 transition-all">
                   Detayları İncele <ArrowRight size={16}/>
                </span>
             </button>
          </div>
        </div>
      </section>

      {/* 6. Gala & Prizes CTA */}
      <section className="relative py-32 overflow-hidden bg-black text-white">
        {/* ... existing gala section ... */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-slate-900/50 to-slate-950"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-rose-600/10 blur-[150px] pointer-events-none mix-blend-screen"></div>
        
        {/* Spotlight Effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[100px] border-r-[100px] border-b-[500px] border-l-transparent border-r-transparent border-b-white/5 blur-3xl transform rotate-180"></div>

        <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
          <div className="mb-10 relative inline-block">
             <div className="absolute -inset-6 bg-amber-500/20 blur-2xl rounded-full animate-pulse"></div>
             <Trophy size={100} className="relative text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]" />
          </div>
          
          <h2 className="text-5xl md:text-7xl font-black mb-8 tracking-tight">
             Büyük <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500">Gala Gecesi</span>
          </h2>
          <p className="text-2xl text-rose-100/80 mb-12 max-w-3xl mx-auto font-light leading-relaxed">
             Toplam <span className="text-white font-bold border-b border-white/30">200.000₺</span>'yi aşan ödül havuzu, teknoloji çekleri ve Altın Kamera heykelciği sahiplerini bekliyor.
          </p>
          
          <Link 
            to="/finals" 
            className="inline-flex items-center gap-3 bg-white text-slate-950 font-black py-5 px-12 rounded-full hover:bg-amber-400 transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(245,158,11,0.5)] group"
          >
             Ödül Kürsüsünü İncele <ArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* 7. Partners Section */}
      <section className="py-24 bg-slate-950 border-t border-white/5 relative z-10 overflow-hidden">
        {/* Background glow for premium feel */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-amber-500/5 blur-[100px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
            
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-16">
               Düzenleyen Kurumlar ve <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500">Paydaşlar</span>
            </h2>
            
            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24">
                {/* Konya AİHL */}
                <div className="group flex flex-col items-center gap-6">
                    <div className="h-32 w-32 md:h-44 md:w-44 bg-white/5 rounded-full flex items-center justify-center p-6 border border-white/10 group-hover:border-amber-500/50 group-hover:bg-white/10 transition-all duration-500 shadow-[0_0_30px_rgba(255,255,255,0.05)] group-hover:shadow-[0_0_50px_rgba(245,158,11,0.2)]">
                        <img 
                            src="https://assets.reflectandshoot.com/20113118_yeni_logo_konyaihl.png" 
                            alt="Konya Anadolu İHL" 
                            className="w-full h-full object-contain filter drop-shadow-lg scale-110 group-hover:scale-125 transition-all duration-500"
                        />
                    </div>
                    <span className="text-slate-300 text-sm md:text-base font-bold uppercase tracking-wider group-hover:text-amber-400 transition-colors">Konya AİHL</span>
                </div>

                {/* TİMAV */}
                <div className="group flex flex-col items-center gap-6">
                    <div className="h-32 w-32 md:h-44 md:w-44 bg-white/5 rounded-full flex items-center justify-center p-6 border border-white/10 group-hover:border-rose-500/50 group-hover:bg-white/10 transition-all duration-500 shadow-[0_0_30px_rgba(255,255,255,0.05)] group-hover:shadow-[0_0_50px_rgba(225,29,72,0.2)]">
                        <img 
                            src="https://assets.reflectandshoot.com/timav_logo.png" 
                            alt="TİMAV" 
                            className="w-full h-full object-contain filter drop-shadow-lg scale-110 group-hover:scale-125 transition-all duration-500"
                        />
                    </div>
                    <span className="text-slate-300 text-sm md:text-base font-bold uppercase tracking-wider group-hover:text-rose-400 transition-colors">TİMAV</span>
                </div>

                {/* Selçuk Üniversitesi */}
                <div className="group flex flex-col items-center gap-6">
                    <div className="h-32 w-32 md:h-44 md:w-44 bg-white/5 rounded-full flex items-center justify-center p-6 border border-white/10 group-hover:border-blue-500/50 group-hover:bg-white/10 transition-all duration-500 shadow-[0_0_30px_rgba(255,255,255,0.05)] group-hover:shadow-[0_0_50px_rgba(59,130,246,0.2)]">
                        <img 
                            src="https://www.selcuk.edu.tr/img/logo_tr.png" 
                            alt="Selçuk Üniversitesi" 
                            className="w-full h-full object-contain filter drop-shadow-lg scale-110 group-hover:scale-125 transition-all duration-500"
                        />
                    </div>
                    <span className="text-slate-300 text-sm md:text-base font-bold uppercase tracking-wider group-hover:text-blue-400 transition-colors">Selçuk Üniversitesi</span>
                </div>
            </div>
        </div>
      </section>

      {/* Category Detail Modal - RE-ADDED */}
      {selectedCategory && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 w-full max-w-2xl rounded-[2rem] border border-slate-700 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="relative p-8 pb-6 border-b border-slate-800 bg-slate-950/50">
              <button 
                onClick={() => setSelectedCategory(null)}
                className="absolute top-6 right-6 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-rose-600 transition-all z-10"
              >
                <X size={20} />
              </button>
              <div className="flex items-center gap-5">
                 <div className={`p-4 rounded-2xl ${selectedCategory.color === 'teal' ? 'bg-teal-900/20 text-teal-400' : 'bg-purple-900/20 text-purple-400'}`}>
                     <selectedCategory.icon size={32} />
                 </div>
                 <div>
                    <span className={`text-[10px] font-bold uppercase tracking-[0.2em] px-2 py-1 rounded border ${selectedCategory.color === 'teal' ? 'bg-teal-900/10 border-teal-500/20 text-teal-400' : 'bg-purple-900/10 border-purple-500/20 text-purple-400'}`}>
                        {selectedCategory.badge}
                    </span>
                    <h3 className="text-3xl font-black text-white mt-2">{selectedCategory.title}</h3>
                 </div>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="p-8 overflow-y-auto custom-scrollbar">
                {/* Tech Specs */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    {selectedCategory.techSpecs.map((spec, i) => (
                        <div key={i} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 text-center">
                            <spec.icon size={20} className="mx-auto mb-2 text-slate-400"/>
                            <span className="text-xs font-bold text-slate-300 block">{spec.label}</span>
                        </div>
                    ))}
                </div>

                <div className="space-y-6">
                    <div>
                        <h4 className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wider mb-3">
                            <CheckCircle2 size={16} className="text-emerald-500"/> Kapsam ve İçerik
                        </h4>
                        <ul className="space-y-2">
                            {selectedCategory.details.description.map((item, i) => (
                                <li key={i} className="flex items-start text-slate-400 text-sm leading-relaxed">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600 mt-2 mr-3 flex-shrink-0"></span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wider mb-3">
                            <AlertTriangle size={16} className="text-amber-500"/> Dikkat Edilmesi Gerekenler
                        </h4>
                        <ul className="space-y-2">
                            {selectedCategory.details.warnings.map((item, i) => (
                                <li key={i} className="flex items-start text-slate-400 text-sm leading-relaxed">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500/50 mt-2 mr-3 flex-shrink-0"></span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-slate-800 bg-slate-950 flex flex-col sm:flex-row gap-4">
                <button 
                    onClick={() => handleDownload(cmsLinks.specUrl)}
                    className="flex-1 py-4 rounded-xl border border-slate-700 text-slate-300 font-bold hover:bg-slate-800 hover:text-white transition-all flex items-center justify-center gap-2"
                >
                    <Download size={18} /> Şartnameyi İndir
                </button>
                <Link 
                    to="/apply"
                    className="flex-1 py-4 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 text-white font-bold hover:shadow-lg hover:shadow-rose-900/20 transition-all flex items-center justify-center gap-2"
                >
                    Hemen Başvur <ArrowRight size={18} />
                </Link>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
