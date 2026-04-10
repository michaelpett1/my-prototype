'use client';

import type { ChecklistItem } from '@/lib/types';

interface ChecklistTabProps {
  items: ChecklistItem[];
  onToggle: (id: string) => void;
  onReset: () => void;
}

export default function ChecklistTab({ items, onToggle, onReset }: ChecklistTabProps) {
  const completed = items.filter(i => i.checked).length;
  const critical = items.filter(i => i.critical);
  const criticalDone = critical.filter(i => i.checked).length;

  const categories = [...new Set(items.map(i => i.category))];

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="flex items-center gap-4">
        <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-indigo-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${items.length ? (completed / items.length) * 100 : 0}%` }}
          />
        </div>
        <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
          {completed}/{items.length} complete
        </span>
      </div>

      {/* Critical progress + reset */}
      <div className="flex items-center justify-between">
        {critical.length > 0 && (
          <div className={`text-xs px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5
            ${criticalDone === critical.length ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            <span className="font-semibold">{criticalDone}/{critical.length}</span> critical items complete
          </div>
        )}
        {completed > 0 && (
          <button
            onClick={onReset}
            className="text-xs font-medium text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
          >
            Reset all
          </button>
        )}
      </div>

      <p className="text-[10px] text-gray-400">
        Progress is saved automatically and persists across page refreshes.
      </p>

      {/* Grouped checklist */}
      {categories.map(cat => (
        <div key={cat}>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">{cat}</h4>
          <div className="space-y-1">
            {items.filter(i => i.category === cat).map(item => (
              <label
                key={item.id}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors
                  ${item.checked ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
              >
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => onToggle(item.id)}
                  className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className={`text-sm flex-1 ${item.checked ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                  {item.label}
                </span>
                {item.critical && !item.checked && (
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                    Critical
                  </span>
                )}
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
