import { clsx } from '@/lib/utils/clsx';
import { TEAM_MEMBERS } from '@/lib/data/mockData';

interface AvatarProps {
  ownerId?: string;
  src?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

const SIZE_CLASSES = {
  xs: 'w-5 h-5',
  sm: 'w-6 h-6',
  md: 'w-7 h-7',
  lg: 'w-9 h-9',
};

export function Avatar({ ownerId, src, name, size = 'sm' }: AvatarProps) {
  const member = ownerId ? TEAM_MEMBERS.find((m) => m.id === ownerId) : null;
  const avatarSrc = src ?? member?.avatarUrl;
  const displayName = name ?? member?.name ?? '?';

  return (
    <img
      src={avatarSrc ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&size=40`}
      alt={displayName}
      title={displayName}
      className={clsx('rounded-full object-cover shrink-0', SIZE_CLASSES[size])}
    />
  );
}
