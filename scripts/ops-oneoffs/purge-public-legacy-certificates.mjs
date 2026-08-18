import { DeleteObjectsCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { createR2Client, getPublicBucketName } from '../../server/r2.js';

const PREFIX = 'certificates/';
const execute = process.argv.includes('--execute');
const confirmed = process.env.CONFIRM_PUBLIC_CERTIFICATE_PURGE === 'YES';

if (execute && !confirmed) {
  console.error('Refusing to delete: set CONFIRM_PUBLIC_CERTIFICATE_PURGE=YES together with --execute.');
  process.exit(2);
}

const client = createR2Client();
const bucket = getPublicBucketName();
const keys = [];
let continuationToken;

do {
  const page = await client.send(
    new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: PREFIX,
      ContinuationToken: continuationToken,
    })
  );

  for (const object of page.Contents || []) {
    if (object.Key) keys.push(object.Key);
  }
  continuationToken = page.IsTruncated ? page.NextContinuationToken : undefined;
} while (continuationToken);

console.log(`Public bucket: ${bucket}`);
console.log(`Prefix: ${PREFIX}`);
console.log(`Objects found: ${keys.length}`);

if (keys.length === 0) {
  console.log('Nothing to purge.');
  process.exit(0);
}

for (const key of keys.slice(0, 20)) console.log(`- ${key}`);
if (keys.length > 20) console.log(`... and ${keys.length - 20} more`);

if (!execute) {
  console.log('\nDRY RUN ONLY. No objects were deleted.');
  console.log('To execute: CONFIRM_PUBLIC_CERTIFICATE_PURGE=YES node scripts/ops-oneoffs/purge-public-legacy-certificates.mjs --execute');
  process.exit(0);
}

let deleted = 0;
for (let i = 0; i < keys.length; i += 1000) {
  const chunk = keys.slice(i, i + 1000);
  const result = await client.send(
    new DeleteObjectsCommand({
      Bucket: bucket,
      Delete: {
        Quiet: true,
        Objects: chunk.map((Key) => ({ Key })),
      },
    })
  );

  if (result.Errors?.length) {
    for (const error of result.Errors) {
      console.error(`Delete failed: ${error.Key || 'unknown'} — ${error.Code || 'unknown'} ${error.Message || ''}`);
    }
    throw new Error(`R2 purge reported ${result.Errors.length} deletion error(s).`);
  }

  deleted += chunk.length;
}

console.log(`Purged ${deleted} public legacy certificate object(s).`);
