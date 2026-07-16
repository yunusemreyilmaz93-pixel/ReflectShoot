import { describe, expect, test } from 'vitest';

/**
 * Smoke: jspdf import + minimal document construction after upgrade.
 * Does not assert visual PDF layout — only API surface still works.
 */
describe('jspdf smoke', () => {
  test('creates a document and outputs blob-compatible data', async () => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    doc.text('Reflect & Shoot smoke', 10, 10);
    const data = doc.output('arraybuffer');
    expect(data).toBeTruthy();
    expect((data as ArrayBuffer).byteLength).toBeGreaterThan(100);
  });
});
