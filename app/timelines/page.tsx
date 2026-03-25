'use client';
import { useState } from 'react';
import { Plus, AlignLeft, List, Columns } from 'lucide-react';
import { GanttChart } from '@/components/timelines/GanttChart';
import { TimelineTable } from '@/components/timelines/TimelineTable';
import { TimelineBoard } from '@/components/timelines/TimelineBoard';
import { ItemDetailPanel } from '@/components/timelines/ItemDetailPanel';
import { Button } from '@/components/ui/Button';
import { useProjectsStore } from '@/lib/store/projectsStore';
import type { TimelineViewMode, GanttScale } from '@/lib/types';
import { clsx } from '@/lib/utils/clsx';

const VIEW_OPTS: Array<{ mode: TimelineViewMode; label: string; icon: React.ElementType }> = [
  { mode: 'gantt',  label: 'Gantt',  icon: AlignLeft },
  { mode: 'table',  label: 'Table',  icon: List },
  { mode: 'board',  label: 'Board',  icon: Columns },
];

const SCALE_OPTS: Array<{ scale: GanttScale; label: string }> = [
  { scale: 'week',    label: 'Week' },
  { scale: 'month',   label: 'Month' },
  { scale: 'quarter', label: 'Quarter' },
];

/* ── Segmented control — shared between view + scale toggles ──── */
function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  renderLabel,
}: {
  options: T[];
  value: T;
  onChange: (v: T) => void;
  renderLabel: (v: T) => React.ReactNode;
}) {
  return (
    <div
      className="flex items-center rounded-[5px] p-[3px] gap-[2px]"
      style={{ background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.06)' }}
    >
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={clsx(
            'flex items-center gap-1.5 rounded-[3px] text-[12px] font-medium transition-all duration-150 ease-out px-2.5 py-1',
            value === opt
              ? 'bg-white shadow-[0_1px_2px_rgba(0,0,0,0.08)] text-[#1C1917]'
              : 'text-[#6B7280] hover:text-[#374151]'
          )}
        >
          {renderLabel(opt)}
        </button>
      ))}
    </div>
  );
}

export default function TimelinesPage() {
  const {
    items, viewMode, ganttScale, selectedItemId,
    setViewMode, setGanttScale, selectItem,
    filterStatus, setFilterStatus,
  } = useProjectsStore();

  const selectedItem = selectedItemId ? items.find(i => i.id === selectedItemId) ?? null : null;

  const filtered = items.filter(item => {
    if (filterStatus && item.status !== filterStatus) return false;
    return true;
  });

  // Icons for view toggle
  const VIEW_ICONS: Record<TimelineViewMode, React.ElementType> = {
    gantt: AlignLeft, table: List, board: Columns,
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div
        className="flex items-center gap-3 px-4 py-2 shrink-0 flex-wrap"
        style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid rgba(0,0,0,0.07)',
          minHeight: '44px',
        }}
      >
        {/* View toggle */}
        <SegmentedControl
          options={['gantt', 'table', 'board'] as TimelineViewMode[]}
          value={viewMode}
          onChange={setViewMode}
          renderLabel={(v) => {
            const Icon = VIEW_ICONS[v];
            return (
              <>
                <Icon size={12} />
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </>
            );
          }}
        />

        {/* Scale toggle — only visible in Gantt mode */}
        {viewMode === 'gantt' && (
          <SegmentedControl
            options={['week', 'month', 'quarter'] as GanttScale[]}
            value={ganttScale}
            onChange={setGanttScale}
            renderLabel={(v) => v.charAt(0).toUpperCase() + v.slice(1)}
          />
        )}

        {/* Status filter */}
        <select
          value={filterStatus ?? ''}
          onChange={e => setFilterStatus(e.target.value || null)}
          className="text-[12px] rounded-[5px] transition-all duration-150 ease-out"
          style={{
            padding: '5px 8px',
            border: '1px solid rgba(0,0,0,0.10)',
            color: '#374151',
            background: '#FFFFFF',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
          }}
        >
          <option value="">All statuses</option>
          <option value="not_started">Not Started</option>
          <option value="in_progress">In Progress</option>
          <option value="at_risk">At Risk</option>
          <option value="complete">Complete</option>
        </select>

        <div className="flex-1" />

        <Button variant="primary" size="sm">
          <Plus size={13} /> New Project
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'gantt'  && <div className="h-full overflow-auto"><GanttChart items={filtered} scale={ganttScale} onSelectItem={selectItem} /></div>}
        {viewMode === 'table'  && <div className="h-full overflow-auto"><TimelineTable items={filtered} onSelectItem={selectItem} /></div>}
        {viewMode === 'board'  && <div className="h-full overflow-auto"><TimelineBoard items={filtered} onSelectItem={selectItem} /></div>}
      </div>

      <ItemDetailPanel item={selectedItem} onClose={() => selectItem(null)} />
    </div>
  );
}
