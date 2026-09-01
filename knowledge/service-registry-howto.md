# How to fill `service-registry.yaml`

File: `knowledge/service-registry.yaml`

This file is **navigation only**. It maps friendly service names → git repo → local checkout path so the agent knows where to look. Live commits/PRs remain the source of truth.

**Setup first:** see `knowledge/setup-and-integrations.md`. You do not need Jira/ServiceNow for the registry.

**Ready-made prompts:**

- **Recommended for many siblings:** `prompts/bootstrap-knowledge-plan.md` then `prompts/bootstrap-knowledge-unit.md` (one service / turn, resumable) — see `workflows/bootstrap-knowledge.md`
- `prompts/fill-service-registry.md` — small estate, siblings + optional `gh`
- `prompts/fill-service-registry-from-infra.md` — Terraform / Helm / catalog hints

All mirrored under `.github/prompts/`.

## Where can entries come from?

| Source | Role |
|--------|------|
| Sibling / parent-child folders | Best for `local_path` |
| `gh` org repo list | Completeness when checkouts are missing |
| Terraform | Module names, tags, outputs as **discovery** (not live state sync) |
| Helm charts | Chart / image names as **discovery** |
| Manual edit | Always fine |

Output is always `knowledge/service-registry.yaml`. Re-run a fill prompt when the estate changes.

## Fields that matter

```yaml
defaults:
  local_path_pattern: "../{repo}"   # sibling layout default
  default_branches: [main, master, develop]

services:
  my-service:                       # key agents will match in questions
    repo: my-service-repo           # GitHub/GitLab repo name
    local_path: "../my-service-repo"
    description: short purpose
    related_services: [other-service]
    tags: [api, payments]
```

Sibling layout (recommended for existing repos):

```text
~/src/my-org/
├── ai-engineering-workbench/
├── my-service-repo/
└── other-service-repo/
```

If a checkout is not a sibling, set `local_path` explicitly (absolute or relative). Paths that do not exist are fine — agent should say so and fall back to `gh` / remote.

## Option A — Prompt (recommended)

1. Open the workbench root in Cursor / Codex / Copilot.
2. Paste the prompt from `prompts/fill-service-registry.md`.
3. Review the proposed YAML, then approve the write.
4. Spot-check `related_services` and service keys.

## Option B — Manual

1. Delete the sample `checkout-api` / `payments-api` demo entries (or keep them only for `npm run demo`).
2. List the services your squads actually investigate.
3. For each: `repo`, `local_path`, one-line `description`, `related_services`, optional `tags`.
4. Update `knowledge/local-repos.md` if your folder layout differs from `../{repo}`.

Start small: the 4–8 services you touch weekly beat a perfect org-wide dump.

## Option C — Team onboarding

On the Team plan, registry setup is a deliverable: map your repos/paths together in the Week 1 session (see website Team onboarding). Same YAML; less DIY.

## Parent-child vs sibling

| Layout | When it helps |
|--------|----------------|
| **Sibling** (default here) | Repos already exist; easy clone/path updates in the registry |
| **Parent-child / monorepo-style workspace** | One IDE/Codex root must see all folders without path config; good for greenfield or when the agent has no sibling awareness |

Workbench default is sibling + registry. You can still put checkouts under a parent folder and point `local_path` at those children — registry stays the map either way.

## After you fill it

1. Open the workbench root in Cursor / Codex / Copilot.
2. Ask a real multi-repo question naming one of your service keys.
3. Confirm the agent resolves `local_path` and inspects the live repo (not only this YAML).
