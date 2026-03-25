'use client';
import { useRef } from 'react';
import {
  format, parseISO, differenceInDays, addDays,
  eachMonthOfInterval, startOfMonth, eachWeekOfInterval,
} from 'date-fns';
import type { TimelineItem, GanttScale } from '@/lib/types';
import { GANTT_BAR_COLORS } from '@/lib/utils/colorUtils';
import { Avatar } from '@/components/ui/Avatar';

const LEFT_COL  = 260;
const ROW_H     = 34;
const HEADER_H  = 38;
const PPD: Record<GanttScale, number> = { week: 28, month: 7, quarter: 3.5 };

/* Status dot colour — inline to avoid clsx object pattern issues */
const STATUS_DOT: Record<string, string> = {
  not_started: '#9CA3AF',
  in_progress: '#2563EB',
  at_risk:     '#D97706',
  complete:    '#16A34A',
};

interface GanttChartProps {
  items: TimelineItem[];
  scale: GanttScale;
  onSelectItem: (id: string) => void;
}

export function GanttChart({ items, scale, onSelectItem }: GanttChartProps) {
  const today = new Date();
  const ppd = PPD[scale];

  // Compute range from data ± padding
  const allDates = items.flatMap(i => [parseISO(i.startDate), parseISO(i.endDate)]);
  const minDate  = allDates.reduce((a, b) => a < b ? a : b, addDays(today, -14));
  const maxDate  = allDates.reduce((a, b) => a > b ? a : b, addDays(today, 90));
  const rangeStart = addDays(startOfMonth(minDate), -3);
  const rangeEnd   = addDays(maxDate, 21);

  const totalDays  = differenceInDays(rangeEnd, rangeStart);
  const totalWidth = totalDays * ppd;
  const todayOff   = differenceInDays(today, rangeStart) * ppd;

  // Column headers
  const headers: Array<{ label: string; offset: number; width: number }> = [];
  if (scale === 'week') {
    const weeks = eachWeekOfInterval({ start: rangeStart, end: rangeEnd }, { weekStartsOn: 1 });
    weeks.forEach(w => {
      headers.push({ label: format(w, 'MMM d'), offset: differenceInDays(w, rangeStart) * ppd, width: 7 * ppd });
    });
  } else {
    const months = eachMonthOfInterval({ start: rangeStart, end: rangeEnd });
    months.forEach(m => {
      const next = startOfMonth(addDays(m, 32));
      const width = differenceInDays(next, m) * ppd;
      headers.push({ label: format(m, 'MMM yyyy'), offset: differenceInDays(m, rangeStart) * ppd, width });
    });
  }

  // Flat row list: project then its children
  const roots = items.filter(i => !i.parentId);
  const rows: Array<{ item: TimelineItem; depth: number }> = [];
  roots.forEach(root => {
    rows.push({ item: root, depth: 0 });
    items.filter(i => i.parentId === root.id).forEach(child => rows.push({ item: child, depth: 1 }));
  });

  const itemLeft  = (item: TimelineItem) => differenceInDays(parseISO(item.startDate), rangeStart) * ppd;
  const itemWidth = (item: TimelineItem) => Math.max(1, differenceInDays(parseISO(item.endDate), parseISO(item.startDate))) * ppd;

  return (
    <div
      className="flex overflow-hidden"
      style={{ height: HEADER_H + rows.length * ROW_H + 1, backgroundColor: '#FFFFFF' }}
    >
      {/* ── Left sticky name column ─────────────────────────────── */}
      <div
        className="shrink-0 z-10 flex flex-col"
        style={{ width: LEFT_COL, backgroundColor: '#FFFFFF', borderRight: '1px solid rgba(0,0,0,0.07)' }}
      >
        {/* Header cell */}
        <div
          className="flex items-center px-3 shrink-0"
          style={{ height: HEADER_H, borderBottom: '1px solid rgba(0,0,0,0.07)' }}
        >
          <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: '#9CA3AF', letterSpacing: '0.07em' }}>
            Project / Task
          </span>
        </div>

        {/* Rows */}
        {rows.map(({ item, depth }) => (
          <div
            key={item.id}
            className="flex items-center gap-2 transition-colors duration-100 cursor-pointer group"
            style={{
              height: ROW_H,
              paddingLeft: 12 + depth * 14,
              paddingRight: 8,
              borderBottom: '1px solid rgba(0,0,0,0.04)',
            }}
            onClick={() => onSelectItem(item.id)}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = '#FAFAF9'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
          >
            {/* Status dot */}
            <div
              className="w-[6px] h-[6px] rounded-full shrink-0"
              style={{ background: STATUS_DOT[item.status] }}
            />
            {/* Name */}
            <span
              className="text-[13px] truncate flex-1 transition-colors duration-100"
              style={{
                fontWeight: depth === 0 ? 600 : 400,
                color: depth === 0 ? '#1C1917' : '#6B7280',
              }}
            >
              {item.title}
            </span>
            <Avatar ownerId={item.ownerId} size="xs" />
          </div>
        ))}
      </div>

      {/* ── Scrollable Gantt area ──────────────────────────────── */}
      <div className="flex-1 overflow-x-auto" style={{ overflowY: 'hidden' }}>
        <div style={{ width: totalWidth, position: 'relative', minHeight: HEADER_H + rows.length * ROW_H }}>

          {/* Column header row */}
          <div
            className="flex sticky top-0 z-10"
            style={{ height: HEADER_H, backgroundColor: '#FFFFFF', borderBottom: '1px solid rgba(0,0,0,0.07)' }}
          >
            {headers.map((h, i) => (
              <div
                key={i}
                className="absolute flex items-center px-2"
                style={{
                  left: h.offset,
                  width: h.width,
                  height: HEADER_H,
                  borderRight: '1px solid rgba(0,0,0,0.05)',
                }}
              >
                <span className="text-[11px] font-medium truncate" style={{ color: '#9CA3AF' }}>{h.label}</span>
              </div>
            ))}
          </div>

          {/* Grid lines */}
          {headers.map((h, i) => (
            <div
              key={i}
              className="absolute top-0 bottom-0"
              style={{ left: h.offset + h.width - 1, width: 1, background: 'rgba(0,0,0,0.04)' }}
            />
          ))}

          {/* Today marker */}
          <div
            className="absolute top-0 bottom-0 z-10"
            style={{ left: todayOff, width: 1, background: '#DC2626', opacity: 0.5 }}
          >
            <span
              className="absolute text-[10px] font-semibold font-mono whitespace-nowrap"
              style={{ top: HEADER_H + 4, left: 4, color: '#DC2626' }}
            >
              today
            </span>
          </div>

          {/* Bars */}
          {rows.map(({ item, depth }, rowIdx) => {
            const left   = itemLeft(item);
            const width  = itemWidth(item);
            const color  = GANTT_BAR_COLORS[item.status];
            const isMile = item.type === 'milestone';

            return (
              <div
                key={item.id}
                className="absolute w-full"
                style={{
                  top: HEADER_H + rowIdx * ROW_H,
                  height: ROW_H,
                  borderBottom: '1px solid rgba(0,0,0,0.04)',
                }}
              >
                {isMile ? (
                  /* Diamond milestone marker */
                  <div
                    className="absolute gantt-bar"
                    style={{
                      left: left - 5,
                      top: '50%',
                      transform: 'translateY(-50%) rotate(45deg)',
                      width: 10,
                      height: 10,
                      background: color,
                      borderRadius: 2,
                      cursor: 'pointer',
                    }}
                    onClick={() => onSelectItem(item.id)}
                    title={item.title}
                  />
                ) : (
                  <div
                    className="absolute gantt-bar rounded-[3px] cursor-pointer flex items-center overflow-hidden"
                    style={{
                      left,
                      width: Math.max(width, 3),
                      top: 5,
                      bottom: 5,
                      background: color,
                      /* Progress overlay as a lighter stripe */
                    }}
                    onClick={() => onSelectItem(item.id)}
                  >
                    {/* Progress fill — slightly lighter overlay */}
                    {item.progress > 0 && (
                      <div
                        className="absolute left-0 top-0 bottom-0"
                        style={{
                          width: `${item.progress}%`,
                          background: 'rgba(255,255,255,0.22)',
                          borderRadius: '3px 0 0 3px',
                        }}
                      />
                    )}
                    {/* Label — only when bar is wide enough */}
                    {width > 72 && (
                      <span
                        className="relative z-10 px-2 text-white text-[11px] font-semibold truncate"
                        style={{ textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}
                      >
                        {item.title}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
