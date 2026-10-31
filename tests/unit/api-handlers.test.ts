import { beforeEach, describe, expect, test, vi } from 'vitest';
import { createFakeDb, createRes } from './helpers/fakeDb';

// ---- shared mocks ---------------------------------------------------------------------------
let currentUser: { uid: string; role: string; email: string; profile: Record<string, any> } | null = null;
let db: ReturnType<typeof createFakeDb>;
const rateLimit = vi.fn(async () => undefined);

vi.mock('../../server/auth.js', async () => {
  const actual = await vi.importActual<any>('../../server/auth.js');
  return {
    ...actual,
    noStore: () => undefined,
    requireUser: async (_req: unknown, options: { roles?: string[] } = {}) => {
      if (!currentUser) throw new actual.HttpError(401, 'login', 'authentication_required');
      if (options.roles?.length && !options.roles.includes(currentUser.role)) {
        throw new actual.HttpError(403, 'role', 'insufficient_role');
      }
      return currentUser;
    },
  };
});
vi.mock('../../server/firebaseAdmin.js', () => ({ getAdminServices: () => ({ db, auth: {} }) }));
vi.mock('../../server/rateLimit.js', async () => {
  const actual = await vi.importActual<any>('../../server/rateLimit.js');
  return { ...actual, enforceRateLimit: rateLimit };
});
vi.mock('@aws-sdk/s3-request-presigner', () => ({ getSignedUrl: async () => 'https://signed.example/put' }));

const as = (role: string, uid = 'u1') => {
  currentUser = { uid, role, email: `${uid}@example.com`, profile: { fullName: 'Kişi' } };
};
const call = async (file: string, req: Record<string, any>) => {
  const { default: handler } = await import(file);
  const res = createRes();
  await handler({ headers: { 'user-agent': 'vitest', 'x-forwarded-for': '203.0.113.9' }, ...req }, res);
  return res;
};

const app = (extra: Record<string, any> = {}) => ({
  id: 'app1',
  teacher: { id: 'teacher1', fullName: 'Gizli Öğretmen', email: 't@example.com', phone: '555', school: 'Okul', city: 'Konya' },
  team: { id: 'app1', name: 'Takım', category: 'Yapay Zeka Animasyon', theme: 'Asr ve Beled Sureleri', students: [{ id: 's1', firstName: 'Ada', lastName: 'Y.' }], videoUrl: 'https://youtu.be/abc' },
  status: 'Onaylandı',
  assignedJuryIds: ['judge1'],
  ...extra,
});

beforeEach(() => {
  currentUser = null;
  rateLimit.mockClear();
  process.env.R2_ACCOUNT_ID = 'acc';
  process.env.R2_ACCESS_KEY_ID = 'key';
  process.env.R2_SECRET_ACCESS_KEY = 'secret';
  process.env.R2_PRIVATE_BUCKET_NAME = 'private';
  process.env.R2_PUBLIC_BUCKET_NAME = 'public';
});

// ---- jury-score ------------------------------------------------------------------------------
const criteria = { story: 20, technical: 20, originality: 20, themeFit: 20 };

describe('api/jury-score', () => {
  test('only assigned judges can score', async () => {
    db = createFakeDb({ 'applications/app1': app({ assignedJuryIds: ['someone-else'] }) });
    as('JUDGE', 'judge1');
    const res = await call('../../api/jury-score.js', { method: 'POST', body: { appId: 'app1', criteria } });
    expect(res.statusCode).toBe(403);
    expect(res.body.code).toBe('jury_not_assigned');
  });

  test('a disqualified work cannot be scored back into the showcase', async () => {
    db = createFakeDb({ 'applications/app1': app({ status: 'Diskalifiye' }) });
    as('JUDGE', 'judge1');
    const res = await call('../../api/jury-score.js', { method: 'POST', body: { appId: 'app1', criteria } });
    expect(res.statusCode).toBe(409);
    expect(db.store.get('applications/app1')!.status).toBe('Diskalifiye');
    expect(db.store.has('public_scores/app1')).toBe(false);
  });

  test('a final score updates the application, the anonymous aggregate and the audit log', async () => {
    db = createFakeDb({ 'applications/app1': app() });
    as('JUDGE', 'judge1');
    const res = await call('../../api/jury-score.js', { method: 'POST', body: { appId: 'app1', criteria, notes: 'iyi' } });
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({ total: 80, finalScore: 80, juryCount: 1 });
    expect(db.store.get('applications/app1')!.status).toBe('Puanlandı');
    const publicScores = db.store.get('public_scores/app1')!;
    expect(publicScores.scores).toHaveLength(1);
    expect(JSON.stringify(publicScores)).not.toMatch(/judge1|iyi/);
    const log = [...db.store.entries()].find(([path]) => path.startsWith('logs/'))?.[1];
    expect(log).toMatchObject({ action: 'SUBMIT_SCORE', performedByUid: 'judge1', ip: '203.0.113.9' });
  });

  test('a draft saves the score without publishing or logging', async () => {
    db = createFakeDb({ 'applications/app1': app() });
    as('JUDGE', 'judge1');
    const res = await call('../../api/jury-score.js', { method: 'POST', body: { appId: 'app1', criteria, isDraft: true } });
    expect(res.statusCode).toBe(200);
    expect(db.store.get('applications/app1')!.status).toBe('Onaylandı');
    expect([...db.store.keys()].some((path) => path.startsWith('logs/'))).toBe(false);
  });

  test('GET returns the blind view only for the judge', async () => {
    db = createFakeDb({ 'applications/app1': app(), 'applications/app2': app({ id: 'app2', assignedJuryIds: ['other'] }) });
    as('JUDGE', 'judge1');
    const res = await call('../../api/jury-score.js', { method: 'GET' });
    expect(res.body.applications).toHaveLength(1);
    expect(JSON.stringify(res.body)).not.toMatch(/Gizli Öğretmen|t@example\.com|555|Ada/);
    as('TEACHER', 'teacher1');
    expect((await call('../../api/jury-score.js', { method: 'GET' })).statusCode).toBe(403);
  });
});

// ---- log -------------------------------------------------------------------------------------
describe('api/log', () => {
  test('identity, ip and time come from the server and the role limits the actions', async () => {
    db = createFakeDb();
    as('ADMIN', 'admin1');
    const ok = await call('../../api/log.js', {
      method: 'POST',
      body: { action: 'UPDATE_STATUS', details: 'x', performedBy: 'evil@example.com', ip: '1.1.1.1' },
    });
    expect(ok.statusCode).toBe(201);
    const [, entry] = [...db.store.entries()].find(([path]) => path.startsWith('logs/'))!;
    expect(entry).toMatchObject({ performedBy: 'admin1@example.com', performedByUid: 'admin1', ip: '203.0.113.9' });
    expect(rateLimit).toHaveBeenCalledWith(db, expect.objectContaining({ scope: 'log', key: 'admin1' }));

    as('TEACHER', 'teacher1');
    const forbidden = await call('../../api/log.js', { method: 'POST', body: { action: 'UPDATE_STATUS', details: 'x' } });
    expect(forbidden.statusCode).toBe(403);
  });
});

// ---- upload ----------------------------------------------------------------------------------
describe('api/upload', () => {
  const body = (key: string) => ({ contentType: 'application/pdf', fileSize: 1000, customKey: key });

  test('a teacher can sign uploads only for their own team and the request is rate limited', async () => {
    db = createFakeDb({ 'applications/app1': app({ teacher: { id: 'teacher1' } }) });
    as('TEACHER', 'teacher1');
    const own = await call('../../api/upload.js', { method: 'POST', body: body('teams/app1/students/s1/docs/parent.pdf') });
    expect(own.statusCode).toBe(200);
    expect(own.body.fileKey).toBe('teams/app1/students/s1/docs/parent.pdf');
    expect(rateLimit).toHaveBeenCalledWith(db, expect.objectContaining({ scope: 'upload', key: 'teacher1' }));

    as('TEACHER', 'teacher2');
    const other = await call('../../api/upload.js', { method: 'POST', body: body('teams/app1/students/s1/docs/parent.pdf') });
    expect(other.statusCode).toBe(403);
  });

  test('rejects other content types and unsafe keys; templates are admin-only', async () => {
    db = createFakeDb({ 'applications/app1': app({ teacher: { id: 'teacher1' } }) });
    as('TEACHER', 'teacher1');
    const wrongType = await call('../../api/upload.js', { method: 'POST', body: { ...body('teams/app1/students/s1/docs/kvkk.pdf'), contentType: 'text/html' } });
    expect(wrongType.statusCode).toBe(400);
    const traversal = await call('../../api/upload.js', { method: 'POST', body: body('teams/../secrets/x.pdf') });
    expect(traversal.statusCode).toBe(400);
    const template = await call('../../api/upload.js', { method: 'POST', body: body('certificates/attendance_template.pdf') });
    expect(template.statusCode).toBe(403);
  });
});

// ---- admin-user-role -------------------------------------------------------------------------
describe('api/admin-user-role', () => {
  test('admins cannot demote themselves; others cannot call it', async () => {
    db = createFakeDb({ 'users/admin1': { role: 'ADMIN', email: 'admin1@example.com' }, 'users/user2x': { role: 'STUDENT', email: 'u@example.com' } });
    as('ADMIN', 'admin1');
    const self = await call('../../api/admin-user-role.js', { method: 'POST', body: { uid: 'admin1', role: 'TEACHER' } });
    expect(self.body.code).toBe('cannot_demote_self');
    const ok = await call('../../api/admin-user-role.js', { method: 'POST', body: { uid: 'user2x', role: 'JUDGE' } });
    expect(ok.statusCode).toBe(200);
    expect(db.store.get('users/user2x')!.role).toBe('JUDGE');
    as('TEACHER', 'teacher1');
    expect((await call('../../api/admin-user-role.js', { method: 'POST', body: { uid: 'user2x', role: 'ADMIN' } })).statusCode).toBe(403);
  });
});
