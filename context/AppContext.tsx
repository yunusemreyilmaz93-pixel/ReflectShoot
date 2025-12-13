
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth, db } from '../lib/firebase';
// @ts-ignore
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail } from 'firebase/auth';
import { 
    doc, 
    getDoc, 
    setDoc, 
    updateDoc, 
    collection, 
    query, 
    where, 
    onSnapshot, 
    addDoc, 
    serverTimestamp, 
    deleteDoc, 
    writeBatch, 
    orderBy, 
    getDocs
} from 'firebase/firestore';
import { 
    UserProfile, 
    UserRole, 
    SystemSettings, 
    Application, 
    ToastMessage, 
    CMSGeneral, 
    CMSLinks, 
    CMSPrize, 
    CMSFaqItem, 
    CMSGalleryItem, 
    CMSAcademyItem, 
    CMSTimelineItem, 
    ContactMessage, 
    Notification,
    LogEntry,
    ApplicationStatus,
    NotificationTarget,
    EvaluationCriteria,
    ScoreDocument,
    Team,
    TeacherProfile,
    Category,
    Theme
} from '../types';

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
    },
    {
        id: 'faq4',
        category: 'Genel',
        question: 'Bireysel başvuru yapabilir miyim?',
        answer: 'Hayır, yarışma takım çalışmasını teşvik etmek amacıyla düzenlenmiştir. En az 3 kişilik bir takım kurmanız gerekmektedir.',
        order: 4
    },
    {
        id: 'faq5',
        category: 'Genel',
        question: 'Bir danışman öğretmen birden fazla takıma danışmanlık yapabilir mi?',
        answer: 'Evet, bir öğretmen kendi okulundaki birden fazla takıma danışmanlık yapabilir. Ancak her takımın başvurusu ayrı yapılmalıdır.',
        order: 5
    },
    {
        id: 'faq6',
        category: 'Genel',
        question: 'Yarışmaya katılım ücretli mi?',
        answer: 'Hayır, Reflect&Shoot kısa film yarışmasına katılım tamamen ücretsizdir.',
        order: 6
    },
    {
        id: 'faq7',
        category: 'Genel',
        question: 'Farklı okullardan öğrenciler aynı takımda yer alabilir mi?',
        answer: 'Hayır, takım üyelerinin tamamının aynı okulda öğrenim görüyor olması gerekmektedir.',
        order: 7
    },
    {
        id: 'faq8',
        category: 'Genel',
        question: 'Bir öğrenci birden fazla takımda görev alabilir mi?',
        answer: 'Hayır, bir öğrenci sadece tek bir projede ve tek bir takımda yer alabilir.',
        order: 8
    },
    {
        id: 'faq9',
        category: 'Teknik',
        question: 'Profesyonel kamera zorunlu mu? Telefonla çekim yapabilir miyiz?',
        answer: 'Profesyonel ekipman zorunluluğu yoktur. Hikaye anlatımı ve teknik kurallara (Işık, Ses, Kadraj) uyulduğu sürece yüksek çözünürlüklü cep telefonları ile çekilen filmler de kabul edilir.',
        order: 9
    },
    {
        id: 'faq10',
        category: 'Teknik',
        question: 'Filmin dili ne olmalı?',
        answer: 'Yarışma formatı gereği filmin sesli dili (diyaloglar veya dış ses) İngilizce olmalıdır. Türkçe altyazı eklenmesi zorunludur.',
        order: 10
    },
    {
        id: 'faq11',
        category: 'Teknik',
        question: 'Filmde kullanılan müziklerin telif durumu ne olmalı?',
        answer: 'Kullanılan tüm müzikler ya telifsiz (royalty-free) olmalı ya da kullanım hakları satın alınmış olmalıdır. Telif ihlali tespit edilen eserler diskalifiye edilir.',
        order: 11
    },
    {
        id: 'faq12',
        category: 'Teknik',
        question: 'Stok görüntü (Stock Footage) kullanımı serbest mi?',
        answer: 'Canlı çekim kategorisinde filmin tamamı stok görüntüden oluşamaz. Destekleyici amaçla, filmin süresinin %30\'unu geçmeyecek şekilde stok görüntü kullanılabilir.',
        order: 12
    },
    {
        id: 'faq13',
        category: 'Süreç & Teslim',
        question: 'Videoyu sisteme nasıl yükleyeceğiz?',
        answer: 'Videonuzu Google Drive, Dropbox veya YouTube (Liste Dışı) gibi bir platforma yükleyip, indirme bağlantısını Danışman Öğretmen Paneli üzerinden sisteme girmelisiniz.',
        order: 13
    },
    {
        id: 'faq14',
        category: 'Süreç & Teslim',
        question: 'Başvuru yaptıktan sonra takım ismini veya temasını değiştirebilir miyiz?',
        answer: 'Hayır, kayıt işlemi tamamlanıp onaylandıktan sonra takım adı, kategori ve tema bilgileri güvenlik nedeniyle kilitlenir.',
        order: 14
    },
    {
        id: 'faq15',
        category: 'Süreç & Teslim',
        question: 'Veli izin belgesi ve KVKK formu zorunlu mu?',
        answer: 'Evet, 18 yaşından küçük tüm katılımcılar için veli izin belgesinin ve KVKK aydınlatma metninin imzalanıp sisteme yüklenmesi yasal bir zorunluluktur.',
        order: 15
    },
    {
        id: 'faq16',
        category: 'Süreç & Teslim',
        question: 'Revize süreci nedir?',
        answer: 'İlk elemeyi geçip finalist olan takımlar, jüri geri bildirimleri ve Akademi eğitimleri doğrultusunda filmlerinde düzenleme (revize) yapma hakkı kazanır. Bu, final puanlamasını etkiler.',
        order: 16
    },
    {
        id: 'faq17',
        category: 'Ödüller & Değerlendirme',
        question: 'Değerlendirme kriterleri nelerdir?',
        answer: 'Eserler 4 ana başlıkta değerlendirilir: Senaryo ve Hikaye (%25), Teknik Kalite (%25), Özgünlük (%25) ve Tema Uyumu (%25).',
        order: 17
    },
    {
        id: 'faq18',
        category: 'Ödüller & Değerlendirme',
        question: 'Jüri üyeleri kimlerden oluşuyor?',
        answer: 'Jüri kadrosu; akademisyenler ve alanında uzman eğitimcilerden oluşmaktadır.',
        order: 18
    },
    {
        id: 'faq19',
        category: 'Ödüller & Değerlendirme',
        question: 'Halk oylaması jüri puanını etkiler mi?',
        answer: 'Hayır, halk oylaması "Seyirci Özel Ödülü"nü belirlemek içindir. Ana ödüller (1., 2., 3.) tamamen jüri puanlaması ile belirlenir.',
        order: 19
    },
    {
        id: 'faq20',
        category: 'Ödüller & Değerlendirme',
        question: 'Ödül törenine katılım zorunlu mu?',
        answer: 'Dereceye giren veya finalist olan takımların (veya temsilcilerinin) Konya\'da düzenlenecek Gala gecesine katılımı, ödüllerini teslim almaları açısından önemle rica olunur.',
        order: 20
    }
];

interface AppContextType {
    currentUser: UserProfile | null;
    loading: boolean;
    systemSettings: SystemSettings;
    cmsGeneral: CMSGeneral;
    cmsLinks: CMSLinks;
    cmsPrizes: CMSPrize[];
    cmsFaqs: CMSFaqItem[];
    cmsGallery: CMSGalleryItem[];
    cmsAcademy: CMSAcademyItem[];
    cmsTimeline: CMSTimelineItem[];
    allUsers: UserProfile[];
    allApplications: Application[];
    currentApplication: Application | null;
    contactMessages: ContactMessage[];
    notifications: Notification[];
    auditLogs: LogEntry[];
    currentDate: Date;
    toasts: ToastMessage[];
    
    // Auth
    login: (email: string, pass: string) => Promise<void>;
    logout: () => Promise<void>;
    registerTeacher: (data: any) => Promise<void>;
    resendVerificationEmail: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    updateUserRole: (uid: string, role: UserRole) => Promise<void>;

    // CMS
    updateCMSGeneral: (data: CMSGeneral) => Promise<void>;
    updateCMSLinks: (data: CMSLinks) => Promise<void>;
    updateCMSPrize: (data: CMSPrize) => Promise<void>;
    addCMSFaq: (data: CMSFaqItem) => Promise<void>;
    updateCMSFaq: (id: string, data: Partial<CMSFaqItem>) => Promise<void>;
    deleteCMSFaq: (id: string) => Promise<void>;
    addCMSGalleryItem: (data: CMSGalleryItem) => Promise<void>;
    deleteCMSGalleryItem: (id: string) => Promise<void>;
    addCMSAcademyItem: (data: CMSAcademyItem) => Promise<void>;
    updateCMSAcademyItem: (id: string, data: Partial<CMSAcademyItem>) => Promise<void>;
    deleteCMSAcademyItem: (id: string) => Promise<void>;
    addCMSTimelineItem: (data: CMSTimelineItem) => Promise<void>;
    updateCMSTimelineItem: (id: string, data: Partial<CMSTimelineItem>) => Promise<void>;
    deleteCMSTimelineItem: (id: string) => Promise<void>;

    // Application
    createApplication: (data: any) => Promise<void>;
    updateApplication: (app: Application) => Promise<void>;
    bulkUpdateApplications: (ids: string[], status: ApplicationStatus) => Promise<void>;
    
    // Jury & Scoring
    assignJury: (appId: string, juryIds: string[]) => Promise<void>;
    bulkAssignJury: (assignments: {appId: string, juryIds: string[]}[]) => Promise<void>;
    submitScore: (appId: string, criteria: EvaluationCriteria, notes: string) => Promise<void>;
    fetchJuryScores: (appId: string) => Promise<ScoreDocument[]>;

    // Other
    sendMessage: (appId: string, text: string) => Promise<void>;
    sendContactMessage: (data: any) => Promise<void>;
    markContactMessageAsRead: (id: string) => Promise<void>;
    markNotificationAsRead: (id: string) => Promise<void>;
    sendAnnouncement: (target: NotificationTarget, title: string, message: string, type: string) => Promise<void>;
    submitPublicVote: (appId: string, fingerprint: string) => Promise<void>;
    
    // System
    updateSystemSettings: (settings: SystemSettings) => Promise<void>;
    logAction: (action: string, details: string, targetId?: string) => Promise<void>;
    showToast: (message: string, type: 'success' | 'error' | 'info') => void;
    removeToast: (id: string) => void;
    downloadFullBackup: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Default Values
const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
    dates: {
        applicationStart: '2026-01-20T09:00',
        applicationEnd: '2026-02-13T23:59',
        videoUploadStart: '2026-03-20T09:00',
        videoUploadEnd: '2026-03-20T23:59',
        academyStart: '2026-04-06T09:00',
        galaDate: '2026-05-22T19:00',
    },
    features: {
        judgeSystemActive: false,
        publicResultReveal: false,
        allowNewRegistrations: true,
        videoUploadActive: false,
        maintenanceMode: false
    }
};

const DEFAULT_CMS_GENERAL: CMSGeneral = {
    contactEmail: 'info@reflectandshoot.com',
    contactPhone: '+90 555 123 45 67',
    contactAddress: 'Konya, Türkiye',
    socialInstagram: '#',
    socialTwitter: '#',
    socialYoutube: '#',
    footerText: 'Reflect & Shoot Kısa Film Yarışması'
};

const DEFAULT_CMS_LINKS: CMSLinks = {
    specUrl: '#',
    parentalUrl: '#',
    kvkkUrl: '#',
    posterUrl: '#'
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [toasts, setToasts] = useState<ToastMessage[]>([]);
    
    // Data States
    const [systemSettings, setSystemSettings] = useState<SystemSettings>(DEFAULT_SYSTEM_SETTINGS);
    const [cmsGeneral, setCmsGeneral] = useState<CMSGeneral>(DEFAULT_CMS_GENERAL);
    const [cmsLinks, setCmsLinks] = useState<CMSLinks>(DEFAULT_CMS_LINKS);
    const [cmsPrizes, setCmsPrizes] = useState<CMSPrize[]>([]);
    const [cmsFaqs, setCmsFaqs] = useState<CMSFaqItem[]>(DEFAULT_CMS_FAQS);
    const [cmsGallery, setCmsGallery] = useState<CMSGalleryItem[]>([]);
    const [cmsAcademy, setCmsAcademy] = useState<CMSAcademyItem[]>([]);
    const [cmsTimeline, setCmsTimeline] = useState<CMSTimelineItem[]>([]);
    
    const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
    const [allApplications, setAllApplications] = useState<Application[]>([]);
    const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [auditLogs, setAuditLogs] = useState<LogEntry[]>([]);
    
    const [currentApplication, setCurrentApplication] = useState<Application | null>(null);
    const [currentDate, setCurrentDate] = useState(new Date());

    // Toast Helper
    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
        const id = Math.random().toString(36).substring(7);
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => removeToast(id), 5000);
    };

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    // Listeners
    useEffect(() => {
        const unsubAuth = onAuthStateChanged(auth, async (user: any) => {
            if (user) {
                // Fetch User Profile
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    const profile = userDoc.data() as UserProfile;
                    // Update email verified status if changed
                    if(profile.emailVerified !== user.emailVerified) {
                        await updateDoc(doc(db, "users", user.uid), { emailVerified: user.emailVerified });
                        profile.emailVerified = user.emailVerified;
                    }
                    setCurrentUser(profile);
                }
            } else {
                setCurrentUser(null);
                setCurrentApplication(null);
            }
            setLoading(false);
        });

        // System Settings Listener
        const unsubSettings = onSnapshot(doc(db, "settings", "config"), (doc) => {
            if(doc.exists()) setSystemSettings(doc.data() as SystemSettings);
        });

        // CMS Listeners
        const unsubCmsGen = onSnapshot(doc(db, "cms", "general"), (doc) => {
            if(doc.exists()) setCmsGeneral(doc.data() as CMSGeneral);
        });
        const unsubCmsLinks = onSnapshot(doc(db, "cms", "links"), (doc) => {
            if(doc.exists()) setCmsLinks(doc.data() as CMSLinks);
        });
        const unsubPrizes = onSnapshot(collection(db, "cms_prizes"), (snap) => {
            setCmsPrizes(snap.docs.map(d => ({id: d.id, ...d.data()} as CMSPrize)));
        });
        const unsubFaqs = onSnapshot(query(collection(db, "cms_faqs"), orderBy("order")), (snap) => {
            if(snap.empty) {
                setCmsFaqs(DEFAULT_CMS_FAQS);
            } else {
                setCmsFaqs(snap.docs.map(d => ({id: d.id, ...d.data()} as CMSFaqItem)));
            }
        });
        const unsubGallery = onSnapshot(collection(db, "cms_gallery"), (snap) => {
            setCmsGallery(snap.docs.map(d => ({id: d.id, ...d.data()} as CMSGalleryItem)));
        });
        const unsubAcademy = onSnapshot(collection(db, "cms_academy"), (snap) => {
            setCmsAcademy(snap.docs.map(d => ({id: d.id, ...d.data()} as CMSAcademyItem)));
        });
        const unsubTimeline = onSnapshot(query(collection(db, "cms_timeline"), orderBy("order")), (snap) => {
            setCmsTimeline(snap.docs.map(d => ({id: d.id, ...d.data()} as CMSTimelineItem)));
        });

        // Clock
        const interval = setInterval(() => setCurrentDate(new Date()), 60000);

        return () => {
            unsubAuth();
            unsubSettings();
            unsubCmsGen();
            unsubCmsLinks();
            unsubPrizes();
            unsubFaqs();
            unsubGallery();
            unsubAcademy();
            unsubTimeline();
            clearInterval(interval);
        };
    }, []);

    // Admin & User Data Listeners
    useEffect(() => {
        if (!currentUser) return;

        let unsubs: (() => void)[] = [];

        // Notifications
        const notifQ = query(collection(db, "notifications"), where("userId", "==", currentUser.uid), orderBy("createdAt", "desc"));
        unsubs.push(onSnapshot(notifQ, (snap) => {
            setNotifications(snap.docs.map(d => ({id: d.id, ...d.data()} as Notification)));
        }));

        if (currentUser.role === UserRole.ADMIN) {
            // Admin Listeners
            unsubs.push(onSnapshot(collection(db, "users"), (snap) => {
                setAllUsers(snap.docs.map(d => ({uid: d.id, ...d.data()} as UserProfile)));
            }));
            unsubs.push(onSnapshot(collection(db, "applications"), (snap) => {
                setAllApplications(snap.docs.map(d => ({id: d.id, ...d.data()} as Application)));
            }));
            unsubs.push(onSnapshot(query(collection(db, "contact_messages"), orderBy("createdAt", "desc")), (snap) => {
                setContactMessages(snap.docs.map(d => ({id: d.id, ...d.data()} as ContactMessage)));
            }));
            unsubs.push(onSnapshot(query(collection(db, "logs"), orderBy("timestamp", "desc")), (snap) => {
                setAuditLogs(snap.docs.map(d => ({id: d.id, ...d.data()} as LogEntry)));
            }));
        } else if (currentUser.role === UserRole.JUDGE) {
            // Judge Listeners (Need to see assigned apps)
            unsubs.push(onSnapshot(collection(db, "applications"), (snap) => {
                setAllApplications(snap.docs.map(d => ({id: d.id, ...d.data()} as Application)));
            }));
        } else if (currentUser.role === UserRole.TEACHER || currentUser.role === UserRole.STUDENT) {
            // Teacher/Student: Listen to their application
            if(currentUser.role === UserRole.TEACHER) {
                const appQ = query(collection(db, "applications"), where("teacher.id", "==", currentUser.uid));
                unsubs.push(onSnapshot(appQ, (snap) => {
                    if(!snap.empty) setCurrentApplication({id: snap.docs[0].id, ...snap.docs[0].data()} as Application);
                    else setCurrentApplication(null);
                }));
            }
        }

        return () => unsubs.forEach(u => u());
    }, [currentUser?.uid, currentUser?.role]);

    // Actions
    const login = async (email: string, pass: string) => {
        await signInWithEmailAndPassword(auth, email, pass);
    };

    const logout = async () => {
        await signOut(auth);
    };

    const registerTeacher = async (data: any) => {
        const { user } = await createUserWithEmailAndPassword(auth, data.email, data.password);
        await sendEmailVerification(user);
        
        const profile: UserProfile = {
            uid: user.uid,
            email: data.email,
            fullName: data.name,
            role: data.email.endsWith('@k12.tr') ? UserRole.TEACHER : UserRole.PENDING_TEACHER,
            school: data.school,
            city: data.city,
            createdAt: new Date().toISOString(),
            emailVerified: false
        };
        
        await setDoc(doc(db, "users", user.uid), profile);
        await logAction("REGISTER", `Yeni öğretmen kaydı: ${data.email}`);
    };

    const resendVerificationEmail = async () => {
        if(auth.currentUser) await sendEmailVerification(auth.currentUser);
    };

    const resetPassword = async (email: string) => {
        await sendPasswordResetEmail(auth, email);
    };

    const updateUserRole = async (uid: string, role: UserRole) => {
        await updateDoc(doc(db, "users", uid), { role });
        await logAction("UPDATE_ROLE", `Kullanıcı ${uid} rolü ${role} yapıldı.`);
    };

    // CMS Actions
    const updateCMSGeneral = async (data: CMSGeneral) => {
        await setDoc(doc(db, "cms", "general"), data);
        showToast('Genel ayarlar güncellendi.', 'success');
    };
    const updateCMSLinks = async (data: CMSLinks) => {
        await setDoc(doc(db, "cms", "links"), data);
        showToast('Linkler güncellendi.', 'success');
    };
    const updateCMSPrize = async (data: CMSPrize) => {
        // Assume prize ID is document ID in cms_prizes
        await setDoc(doc(db, "cms_prizes", data.id), data);
        showToast('Ödül güncellendi.', 'success');
    };
    const addCMSFaq = async (data: CMSFaqItem) => {
        await addDoc(collection(db, "cms_faqs"), data);
        showToast('SSS eklendi.', 'success');
    };
    const updateCMSFaq = async (id: string, data: Partial<CMSFaqItem>) => {
        await updateDoc(doc(db, "cms_faqs", id), data);
        showToast('SSS güncellendi.', 'success');
    };
    const deleteCMSFaq = async (id: string) => {
        await deleteDoc(doc(db, "cms_faqs", id));
        showToast('SSS silindi.', 'success');
    };
    const addCMSGalleryItem = async (data: CMSGalleryItem) => {
        await addDoc(collection(db, "cms_gallery"), data);
        showToast('Fotoğraf eklendi.', 'success');
    };
    const deleteCMSGalleryItem = async (id: string) => {
        await deleteDoc(doc(db, "cms_gallery", id));
        showToast('Fotoğraf silindi.', 'success');
    };
    const addCMSAcademyItem = async (data: CMSAcademyItem) => {
        await addDoc(collection(db, "cms_academy"), data);
        showToast('İçerik eklendi.', 'success');
    };
    const updateCMSAcademyItem = async (id: string, data: Partial<CMSAcademyItem>) => {
        await updateDoc(doc(db, "cms_academy", id), data);
        showToast('İçerik güncellendi.', 'success');
    };
    const deleteCMSAcademyItem = async (id: string) => {
        await deleteDoc(doc(db, "cms_academy", id));
        showToast('İçerik silindi.', 'success');
    };
    const addCMSTimelineItem = async (data: CMSTimelineItem) => {
        await addDoc(collection(db, "cms_timeline"), data);
        showToast('Adım eklendi.', 'success');
    };
    const updateCMSTimelineItem = async (id: string, data: Partial<CMSTimelineItem>) => {
        await updateDoc(doc(db, "cms_timeline", id), data);
        showToast('Adım güncellendi.', 'success');
    };
    const deleteCMSTimelineItem = async (id: string) => {
        await deleteDoc(doc(db, "cms_timeline", id));
        showToast('Adım silindi.', 'success');
    };

    // Application Actions
    const createApplication = async (data: any) => {
        if(!currentUser) return;
        const team: Team = {
            id: Math.random().toString(36).substring(7),
            name: data.teamName,
            category: data.category,
            theme: data.theme,
            selectedVerse: data.selectedVerse,
            students: data.students.map((s: any) => ({
                id: Math.random().toString(36).substring(7),
                ...s,
                hasParentalConsent: false,
                hasKvkkConsent: false
            })),
            isPreliminaryStageComplete: false,
            isFinalStageComplete: false,
            videoStatus: 'PENDING',
            logoUrl: 'https://via.placeholder.com/128' // Mock for now, normally upload to storage
        };
        const app: Application = {
            id: Math.random().toString(36).substring(7),
            teacher: {
                id: currentUser.uid,
                fullName: currentUser.fullName,
                school: currentUser.school || '',
                city: currentUser.city || '',
                email: currentUser.email,
                phone: currentUser.phone || ''
            },
            team,
            status: ApplicationStatus.DRAFT,
            submittedAt: new Date().toISOString()
        };
        
        await setDoc(doc(db, "applications", app.id), app);
        setCurrentApplication(app);
        showToast('Takım oluşturuldu.', 'success');
    };

    const updateApplication = async (app: Application) => {
        await setDoc(doc(db, "applications", app.id), app);
        if(currentApplication?.id === app.id) setCurrentApplication(app);
        showToast('Değişiklikler kaydedildi.', 'success');
    };

    const bulkUpdateApplications = async (ids: string[], status: ApplicationStatus) => {
        const batch = writeBatch(db);
        ids.forEach(id => {
            const ref = doc(db, "applications", id);
            batch.update(ref, { status });
        });
        await batch.commit();
        showToast(`${ids.length} başvuru güncellendi.`, 'success');
        await logAction("BULK_UPDATE", `${ids.length} başvuru durumu: ${status}`);
    };

    const assignJury = async (appId: string, juryIds: string[]) => {
        await updateDoc(doc(db, "applications", appId), { assignedJuryIds: juryIds });
        showToast('Jüri ataması güncellendi.', 'success');
    };

    const bulkAssignJury = async (assignments: {appId: string, juryIds: string[]}[]) => {
        const batch = writeBatch(db);
        assignments.forEach(a => {
            const ref = doc(db, "applications", a.appId);
            batch.update(ref, { assignedJuryIds: a.juryIds });
        });
        await batch.commit();
        showToast('Toplu jüri ataması tamamlandı.', 'success');
    };

    const submitScore = async (appId: string, criteria: EvaluationCriteria, notes: string) => {
        if(!currentUser) return;
        const total = criteria.story + criteria.technical + criteria.originality + criteria.themeFit;
        const scoreDoc: ScoreDocument = {
            juryId: currentUser.uid,
            juryName: currentUser.fullName,
            total,
            criteria,
            notes,
            updatedAt: new Date().toISOString()
        };
        
        await setDoc(doc(db, "applications", appId, "scores", currentUser.uid), scoreDoc);
        
        const appRef = doc(db, "applications", appId);
        const appDoc = await getDoc(appRef);
        if(appDoc.exists()) {
            const appData = appDoc.data() as Application;
            const gradedBy = appData.gradedBy || [];
            if(!gradedBy.includes(currentUser.uid)) {
                gradedBy.push(currentUser.uid);
                await updateDoc(appRef, { 
                    gradedBy, 
                    status: ApplicationStatus.GRADED
                });
            }
        }
        showToast('Puan kaydedildi.', 'success');
    };

    const fetchJuryScores = async (appId: string) => {
        const q = collection(db, "applications", appId, "scores");
        const snap = await getDocs(q);
        return snap.docs.map(d => ({id: d.id, ...d.data()} as ScoreDocument));
    };

    const sendMessage = async (appId: string, text: string) => {
        if(!currentUser) return;
        await addDoc(collection(db, "applications", appId, "messages"), {
            senderId: currentUser.uid,
            senderName: currentUser.fullName,
            senderRole: currentUser.role,
            text,
            createdAt: new Date().toISOString()
        });
    };

    const sendContactMessage = async (data: any) => {
        await addDoc(collection(db, "contact_messages"), {
            ...data,
            status: 'UNREAD',
            createdAt: new Date().toISOString()
        });
    };

    const markContactMessageAsRead = async (id: string) => {
        await updateDoc(doc(db, "contact_messages", id), { status: 'READ' });
    };

    const markNotificationAsRead = async (id: string) => {
        await updateDoc(doc(db, "notifications", id), { read: true });
        setNotifications(prev => prev.map(n => n.id === id ? {...n, read: true} : n));
    };

    const sendAnnouncement = async (target: NotificationTarget, title: string, message: string, type: string) => {
        await logAction("ANNOUNCEMENT", `Duyuru: ${title} -> ${target}`);
        showToast('Duyuru gönderim kuyruğuna alındı.', 'success');
    };

    const submitPublicVote = async (appId: string, fingerprint: string) => {
        const q = query(collection(db, "votes"), where("appId", "==", appId), where("voterFingerprint", "==", fingerprint));
        const snap = await getDocs(q);
        if(!snap.empty) throw new Error("Bu eser için daha önce oy kullandınız.");
        
        await addDoc(collection(db, "votes"), { appId, fingerprint, timestamp: new Date().toISOString() });
    };

    const updateSystemSettings = async (settings: SystemSettings) => {
        await setDoc(doc(db, "settings", "config"), settings);
        setSystemSettings(settings);
        showToast('Sistem ayarları güncellendi.', 'success');
    };

    const logAction = async (action: string, details: string, targetId?: string) => {
        if(!currentUser) return;
        await addDoc(collection(db, "logs"), {
            action,
            details,
            targetId,
            performedBy: currentUser.email,
            timestamp: new Date().toISOString()
        });
    };

    const downloadFullBackup = () => {
        const data = {
            systemSettings,
            cmsGeneral,
            cmsLinks,
            cmsPrizes,
            cmsFaqs,
            allUsers,
            allApplications,
            contactMessages,
            auditLogs
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const value = {
        currentUser, loading, systemSettings, cmsGeneral, cmsLinks, cmsPrizes, cmsFaqs, cmsGallery, cmsAcademy, cmsTimeline,
        allUsers, allApplications, currentApplication, contactMessages, notifications, auditLogs, currentDate, toasts,
        login, logout, registerTeacher, resendVerificationEmail, resetPassword, updateUserRole,
        updateCMSGeneral, updateCMSLinks, updateCMSPrize, addCMSFaq, updateCMSFaq, deleteCMSFaq,
        addCMSGalleryItem, deleteCMSGalleryItem, addCMSAcademyItem, updateCMSAcademyItem, deleteCMSAcademyItem,
        addCMSTimelineItem, updateCMSTimelineItem, deleteCMSTimelineItem,
        createApplication, updateApplication, bulkUpdateApplications,
        assignJury, bulkAssignJury, submitScore, fetchJuryScores,
        sendMessage, sendContactMessage, markContactMessageAsRead, markNotificationAsRead, sendAnnouncement, submitPublicVote,
        updateSystemSettings, logAction, showToast, removeToast, downloadFullBackup
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
