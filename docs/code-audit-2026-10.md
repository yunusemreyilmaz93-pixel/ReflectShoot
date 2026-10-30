# Kod denetimi — backend / kurallar / ops (2026-10-30)

Kapsam: `api/`, `server/`, `firestore.rules`, `lib/` (veri katmanı), build/CI/ops dosyaları.
**Arayüz (pages/, components/, UI bileşenleri) değiştirilmedi.**

Doğrulama: `tsc --noEmit` temiz · `test:unit` 73/73 · `test:rules` (emülatör) 18/18 · `npm run build` R2 anahtarı olmadan başarılı.

## Düzeltilenler

| # | Önem | Sorun | Çözüm |
|---|------|-------|-------|
| 1 | **Kritik** | `api/internal-purge-legacy-certificates.js`: sabit kodlanmış token (`rns_…`) ile herkese açık **GET** üzerinden üretim R2 bucket'ında toplu silme. Token git geçmişinde → ele geçmiş sayılmalı. | Endpoint silindi. Test, `api/` altında sabit gizli anahtar / R2 silme komutu olmamasını zorunlu kılıyor. |
| 2 | **Kritik** | `package.json` `postbuild`: her `npm run build` (Vercel production **ve preview**) üretim bucket'ına `--execute` ile silme çalıştırıyordu; R2 env yoksa (CI, yerel) build **çöküyordu**. | `postbuild` kaldırıldı. Script manuel/dry-run olarak duruyor. Test: build/pre/post scriptleri `ops-oneoffs`/`--execute` içeremez. |
| 3 | Yüksek | Kazanan takımlar ödül katılım formunu **gönderemiyordu**: `team.participationFormStatus` güncellemesi, kural `status in [4 düzenlenebilir durum]` şartına takılıyordu (kazananın durumu `Puanlandı`/`Onaylandı`). Form dokümanı kaydolup başvuru bayrağı reddediliyor → tutarsız kayıt, tekrar denemede de hata. | Kurallara yalnızca kazanan sahibi için, yalnızca `participationFormStatus='submitted'` + `participationSubmittedAt` değişimine izin veren dar bir yol eklendi. |
| 4 | Yüksek | Öğretmen, reddedilmiş / **diskalifiye** / puanlanmış başvurusunu `status: 'Taslak'`a çekip yeniden akışa sokabiliyor, puanlanmış eserin videosunu değiştirebiliyordu. | Sahip güncellemesi artık yalnızca mevcut durum düzenlenebilirse (Taslak, Ön Başvuru Yapıldı, Video İnceleniyor, Düzeltme Gerekli) geçerli. |
| 5 | Yüksek | Jüri puanı, **Reddedildi/Diskalifiye** eseri `Puanlandı`ya çevirip herkese açık vitrine sokabiliyordu (`api/jury-score`). | Bu durumlarda 409 `application_not_scorable`. |
| 6 | Yüksek | Admin, puanı olan bir takımı **silemiyordu**: istemci batch'i `scores` alt koleksiyonunu da siliyor, kural `write: false` olduğu için tüm batch reddediliyordu. | `scores` için `create/update: false`, `delete: admin`. |
| 7 | Orta | `team.logoUrl` / `team.submissionDownloadUrl` sahibi tarafından doğrulamasız yazılabiliyor; admin panelinde `href` olarak render ediliyor (`javascript:` / takip pikseli). CSP tek savunma hattıydı. | Kurallar: değiştirilirse yalnızca `https://` / null. `api/public-showcase` ve `lib/domain/sanitizePublic.ts` de `logoUrl`/`videoUrl`'i https dışında null'a çeviriyor (`server/publicShowcase.js`). |
| 8 | Orta | Panel mesajında `senderRole` istemciden geliyordu; öğretmen `ADMIN` rolüyle mesaj atıp "son mesaj yönetimden" durumunu taklit edebiliyordu. | Kural: `senderRole` = gönderenin gerçek rolü. |
| 9 | Orta | `logs` koleksiyonuna profili olmayan her oturum açmış hesap sınırsız / sınırsız boyutta kayıt yazabiliyordu. | `hasProfile()` şartı + `ip` ≤100, `userAgent` ≤1000 karakter. |
| 10 | Orta | `api/admin-backup`: her başvuru için **sıralı** `scores` okuması (N+1) → takım sayısı arttıkça serverless zaman aşımı ve yarım yedek. | Tek `collectionGroup('scores')` sorgusu. |
| 11 | Düşük | Kök dizinde sabit kimlik bilgili (`dummy12345@gmail.com` / `password123`) ve mevcut kurallarla zaten çalışamayan istemci-SDK scriptleri (`markWinners.ts`, `retrieve_*.ts`); kök `admin_retrieve_students.ts` öğrenci telefonlarını yazdırıyor. | İlk üçü silindi; Admin-SDK script'i `scripts/ops-oneoffs/` altına taşındı; README'ler güncellendi. |
| 12 | Düşük | `.env.example` e-posta env'lerini içermiyordu. | Eklendi. |

## Senin yapman gerekenler (kodla çözülemez)

1. **`firebase deploy --only firestore:rules`** — kural değişiklikleri deploy edilmeden etkisizdir.
2. **Vercel loglarında** `/api/internal-purge-legacy-certificates` isteklerini kontrol et: token git geçmişinde olduğu için başkası da tetiklemiş olabilir. Endpoint kalktığı için artık sömürülemez; şüphe varsa R2 anahtarlarını da rotasyona al.
3. **`dummy12345@gmail.com` Firebase Auth kullanıcısını sil** — şifresi (`password123`) git geçmişinde.
4. Mevcut verilerde `logoUrl`/`submissionDownloadUrl` içinde `http:`/`javascript:` değer var mı bir kez tara (kural yalnızca yeni yazımları kısıtlar; public API artık sızdırmaz).

## Bilinçli olarak dokunulmayan (arayüz/ürün kararı gerektirir) — öncelik sırasıyla

1. **Silme akışı veri sızdırıyor (KVKK):** `deleteApplication` yalnızca Firestore'u siler; R2'deki veli/KVKK PDF'leri (reşit olmayanlara ait) ve `award_participations/{id}` kalıyor. `deleteUser` Firebase Auth hesabını silmiyor. Çözüm: admin-only bir `api/admin-delete-application` (+ R2 temizliği) ve arayüzün ona geçmesi.
2. **Ölçeklenme / maliyet:** `api/public-showcase` her önbellek kaçışında *tüm* `scores` dokümanlarını okuyor (`collectionGroup`); admin istemcisi `applications` ve `users` koleksiyonlarının tamamına `onSnapshot` ile abone. Öneri: jüri transaction'ında kriter ortalamalarını başvuru dokümanına yaz, showcase'i oradan besle; admin listelerini sayfala.
3. **Jüri kör değerlendirme değil:** atanmış jüri, `applications` dokümanının tamamını (öğrenci adları, öğretmen e-posta/telefon) okuyabiliyor; `REPORTER` rolü tüm başvuruları okuyabiliyor. Gerekliyse jüri için ayrı, PII'siz bir okuma modeli gerekir.
4. **Başvuru kimliği zayıf:** `Math.random().toString(36).substring(7)` (≈5 karakter; nadiren boş/kısa çıkıp `jury-score` id regex'ini bozabilir, çakışma riski). `crypto.randomUUID()` önerilir (`context/AppContext.tsx`).
5. **Denetim kaydı güvenilmez:** `logs.ip` istemciden (`api.ipify.org` — üçüncü taraf çağrı, KVKK açısından aydınlatma gerektirir) ve istemci tarafından yazılıyor; kimse kendi adına sahte kayıt yazabilir. Kritik olaylar (rol, silme, durum) sunucuda loglanmalı.
6. **`api/view?raw=1`** dosyayı bellekte tamponlayıp döndürüyor; Vercel yanıt sınırı ≈4,5 MB, yükleme sınırı ise 10 MB. Büyük şablon/PDF'ler sessizce başarısız olur.
7. **Docs ↔ kod uyumsuzluğu:** README/güvenlik notları "halk oylaması sunucu API'si"nden söz ediyor ama `api/` altında oy endpoint'i yok; `VOTE_HASH_SALT` yalnızca `contact.js` rate-limit'inde kullanılıyor. Özellik kaldırıldıysa dokümanı temizle, duruyorsa endpoint eksik.
8. **Firestore index dosyası yok** (`firestore.indexes.json`): `notifications` (userId + createdAt) bileşik indeksi yalnızca konsolda; yeni ortamda sorgu patlar.
9. **Bağımlılıklar:** `npm audit` 32 bulgu (2 kritik/7 yüksek; çoğu `firebase-tools` dev zincirinde). Üretim tarafında `xlsx@0.18.5` (npm'de yama yok; uygulama yalnızca *yazıyor*, bu yüzden risk düşük). CI'da `npm install` (lockfile'ı yok sayar) ve `npx react-doctor@latest` (sabitlenmemiş) kullanılıyor → `npm ci` + sürüm sabitleme önerilir.
10. `index.html` içinde kalan `<span hidden>RNS_PURGE_BUILD_…</span>` deploy işaretçisi zararsız ama çöp; arayüz dosyası olduğu için dokunmadım.
11. `award_participations` create kuralı kazanan olmayan takıma da izin veriyor ve alan listesi kısıtlamıyor; `contact_messages` (panel sohbeti) için oran sınırı yok.
