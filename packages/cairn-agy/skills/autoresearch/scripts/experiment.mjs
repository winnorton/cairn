#!/usr/bin/env node
// Autoresearch experiment harness — Claude Code adaptation of pi-autoresearch's
// extension tools (init_experiment / run_experiment / log_experiment).
// Upstream: https://github.com/davebcn87/pi-autoresearch (MIT).
//
// Commands:
//   init    --name <s> --metric <s> [--unit <s>] --direction lower|higher
//   run     --command <cmd> [--timeout <sec=600>] [--checks-timeout <sec=300>]
//   log     --status keep|discard|crash|checks_failed --description <s>
//           [--metric <num>] [--metrics <json>] [--asi <text-or-json>] [--force]
//   status  [--limit <n=10>]
//   export
//   mode    --on|--off
//   clear
//
// All state lives in .auto/ under the working dir (override: .auto/config.json workingDir).

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const OUTPUT_MAX_LINES = 80;
const OUTPUT_MAX_BYTES = 4096;
const METRIC_RE = /^METRIC\s+([A-Za-z0-9_.\-]+)=(-?\d+(?:\.\d+)?(?:e-?\d+)?)\s*$/gim;

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) args[key] = true;
      else { args[key] = next; i++; }
    } else args._.push(a);
  }
  return args;
}

function findRoot() {
  // config.json may redirect workingDir; otherwise cwd.
  const cwd = process.cwd();
  const cfgPath = path.join(cwd, '.auto', 'config.json');
  if (fs.existsSync(cfgPath)) {
    try {
      const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
      if (cfg.workingDir) return path.resolve(cwd, cfg.workingDir);
    } catch { /* fall through */ }
  }
  return cwd;
}

const ROOT = findRoot();
const AUTO = path.join(ROOT, '.auto');
const LOG = path.join(AUTO, 'log.jsonl');
const STATE = path.join(AUTO, 'state.json');

function readConfigFile() {
  try { return JSON.parse(fs.readFileSync(path.join(AUTO, 'config.json'), 'utf8')); }
  catch { return {}; }
}

function readLog() {
  if (!fs.existsSync(LOG)) return [];
  return fs.readFileSync(LOG, 'utf8').split('\n').filter(Boolean).map((l) => {
    try { return JSON.parse(l); } catch { return null; }
  }).filter(Boolean);
}

function appendLog(obj) {
  fs.mkdirSync(AUTO, { recursive: true });
  fs.appendFileSync(LOG, JSON.stringify(obj) + '\n');
}

function currentSegment(entries) {
  return entries.filter((e) => e.type === 'config').length;
}

function lastConfig(entries) {
  for (let i = entries.length - 1; i >= 0; i--) if (entries[i].type === 'config') return entries[i];
  return null;
}

function segmentRuns(entries) {
  const seg = currentSegment(entries);
  return entries.filter((e) => e.type !== 'config' && e.segment === seg);
}

function git(args, opts = {}) {
  const r = spawnSync('git', args, { cwd: ROOT, encoding: 'utf8', ...opts });
  return { code: r.status, out: (r.stdout || '').trim(), err: (r.stderr || '').trim() };
}

function fail(msg) { console.error(`ERROR: ${msg}`); process.exit(1); }

function fmt(v, unit) {
  if (v === null || v === undefined || Number.isNaN(v)) return '—';
  const s = Math.abs(v) >= 1000 ? Math.round(v).toLocaleString('en-US')
    : Math.abs(v) >= 1 ? v.toFixed(2).replace(/\.?0+$/, '')
    : v.toPrecision(3);
  return unit ? `${s} ${unit}` : s;
}

function truncateOutput(text) {
  let lines = text.split('\n');
  let truncated = false;
  if (lines.length > OUTPUT_MAX_LINES) { lines = lines.slice(-OUTPUT_MAX_LINES); truncated = true; }
  let out = lines.join('\n');
  if (Buffer.byteLength(out) > OUTPUT_MAX_BYTES) {
    out = out.slice(-OUTPUT_MAX_BYTES); truncated = true;
  }
  return (truncated ? '…[output truncated]…\n' : '') + out;
}

function median(xs) {
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

// Confidence = |best_kept - baseline| / MAD of all metric values in the current
// segment. null when < 3 data points or MAD is 0. ≥2.0× → likely real; <1.0× → noise.
function confidence(runs, direction, thisEntry) {
  const all = [...runs, thisEntry].filter((r) => typeof r.metric === 'number');
  if (all.length < 3) return null;
  const values = all.map((r) => r.metric);
  const med = median(values);
  const mad = median(values.map((v) => Math.abs(v - med)));
  if (mad === 0) return null;
  const baseline = values[0];
  const kept = all.filter((r) => r.status === 'keep').map((r) => r.metric);
  if (kept.length === 0) return null;
  const best = direction === 'higher' ? Math.max(...kept) : Math.min(...kept);
  return Math.abs(best - baseline) / mad;
}

// ---------------------------------------------------------------- commands

function cmdInit(args) {
  const { name, metric, unit, direction } = args;
  if (!name || !metric || !direction) fail('init requires --name, --metric, --direction');
  if (direction !== 'lower' && direction !== 'higher') fail('--direction must be lower|higher');
  fs.mkdirSync(AUTO, { recursive: true });
  appendLog({ type: 'config', name, metricName: metric, metricUnit: unit || '', bestDirection: direction, timestamp: Date.now() });
  fs.writeFileSync(STATE, JSON.stringify({ active: true, activatedAt: Date.now() }, null, 2));
  const seg = currentSegment(readLog());
  console.log(`Initialized autoresearch session "${name}" (segment ${seg}).`);
  console.log(`Primary metric: ${metric}${unit ? ` [${unit}]` : ''}, direction: ${direction} is better.`);
  console.log(`Log: ${LOG}`);
}

function cmdRun(args) {
  const command = args.command;
  if (!command) fail('run requires --command');
  const timeoutSec = Number(args.timeout || 600);
  const checksTimeoutSec = Number(args['checks-timeout'] || 300);

  const t0 = process.hrtime.bigint();
  const r = spawnSync('bash', ['-c', command], {
    cwd: ROOT, encoding: 'utf8', timeout: timeoutSec * 1000,
    maxBuffer: 64 * 1024 * 1024,
  });
  const durationMs = Number(process.hrtime.bigint() - t0) / 1e6;
  const timedOut = r.error?.code === 'ETIMEDOUT' || r.signal === 'SIGTERM';
  const combined = (r.stdout || '') + (r.stderr ? '\n' + r.stderr : '');

  const metrics = {};
  for (const m of combined.matchAll(METRIC_RE)) metrics[m[1]] = Number(m[2]);

  const result = {
    ok: r.status === 0 && !timedOut,
    exitCode: timedOut ? null : r.status,
    timedOut,
    durationMs: Math.round(durationMs),
    metrics,
    output: truncateOutput(combined),
    checks: null,
  };

  const checksPath = path.join(AUTO, 'checks.sh');
  if (result.ok && fs.existsSync(checksPath)) {
    const c = spawnSync('bash', [checksPath], {
      cwd: ROOT, encoding: 'utf8', timeout: checksTimeoutSec * 1000,
      maxBuffer: 64 * 1024 * 1024,
    });
    const cTimedOut = c.error?.code === 'ETIMEDOUT' || c.signal === 'SIGTERM';
    result.checks = {
      ok: c.status === 0 && !cTimedOut,
      exitCode: cTimedOut ? null : c.status,
      timedOut: cTimedOut,
      output: truncateOutput((c.stdout || '') + (c.stderr ? '\n' + c.stderr : '')),
    };
  }

  console.log(JSON.stringify(result, null, 2));
  if (!result.ok || (result.checks && !result.checks.ok)) process.exitCode = 2;
}

function cmdLog(args) {
  const status = args.status;
  const description = args.description;
  if (!status || !description) fail('log requires --status and --description');
  if (!['keep', 'discard', 'crash', 'checks_failed'].includes(status)) {
    fail('--status must be keep|discard|crash|checks_failed');
  }
  const entries = readLog();
  const cfg = lastConfig(entries);
  if (!cfg) fail('no session — run init first');
  const seg = currentSegment(entries);
  const runs = segmentRuns(entries);

  const metric = args.metric !== undefined ? Number(args.metric) : null;
  if (status === 'keep' && (metric === null || Number.isNaN(metric))) {
    fail('log --status keep requires a numeric --metric');
  }
  let secondary = {};
  if (args.metrics) {
    try { secondary = JSON.parse(args.metrics); } catch { fail('--metrics must be valid JSON'); }
    // Secondary metric names must stay consistent within a segment unless --force.
    const known = new Set(runs.flatMap((r) => Object.keys(r.metrics || {})));
    if (runs.length > 0 && !args.force) {
      const novel = Object.keys(secondary).filter((k) => !known.has(k));
      if (novel.length) fail(`new secondary metric name(s) ${novel.join(', ')} — known: [${[...known].join(', ')}]. Pass --force to allow.`);
    }
  }

  let asi = args.asi ?? null;
  if (typeof asi === 'string') { try { asi = JSON.parse(asi); } catch { /* keep as string */ } }

  // Git side effects first, so the log records the resulting commit.
  let commit = null;
  if (status === 'keep') {
    git(['add', '-A']);
    const trailer = JSON.stringify({ metric, metrics: secondary, status, segment: seg });
    const msg = `${description}\n\nAutoresearch-Run: ${entries.filter((e) => e.type !== 'config').length + 1}\nAutoresearch-Result: ${trailer}`;
    const c = git(['commit', '-m', msg, '--no-verify']);
    if (c.code !== 0 && !/nothing to commit/.test(c.out + c.err)) {
      fail(`git commit failed: ${c.err || c.out}`);
    }
    commit = git(['rev-parse', '--short=7', 'HEAD']).out;
  } else {
    // Revert working tree, preserving .auto/ (log, prompt, ideas survive reverts).
    git(['checkout', 'HEAD', '--', '.', ':(exclude).auto']);
    git(['clean', '-fd', '-e', '.auto']);
    commit = git(['rev-parse', '--short=7', 'HEAD']).out;
  }

  const entry = {
    run: entries.filter((e) => e.type !== 'config').length + 1,
    commit, metric, metrics: secondary, status, description,
    timestamp: Date.now(), segment: seg, confidence: null, asi,
  };
  entry.confidence = confidence(runs, cfg.bestDirection, entry);
  appendLog(entry);

  const conf = entry.confidence;
  const confNote = conf === null ? 'n/a (need ≥3 runs, nonzero spread)'
    : `${conf.toFixed(2)}× ${conf >= 2 ? '(likely real)' : conf >= 1 ? '(borderline — consider re-running)' : '(within noise — do not trust)'}`;
  console.log(`Logged run ${entry.run} [${status}] @ ${commit} — ${cfg.metricName}=${fmt(metric, cfg.metricUnit)}`);
  console.log(`Confidence: ${confNote}`);
  const baseline = runs.find((r) => typeof r.metric === 'number') ?? entry;
  if (typeof baseline.metric === 'number' && typeof metric === 'number' && baseline !== entry) {
    const deltaPct = ((metric - baseline.metric) / Math.abs(baseline.metric)) * 100;
    console.log(`vs baseline (${fmt(baseline.metric, cfg.metricUnit)}): ${deltaPct >= 0 ? '+' : ''}${deltaPct.toFixed(1)}%`);
  }
}

function cmdStatus(args) {
  const entries = readLog();
  const cfg = lastConfig(entries);
  if (!cfg) { console.log('No autoresearch session. Run init first.'); return; }
  const seg = currentSegment(entries);
  const runs = segmentRuns(entries);
  const counts = { keep: 0, discard: 0, crash: 0, checks_failed: 0 };
  for (const r of runs) counts[r.status] = (counts[r.status] || 0) + 1;

  console.log(`Session: ${cfg.name}  (segment ${seg}, ${runs.length} runs)`);
  console.log(`Metric: ${cfg.metricName}${cfg.metricUnit ? ` [${cfg.metricUnit}]` : ''} — ${cfg.bestDirection} is better`);
  console.log(`Runs: ${counts.keep} kept, ${counts.discard} discarded, ${counts.crash} crashed, ${counts.checks_failed} checks-failed`);

  const withMetric = runs.filter((r) => typeof r.metric === 'number');
  if (withMetric.length) {
    const baseline = withMetric[0];
    const kept = withMetric.filter((r) => r.status === 'keep');
    console.log(`Baseline: ${fmt(baseline.metric, cfg.metricUnit)} (run ${baseline.run})`);
    if (kept.length) {
      const best = kept.reduce((a, b) =>
        (cfg.bestDirection === 'higher' ? b.metric > a.metric : b.metric < a.metric) ? b : a);
      const deltaPct = ((best.metric - baseline.metric) / Math.abs(baseline.metric)) * 100;
      console.log(`Best kept: ${fmt(best.metric, cfg.metricUnit)} (run ${best.run}, ${deltaPct >= 0 ? '+' : ''}${deltaPct.toFixed(1)}% vs baseline)`);
    }
  }

  const limit = Number(args.limit || 10);
  const recent = runs.slice(-limit);
  if (recent.length) {
    console.log('\nrun  commit   metric        status         description');
    for (const r of recent) {
      console.log(
        String(r.run).padEnd(4) +
        ` ${(r.commit || '—').padEnd(8)}` +
        ` ${fmt(r.metric, '').padEnd(13)}` +
        ` ${r.status.padEnd(14)}` +
        ` ${r.description}`);
    }
  }
}

function cmdExport() {
  const entries = readLog();
  const cfg = lastConfig(entries);
  if (!cfg) fail('no session log to export');
  const html = dashboardHtml(entries, cfg);
  const out = path.join(AUTO, 'dashboard.html');
  fs.writeFileSync(out, html);
  console.log(out);
}

function dashboardHtml(entries, cfg) {
  const data = JSON.stringify(entries).replace(/</g, '\\u003c');
  return `<!doctype html><meta charset="utf-8"><title>autoresearch — ${cfg.name}</title>
<style>
:root{color-scheme:light dark;font-family:ui-monospace,Consolas,monospace}
body{margin:2rem;max-width:960px}h1{font-size:1.1rem}table{border-collapse:collapse;width:100%;font-size:.85rem}
td,th{padding:.3rem .6rem;border-bottom:1px solid #8884;text-align:left;white-space:nowrap}
td.desc{white-space:normal}.keep{color:#2a2}.discard{color:#a80}.crash,.checks_failed{color:#c33}
.dim{opacity:.5}#chart{width:100%;height:180px;margin:1rem 0}
</style>
<h1>autoresearch — ${cfg.name} · ${cfg.metricName}${cfg.metricUnit ? ` [${cfg.metricUnit}]` : ''} · ${cfg.bestDirection} is better</h1>
<svg id="chart" viewBox="0 0 960 180" preserveAspectRatio="none"></svg>
<div id="summary"></div><table id="t"><thead><tr>
<th>run</th><th>commit</th><th>metric</th><th>status</th><th>conf</th><th>description</th></tr></thead><tbody></tbody></table>
<script>
const entries=${data};
const seg=entries.filter(e=>e.type==='config').length;
const runs=entries.filter(e=>e.type!=='config');
const cur=runs.filter(r=>r.segment===seg&&typeof r.metric==='number');
if(cur.length>1){const xs=cur.map((_,i)=>i),ys=cur.map(r=>r.metric);
const lo=Math.min(...ys),hi=Math.max(...ys),pad=(hi-lo)||1;
const px=i=>20+(i/(cur.length-1))*920,py=v=>165-((v-lo)/pad)*150;
const svg=document.getElementById('chart');
svg.innerHTML='<polyline fill="none" stroke="#58f" stroke-width="1.5" points="'+cur.map((r,i)=>px(i)+','+py(r.metric)).join(' ')+'"/>'
+cur.map((r,i)=>'<circle cx="'+px(i)+'" cy="'+py(r.metric)+'" r="3" fill="'+(r.status==='keep'?'#2a2':r.status==='discard'?'#a80':'#c33')+'"><title>run '+r.run+': '+r.metric+' ('+r.status+')</title></circle>').join('');}
const counts={};for(const r of runs)if(r.segment===seg)counts[r.status]=(counts[r.status]||0)+1;
document.getElementById('summary').textContent=Object.entries(counts).map(([k,v])=>v+' '+k).join(' · ');
const tb=document.querySelector('#t tbody');
for(const r of [...runs].reverse()){const tr=document.createElement('tr');
if(r.segment!==seg)tr.className='dim';
tr.innerHTML='<td>'+r.run+'</td><td>'+(r.commit||'—')+'</td><td><b>'+(r.metric??'—')+'</b></td><td class="'+r.status+'">'+r.status+'</td><td>'+(r.confidence?r.confidence.toFixed(1)+'×':'—')+'</td><td class="desc">'+String(r.description).replace(/</g,'&lt;')+'</td>';
tb.appendChild(tr);}
</script>`;
}

function cmdMode(args) {
  fs.mkdirSync(AUTO, { recursive: true });
  const active = !args.off;
  fs.writeFileSync(STATE, JSON.stringify({ active, changedAt: Date.now() }, null, 2));
  console.log(`Autoresearch mode: ${active ? 'ON' : 'OFF'}`);
}

function cmdClear() {
  for (const f of [LOG, STATE]) if (fs.existsSync(f)) fs.unlinkSync(f);
  console.log('Cleared .auto/log.jsonl and state. prompt.md / measure.sh / ideas.md kept.');
}

const [cmd, ...rest] = process.argv.slice(2);
const args = parseArgs(rest);
switch (cmd) {
  case 'init': cmdInit(args); break;
  case 'run': cmdRun(args); break;
  case 'log': cmdLog(args); break;
  case 'status': cmdStatus(args); break;
  case 'export': cmdExport(); break;
  case 'mode': cmdMode(args); break;
  case 'clear': cmdClear(); break;
  default:
    console.log('usage: experiment.mjs <init|run|log|status|export|mode|clear> [--flags]');
    process.exit(cmd ? 1 : 0);
}
