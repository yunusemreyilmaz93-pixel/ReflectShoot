import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { noStore, requireUser, sendError } from '../server/auth.js';
import { authorizePrivateViewKey, createR2Client, getPrivateBucketName } from '../server/r2.js';

export default async function handler(req, res) {
  noStore(res);
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await requireUser(req);
    const key = await authorizePrivateViewKey(req.query?.key, user);
    const command = new GetObjectCommand({ Bucket: getPrivateBucketName(), Key: key });
    const signedUrl = await getSignedUrl(createR2Client(), command, { expiresIn: 60 });
    return res.status(200).json({ signedUrl });
  } catch (error) {
    return sendError(res, error, 'Dosya bağlantısı oluşturulamadı.');
  }
}
