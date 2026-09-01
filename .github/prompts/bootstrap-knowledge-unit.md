# Bootstrap knowledge — one unit (token-effective)

Process **exactly one** pending service from the queue, write durable knowledge, mark done, **stop**.

Designed so a mid-run quota cut only loses the current unit — not the whole setup.

Prereq: `context/knowledge-bootstrap-progress.md` has a queue (`prompts/bootstrap-knowledge-plan.md`).

After enough units are `done`, run the **separate** overview prompt:
`prompts/bootstrap-architecture-overview.md` (does not re-scan repos).

---

## Prompt

```text
Run knowledge bootstrap UNIT — single service only.

Hard limits:
- Process exactly ONE queue row with status=pending (lowest # first), unless I name a key.
- Read budget for that sibling: max 8 files (prefer README, package/pom/gradle,
  top-level dir listing, one src entrypoint or application.yml/properties if obvious,
  one deps file or openapi/proto only if small and clearly present).
- Do not walk the whole tree. Do not open lockfiles, large generated assets, or .git history dumps.
- Do not start a second service in this turn.
- Do NOT write knowledge/architecture/overview.md in this turn (separate prompt later).
- If you approach context/token limits: finish writes for this unit, update progress, stop immediately.

Steps:
1. Read context/knowledge-bootstrap-progress.md — pick the next pending unit.
2. Shallow-scan only that local_path (budget above).
3. Identify this service's **internal architecture** from evidence only:
   - major packages/modules/layers (from top-level src layout)
   - inbound/outbound dependencies (APIs, queues, DB) when obvious from README/config
   - notable patterns (e.g. hexagonal, layered, worker) only if clearly indicated
4. Propose, then after my quick OK (or if I said "auto-approve units"):
   a. Upsert ONE entry in knowledge/service-registry.yaml (keep other services intact).
   b. Write/update knowledge/services/<service_key>.md using the template below
      (must include ## Internal architecture).
   c. Optionally one line in knowledge/local-repos.md if path is non-default.
5. Mark that queue row status=done; append Done log (date, key, files touched).
6. Print: "Unit complete: <key>. Next pending: <key or none>. Stop.
   When queue is done enough, run prompts/bootstrap-architecture-overview.md separately."
7. Stop. Do not continue.

Skip rules:
- If path missing: status=blocked, note why, stop.
- If not a real service: status=skipped, note why, stop.

Do not invent deploy status, owners, tickets, or runtime health.
Unknown bullets → "unknown" or Gaps TODO — never fabricate.
```

---

## Service note template (keep short)

```markdown
# <service_key>

| Field | Value |
|-------|-------|
| Repo | `<repo>` |
| Local path | `<local_path>` |
| Related | <related or —> |

## Purpose
<1–3 factual sentences from README / manifest only>

## Internal architecture
- Layers / modules: <from top-level layout only>
- Inbound: <HTTP/events/… or unknown>
- Outbound: <APIs, DB, queues — only if evidenced>
- Data: <DB/schema hints or unknown>
- Pattern notes: <only if clear; else —>

## Agent hints
- Entry / package manager: …
- Related services (guesses only if obvious): …

## Gaps
- TODO: …
```

---

## Batch (explicit only)

If the human says `batch N` (e.g. batch 3): run at most N units in one turn, still respecting the per-unit read budget, and stop after N or when tokens feel tight — whichever first. Default remains **1**. Still do not synthesize overall architecture in a unit turn.

---

## Resume after quota death

1. Open a new agent turn.
2. Paste this unit prompt again (or say "continue knowledge bootstrap unit").
3. Agent reads progress file, picks next `pending`, continues.
4. No need to re-plan unless the sibling set changed.
5. Overall architecture stays a **later, separate** prompt.
