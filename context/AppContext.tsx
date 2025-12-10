
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
  getDocs
} from 'firebase/firestore';
import firebase from 'firebase/compat/app'; 
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'; 
import { auth, db } from '../lib/firebase';
import { Application, ApplicationStatus, UserRole, EvaluationCriteria, UserProfile, SystemSettings, LogEntry, ScoreDocument } from '../types';

interface AppContextType {
  currentUser: UserProfile | null;
  allUsers: UserProfile[]; // For Admin
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  registerTeacher: (data: any) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  
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
    galaDate: '2026-05-11T19:00:00'
  },
  features: {
    judgeSystemActive: true,
    publicResultReveal: false,
    allowNewRegistrations: true
  }
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

  const setSimulatedDate = (date: Date) => {
    setCurrentDate(date);
  };

  // 1. Listen to Firebase Auth State Changes
  useEffect(() => {
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

    // A) Fetch Applications - ROLE AWARE TO FIX PERMISSION DENIED
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
        console.error("Application Sync Error (Permission?):", error);
    });

    // B) System Settings Sync (Everyone reads)
    const settingsRef = doc(db, "system", "config");
    getDoc(settingsRef).then(docSnap => {
        if(docSnap.exists()) {
            setSystemSettings(docSnap.data() as SystemSettings);
        } else {
            setDoc(settingsRef, DEFAULT_SETTINGS); 
        }
    });

    // C) Admin Specific Streams
    let unsubLogs = () => {};
    let unsubUsers = () => {};

    if (currentUser.role === UserRole.ADMIN) {
        // Fetch Logs
        const qLogs = query(collection(db, "auditLogs"), orderBy("timestamp", "desc"), limit(50));
        unsubLogs = onSnapshot(qLogs, (snap) => {
            const logs: LogEntry[] = [];
            snap.forEach(d => logs.push({ id: d.id, ...d.data() } as LogEntry));
            setAuditLogs(logs);
        });

        // Fetch Users
        const qUsers = query(collection(db, "users"));
        unsubUsers = onSnapshot(qUsers, (snap) => {
            const users: UserProfile[] = [];
            snap.forEach(d => users.push(d.data() as UserProfile));
            setAllUsers(users);
        });
    }

    return () => {
        unsubApps();
        unsubLogs();
        unsubUsers();
    };
  }, [currentUser]);


  // 3. Actions
  const login = async (email: string, password: string) => {
    await auth.signInWithEmailAndPassword(email, password);
  };

  const logout = async () => {
    await auth.signOut();
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

  const updateUserRole = async (uid: string, newRole: UserRole) => {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, { role: newRole });
    await logAction("UPDATE_ROLE", `Kullanıcı rolü güncellendi: ${newRole}`, uid);
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
    } catch (error) {
      console.error("Error creating application:", error);
      alert("Başvuru oluşturulurken bir hata oluştu.");
    }
  };

  const updateApplication = async (updatedApp: Application) => {
    try {
      const safeApp = JSON.parse(JSON.stringify(updatedApp));
      await setDoc(doc(db, "applications", updatedApp.id), safeApp);
    } catch (error) {
       console.error("Error updating application:", error);
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
          status: ApplicationStatus.GRADED // Mark as graded if at least one score exists
      });

      await logAction("SUBMIT_SCORE", `Puan verildi: ${totalScore} (Takım: ${appId})`, appId);
  };

  const fetchJuryScores = async (appId: string): Promise<ScoreDocument[]> => {
      const q = query(collection(db, "applications", appId, "scores"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ScoreDocument));
  };

  // --- SYSTEM ---

  const updateSystemSettings = async (settings: SystemSettings) => {
      await setDoc(doc(db, "system", "config"), settings);
      setSystemSettings(settings);
      await logAction("UPDATE_SETTINGS", "Sistem ayarları güncellendi.");
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
      updateUserRole,
      currentApplication, 
      createApplication, 
      updateApplication,
      allApplications,
      submitScore,
      fetchJuryScores,
      currentDate,
      setSimulatedDate,
      systemSettings,
      updateSystemSettings,
      auditLogs,
      logAction
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
