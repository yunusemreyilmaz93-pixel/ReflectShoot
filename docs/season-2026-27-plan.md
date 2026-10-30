# 2026-27 sezonu planı

Karar özeti: yalnızca **yapay zekâ animasyon** kategorisi · yalnızca **Asr ve Beled** sureleri (ikisinin karışımından tek video) · takım **en az 2, en fazla 4** kişi · galada yalnızca yapay zekâ filmleri · 2026 ödülleri kaldırılır · rehberlerden yapay zekâya faydası olmayanlar çıkarılır.

## 0. Önce yedek (kod değişmeden, yalnızca sen)

Bu adım koddan bağımsız ve her şeyden önce yapılmalı; yeni sezon sihirbazı eski başvuruları arşivler.

1. `reflectandshoot.com` → Admin → Ayarlar → **Veri Yedekleme → Yedek İndir**. Sunucu yedeği iner (`backup-server-….json`): kullanıcılar, başvurular (takım adı, kategori, YouTube linki, finalist/kazanan işareti, ödül kategorisi), **tüm jüri puanları**, CMS içeriği (ödüller, SSS, rehberler, galeri, zaman çizelgesi), sistem ayarları, son 500 log.
2. Okunabilir özet için Admin → Takımlar'dan **Excel dışa aktar** (takım, kategori, durum, finalist/kazanan, video linki, puan, jüri sayısı, okul, şehir).
3. İkisini Drive'a **`Reflect and Shoot 2026`** klasörüne kendin yükle. Dosyalarda reşit olmayanların adları ve danışman iletişim bilgileri var; bu yüzden sohbetten geçirmeden doğrudan Drive'a yükle ve klasörü yalnızca yetkili kişilerle paylaş.
4. Yedeğin tamam olduğunu doğrula: JSON'u aç, `applications` sayısı admin panelindeki toplam takımla, `scoresByApp` içindeki puanlar ekrandakilerle uyuşuyor mu bak.
5. Yedeklenmeyen ve ayrıca saklanması gereken: R2'deki veli/KVKK PDF'leri. Bunlar saklama süresine göre ayrıca karara bağlanmalı (silmek de bir seçenek, KVKK açısından gereksiz saklamamak daha iyi).

## 1. Netleşmesi gerekenler (kodu etkiliyor)

| # | Soru | Neden önemli |
|---|------|--------------|
| 1 | **Beled suresi metni:** Arapça + Türkçe meal (hangi meal?). Asr zaten `data/verses.ts` içinde, Beled yok. | Ayet metnini ben hafızadan yazmayacağım; sizin onayladığınız kaynaktan alınmalı. |
| 2 | Sureler **tam** mı kullanılacak yoksa ayet aralığı mı? Asr: 1-3 mü? | Takım formunda gösterilecek metin ve `selectedVerse` alanı buna bağlı. |
| 3 | 2026 filmleri/sonuçları sitede **arşiv olarak** görünmeye devam edecek mi (örn. "2026 Sezonu" sekmesi), yoksa herkese açık sayfalardan tamamen kalkacak mı? | Vitrin ve galeri filtresi ile ödül sayfası bunun üzerine kurulur. |
| 3a | Galada 2026'nın **yapay zekâ** filmleri de görünsün mü, yoksa galada yalnızca yeni sezonun filmleri mi? | Aynı. |
| 4 | Sezon kimliği/etiketi: `2027` mi, etiket "2026-2027" mi? Yeni tarihler (başvuru, video teslim, akademi, gala)? | Sihirbaz tarihleri otomatik 1 yıl kaydırır; gerçek takvimi siz belirleyin. |
| 5 | 2026 ödülleri kalkarken yeni sezon ödül sayfası ne göstersin: "Açıklanacak" mı, hiç mi? | Ödül kartları ve Ana Sayfa bandı. |
| 6 | Aynı takım adı yeni sezonda yeniden kullanılabilir mi? Şu an `team-name-available` tüm sezonları tarıyor. | 2026 takımları arşivlense bile adları dolu görünür. |

## 2. Kod değişiklikleri (onayınızdan sonra, ayrı ayrı commit)

**A. Veri kuralları (rules + doğrulama) — önce bu**
- `lib/domain/teamValidation.ts`: `MIN_STUDENTS_PER_TEAM = 2`, `MAX_STUDENTS_PER_TEAM = 4`, hata metinleri.
- `firestore.rules`: öğrenci sayısı `3..5` → `2..4` (oluşturma ve sahip güncellemesi). Eski sezonun 5 kişilik takımları arşivli olduğu için etkilenmez; gerekirse kural yalnızca aktif sezon için uygulanır.
- Kural testleri ve `teamValidation` birim testleri güncellenir.

**B. Takım oluşturma formu**
- `pages/dashboard/DashboardCreateTeamForm.tsx`, `types.ts`: kategori seçimi kalkar (sabit: Yapay Zeka Animasyon), tema seçimi kalkar (sabit: "Asr ve Beled Sureleri"), hadis/sahabe seçicileri kalkar. Eski değerler (`Canlı Çekim`, `Hadisler`…) enum'da arşiv verisi için **kalır**; formda gösterilmez.
- `data/verses.ts`: 25 ayet yerine Asr + Beled (madde 1-2 yanıtlanınca).
- Dashboard'daki öğrenci ekleme alanı 2-4 sınırına göre; `DashboardStatusTab`, `DashboardModals` metinleri.

**C. Herkese açık sayfalar**
- Ana Sayfa (`Home.tsx`, `home/categoryCards.ts`), Hakkında, SSS, Finaller, Galeri: kategori kartları, "Ayetler/Hadisler/Sahabeler" bölümleri, "3-5 kişilik", ödül anlatımları ve 22 Mayıs 2026 gala bandı yenilenir.
- **Galeri / gala (`CinemaShowcase.tsx`)**: "Canlı Çekim" sekmesi kalkar, yalnızca yapay zekâ. Dosyada 2026'ya özel sabitler var (`LIVE_ACTION_WINNER_NAMES`, "8. film jüri puanı düzeltmesi", "Clear Vision" özel durumu) — yeni sezonda bunlar yanlış sonuç üretir; sezon bazlı hâle getirilir veya 2026 arşivine taşınır.
- **Vitrin API'si (`api/public-showcase.js`) şu an sezon filtresi uygulamıyor** (`Onaylandı/Puanlandı` hepsini döndürüyor). Yeni sezonda 2026 filmleri istemeden karışmasın diye `seasonId` filtresi eklenir (madde 3'e göre arşiv parametresiyle).

**D. Ödüllerin kaldırılması**
- Sabit kodlu 2026 kazanan listeleri (`components/admin/awards/awardsHelpers.ts`, `CinemaShowcase.tsx`) ve 2026 takım adlarına bağlı `data/juryFeedback.ts`, `data/academicJuryScores.ts` (hepsi 2026 takım adlarıyla anahtarlı) arşive taşınır/silinir; yedek alındıktan sonra.
- CMS ödül kartları (`cms_prizes`) ve ödül katılım formu (`AwardParticipationForm`, `award_participations`) yeni sezonda kapalı; kazanan bayrakları yeni başvurularda zaten boş.

**E. Rehberler / SSS**
- Rehberler `cms_academy` koleksiyonunda; **koda gerek yok**, Admin → CMS → Akademi'den yapay zekâyla ilgisiz öğeleri siler/gizlersiniz. İsterseniz öğe listesini (başlıklar) bana yapıştırın, hangilerinin kalması gerektiği önerisini çıkarayım.
- SSS (`cms_faq`) aynı yolla; kodda sabit SSS metni varsa (`pages/FAQ.tsx`) güncellenir.

## 3. Sezon geçişi (kod yayına çıktıktan sonra, admin panelinden)

Sihirbaz zaten var (`AdminSeasonWizard`): **Yedek → Legacy etiket → Sezon kimliği/tarihler → Kaydet**. Sırayla:
1. Bölüm 0'daki yedek tamam.
2. Etiketsiz (legacy) başvurular `2026` olarak etiketlenir (`api/admin-season-tag`); etiketsiz kayıtlar aksi hâlde "aktif sezon" sayılıp yeni sezona karışır.
3. Yeni sezon (`2027`) başlatılır: 2026 başvuruları arşivlenir, tarihler yeni takvime çekilir, video yükleme/jüri/sonuç gösterimi kapalı başlar.
4. Kodda madde C'deki vitrin sezon filtresi aktif olmalı; yoksa 2026 filmleri yeni vitrinde görünmeye devam eder.

## 4. Sıra ve risk

1. **Yedek (sen)** → 2. soruların yanıtı → 3. A+B (kural + form + testler) tek parça, test + e2e → 4. C+D (sayfalar, vitrin) → 5. yayın → 6. kurallar deploy (`firebase deploy --only firestore:rules`) → 7. sezon geçişi sihirbazla → 8. CMS temizliği.
- En riskli iki nokta: vitrin sezon filtresi (unutulursa eski filmler karışır) ve `CinemaShowcase.tsx`'deki 2026'ya özel puan düzeltmeleri (yeni sezonda yanlış puan gösterebilir).
- Geri dönüş: enum değerleri silinmediği ve veriler arşivlendiği için 2026 kayıtları bozulmaz; yedek ek güvence.
