# Workflow: incident → MR (human reviews)

AI-native incident loop: logs → root cause → fix → open MR. The engineer reviews and adjusts; **nothing merges or deploys automatically**.

Use when an active production incident needs a code fix, not only a stakeholder update.

For investigate-only (no code change): stay on `workflows/production-incident.md`.

For the **PagerDuty → log export → clone → draft MR → page human** target (multi-stage CI), see
`knowledge/architecture/incident-pipeline.md`. This file is the interactive / same-brain playbook.

Local chaining without Jenkins/Airflow: **100% pull** multi-CJS —

`npm run incident:stage:a|b|c` (each stage pulls `communications/incidents/<ID>/`;
prompts chain between stages). See `knowledge/architecture/incident-pipeline.md`.

## Hard boundaries

| Allowed (with explicit human OK) | Never |
|----------------------------------|-------|
| Read logs/metrics via MCP / CLI the human already configured | Auto-merge MR/PR |
| Edit application checkouts the human named | Push to `main` / `master` / protected defaults |
| Create a fix branch + open draft or ready MR via `gh` | Send Chat/Slack/Jira/email |
| Draft incident notes under `communications/` | Invent log lines or stack traces |
| Stop after RCA if fix is unclear | Broad refactors unrelated to the incident |

Default: **draft PR** (`gh pr create --draft`) unless the human says ready-for-review.

## Phases (run as separate agent turns when quota is tight)

### 0 — Capture

1. Paste symptoms into `communications/inbox/` or the chat.
2. Note start time, severity, blast radius, incident ID (Jira/ServiceNow if any).
3. Skim `context/active-incidents.md`.

### 1 — Orient

1. Resolve services via `knowledge/service-registry.yaml`.
2. Skim `knowledge/services/<key>.md` + `knowledge/architecture/overview.md` (orientation only).
3. Confirm which sibling checkout(s) may be patched.

### 2 — Evidence (logs + recent change)

1. Pull **recent** logs/metrics for the window (Datadog / Cloud Logging / kubectl / … — whatever MCP/CLI is available).
2. Correlate with recent deploys, commits, and open PRs on affected services (`gh`, local git).
3. Output a short RCA candidate with cited evidence (log pointers, commit SHAs, config paths).
4. **Stop for human checkpoint** if blast radius or owning team is unclear.

### 3 — Fix (only after human OK on RCA)

1. Smallest change that addresses the evidenced cause.
2. Prefer one service / one PR unless the human authorizes a coordinated multi-repo fix.
3. Add or update a focused test when practical; say when not.
4. Do not drive-by cleanup.

### 4 — MR

1. Branch from the service default branch (state which).
2. Commit with a clear subject (no `Co-authored-by`, no AI attribution trailers).
3. `gh pr create --draft` (or ready if human asked) with Summary / Test plan / Rollback.
4. Print PR URL. **Do not merge.**

### 5 — Handoff

1. Update `context/active-incidents.md` or investigation notes if useful.
2. Optional: draft stakeholder / Jira text via compose prompts — human sends.
3. Human: review diff, adjust, mark ready, merge, deploy per team process.

## Prompt

Use `prompts/incident-to-mr.md` (mirrored under `.github/prompts/`).

Say which phase to run, e.g. `phase 2 only` or `phases 2–4 after I approve RCA`.

## Token tips

- One phase per turn when quota is low.
- Do not re-fetch the full log window after RCA is written — cite saved excerpts in `communications/investigations/`.
- Multi-repo: fix the primary service first; open follow-up MRs only if required and approved.
