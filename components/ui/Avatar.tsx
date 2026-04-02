import { clsx } from '@/lib/utils/clsx';
import { useSettingsStore } from '@/lib/store/settingsStore';

interface AvatarProps {
  ownerId?: string;
  src?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

const SIZE_MAP = {
  xs: { cls: 'w-5 h-5', px: 20 },
  sm: { cls: 'w-6 h-6', px: 24 },
  md: { cls: 'w-7 h-7', px: 28 },
  lg: { cls: 'w-9 h-9', px: 36 },
};

export function Avatar({ ownerId, src, name, size = 'sm' }: AvatarProps) {
  const teamMembers = useSettingsStore(s => s.teamMembers);
  const member = ownerId ? teamMembers.find((m) => m.id === ownerId) : null;
  const avatarSrc = src ?? member?.avatarUrl;
  const displayName = name ?? member?.name;
  const s = SIZE_MAP[size];

  // Bug #21: If no owner assigned and no explicit src/name, show a clean placeholder
  if (!avatarSrc && !displayName) {
    return (
      <div
        className={clsx('rounded-full shrink-0 flex items-center justify-center', s.cls)}
        style={{ background: 'var(--border-row)', color: 'var(--text-disabled)' }}
        title="Unassigned"
      >
        <span style={{ fontSize: s.px * 0.4, lineHeight: 1 }}>—</span>
      </div>
    );
  }

  return (
    <img
      src={avatarSrc ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName || 'U')}&size=40`}
      alt={displayName || 'User'}
      title={displayName || 'User'}
      className={clsx('rounded-full object-cover shrink-0', s.cls)}
    />
  );
}
