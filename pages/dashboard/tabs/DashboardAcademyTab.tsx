import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  ExternalLink,
  BookOpen,
  Clock,
  ArrowRight,
  Copy,
  Lock,
  Share2,
  Crown,
  Link as LinkIcon,
  MessageCircle,
} from 'lucide-react';
import { useDashboardUI } from '../DashboardUIContext';
import {
  teacherAcademyItems,
  academyResourceUrl,
  academyShareCode,
  buildClassroomShareText,
  academyPublicPageUrl,
  academyWhatsAppShareUrl,
} from '../../../lib/domain/academy';
import type { CMSAcademyItem } from '../../../types';

export function DashboardAcademyTab() {
  const {
    cmsAcademy,
    getCategoryStyle,
    currentApplication,
    myApplications,
    showToast,
  } = useDashboardUI();

  const [codeInput, setCodeInput] = useState('');
  /** After “Sınıfa paylaş”, offer optional WhatsApp open for that item id */
  const [whatsAppForId, setWhatsAppForId] = useState<string | null>(null);
  const { publicItems, finalistItems, isFinalistTeacher } = useMemo(
    () => teacherAcademyItems(cmsAcademy, myApplications),
    [cmsAcademy, myApplications]
  );

  const openItem = (item: CMSAcademyItem) => {
    const url = academyResourceUrl(item);
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
    else showToast('Bu içerik için bağlantı tanımlı değil.', 'warning');
  };

  const copyShare = async (item: CMSAcademyItem) => {
    const text = buildClassroomShareText(item, academyPublicPageUrl());
    try {
      await navigator.clipboard.writeText(text);
      setWhatsAppForId(item.id);
      showToast('Sınıf paylaşım metni kopyalandı.', 'success');
    } catch {
      showToast('Kopyalanamadı.', 'error');
    }
  };

  const openWhatsApp = (item: CMSAcademyItem) => {
    const url = academyWhatsAppShareUrl(item, academyPublicPageUrl());
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const copyCode = async (item: CMSAcademyItem) => {
    try {
      await navigator.clipboard.writeText(academyShareCode(item.id));
      showToast('Kod kopyalandı!', 'success');
    } catch {
      showToast('Kopyalanamadı.', 'error');
    }
  };

  const openByCode = () => {
    const all = [...publicItems, ...finalistItems];
    const found = all.find(
      (i) => academyShareCode(i.id) === codeInput.trim().toUpperCase()
    );
    if (!found) {
      showToast('Kod bulunamadı (finalist içeriği sadece finalist öğretmenlerde).', 'error');
      return;
    }
    openItem(found);
  };

  const renderCard = (item: CMSAcademyItem, locked = false) => {
    const styles = getCategoryStyle(item.category);
    return (
      <div
        key={item.id}
        className={`group bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden transition-all ${
          locked ? 'opacity-70' : 'hover:border-slate-600 hover:-translate-y-1'
        }`}
      >
        <button
          type="button"
          disabled={locked}
          onClick={() => !locked && openItem(item)}
          className="w-full text-left"
        >
          <div className="h-40 relative overflow-hidden">
            <img
              src={
                item.coverImage ||
                'https://images.unsplash.com/photo-1478720568477-152d9b164e63?auto=format&fit=crop&q=80&w=800'
              }
              alt=""
              className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
            <div className="absolute bottom-4 left-4 flex gap-2">
              <span
                className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${styles.badge}`}
              >
                {item.category}
              </span>
              {item.isStarterPack && (
                <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Başlangıç
                </span>
              )}
            </div>
            {locked && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-950/50">
                <Lock className="text-amber-400" size={28} />
              </div>
            )}
          </div>
          <div className="p-6 pb-3">
            <h4 className={`text-white font-bold mb-2 line-clamp-1 ${styles.title}`}>
              {item.title}
            </h4>
            <p className="text-slate-500 text-xs line-clamp-2 mb-3">{item.description}</p>
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
              <span className="text-slate-600 flex items-center gap-1">
                <LinkIcon size={12} /> {academyShareCode(item.id)}
              </span>
              <span className={`flex items-center gap-1 ${styles.btn}`}>
                {locked ? 'Kilitli' : 'Aç'} <ArrowRight size={12} />
              </span>
            </div>
          </div>
        </button>
        {!locked && (
          <div className="px-6 pb-5 space-y-2">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => copyShare(item)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700"
              >
                <Share2 size={14} /> Sınıfa paylaş
              </button>
              <button
                type="button"
                onClick={() => copyCode(item)}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700"
                title="Kodu kopyala"
              >
                <Copy size={14} />
              </button>
            </div>
            {whatsAppForId === item.id && (
              <button
                type="button"
                onClick={() => openWhatsApp(item)}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-900/40 hover:bg-emerald-800/50 text-xs font-bold text-emerald-300 border border-emerald-700/40"
              >
                <MessageCircle size={14} /> WhatsApp’ta aç
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-black text-white">Akademi</h3>
          <p className="text-slate-400 text-sm">
            Public içerikler + (finalist iseniz) kilitli paket. Öğrenci hesabı gerekmez — sınıfınıza
            link/kod paylaşın.
          </p>
          {currentApplication?.team.isFinalist && (
            <p className="text-amber-400/90 text-xs font-bold mt-1 flex items-center gap-1">
              <Crown size={12} /> Finalist takım — özel içerikler açık
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2">
            <input
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              placeholder="Sınıf kodu"
              className="bg-transparent text-sm text-white outline-none w-24"
              aria-label="Akademi sınıf kodu"
            />
            <button
              type="button"
              onClick={openByCode}
              className="text-xs font-bold text-rose-400 hover:text-rose-300"
            >
              Aç
            </button>
          </div>
          <button
            type="button"
            onClick={() => {
              window.location.hash = '#/academy';
            }}
            className="text-rose-500 hover:text-rose-400 text-sm font-bold flex items-center gap-2 px-3 py-2"
          >
            Public sayfa <ExternalLink size={16} />
          </button>
        </div>
      </div>

      <section>
        <h4 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
          <BookOpen size={16} /> Herkese açık paket
        </h4>
        {publicItems.length === 0 ? (
          <div className="p-10 rounded-3xl border border-dashed border-slate-700 text-center text-slate-500 text-sm">
            Henüz public akademi içeriği yok. Admin CMS → Akademi’den ekleyin.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publicItems.map((item) => renderCard(item))}
          </div>
        )}
      </section>

      <section>
        <h4 className="text-sm font-black uppercase tracking-widest text-amber-500/80 mb-4 flex items-center gap-2">
          <Crown size={16} /> Finalist akademi
        </h4>
        {isFinalistTeacher ? (
          finalistItems.length === 0 ? (
            <div className="p-8 rounded-3xl border border-amber-500/20 bg-amber-500/5 text-amber-100/70 text-sm">
              Finalistsiniz; henüz finalist içeriği CMS’e eklenmemiş.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {finalistItems.map((item) => renderCard(item))}
            </div>
          )
        ) : (
          <div className="p-8 rounded-3xl border border-slate-800 bg-slate-900/40 flex items-start gap-3 text-sm text-slate-400">
            <Lock className="text-slate-600 shrink-0 mt-0.5" size={18} />
            <p>
              Finalist akademi yalnızca finalist takım danışmanlarına açıktır. Takımınız finalist
              seçildiğinde burada kilitli materyaller belirir. Public içerikleri dilediğiniz zaman
              sınıfınıza paylaşabilirsiniz.
            </p>
          </div>
        )}
      </section>

      <p className="text-[11px] text-slate-600 flex items-center gap-1">
        <Clock size={12} /> Sertifikalar Genel Bakış sekmesinde (sezon sonu).
      </p>
    </motion.div>
  );
}
