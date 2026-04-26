---
name: spec
description: Research the codebase and write a structured agent execution spec for a non-trivial
  code change. Use when there's a real implementation to drive — typically a Flash handoff or
  multi-session refactor with phases, steps, checkpoints, executor handoff. Drops in
  `docs/specs/`. Promotes notes to specs via `/spec --from <note-path>`. Do NOT use for
  lightweight intent capture (use /note for that — single paragraph, no research). Distinct
  from cairn's existing `/plan` skill, which is a behavioral pre-action alignment verb;
  `/spec` is the artifact-creation verb that produces a file the executor follows.
---

# Spec

Structured agent execution plan as an in-tree artifact. Phases, steps, checkpoints,
executor handoff. Use when the work is heavy enough to warrant the ceremony — typically
a Flash handoff, multi-file refactor, or any work where an executor needs explicit
current-code → replacement-code instructions.

## When to use

- Multi-file refactor where exact code changes need to be specified up front.
- Flash (or other cheap mechanical executor) handoff that needs a precise spec to follow.
- Architecture-sensitive change where someone else (future-you, another model, a teammate)
  will execute.
- A `/note` has matured into real work and needs structure.

Do NOT use for:
- Single-paragraph intent capture — that's `/note`.
- Pre-action behavioral alignment ("here's what I'm about to do, OK?") — that's cairn's
  existing `/plan` skill.
- Single-file edits where the right move is obvious — just do them.
- Pure information requests — answer directly.

## Distinction from cairn's `/plan`

| | `/plan` (cairn) | `/spec` (this skill) |
|---|---|---|
| Output | Conversational summary, no file | A markdown file in `docs/specs/` |
| Purpose | Pre-action alignment, get user approval | Structured handoff for an executor |
| Cadence | Before any non-trivial action | Before multi-step / multi-file implementation |
| Lifecycle | Ephemeral (in conversation) | File on disk, archived when shipped |

`/plan` happens before the human says yes. `/spec` happens after — the spec IS the
implementation artifact, not the alignment.

## Expected usage

- `/spec [SPEC_NAME | AUTO] [description] [@annotations...]` — Create from a fresh task description.
- `/spec --from docs/notes/NOTE_X.md` — **Promote a note to a spec.** Read the note for
  intent, do research, write the spec, leave a breadcrumb in `notes/_promoted/`.
- `/spec` (no arguments) — Review & revise the current conversation's draft if one exists.

## Steps

### 1. Parse input

**If `--from <note-path>`:**
1. Read the note at `<note-path>` in full.
2. Treat the note's body as the task description.
3. Use AUTO naming to generate `SPEC_<topic>.md` from the note's topic.
4. After writing the spec, move the note: `git mv docs/notes/NOTE_X_<date>.md docs/notes/_promoted/NOTE_X_<date>.md`.
5. Add a header line to the moved note: `> Promoted to docs/specs/SPEC_<topic>.md on <date>`.

**If no arguments:** review-and-revise the current conversation's draft (if any) into a
structured spec.

**If task description provided:** extract spec name + description, do AUTO naming if requested.

### 2. Intent scaffold (clarify before research)

Before spending tokens on research, check that the prompt is well-specified. A
well-specified prompt has at least 2 of:
1. A specific symptom or goal
2. A file/system reference
3. A success criterion

If under-specified, ask the 3-question scaffold:

> *"Before I research:*
> *1. What's the symptom or goal? (one sentence)*
> *2. Do you know which system/file, or should I find it?*
> *3. How will we know it's fixed? (test, behavior, hash, visual)"*

Skip if the prompt + context already provide clear answers.

### 3. Research

1. Identify all files that will need to change. Read each one.
2. Check `docs/specs/` for related active specs.
3. Check `docs/specs/archive/` for previously completed related work.
4. Note any drift between any source-of-truth document and the current code.

**Do NOT make code changes during research.**

### 4. Write the spec

Create the file at `docs/specs/SPEC_<NAME>.md`:

- Header: today's date, your model name, "Requested by" the human user. **No `STATUS:` field**
  — folder location is the status (active in `specs/`, shipped after `git mv` to `archive/`).
- **Human Intent section:** verbatim original request, extracted symptom/goal, scope,
  success criterion.
- **Pre-flight section:** baseline commands the executor runs first.
- **Numbered Phases:** each contains numbered STEPs that target exactly one file each.
  - Each STEP: show the CURRENT code, then the REPLACEMENT code, then explain WHY each
    change matters.
  - **CHECKPOINT** after each phase with verification commands + "if X fails: [recovery]"
    instructions.
- **Post-flight section:** final verification + commit message template + the
  move-to-archive instruction.
- **Executor Handoff section:** quick-start context for the executing agent (2-3 most
  critical files to read first, the key constraint that's most likely to cause a mistake,
  recovery step for common failure points).
- **Review Checklist:** for the reviewer model.
- **(If `--from`):** include `> Promoted from note: docs/notes/_promoted/NOTE_X_<date>.md`
  in header.

### 5. Spec quality rules

- **Be imperative, not descriptive.** "Change line 42 from X to Y", not "we should consider
  updating the function."
- **Show exact code.** Every STEP shows current code + replacement code. No "update as needed."
- **One file per STEP.** Three files = three STEPs.
- **Checkpoint after every phase.** Run the project's lint/test gate at minimum.
- **Estimate scope, not time.** Files/systems/tests touched, NOT wall-clock days. Agent
  time anchors are unreliable.
- **Respect repo-level Hard Rules.** If the task could tempt the executor toward a known
  anti-pattern, call it out in the STEP with the correct alternative.

### 6. Present and exit

Tell the user:
- Spec saved to `docs/specs/SPEC_<NAME>.md`
- (If `--from`) Note moved to `notes/_promoted/<original-name>` as a breadcrumb.
- Brief summary of the phases.
- Any open questions.
- "When ready to execute, hand the spec path to your executor agent."

## On ship — move-on-ship convention

When the spec's work is verified shipped:

```
git mv docs/specs/SPEC_X.md docs/specs/archive/SPEC_X.md
```

The `git mv` IS the ship signal. **Do not** flip a `STATUS:` field — folder location is
the status. The mv shows up in the closing PR diff, the `specs/` folder shrinks back to
live work only, and `archive/` grows monotonically.

If a spec was promoted from a note, the breadcrumb in `notes/_promoted/` stays where it is.

## Mandatory-planning gate (recommended for projects with non-trivial change discipline)

If your project has a Hard Rule requiring a spec for non-trivial changes, **don't ship
the rule rhetorically** — agents will skip it. Make it mechanical: a lint-time check that
fails when substantive `src/` commits don't reference a planning file. Three escape paths
keep it ergonomic: (a) the same commit modifies a `docs/specs/` or `docs/notes/` file,
(b) the commit message mentions a `SPEC_` / `NOTE_` filename, (c) a `[no-plan]` bypass
tag for typos / formatting / dependency bumps.

This isn't bundled with cairn — cairn ships markdown skills, not project-specific lint
tooling. Build the gate at whatever surface your project's PRs already pass through (CI
check, pre-commit hook, or a docs-audit script). The original failure mode this guards
against: planning rules that are only rhetorical accumulate stale artifacts because
"required" doesn't equal "enforced."

## Output

For new specs: a confirmation under ~150 words listing path, phase count, open questions.

For `--from` promotions: same, plus the breadcrumb confirmation.

## Companion skills

- `/note` — the lightweight verb. `/spec --from <note>` is the promotion path; the note's
  intent paragraph stays preserved as a breadcrumb in `notes/_promoted/`.
- `/plan` — cairn's behavioral pre-action alignment skill. Different verb, different
  output (conversational, not a file). `/plan` runs before; `/spec` runs after.
- `/review` — when the spec's work is shipped and you want a fresh agent to read the
  change set cold before merge. Catches inconsistency-class bugs the spec author and
  executor missed because they were "too close."
