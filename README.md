# Reflect & Shoot

Öğrenci kısa film yarışması platformu: başvuru, belge yükleme, jüri puanlama, finalist vitrini, CMS, sertifika ve ödül katılım formu.

**Stack:** React 18 · TypeScript · Vite · Firebase Auth/Firestore · Cloudflare R2 · Vercel serverless API

## Roller

| Rol | Ne yapar |
|-----|----------|
| **TEACHER / STUDENT** | Takım başvurusu, belge, video teslimi, panel sohbeti |
| **JUDGE** | Atanmış eserlere 4×25 kriter puanı (sunucu transaction) |
| **ADMIN** | Onay, jüri atama, CMS, ödül, sertifika, sistem bayrakları |
| **PENDING_TEACHER** | Kayıt sonrası admin onayı bekler |

## Yerel geliştirme

```bash
npm install
# .env.local içinde VITE_FIREBASE_* değişkenleri
npm run dev
```

### Temel komutlar

| Komut | Açıklama |
|-------|----------|
| `npm run dev` | Vite geliştirme sunucusu |
| `npm run build` | Production build |
| `npm run lint` | TypeScript (`tsc --noEmit`) |
| `npm run check` | lint + build |
| `npm run test:unit` | Domain + API validation birim testleri |
| `npm run test:e2e` | Functional smoke (screenshot yok) |
| `npm run test:rules` | Firestore rules (emulator) |
| `npm run test:visual` | Playwright görsel regresyon |
| `npm run ci` / `npm run verify` | lint + unit + build + e2e |
| `npm run doctor` | React Doctor tarama |
| `npm run doctor:score` | Sadece sağlık skoru |

## Ortam değişkenleri

**İstemci (`VITE_*`):** Firebase web config, isteğe bağlı Sentry DSN.

**Sunucu (Vercel / API — asla `VITE_` ile istemciye koyma):**

- `FIREBASE_SERVICE_ACCOUNT_JSON` veya `FIREBASE_PROJECT_ID` + `FIREBASE_CLIENT_EMAIL` + `FIREBASE_PRIVATE_KEY`
- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`
- `R2_PRIVATE_BUCKET_NAME`, `R2_PUBLIC_BUCKET_NAME`
- `CONTACT_HASH_SALT` (≥32 karakter; eski adı `VOTE_HASH_SALT` de kabul edilir)

Ayrıntı: [docs/security-deployment.md](docs/security-deployment.md)

## Dağıtım sırası

1. Env’leri Vercel Production/Preview/Development’a yaz
2. `npm run check` (+ mümkünse `test:rules`, `test:visual`, `doctor`)
3. `firebase deploy --only firestore:rules`
4. Uygulamayı yayınla; smoke: belge yükleme, jüri puan, özel dosya görüntüleme

## Mimari notlar

- **Güvenlik:** Jüri puanı, silme işlemleri ve denetim kayıtları yalnızca sunucu API; jüri öğrenci/danışman kişisel verisini görmez. Firestore client write kapalı. Public showcase PII strip.
- **Depolama:** Özel belgeler R2 private + presigned URL; logolar public bucket.
- **Admin / Dashboard:** Bölünmüş modüller (`pages/admin/*`, `pages/dashboard/*`).
- **Domain:** `lib/domain/*` — isim/puan/status/sanitize pure fonksiyonlar.
- **Görsel kimlik:** [docs/visual-identity-guardrails.md](docs/visual-identity-guardrails.md) — güvenlik/refactor PR’larında görünüm değiştirilmez.

## Ops script’leri

`scripts/` altındaki one-off araçlar (split, öğrenci listesi vb.) production bundle’a girmez. Bkz. `scripts/README.md`.
