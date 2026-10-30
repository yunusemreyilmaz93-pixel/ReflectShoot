import type { CMSGeneral, CMSLinks, SystemSettings } from '../types';

export const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
  dates: {
    applicationStart: '2026-01-20T09:00',
    applicationEnd: '2026-05-04T23:59',
    videoUploadStart: '2026-01-20T09:00',
    videoUploadEnd: '2026-05-04T23:59',
    academyStart: '2026-05-10T09:00',
    galaDate: '2026-05-22T10:30',
    finalistRevealStart: '2026-05-07T12:00',
    reviseUploadEnd: '2026-05-17T23:59',
  },
  features: {
    judgeSystemActive: false,
    publicResultReveal: false,
    allowNewRegistrations: true,
    publicVotingActive: false,
    videoUploadActive: false,
    maintenanceMode: false,
    blockNewApplications: false,
  },
  season: {
    id: '2026',
    label: 'Reflect & Shoot 2026',
  },
};

export const DEFAULT_CMS_GENERAL: CMSGeneral = {
  contactEmail: '',
  contactPhone: '',
  contactAddress: '',
  socialInstagram: '#',
  socialTwitter: '#',
  socialYoutube: '#',
  footerText: '',
};

// 2026-27: the 2025-26 Sartname / Veli Izin / KVKK PDFs are retired; new ones are added from Admin -> CMS.
export const DEFAULT_CMS_LINKS: CMSLinks = {
  specUrl: '',
  parentalUrl: '',
  kvkkUrl: '',
  posterUrl: '',
};
