import { toPublicHttpsUrl } from './publicShowcase.js';

/**
 * Jury members evaluate the work blind: they receive the film and its category/theme, never the
 * students' names, the school or the advisor's contact details.
 */
export function toJuryView(snapshot, juryUid) {
  const data = snapshot.data() || {};
  const team = data.team || {};

  return {
    id: snapshot.id,
    teacher: { id: '', fullName: '', school: '', city: '', email: '', phone: '' },
    team: {
      id: team.id || snapshot.id,
      name: team.name || '',
      category: team.category || '',
      theme: team.theme || '',
      selectedVerse: team.selectedVerse || null,
      selectedTopic: team.selectedTopic || null,
      students: [],
      videoUrl: toPublicHttpsUrl(team.videoUrl),
      videoStatus: team.videoStatus || 'PENDING',
      videoSize: team.videoSize || null,
      isPreliminaryStageComplete: false,
      isFinalStageComplete: false,
    },
    status: data.status || '',
    submittedAt: data.submittedAt || '',
    seasonId: data.seasonId || null,
    archived: Boolean(data.archived),
    assignedJuryIds: [juryUid],
  };
}
