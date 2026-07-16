import { getAdminServices } from '../server/firebaseAdmin.js';

const PUBLIC_STATUSES = ['Onaylandı', 'Puanlandı'];

function sanitizeApplication(snapshot) {
  const data = snapshot.data() || {};
  const team = data.team || {};
  const teacher = data.teacher || {};

  return {
    id: snapshot.id,
    teacher: {
      id: '',
      fullName: '',
      school: teacher.school || '',
      city: teacher.city || '',
      email: '',
      phone: '',
    },
    team: {
      id: team.id || snapshot.id,
      name: team.name || '',
      logoUrl: team.logoUrl || null,
      logoKey: team.logoKey || null,
      category: team.category || '',
      theme: team.theme || '',
      selectedVerse: team.selectedVerse || null,
      selectedTopic: team.selectedTopic || null,
      students: [],
      videoUrl: team.videoUrl || null,
      videoStatus: team.videoStatus || 'PENDING',
      isPreliminaryStageComplete: false,
      isFinalStageComplete: false,
      isFinalist: Boolean(team.isFinalist),
      finalistRank: team.finalistRank || null,
      publicVotes: Number(team.publicVotes || 0),
      isWinner: Boolean(team.isWinner),
      awardCategory: team.awardCategory || null,
      awardTitle: team.awardTitle || null,
    },
    status: data.status || '',
    submittedAt: data.submittedAt || '',
    finalScore: typeof data.finalScore === 'number' ? data.finalScore : null,
    juryCount: Number(data.juryCount || 0),
  };
}

function sanitizeScore(data) {
  return {
    total: Number(data.total || 0),
    criteria: {
      story: Number(data.criteria?.story || 0),
      technical: Number(data.criteria?.technical || 0),
      originality: Number(data.criteria?.originality || 0),
      themeFit: Number(data.criteria?.themeFit || 0),
    },
  };
}

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
