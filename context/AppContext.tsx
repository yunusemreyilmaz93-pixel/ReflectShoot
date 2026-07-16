
import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { 
    onAuthStateChanged, signInWithEmailAndPassword, signOut, 
    createUserWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail, 
    updateProfile,
} from 'firebase/auth';
import { 
    doc, getDoc, setDoc, updateDoc, collection, query, where, onSnapshot, 
    addDoc, getDocs, deleteDoc, orderBy, serverTimestamp, limit, writeBatch,
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { authenticatedFetch } from '../lib/authenticatedFetch';
import { sanitizeData } from '../lib/sanitize';
import { teamNameError, MAX_TEAMS_PER_TEACHER } from '../lib/domain/teamValidation';
import { 
    UserProfile, UserRole, Application, ApplicationStatus, SystemSettings, 
    Notification, CMSGeneral, CMSLinks, CMSPrize, CMSFaqItem, 
    CMSGalleryItem, CMSAcademyItem, CMSTimelineItem, LogEntry, ContactMessage, 
    ScoreDocument, Team, EvaluationCriteria, NotificationTarget
} from '../types';
import type { AppContextType } from './appContextTypes';
import { DEFAULT_SYSTEM_SETTINGS, DEFAULT_CMS_GENERAL, DEFAULT_CMS_LINKS } from './defaults';
import { useToasts } from './hooks/useToasts';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const { toasts, showToast, removeToast } = useToasts();
    
    // Data States
    const [currentApplication, setCurrentApplication] = useState<Application | null>(null);
    const [myApplications, setMyApplications] = useState<Application[]>([]);
    const [activeApplicationId, setActiveApplicationId] = useState<string | null>(null);
    const [simulatedApplicationId, setSimulatedApplicationId] = useState<string | null>(null);
    const [allApplications, setAllApplications] = useState<Application[]>([]);
    const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
    const [systemSettings, setSystemSettings] = useState<SystemSettings>(DEFAULT_SYSTEM_SETTINGS);
    
    // CMS States
    const [cmsGeneral, setCMSGeneral] = useState<CMSGeneral>(DEFAULT_CMS_GENERAL);
    const [cmsLinks, setCMSLinks] = useState<CMSLinks>(DEFAULT_CMS_LINKS);
    const [cmsAcademy, setCmsAcademy] = useState<CMSAcademyItem[]>([]);
    const [cmsGallery, setCmsGallery] = useState<CMSGalleryItem[]>([]);
    const [cmsFaqs, setCmsFaqs] = useState<CMSFaqItem[]>([]);
    const [cmsTimeline, setCmsTimeline] = useState<CMSTimelineItem[]>([]);
    const [cmsPrizes, setCmsPrizes] = useState<CMSPrize[]>([]);
    
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
    const [auditLogs, setAuditLogs] = useState<LogEntry[]>([]);

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

        // Guests receive a deliberately sanitized projection from the server.
        // Private application documents never cross the public Firestore boundary.
        let publicRequestCancelled = false;
        if (!currentUser) {
            fetch('/api/public-showcase')
                .then(async response => {
                    if (!response.ok) throw new Error('Public showcase could not be loaded');
                    return response.json();
                })
                .then(data => {
                    if (!publicRequestCancelled) {
                        setAllApplications((data.applications || []) as Application[]);
                    }
                })
                .catch(error => {
                    console.log("Public showcase fetch info:", error.message);
                });
        }

        return () => {
            publicRequestCancelled = true;
            unsubSettings();
            unsubGeneral(); unsubLinks();
            unsubAcademy(); unsubGallery(); unsubFaq(); unsubTimeline(); unsubPrizes();
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
                const apps = snap.docs.map(d => ({id: d.id, ...d.data()} as Application));
                setMyApplications(apps);
                
                // If no active ID or active ID is not in the new list, pick the first one
                if (apps.length > 0) {
                    if (!activeApplicationId || !apps.find(a => a.id === activeApplicationId)) {
                        setActiveApplicationId(apps[0].id);
                    }
                } else {
                    setActiveApplicationId(null);
                }
            }));
        }

        return () => unsubs.forEach(u => u());
    }, [currentUser?.uid, currentUser?.role]);


    // Update currentApplication whenever activeApplicationId or myApplications changes
    useEffect(() => {
        if (activeApplicationId) {
            const active = myApplications.find(a => a.id === activeApplicationId);
            setCurrentApplication(active || null);
        } else {
            setCurrentApplication(null);
        }
    }, [activeApplicationId, myApplications]);

    // Admin Simulation Effect: Populate myApplications and activeApplicationId when simulatedApplicationId is set
    useEffect(() => {
        if (currentUser?.role === UserRole.ADMIN && simulatedApplicationId) {
            const simulatedApp = allApplications.find(a => a.id === simulatedApplicationId);
            if (simulatedApp) {
                const teacherId = simulatedApp.teacher.id;
                const teacherApps = allApplications.filter(a => a.teacher.id === teacherId);
                setMyApplications(teacherApps);
                
                // Set activeApplicationId to simulated ID only if we just entered simulation or if the active ID is not one of the teacher's apps.
                setActiveApplicationId(prevActiveId => {
                    const isAlreadyTeacherApp = teacherApps.some(a => a.id === prevActiveId);
                    if (prevActiveId && isAlreadyTeacherApp) {
                        return prevActiveId;
                    }
                    return simulatedApplicationId;
                });
            }
        } else if (currentUser?.role === UserRole.ADMIN && !simulatedApplicationId) {
            // Reset simulation data when cleared
            setMyApplications([]);
            setActiveApplicationId(null);
        }
    }, [currentUser, simulatedApplicationId, allApplications]);

    // --- ACTIONS ---

    const login = async (email: string, pass: string) => {
        await signInWithEmailAndPassword(auth, email, pass);
    };

    const logout = async () => {
        await signOut(auth);
        setCurrentUser(null);
        setAllApplications([]); // Clear sensitive data
        setSimulatedApplicationId(null); // Clear simulation state
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
            role: UserRole.PENDING_TEACHER,
            createdAt: new Date().toISOString(),
            emailVerified: false,
            lastActionAt: serverTimestamp()
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

        // 0. Limit Check (Max 5 teams)
        if (myApplications.length >= MAX_TEAMS_PER_TEACHER) {
            throw new Error("Bir öğretmen en fazla 5 takıma danışmanlık yapabilir.");
        }
        
        // 1. Character Limit Check
        const nameErr = teamNameError(data.teamName || '');
        if (nameErr) {
            throw new Error(nameErr);
        }
        // Check uniqueness through the authenticated server without exposing other applications.
        const nameResponse = await authenticatedFetch('/api/team-name-available', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: data.teamName })
        });
        const nameResult = await nameResponse.json().catch(() => ({}));
        if (!nameResponse.ok) {
            throw new Error(nameResult.error || 'Takım adı kontrol edilemedi.');
        }
        if (!nameResult.available) {
            throw new Error("Bu takım ismi zaten alınmış. Lütfen başka bir isim seçiniz.");
        }
        
        const generatedId = Math.random().toString(36).substring(7);

        const team: Team = {
            id: generatedId,
            name: data.teamName,
            category: data.category,
            theme: data.theme,
            selectedVerse: data.selectedVerse, 
            selectedTopic: data.selectedTopic,
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
        
        const safeData = sanitizeData(app) as unknown as Record<string, unknown>;
        
        // Use a batch to create app and update user's lastActionAt for rate limiting
        const batch = writeBatch(db);
        batch.set(doc(db, "applications", app.id), safeData);
        batch.update(doc(db, "users", auth.currentUser.uid), { lastActionAt: serverTimestamp() });
        
        await batch.commit();
        
        setActiveApplicationId(app.id);
        showToast('Takım oluşturuldu.', 'success');
        await logAction("CREATE_APP", `Takım oluşturuldu: ${app.team.name}`);
    };

    const updateApplication = async (app: Application) => {
        const safeData = sanitizeData(app) as unknown as Record<string, unknown>;
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
        const batch = writeBatch(db);
        
        // 1. Delete all messages in sub-collection
        const messagesSnap = await getDocs(collection(db, "applications", appId, "messages"));
        messagesSnap.forEach(d => batch.delete(d.ref));
        
        // 2. Delete all scores in sub-collection
        const scoresSnap = await getDocs(collection(db, "applications", appId, "scores"));
        scoresSnap.forEach(d => batch.delete(d.ref));
        
        // 3. Delete the main application document
        batch.delete(doc(db, "applications", appId));
        
        await batch.commit();
        
        await logAction("DELETE_APP", "Başvuru ve tüm bağlı veriler (mesajlar, puanlar) silindi.", appId);
        showToast('Takım ve tüm verileri silindi.', 'success');
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

    const [userIp, setUserIp] = useState<string>('unknown');

    useEffect(() => {
        // Fetch public IP for audit logs
        fetch('https://api.ipify.org?format=json')
            .then(res => res.json())
            .then(data => setUserIp(data.ip))
            .catch(() => console.log("IP could not be fetched for logs"));
    }, []);

    const logAction = async (action: string, details: string, targetId?: string, metadata?: any) => {
        if (!currentUser) return;
        try {
            const payload: any = {
                action, details,
                performedBy: currentUser.email,
                performedByUid: currentUser.uid,
                ip: userIp || '',
                userAgent: navigator.userAgent || '',
                timestamp: new Date().toISOString()
            };
            if (targetId !== undefined) payload.targetId = targetId;
            if (metadata !== undefined) payload.metadata = metadata;
            
            await addDoc(collection(db, "logs"), payload);
        } catch (err) {
            console.error("Failed to log action:", err);
            // Do not throw, as logging shouldn't break the main flow
        }
    };

    const sendContactMessage = async (data: any) => {
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(result.error || 'Mesajınız gönderilemedi.');
        }
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
        if (!currentUser) return;

        const response = await authenticatedFetch('/api/jury-score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ appId, criteria, notes, isDraft, isRecused })
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(result.error || 'Puan kaydedilemedi.');
        }

        if (isDraft) {
            showToast("Taslak olarak kaydedildi.", 'info');
            return;
        }

        if (isRecused) {
            showToast("Bu eser için çekimser kaldınız.", 'warning');
            await logAction("RECUSE_SCORE", 'Jüri çekimser kaldı.', appId);
        } else {
            showToast("Puan kaydedildi ve gönderildi.", 'success');
            await logAction("SUBMIT_SCORE", `Puan verildi: ${result.total}`, appId);
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
        const response = await fetch('/api/public-vote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ appId, fingerprint }),
        });

        const result = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(result.error || 'Oyunuz kaydedilemedi.');
        }

        setAllApplications(previous => previous.map(application =>
            application.id === appId
                ? { ...application, team: { ...application.team, publicVotes: (application.team.publicVotes || 0) + 1 } }
                : application
        ));
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

    const value = useMemo<AppContextType>(() => ({
            currentUser, loading, login, logout, registerTeacher, resetPassword, resendVerificationEmail,
            currentApplication, myApplications, activeApplicationId, setActiveApplicationId, simulatedApplicationId, setSimulatedApplicationId, allApplications, createApplication, updateApplication, updateApplicationStatus, deleteApplication,
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
    // Functions close over latest state; state fields are listed as deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }), [
        currentUser, loading, currentApplication, myApplications, activeApplicationId,
        simulatedApplicationId, allApplications, systemSettings, cmsGeneral, cmsLinks,
        cmsAcademy, cmsGallery, cmsFaqs, cmsTimeline, cmsPrizes, toasts, notifications,
        contactMessages, allUsers, auditLogs, userIp,
    ]);

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error("useAppContext must be used within AppProvider");
    return context;
};
