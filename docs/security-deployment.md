# Güvenlik dağıtım notları

Bu sürüm, Firebase kimlik belirtecini sunucuda doğrular; özel R2 bağlantılarını kısa ömürlü ve kullanıcı kapsamlı üretir; halka açık finalist verisini kişisel alanlardan arındırır; jüri puanlamasını ve halk oylamasını güvenilir sunucu işlemlerine taşır.

## Zorunlu ortam değişkenleri

- `FIREBASE_SERVICE_ACCOUNT_JSON` veya ayrı ayrı `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`
- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`
- `R2_PRIVATE_BUCKET_NAME`, `R2_PUBLIC_BUCKET_NAME`
- En az 32 rastgele karakterden oluşan `VOTE_HASH_SALT`

Firebase Admin anahtarı ve R2 gizli anahtarı istemciye açık `VITE_` değişkenlerinde tutulmamalıdır. Firestore kuralları uygulama dağıtımından önce emülatör testlerinden geçirilmeli ve Firebase projesine ayrıca dağıtılmalıdır.

## Dağıtım sırası

1. Ortam değişkenlerini Vercel'in Production, Preview ve Development kapsamlarında tanımlayın.
2. `npm run lint`, `npm run test:rules`, `npm run build` ve `npm run test:visual` kontrollerini çalıştırın.
3. `firebase deploy --only firestore:rules` ile kuralları yayınlayın.
4. Uygulamayı yayınlayın ve öğretmen belge yükleme, jüri puanlama, özel belge görüntüleme ve halk oylaması için kısa bir kabul testi yapın.

Kurallar ile uygulama aynı bakım penceresinde yayınlanmalıdır. Yeni kurallar eski istemcinin doğrudan jüri puanı ve halk oyu yazmasını kasıtlı olarak reddeder.
