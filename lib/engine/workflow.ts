import type { ProjectInputs, WorkflowPhase } from '../types';
import { label } from './helpers';

export function generateWorkflow(inputs: ProjectInputs): WorkflowPhase[] {
  const phases: WorkflowPhase[] = [];

  // ─── Phase 1: Discovery & Setup ──────────────────────────────────────────

  const discoverySteps: WorkflowPhase['steps'] = [
    { title: 'Read and internalize the product spec', description: 'Understand scope, goals, and constraints before starting any work. Note any ambiguities to raise.' },
    { title: 'Create CLAUDE.md', description: 'Document project conventions, stack decisions, and key references in the project root.', critical: true },
  ];

  if (inputs.designReadiness !== 'no-design') {
    discoverySteps.push({
      title: 'Pull Figma design tokens',
      description: 'Connect to Figma MCP, call get_design_context, extract colors/spacing/typography. Verify responsive variants exist.',
      critical: inputs.designReadiness === 'full-figma',
    });
  }

  if (inputs.platformImpact !== 'standalone') {
    discoverySteps.push({
      title: `Review ${label(inputs.platformImpact)} integration points`,
      description: `Understand how this project interfaces with ${label(inputs.platformImpact)} — data models, APIs, and publishing flow. Identify any schema or data contract dependencies.`,
    });
  }

  if (inputs.devContext === 'existing-codebase') {
    discoverySteps.push({
      title: 'Audit existing codebase',
      description: 'Read existing code to understand patterns, conventions, and dependencies. Document reusable components, utilities, and data fetching patterns.',
      critical: true,
    });
  }

  if (inputs.projectType === 'migration') {
    discoverySteps.push({
      title: 'Complete content audit',
      description: 'Inventory all content, URLs, features, and interactive elements on the source. Create redirect mapping and feature parity matrix.',
      critical: true,
    });
  }

  if (inputs.projectType === 'redesign') {
    discoverySteps.push({
      title: 'Document current state',
      description: 'Screenshot and document the existing implementation. Identify what must be preserved (URLs, analytics, SEO, existing features).',
    });
  }

  discoverySteps.push({
    title: 'Surface ambiguities and questions',
    description: 'List anything unclear in the spec, missing design details, or unknown data contracts. Get answers before proceeding.',
  });

  discoverySteps.push({
    title: 'Outline implementation plan',
    description: 'Break work into phases, identify critical path, flag risks. Get stakeholder confirmation before proceeding.',
    critical: true,
  });

  phases.push({ name: 'Discovery & Setup', icon: '🔍', steps: discoverySteps });

  // ─── Phase 2: Build ──────────────────────────────────────────────────────

  const buildSteps: WorkflowPhase['steps'] = [];

  if (inputs.devContext === 'vue-nuxt') {
    buildSteps.push({
      title: 'Scaffold Vue/Nuxt structure',
      description: 'Create pages, components, composables. Import SiteHeader/SiteFooter from gdc-shared-components. Set up routing.',
    });
  } else if (inputs.devContext === 'nextjs-react') {
    buildSteps.push({
      title: 'Scaffold Next.js structure',
      description: 'Create app routes, components, and server/client component boundaries. Set up layout and metadata.',
    });
  } else {
    buildSteps.push({
      title: 'Set up project structure',
      description: 'Create initial file structure, entry points, and shared layout.',
    });
  }

  if (inputs.designReadiness === 'full-figma') {
    buildSteps.push({
      title: 'Implement design system components',
      description: 'Build components matching Figma specs. Call get_design_context for each component before implementing. Extract exact spacing, colors, and typography.',
      critical: true,
    });
  }

  // Complexity-proportional build steps
  if (inputs.complexity === 'S') {
    buildSteps.push({
      title: 'Implement core feature',
      description: 'Build the primary functionality. Keep it focused — small scope means fast delivery.',
      critical: true,
    });
  } else if (inputs.complexity === 'M') {
    buildSteps.push({
      title: 'Implement layout and structure',
      description: 'Build page layout, sections, and component shells. Get the skeleton right before adding logic.',
      critical: true,
    });
    buildSteps.push({
      title: 'Implement interactive features',
      description: 'Add dynamic behavior, data fetching, form handling, and user interactions.',
      critical: true,
    });
    buildSteps.push({
      title: 'Polish and edge cases',
      description: 'Loading states, error handling, empty states, and content overflow behavior.',
    });
  } else {
    // L / XL
    buildSteps.push({
      title: 'Phase A: Foundation and shared components',
      description: 'Core layout, routing, shared components, data models, API integration. Everything other features build on.',
      critical: true,
    });
    buildSteps.push({
      title: 'Phase B: Primary features',
      description: 'Build the main features from the spec. Complete end-to-end user flows. Commit working increments.',
      critical: true,
    });
    buildSteps.push({
      title: 'Phase C: Secondary features and integration',
      description: 'Supporting features, cross-cutting concerns, platform integrations. Wire everything together.',
    });
    buildSteps.push({
      title: 'Phase D: Polish and edge cases',
      description: 'Loading states, error handling, empty states, animations, content overflow, and visual refinement.',
    });
  }

  if (inputs.projectType === 'genesis-template') {
    buildSteps.push({
      title: 'Build Genesis template slots',
      description: 'Define content slots/blocks compatible with Genesis. Document each slot type, description, and constraints. Test with sample content.',
      critical: true,
    });
  }

  if (inputs.projectType === 'component') {
    buildSteps.push({
      title: 'Define component API',
      description: 'Finalize props interface, events, slots, and default values. Document with TypeScript types and JSDoc.',
      critical: true,
    });
    buildSteps.push({
      title: 'Build component variants',
      description: 'Implement all visual states: default, hover, active, disabled, loading, error, empty.',
    });
  }

  if (inputs.dataTracking !== 'none') {
    const trackingLabel = inputs.dataTracking === 'both' ? 'GA4 + KTag' : inputs.dataTracking === 'ga4' ? 'GA4' : 'KTag';
    buildSteps.push({
      title: `Integrate ${trackingLabel} tracking`,
      description: `Add ${trackingLabel} event tracking to all interactive elements. Verify events fire correctly as you implement — don't leave all tracking to the end.`,
    });
  }

  buildSteps.push({
    title: 'Responsive implementation',
    description: 'Test and adjust layout across mobile (375px), tablet (768px), and desktop (1440px) breakpoints.',
  });

  phases.push({ name: 'Build', icon: '🏗️', steps: buildSteps });

  // ─── Phase 2.5: Review & Iterate (L/XL only) ────────────────────────────

  if (inputs.complexity === 'L' || inputs.complexity === 'XL') {
    const iterateSteps: WorkflowPhase['steps'] = [
      {
        title: 'Stakeholder demo',
        description: 'Show current progress to the stakeholder. Focus on core features and user flows, not implementation details.',
        critical: true,
      },
      {
        title: 'Collect and triage feedback',
        description: 'Document all feedback. Categorize as: must-fix (blocking), should-fix (before launch), nice-to-have (post-launch).',
      },
      {
        title: 'Incorporate feedback',
        description: 'Implement must-fix items. Discuss should-fix items if they affect scope or timeline.',
      },
      {
        title: 'Re-scope if needed',
        description: 'If feedback reveals new requirements or scope changes, update the plan and get confirmation before continuing.',
      },
    ];

    phases.push({ name: 'Review & Iterate', icon: '🔄', steps: iterateSteps });
  }

  // ─── Phase 3: Review & QA ────────────────────────────────────────────────

  const qaSteps: WorkflowPhase['steps'] = [
    { title: 'Self-review code quality', description: 'Check for TypeScript errors, unused imports, console logs, code style consistency, and potential security issues.' },
  ];

  if (inputs.designReadiness === 'full-figma' || inputs.designReadiness === 'wireframes') {
    qaSteps.push({
      title: 'Design fidelity check',
      description: 'Compare implementation against Figma designs side-by-side. Check spacing, colors, typography, component sizing, and responsive behavior.',
      critical: true,
    });
  }

  if (inputs.qaLevel === 'accessibility-audit' || inputs.qaLevel === 'full-regression') {
    qaSteps.push({
      title: 'Run accessibility audit',
      description: 'Run axe-core/Lighthouse audits (target ≥ 90). Test keyboard navigation, screen reader (VoiceOver), focus indicators, and color contrast.',
      critical: true,
    });
  }

  if (inputs.qaLevel === 'formal-qa' || inputs.qaLevel === 'full-regression') {
    qaSteps.push({
      title: 'Cross-browser testing',
      description: 'Test in Chrome, Safari, Firefox, and Edge. Check responsive breakpoints: 375px, 768px, 1024px, 1440px.',
    });
  }

  if (inputs.qaLevel === 'full-regression') {
    qaSteps.push({
      title: 'Performance benchmarking',
      description: 'Lighthouse performance ≥ 85. Core Web Vitals: LCP < 2.5s, CLS < 0.1, INP < 200ms.',
      critical: true,
    });
    qaSteps.push({
      title: 'Regression testing',
      description: 'Test all affected pages and flows. Verify no existing functionality is broken by this change.',
      critical: true,
    });
  }

  if (inputs.dataTracking !== 'none') {
    qaSteps.push({
      title: 'Verify tracking events',
      description: 'Trigger every tracked interaction. Confirm events appear in GA4 DebugView and/or KTag dashboard with correct parameters.',
      critical: inputs.dataTracking === 'both',
    });
  }

  if (inputs.projectType === 'migration') {
    qaSteps.push({
      title: 'Verify redirects and SEO',
      description: 'Test all URL redirects. Verify meta tags, structured data, and canonical URLs. Compare against pre-migration SEO baseline.',
      critical: true,
    });
  }

  phases.push({ name: 'Review & QA', icon: '✅', steps: qaSteps });

  // ─── Phase 4: Handoff & Release ──────────────────────────────────────────

  const handoffSteps: WorkflowPhase['steps'] = [];

  if (inputs.stakeholder === 'leadership') {
    handoffSteps.push({
      title: 'Prepare demo',
      description: 'Create a 3-5 minute walkthrough highlighting business impact and key outcomes.',
    });
  }

  handoffSteps.push({
    title: 'Update Jira tickets',
    description: 'Move GDCU tickets to review/done. Link PRs and add completion notes with screenshots.',
  });

  if (inputs.complexity === 'L' || inputs.complexity === 'XL') {
    handoffSteps.push({
      title: 'Document technical decisions',
      description: 'Add architecture notes, key decisions, and any known tech debt to Confluence (space 2373230).',
    });
  }

  handoffSteps.push({
    title: 'Create pull request',
    description: 'Open PR with: summary of changes, screenshots, testing notes, and any follow-up items. Request review from appropriate team members.',
    critical: true,
  });

  if (inputs.platformImpact === 'genesis') {
    handoffSteps.push({
      title: 'Coordinate Genesis deployment',
      description: 'Work with CMS team to publish template. Test in Genesis preview environment. Verify rendering with real content.',
      critical: true,
    });
  }

  handoffSteps.push({
    title: 'Deploy to staging and verify',
    description: 'Deploy to staging environment. Run through key flows. Verify tracking events fire in staging.',
    critical: true,
  });

  handoffSteps.push({
    title: 'Deploy to production and monitor',
    description: 'Deploy to production. Verify key flows work. Monitor for errors for 24-48 hours post-launch.',
    critical: true,
  });

  if (inputs.projectType === 'migration') {
    handoffSteps.push({
      title: 'Post-migration monitoring',
      description: 'Monitor: 404 errors (broken redirects), search ranking changes, analytics continuity, and user-reported issues for 72 hours.',
      critical: true,
    });
  }

  phases.push({ name: 'Handoff & Release', icon: '🚀', steps: handoffSteps });

  return phases;
}
