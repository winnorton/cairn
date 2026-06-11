# SPEC_CAIRN_PI_PACKAGE — ship the /spec + /program authoring loop to Pi as a pi.dev package

> **Filed:** 2026-06-11 · **By:** Claude Fable 5 · **Requested by:** maintainer
>
> **Pattern reference:** [`@juicesharp/rpiv-pi`](https://github.com/juicesharp/rpiv-mono/tree/main/packages/rpiv-pi)
> (a pi package shipping 17 skills via `"pi": {"skills": ["./skills"]}`) and
> [`@juicesharp/rpiv-todo`](https://pi.dev/packages?name=todo) (the package cairn already
> recommends as Pi's orchestration spine). Pi package docs live in the pi repo at
> `packages/coding-agent/docs/` (earendil-works/pi on GitHub).
>
> **Relationship to in-flight work:** this is a **pull-forward of the Pi slice** of the
> "plugin packaging" thread that `SPEC_AGENTS_UMBRELLA.md` open question 2 defers to
> v0.15.x (per `[MEM project/cairn-blend-strategy-pillars]`). Pi's package manager already
> exists and Pi is already cairn's primary executor — the maintainer initiated this
> pull-forward on 2026-06-11. Claude Code plugin packaging remains a v0.15.x decision.
> Coordination constraints with `SPEC_AGENTS_UMBRELLA.md` are listed at the bottom.

## Human Intent

**Verbatim original request (2026-06-11):**

> *"This is about extending the Pi agent harness to support our /spec and our /program.
> here is a pattern https://pi.dev/packages?name=todo https://github.com/juicesharp/rpiv-mono"*

**Goal.** Make cairn's `/spec` and `/program` skills installable into the Pi coding agent
through Pi's native package manager — `pi install npm:<package>` — instead of (not in
place of) the curl-based `adopt cairn` flow. This extends Pi from executor-only (its
documented role since 2026-06-09) to a full authoring environment for the cairn
orchestration loop.

**Scope expansion, named per `[LAW scope-explicit]`.** The user asked for `/spec` and
`/program`. This spec bundles **six** skills — `spec`, `program`, `round-review`,
`fast-execute`, `peer-review`, `note` — because the two requested verbs structurally
reference the other four: `/spec --from` promotes `/note` artifacts and elaborates
`/program` stubs; `/program`'s Gate B calls `/peer-review`; `/round-review` is the loop's
read-end; `/fast-execute` is the Pi-daemon executor written for exactly this harness.
Shipping two verbs with four dangling references would be a half-shipped loop. The
bundle is one array in the sync script (`SKILLS` in STEP 2.2) — trimming back to two is
a one-line edit if the maintainer prefers; flag at review.

**What this is NOT (resolved against the linked pattern):**

- **Not a TypeScript extension.** `rpiv-todo` is an extension (tool + slash command +
  live overlay). Cairn ships markdown, not code (design DNA), and `adopt.md` already
  commits cairn to NOT competing with rpiv-todo's orchestration overlay. The cairn-pi
  package is **skills-only**: pi discovers `skills/<name>/SKILL.md` directories natively,
  zero runtime code. The only code is a dev-time sync script that never ships in the
  npm tarball.
- **Not a manifest.json change.** The package is a parallel distribution channel, not a
  manifest consumer. `manifest.json` is untouched (also avoids collision with
  `SPEC_AGENTS_UMBRELLA.md` Phase 2).

**Success criteria.**

1. `pi install npm:@winnorton/cairn-pi` (and the local-path equivalent) makes
   `/skill:spec`, `/skill:program`, `/skill:round-review`, `/skill:fast-execute`,
   `/skill:peer-review`, `/skill:note` available in a Pi session.
2. The published npm artifact contains only markdown + package metadata — no runtime JS.
3. `npm run check` inside the package fails on (a) any byte drift between
   `packages/cairn-pi/skills/` and `files/skills/`, (b) `package.json` version ≠
   `VERSION` file, (c) any bundled frontmatter `description` > 1024 chars. The check is
   wired to `prepublishOnly` so a drifted package cannot be published.
4. The `round-review` frontmatter description — **measured 1051 chars at spec time,
   over the canonical 1024-char SKILL.md cap shared by Claude Code and Pi** — is fixed
   at source (`files/skills/round-review/SKILL.md`), not forked in the copy.
5. `adopt.md`, `README.md`, `AGENTS.md`, `HANDOFF.md` document the package channel; the
   curl flow remains the documented fallback (three-level-degradation DNA).

**Out of scope.**

- Pi `extensions`/`prompts`/`themes`/subagent profiles (rpiv-pi ships `agents/`; cairn
  has no subagent profiles — revisit only if a real Pi-authoring session demands one).
- CI auto-publish on tag. First publish is manual; automate later if cadence justifies.
- Antigravity/Claude Code plugin packaging (v0.15.x thread, unchanged).
- Rewriting skill bodies for Pi's `/skill:` invocation form. Bodies stay byte-identical;
  the package README carries the mapping note (per `adopt.md`'s existing position:
  "skill descriptions match by trigger phrases, so adopters can use either form").

## Resolved design decisions

| Decision | Resolution | Rationale |
|---|---|---|
| Package name | `@winnorton/cairn-pi` | Mirrors `@juicesharp/rpiv-pi` (the skills-package precedent); scoped to the maintainer's npm identity per `[MEM project/cairn-blend-strategy-pillars]` (namespace collisions are real). **Fallback if the `@winnorton` npm scope can't be claimed:** unscoped `cairn-pi` — verify availability with `npm view cairn-pi` (expect 404), then 3 mechanical renames (package.json `name`, README install lines, the adopt.md/README/AGENTS.md mentions). |
| Where it lives | `packages/cairn-pi/` in the cairn repo | Second code-adjacent exception after `server/feedback-endpoint/`, same own-subdirectory containment. `packages/` (plural) leaves room for future slices of the v0.15 packaging thread. |
| Source of truth | `files/skills/<name>/SKILL.md`; package `skills/` copies are **committed build artifacts** | Copies must be committed so `pi install git:…` and local-path installs work with no build step (rpiv-mono's "no build step; packages publish raw" philosophy). Drift guard makes committed copies safe. |
| Drift guard | `scripts/sync-skills.mjs` with `--check` mode, wired to `prepublishOnly` | Borrowed from rpiv-mono's per-package `ship-manifest.test.ts` pattern per `[LAW borrow-adjacent]`, minus the test framework — zero dependencies, plain node. |
| Versioning | Lockstep with cairn's `VERSION` file, mechanically enforced by the check | rpiv-mono enforces lockstep across 12 packages; cairn's analog is `[LAW handoff-stays-current]`'s one-commit-one-consistent-view ethic. Republishing changed skills therefore rides the next cairn release. First publish: `0.13.1` (current VERSION). |
| Skill bodies | Byte-identical to source — never Pi-localized | One source of truth. Pi reads the same frontmatter format (name ≤64 lowercase+hyphens, description ≤1024). The `/spec`→`/skill:spec` mapping is README documentation, not a body fork. |
| License | MIT, package-local `LICENSE` file | Repo `README.md` already declares MIT ("MIT — fork it, adapt it"); the repo has **no root LICENSE file** (verified at spec time), so the package carries its own. npm requires one in-tarball for clean publication metadata. |

## Pre-flight

All paths relative to the cairn project root (`cd cairn/` first if in the meta-monorepo
checkout — siblings are `cairn-mcp-server/`, `cairn-sessions/`).

```bash
git status                                   # clean tree or feature branch
git log --oneline -3                         # current HEAD
cat VERSION                                  # expect: 0.13.1
node --version                               # any modern node (v24.13.1 at spec time)
ls files/skills/spec files/skills/program files/skills/round-review \
   files/skills/fast-execute files/skills/peer-review files/skills/note
                                             # all six SKILL.md sources present
test -d packages && echo "packages/ exists — check contents before Phase 2" || echo "fresh"
pi --version 2>/dev/null || echo "pi CLI absent — Phase 5 degrades, see CHECKPOINT 5"
```

Measured baseline (2026-06-11) for frontmatter `description` lengths (YAML
line-folding applied):

| Skill | Chars | vs 1024 cap |
|---|---|---|
| spec | 787 | OK |
| program | 726 | OK |
| **round-review** | **1051** | **OVER — fixed in Phase 1** |
| fast-execute | 996 | OK (28 spare — the check guards future edits) |
| peer-review | 910 | OK |
| note | 837 | OK |

## Phase 1 — Source-file remediation (round-review description over cap)

This is a latent bug in cairn's shipped tree, not a packaging-only concern — the
1024-char cap is the canonical SKILL.md format cap for **both** Claude Code and Pi
(documented in `manifest.json` `pathVariables.userSkills.pi.format-note`). Fix at
source; never trim the package copy.

### STEP 1.1 — `files/skills/round-review/SKILL.md`: trim description 1051 → 1021

Line 3 (the single-line `description:` value inside the frontmatter).

CURRENT (one line):

```yaml
description: Review one round of executor output against a program-of-specs and draft R+1 follow-up stubs PLUS an R+1 round master for the gaps. Invoke after an autonomous executor (Flash, `/goal`, a teammate) finishes a round of work on a `/program`-produced master. Trust-but-verify — the executor's status files (`task.md` checkboxes, "all done" claims) are NOT authoritative; the diff plus the program master's `§5 Definition of Done` are. Produces three artifacts — (1) a structured review report in conversation, (2) N R+1 stub specs per `/program`'s stub schema (`SPEC_<NAME>_R<N>_<NN>_<TOPIC>.md`), and (3) an R+1 round master (`SPEC_<NAME>_R<N>_00_MASTER.md`) that's the dispatch target — execution order, round-level DoD, first-action checklist all self-contained so the next dispatch is `/goal execute <round-master-path>` with no caveats. Loop exit — when this skill writes zero R+1 stubs, the program is done. Do NOT use if you authored the executor's implementation (anti-fresh-perspective). Do NOT use for single-spec work (just run `/peer-review`).
```

REPLACEMENT (one line; verified 1021 chars at spec time):

```yaml
description: Review one round of executor output against a program-of-specs and draft R+1 follow-up stubs PLUS an R+1 round master for the gaps. Invoke after an autonomous executor (Flash, `/goal`, a teammate) finishes a round of work on a `/program`-produced master. Trust-but-verify — the executor's status files (`task.md` checkboxes, "all done" claims) are NOT authoritative; the diff plus the program master's `§5 Definition of Done` are. Produces three artifacts — (1) a review report in conversation, (2) N R+1 stub specs per `/program`'s stub schema (`SPEC_<NAME>_R<N>_<NN>_<TOPIC>.md`), and (3) an R+1 round master (`SPEC_<NAME>_R<N>_00_MASTER.md`) that's the dispatch target — execution order, round DoD, first-action checklist self-contained so dispatch is `/goal execute <round-master-path>` with no caveats. Loop exit — when this skill writes zero R+1 stubs, the program is done. Do NOT use if you authored the executor's implementation (anti-fresh-perspective). Do NOT use for single-spec work (just run `/peer-review`).
```

WHY: 30 chars trimmed via three lossless edits — "a structured review report" → "a review
report"; "round-level DoD … all self-contained" → "round DoD … self-contained"; "so the
next dispatch is" → "so dispatch is". Every trigger phrase, artifact name, and anti-trigger
survives. The installed-skill copies on this machine (`~/.claude/skills/round-review/`)
will pick the fix up at next re-adoption — out of scope here.

**CHECKPOINT 1**

```powershell
# From repo root (PowerShell):
$skills = 'spec','program','round-review','fast-execute','peer-review','note'
foreach ($s in $skills) {
  $raw = Get-Content "files/skills/$s/SKILL.md" -Raw
  if ($raw -match '(?s)^---\r?\n(.*?)\r?\n---') {
    if ($Matches[1] -match '(?s)description:\s*(.*)$') {
      $d = ($Matches[1] -replace '\r?\n\s+', ' ').Trim()
      "{0}: {1}" -f $s, $d.Length
    }
  }
}
# expect: every count <= 1024; round-review == 1021
```

If round-review still reads > 1024: the replacement line was wrapped or partially
applied — re-apply STEP 1.1 as a single-line value.

## Phase 2 — Package scaffold

Create `packages/cairn-pi/`. Four files, one per STEP. Do **not** create
`packages/cairn-pi/skills/` by hand — Phase 3 generates it.

### STEP 2.1 — Create `packages/cairn-pi/package.json`

```json
{
  "name": "@winnorton/cairn-pi",
  "version": "0.13.1",
  "description": "Cairn's authoring-and-orchestration loop for the Pi coding agent: /skill:spec, /skill:program, /skill:round-review, /skill:fast-execute, /skill:peer-review, /skill:note. Markdown skills only — no runtime code.",
  "keywords": ["pi-package", "pi", "skills", "cairn", "spec", "program", "orchestration"],
  "license": "MIT",
  "author": "Win Norton",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/winnorton/cairn.git",
    "directory": "packages/cairn-pi"
  },
  "homepage": "https://github.com/winnorton/cairn/tree/main/packages/cairn-pi#readme",
  "bugs": { "url": "https://github.com/winnorton/cairn/issues" },
  "files": ["skills", "README.md", "LICENSE"],
  "pi": { "skills": ["./skills"] },
  "scripts": {
    "sync": "node scripts/sync-skills.mjs",
    "check": "node scripts/sync-skills.mjs --check",
    "prepublishOnly": "node scripts/sync-skills.mjs --check"
  },
  "publishConfig": { "access": "public" }
}
```

WHY each load-bearing field:
- `"pi": { "skills": ["./skills"] }` — the harness extension point. Pi recursively
  discovers `skills/<name>/SKILL.md` under each declared path. This single field IS
  the "extend the Pi agent harness" mechanism.
- `"keywords": ["pi-package", …]` — `pi-package` is the documented marker for
  pi.dev/packages gallery discoverability.
- `"files"` excludes `scripts/` — the sync script is dev-time only; the published
  tarball stays markdown-only (success criterion 2). `prepublishOnly` still runs from
  the repo working copy, where `scripts/` exists.
- `"version": "0.13.1"` — lockstep with `VERSION` (enforced by STEP 2.2's check).
- `"publishConfig": { "access": "public" }` — scoped packages default to private;
  publish would otherwise fail.

### STEP 2.2 — Create `packages/cairn-pi/scripts/sync-skills.mjs`

```js
#!/usr/bin/env node
// Sync the canonical cairn skill files into this package — or verify them (--check).
//
// Source of truth: <repo>/files/skills/<name>/SKILL.md. The copies under
// packages/cairn-pi/skills/ are committed build artifacts so the package installs
// from npm, git, or a local path with no build step (rpiv-mono pattern). Byte drift
// between source and copy fails --check, which is wired to prepublishOnly — an
// out-of-sync package cannot be published.
//
// Also enforced here:
//   - frontmatter `name:` equals the directory name and matches the canonical
//     pattern (lowercase/digits/hyphens, <= 64 chars)
//   - frontmatter `description:` <= 1024 chars after YAML line-folding
//     (the canonical SKILL.md cap shared by Claude Code and Pi)
//   - package.json version === <repo>/VERSION (lockstep releases)

import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SKILLS = ["spec", "program", "round-review", "fast-execute", "peer-review", "note"];
const MAX_DESCRIPTION = 1024;
const NAME_RE = /^[a-z0-9][a-z0-9-]{0,63}$/;

const pkgRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = resolve(pkgRoot, "..", "..");
const check = process.argv.includes("--check");

const errors = [];

function frontmatter(raw, file) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) {
    errors.push(`${file}: no YAML frontmatter`);
    return {};
  }
  const name = (m[1].match(/(?:^|\n)name:[ \t]*(.+)/) ?? [])[1]?.trim();
  const desc = (m[1].match(/(?:^|\n)description:[ \t]*([\s\S]*)$/) ?? [])[1]
    ?.replace(/\r?\n[ \t]+/g, " ")
    .trim();
  return { name, desc };
}

const pkg = JSON.parse(readFileSync(join(pkgRoot, "package.json"), "utf8"));
const repoVersion = readFileSync(join(repoRoot, "VERSION"), "utf8").trim();
if (pkg.version !== repoVersion) {
  errors.push(
    `version lockstep: package.json has ${pkg.version}, VERSION has ${repoVersion}`,
  );
}

for (const skill of SKILLS) {
  const srcPath = join(repoRoot, "files", "skills", skill, "SKILL.md");
  const destPath = join(pkgRoot, "skills", skill, "SKILL.md");

  let src;
  try {
    src = readFileSync(srcPath, "utf8");
  } catch {
    errors.push(`${skill}: missing source ${srcPath}`);
    continue;
  }

  const { name, desc } = frontmatter(src, srcPath);
  if (name !== skill || !NAME_RE.test(name ?? "")) {
    errors.push(`${skill}: frontmatter name "${name}" must equal the dir name and match ${NAME_RE}`);
  }
  if (!desc) {
    errors.push(`${skill}: frontmatter description missing`);
  } else if (desc.length > MAX_DESCRIPTION) {
    errors.push(
      `${skill}: description ${desc.length} chars > ${MAX_DESCRIPTION} cap — ` +
        `trim files/skills/${skill}/SKILL.md (the source), never the copy`,
    );
  }

  if (check) {
    let dest = null;
    try {
      dest = readFileSync(destPath, "utf8");
    } catch {
      /* fall through to the missing-copy error */
    }
    if (dest === null) errors.push(`${skill}: missing copy — run \`npm run sync\``);
    else if (dest !== src) errors.push(`${skill}: copy drifted from source — run \`npm run sync\``);
  } else {
    mkdirSync(dirname(destPath), { recursive: true });
    copyFileSync(srcPath, destPath);
    console.log(`synced ${skill}`);
  }
}

if (errors.length) {
  console.error(`\n${check ? "check" : "sync"} FAILED:\n - ${errors.join("\n - ")}`);
  process.exit(1);
}
console.log(
  check
    ? `check OK — ${SKILLS.length} skills in sync, lockstep ${repoVersion}`
    : `sync complete — ${SKILLS.length} skills`,
);
```

WHY: `copyFileSync` is byte-true (no newline translation); the `--check` comparison reads
both sides identically so CRLF/LF state cancels out. The `SKILLS` array is the single
place the bundle is defined — the scope-trim lever named in Human Intent. The
description-length check turns Phase 1's one-time fix into a standing mechanical gate
(this is the `/spec` skill's own "don't ship the rule rhetorically" doctrine applied to
the 1024 cap).

### STEP 2.3 — Create `packages/cairn-pi/README.md`

````markdown
# @winnorton/cairn-pi

[cairn](https://github.com/winnorton/cairn)'s `/spec` + `/program`
authoring-and-orchestration loop, packaged natively for the
[Pi coding agent](https://pi.dev). Markdown skills only — no runtime code, no build step.

## Install

```
pi install npm:@winnorton/cairn-pi        # user-global (~/.pi/agent/npm/)
pi install -l npm:@winnorton/cairn-pi     # project-local (.pi/npm/, recorded in .pi/settings.json — team-shareable)
```

## What you get

| Skill | Invoke in Pi | Role in the loop |
|---|---|---|
| `spec` | `/skill:spec` | Research + write a structured execution spec in `docs/specs/` (phases, steps, checkpoints, executor handoff). `--from` elaborates `/program` stubs and promotes notes. |
| `program` | `/skill:program` | Program-of-specs: one master coordination doc + N workstream stubs for work that exceeds one spec. |
| `round-review` | `/skill:round-review` | Trust-but-verify one executor round against the program master's Definition of Done; drafts R+1 stubs + a self-contained round master. |
| `fast-execute` | `/skill:fast-execute` | Polling-daemon executor: watches a sentinel-file inbox in `docs/specs/`, executes dispatched specs, atomic-flips `.ready` → `.claimed` → `.done`. |
| `peer-review` | `/skill:peer-review` | Fresh-agent external review of a change set before merge — reads the diff plus adjacent unchanged files. |
| `note` | `/skill:note` | One-paragraph dated intent capture in `docs/notes/`; the promotion source for `/skill:spec --from`. |

## The loop

```
/skill:note ─► /skill:spec ─► /skill:program (master + stubs)
                                    │  /skill:spec --from <stub>  (elaborate each)
                                    ▼
                executor round (/skill:fast-execute, or read the spec manually)
                                    ▼
                /skill:round-review ─► R+1 stubs + round master ─► next dispatch
                                    ▼
                zero new stubs = done ─► git mv spec to docs/specs/archive/
```

## Invocation note

The skill bodies say `/spec`, `/program`, `/peer-review` — the Claude Code invocation
form. In Pi the same skills answer to `/skill:spec`, `/skill:program`,
`/skill:peer-review`. The bodies are shared source across harnesses; read `/x` as
`/skill:x`. Trigger-phrase matching works identically in both.

## Pair with rpiv-todo

Cairn deliberately ships **no** todo/orchestration overlay. For multi-phase spec
execution, pair with
[`@juicesharp/rpiv-todo`](https://pi.dev/packages?name=todo) and prefix todos with the
spec phase identifier (e.g. `P1_05:`) for clean rollups at `/skill:round-review` time.

## Source of truth

`files/skills/<name>/SKILL.md` in the [cairn repo](https://github.com/winnorton/cairn)
is canonical. `skills/` here is a committed byte-identical copy enforced by
`scripts/sync-skills.mjs --check` (runs on `prepublishOnly`). Send PRs against the
source files, not these copies. Versions are lockstep with cairn releases.

## License

MIT
````

WHY: the README is the package's product surface on npm and pi.dev. It must carry the
three things the skill bodies can't: the `/skill:` invocation mapping, the rpiv-todo
pairing stance (cairn's documented non-compete), and the source-of-truth pointer so
contributors don't PR the copies.

### STEP 2.4 — Create `packages/cairn-pi/LICENSE`

```
MIT License

Copyright (c) 2026 Win Norton

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

WHY: repo `README.md` declares MIT but the repo has no root LICENSE file (verified at
spec time); npm packages should carry the license text in-tarball.

**CHECKPOINT 2**

```bash
node --check packages/cairn-pi/scripts/sync-skills.mjs        # syntax-valid
node -e "JSON.parse(require('fs').readFileSync('packages/cairn-pi/package.json','utf8'))" && echo "json OK"
node -e "const p=require('./packages/cairn-pi/package.json'); console.log(p.pi.skills, p.files, p.version)"
# expect: [ './skills' ] [ 'skills', 'README.md', 'LICENSE' ] 0.13.1
```

If `node --check` rejects the script: re-copy STEP 2.2 exactly — most likely a smart-quote
or truncated template-literal from manual transcription.

## Phase 3 — Generate the committed skill copies

### STEP 3.1 — Run the sync (writes `packages/cairn-pi/skills/**`)

```bash
cd packages/cairn-pi
npm run sync          # expect: "synced <skill>" x6 + "sync complete — 6 skills"
npm run check         # expect: "check OK — 6 skills in sync, lockstep 0.13.1"
cd ../..
git add packages/cairn-pi
```

These copies are **generated** — never hand-edit them. Commit them: they're what
git-source and local-path installs serve.

**CHECKPOINT 3**

```bash
ls packages/cairn-pi/skills
# expect exactly: fast-execute  note  peer-review  program  round-review  spec
for s in spec program round-review fast-execute peer-review note; do
  diff -q files/skills/$s/SKILL.md packages/cairn-pi/skills/$s/SKILL.md || echo "DRIFT: $s"
done
# expect: no DRIFT lines
cd packages/cairn-pi && npm pack --dry-run && cd ../..
# expect tarball contents: package.json, README.md, LICENSE, skills/*/SKILL.md — NOTHING else
```

If `npm run check` fails on the description cap: Phase 1 wasn't applied — go back to
STEP 1.1. If `npm pack --dry-run` lists `scripts/`: the `files` array in package.json
was mistyped — re-apply STEP 2.1.

## Phase 4 — Repo doc surfaces

Four files, one per STEP. These are the only repo files this spec edits outside
`packages/` and `files/skills/round-review/`.

### STEP 4.1 — `adopt.md`: add the package channel to the Pi-specific notes

In the **Step 3 — Resolve paths** section, "Pi-specific notes" block.

CURRENT (third bullet of the block):

```markdown
- **Pi is the primary executor for cairn-authored `/spec` and `/program` artifacts.**
  Adopters running Pi sessions typically read a spec file (`docs/specs/SPEC_*.md`)
  and execute it phase-by-phase. The cairn skill suite is *authoring*-focused; for
  Pi-only adopters, the minimum useful install is `seed` (AGENTS.md + MEMORY.md) plus
  `/note` and `/feedback` for capturing findings outside the spec's success criteria.
  The full `grow`/`structure` suites don't hurt Pi but most maintenance/collaboration
  skills don't fire in pure-execution context.
```

REPLACEMENT (same bullet retained with one wording change, plus a NEW bullet inserted
directly after it — before the rpiv-todo bullet):

```markdown
- **Pi is the primary executor for cairn-authored `/spec` and `/program` artifacts.**
  Adopters running Pi sessions typically read a spec file (`docs/specs/SPEC_*.md`)
  and execute it phase-by-phase. For pure-execution adopters, the minimum useful
  install is `seed` (AGENTS.md + MEMORY.md) plus `/note` and `/feedback` for
  capturing findings outside the spec's success criteria. The full `grow`/`structure`
  suites don't hurt Pi but most maintenance/collaboration skills don't fire in
  pure-execution context.
- **The authoring/orchestration loop installs natively via Pi's package manager —
  prefer it over this curl flow for those six skills.**
  `pi install npm:@winnorton/cairn-pi` ships `spec`, `program`, `round-review`,
  `fast-execute`, `peer-review`, and `note` as a pi package (invoked `/skill:spec`
  etc.; add `-l` for a project-local install recorded in `.pi/settings.json`). One
  command, version-locked to the cairn release, upgradable through Pi's package
  manager. The curl flow remains the fallback when npm is unreachable and the only
  channel for the rest of the catalog. Package source: `packages/cairn-pi/` in the
  cairn repo.
```

WHY: the original bullet's "the cairn skill suite is *authoring*-focused" framing
predates Pi having an authoring path — the package IS that path now. The new bullet
applies cairn's three-level-degradation DNA: pi install → curl flow → manual copy.

### STEP 4.2 — `README.md`: Pi fast-path under the Adopt section

CURRENT (end of the "Don't adopt cairn into cairn" blockquote, immediately before
`## What you get`):

```markdown
> Adopt cairn into *other* projects.

## What you get
```

REPLACEMENT:

````markdown
> Adopt cairn into *other* projects.

### Pi (pi.dev) fast path

The `/spec` + `/program` authoring-and-orchestration loop also ships as a native
pi package:

```
pi install npm:@winnorton/cairn-pi
```

Six skills land as `/skill:spec`, `/skill:program`, `/skill:round-review`,
`/skill:fast-execute`, `/skill:peer-review`, and `/skill:note`. The adopt flow
above still covers the full catalog; the package is the one-command path for
Pi's authoring/executor loop. Source: [`packages/cairn-pi/`](./packages/cairn-pi/).

## What you get
````

WHY: README is the human product surface; Pi users should see the one-command path
before reading the multi-step adopt protocol.

### STEP 4.3 — `AGENTS.md`: current state, layout, and design-DNA updates

Three edits in this one file.

**(a)** In `## Current state`, the "Primary environments (3)" bullet — CURRENT (final
two sentences):

```markdown
  no longer in the primary triplet. Per-env path resolutions in
  [manifest.json](manifest.json) `pathVariables`. Pi adoption details in
  [adopt.md](adopt.md) Step 3.
```

REPLACEMENT:

```markdown
  no longer in the primary triplet. Per-env path resolutions in
  [manifest.json](manifest.json) `pathVariables`. Pi adoption details in
  [adopt.md](adopt.md) Step 3. The six-skill authoring loop (spec, program,
  round-review, fast-execute, peer-review, note) also installs natively in Pi via
  `pi install npm:@winnorton/cairn-pi` — source in `packages/cairn-pi/`, sync'd
  from `files/skills/` with a drift guard (see
  [docs/specs/SPEC_CAIRN_PI_PACKAGE.md](docs/specs/SPEC_CAIRN_PI_PACKAGE.md)).
```

**(b)** In `## Layout`, after the `server/feedback-endpoint/` entry — CURRENT:

```markdown
- `server/feedback-endpoint/` — Node 20 + Express + Octokit handler for the
  `/feedback` skill's hosted-endpoint path; deployed to Cloud Run, fronted at
  `cairn.winnorton.com/feedback`. Stateless, 2-req/60s rate limit, PII sanitization.
```

REPLACEMENT (entry retained, new entry appended after it):

```markdown
- `server/feedback-endpoint/` — Node 20 + Express + Octokit handler for the
  `/feedback` skill's hosted-endpoint path; deployed to Cloud Run, fronted at
  `cairn.winnorton.com/feedback`. Stateless, 2-req/60s rate limit, PII sanitization.
- `packages/cairn-pi/` — npm package shipping the six authoring-loop skills to Pi
  (`pi install npm:@winnorton/cairn-pi`). `skills/` holds committed byte-identical
  copies of `files/skills/` entries, regenerated by `scripts/sync-skills.mjs`;
  `--check` (wired to `prepublishOnly`) fails on drift, over-cap descriptions, or
  VERSION-lockstep breaks. Never hand-edit the copies.
```

**(c)** In `## Design DNA` — CURRENT:

```markdown
- **Cairn ships markdown, not code** — keep it that way. The feedback endpoint is
  the only exception, and lives in its own subdirectory by design.
```

REPLACEMENT:

```markdown
- **Cairn ships markdown, not code** — keep it that way. Two exceptions, each
  contained in its own subdirectory by design: the feedback endpoint
  (`server/feedback-endpoint/`) and the cairn-pi package's dev-time sync script
  (`packages/cairn-pi/scripts/`). The published pi package itself is markdown-only.
```

WHY: AGENTS.md is the canonical orientation for fresh agents — all three places a
future agent would otherwise trip (env roles, layout, the markdown-not-code rule) must
agree in the same commit, per the same one-consistent-view ethic as
`[LAW handoff-stays-current]`.

### STEP 4.4 — `HANDOFF.md`: interim-work bullet

Append to the end of the `## Interim work since v0.13.1 (post-release, pre-v0.14.0)`
bullet list:

```markdown
- **`packages/cairn-pi/` npm package authored** (2026-06-11) — ships the six-skill
  authoring loop (`spec`, `program`, `round-review`, `fast-execute`, `peer-review`,
  `note`) to Pi as a native pi package (`pi install npm:@winnorton/cairn-pi`),
  extending Pi from executor-only to a full authoring environment. Skill copies are
  byte-identical to `files/skills/` — sync + drift guard in
  `packages/cairn-pi/scripts/sync-skills.mjs`, wired to `prepublishOnly`, with
  VERSION lockstep and the 1024-char description cap enforced mechanically. Fixed
  `round-review`'s frontmatter description over the canonical cap at source
  (1051 → 1021 chars). Pull-forward of the Pi slice of the v0.15.x "plugin
  packaging" thread per `SPEC_AGENTS_UMBRELLA.md` open question 2. Spec:
  `docs/specs/SPEC_CAIRN_PI_PACKAGE.md`.
```

WHY: `[LAW handoff-stays-current]` — the interim section is the established pattern for
post-release work that hasn't ridden a tag yet.

**CHECKPOINT 4**

```bash
grep -c 'cairn-pi' adopt.md README.md AGENTS.md HANDOFF.md
# expect: every file >= 1
grep -n 'authoring.*focused' adopt.md
# expect: no match in the Pi notes block (old framing replaced)
grep -c 'only exception' AGENTS.md
# expect: 0 (design-DNA bullet now says "Two exceptions")
```

If any grep misses: that file's STEP was skipped or anchored on drifted text — diff the
file against its STEP and reconcile by intent, not by exact-match retry.

## Phase 5 — Local Pi install validation (pre-publish)

Pi accepts local paths as a package source — validate the real install surface before
anything touches npm.

```bash
pi install <ABSOLUTE-PATH-TO-REPO>/packages/cairn-pi
# e.g. on the maintainer machine:
#   pi install C:\Users\winno\projects\cairn\cairn\packages\cairn-pi
```

Then, in a **scratch project directory** (not the cairn repo — don't-adopt-cairn-into-cairn
applies in spirit), start a `pi` session and verify:

1. The `/skill:` namespace lists all six: `spec`, `program`, `round-review`,
   `fast-execute`, `peer-review`, `note`.
2. Smoke-invoke the cheapest one: `/skill:note test note from cairn-pi validation` —
   confirm it executes the skill body (creates `docs/notes/NOTE_*.md` in the scratch dir).
3. Remove the test install afterwards — consult `pi --help` for the exact
   remove/uninstall subcommand (not pinned here; pi's CLI surface moves), or remove the
   entry it recorded in settings.

**CHECKPOINT 5**

Pass = both checks above succeed. **If the `pi` CLI is not on the executing machine:**
skip this phase, record `Phase 5 SKIPPED — no pi CLI on executor machine` in the commit
body, and the maintainer runs it before Phase 6. Do NOT proceed to npm publish with
Phase 5 neither passed nor explicitly waived by the maintainer.

## Phase 6 — Publish (user-gated)

**Gate: maintainer go-ahead required.** Publishing is outward-facing and effectively
irreversible (npm unpublish windows are narrow). Confirm with the maintainer before
this phase, including the name fallback decision if `@winnorton` isn't an owned scope.

1. **npm auth is the maintainer's action, never the agent's.** Per
   `[LAW credentials-never-in-transcript]`: the maintainer runs `npm login` (or sets up
   a granular automation token) in their own terminal. The agent never requests, sees,
   or relays the token in chat. If the maintainer offers to paste a token, decline and
   point at this step.
2. Publish:

   ```bash
   cd packages/cairn-pi
   npm publish        # prepublishOnly runs the drift/lockstep/cap check automatically
   cd ../..
   ```

3. Verify:

   ```bash
   npm view @winnorton/cairn-pi version dist.unpackedSize files
   # expect: 0.13.1; file list = package.json, README.md, LICENSE, skills/**
   pi install npm:@winnorton/cairn-pi
   # then repeat the Phase 5 scratch-project smoke test against the npm copy
   ```

4. pi.dev gallery listing (indexed via the `pi-package` keyword) may lag npm by some
   hours — check https://pi.dev/packages?name=cairn later; not a blocker.

**CHECKPOINT 6**

`npm view` returns 0.13.1 and the markdown-only file list; `pi install npm:…` + smoke
test pass. If publish fails with `402`/`E403` on scope: the `@winnorton` scope isn't
claimed — apply the name-fallback decision row (Resolved design decisions) and re-run.

## Post-flight

```bash
node -e "JSON.parse(require('fs').readFileSync('packages/cairn-pi/package.json','utf8'))"
cd packages/cairn-pi && npm run check && cd ../..
git status
git diff HEAD --stat     # expect ~15 files: 10 new under packages/, 5 edits
```

Commit message template:

```
feat(packages): cairn-pi — ship the /spec+/program authoring loop as a pi.dev package

Extends the Pi harness from executor-only to full authoring environment.
New packages/cairn-pi/ npm package (pattern: @juicesharp/rpiv-pi — a
package.json "pi" field + skills/ discovery): six loop skills (spec,
program, round-review, fast-execute, peer-review, note) install via
`pi install npm:@winnorton/cairn-pi`. Skill bodies are byte-identical
committed copies of files/skills/, regenerated by scripts/sync-skills.mjs;
--check (wired to prepublishOnly) fails on drift, VERSION-lockstep breaks,
and frontmatter descriptions over the canonical 1024-char cap. Fixes
round-review's description over that cap at source (1051 → 1021 chars).
Docs: adopt.md Pi notes, README Pi fast path, AGENTS.md (state/layout/DNA),
HANDOFF.md interim entry.

Scope expansion named per [LAW scope-explicit]: the request was /spec +
/program; shipped the six-skill loop because those two verbs structurally
reference the other four (trim = one array edit in sync-skills.mjs).
Sync/check pattern borrowed from rpiv-mono's ship-manifest tests per
[LAW borrow-adjacent]. Pull-forward of the v0.15.x plugin-packaging
thread (Pi slice only) per SPEC_AGENTS_UMBRELLA open question 2.
[LAW commit-cite]
```

After ship is verified (Phase 6 complete or maintainer-waived to post-publish later):

```bash
git mv docs/specs/SPEC_CAIRN_PI_PACKAGE.md docs/specs/archive/SPEC_CAIRN_PI_PACKAGE.md
# docs/specs/archive/ does not exist yet — create it with this first mv
```

## Executor handoff

**Critical files to read first:**

1. **This spec end-to-end** — especially Resolved design decisions and the SKILLS
   array's role as the scope lever.
2. **`files/skills/round-review/SKILL.md` line 3** — Phase 1's edit target; confirm the
   current text matches STEP 1.1's CURRENT block before editing.
3. **`adopt.md` Step 3 "Pi-specific notes"** — Phase 4.1's anchor; this block postdates
   `SPEC_AGENTS_UMBRELLA.md`'s draft, so the umbrella spec does not edit it.

**Key constraint #1 (most likely mistake):** never hand-edit anything under
`packages/cairn-pi/skills/`. Those files are generated. Any content change goes to
`files/skills/<name>/SKILL.md` followed by `npm run sync`. The check enforces this, but
only at check time — don't create intermediate commits with hand-edited copies.

**Key constraint #2:** do not touch `manifest.json`, and in `adopt.md` touch ONLY the
Pi-specific-notes block in Step 3. Steps 4–7 and the path-resolution tables are
`SPEC_AGENTS_UMBRELLA.md` territory; colliding edits there create a rebase mess for
whichever spec ships second.

**Key constraint #3 (Phase 6):** npm credentials are maintainer-side only —
`[LAW credentials-never-in-transcript]`. If auth is missing, stop and hand back; do not
improvise a token path.

**Common failure modes & recovery:**

- *STEP 1.1 anchor mismatch* — the description line may have been edited since spec
  time. Recovery: apply the three named trims to whatever the current text is, then
  re-measure with CHECKPOINT 1's command; target ≤ 1024 with trigger phrases intact.
- *`npm run sync` writes zero files* — you ran it from the repo root; the script
  resolves paths relative to its own location but `npm run` needs the package cwd.
  Run from `packages/cairn-pi/`.
- *Phase 5 can't find `pi`* — expected on non-Pi machines; follow CHECKPOINT 5's skip
  protocol. Don't fake the validation.
- *Publish rejected on scope* — apply the name-fallback decision row; it's 3 mechanical
  renames plus re-running Phase 4's greps.

## Review checklist

- [ ] `files/skills/round-review/SKILL.md` description ≤ 1024 chars (CHECKPOINT 1
      command), trigger phrases and anti-triggers intact.
- [ ] `packages/cairn-pi/package.json` parses; `pi.skills == ["./skills"]`;
      `files == ["skills","README.md","LICENSE"]`; version == `VERSION` content;
      `pi-package` in keywords; `publishConfig.access == "public"`.
- [ ] `scripts/sync-skills.mjs` passes `node --check`; `npm run check` green;
      deliberately corrupting one copy makes it red (spot-test the guard, then restore
      via `npm run sync`).
- [ ] `npm pack --dry-run` lists only package.json, README.md, LICENSE, and six
      `skills/*/SKILL.md` — no `scripts/`.
- [ ] Six copies byte-identical to `files/skills/` sources (CHECKPOINT 3 diff loop).
- [ ] adopt.md / README.md / AGENTS.md / HANDOFF.md all name the package; AGENTS.md
      design-DNA bullet says "Two exceptions"; no edits to manifest.json or to
      adopt.md outside the Pi-notes block.
- [ ] Phase 5 local `pi install` smoke test passed, or its skip is recorded in the
      commit body and the maintainer waived it before publish.
- [ ] Commit message cites `[LAW scope-explicit]`, `[LAW borrow-adjacent]`,
      `[LAW commit-cite]`.

## Coordination notes

- **`SPEC_AGENTS_UMBRELLA.md` (in-flight, untracked-at-draft):** shared files are
  `adopt.md`, `README.md`, `AGENTS.md`. This spec's edits are confined to sections the
  umbrella does not rewrite (the Pi-notes block postdates the umbrella's 2026-05-02
  draft). If the umbrella ships first, re-anchor Phase 4's CURRENT blocks against the
  post-umbrella text — the semantic intent of every edit is unchanged. The umbrella's
  `.agents/skills/` alignment is *complementary* to this package, not competing: the
  package covers the six loop skills via Pi's package manager; `.agents/skills/`
  covers project-scoped installs of the rest of the catalog.
- **Lockstep consequence:** after this ships at 0.13.1, any future change to a bundled
  skill body requires the next cairn release (VERSION bump) before the package can be
  republished — the check makes this mechanical rather than remembered. That is the
  intended ratchet, same ethic as `[LAW handoff-stays-current]`.
- **Trim lever:** if the maintainer wants the literal two-skill scope from the verbatim
  request, edit the `SKILLS` array in STEP 2.2 to `["spec", "program"]`, re-run
  `npm run sync`, delete the four extra copy dirs, and drop the four extra names from
  the doc edits in Phase 4. Everything else holds.
