import { Category } from '../types';

export interface AcademicJuryCriteria {
  storyDepth: number;     // Senaryo & Anlatı Derinliği
  themeFit: number;       // Tema & Kaynaklara Uygunluk
  spiritualMsg: number;   // Düşünsel & Manevi Mesaj
  techQuality: number;    // Teknik Kalite & Sinematografi
  subjectiveEval: number; // Jüri Öznel Değerlendirmesi
}

export interface AcademicJuryScore {
  juryName: string; // "Jüri 1", "Jüri 2", etc.
  criteria: AcademicJuryCriteria;
  total: number;
}

export interface TeamAcademicResult {
  teamName: string;
  category: Category;
  school: string;
  award: string; // Derece / Ödül ismi
  generalAverage: number;
  juries: AcademicJuryScore[];
}

export const academicJuryScores: TeamAcademicResult[] = [
  // --------------------------------
  // CANLI ÇEKİM KATEGORİSİ
  // --------------------------------
  {
    teamName: 'Sosyal Kızlar42',
    category: Category.LIVE_ACTION,
    school: 'Konya Türk Telekom Sosyal Bilimler Lisesi',
    award: 'Birincilik Ödülü',
    generalAverage: 67.6,
    juries: [
      {
        juryName: 'Jüri 1',
        total: 90,
        criteria: { storyDepth: 15, themeFit: 20, spiritualMsg: 20, techQuality: 20, subjectiveEval: 15 }
      },
      {
        juryName: 'Jüri 2',
        total: 70,
        criteria: { storyDepth: 15, themeFit: 15, spiritualMsg: 15, techQuality: 10, subjectiveEval: 15 }
      },
      {
        juryName: 'Jüri 3',
        total: 68,
        criteria: { storyDepth: 15, themeFit: 15, spiritualMsg: 13, techQuality: 12, subjectiveEval: 13 }
      },
      {
        juryName: 'Jüri 4',
        total: 55,
        criteria: { storyDepth: 10, themeFit: 10, spiritualMsg: 15, techQuality: 10, subjectiveEval: 10 }
      },
      {
        juryName: 'Jüri 5',
        total: 55,
        criteria: { storyDepth: 10, themeFit: 10, spiritualMsg: 15, techQuality: 10, subjectiveEval: 10 }
      }
    ]
  },
  {
    teamName: 'Diriliş Perileri',
    category: Category.LIVE_ACTION,
    school: 'Güngören İstanbul Ticaret Odası Kız Anadolu İmam Hatip Lisesi',
    award: 'İkincilik Ödülü',
    generalAverage: 66.0,
    juries: [
      {
        juryName: 'Jüri 1',
        total: 60,
        criteria: { storyDepth: 10, themeFit: 20, spiritualMsg: 20, techQuality: 5, subjectiveEval: 5 }
      },
      {
        juryName: 'Jüri 2',
        total: 60,
        criteria: { storyDepth: 15, themeFit: 15, spiritualMsg: 5, techQuality: 15, subjectiveEval: 10 }
      },
      {
        juryName: 'Jüri 3',
        total: 60,
        criteria: { storyDepth: 10, themeFit: 15, spiritualMsg: 15, techQuality: 10, subjectiveEval: 10 }
      },
      {
        juryName: 'Jüri 4',
        total: 80,
        criteria: { storyDepth: 20, themeFit: 15, spiritualMsg: 15, techQuality: 20, subjectiveEval: 10 }
      },
      {
        juryName: 'Jüri 5',
        total: 70,
        criteria: { storyDepth: 15, themeFit: 15, spiritualMsg: 10, techQuality: 20, subjectiveEval: 10 }
      }
    ]
  },
  {
    teamName: 'sinemektep',
    category: Category.LIVE_ACTION,
    school: 'Güngören İstanbul Ticaret Odası Kız Anadolu İmam Hatip Lisesi',
    award: 'Üçüncülük Ödülü',
    generalAverage: 63.0,
    juries: [
      {
        juryName: 'Jüri 1',
        total: 50,
        criteria: { storyDepth: 5, themeFit: 20, spiritualMsg: 15, techQuality: 5, subjectiveEval: 5 }
      },
      {
        juryName: 'Jüri 2',
        total: 50,
        criteria: { storyDepth: 10, themeFit: 15, spiritualMsg: 10, techQuality: 10, subjectiveEval: 5 }
      },
      {
        juryName: 'Jüri 3',
        total: 65,
        criteria: { storyDepth: 15, themeFit: 15, spiritualMsg: 15, techQuality: 10, subjectiveEval: 10 }
      },
      {
        juryName: 'Jüri 4',
        total: 75,
        criteria: { storyDepth: 15, themeFit: 20, spiritualMsg: 15, techQuality: 10, subjectiveEval: 15 }
      },
      {
        juryName: 'Jüri 5',
        total: 75,
        criteria: { storyDepth: 15, themeFit: 20, spiritualMsg: 15, techQuality: 10, subjectiveEval: 15 }
      }
    ]
  },
  {
    teamName: 'Homines Longinqui',
    category: Category.LIVE_ACTION,
    school: 'Uluslararası Mevlana Anadolu İmam Hatip Lisesi',
    award: 'Jüri Özel Ödülü',
    generalAverage: 47.0,
    juries: [
      {
        juryName: 'Jüri 1',
        total: 45,
        criteria: { storyDepth: 5, themeFit: 10, spiritualMsg: 5, techQuality: 15, subjectiveEval: 10 }
      },
      {
        juryName: 'Jüri 2',
        total: 45,
        criteria: { storyDepth: 15, themeFit: 5, spiritualMsg: 10, techQuality: 5, subjectiveEval: 10 }
      },
      {
        juryName: 'Jüri 3',
        total: 80,
        criteria: { storyDepth: 15, themeFit: 15, spiritualMsg: 18, techQuality: 16, subjectiveEval: 16 }
      },
      {
        juryName: 'Jüri 4',
        total: 35,
        criteria: { storyDepth: 5, themeFit: 10, spiritualMsg: 10, techQuality: 5, subjectiveEval: 5 }
      },
      {
        juryName: 'Jüri 5',
        total: 30,
        criteria: { storyDepth: 5, themeFit: 10, spiritualMsg: 5, techQuality: 5, subjectiveEval: 5 }
      }
    ]
  },
  {
    teamName: 'Justice Without Doubt',
    category: Category.LIVE_ACTION,
    school: 'Mahmut Sami Ramazanoğlu Anadolu İmam Hatip Lisesi',
    award: 'Mansiyon Ödülü',
    generalAverage: 40.6,
    juries: [
      {
        juryName: 'Jüri 1',
        total: 30,
        criteria: { storyDepth: 5, themeFit: 10, spiritualMsg: 10, techQuality: 0, subjectiveEval: 5 }
      },
      {
        juryName: 'Jüri 2',
        total: 30,
        criteria: { storyDepth: 5, themeFit: 10, spiritualMsg: 5, techQuality: 5, subjectiveEval: 5 }
      },
      {
        juryName: 'Jüri 3',
        total: 58,
        criteria: { storyDepth: 12, themeFit: 16, spiritualMsg: 17, techQuality: 8, subjectiveEval: 5 }
      },
      {
        juryName: 'Jüri 4',
        total: 45,
        criteria: { storyDepth: 10, themeFit: 10, spiritualMsg: 10, techQuality: 10, subjectiveEval: 5 }
      },
      {
        juryName: 'Jüri 5',
        total: 40,
        criteria: { storyDepth: 5, themeFit: 10, spiritualMsg: 5, techQuality: 5, subjectiveEval: 10 }
      }
    ]
  },

  // --------------------------------
  // YAPAY ZEKÂ KATEGORİSİ
  // --------------------------------
  {
    teamName: 'mitra',
    category: Category.AI_ANIMATION,
    school: '15 Temmuz Şehitleri Anadolu İmam Hatip Lisesi',
    award: 'Birincilik Ödülü',
    generalAverage: 81.0,
    juries: [
      {
        juryName: 'Jüri 1',
        total: 90,
        criteria: { storyDepth: 20, themeFit: 20, spiritualMsg: 20, techQuality: 15, subjectiveEval: 15 }
      },
      {
        juryName: 'Jüri 2',
        total: 75,
        criteria: { storyDepth: 10, themeFit: 10, spiritualMsg: 15, techQuality: 20, subjectiveEval: 20 }
      },
      {
        juryName: 'Jüri 3',
        total: 95,
        criteria: { storyDepth: 20, themeFit: 20, spiritualMsg: 19, techQuality: 18, subjectiveEval: 18 }
      },
      {
        juryName: 'Jüri 4',
        total: 75,
        criteria: { storyDepth: 15, themeFit: 15, spiritualMsg: 15, techQuality: 15, subjectiveEval: 15 }
      },
      {
        juryName: 'Jüri 5',
        total: 70,
        criteria: { storyDepth: 15, themeFit: 15, spiritualMsg: 10, techQuality: 15, subjectiveEval: 15 }
      }
    ]
  },
  {
    teamName: 'Technokasyon',
    category: Category.AI_ANIMATION,
    school: 'Kadıköy Anadolu İmam Hatip Lisesi',
    award: 'İkincilik Ödülü',
    generalAverage: 66.0,
    juries: [
      {
        juryName: 'Jüri 1',
        total: 70,
        criteria: { storyDepth: 10, themeFit: 20, spiritualMsg: 20, techQuality: 10, subjectiveEval: 20 }
      },
      {
        juryName: 'Jüri 2',
        total: 55,
        criteria: { storyDepth: 10, themeFit: 10, spiritualMsg: 10, techQuality: 20, subjectiveEval: 5 }
      },
      {
        juryName: 'Jüri 3',
        total: 80,
        criteria: { storyDepth: 15, themeFit: 15, spiritualMsg: 15, techQuality: 17, subjectiveEval: 18 }
      },
      {
        juryName: 'Jüri 4',
        total: 65,
        criteria: { storyDepth: 15, themeFit: 15, spiritualMsg: 15, techQuality: 10, subjectiveEval: 10 }
      },
      {
        juryName: 'Jüri 5',
        total: 60,
        criteria: { storyDepth: 15, themeFit: 15, spiritualMsg: 10, techQuality: 10, subjectiveEval: 10 }
      }
    ]
  },
  {
    teamName: 'Threee',
    category: Category.AI_ANIMATION,
    school: 'Maltepe Kız Anadolu İmam Hatip Lisesi',
    award: 'Üçüncülük Ödülü',
    generalAverage: 58.2,
    juries: [
      {
        juryName: 'Jüri 1',
        total: 60,
        criteria: { storyDepth: 15, themeFit: 15, spiritualMsg: 20, techQuality: 5, subjectiveEval: 5 }
      },
      {
        juryName: 'Jüri 2',
        total: 53,
        criteria: { storyDepth: 8, themeFit: 10, spiritualMsg: 10, techQuality: 20, subjectiveEval: 5 }
      },
      {
        juryName: 'Jüri 3',
        total: 78,
        criteria: { storyDepth: 13, themeFit: 17, spiritualMsg: 15, techQuality: 18, subjectiveEval: 15 }
      },
      {
        juryName: 'Jüri 4',
        total: 45,
        criteria: { storyDepth: 10, themeFit: 10, spiritualMsg: 10, techQuality: 10, subjectiveEval: 5 }
      },
      {
        juryName: 'Jüri 5',
        total: 55,
        criteria: { storyDepth: 10, themeFit: 15, spiritualMsg: 10, techQuality: 10, subjectiveEval: 10 }
      }
    ]
  },
  {
    teamName: 'PURE INSIGHT',
    category: Category.AI_ANIMATION,
    school: 'Selçuklu Fen Lisesi',
    award: 'Jüri Özel Ödülü',
    generalAverage: 47.4,
    juries: [
      {
        juryName: 'Jüri 1',
        total: 35,
        criteria: { storyDepth: 10, themeFit: 10, spiritualMsg: 15, techQuality: 0, subjectiveEval: 0 }
      },
      {
        juryName: 'Jüri 2',
        total: 62,
        criteria: { storyDepth: 15, themeFit: 10, spiritualMsg: 12, techQuality: 15, subjectiveEval: 10 }
      },
      {
        juryName: 'Jüri 3',
        total: 75,
        criteria: { storyDepth: 15, themeFit: 15, spiritualMsg: 15, techQuality: 15, subjectiveEval: 15 }
      },
      {
        juryName: 'Jüri 4',
        total: 30,
        criteria: { storyDepth: 5, themeFit: 10, spiritualMsg: 5, techQuality: 5, subjectiveEval: 5 }
      },
      {
        juryName: 'Jüri 5',
        total: 35,
        criteria: { storyDepth: 5, themeFit: 10, spiritualMsg: 5, techQuality: 10, subjectiveEval: 5 }
      }
    ]
  },
  {
    teamName: 'Clear Vision',
    category: Category.AI_ANIMATION,
    school: 'Konya Anadolu İmam Hatip Lisesi',
    award: 'Mansiyon Ödülü',
    generalAverage: 46.0,
    juries: [
      {
        juryName: 'Jüri 1',
        total: 55,
        criteria: { storyDepth: 5, themeFit: 20, spiritualMsg: 15, techQuality: 5, subjectiveEval: 10 }
      },
      {
        juryName: 'Jüri 2',
        total: 35,
        criteria: { storyDepth: 5, themeFit: 5, spiritualMsg: 8, techQuality: 12, subjectiveEval: 5 }
      },
      {
        juryName: 'Jüri 3',
        total: 80,
        criteria: { storyDepth: 15, themeFit: 20, spiritualMsg: 15, techQuality: 15, subjectiveEval: 15 }
      },
      {
        juryName: 'Jüri 4',
        total: 30,
        criteria: { storyDepth: 5, themeFit: 10, spiritualMsg: 5, techQuality: 5, subjectiveEval: 5 }
      },
      {
        juryName: 'Jüri 5',
        total: 30,
        criteria: { storyDepth: 5, themeFit: 10, spiritualMsg: 5, techQuality: 5, subjectiveEval: 5 }
      }
    ]
  }
];

export function getAcademicResult(teamName: string, category: Category): TeamAcademicResult | undefined {
  const normName = teamName.toLowerCase().trim();
  return academicJuryScores.find(res => {
    const resNorm = res.teamName.toLowerCase().trim();
    return (res.category === category) && (resNorm === normName || normName.includes(resNorm) || resNorm.includes(normName));
  });
}
