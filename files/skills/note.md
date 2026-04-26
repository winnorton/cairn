---
name: note
description: File a quick thought, debug finding, or feature sketch into the project repo as
  in-tree intent capture. Use when capturing intent that may or may not become real work —
  agent suggestions to revisit, debug findings, "remind me to look at X later", "/note that"
  after agent-suggested follow-up. Cheap to write, cheap to delete, can be promoted to /spec
  when work begins. Drops in `docs/planning/notes/`. Do NOT use for cross-session agent memory
  (those go in the agent-memory verb — `cairn/memory_post` or your habitat's equivalent — and
  live in user-space, not the repo). Do NOT use for execution-ready plans (use /spec for those).
---

# Note

Lightweight in-repo intent capture. Cheap to file, cheap to delete, easy to promote.

## When to use

- "Remind me to look at X later" / "we should refactor Y eventually" / "I noticed Z while debugging."
- Agent has just suggested follow-up work and the user says "/note that" — capture the suggestion.
- A thought you want bound to a specific file or system, visible to the next agent who clones the repo.

Do NOT use for:
- Cross-session agent knowledge ("this codebase prefers X over Y") — that's the agent-memory verb (e.g. `cairn/memory_post`), which lives in user-space, not the repo.
- Anything with phases, steps, checkpoints — that's a `/spec`.
- Thoughts you'd otherwise just delete in 5 minutes — let them go.

## Filing destination — note vs cross-session memory

Two filing systems coexist; the routing rule is shape-based:

| Question the thought answers | File where |
|---|---|
| "What concrete thing should the next agent touching `<file>` know or do?" | `/note` (in-repo) |
| "What facts about this project shape future agent reasoning broadly?" | Agent memory (user-space) |
| "Is this a debug finding I want to circle back to?" | `/note` |
| "Is this an architectural pattern other agents need internalized?" | Agent memory |

Default to `/note` on doubt — repo-visible beats user-space-visible for engineering work, and notes can always be deleted later if the observation turns out to be too generic.

## Steps

### 1. Resolve what's being filed

If the user said "/note that" or bare "/note" after a conversation, identify *what*:

- Did your most recent turn suggest exactly one follow-up? File that.
- Did you suggest *multiple* follow-ups in one turn? **Do not file all of them as one mixed-intent note.** Pick the most concrete suggestion (the one with a specific file or system reference). Tell the user the others were not filed and ask if any should also be noted.
- If intent is ambiguous: ask one short question naming 1-2 candidates from recent context.

If the user provided explicit content (`/note RENDERER_FLICKER We should look at...`), skip resolution; file what they said.

### 2. Generate filename

`NOTE_<TOPIC>_<YYYY-MM-DD>.md` in `docs/planning/notes/`.

- `<TOPIC>` is 1-3 UPPERCASE_UNDERSCORE_KEYWORDS — semantic, not generic. `RENDERER_SHADOW_FLICKER` not `BUG_FIX`.
- Date in filename so age is visible at `ls`. No frontmatter date juggling.
- Same topic same day: append `_2`, `_3`, etc.

### 3. Write the note

One paragraph that answers:

- What did I notice / suggest / want to remember?
- Why does it matter?
- What would the next step look like if someone picked this up?

Then optionally 1-3 bullets of supporting context (file paths, error messages, related work). Skip if not needed.

**Do NOT** write phases, steps, checkpoints, pre-flight commands, or executor handoff sections. Those belong in `/spec`. If your note is growing those, you're filing the wrong thing — promote it.

Suggested shape:

```markdown
# <Topic> — Note

> **Filed:** <date> · **By:** <agent or human> · **Status:** open

<One paragraph capturing the thought — what, why, next step.>

- <optional supporting context bullet 1>
- <optional bullet 2>

---

*This is a note, not a spec. Notes are free-form intent capture. If this becomes real work, promote to a spec via `/spec --from <this-file>`.*
```

### 4. Confirm and exit

Tell the user:
- Note saved to `docs/planning/notes/NOTE_<topic>_<date>.md`
- One-line summary
- (If you skipped sibling suggestions in Step 1) "I filed [chosen one]. Others I didn't file: [list]. Want any of those captured too?"
- (If applicable) "When ready to act on this, run `/spec --from <this-file>` to promote to a structured spec."

That's it. No research phase, no auto-research, no annotations resolution. Notes are intent capture, not specs.

## Promotion path

If a note becomes real work: `/spec --from docs/planning/notes/NOTE_<topic>_<date>.md`. The `/spec` workflow reads the note for intent, does research, writes a full spec in `docs/planning/specs/`, moves the note to `docs/planning/notes/_promoted/` as a breadcrumb. Original intent stays preserved.

A breadcrumb supports multiple promotions — a single note can spawn several specs over time as different aspects become real work.

## Lifecycle

Three terminal states for notes:
- **Promoted** — moved to `notes/_promoted/`, the spec is the live artifact
- **Done without a spec** — work done informally; move to `notes/_done/`
- **Deleted** — superseded, no longer relevant, or never going to happen

Notes are ephemeral by design. A periodic sweep of notes older than ~30-60 days that haven't moved to `_done/` or `_promoted/` is healthy. If your habitat ships a docs-audit tool, add a `notes:staleness` check that flags accumulation; the original failure mode this primitive guards against (in cwar's case, 49 stale `PLAN_*.md` files) recurs at lower per-file cost without lifecycle enforcement.

## Output

A short confirmation under ~80 words:
- Path to the new note
- One-line summary of what's in it
- Promotion-readiness pointer if applicable

Nothing else. Notes are cheap; the confirmation should match.

## Worked examples

- cwar PR #5 (https://github.com/winnorton/cwar-engine/pull/5) — original split of `/plan` into `/note` + `/spec`, 49 legacy plans migrated.
- cwar PR #7 — first-use friction surface: an agent routed to user-space memory instead of `/note`; the routing-error fix landed the disambiguation table this skill now uses.
- cwar PR #9 — first end-to-end `/spec --from <note>` promotion, validating the breadcrumb pattern.
