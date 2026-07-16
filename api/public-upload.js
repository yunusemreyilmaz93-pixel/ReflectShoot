import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { noStore, requireUser, ROLES, sendError } from '../server/auth.js';
import {
  authorizePublicLogoKey,
  createR2Client,
  getPublicBucketName,
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
    const { contentType, teamId, fileSize } = req.body || {};
    validateRequestedFile({
      contentType,
      fileSize,
      allowedTypes: ['image/png'],
      maxBytes: PUBLIC_LOGO_MAX_BYTES,
    });
    const key = await authorizePublicLogoKey(teamId, user);
    const command = new PutObjectCommand({
      Bucket: getPublicBucketName(),
      Key: key,
      ContentType: contentType,
      ContentLength: fileSize,
      Metadata: { uploadedBy: user.uid },
    });
    const uploadUrl = await getSignedUrl(createR2Client(), command, {
      expiresIn: SIGNED_URL_TTL_SECONDS,
      signableHeaders: new Set(['content-length']),
    });

    return res.status(200).json({ uploadUrl, key, expiresIn: SIGNED_URL_TTL_SECONDS });
  } catch (error) {
    return sendError(res, error, 'Logo yükleme bağlantısı oluşturulamadı.');
  }
}
