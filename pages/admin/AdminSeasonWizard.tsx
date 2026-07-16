import React, { useState } from 'react';
import { Calendar, Rocket, AlertTriangle, Download, CheckCircle2, ExternalLink } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { getActiveSeason, validateNewSeasonId } from '../../lib/domain/season';

/** Deep-link into Admin CMS Timeline tab (HashRouter). */
const TIMELINE_CMS_HASH = '#/admin?tab=CONTENT&cms=TIMELINE';

/**
 * One-shot admin control to open a new competition season.
 * Archives previous-season apps and shifts date template by +1 year.
 */
export const AdminSeasonWizard: React.FC = () => {
  const {
    systemSettings,
    startNewSeason,
    downloadFullBackup,
    showToast,
  } = useAppContext();

  const current = getActiveSeason(systemSettings);
  const nextYear = String(Number(current.id.replace(/\D/g, '') || new Date().getFullYear()) + 1 || new Date().getFullYear() + 1);

  const [newId, setNewId] = useState(nextYear.length === 4 ? nextYear : `${current.id}-next`);
  const [newLabel, setNewLabel] = useState(`Reflect & Shoot ${nextYear}`);
  const [archivePrevious, setArchivePrevious] = useState(true);
  const [openApplications, setOpenApplications] = useState(true);
  const [busy, setBusy] = useState(false);
  const [backedUp, setBackedUp] = useState(false);
  const [seasonJustOpened, setSeasonJustOpened] = useState(false);

  const handleStart = async () => {
    const err = validateNewSeasonId(newId, current.id);
    if (err) {
      showToast(err, 'error');
      return;
    }
    if (!backedUp) {
      const ok = window.confirm(
        'Yedek indirmeden devam etmek istediğinize emin misiniz? Önce “Yedek İndir” önerilir.'
      );
      if (!ok) return;
    }
    const confirmMsg = [
      `Yeni sezon: ${newId} — ${newLabel}`,
      `Önceki: ${current.id}`,
      archivePrevious ? 'Eski sezon başvuruları arşivlenecek.' : 'Eski başvurular arşivlenmeyecek.',
      openApplications ? 'Yeni kayıt/başvuru açılacak.' : 'Başvurular kilitli kalacak.',
      'Tarihler +1 yıl kaydırılacak; video yükleme ve jüri kapatılacak (siz açarsınız).',
      '',
      'Devam edilsin mi?',
    ].join('\n');
    if (!window.confirm(confirmMsg)) return;

    setBusy(true);
    try {
      await startNewSeason?.({
        id: newId.trim(),
        label: newLabel.trim(),
        shiftYears: 1,
        openApplications,
        resetVideoUpload: true,
        archivePrevious,
      });
      setSeasonJustOpened(true);
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Sezon açılamadı.', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-rose-950/40 to-slate-900 p-6 rounded-2xl border border-rose-500/30">
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 rounded-xl bg-rose-600/20 text-rose-400">
          <Rocket size={20} />
        </div>
        <div>
          <h4 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
            <Calendar size={16} /> Yeni Sezon Oluştur
          </h4>
          <p className="text-xs text-slate-400 mt-1">
            Aktif sezon: <strong className="text-white">{current.label}</strong> ({current.id}).
            Öğretmenler önceki sezonda takımı olsa bile yeni sezonda yeniden başvuru açabilir (arşiv
            limit sayılmaz).
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 mb-4">
        <div>
          <label htmlFor="new-season-id" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Yeni Sezon ID
          </label>
          <input
            id="new-season-id"
            value={newId}
            onChange={(e) => setNewId(e.target.value)}
            className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-rose-500"
            placeholder="2027"
          />
        </div>
        <div>
          <label htmlFor="new-season-label" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Yeni Sezon Etiketi
          </label>
          <input
            id="new-season-label"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-rose-500"
          />
        </div>
      </div>

      <div className="space-y-2 mb-4 text-sm">
        <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={archivePrevious}
            onChange={(e) => setArchivePrevious(e.target.checked)}
            className="accent-rose-600"
          />
          Önceki sezon başvurularını arşivle
        </label>
        <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={openApplications}
            onChange={(e) => setOpenApplications(e.target.checked)}
            className="accent-rose-600"
          />
          Yeni kayıt ve başvurulari aç
        </label>
      </div>

      <div className="bg-amber-900/20 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-100/90 flex gap-2 mb-4">
        <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
        <span>
          Tarihler otomatik +1 yıl kayar. Video yükleme ve jüri sistemi kapanır; gala/sonuç ilanı
          kapanır. CMS timeline’ı ayrıca güncelleyin.
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={async () => {
            try {
              await downloadFullBackup();
              setBackedUp(true);
            } catch {
              /* toast in context */
            }
          }}
          className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold flex items-center gap-2"
        >
          <Download size={14} /> {backedUp ? 'Yedek alındı' : 'Önce Yedek İndir'}
          {backedUp && <CheckCircle2 size={14} className="text-emerald-400" />}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={handleStart}
          className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black flex items-center gap-2 disabled:opacity-50"
        >
          <Rocket size={14} /> {busy ? 'İşleniyor…' : 'Yeni Sezonu Başlat'}
        </button>
      </div>

      {seasonJustOpened && (
        <div className="mt-4 p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2 text-sm text-emerald-100/90">
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
            <span>
              Sezon açıldı. Public Timeline CMS’ten güncel takvimi düzenleyin — aksi halde sitede
              eski veya boş tarih görünür.
            </span>
          </div>
          <a
            href={TIMELINE_CMS_HASH}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black whitespace-nowrap"
          >
            Timeline CMS’i güncelle <ExternalLink size={14} />
          </a>
        </div>
      )}
    </div>
  );
};
