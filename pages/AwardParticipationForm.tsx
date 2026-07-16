import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { AwardParticipation } from '../types';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import {
  ShieldCheck, Save, Clock, AlertTriangle, Send,
  User, Compass, Home, CheckCircle2, Trash2,
  ChevronDown, ChevronUp, Loader2, Info
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────
const DEADLINE = new Date('2026-05-11T13:00:00');

const TRANSPORTATION_OPTIONS = [
  'Kendi imkânlarıyla',
  'Otobüs',
  'Tren',
  'Uçak',
  'Diğer',
];

const SPECIAL_CONDITIONS = [
  'Yok',
  'Sağlık durumu',
  'Alerji',
  'Düzenli kullanılan ilaç',
  'Beslenme hassasiyeti',
  'Diğer',
];

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

// ─── Sub-components ───────────────────────────────────────────────────────────

const SectionHeader = ({ number, title }: { number: number; title: string }) => (
  <h2 className="text-xl font-black text-white mb-6 flex items-center gap-3">
    <span className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center text-sm font-black flex-shrink-0">
      {number}
    </span>
    {title}
  </h2>
);

const FieldLabel = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
    {children}
    {required && <span className="text-rose-500 ml-1">*</span>}
  </label>
);

const inputCls = "w-full bg-slate-800/60 border border-slate-700 focus:border-amber-500 focus:bg-slate-800 rounded-xl p-3.5 text-white outline-none transition-colors placeholder:text-slate-600 text-sm";
const readonlyCls = "w-full bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 text-slate-400 text-sm cursor-not-allowed";

interface FieldProps {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

const Field = ({ label, required, className = '', children }: FieldProps) => (
  <div className={`space-y-2 ${className}`}>
    <FieldLabel required={required}>{label}</FieldLabel>
    {children}
  </div>
);

// ─── Student Card ─────────────────────────────────────────────────────────────
interface StudentCardProps {
  student: AwardParticipation['students'][0];
  index: number;
  onChange: (index: number, field: string, value: string) => void;
  onRemove: (index: number) => void;
  readOnly?: boolean;
}

const StudentCard = ({ student, index, onChange, onRemove, readOnly }: StudentCardProps) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden transition-all">
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-800/30 transition-colors"
      >
        <span className="font-bold text-slate-200 text-sm flex items-center gap-2">
          <User size={15} className="text-amber-500" />
          {student.fullName || `${index + 1}. Öğrenci`}
        </span>
        <div className="flex items-center gap-3">
          {!readOnly && (
            <span
              role="button"
              onClick={(e) => { e.stopPropagation(); onRemove(index); }}
              className="text-slate-600 hover:text-rose-500 transition-colors p-1"
            >
              <Trash2 size={15} />
            </span>
          )}
          {expanded ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-800/60 pt-4">
          <Field label="Ad Soyad">
            <input
              type="text"
              value={student.fullName}
              onChange={(e) => onChange(index, 'fullName', e.target.value)}
              className={readOnly ? readonlyCls : inputCls}
              readOnly={readOnly}
              placeholder="Öğrencinin adı soyadı"
            />
          </Field>
          <Field label="Sınıf">
            <input
              type="text"
              value={student.grade}
              onChange={(e) => onChange(index, 'grade', e.target.value)}
              className={readOnly ? readonlyCls : inputCls}
              readOnly={readOnly}
              placeholder="9-A, 10-B vb."
            />
          </Field>
          <Field label="Öğrenci Cep Telefonu">
            <input
              type="tel"
              value={student.phone}
              onChange={(e) => onChange(index, 'phone', e.target.value)}
              className={readOnly ? readonlyCls : inputCls}
              readOnly={readOnly}
              placeholder="05xx xxx xx xx"
            />
          </Field>
          <Field label="Veli Ad Soyad">
            <input
              type="text"
              value={student.parentName}
              onChange={(e) => onChange(index, 'parentName', e.target.value)}
              className={readOnly ? readonlyCls : inputCls}
              readOnly={readOnly}
              placeholder="Velinin adı soyadı"
            />
          </Field>
          <Field label="Veli Cep Telefonu">
            <input
              type="tel"
              value={student.parentPhone}
              onChange={(e) => onChange(index, 'parentPhone', e.target.value)}
              className={readOnly ? readonlyCls : inputCls}
              readOnly={readOnly}
              placeholder="05xx xxx xx xx"
            />
          </Field>
          <Field label="Özel Durum">
            {readOnly ? (
              <input type="text" value={student.specialCondition} readOnly className={readonlyCls} />
            ) : (
              <select
                value={student.specialCondition}
                onChange={(e) => onChange(index, 'specialCondition', e.target.value)}
                className={inputCls}
              >
                {SPECIAL_CONDITIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            )}
          </Field>
          {student.specialCondition === 'Diğer' && (
            <Field label="Özel Durum Açıklaması" className="md:col-span-2">
              <input
                type="text"
                value={student.specialConditionDescription || ''}
                onChange={(e) => onChange(index, 'specialConditionDescription', e.target.value)}
                className={readOnly ? readonlyCls : inputCls}
                readOnly={readOnly}
                placeholder="Lütfen detaylandırınız..."
              />
            </Field>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Validation ───────────────────────────────────────────────────────────────
interface ValidationErrors {
  advisorName?: string;
  advisorPhone?: string;
  advisorEmail?: string;
  advisorParticipationStatus?: string;
  transportationType?: string;
  parentConsentAccepted?: string;
  students?: string;
}

const validate = (formData: Partial<AwardParticipation>): ValidationErrors => {
  const errors: ValidationErrors = {};
  if (!formData.advisorName?.trim()) errors.advisorName = 'Ad Soyad zorunludur.';
  if (!formData.advisorPhone?.trim()) errors.advisorPhone = 'Telefon zorunludur.';
  if (!formData.advisorEmail?.trim()) errors.advisorEmail = 'E-posta zorunludur.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.advisorEmail)) errors.advisorEmail = 'Geçerli bir e-posta giriniz.';
  if (!formData.advisorParticipationStatus || (formData.advisorParticipationStatus as any) === '') errors.advisorParticipationStatus = 'Katılım durumunuzu belirtiniz.';
  if (!formData.transportationType) errors.transportationType = 'Ulaşım şekli seçiniz.';
  if (!formData.parentConsentAccepted) errors.parentConsentAccepted = 'Onay kutusunu işaretleyiniz.';

  const studentsWithNames = (formData.students || []).filter(s => s.fullName?.trim());
  if (studentsWithNames.length === 0) errors.students = 'En az bir öğrenci ekleyiniz.';

  return errors;
};

// ─── Main Component ───────────────────────────────────────────────────────────
export const AwardParticipationForm = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { currentUser, allApplications, myApplications } = useAppContext();

  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [accessError, setAccessError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [formData, setFormData] = useState<Partial<AwardParticipation>>({
    students: [],
    transportationType: '',
    accommodationRequired: 'Not_Sure',
    parentConsentAccepted: false,
    advisorParticipationStatus: 'Not_Sure',
  });

  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDeadlinePassed = new Date() > DEADLINE;

  const currentApp =
    allApplications.find((a) => a.team.id === teamId) ||
    myApplications.find((a) => a.team.id === teamId);

  // ── Load data ──
  useEffect(() => {
    const checkAccess = async () => {
      if (!currentUser) return;

      if (!currentApp) {
        setAccessError('Bu takıma ait bilgilere erişim yetkiniz bulunmamaktadır.');
        setLoading(false);
        return;
      }

      if (currentApp.teacher.id !== currentUser.uid) {
        setAccessError('Bu takıma ait bilgilere erişim yetkiniz bulunmamaktadır.');
        setLoading(false);
        return;
      }

      if (!currentApp.team.isWinner) {
        setAccessError('Bu takım için katılım formu erişimi bulunmamaktadır.');
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(db, 'award_participations', currentApp.id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as AwardParticipation;
          setFormData(data);
          if (data.status === 'submitted') setIsSubmitted(true);
        } else {
          setFormData({
            teamId: currentApp.team.id,
            applicationId: currentApp.id,
            teamName: currentApp.team.name,
            category: currentApp.team.category,
            awardCategory: currentApp.team.awardCategory || '',
            schoolName: currentApp.teacher.school,
            schoolCity: currentApp.teacher.city,
            schoolDistrict: '',
            advisorUserId: currentApp.teacher.id,
            advisorName: currentApp.teacher.fullName,
            advisorEmail: currentApp.teacher.email,
            advisorPhone: currentApp.teacher.phone,
            advisorBranch: '',
            advisorParticipationStatus: 'Not_Sure',
            students: currentApp.team.students.map((s) => ({
              fullName: s.firstName + ' ' + s.lastName,
              grade: s.grade,
              phone: '',
              parentName: '',
              parentPhone: '',
              specialCondition: 'Yok',
            })),
            transportationType: '',
            transportationOtherDesc: '',
            arrivalDate: '2026-05-21',
            arrivalTime: '14:00',
            departureDate: '2026-05-22',
            departureTime: '16:00',
            accommodationRequired: 'Not_Sure',
            accommodationPersonCount: 0,
            additionalNotes: '',
            parentConsentAccepted: false,
          });
        }
      } catch (err) {
        console.error('Form load error:', err);
      }

      setLoading(false);
    };

    if (currentUser && (allApplications.length > 0 || myApplications.length > 0)) {
      checkAccess();
    }
  }, [currentUser, teamId, allApplications, myApplications]);

  // ── Auto-save draft ──
  const saveDraft = useCallback(
    async (data: Partial<AwardParticipation>) => {
      if (!data.applicationId || isSubmitted) return;
      setSaveStatus('saving');
      try {
        const docRef = doc(db, 'award_participations', data.applicationId);
        await setDoc(docRef, { ...data, status: 'draft', lastSavedAt: serverTimestamp() }, { merge: true });
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } catch (err) {
        console.error('Auto-save error:', err);
        setSaveStatus('error');
      }
    },
    [isSubmitted]
  );

  const scheduleAutoSave = useCallback(
    (data: Partial<AwardParticipation>) => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = setTimeout(() => saveDraft(data), 2000);
    },
    [saveDraft]
  );

  const updateForm = useCallback(
    (patch: Partial<AwardParticipation>) => {
      setFormData((prev) => {
        const next = { ...prev, ...patch };
        return next;
      });
    },
    []
  );

  // Auto-save after form state changes (side effects outside the updater)
  useEffect(() => {
    if (isSubmitted || !formData.applicationId) return;
    scheduleAutoSave(formData);
  }, [formData, isSubmitted, scheduleAutoSave]);

  // ── Student helpers ──
  const handleStudentChange = useCallback(
    (index: number, field: string, value: string) => {
      setFormData((prev) => {
        const newStudents = [...(prev.students || [])];
        newStudents[index] = { ...newStudents[index], [field]: value };
        return { ...prev, students: newStudents };
      });
    },
    []
  );

  const addStudent = () => {
    updateForm({
      students: [
        ...(formData.students || []),
        { fullName: '', grade: '', phone: '', parentName: '', parentPhone: '', specialCondition: 'Yok' },
      ],
    });
  };

  const removeStudent = (index: number) => {
    const newStudents = [...(formData.students || [])];
    newStudents.splice(index, 1);
    updateForm({ students: newStudents });
  };

  // ── Submit ──
  const handleSubmit = async () => {
    const errors = validate(formData);
    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) {
      const firstErrorEl = document.querySelector('[data-error]');
      firstErrorEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setSubmitLoading(true);
    try {
      const docRef = doc(db, 'award_participations', formData.applicationId!);
      await setDoc(docRef, { ...formData, status: 'submitted', submittedAt: serverTimestamp() });
      await updateDoc(doc(db, 'applications', formData.applicationId!), {
        'team.participationFormStatus': 'submitted',
        'team.participationSubmittedAt': serverTimestamp(),
      });
      setSuccess(true);
    } catch (err) {
      console.error('Submit error:', err);
      alert('Gönderim sırasında hata oluştu. Lütfen tekrar deneyiniz.');
    }
    setSubmitLoading(false);
  };

  // ─── Render: Loading ───
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500" />
        <p className="text-slate-400 text-sm">Yükleniyor...</p>
      </div>
    );
  }

  // ─── Render: Access error ───
  if (accessError) {
    return (
      <div className="min-h-screen bg-slate-950 pt-32 pb-20 px-4 flex items-start justify-center">
        <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center">
          <AlertTriangle className="text-amber-500 w-14 h-14 mx-auto mb-5" />
          <h2 className="text-xl font-bold text-white mb-4">{accessError}</h2>
          <button type="button"
            onClick={() => navigate('/dashboard')}
            className="mt-4 bg-amber-600 hover:bg-amber-500 text-black font-bold py-3 px-8 rounded-xl transition-colors"
          >
            Panele Dön
          </button>
        </div>
      </div>
    );
  }

  // ─── Render: Success ───
  if (success) {
    return (
      <div className="min-h-screen bg-slate-950 pt-32 pb-20 px-4 flex items-start justify-center">
        <div className="max-w-2xl w-full bg-slate-900/80 border border-emerald-500/30 rounded-3xl p-10 text-center shadow-2xl">
          <div className="w-20 h-20 mx-auto bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
            <ShieldCheck className="text-emerald-500 w-10 h-10" />
          </div>
          <h2 className="text-3xl font-black text-white mb-4">Form Başarıyla Gönderildi</h2>
          <p className="text-slate-300 mb-8">
            Reflect&Shoot Ödül Töreni ve Programı için gerekli bilgiler tarafımıza ulaşmıştır.
          </p>
          <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 mb-8 text-left">
            <h3 className="text-amber-500 font-bold mb-2 flex items-center gap-2">
              <Compass size={18} /> Şehir Rehberi
            </h3>
            <p className="text-slate-300 text-sm">
              Konya'ya geliş ve program hazırlıklarınızı kolaylaştırmak için şehir rehberi bölümümüzü inceleyebilirsiniz.
            </p>
          </div>
          <div className="flex gap-3 justify-center flex-wrap">
            <button type="button"
              onClick={() => navigate('/city-guide')}
              className="bg-amber-600 hover:bg-amber-500 text-black font-bold py-3 px-7 rounded-xl transition-colors"
            >
              Şehir Rehberi
            </button>
            <button type="button"
              onClick={() => navigate('/dashboard')}
              className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-7 rounded-xl transition-colors"
            >
              Panele Dön
            </button>
          </div>
        </div>
      </div>
    );
  }

  const readOnly = isSubmitted || isDeadlinePassed;

  // ─── Render: Form ───
  return (
    <div className="min-h-screen bg-slate-950 pt-28 pb-20 px-4 text-slate-200">
      <div className="max-w-4xl mx-auto w-full">

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold px-4 py-1.5 rounded-full mb-4 uppercase tracking-widest">
            <ShieldCheck size={12} /> Ödül Töreni
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-3">
            Reflect&amp;Shoot Katılım Formu
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto text-sm leading-relaxed">
            Bu form, ödül almaya hak kazanan takımların danışman öğretmenleri tarafından doldurulacaktır.
          </p>
        </div>

        {/* Status banners */}
        {isSubmitted && (
          <div className="mb-6 bg-emerald-900/20 border border-emerald-500/30 rounded-2xl px-5 py-4 flex items-center gap-3">
            <CheckCircle2 className="text-emerald-500 flex-shrink-0" size={20} />
            <p className="text-emerald-300 text-sm font-medium">
              Katılım formunuz başarıyla gönderilmiştir. Aşağıda gönderdiğiniz bilgileri görüntüleyebilirsiniz.
            </p>
          </div>
        )}
        {isDeadlinePassed && !isSubmitted && (
          <div className="mb-6 bg-rose-900/20 border border-rose-500/30 rounded-2xl px-5 py-4 flex items-center gap-3">
            <AlertTriangle className="text-rose-400 flex-shrink-0" size={20} />
            <p className="text-rose-300 text-sm font-medium">
              Son teslim tarihi (11 Mayıs 2026, 13:00) geçmiştir. Form düzenlenemez. Destek için Reflect&amp;Shoot ekibiyle iletişime geçiniz.
            </p>
          </div>
        )}

        <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">

          {/* Info strip */}
          <div className="bg-slate-800/50 border-b border-slate-800 px-6 py-5 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="space-y-1.5">
              <p className="text-amber-500 font-black text-base">Ödül Töreni Programı</p>
              <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Clock size={13} className="text-slate-500" /> 22 Mayıs 2026 Cuma — 10:30
                </span>
                <span className="flex items-center gap-1.5">
                  <Home size={13} className="text-slate-500" /> Konya Taş Bina
                </span>
              </div>
            </div>
            <div className="bg-slate-900 px-4 py-3 rounded-xl border border-slate-700 text-right flex-shrink-0">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-0.5">Son Teslim</p>
              <p className="text-rose-400 font-bold text-sm">11 Mayıs 2026 Pzt — 13:00</p>
            </div>
          </div>

          <div className="p-6 md:p-10 space-y-10">

            {/* ── Section 1: Team & School ── */}
            <section>
              <SectionHeader number={1} title="Takım ve Okul Bilgileri" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Takım Adı">
                  <input type="text" readOnly value={formData.teamName || ''} className={readonlyCls} />
                </Field>
                <Field label="Ödül Aldığı Kategori">
                  <input type="text" readOnly value={formData.awardCategory || ''} className={readonlyCls} />
                </Field>
                <Field label="Okul Adı">
                  <input type="text" readOnly value={formData.schoolName || ''} className={readonlyCls} />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="İl">
                    <input type="text" readOnly value={formData.schoolCity || ''} className={readonlyCls} />
                  </Field>
                  <Field label="İlçe">
                    <input
                      type="text"
                      value={formData.schoolDistrict || ''}
                      onChange={(e) => updateForm({ schoolDistrict: e.target.value })}
                      className={readOnly ? readonlyCls : inputCls}
                      readOnly={readOnly}
                      placeholder="İlçe adı"
                    />
                  </Field>
                </div>
              </div>
            </section>

            <hr className="border-slate-800" />

            {/* ── Section 2: Advisor ── */}
            <section>
              <SectionHeader number={2} title="Danışman Öğretmen Bilgileri" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Ad Soyad" required>
                  <input
                    type="text"
                    value={formData.advisorName || ''}
                    onChange={(e) => updateForm({ advisorName: e.target.value })}
                    className={`${readOnly ? readonlyCls : inputCls} ${validationErrors.advisorName ? 'border-rose-500' : ''}`}
                    readOnly={readOnly}
                  />
                  {validationErrors.advisorName && (
                    <p data-error className="text-rose-400 text-xs mt-1">{validationErrors.advisorName}</p>
                  )}
                </Field>
                <Field label="Branş">
                  <input
                    type="text"
                    value={formData.advisorBranch || ''}
                    onChange={(e) => updateForm({ advisorBranch: e.target.value })}
                    className={readOnly ? readonlyCls : inputCls}
                    readOnly={readOnly}
                    placeholder="Örn. Türk Dili ve Edebiyatı"
                  />
                </Field>
                <Field label="Cep Telefonu" required>
                  <input
                    type="tel"
                    value={formData.advisorPhone || ''}
                    onChange={(e) => updateForm({ advisorPhone: e.target.value })}
                    className={`${readOnly ? readonlyCls : inputCls} ${validationErrors.advisorPhone ? 'border-rose-500' : ''}`}
                    readOnly={readOnly}
                    placeholder="05xx xxx xx xx"
                  />
                  {validationErrors.advisorPhone && (
                    <p data-error className="text-rose-400 text-xs mt-1">{validationErrors.advisorPhone}</p>
                  )}
                </Field>
                <Field label="E-Posta" required>
                  <input
                    type="email"
                    value={formData.advisorEmail || ''}
                    onChange={(e) => updateForm({ advisorEmail: e.target.value })}
                    className={`${readOnly ? readonlyCls : inputCls} ${validationErrors.advisorEmail ? 'border-rose-500' : ''}`}
                    readOnly={readOnly}
                    placeholder="ornek@mail.com"
                  />
                  {validationErrors.advisorEmail && (
                    <p data-error className="text-rose-400 text-xs mt-1">{validationErrors.advisorEmail}</p>
                  )}
                </Field>

                <div className="space-y-2 md:col-span-2">
                  <FieldLabel required>Törene Katılım Durumu</FieldLabel>
                  <div className="grid grid-cols-3 gap-3">
                    {(['Attending', 'Not_Attending', 'Not_Sure'] as const).map((status) => {
                      const active = formData.advisorParticipationStatus === status;
                      const label = status === 'Attending' ? 'Katılacağım' : status === 'Not_Attending' ? 'Katılamayacağım' : 'Henüz Net Değil';
                      return (
                        <label
                          key={status}
                          className={`flex items-center justify-center p-3.5 rounded-xl border text-sm font-bold transition-all ${
                            readOnly
                              ? active
                                ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                                : 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
                              : active
                              ? 'bg-amber-500/20 border-amber-500 text-amber-400 cursor-pointer'
                              : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:border-slate-500 cursor-pointer'
                          }`}
                        >
                          <input
                            type="radio"
                            name="advisorStatus"
                            className="hidden"
                            disabled={readOnly}
                            checked={active}
                            onChange={() => !readOnly && updateForm({ advisorParticipationStatus: status })}
                          />
                          {label}
                        </label>
                      );
                    })}
                  </div>
                  {validationErrors.advisorParticipationStatus && (
                    <p data-error className="text-rose-400 text-xs">{validationErrors.advisorParticipationStatus}</p>
                  )}
                </div>
              </div>
            </section>

            <hr className="border-slate-800" />

            {/* ── Section 3: Students ── */}
            <section>
              <div className="flex justify-between items-center mb-6">
                <SectionHeader number={3} title="Öğrenci Bilgileri" />
                {!readOnly && (
                  <button
                    type="button"
                    onClick={addStudent}
                    className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-2 rounded-xl text-sm font-bold text-white transition-colors"
                  >
                    <User size={15} /> Öğrenci Ekle
                  </button>
                )}
              </div>

              {validationErrors.students && (
                <p data-error className="text-rose-400 text-xs mb-4">{validationErrors.students}</p>
              )}

              <div className="space-y-3">
                {(formData.students || []).map((student, idx) => (
                  <StudentCard
                    key={idx}
                    student={student}
                    index={idx}
                    onChange={handleStudentChange}
                    onRemove={removeStudent}
                    readOnly={readOnly}
                  />
                ))}
                {(formData.students || []).length === 0 && (
                  <div className="border border-dashed border-slate-800 rounded-2xl py-10 text-center text-slate-600 text-sm">
                    Henüz öğrenci eklenmedi
                  </div>
                )}
              </div>
            </section>

            <hr className="border-slate-800" />

            {/* ── Section 4: Transportation & Accommodation ── */}
            <section>
              <SectionHeader number={4} title="Ulaşım ve Konaklama" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <Field label="Ulaşım Şekli" required>
                  {readOnly ? (
                    <input type="text" readOnly value={formData.transportationType || ''} className={readonlyCls} />
                  ) : (
                    <select
                      value={formData.transportationType || ''}
                      onChange={(e) => updateForm({ transportationType: e.target.value })}
                      className={`${inputCls} ${validationErrors.transportationType ? 'border-rose-500' : ''}`}
                    >
                      <option value="">Seçiniz...</option>
                      {TRANSPORTATION_OPTIONS.map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  )}
                  {validationErrors.transportationType && (
                    <p data-error className="text-rose-400 text-xs mt-1">{validationErrors.transportationType}</p>
                  )}
                </Field>

                {formData.transportationType === 'Diğer' && (
                  <Field label="Ulaşım Açıklaması">
                    <input
                      type="text"
                      value={formData.transportationOtherDesc || ''}
                      onChange={(e) => updateForm({ transportationOtherDesc: e.target.value })}
                      className={readOnly ? readonlyCls : inputCls}
                      readOnly={readOnly}
                      placeholder="Açıklayınız..."
                    />
                  </Field>
                )}

                <Field label="Tahmini Varış (Konya)">
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={formData.arrivalDate || ''}
                      onChange={(e) => updateForm({ arrivalDate: e.target.value })}
                      className={`flex-1 ${readOnly ? readonlyCls : inputCls}`}
                      readOnly={readOnly}
                    />
                    <input
                      type="time"
                      value={formData.arrivalTime || ''}
                      onChange={(e) => updateForm({ arrivalTime: e.target.value })}
                      className={`w-28 ${readOnly ? readonlyCls : inputCls}`}
                      readOnly={readOnly}
                    />
                  </div>
                </Field>

                <Field label="Tahmini Dönüş (Konya'dan)">
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={formData.departureDate || ''}
                      onChange={(e) => updateForm({ departureDate: e.target.value })}
                      className={`flex-1 ${readOnly ? readonlyCls : inputCls}`}
                      readOnly={readOnly}
                    />
                    <input
                      type="time"
                      value={formData.departureTime || ''}
                      onChange={(e) => updateForm({ departureTime: e.target.value })}
                      className={`w-28 ${readOnly ? readonlyCls : inputCls}`}
                      readOnly={readOnly}
                    />
                  </div>
                </Field>

                <Field label="Konaklama İhtiyacı">
                  {readOnly ? (
                    <input type="text" readOnly value={formData.accommodationRequired === 'Yes' ? 'Evet' : formData.accommodationRequired === 'No' ? 'Hayır' : 'Henüz Net Değil'} className={readonlyCls} />
                  ) : (
                    <select
                      value={formData.accommodationRequired || 'Not_Sure'}
                      onChange={(e) => updateForm({ accommodationRequired: e.target.value as any })}
                      className={inputCls}
                    >
                      <option value="Yes">Evet</option>
                      <option value="No">Hayır</option>
                      <option value="Not_Sure">Henüz Net Değil</option>
                    </select>
                  )}
                </Field>

                {formData.accommodationRequired === 'Yes' && (
                  <Field label="Konaklama Kişi Sayısı (Siz Dahil)">
                    <input
                      type="number"
                      min="1"
                      value={formData.accommodationPersonCount || ''}
                      onChange={(e) => updateForm({ accommodationPersonCount: parseInt(e.target.value) || 0 })}
                      className={readOnly ? readonlyCls : inputCls}
                      readOnly={readOnly}
                    />
                  </Field>
                )}

                <Field label="Ek Açıklama veya Talepleriniz" className="md:col-span-2">
                  <textarea
                    value={formData.additionalNotes || ''}
                    onChange={(e) => updateForm({ additionalNotes: e.target.value })}
                    className={`${readOnly ? readonlyCls : inputCls} min-h-[100px] resize-y`}
                    readOnly={readOnly}
                    placeholder="Eklemek istediğiniz bilgiler..."
                  />
                </Field>
              </div>
            </section>

            <hr className="border-slate-800" />

            {/* ── Section 5: Parent Consent ── */}
            <section>
              <SectionHeader number={5} title="Veli İzin Belgesi Onayı" />

              <div className="bg-amber-950/20 border border-amber-500/20 p-5 rounded-2xl mb-5 flex gap-4">
                <Info className="text-amber-500 flex-shrink-0 mt-0.5" size={18} />
                <div className="space-y-1.5 text-sm">
                  <p className="text-slate-300">
                    Öğrencilerin ödül törenine katılımına ilişkin veli izin belgeleri danışman öğretmen tarafından kendi okuluna teslim edilmeli ve okul süreci kapsamında muhafaza edilmelidir.
                  </p>
                  <p className="text-amber-400 font-bold">
                    Bu belgelerin Reflect&amp;Shoot ekibine gönderilmesine gerek yoktur.
                  </p>
                </div>
              </div>

              <label
                className={`flex items-start gap-4 p-5 rounded-2xl border transition-all ${
                  readOnly
                    ? formData.parentConsentAccepted
                      ? 'bg-emerald-900/15 border-emerald-500/30'
                      : 'bg-slate-900 border-slate-800'
                    : formData.parentConsentAccepted
                    ? 'bg-emerald-900/20 border-emerald-500/50 cursor-pointer'
                    : 'bg-slate-900 border-slate-700 hover:border-slate-500 cursor-pointer'
                }`}
              >
                <div
                  className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                    formData.parentConsentAccepted ? 'bg-emerald-500 border-emerald-500' : 'bg-slate-800 border-slate-600'
                  }`}
                >
                  {formData.parentConsentAccepted && <CheckCircle2 size={13} className="text-white" />}
                </div>
                <input
                  type="checkbox"
                  className="hidden"
                  disabled={readOnly}
                  checked={!!formData.parentConsentAccepted}
                  onChange={(e) => !readOnly && updateForm({ parentConsentAccepted: e.target.checked })}
                />
                <span className={`text-sm leading-relaxed ${formData.parentConsentAccepted ? 'text-white' : 'text-slate-400'}`}>
                  Katılım bilgilerinin doğru olduğunu, öğrenciler için gerekli veli izin belgelerinin danışman öğretmen tarafından kendi okuluna teslim edileceğini ve bu belgelerin Reflect&amp;Shoot ekibine gönderilmeyeceğini kabul ederim.
                </span>
              </label>
              {validationErrors.parentConsentAccepted && (
                <p data-error className="text-rose-400 text-xs mt-2">{validationErrors.parentConsentAccepted}</p>
              )}
            </section>

            {/* ── Submit / Status ── */}
            {!readOnly && (
              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitLoading}
                  className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed text-black font-black uppercase tracking-widest py-5 rounded-2xl text-base transition-all hover:-translate-y-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center gap-3"
                >
                  {submitLoading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Gönderiliyor...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Formu Gönder
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between mt-4">
                  <p className="text-xs text-slate-600 flex items-center gap-1.5">
                    <ShieldCheck size={12} /> Bilgileriniz güvenle saklanmaktadır
                  </p>
                  <div className="text-xs text-slate-600 flex items-center gap-1.5">
                    {saveStatus === 'saving' && (
                      <><Loader2 size={11} className="animate-spin" /> Kaydediliyor...</>
                    )}
                    {saveStatus === 'saved' && (
                      <><CheckCircle2 size={11} className="text-emerald-500" /> <span className="text-emerald-600">Taslak kaydedildi</span></>
                    )}
                    {saveStatus === 'error' && (
                      <><AlertTriangle size={11} className="text-rose-500" /> <span className="text-rose-600">Kayıt başarısız</span></>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};