import { useState, useEffect } from 'react';
import {
  doc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import {
  SystemSettings,
  CMSGeneral,
  CMSLinks,
  CMSPrize,
  CMSFaqItem,
  CMSGalleryItem,
  CMSAcademyItem,
  CMSTimelineItem,
} from '../../types';
import { DEFAULT_SYSTEM_SETTINGS, DEFAULT_CMS_GENERAL, DEFAULT_CMS_LINKS } from '../defaults';
import { sanitizeFirestoreData } from '../../lib/domain/timeline';

type ToastFn = (msg: string, type?: 'success' | 'error' | 'info' | 'warning') => void;

export function useCmsStore(showToast: ToastFn) {
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(DEFAULT_SYSTEM_SETTINGS);
  const [cmsGeneral, setCMSGeneral] = useState<CMSGeneral>(DEFAULT_CMS_GENERAL);
  const [cmsLinks, setCMSLinks] = useState<CMSLinks>(DEFAULT_CMS_LINKS);
  const [cmsAcademy, setCmsAcademy] = useState<CMSAcademyItem[]>([]);
  const [cmsGallery, setCmsGallery] = useState<CMSGalleryItem[]>([]);
  const [cmsFaqs, setCmsFaqs] = useState<CMSFaqItem[]>([]);
  const [cmsTimeline, setCmsTimeline] = useState<CMSTimelineItem[]>([]);
  const [cmsPrizes, setCmsPrizes] = useState<CMSPrize[]>([]);

  useEffect(() => {
    const unsubSettings = onSnapshot(
      doc(db, 'system', 'settings'),
      (snap) => {
        if (snap.exists()) setSystemSettings(snap.data() as SystemSettings);
      },
      (err) => console.error('Settings listener error:', err)
    );

    const unsubGeneral = onSnapshot(
      doc(db, 'cms', 'general'),
      (d) => d.exists() && setCMSGeneral(d.data() as CMSGeneral),
      (err) => console.error('CMS General listener error:', err)
    );
    const unsubLinks = onSnapshot(
      doc(db, 'cms', 'links'),
      (d) => d.exists() && setCMSLinks(d.data() as CMSLinks),
      (err) => console.error('CMS Links listener error:', err)
    );
    const unsubAcademy = onSnapshot(
      collection(db, 'cms_academy'),
      (snap) => setCmsAcademy(snap.docs.map((d) => ({ id: d.id, ...d.data() } as CMSAcademyItem))),
      (err) => console.error('Academy listener error:', err)
    );
    const unsubGallery = onSnapshot(
      collection(db, 'cms_gallery'),
      (snap) => setCmsGallery(snap.docs.map((d) => ({ id: d.id, ...d.data() } as CMSGalleryItem))),
      (err) => console.error('Gallery listener error:', err)
    );
    const unsubFaq = onSnapshot(
      query(collection(db, 'cms_faq'), orderBy('order')),
      (snap) => setCmsFaqs(snap.docs.map((d) => ({ id: d.id, ...d.data() } as CMSFaqItem))),
      (err) => console.error('FAQ listener error:', err)
    );
    const unsubTimeline = onSnapshot(
      query(collection(db, 'cms_timeline'), orderBy('order')),
      (snap) => setCmsTimeline(snap.docs.map((d) => ({ id: d.id, ...d.data() } as CMSTimelineItem))),
      (err) => console.error('Timeline listener error:', err)
    );
    const unsubPrizes = onSnapshot(
      collection(db, 'cms_prizes'),
      (snap) => setCmsPrizes(snap.docs.map((d) => ({ id: d.id, ...d.data() } as CMSPrize))),
      (err) => console.error('Prizes listener error:', err)
    );

    return () => {
      unsubSettings();
      unsubGeneral();
      unsubLinks();
      unsubAcademy();
      unsubGallery();
      unsubFaq();
      unsubTimeline();
      unsubPrizes();
    };
  }, []);

  const updateSystemSettings = async (s: SystemSettings) => {
    await setDoc(doc(db, 'system', 'settings'), s);
    showToast('Sistem ayarları güncellendi.', 'success');
  };
  const updateCMSGeneral = async (d: CMSGeneral) => {
    await setDoc(doc(db, 'cms', 'general'), d);
    showToast('Genel ayarlar güncellendi.', 'success');
  };
  const updateCMSLinks = async (d: CMSLinks) => {
    await setDoc(doc(db, 'cms', 'links'), d);
    showToast('Linkler güncellendi.', 'success');
  };

  const addCMSAcademyItem = async (i: CMSAcademyItem) => {
    try {
      await addDoc(collection(db, 'cms_academy'), sanitizeFirestoreData(i as unknown as Record<string, unknown>));
      showToast('Eklendi.', 'success');
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Ekleme başarısız.', 'error');
      throw e;
    }
  };
  const updateCMSAcademyItem = async (id: string, d: Partial<CMSAcademyItem>) => {
    try {
      await updateDoc(doc(db, 'cms_academy', id), sanitizeFirestoreData(d as Record<string, unknown>));
      showToast('Güncellendi.', 'success');
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Güncelleme başarısız.', 'error');
      throw e;
    }
  };
  const deleteCMSAcademyItem = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'cms_academy', id));
      showToast('Silindi.', 'success');
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Silme başarısız.', 'error');
      throw e;
    }
  };

  const addCMSGalleryItem = async (i: CMSGalleryItem) => {
    try {
      await addDoc(collection(db, 'cms_gallery'), sanitizeFirestoreData(i as unknown as Record<string, unknown>));
      showToast('Fotoğraf eklendi.', 'success');
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Ekleme başarısız.', 'error');
      throw e;
    }
  };
  const deleteCMSGalleryItem = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'cms_gallery', id));
      showToast('Fotoğraf silindi.', 'success');
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Silme başarısız.', 'error');
      throw e;
    }
  };

  const addCMSFaq = async (i: CMSFaqItem) => {
    try {
      await addDoc(collection(db, 'cms_faq'), sanitizeFirestoreData(i as unknown as Record<string, unknown>));
      showToast('Soru eklendi.', 'success');
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Ekleme başarısız.', 'error');
      throw e;
    }
  };
  const updateCMSFaq = async (id: string, d: Partial<CMSFaqItem>) => {
    try {
      await updateDoc(doc(db, 'cms_faq', id), sanitizeFirestoreData(d as Record<string, unknown>));
      showToast('Soru güncellendi.', 'success');
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Güncelleme başarısız.', 'error');
      throw e;
    }
  };
  const deleteCMSFaq = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'cms_faq', id));
      showToast('Soru silindi.', 'success');
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Silme başarısız.', 'error');
      throw e;
    }
  };

  const addCMSTimelineItem = async (i: CMSTimelineItem) => {
    try {
      await addDoc(
        collection(db, 'cms_timeline'),
        sanitizeFirestoreData(i as unknown as Record<string, unknown>)
      );
      showToast('Adım eklendi. Ana sayfa → Güncel Takvim’de görünür.', 'success');
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Timeline eklenemedi.', 'error');
      throw e;
    }
  };
  const updateCMSTimelineItem = async (id: string, d: Partial<CMSTimelineItem>) => {
    try {
      await updateDoc(
        doc(db, 'cms_timeline', id),
        sanitizeFirestoreData(d as Record<string, unknown>)
      );
      showToast('Adım güncellendi. Ana sayfa → Güncel Takvim’de yansır.', 'success');
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Timeline güncellenemedi.', 'error');
      throw e;
    }
  };
  const deleteCMSTimelineItem = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'cms_timeline', id));
      showToast('Adım silindi.', 'success');
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Silme başarısız.', 'error');
      throw e;
    }
  };

  const updateCMSPrize = async (p: CMSPrize) => {
    try {
      const { id, ...rest } = p;
      await setDoc(doc(db, 'cms_prizes', id), sanitizeFirestoreData(rest as Record<string, unknown>));
      showToast('Ödül güncellendi.', 'success');
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Ödül güncellenemedi.', 'error');
      throw e;
    }
  };

  return {
    systemSettings,
    cmsGeneral,
    cmsLinks,
    cmsAcademy,
    cmsGallery,
    cmsFaqs,
    cmsTimeline,
    cmsPrizes,
    updateSystemSettings,
    updateCMSGeneral,
    updateCMSLinks,
    addCMSAcademyItem,
    updateCMSAcademyItem,
    deleteCMSAcademyItem,
    addCMSGalleryItem,
    deleteCMSGalleryItem,
    addCMSFaq,
    updateCMSFaq,
    deleteCMSFaq,
    addCMSTimelineItem,
    updateCMSTimelineItem,
    deleteCMSTimelineItem,
    updateCMSPrize,
  };
}
