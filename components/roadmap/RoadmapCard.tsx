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

const TYPE_EMOJI: Record<string, string> = {
  project: '📋',
  milestone: '🏁',
  task: '✓',
};

export function RoadmapCard({ item, onClick, onDragStart }: RoadmapCardProps) {
  const barColor = GANTT_BAR_COLORS[item.status];

  return (
    <div
      className="bg-white border border-slate-200 rounded-lg p-2.5 cursor-pointer hover:border-slate-300 hover:shadow-sm transition-all group select-none"
      draggable
      onDragStart={(e) => onDragStart(e, item.id)}
      onClick={onClick}
    >
      {/* Status color bar on left edge via border-l */}
      <div className="flex gap-2">
        <div className="w-1 rounded-full shrink-0 self-stretch" style={{ backgroundColor: barColor }} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-xs">{TYPE_EMOJI[item.type]}</span>
            <p className="text-xs font-medium text-slate-800 truncate">{item.title}</p>
          </div>
          <div className="flex items-center justify-between">
            <StatusBadge status={item.status} size="sm" />
            <Avatar ownerId={item.ownerId} size="xs" />
          </div>
        </div>
      </div>
    </div>
  );
}
