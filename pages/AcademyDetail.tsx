
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Markdown from 'react-markdown';
import { ArrowLeft, Download, AlertTriangle, Loader2, Calendar, User, BookOpen, Video } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { CMSAcademyItem } from '../types';

export const AcademyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Changed from slug to id
  const { cmsAcademy } = useAppContext();
  const [contentMeta, setContentMeta] = useState<CMSAcademyItem | null>(null);
  const [markdownContent, setMarkdownContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 1. Find Metadata in cmsAcademy
    if (cmsAcademy.length > 0 && id) {
      const found = cmsAcademy.find(c => c.id === id);
      if (found) {
        setContentMeta(found);
      } else {
        setError("İçerik bulunamadı.");
        setLoading(false);
      }
    } else if (cmsAcademy.length === 0) {
        // Still loading CMS data...
        return;
    } else {
        setError("Geçersiz içerik ID'si.");
        setLoading(false);
    }
  }, [id, cmsAcademy]);

  useEffect(() => {
    // 2. Fetch Markdown Content
    const fetchContent = async () => {
      if (!contentMeta) return;

      if (!contentMeta.mdFile) {
          setError("Bu içerik için detaylı yazı bulunamadı.");
          setLoading(false);
          return;
      }

      try {
        setLoading(true);
        // Use proxy to avoid CORS issues when fetching from public R2 bucket
        const proxyUrl = `/api/proxy?url=${encodeURIComponent(contentMeta.mdFile)}`;
        const response = await fetch(proxyUrl);
        
        if (!response.ok) {
          throw new Error(`Dosya yüklenemedi: ${response.status}`);
        }
        const text = await response.text();
        setMarkdownContent(text);
      } catch (err: any) {
        console.error("Markdown Fetch Error:", err);
        setError("İçerik yüklenirken bir hata oluştu. Lütfen bağlantınızı kontrol ediniz.");
      } finally {
        setLoading(false);
      }
    };

    if (contentMeta) {
      fetchContent();
    }
  }, [contentMeta]);

  if (loading && (!contentMeta || !markdownContent)) {
     // Initial Load
     return (
       <div className="min-h-screen bg-slate-950 flex items-center justify-center">
         <Loader2 className="animate-spin text-rose-500" size={32} />
       </div>
     );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center max-w-md">
          <AlertTriangle size={48} className="mx-auto text-amber-500 mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Bir Sorun Oluştu</h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <Link to="/academy" className="inline-flex items-center gap-2 text-rose-400 hover:text-rose-300 font-bold">
            <ArrowLeft size={16} /> Akademiye Dön
          </Link>
        </div>
      </div>
    );
  }

  if (!contentMeta) return null;

  return (
    <div className="bg-slate-950 min-h-screen font-sans selection:bg-rose-500 selection:text-white pb-24">
      
      {/* Header / Hero */}
      <div className="relative pt-32 pb-20 bg-slate-900 border-b border-slate-800">
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none"></div>
         <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <Link to="/academy" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 text-sm font-bold uppercase tracking-wider">
               <ArrowLeft size={16} /> Akademi'ye Dön
            </Link>
            
            <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-6">
              {contentMeta.title}
            </h1>
            <p className="text-xl text-slate-300 font-light leading-relaxed mb-8 max-w-2xl">
              {contentMeta.description}
            </p>

            <div className="flex flex-wrap items-center gap-6 border-t border-slate-800 pt-6">
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                   <BookOpen size={16} className="text-rose-500"/>
                   <span>{contentMeta.category}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                   <Calendar size={16} className="text-rose-500"/>
                   <span>Güncel İçerik</span>
                </div>
                
                {contentMeta.pdfFile && (
                   <a 
                     href={contentMeta.pdfFile} 
                     target="_blank" 
                     rel="noreferrer"
                     className="ml-auto bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors border border-slate-700"
                   >
                      <Download size={16} /> PDF İndir
                   </a>
                )}
            </div>
         </div>
      </div>

      {/* Content Body */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
         
         {/* Markdown Container */}
         <article className="prose prose-invert prose-lg max-w-none 
            prose-headings:font-black prose-headings:tracking-tight prose-headings:text-white
            prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
            prose-p:text-slate-300 prose-p:leading-relaxed prose-p:font-light
            prose-strong:text-white prose-strong:font-bold
            prose-a:text-rose-400 prose-a:no-underline hover:prose-a:underline
            prose-ul:list-disc prose-ul:pl-6 prose-li:text-slate-300 prose-li:marker:text-rose-500
            prose-blockquote:border-l-4 prose-blockquote:border-rose-500 prose-blockquote:bg-slate-900/50 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:not-italic prose-blockquote:text-slate-400
            prose-code:text-rose-300 prose-code:bg-slate-900 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
            prose-img:rounded-2xl prose-img:shadow-xl prose-img:border prose-img:border-slate-800
         ">
            {loading ? (
                <div className="space-y-4 animate-pulse">
                    <div className="h-4 bg-slate-800 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-800 rounded w-full"></div>
                    <div className="h-4 bg-slate-800 rounded w-5/6"></div>
                </div>
            ) : (
                <Markdown>{markdownContent}</Markdown>
            )}
         </article>

         {/* Optional Video Embed (Legacy or New URL if type is VIDEO) */}
         {contentMeta.type === 'VIDEO' && contentMeta.url && contentMeta.url.includes('youtube') && (
             <div className="mt-16 pt-8 border-t border-slate-800">
                 <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <Video size={24} className="text-rose-500"/> İlgili Video İçerik
                 </h3>
                 <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-black">
                     <iframe 
                        src={`https://www.youtube.com/embed/${contentMeta.url.split('v=')[1] || contentMeta.url.split('/').pop()}`} 
                        className="w-full h-full"
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                     ></iframe>
                 </div>
             </div>
         )}

      </div>

    </div>
  );
};
