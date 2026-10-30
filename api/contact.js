import { createHash } from 'node:crypto';
import { Timestamp } from 'firebase-admin/firestore';
import { getAdminServices } from '../server/firebaseAdmin.js';

class ContactError extends Error {
  constructor(status, message, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function cleanText(value, field, min, max) {
  const text = typeof value === 'string' ? value.trim() : '';
  if (text.length < min || text.length > max) {
    throw new ContactError(400, `${field} alanı geçersiz.`, 'invalid_contact_data');
  }
  return text;
}

function getClientIp(req) {
  const forwarded = req.headers?.['x-forwarded-for'];
  return String(Array.isArray(forwarded) ? forwarded[0] : forwarded || req.socket?.remoteAddress || 'unknown')
    .split(',')[0]
    .trim();
}

function hashIp(req) {
  // VOTE_HASH_SALT is the pre-rename name of the same secret; keep accepting it so deployed envs keep working.
  const salt = process.env.CONTACT_HASH_SALT || process.env.VOTE_HASH_SALT;
  if (!salt || salt.length < 32) {
    throw new Error('CONTACT_HASH_SALT must contain at least 32 characters');
  }
  return createHash('sha256').update(`${salt}:contact:${getClientIp(req)}`).digest('hex');
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store, max-age=0');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const name = cleanText(req.body?.name, 'Ad', 2, 100);
    const email = cleanText(req.body?.email, 'E-posta', 5, 254).toLowerCase();
    const title = cleanText(req.body?.title, 'Konu', 2, 160);
    const message = cleanText(req.body?.message, 'Mesaj', 10, 3000);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new ContactError(400, 'Geçerli bir e-posta adresi girin.', 'invalid_email');
    }

    const { db } = getAdminServices();
    const now = Timestamp.now();
    const rateRef = db.collection('contact_rate_limits').doc(hashIp(req));
    const messageRef = db.collection('contact_messages').doc();

    await db.runTransaction(async (transaction) => {
      const rateSnapshot = await transaction.get(rateRef);
      const data = rateSnapshot.data() || {};
      const windowStart = data.windowStart?.toMillis?.() || 0;
      const lastSentAt = data.lastSentAt?.toMillis?.() || 0;
      const withinWindow = now.toMillis() - windowStart < 60 * 60 * 1000;
      const count = withinWindow ? Number(data.count || 0) : 0;

      if (count >= 5 || now.toMillis() - lastSentAt < 10_000) {
        throw new ContactError(429, 'Çok fazla mesaj gönderdiniz. Lütfen daha sonra tekrar deneyin.', 'rate_limited');
      }

      transaction.set(messageRef, {
        name,
        email,
        title,
        message,
        createdAt: new Date(now.toMillis()).toISOString(),
        status: 'UNREAD',
      });
      transaction.set(rateRef, {
        count: count + 1,
        windowStart: withinWindow ? data.windowStart : now,
        lastSentAt: now,
      });
    });

    return res.status(201).json({ success: true });
  } catch (error) {
    if (error instanceof ContactError) {
      return res.status(error.status).json({ error: error.message, code: error.code });
    }
    console.error('Contact message failed:', error);
    return res.status(500).json({ error: 'Mesajınız gönderilemedi.', code: 'internal_error' });
  }
}
