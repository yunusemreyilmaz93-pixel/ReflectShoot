import type { EvaluationCriteria } from '../../types';

export const CRITERIA_KEYS = ['story', 'technical', 'originality', 'themeFit'] as const;

export type CriteriaKey = (typeof CRITERIA_KEYS)[number];

/** Sum of the four 0–25 criteria (0–100). */
export function totalFromCriteria(criteria: EvaluationCriteria): number {
  return CRITERIA_KEYS.reduce((sum, key) => sum + (Number(criteria[key]) || 0), 0);
}

/** Whether a single criterion is in the allowed range. */
export function isValidCriterion(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 25;
}

export function isValidCriteria(criteria: Partial<EvaluationCriteria> | null | undefined): boolean {
  if (!criteria) return false;
  return CRITERIA_KEYS.every((key) => isValidCriterion(criteria[key]));
}

/** Average of valid (non-draft, non-recused) totals, one decimal place — matches api/jury-score. */
export function averageJuryTotal(
  scores: Array<{ total?: number; isDraft?: boolean; isRecused?: boolean }>
): number {
  const valid = scores.filter((s) => !s.isDraft && !s.isRecused);
  if (valid.length === 0) return 0;
  const sum = valid.reduce((acc, s) => acc + (Number(s.total) || 0), 0);
  return Math.round((sum / valid.length) * 10) / 10;
}
