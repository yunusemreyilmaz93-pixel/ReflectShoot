import type { Application, Student, SystemSettings } from '../../types';
import { ApplicationStatus } from '../../types';
import { isWithinWindow } from './applicationStatus';
import { MIN_STUDENTS_PER_TEAM, teamNameError } from './teamValidation';

/**
 * Video submission is open only when:
 * - master switch `videoUploadActive` is true AND
 * - current time is within [videoUploadStart, videoUploadEnd]
 */
export function isVideoSubmissionOpen(
  settings: SystemSettings | null | undefined,
  now: Date = new Date()
): boolean {
  if (!settings?.features?.videoUploadActive) return false;
  return isWithinWindow(
    settings.dates?.videoUploadStart,
    settings.dates?.videoUploadEnd,
    now
  );
}

/** Inverse of isVideoSubmissionOpen — used by teacher UI locks. */
export function isVideoDeadlinePassed(
  settings: SystemSettings | null | undefined,
  now: Date = new Date()
): boolean {
  return !isVideoSubmissionOpen(settings, now);
}

export function daysUntilVideoDeadline(
  settings: SystemSettings | null | undefined,
  now: Date = new Date()
): number {
  const end = settings?.dates?.videoUploadEnd;
  if (!end) return 0;
  const endDate = new Date(end);
  if (Number.isNaN(endDate.getTime())) return 0;
  const diff = endDate.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 3600 * 24));
  return days > 0 ? days : 0;
}

export type TeacherProgressBreakdown = {
  docsDone: number;
  docsTotal: number;
  videoDone: boolean;
  percent: number;
};

export function teacherProgressBreakdown(
  app: Application | null | undefined
): TeacherProgressBreakdown {
  if (!app) {
    return { docsDone: 0, docsTotal: 0, videoDone: false, percent: 0 };
  }
  const students = app.team.students || [];
  const docsTotal = students.length * 2;
  const docsDone = students.reduce(
    (acc, s) => acc + (s.hasParentalConsent ? 1 : 0) + (s.hasKvkkConsent ? 1 : 0),
    0
  );
  const videoDone = app.team.videoStatus !== 'PENDING';
  const totalItems = docsTotal + 1;
  const percent =
    totalItems === 0 ? 0 : Math.round(((docsDone + (videoDone ? 1 : 0)) / totalItems) * 100);
  return { docsDone, docsTotal, videoDone, percent };
}

export function calculateTeacherProgress(app: Application | null | undefined): number {
  return teacherProgressBreakdown(app).percent;
}

export function countMissingDocs(app: Application | null | undefined): number {
  if (!app) return 0;
  let count = 0;
  app.team.students.forEach((s) => {
    if (!s.hasParentalConsent) count++;
    if (!s.hasKvkkConsent) count++;
  });
  return count;
}

export type NextTeacherAction = {
  text: string;
  btn: string;
  tab: string;
  type: 'success' | 'urgent' | 'warning' | 'info';
};

/** Pure next-action logic for teacher dashboard CTA. */
export function getNextTeacherAction(
  app: Application,
  isDeadlinePassed: boolean
): NextTeacherAction {
  let action: NextTeacherAction = {
    text: 'Tüm aşamalar tamamlandı! Arkanıza yaslanın.',
    btn: 'Durumu Kontrol Et',
    tab: 'STATUS',
    type: 'success',
  };

  const missingParent = app.team.students.find((s: Student) => !s.hasParentalConsent);
  const missingKvkk = app.team.students.find((s: Student) => !s.hasKvkkConsent);
  const isWinner = app.team.isWinner;

  if (isWinner === true) {
    action = {
      text: 'Tebrikler! Takımınız ödül kazandı. Katılım formunu doldurun.',
      btn: 'Katılım Formuna Git',
      tab: 'AWARD_WIN',
      type: 'success',
    };
  } else if (isWinner === false) {
    action = {
      text: 'Yarışmamıza katılımınız için teşekkür ederiz. Emekleriniz için minnettarız.',
      btn: 'Katılım Sertifikalarını Buradan İndirebilirsiniz',
      tab: 'STATUS',
      type: 'success',
    };
  } else if (
    app.status === ApplicationStatus.FINAL_SUBMITTED ||
    app.status === ApplicationStatus.UNDER_REVIEW
  ) {
    action = {
      text: 'Ödül Töreni değerlendirme süreci tamamlandı. Katılımlarınızdan dolayı teşekkür ederiz.',
      btn: 'Detayları Gör',
      tab: 'STATUS',
      type: 'info',
    };
  } else if (isDeadlinePassed) {
    if (app.team.videoStatus === 'SUBMITTED_LINK' || app.team.videoStatus === 'UPLOADED') {
      action = {
        text: 'Video teslim aşaması sona erdi. Jüri değerlendirmesi sürüyor.',
        btn: 'Durumu Gör',
        tab: 'STATUS',
        type: 'success',
      };
    } else {
      action = {
        text: 'Film yükleme süresi sona ermiştir. İşlemi tamamlayamadınız.',
        btn: 'İncele',
        tab: 'STATUS',
        type: 'urgent',
      };
    }
  } else if (app.team.students.length < MIN_STUDENTS_PER_TEAM) {
    action = {
      text: `Takım en az ${MIN_STUDENTS_PER_TEAM} kişiden oluşmalıdır.`,
      btn: 'Öğrenci Ekle',
      tab: 'DOCUMENTS',
      type: 'urgent',
    };
  } else if (missingParent) {
    action = {
      text: `${missingParent.firstName} isimli öğrencinin Veli İzin Belgesi eksik.`,
      btn: 'Belgeyi Yükle',
      tab: 'DOCUMENTS',
      type: 'warning',
    };
  } else if (missingKvkk) {
    action = {
      text: `${missingKvkk.firstName} isimli öğrencinin KVKK Metni eksik.`,
      btn: 'Belgeyi Yükle',
      tab: 'DOCUMENTS',
      type: 'warning',
    };
  } else if (app.team.videoStatus === 'PENDING' || app.team.videoStatus === 'ERROR') {
    action = {
      text: 'Prodüksiyon belgeleri tamam. Sırada film teslimi var.',
      btn: 'Videoyu Teslim Et',
      tab: 'VIDEO',
      type: 'info',
    };
  } else if (app.team.videoStatus === 'SUBMITTED_LINK') {
    action = {
      text: 'Video inceleme aşamasında. Onay bekleniyor.',
      btn: 'Detayları Gör',
      tab: 'VIDEO',
      type: 'success',
    };
  }

  return action;
}

export function chatReadStorageKey(appId: string): string {
  return `chat_read_${appId}`;
}

/** Turkish long date/time for dashboard copy (deadline banners, modals). */
export function formatDateTimeTr(isoOrDate: string | Date | null | undefined): string {
  if (!isoOrDate) return '';
  const d = typeof isoOrDate === 'string' ? new Date(isoOrDate) : isoOrDate;
  if (Number.isNaN(d.getTime())) return typeof isoOrDate === 'string' ? isoOrDate : '';
  return d.toLocaleString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function winnerModalKey(uid: string): string {
  return `seen_winner_modal_${uid}`;
}

export function thanksModalKey(uid: string): string {
  return `seen_thanks_modal_${uid}`;
}

export function deadlineModalKey(appId: string): string {
  return `seen_deadline_passed_${appId}`;
}

/** Students cannot be edited after video is submitted/uploaded. */
export function canMutateStudents(videoStatus: string | undefined | null): boolean {
  return videoStatus !== 'UPLOADED' && videoStatus !== 'SUBMITTED_LINK';
}

export type CreateTeamFormInput = {
  teamName: string;
  students: Array<{ firstName: string; lastName: string; grade: string }>;
};

/** Client-side create-team validation (mirrors dashboard form). */
export function validateCreateTeamForm(form: CreateTeamFormInput): Record<string, string> {
  const errs: Record<string, string> = {};
  const nameErr = teamNameError(form.teamName || '');
  if (nameErr) errs.teamName = nameErr;
  if (!form.students || form.students.length < MIN_STUDENTS_PER_TEAM) {
    errs.students = `En az ${MIN_STUDENTS_PER_TEAM} öğrenci zorunludur.`;
  } else if (form.students.some((s) => !s.firstName?.trim() || !s.lastName?.trim() || !s.grade?.trim())) {
    errs.students = 'Tüm öğrenci bilgileri doldurulmalıdır.';
  }
  return errs;
}

export type DocCodeType = 'PARENT' | 'KVKK';

export function buildDocVerificationCode(type: DocCodeType, digits: string): string {
  const prefix = type === 'PARENT' ? 'RAS-VI' : 'RAS-AR';
  return `${prefix}-${digits}`;
}

export function isDocCodeTaken(
  students: Array<{ parentalExpectedId?: string; kvkkExpectedId?: string }>,
  code: string
): boolean {
  return students.some((s) => s.parentalExpectedId === code || s.kvkkExpectedId === code);
}

export function getAcademyCategoryStyle(category: string): {
  badge: string;
  btn: string;
  title: string;
} {
  const cat = (category || '').toLowerCase();
  if (cat.includes('senaryo') || cat.includes('tema')) {
    return {
      badge: 'bg-slate-950 text-amber-500 border-amber-500/50 shadow-lg shadow-amber-900/20',
      btn: 'text-amber-500 hover:text-amber-400',
      title: 'group-hover:text-amber-400',
    };
  }
  if (cat.includes('teknik') || cat.includes('kurgu')) {
    return {
      badge: 'bg-slate-950 text-cyan-500 border-cyan-500/50 shadow-lg shadow-cyan-900/20',
      btn: 'text-cyan-500 hover:text-cyan-400',
      title: 'group-hover:text-cyan-400',
    };
  }
  if (cat.includes('yapay zeka') || cat.includes('ai')) {
    return {
      badge: 'bg-slate-950 text-purple-500 border-purple-500/50 shadow-lg shadow-purple-900/20',
      btn: 'text-purple-500 hover:text-purple-400',
      title: 'group-hover:text-purple-400',
    };
  }
  if (cat.includes('ilham') || cat.includes('rehber')) {
    return {
      badge: 'bg-slate-950 text-rose-500 border-rose-500/50 shadow-lg shadow-rose-900/20',
      btn: 'text-rose-500 hover:text-rose-400',
      title: 'group-hover:text-rose-400',
    };
  }
  return {
    badge: 'bg-slate-950 text-slate-300 border-slate-600 shadow-lg',
    btn: 'text-blue-400 hover:text-blue-300',
    title: 'group-hover:text-emerald-400',
  };
}
