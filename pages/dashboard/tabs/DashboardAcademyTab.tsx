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


export function DashboardAcademyTab() {
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
  } = useDashboardUI();

  return (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-black text-white">Akademi İçerikleri</h3>
                                <p className="text-slate-400 text-sm">Yarışma sürecinde size rehberlik edecek temel eğitimler.</p>
                            </div>
                            <button type="button" 
                                onClick={() => window.open('/academy', '_blank')}
                                className="text-rose-500 hover:text-rose-400 text-sm font-bold flex items-center gap-2"
                            >
                                Tümünü Gör <ExternalLink size={16} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {cmsAcademy.slice(0, 6).map((item: any) => {
                                const styles = getCategoryStyle(item.category);
                                return (
                                    <div 
                                        key={item.id}
                                        onClick={() => item.pdfFile ? window.open(item.pdfFile, '_blank') : window.open(item.url, '_blank')}
                                        className="group bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden cursor-pointer hover:border-slate-600 transition-all hover:-translate-y-1"
                                    >
                                        <div className="h-40 relative overflow-hidden">
                                            <img 
                                                src={item.coverImage || 'https://images.unsplash.com/photo-1478720568477-152d9b164e63?auto=format&fit=crop&q=80&w=800'} 
                                                alt={item.title}
                                                className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
                                            <div className="absolute bottom-4 left-4">
                                                <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${styles.badge}`}>
                                                    {item.category}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="p-6">
                                            <h4 className={`text-white font-bold mb-2 line-clamp-1 transition-colors ${styles.title}`}>{item.title}</h4>
                                            <p className="text-slate-500 text-xs line-clamp-2 mb-4">{item.description}</p>
                                            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                                                <span className="text-slate-600 flex items-center gap-1">
                                                    <Clock size={12} /> 5 Dakika
                                                </span>
                                                <span className={`flex items-center gap-1 ${styles.btn}`}>
                                                    İncele <ArrowRight size={12} />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
  );
}
