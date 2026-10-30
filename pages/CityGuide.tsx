import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Camera, Train, Utensils, Bed, Compass, Landmark, Bus, Info, CloudSun, ShoppingBag, Thermometer, Shirt, Map, Clock, Navigation, Wifi, BatteryCharging, Phone, X, AlertCircle, Footprints, History, Coffee, Moon, ExternalLink, Aperture, CheckSquare, Share2, Ticket, ArrowRight, MapPin, Trophy, Cpu, Users as UsersIcon } from 'lucide-react';
import {
  touristLocations,
  itineraries,
  travelTasks,
  type TouristLocation,
} from './city-guide/cityGuideData';

export const CityGuide: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState<TouristLocation | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [checkedTasks, setCheckedTasks] = useState<number[]>([]);
  
  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleTask = (index: number) => {
      if (checkedTasks.includes(index)) {
          setCheckedTasks(checkedTasks.filter(i => i !== index));
      } else {
          setCheckedTasks([...checkedTasks, index]);
      }
  };

  return (
    <div className="bg-slate-950 min-h-screen font-sans selection:bg-amber-500 selection:text-black pb-24">
      
      {/* 1. Hero Section (VIDEO BACKGROUND) */}
      <div className="relative h-[75vh] w-full overflow-hidden">
        {/* Video Background */}
        <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="absolute inset-0 w-full h-full object-cover"
            poster="https://assets.reflectandshoot.com/city_guide/Konya_City_Collage.jpg" // Fallback
        >
            <source src="https://assets.reflectandshoot.com/city_guide/Konya_tanitim_filmi.mp4" type="video/mp4" />
        </video>

        {/* Overlay Gradients */}
        <div className="absolute inset-0 bg-slate-950/60"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/90"></div>

        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 animate-fadeIn">
           <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-bold tracking-[0.25em] uppercase mb-6 backdrop-blur-md">
              <Compass size={14} /> Finalist Rehberi
           </div>
           <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter mb-6 drop-shadow-2xl">
              KONYA
           </h1>
           <p className="text-xl md:text-2xl text-slate-200 max-w-2xl mx-auto font-light leading-relaxed drop-shadow-lg">
              Konya Bekliyor! <span className="text-amber-400 font-medium">Reflect&amp;Shoot</span> etkinlikleri için hazırız. <br/>
              İşte şehri tam anlamıyla yaşamak için bir rehber.
           </p>

           {/* Quick Nav */}
           <div className="mt-10 flex flex-wrap justify-center gap-2 md:gap-4">
              {[
                  { id: 'weather', label: 'Bavul & Hava', icon: CloudSun },
                  { id: 'story', label: 'Şehrin Ruhu', icon: History },
                  { id: 'itineraries', label: 'Hazır Rotalar', icon: Footprints },
                  { id: 'locations', label: 'Gezilecek Yerler', icon: Map },
                  { id: 'tasks', label: 'Gezgin Checklist', icon: CheckSquare },
                  { id: 'survival', label: 'Pratik Bilgiler', icon: Info },
              ].map((item) => (
                  <button type="button" 
                    key={item.id} 
                    onClick={() => scrollTo(item.id)}
                    className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-xl bg-slate-900/60 hover:bg-white hover:text-black text-white border border-white/10 backdrop-blur-md transition-all duration-300 font-bold text-xs md:text-sm group"
                  >
                      <item.icon size={16} className="group-hover:text-rose-600 transition-colors" /> {item.label}
                  </button>
              ))}
           </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20 space-y-24">
          
          {/* 2. Weather & Prep Widget */}
          <section id="weather" className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 scroll-mt-32">
              <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl font-bold text-white mb-2 flex items-center justify-center md:justify-start gap-3">
                      <Thermometer className="text-amber-500"/> İlkbaharda Konya
                  </h3>
                  <p className="text-slate-400 text-sm">Aşağıdaki değerler ilkbahar ortalamalarıdır; etkinlik tarihi belli olduğunda güncellenecektir.</p>
              </div>
              
              <div className="flex gap-8 items-center border-x border-slate-800 px-8 w-full md:w-auto justify-center md:justify-start">
                  <div className="text-center">
                      <span className="block text-3xl font-black text-white">22°C</span>
                      <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">Gündüz</span>
                  </div>
                  <div className="text-center">
                      <span className="block text-3xl font-black text-slate-400">12°C</span>
                      <span className="text-xs text-blue-400 font-bold uppercase tracking-wider">Gece</span>
                  </div>
              </div>

              <div className="flex-1 w-full md:w-auto">
                  <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 flex gap-4 items-start">
                      <div className="bg-slate-800 p-2 rounded-lg text-slate-300 flex-shrink-0">
                          <Shirt size={20} />
                      </div>
                      <div>
                          <h4 className="text-white font-bold text-sm mb-1">Bavul Tavsiyesi</h4>
                          <p className="text-xs text-slate-400 leading-relaxed">
                              Etkinlik için şık kıyafetlerinizi (takım elbise/elbise) unutmayın. Ancak akşamları serin olabilir, şehir turu için yanınıza mutlaka bir <strong>hırka veya ince mont</strong> alın.
                          </p>
                      </div>
                  </div>
              </div>
          </section>

          {/* 3. Storytelling Section */}
          <section id="story" className="scroll-mt-32">
              <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center">
                  <div className="flex-1 space-y-6 text-center md:text-left">
                      <div className="inline-flex items-center gap-2 text-rose-500 font-bold uppercase tracking-widest text-xs justify-center md:justify-start">
                          <Landmark size={14}/> Tarihsel Bağlam
                      </div>
                      <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
                          Selçuklu'nun <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-200">Başkenti</span>
                      </h2>
                      <p className="text-lg text-slate-300 leading-relaxed">
                          Konya sadece bir şehir değil, bir medeniyet hafızasıdır. Mevlana Celaleddin-i Rumi ve Şems-i Tebrizi'nin buluştuğu, "Gel" çağrısının yankılandığı topraklardasınız. 
                      </p>
                      <p className="text-sm text-slate-400 leading-relaxed">
                          Film festivaline geldiğiniz bu şehirde, her sokak başında Selçuklu mimarisinin geometrik zarafetini ve sufilik geleneğinin huzurunu hissedeceksiniz. Hikayelerinizi kurgularken bu atmosferden ilham alın.
                      </p>
                  </div>
                  <div className="flex-1 relative w-full">
                      <div className="absolute inset-0 bg-amber-500 blur-[100px] opacity-20 rounded-full"></div>
                      <div className="relative h-full min-h-[300px] md:min-h-[400px] rounded-[2rem] overflow-hidden shadow-2xl border border-slate-700 group">
                          <img 
                            src="https://assets.reflectandshoot.com/city_guide/baskent.png" 
                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                            alt="Selçuklu Başkenti"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60"></div>
                      </div>
                  </div>
              </div>
          </section>

          {/* 4. Itineraries */}
          <section id="itineraries" className="scroll-mt-32">
              <div className="text-center mb-12">
                  <h2 className="text-3xl font-black text-white mb-4">Sizin İçin Hazırladığımız Rotalar</h2>
                  <p className="text-slate-400">Vaktiniz kısıtlı mı? İşte festival programına sıkıştırabileceğiniz en iyi planlar.</p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                  {itineraries.map((route, i) => (
                      <div key={i} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl hover:border-slate-600 transition-all group">
                          <div className={`w-12 h-12 rounded-xl bg-slate-950 flex items-center justify-center mb-6 ${route.color} group-hover:scale-110 transition-transform`}>
                              <route.icon size={24} />
                          </div>
                          <h3 className="text-xl font-bold text-white mb-2">{route.title}</h3>
                          <p className="text-xs text-slate-500 mb-6">{route.desc}</p>
                          <ul className="space-y-3">
                              {route.steps.map((step, k) => (
                                  <li key={k} className="flex items-center gap-3 text-sm text-slate-300">
                                      <div className="w-1.5 h-1.5 rounded-full bg-slate-600"></div>
                                      {step}
                                  </li>
                              ))}
                          </ul>
                      </div>
                  ))}
              </div>
          </section>

          {/* 5. Locations (Interactive Modal) */}
          <section id="locations" className="scroll-mt-32">
              <div className="mb-16 text-center">
                  <h2 className="text-4xl font-black text-white tracking-tight flex items-center justify-center gap-3">
                      <Map className="text-rose-500" /> Gezi Rotaları
                  </h2>
                  <p className="text-slate-400 mt-4 text-lg font-light max-w-2xl mx-auto">
                      Etkinlik öncesi veya sonrası keşfedebileceğiniz en popüler noktalar. Detaylar için kartlara tıklayın.
                  </p>
              </div>

              {/* MAP EMBED REMOVED as per request */}

              <div className="space-y-16 md:space-y-20">
                  {touristLocations.map((loc, idx) => (
                      <div key={idx} className={`flex flex-col lg:flex-row gap-10 items-center ${idx % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                          {/* Image Side */}
                          <div className="w-full lg:w-1/2 relative group cursor-pointer" onClick={() => setSelectedLocation(loc)}>
                              <div className="absolute inset-0 bg-amber-500 rounded-[2rem] blur opacity-10 group-hover:opacity-20 transition-opacity duration-500"></div>
                              <div className="relative rounded-[2rem] overflow-hidden border border-slate-800 shadow-2xl aspect-video lg:aspect-[4/3]">
                                  <img src={loc.image} alt={loc.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60"></div>
                                  
                                  <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
                                      {loc.tags.map((tag, i) => (
                                          <span key={i} className="px-3 py-1 bg-slate-900/80 backdrop-blur-sm border border-slate-700 text-slate-300 text-[10px] font-bold uppercase tracking-wider rounded-full">
                                              {tag}
                                          </span>
                                      ))}
                                  </div>
                                  
                                  {/* Hover Hint */}
                                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px]">
                                      <span className="bg-white text-black px-6 py-3 rounded-full font-bold text-sm transform translate-y-4 group-hover:translate-y-0 transition-transform">Detayları İncele</span>
                                  </div>
                              </div>
                          </div>

                          {/* Content Side */}
                          <div className="w-full lg:w-1/2 space-y-6 text-center lg:text-left">
                              <div>
                                  <h3 className="text-3xl font-black text-white mb-2">{loc.title}</h3>
                                  <p className="text-rose-500 font-bold text-sm uppercase tracking-widest">{loc.subtitle}</p>
                              </div>
                              
                              <p className="text-slate-300 text-lg leading-relaxed font-light border-l-0 lg:border-l-4 border-slate-800 lg:pl-6">
                                  {loc.description}
                              </p>

                              <button type="button" 
                                onClick={() => setSelectedLocation(loc)}
                                className="text-amber-500 text-sm font-bold flex items-center gap-2 hover:gap-3 transition-all group justify-center lg:justify-start w-full lg:w-auto"
                              >
                                  Ziyaret Detaylarını Gör <Navigation size={16} />
                              </button>
                          </div>
                      </div>
                  ))}
              </div>
          </section>

          {/* ... Rest of the sections remain unchanged ... */}
          {/* 5.5 Checklist, 6. Food, 7. Survival, 8. Souvenirs, 9. Accommodation */}
          <section id="tasks" className="scroll-mt-32">
              <div className="bg-gradient-to-r from-rose-900/20 to-slate-900 border border-rose-900/30 rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-[80px] -mr-20 -mt-20"></div>
                  
                  <div className="flex flex-col md:flex-row gap-10 items-start relative z-10">
                      <div className="flex-1 text-center md:text-left w-full">
                          <h2 className="text-3xl font-black text-white mb-4 flex items-center justify-center md:justify-start gap-3">
                              <CheckSquare className="text-rose-500"/> Festival Görevleri
                          </h2>
                          <p className="text-slate-400 mb-6 font-light">
                              Konya gezinizi unutulmaz kılacak küçük bir meydan okuma listesi. Hepsini tamamlayabilecek misin?
                          </p>
                          <div className="inline-flex items-center gap-2 bg-slate-900 border border-slate-700 px-4 py-2 rounded-xl text-slate-300 text-xs font-bold font-mono">
                              <Share2 size={14}/> #reflectandshoot
                          </div>
                      </div>

                      <div className="flex-1 w-full bg-slate-900/50 rounded-2xl border border-slate-700 p-6">
                          <div className="space-y-4">
                              {travelTasks.map((task, index) => (
                                  <div 
                                    key={index} 
                                    onClick={() => toggleTask(index)}
                                    className={`flex items-start gap-4 p-3 rounded-xl cursor-pointer transition-all border ${checkedTasks.includes(index) ? 'bg-green-900/20 border-green-500/50' : 'bg-slate-950 border-slate-800 hover:border-slate-600'}`}
                                  >
                                      <div className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 border transition-colors ${checkedTasks.includes(index) ? 'bg-green-500 border-green-500' : 'border-slate-600'}`}>
                                          {checkedTasks.includes(index) && <X size={16} className="text-white rotate-45" />} {/* Checkmark variant */}
                                      </div>
                                      <span className={`text-sm ${checkedTasks.includes(index) ? 'text-slate-400 line-through' : 'text-slate-200'}`}>
                                          {task}
                                      </span>
                                  </div>
                              ))}
                          </div>
                          
                          {checkedTasks.length === travelTasks.length && (
                              <div className="mt-6 p-4 bg-amber-500 text-black font-bold text-center rounded-xl animate-pulse">
                                  Tebrikler! Gerçek bir Konya gezgini oldun! 🏆
                              </div>
                          )}
                      </div>
                  </div>
              </div>
          </section>

          <section id="food" className="scroll-mt-32">
              <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 md:p-16 relative overflow-hidden">
                  <div className="relative z-10 grid md:grid-cols-2 gap-12">
                      <div className="space-y-8">
                          <div className="text-center md:text-left">
                              <h2 className="text-4xl font-black text-white tracking-tight flex items-center justify-center md:justify-start gap-3 mb-4">
                                  <Utensils className="text-amber-500" /> Lezzet Ritüelleri
                              </h2>
                              <p className="text-slate-400 text-lg">
                                  Konya mutfağı sadece yemek değil, bir kültürdür.
                              </p>
                          </div>
                          
                          <div className="space-y-6">
                              <div className="bg-slate-950/50 p-6 rounded-2xl border border-slate-800">
                                  <div className="flex justify-between items-start mb-2">
                                      <h4 className="text-white font-bold text-lg">Etliekmek</h4>
                                      <span className="bg-amber-500/10 text-amber-500 text-[10px] px-2 py-1 rounded border border-amber-500/20">ÖĞLE YEMEĞİ</span>
                                  </div>
                                  <p className="text-slate-400 text-sm mb-4">Klasik. İnce, gevrek ve odun ateşinde.</p>
                                  <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-900 p-3 rounded-lg">
                                      <Info size={14} className="text-blue-500 flex-shrink-0"/> 
                                      <span><strong>Ritüel:</strong> Elle yenir, yanında köpüklü ayran içilir. Çatal bıçak isterseniz turist olduğunuz anlaşılır :)</span>
                                  </div>
                              </div>

                              <div className="bg-slate-950/50 p-6 rounded-2xl border border-slate-800">
                                  <div className="flex justify-between items-start mb-2">
                                      <h4 className="text-white font-bold text-lg">Fırın Kebabı</h4>
                                      <span className="bg-rose-500/10 text-rose-500 text-[10px] px-2 py-1 rounded border border-rose-500/20">AKŞAM YEMEĞİ</span>
                                  </div>
                                  <p className="text-slate-400 text-sm mb-4">Saatlerce pişen kuzu eti, lokum kıvamında.</p>
                                  <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-900 p-3 rounded-lg">
                                      <Map size={14} className="text-green-500 flex-shrink-0"/> 
                                      <span><strong>Nerede Yenir:</strong> Tarihi Çarşı ve civarındaki eski fırınları tercih edin.</span>
                                  </div>
                              </div>
                          </div>
                      </div>
                      
                      <div className="relative h-full min-h-[300px] rounded-3xl overflow-hidden shadow-2xl">
                          <img src="https://assets.reflectandshoot.com/city_guide/etliekmek.png" alt="Yemek" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                          <div className="absolute bottom-8 left-8 right-8">
                              <div className="bg-slate-950/90 backdrop-blur p-4 rounded-xl border border-slate-800">
                                  <h5 className="text-amber-500 font-bold text-sm mb-1 flex items-center gap-2"><Coffee size={14}/> Yemek Sonrası</h5>
                                  <p className="text-white text-xs">Yemeğin üzerine mutlaka "Sac Arası" tatlısı ve çay.</p>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </section>

          <section id="survival" className="scroll-mt-32">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                      <div className="w-10 h-10 bg-blue-900/30 text-blue-400 rounded-lg flex items-center justify-center mb-4"><Wifi size={20}/></div>
                      <h4 className="text-white font-bold mb-2">Wi-Fi Noktaları</h4>
                      <p className="text-slate-400 text-xs">Meydanlarda ve parklarda 'Konya Büyükşehir Belediyesi' ücretsiz Wi-Fi ağı mevcuttur.</p>
                  </div>
                  <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                      <div className="w-10 h-10 bg-green-900/30 text-green-400 rounded-lg flex items-center justify-center mb-4"><Bus size={20}/></div>
                      <h4 className="text-white font-bold mb-2">Şehir İçi Ulaşım</h4>
                      <p className="text-slate-400 text-xs">Tramvay ve otobüslerde 'Elkart' veya temassız kredi kartı geçerlidir.</p>
                  </div>
                  <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                      <div className="w-10 h-10 bg-amber-900/30 text-amber-400 rounded-lg flex items-center justify-center mb-4"><BatteryCharging size={20}/></div>
                      <h4 className="text-white font-bold mb-2">Şarj İstasyonları</h4>
                      <p className="text-slate-400 text-xs">Zafer Meydanı ve Kültür Park'taki akıllı duraklarda USB şarj portları bulunur.</p>
                  </div>
                  <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                      <div className="w-10 h-10 bg-red-900/30 text-red-400 rounded-lg flex items-center justify-center mb-4"><AlertCircle size={20}/></div>
                      <h4 className="text-white font-bold mb-2">Acil Durum</h4>
                      <p className="text-slate-400 text-xs">Acil Çağrı: 112<br/>En Yakın Hastane: Konya Numune (Merkez)</p>
                  </div>
              </div>
          </section>

          <section id="souvenirs" className="scroll-mt-32 border-t border-slate-800 pt-16">
              <div className="flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
                  <div>
                      <h2 className="text-3xl font-black text-white flex items-center justify-center md:justify-start gap-3">
                          <ShoppingBag className="text-rose-500" /> Alışveriş & Hediyelik
                      </h2>
                      <p className="text-slate-400 mt-2 text-sm max-w-md mx-auto md:mx-0">Dönerken çantanızda olması gerekenler.</p>
                  </div>
                  <div className="flex flex-wrap gap-2 md:gap-4 justify-center md:justify-start">
                      {['Mevlana Şekeri', 'Etliekmek (Paket)', 'Magnet', 'Tulum Peyniri'].map((item, i) => (
                          <span key={i} className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-full text-xs font-bold text-slate-300">
                              {item}
                          </span>
                      ))}
                  </div>
              </div>
          </section>

          <section id="accommodation" className="scroll-mt-32">
              <div className="relative rounded-[3rem] overflow-hidden bg-slate-900 border-4 border-slate-800 shadow-2xl">
                  {/* Header Images - Split View */}
                  <div className="h-64 md:h-96 relative flex">
                      <div className="w-1/2 relative h-full">
                          <img src="https://assets.reflectandshoot.com/city_guide/pansiyon.jpg" alt="Pansiyon Dış" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-slate-900/10"></div>
                      </div>
                      <div className="w-1/2 relative h-full">
                          <img src="https://assets.reflectandshoot.com/city_guide/pansiyon2.jpg" alt="Pansiyon İç" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-slate-900/10"></div>
                      </div>
                      
                      {/* Gradient Overlay for Text */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
                      
                      <div className="absolute bottom-0 left-0 p-8 md:p-12 z-10">
                          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-600 text-white text-xs font-bold uppercase tracking-wider mb-4 shadow-lg">
                              <Bed size={14} /> Resmi Konaklama
                          </div>
                          <h2 className="text-3xl md:text-5xl font-black text-white">Konaklama Üssü</h2>
                      </div>
                  </div>

                  <div className="p-8 md:p-12 grid md:grid-cols-3 gap-12">
                      <div className="md:col-span-2 space-y-6">
                          <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                              <Landmark size={24} className="text-slate-400"/> Konya Anadolu İmam Hatip Lisesi Pansiyonu
                          </h3>
                          <p className="text-slate-300 text-lg leading-relaxed font-light">
                              Değerli finalistlerimiz ve danışman öğretmenlerimiz, sizleri okulumuzun modern imkanlara sahip pansiyonunda ağırlamaktan mutluluk duyacağız.
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="flex items-center gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
                                  <CheckCircleIcon /> <span className="text-sm text-slate-300">Ücretsiz Konaklama</span>
                              </div>
                              <div className="flex items-center gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
                                  <CheckCircleIcon /> <span className="text-sm text-slate-300">Sabah & Akşam Yemeği</span>
                              </div>
                          </div>
                      </div>
                      
                      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col justify-center items-center text-center">
                          <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-4 border border-slate-700">
                              <Info size={32} className="text-slate-400"/>
                          </div>
                          <h4 className="font-bold text-white mb-2">Rezervasyon</h4>
                          <p className="text-xs text-slate-500 leading-relaxed mb-6">
                              Finalistlerin konaklaması, sonuçlar açıklandıktan sonra organizasyon ekibi tarafından otomatik planlanır.
                          </p>
                          <span className="text-xs font-bold text-amber-500 bg-amber-900/10 px-3 py-1 rounded border border-amber-900/30">
                              Ekstra İşlem Gerekmez
                          </span>
                      </div>
                  </div>
              </div>
          </section>

      </div>

      {/* LOCATION DETAIL MODAL */}
      {selectedLocation && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4 bg-black/95 backdrop-blur-md animate-fadeIn">
              <div className="bg-slate-900 w-full md:max-w-4xl h-full md:h-auto md:max-h-[90vh] md:rounded-3xl border-0 md:border border-slate-700 shadow-2xl relative overflow-y-auto flex flex-col md:flex-row">
                  
                  {/* Close Button */}
                  <button type="button" 
                    onClick={() => setSelectedLocation(null)}
                    className="absolute top-4 right-4 z-50 p-2 bg-black/50 text-white rounded-full hover:bg-rose-600 transition-colors"
                  >
                      <X size={20} />
                  </button>

                  {/* Left: Image */}
                  <div className="w-full md:w-2/5 h-64 md:h-auto relative flex-shrink-0">
                      <img src={selectedLocation.image} alt={selectedLocation.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent md:bg-gradient-to-r"></div>
                      <div className="absolute bottom-4 left-4">
                          <span className="px-3 py-1 bg-amber-500 text-black text-xs font-bold rounded-lg uppercase tracking-wider shadow-lg">
                              {selectedLocation.tags[0]}
                          </span>
                      </div>
                  </div>

                  {/* Right: Details */}
                  <div className="w-full md:w-3/5 p-6 md:p-8">
                      <h3 className="text-3xl font-black text-white mb-2">{selectedLocation.title}</h3>
                      <p className="text-rose-500 text-sm font-bold uppercase tracking-widest mb-6">{selectedLocation.subtitle}</p>
                      
                      <p className="text-slate-300 leading-relaxed mb-8 border-l-4 border-slate-700 pl-4">
                          {selectedLocation.description}
                      </p>

                      <div className="grid grid-cols-1 gap-6">
                          <div className="flex items-start gap-4">
                              <div className="p-3 bg-slate-800 rounded-xl text-blue-400">
                                  <Clock size={20}/>
                              </div>
                              <div>
                                  <h4 className="text-white font-bold text-sm">Ziyaret Saatleri</h4>
                                  <p className="text-slate-400 text-sm">{selectedLocation.details.hours}</p>
                              </div>
                          </div>

                          <div className="flex items-start gap-4">
                              <div className="p-3 bg-slate-800 rounded-xl text-green-400">
                                  <Bus size={20}/>
                              </div>
                              <div className="flex-1">
                                  <h4 className="text-white font-bold text-sm">Ulaşım & Harita</h4>
                                  <p className="text-slate-400 text-sm mb-2">{selectedLocation.details.transport}</p>
                                  <a 
                                    href={selectedLocation.details.mapUrl} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 bg-slate-800 hover:bg-white hover:text-black text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border border-slate-700"
                                  >
                                      <ExternalLink size={12}/> Haritada Yol Tarifi Al
                                  </a>
                              </div>
                          </div>

                          <div className="flex items-start gap-4">
                              <div className="p-3 bg-slate-800 rounded-xl text-amber-400">
                                  <Navigation size={20}/>
                              </div>
                              <div>
                                  <h4 className="text-white font-bold text-sm">Yakınında Ne Var?</h4>
                                  <p className="text-slate-400 text-sm">{selectedLocation.details.nearby}</p>
                              </div>
                          </div>

                          {selectedLocation.photoTip && (
                              <div className="flex items-start gap-4 bg-rose-900/10 p-3 rounded-xl border border-rose-500/20">
                                  <div className="p-2 bg-rose-500/20 rounded-lg text-rose-500">
                                      <Aperture size={20}/>
                                  </div>
                                  <div>
                                      <h4 className="text-rose-400 font-bold text-sm">Kadraj Önerisi (Anı Yakala)</h4>
                                      <p className="text-rose-200/70 text-xs italic mt-1">{selectedLocation.photoTip}</p>
                                  </div>
                              </div>
                          )}
                      </div>

                      <div className="mt-8 pt-6 border-t border-slate-800">
                          <div className="bg-slate-950 p-4 rounded-xl flex gap-3 border border-slate-800">
                              <Info size={20} className="text-slate-500 flex-shrink-0 mt-0.5"/>
                              <p className="text-xs text-slate-400 italic">{selectedLocation.tip}</p>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* IMAGE POPUP MODAL */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 md:p-12"
            onClick={() => setSelectedImage(null)}
          >
            <motion.button 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-10"
              onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}
            >
              <X size={24} />
            </motion.button>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-full max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={selectedImage} 
                className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl border border-white/10" 
                alt="Enlarged" 
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

// Helper Icon
const CheckCircleIcon = () => (
    <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 flex-shrink-0">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
    </div>
);

