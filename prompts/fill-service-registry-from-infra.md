# Fill service registry from infra / inventory sources

Use when sibling folders alone are incomplete, and you have Terraform, Helm, a service catalog, or an org repo list.

You still write **`knowledge/service-registry.yaml`** — these sources are discovery inputs, not a live feed.

---

## Prompt (copy into Cursor / Codex / Copilot)

```text
Draft knowledge/service-registry.yaml from our inventory sources.

Priority of sources (use what exists; skip what does not):
1. Sibling folders next to this workbench (and/or parent-child workspace path I give you).
2. GitHub/GitLab org repos via `gh` if GITHUB_ORG / org name is provided.
3. Terraform — scan for service modules, `*_service` resources, remote state backends,
   and repo/path outputs that name deployable services (e.g. module names, tags.Service,
   kubernetes labels). Prefer application services over pure network plumbing.
4. Helm charts — chart names, values files (image.repository, fullnameOverride, app labels),
   and umbrella chart dependencies that map to deployable services.
5. Optional: Kubernetes manifests / Argo apps / service catalog CSV if I point at a path.
6. Optional: existing internal wiki / architecture doc paths I paste.

For each service produce:
- key (kebab-case, what engineers say in Chat)
- repo (git repo name when known)
- local_path (../repo or explicit path; OK if checkout missing)
- description (one factual line; "TODO: describe" if unknown)
- related_services (only when obvious)
- tags (api, service, infra, frontend, …)
- optional comment: source hint (sibling | terraform | helm | gh)

Rules:
- Navigation only — do not invent deploy status, owners, ticket IDs, or runtime health.
- Prefer the services our squads actually investigate (start with 4–20), not every module in the estate.
- If Terraform/Helm names disagree with git folder names, prefer the git repo name for `repo`
  and note the infra name in description or a YAML comment.
- Deduplicate aggressively (one registry entry per deployable service).
- Show the full proposed YAML and a short "sources used / skipped" list.
- Wait for my approval before writing knowledge/service-registry.yaml.
- After approval, update knowledge/local-repos.md if layout is non-default.

Inputs I may provide:
- Org: …
- Terraform root(s): …
- Helm chart path(s): …
- Must-include services: …
- Layout: sibling | parent-child under …
```

---

## Minimal one-liner

```text
Build service-registry.yaml from sibling folders plus any Terraform/Helm paths I name. Deduplicate to real deployable services, show YAML for approval, do not invent deploy status.
```

---

## What Terraform / Helm are good for

| Source | Good signal | Weak / noisy |
|--------|-------------|--------------|
| Terraform | Module names, service tags, repo outputs | Shared VPC/IAM modules that are not “services” |
| Helm | Chart name ≈ service, image repo → git guess | Generic charts (redis, nginx) unless you own them |
| Sibling git | Ground truth for `local_path` | Empty folders / unrelated clones |
| `gh` org list | Completeness | Too many repos — filter by team/topic |

Registry remains YAML in git. Re-run this prompt when the estate changes; there is no required continuous sync from Terraform state.
