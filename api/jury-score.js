import { FieldValue } from 'firebase-admin/firestore';
import { getAdminServices } from '../server/firebaseAdmin.js';
import { HttpError, noStore, requireUser, ROLES, sendError } from '../server/auth.js';
import {
  CRITERIA_KEYS,
  validateJuryScorePayload,
  computeFinalScoreFromScores,
} from '../server/juryScoreValidate.js';

export default async function handler(req, res) {
  noStore(res);
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await requireUser(req, { roles: [ROLES.JUDGE] });
    const payload = validateJuryScorePayload(req.body);
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

      const { finalScore, juryCount, gradedBy } = computeFinalScoreFromScores(scores);

      transaction.update(appRef, {
        finalScore,
        juryCount,
        gradedBy,
        ...(payload.isDraft ? {} : { status: 'Puanlandı' }),
        scoreUpdatedAt: FieldValue.serverTimestamp(),
      });

      return { total, finalScore, juryCount };
    });

    return res.status(200).json(result);
  } catch (error) {
    return sendError(res, error, 'Puan kaydedilemedi.');
  }
}
