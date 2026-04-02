'use client';
import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import type { RoadmapSuggestion, TimelineItem, TimelineGroup, Priority } from '@/lib/types';
import { useSettingsStore } from '@/lib/store/settingsStore';

interface AcceptSuggestionModalProps {
  open: boolean;
  onClose: () => void;
  suggestion: RoadmapSuggestion | null;
  groups: TimelineGroup[];
  onConfirm: (id: string, overrides: Partial<TimelineItem>) => void;
}

export function AcceptSuggestionModal({
  open,
  onClose,
  suggestion,
  groups,
  onConfirm,
}: AcceptSuggestionModalProps) {
  const teamMembers = useSettingsStore(s => s.teamMembers);
  const today = new Date().toISOString().split('T')[0];
  const in30 = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'project' | 'milestone' | 'task'>('task');
  const [priority, setPriority] = useState<Priority>('p2');
  const [groupId, setGroupId] = useState('');
  const [ownerId, setOwnerId] = useState('');
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(in30);

  // Reset form when suggestion changes
  const [lastId, setLastId] = useState('');
  if (suggestion && suggestion.id !== lastId) {
    setLastId(suggestion.id);
    setTitle(suggestion.title);
    setDescription(suggestion.description);
    setType(suggestion.suggestedType);
    setPriority(suggestion.suggestedPriority);
    setGroupId(suggestion.suggestedGroupId);
    setOwnerId('');
    setStartDate(today);
    setEndDate(in30);
  }

  if (!suggestion) return null;

  const handleSubmit = () => {
    onConfirm(suggestion.id, {
      title,
      description,
      type,
      priority,
      groupId,
      ownerId,
      startDate,
      endDate,
    });
    onClose();
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '7px 10px',
    fontSize: '13px',
    border: '1px solid var(--border-strong)',
    borderRadius: '5px',
    outline: 'none',
    background: 'var(--bg-primary)',
    color: 'var(--text-primary)',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '11px',
    fontWeight: 600,
    color: 'var(--text-tertiary)',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };

  return (
    <Modal open={open} onClose={onClose} title="Add to Roadmap" size="lg">
      <div className="space-y-3">
        {/* Source context banner */}
        <div
          className="flex items-center gap-2 rounded-[5px] px-3 py-2"
          style={{ background: '#F0F9FF', border: '1px solid #BAE6FD' }}
        >
          <span className="text-[11px] font-semibold" style={{ color: '#0369A1' }}>
            From {suggestion.source.type.toUpperCase()}
            {suggestion.source.jiraKey ? ` · ${suggestion.source.jiraKey}` : ''}
            {suggestion.source.slackChannelName ? ` · #${suggestion.source.slackChannelName}` : ''}
          </span>
        </div>

        <div>
          <label style={labelStyle}>Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={inputStyle}
            autoFocus
          />
        </div>

        <div>
          <label style={labelStyle}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label style={labelStyle}>Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as typeof type)}
              style={inputStyle}
            >
              <option value="task">Task</option>
              <option value="project">Project</option>
              <option value="milestone">Milestone</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              style={inputStyle}
            >
              <option value="p0">P0 — Critical</option>
              <option value="p1">P1 — High</option>
              <option value="p2">P2 — Medium</option>
              <option value="p3">P3 — Low</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label style={labelStyle}>Section</label>
            <select
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              style={inputStyle}
            >
              <option value="">Ungrouped</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Owner</label>
            <select
              value={ownerId}
              onChange={(e) => setOwnerId(e.target.value)}
              style={inputStyle}
            >
              <option value="">Unassigned</option>
              {teamMembers.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label style={labelStyle}>Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-[13px] font-medium rounded-[5px] transition-all duration-150"
            style={{ color: 'var(--text-tertiary)', border: '1px solid var(--border-medium)' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="px-3.5 py-1.5 text-[13px] font-semibold rounded-[5px] transition-all duration-150"
            style={{
              background: 'var(--app-accent, #2563EB)',
              color: '#FFFFFF',
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
              opacity: !title.trim() ? 0.5 : 1,
              cursor: !title.trim() ? 'not-allowed' : 'pointer',
            }}
          >
            Add to Roadmap
          </button>
        </div>
      </div>
    </Modal>
  );
}
