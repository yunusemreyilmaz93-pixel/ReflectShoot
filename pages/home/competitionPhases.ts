/** Fallback countdown phases when CMS timeline has no targetDate entries. */
export const COMPETITION_PHASES = [
  { label: 'Başvuru ve Eser Gönderimi', date: '2026-05-04T23:59:59' },
  { label: 'Ön Sonuçların Açıklanması', date: '2026-05-07T12:00:00' },
  { label: 'Ödül Alan Takımların Açıklanması', date: '2026-05-08T12:00:00' },
  { label: 'Büyük Final & Ödül Töreni', date: '2026-05-22T10:30:00' },
];

type TimelineLike = { title?: string; targetDate?: string };

/** Next event for home countdown (CMS first, static fallback). */
export function getNextPhase(cmsTimeline: TimelineLike[] | null | undefined) {
  const now = new Date();

  const phases = (cmsTimeline || [])
    .filter(
      (item) =>
        item.targetDate &&
        !item.title?.toLowerCase().includes('akademi') &&
        !item.title?.toLowerCase().includes('eğitim') &&
        !item.title?.toLowerCase().includes('revize') &&
        !item.title?.toLowerCase().includes('nihai')
    )
    .map((item) => ({ label: item.title || '', date: item.targetDate as string }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (phases.length === 0) {
    return (
      COMPETITION_PHASES.find((phase) => new Date(phase.date) > now) ||
      COMPETITION_PHASES[COMPETITION_PHASES.length - 1]
    );
  }

  const nextEvent = phases.find((phase) => new Date(phase.date) > now);
  return nextEvent || phases[phases.length - 1];
}
