import { describe, expect, test } from 'vitest';
import {
  isVideoSubmissionOpen,
  isVideoDeadlinePassed,
  calculateTeacherProgress,
  countMissingDocs,
  getNextTeacherAction,
  daysUntilVideoDeadline,
  canMutateStudents,
  validateCreateTeamForm,
  buildDocVerificationCode,
  isDocCodeTaken,
  getAcademyCategoryStyle,
  chatReadStorageKey,
  winnerModalKey,
  deadlineModalKey,
  formatDateTimeTr,
  teacherProgressBreakdown,
} from '../../lib/domain/teacherDashboard';
import {
  MIN_STUDENTS_PER_TEAM,
  MAX_STUDENTS_PER_TEAM,
  isValidStudentCount,
  studentCountError,
  requireValidYouTubeUrl,
} from '../../lib/domain/teamValidation';
import { DEFAULT_SYSTEM_SETTINGS } from '../../context/defaults';
import type { Application, SystemSettings } from '../../types';
import { ApplicationStatus } from '../../types';

const settings = (over: Partial<SystemSettings> = {}): SystemSettings => ({
  ...DEFAULT_SYSTEM_SETTINGS,
  ...over,
  dates: { ...DEFAULT_SYSTEM_SETTINGS.dates, ...over.dates },
  features: { ...DEFAULT_SYSTEM_SETTINGS.features, ...over.features },
});

const app = (over: Partial<Application> = {}): Application =>
  ({
    id: 'a1',
    teacher: { id: 't', fullName: 'T', school: 'S', city: 'C', email: 'e', phone: 'p' },
    team: {
      id: 't1',
      name: 'Team',
      category: 'Canlı Çekim' as any,
      theme: "Kur'an'dan Ayetler" as any,
      students: [
        { id: '1', firstName: 'A', lastName: 'B', grade: '10', hasParentalConsent: true, hasKvkkConsent: true },
        { id: '2', firstName: 'C', lastName: 'D', grade: '10', hasParentalConsent: true, hasKvkkConsent: true },
        { id: '3', firstName: 'E', lastName: 'F', grade: '10', hasParentalConsent: false, hasKvkkConsent: false },
      ],
      videoStatus: 'PENDING',
      isPreliminaryStageComplete: false,
      isFinalStageComplete: false,
    },
    status: ApplicationStatus.DRAFT,
    submittedAt: '2026-01-01',
    ...over,
  }) as Application;

describe('teacherDashboard video window', () => {
  test('AND: active + within window required', () => {
    const open = settings({
      features: { ...DEFAULT_SYSTEM_SETTINGS.features, videoUploadActive: true },
      dates: {
        ...DEFAULT_SYSTEM_SETTINGS.dates,
        videoUploadStart: '2020-01-01T00:00',
        videoUploadEnd: '2099-01-01T00:00',
      },
    });
    expect(isVideoSubmissionOpen(open, new Date('2026-06-01'))).toBe(true);
    expect(isVideoDeadlinePassed(open, new Date('2026-06-01'))).toBe(false);

    const inactive = settings({
      features: { ...DEFAULT_SYSTEM_SETTINGS.features, videoUploadActive: false },
      dates: open.dates,
    });
    expect(isVideoSubmissionOpen(inactive, new Date('2026-06-01'))).toBe(false);
    expect(isVideoDeadlinePassed(inactive, new Date('2026-06-01'))).toBe(true);

    const expired = settings({
      features: { ...DEFAULT_SYSTEM_SETTINGS.features, videoUploadActive: true },
      dates: {
        ...DEFAULT_SYSTEM_SETTINGS.dates,
        videoUploadStart: '2020-01-01T00:00',
        videoUploadEnd: '2021-01-01T00:00',
      },
    });
    expect(isVideoSubmissionOpen(expired, new Date('2026-06-01'))).toBe(false);
  });

  test('daysUntilVideoDeadline non-negative', () => {
    const s = settings({
      dates: { ...DEFAULT_SYSTEM_SETTINGS.dates, videoUploadEnd: '2099-12-31T00:00' },
    });
    expect(daysUntilVideoDeadline(s, new Date('2026-01-01'))).toBeGreaterThan(0);
  });
});

describe('teacherDashboard progress & next action', () => {
  test('progress and missing docs', () => {
    const a = app();
    expect(countMissingDocs(a)).toBe(2);
    expect(calculateTeacherProgress(a)).toBeGreaterThan(0);
    expect(calculateTeacherProgress(a)).toBeLessThan(100);
  });

  test('next action prioritizes missing parent doc', () => {
    const action = getNextTeacherAction(app(), false);
    expect(action.tab).toBe('DOCUMENTS');
    expect(action.type).toBe('warning');
  });

  test('next action video when docs complete', () => {
    const full = app({
      team: {
        ...app().team,
        students: app().team.students.map((s) => ({
          ...s,
          hasParentalConsent: true,
          hasKvkkConsent: true,
        })),
        videoStatus: 'PENDING',
      },
    });
    const action = getNextTeacherAction(full, false);
    expect(action.tab).toBe('VIDEO');
  });
});

describe('student limits', () => {
  test('min 2 max 4', () => {
    expect(MIN_STUDENTS_PER_TEAM).toBe(2);
    expect(MAX_STUDENTS_PER_TEAM).toBe(4);
    expect(isValidStudentCount(2)).toBe(true);
    expect(isValidStudentCount(4)).toBe(true);
    expect(isValidStudentCount(1)).toBe(false);
    expect(isValidStudentCount(5)).toBe(false);
    expect(studentCountError(5)).not.toBeNull();
    expect(studentCountError(1)).not.toBeNull();
  });
});

describe('requireValidYouTubeUrl', () => {
  test('rejects empty and non-youtube', () => {
    expect(requireValidYouTubeUrl('')).not.toBeNull();
    expect(requireValidYouTubeUrl('https://vimeo.com/1')).not.toBeNull();
    expect(requireValidYouTubeUrl('https://youtu.be/abc')).toBeNull();
  });
});

describe('student mutation & create validation', () => {
  test('canMutateStudents locks after submit', () => {
    expect(canMutateStudents('PENDING')).toBe(true);
    expect(canMutateStudents('SUBMITTED_LINK')).toBe(false);
    expect(canMutateStudents('UPLOADED')).toBe(false);
  });

  test('validateCreateTeamForm requires name and 3 students', () => {
    expect(Object.keys(validateCreateTeamForm({ teamName: 'ab', students: [] })).length).toBeGreaterThan(0);
    expect(
      Object.keys(
        validateCreateTeamForm({
          teamName: 'Işık',
          students: [
            { firstName: 'A', lastName: 'B', grade: '10' },
            { firstName: 'C', lastName: 'D', grade: '10' },
            { firstName: 'E', lastName: 'F', grade: '10' },
          ],
        })
      )
    ).toEqual([]);
    expect(
      validateCreateTeamForm({
        teamName: 'Işık',
        students: [
          { firstName: 'A', lastName: 'B', grade: '10' },
          { firstName: '', lastName: 'D', grade: '10' },
          { firstName: 'E', lastName: 'F', grade: '10' },
        ],
      }).students
    ).toBeTruthy();
  });
});

describe('doc codes & style helpers', () => {
  test('buildDocVerificationCode prefixes', () => {
    expect(buildDocVerificationCode('PARENT', '12345')).toBe('RAS-VI-12345');
    expect(buildDocVerificationCode('KVKK', '99999')).toBe('RAS-AR-99999');
  });

  test('isDocCodeTaken', () => {
    const students = [{ parentalExpectedId: 'RAS-VI-11111', kvkkExpectedId: 'RAS-AR-22222' }];
    expect(isDocCodeTaken(students, 'RAS-VI-11111')).toBe(true);
    expect(isDocCodeTaken(students, 'RAS-VI-00000')).toBe(false);
  });

  test('getAcademyCategoryStyle returns themed classes', () => {
    expect(getAcademyCategoryStyle('Senaryo Yazımı').badge).toContain('amber');
    expect(getAcademyCategoryStyle('Yapay Zeka').badge).toContain('purple');
    expect(getAcademyCategoryStyle('Diğer').badge).toContain('slate');
  });

  test('storage keys stable', () => {
    expect(chatReadStorageKey('app1')).toBe('chat_read_app1');
    expect(winnerModalKey('u1')).toBe('seen_winner_modal_u1');
    expect(deadlineModalKey('app1')).toBe('seen_deadline_passed_app1');
  });
});

describe('next action edge cases', () => {
  test('winner routes to award form', () => {
    const a = app({ team: { ...app().team, isWinner: true } });
    expect(getNextTeacherAction(a, false).tab).toBe('AWARD_WIN');
  });

  test('deadline urgent when video missing', () => {
    const a = app({
      team: {
        ...app().team,
        students: app().team.students.map((s) => ({
          ...s,
          hasParentalConsent: true,
          hasKvkkConsent: true,
        })),
        videoStatus: 'PENDING',
      },
    });
    const action = getNextTeacherAction(a, true);
    expect(action.type).toBe('urgent');
  });

  test('submitted video under deadline shows success path', () => {
    const a = app({
      team: {
        ...app().team,
        students: app().team.students.map((s) => ({
          ...s,
          hasParentalConsent: true,
          hasKvkkConsent: true,
        })),
        videoStatus: 'SUBMITTED_LINK',
      },
    });
    expect(getNextTeacherAction(a, true).type).toBe('success');
  });

  test('progress 100 when docs+video done', () => {
    const a = app({
      team: {
        ...app().team,
        students: app().team.students.map((s) => ({
          ...s,
          hasParentalConsent: true,
          hasKvkkConsent: true,
        })),
        videoStatus: 'SUBMITTED_LINK',
      },
    });
    expect(calculateTeacherProgress(a)).toBe(100);
    const parts = teacherProgressBreakdown(a);
    expect(parts.videoDone).toBe(true);
    expect(parts.docsDone).toBe(parts.docsTotal);
  });
});

describe('formatDateTimeTr', () => {
  test('formats valid ISO', () => {
    const s = formatDateTimeTr('2026-05-04T23:59:00');
    expect(s.length).toBeGreaterThan(5);
    expect(s).toMatch(/2026/);
  });
  test('empty input', () => {
    expect(formatDateTimeTr('')).toBe('');
    expect(formatDateTimeTr(null)).toBe('');
  });
});
