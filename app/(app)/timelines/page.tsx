'use client';
import { useState, useMemo, useEffect, useRef } from 'react';
import { Plus, AlignLeft, List, Columns, Check, Lightbulb, ChevronDown, ChevronUp, RefreshCw, AlertTriangle, Sparkles, CheckCircle, XCircle, Pencil } from 'lucide-react';
import { GanttChart } from '@/components/timelines/GanttChart';
import { TimelineTable } from '@/components/timelines/TimelineTable';
import { TimelineBoard } from '@/components/timelines/TimelineBoard';
import { ItemDetailPanel } from '@/components/timelines/ItemDetailPanel';
import { SuggestionCard } from '@/components/suggestions/SuggestionCard';
import { AcceptSuggestionModal } from '@/components/suggestions/AcceptSuggestionModal';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useProjectsStore } from '@/lib/store/projectsStore';
import { useSuggestionsStore } from '@/lib/store/suggestionsStore';
import { useToastStore } from '@/lib/store/toastStore';
import { useSettingsStore } from '@/lib/store/settingsStore';
import type { TimelineViewMode, GanttScale, TimelineItem, TimelineItemStatus, Priority, TimelineGroup } from '@/lib/types';
import { clsx } from '@/lib/utils/clsx';
import { useIsAdmin } from '@/lib/hooks/useIsAdmin';
import ProductTour from '@/components/ui/ProductTour';
import { TIMELINES_TOUR } from '@/lib/data/tourSteps';

const VIEW_OPTS: Array<{ mode: TimelineViewMode; label: string; icon: React.ElementType }> = [
  { mode: 'gantt',  label: 'Gantt',  icon: AlignLeft },
  { mode: 'table',  label: 'Table',  icon: List },
  { mode: 'board',  label: 'Board',  icon: Columns },
];

const SCALE_OPTS: Array<{ scale: GanttScale; label: string }> = [
  { scale: 'week',    label: 'Week' },
  { scale: 'month',   label: 'Month' },
  { scale: 'quarter', label: 'Quarter' },
];

/* ── Segmented control ────────────────────────────────────────── */
function SegmentedControl<T extends string>({
  options, value, onChange, renderLabel,
}: {
  options: T[];
  value: T;
  onChange: (v: T) => void;
  renderLabel: (v: T) => React.ReactNode;
}) {
  return (
    <div
      className="flex items-center rounded-[5px] p-[3px] gap-[2px]"
      style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-row)' }}
    >
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={clsx(
            'flex items-center gap-1.5 rounded-[3px] text-[12px] font-medium transition-all duration-150 ease-out px-2.5 py-1',
            value === opt
              ? 'bg-[var(--bg-primary)] shadow-[0_1px_2px_rgba(0,0,0,0.08)] text-[var(--text-primary)]'
              : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
          )}
        >
          {renderLabel(opt)}
        </button>
      ))}
    </div>
  );
}

/* ── New Group Modal ─────────────────────────────────────────── */
function NewGroupModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addGroup } = useProjectsStore();
  const addToast = useToastStore(s => s.addToast);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#2563EB');
  const COLORS = ['#2563EB', '#22C55E', '#F97316', '#EC4899', '#8B5CF6', '#F59E0B', '#14B8A6', '#EF4444'];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    addGroup({ id: `grp-${Date.now()}`, name: name.trim(), color });
    addToast(`Added section: "${name.trim()}"`, 'success');
    setName('');
    setColor('#2563EB');
    onClose();
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '7px 10px', fontSize: 13,
    border: '1px solid var(--input-border)', borderRadius: 6,
    color: 'var(--text-primary)', background: 'var(--input-bg)', outline: 'none',
  };

  return (
    <Modal open={open} onClose={onClose} title="New Section">
      <form onSubmit={handleSubmit} style={{ minWidth: 340 }}>
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Name *</label>
          <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="e.g., New Features" autoFocus />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Color</label>
          <div className="flex gap-2 flex-wrap">
            {COLORS.map(c => (
              <button
                key={c} type="button" onClick={() => setColor(c)}
                className="w-7 h-7 rounded-full relative transition-transform duration-150 hover:scale-110"
                style={{ background: c }}
              >
                {color === c && <Check size={12} className="absolute inset-0 m-auto text-white" strokeWidth={2.5} />}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 6, borderTop: '1px solid var(--border)' }}>
          <button type="button" onClick={onClose}
            style={{ fontSize: 13, fontWeight: 500, padding: '7px 14px', borderRadius: 6, border: '1px solid var(--border-strong)', color: 'var(--text-secondary)', background: 'var(--bg-primary)', cursor: 'pointer' }}>
            Cancel
          </button>
          <button type="submit"
            style={{ fontSize: 13, fontWeight: 600, padding: '7px 16px', borderRadius: 6, border: 'none', color: '#FFFFFF', background: '#2563EB', cursor: 'pointer' }}>
            Create Section
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ── Edit Group Modal ────────────────────────────────────────── */
function EditGroupModal({ open, onClose, group }: { open: boolean; onClose: () => void; group: TimelineGroup | null }) {
  const { updateGroup } = useProjectsStore();
  const addToast = useToastStore(s => s.addToast);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#2563EB');
  const COLORS = ['#2563EB', '#22C55E', '#F97316', '#EC4899', '#8B5CF6', '#F59E0B', '#14B8A6', '#EF4444'];
  const [lastGroupId, setLastGroupId] = useState<string | null>(null);

  // Sync form when a different group is opened
  if (open && group && group.id !== lastGroupId) {
    setName(group.name);
    setColor(group.color);
    setLastGroupId(group.id);
  }
  if (!open && lastGroupId !== null) {
    setLastGroupId(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !group) return;
    updateGroup(group.id, { name: name.trim(), color });
    addToast(`Updated section: "${name.trim()}"`, 'success');
    onClose();
    setName('');
    setColor('#2563EB');
  }

  function handleClose() {
    onClose();
    setName('');
    setColor('#2563EB');
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '7px 10px', fontSize: 13,
    border: '1px solid var(--input-border)', borderRadius: 6,
    color: 'var(--text-primary)', background: 'var(--input-bg)', outline: 'none',
  };

  return (
    <Modal open={open} onClose={handleClose} title="Edit Section">
      <form onSubmit={handleSubmit} style={{ minWidth: 340 }}>
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Name *</label>
          <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="e.g., New Features" autoFocus />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Color</label>
          <div className="flex gap-2 flex-wrap">
            {COLORS.map(c => (
              <button
                key={c} type="button" onClick={() => setColor(c)}
                className="w-7 h-7 rounded-full relative transition-transform duration-150 hover:scale-110"
                style={{ background: c }}
              >
                {color === c && <Check size={12} className="absolute inset-0 m-auto text-white" strokeWidth={2.5} />}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 6, borderTop: '1px solid var(--border)' }}>
          <button type="button" onClick={handleClose}
            style={{ fontSize: 13, fontWeight: 500, padding: '7px 14px', borderRadius: 6, border: '1px solid var(--border-strong)', color: 'var(--text-secondary)', background: 'var(--bg-primary)', cursor: 'pointer' }}>
            Cancel
          </button>
          <button type="submit"
            style={{ fontSize: 13, fontWeight: 600, padding: '7px 16px', borderRadius: 6, border: 'none', color: '#FFFFFF', background: '#2563EB', cursor: 'pointer' }}>
            Save Changes
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ── Delete Group Confirmation Modal ─────────────────────────── */
function DeleteGroupModal({ open, onClose, group }: { open: boolean; onClose: () => void; group: TimelineGroup | null }) {
  const { removeGroup, items } = useProjectsStore();
  const addToast = useToastStore(s => s.addToast);

  const itemCount = group ? items.filter(i => i.groupId === group.id).length : 0;

  function handleDelete() {
    if (!group) return;
    removeGroup(group.id);
    addToast(`Deleted section: "${group.name}"`, 'success');
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Delete Section">
      <div style={{ minWidth: 340 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 20 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: 'var(--danger-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <AlertTriangle size={18} style={{ color: '#DC2626' }} />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 6px' }}>
              Delete &ldquo;{group?.name}&rdquo;?
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-tertiary)', margin: 0, lineHeight: 1.5 }}>
              {itemCount > 0
                ? `This section contains ${itemCount} item${itemCount !== 1 ? 's' : ''}. They will be moved to "Ungrouped" — nothing will be deleted.`
                : 'This section is empty and will be removed.'}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 6, borderTop: '1px solid var(--border)' }}>
          <button type="button" onClick={onClose}
            style={{ fontSize: 13, fontWeight: 500, padding: '7px 14px', borderRadius: 6, border: '1px solid var(--border-strong)', color: 'var(--text-secondary)', background: 'var(--bg-primary)', cursor: 'pointer' }}>
            Cancel
          </button>
          <button type="button" onClick={handleDelete}
            style={{ fontSize: 13, fontWeight: 600, padding: '7px 16px', borderRadius: 6, border: 'none', color: '#FFFFFF', background: '#DC2626', cursor: 'pointer' }}>
            Delete Section
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ── New Project Modal ────────────────────────────────────────── */
interface NewProjectForm {
  title: string;
  type: 'project' | 'task' | 'milestone';
  status: TimelineItemStatus;
  priority: Priority;
  startDate: string;
  endDate: string;
  ownerId: string;
  groupId: string;
}

function todayStr() {
  return new Date().toISOString().split('T')[0];
}
function plus30Str() {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().split('T')[0];
}

function defaultNewProjectForm(): NewProjectForm {
  return {
    title: '',
    type: 'project',
    status: 'not_started',
    priority: 'p2',
    startDate: todayStr(),
    endDate: plus30Str(),
    ownerId: '',
    groupId: '',
  };
}

function NewProjectModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addItem, groups } = useProjectsStore();
  const teamMembers = useSettingsStore(s => s.teamMembers);
  const [form, setForm] = useState<NewProjectForm>(defaultNewProjectForm());
  const [errors, setErrors] = useState<Partial<Record<keyof NewProjectForm, string>>>({});

  function setField<K extends keyof NewProjectForm>(key: K, value: NewProjectForm[K]) {
    setForm(f => ({ ...f, [key]: value }));
    setErrors(e => ({ ...e, [key]: undefined }));
  }

  function validate(): boolean {
    const errs: Partial<Record<keyof NewProjectForm, string>> = {};
    if (!form.title.trim()) errs.title = 'Required';
    if (!form.startDate) errs.startDate = 'Required';
    if (!form.endDate) errs.endDate = 'Required';
    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      errs.endDate = 'End date cannot be before start date';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    const now = new Date().toISOString();
    const item: TimelineItem = {
      id: Date.now().toString(),
      title: form.title.trim(),
      description: '',
      type: form.type,
      parentId: null,
      status: form.status,
      priority: form.priority,
      ownerId: form.ownerId,
      startDate: form.startDate,
      endDate: form.endDate,
      progress: 0,
      dependencies: [],
      tags: [],
      groupId: form.groupId,
      createdAt: now,
      updatedAt: now,
    };
    addItem(item);
    setForm(defaultNewProjectForm());
    onClose();
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '7px 10px', fontSize: 13,
    border: '1px solid var(--input-border)', borderRadius: 6,
    color: 'var(--text-primary)', background: 'var(--input-bg)', outline: 'none',
  };
  const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 };
  const fieldStyle: React.CSSProperties = { marginBottom: 14 };
  const errStyle: React.CSSProperties = { fontSize: 11, color: '#EF4444', marginTop: 3 };

  return (
    <Modal open={open} onClose={onClose} title="New Project">
      <form onSubmit={handleSubmit} style={{ minWidth: 380 }}>
        <div style={fieldStyle}>
          <label style={labelStyle}>Title *</label>
          <input
            style={{ ...inputStyle, borderColor: errors.title ? '#EF4444' : 'var(--input-border)' }}
            value={form.title} onChange={e => setField('title', e.target.value)}
            placeholder="Enter title" autoFocus
          />
          {errors.title && <p style={errStyle}>{errors.title}</p>}
        </div>

        {/* Section (Group) */}
        <div style={fieldStyle}>
          <label style={labelStyle}>Section</label>
          <select style={inputStyle} value={form.groupId} onChange={e => setField('groupId', e.target.value)}>
            <option value="">— Ungrouped —</option>
            {groups.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
          <div>
            <label style={labelStyle}>Type</label>
            <select style={inputStyle} value={form.type} onChange={e => setField('type', e.target.value as NewProjectForm['type'])}>
              <option value="project">Project</option>
              <option value="task">Task</option>
              <option value="milestone">Milestone</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Status</label>
            <select style={inputStyle} value={form.status} onChange={e => setField('status', e.target.value as TimelineItemStatus)}>
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="at_risk">At Risk</option>
              <option value="complete">Complete</option>
            </select>
          </div>
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Priority</label>
          <select style={inputStyle} value={form.priority} onChange={e => setField('priority', e.target.value as Priority)}>
            <option value="p0">P0 Critical</option>
            <option value="p1">P1 High</option>
            <option value="p2">P2 Medium</option>
            <option value="p3">P3 Low</option>
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
          <div>
            <label style={labelStyle}>Start Date *</label>
            <input type="date" style={{ ...inputStyle, borderColor: errors.startDate ? '#EF4444' : 'var(--input-border)' }}
              value={form.startDate} max={form.endDate || undefined} onChange={e => setField('startDate', e.target.value)} />
            {errors.startDate && <p style={errStyle}>{errors.startDate}</p>}
          </div>
          <div>
            <label style={labelStyle}>End Date *</label>
            <input type="date" style={{ ...inputStyle, borderColor: errors.endDate ? '#EF4444' : 'var(--input-border)' }}
              value={form.endDate} min={form.startDate || undefined} onChange={e => setField('endDate', e.target.value)} />
            {errors.endDate && <p style={errStyle}>{errors.endDate}</p>}
          </div>
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Owner</label>
          <select style={inputStyle} value={form.ownerId} onChange={e => setField('ownerId', e.target.value)}>
            <option value="">Unassigned</option>
            {teamMembers.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 6, borderTop: '1px solid var(--border)', marginTop: 6 }}>
          <button type="button" onClick={onClose}
            style={{ fontSize: 13, fontWeight: 500, padding: '7px 14px', borderRadius: 6, border: '1px solid var(--border-strong)', color: 'var(--text-secondary)', background: 'var(--bg-primary)', cursor: 'pointer' }}>
            Cancel
          </button>
          <button type="submit"
            style={{ fontSize: 13, fontWeight: 600, padding: '7px 16px', borderRadius: 6, border: 'none', color: '#FFFFFF', background: '#2563EB', cursor: 'pointer' }}>
            Create
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ── Main Page ────────────────────────────────────────────────── */
export default function TimelinesPage() {
  const {
    items, groups, viewMode, ganttScale, selectedItemId,
    setViewMode, setGanttScale, selectItem,
    filterStatus, setFilterStatus,
    reorderItems, updateItem,
  } = useProjectsStore();

  const isAdmin = useIsAdmin();
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [newGroupOpen, setNewGroupOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<TimelineGroup | null>(null);
  const [deletingGroup, setDeletingGroup] = useState<TimelineGroup | null>(null);

  // Apply workspace defaults on mount
  const defaultsApplied = useRef(false);
  const workspace = useSettingsStore(s => s.workspace);
  useEffect(() => {
    if (defaultsApplied.current) return;
    defaultsApplied.current = true;
    if (workspace.defaultTimelineView) setViewMode(workspace.defaultTimelineView);
    if (workspace.defaultGanttScale) setGanttScale(workspace.defaultGanttScale);
  }, [workspace.defaultTimelineView, workspace.defaultGanttScale, setViewMode, setGanttScale]);

  // Suggestions state
  const {
    suggestions,
    acceptSuggestion,
    dismissSuggestion,
    deferSuggestion,
  } = useSuggestionsStore();
  const pendingSuggestions = useMemo(
    () => suggestions
      .filter((s) => s.status === 'pending')
      .sort((a, b) => b.relevanceScore - a.relevanceScore),
    [suggestions]
  );
  const [suggestionsExpanded, setSuggestionsExpanded] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState<'idle' | 'running' | 'complete-new' | 'complete-none' | 'error'>('idle');
  const [scanTimestamp, setScanTimestamp] = useState<string | null>(null);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const acceptingSuggestion = acceptingId
    ? suggestions.find((s) => s.id === acceptingId) ?? null
    : null;

  const handleConfirmAccept = (id: string, overrides: Partial<TimelineItem>) => {
    acceptSuggestion(id, overrides);
    setAcceptingId(null);
  };

  const handleDefer = (id: string) => {
    const in7days = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
    deferSuggestion(id, in7days);
  };

  const handleScanNow = async () => {
    const countBefore = suggestions.filter(s => s.status === 'pending').length;
    setScanning(true);
    setScanStatus('running');
    try {
      const res = await fetch('/api/scan', { method: 'POST' });
      const data = await res.json();
      if (data.ok) {
        setScanTimestamp(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

        // Push returned suggestions into the store
        if (data.suggestions && data.suggestions.length > 0) {
          const { addSuggestions } = useSuggestionsStore.getState();
          addSuggestions(data.suggestions);
        }

        const countAfter = useSuggestionsStore.getState().suggestions.filter((s: { status: string }) => s.status === 'pending').length;
        const newCount = countAfter - countBefore;
        if (newCount > 0) {
          setScanStatus('complete-new');
          useToastStore.getState().addToast(
            `Scan complete — ${newCount} new suggestion${newCount > 1 ? 's' : ''} found`,
            'success'
          );
        } else {
          setScanStatus('complete-none');
        }
      } else {
        setScanStatus('error');
        useToastStore.getState().addToast('Failed to request scan', 'error');
      }
    } catch {
      setScanStatus('error');
      useToastStore.getState().addToast('Failed to request scan', 'error');
    } finally {
      setScanning(false);
      setTimeout(() => setScanStatus('idle'), 10000);
    }
  };

  // Get existing item title for duplicate warnings
  const itemTitleMap = useMemo(() => {
    const map = new Map<string, string>();
    items.forEach((i) => map.set(i.id, i.title));
    return map;
  }, [items]);

  const selectedItem = selectedItemId ? items.find(i => i.id === selectedItemId) ?? null : null;

  const PRIORITY_ORDER: Record<string, number> = { p0: 0, p1: 1, p2: 2, p3: 3 };

  const filtered = items.filter(item => {
    if (filterStatus && item.status !== filterStatus) return false;
    return true;
  }).sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 9) - (PRIORITY_ORDER[b.priority] ?? 9));

  const VIEW_ICONS: Record<TimelineViewMode, React.ElementType> = {
    gantt: AlignLeft, table: List, board: Columns,
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div
        className="flex items-center gap-3 px-4 py-2 shrink-0 flex-wrap"
        style={{ backgroundColor: 'var(--bg-primary)', borderBottom: '1px solid var(--border)', minHeight: '44px' }}
      >
        {/* View toggle */}
        <SegmentedControl
          options={['gantt', 'table', 'board'] as TimelineViewMode[]}
          value={viewMode}
          onChange={setViewMode}
          renderLabel={(v) => {
            const Icon = VIEW_ICONS[v];
            return (<><Icon size={12} />{v.charAt(0).toUpperCase() + v.slice(1)}</>);
          }}
        />

        {viewMode === 'gantt' && (
          <SegmentedControl
            options={['week', 'month', 'quarter'] as GanttScale[]}
            value={ganttScale}
            onChange={setGanttScale}
            renderLabel={(v) => v.charAt(0).toUpperCase() + v.slice(1)}
          />
        )}

        {/* Status filter */}
        <select
          value={filterStatus ?? ''}
          onChange={e => setFilterStatus(e.target.value || null)}
          className="text-[12px] rounded-[5px] transition-all duration-150 ease-out"
          style={{
            padding: '5px 8px',
            border: '1px solid var(--border-medium)',
            color: 'var(--text-secondary)',
            background: 'var(--bg-primary)',
            boxShadow: 'var(--card-shadow)',
          }}
        >
          <option value="">All statuses</option>
          <option value="not_started">Not Started</option>
          <option value="in_progress">In Progress</option>
          <option value="at_risk">At Risk</option>
          <option value="complete">Complete</option>
        </select>

        <div className="flex-1" />

        {/* Add section */}
        <Button variant="secondary" size="sm" onClick={() => setNewGroupOpen(true)}>
          <Plus size={13} /> Add Section
        </Button>

        <Button variant="primary" size="sm" onClick={() => setNewProjectOpen(true)}>
          <Plus size={13} /> New Project
        </Button>
      </div>

      {/* Suggestions panel */}
      {pendingSuggestions.length >= 0 && (
        <div
          style={{
            borderBottom: '1px solid var(--border)',
            background: pendingSuggestions.length > 0 ? 'var(--warning-bg)' : 'var(--bg-tertiary)',
          }}
        >
          <div
            className="flex items-center gap-2 px-4 py-2"
            style={{ minHeight: 38 }}
          >
            <button
              onClick={() => setSuggestionsExpanded(!suggestionsExpanded)}
              className="flex items-center gap-2 flex-1 text-left transition-colors duration-150"
            >
              <Lightbulb size={14} style={{ color: pendingSuggestions.length > 0 ? '#D97706' : 'var(--text-muted)' }} />
              <span className="text-[13px] font-semibold" style={{ color: pendingSuggestions.length > 0 ? 'var(--warning-text)' : 'var(--text-tertiary)' }}>
                Suggestions
              </span>
              {pendingSuggestions.length > 0 && (
                <span
                  className="inline-flex items-center justify-center rounded-full text-[10px] font-semibold"
                  style={{
                    minWidth: 18,
                    height: 18,
                    padding: '0 5px',
                    background: '#D97706',
                    color: '#FFFFFF',
                  }}
                >
                  {pendingSuggestions.length}
                </span>
              )}
              <span className="text-[11px]" style={{ color: pendingSuggestions.length > 0 ? '#B45309' : 'var(--text-muted)' }}>
                {pendingSuggestions.length > 0
                  ? 'items found from JIRA, Confluence & Slack'
                  : 'No pending suggestions'}
              </span>
              <div className="flex-1" />
              {suggestionsExpanded ? <ChevronUp size={14} style={{ color: 'var(--warning-text)' }} /> : <ChevronDown size={14} style={{ color: 'var(--warning-text)' }} />}
            </button>

            {/* Scan Now button — admin only */}
            <div style={{ position: 'relative' }} className="group/scan">
              <button
                onClick={isAdmin ? handleScanNow : undefined}
                disabled={scanning || !isAdmin}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-[5px] text-[11px] font-semibold transition-all duration-150 shrink-0"
                style={{
                  background: !isAdmin ? 'var(--bg-tertiary)' : scanning ? 'var(--bg-tertiary)' : 'var(--bg-primary)',
                  color: !isAdmin ? 'var(--text-disabled)' : scanning ? 'var(--text-muted)' : 'var(--text-secondary)',
                  border: '1px solid var(--border-medium)',
                  cursor: !isAdmin ? 'default' : scanning ? 'not-allowed' : 'pointer',
                  opacity: !isAdmin ? 0.7 : 1,
                }}
              >
                <RefreshCw size={11} className={scanning ? 'animate-spin' : ''} />
                {scanning ? 'Scanning...' : 'Run Scan'}
              </button>
              <div
                className="invisible group-hover/scan:visible opacity-0 group-hover/scan:opacity-100 transition-opacity duration-150"
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: 6,
                  padding: '8px 12px',
                  background: 'var(--text-primary)',
                  color: 'var(--bg-primary)',
                  fontSize: 11,
                  borderRadius: 6,
                  whiteSpace: 'nowrap',
                  zIndex: 50,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  maxWidth: 260,
                  lineHeight: 1.5,
                }}
              >
                {isAdmin
                  ? 'Scan JIRA, Confluence, and Slack for new suggestions.'
                  : 'Only workspace admins can run scans.'}
              </div>
            </div>
          </div>

          {/* Scan status banner */}
          {scanStatus !== 'idle' && (
            <div
              className="mx-4 mb-2 flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all duration-300"
              style={{
                background:
                  scanStatus === 'running' ? 'var(--info-bg)' :
                  scanStatus === 'complete-new' ? 'var(--success-bg)' :
                  scanStatus === 'complete-none' ? 'var(--warning-bg)' :
                  scanStatus === 'error' ? 'var(--danger-bg)' : 'var(--bg-tertiary)',
                border: `1px solid ${
                  scanStatus === 'running' ? '#BFDBFE' :
                  scanStatus === 'complete-new' ? '#BBF7D0' :
                  scanStatus === 'complete-none' ? '#FDE68A' :
                  scanStatus === 'error' ? '#FECACA' : '#E5E7EB'
                }`,
              }}
            >
              {scanStatus === 'running' && (
                <>
                  <RefreshCw size={13} className="animate-spin shrink-0" style={{ color: '#2563EB' }} />
                  <div>
                    <p className="text-[12px] font-semibold" style={{ color: 'var(--info-text)' }}>Scan running in the background</p>
                    <p className="text-[11px]" style={{ color: '#3B82F6' }}>Checking JIRA, Confluence, and Slack for new items...</p>
                  </div>
                </>
              )}
              {scanStatus === 'complete-new' && (
                <>
                  <Sparkles size={13} className="shrink-0" style={{ color: '#16A34A' }} />
                  <div>
                    <p className="text-[12px] font-semibold" style={{ color: 'var(--success-text)' }}>New suggestions found!</p>
                    <p className="text-[11px]" style={{ color: '#22C55E' }}>Review the new items below.{scanTimestamp && ` Scanned at ${scanTimestamp}.`}</p>
                  </div>
                </>
              )}
              {scanStatus === 'complete-none' && (
                <>
                  <CheckCircle size={13} className="shrink-0" style={{ color: '#D97706' }} />
                  <div>
                    <p className="text-[12px] font-semibold" style={{ color: 'var(--warning-text)' }}>No new suggestions found</p>
                    <p className="text-[11px]" style={{ color: '#D97706' }}>Your roadmap is up to date.{scanTimestamp && ` Scanned at ${scanTimestamp}.`}</p>
                  </div>
                </>
              )}
              {scanStatus === 'error' && (
                <>
                  <XCircle size={13} className="shrink-0" style={{ color: '#DC2626' }} />
                  <div>
                    <p className="text-[12px] font-semibold" style={{ color: 'var(--danger-text)' }}>Scan failed</p>
                    <p className="text-[11px]" style={{ color: '#DC2626' }}>Something went wrong. Please try again.</p>
                  </div>
                </>
              )}
              <button
                onClick={() => setScanStatus('idle')}
                className="ml-auto shrink-0"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 14, padding: 2 }}
              >×</button>
            </div>
          )}

          {suggestionsExpanded && pendingSuggestions.length > 0 && (
            <div
              className="px-4 pb-3 space-y-2"
              style={{ maxHeight: 340, overflowY: 'auto' }}
            >
              {pendingSuggestions.map((suggestion) => (
                <SuggestionCard
                  key={suggestion.id}
                  suggestion={suggestion}
                  groups={groups}
                  existingItemTitle={
                    suggestion.duplicateOfId
                      ? itemTitleMap.get(suggestion.duplicateOfId)
                      : undefined
                  }
                  onAccept={setAcceptingId}
                  onDismiss={dismissSuggestion}
                  onDefer={handleDefer}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Colour Key */}
      <div
        className="flex items-center gap-5 px-4 py-2 shrink-0 flex-wrap"
        style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}
      >
        {/* Section colours — click to edit */}
        {groups.length > 0 && (
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)', letterSpacing: '0.06em' }}>Sections</span>
            {groups.map(g => (
              <button
                key={g.id}
                className="flex items-center gap-1.5 rounded-md px-1.5 py-0.5 transition-all duration-100"
                style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                onClick={() => setEditingGroup(g)}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-subtle)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                title={`Edit "${g.name}" section`}
              >
                <div className="w-[8px] h-[8px] rounded-full" style={{ background: g.color }} />
                <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>{g.name}</span>
                <Pencil size={9} style={{ color: 'var(--text-muted)' }} />
              </button>
            ))}
          </div>
        )}

        <div style={{ width: 1, height: 14, background: 'var(--border-medium)' }} />

        {/* Status colours */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)', letterSpacing: '0.06em' }}>Status</span>
          {[
            { label: 'Not Started', color: 'var(--text-muted)' },
            { label: 'In Progress', color: '#2563EB' },
            { label: 'At Risk', color: '#D97706' },
            { label: 'Complete', color: '#16A34A' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-1.5">
              <div className="w-[6px] h-[6px] rounded-full" style={{ background: s.color }} />
              <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>{s.label}</span>
            </div>
          ))}
        </div>

        <div style={{ width: 1, height: 14, background: 'var(--border-medium)' }} />

        {/* Priority badges */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)', letterSpacing: '0.06em' }}>Priority</span>
          {[
            { label: 'P0', color: '#DC2626', bg: 'var(--danger-bg)' },
            { label: 'P1', color: '#D97706', bg: 'var(--warning-bg)' },
            { label: 'P2', color: '#2563EB', bg: 'var(--info-bg)' },
            { label: 'P3', color: 'var(--text-tertiary)', bg: 'var(--bg-tertiary)' },
          ].map(p => (
            <div key={p.label} className="flex items-center gap-1.5">
              <span
                className="text-[9px] font-bold rounded px-1 py-[1px]"
                style={{ color: p.color, background: p.bg }}
              >
                {p.label}
              </span>
              <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                {p.label === 'P0' ? 'Critical' : p.label === 'P1' ? 'High' : p.label === 'P2' ? 'Medium' : 'Low'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'gantt' && (
          <div className="h-full overflow-auto">
            <GanttChart
              items={filtered}
              groups={groups}
              scale={ganttScale}
              onSelectItem={selectItem}
              onReorder={reorderItems}
              onUpdateItem={updateItem}
              onEditGroup={setEditingGroup}
              onDeleteGroup={(id) => {
                const g = groups.find(g => g.id === id);
                if (g) setDeletingGroup(g);
              }}
            />
          </div>
        )}
        {viewMode === 'table' && (
          <div className="h-full overflow-auto">
            <TimelineTable items={filtered} onSelectItem={selectItem} onReorder={reorderItems} />
          </div>
        )}
        {viewMode === 'board' && (
          <div className="h-full overflow-auto">
            <TimelineBoard items={filtered} onSelectItem={selectItem} />
          </div>
        )}
      </div>

      <ItemDetailPanel item={selectedItem} onClose={() => selectItem(null)} />
      <NewProjectModal open={newProjectOpen} onClose={() => setNewProjectOpen(false)} />
      <NewGroupModal open={newGroupOpen} onClose={() => setNewGroupOpen(false)} />
      <EditGroupModal open={!!editingGroup} onClose={() => setEditingGroup(null)} group={editingGroup} />
      <DeleteGroupModal open={!!deletingGroup} onClose={() => setDeletingGroup(null)} group={deletingGroup} />
      <AcceptSuggestionModal
        open={!!acceptingId}
        onClose={() => setAcceptingId(null)}
        suggestion={acceptingSuggestion}
        groups={groups}
        onConfirm={handleConfirmAccept}
      />

      <ProductTour tourKey="timelines" steps={TIMELINES_TOUR} />
    </div>
  );
}
