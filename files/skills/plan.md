---
name: plan
description: Before executing a non-trivial or hard-to-reverse task, state the plan and get
  approval. Use when the task has 3+ steps, touches shared state, involves irreversible
  actions, or when the user says "plan first" or "how would you approach this". Do NOT
  use for single-edit tasks, pure information requests, or when the user has already
  approved the approach in this conversation.
---

# Plan

State the approach before acting. The cost of 30 seconds of alignment is tiny next to the
cost of a wrong direction executed quickly.

## When to use

- Task has 3+ meaningful steps.
- Any step is hard to reverse (deletions, pushes, published artifacts, external side effects).
- User asks "how would you approach this," "plan first," or similar.
- You're uncertain which of two interpretations the user meant.

Do NOT invoke for:
- Single-edit tasks where the right move is obvious.
- Pure information requests (answer directly).
- Tasks where the user already approved the approach in this conversation.

## Steps

1. **Restate the goal in one sentence.** If you can't, you don't understand it yet — ask.

2. **List the steps.** Keep them concrete and ordered. For each step, mark:
   - **[R]** if reversible (local edits, scratch files).
   - **[!]** if irreversible or has external blast radius (pushes, deletes, sends).
   - **[?]** if it depends on an assumption you're making.

3. **Surface assumptions.** Any `[?]` steps — state the assumption explicitly. If load-bearing,
   convert to a question before moving on.

4. **Flag the first `[!]` step.** That's the confirmation gate. Everything before it you
   can do after user approval of the plan; the first `[!]` needs its own explicit approval
   at execution time.

5. **Present and wait.** Show the plan in under ~150 words. End with a single clear question:
   "Proceed with this plan?" Do not start executing until the user says yes.

## Output

A compact plan with:
- Goal (one line)
- Steps (numbered, tagged with [R]/[!]/[?])
- Assumptions (bulleted if any)
- The confirmation gate question

Nothing else. No preamble. No commentary.
