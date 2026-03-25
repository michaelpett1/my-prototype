import { clsx } from '@/lib/utils/clsx';

/* Design decision: progress bars are intentionally thin (4–6px).
   They assist without competing with the data they represent.
   Color ramps from amber → blue → green by percentage.
*/

interface ProgressBarProps {
  value: number;
  color?: string;
  height?: 'xs' | 'sm' | 'md';
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({ value, color, height = 'sm', showLabel = false, className }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, value));
  const h = height === 'xs' ? 3 : height === 'sm' ? 4 : 6;

  // Auto color based on progress — warm → cool signals progress
  const autoColor = pct >= 70 ? '#16A34A' : pct >= 35 ? '#2563EB' : '#D97706';
  const barColor = color ?? autoColor;

  return (
    <div className={clsx('flex items-center gap-2', className)}>
      <div
        className="flex-1 rounded-full overflow-hidden"
        style={{ height: h, background: 'rgba(0,0,0,0.06)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-300 ease-out"
          style={{ width: `${pct}%`, backgroundColor: barColor }}
        />
      </div>
      {showLabel && (
        <span
          className="tabular-nums shrink-0"
          style={{ fontSize: '12px', color: '#9CA3AF', fontFamily: 'ui-monospace, monospace', width: '32px', textAlign: 'right' }}
        >
          {pct}%
        </span>
      )}
    </div>
  );
}

// ── Donut/ring progress for OKR objectives ──────────────────────────
interface DonutProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}

export function DonutProgress({ value, size = 48, strokeWidth = 4, color = '#2563EB' }: DonutProgressProps) {
  const pct = Math.min(100, Math.max(0, value));
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke="rgba(0,0,0,0.07)"
        strokeWidth={strokeWidth}
      />
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
