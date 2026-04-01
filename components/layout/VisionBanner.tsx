'use client';
import { ChevronUp, ChevronDown, Target } from 'lucide-react';
import { useSettingsStore } from '@/lib/store/settingsStore';

export function VisionBanner() {
  const vision = useSettingsStore((s) => s.workspace.vision);
  const collapsed = useSettingsStore((s) => s.visionCollapsed);
  const setCollapsed = useSettingsStore((s) => s.setVisionCollapsed);

  if (!vision) return null;

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #EEF2FF 0%, #FDF2F8 50%, #FFF7ED 100%)',
        borderBottom: '1px solid var(--border-row)',
        transition: 'all 200ms ease-out',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: collapsed ? '8px 16px' : '12px 16px',
          maxWidth: 1400,
          margin: '0 auto',
          transition: 'padding 200ms ease-out',
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: collapsed ? 24 : 36,
            height: collapsed ? 24 : 36,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #818CF8, #A78BFA)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'all 200ms ease-out',
          }}
          className="shrink-0"
        >
          <Target size={collapsed ? 12 : 16} color="#FFFFFF" strokeWidth={2.5} />
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#6366F1',
              margin: 0,
              lineHeight: 1.4,
              paddingTop: 1,
            }}
          >
            Our Vision
          </p>
          {!collapsed && (
            <p
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: 'var(--text-secondary)',
                margin: '4px 0 0',
                lineHeight: 1.4,
              }}
            >
              {vision}
            </p>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand vision' : 'Collapse vision'}
          style={{
            padding: 4,
            borderRadius: 4,
            border: 'none',
            background: 'transparent',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color 150ms',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-tertiary)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; }}
        >
          {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </button>
      </div>
    </div>
  );
}
