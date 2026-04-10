import type { ProjectInputs, DesignGateInputs } from '../types';
import { BUILD_CATEGORIES } from '../constants';

// ─── Label Formatting ──────────────────────────────────────────────────────

export function label(value: string | null, fallback = 'Not specified'): string {
  if (!value) return fallback;
  return value
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .replace('Qa', 'QA')
    .replace('Ga4', 'GA4')
    .replace('Ktag', 'KTag')
    .replace('Poc', 'POC')
    .replace('Nextjs', 'Next.js')
    .replace('Vue Nuxt', 'Vue 3 / Nuxt')
    .replace('Media Content', 'Media / Content');
}

export function complexityLabel(c: string | null): string {
  const map: Record<string, string> = {
    S: 'Small (hours)', M: 'Medium (1-3 days)', L: 'Large (1-2 weeks)', XL: 'Extra Large (2+ weeks)'
  };
  return c ? map[c] ?? c : 'Not specified';
}

// ─── Stack Conventions ──────────────────────────────────────────────────────

export function getStackBlock(inputs: ProjectInputs): string {
  const { devContext } = inputs;
  if (devContext === 'vue-nuxt') {
    return `## Stack & Conventions
- **Framework:** Vue 3 / Nuxt 3
- **Font:** Red Hat Display (weights 400, 600)
- **Colors:** gdc-blue \`#0157FF\`, gdc-red \`#FF0000\`
- **CTAs:** Uppercase text
- **Max width:** 1200px
- **Shared components:** Import \`SiteHeader.vue\` and \`SiteFooter.vue\` from \`gdc-shared-components\`
- Follow existing project patterns for composables, stores, and directory structure
- Use \`<script setup lang="ts">\` for all new components
- Prefer composables over mixins for shared logic
- Use Pinia for state management if needed`;
  }
  if (devContext === 'nextjs-react') {
    return `## Stack & Conventions
- **Framework:** Next.js (App Router) with TypeScript
- **Font:** Red Hat Display (weights 400, 600)
- **Colors:** gdc-blue \`#0157FF\`, gdc-red \`#FF0000\`
- **CTAs:** Uppercase text
- **Max width:** 1200px
- Use React Server Components where possible, client components only when needed
- Prefer \`fetch\` with Next.js caching over client-side data fetching
- Use \`'use client'\` directive only for interactive components`;
  }
  if (devContext === 'prototype-flexible') {
    return `## Stack & Conventions
- **Framework:** Flexible — optimize for speed of iteration
- Use whatever stack best demonstrates the concept
- Keep it simple — no premature optimization
- Tailwind CSS preferred for rapid styling
- Deploy to Vercel or similar for quick sharing`;
  }
  if (devContext === 'existing-codebase') {
    return `## Stack & Conventions
- **Framework:** Match the existing codebase patterns exactly
- Read existing code first to understand conventions before writing new code
- Follow existing directory structure, naming conventions, and component patterns
- **Font:** Red Hat Display (weights 400, 600)
- **Colors:** gdc-blue \`#0157FF\`, gdc-red \`#FF0000\`
- Do not introduce new dependencies without checking existing alternatives first
- Match existing test patterns and coverage expectations`;
  }
  return `## Stack & Conventions
- Follow GDC defaults: Red Hat Display 400/600, gdc-blue #0157FF, gdc-red #FF0000, uppercase CTAs, 1200px max width`;
}

// ─── Figma Block ────────────────────────────────────────────────────────────

export function getFigmaBlock(inputs: ProjectInputs): string {
  if (inputs.designReadiness === 'no-design') {
    return `## Design
No Figma designs provided. Use GDC Design System defaults and your best judgment for layout and styling.
- Reference the GDC Forge Design System for component patterns: file key \`tv4qY8lj7ZAxj6wuefWsjw\`
- Use consistent spacing (8px grid), standard border radii, and GDC color palette
- When in doubt, look at existing pages for visual precedent`;
  }

  const detail = inputs.designReadiness === 'full-figma'
    ? `Full Figma specs are available. Follow them pixel-perfectly.`
    : inputs.designReadiness === 'wireframes'
    ? `Wireframes/rough designs are available. Use them for layout structure, fill in details from the design system.`
    : `Design is described verbally in the spec. Reference the GDC Design System for component patterns.`;

  return `## Design & Figma MCP
${detail}

**Figma MCP is connected.** Use it to pull design tokens and component specs:
- GDC Forge Design System file key: \`tv4qY8lj7ZAxj6wuefWsjw\`
- Design System entry node: \`7610-437\`
- Design System URL: https://www.figma.com/design/tv4qY8lj7ZAxj6wuefWsjw/GDC-Design-System
- **Before implementing any component**, call \`get_design_context\` with the node ID from Figma
- Use \`get_figma_data\` to inspect specific frames and extract exact values
- Extract spacing tokens, color values, and typography specs — do not guess from screenshots
- Check for responsive variants in Figma (mobile, tablet, desktop frames)`;
}

// ─── Tracking Block ─────────────────────────────────────────────────────────

export function getTrackingBlock(inputs: ProjectInputs): string {
  if (inputs.dataTracking === 'none') return '';

  const parts: string[] = [`## Data Tracking`];

  if (inputs.dataTracking === 'ga4' || inputs.dataTracking === 'both') {
    parts.push(`### GA4 Events

**Implementation pattern:**
\`\`\`javascript
window.dataLayer = window.dataLayer || [];
window.dataLayer.push({
  event: 'event_name',
  event_category: 'category',
  event_label: 'descriptive_label',
  event_action: 'action_type',
  value: undefined // optional numeric value
});
\`\`\`

**Event naming conventions:**
- All event names use \`snake_case\` (e.g., \`cta_click\`, \`form_submit\`, \`page_section_view\`)
- Category groups: \`navigation\`, \`engagement\`, \`conversion\`, \`content\`, \`error\`
- Labels should be descriptive and unique: \`hero_signup_button\`, \`footer_contact_link\`

**Standard events to implement:**
| Event | When | Parameters |
|-------|------|-----------|
| \`cta_click\` | Any CTA button clicked | \`event_label\`: button text, \`event_category\`: page section |
| \`form_submit\` | Form successfully submitted | \`event_label\`: form name, \`event_category\`: conversion |
| \`outbound_link_click\` | External link clicked | \`event_label\`: destination URL, \`event_category\`: navigation |
| \`accordion_toggle\` | FAQ/accordion opened | \`event_label\`: section title, \`event_action\`: open/close |
| \`carousel_interaction\` | Carousel slide changed | \`event_label\`: slide index, \`event_action\`: next/prev/dot |
| \`page_section_view\` | Section scrolled into view | \`event_label\`: section ID, \`event_category\`: engagement |
| \`error_view\` | Error state displayed | \`event_label\`: error type, \`event_category\`: error |

**Testing workflow:**
1. Open Chrome DevTools → Console → filter for \`dataLayer\`
2. Trigger each tracked interaction and verify the push appears
3. Open GA4 DebugView (Admin → DebugView) to confirm events arrive
4. Verify parameter values are populated and correctly formatted
5. Check no duplicate events fire on single interactions

**Common pitfalls:**
- Don't push events inside \`useEffect\` cleanup functions
- Ensure dataLayer exists before pushing (use the guard pattern above)
- Don't track PII (emails, names) in event parameters
- Debounce scroll-triggered events to avoid flooding`);
  }

  if (inputs.dataTracking === 'ktag' || inputs.dataTracking === 'both') {
    parts.push(`### KTag (Internal Tracking)

**Implementation pattern:**
- KTag tracks internal engagement metrics separate from GA4
- Tag naming convention: \`[section]_[action]_[element]\` (e.g., \`hero_click_signup\`, \`offers_view_card\`)
- Look for existing KTag utility functions in the codebase before creating new ones
- All KTag events should mirror GA4 events where applicable for data consistency

**Coordination with data team:**
- Share your event plan with the data team before implementing
- Confirm tag names match the expected schema in the KTag dashboard
- Request a test environment tag endpoint if available
- After implementation, send the data team a mapping document: event name → trigger condition → expected frequency`);
  }

  return parts.join('\n\n');
}

// ─── Platform Block ─────────────────────────────────────────────────────────

export function getPlatformBlock(inputs: ProjectInputs): string {
  if (inputs.platformImpact === 'standalone') return '';

  const platforms: Record<string, string> = {
    genesis: `## Platform: Genesis (CMS)

Genesis is our CMS for content management and template publishing. Your code must work within the Genesis template system.

**Template Architecture:**
- Templates define **slots** (named content regions) that editors populate in the CMS
- Each slot has a type: \`text\`, \`rich-text\`, \`image\`, \`link\`, \`repeater\` (list of items), \`reference\` (link to another entity)
- Slot naming convention: \`camelCase\` descriptive names (e.g., \`heroTitle\`, \`featuredOperators\`, \`ctaButtonText\`)
- Repeater slots define a sub-schema for each item (e.g., a \`benefits\` repeater with \`icon\`, \`title\`, \`description\` per item)

**Content Schema Design:**
- Keep schemas flat where possible — deeply nested structures are hard for editors to manage
- Provide sensible defaults and clear field descriptions for every slot
- Mark required vs optional fields — editors need to know the minimum viable content
- Consider max lengths for text fields to prevent layout breakage

**Publishing Pipeline:**
- Templates are published through the Genesis pipeline: Draft → Preview → Staging → Production
- Always test with the Genesis preview environment before marking complete
- Template changes may require a cache purge — coordinate with the CMS team
- Schema changes (adding/removing slots) require a migration — never break existing content

**Content Editor UX:**
- Editors are non-technical — slot names and descriptions should be self-explanatory
- Group related slots logically (hero section slots together, footer slots together)
- Add helper text to complex slots explaining what content is expected
- Preview should accurately reflect how content will render on the live site`,

    eve: `## Platform: Eve (Commercial)

Eve is the commercial tool for operator data, offers, and affiliate placements. Your code consumes Eve's data APIs.

**Operator Entity Model:**
\`\`\`typescript
interface Operator {
  id: string;
  name: string;               // e.g., "BetMGM", "DraftKings"
  slug: string;               // URL-safe identifier
  rating: number;             // 0-5 scale, one decimal
  logo: { url: string; alt: string };
  bonus: {
    headline: string;         // e.g., "Up to $1,000 First Bet"
    description: string;      // Terms summary
    value: number;            // Numeric value for sorting
    currency: string;         // "USD", "GBP", etc.
  };
  termsUrl: string;           // T&Cs link (required for compliance)
  affiliateLink: string;      // Tracked outbound link
  features: string[];         // e.g., ["Live Betting", "Cash Out", "Same Game Parlay"]
  availability: string[];     // US state codes or country codes
}
\`\`\`

**Offer Data Structure:**
- Offers are time-sensitive — always check \`startDate\` and \`endDate\` before rendering
- Promotional offers may have geo-restrictions — filter by user location when available
- Offer display must include T&Cs link and any required disclaimers

**Affiliate Link Handling:**
- All operator links MUST use the Eve-generated affiliate URL — never hardcode or modify
- Affiliate links include tracking parameters — do not strip query strings
- Use \`rel="noopener noreferrer sponsored"\` on all affiliate links
- Log affiliate link clicks as both GA4 and KTag events if tracking is enabled

**Data Contract Coordination:**
- Eve API responses may change shape — use TypeScript interfaces and validate at runtime
- Test with realistic operator/offer data (minimum 5-10 operators)
- Handle edge cases: missing logos, empty bonus descriptions, expired offers
- Coordinate with the commercial team on any new data fields needed`,

    origins: `## Platform: Origins (Media)

Origins is the media tool for editorial content and asset management. Your code integrates with Origins for articles, reviews, and media assets.

**Editorial Content Model:**
- Articles have: \`title\`, \`slug\`, \`excerpt\`, \`body\` (rich text), \`author\`, \`publishDate\`, \`updateDate\`, \`category\`, \`tags[]\`
- Reviews extend articles with: \`rating\`, \`pros[]\`, \`cons[]\`, \`verdict\`, \`relatedOperator\` (links to Eve)
- Content is organized by taxonomy: Category → Subcategory → Tags
- Slugs are URL-safe and must be unique within their category

**Asset Pipeline:**
- Images are served through the Origins CDN with automatic optimization
- Request images at the size you need: append \`?w=800&h=400&fit=crop\` to asset URLs
- Always provide \`alt\` text from the asset metadata — Origins stores this per-image
- Support WebP format with JPEG fallback for older browsers
- Lazy-load images below the fold for performance

**SEO Requirements (Critical for editorial content):**
- Every page needs: unique \`<title>\`, \`<meta description>\`, canonical URL
- Use structured data (JSON-LD) for articles: \`Article\` or \`Review\` schema
- Heading hierarchy must be correct: one \`<h1>\` (article title), then \`<h2>\`, \`<h3>\` etc.
- Internal links should use descriptive anchor text, not "click here"
- Implement breadcrumb navigation with \`BreadcrumbList\` schema

**Taxonomy & Navigation:**
- Categories and tags come from Origins — don't hardcode them
- Category pages should support pagination (12-20 items per page)
- Tag pages aggregate content across categories
- Coordinate with the content team before adding new categories or changing taxonomy structure`,
  };

  return platforms[inputs.platformImpact ?? ''] ?? '';
}

// ─── Stakeholder Context ────────────────────────────────────────────────────

export function getStakeholderContext(inputs: ProjectInputs): string {
  const map: Record<string, string> = {
    marketing: `Marketing stakeholder — prioritize visual polish, brand consistency, and launch timeline.
- Review cycles will focus on copy accuracy, visual details, and brand alignment
- Expect 1-2 rounds of visual feedback — prepare screenshot comparisons
- Launch date is likely fixed — flag scope risks early, don't let polish items slip the timeline
- Marketing may provide last-minute copy changes — keep content easily editable`,
    product: `Product stakeholder — prioritize user experience, metrics, and spec adherence.
- Review will be structured against acceptance criteria — ensure every requirement is testable
- Product will want to see data: conversion metrics, user flow analytics, performance scores
- Expect questions about edge cases and error states — document handling for each
- Feature completeness matters more than visual perfection in early reviews`,
    engineering: `Engineering stakeholder — prioritize code quality, performance, and maintainability.
- Review will focus on code architecture, test coverage, and technical debt
- Performance benchmarks will be scrutinized — run Lighthouse before submitting for review
- Documentation expectations are higher — include JSDoc for public APIs
- Follow existing patterns strictly — consistency matters more than cleverness`,
    commercial: `Commercial stakeholder — prioritize data accuracy, offer rendering, and affiliate compliance.
- Every affiliate link must be correctly tracked — broken tracking = lost revenue
- Operator data must render accurately — wrong bonus amounts or missing T&Cs are critical bugs
- Expect review focused on commercial data integrity and compliance requirements
- Test with edge cases: expired offers, missing data fields, geo-restricted content`,
    'media-content': `Media/Content stakeholder — prioritize content structure, SEO, and editorial workflow.
- SEO performance is a primary concern — run Lighthouse SEO audit before review
- Content rendering must handle varying article lengths and media types gracefully
- Editorial workflow matters: how easy is it for editors to publish and update content?
- Expect review focused on content presentation, readability, and discoverability`,
    leadership: `Leadership stakeholder — prioritize high-level outcomes and strategic alignment.
- Prepare a concise demo (3-5 minutes) highlighting business impact
- Progress updates should be brief: what's done, what's next, any blockers
- Leadership may not review code — focus demo on user-facing outcomes
- Be prepared to explain trade-offs in business terms, not technical ones`,
  };
  return map[inputs.stakeholder ?? ''] ?? '';
}

// ─── QA Context ─────────────────────────────────────────────────────────────

export function getQAContext(inputs: ProjectInputs): string {
  const map: Record<string, string> = {
    'light-review': 'Light review — peer check for obvious issues, basic responsive and cross-browser spot checks.',
    'formal-qa': `Formal QA pass — structured test cases required:
- Cross-browser: Chrome, Safari, Firefox, Edge (latest versions)
- Responsive: 375px (mobile), 768px (tablet), 1024px (small desktop), 1440px (desktop)
- Document any issues found with screenshots and steps to reproduce
- All interactive elements must be tested (forms, modals, accordions, navigation)`,
    'accessibility-audit': `Accessibility audit — WCAG 2.1 AA compliance required:
- Run axe-core/Lighthouse accessibility audits — target score ≥ 90
- Test full keyboard navigation (Tab, Enter, Escape, Arrow keys)
- Test with VoiceOver (macOS) — verify all content is announced correctly
- Check color contrast ratios: minimum 4.5:1 for normal text, 3:1 for large text
- Verify focus indicators are visible on all interactive elements
- Ensure all images have descriptive alt text
- Form inputs must have associated labels
- Error messages must be programmatically associated with their fields`,
    'full-regression': `Full regression — complete test suite across all affected areas:
- All formal QA checks (cross-browser, responsive, interactive elements)
- All accessibility audit checks (WCAG 2.1 AA)
- Performance: Lighthouse performance score ≥ 85, LCP < 2.5s, CLS < 0.1, INP < 200ms
- Regression: verify no existing pages or features are broken
- Load testing: page should handle expected traffic without degradation
- Error handling: test offline states, API failures, and network timeouts`,
  };
  return map[inputs.qaLevel ?? ''] ?? '';
}

// ─── Project Type Specific Sections ─────────────────────────────────────────

export function getProjectTypeSection(inputs: ProjectInputs): string {
  const { projectType } = inputs;

  if (projectType === 'migration') {
    return `## Migration-Specific Requirements

**Before starting the migration:**
1. **Content audit** — inventory all content on the source page/system. Document: URLs, content blocks, images, forms, interactive elements
2. **Redirect mapping** — create a URL redirect map (old URL → new URL) for every page being migrated
3. **Feature parity matrix** — list every feature/behavior on the source. Mark each as: migrate as-is, redesign, deprecate
4. **SEO baseline** — record current search rankings, indexed pages, and backlink profile for comparison post-migration

**During migration:**
- Implement redirects (301 permanent) for all changed URLs
- Preserve existing analytics tracking — don't create gaps in historical data
- Maintain meta tags, structured data, and canonical URLs
- Test that internal links point to new URLs, not old ones

**Rollback plan:**
- Keep the old implementation available (don't delete) until migration is verified in production
- Document how to revert if critical issues are found post-launch
- Set a monitoring period (48-72 hours post-launch) to catch issues`;
  }

  if (projectType === 'redesign') {
    return `## Redesign-Specific Requirements

**What to preserve (do not break these):**
- Existing URLs — do not change URL paths unless explicitly required
- Analytics continuity — maintain the same event names so historical data remains comparable
- SEO equity — preserve meta tags, structured data, heading hierarchy, and internal link structure
- Existing functionality — all current features must work unless explicitly marked for removal
- Accessibility level — the redesign must be at least as accessible as the current version

**Redesign approach:**
1. Screenshot/document the current state before making changes
2. Identify what's changing (layout, content, features) vs what's staying
3. Implement changes incrementally — don't rewrite from scratch unless necessary
4. A/B comparison: keep a reference to the old design for side-by-side review`;
  }

  if (projectType === 'component') {
    return `## Component Build Requirements

**Component API Contract:**
\`\`\`typescript
// Define clear props interface before implementing
interface ComponentNameProps {
  // Required props — minimum needed to render
  // Optional props — with sensible defaults
  // Event callbacks — for parent communication
  // Slot definitions — for content injection
}
\`\`\`

**Component checklist:**
- Works in isolation (storybook/standalone page) AND in context (within a real page)
- All props have TypeScript types and JSDoc descriptions
- Default values are sensible — component renders meaningfully with only required props
- Responsive across all breakpoints without external layout constraints
- Follows GDC Design System tokens for colors, spacing, typography
- Emits events for all meaningful interactions (click, change, toggle, etc.)
- Handles edge cases: empty data, long text, missing images, loading states
- Has usage examples showing common configurations`;
  }

  if (projectType === 'genesis-template') {
    return `## Genesis Template Requirements

**Template slot design:**
- Define all content slots with clear types and descriptions
- Group slots by page section (hero, body, sidebar, footer)
- Repeater slots need a well-defined item schema with min/max count
- Provide fallback content for optional slots so the template renders without full content

**Genesis compatibility checklist:**
- Template renders correctly in the Genesis preview environment
- All slots are editable through the Genesis CMS interface
- Content editors can understand each slot's purpose without developer help
- Template handles missing/optional content gracefully (no broken layouts)
- Schema is documented in a format the CMS team can review

**Publishing pipeline:**
- Draft → Preview → Staging → Production
- Test at each stage — don't skip preview
- Schema changes require migration coordination with the CMS team`;
  }

  return '';
}

// ─── Complexity-Aware Sections ──────────────────────────────────────────────

export function getComplexitySection(inputs: ProjectInputs): string {
  const sections: string[] = [];

  // Key decisions section for all complexities
  sections.push(`## Key Decisions to Confirm Before Starting

Before writing code, surface and resolve these questions:
- Are there any ambiguities in the spec that could change the approach?
- Are all external dependencies available (APIs, data, design assets)?
- Who approves the implementation plan before development begins?
- What is the expected review cadence (async PR review, scheduled demo, etc.)?
- Are there any known constraints (timeline, browser support, performance budgets)?`);

  // Phased plan for L/XL
  if (inputs.complexity === 'L' || inputs.complexity === 'XL') {
    sections.push(`## Phased Implementation Plan

For a project of this size, break the work into distinct phases with review gates:

### Phase A: Foundation
- Project scaffolding, routing, shared layout
- Core data models and API integration
- **Review gate:** Stakeholder confirms structure before building features

### Phase B: Core Features
- Primary functionality from the spec
- Key user flows end-to-end
- **Review gate:** Feature review — does it meet acceptance criteria?

### Phase C: Polish & Integration
- Design fidelity refinement
- Tracking implementation
- Edge cases and error handling
- **Review gate:** QA review — ready for formal testing?

### Phase D: QA & Launch
- Full QA pass per the selected QA level
- Bug fixes from QA feedback
- Deployment and post-launch monitoring
- **Review gate:** Stakeholder sign-off for production release

**Between each phase:**
- Commit and push working code — never let work pile up
- Update Jira tickets with progress
- Flag any scope changes or blockers immediately
- If a phase reveals that the plan needs adjustment, propose changes before continuing`);
  }

  if (inputs.complexity === 'XL') {
    sections.push(`### Risk Management (XL Project)
- Identify the highest-risk items and tackle them first (de-risk early)
- Plan for iteration — first pass won't be perfect, budget time for refinement
- If multiple people are involved, define clear ownership boundaries
- Weekly sync with stakeholder to surface issues before they become blockers
- Document architectural decisions as you make them — future contributors will need context`);
  }

  return sections.join('\n\n');
}

// ─── Design Gate Helpers ───────────────────────────────────────────────────

export function deriveFullInputs(inputs: DesignGateInputs): ProjectInputs {
  const categoryDef = BUILD_CATEGORIES.find(c => c.value === inputs.category);
  const defaults = categoryDef?.defaults ?? {
    projectType: null, complexity: null, stakeholder: null,
    designReadiness: null, qaLevel: null, devContext: null,
    dataTracking: null, platformImpact: null,
  };

  // Determine design readiness from figma URL if no override
  let designReadiness = defaults.designReadiness;
  if (inputs.figmaUrl.trim()) {
    designReadiness = 'full-figma';
  } else if (inputs.category !== 'prototype' && !inputs.overrides?.designReadiness) {
    designReadiness = 'no-design';
  }

  return {
    projectName: inputs.projectName,
    productSpec: inputs.productSpec,
    ...defaults,
    designReadiness,
    ...(inputs.overrides ?? {}),
  };
}

export function getDesignCheckpointBlock(figmaUrl: string, isPrototype: boolean): string {
  if (isPrototype) {
    return `## Design Checkpoint Protocol (Lite)

This is a prototype — design enforcement is relaxed. However:
- **Use GDC colors** (gdc-blue \`#0157FF\`, gdc-red \`#FF0000\`) and **Red Hat Display** font
- **Before marking complete**: Take a screenshot at desktop width and verify it looks intentional, not broken
- No pixel-perfection required, but it should still look like a GDC product`;
  }

  if (figmaUrl.trim()) {
    return `## Design Checkpoint Protocol (Strict — Figma Available)

**Figma reference:** ${figmaUrl}

Claude Code must enforce design fidelity at every stage. These are hard gates — do not skip them.

### Checkpoint 1: Before Coding Any Component
- Call \`get_design_context\` from Figma MCP to extract exact tokens for the component
- Extract: colors, spacing, typography (font, weight, size, line-height), border-radius, shadows
- **Do not guess values from screenshots** — pull exact values from Figma
- If a token can't be extracted, stop and ask before proceeding

### Checkpoint 2: After Each Section/Component
- Take a screenshot using the preview tool
- Compare against the Figma frame for this section
- List any discrepancies (spacing, colors, font sizes, alignment)
- Fix all discrepancies before moving to the next section

### Checkpoint 3: Responsive Verification
- Screenshot at 375px (mobile), 768px (tablet), 1440px (desktop)
- Compare against Figma responsive frames (if they exist)
- If no responsive frames in Figma, apply GDC system rules:
  - Stack horizontal layouts vertically on mobile
  - Maintain 16px minimum side padding on mobile
  - Ensure touch targets are minimum 44x44px
  - Typography scales down proportionally (desktop h1 → mobile h2 size)
- Fix responsive issues before proceeding

### Checkpoint 4: Final Design Fidelity Report
Before marking the build as complete, generate a report:
- Side-by-side comparison notes for each major section
- List of any intentional deviations from Figma (with justification)
- Confirm all GDC tokens are used correctly (colors, fonts, spacing grid)
- Confirm shared components (SiteHeader, SiteFooter) are integrated correctly`;
  }

  return `## Design Checkpoint Protocol (Design System Enforcement — No Figma)

**No Figma file provided.** This is higher-risk for design quality. Claude Code must enforce GDC Design System standards strictly.

### Before Implementing Any Component
- Call \`search_design_system\` from Figma MCP to find matching GDC patterns
- Reference the GDC Forge Design System: file key \`tv4qY8lj7ZAxj6wuefWsjw\`, node \`7610-437\`
- **If you cannot verify a design decision against the design system, stop and ask** — do not invent patterns

### Required GDC Design Tokens
- **Font:** Red Hat Display (400 regular, 600 semibold)
- **Colors:** gdc-blue \`#0157FF\`, gdc-red \`#FF0000\`, standard grays
- **CTAs:** Uppercase text, gdc-blue background, white text
- **Max width:** 1200px with centered layout
- **Spacing:** 8px grid system
- **Border radius:** Consistent (check design system for exact values)

### After Each Section
- Take a screenshot and verify it looks consistent with existing GDC pages
- Check: font usage, color accuracy, spacing regularity, CTA styling
- If anything looks "off" compared to other GDC pages, fix it before proceeding

### Responsive Verification
- Screenshot at 375px, 768px, 1440px
- Apply GDC responsive rules: stack on mobile, 16px side padding, 44px touch targets

### Flag for Design Review
Since no Figma was provided, flag this build for design review in the Design Review Brief.
Every layout decision you made independently should be documented for the reviewer.`;
}
