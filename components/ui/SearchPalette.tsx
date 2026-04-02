'use client';
import { useState, useEffect, useRef } from 'react';
import { Search, ArrowRight, LayoutDashboard, GitBranch, Map, Target, Settings, Lightbulb } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useProjectsStore } from '@/lib/store/projectsStore';
import { useOKRsStore } from '@/lib/store/okrsStore';

interface SearchResult {
  id: string;
  label: string;
  sublabel?: string;
  href: string;
  icon: React.ElementType;
}

const PAGES: SearchResult[] = [
  { id: 'nav-dash', label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { id: 'nav-time', label: 'Timelines', href: '/timelines', icon: GitBranch },
  { id: 'nav-road', label: 'Visual Roadmap', href: '/roadmap', icon: Map },
  { id: 'nav-okrs', label: 'OKRs', href: '/okrs', icon: Target },
  { id: 'nav-sugg', label: 'Suggestions', href: '/suggestions', icon: Lightbulb },
  { id: 'nav-sett', label: 'Settings', href: '/settings', icon: Settings },
];

export function SearchPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const items = useProjectsStore((s) => s.items);
  const objectives = useOKRsStore((s) => s.objectives);

  // Build results
  const results: SearchResult[] = [];
  const q = query.toLowerCase().trim();

  if (!q) {
    results.push(...PAGES);
  } else {
    // Pages
    PAGES.forEach((p) => {
      if (p.label.toLowerCase().includes(q)) results.push(p);
    });
    // Timeline items
    items.forEach((item) => {
      if (item.title.toLowerCase().includes(q)) {
        results.push({
          id: `ti-${item.id}`,
          label: item.title,
          sublabel: `${item.type} · ${item.status.replace('_', ' ')}`,
          href: '/timelines',
          icon: GitBranch,
        });
      }
    });
    // Objectives
    objectives.forEach((obj) => {
      if (obj.title.toLowerCase().includes(q)) {
        results.push({
          id: `obj-${obj.id}`,
          label: obj.title,
          sublabel: `Objective · ${obj.period}`,
          href: '/okrs',
          icon: Target,
        });
      }
    });
  }

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      router.push(results[selectedIndex].href);
      onClose();
    } else if (e.key === 'Escape') {
      onClose();
    }
  }

  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9990,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: 120,
      }}
    >
      {/* Scrim */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'var(--bg-overlay)',
        }}
      />

      {/* Palette */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 520,
          background: 'var(--bg-primary)',
          borderRadius: 11,
          boxShadow: '0 16px 48px rgba(0,0,0,0.15)',
          overflow: 'hidden',
          animation: 'modal-in 150ms ease-out',
        }}
        onKeyDown={handleKeyDown}
      >
        {/* Search input */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 16px',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <Search size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages, projects, objectives..."
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: 14,
              color: 'var(--text-primary)',
              background: 'transparent',
            }}
          />
          <kbd
            style={{
              fontSize: 11,
              fontFamily: 'ui-monospace, monospace',
              padding: '2px 6px',
              background: 'var(--border-row)',
              borderRadius: 4,
              color: 'var(--text-muted)',
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div style={{ maxHeight: 320, overflowY: 'auto', padding: '4px 0' }}>
          {results.length === 0 ? (
            <div style={{ padding: '24px 16px', textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
              No results found
            </div>
          ) : (
            results.slice(0, 10).map((result, idx) => {
              const Icon = result.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={result.id}
                  onClick={() => {
                    router.push(result.href);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    width: '100%',
                    padding: '8px 16px',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    background: isSelected ? 'var(--bg-tertiary)' : 'transparent',
                    transition: 'background 100ms',
                  }}
                >
                  <Icon size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>{result.label}</p>
                    {result.sublabel && (
                      <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>{result.sublabel}</p>
                    )}
                  </div>
                  {isSelected && <ArrowRight size={12} style={{ color: 'var(--text-muted)' }} />}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
