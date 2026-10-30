import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { collectionGroup, deleteDoc, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { afterAll, beforeAll, beforeEach, describe, test } from 'vitest';

const projectId = 'reflect-and-shoot-test';
let environment: RulesTestEnvironment;

const baseTeam = {
  id: 'team-one',
  name: 'Işık Takımı',
  category: 'Canlı Çekim',
  theme: "Kur'an'dan Ayetler",
  students: [
    { id: 'student-one', firstName: 'Ada', lastName: 'Y.', grade: '10-A', hasParentalConsent: false, hasKvkkConsent: false },
    { id: 'student-two', firstName: 'Can', lastName: 'K.', grade: '10-B', hasParentalConsent: false, hasKvkkConsent: false },
    { id: 'student-three', firstName: 'Ece', lastName: 'D.', grade: '11-A', hasParentalConsent: false, hasKvkkConsent: false },
  ],
  videoStatus: 'PENDING',
  isPreliminaryStageComplete: false,
  isFinalStageComplete: false,
};

function userDb(uid: string, role: string, verified = true) {
  return environment.authenticatedContext(uid, {
    email: `${uid}@example.com`,
    email_verified: verified,
    role,
  }).firestore();
}

beforeAll(async () => {
  environment = await initializeTestEnvironment({
    projectId,
    firestore: {
      host: '127.0.0.1',
      port: 8080,
      rules: readFileSync(resolve('firestore.rules'), 'utf8'),
    },
  });
});

beforeEach(async () => {
  await environment.clearFirestore();
  await environment.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await Promise.all([
      setDoc(doc(db, 'users/admin'), { uid: 'admin', email: 'admin@example.com', role: 'ADMIN' }),
      setDoc(doc(db, 'users/teacher'), { uid: 'teacher', email: 'teacher@example.com', role: 'TEACHER' }),
      setDoc(doc(db, 'users/other'), { uid: 'other', email: 'other@example.com', role: 'TEACHER' }),
      setDoc(doc(db, 'users/judge'), { uid: 'judge', email: 'judge@example.com', role: 'JUDGE' }),
      setDoc(doc(db, 'applications/team-one'), {
        id: 'team-one',
        teacher: { id: 'teacher', fullName: 'Öğretmen', email: 'teacher@example.com' },
        team: { ...baseTeam, isFinalist: true },
        assignedJuryIds: ['judge'],
        status: 'Onaylandı',
        submittedAt: '2026-01-01T00:00:00.000Z',
      }),
    ]);
  });
});

afterAll(async () => {
  await environment.cleanup();
});

describe('Firestore security boundary', () => {
  test('public cannot read a finalist application containing private data', async () => {
    const db = environment.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(db, 'applications/team-one')));
  });

  test('teacher can read only the owned application', async () => {
    await assertSucceeds(getDoc(doc(userDb('teacher', 'TEACHER'), 'applications/team-one')));
    await assertFails(getDoc(doc(userDb('other', 'TEACHER'), 'applications/team-one')));
  });

  test('new account cannot assign itself a privileged role', async () => {
    const db = userDb('new-user', 'ADMIN', false);
    await assertFails(setDoc(doc(db, 'users/new-user'), {
      uid: 'new-user',
      email: 'new-user@example.com',
      fullName: 'New User',
      role: 'ADMIN',
      createdAt: '2026-01-01T00:00:00.000Z',
      emailVerified: false,
    }));
  });

  test('verified teacher can create a constrained draft owned by itself', async () => {
    const db = userDb('teacher', 'TEACHER');
    await assertSucceeds(setDoc(doc(db, 'applications/team-two'), {
      id: 'team-two',
      teacher: { id: 'teacher', fullName: 'Öğretmen', email: 'teacher@example.com' },
      team: { ...baseTeam, id: 'team-two', name: 'Yeni Takım' },
      status: 'Taslak',
      submittedAt: '2026-01-01T00:00:00.000Z',
      seasonId: '2026',
      archived: false,
    }));
  });

  test('teacher cannot archive or re-season an application via client update', async () => {
    const ref = doc(userDb('teacher', 'TEACHER'), 'applications/team-one');
    await assertFails(updateDoc(ref, { archived: true }));
    await assertFails(updateDoc(ref, { seasonId: '2099' }));
  });

  test('teacher cannot promote an application to finalist or winner', async () => {
    const ref = doc(userDb('teacher', 'TEACHER'), 'applications/team-one');
    await assertFails(updateDoc(ref, { 'team.isWinner': true }));
    await assertFails(updateDoc(ref, { 'team.isFinalist': true }));
  });

  test('jury cannot bypass the server scoring transaction', async () => {
    const db = userDb('judge', 'JUDGE');
    await assertFails(setDoc(doc(db, 'applications/team-one/scores/judge'), {
      juryId: 'judge', total: 100, criteria: { story: 25, technical: 25, originality: 25, themeFit: 25 },
    }));
    await assertFails(updateDoc(doc(db, 'applications/team-one'), { finalScore: 100 }));
  });

  test('public contact writes must go through the rate-limited server endpoint', async () => {
    const db = environment.unauthenticatedContext().firestore();
    await assertFails(setDoc(doc(db, 'contact_messages/spam'), {
      name: 'Spam User',
      email: 'spam@example.com',
      title: 'Message',
      message: 'This direct write must be rejected.',
      createdAt: '2026-01-01T00:00:00.000Z',
      status: 'UNREAD',
    }));
  });
  test('award participation is scoped to the application owner', async () => {
    await environment.withSecurityRulesDisabled(async (context) => {
      await updateDoc(doc(context.firestore(), 'applications/team-one'), { 'team.isWinner': true });
    });
    await assertSucceeds(setDoc(doc(userDb('teacher', 'TEACHER'), 'award_participations/team-one'), {
      applicationId: 'team-one', status: 'draft',
    }));
    await assertFails(getDoc(doc(userDb('other', 'TEACHER'), 'award_participations/team-one')));
  });

  describe('application lifecycle integrity', () => {
    async function seedStatus(id: string, status: string, teamExtra: Record<string, unknown> = {}) {
      await environment.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `applications/${id}`), {
          id,
          teacher: { id: 'teacher', fullName: 'Öğretmen', email: 'teacher@example.com' },
          team: { ...baseTeam, id, ...teamExtra },
          status,
          submittedAt: '2026-01-01T00:00:00.000Z',
        });
      });
    }

    test('owner cannot revive a rejected, disqualified or scored application by resetting its status', async () => {
      const db = userDb('teacher', 'TEACHER');
      for (const status of ['Reddedildi', 'Diskalifiye', 'Puanlandı', 'Değerlendiriliyor']) {
        await seedStatus('locked', status);
        await assertFails(updateDoc(doc(db, 'applications/locked'), { status: 'Taslak' }));
        await assertFails(updateDoc(doc(db, 'applications/locked'), { status: 'Video İnceleniyor' }));
      }
    });

    test('owner can still move an editable application forward', async () => {
      await seedStatus('editable', 'Düzeltme Gerekli');
      await assertSucceeds(
        updateDoc(doc(userDb('teacher', 'TEACHER'), 'applications/editable'), { status: 'Video İnceleniyor' })
      );
    });

    test('winner owner can submit the award participation flag on a scored application', async () => {
      await seedStatus('winner', 'Puanlandı', { isWinner: true });
      const ref = doc(userDb('teacher', 'TEACHER'), 'applications/winner');
      await assertSucceeds(
        updateDoc(ref, {
          'team.participationFormStatus': 'submitted',
          'team.participationSubmittedAt': new Date(),
        })
      );
    });

    test('participation flag path cannot be used by non-winners or to touch other fields', async () => {
      await seedStatus('not-winner', 'Puanlandı', { isWinner: false });
      await assertFails(
        updateDoc(doc(userDb('teacher', 'TEACHER'), 'applications/not-winner'), {
          'team.participationFormStatus': 'submitted',
        })
      );

      await seedStatus('winner', 'Puanlandı', { isWinner: true });
      const ref = doc(userDb('teacher', 'TEACHER'), 'applications/winner');
      await assertFails(updateDoc(ref, { 'team.participationFormStatus': 'submitted', 'team.videoUrl': 'https://youtu.be/abc' }));
      await assertFails(updateDoc(ref, { 'team.participationFormStatus': 'submitted', status: 'Taslak' }));
      await assertFails(updateDoc(ref, { 'team.participationFormStatus': 'not_started' }));
    });

    test('owner cannot plant non-https logo or submission URLs', async () => {
      const ref = doc(userDb('teacher', 'TEACHER'), 'applications/team-one');
      await seedStatus('team-one', 'Taslak');
      await assertFails(updateDoc(ref, { 'team.submissionDownloadUrl': 'javascript:alert(1)' }));
      await assertFails(updateDoc(ref, { 'team.logoUrl': 'http://tracker.example/pixel.png' }));
      await assertSucceeds(updateDoc(ref, { 'team.logoUrl': 'https://assets.example.com/logo.png' }));
    });

    test('applications and users can only be deleted by the server (files and Auth account must go too)', async () => {
      await assertFails(deleteDoc(doc(userDb('admin', 'ADMIN'), 'applications/team-one')));
      await assertFails(deleteDoc(doc(userDb('teacher', 'TEACHER'), 'applications/team-one')));
      await assertFails(deleteDoc(doc(userDb('admin', 'ADMIN'), 'users/other')));
    });

    test('judge reads only their own scores and never application documents', async () => {
      await environment.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore();
        await setDoc(doc(db, 'applications/team-one/scores/judge'), { juryId: 'judge', total: 80 });
        await setDoc(doc(db, 'applications/team-one/scores/judge2'), { juryId: 'judge2', total: 60 });
      });
      const db = userDb('judge', 'JUDGE');
      await assertSucceeds(getDocs(query(collectionGroup(db, 'scores'), where('juryId', '==', 'judge'))));
      await assertSucceeds(getDoc(doc(db, 'applications/team-one/scores/judge')));
      await assertFails(getDoc(doc(db, 'applications/team-one/scores/judge2')));
      await assertFails(getDocs(query(collectionGroup(db, 'scores'), where('juryId', '==', 'judge2'))));
      await assertFails(getDoc(doc(db, 'applications/team-one')));
      await assertSucceeds(getDocs(collectionGroup(userDb('admin', 'ADMIN'), 'scores')));
    });

    test('award participation can only be created for a winning team', async () => {
      await seedStatus('not-winner', 'Puanlandı', { isWinner: false });
      await seedStatus('winner', 'Puanlandı', { isWinner: true });
      const db = userDb('teacher', 'TEACHER');
      await assertFails(setDoc(doc(db, 'award_participations/not-winner'), { applicationId: 'not-winner', status: 'draft' }));
      await assertSucceeds(setDoc(doc(db, 'award_participations/winner'), { applicationId: 'winner', status: 'draft' }));
    });

    test('panel message sender role cannot be spoofed', async () => {
      const base = { senderId: 'teacher', senderName: 'Öğretmen', text: 'Merhaba', createdAt: '2026-01-01T00:00:00.000Z' };
      const db = userDb('teacher', 'TEACHER');
      await assertSucceeds(setDoc(doc(db, 'applications/team-one/messages/m1'), { ...base, senderRole: 'TEACHER' }));
      await assertFails(setDoc(doc(db, 'applications/team-one/messages/m2'), { ...base, senderRole: 'ADMIN' }));
    });

    test('audit log entries cannot be written from the browser', async () => {
      const entry = {
        action: 'TEST',
        details: 'x',
        performedBy: 'teacher@example.com',
        performedByUid: 'teacher',
        timestamp: '2026-01-01T00:00:00.000Z',
      };
      await assertFails(setDoc(doc(userDb('teacher', 'TEACHER'), 'logs/l1'), entry));
      await assertFails(setDoc(doc(userDb('admin', 'ADMIN'), 'logs/l2'), { ...entry, performedBy: 'admin@example.com', performedByUid: 'admin' }));
      await assertSucceeds(getDoc(doc(userDb('admin', 'ADMIN'), 'logs/l1')));
      await assertFails(getDoc(doc(userDb('teacher', 'TEACHER'), 'logs/l1')));
    });
  });
});
