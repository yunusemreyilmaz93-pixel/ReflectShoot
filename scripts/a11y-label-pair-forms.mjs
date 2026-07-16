/**
 * Pair common form label+control patterns in selected pages (htmlFor/id only).
 */
import fs from 'fs';

function pairLooseLabels(src, prefix) {
  let n = 0;
  // <label className="block ..."> or similar ending with >TEXT</label> then optional wrapper then input
  // Simpler: label with any className, then nearby input without id
  return src.replace(
    /<label([^>]*)>([^<]+)<\/label>\s*\n(\s*)(?:<div[^>]*>\s*\n(?:\s*<div[^>]*>[\s\S]*?<\/div>\s*\n)?\s*)?<(input|select|textarea)(?![^>]*\bid=)(\s)/g,
    (match, labelAttrs, text, indent, tag, space) => {
      if (/htmlFor=/.test(labelAttrs) || /for=/.test(labelAttrs)) return match;
      n++;
      const id = `${prefix}-${n}`;
      // If match is too complex and failed, leave it
      return match; // too risky for nested cases
    }
  );
}

// Manual targeted replacements for known form pages using simple sibling pattern
const targets = [
  {
    file: 'pages/Apply.tsx',
    // use pair for label-text style if any, else block labels
    patterns: [],
  },
];

// Generic: label className contains block or font-bold, immediately followed by input in next meaningful tag at same depth is hard.
// Safer approach for Apply/FAQ/Dashboard create: id on inputs that have name= and label htmlFor matching name

function linkLabelToName(src) {
  // <label ...>X</label> ... <input name="foo"  without id -> if label text nearby, skip
  // For inputs with name= but no id, set id=name and preceding label htmlFor=name if missing
  return src.replace(
    /<label(?![^>]*htmlFor=)([^>]*)>\s*([^<]+?)\s*<\/label>([\s\S]{0,400}?)<(input|select|textarea)([^>]*\bname="([^"]+)")([^>]*)>/g,
    (match, labelRest, labelText, middle, tag, nameAttr, name, rest) => {
      if (/\bid=/.test(nameAttr + rest)) return match;
      // only if no other id in middle that would confuse
      return `<label htmlFor="${name}"${labelRest}>${labelText}</label>${middle}<${tag}${nameAttr} id="${name}"${rest}>`;
    }
  );
}

const files = [
  'pages/Apply.tsx',
  'pages/FAQ.tsx',
  'pages/Dashboard.tsx',
  'pages/admin/AdminAnnouncementsSection.tsx',
  'pages/JuryDashboard.tsx',
];

for (const f of files) {
  if (!fs.existsSync(f)) continue;
  let c = fs.readFileSync(f, 'utf8');
  const next = linkLabelToName(c);
  if (next !== c) {
    fs.writeFileSync(f, next);
    console.log('linked labels', f);
  } else {
    console.log('no change', f);
  }
}
