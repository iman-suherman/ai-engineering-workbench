# Dogfood failure modes (test cases)

Use a real multi-service estate (day-job or lab) as the proving ground.
The product learning is not “happy path only” — it is what happens when the loop breaks.

Do **not** commit proprietary logs, tickets, or customer data to a public fork.
Keep artifacts under `communications/incidents/` (gitignored) or a private bucket.

## Setup / knowledge bootstrap

| # | Case | Expected behaviour |
|---|------|--------------------|
| S1 | Token / quota dies mid-setup | Current unit finished or marked; queue in `context/knowledge-bootstrap-progress.md` still valid; next turn resumes next `pending` — no full re-scan |
| S2 | Sibling path missing | Unit `blocked` with reason; other units continue |
| S3 | Too many siblings | Plan pass trims to 4–20; human edits queue before units |
| S4 | Overview run before units done | Overview lists Gaps for services missing Internal architecture; does not invent edges |

Prompts: `workflows/bootstrap-knowledge.md`.

## Incident → MR (pull mode)

| # | Case | Expected behaviour |
|---|------|--------------------|
| I1 | Stage B run before logs exist | `incident:stage:b` exits non-zero; no fake RCA |
| I2 | Empty log query / no trace hits | Stage A fails with the exact query; do not invent stack traces |
| I3 | Cannot find root cause | RCA states ranked hypotheses + **Blocked on**; no Stage C / no MR |
| I4 | Human **rejects** RCA | Do not run Stage C; revise RCA or stop; no patch from rejected cause |
| I5 | Token dies mid-RCA or mid-fix | Artifact folder kept; resume same stage; do not re-pull logs unless asked |
| I6 | Ambiguous service mapping | Skip draft MR; notify with candidates only |
| I7 | Human rejects patch / closes MR | Loop ends successfully from product POV — human is the gate |
| I8 | Multi-repo shared-DB incident | Cap clones; prefer one primary MR unless human authorizes more |

Playbook: `workflows/incident-to-mr.md` · architecture: `knowledge/architecture/incident-pipeline.md`.

## What to record after each dogfood run

In a private note (not public git):

```text
Date:
Estate: (private)
Case IDs exercised: e.g. S1, I3, I4
What broke:
What the product should change:
Prompt/CJS tweak:
```

## Success criteria for “test case” adoption

1. At least one **S1** (quota mid-setup) recovered without rewriting the registry by hand from scratch.
2. At least one **I3** or **I4** (no RCA / rejected RCA) without an erroneous MR.
3. At least one happy path draft MR that a human actually reviewed (merge optional).

That set beats a demo that only shows green paths.
