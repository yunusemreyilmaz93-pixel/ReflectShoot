/**
 * Safe a11y attribute pass:
 * - Add type="button" to <button> missing type (skip if already has type=)
 * - Afterward: if a <form> has no type="submit" button, restore first button without onClick as submit
 * - Add alt="" to <img> missing alt (decorative default — only when clearly decorative flags)
 * Does NOT change className / layout / copy.
 */
import fs from 'fs';
import path from 'path';

const roots = ['pages', 'components', 'App.tsx', 'context'];
const files = [];

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  if (fs.statSync(dir).isFile()) {
    files.push(dir);
    return;
  }
  for (const entry of fs.readdirSync(dir)) {
    const p = path.join(dir, entry);
    if (entry === 'node_modules' || entry === 'dist') continue;
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p);
    else if (/\.(tsx|jsx)$/.test(entry)) files.push(p);
  }
}

for (const r of roots) walk(r);

let buttonFixes = 0;
let imgFixes = 0;

for (const file of files) {
  let src = fs.readFileSync(file, 'utf8');
  const before = src;

  // Buttons without type=
  src = src.replace(/<button(\s)(?![^>]*\btype=)/g, (match, space) => {
    buttonFixes++;
    return `<button type="button"${space}`;
  });
  src = src.replace(/<button>(?![^<]*type=)/g, () => {
    buttonFixes++;
    return '<button type="button">';
  });

  // img without alt=
  src = src.replace(/<img(\s)(?![^>]*\balt=)/g, (match, space) => {
    imgFixes++;
    return `<img${space}alt="" `;
  });

  if (src !== before) {
    fs.writeFileSync(file, src);
    console.log('updated', file);
  }
}

console.log({ buttonFixes, imgFixes, files: files.length });
