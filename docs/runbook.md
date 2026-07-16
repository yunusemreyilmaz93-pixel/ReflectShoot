# Operasyon runbook

## Bakım modu

Admin → Sistem Ayarları → `maintenanceMode`. Admin `/login` ile girebilir; diğer rotalar bakım sayfası.

## Jüri sistemi

1. `judgeSystemActive` aç
2. Kullanıcılar’dan jüri rolü ver (e-posta doğrulanmış)
3. Jüri Atama ile `assignedJuryIds` set et
4. Puanlar `/api/jury-score` üzerinden transaction ile yazılır

## Halk oylaması

1. Finalist işaretle + YouTube `videoUrl`
2. `publicVotingActive` + oy tarih aralığı
3. Oylar fingerprint+IP hash + rate limit (sunucu)

## Yedek

Admin panelinden “full backup” JSON indirme (`downloadFullBackup`).

## Kurallar deploy

```bash
npm run test:rules
firebase deploy --only firestore:rules
```

Kurallar ile istemci aynı pencerede güncellenmeli (eski istemci jüri/oy client write denemesin).

## React Doctor

```bash
npm run doctor
npm run doctor:score
```

Refactor sonrası skor gerilememeli. Görsel değişmeyen PR’larda `test:visual` yeşil kalmalı.
