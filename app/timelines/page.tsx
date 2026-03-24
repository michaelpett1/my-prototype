'use client';
import { useState } from 'react';
import { Plus, LayoutGrid, List, Columns, AlignLeft } from 'lucide-react';
import { GanttChart } from '@/components/timelines/GanttChart';
import { TimelineTable } from '@/components/timelines/TimelineTable';
import { TimelineBoard } from '@/components/timelines/TimelineBoard';
import { ItemDetailPanel } from '@/components/timelines/ItemDetailPanel';
import { Button } from '@/components/ui/Button';
import { useProjectsStore } from '@/lib/store/projectsStore';
import type { TimelineViewMode, GanttScale } from '@/lib/types';
import { clsx } from '@/lib/utils/clsx';

const VIEW_OPTIONS: Array<{ mode: TimelineViewMode; label: string; icon: React.ElementType }> = [
  { mode: 'gantt', label: 'Gantt', icon: AlignLeft },
  { mode: 'table', label: 'Table', icon: List },
  { mode: 'board', label: 'Board', icon: Columns },
];

const SCALE_OPTIONS: Array<{ scale: GanttScale; label: string }> = [
  { scale: 'week', label: 'Week' },
  { scale: 'month', label: 'Month' },
  { scale: 'quarter', label: 'Quarter' },
];

export default function TimelinesPage() {
  const {
    items,
    viewMode,
    ganttScale,
    selectedItemId,
    setViewMode,
    setGanttScale,
    selectItem,
    filterStatus,
    filterOwnerId,
    setFilterStatus,
  } = useProjectsStore();

  const selectedItem = selectedItemId ? items.find((i) => i.id === selectedItemId) ?? null : null;

  // Apply filters
  const filtered = items.filter((item) => {
    if (filterStatus && item.status !== filterStatus) return false;
    if (filterOwnerId && item.ownerId !== filterOwnerId) return false;
    return true;
  });

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-slate-200 bg-white shrink-0">
        {/* View toggle */}
        <div className="flex items-center bg-slate-100 rounded p-0.5 gap-0.5">
          {VIEW_OPTIONS.map(({ mode, label, icon: Icon }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={clsx(
                'flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium transition-colors',
                viewMode === mode ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              )}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>

        {/* Scale toggle (Gantt only) */}
        {viewMode === 'gantt' && (
          <div className="flex items-center bg-slate-100 rounded p-0.5 gap-0.5">
            {SCALE_OPTIONS.map(({ scale, label }) => (
              <button
                key={scale}
                onClick={() => setGanttScale(scale)}
                className={clsx(
                  'px-2.5 py-1.5 rounded text-xs font-medium transition-colors',
                  ganttScale === scale ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Filter by status */}
        <select
          value={filterStatus ?? ''}
          onChange={(e) => setFilterStatus(e.target.value || null)}
          className="text-xs border border-slate-200 rounded px-2 py-1.5 text-slate-600 bg-white"
        >
          <option value="">All Statuses</option>
          <option value="not_started">Not Started</option>
          <option value="in_progress">In Progress</option>
          <option value="at_risk">At Risk</option>
          <option value="complete">Complete</option>
        </select>

        <div className="flex-1" />

        <Button variant="primary" size="sm">
          <Plus size={14} />
          New Project
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'gantt' && (
          <div className="h-full overflow-auto">
            <GanttChart items={filtered} scale={ganttScale} onSelectItem={selectItem} />
          </div>
        )}
        {viewMode === 'table' && (
          <div className="h-full overflow-auto">
            <TimelineTable items={filtered} onSelectItem={selectItem} />
          </div>
        )}
        {viewMode === 'board' && (
          <div className="h-full overflow-auto">
            <TimelineBoard items={filtered} onSelectItem={selectItem} />
          </div>
        )}
      </div>

      {/* Detail panel */}
      <ItemDetailPanel item={selectedItem} onClose={() => selectItem(null)} />
    </div>
  );
}
