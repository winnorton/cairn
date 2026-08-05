#!/usr/bin/env node
// Optional Claude Code Stop hook — the Claude Code equivalent of pi-autoresearch's
// agent-end auto-resume hook. When an autoresearch session is active, it blocks the
// agent from ending its turn and re-prompts it to continue the loop, capped by
// maxIterations (.auto/config.json, default 25 runs per segment).
//
// Opt-in wiring (project .claude/settings.json) — <skill-base> is the ABSOLUTE path
// of this skill's installed directory (the harness announces it as
// "Base directory for this skill" at invocation; cairn installs it via a package,
// so the location differs per harness):
//   { "hooks": { "Stop": [ { "hooks": [ { "type": "command",
//     "command": "node <skill-base>/scripts/stop-hook.mjs" } ] } ] } }
//
// Inert unless .auto/state.json says {active: true}. Reads .auto/ from the hook
// payload's cwd (the project root), never from this script's own location.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Resolve the sibling harness from this file, so the re-prompt quotes a runnable
// command regardless of where the harness installed this skill.
const EXPERIMENT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'experiment.mjs');

let input = {};
try {
  input = JSON.parse(fs.readFileSync(0, 'utf8'));
} catch { /* no stdin — treat as inert */ }

const cwd = input.cwd || process.cwd();
const AUTO = path.join(cwd, '.auto');

function readJson(p, fallback) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return fallback; }
}

const state = readJson(path.join(AUTO, 'state.json'), null);
const logPath = path.join(AUTO, 'log.jsonl');
if (!state || !state.active || !fs.existsSync(logPath)) process.exit(0);

const entries = fs.readFileSync(logPath, 'utf8').split('\n').filter(Boolean)
  .map((l) => { try { return JSON.parse(l); } catch { return null; } })
  .filter(Boolean);
const segment = entries.filter((e) => e.type === 'config').length;
const runs = entries.filter((e) => e.type !== 'config' && e.segment === segment);
const cfg = readJson(path.join(AUTO, 'config.json'), {});
const maxIterations = Number(cfg.maxIterations ?? 25);

if (runs.length >= maxIterations) {
  // Cap reached: allow the stop, deactivate so the next turn isn't blocked either.
  fs.writeFileSync(path.join(AUTO, 'state.json'),
    JSON.stringify({ active: false, deactivatedAt: Date.now(), reason: `maxIterations (${maxIterations}) reached` }, null, 2));
  console.log(`Autoresearch: maxIterations (${maxIterations}) reached — session deactivated. Re-arm with /autoresearch or raise maxIterations in .auto/config.json.`);
  process.exit(0);
}

// Guard against a stuck loop: if the last 3 runs all crashed, let the agent stop.
const last3 = runs.slice(-3);
if (last3.length === 3 && last3.every((r) => r.status === 'crash')) {
  console.log('Autoresearch: 3 consecutive crashes — allowing stop. Fix the harness, then resume.');
  process.exit(0);
}

console.log(JSON.stringify({
  decision: 'block',
  reason: `Autoresearch session is active (run ${runs.length}/${maxIterations} this segment). ` +
    'Continue the optimization loop: re-read .auto/prompt.md (especially "What\'s Been Tried"), ' +
    'pick the next idea, edit, benchmark with experiment.mjs run, and record with experiment.mjs log. ' +
    `To stop looping, run: node "${EXPERIMENT}" mode --off`,
}));
