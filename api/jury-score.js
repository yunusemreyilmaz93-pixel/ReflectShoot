import { FieldValue } from 'firebase-admin/firestore';
import { getAdminServices } from '../server/firebaseAdmin.js';
import { HttpError, noStore, requireUser, ROLES, sendError } from '../server/auth.js';
import { writeAuditLog } from '../server/auditLog.js';
import { buildPublicScores } from '../server/publicShowcase.js';
import {
  CRITERIA_KEYS,
  isScorableStatus,
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
      if (!isScorableStatus(application.status)) {
        throw new HttpError(409, 'Bu eser puanlamaya açık değil.', 'application_not_scorable');
      }

      const scoresSnapshot = await transaction.get(appRef.collection('scores'));
      const scores = scoresSnapshot.docs
        .filter((doc) => doc.id !== user.uid)
        .map((doc) => doc.data());

      const total = payload.isRecused
        ? 0
        : CRITERIA_KEYS.reduce((sum, key) => sum + payload.criteria[key], 0);
      const scoreDocument = {
        juryId: user.uid,
        juryName: user.profile.fullName || user.email,
        total,
        criteria: payload.criteria,
        notes: payload.notes,
        updatedAt: new Date().toISOString(),
        isDraft: payload.isDraft,
        isRecused: payload.isRecused,
      };
      transaction.set(scoreRef, scoreDocument);

      scores.push(scoreDocument);

      const { finalScore, juryCount, gradedBy } = computeFinalScoreFromScores(scores);

      // Anonymous aggregate for the public site: one document per work instead of one read per score.
      transaction.set(db.collection('public_scores').doc(payload.appId), {
        scores: buildPublicScores(scores),
        updatedAt: new Date().toISOString(),
      });

      transaction.update(appRef, {
        finalScore,
        juryCount,
        gradedBy,
        ...(payload.isDraft ? {} : { status: 'Puanlandı' }),
        scoreUpdatedAt: FieldValue.serverTimestamp(),
      });

      return { total, finalScore, juryCount };
    });

    if (!payload.isDraft) {
      await writeAuditLog(db, req, user, {
        action: payload.isRecused ? 'RECUSE_SCORE' : 'SUBMIT_SCORE',
        details: payload.isRecused ? 'Jüri çekimser kaldı.' : `Puan verildi: ${result.total}`,
        targetId: payload.appId,
      }).catch((error) => console.error('Audit log failed:', error));
    }

    return res.status(200).json(result);
  } catch (error) {
    return sendError(res, error, 'Puan kaydedilemedi.');
  }
}
