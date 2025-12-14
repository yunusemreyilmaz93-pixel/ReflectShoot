
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { filename, contentType, customKey } = req.body;

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

    const uniqueKey = customKey || `${Date.now()}-${filename.replace(/\s+/g, '-')}`;

    const signedUrl = await getSignedUrl(S3, new PutObjectCommand({
      Bucket: process.env.R2_PRIVATE_BUCKET_NAME,
      Key: uniqueKey,
      ContentType: contentType,
    }), { expiresIn: 3600 });

    // Return fileKey as requested, remove publicUrl usage to prevent client confusion
    return res.status(200).json({ uploadUrl: signedUrl, fileKey: uniqueKey });
  } catch (error) {
    console.error('R2 Upload Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
