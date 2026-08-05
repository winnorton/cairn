#!/usr/bin/env node
// Autoresearch finalize — split an autoresearch branch into independently mergeable
// review branches, one per logical group of improvements. Claude Code adaptation of
// pi-autoresearch's finalize.sh (MIT, https://github.com/davebcn87/pi-autoresearch).
//
// Usage: node finalize.mjs <groups.json>
//
// groups.json:
// {
//   "base": "<merge-base commit>",        // where review branches start
//   "trunk": "main",                      // informational
//   "final_tree": "<HEAD of autoresearch branch>",
//   "goal": "<short-slug>",               // branch namespace
//   "groups": [
//     { "title": "...", "body": "...", "last_commit": "<hash>", "slug": "..." }
//   ]
// }
//
// Group N owns the files changed in (group N-1's last_commit .. its last_commit],
// with file contents taken from its last_commit. Groups must not share files; the
// union of group files must equal the base..final_tree diff (minus .auto/).

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

function git(...args) {
  return execFileSync('git', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim();
}
function tryGit(...args) {
  try { return { ok: true, out: git(...args) }; } catch (e) { return { ok: false, out: String(e.stderr || e.message) }; }
}
function fail(msg) { console.error(`ERROR: ${msg}`); process.exit(1); }

const specPath = process.argv[2];
if (!specPath) fail('usage: finalize.mjs <groups.json>');
const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
const { base, final_tree: finalTree, goal, groups } = spec;
if (!base || !finalTree || !goal || !Array.isArray(groups) || groups.length === 0) {
  fail('groups.json needs base, final_tree, goal, and a non-empty groups array');
}

// -- validation ---------------------------------------------------------------
if (git('status', '--porcelain') !== '') fail('working tree not clean — commit or stash first');
for (const h of [base, finalTree, ...groups.map((g) => g.last_commit)]) {
  if (!tryGit('cat-file', '-e', `${h}^{commit}`).ok) fail(`commit not found: ${h}`);
}
const originalRef = git('rev-parse', '--abbrev-ref', 'HEAD');

const branchNames = groups.map((g, i) =>
  `autoresearch/${goal}/${String(i + 1).padStart(2, '0')}-${g.slug}`);
for (const b of branchNames) {
  if (tryGit('rev-parse', '--verify', '--quiet', `refs/heads/${b}`).ok) fail(`branch already exists: ${b}`);
}

const notAuto = (f) => f && !f.startsWith('.auto/') && f !== '.auto';

// Files per group: diff from previous group's endpoint.
let prev = base;
const groupFiles = [];
for (const g of groups) {
  const files = git('diff', '--name-only', `${prev}..${g.last_commit}`).split('\n').filter(notAuto);
  groupFiles.push(files);
  prev = g.last_commit;
}

// No file may appear in two groups (that would break independent mergeability).
const seen = new Map();
groupFiles.forEach((files, i) => {
  for (const f of files) {
    if (seen.has(f)) fail(`file "${f}" appears in groups ${seen.get(f) + 1} and ${i + 1} — regroup so each file belongs to exactly one group`);
    seen.set(f, i);
  }
});

// Union must cover the whole branch diff.
const fullDiff = git('diff', '--name-only', `${base}..${finalTree}`).split('\n').filter(notAuto);
const missing = fullDiff.filter((f) => !seen.has(f));
if (missing.length) fail(`files changed on the branch but in no group: ${missing.join(', ')}`);

// -- branch creation ----------------------------------------------------------
const created = [];
try {
  groups.forEach((g, i) => {
    const files = groupFiles[i];
    if (files.length === 0) { console.log(`skip group ${i + 1} "${g.title}" — no files`); return; }
    git('checkout', '--detach', base);
    git('checkout', '-b', branchNames[i]);
    git('checkout', g.last_commit, '--', ...files);
    git('add', '-A');
    git('commit', '--no-verify', '-m', `${g.title}\n\n${g.body || ''}`.trim());
    created.push({ branch: branchNames[i], files, title: g.title });
  });
} finally {
  tryGit('checkout', originalRef);
}

// -- report -------------------------------------------------------------------
console.log(`\nCreated ${created.length} independently mergeable branch(es) from ${base.slice(0, 7)}:\n`);
for (const c of created) {
  console.log(`  ${c.branch}`);
  console.log(`    ${c.title}`);
  for (const f of c.files) console.log(`    - ${f}`);
}
console.log(`\nEach branch stems from the same base and touches disjoint files — merge in any order.`);
console.log(`Cleanup when merged: git branch -D ${created.map((c) => c.branch).join(' ')}`);
