# Reflect & Shoot görsel kimlik koruma sözleşmesi

Bu belge, güvenlik ve kalite çalışmaları sırasında sitenin tanınan kimliğinin istemeden değişmesini önler. Görsel değişiklik hedeflenmeyen pull request'lerde aşağıdaki unsurlar korunur.

## Korunan kimlik

- Reflect & Shoot adı, logo kullanımı ve sinema/festival anlatısı
- Koyu lacivert-slate zeminler, amber/altın vurgu ve mevcut yardımcı renk dengesi
- Güçlü, yüksek ağırlıklı başlıklar; mevcut Inter tabanlı tipografik ritim
- Yuvarlatılmış kartlar, ince çerçeveler, kontrollü gölgeler ve mevcut bölüm sıraları
- Ana gezinme, çağrı butonlarının hiyerarşisi, masaüstü ve mobil bilgi mimarisi
- Türkçe, genç sinemacıları cesaretlendiren kurumsal ama sıcak ürün dili

## Değişiklik ilkesi

Güvenlik, erişilebilirlik, hata düzeltme ve performans işleri mümkün olduğunca görünmez olmalıdır. Renk, yazı tipi, logo, metin tonu, boşluk sistemi, ana bileşen geometrisi veya sayfa sırası değişecekse bu ayrı bir tasarım kararı olarak incelenir; güvenlik düzeltmesinin yan etkisi olarak kabul edilmez.

## Görsel regresyon kapısı

Playwright testleri sekiz temel halka açık sayfayı masaüstü ve mobil görünümde karşılaştırır. Testler canlı Firestore içeriğini engelleyerek sürümden sürüme sabit kalan varsayılan ürün kimliğini ölçer. Animasyonlar, tarih ve imleç sabitlenir.

Bir ekran görüntüsü farkı oluştuğunda:

1. Fark beklenmiyorsa kod düzeltilir; referans görüntü yenilenmez.
2. Fark bilinçli ve onaylıysa masaüstü ile mobil birlikte gözden geçirilir.
3. Logo, ana renkler, tipografi veya temel yerleşim etkileniyorsa ürün kimliği incelemesi zorunludur.
4. Onaydan sonra `npm run test:visual:update` ile referanslar yenilenir.

## Erişilebilirlik istisnası

Kontrast, odak görünürlüğü, klavye erişimi veya okunabilirlik düzeltmeleri kimliği bozmadan yapılır. Mevcut görünümü birebir korumak erişilebilirlik sorunu yaratıyorsa erişilebilirlik önceliklidir ve fark açıkça belgelenir.
