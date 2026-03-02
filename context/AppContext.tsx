
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// @ts-ignore
import { 
    User, onAuthStateChanged, signInWithEmailAndPassword, signOut, 
    createUserWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail, 
    updateProfile 
} from 'firebase/auth';
import { 
    doc, getDoc, setDoc, updateDoc, collection, query, where, onSnapshot, 
    addDoc, getDocs, deleteDoc, orderBy, serverTimestamp, limit, writeBatch,
    Timestamp, arrayUnion, arrayRemove
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { 
    UserProfile, UserRole, Application, ApplicationStatus, SystemSettings, 
    Notification, ToastMessage, CMSGeneral, CMSLinks, CMSPrize, CMSFaqItem, 
    CMSGalleryItem, CMSAcademyItem, CMSTimelineItem, LogEntry, ContactMessage, 
    ScoreDocument, Team, Student, EvaluationCriteria, Category, NotificationTarget
} from '../types';

const PUBLIC_ASSETS_BASE_URL = "https://assets.reflectandshoot.com";

// Helper to remove undefined values for Firestore
const sanitizeData = (obj: any): any => {
    if (Array.isArray(obj)) {
        return obj.map(v => sanitizeData(v));
    } else if (obj !== null && typeof obj === 'object') {
        return Object.keys(obj).reduce((acc, key) => {
            const value = sanitizeData(obj[key]);
            if (value !== undefined) {
                acc[key] = value;
            }
            return acc;
        }, {} as any);
    }
    return obj;
};

interface AppContextType {
    currentUser: UserProfile | null;
    loading: boolean;
    login: (e: string, p: string) => Promise<void>;
    logout: () => Promise<void>;
    registerTeacher: (data: any) => Promise<void>;
    createAdminAccount: (email: string, pass: string) => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    resendVerificationEmail: () => Promise<void>;
    
    currentApplication: Application | null;
    allApplications: Application[];
    createApplication: (data: any) => Promise<void>;
    updateApplication: (app: Application) => Promise<void>;
    updateApplicationStatus: (appId: string, newStatus: ApplicationStatus) => Promise<void>;
    deleteApplication: (appId: string) => Promise<void>; // Added
    
    systemSettings: SystemSettings;
    updateSystemSettings: (s: SystemSettings) => Promise<void>;
    
    cmsGeneral: CMSGeneral;
    updateCMSGeneral: (d: CMSGeneral) => Promise<void>;
    cmsLinks: CMSLinks;
    updateCMSLinks: (d: CMSLinks) => Promise<void>;
    cmsAcademy: CMSAcademyItem[];
    addCMSAcademyItem: (i: CMSAcademyItem) => Promise<void>;
    updateCMSAcademyItem: (id: string, d: Partial<CMSAcademyItem>) => Promise<void>;
    deleteCMSAcademyItem: (id: string) => Promise<void>;
    cmsGallery: CMSGalleryItem[];
    addCMSGalleryItem: (i: CMSGalleryItem) => Promise<void>;
    deleteCMSGalleryItem: (id: string) => Promise<void>;
    cmsFaqs: CMSFaqItem[];
    addCMSFaq: (i: CMSFaqItem) => Promise<void>;
    updateCMSFaq: (id: string, d: Partial<CMSFaqItem>) => Promise<void>;
    deleteCMSFaq: (id: string) => Promise<void>;
    cmsTimeline: CMSTimelineItem[];
    addCMSTimelineItem: (i: CMSTimelineItem) => Promise<void>;
    updateCMSTimelineItem: (id: string, d: Partial<CMSTimelineItem>) => Promise<void>;
    deleteCMSTimelineItem: (id: string) => Promise<void>;
    cmsPrizes: CMSPrize[];
    updateCMSPrize: (p: CMSPrize) => Promise<void>;
    
    toasts: ToastMessage[];
    showToast: (msg: string, type?: 'success'|'error'|'info'|'warning') => void;
    removeToast: (id: string) => void;
    
    notifications: Notification[];
    markNotificationAsRead: (id: string) => Promise<void>;
    
    contactMessages: ContactMessage[];
    sendContactMessage: (data: any) => Promise<void>;
    markContactMessageAsRead: (id: string) => Promise<void>;
    replyToContactMessage: (messageId: string, replyText: string) => Promise<void>;
    deleteContactMessage: (id: string) => Promise<void>; // Added
    
    allUsers: UserProfile[];
    updateUserRole: (uid: string, role: UserRole) => Promise<void>;
    deleteUser: (uid: string) => Promise<void>;
    
    auditLogs: LogEntry[];
    logAction: (action: string, details: string, targetId?: string) => Promise<void>;
    
    fetchJuryScores: (appId: string) => Promise<ScoreDocument[]>;
    fetchMyScore: (appId: string) => Promise<ScoreDocument | null>;
    submitScore: (appId: string, criteria: EvaluationCriteria, notes: string, isDraft?: boolean, isRecused?: boolean) => Promise<void>;
    assignJury: (appId: string, juryIds: string[]) => Promise<void>;
    bulkAssignJury: (assignments: {appId: string, juryIds: string[]}[]) => Promise<void>;
    
    sendMessage: (appId: string, text: string) => Promise<void>;
    submitPublicVote: (appId: string, fingerprint: string) => Promise<void>;
    sendAnnouncement: (target: NotificationTarget, title: string, message: string, type: string) => Promise<void>;
    
    downloadFullBackup: () => Promise<void>;
    seedAcademyContent: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [toasts, setToasts] = useState<ToastMessage[]>([]);
    
    // Data States
    const [currentApplication, setCurrentApplication] = useState<Application | null>(null);
    const [allApplications, setAllApplications] = useState<Application[]>([]);
    const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
    const [systemSettings, setSystemSettings] = useState<SystemSettings>({
        dates: {
            applicationStart: '2026-01-20T09:00',
            applicationEnd: '2026-03-23T23:59',
            videoUploadStart: '2026-01-20T09:00',
            videoUploadEnd: '2026-03-23T23:59',
            academyStart: '2026-04-06T09:00',
            galaDate: '2026-05-22T19:00',
            finalistRevealStart: '2026-04-03T12:00',
            publicVoteStart: '',
            publicVoteEnd: ''
        },
        features: {
            judgeSystemActive: false,
            publicResultReveal: false,
            allowNewRegistrations: true,
            publicVotingActive: false,
            videoUploadActive: false,
            maintenanceMode: false
        }
    });
    
    // CMS States
    const [cmsGeneral, setCMSGeneral] = useState<CMSGeneral>({
        contactEmail: '', contactPhone: '', contactAddress: '', socialInstagram: '#', socialTwitter: '#', socialYoutube: '#', footerText: ''
    });
    const [cmsLinks, setCMSLinks] = useState<CMSLinks>({ 
        specUrl: '', 
        parentalUrl: 'https://assets.reflectandshoot.com/veli_izin_belgesi.pdf', 
        kvkkUrl: 'https://assets.reflectandshoot.com/acik_riza_metni.pdf', 
        posterUrl: '' 
    });
    const [cmsAcademy, setCmsAcademy] = useState<CMSAcademyItem[]>([]);
    const [cmsGallery, setCmsGallery] = useState<CMSGalleryItem[]>([]);
    const [cmsFaqs, setCmsFaqs] = useState<CMSFaqItem[]>([]);
    const [cmsTimeline, setCmsTimeline] = useState<CMSTimelineItem[]>([]);
    const [cmsPrizes, setCmsPrizes] = useState<CMSPrize[]>([]);
    
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
    const [auditLogs, setAuditLogs] = useState<LogEntry[]>([]);

    // Toast Helper
    const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
        const id = Math.random().toString(36).substring(7);
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => removeToast(id), 5000);
    };

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    // --- AUTH LISTENERS ---
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user: any) => {
            if (user) {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    setCurrentUser({ ...userDoc.data(), emailVerified: user.emailVerified } as UserProfile);
                } else {
                    // Fallback if doc doesn't exist immediately
                    setCurrentUser(null);
                }
            } else {
                setCurrentUser(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // --- DATA LISTENERS ---
    useEffect(() => {
        // System Settings
        const unsubSettings = onSnapshot(doc(db, "system", "settings"), (doc) => {
            if (doc.exists()) setSystemSettings(doc.data() as SystemSettings);
        }, (err) => console.error("Settings listener error:", err));

        // CMS Listeners
        const unsubGeneral = onSnapshot(doc(db, "cms", "general"), (d) => d.exists() && setCMSGeneral(d.data() as CMSGeneral), (err) => console.error("CMS General listener error:", err));
        const unsubLinks = onSnapshot(doc(db, "cms", "links"), (d) => d.exists() && setCMSLinks(d.data() as CMSLinks), (err) => console.error("CMS Links listener error:", err));
        
        const unsubAcademy = onSnapshot(collection(db, "cms_academy"), (snap) => setCmsAcademy(snap.docs.map(d => ({id:d.id, ...d.data()} as CMSAcademyItem))), (err) => console.error("Academy listener error:", err));
        const unsubGallery = onSnapshot(collection(db, "cms_gallery"), (snap) => setCmsGallery(snap.docs.map(d => ({id:d.id, ...d.data()} as CMSGalleryItem))), (err) => console.error("Gallery listener error:", err));
        
        // Fix: Use cms_faq as consistent with rules
        const unsubFaq = onSnapshot(query(collection(db, "cms_faq"), orderBy("order")), (snap) => setCmsFaqs(snap.docs.map(d => ({id:d.id, ...d.data()} as CMSFaqItem))), (err) => console.error("FAQ listener error:", err));
        
        const unsubTimeline = onSnapshot(query(collection(db, "cms_timeline"), orderBy("order")), (snap) => setCmsTimeline(snap.docs.map(d => ({id:d.id, ...d.data()} as CMSTimelineItem))), (err) => console.error("Timeline listener error:", err));
        const unsubPrizes = onSnapshot(collection(db, "cms_prizes"), (snap) => setCmsPrizes(snap.docs.map(d => ({id:d.id, ...d.data()} as CMSPrize))), (err) => console.error("Prizes listener error:", err));

        // Public Vote / Finalists for everyone (so guests can see voting page)
        const unsubFinalists = onSnapshot(query(collection(db, "applications"), where("team.isFinalist", "==", true)), (snap) => {
            if (!currentUser) {
                 setAllApplications(snap.docs.map(d => ({id:d.id, ...d.data()} as Application)));
            }
        }, (error) => {
            console.log("Public finalist fetch info:", error.message);
        });

        return () => {
            unsubSettings();
            unsubGeneral(); unsubLinks();
            unsubAcademy(); unsubGallery(); unsubFaq(); unsubTimeline(); unsubPrizes();
            unsubFinalists();
        }
    }, [currentUser]);

    // --- ROLE BASED LISTENERS ---
    useEffect(() => {
        if (!currentUser) return;

        let unsubs: (() => void)[] = [];

        // Notifications
        const notifQuery = query(collection(db, "notifications"), where("userId", "==", currentUser.uid), orderBy("createdAt", "desc"), limit(20));
        unsubs.push(onSnapshot(notifQuery, (snap) => {
            setNotifications(snap.docs.map(d => ({id:d.id, ...d.data()} as Notification)));
        }));

        if (currentUser.role === UserRole.ADMIN) {
            // Admin sees ALL applications
            unsubs.push(onSnapshot(collection(db, "applications"), (snap) => {
                setAllApplications(snap.docs.map(d => ({id:d.id, ...d.data()} as Application)));
            }));
            
            // Admin only data
            unsubs.push(onSnapshot(collection(db, "users"), (snap) => {
                setAllUsers(snap.docs.map(d => ({uid: d.id, ...d.data()} as any as UserProfile)));
            }));
            unsubs.push(onSnapshot(query(collection(db, "logs"), orderBy("timestamp", "desc"), limit(100)), (snap) => {
                setAuditLogs(snap.docs.map(d => ({id: d.id, ...d.data()} as any as LogEntry)));
            }));
            unsubs.push(onSnapshot(query(collection(db, "contact_messages"), orderBy("createdAt", "desc")), (snap) => {
                setContactMessages(snap.docs.map(d => ({id: d.id, ...d.data()} as any as ContactMessage)));
            }));
        } else if (currentUser.role === UserRole.JUDGE) {
            // Judge sees ONLY assigned applications
            // Rules require: request.auth.uid in resource.data.assignedJuryIds
            const q = query(collection(db, "applications"), where("assignedJuryIds", "array-contains", currentUser.uid));
            unsubs.push(onSnapshot(q, (snap) => {
                setAllApplications(snap.docs.map(d => ({id:d.id, ...d.data()} as Application)));
            }));
        }

        if (currentUser.role === UserRole.TEACHER || currentUser.role === UserRole.STUDENT) {
            const q = query(collection(db, "applications"), where("teacher.id", "==", currentUser.uid));
            unsubs.push(onSnapshot(q, (snap) => {
                if (!snap.empty) {
                    setCurrentApplication({id: snap.docs[0].id, ...snap.docs[0].data()} as Application);
                } else {
                    setCurrentApplication(null);
                }
            }));
        }

        return () => unsubs.forEach(u => u());
    }, [currentUser?.uid, currentUser?.role]);


    // --- ACTIONS ---

    const login = async (email: string, pass: string) => {
        await signInWithEmailAndPassword(auth, email, pass);
    };

    const logout = async () => {
        await signOut(auth);
        setCurrentUser(null);
        setAllApplications([]); // Clear sensitive data
    };

    const registerTeacher = async (data: any) => {
        const { user } = await createUserWithEmailAndPassword(auth, data.email, data.password);
        await updateProfile(user, { displayName: data.name });
        await sendEmailVerification(user);
        
        const userProfile: UserProfile = {
            uid: user.uid,
            email: data.email,
            fullName: data.name,
            school: data.school,
            city: data.city,
            role: data.email.endsWith('@k12.tr') ? UserRole.TEACHER : UserRole.PENDING_TEACHER,
            createdAt: new Date().toISOString(),
            emailVerified: false
        };
        
        await setDoc(doc(db, "users", user.uid), userProfile);
        setCurrentUser(userProfile);
    };

    const createAdminAccount = async (email: string, pass: string) => {
        const { user } = await createUserWithEmailAndPassword(auth, email, pass);
        await updateProfile(user, { displayName: "Admin" });
        
        const userProfile: UserProfile = {
            uid: user.uid,
            email: email,
            fullName: "Admin",
            school: "System",
            city: "System",
            role: UserRole.ADMIN,
            createdAt: new Date().toISOString(),
            emailVerified: true
        };
        
        await setDoc(doc(db, "users", user.uid), userProfile);
        setCurrentUser(userProfile);
    };

    const resetPassword = async (email: string) => {
        await sendPasswordResetEmail(auth, email);
    };

    const resendVerificationEmail = async () => {
        if(auth.currentUser) await sendEmailVerification(auth.currentUser);
    };

    // --- APPLICATION MANAGEMENT ---

    const createApplication = async (data: any) => {
        if(!auth.currentUser) return;
        
        // 1. Character Limit Check
        if (data.teamName.length < 3 || data.teamName.length > 40) {
            throw new Error("Takım ismi en az 3, en fazla 40 karakter olmalıdır.");
        }

        // 2. Duplicate Name Check
        const q = query(collection(db, "applications"), where("team.name", "==", data.teamName));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
            throw new Error("Bu takım ismi zaten alınmış. Lütfen başka bir isim seçiniz.");
        }
        
        const generatedId = Math.random().toString(36).substring(7);

        const team: Team = {
            id: generatedId,
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
            videoStatus: 'PENDING'
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
        await logAction("CREATE_APP", `Takım oluşturuldu: ${app.team.name}`);
    };

    const updateApplication = async (app: Application) => {
        const safeData = sanitizeData(app);
        await updateDoc(doc(db, "applications", app.id), safeData);
        showToast('Başvuru güncellendi.', 'success');
    };

    const updateApplicationStatus = async (appId: string, newStatus: ApplicationStatus) => {
        const app = allApplications.find(a => a.id === appId);
        if (!app) return;
        const oldStatus = app.status;
        await updateDoc(doc(db, "applications", appId), { status: newStatus });
        await logAction("UPDATE_STATUS", `Durum güncellendi: ${oldStatus} -> ${newStatus}`, appId, { before: oldStatus, after: newStatus });
    };

    const deleteApplication = async (appId: string) => {
        await deleteDoc(doc(db, "applications", appId));
        await logAction("DELETE_APP", "Başvuru ve takım silindi.", appId);
        showToast('Takım silindi.', 'success');
    };

    // --- SYSTEM & CMS ---

    const updateSystemSettings = async (s: SystemSettings) => {
        await setDoc(doc(db, "system", "settings"), s);
        showToast("Sistem ayarları güncellendi.", 'success');
        await logAction("UPDATE_SETTINGS", "Sistem ayarları güncellendi.");
    };

    const updateCMSGeneral = async (d: CMSGeneral) => {
        await setDoc(doc(db, "cms", "general"), d);
        showToast("Genel ayarlar güncellendi.", 'success');
    };

    const updateCMSLinks = async (d: CMSLinks) => {
        await setDoc(doc(db, "cms", "links"), d);
        showToast("Linkler güncellendi.", 'success');
    };

    // Generic CMS Helpers
    const addCMSAcademyItem = async (i: CMSAcademyItem) => { await addDoc(collection(db, "cms_academy"), i); showToast("Eklendi.", 'success'); };
    const updateCMSAcademyItem = async (id: string, d: Partial<CMSAcademyItem>) => { await updateDoc(doc(db, "cms_academy", id), d); showToast("Güncellendi.", 'success'); };
    const deleteCMSAcademyItem = async (id: string) => { await deleteDoc(doc(db, "cms_academy", id)); showToast("Silindi.", 'success'); };

    const addCMSGalleryItem = async (i: CMSGalleryItem) => { await addDoc(collection(db, "cms_gallery"), i); showToast("Fotoğraf eklendi.", 'success'); };
    const deleteCMSGalleryItem = async (id: string) => { await deleteDoc(doc(db, "cms_gallery", id)); showToast("Fotoğraf silindi.", 'success'); };

    const addCMSFaq = async (i: CMSFaqItem) => { await addDoc(collection(db, "cms_faq"), i); showToast("Soru eklendi.", 'success'); };
    const updateCMSFaq = async (id: string, d: Partial<CMSFaqItem>) => { await updateDoc(doc(db, "cms_faq", id), d); showToast("Soru güncellendi.", 'success'); };
    const deleteCMSFaq = async (id: string) => { await deleteDoc(doc(db, "cms_faq", id)); showToast("Soru silindi.", 'success'); };

    const addCMSTimelineItem = async (i: CMSTimelineItem) => { await addDoc(collection(db, "cms_timeline"), i); showToast("Adım eklendi.", 'success'); };
    const updateCMSTimelineItem = async (id: string, d: Partial<CMSTimelineItem>) => { await updateDoc(doc(db, "cms_timeline", id), d); showToast("Adım güncellendi.", 'success'); };
    const deleteCMSTimelineItem = async (id: string) => { await deleteDoc(doc(db, "cms_timeline", id)); showToast("Adım silindi.", 'success'); };

    const updateCMSPrize = async (p: CMSPrize) => { await setDoc(doc(db, "cms_prizes", p.id), p); showToast("Ödül güncellendi.", 'success'); };

    // --- USER MANAGEMENT ---

    const updateUserRole = async (uid: string, role: UserRole) => {
        await updateDoc(doc(db, "users", uid), { role });
        await logAction("UPDATE_ROLE", `Kullanıcı rolü güncellendi: ${role}`, uid);
    };

    const deleteUser = async (uid: string) => {
        await deleteDoc(doc(db, "users", uid));
        await logAction("DELETE_USER", "Kullanıcı silindi.", uid);
        showToast("Kullanıcı silindi.", 'success');
    };

    // --- LOGS & MESSAGES ---

    const logAction = async (action: string, details: string, targetId?: string, metadata?: any) => {
        if (!currentUser) return;
        await addDoc(collection(db, "logs"), {
            action, details, targetId, metadata,
            performedBy: currentUser.email, 
            timestamp: new Date().toISOString()
        });
    };

    const sendContactMessage = async (data: any) => {
        await addDoc(collection(db, "contact_messages"), {
            ...data, createdAt: new Date().toISOString(), status: 'UNREAD'
        });
        showToast("Mesajınız iletildi.", 'success');
    };

    const markContactMessageAsRead = async (id: string) => {
        await updateDoc(doc(db, "contact_messages", id), { status: 'READ' });
    };

    const deleteContactMessage = async (id: string) => {
        await deleteDoc(doc(db, "contact_messages", id));
        showToast("Mesaj silindi.", 'success');
    };

    const replyToContactMessage = async (messageId: string, replyText: string) => {
        if (!currentUser) return;
        
        const msgRef = doc(db, "contact_messages", messageId);
        const msgSnap = await getDoc(msgRef);
        
        if (!msgSnap.exists()) throw new Error("Mesaj bulunamadı");
        
        const msgData = msgSnap.data() as ContactMessage;
        
        // 1. If it's a dashboard chat message, send reply to the chat
        if (msgData.source === 'DASHBOARD_CHAT' && msgData.applicationId) {
             await addDoc(collection(db, "applications", msgData.applicationId, "messages"), {
                senderId: currentUser.uid,
                senderName: "Yönetim", 
                senderRole: UserRole.ADMIN,
                text: replyText,
                createdAt: new Date().toISOString()
            });
            // Update status to REPLIED
            await updateDoc(msgRef, { status: 'REPLIED' });
            showToast("Cevap panele gönderildi.", 'success');
        } else {
            // For now, we only support direct chat replies in this flow.
            // Email replies would typically be handled via mailto or a backend service.
            // But we can mark it as replied manually if needed.
            await updateDoc(msgRef, { status: 'REPLIED' });
            showToast("Mesaj cevaplandı olarak işaretlendi.", 'info');
        }
        
        await logAction("REPLY_MESSAGE", `Mesaja cevap verildi: ${messageId}`, msgData.applicationId);
    };

    const markNotificationAsRead = async (id: string) => {
        await updateDoc(doc(db, "notifications", id), { read: true });
    };

    // --- JURY LOGIC ---

    const fetchJuryScores = async (appId: string) => {
        const snap = await getDocs(collection(db, "applications", appId, "scores"));
        return snap.docs.map(d => ({id: d.id, ...d.data()} as ScoreDocument));
    };

    const fetchMyScore = async (appId: string) => {
        if(!currentUser) return null;
        const d = await getDoc(doc(db, "applications", appId, "scores", currentUser.uid));
        return d.exists() ? ({id: d.id, ...d.data()} as ScoreDocument) : null;
    };

    const submitScore = async (appId: string, criteria: EvaluationCriteria, notes: string, isDraft: boolean = false, isRecused: boolean = false) => {
        if(!currentUser) return;
        
        // Save the individual score document (always)
        const total = isRecused ? 0 : (criteria.story + criteria.technical + criteria.originality + criteria.themeFit);
        const scoreDoc: ScoreDocument = {
            juryId: currentUser.uid,
            juryName: currentUser.fullName,
            total, criteria, notes,
            updatedAt: new Date().toISOString(),
            isDraft,
            isRecused
        };
        
        await setDoc(doc(db, "applications", appId, "scores", currentUser.uid), scoreDoc);
        
        // Handle Global Aggregation & Status
        const appRef = doc(db, "applications", appId);

        if (isDraft) {
            // DRAFT: Do not update aggregate stats. 
            // Ensure this user is REMOVED from 'gradedBy' so it appears as pending for others/admins if they were previously finalized.
            await updateDoc(appRef, {
                gradedBy: arrayRemove(currentUser.uid)
            });
            showToast("Taslak olarak kaydedildi.", 'info');
        } else {
            // FINAL or RECUSED: Update aggregate stats.
            
            // 1. Fetch all scores to recalculate averages
            const scores = await fetchJuryScores(appId);
            
            // Filter out drafts and recusals for the math
            const validScores = scores.filter(s => !s.isDraft && !s.isRecused);
            
            const avg = validScores.length > 0 
                ? validScores.reduce((acc, s) => acc + s.total, 0) / validScores.length 
                : 0;
            
            // 2. Update Application Doc
            // We ADD the user to gradedBy so they see the green checkmark (done).
            // Even if recused, they are "done" with this app.
            await updateDoc(appRef, {
                finalScore: avg,
                juryCount: validScores.length, // Count only valid scored entries
                gradedBy: arrayUnion(currentUser.uid),
                status: ApplicationStatus.GRADED
            });

            if (isRecused) {
                showToast("Bu eser için çekimser kaldınız.", 'warning');
                await logAction("RECUSE_SCORE", `Jüri çekimser kaldı.`, appId);
            } else {
                showToast("Puan kaydedildi ve gönderildi.", 'success');
                await logAction("SUBMIT_SCORE", `Puan verildi: ${total}`, appId);
            }
        }
    };

    const assignJury = async (appId: string, juryIds: string[]) => {
        await updateDoc(doc(db, "applications", appId), { assignedJuryIds: juryIds });
        showToast("Jüri ataması güncellendi.", 'success');
    };

    const bulkAssignJury = async (assignments: {appId: string, juryIds: string[]}[]) => {
        const batch = writeBatch(db);
        assignments.forEach(a => {
            const ref = doc(db, "applications", a.appId);
            batch.update(ref, { assignedJuryIds: a.juryIds });
        });
        await batch.commit();
        showToast("Toplu atama tamamlandı.", 'success');
    };

    // --- OTHER FEATURES ---

    const sendMessage = async (appId: string, text: string) => {
        if(!currentUser) return;
        
        const timestamp = new Date().toISOString();

        const msg: any = {
            senderId: currentUser.uid,
            senderName: currentUser.fullName,
            senderRole: currentUser.role,
            text,
            createdAt: timestamp
        };
        await addDoc(collection(db, "applications", appId, "messages"), msg);

        // Forward teacher chat messages to admin inbox (contact_messages collection)
        if (currentUser.role === UserRole.TEACHER) {
             let title = "Panel Mesajı";
             if (currentApplication && currentApplication.id === appId) {
                 title = `Mesaj: ${currentApplication.team.name}`;
             }

             await addDoc(collection(db, "contact_messages"), {
                name: currentUser.fullName,
                email: currentUser.email,
                title: title,
                message: text,
                createdAt: timestamp,
                status: 'UNREAD',
                source: 'DASHBOARD_CHAT',
                applicationId: appId 
             });
        }
    };

    const submitPublicVote = async (appId: string, fingerprint: string) => {
        const q = query(collection(db, "public_votes"), where("voterFingerprint", "==", fingerprint), where("appId", "==", appId));
        const snap = await getDocs(q);
        if(!snap.empty) throw new Error("Bu videoya daha önce oy verdiniz.");

        await addDoc(collection(db, "public_votes"), {
            appId, fingerprint, timestamp: new Date().toISOString()
        });
        
        const appRef = doc(db, "applications", appId);
        const appSnap = await getDoc(appRef);
        if(appSnap.exists()) {
            await updateDoc(appRef, { publicVotes: (appSnap.data().publicVotes || 0) + 1 });
        }
    };

    const sendAnnouncement = async (target: NotificationTarget, title: string, message: string, type: string) => {
        let userIds: string[] = [];
        
        if (target === 'ALL') {
            userIds = allUsers.map(u => u.uid);
        } else if (target === 'TEACHERS') {
            userIds = allUsers.filter(u => u.role === UserRole.TEACHER).map(u => u.uid);
        } else if (target === 'JUDGES') {
            userIds = allUsers.filter(u => u.role === UserRole.JUDGE).map(u => u.uid);
        } else if (target === 'FINALISTS') {
            const finalists = allApplications.filter(a => a.team.isFinalist);
            userIds = finalists.map(a => a.teacher.id);
        }

        const batch = writeBatch(db);
        userIds.forEach(uid => {
            const ref = doc(collection(db, "notifications"));
            batch.set(ref, {
                userId: uid, title, message, type, read: false, createdAt: new Date().toISOString()
            });
        });
        await batch.commit();
        showToast(`${userIds.length} kullanıcıya bildirim gönderildi.`, 'success');
    };

    const downloadFullBackup = async () => {
        const backup = {
            users: allUsers,
            applications: allApplications,
            settings: systemSettings,
            cms: {
                general: cmsGeneral,
                links: cmsLinks,
                academy: cmsAcademy,
                gallery: cmsGallery,
                faq: cmsFaqs,
                timeline: cmsTimeline,
                prizes: cmsPrizes
            }
        };
        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup-${new Date().toISOString()}.json`;
        a.click();
    };

    const seedAcademyContent = async () => {
        showToast("İçerik yükleme özelliği şimdilik devre dışı.", 'info');
    };

    return (
        <AppContext.Provider value={{
            currentUser, loading, login, logout, registerTeacher, createAdminAccount, resetPassword, resendVerificationEmail,
            currentApplication, allApplications, createApplication, updateApplication, updateApplicationStatus, deleteApplication,
            systemSettings, updateSystemSettings,
            cmsGeneral, updateCMSGeneral, cmsLinks, updateCMSLinks, 
            cmsAcademy, addCMSAcademyItem, updateCMSAcademyItem, deleteCMSAcademyItem,
            cmsGallery, addCMSGalleryItem, deleteCMSGalleryItem,
            cmsFaqs, addCMSFaq, updateCMSFaq, deleteCMSFaq,
            cmsTimeline, addCMSTimelineItem, updateCMSTimelineItem, deleteCMSTimelineItem,
            cmsPrizes, updateCMSPrize,
            toasts, showToast, removeToast,
            notifications, markNotificationAsRead,
            contactMessages, sendContactMessage, markContactMessageAsRead, replyToContactMessage, deleteContactMessage,
            allUsers, updateUserRole, deleteUser,
            auditLogs, logAction,
            fetchJuryScores, fetchMyScore, submitScore, assignJury, bulkAssignJury,
            sendMessage, submitPublicVote, sendAnnouncement,
            downloadFullBackup, seedAcademyContent
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
