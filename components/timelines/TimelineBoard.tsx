'use client';
import type { TimelineItem, TimelineItemStatus } from '@/lib/types';
import { StatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { formatDate } from '@/lib/utils/dateUtils';
import { useProjectsStore } from '@/lib/store/projectsStore';

const COLUMNS: Array<{ status: TimelineItemStatus; label: string }> = [
  { status: 'not_started', label: 'Not Started' },
  { status: 'in_progress', label: 'In Progress' },
  { status: 'at_risk', label: 'At Risk' },
  { status: 'complete', label: 'Complete' },
];

const COLUMN_COLORS: Record<TimelineItemStatus, string> = {
  not_started: 'bg-slate-400',
  in_progress: 'bg-blue-500',
  at_risk: 'bg-amber-500',
  complete: 'bg-emerald-500',
};

interface TimelineBoardProps {
  items: TimelineItem[];
  onSelectItem: (id: string) => void;
}

export function TimelineBoard({ items, onSelectItem }: TimelineBoardProps) {
  const updateItem = useProjectsStore((s) => s.updateItem);

  const handleDrop = (e: React.DragEvent, status: TimelineItemStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (id) updateItem(id, { status });
  };

  return (
    <div className="flex gap-4 h-full overflow-x-auto p-4">
      {COLUMNS.map(({ status, label }) => {
        const col = items.filter((i) => i.status === status);
        return (
          <div
            key={status}
            className="flex flex-col shrink-0 w-64"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, status)}
          >
            {/* Column header */}
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-2 h-2 rounded-full ${COLUMN_COLORS[status]}`} />
              <span className="text-sm font-medium text-slate-700">{label}</span>
              <span className="ml-auto text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{col.length}</span>
            </div>

            {/* Cards */}
            <div className="flex-1 space-y-2 min-h-[120px]">
              {col.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg border border-slate-200 p-3 cursor-pointer hover:border-slate-300 hover:shadow-sm transition-all"
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData('text/plain', item.id)}
                  onClick={() => onSelectItem(item.id)}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-sm font-medium text-slate-800 leading-snug line-clamp-2">{item.title}</p>
                    <PriorityBadge priority={item.priority} />
                  </div>
                  <div className="mb-2">
                    <ProgressBar value={item.progress} height="xs" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Avatar ownerId={item.ownerId} size="xs" />
                    <span className="text-xs text-slate-400">{formatDate(item.endDate, 'MMM d')}</span>
                  </div>
                </div>
              ))}
              {col.length === 0 && (
                <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center text-xs text-slate-400">
                  Drop items here
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
