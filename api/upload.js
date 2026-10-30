import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { noStore, requireUser, ROLES, sendError } from '../server/auth.js';
import {
  authorizePrivateUploadKey,
  authorizePublicLogoKey,
  createR2Client,
  getPrivateBucketName,
  getPublicBucketName,
  PRIVATE_PDF_MAX_BYTES,
  PUBLIC_LOGO_MAX_BYTES,
  SIGNED_URL_TTL_SECONDS,
  validateRequestedFile,
} from '../server/r2.js';

export default async function handler(req, res) {
  noStore(res);
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await requireUser(req, { roles: [ROLES.TEACHER, ROLES.ADMIN] });
    const { contentType, customKey, fileSize, scope, teamId } = req.body || {};

    // Team logo -> public bucket (same function as private documents to stay under the plan's function limit).
    if (scope === 'public-logo') {
      validateRequestedFile({
        contentType,
        fileSize,
        allowedTypes: ['image/png'],
        maxBytes: PUBLIC_LOGO_MAX_BYTES,
      });
      const logoKey = await authorizePublicLogoKey(teamId, user);
      const logoUrl = await getSignedUrl(
        createR2Client(),
        new PutObjectCommand({
          Bucket: getPublicBucketName(),
          Key: logoKey,
          ContentType: contentType,
          ContentLength: fileSize,
          Metadata: { uploadedBy: user.uid },
        }),
        { expiresIn: SIGNED_URL_TTL_SECONDS, signableHeaders: new Set(['content-length']) }
      );
      return res.status(200).json({ uploadUrl: logoUrl, key: logoKey, expiresIn: SIGNED_URL_TTL_SECONDS });
    }

    validateRequestedFile({
      contentType,
      fileSize,
      allowedTypes: ['application/pdf'],
      maxBytes: PRIVATE_PDF_MAX_BYTES,
    });
    const key = await authorizePrivateUploadKey(customKey, user);
    const command = new PutObjectCommand({
      Bucket: getPrivateBucketName(),
      Key: key,
      ContentType: contentType,
      ContentLength: fileSize,
      Metadata: { uploadedBy: user.uid },
    });
    const uploadUrl = await getSignedUrl(createR2Client(), command, {
      expiresIn: SIGNED_URL_TTL_SECONDS,
      signableHeaders: new Set(['content-length']),
    });

    return res.status(200).json({ uploadUrl, fileKey: key, expiresIn: SIGNED_URL_TTL_SECONDS });
  } catch (error) {
    return sendError(res, error, 'Yükleme bağlantısı oluşturulamadı.');
  }
}
