'use client';
import { useState } from 'react';
import {
  Check, X, Clock, ChevronDown, ChevronUp,
  ExternalLink, AlertTriangle, Sparkles,
} from 'lucide-react';
import type { RoadmapSuggestion, Priority, TimelineGroup } from '@/lib/types';
import { PriorityBadge } from '@/components/ui/Badge';

// ── Source badge ──────────────────────────────────────────────────────
const SOURCE_CONFIG: Record<string, { label: string; bg: string; text: string; icon: string }> = {
  jira:       { label: 'JIRA',       bg: '#DEEBFF', text: '#0052CC', icon: '🔵' },
  confluence: { label: 'Confluence', bg: '#EAE6FF', text: '#403294', icon: '📄' },
  slack:      { label: 'Slack',      bg: '#F3E8FF', text: '#6B21A8', icon: '💬' },
  document:   { label: 'Document',   bg: '#FEF3C7', text: '#92400E', icon: '📎' },
};

function SourceBadge({ type }: { type: string }) {
  const c = SOURCE_CONFIG[type] ?? SOURCE_CONFIG.jira;
  return (
    <span
      className="inline-flex items-center gap-1 rounded-[3px] font-semibold whitespace-nowrap"
      style={{ padding: '2px 7px', fontSize: '11px', background: c.bg, color: c.text }}
    >
      <span style={{ fontSize: '10px' }}>{c.icon}</span>
      {c.label}
    </span>
  );
}

function RelevanceBar({ score }: { score: number }) {
  const color = score >= 75 ? '#16A34A' : score >= 50 ? '#D97706' : '#9CA3AF';
  return (
    <div className="flex items-center gap-2">
      <div
        className="relative h-[4px] rounded-full overflow-hidden flex-1"
        style={{ background: 'var(--border-row)', maxWidth: 80 }}
      >
        <div
          className="absolute left-0 top-0 bottom-0 rounded-full"
          style={{ width: `${score}%`, background: color }}
        />
      </div>
      <span className="text-[11px] font-mono" style={{ color }}>{score}%</span>
    </div>
  );
}

interface SuggestionCardProps {
  suggestion: RoadmapSuggestion;
  groups: TimelineGroup[];
  existingItemTitle?: string;
  onAccept: (id: string) => void;
  onDismiss: (id: string) => void;
  onDefer: (id: string) => void;
}

export function SuggestionCard({
  suggestion,
  groups,
  existingItemTitle,
  onAccept,
  onDismiss,
  onDefer,
}: SuggestionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const src = suggestion.source;

  const sourceUrl =
    src.type === 'jira' ? src.jiraUrl
    : src.type === 'confluence' ? src.confluenceUrl
    : src.type === 'slack' ? src.slackMessageUrl
    : undefined;

  const groupName = groups.find((g) => g.id === suggestion.suggestedGroupId)?.name;

  return (
    <div
      className="bg-white rounded-[7px] overflow-hidden transition-all duration-150"
      style={{
        border: '1px solid var(--border)',
        boxShadow: 'var(--card-shadow)',
      }}
    >
      {/* Main row */}
      <div className="px-4 py-3">
        <div className="flex items-start gap-3">
          {/* Left: content */}
          <div className="flex-1 min-w-0">
            {/* Title + badges row */}
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <SourceBadge type={src.type} />
              <PriorityBadge priority={suggestion.suggestedPriority} />
              {suggestion.suggestedType !== 'task' && (
                <span
                  className="inline-flex items-center rounded-[3px] font-semibold whitespace-nowrap"
                  style={{ padding: '2px 6px', fontSize: '11px', background: 'var(--bg-subtle)', color: 'var(--text-tertiary)' }}
                >
                  {suggestion.suggestedType}
                </span>
              )}
              {groupName && (
                <span
                  className="inline-flex items-center rounded-[3px] whitespace-nowrap"
                  style={{ padding: '2px 6px', fontSize: '11px', background: 'var(--bg-subtle)', color: 'var(--text-muted)' }}
                >
                  {groupName}
                </span>
              )}
            </div>

            <h3
              className="text-[14px] font-semibold leading-snug mb-1"
              style={{ color: 'var(--text-primary)' }}
            >
              {suggestion.title}
            </h3>

            {suggestion.description && (
              <p
                className="text-[13px] leading-relaxed mb-2"
                style={{ color: 'var(--text-tertiary)', display: '-webkit-box', WebkitLineClamp: expanded ? 99 : 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
              >
                {suggestion.description}
              </p>
            )}

            {/* Relevance + duplicate warning */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-1.5">
                <Sparkles size={12} style={{ color: '#D97706' }} />
                <span className="text-[11px] font-medium" style={{ color: 'var(--text-tertiary)' }}>Relevance</span>
                <RelevanceBar score={suggestion.relevanceScore} />
              </div>

              {suggestion.duplicateOfId && suggestion.duplicateConfidence > 40 && (
                <div className="flex items-center gap-1">
                  <AlertTriangle size={12} style={{ color: '#D97706' }} />
                  <span className="text-[11px]" style={{ color: '#D97706' }}>
                    {suggestion.duplicateConfidence}% match
                    {existingItemTitle ? `: "${existingItemTitle}"` : ''}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-1 shrink-0 mt-1">
            {suggestion.status === 'accepted' ? (
              <span
                className="flex items-center gap-1 rounded-[5px] px-2.5 py-1.5 text-[12px] font-semibold"
                style={{
                  background: 'var(--bg-tertiary)',
                  color: 'var(--text-muted)',
                  cursor: 'default',
                }}
              >
                <Check size={13} />
                Accepted
              </span>
            ) : (
              <>
                <button
                  onClick={() => onAccept(suggestion.id)}
                  className="flex items-center gap-1 rounded-[5px] px-2.5 py-1.5 text-[12px] font-semibold transition-all duration-150"
                  style={{
                    background: 'var(--app-accent, #4f46e5)',
                    color: '#FFFFFF',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.9'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
                >
                  <Check size={13} />
                  Accept
                </button>
                <button
                  onClick={() => onDefer(suggestion.id)}
                  className="flex items-center gap-1 rounded-[5px] px-2 py-1.5 text-[12px] font-medium transition-all duration-150"
                  style={{ color: 'var(--text-tertiary)', border: '1px solid var(--border-medium)' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,0,0,0.03)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                  title="Defer for later"
                >
                  <Clock size={13} />
                </button>
                <button
                  onClick={() => onDismiss(suggestion.id)}
                  className="flex items-center gap-1 rounded-[5px] px-2 py-1.5 text-[12px] font-medium transition-all duration-150"
                  style={{ color: 'var(--text-muted)', border: '1px solid var(--border-medium)' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,0,0,0.03)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                  title="Dismiss"
                >
                  <X size={13} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 mt-2 text-[11px] font-medium transition-colors duration-150"
          style={{ color: 'var(--text-muted)' }}
        >
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          {expanded ? 'Less' : 'Source details'}
        </button>
      </div>

      {/* Expanded source context */}
      {expanded && (
        <div
          className="px-4 py-3"
          style={{ background: 'var(--bg-tertiary)', borderTop: '1px solid var(--border-row)' }}
        >
          <div className="space-y-1.5">
            {src.type === 'jira' && (
              <>
                {src.jiraKey && (
                  <ContextRow label="Ticket" value={src.jiraKey} />
                )}
                {src.jiraStatus && <ContextRow label="Status" value={src.jiraStatus} />}
                {src.jiraAssignee && <ContextRow label="Assignee" value={src.jiraAssignee} />}
                {src.jiraPriority && <ContextRow label="Priority" value={src.jiraPriority} />}
              </>
            )}
            {src.type === 'confluence' && (
              <>
                {src.confluenceSpaceKey && <ContextRow label="Space" value={src.confluenceSpaceKey} />}
                {src.confluenceAuthor && <ContextRow label="Author" value={src.confluenceAuthor} />}
              </>
            )}
            {src.type === 'slack' && (
              <>
                {src.slackChannelName && <ContextRow label="Channel" value={`#${src.slackChannelName}`} />}
                {src.slackAuthor && <ContextRow label="From" value={src.slackAuthor} />}
                {src.slackSnippet && (
                  <div className="mt-2 p-2 rounded-[4px]" style={{ background: 'var(--bg-subtle)' }}>
                    <p className="text-[12px] leading-relaxed italic" style={{ color: 'var(--text-tertiary)' }}>
                      &ldquo;{src.slackSnippet}&rdquo;
                    </p>
                  </div>
                )}
              </>
            )}
            {src.type === 'document' && (
              <>
                {src.documentFileName && <ContextRow label="File" value={src.documentFileName} />}
                {src.documentFileType && <ContextRow label="Type" value={src.documentFileType.toUpperCase()} />}
              </>
            )}
            {sourceUrl && (
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-1 text-[12px] font-medium transition-colors duration-150"
                style={{ color: 'var(--app-accent, #2563EB)' }}
              >
                Open source <ExternalLink size={11} />
              </a>
            )}
          </div>

          <p className="text-[11px] mt-2 font-mono" style={{ color: 'var(--text-muted)' }}>
            Scanned {new Date(suggestion.scannedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      )}
    </div>
  );
}

function ContextRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] font-semibold uppercase tracking-wide shrink-0" style={{ color: 'var(--text-muted)', width: 70, letterSpacing: '0.05em' }}>
        {label}
      </span>
      <span className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>{value}</span>
    </div>
  );
}
