---
name: reflect
description: Distill lessons at a natural checkpoint after substantive work. Use when
  the user asks to reflect or accepts a reflection offer; proactively offer after a
  milestone, deep-dive, or before switching context. Routes findings to gates, memory,
  laws, and declared downstream consumers. Do not use for trivial work or mid-execution.
---

# Reflect

Turn completed work into approved persistence for this workspace and any declared
downstream consumers.

## Trigger

Run when the user asks to reflect, take stock, name lessons, or accepts an offer.
At a natural checkpoint, offer once: `Natural reflection point — want me to run
/reflect?` Wait for consent. Finish active work first; skip trivial tasks.

## Workflow

### 1. Distill the work

State the work and outcome in one sentence, then name:

- **Worked** — a specific approach worth repeating.
- **Didn't** — friction or failure and its known root cause.
- **Surprised** — unexpected evidence or behavior.

### 2. Route local persistence

| Finding | Destination |
|---|---|
| A machine can detect it | Propose the test, lint, script, or CI gate; write no prose rule. |
| Judgment is required | Propose feedback memory. Promote to a law only after recurrence/citation evidence, or for a single intolerable violation. Laws include Why and How to apply. |
| Project state or external knowledge | Propose project or reference memory. |
| One-time observation | Keep only in the transcript. |

Also identify existing memories or laws that the evidence should revise or retire.

### 3. Shape downstream distillate

Read the workspace context for `Downstream consumers`, `Consumers`, or an equivalent
section. For each declared consumer, propose relevant reference memory, project memory,
law, and plan candidates in that consumer's vocabulary. Omit types with no useful
content.

### 4. Ask before writing

Present:

- each local memory's name, type, and body sketch;
- each local law's rule, Why, and How to apply;
- revisions or retirements;
- each consumer's proposed distillate.
- at a session boundary, a `HANDOFF.md` update covering current state, completed and
  open work, verified evidence, next action, and related memory paths.

Wait for section-by-section approval. Write only approved items.

### 5. Write and offer transport

Write approved local memory to `.cairn/memory/<type>/<slug>.md` and laws to
`.cairn/LAWS.md`, unless project context declares a compatible alternate. Write
downstream artifacts under `distillate/<consumer>/`:

| Consumer memory layout | Distillate path |
|---|---|
| Cairn project | `<type>/<slug>.md` → `<consumer>/.cairn/memory/<type>/<slug>.md` |
| Shared cross-project store | `<type>/<producer-project>/<slug>.md` → the consumer's shared memory tree, such as non-Cairn Antigravity `~/.gemini/antigravity/memory/` |

Use the producer directory basename for `<producer-project>`. Keep downstream law and
plan candidates in the distillate for consumer-side approval; do not place them in typed
memory directories.

When the consumer path is locally writable, ask whether to copy approved memory
distillates now. On approval, preserve Cairn `<type>/<slug>.md` or shared-store
`<type>/<producer-project>/<slug>.md` structure. Otherwise leave the distillate in place
and name the transport: copy for same-machine work or commit/push and pull for
cross-machine work.

At a session boundary, write the approved `HANDOFF.md` update before the session ends.

## Output

Stay under 300 words: summary, Worked/Didn't/Surprised, local persistence and HANDOFF
proposals, consumer distillate, and `Write these updates?`
