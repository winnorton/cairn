// scripts/sync-skills.mjs
// Shell dialect: cross-platform (node invocation — POSIX and PowerShell compatible)
//
// Shared sync/check guard for all cairn distribution packages.
// Source of truth: <repo>/files/skills/<name>/SKILL.md.
// Committed copies under <pkg>/skills/ are build artifacts — byte-identical or --check fails.
//
// Usage:
//   node scripts/sync-skills.mjs --pkg <rel-path-to-package>          # sync mode
//   node scripts/sync-skills.mjs --pkg <rel-path-to-package> --check  # check mode
//
// The package directory must contain sync-config.json:
//   { "skills": ["name1", "name2", ...], "versionFile": "package.json" }
//   (for npm packages like cairn-pi; use ".claude-plugin/plugin.json" for
//    the non-npm cairn-claude plugin, where that is the relative path from
//    the package root to the file holding the version field)
//
// Enforced:
//   - frontmatter `name:` equals dir name and matches ^[a-z0-9][a-z0-9-]{0,63}$
//   - frontmatter `description:` <= 1024 chars (after YAML line-folding)
//   - version in <pkg>/<versionFile> === <repo>/VERSION
//   - no orphaned copies (dirs in <pkg>/skills/ not in the skills list)
//   - byte-identity between source and copy (--check mode)

import { copyFileSync, mkdirSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const MAX_DESCRIPTION = 1024;
const NAME_RE = /^[a-z0-9][a-z0-9-]{0,63}$/;

const args = process.argv.slice(2);
const pkgArgIdx = args.indexOf("--pkg");
const pkgArg = pkgArgIdx !== -1 ? args[pkgArgIdx + 1] : null;
const check = args.includes("--check");

if (!pkgArg) {
  console.error("Usage: node scripts/sync-skills.mjs --pkg <path-to-package> [--check]");
  process.exit(1);
}

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pkgRoot = resolve(repoRoot, pkgArg);

// Load per-package config from sync-config.json
let SKILLS;
let versionFile;
try {
  const cfg = JSON.parse(readFileSync(join(pkgRoot, "sync-config.json"), "utf8"));
  if (!Array.isArray(cfg.skills) || cfg.skills.length === 0)
    throw new Error("skills must be a non-empty array");
  if (!cfg.versionFile)
    throw new Error('versionFile must be declared (e.g. "package.json" or ".claude-plugin/plugin.json")');
  SKILLS = cfg.skills;
  versionFile = cfg.versionFile;
} catch (err) {
  console.error(`Cannot load ${pkgRoot}/sync-config.json: ${err.message}`);
  process.exit(1);
}

const errors = [];

function frontmatter(raw, file) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) {
    errors.push(`${file}: no YAML frontmatter`);
    return {};
  }
  const name = (m[1].match(/(?:^|\n)name:[ \t]*(.+)/) ?? [])[1]?.trim();
  const desc = (m[1].match(/(?:^|\n)description:[ \t]*([\s\S]*?)(?=\n[A-Za-z][\w-]*:|$)/) ?? [])[1]
    ?.replace(/\r?\n[ \t]+/g, " ")
    .trim();
  return { name, desc };
}

// Version lockstep — read from the versionFile declared in sync-config.json
// (e.g. "package.json" for npm packages, ".claude-plugin/plugin.json" for
// the non-npm cairn-claude plugin). Path is resolved relative to pkgRoot.
let pkgVersionData;
try {
  pkgVersionData = JSON.parse(readFileSync(join(pkgRoot, versionFile), "utf8"));
} catch (err) {
  errors.push(`version lockstep: cannot read ${versionFile}: ${err.message}`);
  pkgVersionData = {};
}
const repoVersion = readFileSync(join(repoRoot, "VERSION"), "utf8").trim();
if (pkgVersionData.version !== repoVersion) {
  errors.push(
    `version lockstep: ${versionFile} has ${pkgVersionData.version}, VERSION has ${repoVersion}`,
  );
}

// Sync or check each skill
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
    errors.push(
      `${skill}: frontmatter name "${name}" must equal the dir name and match ${NAME_RE}`,
    );
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
    if (dest === null)
      errors.push(`${skill}: missing copy — run \`node scripts/sync-skills.mjs --pkg ${pkgArg}\``);
    else if (dest !== src)
      errors.push(`${skill}: copy drifted from source — run \`node scripts/sync-skills.mjs --pkg ${pkgArg}\``);
  } else {
    mkdirSync(dirname(destPath), { recursive: true });
    copyFileSync(srcPath, destPath);
    console.log(`synced ${skill}`);
  }
}

// Orphan check: dirs under <pkg>/skills/ not in SKILLS
let shipped = [];
try {
  shipped = readdirSync(join(pkgRoot, "skills"), { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name);
} catch {
  /* skills/ absent on first sync run */
}
for (const dir of shipped) {
  if (!SKILLS.includes(dir)) {
    errors.push(
      `orphaned copy skills/${dir}/ in ${pkgArg} — delete it or add to sync-config.json`,
    );
  }
}

if (errors.length) {
  console.error(`\n${check ? "check" : "sync"} FAILED (${pkgArg}):\n - ${errors.join("\n - ")}`);
  process.exit(1);
}
console.log(
  check
    ? `check OK — ${SKILLS.length} skills in sync, lockstep ${repoVersion} (${pkgArg})`
    : `sync complete — ${SKILLS.length} skills (${pkgArg})`,
);
