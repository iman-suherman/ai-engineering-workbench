#!/usr/bin/env node
/**
 * Stage A (pull): ensure incident folder + meta; remind operator to export logs.
 * Does not push to Stage B — Stage B pulls logs when ready.
 *
 *   npm run incident:stage:a -- --id INC-123 [--trace TRACE]
 */

const path = require("node:path");
const {
  ROOT,
  ensureDir,
  writeJson,
  writeState,
  parseId,
  pullMeta,
} = require("./incident-pull-lib.cjs");

function parse(argv) {
  const out = { id: parseId(argv), trace: "", window: "" };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--trace" && argv[i + 1]) out.trace = argv[++i];
    if (argv[i] === "--window" && argv[i + 1]) out.window = argv[++i];
  }
  return out;
}

const { id, trace, window } = parse(process.argv.slice(2));
if (!id) {
  console.error("Usage: npm run incident:stage:a -- --id <INC> [--trace <id>] [--window <iso/iso>]");
  process.exit(1);
}

const dir = ensureDir(id);
const metaPath = path.join(dir, "meta.json");
let meta;
try {
  meta = pullMeta(id);
} catch {
  meta = {
    incident_id: id,
    trace_id: trace || "",
    window: window || "",
    created_at: new Date().toISOString(),
    pull: true,
  };
  writeJson(metaPath, meta);
}

if (trace) meta.trace_id = trace;
if (window) meta.window = window;
meta.updated_at = new Date().toISOString();
writeJson(metaPath, meta);
writeState(id, "a-export");

console.log(`Stage A ready (pull sink): ${path.relative(ROOT, dir)}`);
console.log(`trace_id: ${meta.trace_id || "(set --trace)"}`);
console.log("Pull logs HERE (jsonl|csv|txt), then run: npm run incident:stage:b -- --id " + id);
console.log("Nothing is pushed to B — B will pull this folder.");
