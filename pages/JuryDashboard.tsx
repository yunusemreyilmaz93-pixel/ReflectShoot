import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import { Application, EvaluationCriteria, Theme, Category, ScoreDocument } from '../types';
import { Video, Play, X, Sliders, CheckCircle, Clock, Save, AlertCircle, RefreshCw, AlertTriangle, FileEdit, Ban, Info, Filter, LayoutGrid, CheckSquare, Loader2, ChevronLeft, ChevronRight, CloudOff, RefreshCcw } from 'lucide-react';
import { getYouTubeEmbedUrl } from '../lib/videoUtils';
import { collectionGroup, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';

export const JuryDashboard: React.FC = () => {
  const { allApplications, submitScore, currentUser, showToast } = useAppContext();
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  
  // Local state to track specific user score statuses (Draft/Recused)
  const [myScores, setMyScores] = useState<Record<string, ScoreDocument>>({});
  const [isLoadingScores, setIsLoadingScores] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'GRADED' | 'PENDING' | 'DRAFT'>('ALL');

  // Scoring State
  const [criteria, setCriteria] = useState<EvaluationCriteria>({ story: 0, technical: 0, originality: 0, themeFit: 0 });
  const [notes, setNotes] = useState('');
  
  // Interaction State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);

  // Fetch ALL my scores once on mount
  useEffect(() => {
      if (!currentUser) return;
      const fetchMyAllScores = async () => {
          setIsLoadingScores(true);
          try {
              const q = query(collectionGroup(db, 'scores'), where('juryId', '==', currentUser.uid));
              const snap = await getDocs(q);
              const scoresMap: Record<string, ScoreDocument> = {};
              snap.docs.forEach(doc => {
                  const pathSegments = doc.ref.path.split('/');
                  const appId = pathSegments[1];
                  scoresMap[appId] = { id: doc.id, ...doc.data() } as ScoreDocument;
              });
              setMyScores(scoresMap);
          } catch (e) {
              console.error("Error fetching jury scores:", e);
              showToast("Puan verileri alınamadı, lütfen sayfayı yenileyin.", "error");
          } finally {
              setIsLoadingScores(false);
          }
      };
      fetchMyAllScores();
  }, [currentUser]);

  // Filter apps assigned to this jury
  const myAssignedApps = useMemo(() => {
      return allApplications.filter(app => 
          app.assignedJuryIds?.includes(currentUser?.uid || '')
      );
  }, [allApplications, currentUser]);

  const filteredApps = useMemo(() => {
      return myAssignedApps.filter(app => {
          const score = myScores[app.id];
          const isDraft = score?.isDraft;
          const isRecused = score?.isRecused;
          const isDone = score && !isDraft; // Final or Recused counts as graded in general context, but let's be specific

          if (filter === 'GRADED') return isDone;
          if (filter === 'DRAFT') return isDraft;
          if (filter === 'PENDING') return !score || isDraft;
          return true;
      });
  }, [myAssignedApps, myScores, filter]);

  // Stats
  const stats = useMemo(() => {
      const total = myAssignedApps.length;
      const graded = myAssignedApps.filter(app => {
          const score = myScores[app.id];
          return score && !score.isDraft;
      }).length;
      const percent = total > 0 ? Math.round((graded / total) * 100) : 0;
      return { total, graded, percent };
  }, [myAssignedApps, myScores]);

  // Check for unsaved changes
  const isDirty = useMemo(() => {
      if (!selectedApp) return false;
      const initialScore = myScores[selectedApp.id];
      
      const currentTotal = criteria.story + criteria.technical + criteria.originality + criteria.themeFit;
      
      if (!initialScore) {
          // New scoring: dirty if any value is changed from 0 or notes not empty
          return currentTotal > 0 || notes.trim().length > 0;
      }

      // Existing score: check diff
      const initialTotal = initialScore.criteria.story + initialScore.criteria.technical + initialScore.criteria.originality + initialScore.criteria.themeFit;
      const isCriteriaChanged = JSON.stringify(criteria) !== JSON.stringify(initialScore.criteria);
      const isNotesChanged = notes !== initialScore.notes;
      
      return isCriteriaChanged || isNotesChanged;
  }, [criteria, notes, selectedApp, myScores]);

  const openGrading = useCallback((app: Application) => {
      const score = myScores[app.id];
      if (score) {
          setCriteria(score.criteria);
          setNotes(score.notes);
          setLastSavedTime(new Date(score.updatedAt).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'}));
      } else {
          setCriteria({ story: 0, technical: 0, originality: 0, themeFit: 0 });
          setNotes('');
          setLastSavedTime(null);
      }
      setSaveError(null);
      setSelectedApp(app);
  }, [myScores]);

  const handleCloseModal = () => {
      if (isDirty && !window.confirm("Kaydedilmemiş değişiklikleriniz var. Çıkmak istediğinize emin misiniz?")) {
          return;
      }
      setSelectedApp(null);
  };

  const navigateApp = (direction: 'next' | 'prev') => {
      if (!selectedApp) return;
      
      if (isDirty && !window.confirm("Kaydedilmemiş değişiklikleriniz var. Diğer esere geçmek istediğinize emin misiniz?")) {
          return;
      }

      const currentIndex = filteredApps.findIndex(a => a.id === selectedApp.id);
      let nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;

      // Loop around or stop? Let's stop at edges.
      if (nextIndex >= 0 && nextIndex < filteredApps.length) {
          openGrading(filteredApps[nextIndex]);
      }
  };

  const handleScoreSubmit = async (isDraft: boolean = false, isRecused: boolean = false) => {
      if (!selectedApp) return;
      
      if (isRecused && !window.confirm("Bu takımı tanıdığınızı veya bir çıkar çatışması olduğunu beyan ediyorsunuz. Bu işlemden sonra bu eser için puanlamanız '0' sayılacak ve ortalamaya katılmayacaktır. Emin misiniz?")) {
          return;
      }

      setIsSubmitting(true);
      setSaveError(null);

      try {
          await submitScore(selectedApp.id, criteria, notes, isDraft, isRecused);
          
          // Optimistic update
          const newScoreDoc: ScoreDocument = {
              juryId: currentUser?.uid || '',
              juryName: currentUser?.fullName || '',
              total: isRecused ? 0 : (criteria.story + criteria.technical + criteria.originality + criteria.themeFit),
              criteria,
              notes,
              updatedAt: new Date().toISOString(),
              isDraft,
              isRecused
          };
          
          setMyScores(prev => ({ ...prev, [selectedApp.id]: newScoreDoc }));
          setLastSavedTime(new Date().toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'}));
          
          if (!isDraft) {
              // If final submission, maybe auto-advance or just close?
              // Let's stay on screen but show success, or close. 
              // Better UX: Close and go back to list to feel "Done"
              // But user requested "Retry" button, so we stay if error.
              // If success final:
              setTimeout(() => {
                  setSelectedApp(null);
                  showToast("Değerlendirme tamamlandı.", "success");
              }, 500);
          }
      } catch (e: any) {
          console.error(e);
          setSaveError("Kaydedilemedi. İnternet bağlantınızı kontrol edin.");
      } finally {
          setIsSubmitting(false);
      }
  };

  // Auto-save effect
  useEffect(() => {
    if (!selectedApp || !isDirty || isSubmitting) return;

    const timer = setTimeout(() => {
      handleScoreSubmit(true, false); // Save as draft automatically
    }, 30000); // Auto-save after 30 seconds of inactivity

    return () => clearTimeout(timer);
  }, [criteria, notes, selectedApp, isDirty, isSubmitting]);

  const totalScore = criteria.story + criteria.technical + criteria.originality + criteria.themeFit;
  const embedUrl = selectedApp?.team.videoUrl ? getYouTubeEmbedUrl(selectedApp.team.videoUrl) : null;

  const getJuryCode = (id: string) => {
      let hash = 0;
      for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
      // Increased length to 6 characters for better uniqueness
      return `J-${Math.abs(hash).toString().slice(0, 6)}`;
  };

  const getStatusBadge = (appId: string) => {
      const score = myScores[appId];
      if (!score) return null;
      if (score.isRecused) return <div className="absolute top-3 right-3 z-20 bg-gray-600 text-white text-[10px] font-black px-2 py-1 rounded shadow-lg uppercase tracking-wider flex items-center gap-1"><Ban size={10} /> Pas Geçildi</div>;
      if (score.isDraft) return <div className="absolute top-3 right-3 z-20 bg-amber-500 text-black text-[10px] font-black px-2 py-1 rounded shadow-lg uppercase tracking-wider flex items-center gap-1"><FileEdit size={10} /> Taslak</div>;
      return <div className="absolute top-3 right-3 z-20 bg-green-500 text-black text-[10px] font-black px-2 py-1 rounded shadow-lg uppercase tracking-wider flex items-center gap-1"><CheckCircle size={10} /> Puanlandı</div>;
  };

  const currentIndex = selectedApp ? filteredApps.findIndex(a => a.id === selectedApp.id) : -1;
  const hasNext = currentIndex < filteredApps.length - 1;
  const hasPrev = currentIndex > 0;

  return (
    <div className="bg-slate-950 min-h-screen text-slate-200 font-sans selection:bg-rose-500 selection:text-white pb-20">
      
      {/* Header */}
      <div className="sticky top-0 md:top-20 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 shadow-xl transition-all">
          <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-4">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
                  <div>
                      <h1 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-3">
                          <Video className="text-rose-500" /> Jüri Değerlendirme Paneli
                      </h1>
                      <p className="text-slate-500 text-xs md:text-sm mt-1 hidden md:block">Hoş geldiniz, {currentUser?.fullName}.</p>
                  </div>
                  
                  {/* Progress Bar Widget */}
                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl w-full md:min-w-[250px] md:w-auto flex flex-col gap-2">
                      <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-400">İlerleme</span>
                          <span className={stats.percent === 100 ? "text-green-500" : "text-white"}>{stats.graded} / {stats.total} (%{stats.percent})</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div 
                              className={`h-full transition-all duration-1000 ease-out ${stats.percent === 100 ? 'bg-green-500' : 'bg-rose-500'}`} 
                              style={{ width: `${stats.percent}%` }}
                          ></div>
                      </div>
                  </div>
              </div>

              {/* Filters */}
              <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                  <button onClick={() => setFilter('ALL')} className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all flex items-center gap-2 whitespace-nowrap ${filter === 'ALL' ? 'bg-slate-800 text-white border-slate-600' : 'text-slate-500 border-transparent hover:bg-slate-900'}`}>
                      <LayoutGrid size={14}/> Tümü
                  </button>
                  <button onClick={() => setFilter('GRADED')} className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all flex items-center gap-2 whitespace-nowrap ${filter === 'GRADED' ? 'bg-green-900/20 text-green-400 border-green-900/50' : 'text-slate-500 border-transparent hover:bg-slate-900'}`}>
                      <CheckSquare size={14}/> Tamamlananlar
                  </button>
                  <button onClick={() => setFilter('DRAFT')} className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all flex items-center gap-2 whitespace-nowrap ${filter === 'DRAFT' ? 'bg-amber-900/20 text-amber-400 border-amber-900/50' : 'text-slate-500 border-transparent hover:bg-slate-900'}`}>
                      <FileEdit size={14}/> Taslaklar
                  </button>
                  <button onClick={() => setFilter('PENDING')} className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all flex items-center gap-2 whitespace-nowrap ${filter === 'PENDING' ? 'bg-slate-800/50 text-slate-300 border-slate-700' : 'text-slate-500 border-transparent hover:bg-slate-900'}`}>
                      <Clock size={14}/> Bekleyenler
                  </button>
              </div>
          </div>
      </div>

      <div className="max-w-[1600px] mx-auto p-4 md:p-8">
          
          {/* Info Banner */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-8 flex items-start gap-3">
              <AlertCircle className="text-amber-500 flex-shrink-0" size={20} />
              <div className="text-sm text-slate-400">
                  <strong className="text-white block mb-1">Adil Değerlendirme Hatırlatması</strong>
                  Bu ekranda okul, şehir ve öğretmen bilgileri gizlenmiştir. Lütfen sadece eserin sanatsal ve teknik niteliğine odaklanınız.
              </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {isLoadingScores ? (
                  <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-500 gap-3">
                      <Loader2 className="animate-spin text-rose-500" size={32} />
                      <span className="text-sm font-bold">Veriler Yükleniyor...</span>
                  </div>
              ) : filteredApps.length === 0 ? (
                  <div className="col-span-full text-center py-20 bg-slate-900/50 rounded-2xl border border-slate-800 border-dashed">
                      <Filter size={48} className="mx-auto mb-4 text-slate-700"/>
                      <p className="text-slate-500 font-medium">Bu filtreye uygun eser bulunamadı.</p>
                  </div>
              ) : (
                  filteredApps.map(app => {
                   const score = myScores[app.id];
                   const juryCode = getJuryCode(app.id);
                   const isDraft = score?.isDraft;
                   const isDone = score && !isDraft; // Final or Recused

                   return (
                       <div 
                        key={app.id} 
                        onClick={() => openGrading(app)}
                        className={`bg-slate-900 rounded-xl overflow-hidden border transition-all duration-300 cursor-pointer group relative shadow-xl hover:-translate-y-1 ${isDone ? 'border-green-900/30 opacity-75 hover:opacity-100' : isDraft ? 'border-amber-500/50' : 'border-slate-800 hover:border-rose-500'}`}
                       >
                           {/* Thumbnail Area - ANONYMIZED */}
                           <div className="aspect-video bg-black relative flex items-center justify-center overflow-hidden">
                               <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10 opacity-60"></div>
                               
                               {/* ALWAYS show generic placeholder, never the logo */}
                               <div className="text-slate-700"><Video size={48} /></div>
                               
                               <div className="absolute z-20 bg-white/10 p-4 rounded-full backdrop-blur-sm group-hover:scale-110 transition-transform shadow-xl border border-white/20">
                                   <Play className="fill-white text-white" size={24} />
                               </div>
                               
                               {getStatusBadge(app.id)}
                           </div>

                           <div className="p-5">
                               {/* Team Name Anonymized */}
                               <h3 className="font-bold text-lg text-white mb-2 truncate leading-tight">Yarışma Eseri</h3>
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
                                    <span className="font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded font-bold">{juryCode}</span>
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
                   <button onClick={handleCloseModal} className="absolute top-4 right-4 z-50 bg-black/50 p-2 rounded-full text-white hover:bg-rose-600 transition-colors">
                       <X size={24} />
                   </button>

                   {/* Left: Video Player & Navigation */}
                   <div className="flex-1 bg-black flex flex-col relative group">
                        
                        {/* Navigation Overlay (Visible on Hover) */}
                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 z-30 pointer-events-none">
                            <button 
                                onClick={() => navigateApp('prev')} 
                                disabled={!hasPrev}
                                className={`pointer-events-auto p-3 rounded-full bg-black/50 text-white backdrop-blur-md transition-all hover:bg-rose-600 ${!hasPrev ? 'opacity-0' : 'opacity-100'}`}
                            >
                                <ChevronLeft size={32} />
                            </button>
                            <button 
                                onClick={() => navigateApp('next')} 
                                disabled={!hasNext}
                                className={`pointer-events-auto p-3 rounded-full bg-black/50 text-white backdrop-blur-md transition-all hover:bg-rose-600 ${!hasNext ? 'opacity-0' : 'opacity-100'}`}
                            >
                                <ChevronRight size={32} />
                            </button>
                        </div>

                        <div className="flex-1 flex items-center justify-center relative">
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
                        
                        {/* Mobile Navigation Bar (Bottom) */}
                        <div className="lg:hidden flex justify-between items-center p-4 bg-slate-900 border-t border-slate-800">
                             <button disabled={!hasPrev} onClick={() => navigateApp('prev')} className="text-slate-400 disabled:opacity-30"><ChevronLeft size={24}/></button>
                             <span className="text-xs font-bold text-slate-500">{currentIndex + 1} / {filteredApps.length}</span>
                             <button disabled={!hasNext} onClick={() => navigateApp('next')} className="text-slate-400 disabled:opacity-30"><ChevronRight size={24}/></button>
                        </div>
                   </div>

                   {/* Right: Grading Form */}
                   <div className="w-full lg:w-[450px] bg-slate-900 border-l border-slate-800 flex flex-col h-[60vh] lg:h-full relative">
                       
                       {/* Error Banner */}
                       {saveError && (
                           <div className="absolute top-0 left-0 right-0 bg-red-600 text-white text-xs font-bold p-3 text-center z-50 flex items-center justify-center gap-2 animate-pulse">
                               <CloudOff size={14}/> {saveError}
                               <button onClick={() => handleScoreSubmit(myScores[selectedApp.id]?.isDraft)} className="underline ml-2">Tekrar Dene</button>
                           </div>
                       )}

                       <div className="p-6 border-b border-slate-800 bg-slate-950/50">
                           <div className="flex justify-between items-start mb-2">
                               {/* Anonymized Title */}
                               <h2 className="text-2xl font-black text-white truncate">Yarışma Eseri</h2>
                               <span className="bg-slate-800 text-slate-400 text-[10px] font-mono px-2 py-1 rounded">{getJuryCode(selectedApp.id)}</span>
                           </div>
                           <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{selectedApp.team.category} • {selectedApp.team.theme}</p>
                           {selectedApp.team.theme === Theme.AYET && (
                               <p className="mt-2 text-xs text-amber-500 bg-amber-900/10 p-2 rounded border border-amber-900/30 italic">
                                   "{selectedApp.team.selectedVerse}"
                               </p>
                           )}
                           
                           {myScores[selectedApp.id]?.isDraft && (
                               <div className="mt-4 bg-amber-900/20 text-amber-300 text-xs p-3 rounded border border-amber-900/50 flex items-center gap-2 animate-pulse">
                                   <FileEdit size={14}/> Taslak Modu: Puanlarınız henüz kesinleşmedi.
                               </div>
                           )}
                           {myScores[selectedApp.id]?.isRecused && (
                               <div className="mt-4 bg-gray-800 text-gray-300 text-xs p-3 rounded border border-gray-700 flex items-center gap-2">
                                   <Ban size={14}/> Bu eser için çekimser oy kullandınız.
                               </div>
                           )}
                           
                           {lastSavedTime && !isDirty && !saveError && (
                               <div className="mt-2 text-[10px] text-green-500 flex items-center gap-1 justify-end">
                                   <CheckCircle size={10} /> Son kayıt: {lastSavedTime}
                               </div>
                           )}
                           {isDirty && (
                               <div className="mt-2 text-[10px] text-amber-500 flex items-center gap-1 justify-end font-bold animate-pulse">
                                   <AlertTriangle size={10} /> Kaydedilmemiş değişiklikler
                               </div>
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
                               <div key={c.id} className="group/slider">
                                   <div className="flex justify-between mb-2 items-end">
                                       <div>
                                           <label className="text-sm font-bold text-slate-200 block flex items-center gap-2">
                                               {c.label}
                                               <div className="group relative">
                                                   <Info size={12} className="text-slate-600 cursor-help" />
                                                   <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-slate-300 text-[10px] rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 border border-slate-700">
                                                       {c.desc}
                                                   </div>
                                               </div>
                                           </label>
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

                       <div className="p-6 border-t border-slate-800 bg-slate-950 space-y-4">
                           <div className="flex justify-between items-center mb-2">
                               <span className="text-xs font-bold text-slate-500 uppercase">Toplam Puan</span>
                               <span className={`text-4xl font-black ${totalScore > 80 ? 'text-green-500' : totalScore > 50 ? 'text-amber-500' : 'text-slate-500'}`}>
                                   {totalScore}<span className="text-lg text-slate-600 ml-1">/100</span>
                               </span>
                           </div>
                           
                           <div className="grid grid-cols-2 gap-3">
                               <button 
                                 onClick={() => handleScoreSubmit(true, false)}
                                 disabled={isSubmitting}
                                 className="bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                               >
                                   <FileEdit size={16}/> Taslak Kaydet
                               </button>
                               {saveError ? (
                                   <button 
                                     onClick={() => handleScoreSubmit(false, false)}
                                     className="bg-red-600 hover:bg-red-500 text-white py-3 rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-2 shadow-lg"
                                   >
                                       <RefreshCcw size={16}/> Tekrar Dene
                                   </button>
                               ) : (
                                   <button 
                                     onClick={() => handleScoreSubmit(false, false)}
                                     disabled={isSubmitting}
                                     className="bg-rose-600 hover:bg-rose-500 text-white py-3 rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-rose-900/20"
                                   >
                                       {isSubmitting ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>} 
                                       Puanı Gönder
                                   </button>
                               )}
                           </div>
                           
                           <button 
                                onClick={() => handleScoreSubmit(false, true)}
                                className="w-full text-xs text-slate-500 hover:text-slate-300 flex items-center justify-center gap-1 transition-colors py-2"
                           >
                               <Ban size={12}/> Bu takımı tanıyorum (Çekimser Kal)
                           </button>
                       </div>
                   </div>
               </div>
           </div>
      )}
    </div>
  );
};