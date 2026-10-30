import { getAdminServices } from '../server/firebaseAdmin.js';
import { buildPublicScores, sanitizeApplication, seasonOf, SHOWCASE_CATEGORY } from '../server/publicShowcase.js';

const PUBLIC_STATUSES = ['Onaylandı', 'Puanlandı'];

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Optional ?season=2027 narrows the showcase to one season (legacy applications count as 2026).
    const season = typeof req.query?.season === 'string' ? req.query.season.trim() : '';
    if (season && !/^[a-zA-Z0-9_-]{2,32}$/.test(season)) {
      return res.status(400).json({ error: 'Geçersiz sezon.' });
    }

    const { db } = getAdminServices();
    const [allPublicSnapshot, publicScoresSnapshot] = await Promise.all([
      db.collection('applications').where('status', 'in', PUBLIC_STATUSES).get(),
      db.collection('public_scores').get(),
    ]);
    const applicationsSnapshot = {
      docs: allPublicSnapshot.docs.filter((doc) => {
        const data = doc.data();
        return data.team?.category === SHOWCASE_CATEGORY && (!season || seasonOf(data) === season);
      }),
    };

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
