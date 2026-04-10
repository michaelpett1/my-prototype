'use client';

import { useState } from 'react';
import type { DesignGateInputs, TabId } from '@/lib/types';
import InitialPromptTab from './InitialPromptTab';
import ClaudeMdTab from './ClaudeMdTab';
import DesignReviewBriefTab from './DesignReviewBriefTab';

interface ResultsViewProps {
  prompt: string;
  claudeMd: string;
  reviewBrief: string;
  inputs: DesignGateInputs;
  onClaudeMdUpdate: (content: string) => void;
  onPromptUpdate: (content: string) => void;
  onReviewBriefUpdate: (content: string) => void;
  onExport: () => void;
}

const TABS: { id: TabId; label: string; audience: string }[] = [
  { id: 'prompt', label: 'Kickoff Prompt', audience: 'Developer' },
  { id: 'claude-md', label: 'CLAUDE.md', audience: 'Claude Code' },
  { id: 'review-brief', label: 'Design Review Brief', audience: 'Reviewer' },
];

export default function ResultsView({
  prompt, claudeMd, reviewBrief, inputs,
  onClaudeMdUpdate, onPromptUpdate, onReviewBriefUpdate, onExport,
}: ResultsViewProps) {
  const [activeTab, setActiveTab] = useState<TabId>('prompt');

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Tab bar */}
      <div className="border-b border-gray-200 bg-gray-50 flex items-center">
        <div className="flex flex-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 text-sm font-medium transition-colors relative cursor-pointer flex items-center gap-2
                ${activeTab === tab.id
                  ? 'text-indigo-600 bg-white border-b-2 border-indigo-600 -mb-px'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              {tab.label}
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full
                ${activeTab === tab.id ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-200 text-gray-500'}`}>
                {tab.audience}
              </span>
            </button>
          ))}
        </div>
        <button
          onClick={onExport}
          className="flex items-center gap-1.5 px-3 py-1.5 mr-3 rounded-lg text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export All
        </button>
      </div>

      {/* Tab content */}
      <div className="p-6">
        {activeTab === 'prompt' && (
          <InitialPromptTab content={prompt} onContentChange={onPromptUpdate} />
        )}
        {activeTab === 'claude-md' && (
          <ClaudeMdTab content={claudeMd} inputs={inputs} onEnriched={onClaudeMdUpdate} />
        )}
        {activeTab === 'review-brief' && (
          <DesignReviewBriefTab content={reviewBrief} onContentChange={onReviewBriefUpdate} />
        )}
      </div>
    </div>
  );
}
