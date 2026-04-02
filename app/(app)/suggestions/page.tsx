'use client';
import { useState, useMemo } from 'react';
import {
  Lightbulb, Filter, Trash2, RotateCcw,
  Inbox, Sparkles, Clock, CheckCircle, XCircle,
  SlidersHorizontal, RefreshCw,
} from 'lucide-react';
import { useToastStore } from '@/lib/store/toastStore';
import { useSuggestionsStore } from '@/lib/store/suggestionsStore';
import { useProjectsStore } from '@/lib/store/projectsStore';
import { SuggestionCard } from '@/components/suggestions/SuggestionCard';
import { AcceptSuggestionModal } from '@/components/suggestions/AcceptSuggestionModal';
import { useIsAdmin } from '@/lib/hooks/useIsAdmin';
import ProductTour from '@/components/ui/ProductTour';
import { SUGGESTIONS_TOUR } from '@/lib/data/tourSteps';
import { ScanSetupGuide } from '@/components/suggestions/ScanSetupGuide';
import { DocumentUpload } from '@/components/suggestions/DocumentUpload';
import type { RoadmapSuggestion, SuggestionSource, SuggestionStatus, TimelineItem } from '@/lib/types';

const SOURCE_TABS: Array<{ value: SuggestionSource | null; label: string }> = [
  { value: null, label: 'All' },
  { value: 'jira', label: 'JIRA' },
  { value: 'confluence', label: 'Confluence' },
  { value: 'slack', label: 'Slack' },
  { value: 'document', label: 'Documents' },
];

const STATUS_TABS: Array<{ value: SuggestionStatus | null; label: string; icon: React.ElementType }> = [
  { value: 'pending', label: 'Pending', icon: Inbox },
  { value: 'deferred', label: 'Deferred', icon: Clock },
  { value: 'accepted', label: 'Accepted', icon: CheckCircle },
  { value: 'dismissed', label: 'Dismissed', icon: XCircle },
];

export default function SuggestionsPage() {
  const {
    suggestions,
    filterSource,
    filterStatus,
    setFilterSource,
    setFilterStatus,
    acceptSuggestion,
    dismissSuggestion,
    deferSuggestion,
    bulkDismiss,
    clearResolved,
  } = useSuggestionsStore();

  const items = useProjectsStore((s) => s.items);
  const groups = useProjectsStore((s) => s.groups);
  const isAdmin = useIsAdmin();

  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [showScanSetup, setShowScanSetup] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !localStorage.getItem('northstar-scan-setup-dismissed');
  });
  const [scanStatus, setScanStatus] = useState<'idle' | 'running' | 'complete-new' | 'complete-none' | 'complete-existing' | 'error'>('idle');
  const [scanTimestamp, setScanTimestamp] = useState<string | null>(null);

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
        const scannedTotal = data.summary?.total ?? data.suggestions?.length ?? 0;
        if (newCount > 0) {
          setScanStatus('complete-new');
          useToastStore.getState().addToast(
            `Scan complete — ${newCount} new suggestion${newCount > 1 ? 's' : ''} found from ${data.summary?.jira ?? 0} JIRA, ${data.summary?.confluence ?? 0} Confluence, ${data.summary?.slack ?? 0} Slack`,
            'success'
          );
        } else if (scannedTotal > 0) {
          // Items were found but all already exist in the store
          setScanStatus('complete-existing');
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

  // Default to pending
  const activeStatus = filterStatus ?? 'pending';

  const filtered = useMemo(() => {
    let list = suggestions;
    if (activeStatus) list = list.filter((s) => s.status === activeStatus);
    if (filterSource) list = list.filter((s) => s.source.type === filterSource);

    // Re-surface deferred items whose date has passed
    if (activeStatus === 'pending') {
      const now = new Date().toISOString().split('T')[0];
      const resurfaced = suggestions.filter(
        (s) => s.status === 'deferred' && s.deferredUntil && s.deferredUntil <= now
      );
      list = [...list, ...resurfaced];
    }

    // Sort by relevance (highest first), then by date
    return list.sort((a, b) => b.relevanceScore - a.relevanceScore || b.scannedAt.localeCompare(a.scannedAt));
  }, [suggestions, activeStatus, filterSource]);

  const pendingCount = suggestions.filter((s) => s.status === 'pending').length;
  const deferredCount = suggestions.filter((s) => s.status === 'deferred').length;

  const countByStatus = (status: SuggestionStatus) =>
    suggestions.filter((s) => s.status === status).length;

  const countBySource = (source: SuggestionSource) =>
    suggestions.filter((s) => s.source.type === source && (activeStatus ? s.status === activeStatus : true)).length;

  const acceptingSuggestion = acceptingId
    ? suggestions.find((s) => s.id === acceptingId) ?? null
    : null;

  const handleAccept = (id: string) => {
    setAcceptingId(id);
  };

  const handleConfirmAccept = (id: string, overrides: Partial<TimelineItem>) => {
    acceptSuggestion(id, overrides);
    setAcceptingId(null);
  };

  const handleDefer = (id: string) => {
    // Defer by 7 days as default
    const in7days = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
    deferSuggestion(id, in7days);
  };

  const handleDismissAll = () => {
    const ids = filtered.filter((s) => s.status === 'pending').map((s) => s.id);
    if (ids.length > 0) bulkDismiss(ids);
  };

  // Get existing item title for duplicate warnings
  const itemTitleMap = useMemo(() => {
    const map = new Map<string, string>();
    items.forEach((i) => map.set(i.id, i.title));
    return map;
  }, [items]);

  const tabBtnStyle = (active: boolean): React.CSSProperties => ({
    padding: '5px 12px',
    fontSize: '12px',
    fontWeight: active ? 600 : 500,
    color: active ? 'var(--app-accent, #2563EB)' : 'var(--text-tertiary)',
    background: active ? 'color-mix(in srgb, var(--app-accent, #2563EB) 10%, transparent)' : 'transparent',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'all 150ms',
  });

  return (
    <div className="p-6 space-y-5" style={{ maxWidth: 960 }}>

      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Lightbulb size={18} style={{ color: 'var(--app-accent, #2563EB)' }} />
            <h1
              className="text-[18px] font-semibold leading-tight dm-heading"
              style={{ color: 'var(--text-primary)', letterSpacing: '-0.01em' }}
            >
              Roadmap Suggestions
            </h1>
            {pendingCount > 0 && (
              <span
                className="inline-flex items-center justify-center rounded-full text-[11px] font-semibold"
                style={{
                  minWidth: 20,
                  height: 20,
                  padding: '0 6px',
                  background: 'var(--app-accent, #2563EB)',
                  color: 'var(--bg-primary)',
                }}
              >
                {pendingCount}
              </span>
            )}
          </div>
          <p className="text-[13px] dm-text-muted" style={{ color: 'var(--text-muted)' }}>
            AI-powered suggestions from JIRA, Confluence, and Slack. Review and add to your roadmap.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div style={{ position: 'relative' }} className="group/scan">
            <button
              onClick={isAdmin ? handleScanNow : undefined}
              disabled={scanning || !isAdmin}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[5px] text-[12px] font-semibold transition-all duration-150"
              style={{
                background: !isAdmin ? 'var(--text-disabled)' : scanning ? 'var(--bg-tertiary)' : 'var(--app-accent, #2563EB)',
                color: !isAdmin ? 'var(--text-muted)' : scanning ? 'var(--text-muted)' : 'var(--bg-primary)',
                border: 'none',
                cursor: !isAdmin ? 'default' : scanning ? 'not-allowed' : 'pointer',
                boxShadow: !isAdmin || scanning ? 'none' : '0 1px 2px var(--border-medium)',
                opacity: !isAdmin ? 0.7 : 1,
              }}
            >
              <RefreshCw size={12} className={scanning ? 'animate-spin' : ''} />
              {scanning ? 'Scanning...' : 'Run Scan'}
            </button>
            {/* Tooltip for non-admins */}
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
                lineHeight: 1.5,
                maxWidth: 260,
              }}
            >
              {isAdmin
                ? 'Scan JIRA, Confluence, and Slack for new roadmap suggestions.'
                : 'Only workspace admins can run scans. Contact your admin to trigger a scan.'}
            </div>
          </div>
          {filtered.length > 0 && activeStatus === 'pending' && (
            <button
              onClick={handleDismissAll}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-[5px] text-[12px] font-medium transition-all duration-150"
              style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}
            >
              <Trash2 size={12} />
              Dismiss all
            </button>
          )}
          {(countByStatus('accepted') > 0 || countByStatus('dismissed') > 0) && (
            <button
              onClick={clearResolved}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-[5px] text-[12px] font-medium transition-all duration-150"
              style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}
            >
              <RotateCcw size={12} />
              Clear resolved
            </button>
          )}
        </div>
      </div>

      {/* Scan status banner */}
      {scanStatus !== 'idle' && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300"
          style={{
            background:
              scanStatus === 'running' ? 'var(--info-bg)' :
              scanStatus === 'complete-new' ? 'var(--success-bg)' :
              scanStatus === 'complete-existing' ? 'var(--info-bg)' :
              scanStatus === 'complete-none' ? 'var(--warning-bg)' :
              scanStatus === 'error' ? 'var(--danger-bg)' : 'var(--bg-tertiary)',
            border: `1px solid ${
              scanStatus === 'running' ? '#BFDBFE' :
              scanStatus === 'complete-new' ? '#BBF7D0' :
              scanStatus === 'complete-existing' ? '#BFDBFE' :
              scanStatus === 'complete-none' ? '#FDE68A' :
              scanStatus === 'error' ? '#FECACA' : 'var(--text-disabled)'
            }`,
          }}
        >
          {scanStatus === 'running' && (
            <>
              <RefreshCw size={15} className="animate-spin shrink-0" style={{ color: '#2563EB' }} />
              <div>
                <p className="text-[13px] font-semibold" style={{ color: 'var(--info-text)' }}>
                  Scan running in the background
                </p>
                <p className="text-[12px]" style={{ color: '#3B82F6' }}>
                  Checking JIRA, Confluence, and Slack for new items. This may take a moment...
                </p>
              </div>
            </>
          )}
          {scanStatus === 'complete-new' && (
            <>
              <Sparkles size={15} className="shrink-0" style={{ color: '#16A34A' }} />
              <div>
                <p className="text-[13px] font-semibold" style={{ color: 'var(--success-text)' }}>
                  New suggestions found!
                </p>
                <p className="text-[12px]" style={{ color: '#22C55E' }}>
                  Review the new items below.{scanTimestamp && ` Last scanned at ${scanTimestamp}.`}
                </p>
              </div>
            </>
          )}
          {scanStatus === 'complete-existing' && (
            <>
              <CheckCircle size={15} className="shrink-0" style={{ color: '#2563EB' }} />
              <div>
                <p className="text-[13px] font-semibold" style={{ color: 'var(--info-text)' }}>
                  All scanned items already tracked
                </p>
                <p className="text-[12px]" style={{ color: '#3B82F6' }}>
                  Items were found in your sources, but they&apos;re already in your suggestions list. Review them in the tabs above.{scanTimestamp && ` Scanned at ${scanTimestamp}.`}
                </p>
              </div>
            </>
          )}
          {scanStatus === 'complete-none' && (
            <>
              <CheckCircle size={15} className="shrink-0" style={{ color: '#D97706' }} />
              <div>
                <p className="text-[13px] font-semibold" style={{ color: 'var(--warning-text)' }}>
                  No new suggestions found
                </p>
                <p className="text-[12px]" style={{ color: '#D97706' }}>
                  Your roadmap is up to date. All sources were scanned — nothing new to flag.{scanTimestamp && ` Scanned at ${scanTimestamp}.`}
                </p>
              </div>
            </>
          )}
          {scanStatus === 'error' && (
            <>
              <XCircle size={15} className="shrink-0" style={{ color: '#DC2626' }} />
              <div>
                <p className="text-[13px] font-semibold" style={{ color: 'var(--danger-text)' }}>
                  Scan failed
                </p>
                <p className="text-[12px]" style={{ color: '#DC2626' }}>
                  Something went wrong. Please try again.
                </p>
              </div>
            </>
          )}
          <button
            onClick={() => setScanStatus('idle')}
            className="ml-auto shrink-0"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              fontSize: 16,
              lineHeight: 1,
              padding: 4,
            }}
            title="Dismiss"
          >
            ×
          </button>
        </div>
      )}

      {/* Status tabs */}
      <div
        className="flex items-center gap-1 p-1 rounded-[7px]"
        style={{ background: 'var(--bg-subtle)' }}
      >
        {STATUS_TABS.map(({ value, label, icon: Icon }) => {
          const active = activeStatus === value;
          const count = value ? countByStatus(value) : suggestions.length;
          return (
            <button
              key={value ?? 'all'}
              onClick={() => setFilterStatus(value)}
              className="flex items-center gap-1.5 transition-all duration-150"
              style={{
                ...tabBtnStyle(active),
                boxShadow: active ? '0 1px 3px var(--border-row)' : 'none',
              }}
            >
              <Icon size={13} />
              {label}
              <span
                className="text-[10px] font-mono ml-0.5"
                style={{ color: active ? 'var(--app-accent, #2563EB)' : 'var(--text-muted)' }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Source filter row */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          {SOURCE_TABS.map(({ value, label }) => {
            const active = filterSource === value;
            const count = value ? countBySource(value) : filtered.length;
            return (
              <button
                key={value ?? 'all'}
                onClick={() => setFilterSource(value)}
                style={tabBtnStyle(active)}
              >
                {label}
                {value && (
                  <span
                    className="text-[10px] font-mono ml-1"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Scan setup guide — shown for admins on first visit */}
      {showScanSetup && isAdmin && suggestions.length === 0 && (
        <ScanSetupGuide onDismiss={() => setShowScanSetup(false)} />
      )}

      {/* Document upload — always visible */}
      <DocumentUpload />

      {/* Suggestion cards */}
      {filtered.length === 0 ? (
        <EmptyState status={activeStatus} />
      ) : (
        <div className="space-y-3">
          {filtered.map((suggestion) => (
            <SuggestionCard
              key={suggestion.id}
              suggestion={suggestion}
              groups={groups}
              existingItemTitle={
                suggestion.duplicateOfId
                  ? itemTitleMap.get(suggestion.duplicateOfId)
                  : undefined
              }
              onAccept={handleAccept}
              onDismiss={dismissSuggestion}
              onDefer={handleDefer}
            />
          ))}
        </div>
      )}

      {/* Accept modal */}
      <AcceptSuggestionModal
        open={!!acceptingId}
        onClose={() => setAcceptingId(null)}
        suggestion={acceptingSuggestion}
        groups={groups}
        onConfirm={handleConfirmAccept}
      />

      <ProductTour tourKey="suggestions" steps={SUGGESTIONS_TOUR} />
    </div>
  );
}

/* ── Empty state ─────────────────────────────────────────────── */
function EmptyState({ status }: { status: string }) {
  const messages: Record<string, { title: string; desc: string; icon: React.ElementType }> = {
    pending: {
      title: 'No pending suggestions',
      desc: 'When Claude Cowork scans JIRA, Confluence, and Slack, suggestions will appear here for your review.',
      icon: Sparkles,
    },
    deferred: {
      title: 'No deferred suggestions',
      desc: 'Items you defer will appear here until their review date.',
      icon: Clock,
    },
    accepted: {
      title: 'No accepted suggestions yet',
      desc: 'Suggestions you accept become roadmap items.',
      icon: CheckCircle,
    },
    dismissed: {
      title: 'No dismissed suggestions',
      desc: 'Dismissed suggestions appear here for reference.',
      icon: XCircle,
    },
  };

  const msg = messages[status] ?? messages.pending;
  const Icon = msg.icon;

  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div
        className="flex items-center justify-center w-12 h-12 rounded-full mb-4"
        style={{ background: 'var(--bg-subtle)' }}
      >
        <Icon size={22} style={{ color: 'var(--text-muted)' }} />
      </div>
      <h3 className="text-[14px] font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
        {msg.title}
      </h3>
      <p className="text-[13px] text-center max-w-sm" style={{ color: 'var(--text-muted)' }}>
        {msg.desc}
      </p>

      {status === 'pending' && (
        <div
          className="mt-6 rounded-[7px] p-4 max-w-md"
          style={{ background: 'var(--info-bg)', border: '1px solid #BAE6FD' }}
        >
          <h4 className="text-[12px] font-semibold mb-2" style={{ color: 'var(--info-text)' }}>
            How it works
          </h4>
          <ol className="space-y-1.5 text-[12px] leading-relaxed" style={{ color: 'var(--info-text)' }}>
            <li className="flex items-start gap-2">
              <span className="font-mono font-semibold shrink-0" style={{ color: 'var(--info-text)' }}>1.</span>
              Claude Cowork scans JIRA, Confluence, and Slack on a schedule
            </li>
            <li className="flex items-start gap-2">
              <span className="font-mono font-semibold shrink-0" style={{ color: 'var(--info-text)' }}>2.</span>
              New items are checked against your roadmap for duplicates
            </li>
            <li className="flex items-start gap-2">
              <span className="font-mono font-semibold shrink-0" style={{ color: 'var(--info-text)' }}>3.</span>
              Relevant suggestions appear here for you to accept, defer, or dismiss
            </li>
          </ol>
        </div>
      )}
    </div>
  );
}
