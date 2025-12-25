import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is missing`);
  return v;
}

// Keep only safe chars for keys: [a-z0-9/._-]
// Also normalize Turkish chars & spaces to avoid empty keys.
function safeKey(input) {
  if (!input) return "";
  return String(input)
    .trim()
    .toLowerCase()
    // normalize unicode (turn accented chars into base forms when possible)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // remove diacritics
    // Turkish specific fallbacks (normalize doesn't always handle these as desired)
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    // convert whitespace to hyphen
    .replace(/\s+/g, "-")
    // replace any unsafe char with hyphen
    .replace(/[^a-z0-9\/._-]/g, "-")
    // collapse duplicate hyphens
    .replace(/-+/g, "-")
    // trim leading/trailing hyphens
    .replace(/^-|-$/g, "");
}

function ensurePdfExtension(key, filename) {
  // If key already ends with .pdf/.png/... keep it.
  // For your signed documents you probably want .pdf. If you allow images, remove this.
  const hasExt = /\.[a-z0-9]{2,5}$/i.test(key);
  if (hasExt) return key;

  const fileHasPdf = (filename || "").toLowerCase().endsWith(".pdf");
  if (fileHasPdf) return `${key}.pdf`;
  // Default to .pdf for your signed docs:
  return `${key}.pdf`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const R2_ACCOUNT_ID = requireEnv("R2_ACCOUNT_ID");
    const R2_ACCESS_KEY_ID = requireEnv("R2_ACCESS_KEY_ID");
    const R2_SECRET_ACCESS_KEY = requireEnv("R2_SECRET_ACCESS_KEY");
    const R2_PRIVATE_BUCKET_NAME = requireEnv("R2_PRIVATE_BUCKET_NAME");

    const { filename, contentType, customKey } = req.body || {};

    if (!filename && !customKey) {
      return res.status(400).json({
        error: "Missing required fields: provide at least filename or customKey",
      });
    }

    const s3 = new S3Client({
      region: "auto",
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
      },
    });

    // Build a stable raw key
    const rawKey = customKey || `${Date.now()}-${filename || "file"}`;

    // Sanitize
    let key = safeKey(rawKey);

    // Guarantee non-empty key
    if (!key) {
      key = `${Date.now()}-file`;
    }

    // (Optional) ensure extension (recommended for your signed docs)
    key = ensurePdfExtension(key, filename);

    // IMPORTANT:
    // Do NOT set ContentType inside PutObjectCommand for presigned URLs unless
    // you guarantee the client will send the exact same Content-Type header.
    // This avoids signature mismatch issues across browsers/devices.
    const command = new PutObjectCommand({
      Bucket: R2_PRIVATE_BUCKET_NAME,
      Key: key,
      // ContentType: contentType || "application/pdf", // <-- intentionally removed
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

    return res.status(200).json({
      uploadUrl,
      fileKey: key,
      // returning this only for debugging / logging (not used for signing)
      contentTypeHint: contentType || "application/pdf",
    });
  } catch (error) {
    console.error("R2 Upload Error:", error);
    return res.status(500).json({ error: error.message || "Upload error" });
  }
}
