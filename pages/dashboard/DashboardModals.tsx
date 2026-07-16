import React from 'react';
import {
  X,
  ShieldCheck,
  CheckSquare,
  Trophy,
  ArrowRight,
  Sparkles,
  PartyPopper,
  Clapperboard,
} from 'lucide-react';
import type { Application, Student } from '../../types';
import { useModalA11y } from './useModalA11y';

type Props = {
  declarationModal: { studentId: string; type: 'PARENT' | 'KVKK' } | null;
  declarationAccepted: boolean;
  setDeclarationAccepted: (v: boolean) => void;
  onCloseDeclaration: () => void;
  onConfirmDeclaration: () => void;

  showWinnerModal: boolean;
  winningApps: Application[];
  onCloseWinner: () => void;
  awardFormDeadlineLabel?: string;

  showThanksModal: boolean;
  losingApps: Application[];
  onCloseThanks: () => void;

  showVideoSuccessModal: boolean;
  onCloseVideoSuccess: () => void;

  showDeadlineModal: boolean;
  onCloseDeadline: () => void;

  isStudentModalOpen: boolean;
  editingStudent: Partial<Student> | null;
  setEditingStudent: (s: Partial<Student> | null) => void;
  onCloseStudent: () => void;
  onSaveStudent: () => void;
};

function ModalFrame({
  open,
  onClose,
  labelledBy,
  className,
  children,
}: {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  className?: string;
  children: React.ReactNode;
}) {
  const panelRef = useModalA11y(open, onClose);
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={className}
      >
        {children}
      </div>
    </div>
  );
}

export function DashboardModals({
  declarationModal,
  declarationAccepted,
  setDeclarationAccepted,
  onCloseDeclaration,
  onConfirmDeclaration,
  showWinnerModal,
  winningApps,
  onCloseWinner,
  awardFormDeadlineLabel,
  showThanksModal,
  losingApps,
  onCloseThanks,
  showVideoSuccessModal,
  onCloseVideoSuccess,
  showDeadlineModal,
  onCloseDeadline,
  isStudentModalOpen,
  editingStudent,
  setEditingStudent,
  onCloseStudent,
  onSaveStudent,
}: Props) {
  return (
    <>
      {declarationModal && (
        <ModalFrame
          open
          onClose={onCloseDeclaration}
          labelledBy="modal-declaration-title"
          className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full shadow-2xl relative overflow-hidden flex flex-col"
        >
          <div className="p-6 border-b border-slate-800 bg-slate-950 flex justify-between items-center">
            <h3 id="modal-declaration-title" className="font-bold text-white flex items-center gap-2">
              <ShieldCheck className="text-amber-500" size={20} /> Yasal Sorumluluk Beyanı
            </h3>
            <button
              type="button"
              onClick={onCloseDeclaration}
              className="text-slate-500 hover:text-white transition-colors"
              aria-label="Kapat"
            >
              <X size={20} />
            </button>
          </div>
          <div className="p-8">
            <div className="bg-amber-900/10 border-l-4 border-amber-500 p-4 rounded-r-lg mb-6">
              <p className="text-amber-200/80 text-sm leading-relaxed">
                Bu işlem, resmi bir belge teslimidir. Lütfen aşağıdaki metni dikkatle okuyarak
                onaylayınız.
              </p>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed mb-6 font-light">
              &quot;Yüklemekte olduğum bu belgenin; orijinalinin tarafımda saklandığını, üzerindeki
              bilgilerin ve imzaların gerçek olduğunu, KVKK ve yarışma şartnamesine uygun olduğunu
              beyan ederim.&quot;
            </p>
            <label className="flex items-start gap-3 cursor-pointer group p-3 rounded-xl hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-700">
              <div
                className={`w-5 h-5 rounded border flex items-center justify-center mt-0.5 transition-all ${
                  declarationAccepted ? 'bg-green-600 border-green-600' : 'border-slate-600'
                }`}
              >
                {declarationAccepted && <CheckSquare size={14} className="text-white" />}
              </div>
              <input
                type="checkbox"
                className="hidden"
                checked={declarationAccepted}
                onChange={(e) => setDeclarationAccepted(e.target.checked)}
              />
              <span
                className={`text-sm select-none ${
                  declarationAccepted ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'
                }`}
              >
                Okudum, anladım ve onaylıyorum.
              </span>
            </label>
          </div>
          <div className="p-6 border-t border-slate-800 bg-slate-950 flex justify-end gap-3">
            <button
              type="button"
              onClick={onCloseDeclaration}
              className="px-6 py-3 rounded-xl text-slate-400 hover:text-white font-bold text-sm transition-colors"
            >
              İptal
            </button>
            <button
              type="button"
              onClick={onConfirmDeclaration}
              disabled={!declarationAccepted}
              className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-900 px-8 py-3 rounded-xl font-black text-sm shadow-lg shadow-amber-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95"
            >
              Onaylıyorum ve Yükle
            </button>
          </div>
        </ModalFrame>
      )}

      {showWinnerModal && (
        <ModalFrame
          open
          onClose={onCloseWinner}
          labelledBy="modal-winner-title"
          className="bg-slate-900 border border-amber-500/50 rounded-[2.5rem] max-w-2xl w-full shadow-[0_0_100px_rgba(245,158,11,0.2)] relative overflow-hidden text-center p-8 md:p-12"
        >
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 pointer-events-none" />
          <button
            type="button"
            onClick={onCloseWinner}
            className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors z-20"
            aria-label="Kapat"
          >
            <X size={32} />
          </button>
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-28 h-28 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(245,158,11,0.4)] mb-8">
              <Trophy size={48} className="text-white" />
            </div>
            <h2
              id="modal-winner-title"
              className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4 leading-tight"
            >
              TEBRİKLER!
            </h2>
            <p className="text-lg md:text-xl text-slate-300 font-medium mb-8 leading-relaxed">
              Danışmanlığını yürüttüğünüz aşağıdaki{' '}
              {winningApps.length > 1 ? 'takımlarınız' : 'takımınız'} jüri değerlendirmesinde başarı
              göstererek <strong className="text-amber-500">Ödül Almaya</strong> hak kazanmıştır.
            </p>
            <div className="w-full bg-slate-950/50 border border-slate-800 rounded-3xl p-6 mb-8 text-left space-y-4">
              {winningApps.map((app) => (
                <div
                  key={app.id}
                  className="bg-slate-900 border border-amber-500/30 p-4 rounded-xl flex items-center justify-between gap-3"
                >
                  <div>
                    <h4 className="font-bold text-white text-lg">{app.team.name}</h4>
                    <p className="text-sm text-slate-400">{app.team.awardCategory}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onCloseWinner();
                      setTimeout(() => {
                        window.location.hash = `#/award-participation/team/${app.team.id}`;
                      }, 300);
                    }}
                    className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 px-4 text-sm rounded-lg transition-transform hover:-translate-y-1 shadow-lg shrink-0"
                  >
                    Formu Doldur <ArrowRight size={16} className="inline ml-1" />
                  </button>
                </div>
              ))}
            </div>
            <p className="text-sm text-slate-400 mb-8 max-w-lg mx-auto">
              Ödül Töreni hazırlıkları için katılım durumunuzu bildiren formu
              {awardFormDeadlineLabel ? (
                <>
                  {' '}
                  en geç <strong className="text-white">{awardFormDeadlineLabel}</strong> tarihine
                  kadar
                </>
              ) : (
                ' en kısa sürede'
              )}{' '}
              doldurmanız gerekmektedir.
            </p>
            <button
              type="button"
              onClick={onCloseWinner}
              className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 px-10 rounded-2xl transition-colors"
            >
              Anladım, Panele Dön
            </button>
          </div>
        </ModalFrame>
      )}

      {showThanksModal && (
        <ModalFrame
          open
          onClose={onCloseThanks}
          labelledBy="modal-thanks-title"
          className="bg-slate-900 border border-slate-700 rounded-[2.5rem] max-w-2xl w-full shadow-2xl relative overflow-hidden text-center p-8 md:p-12"
        >
          <button
            type="button"
            onClick={onCloseThanks}
            className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors z-20"
            aria-label="Kapat"
          >
            <X size={32} />
          </button>
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mb-6">
              <Sparkles size={40} className="text-blue-400" />
            </div>
            <h2
              id="modal-thanks-title"
              className="text-3xl font-black text-white tracking-tight mb-4 leading-tight"
            >
              Katılımınız İçin Teşekkürler!
            </h2>
            <p className="text-lg md:text-xl text-slate-300 font-medium mb-6 leading-relaxed">
              Danışmanlığını yürüttüğünüz takımlar ödül töreni için davet alamasa da, gösterdikleri
              çaba ve sürece katkıları bizim için çok değerli.
            </p>
            <div className="w-full bg-slate-950/50 border border-slate-800 rounded-3xl p-6 mb-8 text-left space-y-4">
              {losingApps.map((app) => (
                <div
                  key={app.id}
                  className="bg-slate-900 border border-slate-800 p-4 rounded-xl"
                >
                  <h4 className="font-bold text-white text-lg">{app.team.name}</h4>
                  <p className="text-sm text-slate-400">Harika bir iş çıkardılar!</p>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={onCloseThanks}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-10 rounded-2xl transition-colors"
            >
              Anladım, Panele Dön
            </button>
          </div>
        </ModalFrame>
      )}

      {showVideoSuccessModal && (
        <ModalFrame
          open
          onClose={onCloseVideoSuccess}
          labelledBy="modal-video-success-title"
          className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full shadow-2xl relative overflow-hidden text-center p-10"
        >
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.4)] mb-8 animate-bounce">
              <PartyPopper size={48} className="text-white" />
            </div>
            <h2
              id="modal-video-success-title"
              className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight"
            >
              Tebrikler!
            </h2>
            <h3 className="text-xl font-bold text-green-400 mb-6">Filminiz Jüriye Ulaştı</h3>
            <p className="text-slate-300 text-lg leading-relaxed mb-8">
              Yarışma başvurunuz başarıyla tamamlandı.
              <br />
              Büyük bir emeğin ürününü teslim ettiğiniz için teşekkür ederiz.
            </p>
            <button
              type="button"
              onClick={onCloseVideoSuccess}
              className="bg-white text-slate-900 hover:bg-slate-200 px-10 py-4 rounded-xl font-black text-lg shadow-xl hover:-translate-y-1 transition-all"
            >
              Harika!
            </button>
          </div>
        </ModalFrame>
      )}

      {showDeadlineModal && (
        <ModalFrame
          open
          onClose={onCloseDeadline}
          labelledBy="modal-deadline-title"
          className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full shadow-2xl relative overflow-hidden text-center p-10"
        >
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(20,184,166,0.4)] mb-8 animate-bounce">
              <Clapperboard size={48} className="text-white" />
            </div>
            <h2
              id="modal-deadline-title"
              className="text-3xl font-black text-white mb-4 tracking-tight"
            >
              Film Gönderim Süreci Sona Erdi!
            </h2>
            <h3 className="text-xl font-bold text-green-400 mb-6">Jüri Değerlendirmesi Başladı</h3>
            <p className="text-slate-300 text-lg leading-relaxed mb-8">
              Tebrikler! Filminizi başarıyla teslim ettiniz. Sonuçlar ödül töreninde açıklanacaktır.
            </p>
            <button
              type="button"
              onClick={onCloseDeadline}
              className="bg-white text-slate-900 hover:bg-slate-200 px-10 py-4 rounded-xl font-black text-lg shadow-xl hover:-translate-y-1 transition-all"
            >
              Anladım
            </button>
          </div>
        </ModalFrame>
      )}

      {isStudentModalOpen && editingStudent && (
        <ModalFrame
          open
          onClose={onCloseStudent}
          labelledBy="modal-student-title"
          className="bg-slate-900 w-full max-w-md rounded-2xl border border-slate-700 shadow-2xl p-8 relative"
        >
          <button
            type="button"
            onClick={onCloseStudent}
            className="absolute top-4 right-4 text-slate-500 hover:text-white"
            aria-label="Kapat"
          >
            <X size={20} />
          </button>
          <h3 id="modal-student-title" className="text-xl font-bold text-white mb-6">
            {editingStudent.id ? 'Oyuncu Kartını Düzenle' : 'Yeni Oyuncu Ekle'}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Ad</label>
              <input
                value={editingStudent.firstName || ''}
                onChange={(e) =>
                  setEditingStudent({ ...editingStudent, firstName: e.target.value })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Soyad</label>
              <input
                value={editingStudent.lastName || ''}
                onChange={(e) =>
                  setEditingStudent({ ...editingStudent, lastName: e.target.value })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Sınıf</label>
              <input
                value={editingStudent.grade || ''}
                onChange={(e) => setEditingStudent({ ...editingStudent, grade: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white outline-none focus:border-rose-500"
              />
            </div>
            <button
              type="button"
              onClick={onSaveStudent}
              className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 rounded-xl mt-4 transition-colors"
            >
              Değişiklikleri Kaydet
            </button>
          </div>
        </ModalFrame>
      )}
    </>
  );
}
