---
name: audit
description: Report which laws and memories have been actively cited vs. sitting unused.
  Use when the user says "audit", "what laws fire", "which memories are used", "habitat
  usage", or before invoking /prune. Scans current session transcripts for inline citations
  (`[LAW N]`, `[MEM feedback/<name>]`, `[MEM project/<name>]`, `[MEM reference/<name>]`)
  and ranks by frequency. User-type memories are intentionally excluded — they are
  always-on background, not discrete triggers. Do NOT invoke mid-task or for fresh
  habitats with no usage history yet.
---

# Audit

Read usage data from the habitat. Produce a ranked report of which laws and memories are
earning their keep and which have been sitting cold. Output feeds directly into `/prune`.

## How signal works

Citation conventions are type-aware:

| Target | Citation pattern | Why this shape |
|---|---|---|
| Laws | `[LAW N]` | Laws fire discretely; citation is a binary "did I apply this?" |
| `feedback/` memory | `[MEM feedback/<name>]` | Fires discretely like mini-laws |
| `project/` memory | `[MEM project/<name>]` | Cited when shaping a specific decision |
| `reference/` memory | `[MEM reference/<name>]` | Cited at lookup time |
| `user/` memory | **no citation** | Always-on background; citation is noise |

Audit counts the discrete citations. User-type memory is excluded — its hygiene is
event-driven (user situation changed), not citation-driven.

Citations are directional, not rigorous — agents may miscite or forget. Treat output as
"which items show up in practice," not "which items matter." The gap between the two is
itself useful signal.

**Important:** citations only count if they reach durable files (notes, commits, docs,
research). Citations that exist only in conversational transcripts may or may not be
scannable depending on the harness — for reliable audit, grep durable files first.
Conversation-only citations under-represent actual usage, so low citation counts for
a law or memory may mean either "unused" or "used but cited in conversation not files."
When uncertain, check the transcript source before concluding a candidate is prune-worthy.

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

2. **Enumerate the habitat.** Load `LAWS.md` (law numbers + titles) and the three
   citable memory subdirs (`feedback/`, `project/`, `reference/`). Skip `user/` — it's
   not part of the citation audit.

3. **Count citations.** Regex patterns:
   - Laws: `\[LAW (\d+)\]`
   - Memories: `\[MEM (feedback|project|reference)/([a-z0-9_-]+)\]`

4. **Produce the report.** Grouped by category, ranked by citation count:

   ```
   Laws:
   Rank  Citations  Law
     1   12         LAW 1: Plan before executing anything hard to reverse
     2   8          LAW 3: Surface assumptions
     …
     N   0          LAW 7: <uncited candidate for prune>

   Feedback memory:
   Rank  Citations  Entry
     1   6          feedback/terse_responses
     …

   Project memory:
   Rank  Citations  Entry
     …

   Reference memory:
   Rank  Citations  Entry
     …

   User memory: <N entries — excluded from citation audit (always-on background).
   Hygiene is event-driven; invoke /prune for review.>
   ```

5. **Flag prune candidates.** Zero-citation entries in `feedback/`, `project/`, or
   `reference/` — surface as "prune candidates." Suggest `/prune` next.

## Output

- Scope (sessions audited)
- Four ranked tables (laws + 3 citable memory types) + user-memory note
- Zero-citation list flagged for prune
- One-line next step ("Run /prune to review the uncited entries?")

Keep under ~300 words. Tables are the point; no prose padding.
