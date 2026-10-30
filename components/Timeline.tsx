
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
  Film,
  MonitorPlay,
  Scissors,
  Trophy,
  Camera,
  Lock,
  Clock,
  Hourglass
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { resolvePublicTimelineEvents, type ResolvedTimelineEvent } from '../lib/domain/timeline';

const iconMap: Record<string, React.ElementType> = {
  Clapperboard,
  Upload,
  Star,
  BookOpen,
  Edit3,
  CheckCircle2,
  Trophy,
  Calendar,
  Video,
  Award,
  Flag,
  Mic2,
  Film,
  MonitorPlay,
  Scissors,
  Camera,
  Lock,
  Clock,
  Hourglass
};

interface TimelineEvent {
  date: string;
  title: string;
  description: string;
  icon?: string | React.ElementType;
  color?: string; // 'rose' | 'teal' | 'amber'
}

// Fallback when the CMS timeline is empty: 2026-27 steps, dates to be announced.
const STATIC_EVENTS: ResolvedTimelineEvent[] = [
  {
    date: 'Açıklanacak',
    title: 'Şartname ve Takvim İlanı',
    description: 'Yeni sezona dair katılım koşulları, teknik yönergeler ve resmi takvim web sitemizde yayınlanacaktır.',
    icon: 'Clapperboard',
    color: 'amber',
    order: 1,
  },
  {
    date: 'Açıklanacak',
    title: 'Başvuruların Başlaması',
    description: 'Danışman öğretmen üyeliklerinin açılması ve takımların kurulması.',
    icon: 'Upload',
    color: 'teal',
    order: 2,
  },
  {
    date: 'Açıklanacak',
    title: 'Yapay Zekâ Eğitimleri',
    description: 'Yapay zekâ animasyon üretimine dair eğitim ve rehber içerikleri.',
    icon: 'BookOpen',
    color: 'amber',
    order: 3,
  },
  {
    date: 'Açıklanacak',
    title: 'Eser Gönderimi ve Son Teslim',
    description: 'Asr ve Beled surelerinden ilham alan yapay zekâ animasyon filmlerinin sisteme yüklenmesi.',
    icon: 'Video',
    color: 'rose',
    order: 4,
  },
  {
    date: 'Açıklanacak',
    title: 'Jüri Değerlendirmesi',
    description: 'Akademik ve sektörel jürilerin eserleri teknik, senaryo ve anlatım yönünden değerlendirmesi.',
    icon: 'Star',
    color: 'teal',
    order: 5,
  },
  {
    date: 'Açıklanacak',
    title: 'Sonuçların İlanı',
    description: 'Değerlendirme sonuçlarının web sitemizde duyurulması.',
    icon: 'Trophy',
    color: 'rose',
    order: 6,
  },
];

const TimelineItem: React.FC<{ event: TimelineEvent; index: number }> = ({ event, index }) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (domRef.current) {
      observer.observe(domRef.current);
    }

    return () => {
      if (domRef.current) observer.unobserve(domRef.current);
    };
  }, []);

  const isEven = index % 2 === 0;

  const colorClasses = {
    teal: { text: 'text-teal-400', border: 'border-teal-500', glow: 'shadow-[0_0_15px_rgba(20,184,166,0.3)]' },
    rose: { text: 'text-rose-400', border: 'border-rose-500', glow: 'shadow-[0_0_15px_rgba(225,29,72,0.3)]' },
    amber: { text: 'text-amber-400', border: 'border-amber-500', glow: 'shadow-[0_0_15px_rgba(245,158,11,0.3)]' },
  };

  const currentColors = colorClasses[event.color as keyof typeof colorClasses] || colorClasses.teal;
  const IconComponent = typeof event.icon === 'string' ? iconMap[event.icon] || Clapperboard : event.icon || Clapperboard;

  return (
    <div 
      ref={domRef}
      className={`mb-16 flex justify-between items-center w-full transition-all duration-1000 ease-out transform group ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
      } ${isEven ? 'flex-row-reverse' : 'flex-row'}`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      <div className="order-1 w-5/12"></div>
      <div className={`z-20 flex items-center justify-center order-1 w-14 h-14 rounded-full bg-slate-900 border-2 ${currentColors.border} ${currentColors.glow} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-white/5 animate-pulse"></div>
        <IconComponent size={22} className="text-white relative z-10" />
      </div>
      <div className={`order-1 w-5/12 p-6 rounded-2xl bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 hover:border-slate-500 hover:bg-slate-800 transition-all duration-500 relative overflow-hidden group-hover:shadow-[0_10px_40px_rgba(0,0,0,0.5)]`}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-white/10 transition-colors"></div>
        <div className="flex items-center justify-between mb-3 relative z-10">
           <span className={`font-black text-[10px] uppercase tracking-[0.2em] ${currentColors.text} flex items-center gap-2 bg-slate-950/50 px-2 py-1 rounded border border-white/5`}>
              <Calendar size={10} /> {event.date}
           </span>
        </div>
        <h3 className="mb-2 font-black text-white text-xl tracking-tight relative z-10">{event.title}</h3>
        <p className="text-sm leading-relaxed text-slate-400 group-hover:text-slate-300 transition-colors relative z-10 font-light">
          {event.description}
        </p>
      </div>
    </div>
  );
};

const MobileTimelineItem: React.FC<{ event: TimelineEvent; index: number }> = ({ event, index }) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) setIsVisible(true); });
    }, { threshold: 0.1 });
    if (domRef.current) observer.observe(domRef.current);
    return () => { if (domRef.current) observer.unobserve(domRef.current); };
  }, []);

  const colorClasses = {
    teal: { text: 'text-teal-400', border: 'border-teal-500' },
    rose: { text: 'text-rose-400', border: 'border-rose-500' },
    amber: { text: 'text-amber-400', border: 'border-amber-500' },
  };
  const currentColors = colorClasses[event.color as keyof typeof colorClasses] || colorClasses.teal;

  return (
    <div 
      ref={domRef}
      className={`mb-8 pl-8 relative transform transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-20'}`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="absolute left-0 top-0 bottom-0 w-8 border-r-2 border-dashed border-slate-700 flex flex-col items-center justify-start py-2 gap-4 overflow-hidden opacity-50">
           <div className="w-1.5 h-1.5 bg-slate-600 rounded-full"></div>
           <div className="w-1.5 h-1.5 bg-slate-600 rounded-full"></div>
           <div className="w-1.5 h-1.5 bg-slate-600 rounded-full"></div>
      </div>
      <div className={`absolute left-[-10px] top-0 w-5 h-5 rounded-full bg-slate-900 border-2 ${currentColors.border} z-10 shadow-[0_0_10px_rgba(0,0,0,0.5)]`}></div>
      <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 shadow-lg">
        <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${currentColors.text} block mb-2`}>{event.date}</span>
        <h3 className="text-lg font-black text-white mb-2">{event.title}</h3>
        <p className="text-slate-400 text-sm leading-relaxed font-light">{event.description}</p>
      </div>
    </div>
  );
};

export const Timeline: React.FC = () => {
  const { cmsTimeline, systemSettings } = useAppContext();
  // CMS-driven calendar (admin panel edits land here); static placeholders until it is filled.
  const events = resolvePublicTimelineEvents(cmsTimeline, STATIC_EVENTS);
  const seasonLabel = systemSettings?.season?.label || 'Güncel Takvim';

  return (
    <section className="bg-slate-950 py-24 overflow-hidden relative border-t border-white/5">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }}></div>
      <div className="container mx-auto px-4 h-full relative z-10">
        
        {/* Title Group */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-slate-900 border border-slate-800 text-rose-500 text-[10px] font-black tracking-[0.3em] uppercase mb-6 shadow-xl">
               <Film size={14} /> Prodüksiyon Yolculuğu
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter">
             Yolculuğun <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500">Aşamaları</span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
            Fikir aşamasından sonuçların ilanına kadar takip etmeniz gereken tüm duraklar.
          </p>
        </div>

        <div className="max-w-5xl mx-auto mb-16">
          <div className="bg-gradient-to-r from-amber-950/20 via-slate-900/80 to-amber-950/20 backdrop-blur-xl border border-amber-500/10 rounded-[2.5rem] p-8 md:p-10 text-center">
            <div className="inline-flex p-3.5 bg-amber-500/10 rounded-xl text-amber-500 mb-4 border border-amber-500/20">
              <Calendar size={24} />
            </div>
            <h3 className="text-2xl md:text-3xl font-black text-white mb-3 tracking-tight">{seasonLabel}</h3>
            <p className="text-slate-300 text-sm md:text-base font-light leading-relaxed max-w-2xl mx-auto">
              Takvim netleştikçe bu sayfada güncellenecektir.
            </p>
          </div>
        </div>

        {/* Step List Visual Tree */}
        <div className="hidden md:block relative wrap overflow-hidden p-10 h-full">
          <div className="absolute left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-slate-800 to-transparent"></div>
          {events.map((event, index) => (
            <TimelineItem key={index} event={event} index={index} />
          ))}
        </div>

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
