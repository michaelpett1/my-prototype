import type { DesignGateInputs } from '../types';
import { deriveFullInputs } from './helpers';

export function generateDesignReviewBrief(inputs: DesignGateInputs): string {
  const full = deriveFullInputs(inputs);
  const hasFigma = inputs.figmaUrl.trim() !== '';
  const isPrototype = inputs.category === 'prototype';
  const sections: string[] = [];

  sections.push(`# Design Review Brief — ${inputs.projectName || 'Untitled Project'}\n`);

  sections.push(`> **This document is for the reviewer/designer**, not the developer.
> It summarizes what was built, what design decisions were made, and what to check.`);

  // What was built
  sections.push(`## What Was Built

**Category:** ${inputs.category?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Not specified'}
**Platform:** ${full.platformImpact?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Standalone'}

### Spec Summary
${inputs.productSpec || '*No spec was provided — all design decisions were made by the developer.*'}`);

  // Figma reference
  if (hasFigma) {
    sections.push(`## Figma Reference
- **Figma file:** ${inputs.figmaUrl}
- The build should match this Figma file. Compare each section side-by-side.
- Any intentional deviations should be listed below by the developer.`);
  } else {
    sections.push(`## Design Source

**No Figma file was provided for this build.**

This means:
- The developer used the GDC Forge Design System as the sole design reference
- All layout, spacing, and component decisions were made independently
- **Every section needs visual review** — there's no Figma to compare against
- Pay extra attention to: layout choices, spacing consistency, component patterns`);
  }

  // Design decisions section
  sections.push(`## Design Decisions Log
<!-- Developer: fill this section as you build -->

${hasFigma
    ? `List any intentional deviations from the Figma design:

| Section | Deviation | Reason |
|---------|-----------|--------|
| *Example: Hero* | *Used 24px padding instead of 16px* | *Better readability on mobile* |`

    : `List all significant design decisions you made:

| Section | Decision | Rationale |
|---------|----------|-----------|
| *Example: Hero layout* | *Two-column with image right* | *Matches pattern on casino landing page* |
| *Example: CTA placement* | *Sticky bottom bar on mobile* | *Improves conversion visibility* |

**Flag any decisions you're uncertain about** — the reviewer should pay special attention to these.`}`);

  // Verification checklist
  sections.push(`## Reviewer Verification Checklist

### Typography
- [ ] Red Hat Display font is used throughout (no system fonts)
- [ ] Weight 400 for body text, 600 for headings and CTAs
- [ ] Font sizes are proportional and consistent
- [ ] Line heights provide comfortable readability

### Colors
- [ ] gdc-blue \`#0157FF\` used for primary actions, links, CTAs
- [ ] gdc-red \`#FF0000\` used only for alerts/accents (not overused)
- [ ] Gray scale is consistent (no mixed gray palettes)
- [ ] Sufficient contrast for accessibility (4.5:1 for text)

### Spacing & Layout
- [ ] Max width 1200px, centered
- [ ] Spacing follows 8px grid (8, 16, 24, 32, 48, 64)
- [ ] Consistent vertical rhythm between sections
- [ ] Side padding: 16px mobile, 24px+ tablet, 32px+ desktop

### CTAs & Buttons
- [ ] Primary CTAs: gdc-blue background, white text, UPPERCASE
- [ ] Touch targets minimum 44x44px on mobile
- [ ] Hover/focus states present and visible

### Responsive
- [ ] Mobile (375px): Content stacks properly, no horizontal scroll
- [ ] Tablet (768px): Appropriate layout adjustments
- [ ] Desktop (1440px): Uses space well, doesn't stretch too wide

### Shared Components
- [ ] SiteHeader integrated correctly${full.platformImpact === 'genesis' ? ' (Genesis variant)' : ''}
- [ ] SiteFooter integrated correctly
- [ ] Navigation works as expected`);

  // Platform-specific checks
  if (full.platformImpact === 'genesis') {
    sections.push(`### Genesis-Specific Checks
- [ ] Template renders in Genesis preview environment
- [ ] All content slots are editable through the CMS
- [ ] Slot names are descriptive enough for editors
- [ ] Optional slots don't break the layout when empty
- [ ] Content editor UX is intuitive (no developer explanation needed)`);
  }

  if (full.platformImpact === 'eve') {
    sections.push(`### Eve-Specific Checks
- [ ] Operator data renders accurately (names, ratings, logos)
- [ ] Bonus amounts and descriptions are correct
- [ ] Affiliate links use Eve-generated URLs (not hardcoded)
- [ ] T&Cs links present for all operators
- [ ] Expired offers handled gracefully
- [ ] \`rel="noopener noreferrer sponsored"\` on affiliate links`);
  }

  if (full.platformImpact === 'origins') {
    sections.push(`### Origins-Specific Checks
- [ ] Article content renders properly (headings, paragraphs, images)
- [ ] SEO meta tags are present and accurate
- [ ] Structured data (JSON-LD) is valid
- [ ] Heading hierarchy is correct (h1 → h2 → h3)
- [ ] Internal links use descriptive anchor text
- [ ] Images have appropriate alt text
- [ ] Breadcrumb navigation present`);
  }

  // Tracking checks
  if (full.dataTracking !== 'none' && full.dataTracking) {
    const trackingItems: string[] = ['### Tracking Checks'];
    if (full.dataTracking === 'ga4' || full.dataTracking === 'both') {
      trackingItems.push(`- [ ] GA4 events fire correctly (check via DebugView)
- [ ] Event names follow snake_case convention
- [ ] No duplicate events on single interactions
- [ ] No PII in event parameters`);
    }
    if (full.dataTracking === 'ktag' || full.dataTracking === 'both') {
      trackingItems.push(`- [ ] KTag events fire correctly
- [ ] Tag names follow \`[section]_[action]_[element]\` convention
- [ ] KTag events mirror GA4 events where applicable`);
    }
    sections.push(trackingItems.join('\n'));
  }

  // Screenshots the reviewer should request
  sections.push(`## Screenshots to Request

Ask the developer for screenshots at these breakpoints:
1. **375px** (iPhone SE) — mobile layout
2. **768px** (iPad) — tablet layout
3. **1440px** (Desktop) — full desktop layout

For each screenshot, check:
- Overall layout and visual hierarchy
- Typography consistency
- Color usage (GDC palette only)
- CTA prominence and styling
- Spacing regularity${hasFigma ? `\n- **Side-by-side with Figma** — compare each section` : ''}`);

  // Risk assessment
  if (!hasFigma && !isPrototype) {
    sections.push(`## Risk Assessment

**This build has NO Figma reference.** Risk level: **HIGH**

Without Figma:
- All visual decisions were made by the developer using the GDC Design System
- There's no single source of truth to compare against
- Layout, spacing, and component choices need manual review
- Consider scheduling a live walkthrough rather than async review

**Recommendation:** Review this build more thoroughly than a Figma-backed build. Pay attention to anything that "feels off" — the developer had no design guidance beyond the design system.`);
  }

  if (isPrototype) {
    sections.push(`## Prototype Note

This is a prototype/POC. Design review should be lighter:
- Focus on: does it communicate the concept effectively?
- GDC branding basics (colors, fonts) should still be present
- Layout perfection is not expected
- Don't block on polish items — this is meant to be fast and disposable`);
  }

  return sections.join('\n\n');
}
