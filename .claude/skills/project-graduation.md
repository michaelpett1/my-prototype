---
name: project-graduation
description: Promote a playspace experiment to a structured project with knowledge folders, documentation, and a git branch.
user_invocable: true
---

# Project Graduation

## When to Use
When an experiment in `playspace/` is worth keeping and should become a proper project.

## Steps

1. **Ask for details**:
   - What should the project be named? (will become the folder name under `projects/`)
   - Brief description of what this project is about
   - Who are the contributors?
   - What phase is it in? (Discovery / Definition / Design / Prototyping / Validation / Handoff)

2. **Create the project structure**:
   ```
   projects/{project-name}/
     CLAUDE.md          — Filled in with project details
     knowledge/         — Move any research/docs from playspace
     prototype/         — Move any prototype files from playspace
   ```

3. **Copy from template**: Use `projects/.template/` as the base structure. Fill in the CLAUDE.md with the details gathered in step 1.

4. **Move relevant files**: If there are files in `playspace/` that belong to this project, copy them into the appropriate project subdirectory (knowledge/ or prototype/).

5. **Create a git branch**: Create a new branch named `project/{project-name}` for this work.

6. **Stage and commit**: Add the new project structure to git with an initial commit.

7. **Confirm**: Show the user the final structure and what was created.

## Pitfalls
- Don't delete anything from playspace — it's gitignored so there's no need, and the user may want to keep experimenting
- Make sure the project name is kebab-case and descriptive
- Don't create the project if one with the same name already exists — ask the user what to do
