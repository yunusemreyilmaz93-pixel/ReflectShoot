
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Search, Check, X, Eye, Award, FileText, Shield, Inbox, Download, 
    Users, Film, School, Mail, AlertTriangle, Send, Clapperboard, Video, 
    Cpu, Activity, PieChart, BarChart3, Clock, UserCheck, Star, Plus, Lock, 
    Menu, LayoutDashboard, Settings, LogOut, FileDown, Trash2, MapPin, List, RefreshCw, ChevronRight, UserCog, MessageSquare, ExternalLink, Link as LinkIcon, Save, Youtube, PenTool, LayoutTemplate, HelpCircle, Bell, Image as ImageIcon, Megaphone, BookOpen, Calendar, Trophy, CheckCircle2, AlertOctagon, Info, ToggleRight, ToggleLeft, Power, Globe, Upload, LayoutGrid, Filter, TrendingUp, Wand2, Square, CheckSquare, MailOpen, Database, Construction, ChevronDown, Copy, AlertCircle
} from 'lucide-react';
import { ApplicationStatus, Category, Theme, Application, UserRole, LogEntry, SystemSettings, ScoreDocument, CMSGeneral, CMSFaqItem, FAQCategory, NotificationTarget, CMSGalleryItem, CMSAcademyItem, CMSTimelineItem, CMSPrize, CMSLinks, ContactMessage } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { ChatArea } from '../../components/ChatArea';
import { getYouTubeEmbedUrl } from '../../lib/videoUtils';
import { AdminCMS } from '../../components/admin/AdminCMS';
import { TurkeyMap } from '../../components/TurkeyMap';
import { AdminJuryStatus } from '../../components/admin/AdminJuryStatus';
import { AdminAwards } from '../../components/admin/AdminAwards';
import { AcademicJuryScorePanel } from '../../components/AcademicJuryScorePanel';
import { AdminCertificates } from '../../components/admin/AdminCertificates';
import { writeBatch, doc, collection } from 'firebase/firestore'; // Import needed for direct batch writing
import { db } from '../../lib/firebase'; // Import db
import { authenticatedFetch } from '../../lib/authenticatedFetch';

// Removed CSV Export function since we use xlsx and jspdf now

import { ToggleSwitch, DateInput } from './AdminFormControls';
import { AdminSkeleton } from './AdminSkeleton';
import { AdminSidebar } from './AdminSidebar';
import { AdminDashboard } from './AdminOverview';
import { AdminTeams } from './AdminTeamsSection';
import { AdminJuryAssign } from './AdminJuryAssignSection';
import { AdminUsers } from './AdminUsersSection';
import { AdminInbox } from './AdminInboxSection';
import { AdminAnnouncements } from './AdminAnnouncementsSection';
import { AdminAcademicResults } from './AdminAcademicResultsSection';
export const Admin: React.FC = () => {
  const { currentUser, allApplications, updateApplication, logAction, systemSettings, updateSystemSettings, auditLogs, logout, fetchJuryScores, loading, showToast, downloadFullBackup, seedAcademyContent, setSimulatedApplicationId } = useAppContext();
  const [activeTab, setActiveTab] = useState('DASHBOARD');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [appScores, setAppScores] = useState<ScoreDocument[]>([]);
  const [youtubeLinkInput, setYoutubeLinkInput] = useState('');
  const [globalCategoryFilter, setGlobalCategoryFilter] = useState<string | null>(null);
  const [rejectingDoc, setRejectingDoc] = useState<{ studentId: string, type: 'PARENT' | 'KVKK' } | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');

  useEffect(() => {
    // Clear simulation on entering the admin panel
    setSimulatedApplicationId(null);
  }, []);

  useEffect(() => {
    const fixClearVisionAndAssignJuries = async () => {
      try {
        if (currentUser?.role !== 'ADMIN') return;
        const hasRun = localStorage.getItem('fixed_clear_vision_juries');
        if (hasRun) return;

        const { query, where, getDocs, collection, updateDoc } = await import('firebase/firestore');
        const { db } = await import('../../lib/firebase');

        // Get all juries
        const usersRef = collection(db, 'users');
        const juryQuery = query(usersRef, where('role', '==', 'JUDGE'));
        const jurySnap = await getDocs(juryQuery);
        const juryIds = jurySnap.docs.map(d => d.id);

        if (juryIds.length > 0) {
            const appsRef = collection(db, 'applications');
            const get4Random = (arr: string[]) => [...arr].sort(() => 0.5 - Math.random()).slice(0, 4);

            // Fix Clear Vision
            const aqClear = query(appsRef, where('team.name', '==', 'Clear Vision'));
            const snapClear = await getDocs(aqClear);
            snapClear.forEach(async (d) => {
                await updateDoc(d.ref, { 
                    'team.videoUrl': 'https://youtu.be/M1vBuyesBXU?si=IbgktLIBqZIRCf7I',
                    'team.videoStatus': 'SUBMITTED_LINK',
                    'assignedJuryIds': get4Random(juryIds)
                });
            });

            // Assign Meva
            const aqMeva = query(appsRef, where('team.name', '==', 'meva'));
            const snapMeva = await getDocs(aqMeva);
            snapMeva.forEach(async (d) => {
                await updateDoc(d.ref, { 
                    'assignedJuryIds': get4Random(juryIds)
                });
            });
        }

        localStorage.setItem('fixed_clear_vision_juries', 'true');
        console.log('Fixed Clear vision and assigned juries.');
      } catch (e) {
          console.error(e);
      }
    };
    fixClearVisionAndAssignJuries();
  }, [currentUser]);

  useEffect(() => {
    const fixAaalTeam = async () => {
      try {
        if (currentUser?.role !== 'ADMIN') return;
        const hasRun = localStorage.getItem('fixed_aaal_team_verse_v2');
        if (hasRun) return;

        const { getDocs, collection, updateDoc } = await import('firebase/firestore');
        const { db } = await import('../../lib/firebase');

        const appsRef = collection(db, 'applications');
        const asnap = await getDocs(appsRef);
        asnap.forEach(async (d) => {
            const name = d.data().team?.name?.toLowerCase() || '';
            if (name.includes('aaal')) {
               await updateDoc(d.ref, { 
                   'team.selectedVerse': "Ra'd: 28" 
               });
               console.log("Updated team:", d.data().team?.name);
            }
        });

        localStorage.setItem('fixed_aaal_team_verse_v2', 'true');
        console.log('Fixed aaal team verse v2.');
      } catch (e) {
          console.error(e);
      }
    };
    fixAaalTeam();
  }, [currentUser]);

  useEffect(() => {
    const fixAllAverages = async () => {
      try {
        if (currentUser?.role !== 'ADMIN') return;
        const hasRun = localStorage.getItem('fixed_all_averages_v1');
        if (hasRun) return;

        const { query, collection, getDocs, updateDoc } = await import('firebase/firestore');
        const { db } = await import('../../lib/firebase');

        const appsRef = collection(db, 'applications');
        const asnap = await getDocs(appsRef);
        
        for (const doc of asnap.docs) {
            const appId = doc.id;
            const scoresSnap = await getDocs(collection(db, "applications", appId, "scores"));
            const scores = scoresSnap.docs.map(s => s.data() as any);
            
            const validScores = scores.filter(s => !s.isDraft && !s.isRecused);
            const avg = validScores.length > 0 
                ? Math.round((validScores.reduce((acc, s) => acc + s.total, 0) / validScores.length) * 10) / 10 
                : 0;
            
            await updateDoc(doc.ref, {
                finalScore: avg,
                juryCount: validScores.length
            });
        }

        localStorage.setItem('fixed_all_averages_v1', 'true');
        console.log('Fixed all averages.');
      } catch (e) {
          console.error(e);
      }
    };
    fixAllAverages();
  }, [currentUser]);

  const handleFilterCategory = (cat: string | null) => {
      setGlobalCategoryFilter(cat);
      setActiveTab('TEAMS');
  };

  useEffect(() => {
      if (selectedApp) {
          fetchJuryScores(selectedApp.id).then(setAppScores);
          setYoutubeLinkInput(selectedApp.team.videoUrl || '');
      } else {
          setAppScores([]);
          setYoutubeLinkInput('');
      }
  }, [selectedApp]);

  const handleStatusChange = async (app: Application, newStatus: ApplicationStatus) => {
      const updated = { ...app, status: newStatus };
      await updateApplication(updated);
      await logAction("UPDATE_STATUS", `Takım ${app.team.name} durumu ${newStatus} olarak güncellendi.`, app.id);
      setSelectedApp(updated); 
  };

  const toggleFinalist = async (app: Application) => {
      const newState = !app.team.isFinalist;
      const updated = { ...app, team: { ...app.team, isFinalist: newState } };
      await updateApplication(updated);
      await logAction("TOGGLE_FINALIST", `${app.team.name} finalist durumu: ${newState ? 'EVET' : 'HAYIR'}`, app.id);
      if(selectedApp && selectedApp.id === app.id) {
          setSelectedApp(updated);
      }
  };

  const saveYoutubeLink = async () => {
      if (!selectedApp) return;
      const embedUrl = getYouTubeEmbedUrl(youtubeLinkInput);
      if (!embedUrl) {
          showToast('Geçersiz YouTube linki.', 'error');
          return;
      }
      const updated = { 
          ...selectedApp, 
          team: { ...selectedApp.team, videoUrl: youtubeLinkInput, videoStatus: 'UPLOADED' as const },
          status: ApplicationStatus.APPROVED 
      };
      await updateApplication(updated);
      await logAction("VIDEO_PUBLISH", `${selectedApp.team.name} videosu YouTube linki olarak eklendi.`, selectedApp.id);
      setSelectedApp(updated);
      showToast('Video linki kaydedildi ve yayınlandı.', 'success');
  };

  const handleDocStatus = async (studentId: string, type: 'PARENT' | 'KVKK', status: 'APPROVED' | 'REJECTED', reason?: string) => {
      if (!selectedApp) return;

      const updatedStudents = selectedApp.team.students.map(s => {
          if (s.id === studentId) {
              return { 
                  ...s, 
                  docStatus: status, 
                  rejectionReason: status === 'REJECTED' ? reason : undefined 
              };
          }
          return s;
      });

      const updatedApp = {
          ...selectedApp,
          team: { ...selectedApp.team, students: updatedStudents }
      };

      try {
          await updateApplication(updatedApp);
          setSelectedApp(updatedApp);
          setRejectingDoc(null);
          setRejectionReasonInput('');
          showToast(`Belge ${status === 'APPROVED' ? 'onaylandı' : 'reddedildi'}.`, 'success');
          await logAction("DOC_REVIEW", `${selectedApp.team.name} - Öğrenci belgesi ${status === 'APPROVED' ? 'ONAYLANDI' : 'REDDEDİLDİ'}`, selectedApp.id);
      } catch (error) {
          showToast('İşlem başarısız.', 'error');
      }
  };

  const handleViewDoc = async (key: string) => {
      try {
          const res = await authenticatedFetch(`/api/view?key=${encodeURIComponent(key)}`);
          const data = await res.json();
          if (data.signedUrl) {
              window.open(data.signedUrl, '_blank');
          } else {
              showToast('Belge linki alınamadı.', 'error');
          }
      } catch (error) {
          showToast('Hata oluştu.', 'error');
      }
  };

  const handleSettingsUpdate = async (e: React.FormEvent) => {
      e.preventDefault();
      await updateSystemSettings(systemSettings); 
  };

  return (
    <div className="min-h-screen bg-slate-950 flex font-sans text-slate-200 selection:bg-rose-500 selection:text-white">
      <AdminSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={logout} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto w-full transition-all duration-300">
          <header className="flex justify-between items-center mb-6 md:mb-8">
              <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 text-slate-400 hover:text-white bg-slate-800 rounded-lg"><Menu size={24} /></button>
                  <h2 className="text-xl md:text-2xl font-black text-white tracking-tight truncate">
                      {activeTab === 'DASHBOARD' && 'Genel Bakış'}
                      {activeTab === 'ANNOUNCEMENTS' && 'Duyuru Merkezi'}
                      {activeTab === 'INBOX' && 'Gelen Kutusu'}
                      {activeTab === 'TEAMS' && 'Takım Yönetimi'}
                      {activeTab === 'AWARDS' && 'Ödül Töreni Katılım Takibi'}
                      {activeTab === 'ACADEMIC_RESULTS' && 'Akademik Bağımsız Jüri Sonuç Raporları'}
                      {activeTab === 'JURY_ASSIGN' && 'Jüri Atama'}
                      {activeTab === 'JURY_STATUS' && 'Jüri İlerlemeleri'}
                      {activeTab === 'USERS' && 'Kullanıcılar & Jüri'}
                      {activeTab === 'CONTENT' && 'İçerik Yönetimi (CMS)'}
                      {activeTab === 'CERTIFICATES' && 'Sertifika Şablonları & Tasarımı'}
                      {activeTab === 'SETTINGS' && 'Sistem Ayarları'}
                      {activeTab === 'LOGS' && 'Denetim Kayıtları'}
                  </h2>
                  <button type="button" 
                     onClick={async () => {
                        const { updateDoc, doc } = await import('firebase/firestore');
                        const WINNERS = [
                            { name: "Diriliş Perileri", category: "Canlı Çekim" },
                            { name: "sinemektep", category: "Canlı Çekim" },
                            { name: "MSR Justice Without Doubt", category: "Canlı Çekim" },
                            { name: "Sosyal Kızlar42", category: "Canlı Çekim" },
                            { name: "Homines Longinqui", category: "Canlı Çekim" },
                            { name: "Mitra", category: "Yapay Zeka Animasyon" },
                            { name: "Technokasyon", category: "Yapay Zeka Animasyon" },
                            { name: "THREEE", category: "Yapay Zeka Animasyon" },
                            { name: "PURE INSIGHT", category: "Yapay Zeka Animasyon" },
                            { name: "Clear Vision", category: "Yapay Zeka Animasyon" }
                        ];
                        let count = 0;
                        const normalize = (s: string) => s.toLocaleLowerCase('tr-TR').trim().replace(/\s+/g, '');
                        try {
                            for (const app of allApplications) {
                                const isWinner = WINNERS.find(w => normalize(w.name) === normalize(app.team.name));
                                await updateDoc(doc(db, "applications", app.id), {
                                    "team.isWinner": !!isWinner,
                                    "team.awardCategory": isWinner ? isWinner.category : null,
                                    "team.participationFormStatus": "not_started"
                                });
                                count++;
                            }
                            alert("Başarılı! " + count + " takım güncellendi.");
                        } catch(e) {
                            alert("Hata: " + e);
                        }
                     }} 
                     className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-1 text-xs font-bold rounded-lg ml-4"
                  >
                     TEST: Ödül Data Güncelle
                  </button>
              </div>
          </header>

          <div className="w-full h-[calc(100vh-140px)]">
            {loading ? <AdminSkeleton /> : (
                <>
                    {activeTab === 'DASHBOARD' && <AdminDashboard apps={allApplications} onFilterCategory={handleFilterCategory} />}
                    {activeTab === 'ANNOUNCEMENTS' && <AdminAnnouncements />}
                    {activeTab === 'INBOX' && <AdminInbox />}
                    {activeTab === 'TEAMS' && <AdminTeams apps={allApplications} onSelectApp={setSelectedApp} onToggleFinalist={toggleFinalist} initialCategoryFilter={globalCategoryFilter} />}
                    {activeTab === 'AWARDS' && <AdminAwards apps={allApplications} />}
                    {activeTab === 'ACADEMIC_RESULTS' && <AdminAcademicResults apps={allApplications} />}
                    {activeTab === 'JURY_ASSIGN' && <AdminJuryAssign apps={allApplications} />}
                    {activeTab === 'JURY_STATUS' && <AdminJuryStatus apps={allApplications} />}
                    {activeTab === 'USERS' && <AdminUsers />}
                    {activeTab === 'CONTENT' && <AdminCMS />}
                    {activeTab === 'CERTIFICATES' && <AdminCertificates />}
                    {activeTab === 'SETTINGS' && (
                        <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-10">
                             
                             <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 flex justify-between items-center">
                                 <div>
                                     <h3 className="font-bold text-white text-lg">Yapılandırma Merkezi</h3>
                                     <p className="text-slate-400 text-xs mt-1">Yarışma kurallarını, tarihleri ve sistem kilitlerini buradan yönetebilirsiniz.</p>
                                 </div>
                                 <button type="button" onClick={handleSettingsUpdate} className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2 transform hover:-translate-y-1">
                                     <Save size={20} /> Ayarları Kaydet
                                 </button>
                             </div>

                             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                 
                                 {/* Dates Column */}
                                 <div className="space-y-6">
                                     
                                     {/* Registration Dates */}
                                     <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                                         <h4 className="font-bold text-white mb-6 pb-2 border-b border-slate-700 flex items-center gap-2 text-sm uppercase tracking-wider">
                                             <Users size={18} className="text-blue-500"/> Başvuru Süreci
                                         </h4>
                                         <div className="grid grid-cols-2 gap-4">
                                             <DateInput label="Başvuru Başlangıç" value={systemSettings.dates.applicationStart} onChange={(val) => updateSystemSettings({...systemSettings, dates: {...systemSettings.dates, applicationStart: val}})} />
                                             <DateInput label="Başvuru Bitiş" value={systemSettings.dates.applicationEnd} onChange={(val) => updateSystemSettings({...systemSettings, dates: {...systemSettings.dates, applicationEnd: val}})} />
                                         </div>
                                     </div>

                                     {/* Video Upload Dates */}
                                     <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                                         <h4 className="font-bold text-white mb-6 pb-2 border-b border-slate-700 flex items-center gap-2 text-sm uppercase tracking-wider">
                                             <Upload size={18} className="text-purple-500"/> Eser Yükleme (Eş Zamanlı)
                                         </h4>
                                         <div className="grid grid-cols-2 gap-4">
                                             <DateInput label="Yükleme Başlangıç" value={systemSettings.dates.videoUploadStart} onChange={(val) => updateSystemSettings({...systemSettings, dates: {...systemSettings.dates, videoUploadStart: val}})} />
                                             <DateInput label="Yükleme Bitiş" value={systemSettings.dates.videoUploadEnd} onChange={(val) => updateSystemSettings({...systemSettings, dates: {...systemSettings.dates, videoUploadEnd: val}})} />
                                         </div>
                                     </div>

                                     {/* Finals & Gala */}
                                     <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                                         <h4 className="font-bold text-white mb-6 pb-2 border-b border-slate-700 flex items-center gap-2 text-sm uppercase tracking-wider">
                                             <Star size={18} className="text-amber-500"/> Final & Etkinlik
                                         </h4>
                                         <div className="space-y-4">
                                             <div className="grid grid-cols-2 gap-4">
                                                 <DateInput label="Finalistleri Açıkla" value={systemSettings.dates.finalistRevealStart || ''} onChange={(val) => updateSystemSettings({...systemSettings, dates: {...systemSettings.dates, finalistRevealStart: val}})} />
                                                 <DateInput label="Akademi Başlangıç" value={systemSettings.dates.academyStart} onChange={(val) => updateSystemSettings({...systemSettings, dates: {...systemSettings.dates, academyStart: val}})} />
                                             </div>
                                             <div className="grid grid-cols-2 gap-4">
                                                 <DateInput label="Oylama Başlangıç" value={systemSettings.dates.publicVoteStart || ''} onChange={(val) => updateSystemSettings({...systemSettings, dates: {...systemSettings.dates, publicVoteStart: val}})} />
                                                 <DateInput label="Oylama Bitiş" value={systemSettings.dates.publicVoteEnd || ''} onChange={(val) => updateSystemSettings({...systemSettings, dates: {...systemSettings.dates, publicVoteEnd: val}})} />
                                             </div>
                                             <div className="grid grid-cols-1">
                                                 <DateInput label="Ödül Töreni Tarihi" value={systemSettings.dates.galaDate} onChange={(val) => updateSystemSettings({...systemSettings, dates: {...systemSettings.dates, galaDate: val}})} />
                                             </div>
                                         </div>
                                     </div>

                                 </div>

                                 {/* Controls Column */}
                                 <div className="space-y-6">
                                     
                                     {/* Security & Backup */}
                                     <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                                         <h4 className="font-bold text-white mb-6 pb-2 border-b border-slate-700 flex items-center gap-2 text-sm uppercase tracking-wider">
                                             <Database size={18} className="text-amber-500"/> Veri & Güvenlik
                                         </h4>
                                         <div className="space-y-4">
                                             <div className="flex items-center justify-between">
                                                 <div>
                                                     <p className="text-sm font-bold text-slate-300">Veri Yedekleme</p>
                                                     <p className="text-[10px] text-slate-500">Tüm veritabanını JSON formatında indir.</p>
                                                 </div>
                                                 <button type="button" 
                                                    onClick={downloadFullBackup}
                                                    className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors border border-slate-600"
                                                 >
                                                     <Download size={14}/> Yedek İndir
                                                 </button>
                                             </div>

                                             <div className="border-t border-slate-700 my-2"></div>

                                             <div className="flex items-center justify-between">
                                                 <div>
                                                     <p className="text-sm font-bold text-slate-300">İçerik Başlatma</p>
                                                     <p className="text-[10px] text-slate-500">Varsayılan akademi içeriklerini yükler.</p>
                                                 </div>
                                                 <button type="button" 
                                                    onClick={seedAcademyContent}
                                                    className="bg-slate-700 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors border border-slate-600"
                                                 >
                                                     <Plus size={14}/> İçerik Yükle
                                                 </button>
                                             </div>

                                             <div className="border-t border-slate-700 my-4"></div>

                                             <ToggleSwitch 
                                                label="Bakım Modu (Maintenance)" 
                                                checked={systemSettings.features.maintenanceMode} 
                                                onChange={() => updateSystemSettings({...systemSettings, features: {...systemSettings.features, maintenanceMode: !systemSettings.features.maintenanceMode}})} 
                                                activeColor="bg-red-500"
                                             />
                                             <div className="bg-red-900/20 p-3 rounded-lg border border-red-900/50 text-xs text-red-300 mt-2 flex gap-2">
                                                 <AlertTriangle size={16} className="flex-shrink-0"/>
                                                 <strong>Dikkat:</strong> Bakım modu açıldığında, Admin dışındaki tüm kullanıcılar "Bakımdayız" sayfasına yönlendirilir ve sisteme erişemezler.
                                             </div>
                                         </div>
                                     </div>

                                     <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 h-full">
                                         <h4 className="font-bold text-white mb-6 pb-2 border-b border-slate-700 flex items-center gap-2 text-sm uppercase tracking-wider">
                                             <Power size={18} className="text-rose-500"/> Diğer Kontroller
                                         </h4>
                                         <div className="space-y-4">
                                             <ToggleSwitch 
                                                label="Yeni Kayıtları Kabul Et" 
                                                checked={systemSettings.features.allowNewRegistrations} 
                                                onChange={() => updateSystemSettings({...systemSettings, features: {...systemSettings.features, allowNewRegistrations: !systemSettings.features.allowNewRegistrations}})} 
                                                activeColor="bg-blue-500"
                                             />
                                             
                                             <ToggleSwitch 
                                                label="Video Yüklemeyi Aktif Et" 
                                                checked={systemSettings.features.videoUploadActive} 
                                                onChange={() => updateSystemSettings({...systemSettings, features: {...systemSettings.features, videoUploadActive: !systemSettings.features.videoUploadActive}})} 
                                                activeColor="bg-purple-500"
                                             />
                                             <p className="text-[10px] text-slate-500 px-2 -mt-2 mb-4">
                                                 * Bu seçenek kapalıysa, tarih aralığı uygun olsa bile öğrenciler video yükleyemez. Açık ise tarih aralığı kontrol edilir.
                                             </p>

                                             <ToggleSwitch 
                                                label="Halk Oylamasını Aktif Et" 
                                                checked={!!systemSettings.features.publicVotingActive} 
                                                onChange={() => updateSystemSettings({...systemSettings, features: {...systemSettings.features, publicVotingActive: !systemSettings.features.publicVotingActive}})} 
                                                activeColor="bg-amber-500"
                                             />

                                             <ToggleSwitch 
                                                label="Jüri Değerlendirme Sistemi" 
                                                checked={systemSettings.features.judgeSystemActive} 
                                                onChange={() => updateSystemSettings({...systemSettings, features: {...systemSettings.features, judgeSystemActive: !systemSettings.features.judgeSystemActive}})} 
                                                activeColor="bg-green-500"
                                             />

                                             <div className="pt-4 mt-4 border-t border-slate-700">
                                                 <ToggleSwitch 
                                                    label="Sonuçları Herkese İlan Et" 
                                                    checked={systemSettings.features.publicResultReveal} 
                                                    onChange={() => updateSystemSettings({...systemSettings, features: {...systemSettings.features, publicResultReveal: !systemSettings.features.publicResultReveal}})} 
                                                    activeColor="bg-rose-500"
                                                 />
                                                 <div className="bg-rose-900/20 p-3 rounded-lg border border-rose-900/50 text-xs text-rose-300 mt-3 flex gap-2">
                                                     <AlertTriangle size={16} className="flex-shrink-0"/>
                                                     <strong>Dikkat:</strong> Bu seçenek açıldığında, kazananlar ana sayfada herkese açık olarak listelenir. Genellikle Ödül Töreni sonrası açılmalıdır.
                                                 </div>
                                             </div>
                                         </div>
                                     </div>
                                 </div>

                             </div>
                        </div>
                    )}
                    {activeTab === 'LOGS' && (
                        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden animate-fadeIn">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left min-w-[600px]">
                                    <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase"><tr><th className="p-4">Zaman</th><th className="p-4">İşlem</th><th className="p-4">Detay</th><th className="p-4">Yapan</th></tr></thead>
                                    <tbody className="divide-y divide-slate-700">
                                        {auditLogs.map(log => (
                                            <tr key={log.id} className="hover:bg-slate-700/20">
                                                <td className="p-4 text-xs text-slate-500 font-mono whitespace-nowrap">{new Date(log.timestamp).toLocaleString('tr-TR')}</td>
                                                <td className="p-4">
                                                    <span className="bg-slate-900 text-white text-xs px-2 py-1 rounded border border-slate-700 font-bold whitespace-nowrap">{log.action}</span>
                                                </td>
                                                <td className="p-4 text-sm text-slate-300 min-w-[200px]">
                                                    {log.details}
                                                    {log.metadata && (
                                                        <div className="mt-1 text-[10px] text-slate-500 font-mono bg-slate-900/50 p-1 rounded">
                                                            {JSON.stringify(log.metadata)}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="p-4 text-xs text-slate-400 whitespace-nowrap">
                                                    <div className="font-bold text-slate-200">{log.performedBy}</div>
                                                    <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-1">
                                                        <Globe size={10} className="text-slate-600" /> {log.ip || 'N/A'}
                                                        <span className="opacity-30">|</span>
                                                        <span className="truncate max-w-[120px]" title={log.userAgent}>{log.userAgent?.split(') ')[1] || log.userAgent?.split(' ')[0] || 'N/A'}</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}
          </div>
      </main>
      {selectedApp && (
          <div className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-sm flex justify-end animate-fadeIn">
              <div className="w-full max-w-2xl bg-slate-900 h-full border-l border-slate-700 p-6 md:p-8 overflow-y-auto shadow-2xl relative">
                  <button type="button" onClick={() => setSelectedApp(null)} className="absolute top-4 right-4 bg-slate-800 p-2 rounded-full text-slate-400 hover:text-white hover:bg-rose-600 transition-all z-10"><X size={20} /></button>
                  <div className="mb-8 pb-8 border-b border-slate-800 mt-8 md:mt-0">
                      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-4">
                          {selectedApp.team.logoUrl && <img alt="" src={selectedApp.team.logoUrl} className="w-20 h-20 rounded-xl object-cover bg-slate-800 border border-slate-700" />}
                          <div><h2 className="text-2xl md:text-3xl font-black text-white leading-tight">{selectedApp.team.name}</h2><p className="text-slate-400 text-sm mt-1">{selectedApp.teacher.school}</p></div>
                      </div>
                      <div className="flex flex-wrap gap-2"><span className="bg-slate-800 text-slate-300 text-xs px-3 py-1 rounded-full font-bold">{selectedApp.team.category}</span><span className="bg-slate-800 text-slate-300 text-xs px-3 py-1 rounded-full font-bold">{selectedApp.teacher.city}</span><span className={`text-xs px-3 py-1 rounded-full font-bold text-white ${selectedApp.team.isFinalist ? 'bg-amber-500' : 'bg-slate-700'}`}>{selectedApp.team.isFinalist ? 'FİNALİST' : 'Aday'}</span></div>
                  </div>
                  <div className="mb-8"><ChatArea appId={selectedApp.id} /></div>
                  <div className="mb-8 bg-slate-950 p-6 rounded-xl border border-slate-800">
                      <h3 className="text-sm font-bold text-white uppercase mb-4 flex items-center gap-2"><Video size={16} className="text-rose-500"/> Video İşlemleri</h3>
                      {selectedApp.team.submissionDownloadUrl && (
                          <div className="mb-6 p-4 bg-blue-900/20 border border-blue-900/50 rounded-xl">
                              <label className="text-xs font-bold text-blue-400 uppercase mb-2 flex items-center gap-2"><LinkIcon size={12}/> Öğretmen Teslim Linki</label>
                              <div className="flex gap-2"><input readOnly value={selectedApp.team.submissionDownloadUrl} className="flex-1 bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs text-slate-300 font-mono" /><a href={selectedApp.team.submissionDownloadUrl} target="_blank" rel="noreferrer" className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded text-xs font-bold flex items-center gap-2"><ExternalLink size={14}/> Aç</a></div>
                              <p className="text-[10px] text-slate-500 mt-2">* Bu linkten videoyu indirin, YouTube kanalına "Liste Dışı" yükleyin ve aşağıdaki alana ekleyin.</p>
                          </div>
                      )}
                      <div>
                           <label className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2"><Youtube size={14} className="text-red-500"/> YouTube Linki Tanımla</label>
                           <div className="flex gap-2"><input value={youtubeLinkInput} onChange={(e) => setYoutubeLinkInput(e.target.value)} placeholder="https://youtu.be/..." className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-rose-500 outline-none" /><button type="button" onClick={saveYoutubeLink} className="bg-slate-800 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-bold transition-colors flex items-center gap-2"><Save size={16} /> Kaydet</button></div>
                           {selectedApp.team.videoUrl && (<div className="mt-4 rounded-lg overflow-hidden border border-slate-800"><iframe title="Video önizleme" src={getYouTubeEmbedUrl(selectedApp.team.videoUrl) || ""} className="w-full aspect-video" allowFullScreen></iframe></div>)}
                      </div>
                  </div>
                  <div className="mb-8 bg-slate-950 p-6 rounded-xl border border-slate-800">
                      <h3 className="text-sm font-bold text-white uppercase mb-4 flex items-center gap-2"><Users size={16} className="text-rose-500"/> Öğrenci Belgeleri</h3>
                      <div className="space-y-6">
                          {selectedApp.team.students.map((student) => (
                              <div key={student.id} className="border-b border-slate-800 pb-6 last:border-0 last:pb-0">
                                  <div className="flex justify-between items-start mb-4">
                                      <div>
                                          <h4 className="font-bold text-white">{student.firstName} {student.lastName}</h4>
                                          <p className="text-xs text-slate-500">{student.grade}. Sınıf</p>
                                      </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      {/* Parental Consent */}
                                      <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                                          <div className="flex justify-between items-center mb-2">
                                              <span className="text-[10px] font-bold text-slate-400 uppercase">Veli İzin Belgesi</span>
                                              {student.docStatus === 'APPROVED' && <CheckCircle2 size={14} className="text-green-500" />}
                                              {student.docStatus === 'REJECTED' && <AlertOctagon size={14} className="text-red-500" />}
                                          </div>
                                          {student.parentalConsentUrl ? (
                                              <div className="space-y-2">
                                                  <button type="button" 
                                                      onClick={() => handleViewDoc(student.parentalConsentUrl!)}
                                                      className="w-full text-left px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded text-xs text-slate-300 flex items-center gap-2 transition-colors"
                                                  >
                                                      <FileText size={14} /> Belgeyi Görüntüle
                                                  </button>
                                                  <div className="flex gap-2">
                                                      <button type="button" 
                                                          onClick={() => handleDocStatus(student.id, 'PARENT', 'APPROVED')}
                                                          className="flex-1 bg-green-900/20 hover:bg-green-900/40 text-green-400 py-1.5 rounded text-[10px] font-bold border border-green-900/50 transition-all"
                                                      >
                                                          Onayla
                                                      </button>
                                                      <button type="button" 
                                                          onClick={() => setRejectingDoc({ studentId: student.id, type: 'PARENT' })}
                                                          className="flex-1 bg-red-900/20 hover:bg-red-900/40 text-red-400 py-1.5 rounded text-[10px] font-bold border border-red-900/50 transition-all"
                                                      >
                                                          Reddet
                                                      </button>
                                                  </div>
                                              </div>
                                          ) : (
                                              <span className="text-[10px] text-slate-600 italic">Yüklenmedi</span>
                                          )}
                                      </div>

                                      {/* KVKK Consent */}
                                      <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                                          <div className="flex justify-between items-center mb-2">
                                              <span className="text-[10px] font-bold text-slate-400 uppercase">KVKK Belgesi</span>
                                              {student.docStatus === 'APPROVED' && <CheckCircle2 size={14} className="text-green-500" />}
                                              {student.docStatus === 'REJECTED' && <AlertOctagon size={14} className="text-red-500" />}
                                          </div>
                                          {student.kvkkConsentUrl ? (
                                              <div className="space-y-2">
                                                  <button type="button" 
                                                      onClick={() => handleViewDoc(student.kvkkConsentUrl!)}
                                                      className="w-full text-left px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded text-xs text-slate-300 flex items-center gap-2 transition-colors"
                                                  >
                                                      <FileText size={14} /> Belgeyi Görüntüle
                                                  </button>
                                                  <div className="flex gap-2">
                                                      <button type="button" 
                                                          onClick={() => handleDocStatus(student.id, 'KVKK', 'APPROVED')}
                                                          className="flex-1 bg-green-900/20 hover:bg-green-900/40 text-green-400 py-1.5 rounded text-[10px] font-bold border border-green-900/50 transition-all"
                                                      >
                                                          Onayla
                                                      </button>
                                                      <button type="button" 
                                                          onClick={() => setRejectingDoc({ studentId: student.id, type: 'KVKK' })}
                                                          className="flex-1 bg-red-900/20 hover:bg-red-900/40 text-red-400 py-1.5 rounded text-[10px] font-bold border border-red-900/50 transition-all"
                                                      >
                                                          Reddet
                                                      </button>
                                                  </div>
                                              </div>
                                          ) : (
                                              <span className="text-[10px] text-slate-600 italic">Yüklenmedi</span>
                                          )}
                                      </div>
                                  </div>

                                  {/* Rejection Reason Input */}
                                  {rejectingDoc?.studentId === student.id && (
                                      <div className="mt-4 p-4 bg-red-900/10 border border-red-900/30 rounded-xl animate-fadeIn">
                                          <label className="text-[10px] font-bold text-red-400 uppercase mb-2 block">Red Nedeni ({rejectingDoc.type === 'PARENT' ? 'Veli İzin' : 'KVKK'})</label>
                                          <textarea 
                                              value={rejectionReasonInput}
                                              onChange={(e) => setRejectionReasonInput(e.target.value)}
                                              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white text-xs focus:border-red-500 outline-none min-h-[80px]"
                                              placeholder="Lütfen red nedenini açıklayın..."
                                          />
                                          <div className="flex justify-end gap-2 mt-3">
                                              <button type="button" onClick={() => setRejectingDoc(null)} className="text-[10px] text-slate-400 hover:text-white px-3 py-2">İptal</button>
                                              <button type="button" 
                                                  onClick={() => handleDocStatus(student.id, rejectingDoc.type, 'REJECTED', rejectionReasonInput)}
                                                  className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-[10px] font-bold"
                                              >
                                                  Reddet ve Bildir
                                              </button>
                                          </div>
                                      </div>
                                  )}

                                  {student.docStatus === 'REJECTED' && student.rejectionReason && !rejectingDoc && (
                                      <div className="mt-3 p-3 bg-red-900/5 border border-red-900/20 rounded-lg">
                                          <p className="text-[10px] text-red-400 italic"><strong>Red Nedeni:</strong> {student.rejectionReason}</p>
                                      </div>
                                  )}
                              </div>
                          ))}
                      </div>
                  </div>
                  <div className="mb-8">
                      <h3 className="text-sm font-bold text-slate-500 uppercase mb-4 flex items-center gap-2"><Star size={16}/> Jüri Puanları</h3>
                      {appScores.length > 0 ? (
        <div className="space-y-3">
            {appScores.map((score, i) => (
                <div key={i} className={`p-4 rounded-xl border ${score.isRecused ? 'bg-slate-900 border-slate-700/50 opacity-60' : score.isDraft ? 'bg-amber-950/20 border-amber-900/30' : 'bg-slate-950 border-slate-800'}`}>
                    <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-white text-sm flex gap-2 items-center">
                            {score.juryName}
                            {score.isDraft && <span className="text-[10px] bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded uppercase font-bold">Taslak</span>}
                            {score.isRecused && <span className="text-[10px] bg-slate-700 text-slate-400 px-2 py-0.5 rounded uppercase font-bold">Çekimser</span>}
                        </span>
                        <span className={`text-xl font-black ${score.isRecused ? 'text-slate-500' : 'text-amber-500'}`}>{score.isRecused ? '-' : score.total}</span>
                    </div>
                    {!score.isRecused && (
                        <div className="grid grid-cols-4 gap-2 text-[10px] text-slate-500 mb-2">
                            <div>Hikaye: {score.criteria.story}</div>
                            <div>Teknik: {score.criteria.technical}</div>
                            <div>Özgünlük: {score.criteria.originality}</div>
                            <div>Tema: {score.criteria.themeFit}</div>
                        </div>
                    )}
                    {score.notes && (<p className="text-xs text-slate-400 italic border-t border-slate-800 pt-2 mt-2">"{score.notes}"</p>)}
                </div>
            ))}
            <div className="flex justify-between items-center bg-slate-800 p-4 rounded-xl"><span className="font-bold text-slate-400">Ortalama Puan</span><span className="text-2xl font-black text-emerald-500">{selectedApp.finalScore}</span></div>
        </div>
                      ) : (<div className="text-slate-500 text-sm italic">Henüz puanlama yapılmamış.</div>)}
                  </div>
                  <div className="mt-auto pt-6 border-t border-slate-800 pb-10 md:pb-0">
                      <h3 className="text-sm font-bold text-slate-500 uppercase mb-4">Yönetim İşlemleri</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                           <button type="button" onClick={() => toggleFinalist(selectedApp)} className={`p-4 rounded-xl font-bold flex flex-col items-center justify-center gap-2 transition-all ${selectedApp.team.isFinalist ? 'bg-amber-500/10 text-amber-500 border border-amber-500/50' : 'bg-slate-800 text-slate-400 hover:bg-amber-500 hover:text-black'}`}><Star size={24} className={selectedApp.team.isFinalist ? "fill-current" : ""}/>{selectedApp.team.isFinalist ? "Finalistliği Kaldır" : "Finalist Yap"}</button>
                           <button type="button" onClick={() => handleStatusChange(selectedApp, ApplicationStatus.DISQUALIFIED)} className="bg-slate-800 hover:bg-red-900/30 text-slate-400 hover:text-red-500 p-4 rounded-xl font-bold flex flex-col items-center justify-center gap-2 border border-slate-800 hover:border-red-500/30 transition-all"><Trash2 size={24} />Diskalifiye Et</button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

