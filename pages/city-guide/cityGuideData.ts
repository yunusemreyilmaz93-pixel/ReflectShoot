import { Clock, Camera, Moon } from 'lucide-react';

export interface LocationDetail {
    hours: string;
    transport: string;
    nearby: string;
    entryFee: string;
    mapUrl: string;
}

export interface TouristLocation {
    title: string;
    subtitle: string;
    description: string;
    tip: string;
    photoTip: string; // New: Best spot for memory photo
    tags: string[];
    image: string;
    details: LocationDetail;
}

  export const touristLocations: TouristLocation[] = [
      {
          title: "Mevlana Müzesi & Meydanı",
          subtitle: "Manevi Huzur Durağı",
          description: "Konya'ya gelip de uğramadan dönülmez. Ödül heyecanını yatıştırmak, biraz nefes almak ve manevi atmosferi hissetmek için ilk durağınız burası olmalı. Kubbe-i Hadra'nın (Yeşil Kubbe) altında huzur bulacaksınız.",
          tip: "Müze çıkışında gül bahçesinde ekibinizle çay içip yorgunluk atmayı unutmayın.",
          photoTip: "Kubbe-i Hadra'yı arkanıza alıp, meydandaki havuzun yansımasını kullanarak sanatsal bir kare yakalayın.",
          tags: ["Ziyaret", "Huzur", "Simge"],
          image: "https://assets.reflectandshoot.com/city_guide/img_1164.webp",
          details: {
              hours: "09:00 - 18:30 (Haftanın her günü)",
              transport: "Tramvay ile 'Mevlana' durağında inerek tam önünde olabilirsiniz.",
              nearby: "Selimiye Camii, Panorama Müzesi",
              entryFee: "Öğrencilere Ücretsiz (MüzeKart geçerli)",
              mapUrl: "https://www.google.com/maps/search/?api=1&query=Mevlana+Müzesi+Konya"
          }
      },
      {
          title: "Tarihi Bedesten Çarşısı",
          subtitle: "Geçmişin Alışveriş Merkezi",
          description: "Mevlana Müzesi'ne yürüme mesafesinde olan bu tarihi çarşı, Konya'nın kalbi gibidir. Yüzyıllardır ticaretin döndüğü bu sokaklarda kaybolabilir, antikacılardan yöresel ürünlere kadar her şeyi bulabilirsiniz. Kapu Camii ve Aziziye Camii'nin gölgesinde tarih kokan bir yürüyüş sizi bekliyor.",
          tip: "Çarşı içindeki küçük esnaf lokantalarında Konya'ya özgü lezzetleri tadabilirsiniz.",
          photoTip: "Aziziye Camii'nin barok minareleri ile Bedesten'in hareketli kalabalığını aynı karede yakalayın.",
          tags: ["Alışveriş", "Tarih", "Kültür"],
          image: "https://assets.reflectandshoot.com/city_guide/bedesten.jpg",
          details: {
              hours: "08:00 - 20:00 (Pazar günleri sakin olabilir)",
              transport: "Mevlana Meydanı'ndan yürüyerek 5 dakika.",
              nearby: "Kapu Camii, Aziziye Camii",
              entryFee: "Ücretsiz",
              mapUrl: "https://www.google.com/maps/search/?api=1&query=Konya+Bedesten+Çarşısı"
          }
      },
      {
          title: "Sille Köyü",
          subtitle: "Tarihi Kahve Molası",
          description: "Binlerce yıllık tarihi dokusuyla Sille, şehrin gürültüsünden uzaklaşmak için harika bir kaçış noktası. Taş köprüleri, mağaraları ve restore edilmiş evleriyle tam bir açık hava müzesi.",
          tip: "Meşhur Sille kahvesini denemeden dönmeyin.",
          photoTip: "Tarihi Taş Köprü üzerinde, arka planda mağaralar görünecek şekilde geniş açı bir grup fotoğrafı çekin.",
          tags: ["Tarih", "Gezi", "Kafe"],
          image: "https://assets.reflectandshoot.com/city_guide/sille.jpg",
          details: {
              hours: "24 Saat Açık (Kafeler 23:00'e kadar)",
              transport: "64 Numaralı Belediye Otobüsü ile ulaşım sağlanır.",
              nearby: "Aya Elena Kilisesi, Zaman Müzesi",
              entryFee: "Köy girişi ücretsiz.",
              mapUrl: "https://www.google.com/maps/search/?api=1&query=Sille+Konya"
          }
      },
      {
          title: "Konya Tropikal Kelebek Bahçesi",
          subtitle: "En Renkli Hatıra",
          description: "Avrupa'nın en büyük kelebek uçuş alanı. İçeri girdiğinizde kendinizi tropikal bir ormanda hissedeceksiniz. Binlerce kelebek ve egzotik bitki arasında harika anlar yaşayın.",
          tip: "İçerisi nemli ve sıcaktır, ince giyinmenizi öneririz.",
          photoTip: "Kelebeklerin üzerinize konmasını bekleyin ve makro modunda o anı ölümsüzleştirin.",
          tags: ["Doğa", "Eğlence", "Fotoğraf"],
          image: "https://assets.reflectandshoot.com/city_guide/Konya-Tropikal-Kelebek-Bahcesi-LED-Aydinlatma-1.jpg",
          details: {
              hours: "09:30 - 17:30 (Pazartesi kapalı olabilir)",
              transport: "47 Numaralı Otobüs ile ulaşım sağlanır.",
              nearby: "Konya Stadyumu, Macera Parkı",
              entryFee: "Öğrenci İndirimli Bilet Mevcut",
              mapUrl: "https://www.google.com/maps/search/?api=1&query=Konya+Tropikal+Kelebek+Bahçesi"
          }
      },
      {
          title: "Konya Bilim Merkezi",
          subtitle: "Teknoloji ve Eğlence",
          description: "Türkiye'nin TÜBİTAK destekli ilk bilim merkezi. Modern mimarisi ve interaktif sergileriyle zihninizi açacak bir deneyim. Özellikle bilim kurgu meraklısı finalistlerimizin çok seveceği fütüristik bir atmosfer.",
          tip: "Planetaryum gösterilerine mutlaka göz atın.",
          photoTip: "Binanın dış mimarisi çok fütüristik. Geniş açı ile modern ve simetrik bir kare yakalayın.",
          tags: ["Bilim", "Deneyim", "Modern"],
          image: "https://assets.reflectandshoot.com/city_guide/bilim_merkezi.jpg",
          details: {
              hours: "Hafta içi 09:00-17:00, Hafta sonu 10:00-18:00",
              transport: "Havalimanı yolu üzerinde. Özel servis veya taksi önerilir.",
              nearby: "Türk Yıldızları Parkı",
              entryFee: "Cüzi bir giriş ücreti var.",
              mapUrl: "https://www.google.com/maps/search/?api=1&query=Konya+Bilim+Merkezi"
          }
      },
      {
          title: "Japon Parkı & Ecdad Parkı",
          subtitle: "Şehir İçinde Nefes",
          description: "Japon mimarisiyle tasarlanmış göletler ve sakura ağaçları arasında sakin bir yürüyüş... Veya Ecdad Parkı'nda Selçuklu mimarisinin izlerini sürmek. Ödül töreni öncesi kafanızı boşaltmak için ideal yeşil alanlar.",
          tip: "Japon Parkı'ndaki gölet kenarında gün batımını izlemek tüm yorgunluğunuzu alır.",
          photoTip: "Japon Parkı'ndaki pagoda (kule) ve gölet yansımasını kullanarak Uzak Doğu havasında bir kare çekin.",
          tags: ["Park", "Yürüyüş", "Sakinlik"],
          image: "https://assets.reflectandshoot.com/city_guide/japon_parki.jpg",
          details: {
              hours: "08:00 - 23:00",
              transport: "Tramvay ile ulaşım çok kolay (Japon Parkı Durağı).",
              nearby: "M1 AVM, Ecdad Parkı",
              entryFee: "Ücretsiz",
              mapUrl: "https://www.google.com/maps/search/?api=1&query=Konya+Japon+Parkı"
          }
      }
  ];

  export const itineraries = [
      {
          title: "3 Saatte Hızlı Tur",
          icon: Clock,
          color: "text-rose-500",
          desc: "Vaktiniz kısıtlıysa şehrin kalbini hissedin.",
          steps: ["Mevlana Müzesi", "Bedesten Çarşısı", "Aziziye Camii", "Karatay Medresesi"]
      },
      {
          title: "Fotoğrafçı Rotası",
          icon: Camera,
          color: "text-amber-500",
          desc: "En iyi kadrajlar ve ışık için.",
          steps: ["Tropikal Kelebek Bahçesi", "Sille Köyü (Taş Köprü)", "Japon Parkı (Gün Batımı)"]
      },
      {
          title: "Akşam Yürüyüşü",
          icon: Moon,
          color: "text-blue-500",
          desc: "Kapanış yemeğinden sonra şehri yaşayın.",
          steps: ["Zafer Meydanı", "Alaaddin Tepesi", "Kültür Park", "Mevlana Meydanı (Gece Işıkları)"]
      }
  ];

  export const travelTasks = [
      "Mevlana Meydanı'nda ekiple bir selfie çek.",
      "Sille'de tarihi köprüde bir anı fotoğrafı yakala.",
      "Bir öğünde etliekmek ye (çatal kullanmadan!).",
      "Kelebekler Vadisi'nde renkli bir kare yakala.",
      "Zafer Meydanı'nda akşam yürüyüşü yap.",
      "Sevdiklerin için Mevlana Şekeri al."
  ];

