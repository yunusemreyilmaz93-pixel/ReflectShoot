import React, { useMemo, useState } from 'react';
import { Megaphone, Send, Users, UserCheck, Award, Info, AlertTriangle } from 'lucide-react';
import { NotificationTarget, UserRole } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { getActiveSeason, isInSeason } from '../../lib/domain/season';

const TARGETS: {
  id: NotificationTarget;
  label: string;
  hint: string;
  icon: React.ElementType;
}[] = [
  { id: 'ALL', label: 'Herkese', hint: 'Tüm kayıtlı kullanıcılar', icon: Users },
  { id: 'TEACHERS', label: 'Öğretmenler', hint: 'Danışman öğretmenler', icon: UserCheck },
  { id: 'JUDGES', label: 'Jüriler', hint: 'Jüri hesapları', icon: Award },
  { id: 'FINALISTS', label: 'Finalistler', hint: 'Aktif sezon finalist takım danışmanları', icon: Megaphone },
];

export const AdminAnnouncements = () => {
  const { sendAnnouncement, allUsers, allApplications, systemSettings, showToast } =
    useAppContext();
  const [form, setForm] = useState({
    title: '',
    message: '',
    target: 'TEACHERS' as NotificationTarget,
    type: 'info',
  });
  const [isSending, setIsSending] = useState(false);
  const [lastSent, setLastSent] = useState<string | null>(null);

  const season = getActiveSeason(systemSettings);

  const audienceCount = useMemo(() => {
    if (form.target === 'ALL') return allUsers.length;
    if (form.target === 'TEACHERS')
      return allUsers.filter((u) => u.role === UserRole.TEACHER).length;
    if (form.target === 'JUDGES')
      return allUsers.filter((u) => u.role === UserRole.JUDGE).length;
    if (form.target === 'FINALISTS') {
      const ids = new Set(
        allApplications
          .filter((a) => a.team.isFinalist && isInSeason(a, season.id))
          .map((a) => a.teacher.id)
      );
      return ids.size;
    }
    return 0;
  }, [form.target, allUsers, allApplications, season.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) {
      showToast('Başlık ve mesaj zorunlu.', 'error');
      return;
    }
    if (
      !window.confirm(
        `${audienceCount} kullanıcıya bildirim gidecek.\n\nHedef: ${form.target}\nBaşlık: ${form.title}\n\nYayınlansın mı?`
      )
    ) {
      return;
    }
    setIsSending(true);
    try {
      await sendAnnouncement(form.target, form.title.trim(), form.message.trim(), form.type);
      setLastSent(new Date().toLocaleString('tr-TR'));
      setForm({ title: '', message: '', target: form.target, type: form.type });
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Gönderilemedi.', 'error');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex gap-3 text-sm text-slate-400">
        <Info size={18} className="text-rose-400 shrink-0 mt-0.5" />
        <p>
          Duyurular kullanıcıların paneline bildirim olarak düşer (zil ikonu). E-posta göndermez.
          Finalist hedefi <strong className="text-slate-200">{season.label}</strong> sezonuna
          göre filtrelenir.
        </p>
      </div>

      <div className="bg-slate-800 p-6 md:p-8 rounded-2xl border border-slate-700 shadow-xl">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
          <Megaphone size={24} className="text-rose-500" /> Duyuru Merkezi
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">
              Hedef kitle
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {TARGETS.map((t) => {
                const Icon = t.icon;
                const active = form.target === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setForm({ ...form, target: t.id })}
                    className={`text-left p-3 rounded-xl border transition-all ${
                      active
                        ? 'bg-rose-600/20 border-rose-500 text-white'
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    <Icon size={16} className={active ? 'text-rose-400' : 'text-slate-500'} />
                    <span className="block text-xs font-black mt-2">{t.label}</span>
                    <span className="block text-[10px] text-slate-500 mt-0.5 leading-snug">
                      {t.hint}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Tahmini alıcı: <strong className="text-white">{audienceCount}</strong> kişi
            </p>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block" htmlFor="ann-title">
              Başlık
            </label>
            <input
              id="ann-title"
              required
              maxLength={120}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-rose-500 outline-none"
              placeholder="Örn: Video teslim hatırlatması"
            />
            <p className="text-[10px] text-slate-600 mt-1 text-right">{form.title.length}/120</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-2 block" htmlFor="ann-type">
                Tür
              </label>
              <select
                id="ann-type"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-rose-500 outline-none"
              >
                <option value="info">Bilgi</option>
                <option value="success">Başarı</option>
                <option value="warning">Uyarı</option>
                <option value="error">Kritik</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block" htmlFor="ann-body">
              Mesaj
            </label>
            <textarea
              id="ann-body"
              required
              maxLength={2000}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-rose-500 outline-none min-h-[140px]"
              placeholder="Kısa, net ve aksiyon odaklı yazın…"
            />
            <p className="text-[10px] text-slate-600 mt-1 text-right">{form.message.length}/2000</p>
          </div>

          {(form.title || form.message) && (
            <div className="rounded-xl border border-slate-700 bg-slate-950/60 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                Önizleme
              </p>
              <p className="text-white font-bold text-sm">{form.title || 'Başlık'}</p>
              <p className="text-slate-400 text-sm mt-1 whitespace-pre-wrap">
                {form.message || 'Mesaj…'}
              </p>
            </div>
          )}

          {audienceCount === 0 && (
            <div className="flex gap-2 text-amber-200 text-xs bg-amber-900/20 border border-amber-500/30 rounded-xl p-3">
              <AlertTriangle size={16} className="shrink-0" />
              Bu hedefte şu an kullanıcı yok. Yine de gönderebilirsiniz ama kimse almaz.
            </div>
          )}

          <button
            type="submit"
            disabled={isSending || audienceCount === 0}
            className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSending ? (
              'Gönderiliyor…'
            ) : (
              <>
                <Send size={20} /> Duyuruyu Yayınla ({audienceCount})
              </>
            )}
          </button>
          {lastSent && (
            <p className="text-center text-[11px] text-emerald-500">Son gönderim: {lastSent}</p>
          )}
        </form>
      </div>
    </div>
  );
};
