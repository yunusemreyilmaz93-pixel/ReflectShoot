import { getAdminServices } from '../server/firebaseAdmin.js';
import { HttpError, noStore, requireUser, ROLES, sendError } from '../server/auth.js';
import { writeAuditLog } from '../server/auditLog.js';
import {
  createR2Client,
  deleteObjectsByPrefix,
  getPrivateBucketName,
  getPublicBucketName,
} from '../server/r2.js';

/**
 * Admin-only permanent deletion (one function so the project stays under the Hobby plan's
 * 12-function limit).
 *   { appId }  removes an application and everything derived from it, including the private
 *              parent/KVKK documents and public logo in R2 (personal data of minors must not
 *              outlive the record). Files go first so a storage failure leaves the record in
 *              place to retry.
 *   { uid }    removes the Firebase Auth account, profile and notifications; refused while the
 *              user still advises teams, so student data is never orphaned silently.
 */
async function deleteApplication(req, res, admin, appId) {
  if (typeof appId !== 'string' || !/^[a-z0-9_-]{3,80}$/i.test(appId)) {
    throw new HttpError(400, 'Geçersiz takım kimliği.', 'invalid_application_id');
  }

  const { db } = getAdminServices();
  const appRef = db.collection('applications').doc(appId);
  const snapshot = await appRef.get();
  if (!snapshot.exists) {
    throw new HttpError(404, 'Takım bulunamadı.', 'application_not_found');
  }
  const teamName = snapshot.data()?.team?.name || appId;

  const r2 = createR2Client();
  const prefix = `teams/${appId}/`;
  const privateDeleted = await deleteObjectsByPrefix(r2, getPrivateBucketName(), prefix);
  const publicDeleted = await deleteObjectsByPrefix(r2, getPublicBucketName(), prefix);

  const chatSnapshot = await db.collection('contact_messages').where('applicationId', '==', appId).get();
  await Promise.all(chatSnapshot.docs.map((doc) => doc.ref.delete()));
  await db.collection('award_participations').doc(appId).delete();
  await db.collection('public_scores').doc(appId).delete();
  await db.recursiveDelete(appRef);

  await writeAuditLog(db, req, admin, {
    action: 'DELETE_APP',
    details: `Başvuru ve bağlı tüm veriler silindi: ${teamName}`,
    targetId: appId,
    metadata: { privateFiles: privateDeleted, publicFiles: publicDeleted, chatMessages: chatSnapshot.size },
  });

  return res.status(200).json({ success: true, appId, privateFiles: privateDeleted, publicFiles: publicDeleted });
}

async function deleteUser(req, res, admin, uid) {
  if (typeof uid !== 'string' || !/^[a-zA-Z0-9_-]{6,128}$/.test(uid)) {
    throw new HttpError(400, 'Geçersiz kullanıcı kimliği.', 'invalid_uid');
  }
  if (uid === admin.uid) {
    throw new HttpError(400, 'Kendi hesabınızı silemezsiniz.', 'cannot_delete_self');
  }

  const { auth, db } = getAdminServices();
  const owned = await db.collection('applications').where('teacher.id', '==', uid).limit(1).get();
  if (!owned.empty) {
    throw new HttpError(
      409,
      'Bu kullanıcının takımları var. Önce takımları silin veya arşivleyin.',
      'user_has_applications'
    );
  }

  const profileRef = db.collection('users').doc(uid);
  const profile = await profileRef.get();

  try {
    await auth.deleteUser(uid);
  } catch (error) {
    if (error?.code !== 'auth/user-not-found') throw error;
  }

  const notifications = await db.collection('notifications').where('userId', '==', uid).get();
  await Promise.all(notifications.docs.map((doc) => doc.ref.delete()));
  await profileRef.delete();

  await writeAuditLog(db, req, admin, {
    action: 'DELETE_USER',
    details: `Kullanıcı hesabı silindi: ${profile.data()?.email || uid}`,
    targetId: uid,
    metadata: { role: profile.data()?.role || null },
  });

  return res.status(200).json({ success: true, uid });
}

export default async function handler(req, res) {
  noStore(res);
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const admin = await requireUser(req, { roles: [ROLES.ADMIN] });
    const { appId, uid } = req.body || {};
    if (appId !== undefined && uid === undefined) return await deleteApplication(req, res, admin, appId);
    if (uid !== undefined && appId === undefined) return await deleteUser(req, res, admin, uid);
    throw new HttpError(400, 'appId veya uid belirtilmelidir.', 'invalid_delete_target');
  } catch (error) {
    return sendError(res, error, 'Silme işlemi tamamlanamadı.');
  }
}
