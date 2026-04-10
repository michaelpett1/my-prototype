import type {
  ProjectType, Complexity, Stakeholder, DesignReadiness,
  QALevel, DevContext, DataTracking, PlatformImpact, DimensionOption,
  ProjectInputs, BuildCategory, DesignGateInputs,
} from './types';

// ─── Dimension Options (kept for advanced overrides panel) ─────────────────

export const PROJECT_TYPES: DimensionOption<ProjectType>[] = [
  { value: 'new-page', label: 'New Page', description: 'Build a new page from scratch', icon: '📄', helpText: 'A brand-new page that doesn\'t exist yet.' },
  { value: 'redesign', label: 'Redesign', description: 'Overhaul an existing page or section', icon: '🔄', helpText: 'Updating an existing page\'s look, layout, or functionality.' },
  { value: 'migration', label: 'Migration', description: 'Port content or features between platforms', icon: '📦', helpText: 'Moving content or features from one system to another.' },
  { value: 'prototype', label: 'Prototype / POC', description: 'Quick proof of concept or experiment', icon: '🧪', helpText: 'A fast experiment to test an idea. Speed matters more than polish.' },
  { value: 'component', label: 'Component Build', description: 'Reusable UI component for the design system', icon: '🧩', helpText: 'A reusable UI building block for the design system.' },
  { value: 'genesis-template', label: 'Genesis Template', description: 'CMS template for Genesis publishing', icon: '📐', helpText: 'A template that content editors will use in Genesis (our CMS).' },
];

export const COMPLEXITIES: DimensionOption<Complexity>[] = [
  { value: 'S', label: 'S — Hours', description: 'Small task, a few hours', icon: '⚡' },
  { value: 'M', label: 'M — 1-3 Days', description: 'Medium scope, multi-day effort', icon: '📊' },
  { value: 'L', label: 'L — 1-2 Weeks', description: 'Large feature, significant work', icon: '🏗️' },
  { value: 'XL', label: 'XL — 2+ Weeks', description: 'Major initiative, cross-team', icon: '🚀' },
];

export const STAKEHOLDERS: DimensionOption<Stakeholder>[] = [
  { value: 'marketing', label: 'Marketing', description: 'Brand, campaigns, landing pages', icon: '📣' },
  { value: 'product', label: 'Product', description: 'Feature specs, user flows', icon: '🎯' },
  { value: 'engineering', label: 'Engineering', description: 'Technical requirements, infra', icon: '⚙️' },
  { value: 'commercial', label: 'Commercial', description: 'Operator data, offers, affiliates', icon: '💰' },
  { value: 'media-content', label: 'Media / Content', description: 'Editorial, articles, assets', icon: '✏️' },
  { value: 'leadership', label: 'Leadership', description: 'Exec visibility, strategic', icon: '👔' },
];

export const DESIGN_READINESS: DimensionOption<DesignReadiness>[] = [
  { value: 'full-figma', label: 'Full Figma Specs', description: 'Complete designs with tokens', icon: '🎨' },
  { value: 'wireframes', label: 'Wireframes / Rough', description: 'Layout defined, details TBD', icon: '📝' },
  { value: 'verbal-brief', label: 'Verbal Brief Only', description: 'Described but not drawn', icon: '💬' },
  { value: 'no-design', label: 'No Design', description: 'Dev decides layout and style', icon: '🤷' },
];

export const QA_LEVELS: DimensionOption<QALevel>[] = [
  { value: 'light-review', label: 'Light Review', description: 'Quick peer review', icon: '👀' },
  { value: 'formal-qa', label: 'Formal QA Pass', description: 'Structured QA with test cases', icon: '🔍' },
  { value: 'accessibility-audit', label: 'Accessibility Audit', description: 'WCAG compliance check', icon: '♿' },
  { value: 'full-regression', label: 'Full Regression', description: 'Complete regression suite', icon: '🛡️' },
];

export const DEV_CONTEXTS: DimensionOption<DevContext>[] = [
  { value: 'vue-nuxt', label: 'Vue 3 / Nuxt', description: 'Primary GDC stack', icon: '💚' },
  { value: 'nextjs-react', label: 'Next.js / React', description: 'React-based projects', icon: '⚛️' },
  { value: 'prototype-flexible', label: 'Prototype / Flexible', description: 'Any stack, speed over convention', icon: '🧪' },
  { value: 'existing-codebase', label: 'Existing Codebase', description: 'Match current patterns', icon: '📂' },
];

export const DATA_TRACKING: DimensionOption<DataTracking>[] = [
  { value: 'ga4', label: 'GA4 Events', description: 'Google Analytics dataLayer events', icon: '📈' },
  { value: 'ktag', label: 'KTag (Internal)', description: 'GDC internal tracking system', icon: '🏷️' },
  { value: 'both', label: 'Both', description: 'GA4 + KTag dual tracking', icon: '📊' },
  { value: 'none', label: 'None', description: 'No tracking required', icon: '🚫' },
];

export const PLATFORM_IMPACTS: DimensionOption<PlatformImpact>[] = [
  { value: 'genesis', label: 'Genesis (CMS)', description: 'Content management & publishing', icon: '🏛️' },
  { value: 'eve', label: 'Eve (Commercial)', description: 'Operator data, offers, affiliates', icon: '💼' },
  { value: 'origins', label: 'Origins (Media)', description: 'Editorial content & assets', icon: '📰' },
  { value: 'standalone', label: 'Standalone', description: 'No platform dependency', icon: '🔲' },
];

// ─── Build Categories (replaces PRESETS) ───────────────────────────────────

export interface BuildCategoryDef {
  value: BuildCategory;
  label: string;
  description: string;
  icon: string;
  defaults: Omit<ProjectInputs, 'projectName' | 'productSpec'>;
}

export const BUILD_CATEGORIES: BuildCategoryDef[] = [
  {
    value: 'new-page',
    label: 'New Page',
    description: 'Build a new page from scratch with full design and tracking',
    icon: '📄',
    defaults: {
      projectType: 'new-page',
      complexity: 'M',
      stakeholder: null,
      designReadiness: 'full-figma',
      qaLevel: 'formal-qa',
      devContext: 'vue-nuxt',
      dataTracking: 'both',
      platformImpact: 'standalone',
    },
  },
  {
    value: 'page-update',
    label: 'Page Update',
    description: 'Modify an existing page — match current patterns exactly',
    icon: '🔄',
    defaults: {
      projectType: 'redesign',
      complexity: 'S',
      stakeholder: null,
      designReadiness: 'full-figma',
      qaLevel: 'formal-qa',
      devContext: 'existing-codebase',
      dataTracking: 'both',
      platformImpact: 'standalone',
    },
  },
  {
    value: 'cms-template',
    label: 'CMS Template',
    description: 'Genesis template with content slots for editors',
    icon: '🏛️',
    defaults: {
      projectType: 'genesis-template',
      complexity: 'M',
      stakeholder: null,
      designReadiness: 'full-figma',
      qaLevel: 'formal-qa',
      devContext: 'vue-nuxt',
      dataTracking: 'both',
      platformImpact: 'genesis',
    },
  },
  {
    value: 'component',
    label: 'Component',
    description: 'Reusable UI component for the design system',
    icon: '🧩',
    defaults: {
      projectType: 'component',
      complexity: 'M',
      stakeholder: null,
      designReadiness: 'full-figma',
      qaLevel: 'formal-qa',
      devContext: 'vue-nuxt',
      dataTracking: 'none',
      platformImpact: 'standalone',
    },
  },
  {
    value: 'prototype',
    label: 'Prototype',
    description: 'Quick proof of concept — speed over polish',
    icon: '🧪',
    defaults: {
      projectType: 'prototype',
      complexity: 'S',
      stakeholder: null,
      designReadiness: 'no-design',
      qaLevel: 'light-review',
      devContext: 'prototype-flexible',
      dataTracking: 'none',
      platformImpact: 'standalone',
    },
  },
];

// ─── Spec Guidance ─────────────────────────────────────────────────────────

export const SPEC_GUIDANCE = `## Goal
What is this project trying to achieve? What problem does it solve?

## Requirements
Key features, acceptance criteria, and must-haves

## Constraints
Timeline, browser support, performance budgets, or scope limitations

## Out of Scope
What this project explicitly does NOT include`;

// ─── Defaults ──────────────────────────────────────────────────────────────

export const DEFAULT_DESIGN_GATE_INPUTS: DesignGateInputs = {
  projectName: '',
  productSpec: '',
  category: null,
  figmaUrl: '',
  overrides: null,
};
