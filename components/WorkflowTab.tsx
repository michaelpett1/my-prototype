'use client';

import type { WorkflowPhase } from '@/lib/types';

interface WorkflowTabProps {
  phases: WorkflowPhase[];
}

export default function WorkflowTab({ phases }: WorkflowTabProps) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500">
        Phased implementation plan tailored to your project dimensions
      </p>
      {phases.map((phase, i) => (
        <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 py-3 bg-white border-b border-gray-200 flex items-center gap-2">
            <span className="text-lg">{phase.icon}</span>
            <h3 className="font-semibold text-gray-900 text-sm">
              Phase {i + 1}: {phase.name}
            </h3>
            <span className="ml-auto text-xs text-gray-400">
              {phase.steps.length} step{phase.steps.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="divide-y divide-gray-100">
            {phase.steps.map((step, j) => (
              <div key={j} className="px-5 py-3 flex items-start gap-3">
                <span className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium
                  ${step.critical ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-600'}`}>
                  {j + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    {step.title}
                    {step.critical && (
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                        Critical
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
