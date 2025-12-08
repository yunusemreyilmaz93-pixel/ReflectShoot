import React from 'react';
import { 
  CheckCircle2, 
  Target, 
  BookOpen, 
  Users, 
  Download, 
  FileText, 
  Monitor,
  HelpCircle,
  ArrowRight,
  ScrollText,
  PenTool,
  MessageCircle,
  Mail,
  Film,
  Subtitles
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const About: React.FC = () => {
  // Data for Verses (Same as Home)
  const verses = [
    "Al-i İmran: 92", "Al-i İmran: 103", "Al-i İmran: 190-191",
    "Ankebut: 41", "Araf: 27", "Asr: 1-3",
    "Bakara: 138", "Bakara: 168", "Enfal: 46",
    "Furkan: 63", "Hucurat: 10-11", "İsra: 81",
    "İnşirah: 5-9", "Kasas: 72", "Lokman: 18",
    "Maide: 2", "Yasin: 82", "Yunus: 57",
    "Zariyat: 50", "Zariyat: 55", "Zümer: 9"
  ];

  const criteria = [
    { label: "Senaryo ve Hikaye Anlatımı", percent: 30, color: "bg-teal-600", text: "text-teal-400", ring: "ring-teal-500/30" },
    { label: "Teknik Kalite (Görüntü & Ses)", percent: 25, color: "bg-amber-500", text: "text-amber-400", ring: "ring-amber-500/30" },
    { label: "Yaratıcılık ve Özgünlük", percent: 25, color: "bg-purple-600", text: "text-purple-400", ring: "ring-purple-500/30" },
    { label: "Kurgu ve Montaj", percent: 20, color: "bg-rose-600", text: "text-rose-400", ring: "ring-rose-500/30" },
  ];

  const handleDownload = (docName: string) => {
    if (docName === "KVKK Aydınlatma Metni") {
        window.open("https://dosya.co/f695f8863w00/Açık_Rıza_Metni.pdf.html", "_blank");
    } else if (docName === "Veli İzin Belgesi") {
        window.open("https://dosya.co/mndjfbhnto6e/Veli_İzin_Belgesi.pdf.html", "_blank");
    } else {
        alert(`${docName} İndiriliyor...`);
    }
  };

  return (
    <div className="bg-slate-900 min-h-screen font-sans selection:bg-rose-500 selection:text-white">
      
      {/* 1. Cinematic Hero Section */}
      <div className="bg-gradient-to-b from-rose-950 via-slate-900 to-slate-950 text-white pt-32 pb-24 relative overflow-hidden">
        {/* Texture & Effects */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[500px] bg-rose-500/10 blur-[120px] rounded-full pointer-events-none mix-blend-screen"></div>
        
        <div className="max-w-7xl mx-auto text-center relative z-10 px-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold tracking-[0.2em] uppercase mb-6 shadow-[0_0_15px_rgba(245,158,11,0.2)] backdrop-blur-sm animate-fadeIn">
             <Users size={14} /> VİZYON & MİSYON
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight animate-fadeIn delay-100">
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-500 to-amber-300 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">
               Reflect&Shoot Yarışma Hakkında
             </span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 font-light max-w-3xl mx-auto leading-relaxed animate-fadeIn delay-200">
            İmam Hatip Lisesi gençliğinin vizöründen kadim değerlerimizi modern sinema diliyle yorumlayan prestijli bir kısa film yarışması.
          </p>
        </div>
      </div>

      {/* 2. Organizers Section - Dark Theme */}
      <section className="py-20 bg-slate-900 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-8">
                
                {/* School Card */}
                <div className="bg-slate-800 p-8 md:p-10 rounded-2xl shadow-xl border border-slate-700 hover:border-slate-600 group hover:-translate-y-1 transition-all duration-300">
                    <div className="flex flex-col sm:flex-row items-start gap-8 mb-8">
                        <div className="w-24 h-24 flex-shrink-0 flex items-center justify-center p-2 bg-white rounded-xl border border-slate-600 shadow-md">
                            <img src="20113118_yeni_logo_konyaihl.png" alt="Konya Anadolu İHL" className="w-full h-full object-contain" />
                        </div>
                        <div>
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Düzenleyen Kurum</h3>
                            <p className="text-2xl font-black text-white leading-none mb-1">Konya Anadolu</p>
                            <p className="text-lg font-medium text-slate-400">İmam Hatip Lisesi</p>
                        </div>
                    </div>
                    <div className="w-full h-px bg-slate-700 mb-6"></div>
                    <p className="text-slate-300 leading-relaxed text-sm font-light">
                        Konya Anadolu İmam Hatip Lisesi, 1951’den bu yana Türkiye’nin en köklü ve güçlü eğitim kurumlarından biridir. Fen–sosyal bilimler programları, proje sınıfları ve kültür-sanat alanındaki çalışmalarıyla donanımlı, sorumluluk sahibi ve yüksek karakterli bireyler yetiştirir. Akademik başarıyı değerler eğitimiyle birleştirerek ülkemize pek çok alanda öncü mezunlar kazandırmayı hedefler.
                    </p>
                </div>

                {/* Sponsor Card */}
                <div className="bg-slate-800 p-8 md:p-10 rounded-2xl shadow-xl border border-slate-700 hover:border-slate-600 group hover:-translate-y-1 transition-all duration-300">
                    <div className="flex flex-col sm:flex-row items-start gap-8 mb-8">
                        <div className="w-24 h-24 flex-shrink-0 flex items-center justify-center p-2 bg-white rounded-xl border border-slate-600 shadow-md">
                            <img src="timav-icon.png" alt="TİMAV Vakfı" className="w-full h-full object-contain" />
                        </div>
                        <div>
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Ana Sponsor</h3>
                            <p className="text-2xl font-black text-white leading-none mb-1">TİMAV</p>
                            <p className="text-lg font-medium text-slate-400">Türkiye İmam Hatipliler Vakfı</p>
                        </div>
                    </div>
                    <div className="w-full h-px bg-slate-700 mb-6"></div>
                    <p className="text-slate-300 leading-relaxed text-sm font-light">
                        Türkiye İmam Hatipliler Vakfı (TİMAV), 1994’ten bu yana imam hatip camiasının birlik, dayanışma ve gelişimine katkı sunmayı amaçlayan ülke çapında bir vakıf hareketidir. Milli ve manevi değerlere bağlı, donanımlı ve sorumlu gençlerin yetişmesi için burs, eğitim, kültür ve sosyal projeler yürütür; imam hatip öğrencileri ve mezunlarının Türkiye’nin kültür, eğitim ve düşünce dünyasında daha etkin yer almasını destekler.
                    </p>
                </div>

            </div>
        </div>
      </section>

      {/* 3. Themes Section - Dark Cinematic (Seamless Integration) */}
      <section className="py-24 bg-slate-900 relative overflow-hidden">
        {/* Cinematic Backgrounds */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(30,41,59,0.5)_0%,rgba(2,6,23,1)_100%)] pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 pb-16">
          <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6 pt-10 border-t border-slate-800/50">
             <div>
                <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4 mt-10">
                    Yarışma <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500">Temaları</span>
                </h2>
                <p className="text-slate-400 text-lg font-light leading-relaxed">
                    Kadim kaynaklardan beslenen, sinema diliyle günümüze taşınan özgün hikayeler.
                </p>
             </div>
             <div className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                 <PenTool size={14} /> İlham Kaynakları
             </div>
          </div>

          <div className="space-y-12">
            
            {/* Ayetler - Fixed Layout */}
            <div className="relative bg-slate-800 p-8 md:p-10 rounded-2xl shadow-2xl border-t-4 border-amber-500/50">
               <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/cardboard-flat.png')]"></div>
               
               <div className="relative z-10">
                   <div className="flex items-center gap-4 mb-8">
                       <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-500/30">
                           <BookOpen className="text-amber-500" size={32} />
                       </div>
                       <div>
                           <h3 className="text-3xl font-black text-white">Kur'an'dan Ayetler</h3>
                           <p className="text-slate-400 font-medium">Senaryo Temeli: Vahiy</p>
                       </div>
                   </div>
                   
                   <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                       {verses.map((verse, idx) => (
                           <div key={idx} className="bg-slate-900/80 border border-slate-700 hover:border-amber-500/50 hover:bg-slate-900 transition-all cursor-default p-3 rounded-lg flex items-center justify-center text-center h-14 shadow-sm group">
                               <span className="font-medium text-slate-300 text-sm group-hover:text-white transition-colors">{verse}</span>
                           </div>
                       ))}
                   </div>
               </div>
            </div>

            {/* Hadith & Sahabe - Cinematic Cards */}
            <div className="grid md:grid-cols-2 gap-8">
                {/* Hadisler */}
                <div className="bg-slate-800 p-8 md:p-10 rounded-2xl shadow-2xl border border-slate-700 hover:border-teal-500/50 transition-colors group">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="bg-teal-900/30 p-4 rounded-xl text-teal-400 border border-teal-500/30 group-hover:scale-110 transition-transform">
                            <ScrollText size={32} />
                        </div>
                        <h3 className="text-2xl font-black text-white">Hadisler</h3>
                    </div>
                    <p className="text-slate-400 leading-relaxed mb-6 font-light">
                        Peygamber Efendimiz'in (s.a.v) sözlerinden, hayatından ve tavsiyelerinden yola çıkarak günümüze ışık tutan hikayeler.
                    </p>
                    <div className="bg-slate-900/50 p-4 rounded border-l-2 border-teal-500 text-xs text-slate-400 italic">
                        "En güvenilir kaynaklardan seçilen rivayetler esastır."
                    </div>
                </div>

                {/* Sahabeler */}
                <div className="bg-slate-800 p-8 md:p-10 rounded-2xl shadow-2xl border border-slate-700 hover:border-rose-500/50 transition-colors group">
                    <div className="flex items-center gap-4 mb-6">
                         <div className="bg-rose-900/30 p-4 rounded-xl text-rose-400 border border-rose-500/30 group-hover:scale-110 transition-transform">
                            <Users size={32} />
                        </div>
                        <h3 className="text-2xl font-black text-white">Sahabelerden Hikayeler</h3>
                    </div>
                    <p className="text-slate-400 leading-relaxed mb-6 font-light">
                        Asr-ı Saadet'in yıldızları olan sahabelerin hayatlarından, fedakarlıklarından ve erdemli duruşlarından kesitler.
                    </p>
                    <div className="bg-slate-900/50 p-4 rounded border-l-2 border-rose-500 text-xs text-slate-400 italic">
                        "Tarihsel gerçekliğe sadık kalınarak dramatize edilmelidir."
                    </div>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Rules & Technical Specs Section - Dark Theme */}
      <section className="py-24 bg-slate-900 relative border-t border-slate-800/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-stretch">
                
                {/* Participation Rules */}
                <div className="bg-slate-800 p-8 md:p-10 rounded-3xl shadow-xl border border-slate-700 flex flex-col h-full group hover:border-rose-900/50 transition-colors">
                     <div className="flex items-center gap-4 mb-8">
                        <div className="w-14 h-14 bg-rose-900/30 rounded-2xl flex items-center justify-center text-rose-400 group-hover:bg-rose-600 group-hover:text-white transition-colors border border-rose-500/20">
                             <CheckCircle2 size={28} />
                        </div>
                        <h2 className="text-2xl font-black text-white">Katılım Koşulları</h2>
                    </div>
                    <ul className="space-y-6 flex-1">
                        {[
                            "Yarışma Türkiye genelindeki tüm İmam Hatip Lisesi öğrencilerine açıktır.",
                            "Takımlar en az 3, en fazla 6 öğrenciden oluşmalıdır.",
                            "Her takımın bir Danışman Öğretmeni olması zorunludur.",
                            "Bir öğrenci yalnızca tek bir projede görev alabilir.",
                            "Proje dili İngilizce, Türkçe altyazı zorunludur."
                        ].map((rule, idx) => (
                            <li key={idx} className="flex items-start">
                                <div className="w-6 h-6 rounded-full bg-rose-900/20 flex-shrink-0 flex items-center justify-center mt-0.5 mr-4 text-rose-500">
                                     <div className="w-2 h-2 rounded-full bg-current"></div>
                                </div>
                                <p className="text-slate-300 font-medium leading-relaxed">{rule}</p>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Technical Specs */}
                <div className="bg-slate-800 p-8 md:p-10 rounded-3xl shadow-xl border border-slate-700 flex flex-col h-full group hover:border-teal-900/50 transition-colors">
                     <div className="flex items-center gap-4 mb-8">
                        <div className="w-14 h-14 bg-teal-900/30 rounded-2xl flex items-center justify-center text-teal-400 group-hover:bg-teal-600 group-hover:text-white transition-colors border border-teal-500/20">
                             <Target size={28} />
                        </div>
                        <h2 className="text-2xl font-black text-white">Teknik Şartlar</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-700 hover:border-teal-500/30 transition-colors">
                            <Monitor className="text-slate-500 mb-3" size={24} />
                            <h4 className="font-bold text-white mb-1">Çözünürlük</h4>
                            <p className="text-sm text-slate-400">Min 1920x1080 (FHD)</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-700 hover:border-teal-500/30 transition-colors">
                            <Film className="text-slate-500 mb-3" size={24} />
                            <h4 className="font-bold text-white mb-1">Format & Süre</h4>
                            <p className="text-sm text-slate-400">MP4/MOV, 2-3 Dakika</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-700 hover:border-teal-500/30 transition-colors">
                            <Target className="text-slate-500 mb-3" size={24} />
                            <h4 className="font-bold text-white mb-1">Görüntü Oranı</h4>
                            <p className="text-sm text-slate-400">16:9 (Yatay)</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-700 hover:border-teal-500/30 transition-colors">
                            <Subtitles className="text-slate-500 mb-3" size={24} />
                            <h4 className="font-bold text-white mb-1">Dil & Altyazı</h4>
                            <p className="text-sm text-slate-400">İngilizce Ses, TR Altyazı</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* 5. Evaluation & Documents - Dark Theme */}
      <section className="pb-24 bg-slate-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
            
            {/* Evaluation Criteria - Fixed Layout */}
            <div className="bg-slate-800 p-8 md:p-10 rounded-3xl shadow-2xl border border-slate-700">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
                     <div>
                        <h2 className="text-3xl font-black text-white mb-2">Değerlendirme Kriterleri</h2>
                        <p className="text-slate-400 font-light">Jüri puanlamasında esas alınacak ağırlıklar.</p>
                     </div>
                     <div className="bg-slate-900 px-4 py-2 rounded-lg border border-slate-700 shadow-sm text-xs font-bold text-slate-400 flex items-center gap-2 flex-shrink-0">
                         <HelpCircle size={16} className="text-amber-500"/> Puanlama Rehberi
                     </div>
                </div>

                <div className="relative pt-4 pb-4">
                     {/* Bar Chart Container */}
                     <div className="flex h-24 w-full rounded-2xl overflow-hidden shadow-inner bg-slate-900 border border-slate-700 mb-8">
                        {criteria.map((c, i) => (
                            <div
                                key={i}
                                style={{ width: `${c.percent}%` }}
                                className={`${c.color} h-full relative group transition-all duration-300 hover:brightness-110 flex flex-col items-center justify-center p-1 cursor-default`}
                            >
                                <span className="font-black text-white/95 text-xl md:text-3xl drop-shadow-md z-10 leading-none">%{c.percent}</span>
                                <span className="text-[9px] md:text-[10px] text-white/80 font-bold uppercase tracking-wider mt-1 text-center hidden sm:block truncate w-full px-1">{c.label}</span>
                                <div className="absolute top-0 bottom-0 left-0 w-px bg-white/10"></div>
                            </div>
                        ))}
                    </div>
                    
                    {/* Detailed Legend - Fixed Layout */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {criteria.map((c, i) => (
                             <div key={i} className={`flex items-center gap-3 bg-slate-900/50 p-3 rounded-xl border border-slate-700/50 ${c.ring}`}>
                                 <div className={`w-3 h-3 rounded-full ${c.color} shadow-[0_0_8px_currentColor] flex-shrink-0`}></div>
                                 <div className="flex flex-col">
                                    <span className={`text-xs font-bold ${c.text}`}>{c.label}</span>
                                    <span className="text-[10px] text-slate-500 font-medium">Etki Oranı: %{c.percent}</span>
                                 </div>
                             </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Documents */}
            <div>
                 <div className="flex items-center gap-3 mb-8">
                    <div className="h-10 w-1 bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                    <h2 className="text-3xl font-black text-white">Gerekli Belgeler</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                    {[
                        { name: "Yarışma Şartnamesi", size: "2.4 MB", type: "PDF" },
                        { name: "Veli İzin Belgesi", size: "367 KB", type: "PDF" },
                        { name: "KVKK Aydınlatma Metni", size: "180 KB", type: "PDF" },
                        { name: "Afiş ve Görseller", size: "15 MB", type: "ZIP" }
                    ].map((doc, i) => (
                        <button key={i} onClick={() => handleDownload(doc.name)} className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700 hover:border-rose-500/50 hover:bg-slate-800/80 transition-all flex items-center justify-between group text-left">
                            <div className="flex items-center gap-4">
                                <div className="bg-slate-900 p-4 rounded-xl group-hover:bg-rose-900/20 group-hover:text-rose-500 transition-colors text-slate-500 border border-slate-700">
                                    <FileText size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-base group-hover:text-rose-400 transition-colors">{doc.name}</h4>
                                    <p className="text-xs text-slate-500 font-medium mt-1">{doc.type} • {doc.size}</p>
                                </div>
                            </div>
                            <div className="w-10 h-10 rounded-full border border-slate-700 flex items-center justify-center group-hover:bg-rose-600 group-hover:border-rose-600 group-hover:text-white transition-all text-slate-500">
                                <Download size={20} />
                            </div>
                        </button>
                    ))}
                </div>
            </div>

        </div>
      </section>

      {/* 6. FAQ/Contact CTA - Consistent Dark Theme */}
      <section className="bg-slate-900 py-24 relative overflow-hidden text-white border-t border-slate-800">
          <div className="absolute inset-0 bg-gradient-to-t from-black via-slate-900 to-slate-900"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
             <div className="w-20 h-20 bg-amber-500/10 text-amber-500 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                  <MessageCircle size={40} />
             </div>
             
             <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">
                Aklınıza takılan sorular mı var?
             </h2>
             <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
                 Başvuru süreci, teknik detaylar ve daha fazlası için Sıkça Sorulan Sorular sayfamızı inceleyebilir veya bizimle iletişime geçebilirsiniz.
             </p>
             
             <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                 <Link to="/faq" className="px-8 py-4 bg-white text-slate-900 rounded-full font-bold hover:bg-amber-400 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] flex items-center gap-2">
                      Sıkça Sorulan Sorular <ArrowRight size={18}/>
                 </Link>
                 <a href="mailto:reflect_shoot@proton.me" className="px-8 py-4 bg-slate-800 text-slate-300 border border-slate-700 rounded-full font-bold hover:bg-slate-700 hover:text-white transition-all flex items-center gap-2">
                      <Mail size={18} /> Bize Yazın
                 </a>
             </div>
          </div>
      </section>
      
      <style>{`
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
            animation: fadeIn 0.8s ease-out forwards;
        }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
      `}</style>
    </div>
  );
};