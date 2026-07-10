// scripts/check-skill-budgets.mjs
// Shell dialect: cross-platform (node invocation — POSIX and PowerShell compatible)
//
// Skill prompt budget gate over the FULL source set:
//   1. description length: Pi hard cap (1024 chars), near-cap warning at 900;
//   2. instructional body words: exact per-skill ratchet baseline.
//
// Description caps prevent loader rejection. Body baselines prevent prompt growth from
// hiding inside an ordinary skill edit. Any body-count change requires an explicit
// baseline update in the same reviewed change set.
//
// Grounding:
//   [LAW aperture-mismatch] / [LAW substrate-posture] — consumer limits beat prose.
//   [LAW external-detectability] / [LAW mechanical-enforcement] — gate checkable rules.
//   [LAW prompt-economy] — author in the consumer's register.
//   [MEM reference/prompt-economy] — static register lint + complexity-ratchet precedent.
//
// Usage:
//   node scripts/check-skill-budgets.mjs
//   node scripts/check-skill-budgets.mjs --update-body-baseline
//
// The update flag records current counts. Its diff is the explicit review surface for an
// intentional decrease or increase; CI never updates the baseline automatically.

import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HARD_CAP = 1024;
const NEAR_CAP = 900;
const UPDATE_BODY_BASELINE = process.argv.includes("--update-body-baseline");

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const skillsDir = join(repoRoot, "files", "skills");
const bodyBaselinePath = join(repoRoot, "scripts", "skill-body-word-baseline.json");

function descLength(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  const desc = (m[1].match(/(?:^|\n)description:[ \t]*([\s\S]*?)(?=\n[A-Za-z][\w-]*:|$)/) ?? [])[1]
    ?.replace(/\r?\n[ \t]+/g, " ")
    .trim();
  return desc?.length ? desc.length : null;
}

// Count authored instructions, not templates or navigation. Tables and list items count;
// frontmatter, headings, fenced examples, and HTML comments do not.
function instructionalBodyWords(raw) {
  const body = raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "");
  const kept = [];
  let inFence = false;
  let inComment = false;

  for (const line of body.split(/\r?\n/)) {
    const text = line.trim();
    if (text.startsWith("```") || text.startsWith("~~~")) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    if (text.startsWith("<!--")) inComment = true;
    if (inComment) {
      if (text.includes("-->")) inComment = false;
      continue;
    }
    if (/^#{1,6}\s/.test(line)) continue;
    kept.push(line);
  }

  return (kept.join(" ").match(/\b[\w/-]+\b/g) ?? []).length;
}

const baseline = existsSync(bodyBaselinePath)
  ? JSON.parse(readFileSync(bodyBaselinePath, "utf8"))
  : {};

const rows = [];
for (const entry of readdirSync(skillsDir, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  let raw;
  try {
    raw = readFileSync(join(skillsDir, entry.name, "SKILL.md"), "utf8");
  } catch {
    rows.push({ name: entry.name, desc: null, body: null });
    continue;
  }
  rows.push({
    name: entry.name,
    desc: descLength(raw),
    body: instructionalBodyWords(raw),
  });
}

rows.sort((a, b) => (b.desc ?? -1) - (a.desc ?? -1));

const fails = [];
const nears = [];
for (const row of rows) {
  const flags = [];
  if (row.desc === null || row.body === null) {
    flags.push("✗ missing SKILL.md/frontmatter");
    fails.push(row);
  } else if (row.desc > HARD_CAP) {
    flags.push(`✗ description OVER ${HARD_CAP}`);
    fails.push(row);
  } else if (row.desc >= NEAR_CAP) {
    flags.push(`… description near cap (≤${HARD_CAP})`);
    nears.push(row);
  }

  if (!UPDATE_BODY_BASELINE && row.body !== null) {
    if (!(row.name in baseline)) {
      flags.push("✗ no body baseline");
      fails.push(row);
    } else if (row.body !== baseline[row.name]) {
      const delta = row.body - baseline[row.name];
      flags.push(`✗ body ${delta > 0 ? "+" : ""}${delta} vs baseline`);
      fails.push(row);
    }
  }

  console.log(
    `${String(row.desc ?? "—").padStart(5)} desc  ` +
      `${String(row.body ?? "—").padStart(5)} body  ` +
      `${row.name.padEnd(20)} ${flags.join(" · ")}`,
  );
}

if (!UPDATE_BODY_BASELINE) {
  const names = new Set(rows.map((row) => row.name));
  for (const stale of Object.keys(baseline).filter((name) => !names.has(name))) {
    console.error(`    ✗ stale body baseline: ${stale}`);
    fails.push({ name: stale });
  }
}

if (UPDATE_BODY_BASELINE) {
  if (fails.length) {
    console.error("\nFAILED — fix source skill errors before updating the body baseline.");
    process.exit(1);
  }
  const next = Object.fromEntries(
    [...rows]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((row) => [row.name, row.body]),
  );
  writeFileSync(bodyBaselinePath, `${JSON.stringify(next, null, 2)}\n`, "utf8");
  console.log(`\nupdated ${bodyBaselinePath} (${rows.length} skills)`);
  process.exit(0);
}

console.log(
  `\n${rows.length} skills · description HARD_CAP ${HARD_CAP} · NEAR_CAP ${NEAR_CAP}` +
    ` · body baseline exact · ${nears.length} near · ${fails.length} failing`,
);
if (nears.length && !fails.length) {
  console.log(
    `near-cap descriptions: ${nears.map((row) => row.name).join(", ")}`,
  );
}
if (fails.length) {
  console.error(
    `\nFAILED — fix description errors, or deliberately record body-count changes with ` +
      `\`node scripts/check-skill-budgets.mjs --update-body-baseline\`.`,
  );
  process.exit(1);
}
console.log("budget check OK");
