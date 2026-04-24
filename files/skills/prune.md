---
name: prune
description: Surface stale memories and obsolete laws for user review. Use when the user says
  "prune", "review memory", "clean up laws", "what's stale", or periodically when the habitat
  has accumulated entries. Prunes per type with type-appropriate heuristics (user = event-driven,
  feedback = citation-driven, project = time-driven, reference = integrity-driven). Proposes
  retire/update/keep per entry — never deletes without confirmation. Do NOT invoke for a fresh
  habitat with few entries, or mid-task.
---

# Prune

Surface entries in the habitat that may no longer apply. Memory and laws decay, but each
kind decays differently — pruning has to match the character of what it's reviewing.

The goal is not to delete aggressively. The goal is to **force a review decision**: for
each candidate, the user says retire, update, or keep-as-is. Entries that pass review
gain credibility; entries that fail are retired cleanly.

## When to use

- User says: "prune", "review memory", "clean up laws", "what's stale", "habitat hygiene."
- It has been a long stretch since the last prune (no strict rule — user judgment).
- Work has visibly shifted direction, and prior context may be misleading.
- You notice a memory or law contradicts something the user just said.
- Right after `/audit` surfaces zero-citation candidates.

Do NOT invoke for:
- A freshly-installed habitat with few entries.
- Mid-task — pruning deserves dedicated focus, not a detour.
- If the user is in a hurry and just wants to get work done.

## Per-type hygiene rules

Each memory type has a different failure mode, so each deserves a different check:

### `user/` — event-driven

User memory ("who the user is") doesn't go stale from disuse — it's always-on. It goes
stale when **the user's situation changes**.

Review each entry by asking:
- Is this still accurate? (role change, new expertise, dropped focus)
- Does the user's recent behavior contradict what's stored here?

Do NOT use citation counts for user memory — there are none and there shouldn't be.

### `feedback/` — citation-driven + semantic

Feedback memory fires discretely. If it's not being cited, either the trigger condition
no longer occurs, or agents are missing cues to cite.

Review each entry by asking:
- Did `/audit` show this with zero citations over a long scope?
- Is the motivating incident (the *Why:*) still relevant?
- Has the user expressed a different preference recently?

### `project/` — time-driven

Project memory goes stale fast. Deadlines pass. Initiatives get cancelled. Phases end.

Review each entry by asking:
- Are any absolute dates in the entry now in the past?
- Has the work visibly moved past this phase?
- Is the stakeholder or deliverable still current?

Schedule project-memory prunes more frequently than other types.

### `reference/` — integrity-driven

Reference memory decays when the external resource moves, dies, or gets renamed.

Review each entry by asking:
- Does the URL still resolve? (May need user confirmation or web fetch.)
- Has the external system been renamed or replaced?
- Is the purpose noted in the entry still how the resource is used?

### Laws

Laws in `LAWS.md` are separate from memory but worth pruning in the same pass.

Review each law by asking:
- Is the *Why:* still true? (If the motivating incident no longer applies, the law may not.)
- Has the work moved past the context where this law fires?
- `/audit` — is this law being cited? A law no one cites is either universally obeyed
  and redundant, or ignored and dead.

## Steps

1. **Pick scope.** Prune all types, one type, or a specific subset? Default: offer all
   five (laws + 4 memory types) with counts per type; let user pick.

2. **Apply type-specific hygiene** (rules above) to each entry in scope.

3. **Rank candidates per type.** Surface the top 3–5 most likely-stale per type. Don't
   dump everything — the point is focused review, not a data dump.

4. **Present per-entry decisions.** For each candidate:
   ```
   [project/sprint_goals] "Sprint 47 ending Mar 10 — focus on ingestion rework"
     Reason to prune: 2026-03-10 is two weeks in the past.
     Proposed: retire, or update to current sprint.
     Decision? (retire / update / keep)
   ```

5. **Apply decisions.** For each:
   - **Retire**: move content to an archive section at the bottom of the file with a date,
     then remove from the index. Recoverable, but out of loaded context.
   - **Update**: propose the new text; user approves or revises; write.
   - **Keep**: no change.

6. **Never batch-delete.** One decision per entry, with the user in the loop.

## Output

A compact review: per-type candidates with reason + proposed action + decision prompt.
Under ~400 words. No prose padding. End with "Start with which type?"
