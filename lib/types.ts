export type ProjectType = 'new-page' | 'redesign' | 'migration' | 'prototype' | 'component' | 'genesis-template';
export type Complexity = 'S' | 'M' | 'L' | 'XL';
export type Stakeholder = 'marketing' | 'product' | 'engineering' | 'commercial' | 'media-content' | 'leadership';
export type DesignReadiness = 'full-figma' | 'wireframes' | 'verbal-brief' | 'no-design';
export type QALevel = 'light-review' | 'formal-qa' | 'accessibility-audit' | 'full-regression';
export type DevContext = 'vue-nuxt' | 'nextjs-react' | 'prototype-flexible' | 'existing-codebase';
export type DataTracking = 'ga4' | 'ktag' | 'both' | 'none';
export type PlatformImpact = 'genesis' | 'eve' | 'origins' | 'standalone';

export interface ProjectInputs {
  projectName: string;
  productSpec: string;
  projectType: ProjectType | null;
  complexity: Complexity | null;
  stakeholder: Stakeholder | null;
  designReadiness: DesignReadiness | null;
  qaLevel: QALevel | null;
  devContext: DevContext | null;
  dataTracking: DataTracking | null;
  platformImpact: PlatformImpact | null;
}

export interface DimensionOption<T extends string = string> {
  value: T;
  label: string;
  description: string;
  icon: string;
  helpText?: string;
}

export interface WorkflowStep {
  title: string;
  description: string;
  critical?: boolean;
}

export interface WorkflowPhase {
  name: string;
  icon: string;
  steps: WorkflowStep[];
}

export interface ChecklistItem {
  id: string;
  label: string;
  category: string;
  critical: boolean;
  checked: boolean;
}

// ─── New Design Gate types ─────────────────────────────────────────────────

export type BuildCategory = 'new-page' | 'page-update' | 'cms-template' | 'component' | 'prototype';

export interface DesignGateInputs {
  projectName: string;
  productSpec: string;
  category: BuildCategory | null;
  figmaUrl: string;
  overrides: Partial<ProjectInputs> | null;
}

export interface SavedProject {
  id: string;
  name: string;
  date: string;
  inputs: DesignGateInputs;
  category: BuildCategory | null;
}

export type TabId = 'prompt' | 'claude-md' | 'review-brief';
