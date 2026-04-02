'use client';
import { useMemo } from 'react';
import {
  TrendingUp, AlertTriangle, Target, Zap,
  ArrowUpRight, ArrowDownRight, Activity, Minus,
  GitBranch, BarChart3, Plus, Lightbulb, Sparkles,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';
import { useProjectsStore } from '@/lib/store/projectsStore';
import { useOKRsStore } from '@/lib/store/okrsStore';
import { useActivityStore } from '@/lib/store/activityStore';
import { useSuggestionsStore } from '@/lib/store/suggestionsStore';
import ProductTour from '@/components/ui/ProductTour';
import { DASHBOARD_TOUR } from '@/lib/data/tourSteps';
import { StatusBadge, OKRStatusBadge } from '@/components/ui/Badge';
import { ProgressBar, DonutProgress } from '@/components/ui/ProgressBar';
import { Avatar } from '@/components/ui/Avatar';
import { formatRelative, formatDate, parseISO, differenceInDays } from '@/lib/utils/dateUtils';
import { calcObjectiveProgress, GANTT_BAR_COLORS } from '@/lib/utils/colorUtils';
import { useSettingsStore } from '@/lib/store/settingsStore';

/* ── Metric card — Bug #25: now clickable ────────────────────────── */
function MetricCard({
  label, value, trend, trendLabel, icon: Icon, href,
}: {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
  icon: React.ElementType;
  href?: string;
}) {
  const content = (
    <div
      className="card card-hover rounded-[14px] p-4 flex flex-col gap-3"
      style={{
        background: 'var(--bg-primary)',
        border: '1px solid var(--border)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        cursor: href ? 'pointer' : undefined,
      }}
    >
      <div className="flex items-center justify-between">
        <span
          className="text-[11px] font-semibold uppercase tracking-widest"
          style={{ color: 'var(--text-muted)', letterSpacing: '0.08em' }}
        >
          {label}
        </span>
        <Icon size={14} style={{ color: 'var(--text-disabled)' }} />
      </div>

      <div>
        <p className="text-[32px] font-[800] leading-none dm-heading" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          {value}
        </p>
        {trendLabel && (
          <p
            className="flex items-center gap-0.5 mt-1.5 text-[12px]"
            style={{
              color: trend === 'up' ? '#16A34A' : trend === 'down' ? '#DC2626' : 'var(--text-muted)',
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

  if (href) {
    return <Link href={href} className="block no-underline">{content}</Link>;
  }
  return content;
}

/* ── Mini roadmap (next 3 months) ────────────────────────────────── */
function MiniRoadmap() {
  const items = useProjectsStore(s => s.items);
  const today = new Date();
  const totalDays = 90;

  const toPercent = (dateStr: string) => {
    const diff = differenceInDays(parseISO(dateStr), today);
    return Math.min(100, Math.max(0, (diff / totalDays) * 100));
  };

  // Bug #5: Show ALL items that overlap with the next 90 days, not just type=project
  const endOfRange = new Date(today);
  endOfRange.setDate(endOfRange.getDate() + totalDays);

  const projects = items.filter((i) => {
    const start = parseISO(i.startDate);
    const end = parseISO(i.endDate);
    // Item overlaps the 90-day window if it starts before window end AND ends after today
    return start <= endOfRange && end >= today;
  });

  // Generate unique month labels covering the 90-day range
  const months: string[] = [];
  for (let i = 0; months.length < 4; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
    const label = d.toLocaleDateString('en-US', { month: 'short' });
    if (!months.includes(label)) months.push(label);
  }

  if (projects.length === 0) {
    return (
      <div style={{ padding: '16px 0', textAlign: 'center' }}>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 8px' }}>No projects in the next 90 days</p>
        <Link href="/timelines" style={{ fontSize: 12, fontWeight: 600, color: 'var(--app-accent, #2563EB)' }}>
          + Create your first project
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Month labels */}
      <div className="flex mb-3" style={{ paddingLeft: '140px' }}>
        {months.map((m, i) => (
          <div key={i} className="flex-1 text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>{m}</div>
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
              <div className="text-[12px] truncate shrink-0" style={{ width: 132, color: 'var(--text-tertiary)' }}>
                <span className="group-hover:text-[#2563EB] transition-colors duration-150">{item.title}</span>
              </div>
              <div
                className="flex-1 relative rounded-full overflow-hidden"
                style={{ height: 6, background: 'var(--border-row)' }}
              >
                <div className="absolute top-0 bottom-0 w-px z-10" style={{ left: '0%', background: '#DC2626', opacity: 0.6 }} />
                <div
                  className="absolute top-0 bottom-0 rounded-full"
                  style={{ left: `${left}%`, width: `${width}%`, backgroundColor: color, opacity: 0.75 }}
                />
              </div>
              <StatusBadge status={item.status} size="sm" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/* ── Activity dot ────────────────────────────────────────────────── */
function ActivityDot({ type }: { type: string }) {
  const config: Record<string, { color: string }> = {
    status_change: { color: 'var(--app-accent, #2563EB)' },
    progress:      { color: '#16A34A' },
    checkin:       { color: '#7C3AED' },
    created:       { color: 'var(--text-muted)' },
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
      className="card rounded-[14px] flex flex-col overflow-hidden"
      style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
    >
      <div
        className="flex items-center justify-between px-4 py-3 shrink-0"
        style={{ borderBottom: '1px solid var(--border-row)' }}
      >
        <h2 className="text-[13px] font-semibold dm-heading" style={{ color: 'var(--text-primary)' }}>{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────── */
export default function DashboardPage() {
  const items = useProjectsStore(s => s.items);
  const objectives = useOKRsStore(s => s.objectives);
  const activities = useActivityStore(s => s.events);
  const allSuggestions = useSuggestionsStore(s => s.suggestions);
  const pendingSuggestions = useMemo(() => allSuggestions.filter(sg => sg.status === 'pending'), [allSuggestions]);

  const totalProjects = items.length;
  const overdueItems  = items.filter(i => {
    return differenceInDays(new Date(), parseISO(i.endDate)) > 0 && i.status !== 'complete';
  }).length;

  const activeOKRs = objectives.length;

  // Bug #26: Calculate velocity from data, or show "—" when empty
  const completedItems = items.filter(i => i.status === 'complete').length;
  const velocityPct = totalProjects > 0 ? Math.round((completedItems / totalProjects) * 100) : null;

  // My Focus = highest priority incomplete items, then by earliest due date
  const PRIORITY_ORDER: Record<string, number> = { p0: 0, p1: 1, p2: 2, p3: 3 };
  const myFocus = items
    .filter(i => i.status !== 'complete')
    .sort((a, b) => {
      const prioDiff = (PRIORITY_ORDER[a.priority] ?? 9) - (PRIORITY_ORDER[b.priority] ?? 9);
      if (prioDiff !== 0) return prioDiff;
      return a.endDate.localeCompare(b.endDate);
    })
    .slice(0, 5);

  return (
    <div className="p-6 space-y-5 animate-fadeUp" style={{ maxWidth: 1360, position: 'relative', zIndex: 1 }}>

      {/* Page header */}
      <div className="mb-1">
        <h1 className="text-[26px] font-[800] leading-tight dm-heading" style={{ color: 'var(--text-primary)', letterSpacing: '-0.025em' }}>
          Dashboard
        </h1>
        <p className="text-[13px] mt-0.5 dm-text-muted" style={{ color: 'var(--text-muted)' }}>
          Your workspace at a glance.
        </p>
      </div>

      {/* Metrics row — Bug #4, #25, #26 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          label="Projects"
          value={totalProjects}
          trend={totalProjects > 0 ? 'up' : 'neutral'}
          trendLabel={totalProjects > 0 ? `${totalProjects} total` : 'None yet'}
          icon={GitBranch}
          href="/timelines"
        />
        <MetricCard
          label="Active OKRs"
          value={activeOKRs}
          trend="neutral"
          trendLabel={activeOKRs > 0 ? 'Q1 2026' : 'None yet'}
          icon={Target}
          href="/okrs"
        />
        <MetricCard
          label="Overdue"
          value={overdueItems}
          trend={overdueItems > 0 ? 'down' : 'up'}
          trendLabel={overdueItems > 0 ? 'Needs attention' : 'All on track'}
          icon={AlertTriangle}
          href="/timelines"
        />
        <MetricCard
          label="Velocity"
          value={velocityPct !== null ? `${velocityPct}%` : '—'}
          trend={velocityPct !== null && velocityPct > 50 ? 'up' : 'neutral'}
          trendLabel={velocityPct !== null ? `${completedItems}/${totalProjects} complete` : 'No data yet'}
          icon={Zap}
        />
      </div>

      {/* Pending Suggestions */}
      {pendingSuggestions.length > 0 && (
        <Section
          title="Pending Suggestions"
          action={
            <Link
              href="/suggestions"
              className="text-[12px] font-semibold transition-colors duration-150"
              style={{ color: 'var(--app-accent, #2563EB)' }}
            >
              Review all ({pendingSuggestions.length}) →
            </Link>
          }
        >
          <div>
            {pendingSuggestions.slice(0, 3).map((sg, i) => {
              const sourceIcon = sg.source.type === 'jira' ? '🔵' : sg.source.type === 'confluence' ? '📄' : '💬';
              const sourceLabel = sg.source.type === 'jira'
                ? sg.source.jiraKey ?? 'JIRA'
                : sg.source.type === 'confluence'
                ? 'Confluence'
                : `#${sg.source.slackChannelName ?? 'Slack'}`;
              return (
                <Link
                  key={sg.id}
                  href="/suggestions"
                  className="flex items-start gap-3 px-4 py-3 transition-colors duration-150 no-underline"
                  style={{
                    borderBottom: i < Math.min(pendingSuggestions.length, 3) - 1
                      ? '1px solid var(--border-light)'
                      : undefined,
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'var(--bg-hover)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; }}
                >
                  <div
                    className="flex items-center justify-center w-8 h-8 rounded-full shrink-0 mt-0.5"
                    style={{ background: 'var(--bg-subtle)' }}
                  >
                    <Sparkles size={14} style={{ color: '#D97706' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[13px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                        {sg.title}
                      </span>
                    </div>
                    <p className="text-[11px] mt-0.5 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                      <span>{sourceIcon}</span>
                      {sourceLabel}
                      <span className="mx-1">·</span>
                      Relevance: {sg.relevanceScore}%
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </Section>
      )}

      {/* Two-column middle */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* My Focus — Bug #22: empty state */}
        <Section
          title="My Focus"
          action={<span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>{myFocus.length} items</span>}
        >
          <div>
            {myFocus.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-[13px] mb-2" style={{ color: 'var(--text-muted)' }}>
                  No tasks to focus on right now.
                </p>
                <Link
                  href="/timelines"
                  className="text-[12px] font-semibold inline-flex items-center gap-1"
                  style={{ color: 'var(--app-accent, #2563EB)' }}
                >
                  <Plus size={12} /> Create a project to get started
                </Link>
              </div>
            ) : (
              myFocus.map((item, i) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 px-4 py-3 transition-colors duration-150 cursor-pointer group"
                  style={{
                    borderBottom: i < myFocus.length - 1 ? '1px solid var(--border-light)' : undefined,
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-hover)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
                >
                  <Avatar ownerId={item.ownerId} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-[13px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                        {item.title}
                      </span>
                      <StatusBadge status={item.status} size="sm" />
                    </div>
                    <ProgressBar value={item.progress} height="xs" />
                    <p className="text-[11px] mt-1.5 font-mono" style={{ color: 'var(--text-muted)' }}>
                      Due {formatDate(item.endDate, 'MMM d')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="px-4 py-2.5" style={{ borderTop: '1px solid var(--border-light)' }}>
            <Link href="/timelines" className="text-[12px] font-semibold transition-colors duration-150" style={{ color: 'var(--app-accent, #2563EB)' }}>
              View all timelines →
            </Link>
          </div>
        </Section>

        {/* Recent Activity — only timeline & roadmap events */}
        <Section title="Recent Activity">
          <div>
            {(() => {
              // Filter to only timeline and roadmap activity (exclude OKR events)
              const OKR_PATTERNS = /objective|key result|check-in on/i;
              // Deduplicate consecutive progress events for the same item
              const PROGRESS_ITEM = /^"(.+)" progress (?:updated|reached)/;
              const seen = new Set<string>();
              const timelineActivity = activities
                .filter(e => !OKR_PATTERNS.test(e.text))
                .filter(e => {
                  const match = e.text.match(PROGRESS_ITEM);
                  if (match) {
                    const key = match[1];
                    if (seen.has(key)) return false;
                    seen.add(key);
                  }
                  return true;
                });
              return timelineActivity.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-[13px] mb-1" style={{ color: 'var(--text-muted)' }}>
                  No recent activity yet.
                </p>
                <p className="text-[12px]" style={{ color: 'var(--text-disabled)' }}>
                  Activity will appear here as you create and update items.
                </p>
              </div>
            ) : (
              timelineActivity.slice(0, 7).map((event, i) => (
                <div
                  key={event.id}
                  className="flex items-start gap-3 px-4 py-2.5"
                  style={{ borderBottom: i < Math.min(timelineActivity.length, 7) - 1 ? '1px solid var(--border-light)' : undefined }}
                >
                  <ActivityDot type={event.type} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] leading-snug" style={{ color: 'var(--text-secondary)' }}>{event.text}</p>
                    <p className="text-[11px] mt-0.5 font-mono" style={{ color: 'var(--text-muted)' }}>
                      {formatRelative(event.timestamp)}
                    </p>
                  </div>
                </div>
              ))
            );
            })()}
          </div>
        </Section>
      </div>

      {/* OKR tallies */}
      <Section
        title="Objectives & Key Results"
        action={
          <Link href="/okrs" className="text-[12px] font-semibold transition-colors duration-150" style={{ color: 'var(--app-accent, #2563EB)' }}>
            All OKRs →
          </Link>
        }
      >
        {objectives.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className="text-[13px] mb-2" style={{ color: 'var(--text-muted)' }}>
              No objectives created yet.
            </p>
            <Link
              href="/okrs"
              className="text-[12px] font-semibold inline-flex items-center gap-1"
              style={{ color: 'var(--app-accent, #2563EB)' }}
            >
              <Plus size={12} /> Create your first objective
            </Link>
          </div>
        ) : (() => {
          const totalOKRs = objectives.length;
          const avgProgress = Math.round(objectives.reduce((sum, obj) => sum + calcObjectiveProgress(obj.keyResults), 0) / totalOKRs);
          const atRiskCount = objectives.filter(o => o.status === 'at_risk' || o.status === 'off_track').length;
          const completedCount = objectives.filter(o => calcObjectiveProgress(o.keyResults) === 100).length;
          const cards = [
            { label: 'Total OKRs', value: totalOKRs, icon: Target, iconBg: '#EDE9FE', iconColor: '#7C3AED' },
            { label: 'Avg Progress', value: `${avgProgress}%`, icon: BarChart3, iconBg: '#F3E8FF', iconColor: '#9333EA' },
            { label: 'At Risk', value: atRiskCount, icon: AlertTriangle, iconBg: '#FFF7ED', iconColor: '#EA580C' },
            { label: 'Completed', value: completedCount, icon: CheckCircle2, iconBg: '#ECFDF5', iconColor: '#059669' },
          ];
          return (
            <div className="grid grid-cols-4 gap-3 p-4">
              {cards.map(card => (
                <Link key={card.label} href="/okrs" className="no-underline">
                  <div className="rounded-xl p-4 flex items-center justify-between transition-all duration-150 hover:shadow-md" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)' }}>
                    <div>
                      <p className="text-[11px] font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>{card.label}</p>
                      <p className="text-[24px] font-bold" style={{ color: card.iconColor, letterSpacing: '-0.02em' }}>{card.value}</p>
                    </div>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: card.iconBg }}>
                      <card.icon size={18} style={{ color: card.iconColor }} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          );
        })()}
      </Section>

      {/* Mini roadmap — Bug #5 fixed in MiniRoadmap component */}
      <Section
        title="Next 90 Days"
        action={
          <Link href="/timelines" className="text-[12px] font-semibold transition-colors duration-150" style={{ color: 'var(--app-accent, #2563EB)' }}>
            Open Timelines →
          </Link>
        }
      >
        <div className="px-4 py-4">
          <MiniRoadmap />
        </div>
      </Section>

      <ProductTour tourKey="dashboard" steps={DASHBOARD_TOUR} />
    </div>
  );
}
