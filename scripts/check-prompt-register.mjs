// scripts/check-prompt-register.mjs
// Shell dialect: cross-platform (node invocation — POSIX and PowerShell compatible)
//
// The machine-register lint gate over authored skill text. A self-contained port of
// prompt-economy's static register lint (src/lint.ts + src/rules/*) — zero external deps,
// so cairn enforces its own skills without depending on the research repo.
//
// Scans the INSTRUCTIONAL prose of each files/skills/<name>/SKILL.md (frontmatter included;
// fenced code, HTML comments, heading lines, and state sections excluded — a command or a
// schema can't be register-bloat). Four error gates, each ratcheted to 0:
//   importance_claims — "critically important", "because…"        : rationale/emphasis, no contract
//   coaching          — "please", "be thorough", "note that"      : effort-coaching for a human reader
//   optionality       — "optionally", "if you want", "as needed"  : a hedge reads as permission to skip
//   negation_stack    — >=2 prohibitive negations on one line     : collapse to the positive (lone ones kept)
// capability_declarations is ADVISORY (never fails): a generic ability deletes, a non-default
// tool surface is load-bearing — the human / oracle decides.
//
// Grounding (prompt-economy LAWS + cwar NEW_LAWS, cited by slug):
//   [LAW prompt-economy]        — author in the consumer's register; fix a wrong instruction by
//                                 deleting its upstream cause, not by serializing its opposite.
//   [LAW mechanical-enforcement]— a rule a machine can check, a machine must enforce.
//   [LAW gate-beats-instruction]— instruction does not hold the register; a fresh author drifts,
//                                 the lint catches what the instruction cannot.
//   [LAW two-gate-certification]— this gate certifies the REGISTER (dead bytes) ONLY; the
//                                 behavioral oracle (re-execution) certifies the CONTRACT separately.
//   [LAW certify-dont-assert]   — passing here is necessary, not sufficient: a counter sees size and
//                                 structure, never whether a dropped line carried meaning.
//
// Usage:
//   node scripts/check-prompt-register.mjs            # lint every files/skills/*/SKILL.md
//   node scripts/check-prompt-register.mjs <file...>  # lint specific files
// Exit 1 if any file trips an error gate (>0). Advisory hits print but never fail.

import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const skillsDir = join(repoRoot, "files", "skills");

// State-section headings are excluded (accumulated agent memory grows by design). Skills carry
// none today; the hook stays so a future stateful skill can opt a section out by heading prefix.
const STATE_SECTIONS = [];

// --- instructional extraction (port of prompt-economy/src/parse.ts) ---
const HEADING_RE = /^#{1,6}\s/;
const STATE_HEADING_RE = /^#{2,6}\s+(.*)$/;
function isStateHeading(line) {
  const m = line.match(STATE_HEADING_RE);
  if (!m) return false;
  const h = m[1].trim().toUpperCase();
  return STATE_SECTIONS.some((s) => h.startsWith(s.toUpperCase()));
}
function extractInstructional(raw) {
  const out = [];
  let inFence = false;
  let inComment = false;
  let inState = false;
  const lines = raw.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const t = line.trim();
    if (t.startsWith("```") || t.startsWith("~~~")) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    if (t.startsWith("<!--")) inComment = true;
    if (inComment) {
      if (t.includes("-->")) inComment = false;
      continue;
    }
    if (HEADING_RE.test(line)) {
      inState = isStateHeading(line);
      continue;
    }
    if (inState) continue;
    out.push({ n: i + 1, text: line });
  }
  return out;
}

// --- gate markers (verbatim from prompt-economy/src/rules/*) ---
const IMPORTANCE = [
  /\bcritical(?:ly)?\b/gi, /\bcrucial(?:ly)?\b/gi, /\bessential(?:ly)?\b/gi,
  /\bvital(?:ly)?\b/gi, /\bparamount\b/gi,
  /\b(?:is|are|it'?s)\s+(?:very |extremely |highly |really |critically )?important\b/gi,
  /\b(?:most |very |really )?important(?:ly)?\b/gi,
  /\babove all\b/gi, /\bthis matters\b/gi, /\bgetting this right\b/gi,
  /\bbecause\b/gi, /\bthe reason\b/gi, /\bin order to\b/gi, /\bthis is why\b/gi,
];
const COACHING = [
  /\bplease\b/gi, /\bkindly\b/gi, /\bbe thorough\b/gi, /\btake your time\b/gi,
  /\bdo your (?:very )?best\b/gi, /\bmake sure (?:to|that)?\b/gi, /\bbe sure to\b/gi,
  /\bremember to\b/gi, /\bdon'?t forget to\b/gi, /\bcarefully\b/gi, /\bevery single\b/gi,
  /\bkeep in mind\b/gi, /\bnote that\b/gi, /\btry to\b/gi, /\byou'?ll want to\b/gi,
];
const OPTIONALITY = [
  /\boptionally\b/gi, /\bif you (?:want|wish|like|prefer|'?d like|can|could)\b/gi,
  /\bif desired\b/gi, /\bif (?:appropriate|needed|time allows|possible)\b/gi,
  /\bwhere (?:possible|appropriate)\b/gi, /\bas (?:needed|appropriate|desired)\b/gi,
  /\bat your discretion\b/gi, /\bconsider \w+ing\b/gi,
];
const CAPABILITY = [
  /\byou can\b/gi, /\byou may\b/gi, /\byou are able to\b/gi, /\byou'?re able to\b/gi,
  /\byou have (?:the ability|access) to\b/gi, /\bfeel free to\b/gi,
  /\bit'?s possible to\b/gi, /\bit is possible to\b/gi,
];
const NEG = /\b(?:do not|don'?t|never|must not|cannot|can'?t|won'?t|avoid)\b/gi;

// --- scanners (port of prompt-economy/src/util/markers.ts + negation-stack.ts) ---
function scanMarkers(lines, markers) {
  const findings = [];
  for (const line of lines) {
    for (const base of markers) {
      const rx = new RegExp(base.source, base.flags.includes("g") ? base.flags : base.flags + "g");
      let m;
      while ((m = rx.exec(line.text)) !== null) {
        findings.push({ line: line.n, hit: m[0] });
        if (m.index === rx.lastIndex) rx.lastIndex++;
      }
    }
  }
  return findings;
}
function scanNegationStack(lines) {
  const findings = [];
  for (const line of lines) {
    const m = line.text.match(NEG);
    if (m && m.length >= 2) {
      findings.push({ line: line.n, hit: `${m.length} stacked negations`, excerpt: line.text.trim().slice(0, 100) });
    }
  }
  return findings;
}

const ERROR_GATES = [
  { id: "importance_claims", scan: (l) => scanMarkers(l, IMPORTANCE) },
  { id: "coaching", scan: (l) => scanMarkers(l, COACHING) },
  { id: "optionality", scan: (l) => scanMarkers(l, OPTIONALITY) },
  { id: "negation_stack", scan: scanNegationStack },
];

function lintFile(absPath, relPath) {
  const lines = extractInstructional(readFileSync(absPath, "utf8"));
  const reports = ERROR_GATES.map((g) => ({ id: g.id, findings: g.scan(lines) }));
  const advisory = scanMarkers(lines, CAPABILITY);
  const passed = reports.every((r) => r.findings.length === 0);
  return { relPath, passed, reports, advisory };
}

// --- collect targets ---
const argv = process.argv.slice(2).filter((a) => a && !a.startsWith("-"));
let targets;
if (argv.length) {
  targets = argv.map((f) => {
    const abs = resolve(process.cwd(), f);
    return { abs, rel: relative(repoRoot, abs).replace(/\\/g, "/") };
  });
} else {
  targets = readdirSync(skillsDir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => ({ abs: join(skillsDir, e.name, "SKILL.md"), rel: `files/skills/${e.name}/SKILL.md` }))
    .filter((t) => {
      try {
        readFileSync(t.abs);
        return true;
      } catch {
        return false;
      }
    });
}

let failed = 0;
const advisoryFiles = [];
for (const t of targets) {
  const r = lintFile(t.abs, t.rel);
  if (r.passed) {
    if (r.advisory.length) advisoryFiles.push(r);
    continue;
  }
  failed++;
  console.error(`✗ ${r.relPath}`);
  for (const rep of r.reports) {
    if (!rep.findings.length) continue;
    console.error(`    ${rep.id}: ${rep.findings.length}`);
    for (const f of rep.findings.slice(0, 6)) {
      console.error(`      L${f.line}  ${f.hit}${f.excerpt ? `  «${f.excerpt}»` : ""}`);
    }
    if (rep.findings.length > 6) console.error(`      … +${rep.findings.length - 6} more`);
  }
}

const name = (rel) => rel.replace("files/skills/", "").replace("/SKILL.md", "");
console.log(`\n${targets.length} file(s) · 4 error gates @ 0 · ${failed} failing`);
if (advisoryFiles.length) {
  console.log(
    `advisory (capability_declarations — review, never fails): ` +
      advisoryFiles.map((r) => `${name(r.relPath)}(${r.advisory.length})`).join(", "),
  );
}
if (failed) {
  console.error(
    `\nFAILED — author in the machine register: delete the rationale/coaching/optionality, ` +
      `collapse negation stacks to a positive. [LAW prompt-economy]`,
  );
  process.exit(1);
}
console.log("register check OK");
