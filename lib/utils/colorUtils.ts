import type { TimelineItemStatus, OKRStatus, Priority } from '@/lib/types';

export const STATUS_COLORS: Record<TimelineItemStatus, { bg: string; text: string; dot: string; bar: string }> = {
  not_started: { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400', bar: 'bg-slate-400' },
  in_progress: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', bar: 'bg-blue-500' },
  at_risk: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', bar: 'bg-amber-500' },
  complete: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', bar: 'bg-emerald-500' },
};

export const STATUS_LABELS: Record<TimelineItemStatus, string> = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  at_risk: 'At Risk',
  complete: 'Complete',
};

export const OKR_STATUS_COLORS: Record<OKRStatus, { bg: string; text: string; dot: string }> = {
  on_track: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  at_risk: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  off_track: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
};

export const OKR_STATUS_LABELS: Record<OKRStatus, string> = {
  on_track: 'On Track',
  at_risk: 'At Risk',
  off_track: 'Off Track',
};

export const PRIORITY_COLORS: Record<Priority, { bg: string; text: string }> = {
  p0: { bg: 'bg-red-100', text: 'text-red-700' },
  p1: { bg: 'bg-orange-100', text: 'text-orange-700' },
  p2: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  p3: { bg: 'bg-slate-100', text: 'text-slate-600' },
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  p0: 'P0 Critical',
  p1: 'P1 High',
  p2: 'P2 Medium',
  p3: 'P3 Low',
};

export const GANTT_BAR_COLORS: Record<TimelineItemStatus, string> = {
  not_started: '#94a3b8',
  in_progress: '#3B82F6',
  at_risk: '#F59E0B',
  complete: '#10B981',
};

export function calcKRProgress(startValue: number, currentValue: number, targetValue: number): number {
  if (targetValue === startValue) return currentValue >= targetValue ? 100 : 0;
  return Math.min(100, Math.max(0, ((currentValue - startValue) / (targetValue - startValue)) * 100));
}

export function calcObjectiveProgress(keyResults: Array<{ startValue: number; currentValue: number; targetValue: number; weight?: number }>): number {
  if (keyResults.length === 0) return 0;
  const totalWeight = keyResults.reduce((sum, kr) => sum + (kr.weight || 0), 0);
  if (totalWeight > 0) {
    const weighted = keyResults.reduce((sum, kr) => {
      const w = kr.weight || 0;
      return sum + calcKRProgress(kr.startValue, kr.currentValue, kr.targetValue) * w;
    }, 0);
    return Math.round(weighted / totalWeight);
  }
  const total = keyResults.reduce((sum, kr) => sum + calcKRProgress(kr.startValue, kr.currentValue, kr.targetValue), 0);
  return Math.round(total / keyResults.length);
}

export const SWIMLANE_THEMES = [
  { label: 'Conversion', color: '#3B82F6' },
  { label: 'Retention', color: '#8B5CF6' },
  { label: 'Platform', color: '#10B981' },
  { label: 'Growth', color: '#F59E0B' },
  { label: 'Mobile', color: '#EF4444' },
];
