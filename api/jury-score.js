import { FieldValue } from 'firebase-admin/firestore';
import { getAdminServices } from '../server/firebaseAdmin.js';
import { HttpError, noStore, requireUser, ROLES, sendError } from '../server/auth.js';

const CRITERIA_KEYS = ['story', 'technical', 'originality', 'themeFit'];

function validatePayload(body) {
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

export default async function handler(req, res) {
  noStore(res);
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await requireUser(req, { roles: [ROLES.JUDGE] });
    const payload = validatePayload(req.body);
    const { db } = getAdminServices();
    const appRef = db.collection('applications').doc(payload.appId);
    const scoreRef = appRef.collection('scores').doc(user.uid);

    const result = await db.runTransaction(async (transaction) => {
      const appSnapshot = await transaction.get(appRef);
      if (!appSnapshot.exists) {
        throw new HttpError(404, 'Eser bulunamadı.', 'application_not_found');
      }

      const application = appSnapshot.data();
      if (!Array.isArray(application.assignedJuryIds) || !application.assignedJuryIds.includes(user.uid)) {
        throw new HttpError(403, 'Bu eser size atanmadı.', 'jury_not_assigned');
      }

      const scoresSnapshot = await transaction.get(appRef.collection('scores'));
      const scores = scoresSnapshot.docs
        .filter((doc) => doc.id !== user.uid)
        .map((doc) => doc.data());

      const total = payload.isRecused
        ? 0
        : CRITERIA_KEYS.reduce((sum, key) => sum + payload.criteria[key], 0);
      transaction.set(scoreRef, {
        juryId: user.uid,
        juryName: user.profile.fullName || user.email,
        total,
        criteria: payload.criteria,
        notes: payload.notes,
        updatedAt: new Date().toISOString(),
        isDraft: payload.isDraft,
        isRecused: payload.isRecused,
      });

      scores.push({ total, isDraft: payload.isDraft, isRecused: payload.isRecused, juryId: user.uid });

      const validScores = scores.filter((score) => !score.isDraft && !score.isRecused);
      const finalScore = validScores.length
        ? Math.round((validScores.reduce((sum, score) => sum + score.total, 0) / validScores.length) * 10) / 10
        : 0;
      const gradedBy = validScores.map((score) => score.juryId).filter(Boolean);

      transaction.update(appRef, {
        finalScore,
        juryCount: validScores.length,
        gradedBy,
        ...(payload.isDraft ? {} : { status: 'Puanlandı' }),
        scoreUpdatedAt: FieldValue.serverTimestamp(),
      });

      return { total, finalScore, juryCount: validScores.length };
    });

    return res.status(200).json(result);
  } catch (error) {
    return sendError(res, error, 'Puan kaydedilemedi.');
  }
}
