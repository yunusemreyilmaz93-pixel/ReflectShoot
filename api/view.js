
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { key } = req.query;

    if (!key) {
        return res.status(400).json({ error: 'File key required' });
    }

    // R2_PRIVATE_BUCKET_NAME kontrol ediliyor
    if (!process.env.R2_ACCOUNT_ID || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY || !process.env.R2_PRIVATE_BUCKET_NAME) {
      throw new Error('R2 configuration is missing');
    }

    const S3 = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
    });

    // Doğrudan gelen key kullanılıyor (URL parsing yok)
    const command = new GetObjectCommand({
        Bucket: process.env.R2_PRIVATE_BUCKET_NAME,
        Key: key,
    });

    // 60 saniye (1 dakika) geçerli link
    const signedUrl = await getSignedUrl(S3, command, { expiresIn: 60 });

    return res.status(200).json({ signedUrl });
  } catch (error) {
    console.error('R2 Signing Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
