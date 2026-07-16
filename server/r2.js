import { S3Client } from '@aws-sdk/client-s3';
import { HttpError, ROLES } from './auth.js';
import { getAdminServices } from './firebaseAdmin.js';

export const PRIVATE_PDF_MAX_BYTES = 10 * 1024 * 1024;
export const PUBLIC_LOGO_MAX_BYTES = 1024 * 1024;
export const SIGNED_URL_TTL_SECONDS = 300;

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is missing`);
  return value;
}

export function createR2Client() {
  const accountId = requireEnv('R2_ACCOUNT_ID');
  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: requireEnv('R2_ACCESS_KEY_ID'),
      secretAccessKey: requireEnv('R2_SECRET_ACCESS_KEY'),
    },
  });
}

export function getPrivateBucketName() {
  return requireEnv('R2_PRIVATE_BUCKET_NAME');
}

export function getPublicBucketName() {
  return requireEnv('R2_PUBLIC_BUCKET_NAME');
}

export function validateRequestedFile({ contentType, fileSize, allowedTypes, maxBytes }) {
  if (!allowedTypes.includes(contentType)) {
    throw new HttpError(400, 'Desteklenmeyen dosya türü.', 'invalid_content_type');
  }

  if (!Number.isSafeInteger(fileSize) || fileSize <= 0 || fileSize > maxBytes) {
    throw new HttpError(400, `Dosya boyutu en fazla ${Math.floor(maxBytes / 1024 / 1024)} MB olabilir.`, 'invalid_file_size');
  }
}

export function normalizeStorageKey(value) {
  if (typeof value !== 'string' || value.length === 0 || value.length > 240) {
    throw new HttpError(400, 'Geçersiz dosya anahtarı.', 'invalid_storage_key');
  }

  const key = value.trim();
  if (!/^[a-z0-9/_-]+(?:\.[a-z0-9]{2,5})?$/i.test(key) || key.includes('..') || key.startsWith('/')) {
    throw new HttpError(400, 'Geçersiz dosya anahtarı.', 'invalid_storage_key');
  }
  return key;
}

async function getApplication(applicationId) {
  const { db } = getAdminServices();
  const snapshot = await db.collection('applications').doc(applicationId).get();
  if (!snapshot.exists) {
    throw new HttpError(404, 'Takım bulunamadı.', 'application_not_found');
  }
  return snapshot.data();
}

function ownsApplication(application, user) {
  return application?.teacher?.id === user.uid;
}

export async function authorizePrivateUploadKey(rawKey, user) {
  const key = normalizeStorageKey(rawKey);
  const certificateMatch = key.match(/^certificates\/(attendance|appreciation)_template(?:\.pdf)?$/i);
  if (certificateMatch) {
    if (user.role !== ROLES.ADMIN) {
      throw new HttpError(403, 'Sertifika şablonlarını yalnızca yöneticiler yükleyebilir.', 'forbidden_storage_key');
    }
    return `certificates/${certificateMatch[1]}_template.pdf`;
  }

  const documentMatch = key.match(
    /^teams\/([a-z0-9_-]+)\/students\/([a-z0-9_-]+)\/docs\/(parent|kvkk)(?:\.pdf)?$/i
  );
  if (!documentMatch) {
    throw new HttpError(400, 'Bu dosya yolu yükleme için izinli değil.', 'unsupported_storage_scope');
  }

  const [, applicationId, studentId, documentType] = documentMatch;
  const application = await getApplication(applicationId);
  const isAdmin = user.role === ROLES.ADMIN;
  if (!isAdmin && !ownsApplication(application, user)) {
    throw new HttpError(403, 'Bu takıma dosya yükleme yetkiniz yok.', 'application_access_denied');
  }

  const hasStudent = application?.team?.students?.some((student) => student.id === studentId);
  if (!hasStudent) {
    throw new HttpError(404, 'Öğrenci bulunamadı.', 'student_not_found');
  }

  return `teams/${applicationId}/students/${studentId}/docs/${documentType.toLowerCase()}.pdf`;
}

export async function authorizePublicLogoKey(applicationId, user) {
  if (!/^[a-z0-9_-]{3,80}$/i.test(applicationId || '')) {
    throw new HttpError(400, 'Geçersiz takım kimliği.', 'invalid_application_id');
  }

  const application = await getApplication(applicationId);
  if (user.role !== ROLES.ADMIN && !ownsApplication(application, user)) {
    throw new HttpError(403, 'Bu takımın logosunu değiştirme yetkiniz yok.', 'application_access_denied');
  }

  return `teams/${applicationId}/logo.png`;
}

export async function authorizePrivateViewKey(rawKey, user) {
  const key = normalizeStorageKey(rawKey);
  if (user.role === ROLES.ADMIN) return key;

  if (/^certificates\/(attendance|appreciation)_template\.pdf$/i.test(key)) {
    return key;
  }

  const documentMatch = key.match(
    /^teams\/([a-z0-9_-]+)\/students\/([a-z0-9_-]+)\/docs\/(parent|kvkk)\.pdf$/i
  );
  if (!documentMatch) {
    throw new HttpError(403, 'Bu dosyayı görüntüleme yetkiniz yok.', 'file_access_denied');
  }

  const application = await getApplication(documentMatch[1]);
  if (!ownsApplication(application, user)) {
    throw new HttpError(403, 'Bu dosyayı görüntüleme yetkiniz yok.', 'file_access_denied');
  }

  return key;
}
