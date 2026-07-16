
import React, { useState } from 'react';
import { X, ZoomIn, Camera, Film, Sparkles, Layers, ListFilter } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  category: string;
  season: '2024-2025' | '2025-2026';
  description?: string;
}

export const Gallery: React.FC = () => {
  const { cmsGallery } = useAppContext();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [activeSeason, setActiveSeason] = useState<'2024-2025' | '2025-2026'>('2025-2026');
  const [activeCategory, setActiveCategory] = useState<string>('Hepsi');

  // Hardcoded season-based photographs
  const defaultGalleryData: GalleryImage[] = [
    // 2025-2026 Season Photo Categories
    { 
      id: '26-1', 
      src: "https://picsum.photos/800/600?random=151", 
      alt: "Büyük Ödül Töreni Açılış Konuşması", 
      category: 'Ödül Töreni', 
      season: '2025-2026', 
      description: 'Reflect&Shoot 2025-2026 Sezonu görkemli bir ödül töreni açılışı ile taçlandı.' 
    },
    { 
      id: '26-2', 
      src: "https://picsum.photos/800/630?random=152", 
      alt: "Protokol ve Seçici Kurul Heyeti", 
      category: 'Sahne ve Protokol', 
      season: '2025-2026', 
      description: 'Gala gecesine iştirak eden saygıdeğer protokol ve akademisyen jürilerimiz.' 
    },
    { 
      id: '26-3', 
      src: "https://picsum.photos/800/580?random=153", 
      alt: "Canlı Çekim Birincisi Sosyal Kızlar42 Ekibi", 
      category: 'Ödül Alan Ekipler', 
      season: '2025-2026', 
      description: 'Canlı Çekim kategorisinde birinci olan Sosyal Kızlar42 ekibinin mutluluğu.' 
    },
    { 
      id: '26-4', 
      src: "https://picsum.photos/800/610?random=154", 
      alt: "Yapay Zeka Animasyon Birincisi Mitra Takımı", 
      category: 'Ödül Alan Ekipler', 
      season: '2025-2026', 
      description: 'Yeni nesil tekniklerle Yapay Zeka birincisi olan mitra ekibi sahnede.' 
    },
    { 
      id: '26-5', 
      src: "https://picsum.photos/800/620?random=155", 
      alt: "Danışman Öğretmenlere Plaket Takdimi", 
      category: 'Danışman Öğretmenler', 
      season: '2025-2026', 
      description: 'Gecede geleceğin sinemacılarını destekleyen danışman öğretmenlerimize plaketleri sunuldu.' 
    },
    { 
      id: '26-6', 
      src: "https://picsum.photos/800/590?random=156", 
      alt: "Sevgili Öğrencilerimiz ve Ekipler", 
      category: 'Öğrenciler ve Takımlar', 
      season: '2025-2026', 
      description: 'Konya ve farklı illerden gelen takımlar salonu dolduruyor.' 
    },
    { 
      id: '26-7', 
      src: "https://picsum.photos/800/640?random=157", 
      alt: "Giriş ve Kırmızı Halı Ambiyansı", 
      category: 'Genel Atmosfer', 
      season: '2025-2026', 
      description: 'Salon her ayrıntısıyla festival standartlarında kırmızı halıyla renklendirildi.' 
    },
    { 
      id: '26-8', 
      src: "https://picsum.photos/800/650?random=158", 
      alt: "Tören Sonrası Toplu Kare", 
      category: 'Genel Atmosfer', 
      season: '2025-2026', 
      description: 'Yarışmaya renk katan tüm yaratıcı ekipler ve öğretmenlerimiz tören kapanışında.' 
    },

    // 2024-2025 Season Photo Categories
    { 
      id: '25-1', 
      src: "https://picsum.photos/800/600?random=171", 
      alt: "2024-2025 Birincilik Ödülü Takdimi", 
      category: 'Ödül Töreni', 
      season: '2024-2025', 
      description: 'Geçen yılın en başarılı ekibinin heyecan verici kupa töreni.' 
    },
    { 
      id: '25-2', 
      src: "https://picsum.photos/800/620?random=172", 
      alt: "Tarihi Taş Bina Giriş Kapısı", 
      category: 'Genel Atmosfer', 
      season: '2024-2025', 
      description: 'Tarihi mekanların sinematik dokusu ve festival ağırlaması.' 
    },
    { 
      id: '25-3', 
      src: "https://picsum.photos/800/590?random=173", 
      alt: "Jüri Ortak Bildirisi ve Değerlendirmeler", 
      category: 'Sahne ve Protokol', 
      season: '2024-2025', 
      description: 'Değerli akademisyenlerimiz puanlama tablosunu tescillerken.' 
    },
    { 
      id: '25-4', 
      src: "https://picsum.photos/800/640?random=174", 
      alt: "Dereceye Giren Ekip Fotoğrafı", 
      category: 'Ödül Alan Ekipler', 
      season: '2024-2025', 
      description: 'Geçen yılın derece alan takımlarının paha biçilemez anısı.' 
    }
  ];

  // Map CMS Gallery data if present or default
  const images: GalleryImage[] = cmsGallery.length > 0
    ? cmsGallery.map((img: any) => ({
        id: img.id,
        src: img.imageUrl || img.src,
        alt: img.title || img.alt,
        category: img.category || 'Genel',
        season: (img.season === '2024-2025' ? '2024-2025' : '2025-2026') as '2024-2025' | '2025-2026',
        description: img.description || ''
      }))
    : defaultGalleryData;

  // Filter components first by selected season
  const filteredBySeason = images.filter(img => img.season === activeSeason);

  // Dynamic Categories based on selected season photos
  const availableCategories = ['Hepsi', ...Array.from(new Set(filteredBySeason.map(img => img.category)))];

  // Final filtered list
  const finalFilteredImages = activeCategory === 'Hepsi'
    ? filteredBySeason
    : filteredBySeason.filter(img => img.category === activeCategory);

  return (
    <div className="bg-slate-950 min-h-screen font-sans relative overflow-hidden pb-32">
      
      {/* 1. Cinematic Hero Section */}
      <div className="bg-gradient-to-b from-rose-950 via-slate-900 to-slate-950 text-white pt-32 pb-24 relative overflow-hidden ring-1 ring-white/5 shadow-2xl">
        {/* Texture & Effects */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[500px] bg-rose-500/10 blur-[120px] rounded-full pointer-events-none mix-blend-screen"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 animate-fadeIn">
           <div className="inline-flex items-center justify-center p-2 px-4 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold tracking-[0.2em] uppercase rounded-full mb-6 shadow-[0_0_15px_rgba(245,158,11,0.2)] backdrop-blur-sm">
              <Film size={14} className="mr-2"/> HAFIZA & SEZON ARŞİVİ
           </div>
           
           <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-500 to-amber-300 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">
               Reflect&Shoot Galeri
             </span>
           </h1>
           
           <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
             Yarışmamızın farklı sezonlarına ait fotoğraf ve etkinlik arşivine buradan ulaşabilirsiniz.
           </p>
        </div>
      </div>
      
      {/* 2. Season Selector Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 relative z-20">
        <div className="flex flex-col md:flex-row justify-between items-center bg-slate-900/40 p-5 rounded-[2rem] border border-slate-900 backdrop-blur-sm gap-6">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/20">
              <Camera size={18} />
            </span>
            <div>
              <h3 className="text-white font-bold text-sm">Sezon Arşivi</h3>
              <p className="text-xs text-slate-400 font-medium">Lütfen incelemek istediğiniz yılı seçin</p>
            </div>
          </div>

          <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800/80 w-full md:w-auto">
            {['2025-2026', '2024-2025'].map((season) => (
              <button type="button"
                key={season}
                onClick={() => {
                  setActiveSeason(season as '2024-2025' | '2025-2026');
                  setActiveCategory('Hepsi');
                }}
                className={`flex-1 md:flex-none px-6 py-3 rounded-xl text-xs font-black tracking-wider uppercase transition-all whitespace-nowrap cursor-pointer ${
                  activeSeason === season
                    ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/10 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                {season} Sezonu
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Category Nested Filters (Subtabs) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 relative z-20">
        <div className="flex items-center gap-3 flex-wrap bg-slate-900/20 p-4 rounded-2.5xl border border-slate-900/60 backdrop-blur-sm">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 rounded-lg border border-slate-800">
            <ListFilter size={12} /> Kategori
          </span>
          <div className="flex flex-wrap gap-2.5">
            {availableCategories.map((cat) => (
              <button type="button"
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
                  activeCategory === cat
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md font-extrabold'
                    : 'bg-slate-900/65 text-slate-300 hover:bg-slate-850 hover:text-white border border-slate-800/40'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Photo Grid Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 py-12">
        {finalFilteredImages.length === 0 ? (
          <div className="text-center py-24 bg-slate-900/30 rounded-3xl border border-slate-900">
            <Layers size={48} className="mx-auto text-slate-600 mb-4" />
            <h3 className="text-white font-bold text-lg">Fotoğraf Bulunamadı</h3>
            <p className="text-slate-400 text-sm mt-1">Bu kategori için arşivde henüz fotoğraf yer almıyor.</p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
              {finalFilteredImages.map((img, index) => (
                  <div 
                      key={img.id} 
                      className="break-inside-avoid group relative overflow-hidden rounded-[2rem] bg-slate-900 cursor-zoom-in shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-white/5"
                      style={{ animationDelay: `${index * 50}ms` }}
                      onClick={() => setSelectedImage(img.src)}
                  >
                      <img 
                          src={img.src} 
                          alt={img.alt} 
                          className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100" 
                          loading="lazy"
                      />
                      
                      {/* Cinematic Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                          <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                             <div className="flex items-center gap-2 text-amber-400 text-[10px] font-black uppercase tracking-widest mb-1.5">
                                <Camera size={12} /> {img.season} • {img.category}
                             </div>
                             <p className="text-white text-lg font-bold leading-tight">{img.alt}</p>
                             {img.description && <p className="text-slate-300 text-xs mt-1.5 font-light leading-relaxed">{img.description}</p>}
                          </div>
                          <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                               <ZoomIn size={18} className="text-white"/>
                          </div>
                      </div>
                  </div>
              ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
          <div 
            className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-fadeIn"
            onClick={() => setSelectedImage(null)}
          >
              <button type="button" 
                className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors p-3 hover:bg-white/10 rounded-full"
                onClick={() => setSelectedImage(null)}
              >
                  <X size={36} />
              </button>
              
              <img 
                src={selectedImage} 
                alt="Full size" 
                className="max-h-[90vh] max-w-[95vw] object-contain rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-scaleIn border border-white/10" 
                onClick={(e) => e.stopPropagation()} 
              />
          </div>
      )}
      
      <style>{`
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes scaleIn {
            from { transform: scale(0.95); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }
        .animate-fadeIn {
            animation: fadeIn 0.4s ease-out forwards;
        }
        .animate-scaleIn {
            animation: scaleIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
