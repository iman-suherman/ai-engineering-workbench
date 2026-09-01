# Target architecture: 100% pull · multi-CJS · draft MR · human merge

Product direction for the AI-native incident loop. Complements the interactive
playbook `workflows/incident-to-mr.md` (engineer-driven in Cursor/Codex).

**Decision: run 100% pull architecture.** Stages do not push work into each other.
Each stage **pulls** inputs from a shared artifact folder (disk or bucket mirror).
The “pipeline” is as simple as **multi CJS** (`incident:stage:a` → `b` → `c`) plus
chained prompts. Human still **reviews, edits, and merges**. Nothing auto-merges or deploys.

```text
                    ┌─────────────────────────┐
                    │ communications/incidents │
                    │         /<ID>/           │
                    │  meta, logs, rca, pr-url │
                    └───────────▲──────────────┘
          pull meta    pull logs│pull rca     pull pr-url
               │            │   │    │              │
         stage-a.cjs   stage-b.cjs  stage-c.cjs   human
         (export logs) (agent RCA)  (agent MR)   (merge→CD)

Optional: PagerDuty / cron only *drops* event.json into the folder (write sink).
That is still pull for consumers — stages never receive an in-memory push bus.
```

## Why 100% pull

- **Resumable** — quota death mid-B does not lose Stage A logs.
- **Simple pipeline** — multi CJS + files; no n8n required; Airflow optional later (paid).
- **Least privilege** — each CJS only needs read on prior artifacts + its own write.
- **Replay** — re-run `incident:stage:b` by pulling the same logs again.
- **Prompt chaining** — CJS gates readiness; agent turns stay small and sequential.

Push-style orchestrators (Jenkins/GHA/Airflow) may still *schedule* stage CJS, but
each stage implementation stays pull-gated on the artifact contract.

## Step mapping

| Your step | Stage CJS | Pulls | Writes |
|-----------|-----------|-------|--------|
| 1–2. Trigger + trace → logs | `npm run incident:stage:a` | (creates sink) meta | meta.json + logs.* |
| 3. Services + clone + RCA | `npm run incident:stage:b` then agent | meta + logs | rca.md |
| 4. Patch + draft MR + notify | `npm run incident:stage:c` then agent | rca.md | pr-url.txt |
| 5. Human merge → CD | human | pr-url | merge on GitHub/GitLab |

## Multi-CJS local loop

```bash
npm run incident:stage:a -- --id INC-123 --trace abcdef
# export logs into communications/incidents/INC-123/logs.jsonl

npm run incident:stage:b -- --id INC-123
# refuse unless logs exist — then paste prompts/incident-to-mr.md phases 1–2 → rca.md

npm run incident:stage:c -- --id INC-123
# refuse unless rca.md exists — then phases 3–4 → draft MR + pr-url.txt
```

Helper status/advance: `npm run incident:chain` (same artifact tree).

Shared pull helpers: `scripts/incident-pull-lib.cjs`.

## Orchestrator skins (optional)

| Option | Role under pull architecture | Availability |
|--------|------------------------------|--------------|
| **Multi CJS (default)** | The pipeline | Open source |
| **Jenkins / GHA / GitLab** | Cron/webhook that *invokes* the same stage CJS | Pack / Team |
| **Airflow** | Sensors that wait for files then run stage CJS | **Paying (Team/Enterprise)** |
| **n8n** | Optional — not required | Optional |

## Artifact contract

```text
communications/incidents/<id>/
  event.json          # optional drop from PagerDuty (sink)
  meta.json           # trace_id, window, …
  logs.jsonl|csv|txt  # Stage A
  services.guess.json # optional
  rca.md              # Stage B
  pr-url.txt          # Stage C
  chain-state.json    # bookkeeping
```

## Boundaries (non-negotiable for v1)

- Draft MR/PR only; **no auto-merge**, no push to default branch.
- No deploy from the AI path; existing main→prod CD stays authoritative.
- No invented logs — empty query fails the stage with the exact query.
- Patch = minimal evidenced fix.
- Stage CJS **exit non-zero** if required pulls are missing (no silent skip ahead).

## Interactive vs pull-chain

| Mode | Entry |
|------|--------|
| Interactive | `workflows/incident-to-mr.md` |
| 100% pull multi-CJS | `incident:stage:a|b|c` + chained prompts |
| Scheduled pull | Jenkins/GHA invokes the same CJS (Team) |
| Heavy sensors | Airflow (paid) |

## Build order

1. Multi-CJS pull gates + prompts (done / in progress).
2. Real Stage A log export adapters (Datadog/GCP/…) per customer.
3. Optional webhook that only writes `event.json` into the sink.
4. Jenkinsfile pack; Airflow DAG as paid add-on.

## Related

- Playbook: `workflows/incident-to-mr.md`
- Prompt: `prompts/incident-to-mr.md`
- Stage CJS: `scripts/incident-stage-*.cjs`
- Chain helper: `scripts/incident-chain.cjs`
- Registry: `knowledge/service-registry.yaml`
