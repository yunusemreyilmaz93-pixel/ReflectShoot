import React from 'react';
import {
  Users, CheckCircle2, Clock, Lock, Info, Printer, Sparkles, ArrowRight, Trophy,
  Bell, FileCheck,
} from 'lucide-react';
import { Theme } from '../../../types';
import { verseDetails } from '../../../data/verses';
import { AcademicJuryScorePanel } from '../../../components/AcademicJuryScorePanel';
import { getJuryFeedback } from '../../../data/juryFeedback';
import { downloadCertificate } from '../../../lib/certificates';
import { useDashboardUI } from '../DashboardUIContext';


export function DashboardStatusTab() {
  const {
    currentUser, currentApplication, myApplications, activeApplicationId, setActiveApplicationId,
    systemSettings, missingDocsCount, remainingDays,
    renderVerseText,
    handleActionRedirect,
    showToast,
  } = useDashboardUI();
  const seasonLabel = systemSettings?.season?.label || 'Güncel sezon';

  return (
                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Left Column */}
                        <div className="space-y-8">
                            {/* Academic Jury Score Card for Winner Teams */}
                            {currentApplication.team.isWinner && (
                                <div className="bg-slate-900 p-8 rounded-[2rem] border border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.05)] relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-[40px] pointer-events-none"></div>
                                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800">
                                        <h3 className="font-bold text-white flex items-center gap-3 text-lg">
                                            <Trophy size={22} className="text-amber-500"/> Seçici Kurul Değerlendirme Raporu
                                        </h3>
                                        <span className="px-3 py-1 bg-amber-500/10 text-amber-500 text-[10px] font-black rounded-full uppercase tracking-wider">
                                            AKADEMİK SKOR YAPISI
                                        </span>
                                    </div>
                                    <AcademicJuryScorePanel 
                                        teamName={currentApplication.team.name} 
                                        category={currentApplication.team.category} 
                                        hideMetaData={false} 
                                    />
                                    {/* Evaluation Report / Feedback Text Area */}
                                    <div className="mt-6 border-t border-slate-800 pt-6">
                                        <span className="text-[12.5px] font-black uppercase text-slate-400 tracking-wider">Seçici Kurul Görüşü</span>
                                        <p className="text-[13px] text-slate-200 leading-relaxed font-semibold mt-1.5 bg-slate-950/40 p-5 border border-slate-850 rounded-2xl text-justify leading-relaxed select-text">
                                            {getJuryFeedback(
                                                currentApplication.team.name, 
                                                currentApplication.team.category, 
                                                [], 
                                                null, 
                                                currentApplication.team.awardCategory || ''
                                            )}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Multi-Team Overview Card */}
                            {myApplications.length > 1 && (
                                <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-[2rem] border border-slate-800/50 shadow-xl">
                                    <h3 className="font-bold text-white flex items-center gap-3 text-lg mb-6">
                                        <Users size={22} className="text-rose-500"/> Tüm Takımlarım
                                    </h3>
                                    <div className="grid gap-3">
                                        {myApplications.map((app, idx) => (
                                            <button type="button" 
                                                key={app.id}
                                                onClick={() => setActiveApplicationId(app.id)}
                                                className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                                                    activeApplicationId === app.id 
                                                    ? 'bg-rose-500/10 border-rose-500/50 shadow-lg' 
                                                    : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                                                }`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${activeApplicationId === app.id ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                                                        {idx + 1}
                                                    </div>
                                                    <div className="text-left">
                                                        <span className="block text-sm font-bold text-white">{app.team.name}</span>
                                                        <span className="block text-[10px] uppercase font-black tracking-widest text-slate-500">{app.status}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {app.team.videoStatus === 'SUBMITTED_LINK' ? (
                                                        <CheckCircle2 size={16} className="text-green-500" />
                                                    ) : (
                                                        <Clock size={16} className="text-amber-500" />
                                                    )}
                                                    <ArrowRight size={14} className="text-slate-600" />
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 shadow-xl relative overflow-hidden group">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="font-bold text-white flex items-center gap-3 text-lg"><Info size={22} className="text-teal-500"/> Proje Teması</h3>
                                </div>
                                
                                <div className="space-y-6 relative z-10">
                                    {/* Theme Display (Read-Only) */}
                                    <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                                        <span className="text-slate-500 font-medium">Seçilen Tema</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-white font-bold text-lg">{currentApplication.team.theme}</span>
                                            <Lock size={14} className="text-slate-600" />
                                        </div>
                                    </div>

                                    {/* Display Area */}
                                    <div className="mt-6">
                                        {currentApplication.team.theme === Theme.AYET && currentApplication.team.selectedVerse && verseDetails[currentApplication.team.selectedVerse] ? (
                                            <div className="p-6 bg-slate-950/50 border border-slate-800 rounded-2xl space-y-4 shadow-inner relative group/verse">
                                                <div className="absolute -top-3 left-4 px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-[10px] font-black text-amber-500 tracking-wider">
                                                    {currentApplication.team.selectedVerse}
                                                </div>
                                                <p className="text-right text-2xl font-serif text-amber-400 leading-loose pt-2" dir="rtl">
                                                    {renderVerseText(verseDetails[currentApplication.team.selectedVerse].arabic, true)}
                                                </p>
                                                <div className="w-full h-px bg-slate-800"></div>
                                                <p className="text-sm text-slate-300 italic leading-relaxed">
                                                    "{renderVerseText(verseDetails[currentApplication.team.selectedVerse].turkish, false)}"
                                                </p>
                                            </div>
                                        ) : (currentApplication.team.theme === Theme.HADITH || currentApplication.team.theme === Theme.SAHABE) ? (
                                            <div className="p-8 bg-slate-950/50 border border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center gap-4">
                                                <div className={`w-16 h-16 ${currentApplication.team.theme === Theme.HADITH ? 'bg-amber-500/10 text-amber-500' : 'bg-teal-500/10 text-teal-500'} rounded-full flex items-center justify-center`}>
                                                    {currentApplication.team.theme === Theme.HADITH ? <Sparkles size={32} /> : <Users size={32} />}
                                                </div>
                                                <div>
                                                    <h4 className="text-white font-bold mb-2">{currentApplication.team.selectedTopic || (currentApplication.team.theme === Theme.HADITH ? 'Hadis-i Şerif' : 'Sahabe Hikayesi')}</h4>
                                                    <p className="text-slate-400 text-sm leading-relaxed max-w-[300px]">
                                                        {currentApplication.team.theme === Theme.HADITH 
                                                            ? 'Seçilen hadis-i şerif üzerine kurgulanan sinematik eser.' 
                                                            : 'Seçilen sahabe efendimizin hayatından bir kesit sunan sinematik eser.'}
                                                    </p>
                                                    <p className="text-slate-500 text-[10px] mt-4 uppercase tracking-widest">{currentApplication.team.theme}</p>
                                                </div>
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                            </div>

                            {/* Dijital Sertifikalar */}
                            <div className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 shadow-xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-[40px] pointer-events-none"></div>
                                <div className="relative z-10">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="font-bold text-white flex items-center gap-3 text-lg">
                                            <Trophy size={22} className="text-amber-500"/> Dijital Sertifikalar
                                        </h3>
                                        <span className="px-3 py-1 bg-amber-500/10 text-amber-500 text-[10px] font-black rounded-full uppercase tracking-wider">
                                            E-Belge
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                                        Reflect & Shoot Kısa Film Yarışması kapsamında danışman öğretmen ve öğrenci katılım belgelerinizi aşağıdaki bağlantılardan indirebilirsiniz.
                                    </p>

                                    {/* Bilgi Paneli */}
                                    <div className="bg-emerald-950/25 border border-emerald-500/30 text-emerald-400 p-3.5 rounded-xl text-xs mb-6 flex items-start gap-2.5">
                                        <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-500" />
                                        <div>
                                            <span className="font-bold block mb-0.5">Sertifikalarınız Hazır!</span>
                                            <span>{seasonLabel} için tüm katılım ve teşekkür belgeleri hazırlanmıştır. Hem kendiniz için danışman sertifikasını hem de öğrencilerinizin katılım belgelerini anında indirip kaydedebilirsiniz.</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {/* Danışman Öğretmen Belgesi */}
                                        <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 flex items-center justify-between">
                                            <div>
                                                <span className="text-[9px] uppercase font-black text-slate-500 tracking-wider block">Danışman Öğretmen</span>
                                                <span className="text-sm font-bold text-white">{currentApplication?.teacher?.fullName || currentUser?.fullName}</span>
                                            </div>
                                            <button type="button" 
                                                onClick={() => {
                                                    const teacherName = currentApplication?.teacher?.fullName || currentUser?.fullName || "";
                                                    downloadCertificate({
                                                        recipientName: teacherName,
                                                        type: 'APPRECIATION',
                                                        showToast
                                                    });
                                                }}
                                                className="bg-amber-600 hover:bg-amber-500 text-slate-950 hover:-translate-y-1 transition-all py-2 px-4 rounded-xl text-xs font-black shadow-lg shadow-amber-950/20 flex items-center gap-1.5 cursor-pointer"
                                            >
                                                <Printer size={13}/> İndir (PDF)
                                            </button>
                                        </div>

                                        <div className="w-full h-px bg-slate-800/60 my-4"></div>
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Öğrenci Kadrosu</span>
                                        
                                        <div className="grid gap-2 max-h-[220px] overflow-y-auto pr-1 scrollbar-hide">
                                            {currentApplication.team.students.map((student) => {
                                                return (
                                                    <div key={student.id} className="p-3 bg-slate-950/40 border border-slate-800/80 rounded-xl flex items-center justify-between hover:border-slate-700 transition-colors">
                                                        <div>
                                                            <span className="text-xs font-bold text-slate-200">{student.firstName} {student.lastName}</span>
                                                            <span className="text-[9px] font-bold text-slate-600 uppercase block">{student.grade} - Öğrenci</span>
                                                        </div>
                                                        <button type="button" 
                                                            onClick={() => {
                                                                downloadCertificate({
                                                                    recipientName: `${student.firstName} ${student.lastName}`,
                                                                    type: 'ATTENDANCE',
                                                                    showToast
                                                                });
                                                            }}
                                                            className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all py-1.5 px-3 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                                                        >
                                                            <Printer size={11}/> Belge
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 shadow-xl">
                                <h3 className="font-bold text-white mb-6 flex items-center gap-3 text-lg"><Bell size={22} className="text-amber-500"/> Hatırlatıcılar</h3>
                                <div className="space-y-4">
                                    <div className="p-5 bg-rose-900/10 border border-rose-500/20 rounded-2xl flex gap-4 transition-transform hover:scale-[1.02]">
                                        <div className="w-12 h-12 bg-rose-500/20 rounded-xl flex items-center justify-center flex-shrink-0"><Clock className="text-rose-500" size={24}/></div>
                                        <div>
                                            <p className="font-bold text-rose-200">Video Teslimi</p>
                                            <p className="text-xs text-slate-400 mt-1">Son teslim tarihine <strong className="text-white">{remainingDays} gün</strong> kaldı. ({new Date(systemSettings.dates.videoUploadEnd).toLocaleDateString()})</p>
                                        </div>
                                    </div>
                                    <div className="p-5 bg-teal-900/10 border border-teal-500/20 rounded-2xl flex gap-4 transition-transform hover:scale-[1.02]">
                                        <div className="w-12 h-12 bg-teal-500/20 rounded-xl flex items-center justify-center flex-shrink-0"><FileCheck className="text-teal-500" size={24}/></div>
                                        <div>
                                            <p className="font-bold text-teal-200">Belge Onayları</p>
                                            {missingDocsCount > 0 ? (
                                                <p className="text-xs text-slate-400 mt-1">Takımda <strong className="text-white">{missingDocsCount} adet</strong> eksik belge bulunuyor.</p>
                                            ) : (
                                                <p className="text-xs text-green-400 mt-1">Harika! Tüm belgeler tamamlandı.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Timeline */}
                        <div className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 shadow-xl">
                            <h3 className="font-bold text-white mb-8 flex items-center gap-3 text-lg"><Clock size={22} className="text-blue-500"/> Süreç Takibi</h3>
                            <div className="space-y-8 relative pl-4">
                                <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-slate-800"></div>
                                {[
                                    { label: 'Başvuru Oluşturuldu', done: true, date: new Date(currentApplication.submittedAt).toLocaleDateString() },
                                    { label: 'Belgeler Tamamlandı', done: currentApplication.team.students.every(s => s.hasParentalConsent && s.hasKvkkConsent) },
                                    { label: 'Video Teslim Edildi', done: currentApplication.team.videoStatus !== 'PENDING' },
                                    { label: 'Ön Eleme Sonucu', done: currentApplication.team.isPreliminaryStageComplete },
                                    { label: 'Ödül Töreni', done: false }
                                ].map((step, i) => (
                                    <div key={i} className="relative flex items-center gap-6 group">
                                        <div className={`w-6 h-6 rounded-full border-4 relative z-10 flex-shrink-0 transition-all duration-500 ${step.done ? 'bg-green-500 border-slate-900 shadow-[0_0_15px_rgba(34,197,94,0.5)]' : 'bg-slate-800 border-slate-900'}`}></div>
                                        <div className={`flex-1 p-4 rounded-2xl border transition-all ${step.done ? 'bg-slate-800 border-slate-700' : 'bg-transparent border-transparent opacity-50'}`}>
                                            <p className={`text-sm font-bold ${step.done ? 'text-white' : 'text-slate-500'}`}>{step.label}</p>
                                            {step.date && <p className="text-[10px] text-slate-500 mt-1 font-mono">{step.date}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
  );
}

