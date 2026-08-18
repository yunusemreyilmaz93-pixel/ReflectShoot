export interface StudentInfo {
  firstName: string;
  lastName: string;
}

/**
 * @deprecated
 * Legacy 2025-2026 certificate files were previously exposed through predictable
 * public asset URLs derived from teacher/student names. That mapping has been
 * retired for privacy and must not be restored.
 *
 * The live dashboard now generates certificates through `lib/certificates.ts`,
 * which fetches the private R2 template through the authenticated `/api/view`
 * endpoint and creates the recipient PDF client-side.
 *
 * These compatibility exports remain temporarily because the dashboard shell
 * still references their names, although the active certificate UI no longer
 * calls them. They intentionally return null and contain no recipient data,
 * storage paths, or public certificate URLs.
 */
export const getTeacherCertificateUrl_2026 = (
  _teacherNameInput: string,
  _teamNameInput?: string
): string | null => null;

/** @deprecated See `getTeacherCertificateUrl_2026`. */
export const getStudentCertificateUrl_2026 = (
  _student: StudentInfo,
  _teamNameInput: string
): string | null => null;
