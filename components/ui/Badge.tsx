import { clsx } from '@/lib/utils/clsx';
import type { TimelineItemStatus, OKRStatus, Priority } from '@/lib/types';

/* Design decision: badges use color + label — never color alone (a11y).
   Kept very small (11px) so they assist scanning without dominating.
   Border radius: 3px (XS — chips/tags in the design system).
*/

// ── Status badge ────────────────────────────────────────────────────
const STATUS_CONFIG: Record<TimelineItemStatus, { dot: string; label: string; bg: string; text: string }> = {
  not_started: { dot: '#9CA3AF', label: 'Not Started',  bg: 'rgba(0,0,0,0.04)',   text: '#6B7280' },
  in_progress: { dot: '#2563EB', label: 'In Progress',  bg: '#EFF6FF',             text: '#1D4ED8' },
  at_risk:     { dot: '#D97706', label: 'At Risk',      bg: '#FFFBEB',             text: '#92400E' },
  complete:    { dot: '#16A34A', label: 'Complete',     bg: '#F0FDF4',             text: '#15803D' },
};

interface StatusBadgeProps { status: TimelineItemStatus; size?: 'sm' | 'md'; }

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const c = STATUS_CONFIG[status];
  return (
    <span
      className="inline-flex items-center gap-[5px] rounded-[3px] font-semibold whitespace-nowrap"
      style={{
        padding: size === 'sm' ? '2px 6px' : '2px 7px',
        fontSize: '11px',
        background: c.bg,
        color: c.text,
      }}
    >
      <span className="w-[5px] h-[5px] rounded-full shrink-0" style={{ background: c.dot }} />
      {c.label}
    </span>
  );
}

// ── OKR status badge ────────────────────────────────────────────────
const OKR_CONFIG: Record<OKRStatus, { dot: string; label: string; bg: string; text: string }> = {
  on_track: { dot: '#16A34A', label: 'On Track', bg: '#F0FDF4', text: '#15803D' },
  at_risk:  { dot: '#D97706', label: 'At Risk',  bg: '#FFFBEB', text: '#92400E' },
  off_track:{ dot: '#DC2626', label: 'Off Track',bg: '#FEF2F2', text: '#991B1B' },
};

interface OKRStatusBadgeProps { status: OKRStatus; size?: 'sm' | 'md'; }

export function OKRStatusBadge({ status, size = 'md' }: OKRStatusBadgeProps) {
  const c = OKR_CONFIG[status];
  return (
    <span
      className="inline-flex items-center gap-[5px] rounded-[3px] font-semibold whitespace-nowrap"
      style={{
        padding: size === 'sm' ? '2px 6px' : '2px 7px',
        fontSize: '11px',
        background: c.bg,
        color: c.text,
      }}
    >
      <span className="w-[5px] h-[5px] rounded-full shrink-0" style={{ background: c.dot }} />
      {c.label}
    </span>
  );
}

// ── Priority badge ──────────────────────────────────────────────────
const PRI_CONFIG: Record<Priority, { label: string; bg: string; text: string }> = {
  p0: { label: 'P0', bg: '#FEF2F2', text: '#991B1B' },
  p1: { label: 'P1', bg: '#FFF7ED', text: '#9A3412' },
  p2: { label: 'P2', bg: '#FEFCE8', text: '#854D0E' },
  p3: { label: 'P3', bg: 'rgba(0,0,0,0.04)', text: '#6B7280' },
};

interface PriorityBadgeProps { priority: Priority; }

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const c = PRI_CONFIG[priority];
  return (
    <span
      className="inline-flex items-center rounded-[3px] font-semibold whitespace-nowrap font-mono"
      style={{ padding: '2px 6px', fontSize: '11px', background: c.bg, color: c.text }}
    >
      {c.label}
    </span>
  );
}
