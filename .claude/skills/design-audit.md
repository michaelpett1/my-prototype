---
name: design-audit
description: Run a visual audit of a prototype against the design system. Produces annotated findings and a migration checklist.
user_invocable: true
---

# Design Audit

## When to Use
When you want to check a prototype or page against the design system for consistency, deviations, or missing patterns.

## Steps

1. **Identify the target**: Ask which prototype or page to audit. If in a project directory, use the prototype there.

2. **Read the design system context**: Check the project's CLAUDE.md for design system references. If a Figma MCP is connected, pull the design system tokens and component specs.

3. **Audit each section of the page**:
   - Typography: Are font sizes, weights, and line-heights consistent with the design system?
   - Colors: Are all colors using design tokens or approved values?
   - Spacing: Does padding/margin follow the spacing scale?
   - Components: Are buttons, cards, inputs, etc. using the correct component patterns?
   - Layout: Is the grid consistent? Are breakpoints handled properly?
   - Accessibility: Focus states, contrast ratios, semantic HTML, alt text

4. **Produce findings**: For each issue found, note:
   - What it is (e.g., "Button uses custom color instead of `primary` token")
   - Where it is (file, line, section)
   - Severity: Critical (breaks pattern), Warning (deviation), Info (suggestion)

5. **Generate migration checklist**: A PM-friendly list of changes needed, grouped by priority.

## Output Format
```markdown
## Design Audit: [Page/Component Name]

### Summary
- X critical issues, Y warnings, Z suggestions

### Findings
#### Critical
- [ ] Description — location

#### Warnings
- [ ] Description — location

#### Suggestions
- [ ] Description — location
```

## Pitfalls
- Don't flag intentional deviations documented in the project's CLAUDE.md
- Check if the project has a deviations index before flagging naming mismatches
- Be specific about which token or component should be used instead
