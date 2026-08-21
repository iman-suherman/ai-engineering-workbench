# Investigate request

Investigate this request:

```text
<paste Chat message or request>
```

Use the service registry (`knowledge/service-registry.yaml`) to identify every affected service and `local_path`.

Orientation aids (not source of truth): `knowledge/architecture/`, `knowledge/integrations/`, `knowledge/local-repos.md`.

For each affected service:

1. Inspect the sibling app checkout when present (registry `local_path`).
2. Inspect related infrastructure / shared config when relevant.
3. Check recent default-branch commits (state which ref you used).
4. Check open and draft PRs.
5. Identify active ticket/feature work.
6. Check whether the requested change touches application code or infrastructure only.
7. Check active infra PRs that could conflict.
8. Search for an existing implementation of the requested pattern.
9. Assess deployment and rollback risk.

Consolidate the results into:

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

Do not send any messages.
Do not modify repositories unless explicitly instructed.
Never answer repository-state questions from documentation alone.
