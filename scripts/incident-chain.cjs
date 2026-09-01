#!/usr/bin/env node
/**
 * Local incident stage chain (no Jenkins/Airflow required).
 *
 * Chains A → B → C via an on-disk artifact folder. Each stage is a prompt
 * (or a future worker). CJS only prepares state and tells you which prompt
 * to run next — token-safe, resumable if a chat dies mid-quota.
 *
 * Usage:
 *   npm run incident:chain -- init --id INC-123 --trace TRACE
 *   npm run incident:chain -- status --id INC-123
 *   npm run incident:chain -- next --id INC-123
 *   npm run incident:chain -- advance --id INC-123 --to b-rca
 *   npm run incident:chain -- advance --id INC-123 --to c-mr
 *   npm run incident:chain -- advance --id INC-123 --to done
 *
 * Stages: a-export → b-rca → c-mr → done
 */

const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const ARTIFACT_ROOT = path.join(ROOT, "communications", "incidents");

const STAGES = [
  {
    id: "a-export",
    title: "Stage A — Trace + log export",
    prompt: null,
    expects: ["meta.json"],
    writesHint: "logs.jsonl (or logs.csv / logs.txt) + meta.json",
    note: "Export logs by trace_id (CLI/MCP). No model required.",
  },
  {
    id: "b-rca",
    title: "Stage B — Scope + clone + RCA",
    prompt: "prompts/incident-to-mr.md",
    phaseHint: "Phase: 1-orient then 2-evidence (stop before fix)",
    expects: ["logs.jsonl", "logs.csv", "logs.txt"],
    expectAny: true,
    writesHint: "rca.md + optional services.guess.json",
    note: "Paste incident-to-mr with Phase 1–2 only; point at this artifact dir.",
  },
  {
    id: "c-mr",
    title: "Stage C — Patch + draft MR + notify human",
    prompt: "prompts/incident-to-mr.md",
    phaseHint: "Phase: 3-fix then 4-mr (after you approve RCA)",
    expects: ["rca.md"],
    writesHint: "pr-url.txt",
    note: "Draft PR only — do not merge. Notify human out-of-band if needed.",
  },
  {
    id: "done",
    title: "Done — human owns merge/CD",
    prompt: null,
    expects: ["pr-url.txt"],
    writesHint: "—",
    note: "Human reviews MR, merges, existing CD deploys.",
  },
];

function usage() {
  console.log(`Usage:
  npm run incident:chain -- init --id <INC> [--trace <id>] [--window <iso/iso>]
  npm run incident:chain -- status --id <INC>
  npm run incident:chain -- next --id <INC>
  npm run incident:chain -- advance --id <INC> --to <a-export|b-rca|c-mr|done>

Artifacts live under communications/incidents/<INC>/
Playbook: knowledge/architecture/incident-pipeline.md
`);
}

function parseArgs(argv) {
  const out = { cmd: "", id: "", trace: "", window: "", to: "" };
  out.cmd = argv[0] || "";
  for (let i = 1; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--id" && argv[i + 1]) out.id = argv[++i];
    else if (a === "--trace" && argv[i + 1]) out.trace = argv[++i];
    else if (a === "--window" && argv[i + 1]) out.window = argv[++i];
    else if (a === "--to" && argv[i + 1]) out.to = argv[++i];
    else if (a === "-h" || a === "--help") out.cmd = "help";
  }
  return out;
}

function incidentDir(id) {
  return path.join(ARTIFACT_ROOT, id);
}

function statePath(id) {
  return path.join(incidentDir(id), "chain-state.json");
}

function readState(id) {
  const p = statePath(id);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function writeState(id, state) {
  const dir = incidentDir(id);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(statePath(id), `${JSON.stringify(state, null, 2)}\n`, "utf8");
}

function stageById(id) {
  return STAGES.find((s) => s.id === id);
}

function hasAny(dir, names) {
  return names.some((n) => fs.existsSync(path.join(dir, n)));
}

function hasAll(dir, names) {
  return names.every((n) => fs.existsSync(path.join(dir, n)));
}

function cmdInit({ id, trace, window }) {
  if (!id) {
    console.error("Missing --id");
    process.exit(1);
  }
  const dir = incidentDir(id);
  fs.mkdirSync(dir, { recursive: true });
  const meta = {
    incident_id: id,
    trace_id: trace || "",
    window: window || "",
    created_at: new Date().toISOString(),
  };
  fs.writeFileSync(path.join(dir, "meta.json"), `${JSON.stringify(meta, null, 2)}\n`);
  const readme = `# Incident artifact — ${id}

Local prompt chain (CJS). Advance stages after each prompt finishes.

1. Fill logs (Stage A): export by trace_id → logs.jsonl|csv|txt
2. \`npm run incident:chain -- advance --id ${id} --to b-rca\`
3. Run prompts/incident-to-mr.md phases 1–2 against this folder → rca.md
4. \`npm run incident:chain -- advance --id ${id} --to c-mr\`
5. Run incident-to-mr phases 3–4 → pr-url.txt (draft only)
6. \`npm run incident:chain -- advance --id ${id} --to done\`

See knowledge/architecture/incident-pipeline.md
`;
  fs.writeFileSync(path.join(dir, "README.md"), readme);
  writeState(id, {
    incident_id: id,
    stage: "a-export",
    updated_at: new Date().toISOString(),
  });
  console.log(`Initialized ${path.relative(ROOT, dir)}`);
  console.log("Next: export logs into this folder, then:");
  console.log(`  npm run incident:chain -- next --id ${id}`);
}

function cmdStatus(id) {
  const state = readState(id);
  if (!state) {
    console.error(`No chain for ${id}. Run init first.`);
    process.exit(1);
  }
  const stage = stageById(state.stage);
  const dir = incidentDir(id);
  console.log(`Incident: ${id}`);
  console.log(`Stage:    ${state.stage} — ${stage ? stage.title : "?"}`);
  console.log(`Updated:  ${state.updated_at}`);
  console.log(`Dir:      ${path.relative(ROOT, dir)}`);
  if (stage) {
    console.log(`Expects:  ${stage.writesHint}`);
    console.log(`Note:     ${stage.note}`);
    if (stage.prompt) {
      console.log(`Prompt:   ${stage.prompt}`);
      if (stage.phaseHint) console.log(`Hint:     ${stage.phaseHint}`);
    }
  }
}

function cmdNext(id) {
  cmdStatus(id);
  const state = readState(id);
  const stage = stageById(state.stage);
  const dir = incidentDir(id);
  if (!stage || stage.id === "done") {
    console.log("\nChain complete (or unknown). Human owns merge/CD.");
    return;
  }
  console.log("\n--- What to do now ---");
  if (stage.id === "a-export") {
    console.log("1. Query log platform by trace_id from meta.json");
    console.log("2. Write logs.jsonl (or csv/txt) into the artifact dir");
    console.log(`3. npm run incident:chain -- advance --id ${id} --to b-rca`);
  } else if (stage.prompt) {
    console.log(`1. Open a NEW agent turn (quota-safe)`);
    console.log(`2. Paste ${stage.prompt}`);
    console.log(`3. Set ${stage.phaseHint}`);
    console.log(`4. Point the agent at ${path.relative(ROOT, dir)}`);
    console.log(`5. When outputs exist (${stage.writesHint}):`);
    const idx = STAGES.findIndex((s) => s.id === stage.id);
    const next = STAGES[idx + 1];
    if (next) {
      console.log(`   npm run incident:chain -- advance --id ${id} --to ${next.id}`);
    }
  }
}

function cmdAdvance(id, to) {
  if (!stageById(to)) {
    console.error(`Unknown stage ${to}`);
    process.exit(1);
  }
  const state = readState(id);
  if (!state) {
    console.error(`No chain for ${id}. Run init first.`);
    process.exit(1);
  }
  const dir = incidentDir(id);
  const current = stageById(state.stage);
  if (current && current.id !== "done" && current.expects?.length) {
    const ok = current.expectAny
      ? hasAny(dir, current.expects) || hasAll(dir, ["meta.json"])
      : hasAll(dir, current.expects);
    // Soft check when leaving a-export: need some log file
    if (current.id === "a-export" && to !== "a-export") {
      if (!hasAny(dir, ["logs.jsonl", "logs.csv", "logs.txt"])) {
        console.error("Stage A incomplete: add logs.jsonl|csv|txt before advance.");
        process.exit(1);
      }
    }
    if (current.id === "b-rca" && to === "c-mr") {
      if (!fs.existsSync(path.join(dir, "rca.md"))) {
        console.error("Stage B incomplete: need rca.md before advance to c-mr.");
        process.exit(1);
      }
    }
    if (current.id === "c-mr" && to === "done") {
      if (!fs.existsSync(path.join(dir, "pr-url.txt"))) {
        console.error("Stage C incomplete: need pr-url.txt before done.");
        process.exit(1);
      }
    }
    void ok;
  }
  writeState(id, {
    incident_id: id,
    stage: to,
    updated_at: new Date().toISOString(),
    previous_stage: state.stage,
  });
  console.log(`Advanced ${id}: ${state.stage} → ${to}`);
  cmdNext(id);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.cmd || args.cmd === "help") {
    usage();
    process.exit(args.cmd === "help" ? 0 : 1);
  }
  if (args.cmd === "init") return cmdInit(args);
  if (!args.id) {
    console.error("Missing --id");
    process.exit(1);
  }
  if (args.cmd === "status") return cmdStatus(args.id);
  if (args.cmd === "next") return cmdNext(args.id);
  if (args.cmd === "advance") {
    if (!args.to) {
      console.error("Missing --to");
      process.exit(1);
    }
    return cmdAdvance(args.id, args.to);
  }
  console.error(`Unknown command: ${args.cmd}`);
  usage();
  process.exit(1);
}

main();
