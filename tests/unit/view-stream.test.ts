import { Readable } from 'node:stream';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { describe, expect, test, vi } from 'vitest';

const size = 6 * 1024 * 1024; // larger than a buffered serverless response may be
vi.mock('../../server/auth.js', () => ({
  requireUser: async () => ({ uid: 'u', role: 'ADMIN' }),
  noStore: () => undefined,
  sendError: (res: any) => res.status(500).json({}),
}));
vi.mock('../../server/r2.js', () => ({
  authorizePrivateViewKey: async (key: string) => key,
  getPrivateBucketName: () => 'bucket',
  createR2Client: () => ({
    send: async () => ({ Body: Readable.from([Buffer.alloc(size, 1)]), ContentType: 'application/pdf', ContentLength: size }),
  }),
}));

describe('api/view raw proxy', () => {
  test('streams large private files with the right headers', async () => {
    const { default: handler } = await import('../../api/view.js');
    const server = createServer((req, res) => {
      const patched = res as any;
      patched.status = (code: number) => ((res.statusCode = code), patched);
      patched.json = (body: unknown) => res.end(JSON.stringify(body));
      (req as any).query = { key: 'certificates/attendance_template.pdf', raw: '1' };
      (req as any).method = 'GET';
      void handler(req, patched);
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const { port } = server.address() as AddressInfo;
    const response = await fetch(`http://127.0.0.1:${port}/`);
    const body = await response.arrayBuffer();
    server.close();

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('application/pdf');
    expect(body.byteLength).toBe(size);
  });
});
