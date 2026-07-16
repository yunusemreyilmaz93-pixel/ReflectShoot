import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  Users,
  Video,
  ExternalLink,
  Link as LinkIcon,
  Save,
  Youtube,
  CheckCircle2,
  AlertOctagon,
  Star,
  Trash2,
} from 'lucide-react';
import { ApplicationStatus, Application, ScoreDocument } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { ChatArea } from '../../components/ChatArea';
import { getYouTubeEmbedUrl } from '../../lib/videoUtils';
import { authenticatedFetch } from '../../lib/authenticatedFetch';

interface Props {
  app: Application;
  onClose: () => void;
  onAppUpdated: (app: Application) => void;
}

export const AdminTeamDetailDrawer: React.FC<Props> = ({ app, onClose, onAppUpdated }) => {
  const { updateApplication, logAction, fetchJuryScores, showToast } = useAppContext();
  const [appScores, setAppScores] = useState<ScoreDocument[]>([]);
  const [youtubeLinkInput, setYoutubeLinkInput] = useState(app.team.videoUrl || '');
  const [rejectingDoc, setRejectingDoc] = useState<{
    studentId: string;
    type: 'PARENT' | 'KVKK';
  } | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');

  useEffect(() => {
    fetchJuryScores(app.id).then(setAppScores);
    setYoutubeLinkInput(app.team.videoUrl || '');
  }, [app.id, app.team.videoUrl, fetchJuryScores]);

  const handleStatusChange = async (newStatus: ApplicationStatus) => {
    const updated = { ...app, status: newStatus };
    await updateApplication(updated);
    await logAction(
      'UPDATE_STATUS',
      `Takım ${app.team.name} durumu ${newStatus} olarak güncellendi.`,
      app.id
    );
    onAppUpdated(updated);
  };

  const toggleFinalist = async () => {
    const newState = !app.team.isFinalist;
    const updated = { ...app, team: { ...app.team, isFinalist: newState } };
    await updateApplication(updated);
    await logAction(
      'TOGGLE_FINALIST',
      `${app.team.name} finalist durumu: ${newState ? 'EVET' : 'HAYIR'}`,
      app.id
    );
    onAppUpdated(updated);
  };

  const saveYoutubeLink = async () => {
    const embedUrl = getYouTubeEmbedUrl(youtubeLinkInput);
    if (!embedUrl) {
      showToast('Geçersiz YouTube linki.', 'error');
      return;
    }
    const updated = {
      ...app,
      team: {
        ...app.team,
        videoUrl: youtubeLinkInput,
        videoStatus: 'UPLOADED' as const,
      },
      status: ApplicationStatus.APPROVED,
    };
    await updateApplication(updated);
    await logAction(
      'VIDEO_PUBLISH',
      `${app.team.name} videosu YouTube linki olarak eklendi.`,
      app.id
    );
    onAppUpdated(updated);
    showToast('Video linki kaydedildi ve yayınlandı.', 'success');
  };

  const handleDocStatus = async (
    studentId: string,
    _type: 'PARENT' | 'KVKK',
    status: 'APPROVED' | 'REJECTED',
    reason?: string
  ) => {
    const updatedStudents = app.team.students.map((s) => {
      if (s.id === studentId) {
        return {
          ...s,
          docStatus: status,
          rejectionReason: status === 'REJECTED' ? reason : undefined,
        };
      }
      return s;
    });

    const updatedApp = {
      ...app,
      team: { ...app.team, students: updatedStudents },
    };

    try {
      await updateApplication(updatedApp);
      onAppUpdated(updatedApp);
      setRejectingDoc(null);
      setRejectionReasonInput('');
      showToast(`Belge ${status === 'APPROVED' ? 'onaylandı' : 'reddedildi'}.`, 'success');
      await logAction(
        'DOC_REVIEW',
        `${app.team.name} - Öğrenci belgesi ${status === 'APPROVED' ? 'ONAYLANDI' : 'REDDEDİLDİ'}`,
        app.id
      );
    } catch {
      showToast('İşlem başarısız.', 'error');
    }
  };

  const handleViewDoc = async (key: string) => {
    try {
      const res = await authenticatedFetch(`/api/view?key=${encodeURIComponent(key)}`);
      const data = await res.json();
      if (data.signedUrl) {
        window.open(data.signedUrl, '_blank');
      } else {
        showToast('Belge linki alınamadı.', 'error');
      }
    } catch {
      showToast('Hata oluştu.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-sm flex justify-end animate-fadeIn">
      <div className="w-full max-w-2xl bg-slate-900 h-full border-l border-slate-700 p-6 md:p-8 overflow-y-auto shadow-2xl relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 bg-slate-800 p-2 rounded-full text-slate-400 hover:text-white hover:bg-rose-600 transition-all z-10"
          aria-label="Kapat"
        >
          <X size={20} />
        </button>

        <div className="mb-8 pb-8 border-b border-slate-800 mt-8 md:mt-0">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-4">
            {app.team.logoUrl && (
              <img
                alt=""
                src={app.team.logoUrl}
                className="w-20 h-20 rounded-xl object-cover bg-slate-800 border border-slate-700"
              />
            )}
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">
                {app.team.name}
              </h2>
              <p className="text-slate-400 text-sm mt-1">{app.teacher.school}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="bg-slate-800 text-slate-300 text-xs px-3 py-1 rounded-full font-bold">
              {app.team.category}
            </span>
            <span className="bg-slate-800 text-slate-300 text-xs px-3 py-1 rounded-full font-bold">
              {app.teacher.city}
            </span>
            <span
              className={`text-xs px-3 py-1 rounded-full font-bold text-white ${
                app.team.isFinalist ? 'bg-amber-500' : 'bg-slate-700'
              }`}
            >
              {app.team.isFinalist ? 'FİNALİST' : 'Aday'}
            </span>
          </div>
        </div>

        <div className="mb-8">
          <ChatArea appId={app.id} />
        </div>

        <div className="mb-8 bg-slate-950 p-6 rounded-xl border border-slate-800">
          <h3 className="text-sm font-bold text-white uppercase mb-4 flex items-center gap-2">
            <Video size={16} className="text-rose-500" /> Video İşlemleri
          </h3>
          {app.team.submissionDownloadUrl && (
            <div className="mb-6 p-4 bg-blue-900/20 border border-blue-900/50 rounded-xl">
              <label className="text-xs font-bold text-blue-400 uppercase mb-2 flex items-center gap-2">
                <LinkIcon size={12} /> Öğretmen Teslim Linki
              </label>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={app.team.submissionDownloadUrl}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs text-slate-300 font-mono"
                />
                <a
                  href={app.team.submissionDownloadUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded text-xs font-bold flex items-center gap-2"
                >
                  <ExternalLink size={14} /> Aç
                </a>
              </div>
              <p className="text-[10px] text-slate-500 mt-2">
                * Bu linkten videoyu indirin, YouTube kanalına &quot;Liste Dışı&quot; yükleyin ve
                aşağıdaki alana ekleyin.
              </p>
            </div>
          )}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
              <Youtube size={14} className="text-red-500" /> YouTube Linki Tanımla
            </label>
            <div className="flex gap-2">
              <input
                value={youtubeLinkInput}
                onChange={(e) => setYoutubeLinkInput(e.target.value)}
                placeholder="https://youtu.be/..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-rose-500 outline-none"
              />
              <button
                type="button"
                onClick={saveYoutubeLink}
                className="bg-slate-800 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-bold transition-colors flex items-center gap-2"
              >
                <Save size={16} /> Kaydet
              </button>
            </div>
            {app.team.videoUrl && (
              <div className="mt-4 rounded-lg overflow-hidden border border-slate-800">
                <iframe
                  title="Video önizleme"
                  src={getYouTubeEmbedUrl(app.team.videoUrl) || ''}
                  className="w-full aspect-video"
                  allowFullScreen
                />
              </div>
            )}
          </div>
        </div>

        <div className="mb-8 bg-slate-950 p-6 rounded-xl border border-slate-800">
          <h3 className="text-sm font-bold text-white uppercase mb-4 flex items-center gap-2">
            <Users size={16} className="text-rose-500" /> Öğrenci Belgeleri
          </h3>
          <div className="space-y-6">
            {app.team.students.map((student) => (
              <div
                key={student.id}
                className="border-b border-slate-800 pb-6 last:border-0 last:pb-0"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold text-white">
                      {student.firstName} {student.lastName}
                    </h4>
                    <p className="text-xs text-slate-500">{student.grade}. Sınıf</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        Veli İzin Belgesi
                      </span>
                      {student.docStatus === 'APPROVED' && (
                        <CheckCircle2 size={14} className="text-green-500" />
                      )}
                      {student.docStatus === 'REJECTED' && (
                        <AlertOctagon size={14} className="text-red-500" />
                      )}
                    </div>
                    {student.parentalConsentUrl ? (
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={() => handleViewDoc(student.parentalConsentUrl!)}
                          className="w-full text-left px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded text-xs text-slate-300 flex items-center gap-2 transition-colors"
                        >
                          <FileText size={14} /> Belgeyi Görüntüle
                        </button>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleDocStatus(student.id, 'PARENT', 'APPROVED')}
                            className="flex-1 bg-green-900/20 hover:bg-green-900/40 text-green-400 py-1.5 rounded text-[10px] font-bold border border-green-900/50 transition-all"
                          >
                            Onayla
                          </button>
                          <button
                            type="button"
                            onClick={() => setRejectingDoc({ studentId: student.id, type: 'PARENT' })}
                            className="flex-1 bg-red-900/20 hover:bg-red-900/40 text-red-400 py-1.5 rounded text-[10px] font-bold border border-red-900/50 transition-all"
                          >
                            Reddet
                          </button>
                        </div>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-600 italic">Yüklenmedi</span>
                    )}
                  </div>

                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        KVKK Belgesi
                      </span>
                      {student.docStatus === 'APPROVED' && (
                        <CheckCircle2 size={14} className="text-green-500" />
                      )}
                      {student.docStatus === 'REJECTED' && (
                        <AlertOctagon size={14} className="text-red-500" />
                      )}
                    </div>
                    {student.kvkkConsentUrl ? (
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={() => handleViewDoc(student.kvkkConsentUrl!)}
                          className="w-full text-left px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded text-xs text-slate-300 flex items-center gap-2 transition-colors"
                        >
                          <FileText size={14} /> Belgeyi Görüntüle
                        </button>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleDocStatus(student.id, 'KVKK', 'APPROVED')}
                            className="flex-1 bg-green-900/20 hover:bg-green-900/40 text-green-400 py-1.5 rounded text-[10px] font-bold border border-green-900/50 transition-all"
                          >
                            Onayla
                          </button>
                          <button
                            type="button"
                            onClick={() => setRejectingDoc({ studentId: student.id, type: 'KVKK' })}
                            className="flex-1 bg-red-900/20 hover:bg-red-900/40 text-red-400 py-1.5 rounded text-[10px] font-bold border border-red-900/50 transition-all"
                          >
                            Reddet
                          </button>
                        </div>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-600 italic">Yüklenmedi</span>
                    )}
                  </div>
                </div>

                {rejectingDoc?.studentId === student.id && (
                  <div className="mt-4 p-4 bg-red-900/10 border border-red-900/30 rounded-xl animate-fadeIn">
                    <label className="text-[10px] font-bold text-red-400 uppercase mb-2 block">
                      Red Nedeni (
                      {rejectingDoc.type === 'PARENT' ? 'Veli İzin' : 'KVKK'})
                    </label>
                    <textarea
                      value={rejectionReasonInput}
                      onChange={(e) => setRejectionReasonInput(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white text-xs focus:border-red-500 outline-none min-h-[80px]"
                      placeholder="Lütfen red nedenini açıklayın..."
                    />
                    <div className="flex justify-end gap-2 mt-3">
                      <button
                        type="button"
                        onClick={() => setRejectingDoc(null)}
                        className="text-[10px] text-slate-400 hover:text-white px-3 py-2"
                      >
                        İptal
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleDocStatus(
                            student.id,
                            rejectingDoc.type,
                            'REJECTED',
                            rejectionReasonInput
                          )
                        }
                        className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-[10px] font-bold"
                      >
                        Reddet ve Bildir
                      </button>
                    </div>
                  </div>
                )}

                {student.docStatus === 'REJECTED' &&
                  student.rejectionReason &&
                  !rejectingDoc && (
                    <div className="mt-3 p-3 bg-red-900/5 border border-red-900/20 rounded-lg">
                      <p className="text-[10px] text-red-400 italic">
                        <strong>Red Nedeni:</strong> {student.rejectionReason}
                      </p>
                    </div>
                  )}
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-sm font-bold text-slate-500 uppercase mb-4 flex items-center gap-2">
            <Star size={16} /> Jüri Puanları
          </h3>
          {appScores.length > 0 ? (
            <div className="space-y-3">
              {appScores.map((score, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-xl border ${
                    score.isRecused
                      ? 'bg-slate-900 border-slate-700/50 opacity-60'
                      : score.isDraft
                        ? 'bg-amber-950/20 border-amber-900/30'
                        : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-white text-sm flex gap-2 items-center">
                      {score.juryName}
                      {score.isDraft && (
                        <span className="text-[10px] bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded uppercase font-bold">
                          Taslak
                        </span>
                      )}
                      {score.isRecused && (
                        <span className="text-[10px] bg-slate-700 text-slate-400 px-2 py-0.5 rounded uppercase font-bold">
                          Çekimser
                        </span>
                      )}
                    </span>
                    <span
                      className={`text-xl font-black ${
                        score.isRecused ? 'text-slate-500' : 'text-amber-500'
                      }`}
                    >
                      {score.isRecused ? '-' : score.total}
                    </span>
                  </div>
                  {!score.isRecused && (
                    <div className="grid grid-cols-4 gap-2 text-[10px] text-slate-500 mb-2">
                      <div>Hikaye: {score.criteria.story}</div>
                      <div>Teknik: {score.criteria.technical}</div>
                      <div>Özgünlük: {score.criteria.originality}</div>
                      <div>Tema: {score.criteria.themeFit}</div>
                    </div>
                  )}
                  {score.notes && (
                    <p className="text-xs text-slate-400 italic border-t border-slate-800 pt-2 mt-2">
                      &quot;{score.notes}&quot;
                    </p>
                  )}
                </div>
              ))}
              <div className="flex justify-between items-center bg-slate-800 p-4 rounded-xl">
                <span className="font-bold text-slate-400">Ortalama Puan</span>
                <span className="text-2xl font-black text-emerald-500">{app.finalScore}</span>
              </div>
            </div>
          ) : (
            <div className="text-slate-500 text-sm italic">Henüz puanlama yapılmamış.</div>
          )}
        </div>

        <div className="mt-auto pt-6 border-t border-slate-800 pb-10 md:pb-0">
          <h3 className="text-sm font-bold text-slate-500 uppercase mb-4">Yönetim İşlemleri</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <button
              type="button"
              onClick={toggleFinalist}
              className={`p-4 rounded-xl font-bold flex flex-col items-center justify-center gap-2 transition-all ${
                app.team.isFinalist
                  ? 'bg-amber-500/10 text-amber-500 border border-amber-500/50'
                  : 'bg-slate-800 text-slate-400 hover:bg-amber-500 hover:text-black'
              }`}
            >
              <Star size={24} className={app.team.isFinalist ? 'fill-current' : ''} />
              {app.team.isFinalist ? 'Finalistliği Kaldır' : 'Finalist Yap'}
            </button>
            <button
              type="button"
              onClick={() => handleStatusChange(ApplicationStatus.DISQUALIFIED)}
              className="bg-slate-800 hover:bg-red-900/30 text-slate-400 hover:text-red-500 p-4 rounded-xl font-bold flex flex-col items-center justify-center gap-2 border border-slate-800 hover:border-red-500/30 transition-all"
            >
              <Trash2 size={24} />
              Diskalifiye Et
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
