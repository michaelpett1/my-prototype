'use client';
import { useRef } from 'react';
import { format, parseISO, differenceInDays, addDays, eachMonthOfInterval, startOfMonth, eachWeekOfInterval, startOfWeek } from 'date-fns';
import type { TimelineItem, GanttScale } from '@/lib/types';
import { GANTT_BAR_COLORS } from '@/lib/utils/colorUtils';
import { Avatar } from '@/components/ui/Avatar';
import { StatusBadge } from '@/components/ui/Badge';
import { clsx } from '@/lib/utils/clsx';

const LEFT_COL_WIDTH = 280;
const ROW_HEIGHT = 36;
const HEADER_HEIGHT = 40;
const PIXELS_PER_DAY: Record<GanttScale, number> = {
  week: 30,
  month: 8,
  quarter: 4,
};

interface GanttChartProps {
  items: TimelineItem[];
  scale: GanttScale;
  onSelectItem: (id: string) => void;
}

export function GanttChart({ items, scale, onSelectItem }: GanttChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const today = new Date();
  const ppd = PIXELS_PER_DAY[scale];

  // Compute date range from items
  const allDates = items.flatMap((i) => [parseISO(i.startDate), parseISO(i.endDate)]);
  const minDate = allDates.reduce((a, b) => a < b ? a : b, addDays(today, -14));
  const maxDate = allDates.reduce((a, b) => a > b ? a : b, addDays(today, 90));
  const rangeStart = addDays(startOfMonth(minDate), -7);
  const rangeEnd = addDays(maxDate, 30);

  const totalDays = differenceInDays(rangeEnd, rangeStart);
  const totalWidth = totalDays * ppd;
  const todayOffset = differenceInDays(today, rangeStart) * ppd;

  // Build column headers
  const headers: Array<{ label: string; offset: number; width: number }> = [];
  if (scale === 'week') {
    const weeks = eachWeekOfInterval({ start: rangeStart, end: rangeEnd }, { weekStartsOn: 1 });
    weeks.forEach((w) => {
      const off = differenceInDays(w, rangeStart) * ppd;
      headers.push({ label: format(w, 'MMM d'), offset: off, width: 7 * ppd });
    });
  } else {
    const months = eachMonthOfInterval({ start: rangeStart, end: rangeEnd });
    months.forEach((m) => {
      const off = differenceInDays(m, rangeStart) * ppd;
      const nextMonth = addDays(m, 32);
      const nextStart = startOfMonth(nextMonth);
      const width = differenceInDays(nextStart, m) * ppd;
      headers.push({ label: format(m, scale === 'quarter' ? 'MMM yyyy' : 'MMM yyyy'), offset: off, width });
    });
  }

  // Build flat rows (projects first, then children indented)
  const roots = items.filter((i) => !i.parentId);
  const rows: Array<{ item: TimelineItem; depth: number; expanded: boolean }> = [];
  const addRows = (items: TimelineItem[], depth: number) => {
    items.forEach((item) => {
      rows.push({ item, depth, expanded: true });
      const children = items.filter((c) => c.parentId === item.id);
      // Not filtering by parentId from local items — use global items
    });
  };

  // Flatten: projects then their children
  const allFlat: Array<{ item: TimelineItem; depth: number }> = [];
  roots.forEach((root) => {
    allFlat.push({ item: root, depth: 0 });
    const children = items.filter((i) => i.parentId === root.id);
    children.forEach((child) => allFlat.push({ item: child, depth: 1 }));
  });

  function itemLeft(item: TimelineItem) {
    return differenceInDays(parseISO(item.startDate), rangeStart) * ppd;
  }
  function itemWidth(item: TimelineItem) {
    const days = Math.max(1, differenceInDays(parseISO(item.endDate), parseISO(item.startDate)));
    return days * ppd;
  }

  return (
    <div className="flex overflow-hidden" style={{ height: `${HEADER_HEIGHT + allFlat.length * ROW_HEIGHT + 2}px` }}>
      {/* Left sticky column */}
      <div
        className="shrink-0 border-r border-slate-200 bg-white z-10"
        style={{ width: LEFT_COL_WIDTH }}
      >
        {/* Header */}
        <div
          className="border-b border-slate-200 flex items-center px-3"
          style={{ height: HEADER_HEIGHT }}
        >
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Project / Task</span>
        </div>
        {/* Rows */}
        {allFlat.map(({ item, depth }) => (
          <div
            key={item.id}
            className="flex items-center gap-2 border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
            style={{ height: ROW_HEIGHT, paddingLeft: 12 + depth * 16, paddingRight: 8 }}
            onClick={() => onSelectItem(item.id)}
          >
            <div
              className={clsx('w-2 h-2 rounded-full shrink-0', {
                'not_started': 'bg-slate-400',
                'in_progress': 'bg-blue-500',
                'at_risk': 'bg-amber-500',
                'complete': 'bg-emerald-500',
              }[item.status])}
            />
            <span className={clsx('text-sm truncate flex-1', depth === 0 ? 'font-medium text-slate-800' : 'text-slate-600')}>
              {item.title}
            </span>
            <Avatar ownerId={item.ownerId} size="xs" />
          </div>
        ))}
      </div>

      {/* Scrollable chart area */}
      <div ref={containerRef} className="flex-1 overflow-x-auto scroll-x relative">
        <div style={{ width: totalWidth, position: 'relative' }}>
          {/* Header */}
          <div
            className="flex border-b border-slate-200 bg-white sticky top-0 z-10"
            style={{ height: HEADER_HEIGHT }}
          >
            {headers.map((h, i) => (
              <div
                key={i}
                className="shrink-0 border-r border-slate-100 flex items-center px-2"
                style={{ width: h.width }}
              >
                <span className="text-xs text-slate-500 font-medium truncate">{h.label}</span>
              </div>
            ))}
          </div>

          {/* Grid + bars */}
          <div style={{ position: 'relative' }}>
            {/* Column grid lines */}
            {headers.map((h, i) => (
              <div
                key={i}
                className="absolute top-0 bottom-0 border-r border-slate-100"
                style={{ left: h.offset, width: h.width }}
              />
            ))}

            {/* Today line */}
            <div
              className="absolute top-0 bottom-0 w-px bg-red-400 z-10"
              style={{ left: todayOffset }}
            >
              <div className="absolute -top-0 -left-3 text-xs text-red-400 font-medium whitespace-nowrap">Today</div>
            </div>

            {/* Rows */}
            {allFlat.map(({ item, depth }, rowIndex) => {
              const left = itemLeft(item);
              const width = itemWidth(item);
              const color = GANTT_BAR_COLORS[item.status];
              const isMilestone = item.type === 'milestone';

              return (
                <div
                  key={item.id}
                  className="border-b border-slate-100 hover:bg-slate-50/50 relative"
                  style={{ height: ROW_HEIGHT }}
                >
                  {isMilestone ? (
                    // Diamond milestone
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rotate-45 cursor-pointer hover:scale-110 transition-transform z-10"
                      style={{ left: left - 6, backgroundColor: color }}
                      onClick={() => onSelectItem(item.id)}
                      title={item.title}
                    />
                  ) : (
                    <div
                      className="gantt-bar absolute rounded cursor-pointer z-10 flex items-center px-2 group"
                      style={{
                        left,
                        width: Math.max(width, 4),
                        top: 6,
                        bottom: 6,
                        backgroundColor: color,
                        opacity: 0.9,
                      }}
                      onClick={() => onSelectItem(item.id)}
                    >
                      {width > 60 && (
                        <span className="text-white text-xs font-medium truncate">{item.title}</span>
                      )}
                    </div>
                  )}

                  {/* Progress overlay */}
                  {!isMilestone && item.progress > 0 && (
                    <div
                      className="absolute rounded z-10 pointer-events-none"
                      style={{
                        left,
                        width: Math.max((width * item.progress) / 100, 2),
                        top: 6,
                        bottom: 6,
                        backgroundColor: 'rgba(255,255,255,0.3)',
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
