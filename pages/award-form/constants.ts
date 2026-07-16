export const DEADLINE = new Date('2026-05-11T13:00:00');

export const TRANSPORTATION_OPTIONS = [
  'Kendi imkânlarıyla',
  'Otobüs',
  'Tren',
  'Uçak',
  'Diğer',
];

export const SPECIAL_CONDITIONS = [
  'Yok',
  'Sağlık durumu',
  'Alerji',
  'Düzenli kullanılan ilaç',
  'Beslenme hassasiyeti',
  'Diğer',
];

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export const inputCls =
  'w-full bg-slate-800/60 border border-slate-700 focus:border-amber-500 focus:bg-slate-800 rounded-xl p-3.5 text-white outline-none transition-colors placeholder:text-slate-600 text-sm';
export const readonlyCls =
  'w-full bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 text-slate-400 text-sm cursor-not-allowed';
