# SPEC_HIVE_CONTEXT_SESSIONS_06b_ANTIGRAVITY_FULL_DECODE

**Drafted:** 2026-06-13 by Claude Opus 4.8 (1M) · **Requested by:** Win Norton
**Program:** [SPEC_HIVE_CONTEXT_SESSIONS_00_PROGRAM](SPEC_HIVE_CONTEXT_SESSIONS_00_PROGRAM.md)
**Triggered by:** deferral **D1** (master §3) — *"Antigravity full-fidelity protobuf
decode. … structured decode follows."* WHEN = *after the WS 06 spike result.* The spike ran
2026-06-13, WS 06 shipped **best-effort** (`FIDELITY = 'best-effort'`), so D1 is now
triggered and this spec is the follow-up it named.
**Depends on:** WS 06 (the best-effort adapter is the baseline this hardens) · WS 01
(envelope contract — consumed, not changed) · WS 03 (redaction gate — re-run over the new
decode surface).
**Repo:** `cairn-mcp-server` (per master §8: MCP-server work → worktree in
`cairn-mcp-server`).
**Production-status:** additive / backward-compatible. `cairn-mcp-server` v0.4.0 is
released; the adapter's public surface (`antigravityAdapter.normalize(rawPath) → Envelope`)
must not change shape. Envelope schema §2.1 is **frozen** — this work only *populates* fields
the schema already permits (`type: "tool_result"`, `tokens.in/out`), it does not add any.

---

## §A HUMAN INTENT

**Verbatim request:** *"WS 06 of the HIVE_CONTEXT_SESSIONS program shipped the Antigravity
adapter as BEST-EFFORT (deferral D1). The D1 condition is now triggered. Draft
SPEC_HIVE_CONTEXT_SESSIONS_06b_ANTIGRAVITY_FULL_DECODE.md — a full executable spec for the
Antigravity full-fidelity protobuf decode follow-up."*

**Goal (one sentence):** Replace the schema-less wire-type-walk decode in
`src/adapters/antigravity.ts` with a **real `.proto`-schema-driven decode**, so the
Antigravity envelope carries actual tool-result content (stdout / stderr / file bodies) and
per-turn token counts, and the fidelity label can honestly read `full`.

**Five concrete additions** the request names (each becomes a phase):

1. **Recover the full `.proto` schema** — probe the Antigravity backend binary for an
   embedded `FileDescriptorSet` or gRPC reflection, or reconstruct from the
   `.pbtxt` / `.pb` artifacts on disk.
2. **Generate TypeScript types** from the recovered `.proto`.
3. **Decode tool results** (the tool step types — `5,7,8,9,21` in the current adapter)
   which today emit only a `tool_call` with a binary-blob result: full decode yields the
   actual `stdout` / `stderr` / file content as a `tool_result` event.
4. **Add token counts** from `steps.metadata` (the model-response metadata exposes
   input / output / total token varints at depth 1 — visible in the spike but not yet
   mapped with certainty) → populate `events[].tokens.{in,out}`.
5. **Flip the fidelity label to `full`** once the above are confirmed.

**Scope:** `cairn-mcp-server/src/adapters/antigravity.ts` and its decode helpers, a
vendored `.proto` + generated types, one new dependency (`protobufjs`, evaluated in
Phase 1), the adapter test, and a field-dump diagnostic. **Out of scope:** any change to
`envelope.schema.json`, `types.ts`, the registry, the other two adapters, or any MCP tool
signature.

**Success criterion (binary, checkable):** Running the adapter over the spike session DB
`~/.gemini/antigravity/conversations/01ccc93c-3fba-411d-87f5-2e780175398f.db` produces a
schema-valid, scrubbed envelope in which (a) at least one `tool_result` event carries
non-empty `text` matching the real command output, (b) at least one assistant event carries
non-null `tokens.in`/`tokens.out`, and (c) `FIDELITY === 'full'` — **OR**, if Phase 0's
spike gate fails, the adapter advances to the explicitly-labelled intermediate `enhanced`
level with tool-result text and tokens recovered by manual wire-walk, and this spec records
the residual gap and re-defers the `full` label. **No silent overclaim** (master §3
discipline): the label always matches what was actually decoded.

---

## §B BACKGROUND — WHAT WS 06 ALREADY SHIPPED (the baseline)

Read [SPEC_HIVE_CONTEXT_SESSIONS_06_ADAPTER_ANTIGRAVITY](SPEC_HIVE_CONTEXT_SESSIONS_06_ADAPTER_ANTIGRAVITY.md)
(the stub) and `src/adapters/antigravity.ts` (the shipped best-effort adapter) before
starting. Established facts from the spike (do **not** re-derive):

| Fact | Value |
|---|---|
| Session store | SQLite DB at `~/.gemini/antigravity/conversations/<uuid>.db` (460 present on this machine) |
| Step table | `steps(idx, step_type, step_payload, metadata)`; `step_payload` = binary protobuf, **no bundled `.proto`** |
| Decoder today | `decodeProto()` — a generic wire-type-aware walk (varint / len-delim / i64 / i32), no schema, heuristic UTF-8 sniff |
| User msg | `step_type 14` → payload `field[19]` re-decoded → `field[2]` = text |
| Assistant msg | `step_type 15` → payload `field[20]` nested → `field[1]` (fallback `field[8]`) = text |
| Tool steps | `step_type ∈ {5,7,8,9,21}` (write / grep / view_file / list_dir / run_command) → emitted as a **single `tool_call`** event; `field[2]`=name, `field[3]`=args. **Result blob is dropped.** |
| Title / system | `step_type 23` → title; `101` → system log; `98` → skipped |
| Timestamp | `steps.metadata` → top `field[1]` nested → `field[1]`=secs, `field[2]`=nanos → ISO |
| Model | `gen_metadata.data` → `field[19]` = e.g. `gemini-3-flash-b` |
| cwd / slug | `trajectory_metadata_blob(id='main').data` → `field[7]` = `file://` URL |
| Tokens | **all `tokens: null`** today |
| Fidelity | `FIDELITY = 'best-effort'` |

**The two information losses this spec closes:**

- **Tool results are invisible.** A `run_command` step emits `tool_call{name:"run_command"}`
  but the command's stdout/stderr — the highest-signal content for `/session-distill` — is
  left in the undecoded blob. Same for `view_file`/`write` file bodies.
- **Token economics are absent.** `tokens.{in,out}` are null, so the manifest (WS 08) and
  any cost/efficiency distillation have nothing to read for Antigravity sessions.

**Two latent defects to fix while here (found during this spec's research):**

- **D-fix-1 — missing persistence gate.** `antigravity.ts::normalize()` ends with
  `return scrubEnvelope(envelope)` and **never calls** `validateEnvelope()` +
  `assertPersistable()`. `claude-code.ts` calls both before returning (see its tail). The
  Antigravity adapter must reach parity so a malformed envelope can't slip past §4. (Phase 4.)
- **D-fix-2 — fidelity taxonomy is binary.** Only `'best-effort'` exists. The spike-gated
  nature of this work needs a third honest value, `'enhanced'`, for the partial-recovery
  branch. (Phase 0 / Phase 4.)

---

## §C CONTRACTS CONSUMED (frozen — do NOT modify)

| Contract | Source | This spec's relationship |
|---|---|---|
| Envelope shape §2.1 | `src/adapters/types.ts`, `schema/envelope.schema.json` | **Read-only.** `EnvelopeEvent.type` already includes `"tool_result"`; `tokens:{in,out}` already permitted (confirmed in `envelope.schema.json` L106–137). No schema bump. |
| Adapter interface §2.5 | `types.ts::Adapter` | `normalize(rawPath) → Envelope`, pure / deterministic / network-free. Unchanged signature. |
| Redaction gate §2.6 / §4 | `src/redaction/scrub.ts::scrubEnvelope` | Re-run **after** tool-result text is attached. The new decode surface (command stdout, file bodies) is the **highest secret-risk** addition in the whole program — see §E. |
| Determinism §4 | master | Schema-driven decode stays a pure function of raw bytes. `protobufjs` decode is deterministic. No processing timestamps, no map-iteration-order leaks. |
| Idempotence §4 | `computeContentHash` | `content_hash` = sha256 of raw DB bytes — unchanged by richer decoding. |

**Determinism caveat for the executor:** if generated types decode any protobuf `map<>`
field, do **not** serialize map entries in native iteration order — sort keys — or two runs
on the same input could differ. Verify with the determinism check in the Phase 2 checkpoint.

---

## §D PRE-FLIGHT (run first, record output)

```bash
# In the cairn-mcp-server worktree (per master §8).
cd cairn-mcp-server
node --version                      # expect v22.5+ (node:sqlite); machine has v24.13.1
npm run build                       # baseline must compile clean before any change
node test/adapter_antigravity.mjs   # baseline: best-effort envelope, schema-valid, tokens null
git rev-parse --short HEAD          # record baseline commit for rollback
```

Record: the baseline event count, role/type breakdown, and that `tokens` are null and no
`tool_result` events exist. These are the numbers Phase 5 must beat. **Do not edit code
during pre-flight.**

---

## PHASE 0 — SCHEMA-RECOVERY SPIKE (BLOCKER + decision gate)

This phase is investigation, not code. It is the **single gate** that decides whether the
rest of the spec runs in `full` mode (real `.proto`) or `enhanced` fallback (manual
wire-walk extension). Do not write adapter code until the gate is resolved and recorded.

The prompt assumed the CLI binary lives at `~/.gemini/antigravity/bin/` — **that is wrong**
(research finding): that directory holds only `webm_encoder.exe` and `agentapi.bat`, and the
`.bat` is a shim:

```
@echo off
"C:\Users\winno\AppData\Local\Programs\Antigravity\resources\bin\language_server.exe" agentapi %*
```

So the real backend is **`…\AppData\Local\Programs\Antigravity\resources\bin\language_server.exe`**
with an `agentapi` subcommand — the prime schema source. Three recovery avenues, in
preference order (cleanest schema first):

### STEP 0.1 — Probe the language server for gRPC reflection / descriptors
```bash
LS="/c/Users/winno/AppData/Local/Programs/Antigravity/resources/bin/language_server.exe"
"$LS" agentapi --help 2>&1 | tee docs/specs/_artifacts/06b_agentapi_help.txt
# Look for: a --port / --grpc flag, a "reflection" mention, or a "--proto"/"--descriptor" dump.
# If it starts a gRPC server, capture the port and try reflection:
#   grpcurl -plaintext localhost:<port> describe   (if grpcurl available)
#   grpcurl -plaintext localhost:<port> list
```
If reflection responds, dump every service/message descriptor to `proto/antigravity.proto`.
**This is the gold path** — a server-authoritative schema.

### STEP 0.2 — Extract an embedded FileDescriptorSet from the binary
Go / Rust / C++ protobuf builds embed serialized `FileDescriptorProto`s. Scan for them:
```bash
# Pull descriptor-ish strings: proto file paths usually end ".proto" and message names are CamelCase.
strings -n 8 "$LS" | grep -iE '\.proto$|antigravity|cascade|trajectory|StepPayload|ToolCall|Usage' \
  | sort -u | tee docs/specs/_artifacts/06b_descriptor_strings.txt
# If a FileDescriptorSet is locatable (look for the gzip/raw descriptor blob), decode it:
#   protoc --decode=google.protobuf.FileDescriptorSet google/protobuf/descriptor.proto < blob > antigravity.proto.txt
```
The on-disk corroboration that descriptors exist: `~/.gemini/antigravity/antigravity_state.pbtxt`
is **text-format protobuf** with descriptive field names (`post_onboarding`, `seen_nuxs`,
`completed_steps`) and `SCREAMING_SNAKE` enums (`MODEL_PLACEHOLDER_M16`,
`MIGRATION_STATUS_COMPLETED`) — proof the app round-trips through named descriptors locally.
Also evaluate `~/.gemini/antigravity/agyhub_summaries_proto.pb` (6.8 MB) — the name implies a
proto payload that may be self-describing.

### STEP 0.3 — Reconstruct from known field offsets (fallback schema)
If 0.1 and 0.2 yield nothing usable, hand-author a **partial** `proto/antigravity.proto`
covering only the fields this spec needs, seeded from the spike field-map in §B plus the new
field numbers discovered by the field-dump diagnostic (Phase 5's `--dump` helper run over
several tool steps). This produces a *correct-for-our-fields* schema, not a complete one.

### GATE 0 — decide and record
Write `docs/specs/_artifacts/06b_fidelity_decision.md` with one of:

- **`FULL`** — 0.1 or 0.2 produced a schema that names the tool-result and token fields with
  confidence. → Run Phases 1–5 as written; final label `'full'`.
- **`ENHANCED`** — only 0.3 partial reconstruction is available (field numbers known, full
  message graph not). → **Skip Phase 1** (no generated types); in Phase 2/3 extend the
  *existing* `decodeProto` wire-walk to pull the now-known tool-result and token fields by
  number; final label `'enhanced'`; append a "residual gap" section to this spec and leave
  a re-deferral note. The success criterion's OR-branch is satisfied.

**CHECKPOINT 0.** `docs/specs/_artifacts/06b_fidelity_decision.md` exists and states `FULL`
or `ENHANCED` with the evidence (which avenue succeeded, which field numbers were
confirmed). *If neither tool-result text nor token fields can be located by any avenue:* stop
and report — the premise of D1 is unmet; do not flip any label, leave the adapter at
`best-effort`, and escalate to the requester. (This is the honest failure mode; it is not
expected given the `.pbtxt` evidence, but it must be a named branch, not a silent partial.)

---

## PHASE 1 — VENDOR `.proto` + GENERATE TYPES  *(FULL branch only; skip if GATE 0 = ENHANCED)*

### STEP 1.1 — Add `protobufjs` and a vendored schema
**File:** `cairn-mcp-server/package.json`

CURRENT (`dependencies`, abridged):
```json
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.29.0",
    "ajv": "^8.20.0",
    "ink": "^7.0.1",
    "ink-spinner": "^5.0.0",
    "react": "^19.2.5",
    "zod": "^3.23.8"
  },
```
REPLACEMENT — add `protobufjs` (pure-JS, deterministic decode, no native build, no `protoc`
toolchain needed at install time):
```json
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.29.0",
    "ajv": "^8.20.0",
    "ink": "^7.0.1",
    "ink-spinner": "^5.0.0",
    "protobufjs": "^7.4.0",
    "react": "^19.2.5",
    "zod": "^3.23.8"
  },
```
Then place the recovered schema at `cairn-mcp-server/proto/antigravity.proto` (vendored and
committed — it is the decode contract; the binary it came from is not redistributable, the
field shape is). Run `npm install`.

**WHY protobufjs over ts-proto/buf:** the repo has no `protoc` in its toolchain and CI is
plain `tsc`. `protobufjs` loads a `.proto` at runtime (`protobuf.loadSync`) or via a
pre-generated static module — both pure JS, both deterministic. ts-proto/buf would add a
`protoc` build step to a repo whose build is one `tsc` invocation. Keep the toolchain flat.

### STEP 1.2 — Generate static, typed decoders
**File:** `cairn-mcp-server/src/adapters/antigravity_proto.ts` (new — generated, checked in)

Generate a static module + `.d.ts` from the vendored `.proto` so decode is precompiled and
typed (no runtime `.proto` parse, fully deterministic, tree-shakeable):
```bash
npx pbjs -t static-module -w es6 -o src/adapters/antigravity_proto.js proto/antigravity.proto
npx pbts -o src/adapters/antigravity_proto.d.ts src/adapters/antigravity_proto.js
# Commit BOTH generated files. Add a header comment: "GENERATED from proto/antigravity.proto
# by pbjs/pbts — do not hand-edit; regenerate via the commands in SPEC_..._06b."
```
If a static module fights the ESM/`tsc` setup, fall back to runtime `protobuf.loadSync('proto/antigravity.proto')`
inside a lazy singleton (mirror the `getDb` lazy pattern already in `antigravity.ts`).

**CHECKPOINT 1.** `npm run build` compiles clean with the generated module imported (even if
unused yet). `npm install` is reproducible. Commit the `.proto` + generated files in one
commit so the provenance is atomic.

---

## PHASE 2 — SCHEMA-DRIVEN DECODE + TOOL_RESULT EVENTS

This is the core. The shape of the code is fixed here; the **field numbers** are parameters
the executor fills from GATE 0's recovered schema (FULL) or field-map (ENHANCED). To keep
the wiring mechanical, define named constants and set their values from the artifact.

### STEP 2.1 — Declare the recovered field map as named constants
**File:** `cairn-mcp-server/src/adapters/antigravity.ts`

CURRENT (the step-type constants block, L58–66):
```ts
// ── Step type constants (reverse-engineered) ──────────────────────────────────
const STEP_USER_MSG = 14;
const STEP_ASSISTANT_MSG = 15;
/** Tool call variants: view_file(8), list_dir(9), grep(7), write(5), run_command(21) */
const STEP_TOOL_CALL = new Set([5, 7, 8, 9, 21]);
const STEP_TITLE = 23;
const STEP_SYSTEM = 101;
/** Context / preamble steps — skipped */
const STEP_SKIP = new Set([98]);
```
REPLACEMENT — append the tool-result + token field map (fill the `?? /* from GATE 0 */`
numbers from the recovered schema; the comment must cite which avenue confirmed each):
```ts
// ── Step type constants (reverse-engineered) ──────────────────────────────────
const STEP_USER_MSG = 14;
const STEP_ASSISTANT_MSG = 15;
/** Tool call variants: view_file(8), list_dir(9), grep(7), write(5), run_command(21) */
const STEP_TOOL_CALL = new Set([5, 7, 8, 9, 21]);
const STEP_TITLE = 23;
const STEP_SYSTEM = 101;
/** Context / preamble steps — skipped */
const STEP_SKIP = new Set([98]);

// ── Tool-RESULT field map (recovered in SPEC_..._06b Phase 0) ──────────────────
// Source of truth: docs/specs/_artifacts/06b_fidelity_decision.md.
// In a tool step's payload, the result sub-message exposes:
const TOOL_RESULT_NESTED_FIELD = 0;   // <fill> nested sub-message holding the result
const TOOL_RESULT_STDOUT_FIELD = 0;   // <fill> stdout / file-content string
const TOOL_RESULT_STDERR_FIELD = 0;   // <fill> stderr string (may be 0/absent for non-exec tools)
const TOOL_RESULT_EXIT_FIELD = 0;     // <fill> exit/status varint → is_error = (exit !== 0)
const TOOL_RESULT_DURATION_MS_FIELD = 0; // <fill> duration varint/ms (0 if not present)

// ── Token field map: steps.metadata (model-response metadata, depth 1) ─────────
// Spike saw input/output/total varints at depth 1 of the metadata's response sub-message.
const TOKENS_METADATA_NESTED_FIELD = 0; // <fill> nested holding the usage triple
const TOKENS_INPUT_FIELD = 1;           // confirmed candidate: field 1 = input_tokens
const TOKENS_OUTPUT_FIELD = 2;          // confirmed candidate: field 2 = output_tokens
const TOKENS_TOTAL_FIELD = 3;           // confirmed candidate: field 3 = total_tokens (unused; in+out preferred)
```

**WHY named constants:** the reverse-engineered field numbers are the only spike-derived
parameters in the whole change. Centralizing them (a) makes the FULL vs ENHANCED branches
differ only in how the numbers were obtained, not in the decode code, and (b) gives the
reviewer one block to audit against `06b_fidelity_decision.md`.

### STEP 2.2 — Add a tool-result extractor
**File:** `cairn-mcp-server/src/adapters/antigravity.ts`

CURRENT — `extractToolCall` (L273–292) returns only `{ name, argsJson }`. Add a sibling
extractor **after** it (do not modify `extractToolCall`):
```ts
/**
 * Extract a tool RESULT from a tool-call step payload (Phase 0 schema).
 * Returns null when the step carries no result sub-message (call-only steps).
 */
function extractToolResult(payload: Buffer): {
  text: string | null; isError: boolean; durationMs: number | null;
} | null {
  const top = decodeProto(payload);
  // Locate the result sub-message by its recovered field number.
  const nested =
    TOOL_RESULT_NESTED_FIELD > 0 ? getNested(top, TOOL_RESULT_NESTED_FIELD) : null;
  const scope = nested ?? top;

  const stdout = TOOL_RESULT_STDOUT_FIELD > 0 ? getStr(scope, TOOL_RESULT_STDOUT_FIELD) : null;
  const stderr = TOOL_RESULT_STDERR_FIELD > 0 ? getStr(scope, TOOL_RESULT_STDERR_FIELD) : null;
  const exit =
    TOOL_RESULT_EXIT_FIELD > 0 ? getVarint(scope, TOOL_RESULT_EXIT_FIELD) : null;
  const dur =
    TOOL_RESULT_DURATION_MS_FIELD > 0 ? getVarint(scope, TOOL_RESULT_DURATION_MS_FIELD) : null;

  const parts: string[] = [];
  if (stdout) parts.push(stdout);
  if (stderr) parts.push(`[stderr] ${stderr}`);
  const text = parts.length ? parts.join('\n') : null;
  if (text === null && exit === null) return null; // genuinely no result payload

  return {
    text,
    isError: exit !== null && exit !== 0n,
    durationMs: dur !== null ? Number(dur) : null,
  };
}
```

**WHY guard each field with `> 0`:** in the ENHANCED branch some field numbers stay `0`
(unrecovered); the `> 0` guards make the same code degrade gracefully to "decode what we
know" instead of mis-reading field 0 (which is never a valid protobuf field number).

### STEP 2.3 — Emit a `tool_result` event after each `tool_call`
**File:** `cairn-mcp-server/src/adapters/antigravity.ts`

CURRENT — the tool-step branch in the step loop (L482–500):
```ts
    } else if (STEP_TOOL_CALL.has(step.step_type)) {
      const tc = extractToolCall(payload);
      events.push({
        seq: seq++,
        ts,
        role: 'tool',
        type: 'tool_call',
        text: null,
        tool: tc
          ? {
              name: tc.name,
              args_digest: digestArgs(tc.argsJson),
              duration_ms: null,
              is_error: false,
            }
          : { name: 'unknown', args_digest: null, duration_ms: null, is_error: false },
        stop_reason: null,
        tokens: null,
      });
    } else if (step.step_type === STEP_TITLE) {
```
REPLACEMENT — keep the `tool_call`, then push a `tool_result` when one decodes:
```ts
    } else if (STEP_TOOL_CALL.has(step.step_type)) {
      const tc = extractToolCall(payload);
      const toolName = tc?.name ?? 'unknown';
      const res = extractToolResult(payload);
      events.push({
        seq: seq++,
        ts,
        role: 'tool',
        type: 'tool_call',
        text: null,
        tool: {
          name: toolName,
          args_digest: tc ? digestArgs(tc.argsJson) : null,
          duration_ms: null,
          is_error: false,
        },
        stop_reason: null,
        tokens: null,
      });
      if (res && (res.text !== null || res.isError)) {
        events.push({
          seq: seq++,
          ts,
          role: 'tool',
          type: 'tool_result',
          text: res.text,            // scrubEnvelope() redacts this before persist (§E)
          tool: {
            name: toolName,
            args_digest: null,
            duration_ms: res.durationMs,
            is_error: res.isError,
          },
          stop_reason: null,
          tokens: null,
        });
      }
    } else if (step.step_type === STEP_TITLE) {
```

**WHY a separate event, not a field on the call:** the envelope models call and result as
distinct events (`type` enum has both). `/session-distill` and the manifest count
`tool_result` separately and read its `text`. Folding result text onto the `tool_call` would
hide it from every consumer that filters on `type === 'tool_result'`.

**CHECKPOINT 2.** `npm run build` clean. `node test/adapter_antigravity.mjs` now shows
`tool_result > 0` in the type breakdown and non-empty result text in the sample dump.
**Determinism check** — run the adapter twice and diff:
```bash
node -e "import('./dist/adapters/antigravity.js').then(async m=>{const p='C:\\\\Users\\\\winno\\\\.gemini\\\\antigravity\\\\conversations\\\\01ccc93c-3fba-411d-87f5-2e780175398f.db';const a=JSON.stringify(m.antigravityAdapter.normalize(p));const b=JSON.stringify(m.antigravityAdapter.normalize(p));console.log('deterministic:', a===b)})"
```
Must print `deterministic: true`. *If false:* a `map<>`/iteration-order leak crept in — sort
the offending collection before emit (see §C caveat).

---

## PHASE 3 — TOKEN COUNTS FROM `steps.metadata`

### STEP 3.1 — Add a token extractor
**File:** `cairn-mcp-server/src/adapters/antigravity.ts`

CURRENT — `extractTimestamp` (L207–221) already decodes `steps.metadata`. Add a sibling
**after** it that reads the usage triple from the same blob:
```ts
/**
 * Extract per-turn token usage from a step's `metadata` BLOB (Phase 0 field map).
 * Returns null when the metadata carries no usage sub-message (e.g. user steps).
 */
function extractTokens(
  metaBlob: Buffer | Uint8Array | null,
): { in: number | null; out: number | null } | null {
  if (!metaBlob || TOKENS_METADATA_NESTED_FIELD <= 0) return null;
  try {
    const top = decodeProto(Buffer.from(metaBlob));
    const usage = getNested(top, TOKENS_METADATA_NESTED_FIELD);
    if (!usage) return null;
    const tin = getVarint(usage, TOKENS_INPUT_FIELD);
    const tout = getVarint(usage, TOKENS_OUTPUT_FIELD);
    if (tin === null && tout === null) return null;
    return { in: tin !== null ? Number(tin) : null, out: tout !== null ? Number(tout) : null };
  } catch {
    return null;
  }
}
```

### STEP 3.2 — Attach tokens to assistant events
**File:** `cairn-mcp-server/src/adapters/antigravity.ts`

CURRENT — the assistant branch (L469–481):
```ts
    } else if (step.step_type === STEP_ASSISTANT_MSG) {
      const text = extractAssistantText(payload);
      // Include even if text is null — the turn happened
      events.push({
        seq: seq++,
        ts,
        role: 'assistant',
        type: 'message',
        text: text ?? null,
        tool: null,
        stop_reason: null,
        tokens: null,
      });
    } else if (STEP_TOOL_CALL.has(step.step_type)) {
```
REPLACEMENT — read tokens from the step's metadata (the same `step.metadata` already in
scope) and attach:
```ts
    } else if (step.step_type === STEP_ASSISTANT_MSG) {
      const text = extractAssistantText(payload);
      const tokens = extractTokens(step.metadata ?? null);
      // Include even if text is null — the turn happened
      events.push({
        seq: seq++,
        ts,
        role: 'assistant',
        type: 'message',
        text: text ?? null,
        tool: null,
        stop_reason: null,
        tokens,
      });
    } else if (STEP_TOOL_CALL.has(step.step_type)) {
```

**WHY only assistant events:** token usage is reported on the model-response step. User and
tool steps have no usage sub-message (`extractTokens` returns null for them anyway, but
attaching only on the assistant branch keeps intent explicit and avoids null-token churn on
every event).

**CHECKPOINT 3.** `node test/adapter_antigravity.mjs` shows at least one assistant event with
non-null `tokens.in`/`tokens.out`. Sanity-check magnitudes: `in` should dwarf `out` for early
turns (large system prompt), and values should be plausible (hundreds–tens-of-thousands, not
0 or 9-digit). *If values look wrong:* the nested field is mis-mapped — re-dump
`steps.metadata` for an assistant step with the Phase 5 `--dump` helper and correct
`TOKENS_*` constants. Do not ship implausible numbers (that is a silent overclaim).

---

## PHASE 4 — FLIP FIDELITY + CLOSE THE §B DEFECTS

### STEP 4.1 — Extend the fidelity taxonomy and set the label
**File:** `cairn-mcp-server/src/adapters/antigravity.ts`

CURRENT (L55–56):
```ts
// ── Fidelity label stamped into the session ──────────────────────────────────
const FIDELITY = 'best-effort' as const;
```
REPLACEMENT (set per GATE 0 — `'full'` on the FULL branch, `'enhanced'` on the fallback):
```ts
// ── Fidelity label stamped into the session ──────────────────────────────────
// best-effort : schema-less wire-walk (WS 06 original).
// enhanced    : tool-result text + tokens recovered by manual wire-walk (06b ENHANCED branch).
// full        : schema-driven decode from recovered .proto (06b FULL branch).
export type Fidelity = 'best-effort' | 'enhanced' | 'full';
const FIDELITY: Fidelity = 'full'; // ← set to 'enhanced' if GATE 0 = ENHANCED
```
Also update the adapter's header doc-comment (L7–26): change `FIDELITY: BEST-EFFORT` to the
chosen level and replace the "D1 follow-up: …should be drafted" note with "D1 resolved by
SPEC_..._06b on 2026-06-13 — full/enhanced decode via proto/antigravity.proto."

**WHY export the type:** WS 08's manifest and any consumer that surfaces fidelity should
reference the union rather than a string literal. Exporting is additive (the existing
`export { FIDELITY }` already leaks the value).

### STEP 4.2 — Close D-fix-1: add the persistence gate (parity with claude-code)
**File:** `cairn-mcp-server/src/adapters/antigravity.ts`

CURRENT — `normalize()` tail (L555–558):
```ts
  // Apply redaction gate (§4 HARD CONTRACT)
  const scrubbed = scrubEnvelope(envelope);
  return scrubbed;
}
```
REPLACEMENT — scrub, then validate + assert before returning (mirror `claude-code.ts`):
```ts
  // Apply redaction gate (§4 HARD CONTRACT — Layer 1, in-normalization)
  const scrubbed = scrubEnvelope(envelope);

  // Schema + persistence gate (parity with claude-code.ts; §4 hard contract)
  const result = validateEnvelope(scrubbed);
  if (!result.valid) {
    const detail = result.errors.map((e) => `  ${e.instancePath}: ${e.message}`).join('\n');
    throw new Error(`[WS06] Envelope schema validation failed for ${rawPath}:\n${detail}`);
  }
  assertPersistable(scrubbed);
  return scrubbed;
}
```
Add the import at the top alongside the existing `envelope_validator` import:
```ts
// CURRENT:
import { computeContentHash } from '../helpers/envelope_validator.js';
// REPLACEMENT:
import { computeContentHash, validateEnvelope, assertPersistable } from '../helpers/envelope_validator.js';
```

**WHY:** the §4 hard contract requires `redaction.scrubbed === true` AND schema-validity
before persistence. The best-effort adapter relied on the caller; richer decode adds more
surface that can violate the schema (e.g. a tool name that isn't a string). Fail at the
adapter boundary, not downstream.

**CHECKPOINT 4.** `npm run build` clean. `node test/adapter_antigravity.mjs` prints the new
fidelity level and still ends with `✓ PASS`. Deliberately corrupt one event (temporarily set
a `tool.name` to a number in a scratch copy) and confirm `normalize()` now throws — then
revert the corruption.

---

## PHASE 5 — TESTS + DIAGNOSTICS

### STEP 5.1 — Add a raw field-dump diagnostic
**File:** `cairn-mcp-server/test/adapter_antigravity_dump.mjs` (new)

A helper the reverse-engineering needs and the diagnostics-path (stub §"Diagnostics path")
promised. It prints the decoded `ProtoField` tree for a given `step_type` so field numbers
can be confirmed against the schema:
```js
// Usage: node test/adapter_antigravity_dump.mjs <db-path> <step_type> [maxSteps]
// Prints decodeProto() output (fn/wt/str/nested/varint) for matching steps — the tool that
// confirms TOOL_RESULT_* and TOKENS_* field numbers in SPEC_..._06b Phases 2–3.
```
Expose the needed decoder internals for the dump by adding a single test-only export to
`antigravity.ts` (additive, does not change the adapter object):
```ts
// At the bottom of antigravity.ts, alongside `export { FIDELITY };`
export const __test = { decodeProto, extractToolResult, extractTokens };
```

### STEP 5.2 — Upgrade the smoke test to assert FULL-fidelity invariants
**File:** `cairn-mcp-server/test/adapter_antigravity.mjs`

CURRENT — the fidelity note (L103–108) describes results as skipped, and the pass condition
(L135) checks only `valid && scrubbed`. REPLACEMENT — make the test enforce the §A success
criterion:
```js
// After existing stats, before the PASS/FAIL gate, add:
const toolResults = envelope.events.filter((e) => e.type === 'tool_result');
const withTokens  = envelope.events.filter((e) => e.tokens && (e.tokens.in != null || e.tokens.out != null));
console.log('── Fidelity assertions (06b) ─────────────────────────────────────');
console.log(`  tool_result events : ${toolResults.length}`);
console.log(`  events w/ tokens   : ${withTokens.length}`);
console.log(`  fidelity label     : ${FIDELITY}`);

const fidelityOK =
  FIDELITY === 'full'
    ? toolResults.length > 0 && toolResults.some((e) => (e.text ?? '').length > 0) && withTokens.length > 0
    : FIDELITY === 'enhanced'
      ? toolResults.length > 0 || withTokens.length > 0   // partial recovery: at least one of the two
      : false; // best-effort must not reach this test after 06b

if (valid && envelope.session.redaction.scrubbed && fidelityOK) {
  console.log('✓ PASS — full/enhanced fidelity: tool_result + tokens present, schema valid, redacted');
} else {
  console.log('✗ FAIL — see assertions above');
  process.exit(1);
}
```
Also update the test's header banner (L105–107) to describe the new behaviour instead of
"Tool results … are skipped."

### STEP 5.3 — Add a redaction-on-tool-result regression
**File:** `cairn-mcp-server/test/adapter_antigravity.mjs` (same file, after the fidelity block)

The new tool-result decode is the program's highest secret-risk surface (§E). Prove the
gate covers it with a synthetic decoded result containing a planted secret, run through the
real scrubber:
```js
import { scrubEnvelope } from '../dist/redaction/scrub.js';
const planted = JSON.parse(JSON.stringify(envelope));
planted.events.push({ seq: planted.events.length, ts: null, role: 'tool', type: 'tool_result',
  text: 'export GITHUB_TOKEN=ghp_0123456789012345678901234567890123456789\n+ ok',
  tool: { name: 'run_command', args_digest: null, duration_ms: 12, is_error: false },
  stop_reason: null, tokens: null });
const rescrub = scrubEnvelope(planted);
const leaked = JSON.stringify(rescrub).includes('ghp_0123456789012345678901234567890123456789');
console.log(`  planted-secret in tool_result scrubbed: ${!leaked}`);
if (leaked) { console.log('✗ FAIL — secret survived in tool_result text'); process.exit(1); }
```

**CHECKPOINT 5.** `npm run build` then `node test/adapter_antigravity.mjs` exits 0 with the
fidelity assertions and the planted-secret line both passing. `node test/adapter_antigravity_dump.mjs <db> 21`
prints a readable field tree for a `run_command` step. Re-run `npm run test-redaction` —
the existing WS 03 planted-secret suite must still pass (no regression).

---

## §E SECURITY NOTE — THE NEW DECODE SURFACE IS THE RISKIEST IN THE PROGRAM

Best-effort decode dropped tool-result blobs, so command stdout never entered the envelope.
**Full decode pulls it in** — and `run_command` output is exactly where secrets surface
(`echo $GITHUB_TOKEN`, `aws configure`, `.env` cat, key-printing test output). The §4 gate
covers it because `scrubEnvelope()` runs over the *fully serialized* envelope **after** all
events (including the new `tool_result.text`) are attached — but the executor MUST preserve
that ordering: scrub is the **last** thing `normalize()` does before validate/assert (Phase
4). Never short-circuit a tool-result event around the scrub. STEP 5.3 is the regression that
proves it; treat a failure there as release-blocking, identical to a WS 03 miss.

## §F ROLLBACK

Pre-production for the corpus path; the adapter is additive. Rollback = `git revert` the
06b commits (recorded baseline HEAD in §D). Because §2.1 is unchanged and the adapter
signature is unchanged, reverting leaves the rest of the program (WS 07/08/09) compiling and
running on the best-effort envelope exactly as before. The vendored `proto/antigravity.proto`
and generated module are inert if the adapter no longer imports them.

## §G POST-FLIGHT

1. **Full gate:** `npm run build && node test/adapter_antigravity.mjs && npm run test-redaction`
   all green; determinism check (Checkpoint 2) prints `true`; `FIDELITY` matches GATE 0.
2. **Backward-compat:** confirm `antigravityAdapter` still exports `{ harness, normalize }`
   with the same signature and `detect.ts` still routes `.db`/`.pb` → `antigravity`
   (unchanged in this spec).
3. **Update the program ledger** (separate, small doc commit):
   - In [SPEC_HIVE_CONTEXT_SESSIONS_00_PROGRAM](SPEC_HIVE_CONTEXT_SESSIONS_00_PROGRAM.md)
     §3, mark deferral **D1 RESOLVED** (note: `full` or `enhanced`, date, this spec).
   - In §9, set the WS 06 row note to reference 06b and the final fidelity level.
4. **Commit message template:**
   ```
   feat(adapters): Antigravity full-fidelity protobuf decode (HIVE_CONTEXT_SESSIONS D1)

   Resolves deferral D1. Recovers the Antigravity .proto schema via
   <gRPC reflection | embedded FileDescriptorSet | partial reconstruction>, decodes
   tool results (stdout/stderr/file content → tool_result events) and per-turn token
   counts (steps.metadata usage triple → tokens.in/out). Flips FIDELITY → '<full|enhanced>'.
   Closes the missing validate/assertPersistable gate (parity with claude-code adapter).
   Envelope schema §2.1 unchanged — additive within the frozen contract.

   Spec: docs/specs/SPEC_HIVE_CONTEXT_SESSIONS_06b_ANTIGRAVITY_FULL_DECODE.md
   ```
5. **Cold `/peer-review`** (master §8 per-workstream loop): a fresh agent, not the executor,
   reads the diff + `antigravity.ts` + the recovered `.proto` for inconsistency-class bugs
   (field-number mismatches, a `tool_result` that bypasses scrub, non-deterministic map
   emit). Revise until sign-off.
6. **On ship — archive THIS spec only:** `git mv docs/specs/SPEC_HIVE_CONTEXT_SESSIONS_06b_ANTIGRAVITY_FULL_DECODE.md docs/specs/archive/`.
   The `git mv` is the ship signal (no `STATUS:` field). Leave the `_artifacts/` decision
   record in place as the provenance breadcrumb.

## §H EXECUTOR HANDOFF

**Read first (in order):** (1) `src/adapters/antigravity.ts` end-to-end — the baseline you're
extending; (2) `src/adapters/claude-code.ts` *tail* — the validate/assertPersistable pattern
Phase 4 mirrors; (3) `src/adapters/types.ts` + `schema/envelope.schema.json` — proof that
`tool_result` and `tokens` are already legal (you are filling fields, not adding them).

**The one constraint most likely to trip you:** GATE 0 is a **hard blocker**. Do not write
Phase 2/3 decode against guessed field numbers — every `TOOL_RESULT_*`/`TOKENS_*` constant
must trace to `docs/specs/_artifacts/06b_fidelity_decision.md`. If the schema won't recover,
take the **ENHANCED** branch and label honestly; do **not** flip to `'full'` to make the test
read nicer. A wrong field number produces *plausible-but-wrong* output (the worst failure
class for a learning corpus) — that is why Phase 3's checkpoint sanity-checks token
magnitudes and Phase 2's checks result text against the real command.

**Most likely failure points + recovery:**
- *`pbjs`/`pbts` fights ESM `tsc`* → fall back to runtime `protobuf.loadSync` in a lazy
  singleton (Phase 1.2 note); the decode code in Phases 2–3 is identical either way.
- *Determinism check fails* → a `map<>` field is emitting in hash order; sort keys before
  attaching (§C caveat).
- *Token magnitudes implausible* → re-dump `steps.metadata` with the Phase 5 helper, re-map
  `TOKENS_*`; never ship numbers you can't sanity-check.
- *Schema validation throws after Phase 2* → most likely a `tool_result` with a non-string
  `text` or a `tool.name` that didn't decode to a string; guard with `?? null` / `'unknown'`.

**Worktree:** create in `cairn-mcp-server` (master §8). Do not touch `cairn-sessions/` or
`cairn/` except the §G step-3 ledger doc-commit and the §G step-6 archive `git mv`.

## §I REVIEW CHECKLIST (for the cold reviewer)

- [ ] Every `TOOL_RESULT_*` / `TOKENS_*` constant value is justified in
      `06b_fidelity_decision.md`; none left at the `0` placeholder on the FULL branch.
- [ ] `FIDELITY` value matches GATE 0 (`full` only if a real schema was recovered;
      `enhanced` for partial; never `full` on guesswork).
- [ ] `scrubEnvelope()` is the **last** transform before validate/assert in `normalize()`;
      no `tool_result` text reaches the envelope un-scrubbed (STEP 5.3 green).
- [ ] `validateEnvelope` + `assertPersistable` now run in `antigravity.ts` (D-fix-1 closed).
- [ ] Determinism check prints `true`; no `map<>` iteration-order leak.
- [ ] Envelope schema, `types.ts`, registry, `detect.ts`, and the other two adapters are
      untouched (additive-only / backward-compat).
- [ ] `npm run build`, `node test/adapter_antigravity.mjs`, `npm run test-redaction` all
      green; tool_result count > 0 and ≥1 assistant event has tokens (FULL) or ≥1 of the two
      (ENHANCED).
- [ ] Generated `antigravity_proto.{js,d.ts}` carry the "GENERATED — do not hand-edit"
      header and the regenerate command; `proto/antigravity.proto` committed in the same
      commit.

## §J OPEN QUESTIONS (resolve during execution, not blocking the draft)

1. **Does `language_server.exe agentapi` expose gRPC reflection at all?** Unknown until
   STEP 0.1 runs. If yes, FULL is clean; if no, weight shifts to the embedded-descriptor
   scan (0.2). The `.pbtxt` evidence says descriptors exist *somewhere*; whether they're
   reachable is the spike's job.
2. **Are call and result the same step or two steps?** The current adapter treats each tool
   step as call-only. Phase 2 assumes call+result co-reside in one payload (hence
   `extractToolResult(payload)` on the same buffer). If the spike finds results live in a
   *separate* step type, Phase 2.3 changes from "push two events per step" to "match a
   result step to its prior call step" — note this in `06b_fidelity_decision.md` and adjust.
3. **`tokens.total` vs `in+out`.** The envelope models only `in`/`out`. If the metadata
   gives only a total, leave `out` null and put total in… nowhere — prefer null over
   inventing a split. Confirm the triple is really {in,out,total} before trusting field 3.
