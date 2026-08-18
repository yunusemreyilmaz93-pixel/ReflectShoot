import { DeleteObjectsCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { createR2Client, getPublicBucketName } from '../server/r2.js';

const PURGE_TOKEN = 'rns_9dca1f739ff44cc0b783b7d3715b8e1d';
const PREFIX = 'certificates/';
const CONFIRMATION = 'PURGE_LEGACY_CERTIFICATES';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (req.query?.token !== PURGE_TOKEN || req.query?.confirm !== CONFIRMATION) {
    return res.status(404).json({ error: 'Not found' });
  }

  const client = createR2Client();
  const bucket = getPublicBucketName();
  let continuationToken;
  let listed = 0;
  let deleted = 0;
  const sample = [];

  try {
    do {
      const page = await client.send(
        new ListObjectsV2Command({
          Bucket: bucket,
          Prefix: PREFIX,
          ContinuationToken: continuationToken,
        })
      );

      const objects = (page.Contents || [])
        .map((object) => object.Key)
        .filter((key) => typeof key === 'string' && key.startsWith(PREFIX));

      listed += objects.length;
      if (sample.length < 10) sample.push(...objects.slice(0, 10 - sample.length));

      if (objects.length > 0) {
        const result = await client.send(
          new DeleteObjectsCommand({
            Bucket: bucket,
            Delete: {
              Objects: objects.map((Key) => ({ Key })),
              Quiet: true,
            },
          })
        );

        if (result.Errors?.length) {
          return res.status(500).json({
            error: 'Some legacy certificate objects could not be deleted',
            listed,
            deleted,
            failures: result.Errors.map(({ Key, Code }) => ({ Key, Code })),
          });
        }

        deleted += objects.length;
      }

      continuationToken = page.IsTruncated ? page.NextContinuationToken : undefined;
    } while (continuationToken);

    const verification = await client.send(
      new ListObjectsV2Command({ Bucket: bucket, Prefix: PREFIX, MaxKeys: 1 })
    );
    const remaining = (verification.Contents || []).length;

    return res.status(200).json({
      ok: remaining === 0,
      prefix: PREFIX,
      listed,
      deleted,
      remaining,
      sample,
    });
  } catch (error) {
    console.error('Legacy certificate purge failed:', error);
    return res.status(500).json({ error: 'Legacy certificate purge failed' });
  }
}
