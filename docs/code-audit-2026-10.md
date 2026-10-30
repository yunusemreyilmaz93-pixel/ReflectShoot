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

## Faz 2 — "dokunmadıklarım" da düzeltildi

| Konu | Yapılan |
|------|---------|
| **Silme / KVKK** | `api/admin-delete-application`: R2'deki veli/KVKK PDF'leri + logo, sohbet, ödül formu, puanlar, başvuru (`recursiveDelete`) sunucuda silinir; dosya silinemezse kayıt silinmez (tekrar denenebilir). `api/admin-delete-user`: Firebase Auth hesabı + profil + bildirimler; takımı olan kullanıcı 409 ile reddedilir. Kurallar artık istemciden `applications`/`users` silmeyi **yasaklıyor**; arayüz API'ye bağlandı. |
| **Maliyet** | Vitrin artık tüm `scores`'u taramıyor: jüri transaction'ı anonim `public_scores/{id}` yazıyor, vitrin onu okuyor (eski veriler için geçici fallback + backfill script'i). Admin listener'larına dokunulmadı: birkaç yüz doküman ölçeğinde `onSnapshot` ilk yüklemeden sonra yalnızca farkı okur; sayfalama arayüzü ciddi karmaşıklaştırır, kazanç şimdilik yok. |
| **Jüri kör değerlendirme** | Jüri artık `applications` dokümanını okuyamaz; `GET /api/jury-applications` yalnızca takım adı/kategori/tema/video döndürür (öğrenci, okul, danışman iletişimi yok). `REPORTER` rolünün tüm başvuruları okuması kaldırıldı (arayüzde kullanılmıyordu). |
| **Yeni hata (kural)** | Jüri panelinin `collectionGroup('scores')` sorgusu eski kuralda `{path=**}/scores` → `false` yüzünden reddediliyordu ("Puan verileri alınamadı"). Jüri yalnızca kendi `juryId`'li puanlarını okuyabilecek şekilde düzeltildi (emülatörde doğrulandı). |
| **Başvuru kimliği** | `Math.random().toString(36).substring(7)` → `crypto.randomUUID()` (`lib/id.ts`). |
| **Denetim kaydı** | `logs` istemciden yazılamaz. `POST /api/log` kimlik/IP/UA/zamanı sunucudan alır, rol başına izinli eylem listesi uygular (öğretmen yalnızca `CREATE_APP`, admin yalnızca yönetim eylemleri). Puan, rol, silme olayları kendi endpoint'lerinde sunucuca loglanır. Üçüncü taraf `api.ipify.org` çağrısı kaldırıldı. |
| **Halk oylaması** | Kodda/kuralda/dokümanda/env'de tamamen silindi (`public_votes`, `vote_rate_limits`, `publicVotes`, `publicVoteStart/End`). `VOTE_HASH_SALT` → `CONTACT_HASH_SALT` (eski ad hâlâ kabul edilir; Vercel'de değiştirmek zorunda değilsin). |
| **`view?raw=1`** | Bellekte tamponlamak yerine akıtılıyor (`pipeline`). Vercel'in 4,5 MB tamponlu yanıt sınırı akıtılan yanıtlara uygulanmıyorsa tamamen çözülür; yine de 6 MB'lık sahte dosyayla akış testi eklendi. |
| **Index dosyası** | `firestore.indexes.json` (+ `firebase.json`): `notifications(userId, createdAt desc)` ve `scores.juryId` collection-group indeksi. |
| **CI** | `npm ci` (npm 11 ile — mevcut lockfile npm 10 ile `npm ci` edilemiyordu), `react-doctor` artık lockfile'daki sürümle (`@latest` yok), `quality-gate` unit testleri de koşuyor. `deploy-firestore.yml`: `main`'e kural/indeks değişikliği düşünce testleri çalıştırıp deploy eder (secret yoksa atlar). |
| **index.html** | `RNS_PURGE_BUILD_…` işaretçisi silindi. |
| **Ödül formu / panel sohbeti** | `award_participations` yalnızca kazanan takım için; panel sohbetinde `email` token ile eşleşmeli, alan boyutları sınırlı. |
| **npm audit** | 32 → 27 bulgu, **kritik 0** (lockfile yenilendi: dompurify, proxy-addr, websocket-driver, tar, picomatch… çözüldü). Kalanlar: `firebase@10` istemci SDK'sının Node-only `undici`/`grpc-js` bağımlılıkları (tarayıcı paketinde çalışmaz), `firebase-admin`/`firebase-tools` major yükseltme gerektiren `uuid`, `vite@5` dev-server `esbuild` açığı (yalnızca `npm run dev`), `react-router@6` (v7'ye geçiş arayüz riski), `xlsx` (npm'de yama yok; SheetJS CDN sürümü gerekir — kurulum erişim izni verilmediği için yapılmadı; uygulama yalnızca dosya *yazıyor*). |

## Not: Vercel Hobby fonksiyon sınırı

İlk Faz 2 push'u 15 fonksiyona çıkarıp Vercel'de `exceeded_serverless_functions_per_deployment` (Hobby: en fazla 12) ile başarısız oldu; canlı site eski sürümde kaldı. Fonksiyonlar birleştirilerek 11'e indirildi: `admin-delete` (`{appId}` veya `{uid}`), `jury-score` (GET = atanan eserler, POST = puan), `upload` (`scope: 'public-logo'` ile logo); kullanılmayan `proxy` kaldırıldı. Test, `api/` altında 12'den fazla dosya olmasını engeller.

## Senin yapman gerekenler (kodla çözülemez / bu ortamda yetkim yok)

Bu oturumda Google/Firebase kimlik bilgisi yok (`gcloud`: "No credentialed accounts"), bu yüzden deploy ve Auth silme **burada çalıştırılamaz**. Vercel MCP bağlı ve `reflect-shoot` projesi görünüyor, ancak log API'si 403 döndü (token'da log izni yok).

1. **Kuralları + indeksleri yayınla** — iki yoldan biri:
   - Otomatik: GitHub → Settings → Secrets → `FIREBASE_SERVICE_ACCOUNT_JSON` (Firebase servis hesabı anahtarı; roller: *Firebase Rules Admin*, *Cloud Datastore Index Admin*). Sonra `main`'e birleştirince `deploy-firestore.yml` çalışır (Actions'tan elle de tetiklenir).
   - Elle: `firebase login && firebase deploy --only firestore:rules,firestore:indexes --project reflectandshoot`
   - **Sıra:** önce uygulamayı (Vercel) yayınla, hemen ardından kuralları. Yeni kurallar eski arayüzün doğrudan silme/log yazmasını reddeder.
2. **Bakım script'i** (test hesabını siler, kötü URL'leri temizler, `public_scores` doldurur):
   ```bash
   node scripts/ops-oneoffs/post-audit-maintenance.mjs            # önce dry-run
   node scripts/ops-oneoffs/post-audit-maintenance.mjs --execute
   ```
   Gerekli ortam: `FIREBASE_SERVICE_ACCOUNT_JSON` (veya üç `FIREBASE_*` değişkeni).
3. **Vercel loglarında** `/api/internal-purge-legacy-certificates` isteklerine bak (Vercel → reflect-shoot → Logs → arama). Token git geçmişinde olduğu için başkası tetiklemiş olabilir; şüphe varsa R2 anahtarlarını yenile.
