'use client';
import type { TimelineItem, TimelineItemStatus } from '@/lib/types';
import { StatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { formatDate } from '@/lib/utils/dateUtils';
import { useProjectsStore } from '@/lib/store/projectsStore';

const COLUMNS: Array<{ status: TimelineItemStatus; label: string; accent: string }> = [
  { status: 'not_started', label: 'Not Started', accent: '#9CA3AF' },
  { status: 'in_progress', label: 'In Progress', accent: '#2563EB' },
  { status: 'at_risk',     label: 'At Risk',     accent: '#D97706' },
  { status: 'complete',    label: 'Complete',    accent: '#16A34A' },
];

interface TimelineBoardProps {
  items: TimelineItem[];
  onSelectItem: (id: string) => void;
}

export function TimelineBoard({ items, onSelectItem }: TimelineBoardProps) {
  const updateItem = useProjectsStore(s => s.updateItem);

  const handleDrop = (e: React.DragEvent, status: TimelineItemStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (id) updateItem(id, { status });
  };

  return (
    <div className="flex gap-3 h-full p-4 overflow-x-auto" style={{ backgroundColor: '#FAFAF9' }}>
      {COLUMNS.map(({ status, label, accent }) => {
        const col = items.filter(i => i.status === status);
        return (
          <div
            key={status}
            className="flex flex-col shrink-0"
            style={{ width: 256 }}
            onDragOver={e => e.preventDefault()}
            onDrop={e => handleDrop(e, status)}
          >
            {/* Column header */}
            <div className="flex items-center gap-2 mb-2.5 px-0.5">
              <div className="w-[7px] h-[7px] rounded-full shrink-0" style={{ background: accent }} />
              <span className="text-[12px] font-semibold" style={{ color: '#374151' }}>{label}</span>
              <span
                className="ml-auto text-[11px] font-mono px-1.5 py-0.5 rounded-[3px]"
                style={{ background: 'rgba(0,0,0,0.05)', color: '#9CA3AF' }}
              >
                {col.length}
              </span>
            </div>

            {/* Cards */}
            <div className="flex-1 space-y-2" style={{ minHeight: 100 }}>
              {col.map(item => (
                <div
                  key={item.id}
                  className="bg-white rounded-[7px] p-3 cursor-pointer transition-all duration-150 ease-out"
                  style={{
                    border: '1px solid rgba(0,0,0,0.07)',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  }}
                  draggable
                  onDragStart={e => e.dataTransfer.setData('text/plain', item.id)}
                  onClick={() => onSelectItem(item.id)}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.boxShadow = '0 3px 8px rgba(0,0,0,0.08)';
                    (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(0,0,0,0.12)';
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
                    (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(0,0,0,0.07)';
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                  }}
                >
                  {/* Card header */}
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <p className="text-[13px] font-semibold line-clamp-2 leading-snug" style={{ color: '#1C1917' }}>
                      {item.title}
                    </p>
                    <PriorityBadge priority={item.priority} />
                  </div>

                  {/* Progress bar */}
                  <ProgressBar value={item.progress} height="xs" className="mb-2.5" />

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <Avatar ownerId={item.ownerId} size="xs" />
                    <span className="text-[11px] font-mono" style={{ color: '#9CA3AF' }}>
                      {formatDate(item.endDate, 'MMM d')}
                    </span>
                  </div>
                </div>
              ))}

              {col.length === 0 && (
                <div
                  className="flex items-center justify-center rounded-[7px] text-[12px]"
                  style={{
                    height: 64,
                    border: '1.5px dashed rgba(0,0,0,0.10)',
                    color: '#9CA3AF',
                  }}
                >
                  Drop here
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
