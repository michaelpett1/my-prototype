import type { DesignGateInputs } from '../types';
import {
  label, complexityLabel, getStackBlock, getFigmaBlock,
  getTrackingBlock, getPlatformBlock, getStakeholderContext,
  getQAContext, getProjectTypeSection, getComplexitySection,
  deriveFullInputs, getDesignCheckpointBlock,
} from './helpers';

export function generateInitialPrompt(inputs: DesignGateInputs): string {
  const full = deriveFullInputs(inputs);
  const isPrototype = inputs.category === 'prototype';
  const sections: string[] = [];

  // Header
  sections.push(`# Project: ${inputs.projectName || 'Untitled Project'}\n`);

  // Project context summary
  sections.push(`## Project Context
- **Category:** ${label(inputs.category)}
- **Type:** ${label(full.projectType)}
- **Complexity:** ${complexityLabel(full.complexity)}
- **Design:** ${inputs.figmaUrl ? 'Figma provided' : 'No Figma — Design System enforcement mode'}
- **QA Level:** ${label(full.qaLevel)}
- **Dev Context:** ${label(full.devContext)}
- **Tracking:** ${label(full.dataTracking)}
- **Platform:** ${label(full.platformImpact)}`);

  // Stakeholder context (if override set)
  const stakeholderCtx = getStakeholderContext(full);
  if (stakeholderCtx) {
    sections.push(`> ${stakeholderCtx.split('\n')[0]}\n\n${stakeholderCtx.split('\n').slice(1).join('\n')}`);
  }

  // Product spec
  if (inputs.productSpec) {
    sections.push(`## Product Spec\n\n${inputs.productSpec}`);
  }

  // Design Checkpoint Protocol — THE CORE CHANGE
  sections.push(getDesignCheckpointBlock(inputs.figmaUrl, isPrototype));

  // Stack conventions
  sections.push(getStackBlock(full));

  // Figma / Design detail
  sections.push(getFigmaBlock(full));

  // Key decisions and complexity-aware sections
  sections.push(getComplexitySection(full));

  // Project-type-specific section
  const typeSection = getProjectTypeSection(full);
  if (typeSection) sections.push(typeSection);

  // Tracking
  const trackingBlock = getTrackingBlock(full);
  if (trackingBlock) sections.push(trackingBlock);

  // Platform
  const platformBlock = getPlatformBlock(full);
  if (platformBlock) sections.push(platformBlock);

  // QA
  const qaCtx = getQAContext(full);
  if (qaCtx) {
    sections.push(`## QA Requirements\n${qaCtx}`);
  }

  // Project management
  sections.push(`## Project Management
- **Jira:** GDCU project — create/update tickets as work progresses
- **Confluence:** Space 2373230 — document decisions and technical notes
- Commit working increments frequently — don't let work pile up in uncommitted changes
- PR descriptions should include: what changed, why, screenshots, testing notes`);

  // Workflow instructions (absorbs old Workflow tab)
  sections.push(`## Build Instructions

**Follow these steps in order:**

1. **Read this entire spec** — understand the full scope before starting
2. **Create a CLAUDE.md** in the project root with project-specific conventions
3. **${inputs.figmaUrl ? 'Connect to Figma' : 'Connect to GDC Design System'}** — call \`get_design_context\` to verify MCP connection${inputs.figmaUrl ? ' and pull design tokens from the provided Figma file' : ' and pull GDC Forge tokens'}
4. **Outline an implementation plan** — break work into sections, identify the critical path
5. **Get confirmation** on the plan before writing code
6. **Build section by section** — after each section, run the Design Checkpoint (screenshot, compare, fix)
7. **Implement tracking** — add events per the tracking spec above
8. **Run responsive checks** — screenshot at 375px, 768px, 1440px
9. **Final Design Fidelity Check** — full comparison before marking complete
10. **Generate the Design Review Brief** — document all design decisions for the reviewer

**If you get blocked:**
- Surface the blocker immediately rather than guessing
- If a design detail is unclear, check Figma/design system first, then ask
- If scope is larger than expected, flag it and propose a revised plan`);

  // Completion criteria
  sections.push(`## Completion Criteria

This project is NOT complete until:
- [ ] All sections match the spec requirements
- [ ] Design Checkpoint Protocol has been followed for every section
- [ ] ${inputs.figmaUrl ? 'Figma fidelity verified at all breakpoints' : 'GDC Design System tokens used consistently throughout'}
- [ ] ${full.dataTracking !== 'none' ? 'All tracking events implemented and tested' : 'N/A — no tracking required'}
- [ ] Responsive layout verified at 375px, 768px, 1440px
- [ ] ${full.qaLevel === 'light-review' ? 'Basic peer review completed' : 'QA pass completed per requirements above'}
- [ ] Design Review Brief generated for reviewer sign-off
- [ ] Shared components (SiteHeader, SiteFooter) integrated${full.platformImpact === 'standalone' ? ' (if applicable)' : ''}
- [ ] No console errors, no broken layouts, no placeholder content`);

  return sections.join('\n\n');
}
