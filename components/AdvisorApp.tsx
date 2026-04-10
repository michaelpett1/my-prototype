'use client';

import { useState, useEffect, useCallback } from 'react';
import type { DesignGateInputs, SavedProject } from '@/lib/types';
import { DEFAULT_DESIGN_GATE_INPUTS } from '@/lib/constants';
import { generateInitialPrompt, generateClaudeMd, generateDesignReviewBrief } from '@/lib/engine/index';
import InputForm from './InputForm';
import ResultsView from './ResultsView';
import SavedProjects, { loadProjects, saveProject, deleteProject } from './SavedProjects';

type View = 'form' | 'results';

export default function AdvisorApp() {
  const [inputs, setInputs] = useState<DesignGateInputs>(DEFAULT_DESIGN_GATE_INPUTS);
  const [view, setView] = useState<View>('form');
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);

  // Generated outputs
  const [prompt, setPrompt] = useState('');
  const [claudeMd, setClaudeMd] = useState('');
  const [reviewBrief, setReviewBrief] = useState('');

  useEffect(() => {
    setSavedProjects(loadProjects());
  }, []);

  const handleGenerate = useCallback(() => {
    const newPrompt = generateInitialPrompt(inputs);
    const newClaudeMd = generateClaudeMd(inputs);
    const newReviewBrief = generateDesignReviewBrief(inputs);

    setPrompt(newPrompt);
    setClaudeMd(newClaudeMd);
    setReviewBrief(newReviewBrief);
    setView('results');
  }, [inputs]);

  const handleSave = useCallback(() => {
    const saved = saveProject(inputs);
    setSavedProjects(prev => [saved, ...prev].slice(0, 20));
  }, [inputs]);

  const handleDeleteSaved = useCallback((id: string) => {
    deleteProject(id);
    setSavedProjects(prev => prev.filter(p => p.id !== id));
  }, []);

  const handleLoadSaved = useCallback((loadedInputs: DesignGateInputs) => {
    setInputs(loadedInputs);
    setView('form');
  }, []);

  const handleBack = useCallback(() => {
    setView('form');
  }, []);

  const handleReset = useCallback(() => {
    setInputs(DEFAULT_DESIGN_GATE_INPUTS);
    setView('form');
  }, []);

  const handleExport = useCallback(() => {
    const content = `# ${inputs.projectName || 'Project'} — Design Quality Gate

---

## Kickoff Prompt

${prompt}

---

## CLAUDE.md

${claudeMd}

---

## Design Review Brief

${reviewBrief}
`;

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(inputs.projectName || 'project').replace(/[^a-z0-9]/gi, '-').toLowerCase()}-design-gate.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [inputs.projectName, prompt, claudeMd, reviewBrief]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-900">Design Quality Gate</h1>
              <p className="text-[10px] text-gray-400">Enforce design standards in every build</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {view === 'results' && (
              <>
                <button
                  onClick={handleBack}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  &larr; Edit Inputs
                </button>
                <button
                  onClick={handleReset}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  New Project
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
          <div>
            {view === 'form' ? (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <InputForm
                  inputs={inputs}
                  onChange={setInputs}
                  onGenerate={handleGenerate}
                />
              </div>
            ) : (
              <ResultsView
                prompt={prompt}
                claudeMd={claudeMd}
                reviewBrief={reviewBrief}
                inputs={inputs}
                onClaudeMdUpdate={setClaudeMd}
                onPromptUpdate={setPrompt}
                onReviewBriefUpdate={setReviewBrief}
                onExport={handleExport}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <SavedProjects
              projects={savedProjects}
              onLoad={handleLoadSaved}
              onDelete={handleDeleteSaved}
              onSave={handleSave}
              canSave={inputs.projectName.trim() !== ''}
            />

            {/* How it works */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">How it works</h3>
              <ol className="text-xs text-gray-500 space-y-1.5 list-decimal list-inside">
                <li>Pick what you&apos;re building</li>
                <li>Paste the spec or brief</li>
                <li>Add the Figma URL (if you have one)</li>
                <li>Click &ldquo;Generate Outputs&rdquo;</li>
                <li>Copy the Kickoff Prompt into Claude Code</li>
                <li>Drop CLAUDE.md into the project root</li>
                <li>Send the Design Review Brief to the reviewer</li>
              </ol>
            </div>

            {/* Design enforcement info */}
            <div className="bg-indigo-50 rounded-2xl border border-indigo-100 p-5">
              <h3 className="text-sm font-semibold text-indigo-900 mb-2">Design enforcement</h3>
              <p className="text-xs text-indigo-700 leading-relaxed">
                The generated prompt includes a Design Checkpoint Protocol — hard gates where Claude Code must verify design fidelity before continuing.
              </p>
              <div className="mt-3 space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-indigo-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  Extract tokens from Figma before coding
                </div>
                <div className="flex items-center gap-2 text-xs text-indigo-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  Screenshot and compare after each section
                </div>
                <div className="flex items-center gap-2 text-xs text-indigo-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  Verify responsive at 375/768/1440px
                </div>
                <div className="flex items-center gap-2 text-xs text-indigo-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  Final fidelity report before completion
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
