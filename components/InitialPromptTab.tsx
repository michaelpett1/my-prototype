'use client';

import { useState, useRef } from 'react';

interface InitialPromptTabProps {
  content: string;
  onContentChange: (content: string) => void;
}

export default function InitialPromptTab({ content, onContentChange }: InitialPromptTabProps) {
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const originalRef = useRef(content);
  const isEdited = content !== originalRef.current;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    onContentChange(originalRef.current);
    setEditing(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-sm text-gray-500">
            Ready-to-paste kickoff message for Claude Code
          </p>
          {isEdited && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">
              Edited
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isEdited && (
            <button
              onClick={handleReset}
              className="text-xs font-medium text-gray-500 hover:text-gray-700 cursor-pointer"
            >
              Reset
            </button>
          )}
          <button
            onClick={() => setEditing(!editing)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer
              ${editing ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            {editing ? 'Preview' : 'Edit'}
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <svg className="w-3.5 h-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Copied!
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                Copy
              </>
            )}
          </button>
        </div>
      </div>
      {editing ? (
        <textarea
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          className="w-full bg-gray-50 border border-gray-200 rounded-xl p-5 text-sm text-gray-800 leading-relaxed font-mono resize-y min-h-[50vh] max-h-[80vh] outline-none focus:border-indigo-300 focus:ring-1 focus:ring-indigo-300"
        />
      ) : (
        <pre className="bg-gray-50 border border-gray-200 rounded-xl p-5 text-sm text-gray-800 whitespace-pre-wrap leading-relaxed overflow-auto max-h-[70vh] font-mono">
          {content}
        </pre>
      )}
    </div>
  );
}
