# Fill service registry

Use this prompt to bootstrap or refresh `knowledge/service-registry.yaml` for a **small** estate in one shot.

For many sibling repos (quota risk): use **unitized** bootstrap instead —
`prompts/bootstrap-knowledge-plan.md` → repeated `prompts/bootstrap-knowledge-unit.md`
(`workflows/bootstrap-knowledge.md`). That path is resume-safe if tokens run out mid-setup.

---

## Prompt (copy into Cursor / Codex / Copilot)

```text
Fill knowledge/service-registry.yaml for our real services.

Goals:
1. Replace (or clearly separate) the fictional demo sample services with ours.
2. Map each service key → repo → local_path so agents can navigate.
3. Keep the file navigation-only — do not invent deploy status, owners, or tickets.

Discovery order:
1. List sibling directories next to this workbench (parent of ai-engineering-workbench/).
2. If GITHUB_ORG or an org name is provided, list accessible repos with `gh` (read-only).
3. Prefer folders that look like application or infra repos (skip node_modules, build outputs, .git-only junk).

For each candidate service:
- service key: short kebab-case name engineers would say in Chat
- repo: remote repo name when known, else folder name
- local_path: relative path from this workbench root (usually ../<folder>)
- description: one short factual line from README / package.json / known purpose; if unknown use "TODO: describe"
- related_services: only when obvious from README or shared naming; otherwise []
- tags: optional light hints (api, service, infra, frontend, …)

Constraints:
- Do not invent PRs, tickets, dates, or runtime state.
- Do not delete demo entries unless I say so — if keeping demo, leave a comment that they are samples only, or move real services clearly.
- Prefer the 4–20 services we actually investigate; do not dump the entire org unless asked.
- Show the full proposed YAML first and wait for my approval before writing the file.
- After I approve, also update knowledge/local-repos.md if the layout differs from ../{repo}.

Optional inputs I may provide:
- Org: <GITHUB_ORG or company org>
- Must-include services: <list>
- Layout: sibling | parent-child under <path>
```

---

## Minimal one-liner

```text
Scan sibling repos next to this workbench, draft knowledge/service-registry.yaml for our real services (key, repo, local_path, short description, related_services when obvious). Show YAML for approval before writing. Do not invent deploy status.
```

---

## After it runs

1. Review service keys and `related_services` (AI guesses are often incomplete).
2. Confirm `local_path` exists for repos you have checked out.
3. Ask a real multi-repo question and check the agent opens the right folders.
