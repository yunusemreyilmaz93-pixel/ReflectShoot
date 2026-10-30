import { HttpError, ROLES } from './auth.js';

const ADMIN_ACTIONS = new Set([
  'ANNOUNCEMENT',
  'ARCHIVE_APP',
  'DOC_REVIEW',
  'REPLY_MESSAGE',
  'START_SEASON',
  'TOGGLE_FINALIST',
  'UNARCHIVE_APP',
  'UPDATE_SETTINGS',
  'UPDATE_STATUS',
  'VIDEO_PUBLISH',
]);
const OWNER_ACTIONS = new Set(['CREATE_APP']);

/**
 * Which client-reported actions each role may record. Anything the server performs itself
 * (role changes, deletions, jury scores) is logged by that endpoint, never by the browser.
 */
export function validateClientLog(body, role) {
  const { action, details, targetId, metadata } = body || {};
  const allowed =
    role === ROLES.ADMIN ? ADMIN_ACTIONS : role === ROLES.TEACHER || role === ROLES.STUDENT ? OWNER_ACTIONS : new Set();
  if (typeof action !== 'string' || !allowed.has(action)) {
    throw new HttpError(403, 'Bu işlem kaydı oluşturulamaz.', 'log_action_forbidden');
  }
  if (typeof details !== 'string' || details.length < 1 || details.length > 2000) {
    throw new HttpError(400, 'Geçersiz kayıt detayı.', 'invalid_log_details');
  }
  if (targetId !== undefined && (typeof targetId !== 'string' || targetId.length > 200)) {
    throw new HttpError(400, 'Geçersiz hedef.', 'invalid_log_target');
  }
  let cleanMetadata;
  if (metadata !== undefined) {
    const json = JSON.stringify(metadata ?? null);
    if (typeof metadata !== 'object' || metadata === null || Array.isArray(metadata) || json.length > 2000) {
      throw new HttpError(400, 'Geçersiz kayıt üst verisi.', 'invalid_log_metadata');
    }
    cleanMetadata = JSON.parse(json);
  }
  return { action, details, targetId, metadata: cleanMetadata };
}
