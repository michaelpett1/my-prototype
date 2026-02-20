# CLAUDE.md — Website Creation Playbook

## Goal
Build clean, fast, responsive marketing pages that match provided references (screenshots/wireframes) and follow best-practice UX, SEO, and accessibility.

## Default Stack
- Single `index.html` unless user requests a multi-page structure
- Tailwind via CDN
- Vanilla JS only (no frameworks) unless explicitly requested
- Mobile-first responsive layout
- No external build tools unless requested

## Workflow (always follow)
1. **Clarify inputs**
   - If a screenshot exists, treat it as the primary source of truth.
   - If no screenshot, infer layout from the user’s description and propose a simple structure.
   - If branding exists, reuse colors, fonts, spacing rules.

2. **Plan structure**
   - Identify page sections (hero, social proof, features, pricing, FAQ, footer).
   - Choose a layout grid and spacing scale.
   - Define reusable components (buttons, cards, nav, sections).

3. **Generate HTML**
   - Use semantic tags: `header`, `main`, `section`, `footer`
   - Ensure headings are hierarchical (`h1` once, then `h2`, `h3`)
   - Add SEO essentials:
     - `title`, `meta description`
     - Open Graph tags
     - `canonical` placeholder
   - Use accessible patterns:
     - Proper `label` for inputs
     - `alt` text for images
     - Visible focus states

4. **Styling rules (Tailwind)**
   - Use consistent spacing: `py-16`, `gap-6`, `max-w-6xl`
   - Prefer `container mx-auto px-4`
   - Use modern rounded corners and shadows:
     - `rounded-2xl`, `shadow-sm/md`
   - Buttons:
     - Primary: solid background, bold, hover + focus
     - Secondary: subtle border, hover background

5. **Performance**
   - Avoid huge images; use placeholders if not provided
   - Minimize JS; prefer CSS-first interaction
   - Do not add heavy libraries unless asked

6. **Iteration mode (if matching a reference)**
   - After first pass, list mismatches to fix:
     - spacing/padding (px)
     - font sizes/weights/line-height
     - colors (exact hex)
     - alignment and grid behavior
     - component sizing (buttons/cards)
   - Apply fixes and repeat until close match.

## File Conventions
- `index.html` is the deliverable unless told otherwise
- If multi-page:
  - `/pages/*.html`
  - shared CSS in `/assets/styles.css` (only if requested)
- Images:
  - Use `/assets/` if files provided
  - Otherwise use placeholder blocks (not random external images)

## Output Requirements
- Always provide:
  - Complete HTML file
  - Brief section map (what’s on the page)
  - Any assumptions made (fonts/colors/content)

## Defaults (unless overridden)
- Font: system-ui stack
- Max width: `max-w-6xl`
- Primary CTA: prominent
- Navigation: sticky only if asked
- Dark mode: only if asked

## Don’ts
- Don’t invent brand colors if provided
- Don’t add animations unless requested
- Don’t ship broken responsive layouts
- Don’t use placeholder lorem ipsum for key sections unless user asks—prefer realistic copy.
