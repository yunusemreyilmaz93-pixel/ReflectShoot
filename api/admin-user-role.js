import { FieldValue } from 'firebase-admin/firestore';
import { getAdminServices } from '../server/firebaseAdmin.js';
import { HttpError, noStore, requireUser, ROLES, sendError } from '../server/auth.js';
import { validateAdminUserRoleBody } from '../server/adminUserRoleValidate.js';
import { sendEmail, renderLifecycleEmail, isEmailConfigured } from '../server/email.js';

/**
 * Admin-only: set user role on the server (client must not own authz fields).
 */
export default async function handler(req, res) {
  noStore(res);
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const admin = await requireUser(req, { roles: [ROLES.ADMIN] });
    const { uid, role } = validateAdminUserRoleBody(req.body);
    const { db } = getAdminServices();

    if (uid === admin.uid && role !== ROLES.ADMIN) {
      throw new HttpError(400, 'Kendi admin rolünüzü kaldıramazsınız.', 'cannot_demote_self');
    }

    const userRef = db.collection('users').doc(uid);
    const snap = await userRef.get();
    if (!snap.exists) {
      throw new HttpError(404, 'Kullanıcı bulunamadı.', 'user_not_found');
    }

    const previousRole = snap.data()?.role || null;
    await userRef.update({
      role,
      roleUpdatedAt: FieldValue.serverTimestamp(),
      roleUpdatedBy: admin.uid,
    });

    await db.collection('logs').add({
      action: 'UPDATE_ROLE',
      details: `Kullanıcı rolü güncellendi: ${previousRole} -> ${role}`,
      performedBy: admin.email,
      performedByUid: admin.uid,
      targetId: uid,
      timestamp: new Date().toISOString(),
      metadata: { before: previousRole, after: role },
    });

    // Lifecycle email when someone becomes TEACHER or JUDGE (no-op if email not configured)
    let emailResult = { skipped: true };
    if (
      isEmailConfigured() &&
      (role === ROLES.TEACHER || role === ROLES.JUDGE) &&
      previousRole !== role
    ) {
      const email = snap.data()?.email;
      if (email) {
        const content = renderLifecycleEmail('ROLE_APPROVED', {
          name: snap.data()?.fullName || '',
          role,
        });
        emailResult = await sendEmail({
          to: email,
          subject: content.subject,
          html: content.html,
          tags: ['role_approved'],
        });
      }
    }

    return res.status(200).json({ success: true, uid, role, previousRole, email: emailResult });
  } catch (error) {
    return sendError(res, error, 'Rol güncellenemedi.');
  }
}
