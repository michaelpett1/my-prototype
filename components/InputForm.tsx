'use client';

import { useState } from 'react';
import CategoryCard from './CategoryCard';
import DimensionGroup from './DimensionGroup';
import type { DesignGateInputs, ProjectInputs } from '@/lib/types';
import {
  BUILD_CATEGORIES, SPEC_GUIDANCE,
  PROJECT_TYPES, COMPLEXITIES, STAKEHOLDERS,
  DESIGN_READINESS, QA_LEVELS, DEV_CONTEXTS,
  DATA_TRACKING, PLATFORM_IMPACTS,
} from '@/lib/constants';

interface InputFormProps {
  inputs: DesignGateInputs;
  onChange: (inputs: DesignGateInputs) => void;
  onGenerate: () => void;
}

export default function InputForm({ inputs, onChange, onGenerate }: InputFormProps) {
  const [showGuide, setShowGuide] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const update = <K extends keyof DesignGateInputs>(key: K, value: DesignGateInputs[K]) => {
    onChange({ ...inputs, [key]: value });
  };

  const updateOverride = <K extends keyof ProjectInputs>(key: K, value: ProjectInputs[K]) => {
    onChange({
      ...inputs,
      overrides: { ...(inputs.overrides ?? {}), [key]: value },
    });
  };

  const isReady = inputs.category !== null && inputs.productSpec.trim() !== '';

  const missingHints: string[] = [];
  if (!inputs.category) missingHints.push('build category');
  if (!inputs.productSpec.trim()) missingHints.push('spec/brief');

  const hasFigma = inputs.figmaUrl.trim() !== '';

  return (
    <div className="space-y-8">
      {/* Step 1: Category */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 border-b border-gray-100 pb-2 mb-4">
          Step 1 — What are you building?
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {BUILD_CATEGORIES.map((cat) => (
            <CategoryCard
              key={cat.value}
              category={cat}
              selected={inputs.category === cat.value}
              onSelect={() => update('category', cat.value)}
            />
          ))}
        </div>
      </div>

      {/* Step 2: Spec */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 border-b border-gray-100 pb-2 mb-4">
          Step 2 — Paste the spec or brief <span className="text-red-400">*</span>
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="product-spec" className="block text-sm font-medium text-gray-700">
              What needs to be built? Include requirements, acceptance criteria, and any constraints.
            </label>
            <button
              type="button"
              onClick={() => setShowGuide(!showGuide)}
              className="text-[10px] font-medium text-indigo-600 hover:text-indigo-700 cursor-pointer"
            >
              {showGuide ? 'Hide' : 'Show'} Format Guide
            </button>
          </div>
          {showGuide && (
            <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
              <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1">Suggested structure:</p>
              <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono">{SPEC_GUIDANCE}</pre>
            </div>
          )}
          <textarea
            id="product-spec"
            value={inputs.productSpec}
            onChange={(e) => update('productSpec', e.target.value)}
            placeholder="Paste the full product spec, Jira ticket description, Slack brief, or requirements here..."
            rows={8}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-y"
          />
          {inputs.productSpec.length > 0 && (
            <p className={`text-[10px] ${inputs.productSpec.length > 5000 ? 'text-amber-600' : 'text-gray-400'}`}>
              {inputs.productSpec.length.toLocaleString()} characters
              {inputs.productSpec.length > 5000 && ' — consider focusing on key requirements'}
            </p>
          )}
        </div>
      </div>

      {/* Step 3: Figma URL */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 border-b border-gray-100 pb-2 mb-4">
          Step 3 — Figma file URL <span className="text-gray-300">(optional but recommended)</span>
        </h3>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <input
                type="url"
                value={inputs.figmaUrl}
                onChange={(e) => update('figmaUrl', e.target.value)}
                placeholder="https://www.figma.com/design/..."
                className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors
                  ${hasFigma
                    ? 'border-green-300 bg-green-50 focus:border-green-500 focus:ring-1 focus:ring-green-500'
                    : 'border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                  }`}
              />
            </div>
            {hasFigma && (
              <span className="flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2.5 py-1.5 rounded-lg">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Figma linked
              </span>
            )}
          </div>
          {!hasFigma && inputs.category && inputs.category !== 'prototype' && (
            <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200">
              <svg className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <p className="text-xs font-medium text-amber-800">No Figma = higher design risk</p>
                <p className="text-[10px] text-amber-700 mt-0.5">
                  Without Figma, Claude Code will use GDC Design System enforcement mode. The build will need more thorough design review.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Project name */}
      <div>
        <label htmlFor="project-name" className="block text-sm font-medium text-gray-700 mb-1">
          Project Name
        </label>
        <input
          id="project-name"
          type="text"
          value={inputs.projectName}
          onChange={(e) => update('projectName', e.target.value)}
          placeholder="e.g., Casino Landing Page Redesign"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
        />
      </div>

      {/* Advanced overrides */}
      <div>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-gray-700 cursor-pointer"
        >
          <svg
            className={`w-3.5 h-3.5 transition-transform ${showAdvanced ? 'rotate-90' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          Advanced overrides
          <span className="text-[10px] text-gray-400">(for power users)</span>
        </button>
        {showAdvanced && (
          <div className="mt-4 space-y-4 pl-4 border-l-2 border-gray-100">
            <p className="text-[10px] text-gray-400">
              Override the category defaults. Only change these if you know what you&apos;re doing.
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DimensionGroup
                title="Project Type"
                options={PROJECT_TYPES}
                value={inputs.overrides?.projectType ?? null}
                onChange={(v) => updateOverride('projectType', v)}
                columns={3}
              />
              <DimensionGroup
                title="Complexity"
                options={COMPLEXITIES}
                value={inputs.overrides?.complexity ?? null}
                onChange={(v) => updateOverride('complexity', v)}
                columns={2}
              />
            </div>
            <DimensionGroup
              title="Stakeholder"
              options={STAKEHOLDERS}
              value={inputs.overrides?.stakeholder ?? null}
              onChange={(v) => updateOverride('stakeholder', v)}
              columns={3}
            />
            <DimensionGroup
              title="Design Readiness"
              options={DESIGN_READINESS}
              value={inputs.overrides?.designReadiness ?? null}
              onChange={(v) => updateOverride('designReadiness', v)}
              columns={4}
            />
            <DimensionGroup
              title="QA Level"
              options={QA_LEVELS}
              value={inputs.overrides?.qaLevel ?? null}
              onChange={(v) => updateOverride('qaLevel', v)}
              columns={4}
            />
            <DimensionGroup
              title="Dev Context"
              options={DEV_CONTEXTS}
              value={inputs.overrides?.devContext ?? null}
              onChange={(v) => updateOverride('devContext', v)}
              columns={4}
            />
            <DimensionGroup
              title="Data Tracking"
              options={DATA_TRACKING}
              value={inputs.overrides?.dataTracking ?? null}
              onChange={(v) => updateOverride('dataTracking', v)}
              columns={4}
            />
            <DimensionGroup
              title="Platform Impact"
              options={PLATFORM_IMPACTS}
              value={inputs.overrides?.platformImpact ?? null}
              onChange={(v) => updateOverride('platformImpact', v)}
              columns={4}
            />
          </div>
        )}
      </div>

      {/* Generate button */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div>
          {!isReady && missingHints.length > 0 && (
            <p className="text-xs text-gray-400">
              Select a {missingHints.join(' and ')} to continue
            </p>
          )}
          {isReady && !hasFigma && inputs.category !== 'prototype' && (
            <p className="text-xs text-amber-600">
              No Figma — outputs will use Design System enforcement mode
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onGenerate}
          disabled={!isReady}
          className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all
            ${isReady
              ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm cursor-pointer'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
        >
          Generate Outputs
        </button>
      </div>
    </div>
  );
}
