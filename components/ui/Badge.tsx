import { clsx } from '@/lib/utils/clsx';
import type { TimelineItemStatus, OKRStatus, Priority } from '@/lib/types';
import { STATUS_COLORS, STATUS_LABELS, OKR_STATUS_COLORS, OKR_STATUS_LABELS, PRIORITY_COLORS, PRIORITY_LABELS } from '@/lib/utils/colorUtils';

interface StatusBadgeProps {
  status: TimelineItemStatus;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const colors = STATUS_COLORS[status];
  return (
    <span className={clsx(
      'inline-flex items-center gap-1 rounded font-medium',
      size === 'sm' ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-0.5 text-xs',
      colors.bg, colors.text
    )}>
      <span className={clsx('w-1.5 h-1.5 rounded-full shrink-0', colors.dot)} />
      {STATUS_LABELS[status]}
    </span>
  );
}

interface OKRStatusBadgeProps {
  status: OKRStatus;
  size?: 'sm' | 'md';
}

export function OKRStatusBadge({ status, size = 'md' }: OKRStatusBadgeProps) {
  const colors = OKR_STATUS_COLORS[status];
  return (
    <span className={clsx(
      'inline-flex items-center gap-1 rounded font-medium',
      size === 'sm' ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-0.5 text-xs',
      colors.bg, colors.text
    )}>
      <span className={clsx('w-1.5 h-1.5 rounded-full shrink-0', colors.dot)} />
      {OKR_STATUS_LABELS[status]}
    </span>
  );
}

interface PriorityBadgeProps {
  priority: Priority;
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const colors = PRIORITY_COLORS[priority];
  return (
    <span className={clsx('inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium', colors.bg, colors.text)}>
      {PRIORITY_LABELS[priority]}
    </span>
  );
}
