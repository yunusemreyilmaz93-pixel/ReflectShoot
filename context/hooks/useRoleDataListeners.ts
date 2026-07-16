import { useEffect } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { UserProfile, UserRole, Application, Notification, ContactMessage, LogEntry } from '../../types';

type Setters = {
  setNotifications: (n: Notification[]) => void;
  setAllApplications: (a: Application[]) => void;
  setAllUsers: (u: UserProfile[]) => void;
  setAuditLogs: (l: LogEntry[]) => void;
  setContactMessages: (c: ContactMessage[]) => void;
  setMyApplications: (a: Application[]) => void;
  setActiveApplicationId: (id: string | null | ((prev: string | null) => string | null)) => void;
  activeApplicationId: string | null;
};

/**
 * Role-gated Firestore listeners. Guests get public showcase elsewhere.
 */
export function useRoleDataListeners(
  currentUser: UserProfile | null,
  setters: Setters
) {
  const {
    setNotifications,
    setAllApplications,
    setAllUsers,
    setAuditLogs,
    setContactMessages,
    setMyApplications,
    setActiveApplicationId,
    activeApplicationId,
  } = setters;

  useEffect(() => {
    if (!currentUser) return;

    const unsubs: (() => void)[] = [];

    const notifQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
    unsubs.push(
      onSnapshot(notifQuery, (snap) => {
        setNotifications(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Notification)));
      })
    );

    if (currentUser.role === UserRole.ADMIN) {
      unsubs.push(
        onSnapshot(collection(db, 'applications'), (snap) => {
          setAllApplications(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Application)));
        })
      );
      unsubs.push(
        onSnapshot(collection(db, 'users'), (snap) => {
          setAllUsers(snap.docs.map((d) => ({ uid: d.id, ...d.data() } as UserProfile)));
        })
      );
      unsubs.push(
        onSnapshot(query(collection(db, 'logs'), orderBy('timestamp', 'desc'), limit(100)), (snap) => {
          setAuditLogs(snap.docs.map((d) => ({ id: d.id, ...d.data() } as LogEntry)));
        })
      );
      unsubs.push(
        onSnapshot(query(collection(db, 'contact_messages'), orderBy('createdAt', 'desc')), (snap) => {
          setContactMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() } as ContactMessage)));
        })
      );
    } else if (currentUser.role === UserRole.JUDGE) {
      const q = query(
        collection(db, 'applications'),
        where('assignedJuryIds', 'array-contains', currentUser.uid)
      );
      unsubs.push(
        onSnapshot(q, (snap) => {
          setAllApplications(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Application)));
        })
      );
    }

    if (currentUser.role === UserRole.TEACHER || currentUser.role === UserRole.STUDENT) {
      const q = query(collection(db, 'applications'), where('teacher.id', '==', currentUser.uid));
      unsubs.push(
        onSnapshot(q, (snap) => {
          const apps = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Application));
          setMyApplications(apps);
          if (apps.length > 0) {
            if (!activeApplicationId || !apps.find((a) => a.id === activeApplicationId)) {
              setActiveApplicationId(apps[0].id);
            }
          } else {
            setActiveApplicationId(null);
          }
        })
      );
    }

    return () => unsubs.forEach((u) => u());
    // eslint-disable-next-line react-hooks/exhaustive-deps -- match previous AppContext deps (uid/role only)
  }, [currentUser?.uid, currentUser?.role]);
}
