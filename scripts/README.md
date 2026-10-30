# Scripts

| Dosya | Amaç |
|-------|------|
| `split-admin.mjs` | `pages/Admin.tsx` → `pages/admin/*` (tek seferlik refactor) |
| `split-dashboard.mjs` | Dashboard widget ayırma |
| `fix-admin-imports.mjs` / `fix-admin-exports.mjs` | Split sonrası path/export düzeltme |

`scripts/ops-oneoffs/admin-list-winner-students.ts` Admin SDK ile çalışan, öğrenci kişisel verisi (telefon vb.) yazdıran manuel bir ops script’idir; yalnızca yetkili makinede, ADC/servis hesabıyla çalıştırın.
İstemci SDK + sabit kimlik bilgisiyle çalışan eski `markWinners.ts` / `retrieve_*.ts` script’leri güvenlik nedeniyle kaldırıldı (kazanan işaretleme Admin panelinden yapılır).
