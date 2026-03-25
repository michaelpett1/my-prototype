'use client';
import {
  TrendingUp, AlertTriangle, Target, Zap,
  ArrowUpRight, ArrowDownRight, Activity, Minus,
  GitBranch, BarChart3,
} from 'lucide-react';
import { TIMELINE_ITEMS, OBJECTIVES, ACTIVITY_FEED, TEAM_MEMBERS } from '@/lib/data/mockData';
import { StatusBadge, OKRStatusBadge } from '@/components/ui/Badge';
import { ProgressBar, DonutProgress } from '@/components/ui/ProgressBar';
import { Avatar } from '@/components/ui/Avatar';
import { formatRelative, formatDate, parseISO, differenceInDays } from '@/lib/utils/dateUtils';
import { calcObjectiveProgress, calcKRProgress, GANTT_BAR_COLORS } from '@/lib/utils/colorUtils';
import Link from 'next/link';

/* ── Metric card ─────────────────────────────────────────────────── */
/* Design decision: No colored icon boxes. Typography does the hierarchy work.
   The number is the hero. Label is tiny/muted above. Trend is 12px below. */
function MetricCard({
  label, value, trend, trendLabel, icon: Icon,
}: {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
  icon: React.ElementType;
}) {
  return (
    <div
      className="bg-white rounded-[7px] p-4 flex flex-col gap-3"
      style={{ border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
    >
      <div className="flex items-center justify-between">
        <span
          className="text-[11px] font-semibold uppercase tracking-widest"
          style={{ color: '#9CA3AF', letterSpacing: '0.08em' }}
        >
          {label}
        </span>
        <Icon size={14} style={{ color: '#D1D5DB' }} />
      </div>

      <div>
        <p className="text-[28px] font-semibold leading-none" style={{ color: '#1C1917', letterSpacing: '-0.02em' }}>
          {value}
        </p>
        {trendLabel && (
          <p
            className="flex items-center gap-0.5 mt-1.5 text-[12px]"
            style={{
              color: trend === 'up' ? '#16A34A' : trend === 'down' ? '#DC2626' : '#9CA3AF',
              fontFamily: 'ui-monospace, monospace',
            }}
          >
            {trend === 'up'   && <ArrowUpRight size={12} />}
            {trend === 'down' && <ArrowDownRight size={12} />}
            {trend === 'neutral' && <Minus size={12} />}
            {trendLabel}
          </p>
        )}
      </div>
    </div>
  );
}

/* ── Mini roadmap (next 3 months) ────────────────────────────────── */
function MiniRoadmap() {
  const today = new Date();
  const totalDays = 90;

  const toPercent = (dateStr: string) => {
    const diff = differenceInDays(parseISO(dateStr), today);
    return Math.min(100, Math.max(0, (diff / totalDays) * 100));
  };

  const projects = TIMELINE_ITEMS.filter((i) => i.type === 'project');
  const months = [0, 30, 60, 90].map(offset => {
    const d = new Date(today);
    d.setDate(d.getDate() + offset);
    return d.toLocaleDateString('en-US', { month: 'short' });
  });

  return (
    <div>
      {/* Month labels */}
      <div className="flex mb-3" style={{ paddingLeft: '140px' }}>
        {months.map((m, i) => (
          <div key={i} className="flex-1 text-[11px] font-medium" style={{ color: '#9CA3AF' }}>{m}</div>
        ))}
      </div>

      <div className="space-y-2">
        {projects.map((item) => {
          const left = toPercent(item.startDate);
          const right = toPercent(item.endDate);
          const width = Math.max(2, right - left);
          const color = GANTT_BAR_COLORS[item.status];

          return (
            <Link key={item.id} href="/timelines" className="flex items-center gap-3 group">
              {/* Name */}
              <div className="text-[12px] truncate shrink-0" style={{ width: 132, color: '#6B7280' }}>
                <span className="group-hover:text-[#2563EB] transition-colors duration-150">{item.title}</span>
              </div>

              {/* Bar track */}
              <div
                className="flex-1 relative rounded-full overflow-hidden"
                style={{ height: 6, background: 'rgba(0,0,0,0.06)' }}
              >
                {/* Today marker */}
                <div className="absolute top-0 bottom-0 w-px z-10" style={{ left: '0%', background: '#DC2626', opacity: 0.6 }} />
                <div
                  className="absolute top-0 bottom-0 rounded-full"
                  style={{ left: `${left}%`, width: `${width}%`, backgroundColor: color, opacity: 0.75 }}
                />
              </div>

              {/* Status */}
              <StatusBadge status={item.status} size="sm" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/* ── Activity event icon ─────────────────────────────────────────── */
function ActivityDot({ type }: { type: string }) {
  const config: Record<string, { color: string }> = {
    status_change: { color: '#2563EB' },
    progress:      { color: '#16A34A' },
    checkin:       { color: '#7C3AED' },
    created:       { color: '#9CA3AF' },
  };
  const c = config[type] ?? config.created;
  return (
    <div
      className="w-[6px] h-[6px] rounded-full shrink-0 mt-[6px]"
      style={{ background: c.color }}
    />
  );
}

/* ── Section wrapper ─────────────────────────────────────────────── */
function Section({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div
      className="bg-white rounded-[7px] flex flex-col overflow-hidden"
      style={{ border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
    >
      <div
        className="flex items-center justify-between px-4 py-3 shrink-0"
        style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}
      >
        <h2 className="text-[13px] font-semibold" style={{ color: '#1C1917' }}>{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────── */
export default function DashboardPage() {
  const totalProjects = TIMELINE_ITEMS.filter(i => i.type === 'project').length;
  const overdueItems  = TIMELINE_ITEMS.filter(i => {
    return differenceInDays(new Date(), parseISO(i.endDate)) > 0 && i.status !== 'complete';
  }).length;

  // Current user = u1. Focus = their incomplete items, sorted by priority.
  const myFocus = TIMELINE_ITEMS
    .filter(i => i.ownerId === 'u1' && i.status !== 'complete')
    .sort((a, b) => ({ p0: 0, p1: 1, p2: 2, p3: 3 }[a.priority] - { p0: 0, p1: 1, p2: 2, p3: 3 }[b.priority]))
    .slice(0, 5);

  return (
    <div className="p-6 space-y-5" style={{ maxWidth: 1360 }}>

      {/* Page header */}
      <div className="mb-1">
        <h1 className="text-[18px] font-semibold leading-tight" style={{ color: '#1C1917', letterSpacing: '-0.01em' }}>
          Good morning, Alex
        </h1>
        <p className="text-[13px] mt-0.5" style={{ color: '#9CA3AF' }}>
          Here&apos;s your workspace at a glance.
        </p>
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard label="Projects"     value={totalProjects}            trend="up"      trendLabel="+1 this week"       icon={GitBranch} />
        <MetricCard label="Active OKRs"  value={OBJECTIVES.length}        trend="neutral" trendLabel="Q2 2026"            icon={Target} />
        <MetricCard label="Overdue"      value={overdueItems}             trend={overdueItems > 0 ? 'down' : 'up'} trendLabel={overdueItems > 0 ? 'Needs attention' : 'All on track'} icon={AlertTriangle} />
        <MetricCard label="Velocity"     value="72%"                      trend="up"      trendLabel="+8% vs last sprint" icon={Zap} />
      </div>

      {/* Two-column middle */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* My Focus */}
        <Section
          title="My Focus"
          action={<span className="text-[12px]" style={{ color: '#9CA3AF' }}>{myFocus.length} items</span>}
        >
          <div>
            {myFocus.length === 0 ? (
              <p className="px-4 py-8 text-center text-[13px]" style={{ color: '#9CA3AF' }}>
                You&apos;re all caught up ✓
              </p>
            ) : (
              myFocus.map((item, i) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 px-4 py-3 transition-colors duration-150 cursor-pointer group"
                  style={{
                    borderBottom: i < myFocus.length - 1 ? '1px solid rgba(0,0,0,0.05)' : undefined,
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = '#FAFAF9'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
                >
                  <Avatar ownerId={item.ownerId} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-[13px] font-medium truncate" style={{ color: '#1C1917' }}>
                        {item.title}
                      </span>
                      <StatusBadge status={item.status} size="sm" />
                    </div>
                    <ProgressBar value={item.progress} height="xs" />
                    <p className="text-[11px] mt-1.5 font-mono" style={{ color: '#9CA3AF' }}>
                      Due {formatDate(item.endDate, 'MMM d')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="px-4 py-2.5" style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}>
            <Link href="/timelines" className="text-[12px] font-semibold transition-colors duration-150" style={{ color: '#2563EB' }}>
              View all timelines →
            </Link>
          </div>
        </Section>

        {/* Recent Activity */}
        <Section title="Recent Activity">
          <div>
            {ACTIVITY_FEED.slice(0, 7).map((event, i) => (
              <div
                key={event.id}
                className="flex items-start gap-3 px-4 py-2.5"
                style={{ borderBottom: i < 6 ? '1px solid rgba(0,0,0,0.05)' : undefined }}
              >
                <ActivityDot type={event.type} />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] leading-snug" style={{ color: '#374151' }}>{event.text}</p>
                  <p className="text-[11px] mt-0.5 font-mono" style={{ color: '#9CA3AF' }}>
                    {formatRelative(event.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* OKR summary */}
      <Section
        title="Q2 2026 — Objectives"
        action={
          <Link href="/okrs" className="text-[12px] font-semibold transition-colors duration-150" style={{ color: '#2563EB' }}>
            All OKRs →
          </Link>
        }
      >
        <div>
          {OBJECTIVES.map((obj, i) => {
            const progress = calcObjectiveProgress(obj.keyResults);
            return (
              <div
                key={obj.id}
                className="flex items-center gap-4 px-4 py-3 transition-colors duration-150"
                style={{ borderBottom: i < OBJECTIVES.length - 1 ? '1px solid rgba(0,0,0,0.05)' : undefined }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = '#FAFAF9'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
              >
                {/* Mini donut */}
                <div className="relative shrink-0">
                  <DonutProgress value={progress} size={36} strokeWidth={3.5} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] font-semibold font-mono" style={{ color: '#6B7280' }}>{progress}%</span>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[13px] font-medium truncate" style={{ color: '#1C1917' }}>{obj.title}</span>
                    <OKRStatusBadge status={obj.status} size="sm" />
                  </div>
                  <p className="text-[11px] mt-0.5" style={{ color: '#9CA3AF' }}>
                    {obj.keyResults.length} key results · {obj.period}
                  </p>
                </div>

                <div className="w-28 shrink-0">
                  <ProgressBar value={progress} height="xs" showLabel />
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Mini roadmap */}
      <Section
        title="Next 90 Days"
        action={
          <Link href="/timelines" className="text-[12px] font-semibold transition-colors duration-150" style={{ color: '#2563EB' }}>
            Open Timelines →
          </Link>
        }
      >
        <div className="px-4 py-4">
          <MiniRoadmap />
        </div>
      </Section>
    </div>
  );
}
