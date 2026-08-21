#!/usr/bin/env bash
# Bootstrap an investigation report from a request.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUTPUT_DIR="$ROOT/communications/investigations"
REGISTRY="$ROOT/knowledge/service-registry.yaml"

usage() {
  cat <<'USAGE'
Usage: npm run start -- [options]

Options:
  --request <text>         Enquiry text
  --request-file <path>    File with enquiry text
  --types <csv>            Hint types: auto,investigate,security,jira,incident,support
  --output-dir <path>      Output folder (default: communications/investigations)
  --explain-pipeline       Print how the workbench flow works
  --help                   Show help

Examples:
  npm run start -- --request "Can we ship the gateway change for checkout?"
  npm run start -- --request-file communications/inbox/EXAMPLE-gateway-check.md
  npm run start -- --explain-pipeline
USAGE
}

request_text=""
request_file=""
types_csv="auto"
explain=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --help|-h) usage; exit 0 ;;
    --request) request_text="${2:-}"; shift 2 ;;
    --request-file) request_file="${2:-}"; shift 2 ;;
    --types) types_csv="${2:-auto}"; shift 2 ;;
    --output-dir) OUTPUT_DIR="${2:-}"; shift 2 ;;
    --explain-pipeline) explain=1; shift ;;
    --google-chat) request_text="${2:-}"; shift 2 ;;
    --google-chat-file) request_file="${2:-}"; shift 2 ;;
    *) echo "Unknown option: $1" >&2; usage; exit 1 ;;
  esac
done

if [[ "$explain" -eq 1 ]]; then
  cat <<'EXPLAIN'
Pipeline walkthrough
====================

1. Capture the enquiry (Chat paste, inbox file, or --request).
2. Resolve names via knowledge/service-registry.yaml (navigation only).
3. Investigate LIVE repos (sibling checkouts + gh): commits, PRs, branches.
4. Structure Finding / Evidence / Risk / Recommendation (prompts/investigate.md).
5. Optional: compose a stakeholder draft (prompts/compose-*.md).
6. Human reviews and copy/pastes. Nothing is sent automatically.

Truth hierarchy: live repos > live infra > curated knowledge > chat memory.
EXPLAIN
  exit 0
fi

if [[ -z "$request_text" && -n "$request_file" ]]; then
  request_text="$(cat "$request_file")"
fi

if [[ -z "$request_text" ]]; then
  newest="$(ls -t "$ROOT"/communications/inbox/*.{md,txt} 2>/dev/null | head -1 || true)"
  if [[ -n "${newest:-}" ]]; then
    request_text="$(cat "$newest")"
    echo "Using inbox file: $newest"
  else
    echo "No request provided. Use --request, --request-file, or add a file under communications/inbox/." >&2
    exit 1
  fi
fi

mkdir -p "$OUTPUT_DIR"
stamp="$(date +%Y%m%d-%H%M%S)"
summary="$OUTPUT_DIR/start-${stamp}-summary.md"
report="$OUTPUT_DIR/start-${stamp}-request-001-investigate.md"

hints=""
if [[ -f "$REGISTRY" ]]; then
  while IFS= read -r key; do
    if grep -qiE "(^|[^a-z0-9-])${key}([^a-z0-9-]|$)" <<<"$request_text"; then
      hints+="- ${key}"$'\n'
    fi
  done < <(awk '/^  [a-z0-9-]+:/{gsub(":","",$1); print $1}' "$REGISTRY")
fi
[[ -z "$hints" ]] && hints="(none auto-detected — resolve via registry manually)"$'\n'

{
  echo "# Enquiry summary — ${stamp}"
  echo
  echo "**Types:** ${types_csv}"
  echo
  echo "## Request"
  echo
  echo '```text'
  printf '%s\n' "$request_text"
  echo '```'
  echo
  echo "## Registry hints"
  echo
  printf '%s\n' "$hints"
  echo
  echo "## Next steps"
  echo
  echo "1. Open \`communications/investigations/start-${stamp}-request-001-investigate.md\`"
  echo "2. Follow \`prompts/investigate.md\` against **live** repos"
  echo "3. Optional compose with \`prompts/compose-chat-response.md\`"
} > "$summary"

{
  echo "# Investigation — ${stamp}"
  echo
  echo "## Request"
  echo
  echo '```text'
  printf '%s\n' "$request_text"
  echo '```'
  echo
  echo "## Agent steps"
  echo
  echo "1. Read \`AGENTS.md\` and \`.github/copilot-instructions.md\`"
  echo "2. Resolve services via \`knowledge/service-registry.yaml\`"
  echo "3. Inspect sibling checkouts and \`gh\` for commits/PRs"
  echo "4. Fill the output template below with evidence"
  echo
  echo "## Output template"
  echo
  echo '```text'
  echo "Finding:"
  echo "Evidence:"
  echo "Affected services:"
  echo "Conflicting development:"
  echo "Implementation:"
  echo "Risk:"
  echo "Recommended action:"
  echo "Can requested deadline be met:"
  echo "Communication points:"
  echo '```'
  echo
  echo "## Compose handoff (after evidence exists)"
  echo
  echo "Use \`prompts/compose-chat-response.md\` with the filled template. Human reviews before sending."
} > "$report"

echo "Wrote:"
echo "  $summary"
echo "  $report"
