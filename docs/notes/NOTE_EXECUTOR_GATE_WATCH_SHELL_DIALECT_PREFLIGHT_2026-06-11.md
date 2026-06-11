# NOTE — executor gate-watch: shell-dialect, pre-flight-skipped, Pi skill-discoverability

> Filed: 2026-06-11 · Status: open · Source: first in-the-wild `/session-distill`
> after the `@winnorton/cairn-pi` npm publish — Pi session
> `019eb7b5-6b29-7053-a637-b8d2368b3288` (project pichiran, executor
> minimax-m2.7 via spark, thinking high).

Three patterns from the distill, tracked toward the 3-instance gate. The first two
got same-commit mitigations (skill-body edits in `/spec` + `/fast-execute`,
adopt.md fetch validation); the counters track whether the mitigations hold.

1. **wrong-shell-dialect-on-Windows — 2/3.** Specs authored in a
   PowerShell-native harness embed PowerShell in pre-flight/checkpoint blocks;
   Pi's bash tool is POSIX. Instances: (1) cwar session `019ea817…`
   (silent-rm-on-Windows family, already in the `/session-distill` catalog);
   (2) pichiran `019eb7b5` + precursor `019eb7b4` occurrence-cluster
   (PowerShell cmdlets/vars in bash → parse errors, exit 127). Mitigation
   shipped 2026-06-11: `/spec` "Declare the shell dialect" quality rule +
   `/fast-execute` translate-before-run check. A third instance after the
   mitigation promotes a law candidate `[LAW declare-shell-dialect]`.

2. **pre-flight-skipped-by-executor — 1/3.** Distinct from the catalog's
   stub-spec-executed-anyway: the spec was fully elaborated; the executor
   skipped the labeled Pre-flight block entirely, missing that the working
   directory had no `.git` (the program's rollback story and §8.1 commit
   protocol were unexecutable there). Mitigation shipped 2026-06-11: halting-gate
   language in `/spec`'s Pre-flight section spec and `/fast-execute` Step 4.
   Two more instances promote a law candidate (pre-flight as checkpoint-zero).

3. **skill-discoverability-in-Pi — 1/3 (observation).** The executor's `/tools`
   probes in precursor session `019eb7b4` could not see installed skills in the
   tool list — packaged skills are invisible to a model surveying its own
   toolset. Environment-support gap class (manifest/adopt.md per
   `/session-distill` Step 5). Watch: do Pi *authoring* sessions fail to find
   `/skill:spec` when they need it? If yes, this becomes an adopt.md Pi-notes
   documentation item or upstream Pi feedback.

Related catalog entries: silent-rm-on-Windows, Pi-as-executor /
spec-IS-the-contract (instance 2 confirmed by this same distill — first on a
non-Claude, non-Gemini model).
