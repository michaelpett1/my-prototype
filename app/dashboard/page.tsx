'use client';
import { TrendingUp, AlertTriangle, Target, Zap, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { TIMELINE_ITEMS, OBJECTIVES, ACTIVITY_FEED } from '@/lib/data/mockData';
import { TEAM_MEMBERS } from '@/lib/data/mockData';
import { StatusBadge, OKRStatusBadge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Avatar } from '@/components/ui/Avatar';
import { formatRelative, formatDate, parseISO, differenceInDays } from '@/lib/utils/dateUtils';
import { calcObjectiveProgress } from '@/lib/utils/colorUtils';
import { GANTT_BAR_COLORS } from '@/lib/utils/colorUtils';
import { clsx } from '@/lib/utils/clsx';
import Link from 'next/link';

function MetricCard({
  label,
  value,
  trend,
  trendLabel,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-semibold text-slate-800 mt-1">{value}</p>
          {trendLabel && (
            <p className={clsx('text-xs mt-1 flex items-center gap-0.5',
              trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-red-500' : 'text-slate-400'
            )}>
              {trend === 'up' && <ArrowUpRight size={12} />}
              {trend === 'down' && <ArrowDownRight size={12} />}
              {trendLabel}
            </p>
          )}
        </div>
        <div className={clsx('w-9 h-9 rounded-lg flex items-center justify-center', color)}>
          <Icon size={18} className="text-white" />
        </div>
      </div>
    </div>
  );
}

function MiniRoadmap() {
  const today = new Date();
  const rangeStart = today;
  const rangeEnd = new Date(today);
  rangeEnd.setDate(today.getDate() + 90);
  const totalDays = 90;

  const projects = TIMELINE_ITEMS.filter((i) => i.type === 'project');

  function toPercent(dateStr: string) {
    const diff = differenceInDays(parseISO(dateStr), rangeStart);
    return Math.min(100, Math.max(0, (diff / totalDays) * 100));
  }

  return (
    <div className="space-y-2.5">
      {/* Month headers */}
      <div className="flex text-xs text-slate-400 font-medium">
        {[0, 30, 60].map((offset) => {
          const d = new Date(today);
          d.setDate(d.getDate() + offset);
          return (
            <div key={offset} className="flex-1">
              {d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </div>
          );
        })}
      </div>

      {projects.map((item) => {
        const left = toPercent(item.startDate);
        const right = toPercent(item.endDate);
        const width = Math.max(2, right - left);
        const color = GANTT_BAR_COLORS[item.status];

        return (
          <Link key={item.id} href="/timelines" className="block group">
            <div className="flex items-center gap-2">
              <div className="text-xs text-slate-600 truncate w-32 shrink-0 group-hover:text-blue-600 transition-colors">
                {item.title}
              </div>
              <div className="flex-1 relative h-5 bg-slate-100 rounded overflow-hidden">
                {/* Today marker */}
                <div className="absolute left-0 top-0 bottom-0 w-px bg-red-400 z-10" />
                <div
                  className="absolute top-1 bottom-1 rounded-sm"
                  style={{ left: `${left}%`, width: `${width}%`, backgroundColor: color, opacity: 0.85 }}
                />
              </div>
              <StatusBadge status={item.status} size="sm" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export default function DashboardPage() {
  const allItems = TIMELINE_ITEMS;
  const totalProjects = allItems.filter((i) => i.type === 'project').length;
  const activeOKRs = OBJECTIVES.length;
  const overdueItems = allItems.filter((i) => {
    const end = parseISO(i.endDate);
    return differenceInDays(new Date(), end) > 0 && i.status !== 'complete';
  }).length;

  // My focus: P0/P1 in-progress items (as the current user u1)
  const myFocus = allItems
    .filter((i) => i.ownerId === 'u1' && i.status !== 'complete')
    .sort((a, b) => {
      const pOrder = { p0: 0, p1: 1, p2: 2, p3: 3 };
      return pOrder[a.priority] - pOrder[b.priority];
    })
    .slice(0, 6);

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-semibold text-slate-800">Good morning, Alex</h1>
        <p className="text-sm text-slate-500 mt-0.5">Here&apos;s what&apos;s happening across your workspace.</p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Projects"
          value={totalProjects}
          trend="up"
          trendLabel="+1 this week"
          icon={TrendingUp}
          color="bg-blue-500"
        />
        <MetricCard
          label="Active OKRs"
          value={activeOKRs}
          trend="neutral"
          trendLabel="Q2 2026"
          icon={Target}
          color="bg-violet-500"
        />
        <MetricCard
          label="Overdue Items"
          value={overdueItems}
          trend={overdueItems > 0 ? 'down' : 'up'}
          trendLabel={overdueItems > 0 ? 'Needs attention' : 'All on track'}
          icon={AlertTriangle}
          color={overdueItems > 0 ? 'bg-amber-500' : 'bg-emerald-500'}
        />
        <MetricCard
          label="Team Velocity"
          value="72%"
          trend="up"
          trendLabel="+8% vs last sprint"
          icon={Zap}
          color="bg-emerald-500"
        />
      </div>

      {/* Middle columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Focus */}
        <div className="bg-white rounded-lg border border-slate-200">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">My Focus</h2>
            <span className="text-xs text-slate-400">{myFocus.length} items</span>
          </div>
          <div className="divide-y divide-slate-100">
            {myFocus.length === 0 ? (
              <p className="px-4 py-8 text-sm text-slate-400 text-center">You&apos;re all caught up!</p>
            ) : (
              myFocus.map((item) => (
                <div key={item.id} className="px-4 py-3 flex items-start gap-3">
                  <div className="mt-0.5">
                    <Avatar ownerId={item.ownerId} size="sm" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm text-slate-700 font-medium truncate">{item.title}</span>
                      <StatusBadge status={item.status} size="sm" />
                    </div>
                    <div className="mt-1.5">
                      <ProgressBar value={item.progress} height="xs" />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Due {formatDate(item.endDate, 'MMM d')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="px-4 py-2.5 border-t border-slate-100">
            <Link href="/timelines" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
              View all timelines →
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg border border-slate-200">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">Recent Activity</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {ACTIVITY_FEED.map((event) => {
              const dot =
                event.type === 'status_change' ? 'bg-blue-400' :
                event.type === 'progress' ? 'bg-emerald-400' :
                event.type === 'checkin' ? 'bg-violet-400' : 'bg-slate-400';
              return (
                <div key={event.id} className="px-4 py-3 flex items-start gap-3">
                  <div className={clsx('w-2 h-2 rounded-full mt-1.5 shrink-0', dot)} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-600">{event.text}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{formatRelative(event.timestamp)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* OKR Summary */}
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800">OKR Summary — Q2 2026</h2>
          <Link href="/okrs" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
            View all →
          </Link>
        </div>
        <div className="divide-y divide-slate-100">
          {OBJECTIVES.map((obj) => {
            const progress = calcObjectiveProgress(obj.keyResults);
            return (
              <div key={obj.id} className="px-4 py-3 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-700 truncate">{obj.title}</span>
                    <OKRStatusBadge status={obj.status} size="sm" />
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{obj.keyResults.length} key results</p>
                </div>
                <div className="w-32 shrink-0">
                  <ProgressBar value={progress} showLabel height="xs" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mini Roadmap */}
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800">Next 3 Months</h2>
          <Link href="/timelines" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
            Open Timelines →
          </Link>
        </div>
        <div className="px-4 py-4">
          <MiniRoadmap />
        </div>
      </div>
    </div>
  );
}
