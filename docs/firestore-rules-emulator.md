# Firestore Rules Emulator — ne işe yarar?

## Neden lazım?

`firestore.rules` dosyası **sunucu tarafı güvenlik kapısıdır**:

- Öğretmen sadece kendi başvurusunu okuyabilsin  
- Jüri client’tan puan yazamasın (API zorunlu)  
- Misafir private e-posta/telefon göremesin  
- Admin olmayan rol kendine ADMIN yazamasın  

Kuralları “gözle okuyup doğru sanmak” yetmez. Emulator testleri:

1. **Gerçek Firestore simülasyonu** açar (Java gerekir)  
2. Sahte kullanıcılarla (öğretmen / jüri / misafir) okuma-yazma dener  
3. `assertSucceeds` / `assertFails` ile kuralın gerçekten engellediğini kanıtlar  

Yani: **production’a yanlış kural deploy etmeden önce güvenlik regression testidir.**

Unit domain testleri ≠ rules testleri.  
Domain: iş mantığı.  
Rules emulator: **kim neyi yazabilir/okuyabilir**.

## Nasıl çalıştırılır?

```bash
# Bir kez: Java 17+ (Firestore emulator için)
# Windows: winget install Microsoft.OpenJDK.21

npm run test:rules
```

Bu komut:

`firebase emulators:exec --only firestore` → `tests/firestore.rules.test.ts`

## CI

`quality-gate.yml` içindeki `test:rules` adımı aynı şeyi Linux + Java ile yapar.

## Deploy notu

Rules değişince: `firebase deploy --only firestore:rules`  
(Emulator yeşil olmadan production’a basma.)
