# Sunucu CMS API & e2e admin smoke — ne zaman lazım?

## Sunucu CMS API

**Şu an ihtiyacınız yok.** Admin zaten Firebase Auth + Firestore rules ile yazıyor; client CMS sizin ölçek ve güven modeliniz için yeterli.

| Ne verir? | Ne maliyet? | Ne zaman gerekir? |
|-----------|-------------|-------------------|
| Rate limit / audit sunucu tarafı | Vercel function + admin SDK + bakım | CMS’i çok kişi / dış editör kullanırsa |
| Şema doğrulama merkezi | Her write path’i kopyala | Client bypass endişesi yüksekse |
| Resend/webhook ile “yayınla” | Event bus karmaşıklığı | CMS publish pipeline |
| Offline/admin CLI | — | Ops tool |

**Mevcut koruma:** `firestore.rules` admin-only write, `sanitizeFirestoreData`, toast hata yakalama.  
**Yapılmadı (bilinçli):** `api/cms-*.js` — overkill, timeline bug’ı API eksikliği değildi (UI static override idi).

## e2e admin smoke

| Seviye | Ne test eder? | Fayda |
|--------|----------------|--------|
| **A — Auth gate (var)** | `/admin`, `/dashboard`, `/jury` login’siz açılmaz | CI’da “herkese açık admin” regresyonu |
| **B — Deep-link gate (eklendi)** | `?tab=CONTENT&cms=TIMELINE`, award form | Route kırıkları |
| **C — Logged-in admin** | Sekme tıkla, CMS kaydet mock | Gerçek UX; **Firebase test user + seed** ister |

**C seviyesi** faydalı ama pahalı: secret credential, emulator veya staging. Tek operatör admin için A+B yeter; C’yi sezon öncesi manuel checklist ile kapatabilirsiniz (`docs/smoke-checklist.md`).
