import React from 'react';
import {
  CheckCircle2, Lock, Copy, Film, Youtube, CheckSquare, AlertCircle,
} from 'lucide-react';
import { useDashboardUI } from '../DashboardUIContext';


export function DashboardVideoTab() {
  const {
    currentApplication, IS_DEADLINE_PASSED, systemSettings,
    allVideoChecksPassed,
    videoChecklist, setVideoChecklist, videoLink, setVideoLink, confirmVideoSubmission,
  } = useDashboardUI();

  return (
                    <div className="max-w-5xl mx-auto space-y-12">
                        
                        {/* Video Upload Guide */}
                        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border-2 border-rose-500/20 rounded-[2.5rem] p-10 relative overflow-hidden shadow-2xl group">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-[100px] pointer-events-none -mr-20 -mt-20"></div>
                            <h3 className="text-xl font-black text-white uppercase tracking-widest mb-10 flex items-center gap-3">
                                <Youtube size={24} className="text-red-500"/> Video Yükleme Rehberi
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
                                {[
                                    { icon: Youtube, title: '1. YouTube\'a Yükle', desc: 'Hazırladığınız filmi kendi kanalınıza yükleyin.' },
                                    { icon: Lock, title: '2. Liste Dışı Yap', desc: 'Gizlilik ayarını "Liste Dışı" (Unlisted) olarak seçin.' },
                                    { icon: Copy, title: '3. Linki Kopyala', desc: 'Videonun izleme bağlantısını (URL) kopyalayın.' },
                                    { icon: CheckCircle2, title: '4. Panele Yapıştır', desc: 'Linki aşağıya yapıştırıp onaylayın.' }
                                ].map((step, i) => (
                                    <div key={i} className="flex flex-col items-center text-center group/item hover:-translate-y-1 transition-transform duration-300">
                                        <div className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center mb-6 border-2 border-slate-700 group-hover/item:border-rose-500 group-hover/item:bg-slate-900 transition-all shadow-xl">
                                            <step.icon size={32} className="text-slate-400 group-hover/item:text-rose-400 transition-colors" />
                                        </div>
                                        <h4 className="text-white font-bold text-lg mb-2">{step.title}</h4>
                                        <p className="text-sm text-slate-400 leading-relaxed font-light max-w-[200px]">{step.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Submission Form */}
                        <div className="relative bg-black rounded-[2rem] border-4 border-slate-800 shadow-2xl overflow-hidden group">
                            {/* Curtain Effect */}
                            <div className="absolute top-0 left-0 w-12 h-full bg-gradient-to-r from-red-950 to-transparent opacity-50 z-10"></div>
                            <div className="absolute top-0 right-0 w-12 h-full bg-gradient-to-l from-red-950 to-transparent opacity-50 z-10"></div>
                            
                            <div className="p-12 md:p-16 flex flex-col items-center justify-center text-center relative z-20">
                                <div className="w-24 h-24 bg-rose-600 rounded-full flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(225,29,72,0.5)] animate-pulse">
                                    <Film size={40} className="text-white"/>
                                </div>
                                <h3 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">Final Sahnesi</h3>
                                <p className="text-xl text-slate-400 mb-10 max-w-2xl leading-relaxed">
                                    Filminizi jüriyle buluşturmak için YouTube linkini aşağıya giriniz.
                                </p>

                                <div className="w-full max-w-2xl bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-8 text-left">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 border-b border-slate-800 pb-2">Yönetmen Kontrol Listesi</h4>
                                    
                                    <div className="mb-6">
                                        <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">YouTube Video Linki</label>
                                        <div className="flex gap-2">
                                            <input 
                                                value={videoLink}
                                                onChange={(e) => setVideoLink(e.target.value)}
                                                placeholder="https://youtu.be/..." 
                                                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl p-4 text-white focus:border-rose-500 outline-none text-sm transition-colors"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {[
                                            { id: 'resolution', label: '1080p Çözünürlük (FHD)' },
                                            { id: 'audio', label: 'Ses Dili: İngilizce' },
                                            { id: 'credits', label: 'Türkçe Altyazı & Jenerik' },
                                            { id: 'copyright', label: 'Telif Hakkı İhlali Yok' }
                                        ].map(item => (
                                            <div 
                                                key={item.id} 
                                                onClick={() => !IS_DEADLINE_PASSED && setVideoChecklist(prev => ({...prev, [item.id]: !prev[item.id as keyof typeof videoChecklist]}))}
                                                className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer border transition-all ${videoChecklist[item.id as keyof typeof videoChecklist] ? 'bg-green-900/20 border-green-500/50' : 'bg-slate-950 border-slate-800 hover:border-slate-600'} ${IS_DEADLINE_PASSED ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                <div className={`w-6 h-6 rounded flex items-center justify-center border transition-colors ${videoChecklist[item.id as keyof typeof videoChecklist] ? 'bg-green-500 border-green-500' : 'border-slate-600'}`}>
                                                    {videoChecklist[item.id as keyof typeof videoChecklist] && <CheckSquare size={16} className="text-white" />}
                                                </div>
                                                <span className={`font-bold ${videoChecklist[item.id as keyof typeof videoChecklist] ? 'text-white' : 'text-slate-400'}`}>{item.label}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {IS_DEADLINE_PASSED && (
                                        <div className="mt-6 p-4 bg-red-900/40 border border-red-500/50 rounded-xl text-red-200 text-sm font-bold flex items-center gap-2">
                                            <AlertCircle size={20} className="text-red-500 shrink-0" />
                                            Video teslimi kapalı
                                            {systemSettings?.dates?.videoUploadEnd
                                              ? ` (bitiş: ${new Date(systemSettings.dates.videoUploadEnd).toLocaleString('tr-TR')})`
                                              : ' (yükleme anahtarı kapalı veya süre doldu)'}.
                                        </div>
                                    )}

                                    <button type="button" 
                                        onClick={confirmVideoSubmission} 
                                        disabled={!allVideoChecksPassed || IS_DEADLINE_PASSED}
                                        className={`w-full mt-8 py-5 rounded-xl font-black text-lg uppercase tracking-wider shadow-xl transition-all ${allVideoChecksPassed && !IS_DEADLINE_PASSED ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/30 hover:-translate-y-1' : 'bg-slate-800 text-slate-600 cursor-not-allowed'}`}
                                    >
                                        {IS_DEADLINE_PASSED ? 'Süre Doldu' : currentApplication.team.videoStatus === 'SUBMITTED_LINK' ? 'Linki Güncelle' : allVideoChecksPassed ? 'Teslimi Onayla ve Bitir' : 'Listeyi Tamamlayın'}
                                    </button>
                                    
                                    {currentApplication.team.videoStatus === 'SUBMITTED_LINK' && (
                                        <p className="mt-4 text-center text-xs text-green-500 font-bold flex items-center justify-center gap-2">
                                            <CheckCircle2 size={14}/> Video linki başarıyla teslim edildi.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
  );
}

