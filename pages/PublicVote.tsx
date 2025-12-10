
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Play, Heart, Share2, Award, Clock } from 'lucide-react';
import { Application, ApplicationStatus } from '../types';
import { getYouTubeEmbedUrl } from '../lib/videoUtils';

export const PublicVote: React.FC = () => {
  const { allApplications, submitPublicVote, showToast, systemSettings } = useAppContext();
  const [activeVideo, setActiveVideo] = useState<Application | null>(null);
  const [votedApps, setVotedApps] = useState<string[]>([]);
  
  // Fingerprint Logic (Simple LocalStorage UUID)
  const [fingerprint, setFingerprint] = useState('');

  useEffect(() => {
    let fp = localStorage.getItem('voter_fp');
    if (!fp) {
        fp = Math.random().toString(36).substring(2) + Date.now().toString(36);
        localStorage.setItem('voter_fp', fp);
    }
    setFingerprint(fp);

    // Check local storage for votes today/overall
    // Ideally this comes from Firestore check, but for UX speed we use local first
  }, []);

  const finalists = allApplications.filter(app => app.team.isFinalist && app.team.videoUrl);

  const handleVote = async (e: React.MouseEvent, app: Application) => {
      e.stopPropagation();
      try {
          await submitPublicVote(app.id, fingerprint);
          showToast('Oyunuz kaydedildi! Teşekkürler.', 'success');
          setVotedApps([...votedApps, app.id]); // Optimistic UI
      } catch (err: any) {
          showToast(err.message, 'error');
      }
  };

  const isVotingActive = systemSettings.features.publicVotingActive;

  return (
    <div className="bg-slate-950 min-h-screen font-sans text-white pb-24">
       
       {/* Hero */}
       <div className="relative pt-32 pb-20 overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none"></div>
            <div className="absolute top-0 center w-full h-[500px] bg-amber-500/10 blur-[150px] pointer-events-none"></div>
            
            <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-900/30 border border-rose-500/30 text-rose-500 text-xs font-bold tracking-[0.2em] uppercase mb-6 shadow-lg backdrop-blur-sm">
                    <Award size={14} /> FİNAL HEYECANI
                </div>
                <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-500 to-amber-300">
                        Halk Oylaması
                    </span>
                </h1>
                <p className="text-xl text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
                    Jüri kararına ek olarak, halkın favorisi "En İyi Seyirci Ödülü"nü belirlemek için oyunu kullan.
                </p>
                
                {!isVotingActive && (
                    <div className="mt-8 bg-slate-900 border border-slate-700 p-4 rounded-xl inline-block">
                        <p className="text-slate-400 flex items-center gap-2">
                            <Clock size={18} /> Oylama süresi henüz başlamadı veya sona erdi.
                        </p>
                    </div>
                )}
            </div>
       </div>

       {/* Video Grid */}
       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {finalists.map(app => (
                   <div 
                     key={app.id}
                     onClick={() => setActiveVideo(app)}
                     className="group relative bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 hover:border-amber-500/50 transition-all duration-300 cursor-pointer shadow-2xl hover:shadow-amber-900/20 hover:-translate-y-2"
                   >
                       {/* Thumbnail */}
                       <div className="aspect-video bg-black relative flex items-center justify-center overflow-hidden">
                           <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10 opacity-60"></div>
                           <img src={app.team.logoUrl || "https://picsum.photos/800/450"} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" />
                           <div className="absolute z-20 w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 group-hover:bg-rose-600 group-hover:border-rose-600 transition-colors">
                               <Play className="fill-white text-white ml-1" size={32} />
                           </div>
                       </div>

                       <div className="p-6">
                           <div className="flex justify-between items-start mb-4">
                               <div>
                                   <h3 className="text-xl font-bold text-white mb-1 leading-tight">{app.team.name}</h3>
                                   <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{app.team.category}</p>
                               </div>
                               <button 
                                 onClick={(e) => isVotingActive && handleVote(e, app)}
                                 disabled={!isVotingActive}
                                 className={`p-3 rounded-full transition-all flex items-center gap-2 font-bold text-xs ${votedApps.includes(app.id) ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/50' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'}`}
                               >
                                   <Heart size={18} className={votedApps.includes(app.id) ? 'fill-current' : ''} /> 
                                   {app.team.publicVotes || 0}
                               </button>
                           </div>
                           <p className="text-slate-400 text-sm line-clamp-2">
                               {app.team.theme} temalı, {app.teacher.school} ekibinin hazırladığı kısa film.
                           </p>
                       </div>
                   </div>
               ))}
           </div>
       </div>

       {/* Video Modal */}
       {activeVideo && (
           <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
               <div className="w-full max-w-5xl bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 relative flex flex-col">
                   <div className="aspect-video bg-black relative">
                        {activeVideo.team.videoUrl ? (
                            <iframe 
                                src={getYouTubeEmbedUrl(activeVideo.team.videoUrl) || ""} 
                                className="w-full h-full" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowFullScreen
                            ></iframe>
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-500">Video yüklenemedi.</div>
                        )}
                        <button onClick={() => setActiveVideo(null)} className="absolute top-4 right-4 bg-black/50 p-2 rounded-full text-white hover:bg-rose-600 transition-colors z-20">
                           <Play size={24} className="rotate-45" /> {/* Close icon trick or import X */}
                        </button>
                   </div>
                   <div className="p-8 flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-900">
                       <div>
                           <h2 className="text-3xl font-black text-white">{activeVideo.team.name}</h2>
                           <p className="text-slate-400 mt-1">{activeVideo.team.category} • {activeVideo.teacher.school}</p>
                       </div>
                       <div className="flex gap-4">
                            <button 
                                 onClick={(e) => isVotingActive && handleVote(e, activeVideo)}
                                 disabled={!isVotingActive}
                                 className={`px-8 py-4 rounded-xl transition-all flex items-center gap-3 font-bold ${votedApps.includes(activeVideo.id) ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/50' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'}`}
                               >
                                   <Heart size={20} className={votedApps.includes(activeVideo.id) ? 'fill-current' : ''} /> 
                                   {votedApps.includes(activeVideo.id) ? 'Oylandı' : 'Oy Ver'}
                           </button>
                           <button className="p-4 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all">
                               <Share2 size={20} />
                           </button>
                       </div>
                   </div>
               </div>
           </div>
       )}
    </div>
  );
};
