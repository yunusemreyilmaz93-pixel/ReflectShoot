import fs from 'fs';
import path from 'path';

const dir = 'pages/admin';
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.tsx'))) {
  const p = path.join(dir, f);
  let c = fs.readFileSync(p, 'utf8');
  c = c
    .replaceAll("from '../types'", "from '../../types'")
    .replaceAll("from '../context/", "from '../../context/")
    .replaceAll("from '../components/", "from '../../components/")
    .replaceAll("from '../lib/", "from '../../lib/")
    .replaceAll('from "../types"', 'from "../../types"')
    .replaceAll('from "../context/', 'from "../../context/')
    .replaceAll('from "../components/', 'from "../../components/')
    .replaceAll('from "../lib/', 'from "../../lib/');
  fs.writeFileSync(p, c);
  console.log('fixed', f);
}
