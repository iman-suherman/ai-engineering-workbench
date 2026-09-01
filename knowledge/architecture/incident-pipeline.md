# Target architecture: PagerDuty → log pipeline → fix MR → human

Product direction for the AI-native incident loop. Complements the interactive
playbook `workflows/incident-to-mr.md` (engineer-driven in Cursor/Codex).

Human still **reviews, edits, and merges**. Pipelines never merge to `main` or deploy.

```text
PagerDuty
    │  (1) trigger webhook / Events API → orchestration pipeline
    v
Stage A — Trace + log export
    │  extract trace_id (and time window, service hints)
    │  query log platform by trace_id
    │  export artifact: json | csv | plaintext (+ metadata)
    v
Stage B — Scope + clone + RCA
    │  parse artifact → candidate service names
    │  map via service-registry.yaml (and knowledge/services/*)
    │  shallow clone related repos (pinned default branch / SHA if known)
    │  agent/job: correlate logs ↔ code → RCA + fix plan
    v
Stage C — Patch + MR + page human
    │  new branch, minimal patch, tests if cheap
    │  open draft MR/PR on GitHub or GitLab (never merge)
    │  notify on-call / owning engineer (PagerDuty note, Slack, GitLab mention, …)
    v
Human
    │  review, adjust, approve, merge
    v
Existing CD
    deploy via normal GitHub/GitLab pipelines (unchanged)
```

## Step mapping

| Your step | Pipeline stage | Inputs | Outputs | Workbench role |
|-----------|----------------|--------|---------|----------------|
| 1. PagerDuty → pipeline | Orchestrator entry | Incident ID, urgency, payload | Run id, normalized event | Optional: write `context/active-incidents.md` stub |
| 2. Trace → log export | Stage A | `trace_id`, window | Log artifact (json/csv/txt) + query used | None (platform-specific job) |
| 3. Services + clone + check logs | Stage B | Artifact, registry | Checkout dir(s), RCA note | **Registry + architecture knowledge**; same RCA shape as `prompts/incident-to-mr.md` phase 2 |
| 4. Patch branch + MR + call human | Stage C | RCA, checkouts | Draft MR URL, notify | Agent fix rules from incident-to-mr phases 3–4; notify is **outside** open-source “never auto-send” default (dedicated runner secrets) |
| 5. Human review → merge → CD | Human + existing CI | MR | Merged main → deploy | Human owns merge; CD stays as today |

## Why split pipelines

- **Token / failure isolation** — Stage A can succeed and cache the log file if Stage B OOMs or the model quota dies.
- **Least privilege** — Stage A needs log-store credentials only; Stage C needs git write + MR API only.
- **Replay** — Re-run B/C from the same artifact without re-hitting the log vendor.
- **Matches unitized bootstrap lesson** — big one-shot runs are fragile; staged artifacts are resumable.

## Artifact contract (suggested)

Pass a single directory or object-store prefix between stages, e.g.:

```text
incident-<id>/
  event.json          # pagerduty payload (redacted)
  meta.json           # trace_id, window_start, window_end, source
  logs.jsonl          # or logs.csv / logs.txt
  services.guess.json # optional pre-parse of service names from log lines
  rca.md              # written by Stage B
  pr-url.txt          # written by Stage C
```

Keep PII / secrets out of artifacts that land in public forks. Prefer private bucket + short TTL.

## Service name resolution

Order of preference in Stage B:

1. Explicit service fields in log labels / resource attributes.
2. Matches against `knowledge/service-registry.yaml` keys, `repo`, and `tags`.
3. Heuristics from logger names / K8s workload (record as low confidence).
4. If ambiguous → **draft MR skipped**; notify human with candidates only.

Do not clone the whole org. Cap clones (e.g. top 1–3 services by confidence).

## Boundaries (non-negotiable for v1)

- Draft MR/PR only; **no auto-merge**, no push to default branch.
- No deploy from the AI pipeline; existing main→prod pipelines stay authoritative.
- No invented logs — if the query returns empty, fail the stage with the exact query.
- Patch scope = minimal fix for evidenced cause; no drive-by refactors.
- Notify human with MR link + RCA summary; do not silently page the whole company.

## Interactive vs automated

| Mode | When | Entry |
|------|------|--------|
| Interactive | Engineer already in Cursor/Codex with the incident | `workflows/incident-to-mr.md` |
| Automated | PagerDuty fires, want async draft MR | This architecture (CI/CD or worker + agent) |

Same RCA/fix/MR **prompt contract**; different trigger and packaging.

## Build order (practical)

1. **Stage A only** — PagerDuty webhook → extract `trace_id` → export logs to artifact (no AI). Prove signal quality.
2. **Stage B read-only** — artifact + registry → RCA markdown + service list (no clone write, no MR).
3. **Stage C draft MR** — one service, draft PR, notify one human.
4. Harden: multi-service, GitLab + GitHub, confidence gates, redaction, quotas.

Workbench open-source today covers the **prompt/workflow brain** for B/C interactive use. Automated Stage A–C runners are Team/Enterprise or in-house CI glued to this repo’s prompts and registry.

## Related

- Playbook: `workflows/incident-to-mr.md`
- Prompt: `prompts/incident-to-mr.md`
- Registry: `knowledge/service-registry.yaml`
- Setup overview: `knowledge/setup-and-integrations.md`
