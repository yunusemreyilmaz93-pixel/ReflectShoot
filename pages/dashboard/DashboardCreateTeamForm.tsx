import React, { useState, useEffect } from 'react';
import { Clapperboard, Users, AlertCircle, X, Sparkles, Ban } from 'lucide-react';
import { Category, Theme, type Application } from '../../types';
import { versesList, verseDetails } from '../../data/verses';
import { validateCreateTeamForm } from '../../lib/domain/teacherDashboard';
import { TeamSwitcher } from './DashboardWidgets';
import { renderVerseText } from './dashboardUiUtils';

export type TeamFormState = {
  teamName: string;
  category: Category;
  theme: Theme;
  selectedVerse: string;
  selectedTopic: string;
  students: Array<{ firstName: string; lastName: string; grade: string }>;
};

const emptyForm = (): TeamFormState => ({
  teamName: '',
  category: Category.LIVE_ACTION,
  theme: Theme.AYET,
  selectedVerse: versesList[0],
  selectedTopic: '',
  students: [
    { firstName: '', lastName: '', grade: '' },
    { firstName: '', lastName: '', grade: '' },
    { firstName: '', lastName: '', grade: '' },
  ],
});

type Props = {
  myApplications: Application[];
  activeApplicationId: string | null;
  showCreateForm: boolean;
  canCreateTeam: boolean;
  createBlockedReason: string | null;
  onSwitch: (id: string) => void;
  onCreate: () => void;
  onCancel: () => void;
  onSubmit: (form: TeamFormState) => Promise<void>;
  showToast: (msg: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
};

export function DashboardCreateTeamForm({
  myApplications,
  activeApplicationId,
  showCreateForm,
  canCreateTeam,
  createBlockedReason,
  onSwitch,
  onCreate,
  onCancel,
  onSubmit,
  showToast,
}: Props) {
  const [teamForm, setTeamForm] = useState<TeamFormState>(emptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (showCreateForm) {
      setTeamForm(emptyForm());
      setFormErrors({});
    }
  }, [showCreateForm]);

  if (!canCreateTeam && myApplications.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fadeIn min-h-screen">
        <div className="max-w-lg mx-auto bg-slate-900 border border-slate-700 rounded-[2rem] p-10 text-center">
          <Ban size={40} className="mx-auto text-amber-500 mb-4" />
          <h2 className="text-2xl font-black text-white mb-3">Başvuru Kapalı</h2>
          <p className="text-slate-400 text-sm">
            {createBlockedReason || 'Yeni takım başvurusu şu an kabul edilmiyor.'}
          </p>
        </div>
      </div>
    );
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCreateTeam) {
      showToast(createBlockedReason || 'Yeni başvuru şu an kapalı.', 'error');
      return;
    }
    const errs = validateCreateTeamForm(teamForm);
    setFormErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setIsCreating(true);
    try {
      await onSubmit(teamForm);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Başvuru oluşturulamadı.';
      showToast(msg, 'error');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fadeIn min-h-screen">
      <TeamSwitcher
        applications={myApplications}
        activeId={showCreateForm ? null : activeApplicationId}
        onSwitch={onSwitch}
        onCreate={onCreate}
        canCreate={canCreateTeam}
        createBlockedReason={createBlockedReason}
      />

      <div className="max-w-4xl mx-auto w-full bg-slate-900 border border-slate-700 rounded-[2rem] p-8 md:p-12 shadow-2xl relative overflow-hidden mt-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-[80px] pointer-events-none -mr-20 -mt-20" />
        <h2 className="text-3xl md:text-4xl font-black text-white mb-8 flex items-center gap-4">
          <Clapperboard className="text-rose-500" size={40} /> Prodüksiyonu Başlat
        </h2>
        <form onSubmit={handleCreateSubmit} className="space-y-8 relative z-10">
          {showCreateForm && myApplications.length > 0 && (
            <button
              type="button"
              onClick={onCancel}
              className="absolute -top-16 right-0 text-slate-400 hover:text-white flex items-center gap-2 font-bold text-sm"
            >
              <X size={20} /> Vazgeç
            </button>
          )}
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <label
                htmlFor="teamName"
                className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider"
              >
                Takım Adı
              </label>
              <input
                name="teamName"
                id="teamName"
                value={teamForm.teamName}
                onChange={(e) => setTeamForm({ ...teamForm, teamName: e.target.value })}
                maxLength={40}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white focus:border-rose-500 outline-none text-lg font-bold placeholder-slate-700 transition-colors"
                placeholder="Örn: Yıldızlar Ekibi"
              />
              {formErrors.teamName && (
                <p className="text-rose-400 text-xs mt-2 font-medium">{formErrors.teamName}</p>
              )}
              {formErrors.students && (
                <p className="text-rose-400 text-xs mt-2 font-medium">{formErrors.students}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider"
              >
                Kategori
              </label>
              <select
                name="category"
                id="category"
                value={teamForm.category}
                onChange={(e) =>
                  setTeamForm({ ...teamForm, category: e.target.value as Category })
                }
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white focus:border-rose-500 outline-none text-lg font-bold transition-colors"
              >
                {Object.values(Category).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <label
                htmlFor="theme"
                className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider"
              >
                Proje Teması
              </label>
              <select
                name="theme"
                id="theme"
                value={teamForm.theme}
                onChange={(e) => setTeamForm({ ...teamForm, theme: e.target.value as Theme })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white focus:border-rose-500 outline-none text-lg font-bold transition-colors"
              >
                {Object.values(Theme).map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            {teamForm.theme === Theme.AYET && (
              <div>
                <label
                  htmlFor="selectedVerse"
                  className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider"
                >
                  Seçilen Ayet
                </label>
                <select
                  name="selectedVerse"
                  id="selectedVerse"
                  value={teamForm.selectedVerse}
                  onChange={(e) => setTeamForm({ ...teamForm, selectedVerse: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white focus:border-rose-500 outline-none text-lg font-bold transition-colors"
                >
                  {versesList.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {(teamForm.theme === Theme.HADITH || teamForm.theme === Theme.SAHABE) && (
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">
                  {teamForm.theme === Theme.HADITH ? 'Seçilen Hadis' : 'Seçilen Sahabe'}
                </label>
                <input
                  type="text"
                  placeholder={
                    teamForm.theme === Theme.HADITH
                      ? 'Örn: Ameller niyetlere göredir'
                      : "Örn: Hz. Mus'ab b. Umeyr"
                  }
                  value={teamForm.selectedTopic}
                  onChange={(e) => setTeamForm({ ...teamForm, selectedTopic: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white focus:border-rose-500 outline-none text-lg font-bold transition-colors"
                />
              </div>
            )}
          </div>

          {teamForm.theme === Theme.AYET &&
            teamForm.selectedVerse &&
            verseDetails[teamForm.selectedVerse] && (
              <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-6 animate-fadeIn">
                <p
                  className="text-right text-xl font-serif text-amber-400 leading-loose mb-4"
                  dir="rtl"
                >
                  {renderVerseText(verseDetails[teamForm.selectedVerse].arabic, true)}
                </p>
                <div className="w-full h-px bg-slate-800 mb-4" />
                <p className="text-sm text-slate-300 italic">
                  &quot;{renderVerseText(verseDetails[teamForm.selectedVerse].turkish, false)}&quot;
                </p>
              </div>
            )}

          {teamForm.theme === Theme.HADITH && (
            <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-6 animate-fadeIn flex flex-col items-center text-center gap-3">
              <Sparkles className="text-amber-500" size={24} />
              <p className="text-amber-400 font-serif text-lg" dir="rtl">
                إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ
              </p>
              <p className="text-sm text-slate-300 italic">
                &quot;Ameller niyetlere göredir.&quot; (Buhârî, Bed’ü’l-vahy, 1)
              </p>
            </div>
          )}

          {teamForm.theme === Theme.SAHABE && (
            <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-6 animate-fadeIn flex flex-col items-center text-center gap-3">
              <Users className="text-teal-500" size={24} />
              <h5 className="text-white font-bold">Sahabe-i Kiram&apos;ın İzinde</h5>
              <p className="text-xs text-slate-400 leading-relaxed">
                İslam&apos;ın ilk sancaktarları, fedakarlık ve sadakat timsalleri. Hz. Mus&apos;ab
                b. Umeyr&apos;in daveti, Hz. Bilal&apos;in sabrı ve Hz. Hatice&apos;nin desteği gibi
                nice hikmetli hayatlar...
              </p>
            </div>
          )}

          <div className="flex items-center gap-3 p-4 bg-amber-900/10 border border-amber-500/20 rounded-xl">
            <AlertCircle className="text-amber-500 flex-shrink-0" size={20} />
            <p className="text-xs text-amber-200/80 font-medium">
              <strong className="text-amber-500">Önemli:</strong> Seçilen{' '}
              <span className="text-white">Kategori</span> ve{' '}
              <span className="text-white">Proje Teması</span> kayıt tamamlandıktan sonra{' '}
              <span className="underline decoration-amber-500/50">değiştirilemez</span>. Lütfen
              seçimlerinizi kontrol ediniz.
            </p>
          </div>

          <div className="bg-slate-950/50 p-6 rounded-2xl border border-slate-800">
            <h4 className="text-white font-bold mb-4 flex items-center gap-2">
              <Users size={18} className="text-teal-500" /> İlk 3 Öğrenci (Zorunlu)
            </h4>
            <div className="grid gap-4">
              {teamForm.students.map((s, i) => (
                <div key={i} className="grid grid-cols-3 gap-4">
                  <input
                    placeholder="Ad"
                    value={s.firstName}
                    onChange={(e) => {
                      const n = [...teamForm.students];
                      n[i] = { ...n[i], firstName: e.target.value };
                      setTeamForm({ ...teamForm, students: n });
                    }}
                    className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-teal-500"
                  />
                  <input
                    placeholder="Soyad"
                    value={s.lastName}
                    onChange={(e) => {
                      const n = [...teamForm.students];
                      n[i] = { ...n[i], lastName: e.target.value };
                      setTeamForm({ ...teamForm, students: n });
                    }}
                    className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-teal-500"
                  />
                  <input
                    placeholder="Sınıf (Örn: 11-A)"
                    value={s.grade}
                    onChange={(e) => {
                      const n = [...teamForm.students];
                      n[i] = { ...n[i], grade: e.target.value };
                      setTeamForm({ ...teamForm, students: n });
                    }}
                    className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-teal-500"
                  />
                </div>
              ))}
            </div>
          </div>
          <button
            type="submit"
            disabled={isCreating}
            className="w-full bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white py-5 rounded-2xl font-black text-xl shadow-lg shadow-rose-900/30 transition-all flex items-center justify-center gap-3 transform hover:-translate-y-1"
          >
            {isCreating ? 'Sahne Kuruluyor...' : 'Motor! (Başvuruyu Tamamla)'}
          </button>
        </form>
      </div>
    </div>
  );
}
