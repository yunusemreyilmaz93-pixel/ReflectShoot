/**
 * Attribute-only a11y: aria-label, htmlFor/id, iframe title, input aria-label.
 * Never touches className, style, layout, or visible text content of labels.
 */
import fs from 'fs';
import path from 'path';

function read(p) {
  return fs.readFileSync(p, 'utf8');
}
function write(p, c) {
  fs.writeFileSync(p, c);
  console.log('updated', p);
}

// --- Footer social links ---
{
  const p = 'components/Footer.tsx';
  let c = read(p);
  c = c
    .replace(
      /\{cmsGeneral\.socialInstagram !== '#' && <a href=\{cmsGeneral\.socialInstagram\} target="_blank" rel="noreferrer" className="hover:text-teal-400 transition-colors"><Instagram size=\{24\} \/><\/a>\}/,
      `{cmsGeneral.socialInstagram !== '#' && <a href={cmsGeneral.socialInstagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="hover:text-teal-400 transition-colors"><Instagram size={24} /></a>}`
    )
    .replace(
      /\{cmsGeneral\.socialTwitter !== '#' && <a href=\{cmsGeneral\.socialTwitter\} target="_blank" rel="noreferrer" className="hover:text-teal-400 transition-colors"><Twitter size=\{24\} \/><\/a>\}/,
      `{cmsGeneral.socialTwitter !== '#' && <a href={cmsGeneral.socialTwitter} target="_blank" rel="noreferrer" aria-label="Twitter" className="hover:text-teal-400 transition-colors"><Twitter size={24} /></a>}`
    )
    .replace(
      /\{cmsGeneral\.socialYoutube !== '#' && <a href=\{cmsGeneral\.socialYoutube\} target="_blank" rel="noreferrer" className="hover:text-teal-400 transition-colors"><Youtube size=\{24\} \/><\/a>\}/,
      `{cmsGeneral.socialYoutube !== '#' && <a href={cmsGeneral.socialYoutube} target="_blank" rel="noreferrer" aria-label="YouTube" className="hover:text-teal-400 transition-colors"><Youtube size={24} /></a>}`
    );
  write(p, c);
}

// --- Navbar mobile menu ---
{
  const p = 'components/Navbar.tsx';
  let c = read(p);
  if (!c.includes('aria-label="Menü"') && !c.includes("aria-label={isOpen")) {
    c = c.replace(
      /<button type="button"\s*\n\s*onClick=\{\(\) => setIsOpen\(!isOpen\)\}\s*\n\s*className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-white\/10 focus:outline-none transition-colors"\s*\n\s*>/,
      `<button type="button"
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? 'Menüyü kapat' : 'Menüyü aç'}
              aria-expanded={isOpen}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-white/10 focus:outline-none transition-colors"
            >`
    );
    write(p, c);
  }
}

// --- Notification bell ---
{
  const p = 'components/NotificationBell.tsx';
  let c = read(p);
  if (!c.includes('aria-label="Bildirimler"')) {
    c = c.replace(
      /<button type="button"\s*\n\s*onClick=\{\(\) => setIsOpen\(!isOpen\)\}\s*\n\s*className="relative p-2 text-slate-300 hover:text-white hover:bg-white\/10 rounded-full transition-colors"\s*\n\s*>/,
      `<button type="button" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Bildirimler"
        aria-expanded={isOpen}
        className="relative p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-colors"
      >`
    );
    write(p, c);
  }
}

// --- ChatArea ---
{
  const p = 'components/ChatArea.tsx';
  let c = read(p);
  if (!c.includes('aria-label="Mesaj"')) {
    c = c.replace(
      /placeholder="Mesajınızı yazın\.\.\."\s*\n\s*className=\{`flex-1 border rounded-xl/,
      `placeholder="Mesajınızı yazın..."
                aria-label="Mesaj"
                className={\`flex-1 border rounded-xl`
    );
  }
  if (!c.includes('aria-label="Gönder"')) {
    c = c.replace(
      /<button type="submit" className="bg-rose-600 hover:bg-rose-500 text-white p-4 rounded-xl/,
      `<button type="submit" aria-label="Gönder" className="bg-rose-600 hover:bg-rose-500 text-white p-4 rounded-xl`
    );
  }
  write(p, c);
}

/**
 * Pair sibling label + control in a div:
 *   <label className="label-text">TEXT</label>
 *   <input ... />  OR select OR textarea
 * -> htmlFor + id with stable prefix
 */
function pairLabelControls(src, idPrefix) {
  let counter = 0;
  // Match: label then whitespace then input/select/textarea without id
  return src.replace(
    /<label className="label-text">([^<]*)<\/label>\s*\n(\s*)<(input|select|textarea)(\s)/g,
    (match, labelText, indent, tag, space) => {
      counter++;
      const id = `${idPrefix}-${counter}`;
      return `<label className="label-text" htmlFor="${id}">${labelText}</label>\n${indent}<${tag}${space}id="${id}" `;
    }
  );
}

// CMS tabs
const cmsFiles = [
  ['components/admin/cms/CMSGeneralTab.tsx', 'cms-general'],
  ['components/admin/cms/CMSFaqTab.tsx', 'cms-faq'],
  ['components/admin/cms/CMSAcademyTab.tsx', 'cms-academy'],
  ['components/admin/cms/CMSGalleryTab.tsx', 'cms-gallery'],
  ['components/admin/cms/CMSPrizesTab.tsx', 'cms-prizes'],
  ['components/admin/cms/CMSTimelineTab.tsx', 'cms-timeline'],
];

for (const [file, prefix] of cmsFiles) {
  if (!fs.existsSync(file)) continue;
  let c = read(file);
  const next = pairLabelControls(c, prefix);
  if (next !== c) write(file, next);
}

// iframes missing title
function addIframeTitles(file) {
  if (!fs.existsSync(file)) return;
  let c = read(file);
  const before = c;
  // <iframe ... > without title=
  c = c.replace(/<iframe(\s)(?![^>]*\btitle=)/g, '<iframe$1title="Video önizleme" ');
  if (c !== before) write(file, c);
}

const allTsx = [];
function walk(dir) {
  for (const e of fs.readdirSync(dir)) {
    const p = path.join(dir, e);
    if (e === 'node_modules' || e === 'dist') continue;
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p);
    else if (/\.tsx$/.test(e)) allTsx.push(p);
  }
}
walk('pages');
walk('components');
for (const f of allTsx) addIframeTitles(f);

console.log('done attribute-only pass');
