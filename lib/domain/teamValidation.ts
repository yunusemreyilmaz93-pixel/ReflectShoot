export const TEAM_NAME_MIN = 3;
export const TEAM_NAME_MAX = 40;
export const MAX_STUDENTS_PER_TEAM = 4;
/** Official competition rule (2026-27): teams have 2 to 4 students. */
export const MIN_STUDENTS_PER_TEAM = 2;
export const MAX_TEAMS_PER_TEACHER = 5;

export function isValidTeamName(name: unknown): name is string {
  return typeof name === 'string' && name.trim().length >= TEAM_NAME_MIN && name.trim().length <= TEAM_NAME_MAX;
}

export function teamNameError(name: string): string | null {
  const len = name.trim().length;
  if (len < TEAM_NAME_MIN || len > TEAM_NAME_MAX) {
    return 'Takım ismi en az 3, en fazla 40 karakter olmalıdır.';
  }
  return null;
}

export function isValidStudentCount(count: number): boolean {
  return Number.isInteger(count) && count >= MIN_STUDENTS_PER_TEAM && count <= MAX_STUDENTS_PER_TEAM;
}

export function studentCountError(count: number): string | null {
  if (!Number.isInteger(count)) return 'Öğrenci sayısı geçersiz.';
  if (count < MIN_STUDENTS_PER_TEAM) {
    return `Takım en az ${MIN_STUDENTS_PER_TEAM} kişiden oluşmalıdır.`;
  }
  if (count > MAX_STUDENTS_PER_TEAM) {
    return `En fazla ${MAX_STUDENTS_PER_TEAM} öğrenci ekleyebilirsiniz.`;
  }
  return null;
}

/** YouTube URL pattern aligned with firestore.rules videoUrl check. */
export const YOUTUBE_URL_PATTERN =
  /^https:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+$/;

export function isValidYouTubeUrl(url: string | undefined | null): boolean {
  if (!url) return true; // optional until final stage
  return YOUTUBE_URL_PATTERN.test(url.trim());
}

/** Required YouTube URL (final video submit). Returns error message or null. */
export function requireValidYouTubeUrl(url: string | undefined | null): string | null {
  const trimmed = (url || '').trim();
  if (!trimmed) return 'Lütfen YouTube video linkini giriniz.';
  if (!YOUTUBE_URL_PATTERN.test(trimmed)) {
    return 'Geçerli bir YouTube linki giriniz (youtube.com veya youtu.be).';
  }
  return null;
}

export function isValidApplicationId(appId: unknown): appId is string {
  return typeof appId === 'string' && /^[a-z0-9_-]{3,80}$/i.test(appId);
}
