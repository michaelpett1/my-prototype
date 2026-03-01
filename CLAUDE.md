# CLAUDE.md — Project Reference

## Project Overview
This is a **Next.js 16** prototype site built with React 19, TypeScript, and Tailwind CSS v4. It currently contains a single-page marketing site ("Healthy Together") with an additional standalone HTML prototype (`preview.html`) for a Gambling.com UK casinos page.

A separate **GDC shared component library** (`gdc-shared-components`) lives outside this repo at the main repo root and provides Vue 3 components and Tailwind design tokens for Gambling.com projects.

## Actual Stack
- **Framework:** Next.js 16.1.6 (App Router)
- **UI:** React 19.2.3 + TypeScript 5
- **Styling:** Tailwind CSS v4 via `@tailwindcss/postcss` — no `tailwind.config.js` in this project; tokens are CSS custom properties in `app/globals.css`
- **Fonts:** Inter (primary, via `next/font/google`), Red Hat Display (used in `preview.html` via Google Fonts CDN)
- **Linting:** ESLint 9 with `eslint-config-next`
- **Deployment:** Vercel (`.vercel/` config present)
- **Dev commands:** `npm run dev` / `npm run build` / `npm run start` / `npm run lint`

## Project Structure
```
/
├── app/                        # Next.js App Router (all source code)
│   ├── layout.tsx              # Root layout — metadata, Inter font, global CSS import
│   ├── page.tsx                # Homepage — "Healthy Together" single-page marketing site
│   └── globals.css             # Tailwind import + CSS custom properties (cream, navy, breeze, etc.)
├── public/                     # Static assets
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── preview.html                # Standalone GDC-branded HTML prototype (Online Casinos UK page)
├── package.json
├── tsconfig.json               # Strict TS, path alias @/* → root
├── next.config.ts              # Minimal (no custom config)
├── postcss.config.mjs          # @tailwindcss/postcss plugin
├── eslint.config.mjs
└── CLAUDE.md                   # This file
```

### Key paths
| What | Path |
|------|------|
| App entry / layout | `app/layout.tsx` |
| Homepage component | `app/page.tsx` |
| Global styles / tokens | `app/globals.css` |
| Static assets | `public/` |
| GDC standalone prototype | `preview.html` |
| TypeScript config | `tsconfig.json` |
| Package manifest | `package.json` |

## Current Pages & Routes
- `/` → `app/page.tsx` — "Healthy Together" marketing homepage (dark navy theme, Inter font, inline React styles)
- No additional routes exist yet. The App Router directory (`app/`) has no subdirectories for other pages.
- `preview.html` is a standalone file (not routed through Next.js) containing a Gambling.com Online Casinos UK prototype using GDC design tokens.

## Component Patterns
### Current state
- **No component directory yet** — there is no `app/components/` folder in the current codebase.
- `app/page.tsx` contains all homepage UI inline (nav, hero, features, stats, CTA sections) as a single React component with inline `style={{}}` objects.
- No shared React components have been extracted yet.

### Conventions to follow when creating components
- Use Next.js App Router conventions: components in `app/components/` or colocated next to their page
- React functional components with TypeScript
- `<script>` equivalent: named exports, explicit prop types via TypeScript interfaces
- Prefer Tailwind utility classes over inline styles for new work
- One responsibility per component

## Styling Approach
### Tailwind CSS v4
- Imported via `@import "tailwindcss"` in `app/globals.css`
- No `tailwind.config.js` — Tailwind v4 uses CSS-first configuration
- Custom design tokens defined as CSS custom properties in `app/globals.css`

### Current CSS custom properties (`app/globals.css`)
```css
:root {
  --cream: #f9f0ff;
  --navy: #101722;
  --breeze: #4541fe;
  --neon: #fe0e83;
  --lavender: #d9c6ff;
  --lavender-light: #ece4fe;
  --lavender-dark: #7733ff;
  --mint: #0ac9c0;
  --neon-blue: #3ff5ff;
  --green: #33c458;
  --blue: #0073ff;
  --gray: #e6e6eb;
}
```

### Note on `page.tsx` styling
The current homepage uses **inline React styles** extensively (not Tailwind classes). New code should prefer Tailwind utility classes, but when modifying `page.tsx`, maintain consistency with the existing inline style pattern unless refactoring.

## GDC Shared Component Library
**Location:** `/Users/michaelpett/my-prototype/gdc-shared-components/` (separate repo at main project root, NOT inside this Next.js project)
**Package:** `github:michaelpett1/gdc-shared-components`
**Framework:** Vue 3 (peer dependency) — **not compatible with this React/Next.js project**

### What it contains
| File | Purpose |
|------|---------|
| `src/components/SiteHeader.vue` | Global GDC site header (nav, Sign Up CTA, region selector) |
| `src/components/SiteFooter.vue` | Global GDC footer (dark navy, multi-column links, responsible gambling) |
| `src/tailwind.config.js` | GDC design tokens (gdc-blue, gdc-red, gdc-grey, etc.) |
| `src/index.js` | Vue plugin + component exports |

**Current status:** Installed as npm dependency but **not used** in this Next.js app (Vue components can't render in React). Reference it for design token values and patterns when building GDC-branded pages. The `preview.html` file implements GDC patterns in plain HTML.

## GDC Brand Guidelines
The root-level `CLAUDE.md` in the main repo contains comprehensive GDC Forge Design System guidelines. Key references for Gambling.com branded work:

- **Figma file:** `tv4qY8lj7ZAxj6wuefWsjw`
- **Primary brand color:** `#0157FF` (gdc-blue)
- **Font:** Red Hat Display (400, 600 weights)
- **Button text:** Always UPPERCASE
- **Footer background:** `#050A30` (gdc-deep-blue-navy)
- **CTA colors:** Blue for primary (Sign Up), Red for secondary (Play Now)

See the root `CLAUDE.md` for the full color system, typography scale, spacing grid, component specs, and accessibility requirements.

## TypeScript Configuration
- **Strict mode** enabled
- **Path alias:** `@/*` maps to project root (e.g., `@/app/globals.css`)
- **JSX:** `react-jsx` (automatic runtime)
- **Module resolution:** `bundler`

## What Not To Do
- Don't introduce new npm packages without flagging it first
- Don't create Vue components in this project — it's React/Next.js
- Don't hardcode colors that exist as CSS custom properties
- Don't add business logic directly in page components — extract to hooks/utilities
- Don't use `pages/` directory (this project uses App Router, not Pages Router)
- Don't modify `preview.html` when working on the Next.js app (they are separate)

## Dev Workflow
```bash
npm run dev      # Start Next.js dev server (localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```
