import { describe, expect, test } from 'vitest';
import {
  buildAdminActionQueue,
  countNeedsFix,
  countPendingApproval,
  countUnassignedWithVideo,
  countUnreadMessages,
  hasSubmittedVideo,
  trendCountsLast30Days,
} from '../../lib/domain/adminOps';
import { ApplicationStatus, Category, type Application } from '../../types';

function mockApp(partial: Partial<Application> & { id: string }): Application {
  return {
    id: partial.id,
    status: partial.status ?? ApplicationStatus.APPROVED,
    submittedAt: partial.submittedAt ?? '2026-06-01T12:00:00.000Z',
    assignedJuryIds: partial.assignedJuryIds,
    finalScore: partial.finalScore,
    team: {
      name: partial.team?.name ?? 'Test',
      category: partial.team?.category ?? Category.LIVE_ACTION,
      videoStatus: partial.team?.videoStatus ?? 'PENDING',
      isFinalist: partial.team?.isFinalist ?? false,
      ...(partial.team || {}),
    } as Application['team'],
    teacher: {
      school: 'Okul',
      city: 'Konya',
      ...(partial.teacher || {}),
    } as Application['teacher'],
    ...partial,
  } as Application;
}

describe('adminOps', () => {
  test('hasSubmittedVideo', () => {
    expect(hasSubmittedVideo(mockApp({ id: '1', team: { videoStatus: 'UPLOADED' } as Application['team'] }))).toBe(true);
    expect(hasSubmittedVideo(mockApp({ id: '2', team: { videoStatus: 'SUBMITTED_LINK' } as Application['team'] }))).toBe(true);
    expect(hasSubmittedVideo(mockApp({ id: '3', team: { videoStatus: 'PENDING' } as Application['team'] }))).toBe(false);
  });

  test('countUnassignedWithVideo ignores assigned', () => {
    const apps = [
      mockApp({ id: 'a', team: { videoStatus: 'UPLOADED' } as Application['team'], assignedJuryIds: [] }),
      mockApp({ id: 'b', team: { videoStatus: 'UPLOADED' } as Application['team'], assignedJuryIds: ['j1'] }),
      mockApp({ id: 'c', team: { videoStatus: 'PENDING' } as Application['team'] }),
    ];
    expect(countUnassignedWithVideo(apps)).toBe(1);
  });

  test('countPendingApproval and needsFix', () => {
    const apps = [
      mockApp({ id: '1', status: ApplicationStatus.PRELIMINARY_SUBMITTED }),
      mockApp({ id: '2', status: ApplicationStatus.NEEDS_FIX }),
      mockApp({ id: '3', status: ApplicationStatus.APPROVED }),
    ];
    expect(countPendingApproval(apps)).toBe(1);
    expect(countNeedsFix(apps)).toBe(1);
  });

  test('countUnreadMessages', () => {
    expect(
      countUnreadMessages([
        { status: 'UNREAD' },
        { status: 'READ' },
        { status: 'REPLIED' },
        { status: 'UNREAD' },
      ])
    ).toBe(2);
  });

  test('buildAdminActionQueue filters zero counts', () => {
    const apps = [
      mockApp({
        id: 'a',
        status: ApplicationStatus.PRELIMINARY_SUBMITTED,
        team: { videoStatus: 'UPLOADED' } as Application['team'],
      }),
    ];
    const queue = buildAdminActionQueue(apps, [{ status: 'UNREAD' }]);
    expect(queue.map((q) => q.id).sort()).toEqual(
      ['pending-approval', 'unassigned-video', 'unread-inbox'].sort()
    );
    expect(queue.every((q) => q.count > 0)).toBe(true);
  });

  test('trendCountsLast30Days only recent', () => {
    const now = new Date('2026-07-17T12:00:00.000Z');
    const data = trendCountsLast30Days(
      [
        { submittedAt: '2026-07-10T10:00:00.000Z' },
        { submittedAt: '2026-07-10T11:00:00.000Z' },
        { submittedAt: '2026-05-01T10:00:00.000Z' },
        { submittedAt: '2026-07-15T10:00:00.000Z' },
      ],
      now
    );
    // two days with activity: 10th (2) and 15th (1)
    expect(data).toEqual([2, 1]);
  });
});
