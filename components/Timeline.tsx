
import React, { useEffect, useRef, useState } from 'react';
import { 
  Calendar, 
  Video, 
  Award, 
  Star, 
  BookOpen, 
  Edit3, 
  Upload, 
  Flag, 
  Mic2, 
  Clapperboard,
  CheckCircle2,
  Film
} from 'lucide-react';

interface TimelineEvent {
  date: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string; // 'rose' | 'teal' | 'amber'
}

const events: TimelineEvent[] = [
  {
    date: '20 Ocak 2026',
    title: 'Başvuruların Başlaması',
    description: 'Reflect&Shoot 2026 maratonu resmen başlıyor! Takımını kur, temayı seç ve sisteme kaydını yaptır.',
    icon: Flag,
    color: 'teal'
  },
  {
    date: '13 Şubat 2026',
    title: 'Son Başvuru Tarihi',
    description: 'Yarışmaya katılım için son gün. Belgelerini ve takım bilgilerini eksiksiz tamamlamayı unutma.',
    icon: Calendar,
    color: 'rose'
  },
  {
    date: '16 Şubat – 20 Mart 2026',
    title: 'İlk Video Teslim Süreci',
    description: 'Senaryonu filme dökme vakti. Çektiğin ham veya kurgulanmış ilk versiyonu sisteme yükle.',
    icon: Video,
    color: 'amber'
  },
  {
    date: '1 Nisan 2026',
    title: 'Finalistlerin Açıklanması',
    description: 'Ön jüri değerlendirmesi tamamlanıyor. Finale kalmaya hak kazanan takımlar duyuruluyor.',
    icon: Star,
    color: 'teal'
  },
  {
    date: '6, 8 ve 10 Nisan 2026',
    title: 'Online Akademi',
    description: 'Finalistler için senaryo, kurgu ve yönetmenlik üzerine uzman isimlerden yoğunlaştırılmış atölye eğitimleri başlıyor.',
    icon: Mic2,
    color: 'rose'
  },
  {
    date: '13 Nisan 2026',
    title: 'Geliştirme & Revize',
    description: 'Geri bildirimler doğrultusunda final eserlerinin geliştirme süreci başlıyor.',
    icon: Edit3,
    color: 'amber'
  },
  {
    date: '13 Nisan – 4 Mayıs 2026',
    title: 'Final Video Teslimi',
    description: 'Filminin son halini, İngilizce dublaj ve Türkçe altyazı ile birlikte yükle.',
    icon: Upload,
    color: 'teal'
  },
  {
    date: '11 Mayıs 2026',
    title: 'Sonuçların İlanı',
    description: 'Dereceye giren eserler web sitesi üzerinden açıklanıyor.',
    icon: CheckCircle2,
    color: 'rose'
  },
  {
    date: '22 Mayıs 2026',
    title: 'Ödül Töreni',
    description: 'Gala gecesi, kırmızı halı ve büyük ödüllerin sahiplerini bulması.',
    icon: Award,
    color: 'teal'
  }
];

const TimelineItem: React.FC<{ event: TimelineEvent; index: number }> = ({ event, index }) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => setIsVisible(entry.isIntersecting));
      },
      { threshold: 0.2 }
    );

    if (domRef.current) {
      observer.observe(domRef.current);
    }

    return () => {
      if (domRef.current) observer.unobserve(domRef.current);
    };
  }, []);

  const isEven = index % 2 === 0;

  // Cinematic Colors
  const colorClasses = {
    teal: { 
      bg: 'bg-teal-900', 
      text: 'text-teal-400', 
      border: 'border-teal-500', 
      glow: 'shadow-[0_0_15px_rgba(20,184,166,0.3)]' 
    },
    rose: { 
      bg: 'bg-rose-900', 
      text: 'text-rose-400', 
      border: 'border-rose-500', 
      glow: 'shadow-[0_0_15px_rgba(225,29,72,0.3)]' 
    },
    amber: { 
      bg: 'bg-amber-900', 
      text: 'text-amber-400', 
      border: 'border-amber-500', 
      glow: 'shadow-[0_0_15px_rgba(245,158,11,0.3)]' 
    },
  };

  const currentColors = colorClasses[event.color as keyof typeof colorClasses];

  return (
    <div 
      ref={domRef}
      className={`mb-16 flex justify-between items-center w-full transition-all duration-1000 ease-out transform group ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      } ${isEven ? 'flex-row-reverse' : 'flex-row'}`}
    >
      <div className="order-1 w-5/12"></div>
      
      {/* Central Film Node */}
      <div className={`z-20 flex items-center justify-center order-1 w-14 h-14 rounded-full bg-slate-900 border-2 ${currentColors.border} ${currentColors.glow} relative`}>
        <div className="absolute inset-0 rounded-full border border-white/10"></div>
        <event.icon size={22} className="text-white relative z-10" />
      </div>
      
      {/* Card */}
      <div className={`order-1 w-5/12 p-6 rounded-xl bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 hover:border-slate-500 hover:bg-slate-800 transition-all duration-300 relative overflow-hidden group-hover:shadow-2xl`}>
        {/* Spotlight Effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-white/10 transition-colors"></div>
        
        <div className="flex items-center justify-between mb-3 relative z-10">
           <span className={`font-bold text-xs uppercase tracking-[0.2em] ${currentColors.text} flex items-center gap-2`}>
              <Clapperboard size={12} /> {event.date}
           </span>
        </div>

        <h3 className="mb-2 font-black text-white text-xl tracking-tight relative z-10">{event.title}</h3>
        <p className="text-sm leading-relaxed text-slate-400 group-hover:text-slate-300 transition-colors relative z-10">
          {event.description}
        </p>
      </div>
    </div>
  );
};

// Mobile Timeline Item
const MobileTimelineItem: React.FC<{ event: TimelineEvent; index: number }> = ({ event, index }) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => setIsVisible(entry.isIntersecting));
    }, { threshold: 0.1 });
    if (domRef.current) observer.observe(domRef.current);
    return () => { if (domRef.current) observer.unobserve(domRef.current); };
  }, []);

  const colorClasses = {
    teal: { text: 'text-teal-400', border: 'border-teal-500' },
    rose: { text: 'text-rose-400', border: 'border-rose-500' },
    amber: { text: 'text-amber-400', border: 'border-amber-500' },
  };
  const currentColors = colorClasses[event.color as keyof typeof colorClasses];

  return (
    <div 
      ref={domRef}
      className={`mb-8 pl-8 relative transform transition-all duration-700 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}
    >
      {/* Film Strip Left Border */}
      <div className="absolute left-0 top-0 bottom-0 w-8 border-r-2 border-dashed border-slate-700 flex flex-col items-center justify-start py-2 gap-4 overflow-hidden">
           <div className="w-1.5 h-1.5 bg-slate-600 rounded-full"></div>
           <div className="w-1.5 h-1.5 bg-slate-600 rounded-full"></div>
           <div className="w-1.5 h-1.5 bg-slate-600 rounded-full"></div>
           <div className="w-1.5 h-1.5 bg-slate-600 rounded-full"></div>
           <div className="w-1.5 h-1.5 bg-slate-600 rounded-full"></div>
      </div>
      
      {/* Node */}
      <div className={`absolute left-[-10px] top-0 w-5 h-5 rounded-full bg-slate-900 border-2 ${currentColors.border} z-10 shadow-[0_0_10px_rgba(0,0,0,0.5)]`}></div>

      <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800 shadow-lg">
        <span className={`text-xs font-bold uppercase tracking-wider ${currentColors.text} block mb-1`}>{event.date}</span>
        <h3 className="text-lg font-bold text-white mb-2">{event.title}</h3>
        <p className="text-slate-400 text-sm leading-relaxed">{event.description}</p>
      </div>
    </div>
  );
};

export const Timeline: React.FC = () => {
  return (
    <section className="bg-slate-950 py-24 overflow-hidden relative">
      {/* Film Grain & Texture */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }}></div>
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-slate-50 to-transparent opacity-10"></div>

      <div className="container mx-auto px-4 h-full relative z-10">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-slate-800 text-rose-500 text-xs font-bold tracking-widest uppercase mb-6 shadow-lg">
               <Film size={14} /> Prodüksiyon Takvimi
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight">
             Yolculuğun <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500">Aşamaları</span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto font-light">
            Senaryodan galaya uzanan bu sinematik süreçte hiçbir sahneyi kaçırma.
          </p>
        </div>
        
        {/* Desktop View */}
        <div className="hidden md:block relative wrap overflow-hidden p-10 h-full">
          {/* Central Film Strip Graphic */}
          <div className="absolute left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-16 pointer-events-none">
              <div className="w-full h-full border-l-2 border-r-2 border-dashed border-slate-800 opacity-50 flex flex-col items-center justify-around">
                   {/* Decorative Sprocket Holes Simulation */}
                   {Array.from({ length: 20 }).map((_, i) => (
                       <div key={i} className="w-full h-px bg-transparent"></div> 
                   ))}
              </div>
          </div>
          
          <div className="absolute left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-0.5 bg-slate-800"></div>

          {events.map((event, index) => (
            <TimelineItem key={index} event={event} index={index} />
          ))}
          
          {/* Bottom Fade */}
          <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-slate-950 to-transparent z-20"></div>
        </div>

        {/* Mobile View */}
        <div className="md:hidden relative">
           <div className="absolute left-0 top-0 bottom-0 w-px bg-slate-800 ml-4"></div>
          {events.map((event, index) => (
            <MobileTimelineItem key={index} event={event} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};
