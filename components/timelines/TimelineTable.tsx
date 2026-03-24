'use client';
import type { TimelineItem } from '@/lib/types';
import { StatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Avatar } from '@/components/ui/Avatar';
import { formatDate } from '@/lib/utils/dateUtils';
import { useProjectsStore } from '@/lib/store/projectsStore';

interface TimelineTableProps {
  items: TimelineItem[];
  onSelectItem: (id: string) => void;
}

export function TimelineTable({ items, onSelectItem }: TimelineTableProps) {
  const updateItem = useProjectsStore((s) => s.updateItem);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wide">
            <th className="text-left py-2.5 px-4 font-medium">Name</th>
            <th className="text-left py-2.5 px-4 font-medium">Owner</th>
            <th className="text-left py-2.5 px-4 font-medium">Status</th>
            <th className="text-left py-2.5 px-4 font-medium">Priority</th>
            <th className="text-left py-2.5 px-4 font-medium">Start</th>
            <th className="text-left py-2.5 px-4 font-medium">End</th>
            <th className="text-left py-2.5 px-4 font-medium w-36">Progress</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((item) => (
            <tr
              key={item.id}
              className="hover:bg-slate-50 cursor-pointer transition-colors group"
              onClick={() => onSelectItem(item.id)}
            >
              <td className="py-2.5 px-4">
                <div className="flex items-center gap-2">
                  {item.parentId && <div className="w-3 shrink-0" />}
                  <div
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      { not_started: 'bg-slate-400', in_progress: 'bg-blue-500', at_risk: 'bg-amber-500', complete: 'bg-emerald-500' }[item.status]
                    }`}
                  />
                  <span className={`${!item.parentId ? 'font-medium text-slate-800' : 'text-slate-600'} group-hover:text-blue-600 transition-colors truncate max-w-[200px]`}>
                    {item.title}
                  </span>
                </div>
              </td>
              <td className="py-2.5 px-4">
                <Avatar ownerId={item.ownerId} size="xs" />
              </td>
              <td className="py-2.5 px-4"><StatusBadge status={item.status} size="sm" /></td>
              <td className="py-2.5 px-4"><PriorityBadge priority={item.priority} /></td>
              <td className="py-2.5 px-4 text-slate-600 whitespace-nowrap">{formatDate(item.startDate, 'MMM d')}</td>
              <td className="py-2.5 px-4 text-slate-600 whitespace-nowrap">{formatDate(item.endDate, 'MMM d')}</td>
              <td className="py-2.5 px-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-2">
                  <ProgressBar value={item.progress} height="xs" className="w-20" />
                  <span className="text-xs text-slate-500 tabular-nums w-8">{item.progress}%</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
