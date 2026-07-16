import { ROLES, HttpError } from './auth.js';

const ALLOWED_ROLES = new Set([
  ROLES.ADMIN,
  ROLES.TEACHER,
  ROLES.STUDENT,
  ROLES.JUDGE,
  ROLES.REPORTER,
  'PENDING_TEACHER',
]);

/**
 * Pure validation for POST /api/admin-user-role
 */
export function validateAdminUserRoleBody(body) {
  const { uid, role } = body || {};
  if (typeof uid !== 'string' || !/^[a-zA-Z0-9_-]{6,128}$/.test(uid)) {
    throw new HttpError(400, 'Geçersiz kullanıcı kimliği.', 'invalid_uid');
  }
  if (typeof role !== 'string' || !ALLOWED_ROLES.has(role)) {
    throw new HttpError(400, 'Geçersiz rol.', 'invalid_role');
  }
  return { uid, role };
}

export { ALLOWED_ROLES };
