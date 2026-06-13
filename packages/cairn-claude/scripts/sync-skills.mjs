#!/usr/bin/env node
// Sync the canonical cairn skill files into this package — or verify them (--check).
//
// Source of truth: <repo>/files/skills/<name>/SKILL.md. The copies under
// packages/cairn-claude/skills/ are committed build artifacts so the plugin installs
// from a local path or GitHub subpath with no build step. Byte drift between source
// and copy fails --check, which is wired to a repo CI check (owned by WS11) —
// an out-of-sync plugin fails CI. A plugin has no prepublishOnly (that is an npm lifecycle
// hook; this package has no package.json).
//
// Also enforced here:
//   - frontmatter `name:` equals the directory name and matches the canonical
//     pattern (lowercase/digits/hyphens, <= 64 chars)
//   - frontmatter `description:` <= 1024 chars after YAML line-folding
//     (the canonical SKILL.md cap shared by Claude Code and Pi)
//   - .claude-plugin/plugin.json version === <repo>/VERSION (lockstep releases)

import { copyFileSync, mkdirSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const pkgRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = resolve(pkgRoot, "..", "..");

// Read sync-config.json to discover the version-source file (§2.4 contract surface for WS11).
// For this non-npm plugin the versionFile is ".claude-plugin/plugin.json"; do NOT hardcode
// that name here — the versionFile key is the §2.4 contract surface.
const syncConfig = JSON.parse(readFileSync(join(pkgRoot, "sync-config.json"), "utf8"));
const versionFile = syncConfig.versionFile; // e.g. ".claude-plugin/plugin.json"

// ALL skills ship in the Claude plugin — it is the full-catalog distribution.
// cairn-pi ships only the 6-skill authoring loop; the Claude plugin ships all 18.
// Source: files/skills/ directories (live count from pre-flight step 3).
// To trim: remove names from this array; run `node scripts/sync-skills.mjs`; delete orphaned copies.
const SKILLS = syncConfig.skills;

const MAX_DESCRIPTION = 1024;
const NAME_RE = /^[a-z0-9][a-z0-9-]{0,63}$/;

const check = process.argv.includes("--check");

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

// Version lockstep: read the file named by sync-config.json's versionFile
// (e.g. .claude-plugin/plugin.json). Do NOT hardcode the manifest path — the
// versionFile key is the §2.4 contract surface.
const manifestJson = JSON.parse(readFileSync(join(pkgRoot, versionFile), "utf8"));
const repoVersion = readFileSync(join(repoRoot, "VERSION"), "utf8").trim();
if (manifestJson.version !== repoVersion) {
  errors.push(
    `version lockstep: ${versionFile} has ${manifestJson.version}, VERSION has ${repoVersion}`,
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
    if (dest === null) errors.push(`${skill}: missing copy — run \`node scripts/sync-skills.mjs\``);
    else if (dest !== src) errors.push(`${skill}: copy drifted from source — run \`node scripts/sync-skills.mjs\``);
  } else {
    mkdirSync(dirname(destPath), { recursive: true });
    copyFileSync(srcPath, destPath);
    console.log(`synced ${skill}`);
  }
}

// Orphaned copies: a dir under skills/ no longer in SKILLS would otherwise pass
// --check and still ship.
let shipped = [];
try {
  shipped = readdirSync(join(pkgRoot, "skills"), { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name);
} catch {
  /* skills/ absent — first sync run creates it */
}
for (const dir of shipped) {
  if (!SKILLS.includes(dir)) {
    errors.push(`orphaned copy skills/${dir}/ not in the SKILLS array — delete it or re-add the skill`);
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
