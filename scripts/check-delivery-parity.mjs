#!/usr/bin/env node
// scripts/check-delivery-parity.mjs
// Shell dialect: cross-platform (node invocation — POSIX and PowerShell compatible)
//
// Mechanical gate over manifest.json <-> packages/*/sync-config.json agreement.
// A `/peer-review` on skills/autoresearch (2026-08) found the same drift class three
// times in one commit — adopt.md's removal loop still named `fast-execute` after the
// swarm swap, packages/cairn-pi/package.json's description undercounted its own skills,
// and manifest.json's swarm entry shipped without the `pi` delivery key that
// packages/cairn-pi/sync-config.json already carried. Three instances of one shape is a
// standing invariant, not three one-off typos — [LAW gate-beats-instruction]: an
// instruction to "keep these in sync" does not hold under a fresh author; only a gate
// checks it on every change.
//
// Fails when:
//   - a skill listed in packages/<pkg>/sync-config.json lacks the matching delivery
//     key in that skill's manifest.json entry (forward: package ships it, manifest
//     doesn't say so);
//   - a manifest.json package-delivery entry carries a delivery key whose package
//     doesn't actually list that skill in sync-config.json (reverse: manifest claims
//     it, package doesn't ship it);
//   - a packages/* directory has no entry in DELIVERY_KEY below (new package added
//     without wiring this gate to it).
//
// Usage:
//   node scripts/check-delivery-parity.mjs

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// Package directory name -> the delivery key it corresponds to in manifest.json's
// per-skill `delivery` block. Add an entry here when a new distribution package ships;
// an unmapped packages/* directory fails the gate rather than being skipped silently.
const DELIVERY_KEY = {
  "cairn-pi": "pi",
  "cairn-claude": "claude-code",
  "cairn-agy": "agy",
};

const manifest = JSON.parse(readFileSync(join(repoRoot, "manifest.json"), "utf8"));

// skill name -> Set of delivery keys present in its manifest.json entry
// (package-method entries only — curl/manual-delivery entries are out of scope).
const manifestSkills = new Map();
for (const f of manifest.files) {
  const m = f.src.match(/^files\/skills\/([^/]+)\/SKILL\.md$/);
  if (!m) continue;
  if (!f.delivery || f.delivery.method !== "package") continue;
  manifestSkills.set(m[1], new Set(Object.keys(f.delivery).filter((k) => k !== "method")));
}

const packagesDir = join(repoRoot, "packages");
const pkgDirs = readdirSync(packagesDir, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name);

const errors = [];

for (const pkgName of pkgDirs) {
  const deliveryKey = DELIVERY_KEY[pkgName];
  if (!deliveryKey) {
    errors.push(`packages/${pkgName}: no entry in DELIVERY_KEY — add one to scripts/check-delivery-parity.mjs`);
    continue;
  }

  const cfgPath = join(packagesDir, pkgName, "sync-config.json");
  if (!existsSync(cfgPath)) {
    errors.push(`packages/${pkgName}/sync-config.json: missing`);
    continue;
  }
  const cfg = JSON.parse(readFileSync(cfgPath, "utf8"));
  const shipped = new Set(cfg.skills ?? []);

  // Forward — every skill this package ships must carry the matching delivery key.
  for (const skill of shipped) {
    const keys = manifestSkills.get(skill);
    if (!keys) {
      errors.push(
        `${skill}: shipped by packages/${pkgName}/sync-config.json but has no ` +
          `package-delivery entry in manifest.json`,
      );
    } else if (!keys.has(deliveryKey)) {
      errors.push(
        `${skill}: shipped by packages/${pkgName} but manifest.json's delivery block ` +
          `is missing "${deliveryKey}"`,
      );
    }
  }

  // Reverse — every skill manifest.json claims this package delivers must actually
  // appear in that package's sync-config.json.
  for (const [skill, keys] of manifestSkills) {
    if (keys.has(deliveryKey) && !shipped.has(skill)) {
      errors.push(
        `${skill}: manifest.json's delivery block claims "${deliveryKey}" but ` +
          `packages/${pkgName}/sync-config.json does not list it`,
      );
    }
  }
}

if (errors.length) {
  console.error(`\ndelivery-parity FAILED (${errors.length}):\n - ${errors.join("\n - ")}`);
  process.exit(1);
}
console.log(
  `delivery-parity OK — ${pkgDirs.length} package(s), ${manifestSkills.size} ` +
    `package-delivered skill(s) in manifest.json`,
);
