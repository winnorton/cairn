---
name: machineprogram
description: The next evolution of /program — author a program-of-specs (one master + N workstream child stubs in docs/specs/) in the MACHINE REGISTER, written and validated for fresh context, gate-certified (importance_claims, coaching, optionality, negation_stack at 0) with a verification-based program definition of done. Use when agent-executor workstreams exceed one machinespec and carry load-bearing cross-cutting concerns. Stubs elaborate via /machinespec --from. For a program a human reads, use /program; for one agent spec, use /machinespec.
---

# Machineprogram

A coordinated set of specs in the MACHINE REGISTER — one master + N workstream children — for agent-executor work that exceeds one machinespec. machineprogram is to `/program` what machinespec is to `/spec`: the same structure, three deltas.

## Lineage — what evolves from /program
- **Register.** The master and every stub are machine-register and gate-enforced to 0. `/program` writes for human reviewers; machineprogram writes for the parallel executors.
- **Audience.** The master and stubs are written and validated for fresh context — each executor holds none. Name every file, function, path, `[LAW <slug>]`, and contract surface at full identity.
- **Certification.** Two gates back the program: the lint gate certifies the register on the master and every stub; the §5 program definition of done is verification-based (named commands and tests that pass). `/program` asserts done; machineprogram runs done.

## When to use
- Agent-executor workstreams (sub-agents, a Flash team, a daily pass) exceed one machinespec, with load-bearing cross-cutting concerns (telemetry, determinism, CI gates).
- A single `/machinespec` grew past one file.
- For a program a human reads, use `/program`. For one agent spec, use `/machinespec`.

## Inherit the /program structure
Use `/program`'s structure verbatim — read `cairn/files/skills/program/SKILL.md` for the full schema:
- the required master sections §0 LEAD FINDING … §11 ARCHITECTURAL RATIONALE;
- the Gate A axes pass (domain + cross-cutting menu, each axis CLAIMED or EXCLUDED, silence excluded);
- §3 Resolved Design Decisions (no deferrals) + the deferral budget at 5 or fewer;
- §9 workstream registry / dependency DAG / waves / status table;
- the §9.3 parallel-execution protocol (one worktree per workstream, contract freeze before fan-out, serialized integration);
- the stub schema (Goal / Scope / Depends-on / Files / Gate / Telemetry-hook / Diagnostics-path / Rollback-story).

## The register (four gates, each at 0)
- **importance_claims = 0** — state the constraint; drop emphasis adjectives and justification clauses.
- **coaching = 0** — state the action; drop politeness and effort words.
- **optionality = 0** — write imperatives or precise conditionals (`when X, do Y`); drop permission and possibility modals.
- **negation_stack = 0** — write positive constraints; collapse nested negation to one positive form; fix a defect by deletion over a negating clause.

## Deltas applied to the structure
- **§2 CONTRACT SURFACES** — name every cross-child API, type, schema, file, and `[LAW]` at full repo-relative identity. A Wave-1 executor builds against the literal text; a fresh executor reads it cold.
- **§5 DEFINITION OF DONE** — each criterion is a command or test that passes, in place of an adjective. Carry the lint line per file and the host project's verification commands.
- **Host-fit** — when the program plugs into an existing engine, §2 names that engine's module/layer convention, its import-boundary rule, and its lint/test commands at full path. The fresh executor binds to the host through the spec text.
- **Stubs** — the `/program` stub schema in the machine register, elaborated by `/machinespec --from docs/specs/SPEC_<NAME>_<NN>_<TOPIC>.md`.
- **Gate B** — commit the master + stubs; peer-review the change set; run the lint gate over every file (master + stubs) to 0.

## Process
1. Run `/program` steps 1–7 (production-status gate, §0 evidence, Gate A axes, workstreams + DAG, §3 no-deferrals, §4–§11, stub generation) — author every artifact in the machine register.
2. **Gate** — run `npm run lint -- <file>` over the master and every stub; reach 0 on the four classes per file. When the host project carries its own register lint, run it too (cwar-engine: `npm run lint`, `npm run test:rules`).
3. **Fresh-context check** — hand the master alone to a fresh agent; prompt it to claim a workstream and restate that workstream's plan from the text only. A question it raises marks an under-specified §2 contract or §9 entry; close the gap and re-gate. Author the master from a fresh-context agent for the same reason.
4. **Confirm** under 200 words — master path, stub count, the per-file lint result, the fresh-context result, §3 deferral count, §9 OPEN-row count, the next-dispatch line.

## Output & dispatch
- Master `docs/specs/SPEC_<NAME>_00_PROGRAM.md` + N stubs `SPEC_<NAME>_<NN>_<TOPIC>.md`, each lint-clean.
- Next dispatch: `/machinespec --from docs/specs/SPEC_<NAME>_<NN>_<TOPIC>.md` per OPEN stub.
