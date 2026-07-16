/**
 * Pure projection of an application document for public surfaces.
 * Mirrors api/public-showcase.js — keep both in sync when fields change.
 */
export function sanitizeApplicationForPublic(snapshot: {
  id: string;
  data: () => Record<string, any>;
}) {
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
      students: [] as unknown[],
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

export function sanitizeScoreForPublic(data: Record<string, any>) {
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
