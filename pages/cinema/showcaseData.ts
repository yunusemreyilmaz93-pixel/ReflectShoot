export const UNLOCK_DATE = new Date('2026-05-23T18:30:00+03:00');

export const officialLiveActionWinners = [
    { rank: '1.', name: 'Sosyal Kızlar42', school: 'Konya Türk Telekom Sosyal Bilimler Lisesi', award: 'Birincilik Ödülü', type: 'gold' },
    { rank: '2.', name: 'Diriliş Perileri', school: 'Güngören İTO Kız Anadolu İmam Hatip Lisesi', award: 'İkincilik Ödülü', type: 'silver' },
    { rank: '3.', name: 'sinemektep', school: 'Güngören İTO Kız Anadolu İmam Hatip Lisesi', award: 'Üçüncülük Ödülü', type: 'bronze' },
    { rank: 'Jüri Özel', name: 'Homines Longinqui', school: 'Uluslararası Mevlana Anadolu İmam Hatip Lisesi', award: 'Jüri Özel Ödülü', type: 'special' },
    { rank: 'Mansiyon', name: 'Justice Without Doubt', school: 'Mahmut Sami Ramazanoğlu Anadolu İmam Hatip Lisesi', award: 'Mansiyon Ödülü', type: 'mention' }
  ];

export const officialAiWinners = [
    { rank: '1.', name: 'mitra', school: '15 Temmuz Şehitleri Anadolu İmam Hatip Lisesi', award: 'Birincilik Ödülü', type: 'gold' },
    { rank: '2.', name: 'Technokasyon', school: 'Kadıköy Anadolu İmam Hatip Lisesi', award: 'İkincilik Ödülü', type: 'silver' },
    { rank: '3.', name: 'Threee', school: 'Maltepe Kız Anadolu İmam Hatip Lisesi', award: 'Üçüncülük Ödülü', type: 'bronze' },
    { rank: 'Jüri Özel', name: 'PURE INSIGHT', school: 'Selçuklu Fen Lisesi', award: 'Jüri Özel Ödülü', type: 'special' },
    { rank: 'Mansiyon', name: 'Clear Vision', school: 'Konya Anadolu İmam Hatip Lisesi', award: 'Mansiyon Ödülü', type: 'mention' }
  ];

export const LIVE_ACTION_WINNER_NAMES = officialLiveActionWinners.map((w: { name: string }) =>
  w.name.trim().toLowerCase()
);

export function getCinemaEmbedUrl(rawUrl?: string): string | null {
  if (!rawUrl) return null;
  if (rawUrl.includes('embed/')) return rawUrl;
  try {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = rawUrl.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}?autoplay=1`;
    }
  } catch {
    /* ignore */
  }
  return rawUrl;
}
