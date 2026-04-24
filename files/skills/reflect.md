---
name: reflect
description: Pause and take stock during or after a stretch of work. Use when the user says
  "reflect", "take stock", "what did we learn", "hell yes" (in response to a reflect offer),
  or after completing a non-trivial task before moving to the next one. Agents should also
  PROACTIVELY propose /reflect at natural checkpoints — end of a deep-dive, completed
  substantive chunk, hitting a milestone, before switching context. Surfaces lessons,
  updates memory, flags drift. If the workspace declares downstream consumers, also
  produces distillate for their habitats. Do NOT use for simple one-step tasks or
  mid-execution — reserve for genuine inflection points.
---

# Reflect

Pause the forward motion. Take stock. Decide what carries forward into future sessions —
both this workspace's own habitat and any downstream consumer habitats.

## When to use

**User-invoked (explicit):**
- User explicitly asks to reflect, review, take stock, or "what did we learn."
- User says something affirmative to a reflect offer ("yes", "hell yes", "let's").

**Agent-proactive (propose, don't auto-fire):**
- A multi-step task just completed and a natural inflection point exists before the next.
- You've produced significant output (a research doc, a design, a deep-dive).
- You notice you've been drifting from the original goal or repeating mistakes.
- Session has been running a long time without a checkpoint.

When proactively proposing, keep it tight: *"Natural reflection point — want me to run
/reflect?"* The user can decline. Default to offering, not waiting in silence.

Do NOT invoke for:
- Single-step tasks or trivial questions.
- Mid-execution of a well-scoped task — finish first, reflect after.

## Steps

1. **Summarize in one sentence**: what was the work, and what's the outcome so far?

2. **Surface three things**:
   - **What worked**: an approach or decision worth repeating. Be specific — "the X approach
     to Y" beats "good communication."
   - **What didn't**: a mistake, detour, or friction point. Include the root cause if known.
   - **What surprised**: anything you or the user didn't expect. Surprises are often the
     most memorable signal.

3. **Decide what persists for THIS workspace**. For each of the three:
   - Is it worth remembering across sessions? If yes → candidate for memory (feedback,
     project, or reference type).
   - Is it worth a law? If it's a "never again" or "always do this," it belongs in LAWS.md,
     not memory.
   - Is it a one-time observation? Then it stays in this session's transcript and doesn't
     need to persist anywhere.

4. **Check for downstream consumers.** Read this workspace's `CLAUDE.md` for a section
   titled `## Downstream consumers`, `## Consumers`, or similar. If present, the workspace
   is declared as upstream research/work that feeds another habitat. For each declared
   consumer, additionally propose:

   - **Reference memories** shaped for their habitat (where to find this research later)
   - **Project memories** shaped for their habitat (what decisions should this research
     inform, what's the current state they should know)
   - **Law candidates** shaped for their habitat (never-do-X / always-do-Y rules
     that emerged from this research, with *Why* and *How to apply*)
   - **Plan candidates** for bigger architectural decisions the research surfaced

   Each downstream artifact is shaped *for the consumer's vocabulary and habitat*, not
   this workspace's. Example: if this workspace researched Unreal's rendering and
   `cwar-engine` is declared as downstream, the reference memory reads as it would in
   cwar-engine's habitat — "per Unreal's GBuffer approach [cite URL], cwar renderer
   should prefer X" — not "I learned something about GBuffers today."

5. **Propose all updates before writing**. Show the user:
   - Memory entries you'd add to THIS workspace (name, type, body sketch).
   - Laws you'd add to THIS workspace (rule + Why + How to apply).
   - Existing entries you'd revise or retire in THIS workspace.
   - **Distillate for each downstream consumer** (memory / laws / plans, shaped for them).
   Wait for approval before writing. The user can approve or decline per-section.

6. **Write approved local updates directly**. For downstream distillate, write it to a
   designated `distillate/` folder in this workspace (create if absent) so the user can
   transport it — via copy, symlink, or git submodule — into the consumer habitat.

   File naming convention: `distillate/<consumer-name>/<type>/<slug>.md` so the consumer
   can ingest by folder structure.

## Output

A short reflection (under ~300 words) with:
- One-sentence summary
- Three surfaced items (worked / didn't / surprised)
- Proposed persistence actions for this workspace
- Proposed distillate for each downstream consumer (if declared)
- End with a clear question: "Write these updates?"

No prose padding. The reflection is the value.
