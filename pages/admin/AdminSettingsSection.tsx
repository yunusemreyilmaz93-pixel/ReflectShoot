import React, { useMemo } from 'react';
import {
  Users,
  Upload,
  Star,
  Database,
  Download,
  Plus,
  Power,
  Save,
  AlertTriangle,
  CheckCircle2,
  Circle,
  Calendar,
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { ToggleSwitch, DateInput } from './AdminFormControls';
import { AdminSeasonWizard } from './AdminSeasonWizard';

type ChecklistItem = {
  id: string;
  label: string;
  hint?: string;
  done: boolean;
};

export const AdminSettings: React.FC = () => {
  const {
    systemSettings,
    updateSystemSettings,
    downloadFullBackup,
    seedAcademyContent,
    tagLegacySeasons,
    showToast,
  } = useAppContext();

  const season = systemSettings.season;
  const dates = systemSettings.dates;
  const features = systemSettings.features;

  const checklist: ChecklistItem[] = useMemo(() => {
    const hasSeason =
      !!season?.id?.trim() && !!season?.label?.trim();
    const hasCoreDates = !!(
      dates.applicationStart &&
      dates.applicationEnd &&
      dates.videoUploadStart &&
      dates.videoUploadEnd &&
      dates.galaDate
    );
    return [
      {
        id: 'season',
        label: 'Sezon ID ve etiketi tanımlı',
        hint: season?.id ? `${season.id} — ${season.label || 'etiket yok'}` : 'Henüz set edilmedi',
        done: hasSeason,
      },
      {
        id: 'dates',
        label: 'Temel tarihler dolu (başvuru, video, gala)',
        done: hasCoreDates,
      },
      {
        id: 'backup',
        label: 'Yedek alındı (operatör onayı)',
        hint: 'Yeni sezona geçmeden “Yedek İndir” çalıştırın',
        done: false, // intentional: never auto-check — human gate
      },
      {
        id: 'lock',
        label: 'Yeni başvurular kilitli (sezon arşiv)',
        hint: 'Kapanışta açın; yeni sezonda kapatın',
        done: !!features.blockNewApplications,
      },
      {
        id: 'legacy',
        label: 'Legacy etiket (etiketsiz başvurular)',
        hint: 'Dry-run → onay → etiketle',
        done: false,
      },
    ];
  }, [season, dates, features.blockNewApplications]);

  const doneCount = checklist.filter((c) => c.done).length;

  const handleSettingsUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSystemSettings(systemSettings);
      showToast('Ayarlar kaydedildi.', 'success');
    } catch {
      showToast('Ayarlar kaydedilemedi.', 'error');
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-10">
      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="font-bold text-white text-lg">Yapılandırma Merkezi</h3>
          <p className="text-slate-400 text-xs mt-1">
            Yarışma kurallarını, tarihleri ve sistem kilitlerini buradan yönetebilirsiniz.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSettingsUpdate}
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2 transform hover:-translate-y-0.5"
        >
          <Save size={20} /> Ayarları Kaydet
        </button>
      </div>

      {/* Season operations checklist */}
      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-slate-700">
          <h4 className="font-bold text-white flex items-center gap-2 text-sm uppercase tracking-wider">
            <Calendar size={18} className="text-rose-500" /> Sezon Operasyonu
          </h4>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
            {doneCount}/{checklist.length} adım hazır
          </span>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Hızlı yol: aşağıdaki <strong className="text-slate-300">Yeni Sezon Oluştur</strong>.
          Manuel yol: Yedek → Legacy etiket → ID/tarih → Kaydet.
        </p>
        <div className="mb-6">
          <AdminSeasonWizard />
        </div>
        <ul className="space-y-2 mb-6">
          {checklist.map((item) => (
            <li
              key={item.id}
              className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/50 border border-slate-700/80"
            >
              {item.done ? (
                <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0 mt-0.5" />
              ) : (
                <Circle size={18} className="text-slate-600 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className={`text-sm font-bold ${item.done ? 'text-slate-200' : 'text-slate-400'}`}>
                  {item.label}
                </p>
                {item.hint && <p className="text-[10px] text-slate-500 mt-0.5">{item.hint}</p>}
              </div>
            </li>
          ))}
        </ul>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl border border-slate-700 bg-slate-900/50">
          <div>
            <label htmlFor="season-id" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Sezon ID
            </label>
            <input
              id="season-id"
              value={season?.id || '2026'}
              onChange={(e) =>
                updateSystemSettings({
                  ...systemSettings,
                  season: {
                    id: e.target.value.trim() || '2026',
                    label: season?.label || 'Reflect & Shoot 2026',
                  },
                })
              }
              className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-rose-500"
            />
          </div>
          <div>
            <label htmlFor="season-label" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Sezon Etiketi
            </label>
            <input
              id="season-label"
              value={season?.label || ''}
              onChange={(e) =>
                updateSystemSettings({
                  ...systemSettings,
                  season: {
                    id: season?.id || '2026',
                    label: e.target.value,
                  },
                })
              }
              className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-rose-500"
            />
          </div>
          <div className="sm:col-span-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={async () => {
                try {
                  const r = await tagLegacySeasons?.(true);
                  showToast(
                    r
                      ? `Dry-run: ${r.legacyCount} legacy, sezon ${r.seasonId}`
                      : 'Dry-run tamam',
                    'success'
                  );
                } catch (e: unknown) {
                  const msg = e instanceof Error ? e.message : 'Dry-run başarısız';
                  showToast(msg, 'error');
                }
              }}
              className="px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs font-bold text-white"
            >
              Legacy sayımı (dry-run)
            </button>
            <button
              type="button"
              onClick={async () => {
                if (!window.confirm('Etiketsiz başvurular aktif sezona yazılsın mı?')) return;
                try {
                  const r = await tagLegacySeasons?.(false);
                  showToast(
                    r ? `${r.updated} başvuru etiketlendi (${r.seasonId})` : 'Etiketleme tamam',
                    'success'
                  );
                } catch (e: unknown) {
                  const msg = e instanceof Error ? e.message : 'Etiketleme başarısız';
                  showToast(msg, 'error');
                }
              }}
              className="px-3 py-2 rounded-lg bg-amber-700 hover:bg-amber-600 text-xs font-bold text-white"
            >
              Legacy etiketle
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
            <h4 className="font-bold text-white mb-6 pb-2 border-b border-slate-700 flex items-center gap-2 text-sm uppercase tracking-wider">
              <Users size={18} className="text-blue-500" /> Başvuru Süreci
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <DateInput
                label="Başvuru Başlangıç"
                value={dates.applicationStart}
                onChange={(val) =>
                  updateSystemSettings({
                    ...systemSettings,
                    dates: { ...dates, applicationStart: val },
                  })
                }
              />
              <DateInput
                label="Başvuru Bitiş"
                value={dates.applicationEnd}
                onChange={(val) =>
                  updateSystemSettings({
                    ...systemSettings,
                    dates: { ...dates, applicationEnd: val },
                  })
                }
              />
            </div>
          </div>

          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
            <h4 className="font-bold text-white mb-6 pb-2 border-b border-slate-700 flex items-center gap-2 text-sm uppercase tracking-wider">
              <Upload size={18} className="text-purple-500" /> Eser Yükleme (Eş Zamanlı)
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <DateInput
                label="Yükleme Başlangıç"
                value={dates.videoUploadStart}
                onChange={(val) =>
                  updateSystemSettings({
                    ...systemSettings,
                    dates: { ...dates, videoUploadStart: val },
                  })
                }
              />
              <DateInput
                label="Yükleme Bitiş"
                value={dates.videoUploadEnd}
                onChange={(val) =>
                  updateSystemSettings({
                    ...systemSettings,
                    dates: { ...dates, videoUploadEnd: val },
                  })
                }
              />
            </div>
          </div>

          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
            <h4 className="font-bold text-white mb-6 pb-2 border-b border-slate-700 flex items-center gap-2 text-sm uppercase tracking-wider">
              <Star size={18} className="text-amber-500" /> Final & Etkinlik
            </h4>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <DateInput
                  label="Finalistleri Açıkla"
                  value={dates.finalistRevealStart || ''}
                  onChange={(val) =>
                    updateSystemSettings({
                      ...systemSettings,
                      dates: { ...dates, finalistRevealStart: val },
                    })
                  }
                />
                <DateInput
                  label="Akademi Başlangıç"
                  value={dates.academyStart}
                  onChange={(val) =>
                    updateSystemSettings({
                      ...systemSettings,
                      dates: { ...dates, academyStart: val },
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-1">
                <DateInput
                  label="Ödül Töreni Tarihi"
                  value={dates.galaDate}
                  onChange={(val) =>
                    updateSystemSettings({
                      ...systemSettings,
                      dates: { ...dates, galaDate: val },
                    })
                  }
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
            <h4 className="font-bold text-white mb-6 pb-2 border-b border-slate-700 flex items-center gap-2 text-sm uppercase tracking-wider">
              <Database size={18} className="text-amber-500" /> Veri & Güvenlik
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-slate-300">Veri Yedekleme</p>
                  <p className="text-[10px] text-slate-500">Tüm veritabanını JSON formatında indir.</p>
                </div>
                <button
                  type="button"
                  onClick={downloadFullBackup}
                  className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors border border-slate-600 shrink-0"
                >
                  <Download size={14} /> Yedek İndir
                </button>
              </div>

              <div className="border-t border-slate-700 my-2" />

              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-slate-300">İçerik Başlatma</p>
                  <p className="text-[10px] text-slate-500">Varsayılan akademi içeriklerini yükler.</p>
                </div>
                <button
                  type="button"
                  onClick={seedAcademyContent}
                  className="bg-slate-700 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors border border-slate-600 shrink-0"
                >
                  <Plus size={14} /> İçerik Yükle
                </button>
              </div>

              <div className="border-t border-slate-700 my-4" />

              <ToggleSwitch
                label="Bakım Modu (Maintenance)"
                checked={features.maintenanceMode}
                onChange={() =>
                  updateSystemSettings({
                    ...systemSettings,
                    features: {
                      ...features,
                      maintenanceMode: !features.maintenanceMode,
                    },
                  })
                }
                activeColor="bg-red-500"
              />
              <div className="bg-red-900/20 p-3 rounded-lg border border-red-900/50 text-xs text-red-300 mt-2 flex gap-2">
                <AlertTriangle size={16} className="flex-shrink-0" />
                <strong>Dikkat:</strong> Bakım modu açıldığında, Admin dışındaki tüm kullanıcılar
                &quot;Bakımdayız&quot; sayfasına yönlendirilir ve sisteme erişemezler.
              </div>
            </div>
          </div>

          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
            <h4 className="font-bold text-white mb-6 pb-2 border-b border-slate-700 flex items-center gap-2 text-sm uppercase tracking-wider">
              <Power size={18} className="text-rose-500" /> Diğer Kontroller
            </h4>
            <div className="space-y-4">
              <ToggleSwitch
                label="Yeni Kayıtları Kabul Et"
                checked={features.allowNewRegistrations}
                onChange={() =>
                  updateSystemSettings({
                    ...systemSettings,
                    features: {
                      ...features,
                      allowNewRegistrations: !features.allowNewRegistrations,
                    },
                  })
                }
                activeColor="bg-blue-500"
              />

              <ToggleSwitch
                label="Yeni Başvuruları Kilitle (sezon arşiv)"
                checked={!!features.blockNewApplications}
                onChange={() =>
                  updateSystemSettings({
                    ...systemSettings,
                    features: {
                      ...features,
                      blockNewApplications: !features.blockNewApplications,
                    },
                  })
                }
                activeColor="bg-amber-600"
              />
              <p className="text-[10px] text-slate-500 px-2 -mt-2 mb-2">
                * Açıkken öğretmenler yeni takım oluşturamaz. Mevcut başvurular etkilenmez.
              </p>

              <ToggleSwitch
                label="Video Yüklemeyi Aktif Et"
                checked={features.videoUploadActive}
                onChange={() =>
                  updateSystemSettings({
                    ...systemSettings,
                    features: {
                      ...features,
                      videoUploadActive: !features.videoUploadActive,
                    },
                  })
                }
                activeColor="bg-purple-500"
              />
              <p className="text-[10px] text-slate-500 px-2 -mt-2 mb-4">
                * Kapalıysa tarih aralığı uygun olsa bile video yüklenemez. Açık ise tarih kontrol edilir.
              </p>

              <ToggleSwitch
                label="Jüri Değerlendirme Sistemi"
                checked={features.judgeSystemActive}
                onChange={() =>
                  updateSystemSettings({
                    ...systemSettings,
                    features: {
                      ...features,
                      judgeSystemActive: !features.judgeSystemActive,
                    },
                  })
                }
                activeColor="bg-green-500"
              />

              <div className="pt-4 mt-4 border-t border-slate-700">
                <ToggleSwitch
                  label="Sonuçları Herkese İlan Et"
                  checked={features.publicResultReveal}
                  onChange={() =>
                    updateSystemSettings({
                      ...systemSettings,
                      features: {
                        ...features,
                        publicResultReveal: !features.publicResultReveal,
                      },
                    })
                  }
                  activeColor="bg-rose-500"
                />
                <div className="bg-rose-900/20 p-3 rounded-lg border border-rose-900/50 text-xs text-rose-300 mt-3 flex gap-2">
                  <AlertTriangle size={16} className="flex-shrink-0" />
                  <strong>Dikkat:</strong> Açıldığında kazananlar ana sayfada listelenir. Genellikle
                  Ödül Töreni sonrası açılmalıdır.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
