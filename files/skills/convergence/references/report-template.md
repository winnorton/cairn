# Convergence report template

Copy to `<report dir>/<subject>-<YYYY-MM-DD>.md`.

- Keep the header lines exact. The next run starts its range where `**Range:**` ends, and a
  project inventory command may parse that line.
- Delete each italic guidance line once its section is filled.

```markdown
# Convergence: <subject>, <YYYY-MM-DD>

**Range:** `<since-sha>`..`<until-sha>`
**Programs:** [<program master>](<relative path>), …
**Working set:** <n> live subjects, read from disk <YYYY-MM-DD>

## Summary

_Three to five sentences: the pattern, the largest ADOPT items, the largest process gap._

## Carry-overs from earlier runs

| Item | From | Outcome | Evidence |
|---|---|---|---|

_Outcome is one of: adopted (cite the commit), declined (give the reason), retired, carried (give
the new candidate and due point)._

## Shared-layer primitives

| Module | Consumers other than the subject | Verdict | Evidence | V/I |
|---|---|---|---|---|

_Verdict is one of REUSED, AWAITING-REUSE, HALF-GENERIC, DUPLICATE. V/I is verified or
inferred._

## Subject-local concepts

| Concept | Subject impl | Other impls | Existing primitive | Recommendation | V/I |
|---|---|---|---|---|---|

_Recommendation is one of ADOPT, ELEVATE (name the second consumer), ISOLATE._

## Process

| Defect class | Count | Phase found | Recurs | Mechanically detectable by |
|---|---:|---|---|---|

_Then the cost numbers: process-only, implementation and remediation commits; doc, source and test
lines._

## Ranked actions

1. _In kind order: adopt, fix, discover, elevate (with a named second consumer), retire,
   process. Do not rank await-reuse items._

## Open items

_Add one row for each item still open when this report is written; the next run settles every
row. Kind is one of adopt, fix, discover, elevate, await-reuse, retire, process (the skill's
step 5 table). Name subjects by their exact names in Owner and Candidate consumer: a project
inventory may find rows by those names. Due names the event that settles the item, usually the
next convergence run on the candidate subject. "Recorded in" names the profile register for the
kind, or says "report only"._

| ID | Kind | Item | Owner | Candidate consumer | Due | Recorded in |
|---|---|---|---|---|---|---|

## Verification notes

_Say which findings were verified by reading both sides, which are inferred, and what could not be
checked._
```
