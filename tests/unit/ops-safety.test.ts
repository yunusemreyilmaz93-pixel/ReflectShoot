import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, test } from 'vitest';
import { isScorableStatus } from '../../server/juryScoreValidate.js';
import { sanitizeApplication, toPublicHttpsUrl } from '../../server/publicShowcase.js';
import { sanitizeApplicationForPublic } from '../../lib/domain/sanitizePublic';

describe('build and deploy safety', () => {
  test('npm lifecycle scripts never run destructive ops (build must work without production secrets)', () => {
    const { scripts } = JSON.parse(readFileSync(resolve('package.json'), 'utf8'));
    for (const [name, command] of Object.entries<string>(scripts)) {
      if (/^(pre|post)/.test(name) || name === 'build') {
        expect(command, `script "${name}"`).not.toMatch(/ops-oneoffs|--execute|CONFIRM_/);
      }
    }
  });

  test('API routes contain no hard-coded secrets or destructive GET endpoints', () => {
    const offenders: string[] = [];
    for (const file of readdirSync(resolve('api'))) {
      const content = readFileSync(join(resolve('api'), file), 'utf8');
      if (/(?:TOKEN|SECRET|PASSWORD)\s*=\s*['"][A-Za-z0-9_-]{16,}['"]/i.test(content)) offenders.push(file);
      if (/DeleteObjectsCommand|DeleteObjectCommand/.test(content)) offenders.push(file);
    }
    expect(offenders).toEqual([]);
    expect(existsSync(resolve('api/internal-purge-legacy-certificates.js'))).toBe(false);
  });
});

describe('Vercel plan limits', () => {
  test('api/ stays within the Hobby plan limit of 12 serverless functions', () => {
    // Every file under api/ becomes a function; a 13th makes the whole production deploy fail.
    const files = readdirSync(resolve('api')).filter((file) => /\.(js|mjs|ts)$/.test(file));
    expect(files.length).toBeLessThanOrEqual(12);
  });
});

describe('jury scoring eligibility', () => {
  test('excluded applications cannot be scored back into the public showcase', () => {
    expect(isScorableStatus('Reddedildi')).toBe(false);
    expect(isScorableStatus('Diskalifiye')).toBe(false);
    for (const status of ['Onaylandı', 'Değerlendiriliyor', 'Puanlandı', 'Video İnceleniyor']) {
      expect(isScorableStatus(status)).toBe(true);
    }
  });
});

describe('public showcase URL hygiene', () => {
  test('only https URLs survive', () => {
    expect(toPublicHttpsUrl(' https://youtu.be/abc ')).toBe('https://youtu.be/abc');
    for (const bad of ['javascript:alert(1)', 'data:text/html,x', 'http://example.com/a.png', '//evil.com/x', '', null, 42]) {
      expect(toPublicHttpsUrl(bad)).toBeNull();
    }
  });

  test('server and domain projections agree and drop unsafe URLs', () => {
    const snapshot = {
      id: 'app1',
      data: () => ({
        teacher: { id: 'u1', fullName: 'Secret', email: 'a@b.com', phone: '555', school: 'S', city: 'C' },
        team: { name: 'Team', logoUrl: 'javascript:alert(1)', videoUrl: 'https://youtu.be/abc', students: [{ firstName: 'Ada' }] },
        status: 'Onaylandı',
      }),
    };
    const server = sanitizeApplication(snapshot);
    expect(server.team.logoUrl).toBeNull();
    expect(server.team.videoUrl).toBe('https://youtu.be/abc');
    expect(server.team.students).toEqual([]);
    expect(server.teacher.email).toBe('');
    expect(sanitizeApplicationForPublic(snapshot)).toEqual(server);
  });
});
