import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Cpu, Clapperboard, BookOpen, ScrollText, Users, CalendarDays, Download, ChevronDown, PlayCircle, School, Layout, X, CheckCircle2, AlertTriangle, ExternalLink, FileText, Trophy, Film, PenTool } from 'lucide-react';
import { Timeline } from '../components/Timeline';

// Competition Schedule Configuration
const COMPETITION_PHASES = [
  { label: 'Başvuruların Başlaması', date: '2026-01-20T09:00:00' },
  { label: 'Son Başvuru Tarihi', date: '2026-02-13T23:59:59' },
  { label: '1. Video Teslimi', date: '2026-03-20T23:59:59' },
  { label: 'Finalistlerin Açıklanması', date: '2026-04-01T12:00:00' },
  { label: 'Akademi Başlangıcı', date: '2026-04-06T09:00:00' },
  { label: 'Final Video Teslimi', date: '2026-05-04T23:59:59' },
  { label: 'Sonuçların İlanı', date: '2026-05-11T12:00:00' },
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
  const [activePhase, setActivePhase] = useState(getNextPhase());
  const [selectedCategory, setSelectedCategory] = useState<CategoryData | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setActivePhase(getNextPhase());
    }, 60000); 
    return () => clearInterval(interval);
  }, []);

  const verses = [
    "Al-i İmran: 92", "Al-i İmran: 103", "Al-i İmran: 190-191",
    "Ankebut: 41", "Araf: 27", "Asr: 1-3",
    "Bakara: 138", "Bakara: 168", "Enfal: 46",
    "Furkan: 63", "Hucurat: 10-11", "İsra: 81",
    "İnşirah: 5-9", "Kasas: 72", "Lokman: 18",
    "Maide: 2", "Yasin: 82", "Yunus: 57",
    "Zariyat: 50", "Zariyat: 55", "Zümer: 9"
  ];

  const categories: CategoryData[] = [
    {
      id: 'live-action',
      title: 'Canlı Çekim',
      badge: 'CINEMATOGRAPHY',
      shortDesc: 'Gerçek oyuncular, set ışıkları ve kamera lensinin gücü ile fikrini filme dönüştür.',
      icon: Film,
      color: 'teal',
      techSpecs: [
        { icon: Clapperboard, label: 'Kurmaca / Belgesel' },
        { icon: Layout, label: '1920x1080 FHD' },
        { icon: CalendarDays, label: '2-3 Dakika' }
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
      badge: 'SYNTHETIC MEDIA',
      shortDesc: 'Prompt mühendisliği ile oluşturulan dijital hikayeler ve görsel anlatım.',
      icon: Cpu,
      color: 'purple',
      techSpecs: [
        { icon: Layout, label: 'AI Generated' },
        { icon: Layout, label: '1920x1080 FHD' },
        { icon: CalendarDays, label: '2-3 Dakika' }
      ],
      details: {
        description: [
           "Görüntü oluşturma ve video üretiminde Yapay Zeka araçları (Midjourney, Runway, Pika vb.) kullanılmalıdır.",
           "Prompt mühendisliği ve görsel tutarlılık (character consistency) esas alınır.",
           "Senaryo ve kurgu bütünlüğü teknik kapasite kadar önemlidir."
        ],
        warnings: [
          "Tamamen stok görüntülerden oluşan kolajlar kabul edilmez.",
          "Yapay zeka tarafından üretilen içeriklerin etik kullanımı esastır.",
          "Filmin dili İngilizce (AI Voiceover kabul edilir), altyazılar Türkçe olmalıdır."
        ]
      }
    }
  ];

  const downloads = [
    { id: 'spec', title: "Yarışma Şartnamesi", size: "2.4 MB", type: "PDF" },
    { id: 'parental', title: "Veli İzin Belgesi", size: "367 KB", type: "PDF" },
    { id: 'kvkk', title: "KVKK Aydınlatma Metni", size: "180 KB", type: "PDF" }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const handleDownload = (doc: { id: string, title: string }) => {
    if (doc.id === 'parental') {
        window.open("https://dosya.co/mndjfbhnto6e/Veli_İzin_Belgesi.pdf.html", "_blank");
    } else if (doc.id === 'kvkk') {
        window.open("https://dosya.co/f695f8863w00/Açık_Rıza_Metni.pdf.html", "_blank");
    } else {
        alert(`${doc.title} İndiriliyor...`);
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
        <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center justify-center h-full">
          
          {/* Stats Cards Section */}
          <div className="flex flex-col items-center gap-6 mb-12 animate-fadeInDown w-full">
              
              {/* Top Text */}
              <div className="relative">
                 <span className="text-amber-500 font-bold tracking-[0.4em] text-xs uppercase flex items-center gap-4 drop-shadow-md">
                    <span className="w-12 h-px bg-gradient-to-l from-amber-500 to-transparent"></span>
                    2025 SEZONU
                    <span className="w-12 h-px bg-gradient-to-r from-amber-500 to-transparent"></span>
                 </span>
              </div>

              {/* Cards Row */}
              <div className="flex flex-wrap justify-center gap-4">
                  {[
                    { icon: Clapperboard, val: "27", label: "Takım" },
                    { icon: School, val: "10+", label: "Okul" },
                    { icon: Users, val: "150+", label: "Öğrenci" }
                  ].map((stat, i) => (
                    <div key={i} className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-amber-500/50 transition-all duration-300 group">
                        <div className="text-amber-500 group-hover:scale-110 transition-transform">
                            <stat.icon size={20} />
                        </div>
                        <div className="text-left">
                            <div className="text-white font-black text-xl leading-none">{stat.val}</div>
                            <div className="text-slate-400 text-[10px] uppercase tracking-wider font-bold mt-1">{stat.label}</div>
                        </div>
                    </div>
                  ))}
              </div>
          </div>

          {/* Typography */}
          <div className="animate-fadeInUp space-y-8 mb-16 relative z-20">
            <h1 className="text-6xl md:text-9xl font-black text-white tracking-tighter leading-tight relative drop-shadow-2xl">
              Oku, Düşün, <br className="hidden md:block"/> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 drop-shadow-[0_0_20px_rgba(245,158,11,0.5)]">Anlat!</span>
            </h1>
            
            <p className="text-xl md:text-3xl font-light text-slate-300 tracking-tight max-w-3xl mx-auto">
               Manayı Fikre, Fikri <span className="font-semibold text-white border-b-2 border-amber-500/50">Filme</span> Dönüştüren Yarışma.
            </p>
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
               onClick={() => handleDownload(downloads[0])}
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
      <section id="categories" className="py-24 bg-slate-50 relative border-b border-slate-200">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-slate-200 to-transparent opacity-50"></div>
        
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
      <section className="py-24 bg-slate-950 relative overflow-hidden">
        {/* Soft Transition */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-slate-50 to-slate-950 pointer-events-none z-10"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(30,41,59,0.4)_0%,rgba(2,6,23,1)_100%)]"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6 pt-12 border-t border-slate-800/50">
             <div>
                <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4 mt-8">
                    Yarışma <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500">Temaları</span>
                </h2>
                <p className="text-slate-400 text-lg font-light leading-relaxed max-w-2xl">
                    Kadim kaynaklardan beslenen, sinema diliyle günümüze taşınan özgün hikayeler.
                </p>
             </div>
             <div className="bg-slate-900 px-5 py-3 rounded-xl border border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                 <PenTool size={14} /> İlham Kaynakları
             </div>
          </div>

          <div className="space-y-12">
            
            {/* Ayetler - Fixed Layout */}
            <div className="relative bg-slate-900 p-8 md:p-12 rounded-[2rem] shadow-2xl border border-slate-800 border-t-4 border-t-amber-500/80">
               <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/cardboard-flat.png')]"></div>
               
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
                   
                   <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                       {verses.map((verse, idx) => (
                           <div key={idx} className="bg-slate-950 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-900 transition-all cursor-default p-4 rounded-xl flex items-center justify-center text-center h-16 shadow-lg group">
                               <span className="font-bold text-slate-400 text-sm group-hover:text-white transition-colors">{verse}</span>
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

      {/* 5. Documents Section */}
      <section className="py-24 bg-slate-50 border-t border-slate-200">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-[2rem] shadow-xl p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-10 border-l-8 border-rose-600">
               <div className="flex-1">
                  <h2 className="text-3xl font-black text-slate-900 mb-4 flex items-center gap-4">
                     <FileText className="text-rose-600" size={36}/>
                     Prodüksiyon Dosyaları
                  </h2>
                  <p className="text-slate-600 text-lg mb-8 font-light">
                     Sete çıkmadan önce gerekli yasal izinleri ve şartnameyi buradan edinebilirsiniz.
                  </p>
                  <div className="grid sm:grid-cols-3 gap-6">
                     {downloads.map((doc, i) => (
                        <button key={i} onClick={() => handleDownload(doc)} className="flex flex-col items-center p-6 rounded-2xl border border-slate-200 hover:border-rose-500 hover:bg-rose-50 transition-all group bg-slate-50 text-center shadow-sm hover:shadow-[0_10px_30px_rgba(225,29,72,0.1)]">
                           <Download size={28} className="text-slate-400 group-hover:text-rose-600 mb-3 transition-colors"/>
                           <span className="font-bold text-slate-900 text-sm">{doc.title}</span>
                           <span className="text-xs text-slate-500 mt-1">{doc.type} • {doc.size}</span>
                        </button>
                     ))}
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* 6. Gala & Prizes CTA */}
      <section className="relative py-32 overflow-hidden bg-black text-white">
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
             Toplam <span className="text-white font-bold border-b border-white/30">150.000₺</span> değerinde ödül havuzu, teknoloji çekleri ve Altın Kamera heykelciği sahiplerini bekliyor.
          </p>
          
          <Link 
            to="/finals" 
            className="inline-flex items-center gap-3 bg-white text-slate-950 font-black py-5 px-12 rounded-full hover:bg-amber-400 transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_50px_rgba(245,158,11,0.5)] transform hover:-translate-y-1 text-lg"
          >
            Ödül Detaylarını İncele <ArrowRight size={22} />
          </Link>
        </div>
      </section>

      {/* Category Detail Modal */}
      {selectedCategory && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn" onClick={() => setSelectedCategory(null)}>
          <div 
            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh] animate-scaleIn border border-white/10"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className={`p-8 border-b flex items-center justify-between ${selectedCategory.color === 'teal' ? 'bg-teal-50' : 'bg-purple-50'}`}>
               <div className="flex items-center gap-5">
                  <div className={`p-4 rounded-2xl bg-white shadow-sm border ${selectedCategory.color === 'teal' ? 'text-teal-700 border-teal-100' : 'text-purple-700 border-purple-100'}`}>
                    <selectedCategory.icon size={32} />
                  </div>
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-slate-500">{selectedCategory.badge}</span>
                    <h2 className="text-3xl font-black text-slate-900">{selectedCategory.title}</h2>
                  </div>
               </div>
               <button onClick={() => setSelectedCategory(null)} className="p-2 hover:bg-black/5 rounded-full transition-colors text-slate-400">
                 <X size={28} />
               </button>
            </div>

            <div className="p-8 overflow-y-auto">
              <div className="mb-8">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <BookOpen size={20} className="text-rose-700" /> Kategori Detayları
                </h3>
                <ul className="space-y-3">
                  {selectedCategory.details.description.map((item, idx) => (
                    <li key={idx} className="flex items-start text-slate-700 leading-relaxed text-sm">
                      <CheckCircle2 size={16} className="text-teal-600 mr-3 mt-1 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <AlertTriangle size={20} className="text-amber-500" /> Dikkat Edilmesi Gerekenler
                </h3>
                <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
                  <ul className="space-y-3">
                    {selectedCategory.details.warnings.map((item, idx) => (
                      <li key={idx} className="flex items-start text-amber-900 text-sm font-medium">
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-3 mt-1.5 flex-shrink-0"></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mt-6 pt-6 border-t border-slate-100">
                 <Link 
                   to="/apply" 
                   className="flex-1 bg-rose-600 text-white py-4 px-6 rounded-xl font-bold hover:bg-rose-700 transition-colors text-center flex items-center justify-center gap-2 shadow-lg shadow-rose-900/20"
                 >
                   <PlayCircle size={20} /> Hemen Başvur
                 </Link>
                 <button 
                   onClick={() => handleDownload(downloads[0])}
                   className="flex-1 border-2 border-slate-200 text-slate-700 py-4 px-6 rounded-xl font-bold hover:bg-slate-50 hover:border-slate-300 transition-colors flex items-center justify-center gap-2"
                 >
                   <Download size={20} /> Şartname (PDF)
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scaleIn { animation: scaleIn 0.2s ease-out forwards; }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};