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
import { calcKRProgress, calcObjectiveProgress, OKR_STATUS_COLORS, OKR_STATUS_LABELS } from '@/lib/utils/colorUtils';
import { TEAM_MEMBERS } from '@/lib/data/mockData';
import { clsx } from '@/lib/utils/clsx';
import { formatRelative } from '@/lib/utils/dateUtils';

function ConfidencePill({ confidence, onToggle }: { confidence: OKRStatus; onToggle: () => void }) {
  const colors = OKR_STATUS_COLORS[confidence];
  const Icon = confidence === 'on_track' ? TrendingUp : confidence === 'at_risk' ? Minus : TrendingDown;
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      title="Click to cycle confidence"
      className={clsx('inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium transition-all hover:opacity-80 whitespace-nowrap', colors.bg, colors.text)}
    >
      <Icon size={10} />
      {OKR_STATUS_LABELS[confidence]}
    </button>
  );
}

function formatKRValue(kr: KeyResult, value: number): string {
  if (kr.metricType === 'currency') return `$${value.toLocaleString()}`;
  if (kr.metricType === 'percentage') return `${value}%`;
  if (kr.metricType === 'binary') return value ? '✓ Done' : '✗ Not done';
  return String(value);
}

function KeyResultRow({ kr, objectiveId }: { kr: KeyResult; objectiveId: string }) {
  const { openCheckIn, updateKeyResult } = useOKRsStore();
  const progress = calcKRProgress(kr.startValue, kr.currentValue, kr.targetValue);

  const cycleConfidence = () => {
    const cycle: OKRStatus[] = ['on_track', 'at_risk', 'off_track'];
    const next = cycle[(cycle.indexOf(kr.confidence) + 1) % cycle.length];
    updateKeyResult(objectiveId, kr.id, { confidence: next });
  };

  const lastCheckIn = kr.checkIns[kr.checkIns.length - 1];

  return (
    <div className="px-4 py-3 hover:bg-slate-50/80 border-b border-slate-100 last:border-0 transition-colors">
      {/* Title row */}
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-slate-700 leading-snug">{kr.title}</p>
          {lastCheckIn && (
            <p className="text-xs text-slate-400 mt-0.5">
              Last update: <span className="text-slate-500">{formatKRValue(kr, lastCheckIn.value)}</span> · {formatRelative(lastCheckIn.createdAt)}
              {lastCheckIn.note && <span className="ml-1 italic">"{lastCheckIn.note.slice(0, 50)}{lastCheckIn.note.length > 50 ? '…' : ''}"</span>}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Avatar ownerId={kr.ownerId} size="xs" />
          <ConfidencePill confidence={kr.confidence} onToggle={cycleConfidence} />
          <button
            onClick={() => openCheckIn(kr.id)}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors whitespace-nowrap"
          >
            + Check-in
          </button>
        </div>
      </div>

      {/* Progress row */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-500 tabular-nums shrink-0 w-12 text-right">
          {formatKRValue(kr, kr.startValue)}
        </span>
        <div className="flex-1 relative">
          <ProgressBar value={progress} height="sm" />
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-xs font-semibold text-slate-700 tabular-nums">
            {formatKRValue(kr, kr.currentValue)}
          </span>
          <span className="text-xs text-slate-400">/</span>
          <span className="text-xs text-slate-500 tabular-nums">
            {formatKRValue(kr, kr.targetValue)}
          </span>
          <span className="text-xs text-slate-400 tabular-nums ml-1">({Math.round(progress)}%)</span>
        </div>
      </div>
    </div>
  );
}

function ObjectiveCard({ obj }: { obj: Objective }) {
  const [expanded, setExpanded] = useState(true);
  const { checkInModalKRId, closeCheckIn } = useOKRsStore();
  const progress = calcObjectiveProgress(obj.keyResults);

  const checkInKR = obj.keyResults.find((kr) => kr.id === checkInModalKRId);

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
      {/* Objective header */}
      <div
        className="flex items-center gap-4 px-4 py-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <button className="text-slate-400 hover:text-slate-600 shrink-0 transition-colors">
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>

        {/* Donut progress */}
        <div className="relative shrink-0">
          <DonutProgress value={progress} size={48} strokeWidth={5} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-slate-800">{progress}%</span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <p className="text-sm font-semibold text-slate-800">{obj.title}</p>
            <OKRStatusBadge status={obj.status} size="sm" />
            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded font-medium">{obj.period}</span>
          </div>
          {obj.description && (
            <p className="text-xs text-slate-500 truncate max-w-xl">{obj.description}</p>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0 ml-auto">
          <span className="text-xs text-slate-400">{obj.keyResults.length} KRs</span>
          <Avatar ownerId={obj.ownerId} size="sm" />
        </div>
      </div>

      {/* Key results */}
      {expanded && (
        <div className="border-t border-slate-100">
          {obj.keyResults.map((kr) => (
            <KeyResultRow key={kr.id} kr={kr} objectiveId={obj.id} />
          ))}
          {obj.keyResults.length === 0 && (
            <p className="px-8 py-5 text-sm text-slate-400">No key results yet.</p>
          )}
          <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/50">
            <button className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors">
              <Plus size={12} /> Add Key Result
            </button>
          </div>
        </div>
      )}

      {/* Check-in modal */}
      {checkInKR && (
        <CheckInModal kr={checkInKR} objectiveId={obj.id} onClose={closeCheckIn} />
      )}
    </div>
  );
}

export default function OKRsPage() {
  const { objectives, filterPeriod, setFilterPeriod } = useOKRsStore();

  const filtered = objectives.filter((obj) => {
    if (filterPeriod && obj.period !== filterPeriod) return false;
    return true;
  });

  const periods = [...new Set(objectives.map((o) => o.period))];

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-slate-200 bg-white shrink-0 flex-wrap">
        <h1 className="text-sm font-semibold text-slate-800">Objectives & Key Results</h1>
        <div className="h-4 w-px bg-slate-200" />

        {/* Period filter */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setFilterPeriod(null)}
            className={clsx(
              'px-2.5 py-1.5 rounded text-xs font-medium transition-colors',
              !filterPeriod ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-100'
            )}
          >
            All
          </button>
          {periods.map((p) => (
            <button
              key={p}
              onClick={() => setFilterPeriod(p)}
              className={clsx(
                'px-2.5 py-1.5 rounded text-xs font-medium transition-colors',
                filterPeriod === p ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-100'
              )}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        <Button variant="primary" size="sm">
          <Plus size={14} />
          New Objective
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 md:p-6 space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-sm">No objectives for this period.</div>
        ) : (
          filtered.map((obj) => <ObjectiveCard key={obj.id} obj={obj} />)
        )}
      </div>
    </div>
  );
}
