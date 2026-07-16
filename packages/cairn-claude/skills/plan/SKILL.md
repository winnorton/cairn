---
name: plan
description: Align with the user before non-trivial or hard-to-reverse work. Use for
  tasks with 3+ meaningful steps, shared or external state, irreversible actions,
  ambiguous interpretations, or requests to "plan first" or "how would you approach
  this." Skip obvious single edits, information requests, and approaches already approved
  in this conversation.
---

# Plan

Expose goal, assumptions, reversibility, and blast radius before acting.

## Workflow

1. **Restate the goal in one sentence.** Ask for clarification when an accurate
   restatement is not possible.

2. **List concrete ordered steps.** Tag every step:

   - `[R]` — reversible local work.
   - `[!]` — irreversible action or external/shared side effect.
   - `[?]` — depends on an assumption.

3. **Resolve assumptions.** State every `[?]` assumption. Convert a load-bearing one
   into a question before requesting plan approval.

4. **Name the execution gate.** The user approves the overall plan before work begins.
   Everything before the first `[!]` may then proceed; request separate explicit
   approval immediately before executing that first `[!]`.

5. **Add only triggered risk notes:**

   - **Timing:** when lifecycle changes the cost, contrast now versus later in one
     sentence so the user can choose the window.
   - **Credentials:** per `[LAW credentials-never-in-transcript]`, default to a path
     outside chat, such as interactive authentication, a secret manager, or an env file
     the agent never reads. Offer chat paste only after the user requests it and label
     that the credential will persist in the transcript.

6. **Re-plan at a scope boundary.** Stop before crossing into a new tool or risk domain,
   such as files → network, local code → infrastructure, read-only → shared writes, or
   one repo → multiple repos. Name the expanded scope, side effects, credentials, and
   new first `[!]`, then present a revised plan. Wait for renewed approval before
   crossing the boundary.

7. **Present and wait.** Stay under 150 words. Include Goal, tagged Steps, Assumptions,
   triggered Timing/Credential notes, and the first `[!]` gate; write `First [!]: none`
   when every step is reversible. End with `Proceed with this plan?` Begin execution
   only after approval.

## Output

The compact plan from Step 7, with no preamble or extra commentary.
