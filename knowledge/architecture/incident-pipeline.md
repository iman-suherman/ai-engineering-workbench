# Incident automation: pull (default) vs push (paid)

Complements the interactive playbook `workflows/incident-to-mr.md`.
Human still **reviews, edits, and merges**. Nothing auto-merges or deploys.

Two product modes — same stage brain (A log → B RCA → C draft MR), different **trigger**:

| Mode | Who starts it | Runtime | Availability |
|------|---------------|---------|--------------|
| **100% pull** | Human at 3am | Docker **up locally**; engineer pastes PagerDuty incident id; CJS retrieves context itself | Open source (default) |
| **100% push** | PagerDuty | Docker **lives as a service**; PD webhook hits a configurable endpoint; endpoint runs the rest | **Paying (Team/Enterprise)** |

Between stages, work still flows through the **artifact folder** (pull gates). “Push” means the *incident trigger*, not a spaghetti in-memory bus.

---

## Mode 1 — 100% pull (open source default)

**Story:** on-call wakes up, brings the workbench stack up in Docker on their laptop, gives a PagerDuty id, walks away while CJS pulls context.

```text
Human (03:00)
  │  docker compose up   (local)
  │  npm run incident:stage:a -- --id <PAGERDUTY_ID>
  v
CJS pulls from PagerDuty API → meta + trace hints
  │  pulls logs by trace_id → logs.*
  v
stage-b pulls logs → agent RCA → rca.md
  │
stage-c pulls rca → agent draft MR → pr-url.txt
  │
Human reviews MR → merge → existing CD
```

```bash
# local docker already up
npm run incident:stage:a -- --id PAGERDUTY-INCIDENT-ID
# CJS retrieves PD context + prepares sink; export/pull logs into the folder
npm run incident:stage:b -- --id PAGERDUTY-INCIDENT-ID
npm run incident:stage:c -- --id PAGERDUTY-INCIDENT-ID
```

No always-on webhook. No public endpoint. Engineer opts in per incident.

---

## Mode 2 — 100% push (paying customers)

**Story:** Docker image runs as a long-lived service. In PagerDuty, configure an extension/webhook URL pointing at that service. On alert, PD **hits** the endpoint; the service runs Stage A→B→C and pages/notifies the human with the draft MR link.

```text
PagerDuty alert
  │  HTTPS POST  /hooks/pagerduty   (configurable URL)
  v
Always-on Docker service (paid)
  │  write event → write event.json + meta.json
  │  run stage A (pull logs)
  │  run stage B (RCA agent/job)
  │  run stage C (draft MR)
  │  notify on-call (PD note / Slack / …)
  v
Human reviews MR → merge → existing CD
```

Requirements (paid pack — not in open-source defaults):

- Stable ingress + auth on the webhook (shared secret / PD signature).
- Secrets for PD, log vendor, git, model API.
- Concurrency limits and redaction.
- Same artifact contract under the hood so pull-mode debugging still works.

Airflow / Jenkins remain optional **schedulers** around the same stages; the paid differentiator Andre named is the **always-on Docker + PD endpoint (push trigger)**.

---

## Shared stage contract (both modes)

```text
communications/incidents/<id>/   (or bucket mirror)
  event.json          # PD payload (push mode writes; pull mode optional)
  meta.json
  logs.jsonl|csv|txt
  rca.md
  pr-url.txt
  chain-state.json
```

| Stage | CJS | Pulls | Writes |
|-------|-----|-------|--------|
| A | `incident:stage:a` | PD id / event → APIs | meta + logs |
| B | `incident:stage:b` + agent | meta + logs | rca.md |
| C | `incident:stage:c` + agent | rca.md | pr-url.txt (draft MR only) |

Helpers: `scripts/incident-pull-lib.cjs`, `npm run incident:chain`.

---

## Boundaries (both modes)

- Draft MR/PR only — **no auto-merge**, no push to default branch.
- No deploy from this path; existing GitHub/GitLab CD stays authoritative.
- No invented logs.
- Stage CJS exits non-zero if required artifacts are missing.
- Open-source path does **not** ship a public webhook listener by default.

---

## Build order

1. Pull mode multi-CJS + prompts (in progress).
2. Stage A: real “retrieve from PagerDuty id” adapter (pull).
3. Local Docker Compose recipe for on-call laptop.
4. Paid: always-on service + `/hooks/pagerduty` + notify human.
5. Optional: Airflow/Jenkins skins for customers who want them.

---

## Related

- Playbook: `workflows/incident-to-mr.md`
- Prompt: `prompts/incident-to-mr.md`
- Stage CJS: `scripts/incident-stage-*.cjs`
- Setup: `knowledge/setup-and-integrations.md`
