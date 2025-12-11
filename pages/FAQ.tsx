
import React, { useState, useRef } from 'react';
import { ChevronDown, Search, MessageCircle, HelpCircle, PenTool, Award, Users, MapPin, Phone, Mail, Send, CheckCircle2, AlertCircle, Cpu, Clock, Trophy, Sparkles } from 'lucide-react';
import { send } from '@emailjs/browser';

type FAQCategory = 'Genel' | 'Teknik' | 'Süreç & Teslim' | 'Ödüller & Değerlendirme';

interface FAQItem {
  id: number;
  category: FAQCategory;
  question: string;
  answer: string;
}

export const FAQ: React.FC = () => {
  const [openId, setOpenId] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<FAQCategory | 'Tümü'>('Tümü');
  const [searchQuery, setSearchQuery] = useState('');

  // Contact Form State
  const formRef = useRef<HTMLFormElement>(null);
  const [contactForm, setContactForm] = useState({ name: '', email: '', title: '', message: '' });
  const [isSent, setIsSent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleContactSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setIsSending(true);
      setErrorMessage('');

      const adminParams = {
          name: contactForm.name,
          email: contactForm.email,
          title: contactForm.title,
          message: contactForm.message
      };

      const autoReplyParams = {
          name: contactForm.name,
          email: contactForm.email,
          title: contactForm.title
      };

      send("service_o0zu33c", "template_4c8rmq9", adminParams, "RzmeddmQjAXFkTle4")
        .then(() => {
            return send("service_o0zu33c", "template_k7k7lcb", autoReplyParams, "RzmeddmQjAXFkTle4");
        })
        .then(() => {
            setIsSending(false);
            setIsSent(true);
            setContactForm({ name: '', email: '', title: '', message: '' });
            setTimeout(() => setIsSent(false), 5000);
        })
        .catch((error) => {
            console.error("EmailJS Error:", error);
            setErrorMessage('Gönderim sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.');
            setIsSending(false);
        });
  };

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setContactForm({ ...contactForm, [e.target.name]: e.target.value });
  };

  const faqs: FAQItem[] = [
    // GENEL
    { id: 1, category: 'Genel', question: "Başvuru süreci nasıl işler?", answer: "Başvurunuzu takım danışman öğretmeniniz ile birlikte oluşturur, takım bilgilerini ve gerekli belgeleri sisteme yüklersiniz. Başvurunuz onaylandıktan sonra video teslim tarihine kadar hazırlık sürecine geçersiniz." },
    { id: 2, category: 'Genel', question: "Takıma kaç kişi dahil olabilir?", answer: "Her takım 1 danışman öğretmen + 3 ila 6 öğrenci ile oluşturulabilir." },
    { id: 3, category: 'Genel', question: "Birden fazla kategoride başvuru yapabilir miyiz?", answer: "Hayır. Her takım yalnızca 1 kategori seçebilir: Canlı Çekim veya Yapay Zeka Animasyon." },
    { id: 4, category: 'Genel', question: "Takım adını sonradan değiştirebilir miyiz?", answer: "Hayır. Takım adı başvuru sırasında belirlenir ve daha sonra düzenlenemez." },
    { id: 5, category: 'Genel', question: "Hangi öğrenciler başvuru yapabilir?", answer: "Sadece Türkiye’de İmam Hatip Lisesi öğrencileri yarışmaya katılabilir." },
    { id: 6, category: 'Genel', question: "Başvuruyu iptal edersem yaptırım olur mu?", answer: "Hayır. Başvurunuzu iptal etmeniz durumunda herhangi bir yaptırım uygulanmaz." },

    // TEKNİK
    { id: 7, category: 'Teknik', question: "Video teknik şartları nelerdir?", answer: "Video formatı MP4 veya MOV, minimum çözünürlük 1920×1080, süre 3–8 dakika olmalıdır." },
    { id: 8, category: 'Teknik', question: "Canlı çekim kategorisinde telefon kamerası kullanmak serbest mi?", answer: "Evet. Telefon, DSLR veya profesyonel kamera kullanabilirsiniz. Önemli olan görüntü kalitesi ve teknik gerekliliklere uyumdur." },
    { id: 9, category: 'Teknik', question: "AI kategorisinde hangi araçları kullanabilirim?", answer: "Runway, Pika, ElevenLabs, D-ID, Sora benzeri üretim araçları serbesttir. Telif ihlali yapan, deepfake amaçlı veya etik dışı araçlar yasaktır." },
    { id: 10, category: 'Teknik', question: "Video çözünürülüğü minimum kaç olmalı?", answer: "En düşük 1920×1080 (Full HD) çözünürlük kabul edilir." },
    { id: 11, category: 'Teknik', question: "Videoda dış ses (narration) kullanabilir miyiz?", answer: "Evet. Dış ses kullanımında telif içermeyen veya kendi kaydettiğiniz sesler tercih edilmelidir." },

    // SÜREÇ & TESLİM
    { id: 12, category: 'Süreç & Teslim', question: "Teslim tarihini kaçırırsam ne olur?", answer: "Sistem kapanınca yükleme yapılamaz. Süre uzatımı yoktur. Bu nedenle teslim tarihinden önce yükleme yapmanız önemlidir." },
    { id: 13, category: 'Süreç & Teslim', question: "Finalist eğitimlerine katılım zorunlu mu?", answer: "Evet. Finalist eğitim programına tam katılım, sürecin bir parçasıdır ve final değerlendirmesinde önemlidir." },
    { id: 14, category: 'Süreç & Teslim', question: "Video yüklerken hata alırsam ne yapmalıyım?", answer: "Önce dosya boyutunu, formatını ve internet bağlantınızı kontrol edin. Sorun devam ederse “Bize Ulaşın” bölümünden teknik destek talebi oluşturun." },
    { id: 15, category: 'Süreç & Teslim', question: "Telefonla çekim yapabilir miyiz?", answer: "Evet. Çekim kalitesi yeterli olduğu sürece telefonla çekim serbesttir." },

    // ÖDÜLLER & DEĞERLENDİRME
    { id: 16, category: 'Ödüller & Değerlendirme', question: "Jüri değerlendirmesi hangi kriterlere göre yapılır?", answer: "Senaryo ve hikaye kurgusu, Temaya uygunluk, Teknik kalite (görüntü, ses, kurgu), Yaratıcılık ve Sinematografik anlatım gücü kriterlerine göre puanlama yapılır." },
    { id: 17, category: 'Ödüller & Değerlendirme', question: "Ödüller nakit olarak mı veriliyor?", answer: "Evet. Ödüller yarışma sonunda takımlara nakdi olarak teslim edilir." },
    { id: 18, category: 'Ödüller & Değerlendirme', question: "Ödüller takım üyeleri arasında nasıl paylaştırılıyor?", answer: "Ödül tutarı takımın kendisine verilir. Paylaşım, takım öğrencileri ve danışman öğretmenin kendi içinde yapacağı bir tercihtir." },
    { id: 19, category: 'Ödüller & Değerlendirme', question: "AI kategorisinde hangi araçları kullanamayız?", answer: "Telif hakkı ihlali yapan, güvenlik riski taşıyan veya etik dışı içerik üreten modeller yasaktır. Ayrıca politik içerik, yüz manipülasyonu veya deepfake türü üretimler kabul edilmez." }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = activeCategory === 'Tümü' || faq.category === activeCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFAQ = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  const categories = [
      { id: 'Tümü', icon: Sparkles },
      { id: 'Genel', icon: Users },
      { id: 'Teknik', icon: Cpu },
      { id: 'Süreç & Teslim', icon: Clock },
      { id: 'Ödüller & Değerlendirme', icon: Trophy },
  ];

  const getButtonClass = (catId: string, isActive: boolean) => {
      const baseClass = "flex items-center px-6 py-3 rounded-full font-bold text-sm transition-all duration-300 transform hover:scale-105 border shadow-lg";
      
      // Default / Inactive
      let styleClass = "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white";

      if (isActive) {
          switch(catId) {
            case 'Genel': 
                styleClass = "bg-blue-600 text-white border-blue-400 shadow-blue-500/30";
                break;
            case 'Teknik': 
                styleClass = "bg-purple-600 text-white border-purple-400 shadow-purple-500/30";
                break;
            case 'Süreç & Teslim': 
                styleClass = "bg-amber-500 text-slate-900 border-amber-300 shadow-amber-500/30";
                break;
            case 'Ödüller & Değerlendirme': 
                styleClass = "bg-emerald-600 text-white border-emerald-400 shadow-emerald-500/30";
                break;
            case 'Tümü': 
            default: 
                styleClass = "bg-slate-200 text-slate-900 border-white shadow-white/10";
                break;
          }
      } else {
         // Specific Colors for Inactive States (Subtle)
         switch(catId) {
            case 'Genel': styleClass = "bg-blue-900/10 text-blue-400 border-blue-900/30 hover:bg-blue-900/30"; break;
            case 'Teknik': styleClass = "bg-purple-900/10 text-purple-400 border-purple-900/30 hover:bg-purple-900/30"; break;
            case 'Süreç & Teslim': styleClass = "bg-amber-900/10 text-amber-400 border-amber-900/30 hover:bg-amber-900/30"; break;
            case 'Ödüller & Değerlendirme': styleClass = "bg-emerald-900/10 text-emerald-400 border-emerald-900/30 hover:bg-emerald-900/30"; break;
            case 'Tümü': styleClass = "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-white"; break;
         }
      }
      
      return `${baseClass} ${styleClass}`;
  };

  const getCategoryStyles = (cat: FAQCategory) => {
      switch(cat) {
          case 'Genel': return {
              bg: 'bg-blue-900/20',
              text: 'text-blue-400',
              border: 'group-hover:border-blue-500/50',
              icon: Users
          };
          case 'Teknik': return {
              bg: 'bg-purple-900/20',
              text: 'text-purple-400',
              border: 'group-hover:border-purple-500/50',
              icon: Cpu
          };
          case 'Süreç & Teslim': return {
              bg: 'bg-amber-900/20',
              text: 'text-amber-400',
              border: 'group-hover:border-amber-500/50',
              icon: Clock
          };
          case 'Ödüller & Değerlendirme': return {
              bg: 'bg-emerald-900/20',
              text: 'text-emerald-400',
              border: 'group-hover:border-emerald-500/50',
              icon: Trophy
          };
          default: return {
              bg: 'bg-slate-800',
              text: 'text-slate-400',
              border: 'group-hover:border-slate-500',
              icon: HelpCircle
          };
      }
  };

  return (
    <div className="bg-slate-900 min-h-screen font-sans relative overflow-hidden">
      
      {/* 1. Cinematic Hero Section */}
      <div className="bg-gradient-to-b from-rose-950 via-slate-900 to-slate-950 text-white pt-32 pb-32 relative overflow-hidden shadow-2xl z-10">
        {/* Texture & Icons */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[500px] bg-rose-500/10 blur-[120px] rounded-full pointer-events-none mix-blend-screen"></div>

        <div className="max-w-4xl mx-auto text-center animate-fadeIn relative z-10 px-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold tracking-[0.2em] uppercase mb-6 shadow-[0_0_15px_rgba(245,158,11,0.2)] backdrop-blur-sm">
                <HelpCircle size={14} /> YAPIM OFİSİ
            </div>
            <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tight animate-fadeIn delay-100">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-500 to-amber-300 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                  Sık Sorulan Sorular
                </span>
            </h1>
            
            <div className="relative max-w-2xl mx-auto animate-fadeIn delay-200">
                <input 
                    type="text" 
                    placeholder="Bir soru arayın... (Örn: Video süresi, telif, ödül)" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-14 pr-6 py-5 rounded-full border border-rose-800/50 bg-slate-900/80 backdrop-blur-md text-white focus:ring-4 focus:ring-rose-500/30 focus:border-rose-500 outline-none text-lg shadow-2xl transition-all placeholder-rose-200/50 font-medium"
                />
                <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-rose-300/70" size={24} />
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 -mt-24">
        
        {/* Categories Tabs - Moved Here floating over the sections */}
        <div className="flex flex-wrap justify-center gap-4 mb-16 animate-fadeIn delay-300">
            {categories.map((cat) => (
                <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id as any)}
                    className={getButtonClass(cat.id, activeCategory === cat.id)}
                >
                    <cat.icon size={18} className={`mr-2 ${activeCategory === cat.id ? (cat.id === 'Süreç & Teslim' || cat.id === 'Tümü' ? 'text-slate-900' : 'text-white') : ''}`} />
                    {cat.id}
                </button>
            ))}
        </div>

        {/* Grid of Cards */}
        <div className="max-w-5xl mx-auto mb-24">
            <div className="grid md:grid-cols-2 gap-6">
                {filteredFaqs.length > 0 ? (
                    filteredFaqs.map((faq) => {
                        const style = getCategoryStyles(faq.category);
                        const isOpen = openId === faq.id;
                        
                        return (
                            <div 
                                key={faq.id} 
                                className={`bg-slate-900/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-800 transition-all duration-300 cursor-pointer group hover:-translate-y-1 ${style.border} ${isOpen ? 'ring-1 ring-slate-600' : ''}`}
                                onClick={() => toggleFAQ(faq.id)}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className={`p-3 rounded-xl mt-1 transition-colors ${style.bg} ${style.text}`}>
                                            <style.icon size={22}/>
                                        </div>
                                        <div>
                                            <span className={`text-[10px] font-black uppercase tracking-widest mb-2 block ${style.text} opacity-80`}>{faq.category}</span>
                                            <h3 className="text-lg font-bold text-slate-200 group-hover:text-white transition-colors leading-snug">
                                                {faq.question}
                                            </h3>
                                        </div>
                                    </div>
                                    <div className={`transform transition-transform duration-300 mt-2 ${isOpen ? 'rotate-180 text-white' : 'text-slate-600'}`}>
                                        <ChevronDown size={20} />
                                    </div>
                                </div>
                                
                                <div 
                                    className={`overflow-hidden transition-all duration-500 ease-in-out ${
                                        isOpen ? 'max-h-60 opacity-100 mt-5' : 'max-h-0 opacity-0'
                                    }`}
                                >
                                    <p className="text-white leading-relaxed border-t border-slate-800 pt-5 text-sm md:text-base font-light">
                                        {faq.answer}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="col-span-2 text-center py-20 bg-slate-900/50 rounded-3xl border border-slate-800">
                        <Search size={48} className="mx-auto text-slate-700 mb-4" />
                        <p className="text-slate-400 text-lg font-medium">Aradığınız kriterlere uygun sonuç bulunamadı.</p>
                        <button onClick={() => {setSearchQuery(''); setActiveCategory('Tümü')}} className="mt-4 text-teal-400 hover:text-teal-300 font-bold underline">Filtreleri Temizle</button>
                    </div>
                )}
            </div>
        </div>

        {/* Contact Section */}
        <div className="bg-slate-900 border-t border-slate-800 py-24 relative overflow-hidden rounded-t-[3rem]">
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-950"></div>
            
            <div className="max-w-6xl mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <div className="w-20 h-20 bg-rose-900/20 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-rose-900/50 shadow-[0_0_30px_rgba(225,29,72,0.15)]">
                        <MessageCircle size={36} />
                    </div>
                    <h2 className="text-4xl font-black text-white mb-4">Bize Ulaşın</h2>
                    <p className="text-slate-400 max-w-xl mx-auto text-lg font-light">
                        Aradığınız cevabı bulamadıysanız, iletişim formunu kullanarak veya doğrudan adresimizi ziyaret ederek bize ulaşabilirsiniz.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-12 items-start">
                    
                    {/* Contact Info Card */}
                    <div className="bg-slate-800/50 p-10 rounded-3xl border border-slate-700 shadow-xl backdrop-blur-sm h-full">
                        <h3 className="text-xl font-bold text-white mb-8 border-b border-slate-700 pb-4">İletişim Bilgileri</h3>
                        
                        <div className="space-y-8">
                            <div className="flex items-start gap-5 group">
                                <div className="bg-slate-900 p-4 rounded-2xl shadow-sm text-teal-500 border border-slate-700 group-hover:border-teal-500/50 transition-colors">
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-sm uppercase tracking-wide opacity-60 mb-1">Adres</h4>
                                    <p className="text-slate-300 leading-relaxed font-light">
                                        Şemsi Tebrizi Mah. Vali İzzetbey Cd.,<br/> 
                                        Bölüm Sk. No:2, 42050<br/> 
                                        Karatay / Konya
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-5 group">
                                <div className="bg-slate-900 p-4 rounded-2xl shadow-sm text-teal-500 border border-slate-700 group-hover:border-teal-500/50 transition-colors">
                                    <Phone size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-sm uppercase tracking-wide opacity-60 mb-1">Telefon</h4>
                                    <p className="text-slate-300 font-light">
                                        (0332) 351 28 02
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-5 group">
                                <div className="bg-slate-900 p-4 rounded-2xl shadow-sm text-teal-500 border border-slate-700 group-hover:border-teal-500/50 transition-colors">
                                    <Mail size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-sm uppercase tracking-wide opacity-60 mb-1">E-posta</h4>
                                    <a href="mailto:reflect_shoot@proton.me" className="text-teal-400 hover:text-teal-300 transition-colors block font-medium">
                                        reflect_shoot@proton.me
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 pt-8 border-t border-slate-700">
                             <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700">
                                 <p className="text-xs text-slate-500 text-center">
                                     Mesai Saatleri: Hafta içi 09:00 - 17:00
                                 </p>
                             </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-slate-800 p-10 rounded-3xl border border-slate-700 shadow-2xl relative overflow-hidden">
                        {isSent && (
                           <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-md z-20 flex flex-col items-center justify-center animate-fadeIn text-center p-8">
                                <div className="w-20 h-20 bg-teal-900/30 text-teal-400 rounded-full flex items-center justify-center mb-6 border border-teal-500/30 shadow-[0_0_30px_rgba(20,184,166,0.2)]">
                                   <CheckCircle2 size={40} />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Mesajınız Alındı!</h3>
                                <p className="text-slate-400">Ekibimiz en kısa sürede size dönüş sağlayacaktır.</p>
                           </div>
                        )}

                        <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3 border-b border-slate-700 pb-4">
                           <PenTool size={20} className="text-rose-500"/> İletişim Formu
                        </h3>
                        
                        {errorMessage && (
                            <div className="bg-red-900/20 text-red-400 p-4 rounded-xl mb-6 text-sm flex items-start border border-red-900/50">
                                <AlertCircle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                                <span className="break-words w-full">{errorMessage}</span>
                            </div>
                        )}
                        
                        <form ref={formRef} onSubmit={handleContactSubmit} className="space-y-5">
                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Ad Soyad</label>
                                    <input 
                                       name="name"
                                       value={contactForm.name}
                                       onChange={handleContactChange}
                                       required
                                       className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all text-white placeholder-slate-600 focus:bg-slate-950"
                                       placeholder="Adınız"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">E-posta</label>
                                    <input 
                                       name="email"
                                       type="email"
                                       value={contactForm.email}
                                       onChange={handleContactChange}
                                       required
                                       className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all text-white placeholder-slate-600 focus:bg-slate-950"
                                       placeholder="mail@ornek.com"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Konu</label>
                                <select 
                                   name="title"
                                   value={contactForm.title}
                                   onChange={handleContactChange}
                                   required
                                   className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 text-white focus:bg-slate-950"
                                >
                                    <option value="" className="text-slate-500">Seçiniz...</option>
                                    <option value="Başvuru Sorunu">Başvuru Sorunu</option>
                                    <option value="Teknik Destek">Teknik Destek</option>
                                    <option value="Öneri / İstek">Öneri / İstek</option>
                                    <option value="Diğer">Diğer</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Mesajınız</label>
                                <textarea 
                                   name="message"
                                   value={contactForm.message}
                                   onChange={handleContactChange}
                                   required
                                   rows={4}
                                   className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 resize-none transition-all text-white placeholder-slate-600 focus:bg-slate-950"
                                   placeholder="Sorunuzu detaylı bir şekilde yazınız..."
                                ></textarea>
                            </div>

                            <button 
                               type="submit" 
                               disabled={isSending}
                               className="w-full bg-gradient-to-r from-rose-700 to-rose-600 hover:from-rose-600 hover:to-rose-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-rose-900/20 transform hover:-translate-y-1 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                            >
                                {isSending ? (
                                    <><div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div> Gönderiliyor...</>
                                ) : (
                                    <><Send size={20} /> Mesajı Gönder</>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
      </div>
      
      <style>{`
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
            animation: fadeIn 0.5s ease-out forwards;
        }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
      `}</style>
    </div>
  );
};
