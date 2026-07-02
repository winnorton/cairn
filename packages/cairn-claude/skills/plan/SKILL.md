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

1. **Restate the goal in one sentence.** A failed restatement means the goal isn't understood yet — ask.

2. **List the steps.** Keep them concrete and ordered. For each step, mark:
   - **[R]** if reversible (local edits, scratch files).
   - **[!]** if irreversible or has external blast radius (pushes, deletes, sends).
   - **[?]** if it depends on an assumption you're making.

3. **Surface assumptions.** Any `[?]` steps — state the assumption explicitly. If load-bearing,
   convert to a question before moving on.

4. **Flag the first `[!]` step.** That's the confirmation gate. Everything before it you
   can do after user approval of the plan; the first `[!]` needs its own explicit approval
   at execution time.

5. **Surface timing dimensions if lifecycle-relevant.** If any step has a cost curve
   that shifts over time — "cheap to change now, expensive later" (early development,
   structural refactors) or "expensive now, cheaper later" (premature optimization,
   waiting for a dependency) — name it in the plan as a one-liner:

   > *"Note: this is a structural change. Now (pre-users) it's a file move; later
   > (post-adoption) it requires migration."*

   Agents default to conservative / incremental. The human has lifecycle context the
   agent doesn't. Surfacing the timing dimension gives the human an opening to override
   your default with their window-aware judgment. Only include when the timing actually
   matters — don't perform timing awareness for every trivial plan.

6. **Surface credential-durability if any step touches secrets.** Per
   `[LAW credentials-never-in-transcript]`: if any step requires a credential
   (API key, PAT, OAuth token, password, deploy secret), the plan MUST enumerate
   at least one path that keeps the secret OUTSIDE the chat transcript (env file
   the agent doesn't read; shell prompt for paste; `gcloud secrets create`;
   `gh auth login` from a separate terminal; etc.). If an in-chat-paste path is
   offered as an alternative, tag it explicitly:

   > *"⚠️ Alternative — pasting `<credential>` here will land it in the
   > durable session transcript. Only use this if you accept that the transcript
   > persists wherever it gets stored."*

   The keep-secret-out-of-chat path MUST be the default proposal. In-chat-paste
   is a fallback the agent proposes ONLY if the user requests it after seeing
   the default. Source incident: cairn's foundational build session offered a
   PAT-in-chat path as a peer option to keep-the-token — user took the offered
   path; the token lived in the transcript for ~6 weeks before discovery.

7. **Scope-checkpoint trigger — re-invoke `/plan` when crossing tool-boundaries.**
   Name scope expansion explicitly at the moment it happens: when a session that
   started in one tool domain crosses into another mid-execution (file edits →
   network calls; local code → deploy commands; analysis → infrastructure
   changes), STOP and re-invoke `/plan` before proceeding. The scope expanded;
   the original plan may not cover the new domain's blast radius. Scope tends to
   ratchet — each expansion feels incremental and none get named unless a
   checkpoint forces it. Especially load-bearing when the new domain needs
   credentials: silent scope ratchet and
   `[LAW credentials-never-in-transcript]` co-fire when expansion brings the
   agent into infra territory. Re-invoking `/plan` surfaces both dimensions at
   once. (If your habitat's `LAWS.md` has a scope law, cite it here by slug.)

   In the cairn foundational session, the `/feedback` skill scope expanded
   ~10× from "agents can file feedback" to "operate production cloud infra"
   in one continuous arc — and that expansion brought the agent into the
   GCP-deploy territory where it offered the credential-in-chat shortcut.
   A scope-checkpoint trigger at the file-edits → cloud-deploy boundary
   would have caught both failure modes before they co-occurred.

8. **Present and wait.** Show the plan in under ~150 words. End with a single clear question:
   "Proceed with this plan?" Do not start executing until the user says yes.

## Output

A compact plan with:
- Goal (one line)
- Steps (numbered, tagged with [R]/[!]/[?])
- Assumptions (bulleted if any)
- Credential-durability flag (if any step touches secrets — per Step 6)
- The confirmation gate question

Nothing else. No preamble. No commentary.

## When to re-invoke /plan mid-execution

Per Step 7 above: cross a tool boundary, re-plan. Specific triggers:

- File edits → network calls (HTTP, SSH, deploy)
- Local code → infrastructure changes (cloud, DNS, secrets)
- Analysis-only → execution that has external blast radius
- Single-repo work → multi-repo work
- Read-only operations → write operations against shared state

When any of these fires, the agent stops, names the boundary crossing, and
re-invokes `/plan` for the new scope. This is the operational mechanism for
naming scope expansion explicitly instead of letting it ratchet silently.
