'use client';

import { useState, useRef } from 'react';
import type { DesignGateInputs } from '@/lib/types';

interface ClaudeMdTabProps {
  content: string;
  inputs: DesignGateInputs;
  onEnriched: (content: string) => void;
}

export default function ClaudeMdTab({ content, inputs, onEnriched }: ClaudeMdTabProps) {
  const [copied, setCopied] = useState(false);
  const [enriching, setEnriching] = useState(false);
  const [enriched, setEnriched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const preEnrichRef = useRef<string | null>(null);
  const originalRef = useRef(content);

  const linesAdded = enriched && preEnrichRef.current
    ? content.split('\n').length - preEnrichRef.current.split('\n').length
    : 0;

  const isEdited = content !== originalRef.current && !enriched;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEnrich = async () => {
    setEnriching(true);
    setError(null);
    preEnrichRef.current = content;
    try {
      const res = await fetch('/api/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claudeMd: content, inputs }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to enrich');
      }
      const data = await res.json();
      onEnriched(data.enriched);
      setEnriched(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Enrichment failed');
    } finally {
      setEnriching(false);
    }
  };

  const handleUndo = () => {
    if (preEnrichRef.current) {
      onEnriched(preEnrichRef.current);
      setEnriched(false);
      preEnrichRef.current = null;
    }
  };

  const handleReset = () => {
    onEnriched(originalRef.current);
    setEditing(false);
    setEnriched(false);
    preEnrichRef.current = null;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <p className="text-sm text-gray-500">
            Project-specific CLAUDE.md ready to drop into the project root
          </p>
          {enriched && linesAdded > 0 && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">
              AI added ~{linesAdded} lines
            </span>
          )}
          {isEdited && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">
              Edited
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {(isEdited || enriched) && (
            <button
              onClick={handleReset}
              className="text-xs font-medium text-gray-500 hover:text-gray-700 cursor-pointer"
            >
              Reset
            </button>
          )}
          {enriched && preEnrichRef.current && (
            <button
              onClick={handleUndo}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
              Undo Enrich
            </button>
          )}
          <button
            onClick={handleEnrich}
            disabled={enriching}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer
              ${enriched
                ? 'bg-purple-100 text-purple-700'
                : enriching
                ? 'bg-purple-50 text-purple-400'
                : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
          >
            {enriching ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                Enriching...
              </>
            ) : enriched ? (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Enriched
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                Enrich with AI
              </>
            )}
          </button>
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
      {error && (
        <div className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
          {error}
        </div>
      )}
      {editing ? (
        <textarea
          value={content}
          onChange={(e) => onEnriched(e.target.value)}
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
