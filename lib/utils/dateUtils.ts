import { format, differenceInDays, addDays, startOfWeek, startOfMonth, startOfQuarter, endOfQuarter, eachWeekOfInterval, eachMonthOfInterval, parseISO, isToday } from 'date-fns';

export { format, differenceInDays, addDays, parseISO, isToday };

export function getDateRange(scale: 'week' | 'month' | 'quarter', referenceDate: Date = new Date()): { start: Date; end: Date } {
  if (scale === 'week') {
    const start = addDays(referenceDate, -14);
    const end = addDays(referenceDate, 84); // 12 weeks forward
    return { start, end };
  }
  if (scale === 'month') {
    const start = addDays(referenceDate, -30);
    const end = addDays(referenceDate, 150); // ~5 months forward
    return { start, end };
  }
  // quarter
  const start = startOfQuarter(addDays(referenceDate, -90));
  const end = endOfQuarter(addDays(referenceDate, 270));
  return { start, end };
}

export function getColumnHeaders(scale: 'week' | 'month' | 'quarter', start: Date, end: Date): Array<{ label: string; date: Date; width: number }> {
  if (scale === 'week') {
    const weeks = eachWeekOfInterval({ start, end }, { weekStartsOn: 1 });
    return weeks.map((d) => ({ label: format(d, 'MMM d'), date: d, width: 120 }));
  }
  if (scale === 'month') {
    const months = eachMonthOfInterval({ start, end });
    return months.map((d) => ({ label: format(d, 'MMM yyyy'), date: d, width: 160 }));
  }
  // quarter
  const months = eachMonthOfInterval({ start, end });
  return months.map((d) => ({ label: format(d, 'MMM yyyy'), date: d, width: 200 }));
}

export function dateToPixel(date: Date | string, rangeStart: Date, pixelsPerDay: number): number {
  const d = typeof date === 'string' ? parseISO(date) : date;
  const diff = differenceInDays(d, rangeStart);
  return diff * pixelsPerDay;
}

export function formatRelative(dateStr: string): string {
  const date = parseISO(dateStr);
  const diff = differenceInDays(new Date(), date);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return `${diff}d ago`;
  if (diff < 30) return `${Math.floor(diff / 7)}w ago`;
  return format(date, 'MMM d');
}

export function formatDate(dateStr: string, fmt: string = 'MMM d, yyyy'): string {
  return format(parseISO(dateStr), fmt);
}
