
import React from 'react';
import { Trophy, Clapperboard, Film, Star, Zap, Award } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export const Finals: React.FC = () => {
  const { cmsPrizes } = useAppContext();

  // Find prizes by ID, or use fallback if not set
  const getPrize = (id: string, defaultTitle: string, defaultReward: string, defaultDesc: string) => {
      const p = cmsPrizes.find(item => item.id === id);
      return {
          title: p?.title || defaultTitle,
          reward: p?.reward || defaultReward,
          description: p?.description || defaultDesc
      };
  };

  const rank1 = getPrize('rank1', 'Altın Kamera Ödülü', '40.000 TL', 'Yaratıcılığı, teknik ustalığı ve sinematik anlatımıyla jüriyi en çok etkileyen birinci ekip bu büyük ödülün sahibi olur.');
  const rank2 = getPrize('rank2', 'Gümüş Klaket Ödülü', '30.000 TL', 'Kurgusal bütünlük, sahne tasarımı ve anlatım başarısıyla ikinci seçilen ekip ödüllendirilir.');
  const rank3 = getPrize('rank3', 'Bronz Film Makarası', '20.000 TL', 'Teknik başarı, kamera kullanımı ve görsel anlatım gücüyle öne çıkan üçüncü ekip bu ödülü alır.');
  const mention = getPrize('mention', 'Mansiyon Ödülü', 'Sürpriz Ödül', 'Gelecek vadeden, potansiyeli yüksek ve özgün sinematik yaklaşıma sahip ekibe verilen özel teşvik ödülü.');
  const special = getPrize('special', 'Jüri Özel Ödülü', 'Sanatsal Cesaret Ödülü', 'Klasik anlatımın dışına çıkarak cesur, yenilikçi ve etkileyici bir yaklaşım sergileyen ekibe verilen özel jüri plaketi.');

  return (
    <div className="min-h-screen bg-slate-950 font-sans relative overflow-hidden text-white selection:bg-amber-500 selection:text-black">
      
      {/* 1. Cinematic Hero Section */}
      <div className="bg-gradient-to-b from-rose-950 via-slate-900 to-slate-950 text-white pt-32 pb-24 relative overflow-hidden">
        {/* Texture & Effects */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[500px] bg-rose-500/10 blur-[120px] rounded-full pointer-events-none mix-blend-screen"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 animate-fadeIn">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold tracking-[0.2em] uppercase mb-6 shadow-[0_0_15px_rgba(245,158,11,0.2)] backdrop-blur-sm">
               <Trophy size={14} /> ONUR LİSTESİ
            </div>
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight animate-fadeIn delay-100">
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-500 to-amber-300 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                 Reflect&Shoot Yarışması Ödülleri
               </span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 font-light max-w-3xl mx-auto leading-relaxed animate-fadeIn delay-200">
               Sinemanın genç yeteneklerini keşfediyor, başarıyı ve emeği ödüllendiriyoruz.
            </p>
        </div>
      </div>

      {/* Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 relative z-20">
        
        {/* Awards Grid - Podium Style */}
        <div className="flex flex-col items-center gap-8 md:gap-12">
            
            {/* 1. Prize (Gold) */}
            <div className="w-full max-w-2xl transform hover:-translate-y-2 transition-all duration-500 animate-slideUp">
                <div className="relative bg-[#f7f7f9] text-slate-900 rounded-[2.5rem] p-10 md:p-14 shadow-[0_20px_60px_-15px_rgba(251,191,36,0.3)] border-t-8 border-amber-500 overflow-hidden group">
                     {/* Glow Line */}
                     <div className="absolute top-0 left-0 w-full h-1 bg-amber-400 shadow-[0_0_20px_rgba(251,191,36,1)]"></div>
                     
                     <div className="flex flex-col md:flex-row items-center text-center md:text-left gap-10 relative z-10">
                         <div className="w-36 h-36 bg-gradient-to-br from-amber-100 to-amber-50 rounded-full flex items-center justify-center border-4 border-amber-200 shadow-xl flex-shrink-0 group-hover:scale-110 transition-transform duration-500">
                             <Trophy size={72} className="text-amber-600 drop-shadow-sm" />
                         </div>
                         <div>
                             <h3 className="text-amber-600 font-black text-sm uppercase tracking-widest mb-2 flex items-center justify-center md:justify-start gap-2">
                                <Star size={14} className="fill-current"/> 1. Ödül
                             </h3>
                             <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-2">{rank1.title}</h2>
                             <div className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-500 mb-6 tracking-tight">
                                {rank1.reward}
                             </div>
                             <p className="text-slate-600 text-lg leading-relaxed font-medium">
                                {rank1.description}
                                <br/><span className="text-amber-600 font-bold text-sm mt-3 block inline-block px-3 py-1 bg-amber-50 rounded-full border border-amber-100">+ Altın Kamera Heykeli + Teknoloji Çeki</span>
                             </p>
                         </div>
                     </div>
                     {/* Background Decoration */}
                     <div className="absolute right-[-50px] top-[-50px] opacity-5 pointer-events-none">
                         <Trophy size={300} />
                     </div>
                </div>
            </div>

            {/* 2nd & 3rd Prizes */}
            <div className="grid md:grid-cols-2 gap-8 w-full max-w-5xl animate-slideUp delay-200">
                
                {/* 2. Prize (Silver) */}
                <div className="bg-[#f7f7f9] text-slate-900 rounded-[2rem] p-8 md:p-12 shadow-[0_15px_40px_-15px_rgba(148,163,184,0.3)] border-t-8 border-slate-400 relative overflow-hidden group hover:-translate-y-2 transition-all duration-500">
                    <div className="absolute top-0 left-0 w-full h-1 bg-slate-300 shadow-[0_0_15px_rgba(203,213,225,1)]"></div>
                    <div className="flex flex-col items-center text-center relative z-10">
                        <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-50 rounded-full flex items-center justify-center border-4 border-slate-200 shadow-lg mb-6 group-hover:rotate-12 transition-transform">
                            <Clapperboard size={40} className="text-slate-500" />
                        </div>
                        <h3 className="text-slate-500 font-black text-xs uppercase tracking-widest mb-2">2. Ödül</h3>
                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-2">{rank2.title}</h2>
                        <div className="text-4xl font-black text-slate-600 mb-6">{rank2.reward}</div>
                        <p className="text-slate-600 leading-relaxed font-medium">
                           {rank2.description}
                           <span className="block font-bold text-slate-500 text-sm mt-3 px-3 py-1 bg-slate-100 rounded-full inline-block">+ Teknoloji Çeki</span>
                        </p>
                    </div>
                </div>

                {/* 3. Prize (Bronze) */}
                <div className="bg-[#f7f7f9] text-slate-900 rounded-[2rem] p-8 md:p-12 shadow-[0_15px_40px_-15px_rgba(180,83,9,0.3)] border-t-8 border-orange-700 relative overflow-hidden group hover:-translate-y-2 transition-all duration-500">
                    <div className="absolute top-0 left-0 w-full h-1 bg-orange-600 shadow-[0_0_15px_rgba(180,83,9,1)]"></div>
                    <div className="flex flex-col items-center text-center relative z-10">
                        <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-orange-50 rounded-full flex items-center justify-center border-4 border-orange-200 shadow-lg mb-6 group-hover:-rotate-12 transition-transform">
                            <Film size={40} className="text-orange-800" />
                        </div>
                        <h3 className="text-orange-800 font-black text-xs uppercase tracking-widest mb-2">3. Ödül</h3>
                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-2">{rank3.title}</h2>
                        <div className="text-4xl font-black text-orange-900 mb-6">{rank3.reward}</div>
                        <p className="text-slate-600 leading-relaxed font-medium">
                           {rank3.description}
                        </p>
                    </div>
                </div>
            </div>

            {/* Special Mentions */}
            <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl animate-slideUp delay-300">
                
                {/* Mansiyon */}
                <div className="bg-[#f7f7f9] text-slate-900 rounded-2xl p-8 shadow-xl border-t-4 border-teal-500 hover:-translate-y-1 transition-transform group">
                     <div className="flex items-start gap-6">
                         <div className="p-4 bg-teal-100 text-teal-600 rounded-xl group-hover:bg-teal-600 group-hover:text-white transition-colors">
                             <Award size={32} />
                         </div>
                         <div>
                             <h3 className="text-teal-600 font-bold text-xs uppercase tracking-widest mb-1">{mention.title}</h3>
                             <h4 className="text-xl font-black text-slate-900 mb-2">{mention.reward}</h4>
                             <p className="text-slate-600 text-sm leading-relaxed font-medium">
                                {mention.description}
                             </p>
                         </div>
                     </div>
                </div>

                {/* Jury Special */}
                <div className="bg-[#f7f7f9] text-slate-900 rounded-2xl p-8 shadow-xl border-t-4 border-rose-500 hover:-translate-y-1 transition-transform group">
                     <div className="flex items-start gap-6">
                         <div className="p-4 bg-rose-100 text-rose-600 rounded-xl group-hover:bg-rose-600 group-hover:text-white transition-colors">
                             <Zap size={32} />
                         </div>
                         <div>
                             <h3 className="text-rose-600 font-bold text-xs uppercase tracking-widest mb-1">{special.title}</h3>
                             <h4 className="text-xl font-black text-slate-900 mb-2">{special.reward}</h4>
                             <p className="text-slate-600 text-sm leading-relaxed font-medium">
                                {special.description}
                             </p>
                         </div>
                     </div>
                </div>
            </div>
        </div>

        {/* Footer Note - Updated to Islamic/Contemplative Quote */}
        <div className="mt-28 text-center opacity-80 pb-12">
             <p className="text-slate-400 font-light italic text-lg font-serif">
                "Kâinatın ayetlerini kadraja sığdırmak değil, kadrajdan kâinatı tefekkür etmektir hüner.<br/>
                <span className="text-amber-500/80">Vizörünüz hakikate, odağınız sonsuzluğa ayarlı olsun.</span>"
             </p>
        </div>
      </div>
      
      <style>{`
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
            from { opacity: 0; transform: translateY(40px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
            animation: fadeIn 0.8s ease-out forwards;
        }
        .animate-slideUp {
            animation: slideUp 0.8s ease-out forwards;
        }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.4s; }
      `}</style>
    </div>
  );
};
