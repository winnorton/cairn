---
name: spec
description: Research the codebase and write a structured agent execution spec for a non-trivial
  code change. Use when there's a real implementation to drive — typically a Flash handoff or
  multi-session refactor with phases, steps, checkpoints, executor handoff. Drops in
  `docs/planning/specs/`. Promotes notes to specs via `/spec --from <note-path>`. Do NOT use
  for lightweight intent capture (use /note for that — single paragraph, no research). Distinct
  from cairn's existing `/plan` skill, which is a behavioral pre-action alignment verb;
  `/spec` is the artifact-creation verb that produces a file the executor follows.
---

# Spec

Structured agent execution plan as an in-tree artifact. Phases, steps, checkpoints, executor handoff. Use when the work is heavy enough to warrant the ceremony — typically a Flash handoff, multi-file refactor, or any work where an executor needs explicit current-code → replacement-code instructions.

## When to use

- Multi-file refactor where exact code changes need to be specified up front.
- Flash handoff: cheap mechanical executor needs a precise spec to follow.
- Architecture-sensitive change where someone else (future-you, another model, a teammate) will execute.
- A `/note` has matured into real work and needs structure.

Do NOT use for:
- Single-paragraph intent capture — that's `/note`.
- Pre-action behavioral alignment ("here's what I'm about to do, OK?") — that's cairn's existing `/plan` skill.
- Single-file edits where the right move is obvious — just do them.
- Pure information requests — answer directly.

## Distinction from cairn's `/plan`

| | `/plan` (cairn) | `/spec` (this skill) |
|---|---|---|
| Output | Conversational summary, no file | A markdown file in `docs/planning/specs/` |
| Purpose | Pre-action alignment, get user approval | Structured handoff for an executor |
| Cadence | Before any non-trivial action | Before multi-step / multi-file implementation |
| Lifecycle | Ephemeral (in conversation) | File on disk, archived when shipped |

`/plan` happens before the human says yes. `/spec` happens after — the spec IS the implementation artifact, not the alignment.

## Expected usage

- `/spec [SPEC_NAME | AUTO] [description] [@annotations...]` — Create from a fresh task description.
- `/spec --from docs/planning/notes/NOTE_X.md` — **Promote a note to a spec.** Read the note for intent, do research, write the spec, leave a breadcrumb in `notes/_promoted/`.
- `/spec` (no arguments) — Review & revise the current conversation's draft if one exists.

## Steps

### 1. Parse input

**If `--from <note-path>`:**
1. Read the note at `<note-path>` in full.
2. Treat the note's body as the task description.
3. Use AUTO naming to generate `SPEC_<topic>.md` from the note's topic.
4. After writing the spec, move the note: `git mv docs/planning/notes/NOTE_X_<date>.md docs/planning/notes/_promoted/NOTE_X_<date>.md`.
5. Add a header line to the moved note: `> Promoted to docs/planning/specs/SPEC_<topic>.md on <date>`.

**If no arguments:** review-and-revise the current conversation's draft (if any) into a structured spec.

**If task description provided:** extract spec name + description, do AUTO naming if requested.

### 2. Intent scaffold (clarify before research)

Before spending tokens on research, check that the prompt is well-specified. A well-specified prompt has at least 2 of:
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
2. Check `docs/planning/specs/` for related active specs.
3. Check `docs/planning/archive/` for previously completed related work.
4. Note any drift between any source-of-truth document and the current code.

**Do NOT make code changes during research.**

### 4. Write the spec

Create the file at `docs/planning/specs/SPEC_<NAME>.md`:

- Header: today's date, your model name, "Requested by" the human user. **No `STATUS:` field** — folder location is the status (active in `specs/`, shipped after `git mv` to `archive/`).
- **Human Intent section:** verbatim original request, extracted symptom/goal, scope, success criterion.
- **Pre-flight section:** baseline commands the executor runs first.
- **Numbered Phases:** each contains numbered STEPs that target exactly one file each.
  - Each STEP: show the CURRENT code, then the REPLACEMENT code, then explain WHY each change matters.
  - **CHECKPOINT** after each phase with verification commands + "if X fails: [recovery]" instructions.
- **Post-flight section:** final verification + commit message template + the move-to-archive instruction.
- **Executor Handoff section:** quick-start context for the executing agent (2-3 most critical files to read first, the key constraint that's most likely to cause a mistake, recovery step for common failure points).
- **Review Checklist:** for the reviewer model.
- **(If `--from`):** include `> Promoted from note: docs/planning/notes/_promoted/NOTE_X_<date>.md` in header.

### 5. Spec quality rules

- **Be imperative, not descriptive.** "Change line 42 from X to Y", not "we should consider updating the function."
- **Show exact code.** Every STEP shows current code + replacement code. No "update as needed."
- **One file per STEP.** Three files = three STEPs.
- **Checkpoint after every phase.** Run lint at minimum.
- **Estimate scope, not time.** Files/systems/tests touched, NOT wall-clock days. Agent time anchors are unreliable.
- **Respect repo-level Hard Rules.** If the task could tempt the executor toward a known anti-pattern, call it out in the STEP with the correct alternative.

### 6. Present and exit

Tell the user:
- Spec saved to `docs/planning/specs/SPEC_<NAME>.md`
- (If `--from`) Note moved to `notes/_promoted/<original-name>` as a breadcrumb.
- Brief summary of the phases.
- Any open questions.
- "When ready to execute, run `/execute-plan docs/planning/specs/SPEC_<NAME>.md`" (if your habitat has an execute-plan workflow).

## On ship — move-on-ship convention

When the spec's work is verified shipped:

```
git mv docs/planning/specs/SPEC_X.md docs/planning/archive/SPEC_X.md
```

The `git mv` IS the ship signal. **Do not** flip a `STATUS:` field — folder location is the status. The mv shows up in the closing PR diff, the `specs/` folder shrinks back to live work only, and `archive/` grows monotonically.

If a spec was promoted from a note, the breadcrumb in `notes/_promoted/` stays where it is.

## Mandatory-planning gate (recommended)

If your project has Hard Rules requiring a spec for non-trivial changes, **don't ship the rule rhetorically** — agents will skip it. Make it mechanical: a docs-audit-style check that fails the lint when substantive `src/` commits don't reference a planning file. The cwar implementation (`tools/docs-audit.ts` `planning-gate` check) is a worked example. Three escape paths: (a) same-commit modifies a `docs/planning/` file, (b) commit message mentions a `SPEC_`/`NOTE_`/`PLAN_` filename, (c) `[no-plan]` bypass tag for typos / formatting / dependency bumps.

The original failure mode this guards against: cwar accumulated 49 stale `PLAN_*.md` files because the rule was rhetorical. The redesign closed per-file friction (notes vs heavy plans) but the gate closes the lifecycle hole.

## Output

For new specs: a confirmation under ~150 words listing path, phase count, open questions.

For `--from` promotions: same, plus the breadcrumb confirmation.

## Worked examples

- cwar PR #5 (https://github.com/winnorton/cwar-engine/pull/5) — original split of `/plan` into `/note` + `/spec`, 162-line spec template + 1-paragraph note template.
- cwar PR #9 — first end-to-end `/spec --from <note>` promotion, validating the breadcrumb pattern. Cairn extraction (item #6 of the source note) was a separate later promotion from the same note.
- cwar PR #10 — the planning-gate spec executed end-to-end (folder-as-status held: spec written → executed → archived → gate enforces itself on its own merge commit).
