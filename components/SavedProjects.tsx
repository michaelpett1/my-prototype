'use client';

import type { SavedProject, DesignGateInputs } from '@/lib/types';

const STORAGE_KEY = 'cc-advisor-projects';
const MAX_SAVED = 20;

export function loadProjects(): SavedProject[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    // Handle both old and new format
    return parsed.map((p: Record<string, unknown>) => {
      if (p.inputs && 'category' in (p.inputs as Record<string, unknown>)) {
        return p as unknown as SavedProject;
      }
      // Convert old ProjectInputs format to DesignGateInputs
      const oldInputs = p.inputs as Record<string, unknown>;
      return {
        id: p.id,
        name: p.name,
        date: p.date,
        category: oldInputs.projectType ?? null,
        inputs: {
          projectName: oldInputs.projectName ?? '',
          productSpec: oldInputs.productSpec ?? '',
          category: oldInputs.projectType ?? null,
          figmaUrl: '',
          overrides: null,
        },
      } as SavedProject;
    });
  } catch {
    return [];
  }
}

export function saveProject(inputs: DesignGateInputs): SavedProject {
  const projects = loadProjects();
  const project: SavedProject = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    name: inputs.projectName || 'Untitled',
    date: new Date().toISOString(),
    inputs,
    category: inputs.category,
  };
  const updated = [project, ...projects].slice(0, MAX_SAVED);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return project;
}

export function deleteProject(id: string) {
  const projects = loadProjects().filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

interface SavedProjectsProps {
  projects: SavedProject[];
  onLoad: (inputs: DesignGateInputs) => void;
  onDelete: (id: string) => void;
  onSave: () => void;
  canSave: boolean;
}

export default function SavedProjects({ projects, onLoad, onDelete, onSave, canSave }: SavedProjectsProps) {
  if (projects.length === 0 && !canSave) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Saved Projects</h3>
        {canSave && (
          <button
            onClick={onSave}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-700 cursor-pointer"
          >
            + Save Current
          </button>
        )}
      </div>
      {projects.length === 0 ? (
        <p className="text-xs text-gray-400">No saved projects yet</p>
      ) : (
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {projects.map(p => (
            <div
              key={p.id}
              className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 group"
            >
              <button
                onClick={() => onLoad(p.inputs)}
                className="flex-1 text-left min-w-0 cursor-pointer"
              >
                <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                <p className="text-[10px] text-gray-400">
                  {new Date(p.date).toLocaleDateString()}
                  {p.category && ` · ${p.category.replace(/-/g, ' ')}`}
                </p>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(p.id); }}
                className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                aria-label={`Delete ${p.name}`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
