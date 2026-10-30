import { HttpError } from './auth.js';

export const CRITERIA_KEYS = ['story', 'technical', 'originality', 'themeFit'];

/**
 * Applications the jury must never touch: scoring would flip the status to
 * "Puanlandı" and publish an excluded team on the public showcase.
 */
export const UNSCORABLE_STATUSES = Object.freeze(['Reddedildi', 'Diskalifiye']);

export function isScorableStatus(status) {
  return !UNSCORABLE_STATUSES.includes(status);
}

/**
 * Pure payload validation for POST /api/jury-score (no I/O).
 * @returns {{ appId: string, criteria: Record<string, number>, notes: string, isDraft: boolean, isRecused: boolean }}
 */
export function validateJuryScorePayload(body) {
  const { appId, criteria, notes = '', isDraft = false, isRecused = false } = body || {};
  if (typeof appId !== 'string' || !/^[a-z0-9_-]{3,80}$/i.test(appId)) {
    throw new HttpError(400, 'Geçersiz eser kimliği.', 'invalid_application_id');
  }
  if (!criteria || typeof criteria !== 'object') {
    throw new HttpError(400, 'Puanlama ölçütleri eksik.', 'criteria_required');
  }

  const cleanCriteria = {};
  for (const key of CRITERIA_KEYS) {
    const value = criteria[key];
    if (!Number.isFinite(value) || value < 0 || value > 25) {
      throw new HttpError(400, 'Her ölçüt 0 ile 25 arasında olmalıdır.', 'invalid_criteria');
    }
    cleanCriteria[key] = value;
  }

  if (typeof notes !== 'string' || notes.length > 4000) {
    throw new HttpError(400, 'Jüri notu en fazla 4000 karakter olabilir.', 'invalid_notes');
  }
  if (typeof isDraft !== 'boolean' || typeof isRecused !== 'boolean') {
    throw new HttpError(400, 'Geçersiz değerlendirme durumu.', 'invalid_score_state');
  }

  return { appId, criteria: cleanCriteria, notes: notes.trim(), isDraft, isRecused };
}

/** Same averaging rule as the transaction in jury-score handler. */
export function computeFinalScoreFromScores(scores) {
  const validScores = scores.filter((score) => !score.isDraft && !score.isRecused);
  const finalScore = validScores.length
    ? Math.round((validScores.reduce((sum, score) => sum + score.total, 0) / validScores.length) * 10) / 10
    : 0;
  return {
    finalScore,
    juryCount: validScores.length,
    gradedBy: validScores.map((score) => score.juryId).filter(Boolean),
  };
}
