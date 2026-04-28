---
name: note
description: File a quick thought, debug finding, or feature sketch into the project repo as
  a dated note. No template, no research phase. Use when the user says "note that", "remind
  me to", "track this", "look at later", "file this", "circle back", or after an agent
  suggests follow-up work and the user wants to capture it (bare `/note` after the
  suggestion). Distinct from /reflect — this is pre-emptive intent capture (one paragraph,
  in-repo, ephemeral); /reflect is post-hoc session distillate (memory writes, often
  user-space). Distinct from cross-session agent memory — this lives in the project repo
  (visible to anyone who clones); memory lives in user-space (visible only to agents on
  this user's machine). Do NOT use for executor handoffs or multi-step refactor plans —
  those need a heavier shape that this skill deliberately doesn't carry.
---

# Note

Lightweight intent capture. File a thought into the project repo so it doesn't evaporate.
Cheap to write, cheap to delete, cheap to promote later if it becomes real work.

## When to use

**User-invoked:**
- *"note that the spawner has a bug under high seed counts"*
- *"remind me to look at the renderer flicker"*
- *"track this — we should circle back to bounty routing"*
- *"file this finding"*
- Bare `/note` (or `note that`) after the agent has just suggested follow-up work — captures the suggestion.

**Distinct from `/reflect`:** `/note` is pre-emptive (capture before action). `/reflect` is
post-hoc (distill after action). Different lifecycles.

**Distinct from cross-session memory:** `/note` files to `docs/notes/` in the project
repo. Cross-session memory files to `agents/memory/` (also in the project repo) — both
are repo-tracked, but they serve different shapes. See "Filing destination" below for
routing.

Do NOT use for:
- Executor handoffs, multi-phase refactors, or anything that needs phases/steps/checkpoints.
  That shape doesn't fit a one-paragraph note — use `/spec` instead, or promote this note
  to a spec via `/spec --from <this-note>` once it matures.
- Generic project-shaping facts (architectural conventions, never-do-X rules). Those belong
  in cross-session memory or LAWS.md, not in a single note.

## Filing destination — `/note` vs cross-session agent memory

`/note` files to `docs/notes/` in the project repo. Cross-session **agent memory** files
to `agents/memory/` in the project repo (typed: `user/`, `feedback/`, `project/`,
`reference/`). Both are repo-tracked and ship with the codebase. The distinction is
*shape*, not *destination*: `/note` is a single-paragraph file-bound observation;
memory entries are typed facts that shape future agent reasoning across files.

Use this table to route:

| Question the thought answers | File where |
|---|---|
| "What concrete thing should the next agent touching `<file>` know or do?" | `/note` (project repo) |
| "Is this a debug finding I want to circle back to?" | `/note` |
| "What would a fresh session need to see when running `ls docs/notes/`?" | `/note` (yes, by design) |
| "What facts about this project shape future agent reasoning broadly?" | Cross-session memory |
| "Is this an architectural pattern other agents need internalized?" | Cross-session memory |
| "Should this fact survive the project being cloned to a new machine?" | Cross-session memory if generic; `/note` if project-bound |

Both can fire for the same observation, answering different questions. **When in doubt,
prefer `/note`.** Repo-visible beats user-space-buried — a note in the repo can be deleted
later if it turns out too generic; a memory entry that should have been in-repo is
silently invisible to future cloners.

## Steps

### 1. Resolve what you're filing

If the user said `/note that` or bare `/note` after a conversation:

- Look at your most recent assistant turn. Did you suggest exactly one follow-up? File that.
- Multiple follow-ups in one turn? **Do not file all as one mixed-intent note.** Pick the
  most concrete suggestion (specific file/system reference). Tell the user the others
  weren't filed and ask if any should also be captured.
- Ambiguous (`/note` with no context)? Ask one short question: *"What should I capture —
  [list 1-2 candidates from recent context]?"*

If the user provided explicit content (`/note RENDERER_FLICKER We should look at...`),
skip resolution; file what they said.

### 2. Resolve the filing path

Default: `docs/notes/` in the project repo. If that directory doesn't exist, create it
plus a `docs/notes/README.md` explaining the convention (one paragraph; see Output below).

If the project's CLAUDE.md or LAWS.md declares a different notes path, use that.

### 3. Generate filename

`NOTE_<TOPIC>_<YYYY-MM-DD>.md`

- `<TOPIC>` is 1-3 UPPERCASE_UNDERSCORE_KEYWORDS — semantic, not generic. `RENDERER_SHADOW_FLICKER`, not `BUG_FIX`.
- Date in filename so age is visible at `ls` time. No frontmatter date juggling.
- If a note with the same topic already exists for the same day, append `_2`, `_3`, etc.

### 4. Write the note

Format — loose. The body is **one paragraph** answering:

- What did I notice / suggest / want to remember?
- Why does it matter?
- What would the next step look like if someone picked this up?

Then optionally 1-3 bullets of supporting context (file paths, error messages, related work).
Skip the bullets if not needed.

**Do NOT** write phases, steps, checkpoints, pre-flight commands, or executor handoff
sections. Those belong in a `/spec`. If your note is growing those, promote it via
`/spec --from <this-note>` instead.

Template:

```markdown
# [Topic] — Note

> **Filed:** YYYY-MM-DD · **By:** [agent or human] · **Status:** open

[One paragraph capturing the thought.]

[Optional 1-3 bullets of supporting context.]

---

*Note — pre-emptive intent capture. If this becomes real work, promote to whatever your
habitat uses for heavier planning artifacts.*
```

### 5. Confirm and exit

Tell the user:
- Note saved to `<path>/NOTE_<TOPIC>_<DATE>.md`
- One-line summary of what's in it
- (If sibling suggestions were skipped) "I filed [the chosen one]. Others I didn't file:
  [list]. Want any of those captured too?"

That's it. No research phase, no auto-resolution of annotations. Notes are intent capture.

## Promotion path

When a note becomes real work: `/spec --from docs/notes/NOTE_<topic>_<date>.md`. The
`/spec` workflow reads the note for intent, does research, writes a structured spec in
`docs/specs/`, and moves the note to `docs/notes/_promoted/` as a breadcrumb. The
original intent paragraph stays preserved; the spec adds structure.

A breadcrumb supports multiple promotions — a single note can spawn several specs over
time as different aspects become real work.

## Lifecycle

Notes have three terminal states. Move-on-state, don't flip a status field:

- **Promoted** — work was upgraded to a `/spec`. Move to `docs/notes/_promoted/`
  as a breadcrumb.
- **Done** — work was completed without ever needing a spec. Move to
  `docs/notes/_done/`.
- **Deleted** — superseded, no longer relevant, or never going to happen.

A periodic sweep (manual or scripted) of `docs/notes/` for files older than ~30 days still
in the live folder is a healthy habit. Notes are ephemeral by design.

## Output

A short confirmation:
- Path written
- One-line summary
- Any sibling suggestions that were not captured (with prompt)

No prose padding.
