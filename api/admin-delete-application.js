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
 * Admin-only: permanently removes an application and everything derived from it, including the
 * private parent/KVKK documents and public logo in R2 (personal data of minors must not outlive
 * the record). Files are removed first so a storage failure leaves the record in place to retry.
 * Body: { appId: string }
 */
export default async function handler(req, res) {
  noStore(res);
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const admin = await requireUser(req, { roles: [ROLES.ADMIN] });
    const appId = req.body?.appId;
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
  } catch (error) {
    return sendError(res, error, 'Takım silinemedi.');
  }
}
