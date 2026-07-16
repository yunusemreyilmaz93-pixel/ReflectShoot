import { describe, expect, test } from 'vitest';
import { renderLifecycleEmail } from '../../server/email.js';

describe('email templates', () => {
  test('ROLE_APPROVED has subject and body', () => {
    const m = renderLifecycleEmail('ROLE_APPROVED', { name: 'Ayşe', role: 'TEACHER' });
    expect(m.subject).toMatch(/onay/i);
    expect(m.html).toContain('Ayşe');
    expect(m.html).toContain('TEACHER');
  });

  test('DEADLINE_REMINDER includes team', () => {
    const m = renderLifecycleEmail('DEADLINE_REMINDER', {
      name: 'Ali',
      teamName: 'Işık',
      deadline: '2026-05-04',
    });
    expect(m.subject).toMatch(/hatırlat/i);
    expect(m.html).toContain('Işık');
  });

  test('ADMIN_DIGEST lists counts', () => {
    const m = renderLifecycleEmail('ADMIN_DIGEST', {
      date: '2026-07-17',
      totalApps: 12,
      pendingVideo: 3,
      archived: 1,
      seasonId: '2026',
      backupKey: 'backups/x.json',
    });
    expect(m.html).toContain('12');
    expect(m.html).toContain('backups/x.json');
  });

  test('unknown kind still returns payload html', () => {
    const m = renderLifecycleEmail('CUSTOM_X', { a: 1 });
    expect(m.subject).toContain('CUSTOM_X');
  });
});
