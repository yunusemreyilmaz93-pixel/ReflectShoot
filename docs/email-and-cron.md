# E-posta notu

**Cron kaldırıldı.** Otomatik günlük yedek / digest / hatırlatma job’u yok.

## Mevcut iletişim

FAQ / iletişim formu üzerinden giden mailler (EmailJS) eskisi gibi çalışır; Vercel’e `CRON_*` / `RESEND_*` eklemen gerekmez.

## İsteğe bağlı (kullanılmıyor şu an)

Kodda `server/email.js` ve rol onayı sonrası mail denemesi kalabilir; `RESEND_API_KEY` yoksa **hiçbir şey göndermez**. İleride istersen açılır.

## Yedek

Admin panelinden manuel “full backup” / `GET /api/admin-backup` yeterli. Otomatik R2 yedekleme kapalı.
