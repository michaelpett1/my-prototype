'use client';

import type { BuildCategoryDef } from '@/lib/constants';

interface CategoryCardProps {
  category: BuildCategoryDef;
  selected: boolean;
  onSelect: () => void;
}

export default function CategoryCard({ category, selected, onSelect }: CategoryCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative flex flex-col items-center gap-2 p-5 rounded-xl border-2 transition-all cursor-pointer text-center
        ${selected
          ? 'border-indigo-500 bg-indigo-50 shadow-sm'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
        }`}
    >
      <span className="text-2xl">{category.icon}</span>
      <span className={`text-sm font-semibold ${selected ? 'text-indigo-700' : 'text-gray-800'}`}>
        {category.label}
      </span>
      <span className={`text-xs leading-relaxed ${selected ? 'text-indigo-600' : 'text-gray-500'}`}>
        {category.description}
      </span>
      {selected && (
        <div className="absolute top-2 right-2">
          <svg className="w-5 h-5 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </button>
  );
}
