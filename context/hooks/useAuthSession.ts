import { useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import { UserProfile, UserRole } from '../../types';

export function useAuthSession() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setCurrentUser({ ...userDoc.data(), emailVerified: user.emailVerified } as UserProfile);
        } else {
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
  };

  const registerTeacher = async (data: {
    email: string;
    password: string;
    name: string;
    school: string;
    city: string;
  }) => {
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
      lastActionAt: serverTimestamp() as any,
    };

    await setDoc(doc(db, 'users', user.uid), userProfile);
    setCurrentUser(userProfile);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const resendVerificationEmail = async () => {
    if (auth.currentUser) await sendEmailVerification(auth.currentUser);
  };

  return {
    currentUser,
    setCurrentUser,
    loading,
    login,
    logout,
    registerTeacher,
    resetPassword,
    resendVerificationEmail,
  };
}
