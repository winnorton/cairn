---
name: machinespec
description: The next evolution of /spec — author an AGENT-CONSUMED executor spec in the machine register, written and validated for fresh context, certified by the lint gate (importance_claims, coaching, optionality, negation_stack at 0) and a verification-based definition of done. Use when the executor is an agent reading the spec cold across the serialization boundary. For a plan a human reads and runs once, use /spec.
---

# Machinespec

Author an executor spec in the MACHINE REGISTER — the form an agent reads across the serialization boundary, where only the literal characters reach the executor and the author's intent stays behind. machinespec is the next evolution of `/spec`: the same executor-handoff bones (phases, steps, checkpoints, handoff), three deltas.

## Lineage — what evolves from /spec
- **Register.** The body is machine-register and gate-enforced to 0, in place of human prose. `/spec` writes for a human reader; machinespec writes for the executor.
- **Audience.** The spec is written and validated for fresh context — the executor holds none. `/spec` assumes a reader; machinespec proves one.
- **Certification.** Two gates back the spec: the lint gate certifies the register, a verification-based definition of done certifies the behavior. `/spec` asserts done; machinespec runs done.

## When to use
- The executor is an agent — a sub-agent, a Flash handoff, a daily unattended pass — reading the spec cold.
- For a plan a human reads and runs once, use `/spec`.

## Audience — fresh context
The consumer holds no authoring context; only the literal characters reach it. Write every file, function, path, command, and `[LAW <slug>]` at full identity. An in-context author reads intent through the text and under-grounds — ground for an agent that holds none. Read the target files this pass so the spec names what a fresh executor needs.

## The register (four gates, each at 0)
- **importance_claims = 0** — state the constraint; drop emphasis adjectives and justification clauses.
- **coaching = 0** — state the action; drop politeness and effort words.
- **optionality = 0** — write imperatives or precise conditionals (`when X, do Y`); drop permission and possibility modals.
- **negation_stack = 0** — write positive constraints; collapse nested negation to one positive form; fix a defect by deletion over a negating clause.

## Modes & guards
- **Guard:** reject a target path under `archive/` or `_promoted/`.
- **`--from docs/notes/NOTE_X.md`:** write `docs/specs/SPEC_<NAME>.md`; move the note to `docs/notes/_promoted/` and leave a breadcrumb.
- **`--from docs/specs/SPEC_X.md` (`Status: STUB`):** read the program master; elaborate the stub in place; flip `Status:` to `READY FOR EXECUTOR`.
- **Default:** write the contract from the task description.

## Spec shape
Write numbered contract sections (`§N`), one commitment per line, each file and function at its repo-relative path:
- **§Scope** — the surface the spec covers and the surface it excludes.
- **§Surfaces & boundaries** — the files, functions, and `[LAW]`s the work touches; the layer and ownership lines it holds.
- **§Phases** — ordered steps. Each step names one file and gives the CURRENT block and the REPLACEMENT block.
- **§Checkpoints** — after each phase, the command that confirms the phase (name the shell dialect).
- **§Merge / idempotence contract** — the stable key a re-run dedups on; the state a second run yields.
- **§Definition of done** — verification, per the next section.

## Definition of done is verification
State each done condition as a command or test that passes, in place of an adjective. Map each commitment in the spec to one checkpoint. The executor confirms by running the checkpoint, over reading the prose. Two gates back the spec:
- The **lint gate** certifies the register: `npm run lint -- <file>` reaches 0 on the four classes.
- The **verification DoD** certifies the behavior: the named commands and tests pass on a fresh checkout. (prompt-economy: the harness oracle certifies behavior past a static check.)

## Process
1. **Clarify** when the target is underspecified — (1) the contract surface? (2) the consumer (which agent/executor)? (3) the done condition?
2. **Research** the target files. Leave code unchanged. Name what a fresh executor needs.
3. **Write** the spec per §Spec shape. One commitment per line; full paths; CURRENT→REPLACEMENT per step; a checkpoint per phase; a verification definition of done.
4. **Gate** — run `npm run lint -- <file>` and reach 0 across the four register gates. Rewrite each flag to its positive imperative form. Re-run until 0.
5. **Fresh-context check** — hand the finished spec alone to a fresh agent and prompt it to restate the plan from the spec text only. A question it raises marks an under-specified section; close the gap and re-run step 4. Spawn the author agent from fresh context for the same reason: a context-less author grounds what a context-less executor needs.
6. **Confirm** under 120 words — spec path, phase count, the lint result, the fresh-context result, open questions.

## Output & ship
- **Output:** the spec file at its target path, plus the lint line `importance_claims:0 coaching:0 optionality:0 negation_stack:0` and the fresh-context result.
- **Ship:** `git mv docs/specs/SPEC_X.md docs/specs/archive/SPEC_X.md`. The folder location carries the status; the file holds no `Status:` field after ship.
