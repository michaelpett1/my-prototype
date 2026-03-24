'use client';
import { useState } from 'react';
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

export function ItemDetailPanel({ item, onClose }: ItemDetailPanelProps) {
  const updateItem = useProjectsStore((s) => s.updateItem);
  const [editing, setEditing] = useState(false);

  if (!item) return null;

  const owner = TEAM_MEMBERS.find((m) => m.id === item.ownerId);

  return (
    <SidePanel open={!!item} onClose={onClose} title={item.title} width="w-[420px]">
      <div className="p-4 space-y-5">
        {/* Status + Priority row */}
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status={item.status} />
          <PriorityBadge priority={item.priority} />
          <span className="text-xs text-slate-500 capitalize ml-auto">{item.type}</span>
        </div>

        {/* Description */}
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wide">Description</p>
          <p className="text-sm text-slate-700 leading-relaxed">{item.description || 'No description.'}</p>
        </div>

        {/* Owner */}
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Owner</p>
          {owner ? (
            <div className="flex items-center gap-2">
              <Avatar ownerId={item.ownerId} size="md" />
              <div>
                <p className="text-sm font-medium text-slate-700">{owner.name}</p>
                <p className="text-xs text-slate-400">{owner.role}</p>
              </div>
            </div>
          ) : <p className="text-sm text-slate-400">Unassigned</p>}
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wide">Start</p>
            <p className="text-sm text-slate-700">{formatDate(item.startDate)}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wide">End</p>
            <p className="text-sm text-slate-700">{formatDate(item.endDate)}</p>
          </div>
        </div>

        {/* Progress */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Progress</p>
            <span className="text-sm font-medium text-slate-700">{item.progress}%</span>
          </div>
          <ProgressBar value={item.progress} height="md" />
          <input
            type="range"
            min="0"
            max="100"
            value={item.progress}
            onChange={(e) => updateItem(item.id, { progress: Number(e.target.value) })}
            className="w-full mt-2 accent-blue-600"
          />
        </div>

        {/* Edit status */}
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Status</p>
          <div className="flex flex-wrap gap-1.5">
            {(['not_started', 'in_progress', 'at_risk', 'complete'] as TimelineItemStatus[]).map((s) => (
              <button
                key={s}
                onClick={() => updateItem(item.id, { status: s })}
                className={`text-xs px-2 py-1 rounded border transition-colors ${
                  item.status === s
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                }`}
              >
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        {/* Priority */}
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Priority</p>
          <div className="flex flex-wrap gap-1.5">
            {(['p0', 'p1', 'p2', 'p3'] as Priority[]).map((p) => (
              <button
                key={p}
                onClick={() => updateItem(item.id, { priority: p })}
                className={`text-xs px-2 py-1 rounded border transition-colors ${
                  item.priority === p
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                }`}
              >
                {p.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Tags */}
        {item.tags.length > 0 && (
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Tags</p>
            <div className="flex flex-wrap gap-1">
              {item.tags.map((tag) => (
                <span key={tag} className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded">{tag}</span>
              ))}
            </div>
          </div>
        )}

        {/* Dependencies */}
        {item.dependencies.length > 0 && (
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Dependencies</p>
            <div className="text-xs text-slate-500">{item.dependencies.join(', ')}</div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-400">Updated {formatDate(item.updatedAt, 'MMM d')}</p>
          <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
        </div>
      </div>
    </SidePanel>
  );
}
