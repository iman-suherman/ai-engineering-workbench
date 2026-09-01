/**
 * Shared pull-architecture helpers for incident stages.
 * Each stage CJS pulls from communications/incidents/<id>/ — nothing is pushed
 * between processes except files on disk (or a bucket mirroring that tree).
 */

const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const ARTIFACT_ROOT = path.join(ROOT, "communications", "incidents");

const LOG_NAMES = ["logs.jsonl", "logs.csv", "logs.txt"];

function incidentDir(id) {
  if (!id) throw new Error("incident id required");
  return path.join(ARTIFACT_ROOT, id);
}

function ensureDir(id) {
  const dir = incidentDir(id);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, obj) {
  fs.writeFileSync(filePath, `${JSON.stringify(obj, null, 2)}\n`, "utf8");
}

function pullMeta(id) {
  const p = path.join(incidentDir(id), "meta.json");
  if (!fs.existsSync(p)) {
    throw new Error(`pull failed: missing meta.json under ${path.relative(ROOT, incidentDir(id))}`);
  }
  return readJson(p);
}

function pullLogsPath(id) {
  const dir = incidentDir(id);
  for (const name of LOG_NAMES) {
    const p = path.join(dir, name);
    if (fs.existsSync(p)) return p;
  }
  throw new Error(
    `pull failed: need one of ${LOG_NAMES.join("|")} under ${path.relative(ROOT, dir)}`
  );
}

function pullRca(id) {
  const p = path.join(incidentDir(id), "rca.md");
  if (!fs.existsSync(p)) {
    throw new Error(`pull failed: missing rca.md under ${path.relative(ROOT, incidentDir(id))}`);
  }
  return p;
}

function pullPrUrl(id) {
  const p = path.join(incidentDir(id), "pr-url.txt");
  if (!fs.existsSync(p)) {
    throw new Error(`pull failed: missing pr-url.txt under ${path.relative(ROOT, incidentDir(id))}`);
  }
  return fs.readFileSync(p, "utf8").trim();
}

function writeState(id, stage) {
  const dir = ensureDir(id);
  const p = path.join(dir, "chain-state.json");
  const prev = fs.existsSync(p) ? readJson(p) : {};
  writeJson(p, {
    ...prev,
    incident_id: id,
    stage,
    updated_at: new Date().toISOString(),
    architecture: "pull",
  });
}

function parseId(argv) {
  let id = "";
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--id" && argv[i + 1]) id = argv[++i];
  }
  return id;
}

module.exports = {
  ROOT,
  ARTIFACT_ROOT,
  LOG_NAMES,
  incidentDir,
  ensureDir,
  readJson,
  writeJson,
  pullMeta,
  pullLogsPath,
  pullRca,
  pullPrUrl,
  writeState,
  parseId,
};
