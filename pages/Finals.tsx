
import React, { useState } from 'react';
import { Trophy, Film, Award, Cpu, ArrowRight, Lock, Calendar, Medal, Gem, Scroll } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export const Finals: React.FC = () => {
  const { } = useAppContext();
  const [selectedSeason, setSelectedSeason] = useState<'2025-2026' | '2026-2027'>('2025-2026');

  // Official 2025-2026 Live Action Winners
  const liveActionWinners = [
    { rank: "Birincilik Ödülü", team: "Sosyal Kızlar42", school: "Konya Türk Telekom Sosyal Bilimler Lisesi", type: "gold", icon: Trophy },
    { rank: "İkincilik Ödülü", team: "Diriliş Perileri", school: "Güngören İTO Kız Anadolu İmam Hatip Lisesi", type: "silver", icon: Medal },
    { rank: "Üçüncülük Ödülü", team: "sinemektep", school: "Güngören İTO Kız Anadolu İmam Hatip Lisesi", type: "bronze", icon: Award },
    { rank: "Jüri Özel Ödülü", team: "Homines Longinqui", school: "Uluslararası Mevlana Anadolu İmam Hatip Lisesi", type: "special", icon: Gem },
    { rank: "Mansiyon Ödülü", team: "Justice Without Doubt", school: "Mahmut Sami Ramazanoğlu Anadolu İmam Hatip Lisesi", type: "mention", icon: Scroll }
  ];

  // Official 2025-2026 AI Winners
  const aiWinners = [
    { rank: "Birincilik Ödülü", team: "mitra", school: "15 Temmuz Şehitleri Anadolu İmam Hatip Lisesi", type: "gold", icon: Trophy },
    { rank: "İkincilik Ödülü", team: "Technokasyon", school: "Kadıköy Anadolu İmam Hatip Lisesi", type: "silver", icon: Medal },
    { rank: "Üçüncülük Ödülü", team: "Threee", school: "Maltepe Kız Anadolu İmam Hatip Lisesi", type: "bronze", icon: Award },
    { rank: "Jüri Özel Ödülü", team: "PURE INSIGHT", school: "Selçuklu Fen Lisesi", type: "special", icon: Gem },
    { rank: "Mansiyon Ödülü", team: "Clear Vision", school: "Konya Anadolu İmam Hatip Lisesi", type: "mention", icon: Scroll }
  ];

  // Winner Card Component for the 2025-2026 archived awards results list
  const WinnerResultCard = ({ rank, team, school, type, icon: IconComponent }: any) => {
    // Styles mapping
    const styleMap = {
      gold: {
        bg: "bg-slate-900/60 border-amber-500/30 hover:border-amber-500 hover:shadow-[0_0_30px_rgba(245,158,11,0.12)] transition-all duration-300",
        iconContainer: "bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-slate-950 border-amber-400/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]",
        pill: "bg-amber-500/10 text-amber-450 border border-amber-500/20 font-black",
        cashBg: "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black"
      },
      silver: {
        bg: "bg-slate-900/60 border-slate-700/60 hover:border-slate-500 hover:shadow-[0_0_30px_rgba(148,163,184,0.08)] transition-all duration-300",
        iconContainer: "bg-gradient-to-br from-slate-300 to-slate-500 text-slate-950 border-slate-300/30 shadow-[0_0_15px_rgba(203,213,225,0.15)]",
        pill: "bg-slate-500/10 text-slate-300 border border-slate-700 font-black",
        cashBg: "bg-gradient-to-r from-slate-300 to-slate-400 text-slate-950 font-black"
      },
      bronze: {
        bg: "bg-slate-900/60 border-orange-900/30 hover:border-orange-700 hover:shadow-[0_0_30px_rgba(249,115,22,0.08)] transition-all duration-300",
        iconContainer: "bg-gradient-to-br from-orange-400 to-amber-700 text-slate-950 border-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.15)]",
        pill: "bg-orange-900/15 text-orange-400 border border-orange-950 font-black",
        cashBg: "bg-gradient-to-r from-orange-500 to-amber-600 text-slate-950 font-black"
      },
      special: {
        bg: "bg-slate-900/60 border-rose-950/40 hover:border-rose-500 hover:shadow-[0_0_30px_rgba(244,63,94,0.1)] transition-all duration-300",
        iconContainer: "bg-gradient-to-br from-rose-400 to-rose-600 text-white border-rose-400/30 shadow-[0_0_15px_rgba(244,63,94,0.2)]",
        pill: "bg-rose-950/30 text-rose-450 border border-rose-950 font-black",
        cashBg: "bg-gradient-to-r from-rose-500 to-pink-600 text-white font-black"
      },
      mention: {
        bg: "bg-slate-900/60 border-teal-950/40 hover:border-teal-500 hover:shadow-[0_0_30px_rgba(20,184,166,0.1)] transition-all duration-300",
        iconContainer: "bg-gradient-to-br from-teal-400 to-emerald-500 text-slate-950 border-teal-450/30 shadow-[0_0_15px_rgba(20,184,166,0.2)]",
        pill: "bg-teal-950/35 text-teal-450 border border-teal-950 font-black",
        cashBg: "bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-black"
      }
    };

    const s = styleMap[type as keyof typeof styleMap] || styleMap.mention;

    return (
      <div className={`relative group p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1 ${s.bg}`}>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.01] to-transparent rounded-2xl pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.005] rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between">
          <div className="flex gap-4 items-center">
            {/* Left Trophy/Rank container */}
            <div className={`w-14 h-14 rounded-xl border flex items-center justify-center flex-shrink-0 font-extrabold shadow-lg ${s.iconContainer}`}>
              <IconComponent size={24} className="group-hover:scale-110 transition-transform duration-300" />
            </div>

            {/* School & Team Metadata */}
            <div className="space-y-1">
              <span className={`inline-block px-3 py-0.5 rounded-full text-[10px] uppercase tracking-wider ${s.pill}`}>
                {rank}
              </span>
              <h3 className="text-xl font-black text-white group-hover:text-amber-400 transition-colors">
                {team}
              </h3>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                {school}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans relative overflow-hidden text-white selection:bg-amber-500 selection:text-black">
      
      {/* 1. Cinematic Hero Section */}
      <div className="bg-gradient-to-b from-rose-950 via-slate-900 to-slate-950 text-white pt-32 pb-24 relative overflow-hidden ring-1 ring-white/5 shadow-2xl">
        {/* Texture & Effects */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[500px] bg-rose-500/10 blur-[120px] rounded-full pointer-events-none mix-blend-screen"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 animate-fadeIn">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold tracking-[0.2em] uppercase mb-6 shadow-[0_0_15px_rgba(245,158,11,0.2)] backdrop-blur-sm">
               <Trophy size={14} /> REFLECT&SHOOT ÖDÜL KÜRSÜSÜ
            </div>
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-500 to-amber-300 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                    Ödüller
                </span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed mb-10 font-light">
               Sezonlar boyunca sinema dilini, emeği, vizyonu ve yenilikçi teknolojileri ödüllendiriyoruz.
            </p>
        </div>
      </div>

      {/* 2. Season Switcher Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 mb-16 -mt-8">
        <div className="flex flex-col md:flex-row justify-between items-center bg-slate-900/60 p-6 rounded-[2rem] border border-slate-900 gap-6 shadow-2xl">
          <div className="flex items-center gap-4">
            <span className="text-amber-500 bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider">
              Sezon Seçimi
            </span>
            <p className="text-sm text-slate-300 font-medium">Ulaşmak istediğiniz sezonu seçiniz:</p>
          </div>
          
          <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-850 w-full md:w-auto">
            <button type="button"
              onClick={() => setSelectedSeason('2025-2026')}
              className={`flex-1 md:flex-none px-8 py-3.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                selectedSeason === '2025-2026'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/10'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Trophy size={14} /> 2025-2026 Sezonu (Nihai)
            </button>
            <button type="button"
              onClick={() => setSelectedSeason('2026-2027')}
              className={`flex-1 md:flex-none px-8 py-3.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                selectedSeason === '2026-2027'
                  ? 'bg-rose-500 text-white font-bold shadow-lg shadow-rose-500/10'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Lock size={12} /> 2026-2027 Sezonu (Yakında)
            </button>
          </div>
        </div>
      </div>

      {/* Conditionally Render Based on Selected Season */}
      {selectedSeason === '2025-2026' ? (
        // SHOW ARCHIVED OFFICIAL WINNERS OF 2025-2026 SEASON
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 relative z-10">
          
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 text-amber-500 border border-slate-800 text-xs font-bold tracking-widest uppercase mb-4">
               Resmi Sonuç Listesi
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
              2025-2026 Sezonu Kazanan Ekip ve Eserleri
            </h2>
            <p className="text-slate-400 text-sm md:text-base mt-2 max-w-xl mx-auto leading-relaxed">
              Değerli akademisyen ve seçici kurul jürimizin oylaması sonucunda ödül almaya hak kazanan başarılı takımlarımız.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-16">
            
            {/* CANLI CEKIM COLUMN */}
            <div className="space-y-8">
              <div className="flex items-center gap-4 border-b border-teal-500/20 pb-4">
                <div className="p-3 bg-teal-500/10 text-teal-400 rounded-xl border border-teal-500/20">
                  <Film size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white">Canlı Çekim</h3>
                  <p className="text-teal-400 text-xs font-bold uppercase tracking-wider">Sinematografi Kategorisi</p>
                </div>
              </div>

              <div className="space-y-4">
                {liveActionWinners.map((winner, idx) => (
                  <WinnerResultCard 
                    key={idx}
                    rank={winner.rank}
                    team={winner.team}
                    school={winner.school}
                    type={winner.type}
                    icon={winner.icon}
                  />
                ))}
              </div>
            </div>

            {/* AI ANIMATION COLUMN */}
            <div className="space-y-8">
              <div className="flex items-center gap-4 border-b border-purple-500/20 pb-4">
                <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
                  <Cpu size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white">Yapay Zekâ</h3>
                  <p className="text-purple-400 text-xs font-bold uppercase tracking-wider">Sentetik Medya Kategorisi</p>
                </div>
              </div>

              <div className="space-y-4">
                {aiWinners.map((winner, idx) => (
                  <WinnerResultCard 
                    key={idx}
                    rank={winner.rank}
                    team={winner.team}
                    school={winner.school}
                    type={winner.type}
                    icon={winner.icon}
                  />
                ))}
              </div>
            </div>

          </div>

          {/* Gala link section */}
          <div className="mt-20 text-center bg-slate-900/20 p-8 rounded-[2rem] border border-slate-900 max-w-2xl mx-auto">
             <Trophy size={40} className="text-amber-500 mx-auto mb-3" />
             <h4 className="font-bold text-lg text-white mb-2">Filmleri Gala Salonunda İzleyin!</h4>
             <p className="text-xs text-slate-400 mb-6 font-light leading-relaxed">
               Bu eşsiz eserlerin tamamını ve jüri heyetimizin detaylı değerlendirme raporlarını Gala Salonumuzda sinematik bir ortamda izleyebilirsiniz.
             </p>
             <Link 
               to="/sinema" 
               className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl transition-all"
             >
               Gala Salonuna Git <ArrowRight size={14} />
             </Link>
          </div>

        </div>
      ) : (
        // SHOW UPCOMING PREPARATION SPECIFICATIONS FOR 2026-2027 SEASON
        <div className="relative z-10 transition-all duration-500">
          
          {/* 3. Info Banner */}
          <div className="max-w-4xl mx-auto px-4 mb-24">
              <div className="bg-slate-900/80 backdrop-blur-xl border border-rose-500/20 rounded-[2rem] p-10 text-center shadow-2xl relative overflow-hidden group">
                  {/* Glowing tag */}
                  <span className="absolute top-4 right-4 px-3 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full text-[10px] tracking-widest font-black uppercase shadow-sm">
                    HAZIRLIK AŞAMASINDA
                  </span>
                  
                  <div className="inline-flex p-4 bg-rose-500/10 rounded-full text-rose-500 mb-6 border border-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.1)]">
                      <Calendar size={32} />
                  </div>
                  
                  <h3 className="text-3xl font-black text-white mb-4 tracking-tight">2026-2027 Sezonu Şartname Detayları</h3>
                  
                  <p className="text-xl text-slate-300 font-light leading-relaxed max-w-2xl mx-auto">
                    Yeni sezonda yalnızca yapay zekâ animasyon kategorisinde yarışılacak ve eserler Asr ile Beled surelerinden ilham alacak. Ödül ve takvim bilgileri belli olduğunda burada duyurulacaktır.
                  </p>

                  <div className="mt-8 flex justify-center gap-4">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-purple-500 bg-purple-900/20 px-4 py-2 rounded-full border border-purple-500/20">
                          <Cpu size={14}/> Yapay Zeka
                      </div>
                  </div>
              </div>
          </div>

          {/* 4. Preparation notice (prizes are not announced yet) */}
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pb-32">
            {/* Preparation notice */}
            <div className="mt-24 max-w-4xl mx-auto text-center">
              <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-12 rounded-[3rem] relative overflow-hidden shadow-2xl">
                <div className="relative z-10">
                  <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                    2026-2027 Sezon Planlaması ve Başvurular
                  </h2>
                  <p className="text-slate-400 text-base max-w-2xl mx-auto mb-8 font-light">
                    Reflect&Shoot Kısa Film Yarışması 2026-2027 eğitim-öğretim dönemi başvuru takvimi, güncellenmiş şartname, kategori kuralları ve diğer detaylar resmi web sitemiz üzerinden yakında ilan edilecek ve sisteme aktarılacaktır.
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <Link to="/about" className="bg-slate-800 text-white font-bold py-4 px-8 rounded-xl border border-slate-700 text-sm hover:bg-slate-705">
                      Yarışma Hakkında Bilgi Al
                    </Link>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
