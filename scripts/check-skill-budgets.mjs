// scripts/check-skill-budgets.mjs
// Shell dialect: cross-platform (node invocation — POSIX and PowerShell compatible)
//
// Skill-description BUDGET gate over the FULL source set.
//
// Why this exists, separate from sync-skills.mjs:
//   sync-skills.mjs caps descriptions at 1024 too, but only for skills *enrolled*
//   in a package's sync-config.json. A skill that lives in files/skills/ but isn't
//   yet enrolled in any package escapes the cap entirely — and then breaks at load
//   on a budget-constrained harness. Pi enforces a hard 1024-char cap on a skill's
//   `description` and SKIPS any skill that exceeds it (observed: prompt-evolve 1343,
//   session-distill 1896 — both stale installs of since-trimmed sources).
//
//   This gate closes that hole: it checks the source of truth (files/skills/*) directly,
//   so every skill is budget-checked whether or not a package ships it yet.
//
// Grounding (cwar NEW_LAWS, cited by slug):
//   [LAW aperture-mismatch]  — a consumer's context budget is a hard limit; over it is
//                              destructive, not merely wasteful.
//   [LAW substrate-posture]  — the loader's cap is hard-layer; it wins over prose. Gate it.
//   [LAW external-detectability] / [LAW mechanical-enforcement] — a rule worth keeping is a
//                              rule a script enforces without the agent's self-report.
//   [LAW prompt-economy]     — the description is consumed across a serialization boundary;
//                              trim register-bloat, author for the consumer.
//
// Usage:  node scripts/check-skill-budgets.mjs
// Exit 1 if any description exceeds HARD_CAP. NEAR_CAP entries warn but don't fail.

import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Pi's hard limit. Other harnesses may cap lower; lower HARD_CAP if/when one is known.
const HARD_CAP = 1024;
// Margin zone: pass, but flag — these are one careless edit away from breaking a consumer.
const NEAR_CAP = 900;

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const skillsDir = join(repoRoot, "files", "skills");

// Same frontmatter parse + YAML line-folding as sync-skills.mjs, so this gate and the
// per-package gate agree on what "description length" means.
function descLength(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null; // no frontmatter — not a skill
  const desc = (m[1].match(/(?:^|\n)description:[ \t]*([\s\S]*?)(?=\n[A-Za-z][\w-]*:|$)/) ?? [])[1]
    ?.replace(/\r?\n[ \t]+/g, " ")
    .trim();
  return desc ? desc.length : 0;
}

const rows = [];
for (const entry of readdirSync(skillsDir, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue; // README.md etc. are not skills
  let raw;
  try {
    raw = readFileSync(join(skillsDir, entry.name, "SKILL.md"), "utf8");
  } catch {
    rows.push({ name: entry.name, len: null, note: "MISSING SKILL.md" });
    continue;
  }
  rows.push({ name: entry.name, len: descLength(raw) });
}

rows.sort((a, b) => (b.len ?? -1) - (a.len ?? -1));

const fails = [];
const nears = [];
for (const r of rows) {
  let flag = "";
  if (r.len === null) {
    flag = "✗ no description";
    fails.push(r);
  } else if (r.len > HARD_CAP) {
    flag = `✗ OVER ${HARD_CAP}`;
    fails.push(r);
  } else if (r.len >= NEAR_CAP) {
    flag = `… near cap (≤${HARD_CAP})`;
    nears.push(r);
  }
  console.log(`${String(r.len ?? "—").padStart(5)}  ${r.name.padEnd(20)} ${flag}`);
}

console.log(
  `\n${rows.length} skills · HARD_CAP ${HARD_CAP} (Pi) · NEAR_CAP ${NEAR_CAP}` +
    ` · ${nears.length} near, ${fails.length} over`,
);
if (nears.length && !fails.length) {
  console.log(
    `near-cap skills pass but have thin margin — trim files/skills/<name>/SKILL.md descriptions: ` +
      nears.map((r) => r.name).join(", "),
  );
}
if (fails.length) {
  console.error(
    `\nFAILED — trim the source description(s): ` + fails.map((r) => r.name).join(", "),
  );
  process.exit(1);
}
console.log("budget check OK");
