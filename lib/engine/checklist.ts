import type { ProjectInputs, ChecklistItem } from '../types';
import { label } from './helpers';

export function generateChecklist(inputs: ProjectInputs): ChecklistItem[] {
  const items: ChecklistItem[] = [];
  let id = 0;
  const add = (itemLabel: string, category: string, critical = false) => {
    items.push({ id: `check-${id++}`, label: itemLabel, category, critical, checked: false });
  };

  // ─── Setup ──────────────────────────────────────────────────────────────

  add('CLAUDE.md created in project root', 'Setup', true);
  add('Product spec reviewed and understood', 'Setup', true);
  add('Implementation plan outlined and confirmed', 'Setup', true);

  if (inputs.designReadiness !== 'no-design') {
    add('Figma MCP connected and design tokens pulled', 'Setup', inputs.designReadiness === 'full-figma');
  }

  if (inputs.devContext === 'existing-codebase') {
    add('Existing codebase patterns audited', 'Setup', true);
  }

  if (inputs.platformImpact !== 'standalone') {
    add(`${label(inputs.platformImpact)} integration points reviewed`, 'Setup', false);
  }

  if (inputs.projectType === 'migration') {
    add('Content audit completed', 'Setup', true);
    add('Redirect mapping created', 'Setup', true);
    add('Feature parity matrix documented', 'Setup', false);
    add('SEO baseline recorded', 'Setup', true);
  }

  if (inputs.projectType === 'redesign') {
    add('Current state documented (screenshots, URLs, features)', 'Setup', false);
  }

  // ─── Build (complexity-proportional) ────────────────────────────────────

  if (inputs.complexity === 'S') {
    add('Core feature implemented per spec', 'Build', true);
    add('Edge cases handled (empty states, errors)', 'Build', false);
  } else if (inputs.complexity === 'M') {
    add('Page layout and structure implemented', 'Build', true);
    add('Interactive features working', 'Build', true);
    add('Loading and error states handled', 'Build', false);
    add('Content overflow and edge cases handled', 'Build', false);
  } else if (inputs.complexity === 'L') {
    add('Phase A: Foundation and shared components complete', 'Build', true);
    add('Phase B: Primary features implemented', 'Build', true);
    add('Phase C: Secondary features and integrations complete', 'Build', true);
    add('Phase D: Polish and edge cases complete', 'Build', false);
    add('Stakeholder review completed after Phase B', 'Build', true);
    add('Feedback from review incorporated', 'Build', false);
  } else if (inputs.complexity === 'XL') {
    add('Phase A: Foundation and shared components complete', 'Build', true);
    add('Phase A: Review gate passed — structure confirmed', 'Build', true);
    add('Phase B: Primary features implemented', 'Build', true);
    add('Phase B: Review gate passed — features meet acceptance criteria', 'Build', true);
    add('Phase C: Secondary features and integrations complete', 'Build', true);
    add('Phase C: Review gate passed — ready for QA', 'Build', true);
    add('Phase D: Polish, edge cases, and error handling complete', 'Build', false);
    add('Stakeholder demos completed (at least 2)', 'Build', true);
    add('All feedback triaged and must-fix items resolved', 'Build', true);
    add('Architecture decisions documented', 'Build', false);
  } else {
    // Fallback if no complexity selected
    add('Core features implemented per spec', 'Build', true);
  }

  add('Responsive layout verified (mobile, tablet, desktop)', 'Build', true);

  if (inputs.devContext === 'vue-nuxt') {
    add('SiteHeader/SiteFooter imported from gdc-shared-components', 'Build', false);
  }

  if (inputs.projectType === 'genesis-template') {
    add('Genesis template slots defined with types and descriptions', 'Build', true);
    add('Template renders in Genesis preview environment', 'Build', true);
    add('Content editors can understand all slot purposes', 'Build', false);
  }

  if (inputs.projectType === 'component') {
    add('Component props interface defined with TypeScript types', 'Build', true);
    add('Component works in isolation', 'Build', true);
    add('Component works in context (within a page)', 'Build', false);
    add('All visual states implemented (hover, active, disabled, loading, error)', 'Build', false);
    add('Usage examples documented', 'Build', false);
  }

  if (inputs.designReadiness === 'full-figma') {
    add('Design fidelity verified against Figma specs', 'Build', true);
  }

  // ─── Tracking ───────────────────────────────────────────────────────────

  if (inputs.dataTracking === 'ga4' || inputs.dataTracking === 'both') {
    add('GA4 dataLayer.push() implemented for all interactions', 'Tracking', true);
    add('Event names follow snake_case convention', 'Tracking', false);
    add('Events verified in GA4 DebugView', 'Tracking', true);
    add('No PII in event parameters', 'Tracking', true);
  }

  if (inputs.dataTracking === 'ktag' || inputs.dataTracking === 'both') {
    add('KTag tracking implemented for all interactions', 'Tracking', false);
    add('Tag names follow [section]_[action]_[element] convention', 'Tracking', false);
    add('Event mapping shared with data team', 'Tracking', false);
  }

  // ─── QA ─────────────────────────────────────────────────────────────────

  add('No TypeScript errors or warnings', 'QA', true);
  add('No console.log statements in production code', 'QA', false);
  add('Semantic HTML with correct heading hierarchy', 'QA', false);

  if (inputs.qaLevel === 'formal-qa' || inputs.qaLevel === 'full-regression') {
    add('Cross-browser tested: Chrome', 'QA', true);
    add('Cross-browser tested: Safari', 'QA', true);
    add('Cross-browser tested: Firefox', 'QA', false);
    add('Cross-browser tested: Edge', 'QA', false);
    add('Responsive tested: 375px (mobile)', 'QA', true);
    add('Responsive tested: 768px (tablet)', 'QA', false);
    add('Responsive tested: 1440px (desktop)', 'QA', true);
  }

  if (inputs.qaLevel === 'accessibility-audit' || inputs.qaLevel === 'full-regression') {
    add('Lighthouse accessibility score ≥ 90', 'QA', true);
    add('Keyboard navigation works for all interactive elements', 'QA', true);
    add('Screen reader tested (VoiceOver)', 'QA', false);
    add('Color contrast ratios meet WCAG AA (4.5:1 normal, 3:1 large)', 'QA', true);
    add('All images have descriptive alt text', 'QA', false);
    add('Focus indicators visible on all interactive elements', 'QA', true);
  }

  if (inputs.qaLevel === 'full-regression') {
    add('Lighthouse performance score ≥ 85', 'QA', true);
    add('LCP < 2.5s', 'QA', true);
    add('CLS < 0.1', 'QA', true);
    add('INP < 200ms', 'QA', false);
    add('Regression tests pass on all affected pages', 'QA', true);
  }

  // ─── Handoff ────────────────────────────────────────────────────────────

  add('Jira tickets updated (GDCU)', 'Handoff', false);
  add('Pull request created with description and screenshots', 'Handoff', true);

  if (inputs.complexity === 'L' || inputs.complexity === 'XL') {
    add('Technical decisions documented in Confluence', 'Handoff', false);
  }

  if (inputs.stakeholder === 'leadership') {
    add('Demo prepared for stakeholder review', 'Handoff', false);
  }

  if (inputs.projectType === 'migration') {
    add('All redirects verified (no 404s)', 'Handoff', true);
    add('SEO metrics compared against baseline', 'Handoff', true);
  }

  add('Deployed to staging and verified', 'Handoff', true);
  add('Deployed to production and verified', 'Handoff', true);

  if (inputs.projectType === 'migration') {
    add('Post-migration monitoring (72 hours): no 404s, analytics intact', 'Handoff', true);
  }

  return items;
}
