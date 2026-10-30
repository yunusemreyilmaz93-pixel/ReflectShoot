/**
 * One-off clean-up when the 2025-26 season (stored as season "2026") is closed. Manual only.
 *
 * Every step is its own flag so you decide what to purge. DRY RUN unless --execute is given.
 * Back the data up first (Admin -> Ayarlar -> Yedek Indir): deletions here are irreversible.
 *
 *   --consent-documents  R2: delete the parent-consent / KVKK PDFs of 2026 teams and clear the
 *                        matching student fields (private bucket, prefix teams/<id>/students/).
 *   --award-forms        delete award_participations (travel/accommodation/phone details).
 *   --messages           delete contact_messages and the per-team chat messages of 2026 teams.
 *   --log-pii            remove ip / userAgent from every log entry.
 *   --student-identities replace student first/last names (and e-mail) of 2026 teams with
 *                        initials and blank the advisor e-mail/phone.  WARNING: teachers can no
 *                        longer generate student certificates for 2026 after this.
 *   --list-cms           print CMS items (academy, faq, prizes, timeline, gallery) with their ids.
 *   --delete-cms=<collection>:<id>[,<collection>:<id>...]   delete the listed CMS documents
 *                        (collections: cms_academy, cms_faq, cms_prizes, cms_timeline, cms_gallery).
 *
 *   node scripts/ops-oneoffs/season-2026-cleanup.mjs --consent-documents --award-forms --messages --log-pii
 *   node scripts/ops-oneoffs/season-2026-cleanup.mjs --consent-documents --award-forms --messages --log-pii --execute
 *
 * Needs the usual server-side env: FIREBASE_SERVICE_ACCOUNT_JSON (or the three FIREBASE_* vars)
 * and the R2_* variables for --consent-documents.
 */
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminServices } from '../../server/firebaseAdmin.js';

const args = process.argv.slice(2);
const has = (flag) => args.includes(flag);
const execute = has('--execute');
const CMS_COLLECTIONS = ['cms_academy', 'cms_faq', 'cms_prizes', 'cms_timeline', 'cms_gallery'];
const CLOSED_SEASON = '2026';

const { db } = getAdminServices();
console.log(execute ? 'EXECUTE mode (irreversible)\n' : 'DRY RUN (add --execute to apply)\n');

const seasonOf = (data) => data.seasonId || CLOSED_SEASON;
const applications = (await db.collection('applications').get()).docs.filter(
  (doc) => seasonOf(doc.data()) === CLOSED_SEASON
);
console.log(`Applications in season ${CLOSED_SEASON}: ${applications.length}\n`);

async function deleteDocs(label, docs) {
  console.log(`${label}: ${docs.length}`);
  if (!execute) return;
  for (let i = 0; i < docs.length; i += 400) {
    const batch = db.batch();
    docs.slice(i, i + 400).forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
  }
}

if (has('--consent-documents')) {
  const { createR2Client, deleteObjectsByPrefix, getPrivateBucketName } = await import('../../server/r2.js');
  const r2 = createR2Client();
  const bucket = getPrivateBucketName();
  let files = 0;
  for (const app of applications) {
    const prefix = `teams/${app.id}/students/`;
    if (execute) {
      files += await deleteObjectsByPrefix(r2, bucket, prefix);
      const students = (app.data().team?.students || []).map((student) => {
        const clean = { ...student, hasParentalConsent: false, hasKvkkConsent: false };
        for (const key of ['parentalConsentUrl', 'kvkkConsentUrl', 'parentalExpectedId', 'kvkkExpectedId', 'docStatus', 'rejectionReason']) {
          delete clean[key];
        }
        return clean;
      });
      await app.ref.update({ 'team.students': students });
    } else {
      const withDocs = (app.data().team?.students || []).filter((s) => s.parentalConsentUrl || s.kvkkConsentUrl).length;
      files += withDocs * 2;
    }
  }
  console.log(`[consent-documents] ${execute ? 'deleted' : 'would delete (approx.)'} ${files} file(s)\n`);
}

if (has('--award-forms')) {
  const snapshot = await db.collection('award_participations').get();
  await deleteDocs('[award-forms] award_participations', snapshot.docs);
  console.log('');
}

if (has('--messages')) {
  await deleteDocs('[messages] contact_messages', (await db.collection('contact_messages').get()).docs);
  let chats = 0;
  for (const app of applications) {
    const messages = await app.ref.collection('messages').get();
    chats += messages.size;
    if (execute) await deleteDocs(`  chat of ${app.id}`, messages.docs);
  }
  console.log(`[messages] team chat messages: ${chats}\n`);
}

if (has('--log-pii')) {
  const logs = await db.collection('logs').get();
  const withPii = logs.docs.filter((doc) => 'ip' in doc.data() || 'userAgent' in doc.data());
  console.log(`[log-pii] log entries with ip/userAgent: ${withPii.length}`);
  if (execute) {
    for (let i = 0; i < withPii.length; i += 400) {
      const batch = db.batch();
      withPii.slice(i, i + 400).forEach((doc) => batch.update(doc.ref, { ip: FieldValue.delete(), userAgent: FieldValue.delete() }));
      await batch.commit();
    }
  }
  console.log('');
}

if (has('--student-identities')) {
  let students = 0;
  for (const app of applications) {
    const data = app.data();
    const list = data.team?.students || [];
    students += list.length;
    if (!execute) continue;
    const initials = (name) => (String(name || '').trim()[0] || '').toLocaleUpperCase('tr-TR');
    await app.ref.update({
      'team.students': list.map((student) => ({
        id: student.id,
        firstName: initials(student.firstName),
        lastName: initials(student.lastName),
        grade: student.grade || '',
        hasParentalConsent: false,
        hasKvkkConsent: false,
      })),
      'teacher.email': '',
      'teacher.phone': '',
    });
  }
  console.log(`[student-identities] ${execute ? 'anonymised' : 'would anonymise'} ${students} student record(s)\n`);
}

if (has('--list-cms')) {
  for (const collection of CMS_COLLECTIONS) {
    const snapshot = await db.collection(collection).get();
    console.log(`== ${collection} (${snapshot.size})`);
    for (const doc of snapshot.docs) {
      const d = doc.data();
      const extra = [d.category, d.type, d.date, d.isFinalistContent ? 'finalist' : ''].filter(Boolean).join(' | ');
      console.log(`${doc.id}\t${d.title || d.question || d.name || d.alt || ''}\t${extra}`);
    }
    console.log('');
  }
}

const deleteArg = args.find((arg) => arg.startsWith('--delete-cms='));
if (deleteArg) {
  const targets = deleteArg.slice('--delete-cms='.length).split(',').filter(Boolean);
  for (const target of targets) {
    const [collection, id] = target.split(':');
    if (!CMS_COLLECTIONS.includes(collection) || !id) {
      console.error(`Skipping invalid target "${target}"`);
      continue;
    }
    const ref = db.collection(collection).doc(id);
    const snapshot = await ref.get();
    console.log(`[delete-cms] ${collection}/${id}: ${snapshot.exists ? `"${snapshot.data().title || snapshot.data().question || ''}"` : 'not found'}`);
    if (execute && snapshot.exists) await ref.delete();
  }
  console.log('');
}

if (!execute) console.log('Nothing was changed (dry run).');
