'use client';

import { useState } from 'react';

interface OptionCardProps {
  icon: string;
  label: string;
  description: string;
  helpText?: string;
  selected: boolean;
  onClick: () => void;
}

export default function OptionCard({ icon, label, description, helpText, selected, onClick }: OptionCardProps) {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onClick}
        className={`w-full flex flex-col items-start gap-1 rounded-xl border-2 p-4 text-left transition-all cursor-pointer
          ${selected
            ? 'border-indigo-500 bg-indigo-50 shadow-sm'
            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
          }`}
      >
        <div className="flex items-center justify-between w-full">
          <span className="text-xl">{icon}</span>
          {helpText && (
            <span
              onMouseEnter={() => setShowHelp(true)}
              onMouseLeave={() => setShowHelp(false)}
              onClick={(e) => { e.stopPropagation(); setShowHelp(!showHelp); }}
              className="text-gray-300 hover:text-gray-500 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          )}
        </div>
        <span className={`text-sm font-semibold ${selected ? 'text-indigo-900' : 'text-gray-900'}`}>
          {label}
        </span>
        <span className="text-xs text-gray-500 leading-tight">{description}</span>
      </button>
      {helpText && showHelp && (
        <div className="absolute z-20 top-full left-0 right-0 mt-1 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg leading-relaxed">
          {helpText}
        </div>
      )}
    </div>
  );
}
