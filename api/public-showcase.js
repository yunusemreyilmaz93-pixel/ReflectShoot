import { getAdminServices } from '../server/firebaseAdmin.js';
import { buildPublicScores, sanitizeApplication } from '../server/publicShowcase.js';

const PUBLIC_STATUSES = ['Onaylandı', 'Puanlandı'];

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { db } = getAdminServices();
    const [applicationsSnapshot, publicScoresSnapshot] = await Promise.all([
      db.collection('applications').where('status', 'in', PUBLIC_STATUSES).get(),
      db.collection('public_scores').get(),
    ]);

    const scores = {};
    const aggregated = new Set();
    publicScoresSnapshot.docs.forEach((doc) => {
      aggregated.add(doc.id);
      scores[doc.id] = doc.data()?.scores || [];
    });

    // Works scored before `public_scores` existed: read their score documents once (run
    // scripts/ops-oneoffs/post-audit-maintenance.mjs to remove this fallback cost).
    await Promise.all(
      applicationsSnapshot.docs
        .filter((doc) => !aggregated.has(doc.id) && Number(doc.data()?.juryCount || 0) > 0)
        .map(async (doc) => {
          const legacy = await doc.ref.collection('scores').get();
          scores[doc.id] = buildPublicScores(legacy.docs.map((score) => score.data()));
        })
    );

    const publicIds = new Set(applicationsSnapshot.docs.map((doc) => doc.id));
    Object.keys(scores).forEach((id) => {
      if (!publicIds.has(id)) delete scores[id];
    });

    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=1800');
    return res.status(200).json({
      applications: applicationsSnapshot.docs.map(sanitizeApplication),
      scores,
    });
  } catch (error) {
    console.error('Public showcase fetch failed:', error);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(500).json({ error: 'Yarışma sonuçları yüklenemedi.' });
  }
}
