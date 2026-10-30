import React, { useState, useEffect } from 'react';
import { Clapperboard, Users, AlertCircle, Plus, Trash2, Ban, X } from 'lucide-react';
import { type Category, type Theme, type Application } from '../../types';
import { versesList, verseDetails } from '../../data/verses';
import { ACTIVE_CATEGORY, ACTIVE_THEME } from '../../lib/domain/competition';
import { MAX_STUDENTS_PER_TEAM, MIN_STUDENTS_PER_TEAM } from '../../lib/domain/teamValidation';
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
  category: ACTIVE_CATEGORY,
  theme: ACTIVE_THEME,
  // One film combining both surahs: no single verse is chosen.
  selectedVerse: '',
  selectedTopic: '',
  students: Array.from({ length: MIN_STUDENTS_PER_TEAM }, () => ({ firstName: '', lastName: '', grade: '' })),
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
              <p className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">Kategori</p>
              <div className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white text-lg font-bold">
                {ACTIVE_CATEGORY}
              </div>
            </div>
          </div>

          <div>
            <p className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">Proje Teması</p>
            <div className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white text-lg font-bold">
              {ACTIVE_THEME}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Filminizde Asr ve Beled surelerini birlikte işleyin; iki sureyi tek bir yapay zekâ filminde buluşturun.
            </p>
          </div>

          <div className="grid gap-4">
            {versesList.map((key) =>
              verseDetails[key] ? (
                <div key={key} className="bg-slate-950/50 border border-slate-800 rounded-2xl p-6">
                  <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">{key}</p>
                  <p className="text-right text-xl font-serif text-amber-400 leading-loose mb-4" dir="rtl">
                    {renderVerseText(verseDetails[key].arabic, true)}
                  </p>
                  <div className="w-full h-px bg-slate-800 mb-4" />
                  <p className="text-sm text-slate-300 italic">
                    &quot;{renderVerseText(verseDetails[key].turkish, false)}&quot;
                  </p>
                </div>
              ) : null
            )}
          </div>

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
              <Users size={18} className="text-teal-500" /> Öğrenciler (en az {MIN_STUDENTS_PER_TEAM}, en fazla {MAX_STUDENTS_PER_TEAM})
            </h4>
            <div className="grid gap-4">
              {teamForm.students.map((s, i) => (
                <div key={i} className="grid grid-cols-3 gap-4 relative">
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
            <div className="flex flex-wrap gap-3 mt-4">
              {teamForm.students.length < MAX_STUDENTS_PER_TEAM && (
                <button
                  type="button"
                  onClick={() =>
                    setTeamForm({
                      ...teamForm,
                      students: [...teamForm.students, { firstName: '', lastName: '', grade: '' }],
                    })
                  }
                  className="inline-flex items-center gap-2 text-xs font-bold text-teal-400 hover:text-teal-300 border border-teal-500/30 rounded-lg px-3 py-2"
                >
                  <Plus size={14} /> Öğrenci ekle
                </button>
              )}
              {teamForm.students.length > MIN_STUDENTS_PER_TEAM && (
                <button
                  type="button"
                  onClick={() => setTeamForm({ ...teamForm, students: teamForm.students.slice(0, -1) })}
                  className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-rose-400 border border-slate-700 rounded-lg px-3 py-2"
                >
                  <Trash2 size={14} /> Son öğrenciyi çıkar
                </button>
              )}
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
