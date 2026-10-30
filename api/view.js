import { pipeline } from 'node:stream/promises';
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

    // Some browser clients (notably certificate generation) need the file bytes.
    // Proxying them through our same-origin authenticated endpoint avoids depending
    // on the R2 bucket's browser CORS configuration.
    if (req.query?.raw === '1') {
      const object = await createR2Client().send(command);
      if (!object.Body) {
        throw new Error('Dosya içeriği alınamadı.');
      }

      // Stream instead of buffering: no per-request memory spike and no buffered-response size cap.
      res.status(200);
      res.setHeader('Content-Type', object.ContentType || 'application/octet-stream');
      if (typeof object.ContentLength === 'number') {
        res.setHeader('Content-Length', String(object.ContentLength));
      }
      await pipeline(object.Body, res);
      return undefined;
    }

    const signedUrl = await getSignedUrl(createR2Client(), command, { expiresIn: 60 });
    return res.status(200).json({ signedUrl });
  } catch (error) {
    if (res.headersSent) {
      // Failed mid-stream: the status is already sent, so drop the connection instead of replying.
      console.error('File stream failed:', error);
      res.destroy?.();
      return undefined;
    }
    return sendError(res, error, 'Dosya bağlantısı oluşturulamadı.');
  }
}
