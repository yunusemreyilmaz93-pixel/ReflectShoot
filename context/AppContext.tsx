
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
} from '../types';

export const PUBLIC_ASSETS_BASE_URL = "https://pub-445f38f2d68348d4914aa2bac116cf06.r2.dev";

const DEFAULT_CMS_FAQS: CMSFaqItem[] = [
    {
        id: 'faq1',
        category: 'Genel',
        question: 'Yarışmaya kimler katılabilir?',
        answer: 'Türkiye genelindeki tüm Anadolu İmam Hatip Lisesi öğrencileri yarışmaya katılabilir. Takımlar en az 3, en fazla 6 öğrenciden oluşmalıdır ve bir danışman öğretmen bulunması zorunludur.',
        order: 1
    },
];

const DEFAULT_CMS_ACADEMY: CMSAcademyItem[] = [
    { id: 'def1', title: 'Kahramanın Yolculuğu ve Maneviyat', description: 'Joseph Campbell’in monomit yapısının İslami anlatı geleneğiyle harmanlanması.', category: 'Senaryo & Tema', type: 'PDF', url: '#', isStarterPack: true },
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
    
    login: (email: string, pass: string) => Promise<void>;
    logout: () => Promise<void>;
    registerTeacher: (data: any) => Promise<void>;
    resendVerificationEmail: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    updateUserRole: (uid: string, role: UserRole) => Promise<void>;

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

    createApplication: (data: any) => Promise<void>;
    updateApplication: (app: Application) => Promise<void>;
    bulkUpdateApplications: (ids: string[], status: ApplicationStatus) => Promise<void>;
    
    assignJury: (appId: string, juryIds: string[]) => Promise<void>;
    bulkAssignJury: (assignments: {appId: string, juryIds: string[]}[]) => Promise<void>;
    submitScore: (appId: string, criteria: EvaluationCriteria, notes: string) => Promise<void>;
    fetchJuryScores: (appId: string) => Promise<ScoreDocument[]>;

    sendMessage: (appId: string, text: string) => Promise<void>;
    sendContactMessage: (data: any) => Promise<void>;
    markContactMessageAsRead: (id: string) => Promise<void>;
    markNotificationAsRead: (id: string) => Promise<void>;
    sendAnnouncement: (target: NotificationTarget, title: string, message: string, type: string) => Promise<void>;
    submitPublicVote: (appId: string, fingerprint: string) => Promise<void>;
    getSignedUrl: (key: string) => Promise<string>;
    
    updateSystemSettings: (settings: SystemSettings) => Promise<void>;
    logAction: (action: string, details: string, targetId?: string) => Promise<void>;
    showToast: (message: string, type: 'success' | 'error' | 'info') => void;
    removeToast: (id: string) => void;
    downloadFullBackup: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

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

const hydrateApplication = (data: any, id: string): Application => {
    const app = { id, ...data } as Application;
    if (app.team.logoKey) {
        app.team.logoUrl = `${PUBLIC_ASSETS_BASE_URL}/${app.team.logoKey}`;
    }
    return app;
};

// Helper to remove undefined fields recursively
const sanitizeData = (data: any) => {
    return JSON.parse(JSON.stringify(data));
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [toasts, setToasts] = useState<ToastMessage[]>([]);
    
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

    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
        const id = Math.random().toString(36).substring(7);
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => removeToast(id), 5000);
    };

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    useEffect(() => {
        const unsubAuth = onAuthStateChanged(auth, async (user: any) => {
            if (user) {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    const profile = userDoc.data() as UserProfile;
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

        const unsubSettings = onSnapshot(doc(db, "settings", "config"), (doc) => {
            if(doc.exists()) setSystemSettings(doc.data() as SystemSettings);
        });

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
            if(snap.empty) {
                setCmsAcademy(DEFAULT_CMS_ACADEMY);
            } else {
                setCmsAcademy(snap.docs.map(d => ({id: d.id, ...d.data()} as CMSAcademyItem)));
            }
        });
        const unsubTimeline = onSnapshot(query(collection(db, "cms_timeline"), orderBy("order")), (snap) => {
            setCmsTimeline(snap.docs.map(d => ({id: d.id, ...d.data()} as CMSTimelineItem)));
        });

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

    useEffect(() => {
        if (!currentUser) return;
        let unsubs: (() => void)[] = [];
        
        const notifQ = query(collection(db, "notifications"), where("userId", "==", currentUser.uid));
        unsubs.push(onSnapshot(notifQ, (snap) => {
            const list = snap.docs.map(d => ({id: d.id, ...d.data()} as Notification));
            list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setNotifications(list);
        }));

        if (currentUser.role === UserRole.ADMIN) {
            unsubs.push(onSnapshot(collection(db, "users"), (snap) => {
                setAllUsers(snap.docs.map(d => ({uid: d.id, ...d.data()} as UserProfile)));
            }));
            unsubs.push(onSnapshot(collection(db, "applications"), (snap) => {
                setAllApplications(snap.docs.map(d => hydrateApplication(d.data(), d.id)));
            }));
            unsubs.push(onSnapshot(query(collection(db, "contact_messages"), orderBy("createdAt", "desc")), (snap) => {
                setContactMessages(snap.docs.map(d => ({id: d.id, ...d.data()} as ContactMessage)));
            }));
            unsubs.push(onSnapshot(query(collection(db, "logs"), orderBy("timestamp", "desc")), (snap) => {
                setAuditLogs(snap.docs.map(d => ({id: d.id, ...d.data()} as LogEntry)));
            }));
        } else if (currentUser.role === UserRole.JUDGE) {
            unsubs.push(onSnapshot(collection(db, "applications"), (snap) => {
                setAllApplications(snap.docs.map(d => hydrateApplication(d.data(), d.id)));
            }));
        } else if (currentUser.role === UserRole.TEACHER || currentUser.role === UserRole.STUDENT) {
            if(currentUser.role === UserRole.TEACHER) {
                const appQ = query(collection(db, "applications"), where("teacher.id", "==", currentUser.uid));
                unsubs.push(onSnapshot(appQ, (snap) => {
                    if(!snap.empty) setCurrentApplication(hydrateApplication(snap.docs[0].data(), snap.docs[0].id));
                    else setCurrentApplication(null);
                }));
            }
        }
        return () => unsubs.forEach(u => u());
    }, [currentUser?.uid, currentUser?.role]);

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

    const updateCMSGeneral = async (data: CMSGeneral) => {
        await setDoc(doc(db, "cms", "general"), data);
        showToast('Genel ayarlar güncellendi.', 'success');
    };
    const updateCMSLinks = async (data: CMSLinks) => {
        await setDoc(doc(db, "cms", "links"), data);
        showToast('Linkler güncellendi.', 'success');
    };
    const updateCMSPrize = async (data: CMSPrize) => {
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

    const createApplication = async (data: any) => {
        if(!auth.currentUser) return;
        
        const generatedId = data.id || Math.random().toString(36).substring(7);

        const team: Team = {
            id: generatedId,
            name: data.teamName,
            category: data.category,
            theme: data.theme,
            selectedVerse: data.selectedVerse, // Will be sanitized if undefined
            students: data.students.map((s: any) => ({
                id: Math.random().toString(36).substring(7),
                ...s,
                hasParentalConsent: false,
                hasKvkkConsent: false
            })),
            isPreliminaryStageComplete: false,
            isFinalStageComplete: false,
            videoStatus: 'PENDING',
            logoKey: data.logoKey, // Will be sanitized if undefined
            logoUrl: data.logoUrl || (data.logoKey ? `${PUBLIC_ASSETS_BASE_URL}/${data.logoKey}` : 'https://via.placeholder.com/128')
        };
        const app: Application = {
            id: generatedId,
            teacher: {
                id: auth.currentUser.uid,
                fullName: currentUser?.fullName || '',
                school: currentUser?.school || '',
                city: currentUser?.city || '',
                email: auth.currentUser.email || '',
                phone: currentUser?.phone || ''
            },
            team,
            status: ApplicationStatus.DRAFT,
            submittedAt: new Date().toISOString()
        };
        
        const safeData = sanitizeData(app);
        await setDoc(doc(db, "applications", app.id), safeData);
        setCurrentApplication(app);
        showToast('Takım oluşturuldu.', 'success');
    };

    const updateApplication = async (app: Application) => {
        if (!auth.currentUser) throw new Error("Oturum açık değil.");
        
        const safeData = sanitizeData(app);
        
        // Use merge: true to avoid overwriting unrelated fields if any
        await setDoc(doc(db, "applications", app.id), safeData, { merge: true });
        
        const hydrated = hydrateApplication(safeData, app.id);
        if(currentApplication?.id === app.id) setCurrentApplication(hydrated);
        
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
        if(!auth.currentUser || !currentUser) return;
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
        if(!auth.currentUser || !currentUser) return;
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
        if(!auth.currentUser || !currentUser) return;
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

    const getSignedUrl = async (key: string): Promise<string> => {
        try {
            const encodedKey = encodeURIComponent(key);
            const apiResponse = await fetch(`/api/view?key=${encodedKey}`, {
                method: 'GET',
            });

            if (!apiResponse.ok) {
                throw new Error('Dosya görüntüleme linki alınamadı');
            }

            const { signedUrl } = await apiResponse.json();
            return signedUrl;
        } catch (error) {
            console.error(error);
            return '#';
        }
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
        updateSystemSettings, logAction, showToast, removeToast, downloadFullBackup, getSignedUrl
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
