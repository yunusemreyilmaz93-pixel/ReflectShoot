import { Film, Cpu, Clapperboard, Layout, CalendarDays, type LucideIcon } from 'lucide-react';

export interface CategoryData {
  id: string;
  title: string;
  badge: string;
  shortDesc: string;
  icon: LucideIcon;
  color: string;
  techSpecs: { icon: LucideIcon; label: string }[];
  details: {
    description: string[];
    warnings: string[];
  };
}

/** Home category cards — content/presentation contract (do not change copy lightly). */
export const HOME_CATEGORIES: CategoryData[] = [
  {
    id: 'live-action',
    title: 'Canlı Çekim',
    badge: 'SİNEMATOGRAFİ',
    shortDesc:
      'Gerçek oyuncular, set ışıkları ve kamera lensinin gücü ile fikrini filme dönüştür.',
    icon: Film,
    color: 'teal',
    techSpecs: [
      { icon: Clapperboard, label: 'Kurmaca / Belgesel' },
      { icon: Layout, label: '1920x1080 FHD' },
      { icon: CalendarDays, label: '3-8 Dakika' },
    ],
    details: {
      description: [
        'Geleneksel sinema teknikleri kullanılarak üretilmelidir.',
        'Senaryo özgün olmalı ve belirlenen temalardan birini işlemelidir.',
        'Oyuncu yönetimi, ışık kullanımı ve ses kalitesi değerlendirmede önemlidir.',
      ],
      warnings: [
        'Telif hakkı içeren müzik veya görüntü kullanılamaz.',
        'Okul ve genel ahlak kurallarına aykırı içerikler diskalifiye sebebidir.',
        'Filmin dili İngilizce, altyazılar Türkçe olmalıdır.',
      ],
    },
  },
  {
    id: 'ai-animation',
    title: 'Yapay Zeka Animasyon',
    badge: 'SENTETİK MEDYA',
    shortDesc: 'Prompt mühendisliği ile oluşturulan dijital hikayeler ve görsel anlatım.',
    icon: Cpu,
    color: 'purple',
    techSpecs: [
      { icon: Layout, label: 'Yapay Zeka' },
      { icon: Layout, label: '1920x1080 FHD' },
      { icon: CalendarDays, label: '3-8 Dakika' },
    ],
    details: {
      description: [
        'Görüntü oluşturma ve video üretiminde Yapay Zeka araçları (Midjourney, Runway, Pika vb.) kullanılmalıdır.',
        'Prompt mühendisliği ve görsel tutarlılık esas alınır.',
        'Senaryo ve kurgu bütünlüğü teknik kapasite kadar önemlidir.',
      ],
      warnings: [
        'Tamamen stok görüntülerden oluşan kolajlar kabul edilmez.',
        'Yapay zeka tarafından üretilen içeriklerin etik kullanımı esastır.',
        'Filmin dili İngilizce (AI Seslendirme kabul edilir), altyazılar Türkçe olmalıdır.',
      ],
    },
  },
];
