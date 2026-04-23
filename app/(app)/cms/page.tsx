'use client';
import { useState, useMemo, useRef, useEffect } from 'react';
import {
  FileText, Plus, Search, MoreHorizontal, Eye, Edit3,
  Copy, Archive, Trash2, Globe, Clock, Send, ChevronDown,
  X, Tag, BookOpen, Megaphone, Newspaper, FileCode2,
  CheckCircle2, AlertCircle, AlignLeft, ExternalLink,
} from 'lucide-react';
import { useCMSStore } from '@/lib/store/cmsStore';
import { useToastStore } from '@/lib/store/toastStore';
import type { CMSContent, CMSContentStatus, CMSContentType } from '@/lib/types';

// ── Helpers ────────────────────────────────────────────────────────────────

const TYPE_META: Record<CMSContentType, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  announcement: { label: 'Announcement', icon: Megaphone, color: '#7C3AED', bg: '#EDE9FE' },
  release_note:  { label: 'Release Note',  icon: FileCode2,  color: '#0369A1', bg: '#E0F2FE' },
  blog_post:     { label: 'Blog Post',     icon: Newspaper,  color: '#15803D', bg: '#DCFCE7' },
  internal_doc:  { label: 'Internal Doc',  icon: BookOpen,   color: '#B45309', bg: '#FEF3C7' },
};

const STATUS_META: Record<CMSContentStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  draft:     { label: 'Draft',       color: '#6B7280', bg: '#F3F4F6',  icon: AlignLeft    },
  in_review: { label: 'In Review',   color: '#D97706', bg: '#FEF3C7',  icon: AlertCircle  },
  published: { label: 'Published',   color: '#15803D', bg: '#DCFCE7',  icon: CheckCircle2 },
  archived:  { label: 'Archived',    color: '#9CA3AF', bg: '#F9FAFB',  icon: Archive      },
};

const STATUS_TABS: Array<{ value: CMSContentStatus | null; label: string }> = [
  { value: null,        label: 'All'        },
  { value: 'draft',     label: 'Draft'      },
  { value: 'in_review', label: 'In Review'  },
  { value: 'published', label: 'Published'  },
  { value: 'archived',  label: 'Archived'   },
];

const TYPE_FILTERS: Array<{ value: CMSContentType | null; label: string }> = [
  { value: null,           label: 'All types'    },
  { value: 'announcement', label: 'Announcements'},
  { value: 'release_note', label: 'Release Notes'},
  { value: 'blog_post',    label: 'Blog Posts'   },
  { value: 'internal_doc', label: 'Internal Docs'},
];

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function relativeDate(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function estimateReadTime(body: string) {
  return Math.max(1, Math.round(body.split(/\s+/).length / 200));
}

// ── Empty content template ─────────────────────────────────────────────────

function emptyContent(): Omit<CMSContent, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    title: '',
    slug: '',
    type: 'announcement',
    status: 'draft',
    body: '',
    excerpt: '',
    authorId: 'user-1',
    authorName: 'You',
    tags: [],
    seoTitle: '',
    seoDescription: '',
    publishedAt: null,
    scheduledAt: null,
    readTime: 1,
  };
}

// ── Main Page ─────────────────────────────────────────────────────────────

export default function CMSPage() {
  const {
    items, filterStatus, filterType, searchQuery,
    setFilterStatus, setFilterType, setSearchQuery,
    addItem, updateItem, deleteItem, duplicateItem,
    publishItem, archiveItem, submitForReview,
  } = useCMSStore();
  const { addToast } = useToastStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [draft, setDraft] = useState<Omit<CMSContent, 'id' | 'createdAt' | 'updatedAt'>>(emptyContent());
  const [editorTab, setEditorTab] = useState<'content' | 'seo' | 'settings'>('content');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [previewId, setPreviewId] = useState<string | null>(null);

  // Close dropdown on outside click
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const panelOpen = isCreating || editingId !== null;
  const previewItem = previewId ? items.find(i => i.id === previewId) : null;

  // Filtered items
  const filtered = useMemo(() => {
    let list = items;
    if (filterStatus) list = list.filter(i => i.status === filterStatus);
    if (filterType) list = list.filter(i => i.type === filterType);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(i =>
        i.title.toLowerCase().includes(q) ||
        i.excerpt.toLowerCase().includes(q) ||
        i.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return [...list].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [items, filterStatus, filterType, searchQuery]);

  const countByStatus = (s: CMSContentStatus | null) =>
    s ? items.filter(i => i.status === s).length : items.length;

  // Open editor
  const openCreate = () => {
    setDraft(emptyContent());
    setEditorTab('content');
    setEditingId(null);
    setIsCreating(true);
  };

  const openEdit = (item: CMSContent) => {
    setDraft({
      title: item.title, slug: item.slug, type: item.type,
      status: item.status, body: item.body, excerpt: item.excerpt,
      authorId: item.authorId, authorName: item.authorName, tags: [...item.tags],
      seoTitle: item.seoTitle, seoDescription: item.seoDescription,
      publishedAt: item.publishedAt, scheduledAt: item.scheduledAt,
      readTime: item.readTime,
    });
    setEditorTab('content');
    setEditingId(item.id);
    setIsCreating(false);
  };

  const closePanel = () => { setIsCreating(false); setEditingId(null); };

  // Save
  const handleSave = (nextStatus?: CMSContentStatus) => {
    const payload = {
      ...draft,
      readTime: estimateReadTime(draft.body),
      status: nextStatus ?? draft.status,
      publishedAt: (nextStatus === 'published' && !draft.publishedAt) ? new Date().toISOString() : draft.publishedAt,
    };
    if (!payload.title.trim()) {
      addToast('Title is required', 'error');
      return;
    }
    if (!payload.slug.trim()) payload.slug = slugify(payload.title);
    if (isCreating) {
      addItem(payload);
      addToast(`"${payload.title}" created`, 'success');
    } else if (editingId) {
      updateItem(editingId, payload);
      addToast(`"${payload.title}" saved`, 'success');
    }
    closePanel();
  };

  const handleDelete = (id: string, title: string) => {
    deleteItem(id);
    addToast(`"${title}" deleted`, 'success');
    setOpenMenuId(null);
  };

  const handleDuplicate = (id: string) => {
    const copy = duplicateItem(id);
    addToast(`Duplicated as "${copy.title}"`, 'success');
    setOpenMenuId(null);
  };

  const handlePublish = (id: string) => {
    publishItem(id);
    addToast('Published successfully', 'success');
    setOpenMenuId(null);
  };

  const handleArchive = (id: string) => {
    archiveItem(id);
    addToast('Archived', 'success');
    setOpenMenuId(null);
  };

  const handleSubmitReview = (id: string) => {
    submitForReview(id);
    addToast('Submitted for review', 'success');
    setOpenMenuId(null);
  };

  // Tag input
  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !draft.tags.includes(t)) {
      setDraft(d => ({ ...d, tags: [...d.tags, t] }));
    }
    setTagInput('');
  };

  const tabBtn = (active: boolean): React.CSSProperties => ({
    padding: '5px 12px',
    fontSize: 12,
    fontWeight: active ? 600 : 500,
    color: active ? 'var(--app-accent, #4f46e5)' : 'var(--text-tertiary)',
    background: active ? 'color-mix(in srgb, var(--app-accent, #4f46e5) 10%, transparent)' : 'transparent',
    border: 'none',
    borderRadius: 5,
    cursor: 'pointer',
    transition: 'all 150ms',
  });

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Main content area */}
      <div
        className="flex-1 overflow-y-auto"
        style={{
          transition: 'margin-right 220ms cubic-bezier(0.16, 1, 0.3, 1)',
          marginRight: panelOpen ? 580 : 0,
        }}
      >
        <div className="p-6 space-y-5" style={{ maxWidth: panelOpen ? '100%' : 1040 }}>

          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <FileText size={18} style={{ color: 'var(--app-accent, #4f46e5)' }} />
                <h1 className="text-[18px] font-semibold leading-tight"
                  style={{ color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                  Content
                </h1>
                <span className="text-[12px] font-medium px-2 py-0.5 rounded-full"
                  style={{ background: 'var(--bg-subtle)', color: 'var(--text-muted)' }}>
                  {items.length} items
                </span>
              </div>
              <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
                Manage announcements, release notes, blog posts, and internal docs.
              </p>
            </div>
            <button
              onClick={openCreate}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[5px] text-[12px] font-semibold transition-all duration-150"
              style={{
                background: 'var(--app-accent, #4f46e5)',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 1px 2px var(--border-medium)',
              }}
            >
              <Plus size={13} />
              New Content
            </button>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-4 gap-3">
            {(['published', 'in_review', 'draft', 'archived'] as CMSContentStatus[]).map(s => {
              const meta = STATUS_META[s];
              const count = countByStatus(s);
              const Icon = meta.icon;
              return (
                <button
                  key={s}
                  onClick={() => setFilterStatus(filterStatus === s ? null : s)}
                  className="flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-150"
                  style={{
                    background: filterStatus === s ? meta.bg : 'var(--bg-primary)',
                    border: `1px solid ${filterStatus === s ? meta.color + '40' : 'var(--border)'}`,
                    cursor: 'pointer',
                    boxShadow: 'var(--card-shadow)',
                  }}
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-[6px]"
                    style={{ background: meta.bg }}>
                    <Icon size={14} style={{ color: meta.color }} />
                  </div>
                  <div>
                    <p className="text-[18px] font-bold leading-none" style={{ color: 'var(--text-primary)' }}>
                      {count}
                    </p>
                    <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {meta.label}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-[320px]">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search content…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-[12px] rounded-[5px] outline-none"
                style={{
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                  boxShadow: 'var(--shadow-xs)',
                }}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Status tabs */}
            <div className="flex items-center gap-1 p-1 rounded-[7px]" style={{ background: 'var(--bg-subtle)' }}>
              {STATUS_TABS.map(({ value, label }) => {
                const active = filterStatus === value;
                const count = countByStatus(value);
                return (
                  <button key={value ?? 'all'} onClick={() => setFilterStatus(value)} style={tabBtn(active)}>
                    {label}
                    <span className="text-[10px] font-mono ml-1" style={{ color: active ? 'var(--app-accent, #4f46e5)' : 'var(--text-muted)' }}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Type filter */}
            <div className="flex items-center gap-1">
              {TYPE_FILTERS.map(({ value, label }) => {
                const active = filterType === value;
                return (
                  <button key={value ?? 'all'} onClick={() => setFilterType(value)} style={tabBtn(active)}>
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Table */}
          <div className="rounded-lg overflow-hidden"
            style={{ border: '1px solid var(--border)', background: 'var(--bg-primary)', boxShadow: 'var(--card-shadow)' }}>
            {/* Table header */}
            <div className="grid text-[11px] font-semibold px-4 py-2.5"
              style={{
                gridTemplateColumns: '1fr 120px 100px 120px 90px 80px',
                borderBottom: '1px solid var(--border)',
                color: 'var(--text-muted)',
                background: 'var(--bg-subtle)',
                letterSpacing: '0.03em',
                textTransform: 'uppercase',
              }}>
              <span>Title</span>
              <span>Type</span>
              <span>Status</span>
              <span>Author</span>
              <span>Updated</span>
              <span className="text-right">Actions</span>
            </div>

            {/* Rows */}
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <FileText size={28} style={{ color: 'var(--text-disabled)', marginBottom: 10 }} />
                <p className="text-[14px] font-semibold" style={{ color: 'var(--text-secondary)' }}>
                  {searchQuery ? 'No results found' : 'No content yet'}
                </p>
                <p className="text-[12px] mt-1" style={{ color: 'var(--text-muted)' }}>
                  {searchQuery ? 'Try a different search term or filter.' : 'Click "New Content" to create your first piece.'}
                </p>
              </div>
            ) : (
              filtered.map((item, idx) => {
                const typeMeta = TYPE_META[item.type];
                const statusMeta = STATUS_META[item.status];
                const TypeIcon = typeMeta.icon;
                const StatusIcon = statusMeta.icon;
                const isLast = idx === filtered.length - 1;
                return (
                  <div
                    key={item.id}
                    className="grid items-center px-4 py-3 group transition-colors duration-100"
                    style={{
                      gridTemplateColumns: '1fr 120px 100px 120px 90px 80px',
                      borderBottom: isLast ? 'none' : '1px solid var(--border-row)',
                      background: editingId === item.id ? 'color-mix(in srgb, var(--app-accent, #4f46e5) 4%, transparent)' : 'transparent',
                    }}
                    onMouseEnter={e => { if (editingId !== item.id) e.currentTarget.style.background = 'var(--bg-hover)'; }}
                    onMouseLeave={e => { if (editingId !== item.id) e.currentTarget.style.background = 'transparent'; }}
                  >
                    {/* Title */}
                    <div className="min-w-0 pr-4">
                      <button
                        onClick={() => openEdit(item)}
                        className="text-left w-full"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                      >
                        <p className="text-[13px] font-semibold truncate transition-colors"
                          style={{ color: 'var(--text-primary)' }}>
                          {item.title}
                        </p>
                        {item.excerpt && (
                          <p className="text-[11px] truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>
                            {item.excerpt}
                          </p>
                        )}
                      </button>
                    </div>

                    {/* Type */}
                    <div>
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium"
                        style={{ background: typeMeta.bg, color: typeMeta.color }}>
                        <TypeIcon size={10} />
                        {typeMeta.label}
                      </span>
                    </div>

                    {/* Status */}
                    <div>
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium"
                        style={{ background: statusMeta.bg, color: statusMeta.color }}>
                        <StatusIcon size={10} />
                        {statusMeta.label}
                      </span>
                    </div>

                    {/* Author */}
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0"
                        style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff' }}>
                        {item.authorName.charAt(0)}
                      </div>
                      <span className="text-[12px] truncate" style={{ color: 'var(--text-secondary)' }}>
                        {item.authorName}
                      </span>
                    </div>

                    {/* Updated */}
                    <div>
                      <span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
                        {relativeDate(item.updatedAt)}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-1" ref={openMenuId === item.id ? menuRef : undefined}>
                      <button
                        onClick={() => setPreviewId(item.id)}
                        className="p-1 rounded transition-opacity opacity-0 group-hover:opacity-100"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                        title="Preview"
                      >
                        <Eye size={13} />
                      </button>
                      <button
                        onClick={() => openEdit(item)}
                        className="p-1 rounded transition-opacity opacity-0 group-hover:opacity-100"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                        title="Edit"
                      >
                        <Edit3 size={13} />
                      </button>
                      {/* More menu */}
                      <div style={{ position: 'relative' }}>
                        <button
                          onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                          className="p-1 rounded transition-opacity opacity-0 group-hover:opacity-100"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                          title="More"
                        >
                          <MoreHorizontal size={13} />
                        </button>
                        {openMenuId === item.id && (
                          <div
                            className="absolute right-0 z-50 rounded-[7px] py-1 min-w-[160px]"
                            style={{
                              top: '100%',
                              marginTop: 4,
                              background: 'var(--bg-primary)',
                              border: '1px solid var(--border)',
                              boxShadow: 'var(--shadow-lg)',
                            }}
                          >
                            {item.status === 'draft' && (
                              <MenuAction icon={Send} label="Submit for Review" onClick={() => handleSubmitReview(item.id)} />
                            )}
                            {(item.status === 'draft' || item.status === 'in_review') && (
                              <MenuAction icon={Globe} label="Publish" onClick={() => handlePublish(item.id)} accent />
                            )}
                            <MenuAction icon={Copy} label="Duplicate" onClick={() => handleDuplicate(item.id)} />
                            {item.status !== 'archived' && (
                              <MenuAction icon={Archive} label="Archive" onClick={() => handleArchive(item.id)} />
                            )}
                            <div style={{ height: 1, background: 'var(--border-row)', margin: '4px 0' }} />
                            <MenuAction
                              icon={Trash2}
                              label="Delete"
                              onClick={() => handleDelete(item.id, item.title)}
                              danger
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {filtered.length > 0 && (
            <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
              Showing {filtered.length} of {items.length} items
            </p>
          )}
        </div>
      </div>

      {/* ── Editor Panel ───────────────────────────────────────────── */}
      <>
        <div
          className="fixed inset-0 z-20 transition-opacity duration-150"
          style={{ background: 'rgba(0,0,0,0.12)', opacity: panelOpen ? 1 : 0, pointerEvents: panelOpen ? 'auto' : 'none' }}
          onClick={closePanel}
        />
        <aside
          className="fixed right-0 top-0 h-full flex flex-col z-30"
          style={{
            width: 580,
            backgroundColor: 'var(--bg-primary)',
            borderLeft: '1px solid var(--border)',
            boxShadow: '-12px 0 40px rgba(0,0,0,0.08)',
            transform: panelOpen ? 'translateX(0)' : 'translateX(100%)',
            transition: panelOpen
              ? 'transform 220ms cubic-bezier(0.16, 1, 0.3, 1)'
              : 'transform 180ms ease-in',
            pointerEvents: panelOpen ? 'auto' : 'none',
          }}
        >
          {/* Panel header */}
          <div className="flex items-center justify-between px-5 py-3 shrink-0"
            style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2">
              <FileText size={14} style={{ color: 'var(--app-accent, #4f46e5)' }} />
              <h2 className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                {isCreating ? 'New Content' : 'Edit Content'}
              </h2>
              {!isCreating && editingId && (() => {
                const item = items.find(i => i.id === editingId);
                if (!item) return null;
                const meta = STATUS_META[item.status];
                return (
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                    style={{ background: meta.bg, color: meta.color }}>
                    {meta.label}
                  </span>
                );
              })()}
            </div>
            <button onClick={closePanel}
              className="flex items-center justify-center w-6 h-6 rounded transition-colors"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <X size={14} />
            </button>
          </div>

          {/* Panel tabs */}
          <div className="flex items-center gap-1 px-5 py-2 shrink-0"
            style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-subtle)' }}>
            {(['content', 'seo', 'settings'] as const).map(t => (
              <button key={t} onClick={() => setEditorTab(t)}
                style={{
                  ...tabBtn(editorTab === t),
                  textTransform: 'capitalize',
                }}>
                {t}
              </button>
            ))}
          </div>

          {/* Panel body */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

            {editorTab === 'content' && (
              <>
                {/* Title */}
                <div>
                  <label className="block text-[11px] font-semibold mb-1" style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Title *
                  </label>
                  <input
                    type="text"
                    value={draft.title}
                    onChange={e => {
                      const title = e.target.value;
                      setDraft(d => ({
                        ...d,
                        title,
                        slug: d.slug === slugify(d.title) ? slugify(title) : d.slug,
                        seoTitle: d.seoTitle === d.title || d.seoTitle === '' ? title : d.seoTitle,
                      }));
                    }}
                    placeholder="Enter a title…"
                    className="w-full px-3 py-2 text-[14px] font-semibold rounded-[5px] outline-none"
                    style={{
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>

                {/* Type + Status row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold mb-1" style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Content Type
                    </label>
                    <div style={{ position: 'relative' }}>
                      <select
                        value={draft.type}
                        onChange={e => setDraft(d => ({ ...d, type: e.target.value as CMSContentType }))}
                        className="w-full px-3 py-2 text-[12px] rounded-[5px] outline-none appearance-none"
                        style={{
                          background: 'var(--bg-secondary)',
                          border: '1px solid var(--border)',
                          color: 'var(--text-primary)',
                          cursor: 'pointer',
                        }}
                      >
                        {Object.entries(TYPE_META).map(([v, m]) => (
                          <option key={v} value={v}>{m.label}</option>
                        ))}
                      </select>
                      <ChevronDown size={11} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold mb-1" style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Slug
                    </label>
                    <input
                      type="text"
                      value={draft.slug}
                      onChange={e => setDraft(d => ({ ...d, slug: e.target.value }))}
                      placeholder="auto-generated"
                      className="w-full px-3 py-2 text-[12px] rounded-[5px] outline-none font-mono"
                      style={{
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-secondary)',
                      }}
                    />
                  </div>
                </div>

                {/* Excerpt */}
                <div>
                  <label className="block text-[11px] font-semibold mb-1" style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Excerpt
                  </label>
                  <textarea
                    value={draft.excerpt}
                    onChange={e => setDraft(d => ({ ...d, excerpt: e.target.value }))}
                    placeholder="Short description shown in listings…"
                    rows={2}
                    className="w-full px-3 py-2 text-[12px] rounded-[5px] outline-none resize-none"
                    style={{
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-primary)',
                      lineHeight: 1.5,
                    }}
                  />
                </div>

                {/* Body */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-semibold" style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Body (Markdown)
                    </label>
                    <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                      ~{estimateReadTime(draft.body)} min read · {draft.body.split(/\s+/).filter(Boolean).length} words
                    </span>
                  </div>
                  <textarea
                    value={draft.body}
                    onChange={e => setDraft(d => ({ ...d, body: e.target.value }))}
                    placeholder={`## Heading\n\nWrite your content in Markdown…`}
                    rows={16}
                    className="w-full px-3 py-2.5 text-[12px] rounded-[5px] outline-none resize-none font-mono"
                    style={{
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-primary)',
                      lineHeight: 1.7,
                    }}
                  />
                </div>
              </>
            )}

            {editorTab === 'seo' && (
              <>
                <div className="rounded-lg p-3 text-[12px]"
                  style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
                  <p className="font-semibold mb-0.5" style={{ color: 'var(--text-secondary)' }}>SEO Preview</p>
                  <p className="text-[13px] font-semibold" style={{ color: '#1a0dab' }}>
                    {draft.seoTitle || draft.title || 'Page title'}
                  </p>
                  <p style={{ color: '#006621', fontSize: 11 }}>
                    northstar.app/blog/{draft.slug || 'your-slug'}
                  </p>
                  <p style={{ color: 'var(--text-muted)', marginTop: 2 }}>
                    {draft.seoDescription || draft.excerpt || 'Meta description will appear here.'}
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold mb-1" style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    SEO Title
                  </label>
                  <input
                    type="text"
                    value={draft.seoTitle}
                    onChange={e => setDraft(d => ({ ...d, seoTitle: e.target.value }))}
                    placeholder={draft.title}
                    className="w-full px-3 py-2 text-[12px] rounded-[5px] outline-none"
                    style={{
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-primary)',
                    }}
                  />
                  <p className="text-[11px] mt-1" style={{ color: draft.seoTitle.length > 60 ? '#DC2626' : 'var(--text-muted)' }}>
                    {draft.seoTitle.length}/60 characters
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold mb-1" style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Meta Description
                  </label>
                  <textarea
                    value={draft.seoDescription}
                    onChange={e => setDraft(d => ({ ...d, seoDescription: e.target.value }))}
                    placeholder={draft.excerpt}
                    rows={3}
                    className="w-full px-3 py-2 text-[12px] rounded-[5px] outline-none resize-none"
                    style={{
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-primary)',
                    }}
                  />
                  <p className="text-[11px] mt-1" style={{ color: draft.seoDescription.length > 160 ? '#DC2626' : 'var(--text-muted)' }}>
                    {draft.seoDescription.length}/160 characters
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold mb-1" style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Canonical URL
                  </label>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-[5px]"
                    style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                    <span className="text-[12px] shrink-0" style={{ color: 'var(--text-muted)' }}>
                      northstar.app/blog/
                    </span>
                    <span className="text-[12px] font-mono" style={{ color: 'var(--text-secondary)' }}>
                      {draft.slug || slugify(draft.title) || 'your-slug'}
                    </span>
                  </div>
                </div>
              </>
            )}

            {editorTab === 'settings' && (
              <>
                {/* Author */}
                <div>
                  <label className="block text-[11px] font-semibold mb-1" style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Author
                  </label>
                  <input
                    type="text"
                    value={draft.authorName}
                    onChange={e => setDraft(d => ({ ...d, authorName: e.target.value }))}
                    className="w-full px-3 py-2 text-[12px] rounded-[5px] outline-none"
                    style={{
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-[11px] font-semibold mb-1" style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {draft.tags.map(tag => (
                      <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium"
                        style={{ background: 'var(--bg-subtle)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                        <Tag size={9} />
                        {tag}
                        <button
                          onClick={() => setDraft(d => ({ ...d, tags: d.tags.filter(t => t !== tag) }))}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', lineHeight: 1, padding: 0 }}>
                          <X size={9} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                      placeholder="Add a tag…"
                      className="flex-1 px-3 py-1.5 text-[12px] rounded-[5px] outline-none"
                      style={{
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-primary)',
                      }}
                    />
                    <button onClick={addTag}
                      className="px-3 py-1.5 text-[12px] font-medium rounded-[5px] transition-colors"
                      style={{
                        background: 'var(--bg-subtle)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                      }}>
                      Add
                    </button>
                  </div>
                </div>

                {/* Schedule */}
                <div>
                  <label className="block text-[11px] font-semibold mb-1" style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Schedule Publish
                  </label>
                  <input
                    type="datetime-local"
                    value={draft.scheduledAt ? draft.scheduledAt.slice(0, 16) : ''}
                    onChange={e => setDraft(d => ({ ...d, scheduledAt: e.target.value ? new Date(e.target.value).toISOString() : null }))}
                    className="w-full px-3 py-2 text-[12px] rounded-[5px] outline-none"
                    style={{
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-primary)',
                    }}
                  />
                  {draft.scheduledAt && (
                    <div className="flex items-center gap-1.5 mt-2 text-[11px]" style={{ color: '#D97706' }}>
                      <Clock size={11} />
                      Scheduled for {new Date(draft.scheduledAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
                      <button onClick={() => setDraft(d => ({ ...d, scheduledAt: null }))}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                        <X size={10} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Publish info */}
                {!isCreating && editingId && (() => {
                  const item = items.find(i => i.id === editingId);
                  if (!item || !item.publishedAt) return null;
                  return (
                    <div className="rounded-lg p-3 text-[12px]"
                      style={{ background: 'var(--success-bg)', border: '1px solid #BBF7D0' }}>
                      <div className="flex items-center gap-1.5 font-semibold mb-0.5" style={{ color: 'var(--success-text)' }}>
                        <Globe size={12} />
                        Published
                      </div>
                      <p style={{ color: '#16A34A' }}>
                        {new Date(item.publishedAt).toLocaleString('en-GB', { dateStyle: 'long', timeStyle: 'short' })}
                      </p>
                    </div>
                  );
                })()}
              </>
            )}
          </div>

          {/* Panel footer */}
          <div className="shrink-0 px-5 py-3 flex items-center justify-between gap-3"
            style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-subtle)' }}>
            <button onClick={closePanel}
              className="px-3 py-1.5 text-[12px] font-medium rounded-[5px] transition-colors"
              style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              Cancel
            </button>
            <div className="flex items-center gap-2">
              {draft.status !== 'published' && (
                <button
                  onClick={() => handleSave('draft')}
                  className="px-3 py-1.5 text-[12px] font-medium rounded-[5px] transition-colors"
                  style={{
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                  }}>
                  Save Draft
                </button>
              )}
              {draft.status === 'draft' && (
                <button
                  onClick={() => handleSave('in_review')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium rounded-[5px]"
                  style={{
                    background: '#FEF3C7',
                    border: '1px solid #FDE68A',
                    color: '#D97706',
                    cursor: 'pointer',
                  }}>
                  <Send size={11} />
                  Submit for Review
                </button>
              )}
              <button
                onClick={() => handleSave('published')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold rounded-[5px]"
                style={{
                  background: 'var(--app-accent, #4f46e5)',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px var(--border-medium)',
                }}>
                <Globe size={11} />
                {draft.status === 'published' ? 'Update & Publish' : 'Publish'}
              </button>
            </div>
          </div>
        </aside>
      </>

      {/* ── Preview Modal ──────────────────────────────────────────── */}
      {previewItem && (
        <>
          <div
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.5)' }}
            onClick={() => setPreviewId(null)}
          />
          <div
            className="fixed z-50 rounded-xl overflow-hidden flex flex-col"
            style={{
              top: '5%', left: '50%', transform: 'translateX(-50%)',
              width: '90%', maxWidth: 720, maxHeight: '90vh',
              background: 'var(--bg-primary)',
              boxShadow: 'var(--shadow-panel)',
              border: '1px solid var(--border)',
            }}
          >
            {/* Preview header */}
            <div className="flex items-center justify-between px-6 py-4 shrink-0"
              style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="flex items-center gap-2">
                <Eye size={14} style={{ color: 'var(--text-muted)' }} />
                <span className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Preview
                </span>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                  style={{ background: STATUS_META[previewItem.status].bg, color: STATUS_META[previewItem.status].color }}>
                  {STATUS_META[previewItem.status].label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setPreviewId(null); openEdit(previewItem); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium rounded-[5px]"
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                  }}>
                  <Edit3 size={11} />
                  Edit
                </button>
                <button onClick={() => setPreviewId(null)}
                  className="flex items-center justify-center w-7 h-7 rounded transition-colors"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Preview body */}
            <div className="flex-1 overflow-y-auto px-10 py-8">
              {/* Type + meta */}
              <div className="flex items-center gap-3 mb-5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                  style={{ background: TYPE_META[previewItem.type].bg, color: TYPE_META[previewItem.type].color }}>
                  {(() => { const Icon = TYPE_META[previewItem.type].icon; return <Icon size={11} />; })()}
                  {TYPE_META[previewItem.type].label}
                </span>
                <span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
                  {previewItem.readTime} min read
                </span>
                {previewItem.publishedAt && (
                  <span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
                    Published {relativeDate(previewItem.publishedAt)}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-[26px] font-bold leading-tight mb-3"
                style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                {previewItem.title}
              </h1>

              {/* Excerpt */}
              {previewItem.excerpt && (
                <p className="text-[15px] leading-relaxed mb-6 pb-6"
                  style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>
                  {previewItem.excerpt}
                </p>
              )}

              {/* Body — rendered as plain text with basic Markdown-like formatting */}
              <div className="text-[14px] leading-relaxed space-y-3" style={{ color: 'var(--text-primary)' }}>
                {previewItem.body.split('\n').map((line, i) => {
                  if (line.startsWith('## ')) return (
                    <h2 key={i} className="text-[18px] font-bold mt-5 mb-1" style={{ color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                      {line.slice(3)}
                    </h2>
                  );
                  if (line.startsWith('### ')) return (
                    <h3 key={i} className="text-[15px] font-semibold mt-4 mb-1" style={{ color: 'var(--text-primary)' }}>
                      {line.slice(4)}
                    </h3>
                  );
                  if (line.startsWith('- ') || line.startsWith('* ')) return (
                    <li key={i} className="ml-4 list-disc" style={{ color: 'var(--text-secondary)' }}>
                      {line.slice(2)}
                    </li>
                  );
                  if (/^\d+\./.test(line)) return (
                    <li key={i} className="ml-4 list-decimal" style={{ color: 'var(--text-secondary)' }}>
                      {line.replace(/^\d+\.\s*/, '')}
                    </li>
                  );
                  if (line.trim() === '') return <div key={i} style={{ height: 6 }} />;
                  return (
                    <p key={i} style={{ color: 'var(--text-secondary)' }}>
                      {line.replace(/\*\*(.*?)\*\*/g, '$1')}
                    </p>
                  );
                })}
              </div>

              {/* Tags */}
              {previewItem.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-8 pt-6" style={{ borderTop: '1px solid var(--border)' }}>
                  {previewItem.tags.map(t => (
                    <span key={t} className="px-2.5 py-1 rounded-full text-[11px] font-medium"
                      style={{ background: 'var(--bg-subtle)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Menu Action helper ─────────────────────────────────────────────────────

function MenuAction({
  icon: Icon, label, onClick, danger, accent,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  danger?: boolean;
  accent?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 w-full px-3 py-1.5 text-[12px] text-left transition-colors"
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: danger ? '#DC2626' : accent ? 'var(--app-accent, #4f46e5)' : 'var(--text-secondary)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = danger ? '#FEF2F2' : accent ? 'var(--accent-subtle, #eef2ff)' : 'var(--bg-hover)';
      }}
      onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
    >
      <Icon size={12} />
      {label}
    </button>
  );
}
