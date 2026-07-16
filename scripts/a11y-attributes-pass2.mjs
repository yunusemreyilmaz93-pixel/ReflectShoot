import fs from 'fs';
import path from 'path';

function walk(d, a = []) {
  if (!fs.existsSync(d)) return a;
  for (const e of fs.readdirSync(d)) {
    const p = path.join(d, e);
    if (e === 'node_modules' || e === 'dist') continue;
    const s = fs.statSync(p);
    if (s.isDirectory()) walk(p, a);
    else if (/\.tsx$/.test(e)) a.push(p);
  }
  return a;
}

let iframeCount = 0;
let xCount = 0;
let trashCount = 0;

for (const f of walk('pages').concat(walk('components'))) {
  let c = fs.readFileSync(f, 'utf8');
  const before = c;

  c = c.replace(/<iframe(?![^>]*\btitle=)(\s+)/g, (m, sp) => {
    iframeCount++;
    return `<iframe${sp}title="Video önizleme" `;
  });
  c = c.replace(/<iframe(?![^>]*\btitle=)>/g, () => {
    iframeCount++;
    return '<iframe title="Video önizleme">';
  });

  c = c.replace(/<button([^>]*?)>(\s*)<X\s+size=\{(\d+)\}([^/]*?)\/>/g, (m, attrs, ws, size, rest) => {
    if (/aria-label\s*=/.test(attrs)) return m;
    xCount++;
    return `<button${attrs.trimEnd()} aria-label="Kapat">${ws}<X size={${size}}${rest}/>`;
  });

  c = c.replace(/<button([^>]*?)>(\s*)<Trash2\s+size=\{(\d+)\}([^/]*?)\/>/g, (m, attrs, ws, size, rest) => {
    if (/aria-label\s*=/.test(attrs)) return m;
    trashCount++;
    return `<button${attrs.trimEnd()} aria-label="Sil">${ws}<Trash2 size={${size}}${rest}/>`;
  });

  if (c !== before) {
    fs.writeFileSync(f, c);
    console.log('updated', f);
  }
}

console.log({ iframeCount, xCount, trashCount });
