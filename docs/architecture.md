# Mimari harita

## İstemci

```
App.tsx                 HashRouter, ProtectedRoute, toast, bakım modu
context/
  AppContext.tsx        Facade provider (useAppContext API değişmedi)
  appContextTypes.ts    Context tipi
  defaults.ts           System/CMS varsayılanları
  hooks/useToasts.ts
pages/
  admin/                Admin panel section’ları (shell: AdminPage.tsx)
  dashboard/
    DashboardWidgets.tsx
    DashboardUIContext.tsx
    tabs/*              STATUS / ACADEMY / DOCUMENTS / VIDEO / CHAT
  *.tsx                 Public + role sayfaları
lib/
  domain/               Pure iş kuralları (test edilebilir)
  sanitize.ts           Firestore undefined temizliği
  cloudStorage.ts       R2 presigned upload
  authenticatedFetch.ts Bearer ID token
api/                    Vercel serverless (jury-score, jury-applications, public-showcase, upload, admin-delete-*, log, …)
server/
  auth.js, firebaseAdmin.js, r2.js
  juryScoreValidate.js  Pure jüri payload / ortalama
  auditLog*.js          Sunucu taraflı denetim kaydı
  publicShowcase.js, juryView.js  Kişisel veriden arındırılmış projeksiyonlar
```

## Veri sınırları

| Koleksiyon | Okuma | Yazma |
|------------|-------|-------|
| applications | owner / admin (jüri: `/api/jury-applications`, kişisel veri yok) | owner (kısıtlı alan) veya admin; silme **yalnızca API** |
| applications/*/scores | admin / kendi jüri | **yalnızca API** |
| public_scores | — | **yalnızca API** (vitrin için anonim puanlar) |
| logs | admin | **yalnızca API** |
| cms_* / system | herkese açık okuma | admin |
| users | self / admin | self (rol değişmez) / admin |

## Domain ↔ API

- `lib/domain/scoring.ts` ↔ `api/jury-score.js` ortalama formülü
- `lib/domain/sanitizePublic.ts` ↔ `api/public-showcase.js` PII strip
- `lib/domain/teamValidation.ts` ↔ firestore.rules takım adı / YouTube regex

## Test katmanları

1. `tests/unit` — domain pure
2. `tests/firestore.rules.test.ts` — güvenlik sınırı
3. `tests/visual` — public sayfa snapshot (kimlik koruması)
4. `react-doctor` — React anti-pattern / a11y / perf skoru
