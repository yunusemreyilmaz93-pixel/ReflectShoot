/**
 * Pure request validation for POST /api/public-vote (no I/O).
 */
export function validatePublicVoteBody(body) {
  const { appId, fingerprint } = body || {};
  if (!/^[a-z0-9_-]{3,80}$/i.test(appId || '')) {
    return { ok: false, status: 400, message: 'Geçersiz film kimliği.', code: 'invalid_application_id' };
  }
  if (!/^[a-z0-9_-]{16,128}$/i.test(fingerprint || '')) {
    return { ok: false, status: 400, message: 'Geçersiz oy kimliği.', code: 'invalid_fingerprint' };
  }
  return { ok: true, appId, fingerprint };
}

/**
 * Rate-limit decision for a single IP day bucket (mirrors public-vote.js).
 */
export function isVoteRateLimited(rateData, nowMs, opts = { maxPerDay: 50, minIntervalMs: 2000 }) {
  const count = Number(rateData?.count || 0);
  const lastVoteAt = rateData?.lastVoteAt?.toMillis?.() || rateData?.lastVoteAtMs || 0;
  if (count >= opts.maxPerDay) return true;
  if (nowMs - lastVoteAt < opts.minIntervalMs) return true;
  return false;
}

export function isApplicationVoteEligible(application) {
  return Boolean(application?.team?.isFinalist && application?.team?.videoUrl);
}
