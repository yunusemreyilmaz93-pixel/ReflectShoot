
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, AlertTriangle, Loader2, Calendar, BookOpen, Video, ExternalLink, PlayCircle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { CMSAcademyItem } from '../types';
import { getYouTubeEmbedUrl } from '../lib/videoUtils';

export const AcademyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { cmsAcademy } = useAppContext();
  const [contentMeta, setContentMeta] = useState<CMSAcademyItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait for CMS data to load
    if (cmsAcademy.length > 0 && id) {
      const found = cmsAcademy.find(c => c.id === id);
      if (found) {
        setContentMeta(found);
      }
      setLoading(false);
    } else if (cmsAcademy.length === 0) {
        // Still loading or empty
        const timer = setTimeout(() => setLoading(false), 2000); // Timeout fallback
        return () => clearTimeout(timer);
    } else {
        setLoading(false);
    }
  }, [id, cmsAcademy]);

  if (loading) {
     return (
       <div className="min-h-screen bg-slate-950 flex items-center justify-center">
         <Loader2 className="animate-spin text-rose-500" size={32} />
       </div>
     );
  }

  if (!contentMeta) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center max-w-md">
          <AlertTriangle size={48} className="mx-auto text-amber-500 mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">İçerik Bulunamadı</h2>
          <Link to="/academy" className="inline-flex items-center gap-2 text-rose-400 hover:text-rose-300 font-bold mt-4">
            <ArrowLeft size={16} /> Akademiye Dön
          </Link>
        </div>
      </div>
    );
  }

  const embedUrl = contentMeta.url ? getYouTubeEmbedUrl(contentMeta.url) : null;

  return (
    <div className="bg-slate-950 min-h-screen font-sans selection:bg-rose-500 selection:text-white pb-24">
      
      {/* Cinematic Hero */}
      <div className="relative pt-32 pb-16 bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800">
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none"></div>
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-rose-500/5 blur-[100px] pointer-events-none"></div>

         <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <Link to="/academy" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 text-xs font-bold uppercase tracking-wider bg-slate-800/50 px-4 py-2 rounded-full border border-slate-700">
               <ArrowLeft size={14} /> Akademi Ana Sayfa
            </Link>
            
            <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Cover Image */}
                {contentMeta.coverImage && (
                    <div className="w-full md:w-1/3 aspect-[3/4] md:aspect-square rounded-2xl overflow-hidden shadow-2xl border border-slate-800 relative group flex-shrink-0">
                        <img src={contentMeta.coverImage} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={contentMeta.title}/>
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60"></div>
                    </div>
                )}

                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 bg-rose-900/30 text-rose-400 text-xs font-bold uppercase tracking-wider rounded-lg border border-rose-500/20">
                            {contentMeta.category}
                        </span>
                        {contentMeta.isStarterPack && (
                            <span className="px-3 py-1 bg-green-900/30 text-green-400 text-xs font-bold uppercase tracking-wider rounded-lg border border-green-500/20">
                                Başlangıç Seti
                            </span>
                        )}
                    </div>

                    <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-6">
                      {contentMeta.title}
                    </h1>
                    
                    <p className="text-lg text-slate-400 font-light leading-relaxed mb-8 border-l-4 border-slate-700 pl-4">
                      {contentMeta.description}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4">
                        {contentMeta.pdfFile && (
                           <a 
                             href={contentMeta.pdfFile} 
                             target="_blank" 
                             rel="noreferrer"
                             className="bg-rose-600 hover:bg-rose-500 text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg shadow-rose-900/20 transform hover:-translate-y-1"
                           >
                              <Download size={20} /> PDF Dokümanı İndir
                           </a>
                        )}
                        
                        {contentMeta.url && !embedUrl && (
                           <a 
                             href={contentMeta.url} 
                             target="_blank" 
                             rel="noreferrer"
                             className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all border border-slate-700 hover:border-slate-500"
                           >
                              <ExternalLink size={20} /> Kaynağa Git
                           </a>
                        )}
                    </div>
                </div>
            </div>
         </div>
      </div>

      {/* Video Section */}
      {embedUrl && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
             <div className="bg-slate-900 rounded-3xl p-8 md:p-12 border border-slate-800 shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none"></div>
                 
                 <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3 relative z-10">
                    <div className="p-2 bg-rose-600 rounded-lg"><PlayCircle size={24} className="text-white"/></div>
                    Video Ders
                 </h3>
                 
                 <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-black relative z-10">
                     <iframe 
                        src={embedUrl}
                        className="w-full h-full"
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                     ></iframe>
                 </div>
             </div>
          </div>
      )}

    </div>
  );
};
