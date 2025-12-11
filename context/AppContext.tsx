import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
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
  runTransaction // CMS için lazım olabilir diye ekledim, zararı yok
} from 'firebase/firestore';
import firebase from 'firebase/compat/app'; 
import { getAuth, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth'; 
import { auth, db } from '../lib/firebase';
import { 
    Application, 
    ApplicationStatus, 
    UserRole, 
    EvaluationCriteria, 
    UserProfile, 
    SystemSettings, 
    LogEntry, 
    ScoreDocument, 
    ToastMessage, 
    Notification, 
    ChatMessage,
    // --- YENİ EKLENEN CMS TİPLERİ ---
    CMSData,
    GeneralSettings,
    TimelineItem,
    FAQItem,
    DocumentItem
} from '../types';

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
  
  // Admin Logic
  updateUserRole: (uid: string, newRole: UserRole) => Promise<void>;
  currentDate: Date;
  setSimulatedDate: (date: Date) => void;
  
  // System & Logs
  systemSettings: SystemSettings;
  updateSystemSettings: (settings: SystemSettings) => Promise<void>;
  auditLogs: LogEntry[];
  logAction: (action: string, details: string, targetId?: string) => Promise<void>;

  // UI
  toasts: ToastMessage[];
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;

  // Notifications
  notifications: Notification[];
  markNotificationAsRead: (id: string) => Promise<void>;
  sendNotification: (userId: string, title: string, message: string, type: 'info' | 'success' | 'warning' | 'error') => Promise<void>;

  // Chat
  sendMessage: (appId: string, text: string) => Promise<void>;
  
  // Public Vote
  submitPublicVote: (appId: string, fingerprint: string) => Promise<void>;

  // --- YENİ CMS FONKSİYONLARI ---
  cmsData: CMSData;
  refreshCMS: () => Promise<void>;
  updateGeneralSettings: (settings: GeneralSettings) => Promise<void>;
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

// --- YENİ: Varsayılan CMS Verileri ---
const DEFAULT_CMS_GENERAL: GeneralSettings = {
    siteTitle: "Reflect & Shoot",
    metaDescription: "Kısa Film Yarışması",
    heroTitle: "Oku, Anla, Anlat!",
    heroSubtitle: "Hikayeni Hangi Yolla Sahneye Taşıyacaksın?",
    social: { instagram: "", twitter: "", youtube: "" },
    contact: { phone: "", email: "", address: "" },
    stats: { teams: "27", schools: "10+", students: "150+" }
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  const [allApplications, setAllApplications] = useState<Application[]>([]);
  const [currentApplication, setCurrentApplication] = useState<Application | null>(null);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
  const [auditLogs, setAuditLogs] = useState<LogEntry[]>([]);
  
  // Toast State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Notification State
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // --- YENİ: CMS STATE ---
  const [cmsData, setCmsData] = useState<CMSData>({
    general: null, 
    timeline: [],
    faqs: [],
    documents: [],
    loading: true
  });

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

  // --- YENİ: CMS DATA FETCHING ---
  const fetchCMSData = async () => {
    try {
        // 1. Genel Ayarlar
        const generalRef = doc(db, "cms_general", "main");
        const generalSnap = await getDoc(generalRef);
        let generalData = DEFAULT_CMS_GENERAL;
        
        if (generalSnap.exists()) {
            generalData = generalSnap.data() as GeneralSettings;
        }

        // 2. Timeline
        const timelineQ = query(collection(db, "cms_timeline"), orderBy("order", "asc"));
        const timelineSnap = await getDocs(timelineQ);
        const timelineData = timelineSnap.docs.map(d => ({ id: d.id, ...d.data() } as TimelineItem));

        // 3. FAQ
        const faqQ = query(collection(db, "cms_faq"), orderBy("order", "asc"));
        const faqSnap = await getDocs(faqQ);
        const faqData = faqSnap.docs.map(d => ({ id: d.id, ...d.data() } as FAQItem));

        // 4. Documents
        const docQ = query(collection(db, "cms_documents"));
        const docSnap = await getDocs(docQ);
        const docData = docSnap.docs.map(d => ({ id: d.id, ...d.data() } as DocumentItem));

        setCmsData({
            general: generalData,
            timeline: timelineData,
            faqs: faqData,
            documents: docData,
            loading: false
        });

    } catch (error) {
        console.error("CMS Fetch Error:", error);
        setCmsData(prev => ({ 
            ...prev, 
            general: prev.general || DEFAULT_CMS_GENERAL,
            loading: false 
        }));
    }
  };

  // --- YENİ: CMS GÜNCELLEME (Admin İçin) ---
  const updateGeneralSettings = async (settings: GeneralSettings) => {
      await setDoc(doc(db, "cms_general", "main"), settings);
      await fetchCMSData(); // Verileri tazele
      showToast('Genel ayarlar güncellendi.', 'success');
  };

  // Uygulama açılınca CMS verilerini çek
  useEffect(() => {
      fetchCMSData();
  }, []);

  // 1. Listen to Firebase Auth State Changes
  useEffect(() => {
    // BURASI SENİN ORİJİNAL KODUN - DOKUNMADIM
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
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
    if (!currentUser) return;

    // A) Fetch Applications - ROLE AWARE
    let qApps;
    if (currentUser.role === UserRole.ADMIN) {
        // Admin sees all
        qApps = query(collection(db, "applications"));
    } else if (currentUser.role === UserRole.JUDGE) {
        // Judges see submitted/finalized applications
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

    // B) System Settings Sync (Everyone reads)
    const settingsRef = doc(db, "system", "config");
    getDoc(settingsRef).then(docSnap => {
        if(docSnap.exists()) {
            setSystemSettings(docSnap.data() as SystemSettings);
        } else {
            setDoc(settingsRef, DEFAULT_SETTINGS).catch(e => console.warn("Failed to init settings", e.message)); 
        }
    }).catch(e => console.warn("Settings fetch warning", e.message));

    // C) Notifications Sync
    const qNotifs = query(collection(db, "notifications"), where("userId", "==", currentUser.uid), orderBy("createdAt", "desc"), limit(20));
    const unsubNotifs = onSnapshot(qNotifs, (snap) => {
        const notifs: Notification[] = [];
        snap.forEach(d => notifs.push({ id: d.id, ...d.data() } as Notification));
        setNotifications(notifs);
    }, (error) => {
        console.warn("Notifications Sync Warning (Missing Rules or Index):", error.message);
    });

    // D) Admin Specific Streams
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
        unsubApps();
        unsubLogs();
        unsubUsers();
        unsubNotifs();
    };
  }, [currentUser]);


  // 3. Actions
  // --- AUTH FONKSİYONLARI: SENİN KODUNLA AYNI KALDI ---
  const login = async (email: string, password: string) => {
    await auth.signInWithEmailAndPassword(email, password);
  };

  const logout = async () => {
    await auth.signOut();
  };

  const resetPassword = async (email: string) => {
      await auth.sendPasswordResetEmail(email);
  };

  const registerTeacher = async (data: any) => {
    try {
      const userCredential = await auth.createUserWithEmailAndPassword(data.email, data.password);
      const user = userCredential.user;

      if (user) {
        await user.sendEmailVerification();
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
      await auth.currentUser.sendEmailVerification();
    }
  };
  // --------------------------------------------------------

  const updateUserRole = async (uid: string, newRole: UserRole) => {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, { role: newRole });
    await logAction("UPDATE_ROLE", `Kullanıcı rolü güncellendi: ${newRole}`, uid);
    
    // Notify User
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
      
      // Notify Admin
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

      // Check for specific triggers for Notifications
      if (updatedApp.status === ApplicationStatus.FINAL_SUBMITTED) {
           const admins = allUsers.filter(u => u.role === UserRole.ADMIN);
           admins.forEach(admin => {
               sendNotification(admin.uid, "Video Yüklendi", `${updatedApp.team.name} final videosunu yükledi.`, "success");
           });
      }
      
      // Notify Teacher if status changed by Admin
      if (currentUser?.role === UserRole.ADMIN) {
           const teacherId = updatedApp.teacher.email; // ID'ye çevirmek daha doğru olur ama senin kodun böyle
           // Email üzerinden kullanıcı bulma (senin orijinal kodunda böyleydi)
           // Basitlik için tüm kullanıcılarda ara
           const teacher = allUsers.find(u => u.email === updatedApp.teacher.email);
           if (teacher) {
             sendNotification(teacher.uid, "Durum Güncellemesi", `Başvuru durumunuz güncellendi: ${updatedApp.status}`, "info");
             if (updatedApp.team.isFinalist) {
                  sendNotification(teacher.uid, "TEBRİKLER!", "Takımınız FİNALİST olmaya hak kazandı!", "success");
             }
           }
      }

    } catch (error) {
       console.error("Error updating application:", error);
       showToast('Güncelleme sırasında hata oluştu.', 'error');
    }
  };

  // --- SCORING SYSTEM ---
  
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

      // 1. Write to Subcollection
      const scoreRef = doc(db, "applications", appId, "scores", currentUser.uid);
      await setDoc(scoreRef, scoreDoc);

      // 2. Aggregate Scores for Parent Document (Client-side aggregation)
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

      // 3. Update Parent Document
      const appRef = doc(db, "applications", appId);
      await updateDoc(appRef, {
          finalScore: avg,
          juryCount: count,
          gradedBy: gradedBy,
          status: ApplicationStatus.GRADED 
      });

      await logAction("SUB
