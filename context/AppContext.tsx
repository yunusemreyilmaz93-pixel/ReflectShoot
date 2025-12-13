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
import { Application, ApplicationStatus, UserRole, EvaluationCriteria, UserProfile, SystemSettings, LogEntry, ScoreDocument, ToastMessage, Notification, ChatMessage, CMSGeneral, CMSFaqItem, CMSGalleryItem, NotificationTarget, CMSAcademyItem, CMSTimelineItem, CMSPrize, CMSLinks, ContactMessage } from '../types';

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
  bulkUpdateApplications: (appIds: string[], status: ApplicationStatus) => Promise<void>; // New
  
  // Scoring Logic
  submitScore: (appId: string, criteria: EvaluationCriteria, notes: string) => Promise<void>;
  fetchJuryScores: (appId: string) => Promise<ScoreDocument[]>;
  assignJury: (appId: string, juryIds: string[]) => Promise<void>; 
  bulkAssignJury: (assignments: {appId: string, juryIds: string[]}[]) => Promise<void>; 
  
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
  cmsLinks: CMSLinks;
  cmsFaqs: CMSFaqItem[];
  cmsGallery: CMSGalleryItem[];
  cmsAcademy: CMSAcademyItem[];
  cmsTimeline: CMSTimelineItem[];
  cmsPrizes: CMSPrize[];
  updateCMSGeneral: (data: CMSGeneral) => Promise<void>;
  updateCMSLinks: (data: CMSLinks) => Promise<void>;
  updateCMSPrize: (prize: CMSPrize) => Promise<void>;
  addCMSFaq: (faq: Omit<CMSFaqItem, 'id'>) => Promise<void>;
  updateCMSFaq: (id: string, data: Partial<CMSFaqItem>) => Promise<void>;
  deleteCMSFaq: (id: string) => Promise<void>;
  addCMSGalleryItem: (item: Omit<CMSGalleryItem, 'id'>) => Promise<void>;
  deleteCMSGalleryItem: (id: string) => Promise<void>;
  addCMSAcademyItem: (item: Omit<CMSAcademyItem, 'id'>) => Promise<void>; 
  updateCMSAcademyItem: (id: string, data: Partial<CMSAcademyItem>) => Promise<void>;
  deleteCMSAcademyItem: (id: string) => Promise<void>; 
  addCMSTimelineItem: (item: Omit<CMSTimelineItem, 'id'>) => Promise<void>; 
  updateCMSTimelineItem: (id: string, data: Partial<CMSTimelineItem>) => Promise<void>; 
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

  // Chat & Support
  sendMessage: (appId: string, text: string) => Promise<void>;
  contactMessages: ContactMessage[]; // New
  sendContactMessage: (data: Omit<ContactMessage, 'id' | 'createdAt' | 'status'>) => Promise<void>; // New
  markContactMessageAsRead: (id: string) => Promise<void>; // New
  
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
    publicVoteEnd: '2026-05-10T23:59:59',
    finalistRevealStart: '2026-04-01T00:00:00',
    finalistRevealEnd: '2026-04-04T23:59:59',
    reviseUploadStart: '2026-04-13T00:00:00',
    reviseUploadEnd: '2026-05-04T23:59:59'
  },
  features: {
    judgeSystemActive: true,
    publicResultReveal: false,
    allowNewRegistrations: true,
    publicVotingActive: true,
    videoUploadActive: true
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

// Default FAQs
const DEFAULT_CMS_FAQS: CMSFaqItem[] = [
    {
        id: 'faq1',
        category: 'Genel',
        question: 'Yarışmaya kimler katılabilir?',
        answer: 'Türkiye genelindeki tüm Anadolu İmam Hatip Lisesi öğrencileri yarışmaya katılabilir. Takımlar en az 3, en fazla 6 öğrenciden oluşmalıdır ve bir danışman öğretmen bulunması zorunludur.',
        order: 1
    },
    {
        id: 'faq2',
        category: 'Teknik',
        question: 'Filmlerin süresi ne kadar olmalıdır?',
        answer: 'Filmler, jenerik dahil en az 3 dakika, en fazla 8 dakika uzunluğunda olmalıdır. Bu süre sınırlarına uymayan eserler değerlendirmeye alınmayacaktır.',
        order: 2
    },
    {
        id: 'faq3',
        category: 'Teknik',
        question: 'Hangi formatta teslim etmeliyiz?',
        answer: 'Filmler MP4 veya MOV formatında, en az 1920x1080 (Full HD) çözünürlükte teslim edilmelidir. Görüntü oranı 16:9 (yatay) olmalıdır.',
        order: 3
    }
];

const DEFAULT_CMS_ACADEMY: CMSAcademyItem[] = [
  { id: 'static-1', title: 'Senaryo Yazım Formatı', description: 'Endüstri standardı senaryo formatı (Fransız/Amerikan). Sahne başlığı, eylem ve diyalog yazım kuralları.', type: 'PDF', url: 'https://www.senaryo.org/wp-content/uploads/2023/01/Senaryo-Sablonu.pdf', category: 'Hazırlık', subTag: 'Genel' },
  { id: 'static-2', title: 'Storyboard Şablonu', description: 'Çekim öncesi görsel planlama için kare kare çizim şablonu. Kamera açılarını ve hareketlerini not alın.', type: 'PDF', url: '#', category: 'Hazırlık', subTag: 'Genel' },
  { id: 'static-3', title: 'Çekim Ölçekleri Rehberi', description: 'Geniş plan, detay plan, omuz plan... Hangi ölçek ne zaman kullanılır? Görsel anlatım dili rehberi.', type: 'PDF', url: '#', category: 'Hazırlık', subTag: 'Canlı Çekim' },
  { id: 'static-4', title: 'AI Prompt Mühendisliği', description: 'Midjourney ve DALL-E için etkili prompt yazma teknikleri. Işık, stil ve lens parametreleri sözlüğü.', type: 'LINK', url: '#', category: 'Hazırlık', subTag: 'Yapay Zeka' },
  { id: 'static-5', title: 'Film Analizi Formu', description: 'İzlediğiniz filmleri veya kendi senaryonuzu analiz ederken kullanabileceğiniz dramatik yapı çözümleme formu.', type: 'PDF', url: '#', category: 'Hazırlık', subTag: 'Genel' },
  { id: 'static-6', title: 'Kurgu Terimleri Sözlüğü', description: 'Kuleshov etkisi, J-Cut, L-Cut gibi temel kurgu terimleri ve kullanım amaçları.', type: 'PDF', url: '#', category: 'Hazırlık', subTag: 'Genel' },
  { id: 'static-7', title: 'Ses Kayıt & Mikrofon', description: 'Temiz ses almanın püf noktaları. Mikrofon konumlandırma ve ortam sesi yönetimi.', type: 'VIDEO', url: '#', category: 'Hazırlık', subTag: 'Canlı Çekim' },
  { id: 'static-8', title: 'Runway Gen-2 Rehberi', description: 'Metinden videoya (Text-to-Video) ve Resimden videoya (Image-to-Video) oluşturma teknikleri.', type: 'VIDEO', url: '#', category: 'Hazırlık', subTag: 'Yapay Zeka' },
  { id: 'static-9', title: 'Telifsiz Kaynaklar Listesi', description: 'Projelerinizde yasal olarak kullanabileceğiniz ücretsiz müzik, ses efekti ve stok video siteleri.', type: 'LINK', url: '#', category: 'Hazırlık', subTag: 'Genel' },
  { id: 'static-10', title: 'Prodüksiyon Takvimi', description: 'Çekim günlerini planlamak ve kaynakları yönetmek için hazır planlama dosyası.', type: 'PDF', url: '#', category: 'Hazırlık', subTag: 'Canlı Çekim' },
  { id: 'static-11', title: 'Sinematik Işık Kurulumu', description: 'Üç nokta ışık tekniği (Key, Fill, Back Light) ve doğal ışığı verimli kullanma yöntemleri.', type: 'VIDEO', url: '#', category: 'Hazırlık', subTag: 'Canlı Çekim' },
  { id: 'static-12', title: 'AI Seslendirme Araçları', description: 'ElevenLabs ve Adobe Podcast kullanarak karakter seslendirme ve ses kalitesini iyileştirme rehberi.', type: 'LINK', url: '#', category: 'Hazırlık', subTag: 'Yapay Zeka' }
];

// Default Timeline
const DEFAULT_CMS_TIMELINE: CMSTimelineItem[] = [
    { id: 't1', date: '20 Ocak 2026', title: 'Başvuruların Başlaması', description: 'Reflect&Shoot 2026 maratonu resmen başlıyor! Takımını kur, temayı seç ve sisteme kaydını yaptır.', order: 1 },
    { id: 't2', date: '13 Şubat 2026', title: 'Son Başvuru Tarihi', description: 'Yarışmaya katılım için son gün. Belgelerini ve takım bilgilerini eksiksiz tamamlamayı unutma.', order: 2 },
    { id: 't3', date: '16 Şubat – 20 Mart 2026', title: 'İlk Video Teslim Süreci', description: 'Senaryonu filme dökme vakti. Çektiğin ham veya kurgulanmış ilk versiyonu sisteme yükle.', order: 3 },
    { id: 't4', date: '1 Nisan 2026', title: 'Finalistlerin Açıklanması', description: 'Ön jüri değerlendirmesi tamamlanıyor. Finale kalmaya hak kazanan takımlar duyuruluyor.', order: 4 },
    { id: 't5', date: '6 - 8 - 10 Nisan 2026', title: 'Online Akademi & Workshoplar', description: 'Finalist takımlar için senaryo, teknik ve kurgu üzerine yoğunlaştırılmış online atölye çalışmaları.', order: 5 },
    { id: 't6', date: '13 Nisan – 4 Mayıs 2026', title: 'Revize ve Final Teslim', description: 'Akademiden edinilen bilgilerle filmlerin revize edilmesi ve son kurgunun jüriye teslimi.', order: 6 },
    { id: 't7', date: '11 Mayıs 2026', title: 'Sonuçların Açıklanması', description: 'Jüri değerlendirmesi tamamlanıyor ve dereceye giren eserler ilan ediliyor.', order: 7 },
    { id: 't8', date: '22 Mayıs 2026', title: 'Büyük Final & Ödül Töreni', description: 'Gala gecesi, kırmızı halı ve büyük ödüllerin sahiplerini bulması.', order: 8 }
];

// Default Prizes
const DEFAULT_CMS_PRIZES: CMSPrize[] = [
    { id: 'rank1', title: 'Altın Kamera Ödülü', reward: '40.000 TL', description: 'Yaratıcılığı, teknik ustalığı ve sinematik anlatımıyla jüriyi en çok etkileyen birinci ekip bu büyük ödülün sahibi olur.' },
    { id: 'rank2', title: 'Gümüş Klaket Ödülü', reward: '30.000 TL', description: 'Kurgusal bütünlük, sahne tasarımı ve anlatım başarısıyla ikinci seçilen ekip ödüllendirilir.' },
    { id: 'rank3', title: 'Bronz Film Makarası', reward: '20.000 TL', description: 'Teknik başarı, kamera kullanımı ve görsel anlatım gücüyle öne çıkan üçüncü ekip bu ödülü alır.' },
    { id: 'mention', title: 'Mansiyon Ödülü', reward: 'Sürpriz Ödül', description: 'Gelecek vadeden, potansiyeli yüksek ve özgün sinematik yaklaşıma sahip ekibe verilen özel teşvik ödülü.' },
    { id: 'special', title: 'Jüri Özel Ödülü', reward: 'Sanatsal Cesaret Ödülü', description: 'Klasik anlatımın dışına çıkarak cesur, yenilikçi ve etkileyici bir yaklaşım sergileyen ekibe verilen özel jüri plaketi.' }
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
  const [cmsAcademy, setCmsAcademy] = useState<CMSAcademyItem[]>(DEFAULT_CMS_ACADEMY);
  const [cmsTimeline, setCmsTimeline] = useState<CMSTimelineItem[]>(DEFAULT_CMS_TIMELINE);
  const [cmsPrizes, setCmsPrizes] = useState<CMSPrize[]>(DEFAULT_CMS_PRIZES);

  // Contact Messages
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);

  // ... (rest of state)
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // ... (helper functions)
  const setSimulatedDate = (date: Date) => { setCurrentDate(date); };
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => { removeToast(id); }, 4000);
  };
  const removeToast = (id: string) => { setToasts((prev) => prev.filter(t => t.id !== id)); };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        try {
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
              setCurrentUser({ ...userDoc.data() as UserProfile, emailVerified: user.emailVerified });
            } else { setCurrentUser(null); }
        } catch (e) { console.error("Error fetching user profile:", e); }
      } else {
        setCurrentUser(null); setCurrentApplication(null); setAllApplications([]); setAllUsers([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // ... (CMS Sync Effects - Unchanged) ...
  useEffect(() => {
    const generalRef = doc(db, "cms_general", "info");
    const unsubGeneral = onSnapshot(generalRef, (docSnap) => { if(docSnap.exists()) setCmsGeneral(docSnap.data() as CMSGeneral); });

    const linksRef = doc(db, "cms_links", "docs");
    const unsubLinks = onSnapshot(linksRef, (docSnap) => { if(docSnap.exists()) setCmsLinks(docSnap.data() as CMSLinks); });

    const qFaqs = query(collection(db, "cms_faqs"), orderBy("order", "asc"));
    const unsubFaqs = onSnapshot(qFaqs, (snap) => {
        const faqs: CMSFaqItem[] = [];
        snap.forEach(d => faqs.push({ id: d.id, ...d.data() } as CMSFaqItem));
        if (faqs.length === 0) setCmsFaqs(DEFAULT_CMS_FAQS);
        else setCmsFaqs(faqs);
    });

    const qGallery = query(collection(db, "cms_gallery"), orderBy("year", "desc"));
    const unsubGallery = onSnapshot(qGallery, (snap) => {
        const items: CMSGalleryItem[] = [];
        snap.forEach(d => items.push({ id: d.id, ...d.data() } as CMSGalleryItem));
        setCmsGallery(items);
    });

    const qAcademy = query(collection(db, "cms_academy"));
    const unsubAcademy = onSnapshot(qAcademy, (snap) => {
        const items: CMSAcademyItem[] = [];
        snap.forEach(d => items.push({ id: d.id, ...d.data() } as CMSAcademyItem));
        if (items.length === 0) setCmsAcademy(DEFAULT_CMS_ACADEMY);
        else setCmsAcademy(items);
    });

    const qTimeline = query(collection(db, "cms_timeline"), orderBy("order", "asc"));
    const unsubTimeline = onSnapshot(qTimeline, (snap) => {
        const items: CMSTimelineItem[] = [];
        snap.forEach(d => items.push({ id: d.id, ...d.data() } as CMSTimelineItem));
        if (items.length === 0) setCmsTimeline(DEFAULT_CMS_TIMELINE);
        else setCmsTimeline(items);
    });

    const qPrizes = query(collection(db, "cms_prizes"));
    const unsubPrizes = onSnapshot(qPrizes, (snap) => {
        const items: CMSPrize[] = [];
        snap.forEach(d => items.push({ id: d.id, ...d.data() } as CMSPrize));
        if (items.length === 0) setCmsPrizes(DEFAULT_CMS_PRIZES);
        else setCmsPrizes(items);
    });

    const settingsRef = doc(db, "system", "config");
    getDoc(settingsRef).then(docSnap => {
        if(docSnap.exists()) setSystemSettings(docSnap.data() as SystemSettings);
        else setDoc(settingsRef, DEFAULT_SETTINGS).catch(e => console.warn("Failed to init settings", e.message)); 
    }).catch(e => console.warn("Settings fetch warning", e.message));

    let unsubPublicFinalists = () => {};
    let unsubApps = () => {};
    let unsubLogs = () => {};
    let unsubUsers = () => {};
    let unsubNotifs = () => {};
    let unsubMessages = () => {};

    if (!currentUser) {
        const qFinalists = query(collection(db, "applications"), where("team.isFinalist", "==", true));
        unsubPublicFinalists = onSnapshot(qFinalists, (snap) => {
            const apps: Application[] = [];
            snap.forEach(d => apps.push(d.data() as Application));
            setAllApplications(apps);
        }, (error) => console.warn("Public Finalists Sync Warning:", error.message));
    } else {
        let qApps;
        if (currentUser.role === UserRole.ADMIN) qApps = query(collection(db, "applications"));
        else if (currentUser.role === UserRole.JUDGE) qApps = query(collection(db, "applications"), where("status", "in", [ApplicationStatus.FINAL_SUBMITTED, ApplicationStatus.GRADED, ApplicationStatus.APPROVED, ApplicationStatus.UNDER_REVIEW]));
        else qApps = query(collection(db, "applications"), where("teacher.email", "==", currentUser.email));

        unsubApps = onSnapshot(qApps, (querySnapshot) => {
          const apps: Application[] = [];
          querySnapshot.forEach((doc) => apps.push(doc.data() as Application));
          setAllApplications(apps);
          if (currentUser.role === UserRole.TEACHER) {
             const userApp = apps.find(app => app.teacher.email === currentUser.email);
             setCurrentApplication(userApp || null);
          }
        }, (error) => console.warn("Application Sync Warning:", error.message));

        const qNotifs = query(collection(db, "notifications"), where("userId", "==", currentUser.uid), orderBy("createdAt", "desc"), limit(20));
        unsubNotifs = onSnapshot(qNotifs, (snap) => {
            const notifs: Notification[] = [];
            snap.forEach(d => notifs.push({ id: d.id, ...d.data() } as Notification));
            setNotifications(notifs);
        }, (error) => console.warn("Notifications Sync Warning:", error.message));

        if (currentUser.role === UserRole.ADMIN) {
            const qLogs = query(collection(db, "auditLogs"), orderBy("timestamp", "desc"), limit(50));
            unsubLogs = onSnapshot(qLogs, (snap) => {
                const logs: LogEntry[] = [];
                snap.forEach(d => logs.push({ id: d.id, ...d.data() } as LogEntry));
                setAuditLogs(logs);
            }, (error) => console.warn("Audit Logs Sync Warning:", error.message));

            const qUsers = query(collection(db, "users"));
            unsubUsers = onSnapshot(qUsers, (snap) => {
                const users: UserProfile[] = [];
                snap.forEach(d => users.push(d.data() as UserProfile));
                setAllUsers(users);
            }, (error) => console.warn("Users Sync Warning:", error.message));

            // Sync Contact Messages
            const qMessages = query(collection(db, "contact_messages"), orderBy("createdAt", "desc"));
            unsubMessages = onSnapshot(qMessages, (snap) => {
                const msgs: ContactMessage[] = [];
                snap.forEach(d => msgs.push({ id: d.id, ...d.data() } as ContactMessage));
                setContactMessages(msgs);
            });
        }
    }

    return () => {
        unsubGeneral(); unsubLinks(); unsubFaqs(); unsubGallery(); unsubAcademy(); unsubTimeline(); unsubPrizes();
        if(unsubPublicFinalists) unsubPublicFinalists();
        if(unsubApps) unsubApps();
        if(unsubLogs) unsubLogs();
        if(unsubUsers) unsubUsers();
        if(unsubNotifs) unsubNotifs();
        if(unsubMessages) unsubMessages();
    };
  }, [currentUser]);

  // ... (auth functions)
  const login = async (email: string, password: string) => { await signInWithEmailAndPassword(auth, email, password); };
  const logout = async () => { await signOut(auth); };
  const resetPassword = async (email: string) => { await sendPasswordResetEmail(auth, email); };
  const registerTeacher = async (data: any) => {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
        const user = userCredential.user;
        if (user) {
          await sendEmailVerification(user);
          const isK12 = data.email.endsWith('k12.tr');
          const initialRole = isK12 ? UserRole.TEACHER : UserRole.PENDING_TEACHER;
          const newProfile: UserProfile = { uid: user.uid, email: data.email, fullName: data.name, role: initialRole, school: data.school, city: data.city, createdAt: new Date().toISOString(), emailVerified: false };
          await setDoc(doc(db, "users", user.uid), JSON.parse(JSON.stringify(newProfile)));
          await logAction("NEW_REGISTRATION", `${data.name} (${data.school}) kayıt oldu.`, user.uid);
        }
      } catch (error) { console.error("Registration Error:", error); throw error; }
  };
  const resendVerificationEmail = async () => { if (auth.currentUser) await sendEmailVerification(auth.currentUser); };
  const updateUserRole = async (uid: string, newRole: UserRole) => {
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, { role: newRole });
      await logAction("UPDATE_ROLE", `Kullanıcı rolü güncellendi: ${newRole}`, uid);
      await sendNotification(uid, "Rol Güncellemesi", `Hesap yetkiniz ${newRole} olarak güncellendi.`, "success");
  };

  // ... (application & scoring functions)
  const createApplication = async (data: any) => {
    if (!currentUser) return;
    const newApp: Application = {
      id: `APP-${currentUser.uid}`,
      teacher: { id: `T-${currentUser.uid}`, fullName: currentUser.fullName, school: currentUser.school || 'Belirtilmedi', city: currentUser.city || 'Belirtilmedi', email: currentUser.email, phone: currentUser.phone || "" },
      team: { id: `TEAM-${Date.now()}`, name: data.teamName, category: data.category, theme: data.theme, ...(data.selectedVerse ? { selectedVerse: data.selectedVerse } : {}), ...(data.logoFile ? { logoUrl: URL.createObjectURL(data.logoFile) } : {}), students: data.students.map((s: any, idx: number) => ({ id: `S-${Date.now()}-${idx}`, firstName: s.firstName, lastName: s.lastName, grade: s.grade, hasKvkkConsent: false, hasParentalConsent: false, docStatus: 'PENDING' })), videoStatus: 'PENDING', isPreliminaryStageComplete: false, isFinalStageComplete: false, isFinalist: false },
      status: ApplicationStatus.DRAFT, submittedAt: new Date().toISOString()
    };
    try { await setDoc(doc(db, "applications", newApp.id), JSON.parse(JSON.stringify(newApp))); showToast('Takım başarıyla oluşturuldu!', 'success'); const admins = allUsers.filter(u => u.role === UserRole.ADMIN); admins.forEach(admin => sendNotification(admin.uid, "Yeni Başvuru", `${currentUser.fullName} yeni bir takım oluşturdu: ${data.teamName}`, "info")); } catch (error) { console.error(error); showToast('Takım oluşturulurken hata oluştu.', 'error'); }
  };
  const updateApplication = async (updatedApp: Application) => { 
      try { await setDoc(doc(db, "applications", updatedApp.id), JSON.parse(JSON.stringify(updatedApp))); showToast('Başvuru güncellendi.', 'success'); if (updatedApp.status === ApplicationStatus.FINAL_SUBMITTED) { const admins = allUsers.filter(u => u.role === UserRole.ADMIN); admins.forEach(admin => sendNotification(admin.uid, "Video Yüklendi", `${updatedApp.team.name} final videosunu yükledi.`, "success")); } if (currentUser?.role === UserRole.ADMIN) { const teacherId = updatedApp.id.replace("APP-", ""); sendNotification(teacherId, "Durum Güncellemesi", `Başvuru durumunuz güncellendi: ${updatedApp.status}`, "info"); if (updatedApp.team.isFinalist) sendNotification(teacherId, "TEBRİKLER!", "Takımınız FİNALİST olmaya hak kazandı!", "success"); } } catch (error) { console.error(error); showToast('Güncelleme sırasında hata oluştu.', 'error'); }
  };
  const submitScore = async (appId: string, criteria: EvaluationCriteria, notes: string) => { 
      if (!currentUser || currentUser.role !== UserRole.JUDGE) return;
      const totalScore = criteria.story + criteria.technical + criteria.originality + criteria.themeFit;
      const scoreDoc: ScoreDocument = { juryId: currentUser.uid, juryName: currentUser.fullName, total: totalScore, criteria: criteria, notes: notes, updatedAt: new Date().toISOString() };
      const scoreRef = doc(db, "applications", appId, "scores", currentUser.uid);
      await setDoc(scoreRef, scoreDoc);
      const scoresSnapshot = await getDocs(collection(db, "applications", appId, "scores"));
      let sum = 0; let count = 0; const gradedBy: string[] = [];
      scoresSnapshot.forEach(doc => { const data = doc.data() as ScoreDocument; sum += data.total; count++; gradedBy.push(data.juryId); });
      const avg = count > 0 ? parseFloat((sum / count).toFixed(2)) : 0;
      const appRef = doc(db, "applications", appId);
      await updateDoc(appRef, { finalScore: avg, juryCount: count, gradedBy: gradedBy, status: ApplicationStatus.GRADED });
      await logAction("SUBMIT_SCORE", `Puan verildi: ${totalScore} (Takım: ${appId})`, appId);
      showToast('Puan başarıyla kaydedildi!', 'success');
      const admins = allUsers.filter(u => u.role === UserRole.ADMIN);
      admins.forEach(admin => sendNotification(admin.uid, "Jüri Puanlaması", `${currentUser.fullName} bir takımı puanladı (${totalScore}).`, "info"));
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

  const bulkAssignJury = async (assignments: {appId: string, juryIds: string[]}[]) => {
      if(!currentUser || currentUser.role !== UserRole.ADMIN) return;
      const batch = writeBatch(db);
      assignments.forEach(item => {
          const ref = doc(db, "applications", item.appId);
          batch.update(ref, { assignedJuryIds: item.juryIds });
      });
      await batch.commit();
      await logAction("BULK_ASSIGN_JURY", `${assignments.length} takım için otomatik jüri ataması yapıldı.`);
      showToast(`${assignments.length} takıma jüri ataması başarıyla yapıldı.`, 'success');
  };

  // NEW: Bulk Update Application Status
  const bulkUpdateApplications = async (appIds: string[], status: ApplicationStatus) => {
      if(!currentUser || currentUser.role !== UserRole.ADMIN) return;
      const batch = writeBatch(db);
      appIds.forEach(id => {
          const ref = doc(db, "applications", id);
          batch.update(ref, { status: status });
      });
      await batch.commit();
      await logAction("BULK_STATUS_UPDATE", `${appIds.length} takım durumu güncellendi: ${status}`);
      showToast(`${appIds.length} takım güncellendi.`, 'success');
  };

  // ... (notifications, messaging, public vote, system settings, CMS general/links/faq/gallery/academy/timeline functions - Unchanged)
  const sendNotification = async (userId: string, title: string, message: string, type: 'info' | 'success' | 'warning' | 'error') => { try { await addDoc(collection(db, "notifications"), { userId, title, message, type, read: false, createdAt: new Date().toISOString() }); } catch (e) { console.error("Notification Error:", e); } };
  const markNotificationAsRead = async (id: string) => { await updateDoc(doc(db, "notifications", id), { read: true }); };
  const sendAnnouncement = async (target: NotificationTarget, title: string, message: string, type: 'info' | 'success' | 'warning' | 'error') => {
      let targetUserIds: string[] = [];
      if (target === 'ALL') targetUserIds = allUsers.map(u => u.uid);
      else if (target === 'TEACHERS') targetUserIds = allUsers.filter(u => u.role === UserRole.TEACHER).map(u => u.uid);
      else if (target === 'JUDGES') targetUserIds = allUsers.filter(u => u.role === UserRole.JUDGE).map(u => u.uid);
      else if (target === 'FINALISTS') { const finalistEmails = allApplications.filter(a => a.team.isFinalist).map(a => a.teacher.email); targetUserIds = allUsers.filter(u => finalistEmails.includes(u.email)).map(u => u.uid); }
      let count = 0; for (const uid of targetUserIds) { await sendNotification(uid, title, message, type); count++; }
      await logAction("ANNOUNCEMENT", `Duyuru gönderildi (${count} kişi): ${title}`);
      showToast(`${count} kişiye duyuru gönderildi.`, 'success');
  };
  const sendMessage = async (appId: string, text: string) => { if (!currentUser) return; const msg: ChatMessage = { id: `MSG-${Date.now()}`, senderId: currentUser.uid, senderName: currentUser.fullName, senderRole: currentUser.role, text, createdAt: new Date().toISOString() }; await addDoc(collection(db, "applications", appId, "messages"), msg); };
  
  // NEW: Contact Messages
  const sendContactMessage = async (data: Omit<ContactMessage, 'id' | 'createdAt' | 'status'>) => {
      await addDoc(collection(db, "contact_messages"), { ...data, createdAt: new Date().toISOString(), status: 'UNREAD' });
  };
  const markContactMessageAsRead = async (id: string) => {
      await updateDoc(doc(db, "contact_messages", id), { status: 'READ' });
  };

  const submitPublicVote = async (appId: string, fingerprint: string) => { const q = query(collection(db, "public_votes"), where("appId", "==", appId), where("voterFingerprint", "==", fingerprint)); const snap = await getDocs(q); if (!snap.empty) throw new Error("Bu video için zaten oy kullandınız."); await addDoc(collection(db, "public_votes"), { appId, voterFingerprint: fingerprint, timestamp: new Date().toISOString() }); await updateDoc(doc(db, "applications", appId), { "team.publicVotes": increment(1) }); };
  const updateSystemSettings = async (settings: SystemSettings) => { await setDoc(doc(db, "system", "config"), settings); setSystemSettings(settings); await logAction("UPDATE_SETTINGS", "Sistem ayarları güncellendi."); showToast('Sistem ayarları kaydedildi.', 'success'); };
  
  const updateCMSGeneral = async (data: CMSGeneral) => { await setDoc(doc(db, "cms_general", "info"), data); await logAction("CMS_UPDATE", "Genel site ayarları güncellendi."); showToast('Genel ayarlar güncellendi.', 'success'); };
  const updateCMSLinks = async (data: CMSLinks) => { await setDoc(doc(db, "cms_links", "docs"), data); await logAction("CMS_UPDATE_LINKS", "Dosya linkleri güncellendi."); showToast('Linkler güncellendi.', 'success'); };
  const addCMSFaq = async (faq: Omit<CMSFaqItem, 'id'>) => { await addDoc(collection(db, "cms_faqs"), faq); await logAction("CMS_ADD_FAQ", `Yeni SSS eklendi: ${faq.question}`); showToast('Soru eklendi.', 'success'); };
  const updateCMSFaq = async (id: string, data: Partial<CMSFaqItem>) => { await setDoc(doc(db, "cms_faqs", id), data, { merge: true }); await logAction("CMS_UPDATE_FAQ", `SSS güncellendi: ${id}`); showToast('Soru güncellendi.', 'success'); };
  const deleteCMSFaq = async (id: string) => { await deleteDoc(doc(db, "cms_faqs", id)); await logAction("CMS_DELETE_FAQ", `SSS silindi: ${id}`); showToast('Soru silindi.', 'info'); };
  const addCMSGalleryItem = async (item: Omit<CMSGalleryItem, 'id'>) => { await addDoc(collection(db, "cms_gallery"), item); await logAction("CMS_ADD_GALLERY", `Galeriye fotoğraf eklendi: ${item.category}`); showToast('Fotoğraf eklendi.', 'success'); };
  const deleteCMSGalleryItem = async (id: string) => { await deleteDoc(doc(db, "cms_gallery"), id); await logAction("CMS_DELETE_GALLERY", `Galeriden fotoğraf silindi: ${id}`); showToast('Fotoğraf silindi.', 'info'); };
  const addCMSAcademyItem = async (item: Omit<CMSAcademyItem, 'id'>) => { await addDoc(collection(db, "cms_academy"), item); await logAction("CMS_ADD_ACADEMY", `Akademi içeriği eklendi: ${item.title}`); showToast('İçerik eklendi.', 'success'); };
  const updateCMSAcademyItem = async (id: string, data: Partial<CMSAcademyItem>) => { await updateDoc(doc(db, "cms_academy", id), data); await logAction("CMS_UPDATE_ACADEMY", `Akademi içeriği güncellendi: ${id}`); showToast('İçerik güncellendi.', 'success'); };
  const deleteCMSAcademyItem = async (id: string) => { await deleteDoc(doc(db, "cms_academy"), id); await logAction("CMS_DELETE_ACADEMY", `Akademi içeriği silindi: ${id}`); showToast('İçerik silindi.', 'info'); };
  const addCMSTimelineItem = async (item: Omit<CMSTimelineItem, 'id'>) => { await addDoc(collection(db, "cms_timeline"), item); await logAction("CMS_ADD_TIMELINE", `Takvim öğesi eklendi: ${item.title}`); showToast('Takvim güncellendi.', 'success'); };
  const updateCMSTimelineItem = async (id: string, data: Partial<CMSTimelineItem>) => { await updateDoc(doc(db, "cms_timeline", id), data); await logAction("CMS_UPDATE_TIMELINE", `Takvim öğesi güncellendi: ${id}`); showToast('Takvim güncellendi.', 'success'); };
  const deleteCMSTimelineItem = async (id: string) => { await deleteDoc(doc(db, "cms_timeline"), id); await logAction("CMS_DELETE_TIMELINE", `Takvim öğesi silindi: ${id}`); showToast('Takvim güncellendi.', 'info'); };

  const updateCMSPrize = async (prize: CMSPrize) => {
      await setDoc(doc(db, "cms_prizes", prize.id), prize, { merge: true });
      await logAction("CMS_UPDATE_PRIZE", `Ödül güncellendi: ${prize.title}`);
      showToast('Ödül bilgisi kaydedildi.', 'success');
  };

  const logAction = async (action: string, details: string, targetId?: string) => {
      if(!currentUser) return;
      const newLog: LogEntry = { id: `LOG-${Date.now()}`, action, details, performedBy: currentUser.email, timestamp: new Date().toISOString(), targetId };
      try { await addDoc(collection(db, "auditLogs"), newLog); } catch (e) { console.error("Failed to log", e); }
  };

  return (
    <AppContext.Provider value={{ 
      currentUser, allUsers, loading, login, logout, registerTeacher, resendVerificationEmail, resetPassword, updateUserRole,
      currentApplication, createApplication, updateApplication, allApplications, submitScore, fetchJuryScores, assignJury, bulkAssignJury, bulkUpdateApplications,
      currentDate, setSimulatedDate, systemSettings, updateSystemSettings, auditLogs, logAction,
      cmsGeneral, cmsLinks, cmsFaqs, cmsGallery, cmsAcademy, cmsTimeline, cmsPrizes,
      updateCMSGeneral, updateCMSLinks, updateCMSPrize, addCMSFaq, updateCMSFaq, deleteCMSFaq,
      addCMSGalleryItem, deleteCMSGalleryItem, addCMSAcademyItem, updateCMSAcademyItem, deleteCMSAcademyItem, addCMSTimelineItem, deleteCMSTimelineItem, updateCMSTimelineItem,
      toasts, showToast, removeToast, notifications, markNotificationAsRead, sendNotification, sendAnnouncement, sendMessage, submitPublicVote,
      contactMessages, sendContactMessage, markContactMessageAsRead
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