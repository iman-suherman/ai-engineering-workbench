#!/usr/bin/env node
/**
 * Stage C (pull): pull rca.md; print agent prompt handoff for fix + draft MR.
 * Refuses if Stage B outputs missing.
 *
 *   npm run incident:stage:c -- --id INC-123
 */

const path = require("node:path");
const {
  ROOT,
  incidentDir,
  pullMeta,
  pullRca,
  writeState,
  parseId,
} = require("./incident-pull-lib.cjs");

const id = parseId(process.argv.slice(2));
if (!id) {
  console.error("Usage: npm run incident:stage:c -- --id <INC>");
  process.exit(1);
}

let meta;
let rcaPath;
try {
  meta = pullMeta(id);
  rcaPath = pullRca(id);
} catch (err) {
  console.error(String(err.message || err));
  console.error("Stage C pulls rca.md from Stage B — fix the folder, do not push.");
  process.exit(1);
}

writeState(id, "c-mr");
const rel = path.relative(ROOT, incidentDir(id));

console.log("Stage C pull OK");
console.log(`  meta: ${meta.incident_id}`);
console.log(`  rca:  ${path.relative(ROOT, rcaPath)}`);
console.log("");
console.log("Approve RCA first, then NEW agent turn: prompts/incident-to-mr.md");
console.log("Constraints:");
console.log("  Phase: 3-fix then 4-mr");
console.log(`  Artifact dir: ${rel}`);
console.log("  Draft PR only — do not merge");
console.log("  Write pr-url.txt into the artifact dir when done");
console.log("");
console.log("Human then merges; existing CD deploys. Mark done via:");
console.log(`  npm run incident:chain -- advance --id ${id} --to done`);
