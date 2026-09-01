#!/usr/bin/env node
/**
 * Stage B (pull): pull meta + logs from artifact dir; print agent prompt handoff.
 * Refuses to run if Stage A outputs are missing (pure pull gate).
 *
 *   npm run incident:stage:b -- --id INC-123
 */

const path = require("node:path");
const {
  ROOT,
  incidentDir,
  pullMeta,
  pullLogsPath,
  writeState,
  parseId,
} = require("./incident-pull-lib.cjs");

const id = parseId(process.argv.slice(2));
if (!id) {
  console.error("Usage: npm run incident:stage:b -- --id <INC>");
  process.exit(1);
}

let meta;
let logsPath;
try {
  meta = pullMeta(id);
  logsPath = pullLogsPath(id);
} catch (err) {
  console.error(String(err.message || err));
  console.error("Stage B pulls from Stage A artifacts — fix the folder, do not push.");
  process.exit(1);
}

writeState(id, "b-rca");
const rel = path.relative(ROOT, incidentDir(id));

console.log("Stage B pull OK");
console.log(`  meta:  incident=${meta.incident_id} trace=${meta.trace_id || "?"}`);
console.log(`  logs:  ${path.relative(ROOT, logsPath)}`);
console.log("");
console.log("Open a NEW agent turn and paste prompts/incident-to-mr.md");
console.log("Constraints:");
console.log("  Phase: 1-orient then 2-evidence (stop before fix)");
console.log(`  Artifact dir: ${rel}`);
console.log("  Write rca.md (and optional services.guess.json) into that dir");
console.log("");
console.log("When rca.md exists, run: npm run incident:stage:c -- --id " + id);
