# Workflow: bootstrap knowledge (token-effective)

Use when setting up the workbench against real sibling repos without burning a whole quota in one shot.

## Why units

A single "scan everything and write all knowledge" run fails halfway when tokens run out — partial YAML and half-written notes are painful to untangle. Plan once, then one service per turn. Overall architecture is a **separate** pass so it does not inflate every unit.

## Steps

1. **Plan (cheap)** — paste `prompts/bootstrap-knowledge-plan.md`.
   - Writes queue to `context/knowledge-bootstrap-progress.md`.
   - No deep scans.
2. **Human trim** — drop repos you do not investigate; rename keys.
3. **Unit loop** — paste `prompts/bootstrap-knowledge-unit.md` (new turn each time, or `batch N` if quota allows).
   - Upserts one registry entry + `knowledge/services/<key>.md`.
   - Captures **internal architecture** for that service only (shallow).
   - Marks `done` in the progress file.
   - Does **not** write the estate-wide overview.
4. **Stop anytime** — next turn resumes from next `pending`.
5. **Overall architecture (separate prompt)** — when enough units are done, paste
   `prompts/bootstrap-architecture-overview.md`.
   - Reads only `knowledge/services/*.md` + registry (no sibling re-scan).
   - Writes `knowledge/architecture/overview.md`.
6. **Optional later** — Terraform/Helm enrichment via `prompts/fill-service-registry-from-infra.md` for gaps only.
7. **Smoke test** — one real enquiry with `prompts/investigate.md`.

## Token budget heuristics

| Pass | Target |
|------|--------|
| Plan | Folder list + light README skims |
| Unit | ≤8 files per service + short Internal architecture |
| Overview | Knowledge files only — no repo crawl |
| Default batch | 1 unit / turn |
| Explicit batch | `batch 2` or `batch 3` only when quota is comfortable |

## Done when

- Queue has no `pending` (or remaining are `skipped` / `blocked`).
- Registry keys match how the team names services in Chat.
- `knowledge/architecture/overview.md` reflects connected service notes (not sample fiction).
- At least one multi-repo investigation resolves the right `local_path`.

Failure-mode checklist (quota mid-setup, etc.): `knowledge/architecture/dogfood-failure-modes.md`.
