# Ops: yedek alma

## Admin panel (önerilen)

1. Admin olarak giriş
2. Sistem / yedek indirme (mevcut `downloadFullBackup`)
3. Sunucu yolu: `GET /api/admin-backup` (Bearer admin token) — skor alt koleksiyonları dahil

## Otomatik cron

**Yok.** Günlük R2 yedekleme kapatıldı (sezon arası statik dönem için gereksiz depolama).

## Not

- Public görsel / frontend ile ilişkisi yok
- Client fallback yedek skorları içermeyebilir; server export tercih et
- Önemli değişiklik / sezon kapanışı öncesi admin’den bir kez indirmen yeterli
