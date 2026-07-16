import { getAdminServices } from './firebaseAdmin.js';

export const ROLES = Object.freeze({
  ADMIN: 'ADMIN',
  TEACHER: 'TEACHER',
  STUDENT: 'STUDENT',
  JUDGE: 'JUDGE',
  REPORTER: 'REPORTER',
});

export class HttpError extends Error {
  constructor(status, message, code = 'request_failed') {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.code = code;
  }
}

function getBearerToken(req) {
  const header = req.headers?.authorization || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1] || null;
}

export async function requireUser(req, options = {}) {
  const { roles = [], requireVerifiedEmail = true } = options;
  const token = getBearerToken(req);

  if (!token) {
    throw new HttpError(401, 'Oturum açmanız gerekiyor.', 'authentication_required');
  }

  const { auth, db } = getAdminServices();
  let decoded;
  try {
    decoded = await auth.verifyIdToken(token, true);
  } catch {
    throw new HttpError(401, 'Oturumunuz geçersiz veya süresi dolmuş.', 'invalid_token');
  }

  const profileSnapshot = await db.collection('users').doc(decoded.uid).get();
  if (!profileSnapshot.exists) {
    throw new HttpError(403, 'Kullanıcı profili bulunamadı.', 'profile_missing');
  }

  const profile = profileSnapshot.data() || {};
  const role = profile.role;
  const isAdmin = role === ROLES.ADMIN;

  if (requireVerifiedEmail && !decoded.email_verified && !isAdmin) {
    throw new HttpError(403, 'E-posta adresinizi doğrulamanız gerekiyor.', 'email_not_verified');
  }

  if (roles.length > 0 && !roles.includes(role)) {
    throw new HttpError(403, 'Bu işlem için yetkiniz bulunmuyor.', 'insufficient_role');
  }

  return {
    uid: decoded.uid,
    email: decoded.email || profile.email || '',
    emailVerified: Boolean(decoded.email_verified),
    role,
    profile,
  };
}

export function sendError(res, error, fallback = 'İşlem tamamlanamadı.') {
  if (error instanceof HttpError) {
    return res.status(error.status).json({ error: error.message, code: error.code });
  }

  console.error(error);
  return res.status(500).json({ error: fallback, code: 'internal_error' });
}

export function noStore(res) {
  res.setHeader('Cache-Control', 'private, no-store, max-age=0');
  res.setHeader('Pragma', 'no-cache');
}
