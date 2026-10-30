# Canlı / preview smoke (10 dakika)

Deploy veya push sonrası. Otomatik karşılık: `npm run test:e2e` + `npm run test:unit`.

## Auth kapıları

| # | Adım | Beklenen |
|---|------|----------|
| 1 | Ana sayfa `/#/` | Navbar + içerik |
| 2 | `/#/login` | E-posta + şifre |
| 3 | `/#/dashboard` (çıkış) | Login |
| 4 | `/#/admin` (çıkış) | Login |
| 5 | `/#/jury` (çıkış) | Login |
| 6 | `/#/apply` | Kayıt formu |
| 7 | `/#/academy` | Akademi kartları / boş durum |

## Admin (girişli)

| # | Adım | Beklenen |
|---|------|----------|
| 8 | Panel özeti | İstatistik kartları |
| 9 | Sistem Ayarları → Yedek İndir | JSON iner |
| 10 | CMS → Zaman Çizelgesi | Kaydet → ana sayfa “Güncel Takvim” |
| 11 | Duyuru → Öğretmenler | Alıcı sayısı > 0 ise toast |
| 12 | Jüri Atama | Liste + otomatik dağıt görünür |
| 13 | Takımlar → Excel dışa aktar | xlsx iner |
| 14 | Sertifikalar | Şablon yüklüyse önizleme |

## Öğretmen (girişli)

| # | Adım | Beklenen |
|---|------|----------|
| 15 | Dashboard sekmeleri | STATUS…CHAT deep-link `?tab=VIDEO` |
| 16 | Akademi sekmesi | Paylaş / kopyala; finalistse kilitli paket |
| 17 | Yeni takım | Sezon limiti (eski arşiv sayılmaz) |

## Sezon / rules (prod öncesi)

| # | Adım | Beklenen |
|---|------|----------|
| 18 | `npm run test:rules` | 10/10 (Java + emulator) |
| 19 | `firebase deploy --only firestore:rules` | Prod kuralları min 3 öğrenci |
| 20 | Yeni Sezon sihirbazı | Staging’de bir kez dene (yedek al) |

## Bilinçli yok

- Öğrenci login / LMS
