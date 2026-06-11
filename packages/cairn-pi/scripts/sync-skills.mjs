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

import { copyFileSync, mkdirSync, readdirSync, readFileSync } from "node:fs";
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
  const desc = (m[1].match(/(?:^|\n)description:[ \t]*([\s\S]*?)(?=\n[A-Za-z][\w-]*:|$)/) ?? [])[1]
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

// Orphaned copies: a dir under skills/ no longer in SKILLS would otherwise pass
// --check and still ship (package.json "files" includes all of skills/).
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
