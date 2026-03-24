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

export function SidePanel({ open, onClose, title, children, width = 'w-96' }: SidePanelProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  return (
    <>
      {open && <div className="fixed inset-0 z-20 bg-black/20" onClick={onClose} />}
      <aside
        className={clsx(
          'fixed right-0 top-0 h-full bg-white border-l border-slate-200 shadow-xl z-30 flex flex-col transition-panel',
          width,
          open ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'
        )}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 shrink-0">
          <h2 className="text-sm font-semibold text-slate-800 truncate">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Close panel"
          >
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </aside>
    </>
  );
}
