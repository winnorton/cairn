# Distillate to Production: The Six-Step Arc

## What this documents

On 2026-04-25, a research finding produced in one agent session became a feature-flagged
commit on a production codebase's main branch. Six steps, four sessions, three platforms,
two repos. This is the strongest cross-workspace validation cairn's distillate concept
has received — it produced shipped code, not just shipped artifacts.

## The arc

```
[Game Engine Research]              [Antigravity / Opus]
   (cairn-test-3, Cowork)              (cwar-engine workspace)
        │                                       │
        │ Step 1: research                      │
        │ Unity/Unreal deep-dives,              │
        │ cwar audit, worker-feasibility        │
        │                                       │
        │ Step 2: /reflect with                 │
        │ downstream consumer declared          │
        │ → distillate/antigravity/             │
        │                                       │
        │            Step 3: cp transport       │
        │ ────────────────────────────────────► │
        │   to ~/.gemini/antigravity/memory/    │
        │                                       │
        │                                       │ Step 4: cairn adoption
        │                                       │ (workflows installed
        │                                       │  in .agents/workflows/)
        │                                       │
        │                                       │ Step 5: /bridge incoming
        │                                       │ with verify-step
        │                                       │ (grep'd src/sim/ to
        │                                       │  confirm worker feasibility)
        │                                       │
        │                                       │ Step 6: /plan →
        │                                       │ PLAN_WORKER_SIMULATION.md →
        │                                       │ implementation →
        │                                       │ commit a02e2ce2 on main
        │                                       │ "feat: Worker-based
        │                                       │  simulation (Phase 1,
        │                                       │  feature-flagged)"
        │                                       │
        │                                       ▼
                                          [shipped code]
```

## What each step demonstrates

| Step | Cairn primitive used | What it proves |
|---|---|---|
| 1. Research | None — pre-cairn work | Establishes the research material that needs transport |
| 2. /reflect with distillate | v0.8 upstream/downstream | Producer can shape output for a specific consumer's habitat |
| 3. cp transport | (manual today; v0.10.6 added auto-offer) | Cross-workspace boundary crossable with shell tools |
| 4. Cairn adoption | v0.5 graduated tiers + v0.4.1 a-la-carte | Mature project can adopt cairn selectively without overwriting existing infra |
| 5. /bridge incoming with verify | v0.10.5 ask-direction + v0.10.6 verify-step | Consumer can ingest claims while checking them against current code |
| 6. /plan → execute → commit | cwar's existing /plan workflow | Cairn-formatted plan produces a real implementation that ships |

## Why this matters

Most cairn validations to date have been **artifact-level** — the framework produced
docs, memory entries, and law candidates. This is the first **code-level** validation:
a research finding from one workspace became a feature commit on another workspace's
main branch, traversing three different agent platforms (Cowork → Antigravity →
Claude Code) with cairn primitives at each transition.

The verify-step at Step 5 is what made this work. The Opus agent grep'd `src/sim/`
for `window.|document.` references *before* trusting the distillate's "sim is DOM-free"
claim — found 2 guarded refs, confirmed feasibility, then proceeded to /plan. Without
that step, the resulting plan would have been speculation. With it, the plan was
grounded in observed code state, and the implementation that followed was a feature,
not a bet.

## What's still manual

**Step 3 (cp transport) was the only manual step.** v0.10.6 added an auto-offer to
/reflect that probes whether the consumer path is locally writable and prompts to
copy directly — for same-machine cases like this one, it would have eliminated the
manual `cp`. For cross-machine cases, git transport remains the canonical fallback.

The human's role across the arc was: declare the downstream consumer in CLAUDE.md
(once), approve writes (~3 times), run cp once (would now be y/n prompt), direct the
Opus session into /bridge, approve the plan, approve the implementation. Most of the
cognitive work happened inside agent sessions; the human was orchestrator, not
message bus, for the substantive transitions.

## Replicability

The arc isn't a one-off. The components compose because cairn standardized them:

- Any session with declared downstream consumers + `/reflect` produces distillate.
- Any session with cairn workflows installed can run `/bridge incoming` with verify.
- Any agent that can run a project's existing `/plan` workflow can produce a plan
  from bridged content.
- Any agent that can read its own plans can implement them.

What's required:
1. Producing session has cairn at `grow` tier or higher (for `/reflect` distillate support).
2. Consumer workspace has cairn workflows installed (or adapted versions, as cwar did).
3. Consumer's `/plan` workflow exists (cairn's own `/plan.md` works; cwar's richer
   `/plan` workflow works better for a mature project).
4. The transport step works (same-machine: cp or v0.10.6 auto-offer; cross-machine: git).

## Open questions

1. **Can Step 3 be removed entirely?** v0.10.6 partially addresses this for
   same-machine cases. For cross-machine, what's the minimum infrastructure to make
   distillate auto-flow? Git submodule? Periodic sync script? HTTP endpoint similar
   to cairn's feedback endpoint?

2. **What's the failure mode at scale?** This arc had one research session feeding
   one implementation. What happens when 10 research sessions feed 5 implementations?
   How does the consumer agent prioritize? Does cairn need a `/triage-distillate`
   skill?

3. **Does the verify-step need formalization beyond /bridge?** The Opus agent
   verified naturally, but only because cairn's `/bridge` Step 3.5 (added v0.10.6)
   prompted it. What about claims that come into a session through other channels —
   a memory load at session start, a HANDOFF.md read, a reference doc cited in
   conversation? Is there a general "verify before trusting persisted claims" law
   beyond the bridge case?

## Specific evidence (commit hashes, files)

- **Distillate produced**: `distillate/antigravity/{reference,project,feedback}/*.md` in cairn-test-3 workspace
- **Transport target**: `~/.gemini/antigravity/memory/{reference,project,feedback}/*.md` (user-global Antigravity memory; visible to all Antigravity workspaces)
- **Cairn adoption commit (cwar-engine)**: `9e2a07d8` — "chore: add cairn agent workflows (advocate, bridge, reflect, reframe, resume) and HANDOFF"
- **Audit rename commit**: `9834b030` — "chore: rename /audit workflow to /audit-code"
- **Implementation commit**: `a02e2ce2` — "feat: Worker-based simulation (Phase 1, feature-flagged)"
- **Law 12 (Provenance Asymmetry) added concurrently**: `398d20ae` in NEW_LAWS_OF_AI_AGENT_ENGINEERING.md

## Lesson for cairn design

The arc worked because **cairn didn't try to do too much**. At each step, cairn
provided structure and convention; the agents did the work; the human held the steering
wheel at decision points. Cairn isn't a workflow engine — it's a vocabulary and a set
of conventions for agent collaboration. The fact that an entire research-to-production
arc traversed it without anyone needing to invent new infrastructure mid-flight is the
quietest possible success metric, and probably the most important one.
