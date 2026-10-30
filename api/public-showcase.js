import { getAdminServices } from '../server/firebaseAdmin.js';
import { sanitizeApplication, sanitizeScore } from '../server/publicShowcase.js';

const PUBLIC_STATUSES = ['Onaylandı', 'Puanlandı'];

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { db } = getAdminServices();
    const [applicationsSnapshot, scoresSnapshot] = await Promise.all([
      db.collection('applications').where('status', 'in', PUBLIC_STATUSES).get(),
      db.collectionGroup('scores').get(),
    ]);

    const publicApplicationIds = new Set(applicationsSnapshot.docs.map((doc) => doc.id));
    const scores = {};
    scoresSnapshot.docs.forEach((scoreSnapshot) => {
      const data = scoreSnapshot.data() || {};
      if (data.isDraft || data.isRecused) return;
      const applicationId = scoreSnapshot.ref.parent.parent?.id;
      if (!applicationId || !publicApplicationIds.has(applicationId)) return;
      if (!scores[applicationId]) scores[applicationId] = [];
      scores[applicationId].push(sanitizeScore(data));
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
