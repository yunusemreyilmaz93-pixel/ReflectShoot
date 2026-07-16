import { FieldValue } from 'firebase-admin/firestore';
import { getAdminServices } from '../server/firebaseAdmin.js';
import { HttpError, noStore, requireUser, ROLES, sendError } from '../server/auth.js';

/**
 * Admin-only: tag legacy applications missing seasonId with the active season.
 * Body: { seasonId?: string, dryRun?: boolean }
 */
export default async function handler(req, res) {
  noStore(res);
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const admin = await requireUser(req, { roles: [ROLES.ADMIN] });
    const { db } = getAdminServices();
    const dryRun = Boolean(req.body?.dryRun);
    let seasonId = typeof req.body?.seasonId === 'string' ? req.body.seasonId.trim() : '';

    if (!seasonId) {
      const settings = await db.collection('system').doc('settings').get();
      seasonId = settings.data()?.season?.id || '2026';
    }
    if (!/^[a-zA-Z0-9_-]{2,32}$/.test(seasonId)) {
      throw new HttpError(400, 'Geçersiz seasonId.', 'invalid_season_id');
    }

    const appsSnap = await db.collection('applications').get();
    const legacy = appsSnap.docs.filter((d) => !d.data()?.seasonId);
    let updated = 0;

    if (!dryRun && legacy.length > 0) {
      // Firestore batch limit 500
      const chunks = [];
      for (let i = 0; i < legacy.length; i += 400) {
        chunks.push(legacy.slice(i, i + 400));
      }
      for (const chunk of chunks) {
        const batch = db.batch();
        chunk.forEach((docSnap) => {
          batch.update(docSnap.ref, {
            seasonId,
            seasonTaggedAt: FieldValue.serverTimestamp(),
            seasonTaggedBy: admin.uid,
          });
        });
        await batch.commit();
        updated += chunk.length;
      }
    }

    await db.collection('logs').add({
      action: 'SEASON_TAG_LEGACY',
      details: dryRun
        ? `Dry-run: ${legacy.length} legacy başvuru etiketlenecek (${seasonId})`
        : `${updated} legacy başvuru ${seasonId} sezonuna etiketlendi`,
      performedBy: admin.email,
      performedByUid: admin.uid,
      timestamp: new Date().toISOString(),
      metadata: { seasonId, legacyCount: legacy.length, updated, dryRun },
    });

    return res.status(200).json({
      success: true,
      seasonId,
      legacyCount: legacy.length,
      updated: dryRun ? 0 : updated,
      dryRun,
    });
  } catch (error) {
    return sendError(res, error, 'Sezon etiketleme başarısız.');
  }
}
