import { clsx } from '@/lib/utils/clsx';

interface ProgressBarProps {
  value: number; // 0-100
  color?: string;
  height?: 'xs' | 'sm' | 'md';
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({ value, color, height = 'sm', showLabel = false, className }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, value));
  const heightClass = height === 'xs' ? 'h-1' : height === 'sm' ? 'h-1.5' : 'h-2';
  const barColor = color ?? (pct >= 70 ? 'bg-emerald-500' : pct >= 40 ? 'bg-blue-500' : 'bg-amber-500');

  return (
    <div className={clsx('flex items-center gap-2', className)}>
      <div className={clsx('flex-1 bg-slate-100 rounded-full overflow-hidden', heightClass)}>
        <div
          className={clsx('h-full rounded-full transition-all duration-300', typeof color === 'string' ? '' : barColor)}
          style={{ width: `${pct}%`, backgroundColor: typeof color === 'string' ? color : undefined }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-slate-500 tabular-nums w-8 text-right">{pct}%</span>
      )}
    </div>
  );
}

interface DonutProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}

export function DonutProgress({ value, size = 48, strokeWidth = 5, color = '#3B82F6' }: DonutProgressProps) {
  const pct = Math.min(100, Math.max(0, value));
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E2E8F0" strokeWidth={strokeWidth} />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.4s ease' }}
      />
    </svg>
  );
}
