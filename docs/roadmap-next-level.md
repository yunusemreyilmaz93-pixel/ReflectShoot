# Roadmap — üst seviye (kademeli)

Görsel kimlik ve güvenlik modeli korunur. Her faz sonunda: `npm run verify`.

## Faz 1 — Güvenli release eşiği (şu an)

- [x] CI: lint + unit + build + e2e smoke
- [x] Playwright functional smoke (public + auth gate)
- [x] Lazy load: Admin / Dashboard / Jury / ağır public (sinema, city-guide, award form)
- [x] Smoke checklist + roadmap dokümanı
- [ ] Push sonrası production smoke (manuel) — commit/push senin onayıyla

## Faz 2 — Program ürünü

- Sezon / arşiv modeli
- Otomatik yedek
- Admin bundle lazy / ağır lib split

## Faz 3 — Üst lig

- E-posta yaşam döngüsü
- jspdf kontrollü upgrade + PDF test
- Sentry release bağlama

## Smoke checklist (manuel, 5 dk)

1. `/` ana sayfa açılıyor
2. `/login` form görünüyor
3. Girişsiz `/dashboard` → login
4. Girişsiz `/admin` → login
5. `/faq` veya `/about` içerik var
6. (Auth varsa) öğretmen dashboard shell
