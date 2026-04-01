'use client';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useToastStore } from '@/lib/store/toastStore';

const ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

const COLORS = {
  success: { bg: '#F0FDF4', border: 'rgba(22,163,74,0.2)', text: '#15803D', icon: '#16A34A' },
  error: { bg: '#FEF2F2', border: 'rgba(220,38,38,0.2)', text: '#991B1B', icon: '#DC2626' },
  info: { bg: '#EFF6FF', border: 'rgba(37,99,235,0.2)', text: '#1E40AF', icon: '#2563EB' },
};

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        pointerEvents: 'none',
      }}
    >
      {toasts.map((toast) => {
        const Icon = ICONS[toast.type];
        const c = COLORS[toast.type];
        return (
          <div
            key={toast.id}
            style={{
              pointerEvents: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 14px',
              background: c.bg,
              border: `1px solid ${c.border}`,
              borderRadius: 7,
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              animation: 'toast-in 200ms ease-out',
              minWidth: 260,
              maxWidth: 400,
            }}
          >
            <Icon size={16} style={{ color: c.icon, flexShrink: 0 }} />
            <span style={{ fontSize: 13, fontWeight: 500, color: c.text, flex: 1 }}>
              {toast.message}
            </span>
            <button
              onClick={() => removeToast(toast.id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: c.text, opacity: 0.5 }}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
