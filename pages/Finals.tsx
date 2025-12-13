
import React from 'react';
import { Trophy, Film, Zap, Award, Cpu, ArrowRight, FileText, Gift, Crown, Sparkles, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export const Finals: React.FC = () => {
  const { } = useAppContext();

  // Premium Prize Card Component
  const PrizeCard = ({ rank, title, amount, desc, theme, isGold = false }: any) => {
    
    // Theme configurations
    const themes = {
        gold: {
            wrapper: "bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 border-amber-500/50 shadow-[0_0_50px_rgba(245,158,11,0.15)]",
            iconBg: "bg-gradient-to-br from-amber-400 to-amber-600 shadow-amber-500/50",
            iconColor: "text-slate-950",
            titleColor: "text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-500 to-amber-300",
            amountColor: "text-white",
            badge: "bg-amber-500 text-black",
            glow: "bg-amber-500/20"
        },
        silver: {
            wrapper: "bg-slate-900 border-slate-700 hover:border-slate-500",
            iconBg: "bg-slate-800 border border-slate-600",
            iconColor: "text-slate-300",
            titleColor: "text-slate-200",
            amountColor: "text-slate-300",
            badge: "bg-slate-600 text-white",
            glow: "bg-slate-500/10"
        },
        bronze: {
            wrapper: "bg-slate-900 border-orange-900/50 hover:border-orange-700/50",
            iconBg: "bg-slate-800 border border-orange-900/50",
            iconColor: "text-orange-500",
            titleColor: "text-orange-200",
            amountColor: "text-orange-400",
            badge: "bg-orange-800 text-orange-100",
            glow: "bg-orange-500/10"
        }
    };

    const t = themes[theme as keyof typeof themes];

    if (isGold) {
        return (
            <div className={`relative group rounded-[2.5rem] p-8 md:p-12 mb-8 border-2 transition-all duration-500 hover:scale-[1.02] ${t.wrapper} overflow-hidden`}>
                {/* Background Effects */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] -mr-20 -mt-20 pointer-events-none"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
                
                {/* Champion Badge */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 text-sm font-black uppercase tracking-[0.3em] py-2 px-8 rounded-b-2xl shadow-lg flex items-center gap-2 z-10">
                    <Crown size={16} strokeWidth={3} /> Şampiyon
                </div>

                <div className="flex flex-col items-center text-center relative z-10">
                    {/* Giant Icon */}
                    <div className="relative mb-6">
                        <div className={`w-32 h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center shadow-2xl ${t.iconBg} relative z-10`}>
                            <Trophy size={64} className={t.iconColor} strokeWidth={1.5} />
                            <div className="absolute -bottom-4 bg-white text-slate-900 font-black text-xl w-12 h-12 flex items-center justify-center rounded-full border-4 border-slate-900 shadow-lg">1</div>
                        </div>
                        <div className="absolute inset-0 bg-amber-500/30 blur-3xl rounded-full z-0 animate-pulse"></div>
                    </div>

                    <h3 className={`font-black text-3xl md:text-5xl mb-2 tracking-tight ${t.titleColor}`}>
                        {title}
                    </h3>
                    <div className="text-5xl md:text-7xl font-black text-white mb-6 drop-shadow-xl tracking-tighter">
                        {amount}
                    </div>
                    <p className="text-slate-300 text-lg md:text-xl font-medium leading-relaxed max-w-xl">
                        {desc}
                    </p>
                </div>
            </div>
        );
    }

    // Silver & Bronze Layout
    return (
        <div className={`relative group rounded-3xl p-6 md:p-8 mb-4 border transition-all duration-300 hover:-translate-y-1 ${t.wrapper}`}>
            <div className="flex items-center gap-6">
                <div className={`flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center shadow-inner ${t.iconBg}`}>
                    <span className={`font-black text-4xl md:text-5xl ${t.iconColor}`}>{rank}.</span>
                </div>
                <div>
                    <h3 className={`text-xl md:text-2xl font-bold mb-1 ${t.titleColor}`}>{title}</h3>
                    <div className={`text-3xl md:text-4xl font-black mb-2 tracking-tight ${t.amountColor}`}>{amount}</div>
                    <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
                </div>
            </div>
        </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans relative overflow-hidden text-white selection:bg-amber-500 selection:text-black">
      
      {/* 1. Cinematic Hero Section */}
      <div className="bg-gradient-to-b from-rose-950 via-slate-900 to-slate-950 text-white pt-32 pb-24 relative overflow-hidden">
        {/* Texture & Effects */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[500px] bg-rose-500/10 blur-[120px] rounded-full pointer-events-none mix-blend-screen"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 animate-fadeIn">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold tracking-[0.2em] uppercase mb-6 shadow-[0_0_15px_rgba(245,158,11,0.2)] backdrop-blur-sm">
               <Trophy size={14} /> ÖDÜL KÜRSÜSÜ
            </div>
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight animate-fadeIn delay-100">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-500 to-amber-300 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                    Ödüller
                </span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed mb-10 font-light animate-fadeIn delay-200">
               Toplam ödül havuzu ile yeteneği, emeği ve vizyonu ödüllendiriyoruz.
            </p>
        </div>
      </div>

      {/* 2. Info Banner (Premium Center) */}
      <div className="max-w-4xl mx-auto px-4 relative z-20 -mt-16 mb-24 animate-fadeIn delay-300">
          <div className="bg-slate-900/80 backdrop-blur-xl border border-amber-500/30 rounded-[2rem] p-10 text-center shadow-2xl relative overflow-hidden group">
              {/* Animated Glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none"></div>
              
              <div className="inline-flex p-4 bg-amber-500/10 rounded-full text-amber-500 mb-6 border border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                  <Gift size={32} />
              </div>
              
              <h3 className="text-3xl font-black text-white mb-4 tracking-tight">Finalist Ödül Dağılımı</h3>
              
              <p className="text-xl text-slate-300 font-light leading-relaxed max-w-2xl mx-auto">
                  Finale kalan <span className="font-bold text-white border-b-2 border-amber-500/50">20 takımdan 10 tanesine</span> ödül verilecektir.<br/>
                  Ödüller kategorilere göre ayrı ayrı takdim edilir.
              </p>

              <div className="mt-8 flex justify-center gap-4">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-teal-500 bg-teal-900/20 px-4 py-2 rounded-full border border-teal-500/20">
                      <Film size={14}/> Canlı Çekim
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-purple-500 bg-purple-900/20 px-4 py-2 rounded-full border border-purple-500/20">
                      <Cpu size={14}/> Yapay Zeka
                  </div>
              </div>
          </div>
      </div>

      {/* 3. Main Prize Columns */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        <div className="grid xl:grid-cols-2 gap-12 xl:gap-20 items-start">
            
            {/* COLUMN 1: LIVE ACTION */}
            <div className="relative">
                {/* Header */}
                <div className="flex items-center gap-6 mb-10 border-b border-teal-500/30 pb-6">
                    <div className="w-20 h-20 bg-teal-900/20 text-teal-400 rounded-3xl flex items-center justify-center border border-teal-500/20 shadow-[0_0_30px_rgba(20,184,166,0.2)]">
                        <Film size={40} />
                    </div>
                    <div>
                        <h2 className="text-4xl font-black text-white mb-1 tracking-tight">Canlı Çekim</h2>
                        <p className="text-teal-500 font-bold uppercase tracking-widest text-sm">Sinematografi Kategorisi</p>
                    </div>
                </div>

                {/* Prizes */}
                <div>
                    <PrizeCard 
                        rank={1}
                        title="Altın Kamera Ödülü"
                        amount="40.000 TL"
                        desc="Yaratıcılığı, anlatı gücü ve teknik başarısıyla öne çıkan birinci takıma verilir."
                        theme="gold"
                        isGold={true}
                    />
                    <div className="pl-4 border-l-2 border-slate-800 ml-4 md:ml-10 space-y-2">
                        <PrizeCard 
                            rank={2}
                            title="Gümüş Klaket Ödülü"
                            amount="30.000 TL"
                            desc="Kurgusal bütünlüğü ve sinematografik diliyle dikkat çeken ikinci takıma verilir."
                            theme="silver"
                        />
                        <PrizeCard 
                            rank={3}
                            title="Bronz Film Makarası"
                            amount="20.000 TL"
                            desc="Teknik yeterliliği ve anlatım başarısıyla öne çıkan üçüncü takıma verilir."
                            theme="bronze"
                        />
                    </div>
                </div>
            </div>

            {/* COLUMN 2: AI ANIMATION */}
            <div className="relative">
                {/* Header */}
                <div className="flex items-center gap-6 mb-10 border-b border-purple-500/30 pb-6">
                    <div className="w-20 h-20 bg-purple-900/20 text-purple-400 rounded-3xl flex items-center justify-center border border-purple-500/20 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                        <Cpu size={40} />
                    </div>
                    <div>
                        <h2 className="text-4xl font-black text-white mb-1 tracking-tight">Yapay Zekâ</h2>
                        <p className="text-purple-500 font-bold uppercase tracking-widest text-sm">Sentetik Medya Kategorisi</p>
                    </div>
                </div>

                {/* Prizes */}
                <div>
                    <PrizeCard 
                        rank={1}
                        title="Altın Kamera Ödülü"
                        amount="40.000 TL"
                        desc="Yapay zekâ araçlarını yaratıcı, tutarlı ve özgün biçimde kullanan birinci takıma verilir."
                        theme="gold"
                        isGold={true}
                    />
                    <div className="pl-4 border-l-2 border-slate-800 ml-4 md:ml-10 space-y-2">
                        <PrizeCard 
                            rank={2}
                            title="Gümüş Klaket Ödülü"
                            amount="30.000 TL"
                            desc="Teknik uygulama ve anlatım bütünlüğü açısından başarılı ikinci takıma verilir."
                            theme="silver"
                        />
                        <PrizeCard 
                            rank={3}
                            title="Bronz Film Makarası"
                            amount="20.000 TL"
                            desc="Yapay zekâ kullanımında yenilikçi yaklaşımıyla öne çıkan üçüncü takıma verilir."
                            theme="bronze"
                        />
                    </div>
                </div>
            </div>

        </div>

        {/* 4. Special Awards - Enlarged & Widened */}
        <div className="mt-24 border-t border-slate-800 pt-24">
            <div className="text-center mb-20">
                <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold tracking-[0.25em] uppercase mb-6 shadow-xl">
                    <Sparkles size={14} className="text-amber-500" /> Prestij Ödülleri
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-white">Özel Ödüller</h2>
            </div>
            
            <div className="max-w-7xl mx-auto space-y-10">
                
                {/* Mansiyon Card - Full Width */}
                <div className="group bg-gradient-to-r from-slate-900 via-slate-900 to-teal-950/30 p-10 md:p-14 rounded-[3rem] border border-slate-800 hover:border-teal-500/50 transition-all duration-500 shadow-2xl relative overflow-hidden hover:scale-[1.01]">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-[120px] pointer-events-none -mr-20 -mt-20"></div>
                    
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-10 relative z-10">
                        <div className="w-32 h-32 md:w-40 md:h-40 bg-teal-900/10 text-teal-400 rounded-[2rem] flex items-center justify-center flex-shrink-0 border border-teal-500/20 shadow-[0_0_40px_rgba(20,184,166,0.15)] group-hover:scale-110 transition-transform duration-500">
                            <Award size={64} strokeWidth={1.5} />
                        </div>
                        <div className="text-center md:text-left flex-1">
                            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4 justify-center md:justify-start">
                                <h3 className="text-3xl md:text-4xl font-black text-white tracking-tight group-hover:text-teal-400 transition-colors">
                                    Mansiyon Ödülü
                                </h3>
                                <span className="bg-teal-500 text-black text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg shadow-teal-500/20 self-center md:self-auto">
                                    Para Ödülü Verilebilir
                                </span>
                            </div>
                            <p className="text-slate-300 text-lg md:text-xl font-light leading-relaxed max-w-3xl">
                                Dereceye giremeseler bile, gelecek vadeden, özgün yaklaşımı, cesur denemeleri ve sanatsal diliyle jürinin dikkatini çeken eserlere verilir.
                            </p>
                            <div className="mt-8 flex flex-wrap gap-3 justify-center md:justify-start">
                                <span className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-wider">Yaratıcı Kurgu</span>
                                <span className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-wider">Sanat Yönetimi</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Jury Special Card - Full Width */}
                <div className="group bg-gradient-to-r from-slate-900 via-slate-900 to-rose-950/30 p-10 md:p-14 rounded-[3rem] border border-slate-800 hover:border-rose-500/50 transition-all duration-500 shadow-2xl relative overflow-hidden hover:scale-[1.01]">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-500/5 rounded-full blur-[120px] pointer-events-none -mr-20 -mt-20"></div>
                    
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-10 relative z-10">
                        <div className="w-32 h-32 md:w-40 md:h-40 bg-rose-900/10 text-rose-400 rounded-[2rem] flex items-center justify-center flex-shrink-0 border border-rose-500/20 shadow-[0_0_40px_rgba(225,29,72,0.15)] group-hover:scale-110 transition-transform duration-500">
                            <Zap size={64} strokeWidth={1.5} />
                        </div>
                        <div className="text-center md:text-left flex-1">
                            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4 justify-center md:justify-start">
                                <h3 className="text-3xl md:text-4xl font-black text-white tracking-tight group-hover:text-rose-400 transition-colors">
                                    Jüri Özel Ödülü
                                </h3>
                                <span className="bg-rose-500 text-white text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg shadow-rose-500/20 self-center md:self-auto">
                                    Para Ödülü Verilebilir
                                </span>
                            </div>
                            <p className="text-slate-300 text-lg md:text-xl font-light leading-relaxed max-w-3xl">
                                Jürinin, anlatım gücü, estetik risk alma cesareti veya işlediği temanın derinliği açısından özel olarak takdir ettiği ve teşvik etmek istediği eserler.
                            </p>
                            <div className="mt-8 flex flex-wrap gap-3 justify-center md:justify-start">
                                <span className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-wider">Özgün Senaryo</span>
                                <span className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-wider">Yönetmen Vizyonu</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>

        {/* 5. CTA */}
        <div className="mt-32 max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-12 md:p-16 rounded-[3rem] relative overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                <div className="relative z-10">
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-8 tracking-tight">
                        Ödül Kürsüsünde <br/> <span className="text-rose-500">Senin Adın Olsun.</span>
                    </h2>
                    <div className="flex flex-col sm:flex-row justify-center gap-5">
                        <Link to="/apply" className="bg-rose-600 hover:bg-rose-500 text-white font-bold py-5 px-12 rounded-2xl transition-all shadow-lg shadow-rose-900/30 flex items-center justify-center gap-3 text-lg transform hover:-translate-y-1">
                            Hemen Başvur <ArrowRight size={22} />
                        </Link>
                        <Link to="/about" className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-5 px-10 rounded-2xl transition-all border border-slate-700 flex items-center justify-center gap-3 text-lg hover:border-slate-500">
                            <FileText size={22} /> Şartları İncele
                        </Link>
                    </div>
                    <p className="text-slate-500 text-xs mt-8 font-bold uppercase tracking-[0.2em]">Son Başvuru: 13 Şubat 2026</p>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};
