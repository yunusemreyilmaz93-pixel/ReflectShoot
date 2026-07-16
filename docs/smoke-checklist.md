# Canlı / preview smoke (5 dakika)

Deploy veya push sonrası:

| # | Adım | Beklenen |
|---|------|----------|
| 1 | Ana sayfa `/` | Navbar + hero/içerik |
| 2 | `/#/login` | E-posta + şifre alanları |
| 3 | `/#/dashboard` (çıkış yapılmış) | Login’e yönlendirme |
| 4 | `/#/admin` (çıkış yapılmış) | Login’e yönlendirme |
| 5 | `/#/faq` | SSS içeriği veya form |
| 6 | `/#/apply` | Kayıt formu |
| 7 | (Opsiyonel) öğretmen hesabı | Dashboard sekmeleri |
| 8 | (Opsiyonel) admin | Panel özeti |

Otomatik karşılığı: `npm run test:e2e`
