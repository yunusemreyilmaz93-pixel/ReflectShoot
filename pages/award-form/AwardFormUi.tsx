import React, { useState } from 'react';
import { User, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import type { AwardParticipation } from '../../types';
import { SPECIAL_CONDITIONS, inputCls, readonlyCls } from './constants';

export const SectionHeader = ({ number, title }: { number: number; title: string }) => (
  <h2 className="text-xl font-black text-white mb-6 flex items-center gap-3">
    <span className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center text-sm font-black flex-shrink-0">
      {number}
    </span>
    {title}
  </h2>
);

export const FieldLabel = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
    {children}
    {required && <span className="text-rose-500 ml-1">*</span>}
  </label>
);

// inputCls from constants
const _unused_input = "w-full bg-slate-800/60 border border-slate-700 focus:border-amber-500 focus:bg-slate-800 rounded-xl p-3.5 text-white outline-none transition-colors placeholder:text-slate-600 text-sm";
// readonlyCls from constants
const _unused_ro = "w-full bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 text-slate-400 text-sm cursor-not-allowed";

interface FieldProps {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const Field = ({ label, required, className = '', children }: FieldProps) => (
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

export const StudentCard = ({ student, index, onChange, onRemove, readOnly }: StudentCardProps) => {
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
export interface ValidationErrors {
  advisorName?: string;
  advisorPhone?: string;
  advisorEmail?: string;
  advisorParticipationStatus?: string;
  transportationType?: string;
  parentConsentAccepted?: string;
  students?: string;
}

export const validate = (formData: Partial<AwardParticipation>): ValidationErrors => {
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
