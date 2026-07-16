import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
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
        team: { ...baseTeam, isFinalist: true, publicVotes: 12 },
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

  test('teacher cannot promote an application to finalist or modify public vote totals', async () => {
    const ref = doc(userDb('teacher', 'TEACHER'), 'applications/team-one');
    await assertFails(updateDoc(ref, { 'team.publicVotes': 5000 }));
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
  test('public voting collections reject direct browser access', async () => {
    const db = environment.unauthenticatedContext().firestore();
    await assertFails(setDoc(doc(db, 'public_votes/fake-vote'), { appId: 'team-one' }));
    await assertFails(getDoc(doc(db, 'public_votes/fake-vote')));
  });

  test('award participation is scoped to the application owner', async () => {
    await assertSucceeds(setDoc(doc(userDb('teacher', 'TEACHER'), 'award_participations/team-one'), {
      applicationId: 'team-one', status: 'draft',
    }));
    await assertFails(getDoc(doc(userDb('other', 'TEACHER'), 'award_participations/team-one')));
  });
});
