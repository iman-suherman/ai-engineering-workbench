# Local sibling repositories

Place this workbench next to the repos you investigate:

```text
~/src/my-org/
├── ai-engineering-workbench/   ← this repo
├── checkout-api/
├── payments-api/
├── inventory-service/
└── edge-gateway-config/
```

## Agent rules

1. Prefer investigating **local sibling paths** from `service-registry.yaml` when present.
2. Still verify remotes/PRs with `gh` when assessing active development.
3. Say which git ref you inspected (`main`, `develop`, a feature branch, etc.).
4. Not every folder next to this workbench is a production service.
