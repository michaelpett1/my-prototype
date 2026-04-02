'use client';
import { useState } from 'react';
import { SidePanel } from '@/components/ui/SidePanel';
import { Button } from '@/components/ui/Button';
import { StatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Avatar } from '@/components/ui/Avatar';
import { useProjectsStore } from '@/lib/store/projectsStore';
import { useToastStore } from '@/lib/store/toastStore';
import { useSettingsStore } from '@/lib/store/settingsStore';
import type { TimelineItem, TimelineItemStatus, Priority } from '@/lib/types';
import { formatDate } from '@/lib/utils/dateUtils';
import { STATUS_LABELS, PRIORITY_LABELS } from '@/lib/utils/colorUtils';

interface ItemDetailPanelProps {
  item: TimelineItem | null;
  onClose: () => void;
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)', letterSpacing: '0.07em' }}>
      {children}
    </p>
  );
}

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
            background: 'var(--app-accent, #2563EB)',
            color: '#FFFFFF',
            boxShadow: '0 1px 2px rgba(37,99,235,0.3)',
          } : {
            background: 'var(--bg-subtle)',
            color: 'var(--text-tertiary)',
            border: '1px solid var(--border)',
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
  const deleteItem = useProjectsStore(s => s.deleteItem);
  const groups = useProjectsStore(s => s.groups);
  const addToast = useToastStore(s => s.addToast);
  const teamMembers = useSettingsStore(s => s.teamMembers);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState('');

  if (!item) return null;

  const owner = teamMembers.find(m => m.id === item.ownerId);

  function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    deleteItem(item!.id);
    addToast(`Deleted "${item!.title}"`, 'info');
    onClose();
    setConfirmDelete(false);
  }

  function handleSaveTitle() {
    if (editTitle.trim() && editTitle.trim() !== item!.title) {
      updateItem(item!.id, { title: editTitle.trim() });
      addToast('Title updated', 'success');
    }
    setEditingTitle(false);
  }

  return (
    <SidePanel open={!!item} onClose={onClose} title={item.title}>
      <div className="p-4 space-y-5">

        {/* Editable title */}
        <div>
          {editingTitle ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSaveTitle(); if (e.key === 'Escape') setEditingTitle(false); }}
                autoFocus
                style={{
                  flex: 1,
                  fontSize: 14,
                  fontWeight: 600,
                  padding: '4px 8px',
                  border: '1px solid var(--border-strong)',
                  borderRadius: 5,
                  outline: 'none',
                  color: 'var(--text-primary)',
                }}
              />
              <Button variant="primary" size="sm" onClick={handleSaveTitle}>Save</Button>
              <Button variant="ghost" size="sm" onClick={() => setEditingTitle(false)}>Cancel</Button>
            </div>
          ) : (
            <button
              onClick={() => { setEditTitle(item.title); setEditingTitle(true); }}
              className="text-left w-full text-[14px] font-semibold hover:text-[#2563EB] transition-colors duration-150"
              style={{ color: 'var(--text-primary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              title="Click to edit title"
            >
              {item.title}
            </button>
          )}
        </div>

        {/* Type + badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status={item.status} />
          <PriorityBadge priority={item.priority} />
          <span
            className="text-[11px] px-2 py-[2px] rounded-[3px] font-medium capitalize"
            style={{ background: 'var(--bg-subtle)', color: 'var(--text-muted)' }}
          >
            {item.type}
          </span>
        </div>

        {/* Description */}
        {item.description && (
          <div>
            <FieldLabel>Description</FieldLabel>
            <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{item.description}</p>
          </div>
        )}

        {/* Owner */}
        <div>
          <FieldLabel>Owner</FieldLabel>
          <div className="flex items-center gap-2.5">
            {owner && (
              <img src={owner.avatarUrl} alt={owner.name} className="w-[28px] h-[28px] rounded-full flex-shrink-0" />
            )}
            <select
              value={item.ownerId}
              onChange={e => {
                updateItem(item.id, { ownerId: e.target.value });
                const memberName = teamMembers.find(m => m.id === e.target.value)?.name ?? 'Unassigned';
                addToast(e.target.value ? `Assigned to ${memberName}` : 'Owner removed', 'success');
              }}
              style={{
                flex: 1,
                fontSize: 13,
                padding: '6px 10px',
                border: '1px solid var(--border-medium)',
                borderRadius: 5,
                background: 'var(--bg-primary)',
                color: item.ownerId ? 'var(--text-primary)' : 'var(--text-muted)',
                outline: 'none',
                cursor: 'pointer',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--app-accent, #2563EB)'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(37,99,235,0.12)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-medium)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <option value="">— Unassigned —</option>
              {teamMembers.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <FieldLabel>Start</FieldLabel>
            <input
              type="date"
              value={item.startDate.split('T')[0]}
              max={item.endDate.split('T')[0]}
              onChange={e => {
                if (e.target.value && e.target.value <= item.endDate.split('T')[0]) {
                  updateItem(item.id, { startDate: e.target.value });
                }
              }}
              style={{
                fontSize: 13,
                fontFamily: 'ui-monospace, monospace',
                color: 'var(--text-primary)',
                padding: '4px 8px',
                border: '1px solid var(--border-medium)',
                borderRadius: 5,
                background: 'var(--bg-primary)',
                outline: 'none',
                width: '100%',
                cursor: 'pointer',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--app-accent, #2563EB)'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(37,99,235,0.12)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-medium)'; e.currentTarget.style.boxShadow = 'none'; }}
            />
          </div>
          <div>
            <FieldLabel>End</FieldLabel>
            <input
              type="date"
              value={item.endDate.split('T')[0]}
              min={item.startDate.split('T')[0]}
              onChange={e => {
                if (e.target.value && e.target.value >= item.startDate.split('T')[0]) {
                  updateItem(item.id, { endDate: e.target.value });
                }
              }}
              style={{
                fontSize: 13,
                fontFamily: 'ui-monospace, monospace',
                color: 'var(--text-primary)',
                padding: '4px 8px',
                border: '1px solid var(--border-medium)',
                borderRadius: 5,
                background: 'var(--bg-primary)',
                outline: 'none',
                width: '100%',
                cursor: 'pointer',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--app-accent, #2563EB)'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(37,99,235,0.12)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-medium)'; e.currentTarget.style.boxShadow = 'none'; }}
            />
          </div>
        </div>

        {/* Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <FieldLabel>Progress</FieldLabel>
            <span className="text-[13px] font-semibold font-mono" style={{ color: 'var(--text-primary)' }}>{item.progress}%</span>
          </div>
          <input
            type="range"
            min={0} max={100}
            value={item.progress}
            onChange={e => updateItem(item.id, { progress: Number(e.target.value) })}
            className="w-full"
            style={{ accentColor: 'var(--app-accent, #4f46e5)' }}
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

        {/* Section */}
        <div>
          <FieldLabel>Section</FieldLabel>
          <select
            value={item.groupId}
            onChange={e => {
              updateItem(item.id, { groupId: e.target.value });
              const groupName = groups.find(g => g.id === e.target.value)?.name ?? 'Ungrouped';
              addToast(`Moved to "${groupName}"`, 'success');
            }}
            style={{
              width: '100%',
              fontSize: 13,
              padding: '6px 10px',
              border: '1px solid var(--border-medium)',
              borderRadius: 5,
              background: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              outline: 'none',
              cursor: 'pointer',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = 'var(--app-accent, #2563EB)'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(37,99,235,0.12)'; }}
            onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-medium)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <option value="">— Ungrouped —</option>
            {groups.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
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
                  style={{ background: 'var(--bg-subtle)', color: 'var(--text-tertiary)' }}
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
            <p className="text-[12px] font-mono" style={{ color: 'var(--text-tertiary)' }}>{item.dependencies.join(', ')}</p>
          </div>
        )}

        {/* Footer */}
        <div
          className="flex items-center justify-between pt-2"
          style={{ borderTop: '1px solid var(--border-row)' }}
        >
          <div className="flex items-center gap-2">
            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
            >
              {confirmDelete ? 'Confirm Delete' : 'Delete'}
            </Button>
            {confirmDelete && (
              <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>Cancel</Button>
            )}
          </div>
          <p className="text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>
            Updated {formatDate(item.updatedAt, 'MMM d')}
          </p>
        </div>
      </div>
    </SidePanel>
  );
}
