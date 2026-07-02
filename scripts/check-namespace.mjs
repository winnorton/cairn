#!/usr/bin/env node
// check-namespace.mjs — [LAW own-your-namespace] mechanical gate.
//
// Fails when a skill directory under files/skills/ takes the name of a known
// vendor built-in command. Precedent: cairn's /review was silently shadowed by
// Claude Code's built-in /review until the v0.13.1 rename to /peer-review —
// collisions don't error, they silently swallow the skill.
//
// GRANDFATHERED lists names that already collide and are shipped; they pass
// with a warning so this gate can land without forcing an immediate rename.
// Removing a name from GRANDFATHERED (after its rename ships) makes the gate
// hard for that name too. Never add a NEW skill to GRANDFATHERED — rename it.

import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const SKILLS_DIR = 'files/skills';

// Vendor built-in / near-universal harness command names. Curated, not
// exhaustive — extend when a new collision is discovered (cite the discovery).
const DENYLIST = new Set([
  // Claude Code built-ins and CLI verbs
  'review', 'security-review', 'code-review', 'init', 'compact', 'config',
  'help', 'clear', 'status', 'doctor', 'login', 'logout', 'bug', 'mcp',
  'memory', 'model', 'agents', 'hooks', 'permissions', 'resume', 'export',
  'cost', 'context', 'rewind', 'usage', 'statusline', 'add-dir', 'vim',
  'upgrade', 'release-notes', 'todos',
  // common cross-harness verbs claimed by more than one vendor
  'run', 'verify', 'schedule', 'loop',
]);

// Shipped cairn skills that already collide — pending a deliberate rename or
// removal decision. Warn, don't fail. Empty since 2026-07-01: the one entry
// (`resume`, review finding MAJOR-9) was resolved by deleting the skill.
// Never add a NEW skill here — rename it instead.
const GRANDFATHERED = new Set([]);

const names = readdirSync(SKILLS_DIR).filter((n) => {
  try {
    return statSync(join(SKILLS_DIR, n)).isDirectory();
  } catch {
    return false;
  }
});

let failures = 0;
let warnings = 0;

for (const name of names) {
  if (!DENYLIST.has(name)) continue;
  if (GRANDFATHERED.has(name)) {
    warnings++;
    console.log(
      `WARN  ${name} — collides with a vendor built-in; grandfathered pending rename (MAJOR-9).`
    );
  } else {
    failures++;
    console.error(
      `FAIL  ${name} — collides with a vendor built-in command. ` +
        `[LAW own-your-namespace]: rename, don't coexist (precedent: review → peer-review).`
    );
  }
}

console.log(
  `${names.length} skills checked · ${failures} collision(s) · ${warnings} grandfathered`
);
if (failures > 0) process.exit(1);
console.log('namespace check OK');
