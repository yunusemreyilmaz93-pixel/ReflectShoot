import { createHash } from 'node:crypto';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { getAdminServices } from '../server/firebaseAdmin.js';
import {
  validatePublicVoteBody,
  isVoteRateLimited,
  isApplicationVoteEligible,
} from '../server/publicVoteValidate.js';

class VoteError extends Error {
  constructor(status, message, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function hash(value) {
  const salt = process.env.VOTE_HASH_SALT;
  if (!salt || salt.length < 32) {
    throw new Error('VOTE_HASH_SALT must contain at least 32 characters');
  }
  return createHash('sha256').update(`${salt}:${value}`).digest('hex');
}

function getClientIp(req) {
  const forwarded = req.headers?.['x-forwarded-for'];
  return String(Array.isArray(forwarded) ? forwarded[0] : forwarded || req.socket?.remoteAddress || 'unknown')
    .split(',')[0]
    .trim();
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store, max-age=0');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const validated = validatePublicVoteBody(req.body);
    if (!validated.ok) {
      throw new VoteError(validated.status, validated.message, validated.code);
    }
    const { appId, fingerprint } = validated;

    const { db } = getAdminServices();
    const now = Timestamp.now();
    const day = new Date(now.toMillis()).toISOString().slice(0, 10);
    const fingerprintHash = hash(fingerprint);
    const ipHash = hash(getClientIp(req));
    const voteRef = db.collection('public_votes').doc(`${appId}_${fingerprintHash}`);
    const rateRef = db.collection('vote_rate_limits').doc(`${day}_${ipHash}`);
    const settingsRef = db.collection('system').doc('settings');
    const applicationRef = db.collection('applications').doc(appId);

    await db.runTransaction(async (transaction) => {
      const [settingsSnapshot, applicationSnapshot, voteSnapshot, rateSnapshot] = await Promise.all([
        transaction.get(settingsRef),
        transaction.get(applicationRef),
        transaction.get(voteRef),
        transaction.get(rateRef),
      ]);

      if (settingsSnapshot.data()?.features?.publicVotingActive !== true) {
        throw new VoteError(403, 'Oylama şu anda aktif değil.', 'voting_closed');
      }
      if (!applicationSnapshot.exists) {
        throw new VoteError(404, 'Film bulunamadı.', 'application_not_found');
      }

      const application = applicationSnapshot.data() || {};
      if (!isApplicationVoteEligible(application)) {
        throw new VoteError(400, 'Bu film halk oylamasına açık değil.', 'application_not_eligible');
      }
      if (voteSnapshot.exists) {
        throw new VoteError(409, 'Bu videoya daha önce oy verdiniz.', 'already_voted');
      }

      const rateData = rateSnapshot.data() || {};
      if (isVoteRateLimited(rateData, now.toMillis())) {
        throw new VoteError(429, 'Çok fazla oy denemesi yapıldı. Lütfen daha sonra tekrar deneyin.', 'rate_limited');
      }
      const count = Number(rateData.count || 0);

      transaction.create(voteRef, {
        appId,
        fingerprintHash,
        ipHash,
        createdAt: now,
      });
      transaction.set(rateRef, { count: count + 1, lastVoteAt: now, day }, { merge: true });
      transaction.update(applicationRef, { 'team.publicVotes': FieldValue.increment(1) });
    });

    return res.status(201).json({ success: true });
  } catch (error) {
    if (error instanceof VoteError) {
      return res.status(error.status).json({ error: error.message, code: error.code });
    }
    console.error('Public vote failed:', error);
    return res.status(500).json({ error: 'Oyunuz kaydedilemedi.', code: 'internal_error' });
  }
}
