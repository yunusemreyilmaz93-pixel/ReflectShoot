export const TEAM_NAME_MIN = 3;
export const TEAM_NAME_MAX = 40;
export const MAX_STUDENTS_PER_TEAM = 5;
export const MIN_STUDENTS_PER_TEAM = 1;
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

/** YouTube URL pattern aligned with firestore.rules videoUrl check. */
export const YOUTUBE_URL_PATTERN =
  /^https:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+$/;

export function isValidYouTubeUrl(url: string | undefined | null): boolean {
  if (!url) return true; // optional until final stage
  return YOUTUBE_URL_PATTERN.test(url);
}

export function isValidApplicationId(appId: unknown): appId is string {
  return typeof appId === 'string' && /^[a-z0-9_-]{3,80}$/i.test(appId);
}
