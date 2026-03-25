'use client';
import { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const maxW = size === 'sm' ? '400px' : size === 'lg' ? '640px' : '480px';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Scrim */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,0.30)' }}
        onClick={onClose}
      />

      {/* Dialog */}
      <div
        className="relative w-full flex flex-col"
        style={{
          maxWidth: maxW,
          backgroundColor: '#FFFFFF',
          borderRadius: '11px',
          boxShadow: '0 0 0 1px rgba(0,0,0,0.07), 0 20px 60px rgba(0,0,0,0.14)',
          animation: 'modal-in 180ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <style>{`
          @keyframes modal-in {
            from { transform: scale(0.97) translateY(4px); opacity: 0; }
            to   { transform: scale(1) translateY(0); opacity: 1; }
          }
        `}</style>

        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ borderBottom: '1px solid rgba(0,0,0,0.07)' }}
        >
          <h2 id="modal-title" className="text-[13px] font-semibold" style={{ color: '#1C1917' }}>{title}</h2>
          <button
            onClick={onClose}
            className="rounded-[4px] flex items-center justify-center transition-all duration-150"
            style={{ width: 24, height: 24, color: '#9CA3AF' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,0,0,0.06)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
            aria-label="Close"
          >
            <X size={14} />
          </button>
        </div>

        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
