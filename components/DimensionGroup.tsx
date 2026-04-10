'use client';

import OptionCard from './OptionCard';
import type { DimensionOption } from '@/lib/types';

interface DimensionGroupProps<T extends string> {
  title: string;
  options: DimensionOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  columns?: 2 | 3 | 4;
  warning?: string;
}

export default function DimensionGroup<T extends string>({
  title,
  options,
  value,
  onChange,
  columns = 4,
  warning,
}: DimensionGroupProps<T>) {
  const gridCols = columns === 2
    ? 'grid-cols-1 sm:grid-cols-2'
    : columns === 3
    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{title}</label>
      <div className={`grid ${gridCols} gap-3`}>
        {options.map((opt) => (
          <OptionCard
            key={opt.value}
            icon={opt.icon}
            label={opt.label}
            description={opt.description}
            helpText={opt.helpText}
            selected={value === opt.value}
            onClick={() => onChange(opt.value)}
          />
        ))}
      </div>
      {warning && (
        <div className="mt-2 flex items-start gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200">
          <svg className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span className="text-xs text-amber-800">{warning}</span>
        </div>
      )}
    </div>
  );
}
