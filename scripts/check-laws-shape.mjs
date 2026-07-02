#!/usr/bin/env node
// check-laws-shape.mjs — mechanical gate for the LAWS.md meta-rules that a
// machine CAN check (per meta-rule 6: machine-checkable means gate, not prose):
//   - every law heading carries a *(slug: kebab-case)* suffix
//   - slugs are unique within a file
//   - every law body contains **Why:** and **How to apply:** before the next law
// Judgment-only meta-rules (observable-not-vibes, memory-first promotion, laws
// expire) stay prose — this script deliberately does not pretend to check them.

import { readFileSync, existsSync } from 'node:fs';

const FILES = ['LAWS.md', 'files/.cairn/LAWS.md'];
const HEADING = /^###\s+(.+?)\s*\*\(slug:\s*([^)]+)\)\*\s*$/;
const BARE_HEADING = /^###\s+/;

let failures = 0;

for (const file of FILES) {
  if (!existsSync(file)) {
    console.error(`FAIL  ${file} — law file missing`);
    failures++;
    continue;
  }
  const lines = readFileSync(file, 'utf8').split(/\r?\n/);
  const slugs = new Map();
  // collect law blocks, skipping fenced code (the how-to-write template example)
  const laws = [];
  let inFence = false;
  lines.forEach((line, i) => {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      return;
    }
    if (inFence || !BARE_HEADING.test(line)) return;
    const m = line.match(HEADING);
    laws.push({ line: i + 1, slug: m ? m[2].trim() : null, title: line.replace(/^###\s+/, '') });
  });

  laws.forEach((law, idx) => {
    const start = law.line;
    const end = idx + 1 < laws.length ? laws[idx + 1].line - 1 : lines.length;
    const body = lines.slice(start, end).join('\n');

    if (!law.slug) {
      console.error(`FAIL  ${file}:${start} — law heading has no *(slug: ...)* suffix: "${law.title}"`);
      failures++;
    } else {
      if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(law.slug)) {
        console.error(`FAIL  ${file}:${start} — slug "${law.slug}" is not kebab-case`);
        failures++;
      }
      if (slugs.has(law.slug)) {
        console.error(`FAIL  ${file}:${start} — duplicate slug "${law.slug}" (first at line ${slugs.get(law.slug)})`);
        failures++;
      }
      slugs.set(law.slug, start);
    }
    if (!/\*\*Why:\*\*/.test(body)) {
      console.error(`FAIL  ${file}:${start} — law "${law.slug ?? law.title}" has no **Why:** block`);
      failures++;
    }
    if (!/\*\*How to apply:\*\*/.test(body)) {
      console.error(`FAIL  ${file}:${start} — law "${law.slug ?? law.title}" has no **How to apply:** block`);
      failures++;
    }
  });

  console.log(`${file}: ${laws.length} laws, ${slugs.size} slugs`);
}

if (failures > 0) {
  console.error(`laws-shape check FAILED — ${failures} problem(s)`);
  process.exit(1);
}
console.log('laws-shape check OK');
