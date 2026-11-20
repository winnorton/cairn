#!/usr/bin/env node
// scripts/release.mjs — one-command release for a sole-maintainer repo.
// Shell dialect: cross-platform (node invocation — POSIX and PowerShell compatible)
//
// Why this exists: a version bump is the only signal Claude Code's plugin manager updates
// on, and Antigravity and Codex change only when reinstalled. Twice (v0.15.0, v0.16.1) the
// maintainer's installs ran a months-old skill set because the manual sequence — bump six
// files, write release notes in four docs, tag, push, reinstall three harnesses — did not
// get run. This script is that sequence.
//
// Usage:
//   node scripts/release.mjs [patch|minor|major|X.Y.Z] [options]   cut a release (default: patch)
//   node scripts/release.mjs --install-only                        refresh installs from this checkout
//
// Options:
//   --notes "text"   one-line summary placed above the commit list in CHANGELOG.md
//   --dry-run        print every step, change nothing (preflight problems become warnings)
//   --no-install     skip the Claude Code / Antigravity / Codex refresh
//   --no-push        commit and tag locally, do not push (implies --no-install for Claude Code,
//                    which installs from GitHub)
//
// What a release does, in order:
//   1. preflight  — on main, clean tree, not behind origin/main
//   2. gates      — the same checks CI runs
//   3. bump       — VERSION + the five package/manifest version files, in lockstep
//   4. changelog  — one CHANGELOG.md entry from the commit subjects since the last tag
//   5. git        — commit "release: vX.Y.Z", tag vX.Y.Z, push main and the tag
//   6. installs   — Claude Code (plugin update), Antigravity (directory install),
//                   Codex (copy into ~/.codex/skills; cairn ships no Codex package)

import { spawnSync } from "node:child_process";
import { cpSync, existsSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const WIN = process.platform === "win32";

const VERSION_JSON_FILES = [
  "manifest.json",
  ".claude-plugin/marketplace.json",
  "packages/cairn-agy/plugin.json",
  "packages/cairn-claude/.claude-plugin/plugin.json",
  "packages/cairn-pi/package.json",
];
const GATES = [
  ["scripts/check-skill-budgets.mjs"],
  ["scripts/check-prompt-register.mjs"],
  ["scripts/check-namespace.mjs"],
  ["scripts/check-laws-shape.mjs"],
  ["scripts/check-delivery-parity.mjs"],
  ["scripts/sync-skills.mjs", "--pkg", "packages/cairn-pi", "--check"],
  ["scripts/sync-skills.mjs", "--pkg", "packages/cairn-claude", "--check"],
  ["scripts/sync-skills.mjs", "--pkg", "packages/cairn-agy", "--check"],
];
const CHANGELOG = "CHANGELOG.md";
const CHANGELOG_MARKER = "<!-- release-entries -->";

// ---------- args ----------
const argv = process.argv.slice(2);
const flag = (name) => argv.includes(name);
const DRY = flag("--dry-run");
const NO_INSTALL = flag("--no-install");
const NO_PUSH = flag("--no-push");
const INSTALL_ONLY = flag("--install-only");
const notesIdx = argv.indexOf("--notes");
const NOTES = notesIdx >= 0 ? (argv[notesIdx + 1] ?? "").trim() : "";
const positional = argv.filter((a, i) => !a.startsWith("--") && !(notesIdx >= 0 && i === notesIdx + 1));
const BUMP = positional[0] ?? "patch";

// ---------- helpers ----------
const say = (msg) => console.log(msg);
const step = (msg) => console.log(`\n== ${msg}`);
function die(msg) {
  console.error(`\nFAILED — ${msg}`);
  process.exit(1);
}
/** Fatal in a real run; a warning in --dry-run so the remaining steps still print. */
let problems = 0;
function problem(msg) {
  problems++;
  if (DRY) say(`  ! would stop here: ${msg}`);
  else die(msg);
}
const quote = (a) => (/[\s"]/.test(a) ? `"${a.replace(/"/g, '\\"')}"` : a);

/** Run a real executable (git, node). Never through a shell. */
function exec(cmd, args, { capture = false } = {}) {
  const r = spawnSync(cmd, args, { cwd: repoRoot, encoding: "utf8", stdio: capture ? "pipe" : "inherit" });
  return { ok: r.status === 0, out: (r.stdout ?? "").trim(), err: (r.stderr ?? "").trim() };
}
/** Run a CLI that may be an npm shim (.cmd) on Windows, so it needs a shell there. */
function cli(cmd, args, { capture = false } = {}) {
  const r = WIN
    ? spawnSync([cmd, ...args.map(quote)].join(" "), { cwd: repoRoot, encoding: "utf8", shell: true, stdio: capture ? "pipe" : "inherit" })
    : spawnSync(cmd, args, { cwd: repoRoot, encoding: "utf8", stdio: capture ? "pipe" : "inherit" });
  return { ok: r.status === 0, out: (r.stdout ?? "").trim() };
}
const git = (args, opts) => exec("git", args, { capture: true, ...opts });
const hasCli = (cmd) => cli(cmd, ["--version"], { capture: true }).ok;
const read = (rel) => readFileSync(join(repoRoot, rel), "utf8");
const write = (rel, text) => writeFileSync(join(repoRoot, rel), text);
function today() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function nextVersion(current, bump) {
  const m = current.match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (!m) die(`VERSION holds "${current}", expected X.Y.Z`);
  const [maj, min, pat] = m.slice(1).map(Number);
  if (bump === "patch") return `${maj}.${min}.${pat + 1}`;
  if (bump === "minor") return `${maj}.${min + 1}.0`;
  if (bump === "major") return `${maj + 1}.0.0`;
  if (/^\d+\.\d+\.\d+$/.test(bump)) return bump;
  die(`unknown bump "${bump}" — use patch, minor, major, or X.Y.Z`);
}

// ---------- installs ----------
function installClaude() {
  if (!hasCli("claude")) return say("  claude: CLI not found — skipped");
  if (NO_PUSH) return say("  claude: skipped (--no-push; the plugin installs from GitHub)");
  if (DRY) return say("  claude: would run `claude plugin marketplace update cairn` then `claude plugin update cairn@cairn`");
  const a = cli("claude", ["plugin", "marketplace", "update", "cairn"]);
  const b = a.ok && cli("claude", ["plugin", "update", "cairn@cairn"]);
  say(a.ok && b.ok ? "  claude: updated (restart open sessions to load it)" : "  claude: update FAILED — run the two commands by hand");
}

function installAgy() {
  if (!hasCli("agy")) return say("  agy: CLI not found — skipped");
  const dir = join(repoRoot, "packages", "cairn-agy");
  if (DRY) return say(`  agy: would run \`agy plugin install ${dir}\``);
  const r = cli("agy", ["plugin", "install", dir]);
  say(r.ok ? "  agy: installed from this checkout" : "  agy: install FAILED — run `agy plugin install <repo>/packages/cairn-agy` by hand");
}

/**
 * Codex has no cairn package, so this is a direct copy into ~/.codex/skills — the one place
 * cairn writes into a vendor folder, and only on the maintainer's machine. Skills retired
 * since the last run are removed using the list this function wrote last time; with no
 * list (first run) nothing is removed. `.system` and anything cairn did not put there are
 * never touched.
 */
function installCodex(version) {
  const codexHome = join(homedir(), ".codex");
  const dest = join(codexHome, "skills");
  if (!existsSync(dest)) return say("  codex: ~/.codex/skills not found — skipped");
  const srcRoot = join(repoRoot, "files", "skills");
  const names = readdirSync(srcRoot).filter(
    (n) => /^[a-z0-9]+(-[a-z0-9]+)*$/.test(n) && statSync(join(srcRoot, n)).isDirectory(),
  );
  const listFile = join(codexHome, "cairn-skills.json");
  let previous = [];
  try {
    previous = JSON.parse(readFileSync(listFile, "utf8"));
  } catch {
    previous = [];
  }
  const retired = (Array.isArray(previous) ? previous : []).filter(
    (n) => typeof n === "string" && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(n) && !names.includes(n),
  );
  if (DRY) {
    say(`  codex: would copy ${names.length} skills into ${dest}`);
    if (retired.length) say(`  codex: would remove retired skills: ${retired.join(", ")}`);
    return;
  }
  for (const n of names) cpSync(join(srcRoot, n), join(dest, n), { recursive: true, force: true });
  for (const n of retired) {
    const target = resolve(dest, n);
    if (target.startsWith(dest + sep) && existsSync(target)) rmSync(target, { recursive: true });
  }
  writeFileSync(listFile, JSON.stringify(names, null, 2) + "\n");
  writeFileSync(join(codexHome, "cairn-version"), `${version}\n`);
  say(`  codex: copied ${names.length} skills${retired.length ? `, removed ${retired.join(", ")}` : ""}`);
}

function installAll(version) {
  step("Refresh installs");
  installClaude();
  installAgy();
  installCodex(version);
}

// ---------- main ----------
const current = read("VERSION").trim();

if (INSTALL_ONLY) {
  say(`cairn ${current} — refreshing installs from this checkout${DRY ? " (dry run)" : ""}`);
  installAll(current);
  process.exit(0);
}

const next = nextVersion(current, BUMP);
const tag = `v${next}`;
say(`cairn ${current} → ${next}${DRY ? " (dry run — nothing will change)" : ""}`);

step("Preflight");
const branch = git(["rev-parse", "--abbrev-ref", "HEAD"]).out;
if (branch !== "main") problem(`on branch "${branch}", releases are cut from main`);
const dirty = git(["status", "--porcelain"]).out;
if (dirty) problem(`working tree is not clean:\n${dirty}`);
if (git(["rev-parse", "-q", "--verify", `refs/tags/${tag}`]).ok) problem(`tag ${tag} already exists`);
git(["fetch", "-q", "origin"]);
const behind = git(["rev-list", "--count", "HEAD..origin/main"]).out;
if (behind && behind !== "0") problem(`main is ${behind} commit(s) behind origin/main — pull first`);
if (!problems) say("  ok");

step("Gates");
for (const g of GATES) {
  const r = exec(process.execPath, g, { capture: true });
  say(`  ${r.ok ? "ok  " : "FAIL"} ${g.join(" ")}`);
  if (!r.ok) {
    console.error(r.out || r.err);
    problem(`gate failed: ${g.join(" ")}`);
  }
}

step("Changes since the last tag");
const lastTag = git(["describe", "--tags", "--abbrev=0", "--match", "v*"]).out;
const range = lastTag ? `${lastTag}..HEAD` : "HEAD";
const subjects = git(["log", range, "--format=%s"]).out.split("\n").filter((s) => s && !/^release: /.test(s));
if (!subjects.length && !NOTES) problem(`no commits since ${lastTag || "the start"} — nothing to release`);
for (const s of subjects) say(`  - ${s}`);

step(`Bump ${current} → ${next}`);
const jsonEdits = VERSION_JSON_FILES.map((rel) => {
  const text = read(rel);
  const needle = `"version": "${current}"`;
  const count = text.split(needle).length - 1;
  if (count !== 1) problem(`${rel} holds ${count} occurrences of ${needle}, expected exactly 1`);
  return [rel, text.replace(needle, `"version": "${next}"`)];
});
const entry = [`## ${tag} — ${today()}`, "", ...(NOTES ? [NOTES, ""] : []), ...subjects.map((s) => `- ${s}`), ""].join("\n");
const changelog = existsSync(join(repoRoot, CHANGELOG)) ? read(CHANGELOG) : "";
if (!changelog.includes(CHANGELOG_MARKER)) problem(`${CHANGELOG} is missing the ${CHANGELOG_MARKER} marker`);
const newChangelog = changelog.replace(CHANGELOG_MARKER, `${CHANGELOG_MARKER}\n\n${entry.trimEnd()}`);
const touched = ["VERSION", ...VERSION_JSON_FILES, CHANGELOG];
if (DRY) {
  say(`  would write: ${touched.join(", ")}`);
  say(`\n  CHANGELOG entry:\n${entry.split("\n").map((l) => `    ${l}`).join("\n")}`);
} else {
  write("VERSION", `${next}\n`);
  for (const [rel, text] of jsonEdits) write(rel, text);
  write(CHANGELOG, newChangelog);
  for (const g of GATES.filter((x) => x.includes("--check"))) {
    if (!exec(process.execPath, g, { capture: true }).ok) die(`lockstep check failed after bump: ${g.join(" ")}`);
  }
  say(`  wrote ${touched.length} files`);
}

step("Commit, tag, push");
if (DRY) {
  say(`  would commit "release: ${tag}", tag ${tag}${NO_PUSH ? "" : ", push main and the tag"}`);
} else {
  if (!git(["add", "--", ...touched]).ok) die("git add failed");
  const body = [NOTES, ...subjects.map((s) => `- ${s}`)].filter(Boolean).join("\n");
  if (!git(["commit", "-q", "-m", `release: ${tag}`, "-m", body || `Release ${tag}.`]).ok) die("git commit failed");
  if (!git(["tag", "-a", tag, "-m", tag]).ok) die("git tag failed");
  say(`  committed and tagged ${tag}`);
  if (NO_PUSH) {
    say("  not pushed (--no-push)");
  } else {
    if (!exec("git", ["push", "origin", "main"]).ok) die("push of main failed — the commit and tag exist locally");
    if (!exec("git", ["push", "origin", tag]).ok) die(`push of ${tag} failed — main is pushed, the tag is local`);
  }
}

if (NO_INSTALL) say("\nInstalls skipped (--no-install).");
else installAll(next);

if (DRY) say(`\nDry run complete — nothing changed.${problems ? ` ${problems} problem(s) would stop a real run.` : ""}`);
else say(`\nReleased ${tag}.`);
