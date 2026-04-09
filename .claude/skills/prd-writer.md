---
name: prd-writer
description: Guided PRD writing — walks through each section conversationally, one at a time.
user_invocable: true
---

# PRD Writer

## When to Use
When a PM needs to write a Product Requirements Document for a feature or initiative.

## Approach
Guide the user through writing a PRD conversationally, one section at a time. Don't dump a template — ask questions and draft each section based on the answers.

## Steps

1. **Problem Statement**: Ask "What problem are we solving and for whom?" Draft a concise problem statement from their answer.

2. **Goals & Success Metrics**: Ask "What does success look like? How will we measure it?" Draft measurable goals.

3. **User Personas**: Ask "Who are the primary users?" If the project has personas in its knowledge/ directory, reference them. Draft or link to persona descriptions.

4. **Requirements**: Walk through functional requirements one by one. For each, ask:
   - What should the user be able to do?
   - What's the expected behavior?
   - Are there edge cases?
   Group into Must Have / Should Have / Nice to Have.

5. **Non-Goals**: Ask "What are we explicitly NOT doing?" This prevents scope creep.

6. **Design Considerations**: Ask about constraints, dependencies, accessibility requirements, and any existing patterns to follow.

7. **Open Questions**: Capture anything unresolved.

8. **Timeline & Milestones**: If relevant, ask about target dates and key milestones.

## Output
Save the PRD to the project's `knowledge/` directory as `prd-{feature-name}.md`.

## Format
```markdown
# PRD: {Feature Name}

**Author:** {name}
**Date:** {date}
**Status:** Draft / In Review / Approved

## Problem Statement
...

## Goals & Success Metrics
...

## User Personas
...

## Requirements
### Must Have
- ...
### Should Have
- ...
### Nice to Have
- ...

## Non-Goals
...

## Design Considerations
...

## Open Questions
...

## Timeline & Milestones
...
```

## Pitfalls
- Don't write the whole PRD at once — go section by section so the user can think through each part
- Don't make up requirements — ask clarifying questions instead
- Reference existing project knowledge when available
- Keep requirements specific and testable, not vague
