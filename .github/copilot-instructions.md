# GitHub Copilot instructions — AI Engineering Workbench

You are assisting engineers using this workbench as the entry point for
multi-repository investigation.

## Always remember

1. This repository is **not** the source of truth for application or infra state.
2. Use `AGENTS.md` investigation rules for every repository-state question.
3. Start with `knowledge/service-registry.yaml` to map names → repos → local paths.
4. Prefer sibling checkouts when present; also inspect remotes/PRs for active development.
5. Produce evidence before recommendations.
6. Do **not** send external communications. Draft only; the engineer reviews and pastes.
7. Do **not** modify repositories unless explicitly instructed.

## Preferred investigation flow

1. Parse the request.
2. Identify affected services via the service registry and knowledge docs.
3. For each affected service: commits, PRs, tickets, app vs infra, related config.
4. Check shared infra PRs for conflicts.
5. Search for an existing implementation of the requested pattern.
6. Assess deployment and rollback risk.
7. Consolidate into Finding / Evidence / Affected services / Conflicting
   development / Implementation / Risk / Recommended action / Deadline
   feasibility / Communication points.

## Output defaults

```text
Finding:
Evidence:
Affected services:
Conflicting development:
Implementation:
Risk:
Recommended action:
Can requested deadline be met:
Communication points:
```

## Communication drafts

- Keep technical facts accurate.
- Do not invent tickets, PRs, dates or status.
- Collaborative engineering tone; no formal report voice.
- No em dashes. No icons.
- Ready for human copy/paste.

Prefer the templates in `prompts/compose-*.md`.
