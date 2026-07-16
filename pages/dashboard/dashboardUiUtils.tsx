import React from 'react';
import { VERSE_SPLITTER } from '../../data/verses';

export function renderVerseText(text: string, isArabic: boolean): React.ReactNode {
  if (!text) return null;
  return text.split(VERSE_SPLITTER).map((part, index) => (
    <React.Fragment key={index}>
      {index > 0 && (
        <span
          className={`mx-2 inline-block ${
            isArabic ? 'text-amber-500 text-xl' : 'text-amber-500/50 text-xs'
          } select-none`}
        >
          {isArabic ? ' ۞ ' : ' ✦ '}
        </span>
      )}
      {part}
    </React.Fragment>
  ));
}

export const TEMPLATE_PARENT_URL =
  'https://assets.reflectandshoot.com/veli_izin_belgesi.pdf';
export const TEMPLATE_CONSENT_URL =
  'https://assets.reflectandshoot.com/acik_riza_metni.pdf';
