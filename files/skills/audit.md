---
name: audit
description: Report which laws and memories have been actively cited vs. sitting unused.
  Use when the user says "audit", "what laws fire", "which memories are used", "habitat
  usage", or before invoking /prune. Scans current session transcripts for inline citations
  (`[LAW N]`, `[MEM name]`) and ranks by frequency. Do NOT invoke mid-task or for fresh
  habitats with no usage history yet — audit needs at least a few sessions of history
  to produce a useful signal.
---

# Audit

Read usage data from the habitat. Produce a ranked report of which laws and memories are
earning their keep and which have been sitting cold. Output feeds directly into `/prune`.

## How signal works

When agents apply a law or memory, they cite inline: `[LAW 3]`, `[MEM user_role]`. The
convention is documented in `LAWS.md` and `MEMORY.md`. Audit counts these citations.

Citations are directional, not rigorous — agents may miscite or forget. Treat output as
"which items show up in practice," not "which items matter." The gap between the two is
itself useful signal.

## When to use

- User asks: "audit", "what's being used", "which laws fire", "habitat usage report."
- Before `/prune`, to replace gut-feel with data.
- Periodically on a long-running project (weeks+) to catch drift.

Do NOT invoke for:
- Freshly-adopted habitat (no citation history to audit).
- Mid-task — audit is a dedicated activity, not an interruption.

## Steps

1. **Identify scope.** Ask the user: current session only, or recent sessions too? For
   current session only, scan the visible transcript. For recent sessions, check whether
   prior transcripts are accessible (Claude Code: `~/.claude/projects/<project>/` often
   contains session logs; Cowork: TBD — ask the user if uncertain).

2. **Enumerate the habitat.** Load `LAWS.md` and every file in `~/.claude/memory/`.
   Build two lists: law numbers with titles, memory names with descriptions.

3. **Count citations.** For each law and memory, count inline citations in scope. Regex
   patterns:
   - Laws: `\[LAW (\d+)\]`
   - Memories: `\[MEM ([a-z0-9_-]+)\]`

4. **Produce the report.** Two tables, ranked by citation count descending:

   ```
   Laws:
   Rank  Citations  Law
     1   12         LAW 1: Plan before executing anything hard to reverse
     2   8          LAW 3: Surface assumptions
     …
     8   0          LAW 7: <uncited candidate for prune>

   Memories:
   Rank  Citations  Memory
     1   6          [MEM user_role]
     …
   ```

5. **Flag prune candidates.** Laws and memories with zero citations across the audited
   scope — surface as "prune candidates." Suggest invoking `/prune` next.

## Output

- Scope (sessions audited)
- Two ranked tables (laws and memories)
- Zero-citation list flagged for prune
- One-line next step ("Run /prune to review the uncited entries?")

Keep under ~300 words. Tables are the point; no prose padding.
