# Roadmap — üst seviye (kademeli)

Görsel kimlik ve güvenlik modeli korunur. Her faz sonunda: `npm run verify`.

## Faz 1 — Güvenli release eşiği (şu an)

- [x] CI: lint + unit + build + e2e smoke
- [x] Playwright functional smoke (public + auth gate)
- [x] Lazy load: Admin / Dashboard / Jury / ağır public (sinema, city-guide, award form)
- [x] Smoke checklist + roadmap dokümanı
- [ ] Push sonrası production smoke (manuel) — commit/push senin onayıyla

## Faz 2 — Program ürünü

- [x] Sezon / arşiv temeli (`seasonId`, `archived`, admin filtre, ayarlar, satır arşiv)
- [x] Admin rol güncelleme sunucu API (`/api/admin-user-role`)
- [x] xlsx/jspdf zaten dynamic import (AdminTeams)
- [x] Sunucu yedek API (`/api/admin-backup`) + client fallback
- [x] Toplu arşiv (admin takım listesi)
- [x] Firestore create: `seasonId` / `archived` kuralları
- [x] Sunucu yedek API (manuel admin)
- [x] Cron **kaldırıldı** (sezon statik; günlük yedek gereksiz)
- [x] Yeni e-posta stack şart değil (mevcut EmailJS yeterli)

## Faz 3 — Üst lig

- [x] jspdf 4.x upgrade + unit smoke
- [ ] Sentry release bağlama
- [ ] (İsteğe bağlı) Resend / cron — ihtiyaç olursa

## Smoke checklist (manuel, 5 dk)

1. `/` ana sayfa açılıyor
2. `/login` form görünüyor
3. Girişsiz `/dashboard` → login
4. Girişsiz `/admin` → login
5. `/faq` veya `/about` içerik var
6. (Auth varsa) öğretmen dashboard shell
