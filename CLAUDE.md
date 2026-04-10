# CLAUDE.md — Claude Code Project Advisor

## Project Overview
Internal back-office tool for the GDC dev/design team. Helps approach each Claude Code project with a tailored workflow by capturing project dimensions and generating four outputs: Initial Prompt, Workflow, CLAUDE.md, and Checklist.

## Stack
- Next.js 16 (App Router) with TypeScript
- Tailwind CSS v4 — clean neutral palette (NOT GDC brand tokens)
- Anthropic SDK for optional AI enrichment
- No database — stateless generation + localStorage for saved projects

## Architecture

### File Structure
```
app/
├── layout.tsx              # Root layout, Inter font
├── page.tsx                # Renders AdvisorApp
├── globals.css             # Tailwind + neutral theme variables
└── api/enrich/route.ts     # POST → Anthropic API for CLAUDE.md enrichment
lib/
├── types.ts                # ProjectInputs, WorkflowPhase, ChecklistItem, SavedProject
├── constants.ts            # All dimension options (type, complexity, stakeholder, etc.)
└── engine.ts               # generateInitialPrompt(), generateWorkflow(), generateClaudeMd(), generateChecklist()
components/
├── AdvisorApp.tsx           # Main stateful component — form + results
├── InputForm.tsx            # Project name, spec textarea, all dimension selectors
├── DimensionGroup.tsx       # Reusable card-based selector grid
├── OptionCard.tsx           # Individual selectable card (icon + label + desc)
├── ResultsView.tsx          # Tabs container + tab switching
├── InitialPromptTab.tsx     # Prompt display + copy button
├── WorkflowTab.tsx          # Phased workflow display
├── ClaudeMdTab.tsx          # CLAUDE.md preview + copy + AI enrich button
├── ChecklistTab.tsx         # Interactive checklist with completion tracking
└── SavedProjects.tsx        # Save/load panel with localStorage
```

### Engine Logic
The engine is purely deterministic — no API calls. Each generator function takes `ProjectInputs` and returns structured output. The rule engine adapts output based on combinations of:
- Project type × Complexity → scope of workflow phases
- Stakeholder → review cadence, communication style
- Design readiness → Figma MCP instructions vs. freeform
- QA level → checklist depth, testing requirements
- Dev context → stack conventions, component references
- Data tracking → GA4/KTag integration instructions
- Platform impact → Genesis/Eve/Origins context

### GDC Context (embedded in outputs, not in UI)
- Genesis = CMS for content management and template publishing
- Eve = commercial tool for operator data, offers, affiliate placements
- Origins = media tool for editorial content and asset management
- GA4 = external analytics (dataLayer.push() pattern)
- KTag = internal tracking system
- Jira: GDCU project | Confluence space: 2373230
- Figma Design System: file key `tv4qY8lj7ZAxj6wuefWsjw`, node `7610-437`
- Stack: Red Hat Display 400/600, gdc-blue #0157FF, gdc-red #FF0000, uppercase CTAs, 1200px max
- Shared: SiteHeader.vue, SiteFooter.vue from gdc-shared-components

## Conventions
- TypeScript strict mode
- Functional components with hooks
- `@/` alias maps to project root
- No external UI libraries — Tailwind utilities only
- Copy buttons use navigator.clipboard API
- All generation is synchronous except AI enrichment
