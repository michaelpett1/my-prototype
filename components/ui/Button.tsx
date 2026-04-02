import { clsx } from '@/lib/utils/clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({ variant = 'secondary', size = 'md', className, style, children, ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center font-semibold rounded-[5px] transition-all duration-150 ease-out disabled:opacity-40 disabled:cursor-not-allowed select-none';

  const variants = {
    primary:   'btn-accent text-white border border-transparent shadow-[0_1px_2px_rgba(0,0,0,0.10)]',
    secondary: 'text-[#374151] bg-white border hover:bg-[#FAFAF9] hover:border-[rgba(0,0,0,0.14)] shadow-[0_1px_2px_rgba(0,0,0,0.05)]',
    ghost:     'text-[#6B7280] bg-transparent border border-transparent hover:bg-[rgba(0,0,0,0.04)] hover:text-[#374151]',
    danger:    'text-white bg-[#DC2626] hover:bg-[#B91C1C] border border-transparent shadow-[0_1px_2px_rgba(0,0,0,0.10)]',
  };

  const sizes = {
    sm: 'px-2.5 py-1.5 text-[12px] gap-1.5',
    md: 'px-3 py-[7px] text-[13px] gap-2',
    lg: 'px-4 py-2 text-[13px] gap-2',
  };

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
      style={variant === 'primary' ? { background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', boxShadow: '0 2px 8px rgba(79,70,229,0.3)', ...style } : style}
    >
      {children}
    </button>
  );
}
