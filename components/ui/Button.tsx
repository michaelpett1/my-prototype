import { clsx } from '@/lib/utils/clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

/* Design decision: all buttons use border-radius 5px. Consistent across the app.
   Primary = accent blue, used only for the ONE main action per view.
   Secondary = white + border, for supporting actions.
   Ghost = no border, very low visual weight, for tertiary actions.
*/

export function Button({ variant = 'secondary', size = 'md', className, children, ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center font-semibold rounded-[5px] transition-all duration-150 ease-out disabled:opacity-40 disabled:cursor-not-allowed select-none';

  const variants = {
    primary:   'text-white bg-[#2563EB] hover:bg-[#1D4ED8] border border-transparent shadow-[0_1px_2px_rgba(0,0,0,0.10)]',
    secondary: 'text-[#374151] bg-white border hover:bg-[#FAFAF9] hover:border-[rgba(0,0,0,0.14)] shadow-[0_1px_2px_rgba(0,0,0,0.05)]',
    ghost:     'text-[#6B7280] bg-transparent border border-transparent hover:bg-[rgba(0,0,0,0.04)] hover:text-[#374151]',
    danger:    'text-white bg-[#DC2626] hover:bg-[#B91C1C] border border-transparent shadow-[0_1px_2px_rgba(0,0,0,0.10)]',
  };

  const sizes = {
    sm: 'px-2.5 py-1.5 text-[12px] gap-1.5',
    md: 'px-3 py-[7px] text-[13px] gap-2',
    lg: 'px-4 py-2 text-[13px] gap-2',
  };

  // Design decision: secondary border as rgba instead of named colour
  const borderColors = {
    primary:   '',
    secondary: 'border-[rgba(0,0,0,0.10)]',
    ghost:     '',
    danger:    '',
  };

  return (
    <button
      {...props}
      className={clsx(base, variants[variant], sizes[size], borderColors[variant], className)}
    >
      {children}
    </button>
  );
}
