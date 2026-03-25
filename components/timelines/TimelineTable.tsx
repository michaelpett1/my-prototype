'use client';
import type { TimelineItem } from '@/lib/types';
import { StatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Avatar } from '@/components/ui/Avatar';
import { formatDate } from '@/lib/utils/dateUtils';

interface TimelineTableProps {
  items: TimelineItem[];
  onSelectItem: (id: string) => void;
}

/* Design decision: table rows use alternating bg so subtle you almost can't see it.
   Inline actions reveal on hover via CSS — don't clutter the default view. */
export function TimelineTable({ items, onSelectItem }: TimelineTableProps) {
  return (
    <table className="w-full min-w-[860px] text-[13px]" style={{ backgroundColor: '#FFFFFF' }}>
      <thead>
        <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
          {['Name', 'Owner', 'Status', 'Priority', 'Start', 'End', 'Progress'].map(col => (
            <th
              key={col}
              className="text-left py-2.5 font-semibold uppercase tracking-widest select-none"
              style={{
                fontSize: '10px',
                color: '#9CA3AF',
                letterSpacing: '0.07em',
                padding: col === 'Name' ? '10px 16px' : '10px 12px',
              }}
            >
              {col}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {items.map((item, i) => (
          <tr
            key={item.id}
            className="group transition-colors duration-100 cursor-pointer"
            style={{ borderBottom: '1px solid rgba(0,0,0,0.045)' }}
            onClick={() => onSelectItem(item.id)}
            onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = '#FAFAF9'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'; }}
          >
            {/* Name */}
            <td className="py-2.5 px-4">
              <div className="flex items-center gap-2">
                {item.parentId && <div className="w-3 shrink-0" />}
                <div
                  className="w-[5px] h-[5px] rounded-full shrink-0"
                  style={{ background: { not_started: '#9CA3AF', in_progress: '#2563EB', at_risk: '#D97706', complete: '#16A34A' }[item.status] }}
                />
                <span
                  className="truncate max-w-[220px] transition-colors duration-100 group-hover:text-[#2563EB]"
                  style={{ fontWeight: item.parentId ? 400 : 600, color: '#1C1917' }}
                >
                  {item.title}
                </span>
              </div>
            </td>
            <td className="py-2.5 px-3"><Avatar ownerId={item.ownerId} size="xs" /></td>
            <td className="py-2.5 px-3"><StatusBadge status={item.status} size="sm" /></td>
            <td className="py-2.5 px-3"><PriorityBadge priority={item.priority} /></td>
            <td className="py-2.5 px-3 font-mono text-[12px]" style={{ color: '#6B7280', whiteSpace: 'nowrap' }}>
              {formatDate(item.startDate, 'MMM d')}
            </td>
            <td className="py-2.5 px-3 font-mono text-[12px]" style={{ color: '#6B7280', whiteSpace: 'nowrap' }}>
              {formatDate(item.endDate, 'MMM d')}
            </td>
            <td className="py-2.5 px-3" onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-2">
                <ProgressBar value={item.progress} height="xs" className="w-20" />
                <span className="text-[11px] font-mono tabular-nums" style={{ color: '#9CA3AF' }}>
                  {item.progress}%
                </span>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
