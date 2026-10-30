export function getClientIp(req) {
  const forwarded = req.headers?.['x-forwarded-for'];
  return String(Array.isArray(forwarded) ? forwarded[0] : forwarded || req.socket?.remoteAddress || '')
    .split(',')[0]
    .trim()
    .slice(0, 100);
}

/**
 * Audit entries are written by the server only: identity, IP, user agent and time never come
 * from the browser, so an entry cannot be forged by the account it describes.
 */
export async function writeAuditLog(db, req, user, { action, details, targetId, metadata }) {
  const entry = {
    action,
    details: String(details).slice(0, 2000),
    performedBy: user.email,
    performedByUid: user.uid,
    ip: getClientIp(req),
    userAgent: String(req.headers?.['user-agent'] || '').slice(0, 1000),
    timestamp: new Date().toISOString(),
  };
  if (targetId) entry.targetId = String(targetId).slice(0, 200);
  if (metadata) entry.metadata = metadata;
  await db.collection('logs').add(entry);
}
