# Convergence profile template

Copy to `<project>/.cairn/convergence.md` and fill every section. The skill reads this file
before step 0. Each lens brief quotes the "Lens rules" section verbatim. Keep entries as paths,
commands and short rules; reasoning belongs in the project's own docs.

```markdown
# Convergence profile: <project>

## Requirement

<"Required: every /program whose range changes a subject root closes with /convergence; the
master does not archive until it links the report." — or "Optional: run on request." Start the
section with the word "Required" or "Optional": project checks may read it. Name the check that
enforces it, if there is one.>

## Subjects

- Root: `<path pattern>`, e.g. `src/apps/<name>/`
- Live subjects: <how to list them from disk, e.g. "directories under src/apps/ not starting
  with _">
- Subject names in commit subjects: <how commits name a subject, if not by its directory name>

## Shared layers

- Roots: `<path>`, `<path>`, …
- Never counts as reuse: <labs, demos, fixtures, tests>
- Barrels to skip (re-export files; the defining module gets the verdict): <patterns>

## Measure commands

Run in this order and paste the output into the lens briefs. `<subject>` and `<since>` are
placeholders.

1. `<inventory command, if any>`
2. `<reuse or duplication metric command>`
3. `<project inspection command for the subject>`
4. `<docs or claims audit command>`

## Registers

One row per open-item kind, from the skill's step 5 table. Say "report only" where the project
has no register for a kind.

| Open item kind | Where it is enforced |
|---|---|
| `adopt` | <duplication probe list, so the local copy reads as duplication until adopted> |
| `fix` | <a test or check that pins the generic behaviour> |
| `discover` | <capability catalog> |
| `elevate` | <duplication probe naming both implementations> |
| `await-reuse` | <reuse list that reports consumer counts each run> |
| `retire` | <the change that removes or demotes the primitive, and its reuse-list entry> |
| `process` | <lint, audit or spec-lint rules> |

## Reports

- Directory: `<path>`, e.g. `docs/reports/convergence/`
- Prior sources to scan for carry-overs: <globs, e.g. older retrospectives>

## Lens rules

<The project's reuse rule and layering in a few lines; where shared primitives live, so the
local-concepts lens searches there; the paved authoring and evidence tools, so the process lens
can tell whether they were used; and any project-specific shape signals.>
```
