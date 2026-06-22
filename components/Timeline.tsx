
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
  Sparkles,
  Lock,
  Clock,
  Hourglass
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';

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
  Sparkles,
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

// Static Data to ensure correct schedule display
const STATIC_EVENTS: TimelineEvent[] = [
  {
    date: '20 Ocak 2026',
    title: 'Başvuru ve Eser Gönderimi Başlıyor',
    description: 'Yarışma süreci resmen başlıyor. Sisteme kayıt ol, takımını kur ve filmini çekmeye başla.',
    icon: Clapperboard,
    color: 'teal'
  },
  {
    date: '4 Mayıs 2026',
    title: 'Başvuru ve Eser Teslim (Son Gün)',
    description: 'Sisteme video yüklemek veya link göndermek için son gün. Bu tarihten sonra yapılan başvurular kabul edilmeyecektir.',
    icon: Upload,
    color: 'rose'
  },
  {
    date: '7 Mayıs 2026',
    title: 'Ön Sonuçlar',
    description: 'Jüri ön değerlendirmesi sonucu finale kalan takımların web sitesi üzerinden duyurulması.',
    icon: Star,
    color: 'amber'
  },
  {
    date: '8 Mayıs 2026',
    title: 'Ödül Alan Takımların Açıklanması',
    description: 'Değerlendirme sonucunda ödül almaya hak kazanan takımlar duyurulacaktır.',
    icon: CheckCircle2,
    color: 'teal'
  },
  {
    date: '22 Mayıs 2026',
    title: 'Büyük Ödül Töreni',
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

const FUTURE_EVENTS_2026_2027: TimelineEvent[] = [
  {
    date: 'Planlama Aşamasında',
    title: 'Şartname ve Kategori İlanı',
    description: 'Yeni sezona dair detaylı katılım koşulları, teknik yönergeler ve kategori kuralları web sitemizde ilan edilecektir.',
    icon: Clapperboard,
    color: 'amber'
  },
  {
    date: 'Planlama Aşamasında',
    title: 'Kayıtların & Başvuruların Başlaması',
    description: 'Öğrenci ve danışman öğretmen üyeliklerinin açılması, takımların kurulması ve heyecanın resmen başlaması.',
    icon: Upload,
    color: 'teal'
  },
  {
    date: 'Planlama Aşamasında',
    title: 'Sinema Atölyeleri & Yapay Zeka Eğitimleri',
    description: 'Kış dönemi kurgu teknikleri ve yeni nesil generative AI animasyon araçlarına dair özel akademisyen eğitimleri.',
    icon: BookOpen,
    color: 'amber'
  },
  {
    date: 'Planlama Aşamasında',
    title: 'Eser Gönderimleri ve Son Teslim',
    description: 'Sisteme video yüklemek, canlı çekim ve yapay zeka tasarımlarını kurula iletmek için son gün.',
    icon: Video,
    color: 'rose'
  },
  {
    date: 'Planlama Aşamasında',
    title: 'Seçici Kurul Değerlendirmesi',
    description: 'Akademik ve sektörel jürilerimizin eserleri teknik, senaryo ve sinematografi yönünden değerlendirme aşaması.',
    icon: Star,
    color: 'teal'
  },
  {
    date: 'Planlama Aşamasında',
    title: 'Büyük Gala ve Kazananların İlanı',
    description: 'Konya Tarihi Taş Bina veya sinema salonunda gerçekleşecek görkemli kırmızı halı geçişi ve kupa törenleri.',
    icon: Trophy,
    color: 'rose'
  }
];

export const Timeline: React.FC = () => {
  const { cmsTimeline } = useAppContext();
  const [selectedSeason, setSelectedSeason] = useState<'2025-2026' | '2026-2027'>('2026-2027');
  
  // Filter out the cancelled phases from the backend timeline as well to be safe
  const filteredCms = cmsTimeline ? cmsTimeline.filter(e => 
     !e.title.toLowerCase().includes('akademi') && 
     !e.title.toLowerCase().includes('eğitim') && 
     !e.title.toLowerCase().includes('revize') &&
     !e.title.toLowerCase().includes('nihai')
  ) : [];

  const pastEvents = filteredCms.length > 0 ? filteredCms : STATIC_EVENTS;
  const events = selectedSeason === '2025-2026' ? pastEvents : FUTURE_EVENTS_2026_2027;

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
            Fikir aşamasından büyük ödül gecesine kadar takip etmeniz gereken tüm sinematik duraklar.
          </p>
        </div>

        {/* Season Switcher & Announcement Frame */}
        <div className="max-w-5xl mx-auto mb-16 space-y-8">
          
          {/* Tabs */}
          <div className="flex flex-col md:flex-row justify-between items-center bg-slate-900/60 p-5 rounded-[2rem] border border-slate-800/80 gap-6">
            <div className="flex items-center gap-3">
              <span className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/20">
                <Calendar size={18} />
              </span>
              <div className="text-left">
                <h3 className="text-white font-bold text-sm">Yarışma Takvimi</h3>
                <p className="text-xs text-slate-400 font-medium">Sezonlar arasında geçiş yaparak takvimleri inceleyin</p>
              </div>
            </div>

            <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-850 w-full md:w-auto">
              <button
                onClick={() => setSelectedSeason('2025-2026')}
                className={`flex-1 md:flex-none px-6 py-3 rounded-xl text-xs font-black tracking-wider uppercase transition-all whitespace-nowrap cursor-pointer flex items-center justify-center gap-2 ${
                  selectedSeason === '2025-2026'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/10'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <CheckCircle2 size={12} /> 2025-2026 Sezonu
              </button>
              <button
                onClick={() => setSelectedSeason('2026-2027')}
                className={`flex-1 md:flex-none px-6 py-3 rounded-xl text-xs font-black tracking-wider uppercase transition-all whitespace-nowrap cursor-pointer flex items-center justify-center gap-2 ${
                  selectedSeason === '2026-2027'
                    ? 'bg-rose-500 text-white font-bold shadow-lg shadow-rose-500/10'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Sparkles size={12} className="animate-pulse" /> 2026-2027 Sezonu
              </button>
            </div>
          </div>

          {/* Announcement card placed in front of/above the timeline */}
          {selectedSeason === '2026-2027' ? (
            <div className="bg-gradient-to-r from-rose-950/40 via-slate-900/80 to-rose-950/40 backdrop-blur-xl border border-rose-500/20 rounded-[2.5rem] p-8 md:p-10 text-center shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-[40px] pointer-events-none"></div>
              
              <div className="inline-flex p-3.5 bg-rose-500/10 rounded-xl text-rose-500 mb-4 border border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.15)] animate-pulse">
                <Hourglass size={24} className="animate-spin" style={{ animationDuration: '6s' }} />
              </div>
              
              <h3 className="text-2xl md:text-3xl font-black text-white mb-3 tracking-tight">
                2026-2027 Sezonu Yolculuk Aşamaları Hazırlanıyor
              </h3>
              
              <p className="text-slate-300 text-sm md:text-base font-light leading-relaxed max-w-2xl mx-auto">
                Reflect&Shoot Kısa Film Yarışması’nın 2026-2027 sezonu hazırlıkları son hızla devam etmektedir. Resmi başvuru takvimi ve kesin süreç adımları yakında açıklanacaktır. Aşağıda tahmini süreç taslağını inceleyebilirsiniz.
              </p>

              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <span className="px-3.5 py-1.5 rounded-full bg-slate-950 border border-slate-800 text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                  ŞARTNAME GÜNCELLEMESİ
                </span>
                <span className="px-3.5 py-1.5 rounded-full bg-slate-950 border border-slate-800 text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                  YAPAY ZEKA ENTEGRASYONU
                </span>
                <span className="px-3.5 py-1.5 rounded-full bg-slate-950 border border-slate-800 text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                  SİNEMA ATÖLYELERİ
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-amber-950/20 via-slate-900/80 to-amber-950/20 backdrop-blur-xl border border-amber-500/10 rounded-[2.5rem] p-8 md:p-10 text-center shadow-xl relative overflow-hidden">
              <div className="inline-flex p-3.5 bg-amber-500/10 rounded-xl text-amber-500 mb-4 border border-amber-500/20">
                <CheckCircle2 size={24} />
              </div>
              
              <h3 className="text-2xl md:text-3xl font-black text-white mb-3 tracking-tight">
                2025-2026 Sezonu Tamamlandı & Arşivlendi
              </h3>
              
              <p className="text-slate-300 text-sm md:text-base font-light leading-relaxed max-w-2xl mx-auto">
                Büyük Ödül Töreni ile görkemli bir şekilde sonuçlandırılan 2025-2026 yarışmamıza ait resmi işlem adımları ve tamamlanan teslim süreçleri aşağıda arşiv başlığı altında yer almaktadır.
              </p>
            </div>
          )}

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
