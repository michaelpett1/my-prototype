import type { DesignGateInputs } from '../types';
import { getStackBlock, getQAContext, deriveFullInputs } from './helpers';

export function generateClaudeMd(inputs: DesignGateInputs): string {
  const full = deriveFullInputs(inputs);
  const sections: string[] = [];

  sections.push(`# CLAUDE.md — ${inputs.projectName || 'Project'}\n`);

  // Product spec
  if (inputs.productSpec) {
    sections.push(`## Product Spec\n\n${inputs.productSpec}`);
  } else {
    sections.push(`## Overview\nSee product spec for full details.`);
  }

  // Design Standards — ALWAYS present regardless of Figma
  sections.push(`## Design Standards (Mandatory)

These standards apply to ALL builds. Non-negotiable.

### Typography
- **Font family:** Red Hat Display
- **Weights:** 400 (regular body), 600 (semibold headings/CTAs)
- **Base size:** 16px body, scale up for headings
- Do NOT use system fonts or other font families

### Colors
- **Primary blue:** \`#0157FF\` (gdc-blue) — CTAs, links, primary actions
- **Red:** \`#FF0000\` (gdc-red) — alerts, critical badges, accents
- **Grays:** Use a consistent gray scale for text, borders, backgrounds
- Do NOT invent brand colors — use only the GDC palette

### Layout
- **Max width:** 1200px, centered with \`margin: 0 auto\`
- **Spacing grid:** 8px increments (8, 16, 24, 32, 48, 64)
- **Side padding:** Minimum 16px on mobile, 24px on tablet, 32px+ on desktop
- **Sections:** Consistent vertical rhythm between page sections

### CTAs & Buttons
- **Primary CTA:** gdc-blue background, white text, **UPPERCASE**, semibold 600
- **Secondary CTA:** outlined or subtle background, same uppercase convention
- **Touch targets:** Minimum 44x44px on mobile

### Components
- Use \`SiteHeader.vue\` and \`SiteFooter.vue\` from \`gdc-shared-components\`
- Match existing GDC component patterns — do not create divergent styles

### GDC Forge Design System
- File key: \`tv4qY8lj7ZAxj6wuefWsjw\`
- Entry node: \`7610-437\`
- URL: https://www.figma.com/design/tv4qY8lj7ZAxj6wuefWsjw/GDC-Design-System
- Call \`get_design_context\` or \`search_design_system\` before implementing any component`);

  // Figma reference
  if (inputs.figmaUrl) {
    sections.push(`## Figma Reference
- **Project Figma:** ${inputs.figmaUrl}
- Follow Figma specs pixel-perfectly — extract exact values, don't guess
- Call \`get_design_context\` with node IDs from this file before implementing`);
  } else if (inputs.category !== 'prototype') {
    sections.push(`## Design Reference
- **No project-specific Figma provided**
- Reference GDC Forge Design System for all component patterns
- Every independent design decision must be documented in the Design Review Brief
- When uncertain, match existing GDC page patterns`);
  }

  // Stack
  sections.push(getStackBlock(full));

  // File structure
  if (full.devContext === 'vue-nuxt') {
    sections.push(`## File Structure
\`\`\`
pages/           # Route pages
components/      # Reusable Vue components
composables/     # Shared composition functions
stores/          # Pinia stores (if needed)
assets/          # Static assets, global styles
types/           # TypeScript type definitions
\`\`\`
- Components: PascalCase (e.g., \`OperatorCard.vue\`)
- Composables: camelCase with \`use\` prefix (e.g., \`useOperatorData.ts\`)
- Pages: kebab-case matching URL path`);
  } else if (full.devContext === 'nextjs-react') {
    sections.push(`## File Structure
\`\`\`
app/             # App Router pages and layouts
components/      # Reusable React components
lib/             # Utilities, data fetching, types
public/          # Static assets
\`\`\`
- Server Components by default, \`'use client'\` only for interactivity
- Co-locate related files: \`ComponentName/index.tsx\``);
  }

  // Platform
  if (full.platformImpact !== 'standalone' && full.platformImpact) {
    const platformDetails: Record<string, string> = {
      genesis: `## Platform: Genesis (CMS)
- Content management and template publishing
- Templates define content slots that editors populate
- Slot naming: camelCase (e.g., \`heroTitle\`, \`featuredOperators\`)
- Publishing pipeline: Draft → Preview → Staging → Production
- Schema changes require CMS team coordination`,
      eve: `## Platform: Eve (Commercial)
- Operator data, offers, and affiliate placements
- All operator links must use Eve-generated affiliate URLs
- Use \`rel="noopener noreferrer sponsored"\` on affiliate links
- Handle edge cases: expired offers, missing data, geo-restrictions`,
      origins: `## Platform: Origins (Media)
- Editorial content and asset management
- SEO is critical: unique titles, meta descriptions, structured data (JSON-LD)
- Images served through Origins CDN with query params for sizing
- Heading hierarchy must be correct for article content`,
    };
    sections.push(platformDetails[full.platformImpact] ?? '');
  }

  // Tracking
  if (full.dataTracking !== 'none' && full.dataTracking) {
    const trackingLines: string[] = ['## Tracking'];
    if (full.dataTracking === 'ga4' || full.dataTracking === 'both') {
      trackingLines.push(`- GA4: use \`dataLayer.push()\` pattern
- Event names: snake_case (e.g., \`cta_click\`, \`form_submit\`)
- Test in GA4 DebugView before marking complete`);
    }
    if (full.dataTracking === 'ktag' || full.dataTracking === 'both') {
      trackingLines.push(`- KTag: tag format \`[section]_[action]_[element]\`
- Mirror GA4 events where applicable`);
    }
    sections.push(trackingLines.join('\n'));
  }

  // QA
  sections.push(`## QA
- ${getQAContext(full) || 'Standard review'}`);

  // Key decisions
  sections.push(`## Key Decisions
<!-- Document important decisions as you make them -->
<!-- Format: Decision | Rationale | Date -->
- *No decisions recorded yet — update as the project progresses*`);

  // Project management
  sections.push(`## Project Management
- Jira: GDCU project
- Confluence: space 2373230`);

  // Conventions
  sections.push(`## Conventions
- Commit working increments frequently
- No \`console.log\` in production code
- Follow existing file naming and directory patterns
- Write semantic HTML with proper heading hierarchy
- Ensure responsive design across all breakpoints
- PR descriptions: what changed, why, screenshots, testing notes`);

  return sections.join('\n\n');
}
