import { describe, expect, test, vi } from 'vitest';

vi.mock('../../server/auth.js', async () => {
  const actual = await vi.importActual<any>('../../server/auth.js');
  return { ...actual, requireUser: async () => ({ uid: 'admin-uid', role: 'ADMIN', email: 'a@b.com' }), noStore: () => undefined };
});
vi.mock('../../server/firebaseAdmin.js', () => ({ getAdminServices: () => ({ auth: {}, db: {} }) }));

function call(body: unknown, method = 'POST') {
  return import('../../api/admin-delete.js').then(async ({ default: handler }) => {
    const result: { status?: number; json?: any } = {};
    const res: any = {
      setHeader: () => undefined,
      status: (code: number) => ((result.status = code), res),
      json: (payload: unknown) => ((result.json = payload), res),
    };
    await handler({ method, body, headers: {} }, res);
    return result;
  });
}

describe('api/admin-delete input handling', () => {
  test('requires exactly one valid target', async () => {
    expect((await call({})).json.code).toBe('invalid_delete_target');
    expect((await call({ appId: 'a', uid: 'b' })).json.code).toBe('invalid_delete_target');
    expect((await call({ appId: '../x' })).json.code).toBe('invalid_application_id');
    expect((await call({ uid: 'x' })).json.code).toBe('invalid_uid');
  });

  test('an admin cannot delete their own account; non-POST is rejected', async () => {
    expect((await call({ uid: 'admin-uid' })).json.code).toBe('cannot_delete_self');
    expect((await call({}, 'GET')).status).toBe(405);
  });
});
