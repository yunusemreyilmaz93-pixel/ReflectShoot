import React from 'react';
import { motion } from 'motion/react';
import {
  Clapperboard, Users, FileText, Video, MessageSquare, AlertCircle,
  CheckCircle2, Clock, Upload, X, Save, Film, HelpCircle, LogOut, Ban, ShieldAlert,
  Download, Lock, ExternalLink, RefreshCw, FileCheck, BookOpen, Eye, Calendar, Bell, Copy, Info, Loader2, File,
  Plus, Trash2, Edit, AlertOctagon, CheckSquare, Camera, PenTool, Printer, ShieldCheck,
  Sparkles, ArrowRight, UploadCloud, Megaphone, Star, PartyPopper, User, RefreshCcw, Youtube, Trophy
} from 'lucide-react';
import { Category, Theme, ApplicationStatus, UserRole } from '../../../types';
import { versesList, verseDetails } from '../../../data/verses';
import { AcademicJuryScorePanel } from '../../../components/AcademicJuryScorePanel';
import { getJuryFeedback } from '../../../data/juryFeedback';
import { CertificateGenerator } from '../../../components/CertificateGenerator';
import { downloadCertificate } from '../../../lib/certificates';
import { useDashboardUI } from '../DashboardUIContext';


export function DashboardDocumentsTab() {
  const {
    currentUser, currentApplication, myApplications, activeApplicationId, setActiveApplicationId,
    systemSettings, cmsAcademy, IS_DEADLINE_PASSED, progress, missingDocsCount, remainingDays,
    allVideoChecksPassed, pendingTheme, setPendingTheme, pendingVerse, setPendingVerse,
    pendingTopic, setPendingTopic, isSavingTheme, hasThemeChanges, handleSaveTheme, renderVerseText,
    uploadingDoc, selectedFiles, verifyCodes, declarationModal, declarationAccepted, setDeclarationAccepted,
    handleOpenStudentModal, handleDeleteStudent, handleGenerateCode, copyCode,
    handleOpenDeclarationModal, handleConfirmDeclaration, handleFileSelect, handleDocUpload, handleDeleteDoc,
    videoChecklist, setVideoChecklist, videoLink, setVideoLink, confirmVideoSubmission,
    handleActionRedirect, getCategoryStyle, getTeacherCertificateUrl, getStudentCertificateUrl,
    TEMPLATE_PARENT_URL, TEMPLATE_CONSENT_URL,
    showToast, setVerifyCodes,
  } = useDashboardUI();

  return (
                    <div className="space-y-12">
                        {/* Guide Section */}
                        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border-2 border-blue-500/20 rounded-[2.5rem] p-10 relative overflow-hidden shadow-2xl group">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none -mr-20 -mt-20"></div>
                            <h3 className="text-xl font-black text-white uppercase tracking-widest mb-10 flex items-center gap-3">
                                <Info size={24} className="text-blue-500"/> Belge Yükleme Rehberi
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
                                {[
                                    { icon: RefreshCw, title: '1. Kodu Oluştur', desc: 'Sistemden her belge için benzersiz kod üret.' },
                                    { icon: PenTool, title: '2. Belgeye Yaz', desc: 'Kodu çıktısını aldığın belgenin üzerine el yazısıyla yaz.' },
                                    { icon: Camera, title: '3. PDF Olarak Tara', desc: 'İmzalı ve kodlu belgenizi PDF formatında taratın.' },
                                    { icon: Upload, title: '4. Sisteme Yükle', desc: 'Beyanı onayla ve dosyayı yükle.' }
                                ].map((step, i) => (
                                    <div key={i} className="flex flex-col items-center text-center group/item hover:-translate-y-1 transition-transform duration-300">
                                        <div className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center mb-6 border-2 border-slate-700 group-hover/item:border-blue-500 group-hover/item:bg-slate-900 transition-all shadow-xl">
                                            <step.icon size={32} className="text-slate-400 group-hover/item:text-blue-400 transition-colors" />
                                        </div>
                                        <h4 className="text-white font-bold text-lg mb-2">{step.title}</h4>
                                        <p className="text-sm text-slate-400 leading-relaxed font-light max-w-[200px]">{step.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Download Cards */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <a href={TEMPLATE_PARENT_URL} target="_blank" className="group bg-slate-900 p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-amber-900/20 rounded-xl text-amber-500 border border-amber-900/50">
                                        <Download size={24}/>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white group-hover:text-amber-500 transition-colors">Veli İzin Belgesi</h4>
                                        <p className="text-xs text-slate-500">İndir, yazdır ve veliye imzalat.</p>
                                    </div>
                                </div>
                                <ExternalLink size={16} className="text-slate-600 group-hover:text-white transition-colors" />
                            </a>
                            <a href={TEMPLATE_CONSENT_URL} target="_blank" className="group bg-slate-900 p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-teal-900/20 rounded-xl text-teal-500 border border-teal-900/50">
                                        <Download size={24}/>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white group-hover:text-teal-500 transition-colors">KVKK Açık Rıza Metni</h4>
                                        <p className="text-xs text-slate-500">İndir, yazdır ve imzalat.</p>
                                    </div>
                                </div>
                                <ExternalLink size={16} className="text-slate-600 group-hover:text-white transition-colors" />
                            </a>
                        </div>

                        {/* Cast Grid */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {currentApplication.team.students.map((student, idx) => (
                                <motion.div 
                                    key={student.id} 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative"
                                >
                                    
                                    {/* Student Header */}
                                    <div className="p-6 pb-4 flex justify-between items-start">
                                        <div>
                                            <h4 className="font-black text-white text-xl leading-tight">{student.firstName} {student.lastName}</h4>
                                            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">{student.grade}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button type="button" 
                                                onClick={() => handleOpenStudentModal(student)}
                                                className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                                                title="Düzenle"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button type="button" 
                                                onClick={() => handleDeleteStudent(student.id)}
                                                className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-900/20 rounded-lg transition-colors"
                                                title="Sil"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Documents Sections */}
                                    <div className="px-6 pb-6 space-y-4">
                                        {/* 1. Parent Consent */}
                                        <div className="bg-slate-950/50 rounded-2xl border border-dashed border-slate-800 p-5 relative group/section hover:border-slate-700 transition-colors">
                                            <div className="flex justify-between items-center mb-4">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">VELİ İZİN BELGESİ</span>
                                                {student.hasParentalConsent && (
                                                    <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded border ${
                                                        student.docStatus === 'APPROVED' ? 'bg-green-900/20 text-green-500 border-green-900/50' :
                                                        student.docStatus === 'REJECTED' ? 'bg-red-900/20 text-red-500 border-red-900/50' :
                                                        'bg-blue-900/20 text-blue-500 border-blue-900/50'
                                                    }`}>
                                                        {student.docStatus === 'APPROVED' ? <CheckSquare size={12}/> : student.docStatus === 'REJECTED' ? <AlertOctagon size={12}/> : <Clock size={12}/>}
                                                        {student.docStatus === 'APPROVED' ? 'ONAYLANDI' : student.docStatus === 'REJECTED' ? 'REDDEDİLDİ' : 'İNCELEMEDE'}
                                                    </div>
                                                )}
                                            </div>

                                            {student.hasParentalConsent && student.docStatus !== 'REJECTED' ? (
                                                <div className="text-center py-4">
                                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${student.docStatus === 'APPROVED' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                                        {student.docStatus === 'APPROVED' ? <CheckCircle2 size={24} /> : <Clock size={24} />}
                                                    </div>
                                                    <p className={`text-xs font-bold ${student.docStatus === 'APPROVED' ? 'text-green-400' : 'text-blue-400'}`}>
                                                        {student.docStatus === 'APPROVED' ? 'Belge Onaylandı' : 'İnceleme Bekliyor'}
                                                    </p>
                                                    {student.docStatus !== 'APPROVED' && (
                                                        <button type="button" onClick={() => handleDeleteDoc(student.id, 'PARENT')} className="mt-4 text-[10px] text-red-400 hover:text-red-300 flex items-center justify-center gap-1 w-full py-2 hover:bg-red-900/10 rounded transition-colors">
                                                            <Trash2 size={12}/> Sil ve Yeniden Yükle
                                                        </button>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {student.docStatus === 'REJECTED' && student.rejectionReason && (
                                                        <div className="bg-red-900/20 border border-red-900/50 p-3 rounded-xl mb-3">
                                                            <p className="text-[10px] text-red-400 leading-tight">
                                                                <strong className="uppercase">Red Nedeni:</strong> {student.rejectionReason}
                                                            </p>
                                                        </div>
                                                    )}
                                                    {!student.parentalExpectedId ? (
                                                        <button type="button" onClick={() => handleGenerateCode(student.id, 'PARENT')} className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-colors border border-slate-700">
                                                            KODU OLUŞTUR
                                                        </button>
                                                    ) : (
                                                        <>
                                                            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center relative">
                                                                <span className="text-[9px] text-slate-500 uppercase tracking-wider block mb-1">Belgeye Yazılan Kod</span>
                                                                <div className="text-xl font-black text-rose-500 tracking-widest font-mono select-all">{student.parentalExpectedId}</div>
                                                                <p className="text-[9px] text-amber-500/80 mt-2 leading-tight">Bu kod hem sisteme girilmeli hem de belge üzerinde el yazısıyla yer almalıdır.</p>
                                                                <button type="button" onClick={() => copyCode(student.parentalExpectedId!)} className="absolute top-2 right-2 text-slate-600 hover:text-white"><Copy size={12}/></button>
                                                            </div>
                                                            
                                                            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2">
                                                                <span className="text-[10px] font-bold text-slate-500 uppercase">GİR:</span>
                                                                <input 
                                                                    value={verifyCodes[`${student.id}_PARENT`] || ''}
                                                                    onChange={(e) => setVerifyCodes({...verifyCodes, [`${student.id}_PARENT`]: e.target.value})}
                                                                    className="bg-transparent text-white text-sm font-bold w-full outline-none placeholder-slate-700"
                                                                    placeholder="Kodu Buraya Yazın"
                                                                    maxLength={12}
                                                                />
                                                            </div>

                                                            <input type="file" id={`file-input-${student.id}-PARENT`} className="hidden" accept=".pdf" onChange={(e) => handleFileSelect(e, `${student.id}_PARENT`)} />
                                                            
                                                            <div className="grid grid-cols-2 gap-3">
                                                                <button type="button" 
                                                                    onClick={() => document.getElementById(`file-input-${student.id}-PARENT`)?.click()}
                                                                    className={`py-3 rounded-xl text-xs font-bold transition-all border ${selectedFiles[`${student.id}_PARENT`] ? 'bg-slate-800 border-green-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                                                                >
                                                                    {selectedFiles[`${student.id}_PARENT`] ? 'Dosya Değiştir' : 'BELGEYİ SEÇ'}
                                                                </button>

                                                                <button type="button" 
                                                                    onClick={() => handleOpenDeclarationModal(student.id, 'PARENT')}
                                                                    disabled={!selectedFiles[`${student.id}_PARENT`]}
                                                                    className={`py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${selectedFiles[`${student.id}_PARENT`] ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/20 hover:bg-rose-500' : 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-800'}`}
                                                                >
                                                                    {uploadingDoc === `${student.id}_PARENT` ? <Loader2 className="animate-spin" size={14}/> : <UploadCloud size={14}/>} 
                                                                    YÜKLE
                                                                </button>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* 2. KVKK Consent */}
                                        <div className="bg-slate-950/50 rounded-2xl border border-dashed border-slate-800 p-5 relative group/section hover:border-slate-700 transition-colors">
                                            <div className="flex justify-between items-center mb-4">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">KVKK METNİ</span>
                                                {student.hasKvkkConsent && (
                                                    <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded border ${
                                                        student.docStatus === 'APPROVED' ? 'bg-green-900/20 text-green-500 border-green-900/50' :
                                                        student.docStatus === 'REJECTED' ? 'bg-red-900/20 text-red-500 border-red-900/50' :
                                                        'bg-blue-900/20 text-blue-500 border-blue-900/50'
                                                    }`}>
                                                        {student.docStatus === 'APPROVED' ? <CheckSquare size={12}/> : student.docStatus === 'REJECTED' ? <AlertOctagon size={12}/> : <Clock size={12}/>}
                                                        {student.docStatus === 'APPROVED' ? 'ONAYLANDI' : student.docStatus === 'REJECTED' ? 'REDDEDİLDİ' : 'İNCELEMEDE'}
                                                    </div>
                                                )}
                                            </div>

                                            {student.hasKvkkConsent && student.docStatus !== 'REJECTED' ? (
                                                <div className="text-center py-4">
                                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${student.docStatus === 'APPROVED' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                                        {student.docStatus === 'APPROVED' ? <CheckCircle2 size={24} /> : <Clock size={24} />}
                                                    </div>
                                                    <p className={`text-xs font-bold ${student.docStatus === 'APPROVED' ? 'text-green-400' : 'text-blue-400'}`}>
                                                        {student.docStatus === 'APPROVED' ? 'Belge Onaylandı' : 'İnceleme Bekliyor'}
                                                    </p>
                                                    {student.docStatus !== 'APPROVED' && (
                                                        <button type="button" onClick={() => handleDeleteDoc(student.id, 'KVKK')} className="mt-4 text-[10px] text-red-400 hover:text-red-300 flex items-center justify-center gap-1 w-full py-2 hover:bg-red-900/10 rounded transition-colors">
                                                            <Trash2 size={12}/> Sil ve Yeniden Yükle
                                                        </button>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {student.docStatus === 'REJECTED' && student.rejectionReason && (
                                                        <div className="bg-red-900/20 border border-red-900/50 p-3 rounded-xl mb-3">
                                                            <p className="text-[10px] text-red-400 leading-tight">
                                                                <strong className="uppercase">Red Nedeni:</strong> {student.rejectionReason}
                                                            </p>
                                                        </div>
                                                    )}
                                                    {!student.kvkkExpectedId ? (
                                                        <button type="button" onClick={() => handleGenerateCode(student.id, 'KVKK')} className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-colors border border-slate-700">
                                                            KODU OLUŞTUR
                                                        </button>
                                                    ) : (
                                                        <>
                                                            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center relative">
                                                                <span className="text-[9px] text-slate-500 uppercase tracking-wider block mb-1">Belgeye Yazılan Kod</span>
                                                                <div className="text-xl font-black text-rose-500 tracking-widest font-mono select-all">{student.kvkkExpectedId}</div>
                                                                <p className="text-[9px] text-amber-500/80 mt-2 leading-tight">Bu kod hem sisteme girilmeli hem de belge üzerinde el yazısıyla yer almalıdır.</p>
                                                                <button type="button" onClick={() => copyCode(student.kvkkExpectedId!)} className="absolute top-2 right-2 text-slate-600 hover:text-white"><Copy size={12}/></button>
                                                            </div>
                                                            
                                                            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2">
                                                                <span className="text-[10px] font-bold text-slate-500 uppercase">GİR:</span>
                                                                <input 
                                                                    value={verifyCodes[`${student.id}_KVKK`] || ''}
                                                                    onChange={(e) => setVerifyCodes({...verifyCodes, [`${student.id}_KVKK`]: e.target.value})}
                                                                    className="bg-transparent text-white text-sm font-bold w-full outline-none placeholder-slate-700"
                                                                    placeholder="Kodu Buraya Yazın"
                                                                    maxLength={12}
                                                                />
                                                            </div>

                                                            <input type="file" id={`file-input-${student.id}-KVKK`} className="hidden" accept=".pdf" onChange={(e) => handleFileSelect(e, `${student.id}_KVKK`)} />
                                                            
                                                            <div className="grid grid-cols-2 gap-3">
                                                                <button type="button" 
                                                                    onClick={() => document.getElementById(`file-input-${student.id}-KVKK`)?.click()}
                                                                    className={`py-3 rounded-xl text-xs font-bold transition-all border ${selectedFiles[`${student.id}_KVKK`] ? 'bg-slate-800 border-green-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                                                                >
                                                                    {selectedFiles[`${student.id}_KVKK`] ? 'Dosya Değiştir' : 'BELGEYİ SEÇ'}
                                                                </button>

                                                                <button type="button" 
                                                                    onClick={() => handleOpenDeclarationModal(student.id, 'KVKK')}
                                                                    disabled={!selectedFiles[`${student.id}_KVKK`]}
                                                                    className={`py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${selectedFiles[`${student.id}_KVKK`] ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/20 hover:bg-rose-500' : 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-800'}`}
                                                                >
                                                                    {uploadingDoc === `${student.id}_KVKK` ? <Loader2 className="animate-spin" size={14}/> : <UploadCloud size={14}/>} 
                                                                    YÜKLE
                                                                </button>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}

                            {/* Add Student Card */}
                            {currentApplication.team.students.length < 6 && (
                                <button type="button" 
                                    onClick={() => handleOpenStudentModal()}
                                    className="group flex flex-col items-center justify-center gap-4 bg-slate-900/30 border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-3xl transition-all min-h-[500px]"
                                >
                                    <div className="w-16 h-16 rounded-full bg-slate-800 group-hover:bg-rose-600 group-hover:text-white text-slate-600 flex items-center justify-center transition-all shadow-lg">
                                        <Plus size={32} />
                                    </div>
                                    <span className="font-bold text-slate-500 group-hover:text-white transition-colors">Yeni Öğrenci Ekle</span>
                                </button>
                            )}
                        </div>
                    </div>
  );
}

