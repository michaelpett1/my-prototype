'use client';
import { useEffect } from 'react';
import { X } from 'lucide-react';
import { clsx } from '@/lib/utils/clsx';

interface SidePanelProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: string;
}

export function SidePanel({ open, onClose, title, children, width = '420px' }: SidePanelProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  return (
    <>
      {/* Scrim — subtle, not dark-modal heavy */}
      <div
        className="fixed inset-0 z-20 transition-opacity duration-150 ease-out"
        style={{
          background: 'rgba(0,0,0,0.16)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
        }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside
        className="fixed right-0 top-0 h-full flex flex-col z-30"
        style={{
          width,
          backgroundColor: 'var(--bg-primary)',
          borderLeft: '1px solid var(--border)',
          boxShadow: '0 0 0 1px var(--border-light), -12px 0 40px rgba(0,0,0,0.08)',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          opacity: open ? 1 : 0,
          transition: open
            ? 'transform 220ms cubic-bezier(0.16, 1, 0.3, 1), opacity 150ms ease-out'
            : 'transform 180ms ease-in, opacity 120ms ease-in',
          pointerEvents: open ? 'auto' : 'none',
        }}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 shrink-0"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <h2 className="text-[13px] font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{title}</h2>
          <button
            onClick={onClose}
            className="rounded-[4px] transition-all duration-150 ease-out flex items-center justify-center"
            style={{ width: 24, height: 24, color: 'var(--text-muted)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--border-row)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; }}
            aria-label="Close"
          >
            <X size={14} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">{children}</div>
      </aside>
    </>
  );
}
