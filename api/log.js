import { getAdminServices } from '../server/firebaseAdmin.js';
import { noStore, requireUser, sendError } from '../server/auth.js';
import { writeAuditLog } from '../server/auditLog.js';
import { validateClientLog } from '../server/auditLogValidate.js';

export default async function handler(req, res) {
  noStore(res);
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await requireUser(req, { requireVerifiedEmail: false });
    const entry = validateClientLog(req.body, user.role);
    await writeAuditLog(getAdminServices().db, req, user, entry);
    return res.status(201).json({ success: true });
  } catch (error) {
    return sendError(res, error, 'Kayıt oluşturulamadı.');
  }
}
