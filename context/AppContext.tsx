
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  onSnapshot,
  getFirestore 
} from 'firebase/firestore';
import firebase from 'firebase/compat/app'; // Use compat app to match lib/firebase.ts
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'; 
import { auth, db } from '../lib/firebase';
import { Application, ApplicationStatus, UserRole, EvaluationCriteria, UserProfile, JudgeEvaluation } from '../types';

interface AppContextType {
  currentUser: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  registerTeacher: (data: any) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  createDefaultAdmin: () => Promise<void>;
  createJudgeAccount: (data: any) => Promise<void>; // NEW
  
  // Application Logic
  currentApplication: Application | null;
  createApplication: (data: any) => Promise<void>;
  updateApplication: (app: Application) => Promise<void>;
  mockAdminApplications: Application[]; 
  gradeApplication: (appId: string, criteria: EvaluationCriteria, feedback: string, privateNote?: string) => Promise<void>;
  
  // Admin Logic
  updateUserRole: (uid: string, newRole: UserRole) => Promise<void>;
  currentDate: Date;
  setSimulatedDate: (date: Date) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  const [allApplications, setAllApplications] = useState<Application[]>([]);
  const [currentApplication, setCurrentApplication] = useState<Application | null>(null);

  const setSimulatedDate = (date: Date) => {
    setCurrentDate(date);
  };

  // 1. Listen to Firebase Auth State Changes
  useEffect(() => {
    // Use compat method: auth.onAuthStateChanged
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        // Fetch extended profile from Firestore
        const userDocRef = doc(db, "users", user.uid);
        try {
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
              const userData = userDoc.data() as UserProfile;
              setCurrentUser({
                ...userData,
                emailVerified: user.emailVerified // Keep this synced with Auth status
              });
            } else {
              console.warn("User authenticated but no Firestore profile found.");
              setCurrentUser(null);
            }
        } catch (e) {
            console.error("Error fetching user profile:", e);
        }
      } else {
        setCurrentUser(null);
        setCurrentApplication(null);
        setAllApplications([]); // Clear sensitive data on logout
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Real-time Applications Sync (Firestore)
  useEffect(() => {
    // SECURITY: Don't try to fetch data if user is not logged in.
    if (!currentUser) {
        return;
    }

    const q = query(collection(db, "applications"));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const apps: Application[] = [];
      querySnapshot.forEach((doc) => {
        apps.push(doc.data() as Application);
      });
      setAllApplications(apps);
      
      // Update current user's application if they are a teacher
      if (currentUser?.role === UserRole.TEACHER) {
         const userApp = apps.find(app => app.teacher.email === currentUser.email);
         setCurrentApplication(userApp || null);
      }
    }, (error) => {
        console.warn("Firestore subscription info:", error.code, error.message);
    });

    return () => unsubscribe();
  }, [currentUser]);


  // 3. Auth Actions
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

        // For registration, we are the user, so we can write to our own doc
        const safeProfile = JSON.parse(JSON.stringify(newProfile));
        await setDoc(doc(db, "users", user.uid), safeProfile);
      }

    } catch (error) {
      console.error("Registration Error:", error);
      throw error;
    }
  };

  // Creates a Judge account without logging out the current Admin
  const createJudgeAccount = async (data: any) => {
     let secondaryApp;
     try {
         // 1. Initialize a secondary app instance with a unique name to avoid conflicts
         const config = {
            apiKey: "AIzaSyDM72RAVXZvb3cTOQf1DjwTAcAbpcrV2dE",
            authDomain: "reflectandshoot.firebaseapp.com",
            projectId: "reflectandshoot",
            storageBucket: "reflectandshoot.firebasestorage.app",
            messagingSenderId: "619798868982",
            appId: "1:619798868982:web:a53e1fabdcf0c42f824dd7",
         };
         
         const appName = `SecondaryApp-${Date.now()}`;
         // Use compat initialization
         secondaryApp = firebase.initializeApp(config, appName);
         // Modular Auth with compat app (casted to any to satisfy TS)
         const secondaryAuth = getAuth(secondaryApp as any);
         // Modular Firestore with compat app
         const secondaryDb = getFirestore(secondaryApp as any); 
         
         // 2. Create user in secondary auth
         const userCredential = await createUserWithEmailAndPassword(secondaryAuth, data.email, data.password);
         const user = userCredential.user;
         
         if (user) {
             // 3. Create Firestore profile
             const newProfile: UserProfile = {
                 uid: user.uid,
                 email: data.email,
                 fullName: data.fullName,
                 role: UserRole.JUDGE,
                 school: 'Reflect&Shoot Jury',
                 city: 'Konya',
                 createdAt: new Date().toISOString(),
                 emailVerified: true // Judges created by admin are verified
             };
             
             // Use secondaryDb to write, satisfying "auth.uid == resource.id" rule
             const safeProfile = JSON.parse(JSON.stringify(newProfile));
             await setDoc(doc(secondaryDb, "users", user.uid), safeProfile);
         }
     } catch (error) {
         console.error("Error creating judge:", error);
         throw error;
     } finally {
        // 4. Cleanup
        if (secondaryApp) {
            await secondaryApp.delete();
        }
     }
  };

  const createDefaultAdmin = async () => {
      try {
          const email = "admin@reflectandshoot.com";
          const password = "Yarışma_2026";
          const userCredential = await auth.createUserWithEmailAndPassword(email, password);
          const user = userCredential.user;

          if (user) {
            const newProfile: UserProfile = {
              uid: user.uid,
              email: email,
              fullName: "Sistem Yöneticisi",
              role: UserRole.ADMIN,
              school: "Reflect&Shoot HQ",
              city: "Konya",
              createdAt: new Date().toISOString(),
              emailVerified: true 
            };
            const safeProfile = JSON.parse(JSON.stringify(newProfile));
            await setDoc(doc(db, "users", user.uid), safeProfile);
          }
      } catch (error: any) {
          if (error.code === 'auth/email-already-in-use') throw new Error("Admin kullanıcısı zaten mevcut.");
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
    if (currentUser?.uid === uid) {
      setCurrentUser(prev => prev ? { ...prev, role: newRole } : null);
    }
  };

  // 4. Application Logic
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
        // Conditional spread to avoid undefined values
        ...(data.selectedVerse ? { selectedVerse: data.selectedVerse } : {}),
        ...(data.logoFile ? { logoUrl: URL.createObjectURL(data.logoFile) } : {}),
        students: data.students.map((s: any, idx: number) => ({
          id: `S-${Date.now()}-${idx}`,
          firstName: s.firstName,
          lastName: s.lastName,
          grade: s.grade,
          hasKvkkConsent: false,
          hasParentalConsent: false
        })),
        videoStatus: 'PENDING',
        isPreliminaryStageComplete: false,
        isFinalStageComplete: false,
        videoSize: '0 MB',
        videoResolution: 'N/A',
        virusScanStatus: 'CLEAN',
        isFinalist: false 
      },
      status: ApplicationStatus.DRAFT,
      submittedAt: new Date().toISOString()
    };
    
    try {
      // Deep clean undefined values before sending to Firestore
      const safeApp = JSON.parse(JSON.stringify(newApp));
      await setDoc(doc(db, "applications", newApp.id), safeApp);
    } catch (error) {
      console.error("Error creating application:", error);
      alert("Başvuru oluşturulurken bir hata oluştu. Lütfen tekrar deneyiniz.");
    }
  };

  const updateApplication = async (updatedApp: Application) => {
    try {
      // Deep clean undefined values
      const safeApp = JSON.parse(JSON.stringify(updatedApp));
      await setDoc(doc(db, "applications", updatedApp.id), safeApp);
    } catch (error) {
       console.error("Error updating application:", error);
    }
  };

  // UPDATED GRADING LOGIC FOR MULTI-JUDGE
  const gradeApplication = async (appId: string, criteria: EvaluationCriteria, feedback: string, privateNote?: string) => {
     if (!currentUser) return;
     
     const targetApp = allApplications.find(a => a.id === appId);
     if(targetApp) {
         const score = criteria.script + criteria.technical + criteria.creativity + criteria.editing;
         
         const newEvaluation: JudgeEvaluation = {
             judgeId: currentUser.uid,
             judgeName: currentUser.fullName,
             criteriaScores: criteria,
             feedback,
             privateNote, // Optional confidential note
             totalScore: score,
             gradedAt: new Date().toISOString()
         };

         // Get existing evaluations or empty array
         let evaluations = targetApp.judgeEvaluations || [];
         
         // Remove previous evaluation by this judge if exists (update logic)
         evaluations = evaluations.filter(e => e.judgeId !== currentUser.uid);
         
         // Add new evaluation
         evaluations.push(newEvaluation);

         // Calculate Average Score
         const sum = evaluations.reduce((acc, curr) => acc + curr.totalScore, 0);
         const average = sum / evaluations.length;

         const updated: Application = {
             ...targetApp,
             status: ApplicationStatus.GRADED, // Considered graded if at least one judge graded
             judgeEvaluations: evaluations,
             finalScore: parseFloat(average.toFixed(2)) // Store with 2 decimals
         };
         
         await updateApplication(updated);
     }
  };

  return (
    <AppContext.Provider value={{ 
      currentUser, 
      loading,
      login, 
      logout, 
      registerTeacher, 
      resendVerificationEmail,
      createDefaultAdmin,
      createJudgeAccount,
      updateUserRole,
      currentApplication, 
      createApplication, 
      updateApplication,
      mockAdminApplications: allApplications,
      gradeApplication,
      currentDate,
      setSimulatedDate
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
    