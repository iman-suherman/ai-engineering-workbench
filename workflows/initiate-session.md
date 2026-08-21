# Workflow: initiate session / new enquiry

## 1. Orient on the agent stack

| Layer | Path |
|-------|------|
| Cursor initiation rule | `.cursor/rules/initiate-workbench.mdc` |
| System instructions | `.github/copilot-instructions.md` |
| Agent behaviour | `AGENTS.md` |
| Prompts | `prompts/` |
| Knowledge | `knowledge/` |
| Living context | `context/` |

## 2. Absorb just enough knowledge

1. `knowledge/service-registry.yaml`
2. Relevant `knowledge/services/*.md`
3. Matching architecture/integration/infra docs
4. `context/` for urgency constraints
5. Sibling checkouts when present

## 3. Start the enquiry

```bash
npm run start -- --request "<request>"
```

Or paste into `communications/inbox/` and run `npm run start`.
