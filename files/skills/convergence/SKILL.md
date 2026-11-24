---
name: convergence
description: Review a finished multi-spec effort on one subject (a gamemode, app, service, or
  package built on shared layers) for what it should have reused or shared. Inventory what the
  effort added to the shared layers, run three cold lenses (new primitives with one consumer,
  local copies of shared primitives that already exist, authoring-process friction) against
  every live subject, verify each headline claim, settle earlier runs' open items, and write a
  report whose open items bind the next run; then ask before planning fixes. Use when a
  /program on a subject is about to archive and the project's .cairn/convergence.md requires
  it, before retiring a subject, or for "convergence", "elevation review", "elevate or
  isolate", "what should be shared". Do not use mid-program, for one /spec, for work with no
  subject, for a project with one subject and nothing shared, or to execute fixes (/program).
---

# Convergence

A program on one subject leaves two debts in the shared layers. First, new primitives that only
that subject uses. Second, local copies of shared primitives that already exist. This skill finds
both, and it carries every open item into the next run, which must settle it.

## Project profile

Read `.cairn/convergence.md`. It states:

- how to list live subjects, and each subject's root;
- the shared-layer roots, and consumers that never count as reuse (labs, demos, tests);
- the measure commands, including an inventory command if the project has one;
- the registers where each kind of open item is enforced;
- the report directory, and prior sources to scan for carry-overs;
- whether a closing `/program` must run this skill;
- project rules for the lenses.

If the profile is missing, draft one from project context with
[references/profile-template.md](references/profile-template.md), show it, and write it once the
user approves. Without a profile, nothing is required.

## Procedure

### 0. Scope

Name the subject, the range, and the programs it covers. By default the range starts where the
subject's last report's `**Range:**` line ends. On a first run, with no earlier report, it
starts at the first commit of the earliest program in scope. Read each program's contract
sections and its stated reason for any new shared code.

### 1. Measure (commands, no agents)

Run the profile's measure commands. If there is no inventory command, produce these by hand:

- the commits in the range that touch the subject or name it;
- every shared-root module that gained exports in those commits;
- for each module, the live subjects that reference it by name, with non-reuse consumers listed
  apart.

Record exact numbers: the next run compares against them.

### 2. Settle carry-overs

Read every open-items row and carry-over paragraph in earlier reports and prior sources that
names this subject as owner or as candidate consumer. Each leaves this run with one outcome:

- **adopted:** cite the commit;
- **declined:** state why the primitive does not fit, and whether it needs fixing;
- **retired:** its due point passed with no second consumer, so demote or delete it;
- **carried:** give a new candidate and a new due point.

None stays open silently.

### 3. Three cold lenses, in parallel

Fill [references/lens-briefs.md](references/lens-briefs.md) with the subject, the range, the
profile's lens rules and the step 1 output. Dispatch all three in one message, with the harness
default model and no model override. Lens agents must not have authored the work.

| Lens | Question | Verdicts |
|---|---|---|
| Primitives | Is each export the effort added to the shared layers generic and reused, or shaped by one subject? | REUSED, AWAITING-REUSE, HALF-GENERIC, DUPLICATE |
| Local concepts | Which concepts did the subject build locally that the shared layers already have, or that another live subject also builds? | ADOPT, ELEVATE, ISOLATE |
| Process | Which defects did review and remediation find, which recur, and which could a script have caught? Were the project's paved authoring tools used? | defect classes, each with "mechanically detectable by" |

### 4. Verify

A lens report is a claim. For every finding that enters the report, open the cited `file:line`
yourself and mark it verified or inferred. Drop or downgrade what fails, and re-run every count
you quote.

### 5. Report, record, ask

Every finding that needs action becomes an open item of one kind. The report, the profile's
registers and the ranking all use the same kinds:

| Kind | Comes from | Action |
|---|---|---|
| `adopt` | DUPLICATE, or a local-concepts ADOPT | move the subject onto the existing primitive, which deletes code |
| `fix` | HALF-GENERIC | make the primitive generic |
| `discover` | a primitive authors cannot find where the project lists capabilities | register it there |
| `elevate` | a local-concepts ELEVATE with a named second consumer | create the shared primitive |
| `await-reuse` | AWAITING-REUSE | carry it with a named candidate and a due point |
| `retire` | an `await-reuse` item past its due point | demote or delete the primitive |
| `process` | a recurring process defect class | add the check that catches it |

1. Write `<report dir>/<subject>-<YYYY-MM-DD>.md` from
   [references/report-template.md](references/report-template.md). For a second run on the same
   day, append `-2`, then `-3`. Keep the `**Range:**` line exact.
2. Rank the actions in the table's order: adopt, fix, discover, elevate, retire, process. List
   `await-reuse` items without a rank.
3. Record each open item in the profile's register for its kind. The report's open-items table
   is written either way; it is what the next run reads.
4. Link the report from the program master before the master archives.
5. Ask whether to plan the actions as a `/program`. Do not start one.

## Rules

- **Second consumer or it is not an elevation.** "Usable by future subjects" is a prediction.
  A primitive with one subject consumer is AWAITING-REUSE. Give it a named candidate and a due
  point: the next convergence run on that candidate.
- **Ask who else uses it, not whether names leak.** A subject-shaped API with renamed
  identifiers passes a name check and still fails reuse. Shape signals:
  - closed enums of one subject's vocabulary;
  - limits sized to one subject's data;
  - defaults that encode one subject's look;
  - built-in presets for one subject's content.
- **ADOPT before ELEVATE.** Adopting deletes subject code and proves an existing primitive.
  Elevating adds shared surface.
- **Do not use lines of code as a convergence metric.** Turning imperative code into an
  authored data table raises the count while improving the code. Count mechanisms, consumers
  and duplicated concepts instead.
- **An evidence claim needs a producer.** A receipt field with no committed script or probe
  behind it is a finding.
- **One seed, fixture or input is not coverage.**
- **Compare against every live subject, read from disk each run,** never a typed list.
