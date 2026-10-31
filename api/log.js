import { getAdminServices } from '../server/firebaseAdmin.js';
import { noStore, requireUser, sendError } from '../server/auth.js';
import { writeAuditLog } from '../server/auditLog.js';
import { enforceRateLimit, LIMITS } from '../server/rateLimit.js';
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
    const { db } = getAdminServices();
    await enforceRateLimit(db, { ...LIMITS.log, key: user.uid });
    await writeAuditLog(db, req, user, entry);
    return res.status(201).json({ success: true });
  } catch (error) {
    return sendError(res, error, 'Kayıt oluşturulamadı.');
  }
}
