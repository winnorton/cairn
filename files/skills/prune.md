---
name: prune
description: Surface stale memories and obsolete laws for user review. Use when the user says
  "prune", "review memory", "clean up laws", "what's stale", or periodically when the habitat
  has accumulated entries that haven't been referenced in a while. Proposes retire/update/keep
  per entry — never deletes without confirmation. Do NOT invoke for a fresh habitat with
  few entries, or mid-task — pruning is a dedicated maintenance activity.
---

# Prune

Surface entries in the habitat that may no longer apply. Memory and laws decay — a rule
that was load-bearing six months ago may be obsolete today, and a memory about a past
role may be wrong if the user's role has changed.

The goal is not to delete aggressively. The goal is to **force a review decision**: for
each candidate, the user says retire, update, or keep-as-is. Entries that pass review
gain credibility; entries that fail are retired cleanly.

## When to use

- User says: "prune", "review memory", "clean up laws", "what's stale", "habitat hygiene."
- It has been a long stretch since the last prune (no strict rule — user judgment).
- Work in the project has visibly shifted direction, and prior context may be misleading.
- You notice a memory or law contradicts something the user just said.

Do NOT invoke for:
- A freshly-installed habitat with few entries.
- Mid-task — pruning deserves dedicated focus, not a detour.
- If the user is in a hurry and just wants to get work done.

## Steps

1. **Scan memory.** Read `MEMORY.md` and each linked memory file. For each entry, form a
   candidate judgment:
   - **Likely stale**: references a past role, an abandoned project, an obsolete tool.
   - **Possibly stale**: hasn't informed decisions in a while (hard to judge from the file
     alone — ask the user if unsure).
   - **Load-bearing**: still shapes current decisions. Leave alone.

2. **Scan laws.** Read `LAWS.md`. For each law:
   - Is the *Why* still true? (If the motivating incident no longer applies, the law may not.)
   - Has the work moved past the context where this law fires? (Laws about a previous stack
     may not apply to the current one.)
   - Is it being followed? (A law no one cites is either universally obeyed and redundant,
     or ignored and dead.)

3. **Rank candidates.** Surface the top 3–5 most likely-stale entries. Don't dump everything —
   the point is focused review, not a data dump.

4. **Present per-entry decisions.** For each candidate:
   ```
   [memory: user_role.md] "User is a junior engineer at Acme"
     Reason to prune: you mentioned last month you'd been promoted.
     Proposed: update to reflect new role, or retire if no longer relevant.
     Decision? (retire / update / keep)
   ```

5. **Apply decisions.** For each:
   - **Retire**: remove the entry from `MEMORY.md` or delete the law from `LAWS.md`.
     Move the content to an archive section at the bottom of the file with a date, so it's
     recoverable but out of the loaded context.
   - **Update**: propose the new text; user approves or revises; write.
   - **Keep**: no change.

6. **Never batch-delete.** One decision per entry, with the user in the loop.

## Output

A compact review: top 3–5 candidates, each with reason + proposed action + decision prompt.
Under ~300 words. No prose padding. End with "Start with which one?"
