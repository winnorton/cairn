# Lens briefs

There are three briefs, one per lens. Each lens agent sees only its brief, so every brief stands
alone. Replace every `{PLACEHOLDER}`, then dispatch all three in one message with the harness
default model and no model override.

| Placeholder | Fill with |
|---|---|
| `{REPO}` | the absolute repository path |
| `{SUBJECT}` | the subject's name |
| `{SUBJECT_ROOT}` | the subject's root from the profile |
| `{RANGE}` | `<since>..<until>` from step 0 |
| `{PROGRAMS}` | the program masters in the range, with paths |
| `{SHARED_ROOTS}` | the profile's shared-layer roots |
| `{NON_REUSE}` | the profile's "never counts as reuse" list |
| `{LIVE_SUBJECTS}` | the profile's rule for listing live subjects |
| `{LENS_RULES}` | the profile's "Lens rules" section, verbatim |
| `{INVENTORY}` | step 1's inventory: modules that gained exports, with their consumers |
| `{METRICS}` | step 1's reuse or duplication metric output |

---

## Primitives lens

```text
You are auditing shared-layer primitives in the repository at {REPO}. Read-only: do not edit,
commit, or run long test suites.

Project rules:
{LENS_RULES}

Shared layers are {SHARED_ROOTS}. Code there must be generic AND earn its place by reuse. A
primitive shaped by one subject's needs is half-generic, even if no identifier names that
subject. Use by {NON_REUSE} never counts as reuse.

Effort under review: subject {SUBJECT}, range {RANGE}, programs {PROGRAMS}.
The inventory below lists every module that gained exports in the range, with the live subjects
that reference those exports by name.

{INVENTORY}

For each module that has at most one subject consumer, and for any shared module the effort
extended:
1. Consumers: which live subjects use it in production code, directly or through configuration
   or framework wiring? Count non-reuse consumers separately.
2. Shape: quote the lines that are subject-shaped, if any: closed enums of one subject's
   vocabulary, limits sized to one subject's data, defaults that encode one subject's look,
   built-in presets for one subject's content.
3. Overlap: does an existing shared primitive already do this job? Name the file.
4. Shared limits: did the effort change a constant or capacity in a shared module that other
   subjects pay for? Name the subjects that pay.
5. Construction: does it use the project's standard extension mechanism (registry, plugin
   interface), or is it hand-rolled or bypassing that mechanism?
6. Verdict, one of:
   - REUSED: at least one production consumer besides {SUBJECT};
   - AWAITING-REUSE: the API is generic, but only {SUBJECT} uses it; name the most plausible
     second consumer;
   - HALF-GENERIC: say what to change;
   - DUPLICATE: say what to consolidate into.

Also report any docs that claim reuse the code does not show, and any new layering violations.

Return:
- a markdown table: module | consumers other than {SUBJECT} | verdict | evidence with file:line;
- then at most 8 findings ranked by importance, each with file:line evidence.
Stay under 900 words. Mark each finding verified (you read the code) or inferred.
```

---

## Local concepts lens

```text
You are looking for adoption and elevation candidates in the repository at {REPO}. Read-only:
do not edit or commit. You may grep freely and run quick metric commands; do not run the full
test suite.

Project rules:
{LENS_RULES}

A concept the subject built locally is one of:
- ADOPT: the shared layers ({SHARED_ROOTS}) already have a primitive for it, and the subject
  bypassed it;
- ELEVATE: two or more live subjects build it, and no primitive exists;
- ISOLATE: it genuinely belongs to this one subject.
Live subjects are {LIVE_SUBJECTS}. Read the list from disk; do not assume it.

Subject: {SUBJECT} at {SUBJECT_ROOT}, range {RANGE}. To see what the effort added, run
`git log {RANGE} --stat -- {SUBJECT_ROOT}`.

Metrics today:
{METRICS}

Task:
1. Derive the concept areas the effort built locally by reading its largest new or grown modules.
2. For each area:
   - find the other live subjects that implement the same job;
   - find any shared primitive that already exists for it, searching the shared layers by
     concept, not only by filename;
   - check each primitive's file header for rules like "the one query for X".
3. Recommend ADOPT, ELEVATE (name the second consumer) or ISOLATE.
4. If the project has a duplication metric, say which of these concepts it already detects and
   which probes would have caught the rest.

Be skeptical: two files with similar names are not duplication. Confirm they do the same job.

Return:
- a markdown table: concept | subject impl | other impls | existing primitive | recommendation;
- then up to 8 ranked findings with file:line evidence.
Stay under 900 words. Mark each finding verified or inferred.
```

---

## Process lens

```text
You are auditing the PROCESS, not the code, of the agent programs behind one effort in the
repository at {REPO}. Read-only: do not edit, commit, or run test suites. You may write
throwaway probe scripts outside the repository.

Project rules:
{LENS_RULES}

Scope: programs {PROGRAMS}, range {RANGE}, subject {SUBJECT}. Read the review-absorb,
remediation, and bookkeeping commits with `git log {RANGE}` and `git show`.

Questions:
1. Spec review: classify every absorbed review finding into defect classes derived from the
   data. Examples:
   - ownership or dependency conflicts between parallel workstreams;
   - stale file, symbol or line citations;
   - numeric claims that contradict the code;
   - the wrong integration seam;
   - a missing test registration;
   - wrong layer placement.
   Give counts per class. Which classes could a script catch before any review pass? Did any
   absorb introduce new defects?
2. After execution: classify the defects that peer review and remediation commits found. Which
   recur across workstreams or programs? Check specifically for:
   - hand-written counts drifting from an audit;
   - evidence fields that claim a check the capture never read;
   - single-seed or single-fixture captures masking bugs;
   - test registration done late;
   - unfinished exports leaking through shared barrels;
   - lint failures first found in review.
3. Paved tools: did the effort use the project's existing authoring, verification and evidence
   paths, as named in the project rules? Where it wrote one-off scripts instead, list them and
   say why the paved path did not fit, if that can be told.
4. Evidence: are the receipts and matrices produced by a committed tool, or written by hand?
   Does each claimed number have a producer in the repository?
5. Cost: count the process-only commits (claim, mark complete, elaborate, absorb, receipt
   alignment) against the implementation and remediation commits. Roughly how many doc lines
   changed, against source and test lines?

Return:
(a) a table of defect classes: count, phase found, recurrence, and "mechanically detectable? by
    what check";
(b) up to 8 ranked process improvements, each tied to evidence (a commit sha or file:line) and
    naming the check or tool that would catch it;
(c) the cost numbers.
Stay under 1000 words. Mark each item verified or inferred.
```
