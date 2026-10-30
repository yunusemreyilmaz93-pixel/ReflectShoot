# Operasyon runbook

## Bakım modu

Admin → Sistem Ayarları → `maintenanceMode`. Admin `/login` ile girebilir; diğer rotalar bakım sayfası.

## Jüri sistemi

1. `judgeSystemActive` aç
2. Kullanıcılar’dan jüri rolü ver (e-posta doğrulanmış)
3. Jüri Atama: video teslim etmiş takımlara otomatik veya manuel
4. Puanlar `/api/jury-score` üzerinden transaction ile yazılır
5. Jüri paneli arşivlenmiş eserleri göstermez

## Sezon geçişi

1. **Yedek İndir** (zorunlu öneri)
2. Sistem Ayarları → **Yeni Sezon Oluştur**
3. Önceki sezon arşivlenir; tarihler +1 yıl; video/jüri kapanır
4. CMS timeline + tarihler gözden geçir
5. Zamanı gelince video / jüri bayraklarını aç
6. Öğretmenler yeni sezonda takım açabilir (eski arşiv limit sayılmaz)

```bash
# İsteğe bağlı legacy etiket
# Admin UI: Legacy dry-run → etiketle
```

## Yedek

Admin → Sistem Ayarları → **Yedek İndir** (`/api/admin-backup` veya istemci fallback).

## Kurallar deploy

```bash
npm run test:rules
firebase deploy --only firestore:rules
```

Öğrenci sayısı: min 3, max 5 (rules + domain).

## Akademi

- Public `/#/academy`: herkese açık içerik
- Finalist içerik: yalnızca finalist takım **öğretmen** panelinde
- Sınıf paylaşımı: öğretmen panelinden link/kod kopyala (öğrenci hesabı yok)
- Sertifika: Admin → Sertifikalar (şablon R2)

## React Doctor / test

```bash
npm run lint
npm run test:unit
npm run test:e2e
npm run doctor:score   # opsiyonel
```
