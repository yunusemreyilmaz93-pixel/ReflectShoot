
import React, { useState } from 'react';
import { X, ZoomIn, Camera, Film } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export const Gallery: React.FC = () => {
  const { cmsGallery } = useAppContext();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Fallback images if CMS is empty (Initial State)
  const fallbackImages = [
    { id: '1', src: "https://picsum.photos/800/600?random=101", alt: "Ödül Töreni Açılış Konuşması", category: 'Gala 2025', year: '2025' },
    { id: '2', src: "https://picsum.photos/600/900?random=102", alt: "Kırmızı Halı Geçişi", category: 'Gala 2025', year: '2025' }, 
    { id: '3', src: "https://picsum.photos/800/500?random=103", alt: "Birinci Olan Takım", category: 'Gala 2025', year: '2025' },
    { id: '4', src: "https://picsum.photos/900/600?random=104", alt: "Jüri Üyeleri Değerlendirmede", category: 'Gala 2025', year: '2025' },
    { id: '5', src: "https://picsum.photos/600/600?random=105", alt: "Plaket Takdimi", category: 'Gala 2025', year: '2025' }, 
    { id: '6', src: "https://picsum.photos/800/600?random=106", alt: "Sahne Arkası Heyecanı", category: 'Gala 2025', year: '2025' }
  ];

  const images = cmsGallery.length > 0 ? cmsGallery : fallbackImages;

  return (
    <div className="bg-slate-900 min-h-screen font-sans relative overflow-hidden">
      
      {/* 1. Cinematic Hero Section - MATCHING FINAL PAGE */}
      <div className="bg-gradient-to-b from-rose-950 via-slate-900 to-slate-950 text-white pt-32 pb-24 relative overflow-hidden">
        {/* Texture & Effects */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[500px] bg-rose-500/10 blur-[120px] rounded-full pointer-events-none mix-blend-screen"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 animate-fadeIn">
           <div className="inline-flex items-center justify-center p-2 px-4 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold tracking-[0.2em] uppercase rounded-full mb-6 shadow-[0_0_15px_rgba(245,158,11,0.2)] backdrop-blur-sm">
              <Film size={14} className="mr-2"/> HAFIZA & ARŞİV
           </div>
           <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tight animate-fadeIn delay-100">
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-500 to-amber-300 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">
               Galeri
             </span>
           </h1>
           <p className="text-xl md:text-2xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed animate-fadeIn delay-200">
             Geçen yılların ödül törenlerinden objektifimize yansıyan kareler, heyecan dolu dakikalar ve zafer anları.
           </p>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 py-20 -mt-10">
        
        {/* Masonry Layout */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {images.map((img, index) => (
                <div 
                    key={img.id} 
                    className="break-inside-avoid group relative overflow-hidden rounded-2xl bg-slate-800 cursor-zoom-in shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-white/5"
                    style={{ animationDelay: `${index * 100}ms` }}
                    onClick={() => setSelectedImage(img.src)}
                >
                    <img 
                        src={img.src} 
                        alt={img.alt} 
                        className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100" 
                        loading="lazy"
                    />
                    
                    {/* Cinematic Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                        <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                           <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-widest mb-1">
                              <Camera size={14} /> {img.year}
                           </div>
                           <p className="text-white text-lg font-bold leading-tight">{img.alt}</p>
                           <span className="text-xs text-slate-400 mt-1 block">{img.category}</span>
                        </div>
                        <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                             <ZoomIn size={20} className="text-white"/>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-fadeIn"
            onClick={() => setSelectedImage(null)}
          >
              <button 
                className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors p-3 hover:bg-white/10 rounded-full"
                onClick={() => setSelectedImage(null)}
              >
                  <X size={36} />
              </button>
              
              <img 
                src={selectedImage} 
                alt="Full size" 
                className="max-h-[90vh] max-w-[95vw] object-contain rounded-lg shadow-2xl animate-scaleIn border border-white/10" 
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
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
      `}</style>
    </div>
  );
};
