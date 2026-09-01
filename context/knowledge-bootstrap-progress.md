# knowledge-bootstrap-progress

Resumable queue for token-efficient knowledge setup.
Agents: read this file first; process **one** `pending` unit per run; then stop.

## Status

| Field | Value |
|-------|-------|
| Last updated | — |
| Mode | idle |
| Notes | Run `prompts/bootstrap-knowledge-plan.md` once, then `prompts/bootstrap-knowledge-unit.md` repeatedly. |

## Queue

<!-- status: pending | done | skipped | blocked -->

| # | service_key | local_path | status | notes |
|---|-------------|------------|--------|-------|
| 1 | _(run plan first)_ | | pending | |

## Done log

<!-- Append one line per completed unit: date, key, files written -->

-

## Rules (do not delete)

1. One unit per agent turn unless the human explicitly says "batch N".
2. Never re-scan a `done` path in the same bootstrap cycle.
3. If tokens/quota are low: finish the current unit's writes, mark status, stop.
4. Prefer shallow reads — see unit prompt budget.
5. Overall architecture is a **separate** pass (`prompts/bootstrap-architecture-overview.md`) after units — do not fold it into unit turns.
