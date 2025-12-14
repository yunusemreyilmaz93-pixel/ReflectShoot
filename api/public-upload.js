
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { contentType, teamId } = req.body;

    if (!teamId) {
        return res.status(400).json({ error: 'Team ID is required' });
    }

    if (!process.env.R2_ACCOUNT_ID || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY || !process.env.R2_PUBLIC_BUCKET_NAME) {
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

    // Anahtar formatı: teams/{teamId}/logo.png (overwrite allowed)
    // Uzantıyı her zaman .png olarak varsayıyoruz, çünkü frontend'de de resizeImageTo128 png üretiyor.
    const key = `teams/${teamId}/logo.png`;

    // Presigned URL oluştur (Public Bucket için)
    const signedUrl = await getSignedUrl(S3, new PutObjectCommand({
      Bucket: process.env.R2_PUBLIC_BUCKET_NAME, 
      Key: key,
      ContentType: contentType || 'image/png',
    }), { expiresIn: 3600 });

    return res.status(200).json({ uploadUrl: signedUrl, key });
  } catch (error) {
    console.error('R2 Public Upload Error:', error);
    return res.status(500).json({ error: error.message });
  }
}