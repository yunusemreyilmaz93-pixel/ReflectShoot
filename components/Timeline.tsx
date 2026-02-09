
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
  Camera
} from 'lucide-react';

interface TimelineEvent {
  date: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string; // 'rose' | 'teal' | 'amber'
}

// Static Data to ensure correct schedule display
const STATIC_EVENTS: TimelineEvent[] = [
  {
    date: '20 Ocak 2026',
    title: 'Başvuru ve Eser Gönderimi Başlıyor',
    description: 'Yarışma süreci resmen başlıyor. Sisteme kayıt ol, takımını kur ve filmini çekmeye başla. Hem başvuru hem de eser teslim ekranları bu tarihte açılır.',
    icon: Clapperboard,
    color: 'teal'
  },
  {
    date: '23 Mart 2026',
    title: 'Son Başvuru ve Teslim Tarihi',
    description: 'Sisteme video yüklemek veya link göndermek için son gün. Bu tarihten sonra yapılan başvurular ve yüklemeler kabul edilmeyecektir.',
    icon: Upload,
    color: 'rose'
  },
  {
    date: '3 Nisan 2026',
    title: 'Finalistlerin Açıklanması',
    description: 'Jüri ön değerlendirmesi sonucu finale kalan 20 takımın web sitesi üzerinden duyurulması.',
    icon: Star,
    color: 'amber'
  },
  {
    date: '6-10 Nisan 2026',
    title: 'Finalist Akademisi',
    description: 'Finale kalan ekipler için sektör profesyonelleri ile online senaryo, kurgu ve yönetmenlik atölyeleri.',
    icon: BookOpen,
    color: 'teal'
  },
  {
    date: '11 Nisan - 4 Mayıs 2026',
    title: 'Revize Eser Gönderimi',
    description: 'Finalist takımların, akademi eğitimleri ışığında filmlerini revize ederek son kurgularını sisteme yükleme süreci.',
    icon: Edit3,
    color: 'amber'
  },
  {
    date: '11 Mayıs 2026',
    title: 'Final Sonuçlarının Açıklanması',
    description: 'Jüri değerlendirmesi sonucu dereceye giren eserlerin belirlenmesi.',
    icon: CheckCircle2,
    color: 'teal'
  },
  {
    date: '22 Mayıs 2026',
    title: 'Büyük Gala',
    description: 'Konya\'da düzenlenecek görkemli törenle kazananların açıklanması ve ödüllerin takdimi.',
    icon: Trophy,
    color: 'rose'
  }
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
        <event.icon size={22} className="text-white relative z-10" />
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
  // Using static events to force correct schedule display
  const events = STATIC_EVENTS;

  return (
    <section className="bg-slate-950 py-24 overflow-hidden relative">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }}></div>
      <div className="container mx-auto px-4 h-full relative z-10">
        <div className="text-center mb-24">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-slate-900 border border-slate-800 text-rose-500 text-[10px] font-black tracking-[0.3em] uppercase mb-6 shadow-xl">
               <Film size={14} /> Prodüksiyon Takvimi
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter">
             Yolculuğun <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500">Aşamaları</span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
            Senaryodan galaya uzanan bu sinematik süreçte hiçbir sahneyi kaçırma.
          </p>
        </div>
        
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
