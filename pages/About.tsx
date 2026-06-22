import React, { useState } from 'react';
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
  Subtitles,
  Lightbulb,
  XCircle,
  AlertCircle,
  Lock,
  Clock,
  FileCheck,
  Info,
  X,
  Sparkles,
  Smartphone,
  Volume2,
  ShieldAlert,
  Cpu
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { versesList, verseDetails, VERSE_SPLITTER } from '../data/verses';
import { useAppContext } from '../context/AppContext';

export const About: React.FC = () => {
  const { cmsLinks } = useAppContext();
  
  // Theme Modal State
  const [themeModal, setThemeModal] = useState<{ title: string; color: string; examples: string[] } | null>(null);

  const themeExamples = {
      hadith: [
          "Kolaylaştırınız, zorlaştırmayınız; müjdeleyiniz, nefret ettirmeyiniz.",
          "Ameller niyetlere göredir: Bir iyiliğin arkasındaki gizli niyetleri sorgulayan bir hikaye.",
          "Komşusu açken tok yatan bizden değildir: Modern şehir hayatında duyarsızlık ve sosyal sorumluluk.",
          "İşçiye ücretini teri kurumadan veriniz: Emek, hak ve adalet kavramı üzerine dramatik bir kurgu.",
          "Güzel söz sadakadır: İletişimsizliğin çözümü olarak nezaket ve üslup."
      ],
      sahabe: [
          "Mus'ab b. Umeyr: Lüksü ve konforu bir dava uğruna terk ediş (Modern uyarlama: Kariyer vs. İdealizm).",
          "Hz. Ömer'in Adaleti: Kendi yakınına bile taviz vermeyen bir adalet anlayışının günümüze yansıması.",
          "Hz. Ebu Bekir'in Sadakati: En zor zamanlarda dostunun yanında durabilmek (Sıddık olmak).",
          "Selman-ı Farisi'nin Arayışı: Hakikati bulmak için diyar diyar gezen bir gencin yolculuğu.",
          "Hz. Hatice'nin Vefası: Toplum dışlasa bile inandığı doğrunun ve eşinin yanında duran güçlü duruş."
      ]
  };

  const detailedCriteria = [
    {
      id: 1,
      title: "Senaryo & Anlatı Derinliği",
      color: "teal",
      icon: ScrollText,
      desc: "Bu kriterde eserin hikâye kurgusu ve anlatım gücü değerlendirilir.",
      questions: [
        "Hikâye başı–ortası–sonu olan anlamlı bir bütünlük sunuyor mu?",
        "İzleyiciyi düşünmeye sevk eden bir anlatı derinliği var mı?",
        "Olaylar veya sahneler arasında mantıklı bir akış bulunuyor mu?",
        "Anlatım, seçilen ayet/hadis/sahabe hikâyesini yüzeysel değil, yorumlayarak ele alıyor mu?"
      ],
      highScore: "Derinlikli, düşündüren, mesajı aceleye getirmeyen anlatılar.",
      lowScore: "Sadece mesajı söyleyen, hikâye kurmadan ilerleyen veya kopuk anlatılar."
    },
    {
      id: 2,
      title: "Tema & Kaynaklara Uygunluk",
      color: "amber",
      icon: BookOpen,
      desc: "Bu kriter, eserin seçilen dini/manevi kaynağa sadakatini ve doğru yorumunu ölçer.",
      questions: [
        "Seçilen ayet, hadis veya sahabe hikâyesi doğru bağlamda kullanılmış mı?",
        "Kaynak, anlamı çarpıtılmadan ve saygılı bir üslupla ele alınmış mı?",
        "Film, kaynağın verdiği ana mesajla uyumlu bir sonuç üretiyor mu?",
        "Metin, slogana indirgenmeden anlamlandırılmış mı?"
      ],
      highScore: "Kaynağı özüne sadık kalarak çağdaş bir yorumla aktaran eserler.",
      lowScore: "Kaynağı yüzeysel kullanan, bağlam dışı veya sadece dekor olarak kullanan eserler."
    },
    {
      id: 3,
      title: "Düşünsel & Manevi Mesaj",
      color: "purple",
      icon: Lightbulb,
      desc: "Bu kriter, filmin izleyicide bıraktığı felsefi ve manevi etkiyi değerlendirir.",
      questions: [
        "Film izleyicide tefekkür duygusu uyandırıyor mu?",
        "Mesaj, doğrudan dayatılmadan, izleyicinin kendi çıkarım yapmasına alan tanıyor mu?",
        "Film, insan–hayat–ahlak ilişkisine dair bir soru veya farkındalık oluşturuyor mu?",
        "Manevi mesaj, duygusal sömürüye kaçmadan aktarılmış mı?"
      ],
      highScore: "Sessiz ama etkili, izleyicinin zihninde kalan mesajlar.",
      lowScore: "Aşırı didaktik, vaaz tonunda veya tek boyutlu anlatımlar."
    },
    {
      id: 4,
      title: "Teknik Kalite & Sinematografi",
      color: "rose",
      icon: Film,
      desc: "Bu kriter, eserin görsel–işitsel kalitesini ve teknik yeterliliğini kapsar.",
      questions: [
        "Görüntü netliği, kadraj ve ışık kullanımı nasıl?",
        "Ses kalitesi ve anlaşılabilirlik yeterli mi?",
        "Kurgu ve sahne geçişlerinin akıcılığı sağlanmış mı?",
        "Yapay zekâ kullanılmışsa; üretimin tutarlılığı ve bütünlüğü var mı?"
      ],
      highScore: "Teknik unsurların hikâyeyi desteklediği, dikkat dağıtmadığı eserler.",
      lowScore: "Teknik sorunlar nedeniyle mesajın anlaşılmasını zorlaştıran eserler."
    }
  ];

  const handleDownload = (link: string) => {
    if (link) {
        window.open(link, "_blank");
    } else {
        alert("Link henüz eklenmemiş.");
    }
  };

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

  const getColorClasses = (color: string) => {
      switch(color) {
          case 'teal': return { bg: 'bg-teal-900/20', text: 'text-teal-400', border: 'border-teal-500/30', iconBg: 'bg-teal-500/20' };
          case 'amber': return { bg: 'bg-amber-900/20', text: 'text-amber-400', border: 'border-amber-500/30', iconBg: 'bg-amber-500/20' };
          case 'purple': return { bg: 'bg-purple-900/20', text: 'text-purple-400', border: 'border-purple-500/30', iconBg: 'bg-purple-500/20' };
          case 'rose': return { bg: 'bg-rose-900/20', text: 'text-rose-400', border: 'border-rose-500/30', iconBg: 'bg-rose-500/20' };
          default: return { bg: 'bg-slate-800', text: 'text-white', border: 'border-slate-700', iconBg: 'bg-slate-700' };
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
               Hakkında
             </span>
           </h1>
          <p className="text-xl md:text-2xl text-slate-300 font-light max-w-3xl mx-auto leading-relaxed animate-fadeIn delay-200">
            Gençliğin vizöründen kadim değerlerimizi modern sinema diliyle yorumlayan prestijli bir kısa film yarışması.
          </p>
          
          {/* Vision Document Download Button */}
          <div className="mt-10 flex flex-col items-center gap-6 animate-fadeIn delay-300">
              <button 
                onClick={() => handleDownload('https://assets.reflectandshoot.com/Vizyon_Belgesi.pdf')}
                className="group relative inline-flex items-center gap-4 px-8 py-4 bg-slate-900/50 hover:bg-slate-800 border border-amber-500/30 hover:border-amber-500 text-white rounded-full transition-all duration-300 shadow-[0_0_20px_rgba(245,158,11,0.1)] hover:shadow-[0_0_30px_rgba(245,158,11,0.3)] backdrop-blur-md"
              >
                  <div className="absolute inset-0 rounded-full bg-amber-500/5 group-hover:bg-amber-500/10 transition-colors"></div>
                  <FileText size={20} className="text-amber-500 relative z-10" />
                  <div className="text-left relative z-10">
                      <span className="block text-[9px] font-black text-amber-500/80 uppercase tracking-[0.15em] mb-0.5">Stratejik Plan</span>
                      <span className="block text-sm font-bold text-slate-100 group-hover:text-white">2026 Vizyon Belgesi</span>
                  </div>
                  <Download size={18} className="text-slate-400 group-hover:text-white transition-colors relative z-10 ml-2" />
              </button>

              <span className="inline-block px-4 py-1.5 rounded-full bg-slate-800/40 border border-slate-700/50 text-slate-400 text-xs font-medium backdrop-blur-sm">
                  Tüm süreç sitemizdeki kullanıcı paneli üzerinden yürütülür.
              </span>
          </div>
        </div>
      </div>

      {/* 2. Organizers Section - Dark Theme */}
      <section className="py-20 bg-slate-900 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-8">
                
                {/* School Card */}
                <div className="bg-slate-800 p-8 md:p-10 rounded-2xl shadow-xl border border-slate-700 hover:border-slate-600 transition-all duration-300">
                    <div className="flex flex-col sm:flex-row items-start gap-8 mb-8">
                        <div className="w-24 h-24 flex-shrink-0 flex items-center justify-center p-2 bg-white rounded-xl border border-slate-600 shadow-md">
                            <img src="https://assets.reflectandshoot.com/20113118_yeni_logo_konyaihl.png" alt="Konya Anadolu İHL" className="w-full h-full object-contain" />
                        </div>
                        <div>
                            <span className="inline-block px-3 py-1 bg-amber-900/30 border border-amber-500/30 text-amber-500 text-[10px] font-bold uppercase tracking-widest rounded-full mb-2">Düzenleyen Kurum</span>
                            <p className="text-2xl font-black text-white leading-tight mb-1">Konya Anadolu İmam Hatip Lisesi</p>
                            <p className="text-lg font-medium text-slate-400">Türkiye'nin Öncü Okulu</p>
                        </div>
                    </div>
                    <div className="w-full h-px bg-slate-700 mb-6"></div>
                    <div className="text-slate-300 leading-relaxed text-sm font-light">
                        <p>
                            Konya Anadolu İmam Hatip Lisesi, 1951’den bu yana Türkiye’nin en köklü ve güçlü eğitim kurumlarından biridir. Fen–sosyal bilimler programları, proje sınıfları ve kültür-sanat alanındaki çalışmalarıyla donanımlı, sorumluluk sahibi ve yüksek karakterli bireyler yetiştirir. Akademik başarıyı değerler eğitimiyle birleştirerek ülkemize pek çok alanda öncü mezunlar kazandırmayı hedefler.
                        </p>
                    </div>
                </div>

                {/* Sponsor Card */}
                <div className="bg-slate-800 p-8 md:p-10 rounded-2xl shadow-xl border border-slate-700 hover:border-slate-600 transition-all duration-300">
                    <div className="flex flex-col sm:flex-row items-start gap-8 mb-8">
                        <div className="w-24 h-24 flex-shrink-0 flex items-center justify-center p-2 bg-white rounded-xl border border-slate-600 shadow-md">
                            <img src="https://assets.reflectandshoot.com/Ekran%20g%C3%B6r%C3%BCnt%C3%BCs%C3%BC%202025-12-14%20203957.png" alt="TİMAV Vakfı" className="w-full h-full object-contain" />
                        </div>
                        <div>
                            <span className="inline-block px-3 py-1 bg-rose-900/30 border border-rose-500/30 text-rose-500 text-[10px] font-bold uppercase tracking-widest rounded-full mb-2">Ana Sponsor</span>
                            <p className="text-2xl font-black text-white leading-none mb-1">TİMAV</p>
                            <p className="text-lg font-medium text-slate-400">Türkiye İmam Hatipliler Vakfı</p>
                        </div>
                    </div>
                    <div className="w-full h-px bg-slate-700 mb-6"></div>
                    <div className="text-slate-300 leading-relaxed text-sm font-light">
                        <p>
                            Türkiye İmam Hatipliler Vakfı (TİMAV), 1994’ten bu yana imam hatip camiasının birlik, dayanışma ve gelişimine katkı sunmayı amaçlayan ülke çapında bir vakıf hareketidir. Milli ve manevi değerlere bağlı, donanımlı ve sorumlu gençlerin yetişmesi için burs, eğitim, kültür ve sosyal projeler yürütür; imam hatip öğrencileri ve mezunlarının Türkiye’nin kültür, eğitim ve düşünce dünyasında daha etkin yer almasını destekler.
                        </p>
                    </div>
                </div>

            </div>
        </div>
      </section>

      {/* 3. Themes Section - Dark Cinematic (Seamless Integration) */}
      <section className="py-24 bg-slate-900 relative overflow-visible">
        {/* Cinematic Backgrounds */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(30,41,59,0.5)_0%,rgba(2,6,23,1)_100%)] pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 pb-16">
          <div className="flex flex-col md:flex-row items-end justify-between mb-8 gap-6 pt-10 border-t border-slate-800/50">
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

          <div className="bg-amber-900/20 border-l-4 border-amber-500 p-4 mb-12 text-amber-200/80 text-sm font-medium">
              <Info size={16} className="inline mr-2 -mt-0.5"/>
              Aşağıdaki temalardan yalnızca biri seçilmelidir. Projeniz seçtiğiniz tema etrafında şekillenmelidir.
          </div>

          <div className="space-y-12">
            
            {/* Ayetler - Fixed Layout */}
            <div className="relative bg-slate-800 p-8 md:p-10 rounded-2xl shadow-2xl border-t-4 border-amber-500/50 overflow-visible">
               <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/cardboard-flat.png')] pointer-events-none"></div>
               
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
                   
                   <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                       {versesList.map((verse, idx) => (
                           <div key={idx} className="bg-slate-900/80 border border-slate-700 hover:border-amber-500/50 hover:bg-slate-900 transition-all cursor-default p-4 rounded-lg flex items-center justify-center text-center shadow-sm group relative overflow-visible hover:z-50">
                               <span className="font-medium text-slate-300 text-sm group-hover:text-white transition-colors">{verse}</span>
                               
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
                <div className="bg-slate-800 p-8 md:p-10 rounded-2xl shadow-2xl border border-slate-700 hover:border-teal-500/50 transition-colors group relative flex flex-col">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="bg-teal-900/30 p-4 rounded-xl text-teal-400 border border-teal-500/30 group-hover:scale-110 transition-transform">
                            <ScrollText size={32} />
                        </div>
                        <h3 className="text-2xl font-black text-white">Hadisler</h3>
                    </div>
                    <p className="text-slate-400 leading-relaxed mb-6 font-light">
                        Peygamber Efendimiz'in (s.a.v) sözlerinden, hayatından ve tavsiyelerinden yola çıkarak günümüze ışık tutan hikayeler.
                    </p>
                    <div className="bg-slate-900/50 p-4 rounded border-l-2 border-teal-500 text-xs text-slate-400 italic mb-6 flex-1">
                        "En güvenilir kaynaklardan seçilen rivayetler esastır."
                    </div>
                    <div className="pt-4 border-t border-slate-700">
                        <button 
                            onClick={() => setThemeModal({ title: "Hadislerden Örnek Fikirler", color: "teal", examples: themeExamples.hadith })}
                            className="text-teal-500 text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:text-teal-400 transition-colors"
                        >
                            Bu temadan örnek fikirler <ArrowRight size={12}/>
                        </button>
                    </div>
                </div>

                {/* Sahabeler */}
                <div className="bg-slate-800 p-8 md:p-10 rounded-2xl shadow-2xl border border-slate-700 hover:border-rose-500/50 transition-colors group relative flex flex-col">
                    <div className="flex items-center gap-4 mb-6">
                         <div className="bg-rose-900/30 p-4 rounded-xl text-rose-400 border border-rose-500/30 group-hover:scale-110 transition-transform">
                            <Users size={32} />
                        </div>
                        <h3 className="text-2xl font-black text-white">Sahabelerden Hikayeler</h3>
                    </div>
                    <p className="text-slate-400 leading-relaxed mb-6 font-light">
                        Asr-ı Saadet'in yıldızları olan sahabelerin hayatlarından, fedakarlıklarından ve erdemli duruşlarından kesitler.
                    </p>
                    <div className="bg-slate-900/50 p-4 rounded border-l-2 border-rose-500 text-xs text-slate-400 italic mb-6 flex-1">
                        "Tarihsel gerçekliğe sadık kalınarak dramatize edilmelidir."
                    </div>
                    <div className="pt-4 border-t border-slate-700">
                        <button 
                            onClick={() => setThemeModal({ title: "Sahabelerden Örnek Fikirler", color: "rose", examples: themeExamples.sahabe })}
                            className="text-rose-500 text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:text-rose-400 transition-colors"
                        >
                            Bu temadan örnek fikirler <ArrowRight size={12}/>
                        </button>
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
                            { key: "Kapsam:", text: "Bu yarışma, Türkiye genelindeki tüm lise öğrencilerine açıktır." },
                            { key: "Takım Yapısı:", text: "Takımlar en az 3, en fazla 6 öğrenciden oluşmalıdır. Bireysel başvuru kabul edilmez." },
                            { key: "Danışman Öğretmen:", text: "Her takımın, başvuru sürecini ve çalışmaları takip eden bir Danışman Öğretmeni bulunması zorunludur. Danışman Öğretmen, sistem üzerinden takım adına işlem yapar." },
                            { key: "Katılım Hakkı:", text: "Her öğrenci yalnızca bir (1) projede görev alabilir. Birden fazla projede yer aldığı tespit edilen öğrencilerin başvuruları değerlendirme dışı bırakılır." },
                            { key: "Dil & Altyazı:", text: "Proje dili İngilizce olmalıdır. Videolarda Türkçe altyazı kullanılması zorunludur." },
                            { key: "Başvuru Geçerliliği:", text: "Katılım koşulları sağlanmadan başvuru süreci tamamlanamaz. Koşullara aykırı başvurular, yarışmanın herhangi bir aşamasında değerlendirme dışı bırakılabilir." }
                        ].map((rule, idx) => (
                            <li key={idx} className="flex items-start">
                                <div className="w-6 h-6 rounded-full bg-rose-900/20 flex-shrink-0 flex items-center justify-center mt-0.5 mr-4 text-rose-500">
                                     <div className="w-2 h-2 rounded-full bg-current"></div>
                                </div>
                                <div>
                                    <p className="text-slate-300 font-light leading-relaxed">
                                        <strong className="text-white font-bold">{rule.key}</strong> {rule.text}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <div className="mt-8 pt-6 border-t border-slate-700 text-xs text-slate-500 flex items-center gap-2">
                        <AlertCircle size={14} /> Yarışma süreci, tüm katılımcılar için adil ve şeffaf bir değerlendirme sağlamak amacıyla bu koşullar çerçevesinde yürütülür.
                    </div>
                </div>

                {/* Technical Specs */}
                <div className="bg-slate-800 p-8 md:p-10 rounded-3xl shadow-xl border border-slate-700 flex flex-col h-full group hover:border-teal-900/50 transition-colors">
                     <div className="flex items-center gap-4 mb-8">
                        <div className="w-14 h-14 bg-teal-900/30 rounded-2xl flex items-center justify-center text-teal-400 group-hover:bg-teal-600 group-hover:text-white transition-colors border border-teal-500/20">
                             <Target size={28} />
                        </div>
                        <h2 className="text-2xl font-black text-white">Teknik Şartlar</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Resolution & Equipment */}
                        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-700 hover:border-teal-500/30 transition-colors">
                            <div className="flex items-center gap-2 mb-3">
                                <Monitor className="text-slate-500" size={20} />
                                <Smartphone className="text-slate-500" size={20} />
                            </div>
                            <h4 className="font-bold text-white mb-2">Çözünürlük & Ekipman</h4>
                            <p className="text-3xl font-black text-slate-300">1080p</p>
                            <p className="text-xs text-slate-500 mt-1 leading-tight">Profesyonel ekipman şart değil, mobil cihazlarla çekim serbesttir.</p>
                        </div>

                        {/* Duration & Size */}
                        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-700 hover:border-teal-500/30 transition-colors relative overflow-hidden">
                            <Film className="text-slate-500 mb-3" size={24} />
                            <h4 className="font-bold text-white mb-2">Format, Süre & Boyut</h4>
                            <p className="text-3xl font-black text-slate-300">3-8 Dk.</p>
                            <div className="text-xs text-slate-500 mt-1 space-y-1">
                                <p>MP4/MOV Formatı</p>
                                <p className="text-teal-500 font-bold">Max. 5 GB Dosya Boyutu</p>
                            </div>
                        </div>

                        {/* Visual & Audio Rules */}
                        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-700 hover:border-teal-500/30 transition-colors">
                            <div className="flex items-center gap-2 mb-3">
                                <Target className="text-slate-500" size={20} />
                                <Volume2 className="text-slate-500" size={20} />
                            </div>
                            <h4 className="font-bold text-white mb-2">Görüntü & Ses</h4>
                            <p className="text-3xl font-black text-slate-300">16:9</p>
                            <p className="text-xs text-slate-500 mt-1 leading-tight">Yatay format. Logo/Filigran yasaktır. Ses net ve anlaşılır olmalıdır.</p>
                        </div>

                        {/* Subs & Credits */}
                        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-700 hover:border-teal-500/30 transition-colors">
                            <Subtitles className="text-slate-500 mb-3" size={24} />
                            <h4 className="font-bold text-white mb-2">Altyazı & Jenerik</h4>
                            <p className="text-xl font-black text-slate-300">EN + TR</p>
                            <p className="text-xs text-slate-500 mt-1 leading-tight">Okunabilir ve kontrastlı altyazı. Jenerik ve isimler videonun sonunda olmalıdır.</p>
                        </div>
                    </div>

                    {/* Critical Notes */}
                    <div className="mt-6 space-y-3">
                        <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-900/10 border border-amber-500/20">
                            <ShieldAlert size={18} className="text-amber-500 flex-shrink-0 mt-0.5"/>
                            <div className="text-xs text-slate-400">
                                <strong className="text-amber-500 block mb-1">Telif & Müzik Uyarısı</strong>
                                Filmde kullanılan müzik, görsel ve sesler telif hakkı ihlali içermemelidir. Telifli eser kullanımı mevcutsa, eser sahibinden alınan yazılı ve resmi izin belgesi iletilmesi zorunludur.
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 rounded-xl bg-purple-900/10 border border-purple-500/20">
                            <Cpu size={18} className="text-purple-500 flex-shrink-0 mt-0.5"/>
                            <div className="text-xs text-slate-400">
                                <strong className="text-purple-500 block mb-1">Yapay Zeka Kategorisi</strong>
                                Görsel, ses veya metnin tamamı/büyük kısmı AI ile üretilmelidir. Kullanılan yöntem ve araçlar jüri tarafından değerlendirilir.
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 text-center">
                        <button onClick={() => document.getElementById('evaluation')?.scrollIntoView({behavior: 'smooth'})} className="text-teal-500 text-xs font-bold hover:underline">
                            Değerlendirme Kriterlerini Gör
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </section>

      {/* 5. Evaluation & Documents - Dark Theme */}
      <section id="evaluation" className="pb-24 bg-slate-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
            
            {/* Evaluation Criteria - Detailed Card Layout */}
            <div className="bg-slate-800 p-8 md:p-10 rounded-3xl shadow-2xl border border-slate-700">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                     <div>
                        <h2 className="text-3xl font-black text-white mb-2">Değerlendirme Kriterleri</h2>
                        <p className="text-slate-400 font-light text-lg">
                            Her eser, toplam <span className="text-white font-bold border-b border-rose-500/50">100 tam puan</span> üzerinden aşağıdaki 4 ana kriter ile değerlendirilir.
                        </p>
                     </div>
                     <div className="flex flex-col sm:flex-row gap-3">
                         <div className="bg-slate-900 px-4 py-2 rounded-lg border border-slate-700 shadow-sm text-xs font-bold text-slate-400 flex items-center gap-2">
                             <HelpCircle size={16} className="text-amber-500"/> Kriter Başına: 25 Puan
                         </div>
                         <div className="bg-emerald-900/20 px-4 py-2 rounded-lg border border-emerald-500/30 shadow-sm text-xs font-bold text-emerald-400 flex items-center gap-2">
                             <Target size={16}/> Toplam: 100 Puan
                         </div>
                     </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {detailedCriteria.map((item) => {
                        const style = getColorClasses(item.color);
                        return (
                            <div key={item.id} className={`bg-slate-900 rounded-3xl p-8 border ${style.border} relative overflow-hidden group`}>
                                {/* Header */}
                                <div className="flex items-center gap-4 mb-6 relative z-10">
                                    <div className={`p-3 rounded-2xl ${style.iconBg} ${style.text}`}>
                                        <item.icon size={28} />
                                    </div>
                                    <div>
                                        <h3 className={`text-xl font-black ${style.text}`}>{item.title}</h3>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-800 px-2 py-1 rounded inline-block mt-1 border border-slate-700">0–25 Puan</span>
                                    </div>
                                </div>

                                <p className="text-slate-400 text-sm mb-6 font-medium border-b border-slate-800 pb-4">
                                    {item.desc}
                                </p>

                                {/* Questions */}
                                <div className="space-y-3 mb-8">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                        <HelpCircle size={12}/> Jüri Soruları
                                    </h4>
                                    <ul className="space-y-2">
                                        {item.questions.map((q, i) => (
                                            <li key={i} className="text-slate-300 text-sm flex items-start leading-relaxed">
                                                <div className={`w-1.5 h-1.5 rounded-full ${style.text.replace('text-', 'bg-')} mt-1.5 mr-3 flex-shrink-0`}></div>
                                                {q}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Score Guide */}
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="bg-emerald-900/10 border-l-4 border-emerald-500 p-4 rounded-r-xl">
                                        <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase mb-1">
                                            <CheckCircle2 size={14} /> Yüksek Puan
                                        </div>
                                        <p className="text-emerald-100/70 text-xs leading-relaxed">{item.highScore}</p>
                                    </div>
                                    <div className="bg-rose-900/10 border-l-4 border-rose-500 p-4 rounded-r-xl">
                                        <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase mb-1">
                                            <XCircle size={14} /> Düşük Puan
                                        </div>
                                        <p className="text-rose-100/70 text-xs leading-relaxed">{item.lowScore}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Documents */}
            <div>
                 <div className="flex flex-col mb-8">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-1 bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                        <h2 className="text-3xl font-black text-white">Gerekli Belgeler</h2>
                    </div>
                    <p className="text-slate-400 text-sm mt-2 ml-4 flex items-center gap-2">
                        <FileCheck size={16} className="text-green-500"/>
                        Belgeler panel üzerinden sistem tarafından otomatik oluşturulur.
                    </p>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                    {[
                        { name: "Yarışma Şartnamesi", size: "PDF", signer: "Okumak İçin", desc: "Yeni sezon için güncellenecektir." },
                        { name: "Veli İzin Belgesi", size: "PDF", signer: "Veli İmzalar", desc: "Yeni Sezonda Güncellenecektir." },
                        { name: "KVKK Aydınlatma Metni", size: "PDF", signer: "Veli/Öğrenci İmzalar", desc: "Yeni Sezonda Güncellenecektir." },
                        { name: "Afiş ve Görseller", size: "ZIP", signer: "Tanıtım İçin", desc: "Yeni Sezonda Güncellenecektir." }
                    ].map((doc, i) => (
                        <div key={i} className="bg-slate-800/50 p-6 rounded-2xl shadow-inner border border-slate-700/50 flex items-center justify-between opacity-75 cursor-not-allowed group">
                            <div className="flex items-center gap-4">
                                <div className="bg-slate-900 p-4 rounded-xl text-slate-500 border border-slate-700">
                                    <Lock size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-400 text-base">{doc.name}</h4>
                                    <p className="text-xs text-amber-500/80 font-medium mt-1 leading-tight">
                                        {doc.desc}
                                    </p>
                                </div>
                            </div>
                            <div className="text-slate-500">
                                <FileText size={20} />
                            </div>
                        </div>
                    ))}
                    
                    {/* Locked Certificate */}
                    <div className="bg-slate-800/50 p-6 rounded-2xl shadow-inner border border-slate-700/50 flex items-center justify-between opacity-75 cursor-not-allowed">
                        <div className="flex items-center gap-4">
                            <div className="bg-slate-900 p-4 rounded-xl text-slate-600 border border-slate-700">
                                <Lock size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-400 text-base">Katılım Belgesi</h4>
                                <p className="text-xs text-slate-500 font-medium mt-1 leading-tight">
                                    22 Mayıs 2026'dan sonra Danışman Öğretmen Paneli üzerinden erişime açılır.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
      </section>

      {/* 6. NEW CTA SECTION - Replaces Contact Block */}
      <section className="bg-slate-950 py-24 relative overflow-hidden text-white border-t border-slate-800">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none"></div>
          
          <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
             
             <div className="mb-10 animate-bounce">
                 <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-600 shadow-[0_0_40px_rgba(225,29,72,0.6)]">
                     <Clock size={32} className="text-white"/>
                 </div>
             </div>

             <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
                Sahne Senin.
             </h2>
             <p className="text-2xl text-slate-300 mb-8 max-w-2xl mx-auto font-light leading-relaxed">
                 Başvuru işlemleri sadece <span className="text-white font-bold border-b-2 border-rose-500">10-15 dakika</span> sürer.
             </p>
             
             <div className="flex flex-col items-center justify-center gap-6">
                 <Link to="/apply" className="px-12 py-5 bg-gradient-to-r from-rose-600 to-rose-500 text-white rounded-full font-black text-lg hover:shadow-[0_0_50px_rgba(225,29,72,0.5)] transition-all transform hover:-translate-y-1 flex items-center gap-3">
                      BAŞVURUYA BAŞLA <ArrowRight size={24}/>
                 </Link>
                 
                 <div className="flex items-center gap-6 text-sm text-slate-500 font-medium mt-4">
                     <Link to="/faq" className="hover:text-white transition-colors">Sıkça Sorulan Sorular</Link>
                     <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                     <a href="mailto:reflect_shoot@proton.me" className="hover:text-white transition-colors">İletişim</a>
                 </div>
             </div>
          </div>
      </section>

      {/* THEME EXAMPLES MODAL */}
      {themeModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-fadeIn">
              <div className="bg-slate-900 w-full max-w-2xl rounded-2xl border border-slate-700 shadow-2xl relative overflow-hidden flex flex-col">
                  <div className={`p-6 border-b border-slate-700 ${themeModal.color === 'teal' ? 'bg-teal-900/20' : 'bg-rose-900/20'} flex justify-between items-center`}>
                      <h3 className={`text-xl font-bold ${themeModal.color === 'teal' ? 'text-teal-400' : 'text-rose-400'} flex items-center gap-2`}>
                          <Sparkles size={20} /> {themeModal.title}
                      </h3>
                      <button onClick={() => setThemeModal(null)} className="text-slate-400 hover:text-white transition-colors p-2 rounded-full hover:bg-slate-800">
                          <X size={20} />
                      </button>
                  </div>
                  
                  <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                      <ul className="space-y-4">
                          {themeModal.examples.map((example, idx) => (
                              <li key={idx} className="flex items-start text-slate-300 text-sm leading-relaxed">
                                  <span className={`w-2 h-2 rounded-full mt-2 mr-4 flex-shrink-0 ${themeModal.color === 'teal' ? 'bg-teal-500 shadow-[0_0_5px_#14b8a6]' : 'bg-rose-500 shadow-[0_0_5px_#f43f5e]'}`}></span>
                                  {example}
                              </li>
                          ))}
                      </ul>
                  </div>

                  <div className="p-6 border-t border-slate-800 bg-slate-950 flex justify-end">
                      <button onClick={() => setThemeModal(null)} className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold text-sm transition-colors border border-slate-700">
                          Kapat
                      </button>
                  </div>
              </div>
          </div>
      )}
      
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
        .delay-300 { animation-delay: 0.3s; }
      `}</style>
    </div>
  );
};