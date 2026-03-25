'use client';
import { SidePanel } from '@/components/ui/SidePanel';
import { Button } from '@/components/ui/Button';
import { StatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Avatar } from '@/components/ui/Avatar';
import { useProjectsStore } from '@/lib/store/projectsStore';
import { TEAM_MEMBERS } from '@/lib/data/mockData';
import type { TimelineItem, TimelineItemStatus, Priority } from '@/lib/types';
import { formatDate } from '@/lib/utils/dateUtils';
import { STATUS_LABELS, PRIORITY_LABELS } from '@/lib/utils/colorUtils';

interface ItemDetailPanelProps {
  item: TimelineItem | null;
  onClose: () => void;
}

/* ── Small inline section label ──────────────────────────────────── */
function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: '#9CA3AF', letterSpacing: '0.07em' }}>
      {children}
    </p>
  );
}

/* ── Toggle chip group ───────────────────────────────────────────── */
function ChipGroup<T extends string>({
  options, value, onChange, labels,
}: {
  options: T[];
  value: T;
  onChange: (v: T) => void;
  labels: Record<T, string>;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className="text-[12px] px-2.5 py-1 rounded-[4px] transition-all duration-150 ease-out"
          style={value === opt ? {
            background: '#2563EB',
            color: '#FFFFFF',
            boxShadow: '0 1px 2px rgba(37,99,235,0.3)',
          } : {
            background: 'rgba(0,0,0,0.04)',
            color: '#6B7280',
            border: '1px solid rgba(0,0,0,0.07)',
          }}
        >
          {labels[opt]}
        </button>
      ))}
    </div>
  );
}

export function ItemDetailPanel({ item, onClose }: ItemDetailPanelProps) {
  const updateItem = useProjectsStore(s => s.updateItem);
  if (!item) return null;

  const owner = TEAM_MEMBERS.find(m => m.id === item.ownerId);

  return (
    <SidePanel open={!!item} onClose={onClose} title={item.title}>
      <div className="p-4 space-y-5">

        {/* Type + badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status={item.status} />
          <PriorityBadge priority={item.priority} />
          <span
            className="text-[11px] px-2 py-[2px] rounded-[3px] font-medium capitalize"
            style={{ background: 'rgba(0,0,0,0.04)', color: '#9CA3AF' }}
          >
            {item.type}
          </span>
        </div>

        {/* Description */}
        {item.description && (
          <div>
            <FieldLabel>Description</FieldLabel>
            <p className="text-[13px] leading-relaxed" style={{ color: '#374151' }}>{item.description}</p>
          </div>
        )}

        {/* Owner */}
        <div>
          <FieldLabel>Owner</FieldLabel>
          {owner ? (
            <div className="flex items-center gap-2.5">
              <img src={owner.avatarUrl} alt={owner.name} className="w-[28px] h-[28px] rounded-full" />
              <div>
                <p className="text-[13px] font-semibold" style={{ color: '#1C1917' }}>{owner.name}</p>
                <p className="text-[11px]" style={{ color: '#9CA3AF' }}>{owner.role}</p>
              </div>
            </div>
          ) : (
            <p className="text-[13px]" style={{ color: '#9CA3AF' }}>Unassigned</p>
          )}
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <FieldLabel>Start</FieldLabel>
            <p className="text-[13px] font-mono" style={{ color: '#1C1917' }}>{formatDate(item.startDate, 'MMM d, yyyy')}</p>
          </div>
          <div>
            <FieldLabel>End</FieldLabel>
            <p className="text-[13px] font-mono" style={{ color: '#1C1917' }}>{formatDate(item.endDate, 'MMM d, yyyy')}</p>
          </div>
        </div>

        {/* Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <FieldLabel>Progress</FieldLabel>
            <span className="text-[13px] font-semibold font-mono" style={{ color: '#1C1917' }}>{item.progress}%</span>
          </div>
          <ProgressBar value={item.progress} height="sm" />
          <input
            type="range"
            min={0} max={100}
            value={item.progress}
            onChange={e => updateItem(item.id, { progress: Number(e.target.value) })}
            className="w-full mt-2"
            style={{ accentColor: '#2563EB' }}
          />
        </div>

        {/* Status */}
        <div>
          <FieldLabel>Status</FieldLabel>
          <ChipGroup
            options={['not_started', 'in_progress', 'at_risk', 'complete'] as TimelineItemStatus[]}
            value={item.status}
            onChange={v => updateItem(item.id, { status: v })}
            labels={STATUS_LABELS}
          />
        </div>

        {/* Priority */}
        <div>
          <FieldLabel>Priority</FieldLabel>
          <ChipGroup
            options={['p0', 'p1', 'p2', 'p3'] as Priority[]}
            value={item.priority}
            onChange={v => updateItem(item.id, { priority: v })}
            labels={{ p0: 'P0 Critical', p1: 'P1 High', p2: 'P2 Medium', p3: 'P3 Low' }}
          />
        </div>

        {/* Tags */}
        {item.tags.length > 0 && (
          <div>
            <FieldLabel>Tags</FieldLabel>
            <div className="flex flex-wrap gap-1.5">
              {item.tags.map(tag => (
                <span
                  key={tag}
                  className="text-[12px] px-2 py-[2px] rounded-[3px]"
                  style={{ background: 'rgba(0,0,0,0.04)', color: '#6B7280' }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Dependencies */}
        {item.dependencies.length > 0 && (
          <div>
            <FieldLabel>Dependencies</FieldLabel>
            <p className="text-[12px] font-mono" style={{ color: '#6B7280' }}>{item.dependencies.join(', ')}</p>
          </div>
        )}

        {/* Footer */}
        <div
          className="flex items-center justify-between pt-2"
          style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}
        >
          <p className="text-[11px] font-mono" style={{ color: '#9CA3AF' }}>
            Updated {formatDate(item.updatedAt, 'MMM d')}
          </p>
          <Button variant="ghost" size="sm" onClick={onClose}>Dismiss</Button>
        </div>
      </div>
    </SidePanel>
  );
}
