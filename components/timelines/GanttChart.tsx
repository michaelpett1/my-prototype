'use client';
import { useRef, useState, useEffect, useCallback } from 'react';
import {
  format, parseISO, differenceInDays, addDays,
  eachMonthOfInterval, startOfMonth, eachWeekOfInterval,
} from 'date-fns';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import type { TimelineItem, GanttScale, TimelineGroup } from '@/lib/types';
import { GANTT_BAR_COLORS } from '@/lib/utils/colorUtils';
import { Avatar } from '@/components/ui/Avatar';

const LEFT_COL  = 260;
const ROW_H     = 34;
const GROUP_H   = 32;
const HEADER_H  = 38;
const PPD: Record<GanttScale, number> = { week: 28, month: 7, quarter: 3.5 };

const STATUS_DOT: Record<string, string> = {
  not_started: '#9CA3AF',
  in_progress: '#2563EB',
  at_risk:     '#D97706',
  complete:    '#16A34A',
};

const PRIORITY_STYLE: Record<string, { color: string; bg: string }> = {
  p0: { color: '#DC2626', bg: '#FEF2F2' },
  p1: { color: '#D97706', bg: '#FFFBEB' },
  p2: { color: '#2563EB', bg: '#EFF6FF' },
  p3: { color: '#6B7280', bg: '#F3F4F6' },
};

interface GanttChartProps {
  items: TimelineItem[];
  groups: TimelineGroup[];
  scale: GanttScale;
  onSelectItem: (id: string) => void;
  onReorder?: (fromId: string, toId: string) => void;
  onEditGroup?: (group: TimelineGroup) => void;
  onDeleteGroup?: (groupId: string) => void;
  onUpdateItem?: (id: string, patch: Partial<TimelineItem>) => void;
}

type RowEntry =
  | { type: 'group'; group: TimelineGroup; count: number }
  | { type: 'item'; item: TimelineItem; depth: number };

type DragMode = 'move' | 'resize-start' | 'resize-end';

interface DragState {
  itemId: string;
  mode: DragMode;
  startX: number;
  origStartDate: string;
  origEndDate: string;
}

export function GanttChart({ items, groups, scale, onSelectItem, onReorder, onEditGroup, onDeleteGroup, onUpdateItem }: GanttChartProps) {
  const today = new Date();
  const ppd = PPD[scale];
  const dragFromId = useRef<string | null>(null);
  const [menuGroupId, setMenuGroupId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasScrolled = useRef(false);

  // Bar drag state
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [dragDelta, setDragDelta] = useState(0);

  // Close menu on outside click
  useEffect(() => {
    if (!menuGroupId) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuGroupId(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuGroupId]);

  // Compute range from data +/- padding
  const allDates = items.flatMap(i => [parseISO(i.startDate), parseISO(i.endDate)]);
  const minDate  = allDates.reduce((a, b) => a < b ? a : b, addDays(today, -14));
  const maxDate  = allDates.reduce((a, b) => a > b ? a : b, addDays(today, 90));
  const rangeStart = addDays(startOfMonth(minDate), -3);
  const rangeEnd   = addDays(maxDate, 21);

  const totalDays  = differenceInDays(rangeEnd, rangeStart);
  const totalWidth = totalDays * ppd;
  const todayOff   = differenceInDays(today, rangeStart) * ppd;

  // Scroll to 1 week before today on mount
  useEffect(() => {
    if (hasScrolled.current || !scrollRef.current) return;
    hasScrolled.current = true;
    const weekBeforeToday = todayOff - (7 * ppd);
    scrollRef.current.scrollLeft = Math.max(0, weekBeforeToday);
  }, [todayOff, ppd]);

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

  // Build row list: group header → items in that group, then ungrouped items
  const rows: RowEntry[] = [];
  const usedIds = new Set<string>();

  groups.forEach(group => {
    const groupItems = items.filter(i => i.groupId === group.id);
    rows.push({ type: 'group', group, count: groupItems.length });
    groupItems.forEach(item => {
      rows.push({ type: 'item', item, depth: 0 });
      usedIds.add(item.id);
      // Children
      items.filter(i => i.parentId === item.id && !usedIds.has(i.id)).forEach(child => {
        rows.push({ type: 'item', item: child, depth: 1 });
        usedIds.add(child.id);
      });
    });
  });

  // Ungrouped items
  const ungrouped = items.filter(i => !usedIds.has(i.id) && !i.parentId);
  if (ungrouped.length > 0) {
    rows.push({ type: 'group', group: { id: '__ungrouped', name: 'Ungrouped', color: '#9CA3AF' }, count: ungrouped.length });
    ungrouped.forEach(item => {
      rows.push({ type: 'item', item, depth: 0 });
      items.filter(i => i.parentId === item.id && !usedIds.has(i.id)).forEach(child => {
        rows.push({ type: 'item', item: child, depth: 1 });
      });
    });
  }

  const rowHeight = (row: RowEntry) => row.type === 'group' ? GROUP_H : ROW_H;
  const totalHeight = rows.reduce((h, r) => h + rowHeight(r), 0);

  const itemLeft  = (item: TimelineItem) => differenceInDays(parseISO(item.startDate), rangeStart) * ppd;
  const itemWidth = (item: TimelineItem) => Math.max(1, differenceInDays(parseISO(item.endDate), parseISO(item.startDate))) * ppd;

  // ── Bar drag-and-drop logic ──────────────────────────────────
  const handleBarMouseDown = useCallback((e: React.MouseEvent, item: TimelineItem, mode: DragMode) => {
    if (!onUpdateItem) return;
    e.preventDefault();
    e.stopPropagation();
    setDragState({
      itemId: item.id,
      mode,
      startX: e.clientX,
      origStartDate: item.startDate,
      origEndDate: item.endDate,
    });
    setDragDelta(0);
  }, [onUpdateItem]);

  useEffect(() => {
    if (!dragState) return;

    function handleMouseMove(e: MouseEvent) {
      const delta = e.clientX - dragState!.startX;
      setDragDelta(delta);
    }

    function handleMouseUp(e: MouseEvent) {
      const delta = e.clientX - dragState!.startX;
      const daysDelta = Math.round(delta / ppd);
      if (daysDelta !== 0 && onUpdateItem) {
        const origStart = parseISO(dragState!.origStartDate);
        const origEnd = parseISO(dragState!.origEndDate);

        if (dragState!.mode === 'move') {
          onUpdateItem(dragState!.itemId, {
            startDate: format(addDays(origStart, daysDelta), 'yyyy-MM-dd'),
            endDate: format(addDays(origEnd, daysDelta), 'yyyy-MM-dd'),
          });
        } else if (dragState!.mode === 'resize-start') {
          const newStart = addDays(origStart, daysDelta);
          if (newStart < origEnd) {
            onUpdateItem(dragState!.itemId, {
              startDate: format(newStart, 'yyyy-MM-dd'),
            });
          }
        } else if (dragState!.mode === 'resize-end') {
          const newEnd = addDays(origEnd, daysDelta);
          if (newEnd > origStart) {
            onUpdateItem(dragState!.itemId, {
              endDate: format(newEnd, 'yyyy-MM-dd'),
            });
          }
        }
      }
      setDragState(null);
      setDragDelta(0);
    }

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState, ppd, onUpdateItem]);

  // Calculate visual position for a bar during drag
  const getBarPosition = (item: TimelineItem) => {
    let left = itemLeft(item);
    let width = itemWidth(item);

    if (dragState && dragState.itemId === item.id) {
      const origLeft = differenceInDays(parseISO(dragState.origStartDate), rangeStart) * ppd;
      const origWidth = Math.max(1, differenceInDays(parseISO(dragState.origEndDate), parseISO(dragState.origStartDate))) * ppd;

      if (dragState.mode === 'move') {
        left = origLeft + dragDelta;
        width = origWidth;
      } else if (dragState.mode === 'resize-start') {
        left = origLeft + dragDelta;
        width = origWidth - dragDelta;
        if (width < ppd) { width = ppd; left = origLeft + origWidth - ppd; }
      } else if (dragState.mode === 'resize-end') {
        left = origLeft;
        width = origWidth + dragDelta;
        if (width < ppd) width = ppd;
      }
    }

    return { left, width: Math.max(width, 3) };
  };

  return (
    <div
      className="flex overflow-hidden"
      style={{ height: HEADER_H + totalHeight + 1, backgroundColor: 'var(--bg-primary)' }}
    >
      {/* ── Left sticky name column ─────────────────────────────── */}
      <div
        className="shrink-0 z-10 flex flex-col overflow-hidden"
        style={{ width: LEFT_COL, backgroundColor: 'var(--bg-primary)', borderRight: '1px solid var(--border)' }}
      >
        {/* Header cell */}
        <div
          className="flex items-center px-3 shrink-0"
          style={{ height: HEADER_H, borderBottom: '1px solid var(--border)' }}
        >
          <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)', letterSpacing: '0.07em' }}>
            Project / Task
          </span>
        </div>

        {/* Rows */}
        {rows.map((row, idx) => {
          if (row.type === 'group') {
            const isRealGroup = row.group.id !== '__ungrouped';
            const isMenuOpen = menuGroupId === row.group.id;
            return (
              <div
                key={row.group.id}
                className="flex items-center gap-2 px-3 shrink-0 group/section"
                style={{
                  height: GROUP_H,
                  background: 'var(--bg-tertiary)',
                  borderBottom: '1px solid var(--border-row)',
                  position: 'relative',
                }}
              >
                <div className="w-[8px] h-[8px] rounded-full shrink-0" style={{ background: row.group.color }} />
                <span className="text-[12px] font-semibold truncate flex-1 min-w-0" style={{ color: 'var(--text-secondary)' }}>
                  {row.group.name}
                </span>
                <span className="text-[10px] font-mono shrink-0" style={{ color: 'var(--text-muted)' }}>
                  {row.count} items
                </span>
                {isRealGroup && (onEditGroup || onDeleteGroup) && (
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); setMenuGroupId(isMenuOpen ? null : row.group.id); }}
                      className="opacity-0 group-hover/section:opacity-100 transition-opacity duration-100"
                      style={{
                        padding: '2px 3px',
                        borderRadius: 4,
                        border: 'none',
                        background: isMenuOpen ? 'rgba(0,0,0,0.08)' : 'transparent',
                        cursor: 'pointer',
                        color: 'var(--text-tertiary)',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      aria-label={`Section actions for ${row.group.name}`}
                    >
                      <MoreHorizontal size={14} />
                    </button>
                    {isMenuOpen && (
                      <div
                        ref={menuRef}
                        style={{
                          position: 'absolute',
                          top: '100%',
                          right: 0,
                          marginTop: 4,
                          width: 160,
                          background: 'var(--bg-primary)',
                          borderRadius: 7,
                          border: '1px solid var(--border-medium)',
                          boxShadow: '0 8px 24px var(--border-medium)',
                          zIndex: 50,
                          overflow: 'hidden',
                          padding: '4px 0',
                        }}
                      >
                        {onEditGroup && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setMenuGroupId(null);
                              onEditGroup(row.group);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              width: '100%',
                              padding: '7px 12px',
                              border: 'none',
                              background: 'transparent',
                              cursor: 'pointer',
                              fontSize: 13,
                              color: 'var(--text-secondary)',
                              textAlign: 'left',
                            }}
                            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-tertiary)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                          >
                            <Pencil size={13} style={{ color: 'var(--text-muted)' }} />
                            Edit section
                          </button>
                        )}
                        {onDeleteGroup && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setMenuGroupId(null);
                              onDeleteGroup(row.group.id);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              width: '100%',
                              padding: '7px 12px',
                              border: 'none',
                              background: 'transparent',
                              cursor: 'pointer',
                              fontSize: 13,
                              color: '#DC2626',
                              textAlign: 'left',
                            }}
                            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--danger-bg)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                          >
                            <Trash2 size={13} style={{ color: '#DC2626' }} />
                            Delete section
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          }

          const { item, depth } = row;
          return (
            <div
              key={item.id}
              className="flex items-center gap-2 transition-colors duration-100 cursor-pointer group"
              draggable={!!onReorder}
              style={{
                height: ROW_H,
                paddingLeft: 12 + depth * 14,
                paddingRight: 8,
                borderBottom: '1px solid var(--bg-subtle)',
              }}
              onClick={() => onSelectItem(item.id)}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-hover)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
              onDragStart={e => { dragFromId.current = item.id; e.dataTransfer.setData('gantt-item-id', item.id); }}
              onDragOver={e => { if (onReorder) e.preventDefault(); }}
              onDrop={e => {
                if (!onReorder) return;
                const fromId = e.dataTransfer.getData('gantt-item-id');
                if (fromId && fromId !== item.id) onReorder(fromId, item.id);
              }}
            >
              <div className="w-[6px] h-[6px] rounded-full shrink-0" style={{ background: STATUS_DOT[item.status] }} />
              <span
                className="text-[9px] font-bold rounded px-1 py-[1px] shrink-0 leading-none"
                style={{
                  color: PRIORITY_STYLE[item.priority]?.color ?? '#6B7280',
                  background: PRIORITY_STYLE[item.priority]?.bg ?? '#F3F4F6',
                }}
              >
                {item.priority.toUpperCase()}
              </span>
              <span
                className="text-[13px] truncate flex-1 min-w-0 transition-colors duration-100"
                style={{ fontWeight: depth === 0 ? 600 : 400, color: depth === 0 ? 'var(--text-primary)' : 'var(--text-tertiary)' }}
              >
                {item.title}
              </span>
              <div className="shrink-0"><Avatar ownerId={item.ownerId} size="xs" /></div>
            </div>
          );
        })}
      </div>

      {/* ── Scrollable Gantt area ──────────────────────────────── */}
      <div ref={scrollRef} className="flex-1 overflow-x-auto" style={{ overflowY: 'hidden', cursor: dragState ? 'grabbing' : undefined }}>
        <div style={{ width: totalWidth, position: 'relative', minHeight: HEADER_H + totalHeight }}>

          {/* Column header row */}
          <div
            className="flex sticky top-0 z-10"
            style={{ height: HEADER_H, backgroundColor: 'var(--bg-primary)', borderBottom: '1px solid var(--border)' }}
          >
            {headers.map((h, i) => (
              <div
                key={i}
                className="absolute flex items-center px-2"
                style={{ left: h.offset, width: h.width, height: HEADER_H, borderRight: '1px solid var(--border-light)' }}
              >
                <span className="text-[11px] font-medium truncate" style={{ color: 'var(--text-muted)' }}>{h.label}</span>
              </div>
            ))}
          </div>

          {/* Grid lines */}
          {headers.map((h, i) => (
            <div
              key={i}
              className="absolute top-0 bottom-0"
              style={{ left: h.offset + h.width - 1, width: 1, background: 'var(--bg-subtle)' }}
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

          {/* Bars and group backgrounds */}
          {(() => {
            let cumulativeY = 0;
            return rows.map((row, rowIdx) => {
              const top = HEADER_H + cumulativeY;
              const h = rowHeight(row);
              cumulativeY += h;

              if (row.type === 'group') {
                return (
                  <div
                    key={row.group.id + '-bg'}
                    className="absolute w-full"
                    style={{
                      top,
                      height: h,
                      background: 'var(--bg-tertiary)',
                      borderBottom: '1px solid var(--border-row)',
                    }}
                  />
                );
              }

              const { item } = row;
              const { left, width } = getBarPosition(item);
              const color = GANTT_BAR_COLORS[item.status];
              const isMile = item.type === 'milestone';
              const isDragging = dragState?.itemId === item.id;

              return (
                <div
                  key={item.id}
                  className="absolute w-full"
                  style={{ top, height: h, borderBottom: '1px solid var(--bg-subtle)' }}
                >
                  {isMile ? (
                    <div
                      className="absolute gantt-bar"
                      style={{
                        left: left - 5,
                        top: '50%',
                        transform: 'translateY(-50%) rotate(45deg)',
                        width: 10, height: 10,
                        background: color,
                        borderRadius: 2,
                        cursor: 'pointer',
                      }}
                      onClick={() => onSelectItem(item.id)}
                      title={item.title}
                    />
                  ) : (
                    <div
                      className="absolute gantt-bar rounded-[3px] flex items-center overflow-visible group/bar"
                      style={{
                        left,
                        width,
                        top: 5,
                        bottom: 5,
                        background: color,
                        cursor: isDragging ? 'grabbing' : 'grab',
                        opacity: isDragging ? 0.9 : 1,
                        zIndex: isDragging ? 20 : 1,
                        boxShadow: isDragging ? '0 4px 12px rgba(0,0,0,0.15)' : undefined,
                        transition: isDragging ? 'none' : 'filter 120ms ease-out, opacity 120ms ease-out',
                      }}
                      onMouseDown={e => handleBarMouseDown(e, item, 'move')}
                      onClick={(e) => {
                        // Only open detail if not dragging
                        if (!dragState) onSelectItem(item.id);
                      }}
                    >
                      {/* Left resize handle */}
                      {onUpdateItem && (
                        <div
                          className="absolute left-0 top-0 bottom-0 w-[6px] opacity-0 group-hover/bar:opacity-100 transition-opacity duration-100"
                          style={{ cursor: 'ew-resize', borderRadius: '3px 0 0 3px', background: 'rgba(255,255,255,0.3)' }}
                          onMouseDown={e => handleBarMouseDown(e, item, 'resize-start')}
                        />
                      )}

                      {item.progress > 0 && (
                        <div
                          className="absolute left-0 top-0 bottom-0 pointer-events-none"
                          style={{ width: `${item.progress}%`, background: 'rgba(255,255,255,0.22)', borderRadius: '3px 0 0 3px' }}
                        />
                      )}
                      {width > 72 && (
                        <span
                          className="relative z-10 px-2 text-white text-[11px] font-semibold truncate pointer-events-none select-none"
                          style={{ textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}
                        >
                          {item.title}
                        </span>
                      )}

                      {/* Right resize handle */}
                      {onUpdateItem && (
                        <div
                          className="absolute right-0 top-0 bottom-0 w-[6px] opacity-0 group-hover/bar:opacity-100 transition-opacity duration-100"
                          style={{ cursor: 'ew-resize', borderRadius: '0 3px 3px 0', background: 'rgba(255,255,255,0.3)' }}
                          onMouseDown={e => handleBarMouseDown(e, item, 'resize-end')}
                        />
                      )}
                    </div>
                  )}
                </div>
              );
            });
          })()}
        </div>
      </div>
    </div>
  );
}
