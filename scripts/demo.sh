#!/usr/bin/env bash
# Self-serve demo — bootstrap a sample investigation you can run in Cursor/Copilot.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SCENARIO="$ROOT/examples/demo-scenario.md"
CURSOR_PROMPT="$ROOT/examples/demo-cursor-prompt.md"
OUTPUT_DIR="$ROOT/communications/investigations/demo"
WORKFLOW="$ROOT/workflows/try-demo.md"

usage() {
  cat <<'USAGE'
Usage: npm run demo [-- options]

Self-serve trial of AI Engineering Workbench with a fictional checkout scenario.
Scaffolds investigation files and prints next steps for Cursor/Copilot.

Options:
  --explain          Print the demo walkthrough without creating files
  --quick            Minimal output (paths only)
  --skip-bootstrap   Show steps only; do not write investigation files
  --help             Show help

Related:
  npm run start:explain     Full workbench pipeline walkthrough
  workflows/try-demo.md     Detailed demo playbook

Examples:
  npm run demo
  npm run demo -- --explain
  npm run demo -- --quick
USAGE
}

explain=0
quick=0
skip_bootstrap=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --help|-h) usage; exit 0 ;;
    --explain) explain=1; shift ;;
    --quick) quick=1; shift ;;
    --skip-bootstrap) skip_bootstrap=1; shift ;;
    *) echo "Unknown option: $1" >&2; usage; exit 1 ;;
  esac
done

print_explain() {
  cat <<'EXPLAIN'
Self-serve demo walkthrough
===========================

What this is
  A hands-on trial you run locally in Cursor or Copilot — not a live call.
  Uses a fictional checkout platform (checkout-api, edge-gateway, payments-api).

What npm run demo does
  1. Reads examples/demo-scenario.md (sample engineer enquiry).
  2. Scaffolds investigation files under communications/investigations/demo/.
  3. Points you at examples/demo-cursor-prompt.md to paste into your agent.

Your steps after npm run demo
  1. Open the repo root in Cursor (or use Copilot with AGENTS.md).
  2. Open the generated *-investigate.md file.
  3. Paste examples/demo-cursor-prompt.md into Chat — or use prompts/investigate.md.
  4. Review Finding / Evidence / Risk / Recommendation.
  5. Optional: compose a stakeholder draft with prompts/compose-chat-response.md.

Truth hierarchy (same as production use)
  Live repos > live infra > curated knowledge > chat memory.

Live demo with Iman
  https://workbench.suherman.net/contact?intent=live-demo
EXPLAIN
}

if [[ "$explain" -eq 1 ]]; then
  print_explain
  exit 0
fi

if [[ ! -f "$SCENARIO" ]]; then
  echo "Missing demo scenario: $SCENARIO" >&2
  exit 1
fi

if [[ "$quick" -eq 0 ]]; then
  cat <<'BANNER'

  AI Engineering Workbench — self-serve demo
  ==========================================
  Fictional checkout scenario · ~10–20 minutes · Cursor or Copilot

BANNER
fi

summary=""
report=""

if [[ "$skip_bootstrap" -eq 0 ]]; then
  if [[ "$quick" -eq 0 ]]; then
    echo "→ Scaffolding investigation files..."
  fi
  bash "$ROOT/scripts/start.sh" \
    --request-file "$SCENARIO" \
    --output-dir "$OUTPUT_DIR" \
    --types "investigate"

  summary="$(ls -t "$OUTPUT_DIR"/start-*-summary.md 2>/dev/null | head -1 || true)"
  report="$(ls -t "$OUTPUT_DIR"/start-*-request-001-investigate.md 2>/dev/null | head -1 || true)"

  if [[ -z "$summary" || -z "$report" ]]; then
    echo "Demo bootstrap failed — no investigation files written." >&2
    exit 1
  fi
fi

relpath() {
  local path="$1"
  if [[ "$path" == "$ROOT"/* ]]; then
    echo "${path#"$ROOT"/}"
  else
    echo "$path"
  fi
}

if [[ "$quick" -eq 1 ]]; then
  [[ -n "$report" ]] && echo "$(relpath "$report")"
  echo "$(relpath "$CURSOR_PROMPT")"
  echo "$(relpath "$WORKFLOW")"
  exit 0
fi

cat <<STEPS

Next steps
----------

  1. Open this folder in Cursor (or your Copilot-enabled editor).

  2. Read the generated investigation scaffold:
       $(relpath "$report")

  3. Paste this prompt into Cursor Chat:
       $(relpath "$CURSOR_PROMPT")

     Or tell the agent: "Follow AGENTS.md and prompts/investigate.md for the
     demo enquiry in $(relpath "$report")."

  4. Review the agent output (Finding / Evidence / Risk / Recommendation).
     Nothing is sent or changed automatically.

  5. Optional — draft a stakeholder reply:
       prompts/compose-chat-response.md

Registry (fictional services for this demo):
  knowledge/service-registry.yaml

Full playbook:
  $(relpath "$WORKFLOW")

Want a guided live session instead?
  https://workbench.suherman.net/contact?intent=live-demo

STEPS

if [[ -n "$summary" ]]; then
  echo "Files written:"
  echo "  $(relpath "$summary")"
  echo "  $(relpath "$report")"
  echo
fi
