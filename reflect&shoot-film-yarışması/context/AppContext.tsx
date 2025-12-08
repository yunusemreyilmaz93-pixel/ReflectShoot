
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  sendEmailVerification,
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  onSnapshot 
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Application, ApplicationStatus, UserRole, EvaluationCriteria, UserProfile } from '../types';

interface AppContextType {
  currentUser: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  registerTeacher: (data: any) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  createDefaultAdmin: () => Promise<void>;
  
  // Application Logic
  currentApplication: Application | null;
  createApplication: (data: any) => Promise<void>;
  updateApplication: (app: Application) => Promise<void>;
  mockAdminApplications: Application[]; 
  gradeApplication: (appId: string, criteria: EvaluationCriteria, feedback: string) => Promise<void>;
  
  // Admin Logic
  updateUserRole: (uid: string, newRole: UserRole) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [allApplications, setAllApplications] = useState<Application[]>([]);
  const [currentApplication, setCurrentApplication] = useState<Application | null>(null);

  // 1. Listen to Firebase Auth State Changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
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
    // This prevents "Missing or insufficient permissions" errors for guests.
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
        // Handle Permission Denied errors gracefully
        console.warn("Firestore subscription info:", error.code, error.message);
        // We don't throw here to avoid crashing the app
    });

    return () => unsubscribe();
  }, [currentUser]);


  // 3. Auth Actions
  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
    // onAuthStateChanged will handle state update
  };

  const logout = async () => {
    await signOut(auth);
    // onAuthStateChanged will handle state update
  };

  const registerTeacher = async (data: any) => {
    try {
      // A. Create Auth User
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      // B. Send Verification Email
      await sendEmailVerification(user);

      // C. Determine Initial Role
      // Logic: k12.tr emails get automatic TEACHER role (after verification), others get PENDING_TEACHER
      const isK12 = data.email.endsWith('k12.tr');
      const initialRole = isK12 ? UserRole.TEACHER : UserRole.PENDING_TEACHER;

      // D. Create Firestore Profile
      const newProfile: UserProfile = {
        uid: user.uid,
        email: data.email,
        fullName: data.name,
        role: initialRole,
        school: data.school,
        city: data.city,
        createdAt: new Date().toISOString(),
        emailVerified: false // Initially false
      };

      await setDoc(doc(db, "users", user.uid), newProfile);

    } catch (error) {
      console.error("Registration Error:", error);
      throw error;
    }
  };

  const createDefaultAdmin = async () => {
      try {
          const email = "admin@reflectandshoot.com";
          const password = "Yarışma_2026";
          
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;

          const newProfile: UserProfile = {
            uid: user.uid,
            email: email,
            fullName: "Sistem Yöneticisi",
            role: UserRole.ADMIN,
            school: "Reflect&Shoot HQ",
            city: "Konya",
            createdAt: new Date().toISOString(),
            emailVerified: true // Admin is verified by default conceptually
          };

          await setDoc(doc(db, "users", user.uid), newProfile);
          console.log("Admin user created successfully");
      } catch (error: any) {
          if (error.code === 'auth/email-already-in-use') {
              throw new Error("Admin kullanıcısı zaten mevcut.");
          }
          throw error;
      }
  };

  const resendVerificationEmail = async () => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  };

  const updateUserRole = async (uid: string, newRole: UserRole) => {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, { role: newRole });
    // If we updated the current user (rare admin case), update local state
    if (currentUser?.uid === uid) {
      setCurrentUser(prev => prev ? { ...prev, role: newRole } : null);
    }
  };

  // 4. Application Logic (Firestore)
  const createApplication = async (data: any) => {
    if (!currentUser) return;

    const newApp: Application = {
      id: `APP-${currentUser.uid}`, // Use UID to ensure one app per teacher easily
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
        selectedVerse: data.selectedVerse,
        logoUrl: data.logoFile ? URL.createObjectURL(data.logoFile) : undefined, // Note: Images normally go to Storage, keeping blob for now
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
        virusScanStatus: 'CLEAN'
      },
      status: ApplicationStatus.DRAFT,
      submittedAt: new Date().toISOString()
    };
    
    try {
      await setDoc(doc(db, "applications", newApp.id), newApp);
      // State sync handled by onSnapshot
    } catch (error) {
      console.error("Error creating application:", error);
    }
  };

  const updateApplication = async (updatedApp: Application) => {
    try {
      await setDoc(doc(db, "applications", updatedApp.id), updatedApp);
    } catch (error) {
       console.error("Error updating application:", error);
    }
  };

  const gradeApplication = async (appId: string, criteria: EvaluationCriteria, feedback: string) => {
     const targetApp = allApplications.find(a => a.id === appId);
     if(targetApp) {
         const totalScore = criteria.script + criteria.technical + criteria.creativity + criteria.editing;
         
         const updated: Application = {
             ...targetApp,
             status: ApplicationStatus.GRADED,
             evaluation: {
                 score: totalScore,
                 feedback,
                 judgeName: "Jüri Heyeti",
                 gradedAt: new Date().toISOString(),
                 criteriaScores: criteria
             }
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
      updateUserRole,
      currentApplication, 
      createApplication, 
      updateApplication,
      mockAdminApplications: allApplications,
      gradeApplication
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
