# Supervisor Pattern (cairn-side decision deferred) — Note

> **Filed:** 2026-04-26 · **By:** agent (incoming bridge from cwar-engine session) · **Status:** open

cwar-engine added a mechanical-enforcement supervisor (`tools/agent-supervisor.ts`) that
calls the cwar MCP server's `cwar_session { autoSubmit: true }` to scan recent transcripts
asynchronously and auto-file feature requests. The motivating finding from that session:
behavioral documentation (e.g. `AGENTS.md` instructing agents to proactively report missing
tools or context) does NOT reliably produce that feedback; mechanical wrappers do. An
incoming-bridge proposal asked whether cairn should ship a generic `cairn-supervisor`
analogue out-of-the-box. **Decision deferred** — user chose neither of the two paths
offered (recipe-and-template inside cairn vs separate companion binary package) and
will let cwar's adoption play out before committing cairn to anything. Revisit when
cwar's autoSubmit experiment has produced signal (real issues filed, friction
discovered, drift between in-session-discipline and supervisor-flagged work). If the
pattern holds, cairn should generalize it; if it produces noise, the answer is "let
each habitat build its own."

- cwar implementation: `C:\Users\winno\projects\cwar\cwar-engine\tools\agent-supervisor.ts` — thin TS runner that connects to the cwar MCP server via stdio and calls `cwar_session` with `mode: 'optimize', autoSubmit: true, minPriority: 3`. Brains in MCP server, not in supervisor.
- Principle alignment: [MEM cwar feedback/escalate-rule-to-mechanical-gate] — codify a rule (cairn has `/audit`, `/prune`, `/reflect`), then promote to a mechanical gate at the surface the work passes through.
- Tradeoff that gated the decision: cairn's invariant is "pure markdown installed by an adopt prompt." A binary supervisor breaks portability; a recipe-only ship adds an indirection adopters wire themselves. Both viable, neither obvious without empirical data.

---

*Note — pre-emptive intent capture. If this becomes real work, promote to whatever your
habitat uses for heavier planning artifacts.*
