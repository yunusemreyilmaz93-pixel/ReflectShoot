
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Application, EvaluationCriteria, Theme, Category } from '../types';
import { Video, Play, X, Sliders, CheckCircle, Clock, Save, AlertCircle } from 'lucide-react';
import { getYouTubeEmbedUrl } from '../lib/videoUtils';

export const JuryDashboard: React.FC = () => {
  const { allApplications, submitScore, currentUser } = useAppContext();
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  
  // Scoring State
  const [criteria, setCriteria] = useState<EvaluationCriteria>({ story: 0, technical: 0, originality: 0, themeFit: 0 });
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter apps assigned to this jury
  const myAssignedApps = allApplications.filter(app => 
      app.assignedJuryIds?.includes(currentUser?.uid || '')
  );

  // Determine if already graded by this user
  const isGradedByMe = (app: Application) => {
      return app.gradedBy?.includes(currentUser?.uid || '');
  };

  const openGrading = (app: Application) => {
      setSelectedApp(app);
      // Reset form (Real implementation would fetch existing score to edit)
      setCriteria({ story: 0, technical: 0, originality: 0, themeFit: 0 });
      setNotes('');
  };

  const handleScoreSubmit = async () => {
      if (!selectedApp) return;
      setIsSubmitting(true);
      await submitScore(selectedApp.id, criteria, notes);
      setIsSubmitting(false);
      setSelectedApp(null);
  };

  const totalScore = criteria.story + criteria.technical + criteria.originality + criteria.themeFit;
  
  // Helper for embed
  const embedUrl = selectedApp?.team.videoUrl ? getYouTubeEmbedUrl(selectedApp.team.videoUrl) : null;

  return (
    <div className="bg-slate-950 min-h-screen text-slate-200 font-sans selection:bg-rose-500 selection:text-white pb-20">
      
      {/* Header */}
      <div className="sticky top-20 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex justify-between items-center shadow-lg">
          <div>
              <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-3">
                  <Video className="text-rose-500" /> Jüri Değerlendirme Paneli
              </h1>
              <p className="text-slate-500 text-sm mt-1">Hoş geldiniz, {currentUser?.fullName}. Size atanan eserler aşağıdadır.</p>
          </div>
          <div className="flex gap-4">
               <div className="bg-slate-900 px-4 py-2 rounded-lg border border-slate-800 text-xs font-bold text-slate-400 flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> Sistem Online
               </div>
          </div>
      </div>

      <div className="max-w-[1600px] mx-auto p-6 md:p-8">
          
          {/* Info Banner */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-8 flex items-start gap-3">
              <AlertCircle className="text-amber-500 flex-shrink-0" size={20} />
              <div className="text-sm text-slate-400">
                  <strong className="text-white block mb-1">Adil Değerlendirme Hatırlatması</strong>
                  Bu ekranda okul, şehir ve öğretmen bilgileri gizlenmiştir. Lütfen sadece eserin sanatsal ve teknik niteliğine odaklanınız.
                  Puanlama sonrası düzenleme yapılamaz.
              </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {myAssignedApps.length === 0 ? (
                  <div className="col-span-full text-center py-20 text-slate-500">
                      Size atanmış bir eser bulunmamaktadır.
                  </div>
              ) : (
                  myAssignedApps.map(app => {
                   const graded = isGradedByMe(app);
                   return (
                       <div 
                        key={app.id} 
                        onClick={() => openGrading(app)}
                        className={`bg-slate-900 rounded-xl overflow-hidden border transition-all duration-300 cursor-pointer group relative shadow-xl hover:-translate-y-1 ${graded ? 'border-green-900/50 opacity-75 hover:opacity-100' : 'border-slate-800 hover:border-rose-500'}`}
                       >
                           {/* Thumbnail Area */}
                           <div className="aspect-video bg-black relative flex items-center justify-center overflow-hidden">
                               <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10 opacity-60"></div>
                               {app.team.logoUrl ? (
                                   <img src={app.team.logoUrl} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
                               ) : (
                                   <div className="text-slate-700"><Video size={48} /></div>
                               )}
                               
                               <div className="absolute z-20 bg-white/10 p-4 rounded-full backdrop-blur-sm group-hover:scale-110 transition-transform shadow-xl border border-white/20">
                                   <Play className="fill-white text-white" size={24} />
                               </div>
                               
                               {graded && (
                                   <div className="absolute top-3 right-3 z-20 bg-green-500 text-black text-[10px] font-black px-2 py-1 rounded shadow-lg uppercase tracking-wider flex items-center gap-1">
                                       <CheckCircle size={10} /> Puanlandı
                                   </div>
                               )}
                           </div>

                           <div className="p-5">
                               <h3 className="font-bold text-lg text-white mb-2 truncate leading-tight">{app.team.name}</h3>
                               <div className="flex flex-wrap gap-2 mb-3">
                                    <span className={`text-[10px] px-2 py-1 rounded border font-bold ${app.team.category === Category.LIVE_ACTION ? 'bg-teal-900/30 text-teal-400 border-teal-800' : 'bg-purple-900/30 text-purple-400 border-purple-800'}`}>
                                        {app.team.category}
                                    </span>
                                    <span className="text-[10px] px-2 py-1 rounded border bg-amber-900/30 text-amber-400 border-amber-800 font-bold truncate max-w-[150px]">
                                        {app.team.theme}
                                    </span>
                               </div>
                               <div className="flex justify-between items-center text-xs text-slate-500 border-t border-slate-800 pt-3">
                                    <span className="flex items-center gap-1"><Clock size={12}/> {app.team.videoSize || 'N/A'}</span>
                                    <span className="font-mono text-slate-600">ID: {app.team.id.slice(-4)}</span>
                               </div>
                           </div>
                       </div>
                   );
              })
              )}
          </div>
      </div>

      {/* Grading Modal */}
      {selectedApp && (
           <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-0 md:p-6 overflow-hidden">
               <div className="w-full max-w-7xl h-full md:h-[90vh] bg-slate-900 md:rounded-3xl overflow-hidden flex flex-col lg:flex-row shadow-2xl border border-slate-800 relative">
                   
                   {/* Close Button */}
                   <button onClick={() => setSelectedApp(null)} className="absolute top-4 right-4 z-50 bg-black/50 p-2 rounded-full text-white hover:bg-rose-600 transition-colors">
                       <X size={24} />
                   </button>

                   {/* Left: Video Player */}
                   <div className="flex-1 bg-black flex items-center justify-center relative group">
                        {embedUrl ? (
                            <iframe 
                                src={embedUrl} 
                                className="w-full h-full" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowFullScreen
                            ></iframe>
                        ) : (
                            <div className="text-center">
                                <Video size={64} className="text-slate-700 mx-auto mb-4"/>
                                <p className="text-slate-500">Video kaynağı bulunamadı veya henüz yüklenmedi.</p>
                            </div>
                        )}
                   </div>

                   {/* Right: Grading Form */}
                   <div className="w-full lg:w-[450px] bg-slate-900 border-l border-slate-800 flex flex-col h-[60vh] lg:h-full">
                       <div className="p-6 border-b border-slate-800 bg-slate-950/50">
                           <h2 className="text-2xl font-black text-white mb-1 truncate">{selectedApp.team.name}</h2>
                           <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{selectedApp.team.category} • {selectedApp.team.theme}</p>
                           {selectedApp.team.theme === Theme.AYET && (
                               <p className="mt-2 text-xs text-amber-500 bg-amber-900/10 p-2 rounded border border-amber-900/30 italic">
                                   "{selectedApp.team.selectedVerse}"
                               </p>
                           )}
                       </div>

                       <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-8">
                           <div className="flex items-center gap-2 text-rose-500 font-bold uppercase tracking-widest text-xs mb-2">
                               <Sliders size={14} /> Puanlama Rubriği
                           </div>

                           {[
                               { id: 'story', label: 'Senaryo & Hikaye', max: 25, desc: 'Olay örgüsü, karakter derinliği, mesajın netliği.' },
                               { id: 'technical', label: 'Teknik Kalite', max: 25, desc: 'Görüntü yönetimi, ışık, ses kalitesi, kamera açıları.' },
                               { id: 'originality', label: 'Özgünlük & Yaratıcılık', max: 25, desc: 'Sanatsal bakış açısı, yenilikçi anlatım.' },
                               { id: 'themeFit', label: 'Tema Uyumu', max: 25, desc: 'Seçilen ayet/hadis ile filmin ilişkisi.' }
                           ].map((c) => (
                               <div key={c.id}>
                                   <div className="flex justify-between mb-2 items-end">
                                       <div>
                                           <label className="text-sm font-bold text-slate-200 block">{c.label}</label>
                                           <span className="text-[10px] text-slate-500">{c.desc}</span>
                                       </div>
                                       <span className="text-lg font-black text-rose-500 w-8 text-right">{criteria[c.id as keyof EvaluationCriteria]}</span>
                                   </div>
                                   <input 
                                     type="range" 
                                     min="0" 
                                     max={c.max} 
                                     value={criteria[c.id as keyof EvaluationCriteria]}
                                     onChange={(e) => setCriteria({...criteria, [c.id]: parseInt(e.target.value)})}
                                     className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-600 hover:accent-rose-500"
                                   />
                                   <div className="flex justify-between text-[10px] text-slate-600 mt-1 font-mono">
                                       <span>0</span>
                                       <span>{c.max}</span>
                                   </div>
                               </div>
                           ))}

                           <div>
                               <label className="block text-sm font-bold text-slate-300 mb-2">Jüri Notları</label>
                               <textarea 
                                  value={notes}
                                  onChange={(e) => setNotes(e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-slate-300 text-sm focus:border-rose-500 outline-none h-32 resize-none placeholder-slate-700"
                                  placeholder="Bu eser hakkındaki düşünceleriniz..."
                               ></textarea>
                           </div>
                       </div>

                       <div className="p-6 border-t border-slate-800 bg-slate-950">
                           <div className="flex justify-between items-center mb-6">
                               <span className="text-xs font-bold text-slate-500 uppercase">Toplam Puan</span>
                               <span className={`text-4xl font-black ${totalScore > 80 ? 'text-green-500' : totalScore > 50 ? 'text-amber-500' : 'text-slate-500'}`}>
                                   {totalScore}<span className="text-lg text-slate-600 ml-1">/100</span>
                               </span>
                           </div>
                           <button 
                             onClick={handleScoreSubmit}
                             disabled={isSubmitting}
                             className="w-full bg-rose-600 hover:bg-rose-500 text-white py-4 rounded-xl font-bold shadow-lg shadow-rose-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                           >
                               {isSubmitting ? 'Kaydediliyor...' : <><Save size={18}/> Puanı Kaydet</>}
                           </button>
                       </div>
                   </div>
               </div>
           </div>
      )}
    </div>
  );
};
