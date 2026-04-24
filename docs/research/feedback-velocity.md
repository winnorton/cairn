# Seven Releases in One Session: What Happens When Agents File Their Own Bugs

## The setup

An AI agent adopted cairn v0.1.0 — a portable agent environment framework — into a live Cowork session. The agent's job was to research agentic habitat: what persistent structures agents need to work effectively across sessions.

cairn includes a `feedback` skill that lets agents file structured issues directly to the project's GitHub repo. The agent used this (and its manual predecessor) throughout the session. The maintainer was active and responsive.

## What happened

| Version | What shipped | What triggered it |
|---|---|---|
| v0.1.0 | Initial install | `adopt cairn` |
| v0.2.0 | `tour` + `prune` skills | Agent gap analysis: onboarding cost, decay |
| v0.3.0 | `audit` + `feedback` skills, citation conventions | Agent finding: observation loops need signal |
| v0.3.1 | Cowork write-protection documentation | Agent-drafted issue: `.claude/` paths blocked |
| v0.4.0 | Type-aware memory, citation asymmetry fix | Agent finding: memory citations don't work like law citations |
| v0.4.1–3 | Storage model docs, memory path detection, role labels | Accumulated agent findings |
| v0.5.0 | Tiered adoption (seed/grow/structure/full) | Agent research: MVH + portability convergence |

Seven releases. Each one responding to something the agent observed while using the framework to study the framework.

## What this teaches

### The agent-as-user model produces different feedback than human testing

The agent hit friction a human user wouldn't — `.claude/` write-protection in Cowork, citation convention awkwardness, the ceremony weight of re-adoption. These are real issues that only surface when an agent actually executes the installation and adoption flows end-to-end, not when a human reads the docs and imagines how it would go.

Conversely, the agent missed things a human would catch. The initial gap analysis included three "architecture-brain" misreads (multi-agent coordination, habitat versioning, skill composition) that a human familiar with the "just files" philosophy would have filtered out. Agent feedback needs triage — it's high-volume and directionally useful, but not pre-filtered for paradigm fit.

### The feedback skill didn't enable the loop — it standardized it

The first fix (Cowork write-protection, v0.3.1) shipped before the feedback skill was ever formally invoked. The agent drafted the issue manually, describing what it observed and suggesting a fix. The skill arrived in v0.3.0 and formalized what was already happening.

This is an important design lesson: **skills that standardize existing agent behavior are more valuable than skills that try to create new behavior.** The feedback skill's contributions are format consistency (structured issue body), discoverability (new agents know filing is expected), and safety (PII sanitization reminders). None of these are heroic; all of them compound over time.

### Velocity requires a responsive maintainer

Seven releases in one session is not a property of the framework or the feedback skill. It's a property of the maintainer reading issues and shipping fixes in real time. The same feedback filed against a project with a two-week sprint cycle would produce zero releases in-session.

This suggests that the agent-feedback model works best for:

- Solo maintainers or small teams with short decision loops
- Frameworks in early development (where the fix surface is broad and changes are cheap)
- Low-stakes changes (documentation, skill additions, manifest metadata)

It works less well for:

- Large teams with review processes
- Mature frameworks with backward-compatibility constraints
- High-blast-radius changes (breaking API changes, security-sensitive fixes)

### The loop is self-reinforcing

Each release gave the agent more to observe. The citation convention (v0.3.0) led to the asymmetry finding (v0.4.0). The role labels (v0.4.3) led to the tiered adoption finding (v0.5.0). Each fix expanded the surface area for the next observation.

This is a feature, not a bug — but it also means the loop naturally accelerates during early development and naturally decelerates as the framework stabilizes. The right question isn't "how do we sustain this velocity?" but "how do we know when to stop?"

## The meta-observation

The agent was studying habitat. The habitat included a feedback skill. The feedback skill generated issues that changed the habitat. The changed habitat produced new observations. The observations generated more feedback.

This is participant-observation with a recursive twist: the observer is modifying the system it's observing, and the modifications change what the observer can see. In traditional research this would be a methodological problem. In framework development, it's the whole point.
