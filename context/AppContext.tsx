
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc,
  collection, 
  query, 
  onSnapshot,
  getFirestore,
  addDoc,
  orderBy,
  limit,
  where,
  getDocs,
  increment,
  writeBatch
} from 'firebase/firestore';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  onAuthStateChanged 
} from 'firebase/auth'; 
import { auth, db } from '../lib/firebase';
import { Application, ApplicationStatus, UserRole, EvaluationCriteria, UserProfile, SystemSettings, LogEntry, ScoreDocument, ToastMessage, Notification, ChatMessage, CMSGeneral, CMSFaqItem, CMSGalleryItem, NotificationTarget, CMSAcademyItem, CMSTimelineItem, CMSPrize, CMSLinks } from '../types';

interface AppContextType {
  currentUser: UserProfile | null;
  allUsers: UserProfile[]; // For Admin
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  registerTeacher: (data: any) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  
  // Application Logic
  currentApplication: Application | null;
  createApplication: (data: any) => Promise<void>;
  updateApplication: (app: Application) => Promise<void>;
  allApplications: Application[]; 
  
  // Scoring Logic
  submitScore: (appId: string, criteria: EvaluationCriteria, notes: string) => Promise<void>;
  fetchJuryScores: (appId: string) => Promise<ScoreDocument[]>;
  assignJury: (appId: string, juryIds: string[]) => Promise<void>; 
  
  // Admin Logic
  updateUserRole: (uid: string, newRole: UserRole) => Promise<void>;
  currentDate: Date;
  setSimulatedDate: (date: Date) => void;
  
  // System & Logs
  systemSettings: SystemSettings;
  updateSystemSettings: (settings: SystemSettings) => Promise<void>;
  auditLogs: LogEntry[];
  logAction: (action: string, details: string, targetId?: string) => Promise<void>;

  // CMS Content
  cmsGeneral: CMSGeneral;
  cmsLinks: CMSLinks; // New
  cmsFaqs: CMSFaqItem[];
  cmsGallery: CMSGalleryItem[];
  cmsAcademy: CMSAcademyItem[];
  cmsTimeline: CMSTimelineItem[];
  cmsPrizes: CMSPrize[]; // New
  updateCMSGeneral: (data: CMSGeneral) => Promise<void>;
  updateCMSLinks: (data: CMSLinks) => Promise<void>; // New
  updateCMSPrize: (prize: CMSPrize) => Promise<void>; // New
  addCMSFaq: (faq: Omit<CMSFaqItem, 'id'>) => Promise<void>;
  updateCMSFaq: (id: string, data: Partial<CMSFaqItem>) => Promise<void>;
  deleteCMSFaq: (id: string) => Promise<void>;
  addCMSGalleryItem: (item: Omit<CMSGalleryItem, 'id'>) => Promise<void>;
  deleteCMSGalleryItem: (id: string) => Promise<void>;
  addCMSAcademyItem: (item: Omit<CMSAcademyItem, 'id'>) => Promise<void>; 
  deleteCMSAcademyItem: (id: string) => Promise<void>; 
  addCMSTimelineItem: (item: Omit<CMSTimelineItem, 'id'>) => Promise<void>; 
  deleteCMSTimelineItem: (id: string) => Promise<void>; 

  // UI
  toasts: ToastMessage[];
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;

  // Notifications
  notifications: Notification[];
  markNotificationAsRead: (id: string) => Promise<void>;
  sendNotification: (userId: string, title: string, message: string, type: 'info' | 'success' | 'warning' | 'error') => Promise<void>;
  sendAnnouncement: (target: NotificationTarget, title: string, message: string, type: 'info' | 'success' | 'warning' | 'error') => Promise<void>;

  // Chat
  sendMessage: (appId: string, text: string) => Promise<void>;
  
  // Public Vote
  submitPublicVote: (appId: string, fingerprint: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Default Settings
const DEFAULT_SETTINGS: SystemSettings = {
  dates: {
    applicationStart: '2026-01-20T09:00:00',
    applicationEnd: '2026-02-13T23:59:59',
    videoUploadStart: '2026-02-16T00:00:00',
    videoUploadEnd: '2026-03-20T23:59:59',
    academyStart: '2026-04-06T09:00:00',
    galaDate: '2026-05-11T19:00:00',
    publicVoteStart: '2026-05-01T00:00:00',
    publicVoteEnd: '2026-05-10T23:59:59'
  },
  features: {
    judgeSystemActive: true,
    publicResultReveal: false,
    allowNewRegistrations: true,
    publicVotingActive: true
  }
};

// Default CMS Data
const DEFAULT_CMS_GENERAL: CMSGeneral = {
    contactEmail: 'reflect_shoot@proton.me',
    contactPhone: '(0332) 351 28 02',
    contactAddress: 'Şemsi Tebrizi Mah. Vali İzzetbey Cd., Bölüm Sk. No:2, 42050 Karatay / Konya',
    socialInstagram: '#',
    socialTwitter: '#',
    socialYoutube: '#',
    footerText: 'Gençlerin vizöründen dünyayı anlama ve anlatma çabası. Asrın idrakini sinemanın diliyle buluşturan lise kısa film yarışması.'
};

const DEFAULT_CMS_LINKS: CMSLinks = {
    specUrl: 'https://dosya.co/ornek_sartname.pdf',
    parentalUrl: 'https://dosya.co/ornek_veli_izni.pdf',
    kvkkUrl: 'https://dosya.co/ornek_kvkk.pdf',
    posterUrl: ''
};

// Default FAQs - UPDATED (20 Items)
const DEFAULT_CMS_FAQS: CMSFaqItem[] = [
    // --- GENEL KATEGORİSİ ---
    { id: 'gen1', category: 'Genel', question: 'Yarışmaya kimler katılabilir?', answer: 'Türkiye genelindeki tüm İmam Hatip Lisesi öğrencileri yarışmaya katılabilir. Öğrencilerin örgün eğitimde aktif kaydı bulunmalıdır.', order: 1 },
    { id: 'gen2', category: 'Genel', question: 'Takımlar kaç kişiden oluşmalıdır?', answer: 'Takımlar en az 3, en fazla 6 öğrenciden oluşmalı ve her takımın başında mutlaka bir danışman öğretmen bulunmalıdır.', order: 2 },
    { id: 'gen3', category: 'Genel', question: 'Katılım ücretli mi?', answer: 'Hayır, Reflect&Shoot kısa film yarışmasına katılım tamamen ücretsizdir.', order: 3 },
    { id: 'gen4', category: 'Genel', question: 'Bir öğretmen birden fazla takıma danışmanlık yapabilir mi?', answer: 'Evet, bir danışman öğretmen aynı okuldan birden fazla takıma rehberlik edebilir. Ancak her takım için ayrı başvuru yapılmalıdır.', order: 4 },
    { id: 'gen5', category: 'Genel', question: 'Bir öğrenci birden fazla takımda yer alabilir mi?', answer: 'Hayır, bir öğrenci yalnızca tek bir takımda ve tek bir projede görev alabilir.', order: 5 },
    
    // --- TEKNİK KATEGORİSİ ---
    { id: 'tech1', category: 'Teknik', question: 'Profesyonel kamera zorunlu mu?', answer: 'Hayır, yüksek çözünürlüklü (en az 1080p) çekim yapan cep telefonu kameraları ile çekilen filmler de kabul edilmektedir. Önemli olan hikaye, kurgu ve anlatım dilidir.', order: 6 },
    { id: 'tech2', category: 'Teknik', question: 'Film süresi ne kadar olmalı?', answer: 'Filmler jenerik dahil en az 3, en fazla 8 dakika uzunluğunda olmalıdır. Bu süre sınırlarına uymayan eserler değerlendirmeye alınmaz.', order: 7 },
    { id: 'tech3', category: 'Teknik', question: 'Hangi dosya formatında teslim etmeliyiz?', answer: 'Videolar MP4 veya MOV formatında, en az 1920x1080 (Full HD) çözünürlükte ve yatay formatta (16:9) olmalıdır.', order: 8 },
    { id: 'tech4', category: 'Teknik', question: 'Filmin dili ne olmalıdır?', answer: 'Filmin seslendirmesi veya konuşma dili İngilizce olmalı, mutlaka Türkçe altyazı eklenmelidir. Sessiz filmlerde de ara yazılar (varsa) İngilizce olmalıdır.', order: 9 },
    { id: 'tech5', category: 'Teknik', question: 'Müzik kullanımında telif haklarına dikkat etmeli miyiz?', answer: 'Evet, kullanılan müzikler ya özgün bestelenmiş olmalı ya da telifsiz (royalty-free) kütüphanelerden lisansına uygun şekilde alınmalıdır. Telif ihlali diskalifiye sebebidir.', order: 10 },
    { id: 'tech6', category: 'Teknik', question: 'Yapay Zeka (AI) araçları kullanılabilir mi?', answer: '"Yapay Zeka Animasyon" kategorisinde ana üretim aracı olarak kullanılabilir. "Canlı Çekim" kategorisinde ise sadece post-prodüksiyon (renk, ses temizleme vb.) aşamasında yardımcı araç olarak kullanılabilir, ana görüntüler gerçek çekim olmalıdır.', order: 11 },

    // --- SÜREÇ & TESLİM KATEGORİSİ ---
    { id: 'proc1', category: 'Süreç & Teslim', question: 'Son başvuru tarihi nedir?', answer: 'Takım oluşturma ve ön başvuru işlemleri 13 Şubat 2026 tarihine kadar tamamlanmalıdır.', order: 12 },
    { id: 'proc2', category: 'Süreç & Teslim', question: 'Videomuzu nereye yükleyeceğiz?', answer: 'Video dosyanızı Google Drive, WeTransfer veya Dropbox gibi bir bulut servisine yükleyip, indirme linkini Danışman Öğretmen paneli üzerinden sisteme gireceksiniz.', order: 13 },
    { id: 'proc3', category: 'Süreç & Teslim', question: 'Başvuruyu tamamladıktan sonra takım bilgilerini değiştirebilir miyiz?', answer: 'Başvurunuz "Onaylandı" statüsüne geçene kadar değişiklik yapabilirsiniz. Onaylandıktan sonra sadece yönetici izni ile kritik değişiklikler yapılabilir.', order: 14 },
    { id: 'proc4', category: 'Süreç & Teslim', question: 'Senaryo metnini göndermemiz gerekiyor mu?', answer: 'İlk aşamada sadece filmin kendisi (video dosyası) talep edilmektedir. Ancak jüri gerekli görürse finalistlerden senaryo dökümü isteyebilir.', order: 15 },
    { id: 'proc5', category: 'Süreç & Teslim', question: 'Video linki şifreli olabilir mi?', answer: 'Hayır, paylaştığınız linkin "bağlantıya sahip olan herkes görüntüleyebilir" ayarında olması gerekmektedir. Şifreli linkler değerlendirmeye alınamaz.', order: 16 },
    
    // --- ÖDÜLLER & DEĞERLENDİRME KATEGORİSİ ---
    { id: 'awd1', category: 'Ödüller & Değerlendirme', question: 'Değerlendirme kriterleri nelerdir?', answer: 'Projeler; Senaryo/Hikaye (%30), Teknik Kalite (%25), Özgünlük/Yaratıcılık (%25) ve Kurgu/Montaj (%20) olmak üzere 100 puan üzerinden değerlendirilir.', order: 17 },
    { id: 'awd2', category: 'Ödüller & Değerlendirme', question: 'Ödüller ne zaman verilecek?', answer: 'Ödüller, 22 Mayıs 2026 tarihinde düzenlenecek olan Gala gecesinde sahiplerini bulacaktır.', order: 18 },
    { id: 'awd3', category: 'Ödüller & Değerlendirme', question: 'Halk oylaması sonucu etkiliyor mu?', answer: 'Halk oylaması, jüri puanlamasından bağımsız olarak "En İyi Seyirci Ödülü"nü belirler. Ana derecelendirme (1., 2., 3.) sadece jüri puanlarıyla belirlenir.', order: 19 },
    { id: 'awd4', category: 'Ödüller & Değerlendirme', question: 'Para ödülleri kime ödenir?', answer: 'Para ödülleri, takımı temsilen Danışman Öğretmen\'e veya okul idaresinin belirlediği hesaba yatırılır. Ödülün ekip içindeki dağılımı takımın sorumluluğundadır.', order: 20 }
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  const [allApplications, setAllApplications] = useState<Application[]>([]);
  const [currentApplication, setCurrentApplication] = useState<Application | null>(null);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
  const [auditLogs, setAuditLogs] = useState<LogEntry[]>([]);
  
  // CMS State
  const [cmsGeneral, setCmsGeneral] = useState<CMSGeneral>(DEFAULT_CMS_GENERAL);
  const [cmsLinks, setCmsLinks] = useState<CMSLinks>(DEFAULT_CMS_LINKS);
  const [cmsFaqs, setCmsFaqs] = useState<CMSFaqItem[]>(DEFAULT_CMS_FAQS);
  const [cmsGallery, setCmsGallery] = useState<CMSGalleryItem[]>([]);
  const [cmsAcademy, setCmsAcademy] = useState<CMSAcademyItem[]>([]);
  const [cmsTimeline, setCmsTimeline] = useState<CMSTimelineItem[]>([]);
  const [cmsPrizes, setCmsPrizes] = useState<CMSPrize[]>([]);

  // Toast State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Notification State
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const setSimulatedDate = (date: Date) => {
    setCurrentDate(date);
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
        removeToast(id);
    }, 4000); // Auto remove after 4 seconds
  };

  const removeToast = (id: string) => {
      setToasts((prev) => prev.filter(t => t.id !== id));
  };

  // 1. Listen to Firebase Auth State Changes
  useEffect(() => {
    // Modular: onAuthStateChanged(auth, callback)
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        try {
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
              const userData = userDoc.data() as UserProfile;
              setCurrentUser({
                ...userData,
                emailVerified: user.emailVerified 
              });
            } else {
              // Fallback for brand new users if create hasn't finished
              setCurrentUser(null);
            }
        } catch (e) {
            console.error("Error fetching user profile:", e);
        }
      } else {
        setCurrentUser(null);
        setCurrentApplication(null);
        setAllApplications([]);
        setAllUsers([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Real-time Data Sync (Role-Aware)
  useEffect(() => {
    // --- ALWAYS SYNC CMS DATA (Public) ---
    // A) CMS General
    const generalRef = doc(db, "cms_general", "info");
    const unsubGeneral = onSnapshot(generalRef, (docSnap) => {
        if(docSnap.exists()) {
            setCmsGeneral(docSnap.data() as CMSGeneral);
        }
    });

    // B) CMS Links
    const linksRef = doc(db, "cms_links", "docs");
    const unsubLinks = onSnapshot(linksRef, (docSnap) => {
        if(docSnap.exists()) {
            setCmsLinks(docSnap.data() as CMSLinks);
        }
    });

    // C) CMS FAQs
    const qFaqs = query(collection(db, "cms_faqs"), orderBy("order", "asc"));
    const unsubFaqs = onSnapshot(qFaqs, (snap) => {
        const faqs: CMSFaqItem[] = [];
        snap.forEach(d => faqs.push({ id: d.id, ...d.data() } as CMSFaqItem));
        // Use defaults if DB is empty
        if (faqs.length === 0) {
            setCmsFaqs(DEFAULT_CMS_FAQS);
        } else {
            setCmsFaqs(faqs);
        }
    });

    // D) CMS Gallery
    const qGallery = query(collection(db, "cms_gallery"), orderBy("year", "desc"));
    const unsubGallery = onSnapshot(qGallery, (snap) => {
        const items: CMSGalleryItem[] = [];
        snap.forEach(d => items.push({ id: d.id, ...d.data() } as CMSGalleryItem));
        setCmsGallery(items);
    });

    // E) CMS Academy
    const qAcademy = query(collection(db, "cms_academy"));
    const unsubAcademy = onSnapshot(qAcademy, (snap) => {
        const items: CMSAcademyItem[] = [];
        snap.forEach(d => items.push({ id: d.id, ...d.data() } as CMSAcademyItem));
        setCmsAcademy(items);
    });

    // F) CMS Timeline
    const qTimeline = query(collection(db, "cms_timeline"), orderBy("order", "asc"));
    const unsubTimeline = onSnapshot(qTimeline, (snap) => {
        const items: CMSTimelineItem[] = [];
        snap.forEach(d => items.push({ id: d.id, ...d.data() } as CMSTimelineItem));
        setCmsTimeline(items);
    });

    // G) CMS Prizes
    const qPrizes = query(collection(db, "cms_prizes"));
    const unsubPrizes = onSnapshot(qPrizes, (snap) => {
        const items: CMSPrize[] = [];
        snap.forEach(d => items.push({ id: d.id, ...d.data() } as CMSPrize));
        setCmsPrizes(items);
    });

    // H) System Settings Sync (Everyone reads)
    const settingsRef = doc(db, "system", "config");
    getDoc(settingsRef).then(docSnap => {
        if(docSnap.exists()) {
            setSystemSettings(docSnap.data() as SystemSettings);
        } else {
            setDoc(settingsRef, DEFAULT_SETTINGS).catch(e => console.warn("Failed to init settings", e.message)); 
        }
    }).catch(e => console.warn("Settings fetch warning", e.message));

    // --- PUBLIC FINALISTS SYNC (For Public Vote) ---
    let unsubPublicFinalists = () => {};
    if (!currentUser) {
        // If not logged in, fetch only finalists for public voting
        const qFinalists = query(collection(db, "applications"), where("team.isFinalist", "==", true));
        unsubPublicFinalists = onSnapshot(qFinalists, (snap) => {
            const apps: Application[] = [];
            snap.forEach(d => apps.push(d.data() as Application));
            setAllApplications(apps);
        }, (error) => {
            console.warn("Public Finalists Sync Warning:", error.message);
        });

        return () => {
            unsubGeneral(); unsubLinks(); unsubFaqs(); unsubGallery(); unsubAcademy(); unsubTimeline(); unsubPrizes(); unsubPublicFinalists();
        };
    }

    // --- AUTHENTICATED SYNC ---

    // I) Fetch Applications - ROLE AWARE
    let qApps;
    if (currentUser.role === UserRole.ADMIN) {
        // Admin sees all
        qApps = query(collection(db, "applications"));
    } else if (currentUser.role === UserRole.JUDGE) {
        // Judges see submitted/finalized applications (filtered later by assignments if needed, but fetching all readable)
        qApps = query(collection(db, "applications"), where("status", "in", [
            ApplicationStatus.FINAL_SUBMITTED,
            ApplicationStatus.GRADED,
            ApplicationStatus.APPROVED,
            ApplicationStatus.UNDER_REVIEW
        ]));
    } else {
        // Teachers see ONLY their own applications
        qApps = query(collection(db, "applications"), where("teacher.email", "==", currentUser.email));
    }

    const unsubApps = onSnapshot(qApps, (querySnapshot) => {
      const apps: Application[] = [];
      querySnapshot.forEach((doc) => {
        apps.push(doc.data() as Application);
      });
      setAllApplications(apps);
      
      // If Teacher, set current app
      if (currentUser.role === UserRole.TEACHER) {
         const userApp = apps.find(app => app.teacher.email === currentUser.email);
         setCurrentApplication(userApp || null);
      }
    }, (error) => {
        console.warn("Application Sync Warning (Check Permissions):", error.message);
    });

    // J) Notifications Sync
    const qNotifs = query(collection(db, "notifications"), where("userId", "==", currentUser.uid), orderBy("createdAt", "desc"), limit(20));
    const unsubNotifs = onSnapshot(qNotifs, (snap) => {
        const notifs: Notification[] = [];
        snap.forEach(d => notifs.push({ id: d.id, ...d.data() } as Notification));
        setNotifications(notifs);
    }, (error) => {
        console.warn("Notifications Sync Warning (Missing Rules or Index):", error.message);
    });

    // K) Admin Specific Streams
    let unsubLogs = () => {};
    let unsubUsers = () => {};

    if (currentUser.role === UserRole.ADMIN) {
        // Fetch Logs
        const qLogs = query(collection(db, "auditLogs"), orderBy("timestamp", "desc"), limit(50));
        unsubLogs = onSnapshot(qLogs, (snap) => {
            const logs: LogEntry[] = [];
            snap.forEach(d => logs.push({ id: d.id, ...d.data() } as LogEntry));
            setAuditLogs(logs);
        }, (error) => {
            console.warn("Audit Logs Sync Warning:", error.message);
        });

        // Fetch Users
        const qUsers = query(collection(db, "users"));
        unsubUsers = onSnapshot(qUsers, (snap) => {
            const users: UserProfile[] = [];
            snap.forEach(d => users.push(d.data() as UserProfile));
            setAllUsers(users);
        }, (error) => {
            console.warn("Users Sync Warning:", error.message);
        });
    }

    return () => {
        unsubGeneral(); unsubLinks(); unsubFaqs(); unsubGallery(); unsubAcademy(); unsubTimeline(); unsubPrizes();
        unsubApps(); unsubLogs(); unsubUsers(); unsubNotifs();
    };
  }, [currentUser]);


  // 3. Actions (Login, Logout, etc... - MODULAR SDK FIXES)
  const login = async (email: string, password: string) => {
    // Modular: signInWithEmailAndPassword(auth, email, password)
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    // Modular: signOut(auth)
    await signOut(auth);
  };

  const resetPassword = async (email: string) => {
      // Modular: sendPasswordResetEmail(auth, email)
      await sendPasswordResetEmail(auth, email);
  };

  const registerTeacher = async (data: any) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      if (user) {
        // Modular: sendEmailVerification(user)
        await sendEmailVerification(user);
        const isK12 = data.email.endsWith('k12.tr');
        const initialRole = isK12 ? UserRole.TEACHER : UserRole.PENDING_TEACHER;

        const newProfile: UserProfile = {
          uid: user.uid,
          email: data.email,
          fullName: data.name,
          role: initialRole,
          school: data.school,
          city: data.city,
          createdAt: new Date().toISOString(),
          emailVerified: false 
        };

        const safeProfile = JSON.parse(JSON.stringify(newProfile));
        await setDoc(doc(db, "users", user.uid), safeProfile);
        await logAction("NEW_REGISTRATION", `${data.name} (${data.school}) kayıt oldu.`, user.uid);
      }
    } catch (error) {
      console.error("Registration Error:", error);
      throw error;
    }
  };

  const resendVerificationEmail = async () => {
    if (auth.currentUser) {
      // Modular: sendEmailVerification(user)
      await sendEmailVerification(auth.currentUser);
    }
  };

  const updateUserRole = async (uid: string, newRole: UserRole) => {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, { role: newRole });
    await logAction("UPDATE_ROLE", `Kullanıcı rolü güncellendi: ${newRole}`, uid);
    await sendNotification(uid, "Rol Güncellemesi", `Hesap yetkiniz ${newRole} olarak güncellendi.`, "success");
  };

  const createApplication = async (data: any) => {
    if (!currentUser) return;

    const newApp: Application = {
      id: `APP-${currentUser.uid}`,
      teacher: {
        id: `T-${currentUser.uid}`,
        fullName: currentUser.fullName,
        school: currentUser.school || 'Belirtilmedi',
        city: currentUser.city || 'Belirtilmedi',
        email: currentUser.email,
        phone: currentUser.phone || ""
      },
      team: {
        id: `TEAM-${Date.now()}`,
        name: data.teamName,
        category: data.category,
        theme: data.theme,
        ...(data.selectedVerse ? { selectedVerse: data.selectedVerse } : {}),
        ...(data.logoFile ? { logoUrl: URL.createObjectURL(data.logoFile) } : {}),
        students: data.students.map((s: any, idx: number) => ({
          id: `S-${Date.now()}-${idx}`,
          firstName: s.firstName,
          lastName: s.lastName,
          grade: s.grade,
          hasKvkkConsent: false,
          hasParentalConsent: false,
          docStatus: 'PENDING'
        })),
        videoStatus: 'PENDING',
        isPreliminaryStageComplete: false,
        isFinalStageComplete: false,
        isFinalist: false 
      },
      status: ApplicationStatus.DRAFT,
      submittedAt: new Date().toISOString()
    };
    
    try {
      const safeApp = JSON.parse(JSON.stringify(newApp));
      await setDoc(doc(db, "applications", newApp.id), safeApp);
      showToast('Takım başarıyla oluşturuldu!', 'success');
      const admins = allUsers.filter(u => u.role === UserRole.ADMIN);
      admins.forEach(admin => {
          sendNotification(admin.uid, "Yeni Başvuru", `${currentUser.fullName} yeni bir takım oluşturdu: ${data.teamName}`, "info");
      });
    } catch (error) {
      console.error("Error creating application:", error);
      showToast('Takım oluşturulurken hata oluştu.', 'error');
    }
  };

  const updateApplication = async (updatedApp: Application) => {
    try {
      const safeApp = JSON.parse(JSON.stringify(updatedApp));
      await setDoc(doc(db, "applications", updatedApp.id), safeApp);
      showToast('Başvuru güncellendi.', 'success');

      if (updatedApp.status === ApplicationStatus.FINAL_SUBMITTED) {
           const admins = allUsers.filter(u => u.role === UserRole.ADMIN);
           admins.forEach(admin => {
               sendNotification(admin.uid, "Video Yüklendi", `${updatedApp.team.name} final videosunu yükledi.`, "success");
           });
      }
      
      if (currentUser?.role === UserRole.ADMIN) {
           const teacherId = updatedApp.id.replace("APP-", ""); 
           sendNotification(teacherId, "Durum Güncellemesi", `Başvuru durumunuz güncellendi: ${updatedApp.status}`, "info");
           if (updatedApp.team.isFinalist) {
               sendNotification(teacherId, "TEBRİKLER!", "Takımınız FİNALİST olmaya hak kazandı!", "success");
           }
      }
    } catch (error) {
       console.error("Error updating application:", error);
       showToast('Güncelleme sırasında hata oluştu.', 'error');
    }
  };

  const submitScore = async (appId: string, criteria: EvaluationCriteria, notes: string) => {
      if (!currentUser || currentUser.role !== UserRole.JUDGE) return;
      const totalScore = criteria.story + criteria.technical + criteria.originality + criteria.themeFit;
      
      const scoreDoc: ScoreDocument = {
          juryId: currentUser.uid,
          juryName: currentUser.fullName,
          total: totalScore,
          criteria: criteria,
          notes: notes,
          updatedAt: new Date().toISOString()
      };

      const scoreRef = doc(db, "applications", appId, "scores", currentUser.uid);
      await setDoc(scoreRef, scoreDoc);

      const scoresSnapshot = await getDocs(collection(db, "applications", appId, "scores"));
      let sum = 0;
      let count = 0;
      const gradedBy: string[] = [];

      scoresSnapshot.forEach(doc => {
          const data = doc.data() as ScoreDocument;
          sum += data.total;
          count++;
          gradedBy.push(data.juryId);
      });

      const avg = count > 0 ? parseFloat((sum / count).toFixed(2)) : 0;

      const appRef = doc(db, "applications", appId);
      await updateDoc(appRef, {
          finalScore: avg,
          juryCount: count,
          gradedBy: gradedBy,
          status: ApplicationStatus.GRADED 
      });

      await logAction("SUBMIT_SCORE", `Puan verildi: ${totalScore} (Takım: ${appId})`, appId);
      showToast('Puan başarıyla kaydedildi!', 'success');

      const admins = allUsers.filter(u => u.role === UserRole.ADMIN);
      admins.forEach(admin => {
           sendNotification(admin.uid, "Jüri Puanlaması", `${currentUser.fullName} bir takımı puanladı (${totalScore}).`, "info");
      });
  };

  const fetchJuryScores = async (appId: string): Promise<ScoreDocument[]> => {
      const q = query(collection(db, "applications", appId, "scores"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ScoreDocument));
  };

  const assignJury = async (appId: string, juryIds: string[]) => {
      await updateDoc(doc(db, "applications", appId), { assignedJuryIds: juryIds });
      await logAction("ASSIGN_JURY", `Jüri ataması güncellendi.`, appId);
      showToast('Jüri ataması kaydedildi.', 'success');
  };

  // --- NOTIFICATIONS ---
  const sendNotification = async (userId: string, title: string, message: string, type: 'info' | 'success' | 'warning' | 'error') => {
      try {
          await addDoc(collection(db, "notifications"), {
              userId,
              title,
              message,
              type,
              read: false,
              createdAt: new Date().toISOString()
          });
      } catch (e) {
          console.error("Notification Error:", e);
      }
  };

  const markNotificationAsRead = async (id: string) => {
      await updateDoc(doc(db, "notifications", id), { read: true });
  };

  const sendAnnouncement = async (target: NotificationTarget, title: string, message: string, type: 'info' | 'success' | 'warning' | 'error') => {
      let targetUserIds: string[] = [];

      if (target === 'ALL') {
          targetUserIds = allUsers.map(u => u.uid);
      } else if (target === 'TEACHERS') {
          targetUserIds = allUsers.filter(u => u.role === UserRole.TEACHER).map(u => u.uid);
      } else if (target === 'JUDGES') {
          targetUserIds = allUsers.filter(u => u.role === UserRole.JUDGE).map(u => u.uid);
      } else if (target === 'FINALISTS') {
          const finalistEmails = allApplications.filter(a => a.team.isFinalist).map(a => a.teacher.email);
          targetUserIds = allUsers.filter(u => finalistEmails.includes(u.email)).map(u => u.uid);
      }

      let count = 0;
      for (const uid of targetUserIds) {
          await sendNotification(uid, title, message, type);
          count++;
      }
      
      await logAction("ANNOUNCEMENT", `Duyuru gönderildi (${count} kişi): ${title}`);
      showToast(`${count} kişiye duyuru gönderildi.`, 'success');
  };

  // --- MESSAGING ---
  const sendMessage = async (appId: string, text: string) => {
      if (!currentUser) return;
      const msg: ChatMessage = {
          id: `MSG-${Date.now()}`,
          senderId: currentUser.uid,
          senderName: currentUser.fullName,
          senderRole: currentUser.role,
          text,
          createdAt: new Date().toISOString()
      };
      
      await addDoc(collection(db, "applications", appId, "messages"), msg);
  };

  // --- PUBLIC VOTE ---
  const submitPublicVote = async (appId: string, fingerprint: string) => {
      const q = query(collection(db, "public_votes"), where("appId", "==", appId), where("voterFingerprint", "==", fingerprint));
      const snap = await getDocs(q);
      
      if (!snap.empty) {
          throw new Error("Bu video için zaten oy kullandınız.");
      }

      await addDoc(collection(db, "public_votes"), {
          appId,
          voterFingerprint: fingerprint,
          timestamp: new Date().toISOString()
      });

      await updateDoc(doc(db, "applications", appId), {
          "team.publicVotes": increment(1)
      });
  };

  // --- SYSTEM ---
  const updateSystemSettings = async (settings: SystemSettings) => {
      await setDoc(doc(db, "system", "config"), settings);
      setSystemSettings(settings);
      await logAction("UPDATE_SETTINGS", "Sistem ayarları güncellendi.");
      showToast('Sistem ayarları kaydedildi.', 'success');
  };

  // --- CMS FUNCTIONS ---
  const updateCMSGeneral = async (data: CMSGeneral) => {
      await setDoc(doc(db, "cms_general", "info"), data);
      await logAction("CMS_UPDATE", "Genel site ayarları güncellendi.");
      showToast('Genel ayarlar güncellendi.', 'success');
  };

  // NEW: Update Links
  const updateCMSLinks = async (data: CMSLinks) => {
      await setDoc(doc(db, "cms_links", "docs"), data);
      await logAction("CMS_UPDATE_LINKS", "Dosya linkleri güncellendi.");
      showToast('Linkler güncellendi.', 'success');
  };

  const addCMSFaq = async (faq: Omit<CMSFaqItem, 'id'>) => {
      await addDoc(collection(db, "cms_faqs"), faq);
      await logAction("CMS_ADD_FAQ", `Yeni SSS eklendi: ${faq.question}`);
      showToast('Soru eklendi.', 'success');
  };

  const updateCMSFaq = async (id: string, data: Partial<CMSFaqItem>) => {
      await updateDoc(doc(db, "cms_faqs", id), data);
      await logAction("CMS_UPDATE_FAQ", `SSS güncellendi: ${id}`);
      showToast('Soru güncellendi.', 'success');
  };

  const deleteCMSFaq = async (id: string) => {
      await deleteDoc(doc(db, "cms_faqs", id));
      await logAction("CMS_DELETE_FAQ", `SSS silindi: ${id}`);
      showToast('Soru silindi.', 'info');
  };

  const addCMSGalleryItem = async (item: Omit<CMSGalleryItem, 'id'>) => {
      await addDoc(collection(db, "cms_gallery"), item);
      await logAction("CMS_ADD_GALLERY", `Galeriye fotoğraf eklendi: ${item.category}`);
      showToast('Fotoğraf eklendi.', 'success');
  };

  const deleteCMSGalleryItem = async (id: string) => {
      await deleteDoc(doc(db, "cms_gallery"), id);
      await logAction("CMS_DELETE_GALLERY", `Galeriden fotoğraf silindi: ${id}`);
      showToast('Fotoğraf silindi.', 'info');
  };

  const addCMSAcademyItem = async (item: Omit<CMSAcademyItem, 'id'>) => {
      await addDoc(collection(db, "cms_academy"), item);
      await logAction("CMS_ADD_ACADEMY", `Akademi içeriği eklendi: ${item.title}`);
      showToast('İçerik eklendi.', 'success');
  };

  const deleteCMSAcademyItem = async (id: string) => {
      await deleteDoc(doc(db, "cms_academy"), id);
      await logAction("CMS_DELETE_ACADEMY", `Akademi içeriği silindi: ${id}`);
      showToast('İçerik silindi.', 'info');
  };

  const addCMSTimelineItem = async (item: Omit<CMSTimelineItem, 'id'>) => {
      await addDoc(collection(db, "cms_timeline"), item);
      await logAction("CMS_ADD_TIMELINE", `Takvim öğesi eklendi: ${item.title}`);
      showToast('Takvim güncellendi.', 'success');
  };

  const deleteCMSTimelineItem = async (id: string) => {
      await deleteDoc(doc(db, "cms_timeline"), id);
      await logAction("CMS_DELETE_TIMELINE", `Takvim öğesi silindi: ${id}`);
      showToast('Takvim güncellendi.', 'info');
  };

  // NEW: Update Prize
  const updateCMSPrize = async (prize: CMSPrize) => {
      await setDoc(doc(db, "cms_prizes", prize.id), prize);
      await logAction("CMS_UPDATE_PRIZE", `Ödül güncellendi: ${prize.title}`);
      showToast('Ödül bilgisi kaydedildi.', 'success');
  };

  const logAction = async (action: string, details: string, targetId?: string) => {
      if(!currentUser) return;
      
      const newLog: LogEntry = {
          id: `LOG-${Date.now()}`,
          action,
          details,
          performedBy: currentUser.email,
          timestamp: new Date().toISOString(),
          targetId
      };
      
      try {
          await addDoc(collection(db, "auditLogs"), newLog);
      } catch (e) {
          console.error("Failed to log", e);
      }
  };

  return (
    <AppContext.Provider value={{ 
      currentUser, 
      allUsers,
      loading,
      login, 
      logout, 
      registerTeacher, 
      resendVerificationEmail,
      resetPassword,
      updateUserRole,
      currentApplication, 
      createApplication, 
      updateApplication,
      allApplications,
      submitScore,
      fetchJuryScores,
      assignJury,
      currentDate,
      setSimulatedDate,
      systemSettings,
      updateSystemSettings,
      auditLogs,
      logAction,
      
      // CMS Values
      cmsGeneral,
      cmsLinks,
      cmsFaqs,
      cmsGallery,
      cmsAcademy,
      cmsTimeline,
      cmsPrizes,
      updateCMSGeneral,
      updateCMSLinks,
      updateCMSPrize,
      addCMSFaq,
      updateCMSFaq,
      deleteCMSFaq,
      addCMSGalleryItem,
      deleteCMSGalleryItem,
      addCMSAcademyItem,
      deleteCMSAcademyItem,
      addCMSTimelineItem,
      deleteCMSTimelineItem,

      toasts,
      showToast,
      removeToast,
      notifications,
      markNotificationAsRead,
      sendNotification,
      sendAnnouncement,
      sendMessage,
      submitPublicVote
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
};
