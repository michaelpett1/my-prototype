'use client';
import { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useOKRsStore } from '@/lib/store/okrsStore';
import { CheckInModal } from '@/components/okrs/CheckInModal';
import { OKRStatusBadge } from '@/components/ui/Badge';
import { ProgressBar, DonutProgress } from '@/components/ui/ProgressBar';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import type { KeyResult, Objective, OKRStatus } from '@/lib/types';
import { calcKRProgress, calcObjectiveProgress, OKR_STATUS_LABELS } from '@/lib/utils/colorUtils';
import { TEAM_MEMBERS } from '@/lib/data/mockData';
import { clsx } from '@/lib/utils/clsx';
import { formatRelative } from '@/lib/utils/dateUtils';

function formatKRValue(kr: KeyResult, value: number): string {
  if (kr.metricType === 'currency')   return `$${value.toLocaleString()}`;
  if (kr.metricType === 'percentage') return `${value}%`;
  if (kr.metricType === 'binary')     return value ? '✓ Done' : '✗ Not done';
  return String(value);
}

/* ── Confidence pill — click to cycle ───────────────────────────── */
const CONF_COLORS: Record<OKRStatus, { bg: string; text: string; icon: React.ElementType }> = {
  on_track:  { bg: '#F0FDF4', text: '#15803D', icon: TrendingUp },
  at_risk:   { bg: '#FFFBEB', text: '#92400E', icon: Minus },
  off_track: { bg: '#FEF2F2', text: '#991B1B', icon: TrendingDown },
};

function ConfPill({ confidence, onToggle }: { confidence: OKRStatus; onToggle: () => void }) {
  const c = CONF_COLORS[confidence];
  const Icon = c.icon;
  return (
    <button
      onClick={e => { e.stopPropagation(); onToggle(); }}
      title="Click to cycle confidence"
      className="inline-flex items-center gap-1 rounded-[3px] font-semibold transition-opacity duration-150 hover:opacity-75 whitespace-nowrap"
      style={{ padding: '2px 7px', fontSize: '11px', background: c.bg, color: c.text }}
    >
      <Icon size={10} />
      {OKR_STATUS_LABELS[confidence]}
    </button>
  );
}

/* ── Key result row ─────────────────────────────────────────────── */
function KeyResultRow({ kr, objectiveId }: { kr: KeyResult; objectiveId: string }) {
  const { openCheckIn, updateKeyResult } = useOKRsStore();
  const progress = calcKRProgress(kr.startValue, kr.currentValue, kr.targetValue);
  const lastCheckIn = kr.checkIns[kr.checkIns.length - 1];

  const cycleConfidence = () => {
    const cycle: OKRStatus[] = ['on_track', 'at_risk', 'off_track'];
    const next = cycle[(cycle.indexOf(kr.confidence) + 1) % cycle.length];
    updateKeyResult(objectiveId, kr.id, { confidence: next });
  };

  return (
    <div
      className="px-4 py-3 transition-colors duration-100"
      style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = '#FAFAF9'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium leading-snug" style={{ color: '#1C1917' }}>{kr.title}</p>
          {lastCheckIn && (
            <p className="text-[11px] mt-0.5 font-mono" style={{ color: '#9CA3AF' }}>
              {formatRelative(lastCheckIn.createdAt)} · &ldquo;{lastCheckIn.note.slice(0, 60)}{lastCheckIn.note.length > 60 ? '…' : ''}&rdquo;
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Avatar ownerId={kr.ownerId} size="xs" />
          <ConfPill confidence={kr.confidence} onToggle={cycleConfidence} />
          <button
            onClick={() => openCheckIn(kr.id)}
            className="text-[12px] font-semibold rounded-[4px] transition-all duration-150 whitespace-nowrap"
            style={{ padding: '3px 8px', color: '#2563EB' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#EFF6FF'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
          >
            + Check-in
          </button>
        </div>
      </div>

      {/* Progress row — mono values flank the bar */}
      <div className="flex items-center gap-3">
        <span className="text-[11px] font-mono tabular-nums shrink-0" style={{ color: '#9CA3AF', minWidth: 36, textAlign: 'right' }}>
          {formatKRValue(kr, kr.startValue)}
        </span>
        <div className="flex-1"><ProgressBar value={progress} height="xs" /></div>
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-[12px] font-semibold font-mono tabular-nums" style={{ color: '#1C1917' }}>
            {formatKRValue(kr, kr.currentValue)}
          </span>
          <span style={{ color: '#D1D5DB', fontSize: 12 }}>/</span>
          <span className="text-[12px] font-mono tabular-nums" style={{ color: '#9CA3AF' }}>
            {formatKRValue(kr, kr.targetValue)}
          </span>
          <span className="text-[11px] font-mono tabular-nums ml-1" style={{ color: '#D1D5DB' }}>
            {Math.round(progress)}%
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Objective card ─────────────────────────────────────────────── */
function ObjectiveCard({ obj }: { obj: Objective }) {
  const [expanded, setExpanded] = useState(true);
  const { checkInModalKRId, closeCheckIn } = useOKRsStore();
  const progress = calcObjectiveProgress(obj.keyResults);
  const checkInKR = obj.keyResults.find(kr => kr.id === checkInModalKRId);

  // Dynamic donut colour: green if on_track, amber if at_risk, red if off_track
  const donutColor = obj.status === 'on_track' ? '#16A34A' : obj.status === 'at_risk' ? '#D97706' : '#DC2626';

  return (
    <div
      className="bg-white rounded-[7px] overflow-hidden"
      style={{ border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
    >
      {/* Objective header */}
      <div
        className="flex items-center gap-4 px-4 py-3.5 cursor-pointer transition-colors duration-100"
        onClick={() => setExpanded(!expanded)}
        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = '#FAFAF9'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
      >
        {/* Chevron */}
        <div style={{ color: '#D1D5DB' }}>
          {expanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
        </div>

        {/* Donut + pct */}
        <div className="relative shrink-0">
          <DonutProgress value={progress} size={42} strokeWidth={4} color={donutColor} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] font-semibold font-mono" style={{ color: '#6B7280' }}>{progress}%</span>
          </div>
        </div>

        {/* Title + meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <p className="text-[14px] font-semibold" style={{ color: '#1C1917' }}>{obj.title}</p>
            <OKRStatusBadge status={obj.status} size="sm" />
            <span
              className="text-[11px] font-mono px-2 py-[2px] rounded-[3px]"
              style={{ background: 'rgba(0,0,0,0.04)', color: '#9CA3AF' }}
            >
              {obj.period}
            </span>
          </div>
          {obj.description && (
            <p className="text-[12px] truncate max-w-xl" style={{ color: '#9CA3AF' }}>{obj.description}</p>
          )}
        </div>

        {/* Right meta */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-[12px] font-mono" style={{ color: '#9CA3AF' }}>{obj.keyResults.length} KRs</span>
          <Avatar ownerId={obj.ownerId} size="sm" />
        </div>
      </div>

      {/* Key results */}
      {expanded && (
        <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
          {obj.keyResults.map(kr => (
            <KeyResultRow key={kr.id} kr={kr} objectiveId={obj.id} />
          ))}
          {obj.keyResults.length === 0 && (
            <p className="px-8 py-5 text-[13px]" style={{ color: '#9CA3AF' }}>No key results yet.</p>
          )}
          <div
            className="px-4 py-2.5"
            style={{ borderTop: '1px solid rgba(0,0,0,0.05)', background: '#FAFAF9' }}
          >
            <button
              className="text-[12px] font-semibold flex items-center gap-1 transition-colors duration-150"
              style={{ color: '#2563EB' }}
            >
              <Plus size={12} /> Add Key Result
            </button>
          </div>
        </div>
      )}

      {checkInKR && <CheckInModal kr={checkInKR} objectiveId={obj.id} onClose={closeCheckIn} />}
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────── */
export default function OKRsPage() {
  const { objectives, filterPeriod, setFilterPeriod } = useOKRsStore();
  const filtered = objectives.filter(obj => !filterPeriod || obj.period === filterPeriod);
  const periods = [...new Set(objectives.map(o => o.period))];

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div
        className="flex items-center gap-3 px-4 py-2 shrink-0 flex-wrap"
        style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid rgba(0,0,0,0.07)', minHeight: 44 }}
      >
        <span className="text-[13px] font-semibold" style={{ color: '#1C1917' }}>Objectives & Key Results</span>
        <div className="w-px h-4 bg-[rgba(0,0,0,0.08)]" />

        {/* Period tabs */}
        <div className="flex items-center gap-0.5">
          {[null, ...periods].map(p => (
            <button
              key={p ?? 'all'}
              onClick={() => setFilterPeriod(p)}
              className="px-2.5 py-1.5 rounded-[4px] text-[12px] font-medium transition-all duration-150"
              style={filterPeriod === p
                ? { background: '#2563EB', color: '#FFFFFF' }
                : { color: '#6B7280' }
              }
              onMouseEnter={e => {
                if (filterPeriod !== p) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,0,0,0.04)';
              }}
              onMouseLeave={e => {
                if (filterPeriod !== p) (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
              }}
            >
              {p ?? 'All'}
            </button>
          ))}
        </div>

        <div className="flex-1" />
        <Button variant="primary" size="sm"><Plus size={13} /> New Objective</Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-5 space-y-3" style={{ maxWidth: 1100 }}>
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-[13px]" style={{ color: '#9CA3AF' }}>
            No objectives for this period.
          </div>
        ) : (
          filtered.map(obj => <ObjectiveCard key={obj.id} obj={obj} />)
        )}
      </div>
    </div>
  );
}
