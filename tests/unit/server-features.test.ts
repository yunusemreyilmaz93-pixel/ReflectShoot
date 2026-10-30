import { describe, expect, test } from 'vitest';
import { deleteObjectsByPrefix } from '../../server/r2.js';
import { validateClientLog } from '../../server/auditLogValidate.js';
import { toJuryView } from '../../server/juryView.js';
import { buildPublicScores } from '../../server/publicShowcase.js';

describe('deleteObjectsByPrefix', () => {
  function fakeClient(pages: string[][], deleteErrors = false) {
    const sent: any[] = [];
    let page = 0;
    return {
      sent,
      send: async (command: any) => {
        sent.push(command);
        const name = command.constructor.name;
        if (name === 'ListObjectsV2Command') {
          const keys = pages[page] || [];
          page += 1;
          return { Contents: keys.map((Key) => ({ Key })), IsTruncated: page < pages.length, NextContinuationToken: 't' };
        }
        return deleteErrors ? { Errors: [{ Key: 'x', Code: 'AccessDenied' }] } : {};
      },
    };
  }

  test('removes every page of objects under the prefix', async () => {
    const client = fakeClient([['teams/a/logo.png'], ['teams/a/students/s/docs/kvkk.pdf']]);
    await expect(deleteObjectsByPrefix(client, 'bucket', 'teams/a/')).resolves.toBe(2);
    const deletes = client.sent.filter((c) => c.constructor.name === 'DeleteObjectsCommand');
    expect(deletes).toHaveLength(2);
  });

  test('refuses unsafe prefixes and surfaces storage failures', async () => {
    await expect(deleteObjectsByPrefix(fakeClient([]), 'bucket', 'teams')).rejects.toThrow();
    await expect(deleteObjectsByPrefix(fakeClient([]), 'bucket', '/')).rejects.toThrow();
    await expect(deleteObjectsByPrefix(fakeClient([['teams/a/x.pdf']], true), 'bucket', 'teams/a/')).rejects.toThrow(/R2 delete failed/);
  });
});

describe('client audit log validation', () => {
  test('non-admins cannot record admin actions; identity is never taken from the body', () => {
    expect(() => validateClientLog({ action: 'UPDATE_STATUS', details: 'x' }, 'TEACHER')).toThrow();
    expect(() => validateClientLog({ action: 'DELETE_APP', details: 'x' }, 'ADMIN')).toThrow();
    expect(() => validateClientLog({ action: 'SUBMIT_SCORE', details: 'x' }, 'JUDGE')).toThrow();
    expect(validateClientLog({ action: 'CREATE_APP', details: 'ok' }, 'TEACHER').action).toBe('CREATE_APP');
    const entry = validateClientLog(
      { action: 'UPDATE_STATUS', details: 'ok', performedBy: 'evil@x.com', ip: '1.1.1.1', metadata: { a: 1 } },
      'ADMIN'
    );
    expect(entry).not.toHaveProperty('performedBy');
    expect(entry).not.toHaveProperty('ip');
  });

  test('rejects oversize details and non-object metadata', () => {
    expect(() => validateClientLog({ action: 'UPDATE_STATUS', details: 'x'.repeat(2001) }, 'ADMIN')).toThrow();
    expect(() => validateClientLog({ action: 'UPDATE_STATUS', details: 'x', metadata: 'str' }, 'ADMIN')).toThrow();
    expect(() => validateClientLog({ action: 'UPDATE_STATUS', details: 'x', metadata: { a: 'x'.repeat(3000) } }, 'ADMIN')).toThrow();
  });
});

describe('blind jury view', () => {
  test('contains no student or advisor personal data', () => {
    const view = toJuryView(
      {
        id: 'app1',
        data: () => ({
          teacher: { id: 't', fullName: 'Secret Teacher', email: 'a@b.com', phone: '555', school: 'School', city: 'City' },
          team: {
            name: 'Team',
            category: 'Canlı Çekim',
            theme: 'T',
            students: [{ firstName: 'Ada', lastName: 'Yılmaz', phone: '555' }],
            videoUrl: 'https://youtu.be/abc',
          },
          assignedJuryIds: ['j1', 'j2'],
          status: 'Onaylandı',
        }),
      },
      'j1'
    );
    const json = JSON.stringify(view);
    for (const secret of ['Secret Teacher', 'a@b.com', '555', 'School', 'Ada', 'Yılmaz', 'j2']) {
      expect(json).not.toContain(secret);
    }
    expect(view.team.name).toBe('Team');
    expect(view.assignedJuryIds).toEqual(['j1']);
  });
});

describe('public score aggregation', () => {
  test('drops drafts and recusals and never exposes jury identity or notes', () => {
    const scores = buildPublicScores([
      { juryId: 'j1', notes: 'private', total: 80, criteria: { story: 20, technical: 20, originality: 20, themeFit: 20 } },
      { juryId: 'j2', total: 90, isDraft: true, criteria: {} },
      { juryId: 'j3', total: 0, isRecused: true, criteria: {} },
    ]);
    expect(scores).toHaveLength(1);
    expect(JSON.stringify(scores)).not.toMatch(/j1|private/);
  });
});
