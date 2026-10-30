/** Pure projections for api/public-showcase (no I/O). Keep lib/domain/sanitizePublic.ts in sync. */

/**
 * Public payloads must never carry a non-https URL (javascript:, data:, http:...):
 * the value is written by teachers/admins and rendered by the public site.
 */
export function toPublicHttpsUrl(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return /^https:\/\/[^\s]+$/i.test(trimmed) ? trimmed : null;
}

/** Applications created before seasons existed (no seasonId) belong to the 2026 season. */
export const LEGACY_SEASON_ID = '2026';

/** Only AI animation films are public; live-action films were retired in 2026-27. */
export const SHOWCASE_CATEGORY = 'Yapay Zeka Animasyon';

export function seasonOf(data) {
  return (data && data.seasonId) || LEGACY_SEASON_ID;
}

export function sanitizeApplication(snapshot) {
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
      logoUrl: toPublicHttpsUrl(team.logoUrl),
      logoKey: team.logoKey || null,
      category: team.category || '',
      theme: team.theme || '',
      selectedVerse: team.selectedVerse || null,
      selectedTopic: team.selectedTopic || null,
      students: [],
      videoUrl: toPublicHttpsUrl(team.videoUrl),
      videoStatus: team.videoStatus || 'PENDING',
      isPreliminaryStageComplete: false,
      isFinalStageComplete: false,
      isFinalist: Boolean(team.isFinalist),
      finalistRank: team.finalistRank || null,
      isWinner: Boolean(team.isWinner),
      awardCategory: team.awardCategory || null,
      awardTitle: team.awardTitle || null,
    },
    status: data.status || '',
    seasonId: seasonOf(data),
    archived: Boolean(data.archived),
    submittedAt: data.submittedAt || '',
    finalScore: typeof data.finalScore === 'number' ? data.finalScore : null,
    juryCount: Number(data.juryCount || 0),
  };
}

export function sanitizeScore(data) {
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

/**
 * Anonymous per-criterion scores for the public site (no jury identity, no drafts/recusals).
 * Stored on `public_scores/{applicationId}` by the jury-score transaction.
 */
export function buildPublicScores(scoreData) {
  return (scoreData || [])
    .filter((score) => score && !score.isDraft && !score.isRecused)
    .map(sanitizeScore);
}
