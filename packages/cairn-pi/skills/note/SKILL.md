---
name: note
description: File one quick thought, debug finding, or feature sketch as a dated note in
  docs/notes/. Use for "note this", "remind me", "track this", "look at later", "file
  this", "circle back", or a bare /note after one suggested follow-up. No research or
  execution plan. Use /reflect for post-hoc lessons, memory for durable agent context,
  and /spec for executor handoffs.
---

# Note

Capture one concrete intention cheaply so it can be found, deleted, or promoted later.

## Routing

| Content | Destination |
|---|---|
| Concrete follow-up or debug finding bound to project work | `/note` in `docs/notes/`. |
| Fact or judgment that broadly shapes future agent reasoning | `.cairn/memory/` or a law. |
| Multi-step executor handoff | `/spec`. |
| Lesson from completed work | `/reflect`. |

The same observation may justify both a note and memory when the purposes differ. When
uncertain, prefer the ephemeral note.

## Workflow

### 1. Resolve one thought

Preserve the user's meaning; do not embellish. For a bare `/note`, capture the single
follow-up in the latest assistant turn. When several were suggested, choose the most
concrete file- or system-bound item, disclose the skipped items, and offer to file them
separately. With no clear candidate, ask one short question listing up to two candidates.

### 2. Choose the path

Use a notes path declared by project rules; otherwise use `docs/notes/`. When absent,
create the directory and a one-paragraph `README.md` stating the filename and lifecycle
conventions.

Name the file `NOTE_<TOPIC>_<YYYY-MM-DD>.md`, where `<TOPIC>` is 1–3 semantic
`UPPERCASE_UNDERSCORE` words. Add `_2`, `_3`, and so on for same-day collisions.

### 3. Write the note

Write no research or plan. Use:

```markdown
# <Topic> — Note

> **Filed:** YYYY-MM-DD · **By:** <agent or human>

<One paragraph: what was noticed, why it matters, and the likely next step.>

<Optional 1–3 bullets: paths, errors, or related work.>
```

If the content needs phases, checkpoints, pre-flight, or executor handoff, stop and
offer `/spec` instead.

### 4. Confirm

Report the linked path and a one-line summary. List any skipped sibling suggestions and
ask which should receive separate notes.

## Lifecycle

Folder location is state; use no status field.

| State | Action |
|---|---|
| Promoted | `/spec --from <note>` moves it once to `docs/notes/_promoted/` as a breadcrumb. |
| Done without a spec | Move it to `docs/notes/_done/`. |
| Obsolete | Delete with user authorization. |

Periodically surface live notes older than about 30 days for human review.

## Output

Return only the linked path, one-line summary, and skipped-suggestion prompt when needed.
