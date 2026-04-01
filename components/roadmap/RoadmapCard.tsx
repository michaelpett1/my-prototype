'use client';
import type { TimelineItem } from '@/lib/types';
import { StatusBadge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { GANTT_BAR_COLORS } from '@/lib/utils/colorUtils';

interface RoadmapCardProps {
  item: TimelineItem;
  onClick: () => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
}

const TYPE_ICON: Record<string, string> = { project: '●', milestone: '◆', task: '▸' };

export function RoadmapCard({ item, onClick, onDragStart }: RoadmapCardProps) {
  const color = GANTT_BAR_COLORS[item.status];

  return (
    <div
      className="bg-white rounded-[5px] cursor-pointer select-none transition-all duration-150 ease-out"
      style={{
        border: '1px solid var(--border)',
        boxShadow: 'var(--card-shadow)',
        padding: '8px 10px',
        /* Left edge colour bar — the status signal */
        borderLeft: `3px solid ${color}`,
      }}
      draggable
      onDragStart={e => onDragStart(e, item.id)}
      onClick={onClick}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 3px 8px var(--border-medium)';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--card-shadow)';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
      }}
    >
      <div className="flex items-start gap-1.5 mb-1.5">
        <span className="text-[10px] mt-[1px] shrink-0" style={{ color: 'var(--text-disabled)' }}>{TYPE_ICON[item.type]}</span>
        <p className="text-[12px] font-semibold leading-snug line-clamp-2" style={{ color: 'var(--text-primary)' }}>{item.title}</p>
      </div>
      <div className="flex items-center justify-between">
        <StatusBadge status={item.status} size="sm" />
        <Avatar ownerId={item.ownerId} size="xs" />
      </div>
    </div>
  );
}
