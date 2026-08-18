import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, test } from 'vitest';

const SOURCE_ROOTS = ['pages', 'components', 'lib', 'data', 'context', 'api', 'server'];
const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.mjs']);
const PUBLIC_CERTIFICATE_PREFIX = 'assets.reflectandshoot.com/certificates/';

function sourceFiles(dir: string): string[] {
  const absolute = resolve(dir);
  const files: string[] = [];

  for (const entry of readdirSync(absolute)) {
    const path = join(absolute, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      files.push(...sourceFiles(path));
      continue;
    }

    const extension = entry.slice(entry.lastIndexOf('.'));
    if (SOURCE_EXTENSIONS.has(extension)) files.push(path);
  }

  return files;
}

describe('certificate privacy boundary', () => {
  test('production source does not expose direct public certificate asset URLs', () => {
    const offenders: string[] = [];

    for (const root of SOURCE_ROOTS) {
      for (const file of sourceFiles(root)) {
        const content = readFileSync(file, 'utf8');
        if (content.includes(PUBLIC_CERTIFICATE_PREFIX)) {
          offenders.push(file.replace(`${process.cwd()}/`, ''));
        }
      }
    }

    expect(offenders).toEqual([]);
  });

  test('legacy 2026 compatibility module cannot derive recipient certificate URLs', () => {
    const legacy = readFileSync(resolve('data/certificates_2026.ts'), 'utf8');

    expect(legacy).not.toContain('toTeamSlug');
    expect(legacy).not.toContain('toPascalUnderscore');
    expect(legacy).not.toContain('toSnakeCase');
    expect(legacy).toContain('return null');
  });
});
