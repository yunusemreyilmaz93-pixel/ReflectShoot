import * as XLSX from 'xlsx';
import { describe, expect, test } from 'vitest';

describe('xlsx export smoke', () => {
  test('writes a workbook that reads back with the same rows', () => {
    const sheet = XLSX.utils.json_to_sheet([{ Takım: 'A', Puan: 91.5 }, { Takım: 'B', Puan: 88 }]);
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, 'Takımlar');
    const bytes = XLSX.write(book, { type: 'array', bookType: 'xlsx' });
    const back = XLSX.read(bytes, { type: 'array' });
    expect(XLSX.utils.sheet_to_json(back.Sheets['Takımlar'])).toEqual([
      { Takım: 'A', Puan: 91.5 },
      { Takım: 'B', Puan: 88 },
    ]);
  });
});
