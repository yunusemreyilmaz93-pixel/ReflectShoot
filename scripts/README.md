# Scripts

| Dosya | Amaç |
|-------|------|
| `split-admin.mjs` | `pages/Admin.tsx` → `pages/admin/*` (tek seferlik refactor) |
| `split-dashboard.mjs` | Dashboard widget ayırma |
| `fix-admin-imports.mjs` / `fix-admin-exports.mjs` | Split sonrası path/export düzeltme |

Root’taki `markWinners.ts`, `retrieve_*.ts`, `admin_retrieve_students.ts` ops script’leridir; Vite entry’ye bağlı değildir. İleride buraya taşınabilir.
