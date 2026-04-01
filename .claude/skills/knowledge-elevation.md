---
name: knowledge-elevation
description: Promote project-specific research to the shared knowledge base via PR.
user_invocable: true
---

# Knowledge Elevation

## When to Use
When research, personas, design principles, or other knowledge from a specific project is broadly useful and should be shared across all projects.

## Steps

1. **Identify what to elevate**: Ask the user which knowledge files from their project should be promoted to the shared `knowledge/` directory. Review the files to understand their content.

2. **Generalize if needed**: Project-specific knowledge may need to be broadened:
   - Remove project-specific references that won't make sense globally
   - Add context about where this knowledge originated
   - Ensure it's useful standalone without the project context

3. **Check for duplicates**: Read existing files in `knowledge/` to make sure this doesn't duplicate existing shared knowledge. If there's overlap, suggest merging instead.

4. **Copy to shared knowledge**: Place the file(s) in the root `knowledge/` directory with a clear, descriptive filename.

5. **Create a PR**:
   - Create a branch named `knowledge/{topic}`
   - Commit the new knowledge files
   - Create a PR with a description of what's being elevated and why it's broadly useful

6. **Update the source project**: Add a note in the project's CLAUDE.md or knowledge directory pointing to the elevated shared knowledge to avoid drift.

## Pitfalls
- Don't elevate knowledge that's only relevant to one project
- Don't remove the original from the project — keep both, with the project version referencing the shared one
- Make sure elevated knowledge is self-contained and doesn't require project context to understand
