/**
 * One-off maintenance after the 2026-10 security audit (manual only; never import from the app).
 *
 *   1. Delete the leaked test account (its password was committed to git history).
 *   2. Null out non-https team.logoUrl / team.submissionDownloadUrl / team.videoUrl values.
 *   3. Backfill public_scores/{applicationId} from the score documents of already-scored works.
 *
 * Dry-run by default. Needs the normal server-side Firebase Admin env variables:
 *
 *   node scripts/ops-oneoffs/post-audit-maintenance.mjs
 *   node scripts/ops-oneoffs/post-audit-maintenance.mjs --execute
 */
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminServices } from '../../server/firebaseAdmin.js';
import { buildPublicScores } from '../../server/publicShowcase.js';

const LEAKED_TEST_ACCOUNT = 'dummy12345@gmail.com';
const URL_FIELDS = ['logoUrl', 'submissionDownloadUrl', 'videoUrl'];
const execute = process.argv.includes('--execute');
const { auth, db } = getAdminServices();

console.log(execute ? 'EXECUTE mode\n' : 'DRY RUN (add --execute to apply)\n');

// 1. leaked test account
try {
  const user = await auth.getUserByEmail(LEAKED_TEST_ACCOUNT);
  const owned = await db.collection('applications').where('teacher.id', '==', user.uid).limit(1).get();
  if (!owned.empty) {
    console.log(`[1] ${LEAKED_TEST_ACCOUNT} (${user.uid}) owns applications — NOT deleted, review manually.`);
  } else {
    console.log(`[1] Found ${LEAKED_TEST_ACCOUNT} (${user.uid}).`);
    if (execute) {
      await auth.deleteUser(user.uid);
      await db.collection('users').doc(user.uid).delete();
      console.log('    Deleted Auth user and profile.');
    }
  }
} catch (error) {
  if (error?.code === 'auth/user-not-found') console.log(`[1] ${LEAKED_TEST_ACCOUNT} does not exist (nothing to do).`);
  else throw error;
}

// 2. unsafe URLs + 3. public score backfill
const applications = await db.collection('applications').get();
let unsafe = 0;
let backfilled = 0;

for (const doc of applications.docs) {
  const data = doc.data();
  const team = data.team || {};

  const updates = {};
  for (const field of URL_FIELDS) {
    const value = team[field];
    if (typeof value === 'string' && value.trim() && !/^https:\/\/\S+$/i.test(value.trim())) {
      console.log(`[2] ${doc.id} team.${field} = ${JSON.stringify(value).slice(0, 120)}`);
      updates[`team.${field}`] = FieldValue.delete();
      unsafe += 1;
    }
  }
  if (execute && Object.keys(updates).length > 0) await doc.ref.update(updates);

  if (Number(data.juryCount || 0) > 0) {
    const existing = await db.collection('public_scores').doc(doc.id).get();
    if (!existing.exists) {
      const scores = await doc.ref.collection('scores').get();
      console.log(`[3] ${doc.id}: backfill ${scores.size} score document(s)`);
      if (execute) {
        await existing.ref.set({
          scores: buildPublicScores(scores.docs.map((score) => score.data())),
          updatedAt: new Date().toISOString(),
        });
      }
      backfilled += 1;
    }
  }
}

console.log(`\nUnsafe URL fields: ${unsafe}. Public score backfills: ${backfilled}.`);
if (!execute) console.log('Nothing was changed (dry run).');
