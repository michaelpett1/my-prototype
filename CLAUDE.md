# CLAUDE.md — Product & Design Workspace

## What This Repo Is
A shared workspace for product managers and product designers. It's a knowledge management system first, prototyping environment second. Not a production codebase — it's where research, design thinking, and exploration live in a structure both humans and Claude Code can read.

## Repo Structure
```
projects/           — Active initiatives (each self-contained)
knowledge/          — Shared knowledge promoted from projects
playspace/          — Gitignored scratch space for experiments
.claude/skills/     — Reusable team workflows
```

### Projects
Each project gets its own folder under `projects/` with:
- `CLAUDE.md` — Project briefing (phase, contributors, context, stack, design system)
- `knowledge/` — Research, personas, architecture decisions, PRD references
- `prototype/` — Optional working prototype directory

### Knowledge
The `knowledge/` directory at the repo root holds team-wide knowledge promoted from individual projects. This is the shared brain: personas, design principles, competitive research, and conventions that apply across projects.

### Playspace
`playspace/` is the zero-friction entry point. It's gitignored — nothing there ever gets committed. Experiment freely. When something is worth keeping, run `/project-graduation` and Claude helps structure it as a proper project.

## Session Start
When opening a project, Claude reads the project's `CLAUDE.md` and already knows the research, design system, and conventions. No "let me catch you up" conversation needed.

If no project is specified, Claude works from this root context.

## Skills Available
- `/design-audit` — Visual audit against the design system with annotated findings
- `/figma-match` — Component-level comparison between prototype and Figma design
- `/project-graduation` — Promote a playspace experiment to a structured project
- `/knowledge-elevation` — Promote project research to the shared knowledge base via PR
- `/prd-writer` — Guided PRD writing, one section at a time

## Self-Improvement
When Claude makes a mistake and gets corrected, update this file (or the project's CLAUDE.md) so the mistake doesn't repeat. Over time, instructions get sharper and the mistake rate drops.

## Prototyping Conventions

### Default Stack
- Tailwind via CDN for quick prototypes
- Vanilla JS unless the project specifies otherwise
- Mobile-first responsive layout
- No external build tools unless requested

### Design System Integration
When a Figma MCP is connected:
1. Pull component tree with library references from Figma
2. Extract design tokens by semantic name (e.g., `surface/secondary` not hex values)
3. Cross-reference against the live component library
4. Map Figma components to code components with real props
5. Build prototypes with production components

### Styling Rules (Tailwind)
- Consistent spacing: `py-16`, `gap-6`, `max-w-6xl`
- Prefer `container mx-auto px-4`
- Modern rounded corners and shadows: `rounded-2xl`, `shadow-sm/md`
- Primary buttons: solid background, bold, hover + focus
- Secondary buttons: subtle border, hover background

### Iteration Mode (matching a reference)
After first pass, list mismatches to fix:
- Spacing/padding
- Font sizes/weights/line-height
- Colors (exact hex or token)
- Alignment and grid behavior
- Component sizing

Apply fixes and repeat until close match.

## Per-User Customization
Each team member can create a `CLAUDE.local.md` (gitignored) to customize their experience: explanation depth, role context, workflow preferences. A PM working on the same project as a designer gets different support because their local config describes different needs.

## Don'ts
- Don't invent brand colors if provided
- Don't add animations unless requested
- Don't ship broken responsive layouts
- Don't use placeholder lorem ipsum for key sections — prefer realistic copy
- Don't commit anything from `playspace/`
