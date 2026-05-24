---
name: figma-match
description: Component-level comparison between a running prototype and its Figma design. Requires Figma MCP connection.
user_invocable: true
---

# Figma Match

## When to Use
When you have a Figma design and a prototype, and want to verify they match at the component level.

## Prerequisites
- Figma MCP must be connected
- A Figma URL or file key for the design
- A prototype to compare against

## Steps

1. **Get the Figma design data**: Use the Figma MCP tools to pull:
   - Component tree with library references
   - Design tokens by semantic name
   - Variable definitions
   - Layout structure with spacing and typography

2. **Read the prototype**: Parse the HTML/component code of the prototype.

3. **Compare component-by-component**:
   - Does each Figma component map to the correct code component?
   - Are props/variants correct? (e.g., Figma "Primary Button" = `<Button variant="primary">`)
   - Do spacing values match between Figma and code?
   - Are colors using the correct tokens?
   - Is typography (size, weight, line-height) consistent?
   - Is the layout structure (flex/grid, gaps, alignment) matching?

4. **Check for mismatches**:
   - Missing components in the prototype
   - Extra components not in the design
   - Prop mismatches (wrong variant, size, state)
   - Spacing deviations beyond 2px tolerance
   - Color mismatches (compare tokens, not just hex)

5. **Produce a match report**:
   ```markdown
   ## Figma Match Report

   ### Overall Match: X%

   ### Component Mapping
   | Figma Component | Code Component | Status | Notes |
   |----------------|---------------|--------|-------|
   | Button/Primary | <Button variant="primary"> | Match | |
   | Card/Elevated  | <Card shadow="md">         | Mismatch | Missing border-radius |

   ### Deviations
   - [ ] Description of each deviation with fix suggestion
   ```

## Pitfalls
- Check the project's deviations index for known naming mismatches between Figma and code
- Figma auto-layout padding may not map 1:1 to CSS — compare the intent, not just raw values
- Large screen-level frames can overwhelm — work section by section if needed
