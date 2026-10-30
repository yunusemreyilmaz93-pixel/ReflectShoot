import { getAdminServices } from '../server/firebaseAdmin.js';
import { HttpError, noStore, requireUser, ROLES, sendError } from '../server/auth.js';
import { writeAuditLog } from '../server/auditLog.js';

/**
 * Admin-only: removes the Firebase Auth account together with the profile and notifications.
 * Refuses while the user still advises teams, so student data is never orphaned silently.
 * Body: { uid: string }
 */
export default async function handler(req, res) {
  noStore(res);
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const admin = await requireUser(req, { roles: [ROLES.ADMIN] });
    const uid = req.body?.uid;
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
  } catch (error) {
    return sendError(res, error, 'Kullanıcı silinemedi.');
  }
}
