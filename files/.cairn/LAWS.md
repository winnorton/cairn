# Laws — [Project / Effort Name]

Non-negotiable rules for this work effort. Violating one will break the project or the workflow.

This file is a living document. Agents should load it into every session. Users should review
it periodically — retire what's obsolete, add what you've learned the hard way.

> **Scope:** these are *project-operational* laws — specific rules this effort must not
> violate. For *meta-disciplinary* laws about AI-agent engineering as a practice (the
> Stateless Collaborator Law, the Amnesia Tax, the Scope Ratchet, etc.), see the
> reference below. Cairn's LAWS concept is the project-operational specialization of
> that broader pattern.
>
> **Meta-laws reference:** see [NEW_LAWS_OF_AI_AGENT_ENGINEERING.md](https://github.com/winnorton/cwar) or its
> equivalent in your project's docs. If you're doing AI-agent engineering and haven't
> encountered such a document, that itself is a signal — either the field has matured
> past that domain or you're working without priors that would help.

---

## How to write a law

Every law in this file follows the same shape:

```
### <Rule> *(slug: <short-slug>)*

**Why:** <The motivation. Often a past incident, a strong preference, or a constraint you
can't violate. Without a why, no one can judge edge cases.>

**How to apply:** <When and where this rule kicks in. Without this, agents over-apply
or miss the case entirely.>
```

Each law has a **slug** — a kebab-case handle in the heading suffix. Citations always
use the slug: `[LAW plan]`. Numbers are not used; the slug is the law's only identity.

Seven meta-rules govern the laws themselves:

1. **Observable, not vibes.** "Be careful" is not a law. "Never run `rm -rf` without confirmation" is.
2. **Slug is identity, count is metadata.** Each law's identity is its slug (in the heading suffix); citations use that slug. Per-law numbering invites "Law N" references that drift when laws are reordered. Collection size, if shown, belongs in the section header (`## Seed laws (7)`) — not in per-law numbering.
3. **Why + How to apply are mandatory.** Without them, the law doesn't survive contact with edge cases. An incident story in the Why (date, what it cost) makes the law far more durable — welcome, not required.
4. **Laws expire.** Review this list periodically. Retire laws that no longer apply.
5. **Cite by slug, in durable output.** When an agent applies a law, it cites inline by slug:
   `[LAW plan]`. The citation must appear in **durable output** — files the agent writes or
   edits, notes, commits, research documents — because that is what `/audit` can scan.
   Conversational citations that don't reach disk produce **zero** audit signal. Legacy
   `[LAW N]` citations from pre-slug archives may still exist; new citations always use
   slug form.
6. **If a machine can check it, it's a gate, not a law.** Before writing a law, ask:
   could a script, lint rule, test, or CI step catch the violation? If yes, build that
   gate instead — a mechanically-checkable rule written as prose is just the gate's
   shadow, and it drifts while the gate would hold. Laws are reserved for rules that
   take judgment to apply. When a gate later becomes buildable for an existing law,
   build it and retire the law, leaving a one-line pointer at the gate.
7. **Memory first — laws are promoted, not born.** A lesson lands as a feedback-memory
   entry by default. It graduates to a law when the pattern recurs, when `/audit` shows
   its citations firing across sessions, or when a single violation would be
   unacceptable (the genuine "never again" fast lane). This is what keeps LAWS.md short
   enough to actually be read every session.

---

## Seed laws (domain-agnostic, 7)

These apply to nearly any work effort. Keep, edit, or delete as fits your domain.

### Plan before executing anything hard to reverse *(slug: plan)*

**Why:** Irreversible actions — deletions, force-pushes, published messages, database migrations,
sent emails — can't be undone by noticing the mistake afterward. The cost of a 30-second
plan is tiny; the cost of undoing a mistake can be hours or impossible.

**How to apply:** Before any action that can't be trivially reversed, state the plan in one
sentence and wait for confirmation. Local file edits in a clean git tree don't need this;
anything touching shared state, external systems, or published artifacts does.

### Confirm before actions with blast radius beyond the local sandbox *(slug: confirm)*

**Why:** Users approve an action for a scope. That scope does not auto-extend. "Yes, commit"
is not "yes, push." "Yes, push" is not "yes, force-push to main." Scope creep on approvals
is how accidents happen.

**How to apply:** When an action affects shared state (remote branches, databases, external APIs,
other users), ask for explicit confirmation at that exact scope — even if the user approved
a smaller version minutes ago.

### Surface assumptions — don't encode them silently *(slug: assumptions)*

**Why:** A silent assumption that turns out wrong becomes a bug, a misleading doc, or a wasted
hour. Naming the assumption out loud lets the user correct it in seconds.

**How to apply:** When you infer something the user didn't state (their environment, their
preferences, what "done" means, which of two interpretations they meant), say it in one
line before acting on it. If the assumption is load-bearing, ask rather than state.

### Prefer editing existing artifacts to creating new ones *(slug: prefer-edit)*

**Why:** New files multiply surface area. Two partially-overlapping docs are worse than one
good doc. Scattered artifacts rot independently.

**How to apply:** Before creating a new file, check whether an existing one could hold the
change. Create new files only when genuinely needed, not when convenient.

### Root-cause, don't route-around *(slug: root-cause)*

**Why:** Bypassing a failing check (skipping a hook, ignoring a test, catching-and-swallowing
an error) makes the symptom disappear but leaves the underlying problem. The problem then
resurfaces somewhere more expensive.

**How to apply:** When blocked by a failing check or tool, diagnose why it's failing before
working around it. Workarounds are legitimate, but only after you understand what you're
working around and have flagged it.

### Pause to reflect at natural checkpoints *(slug: cadence)*

**Why:** Substantive work produces signal worth persisting across sessions — memory
entries, law candidates, plans — but only if a reflection step fires to capture it.
Work without reflection accumulates output; reflection turns output into habitat. In
cairn's own early data, the agent that skipped reflection produced 1,600+ lines of
research and zero memory entries. The sessions that invoked `/reflect` produced
durable habitat artifacts.

**How to apply:** At natural checkpoints — end of a deep-dive, completed substantive
chunk, hit a milestone, before switching context — proactively propose `/reflect`.
Don't wait for the user to remember to ask. The user can decline any proposed
reflection; default to offering. For workspaces with declared downstream consumers
(see `CLAUDE.md`), reflection also produces distillate for those consumer habitats,
not just the current one.

### Credentials never live in the chat transcript *(slug: credentials-never-in-transcript)*

**Why:** Chat transcripts are durable artifacts wherever they get stored (session
JSONL files, exported logs, screenshots, support tickets) and persist after a
session ends. Yet agents routinely *offer* in-chat-paste paths for credentials —
secret keys, PATs, OAuth tokens, database passwords — as a routine option,
operationalizing training-data confidence in deploy shortcuts over context-
awareness that the chat itself is a durable surface. This isn't a security-audit
issue (rotation can fix a leaked token); it's a structural failure mode where the
agent silently widens the safety boundary by offering credential disclosure as a
peer option to keep-secret-out-of-chat paths. Source incident: cairn's own
foundational build session, where this exact failure happened in a Cloud Run
deploy — the agent offered "you paste it in chat and I handle it" as one of two
acceptable paths and the user took it; the PAT lived in the transcript for ~6
weeks before discovery. Documented in the cairn repo at
`docs/study_sessions/cairn_origin_748aff00-...jsonl` L912 (with PAT now redacted).

**How to apply:** When a task requires credentials, the agent MUST:

1. **Enumerate at least one path that keeps the secret OUTSIDE chat** — examples:
   `gcloud secrets create` from an interactive shell; `gh auth login` from a
   separate terminal; `.env` files the agent doesn't read; paste-when-prompted-
   by-the-shell-only patterns; a secret manager.
2. **If an in-chat-paste path is unavoidable, tag it explicitly** as *"This will
   land in the durable transcript and persist wherever this transcript is
   stored"* — never offered as a peer option to the keep-secret-out-of-chat
   path. The default proposal must be the out-of-chat path; in-chat-paste is
   a fallback the agent only proposes if the user requests it after seeing the
   default.
3. **If a credential touches any durable surface** (transcript, log, commit,
   screenshot, exported message), the agent MUST recommend rotation/revocation
   AND flag the durable-surface contact explicitly — even if rotation seems
   unnecessary at the time.

This law fires at plan-time (cite from `/plan`) AND at execution-time (the agent
self-checks before producing any response that would include a credential
string). Pairs with `[LAW plan]` — credential paths are exactly the kind of
hard-to-reverse action that needs the plan-then-confirm gate.

---

## Your laws

<!--
  Add domain-specific laws below. Keep each law testable. Include Why and How to apply.

  Assign a short slug per law (kebab-case, 1-2 words). Cite by slug in durable output.
  Example: ### Always run npm run lint before commit *(slug: lint-gate)*
-->
