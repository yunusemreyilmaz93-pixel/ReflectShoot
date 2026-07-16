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
api/                    Vercel serverless (jury-score, public-vote, upload, …)
server/
  auth.js, firebaseAdmin.js, r2.js
  juryScoreValidate.js  Pure jüri payload / ortalama
  publicVoteValidate.js Pure oy doğrulama / rate limit
```

## Veri sınırları

| Koleksiyon | Okuma | Yazma |
|------------|-------|-------|
| applications | owner / assigned jury / admin | owner (kısıtlı alan) veya admin |
| applications/*/scores | admin / kendi jüri | **yalnızca API** |
| public_votes | — | **yalnızca API** |
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
