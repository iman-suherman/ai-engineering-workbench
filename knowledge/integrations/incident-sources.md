# Incident sources → `context/active-incidents.md`

## What it is today

`context/active-incidents.md` is a **living notes file**, not a live feed.

- The agent reads it during session bootstrap and production-incident workflow.
- Manual entry is enough for day one — see Phase 1 in `knowledge/setup-and-integrations.md`.
- Optional sync from Jira or ServiceNow overwrites the generated body of this file.

Template entry:

```markdown
## INC-1234 — checkout payment timeouts
- Started: 2026-09-01 10:15 AEST
- Severity: Sev2
- Services: checkout-api, payments-api
- Status: investigating
- Link: https://your-itsm.example/INC-1234
- Notes: elevated 5xx on /pay; rollback candidate payments-api#42
```

## Optional: auto-fill from ServiceNow / Jira Service Desk

| Piece | Where | Notes |
|-------|--------|--------|
| API base URL + credentials | **`.env`** (from `.env.example`, gitignored) | Never commit tokens |
| Sync script | `scripts/sync-incidents.cjs` | `npm run sync:incidents -- --provider jira\|servicenow` |
| Output | `context/active-incidents.md` | Agent-facing source |
| Website | Not required | Marketing site does not read incidents |

### Quick start

```bash
cp .env.example .env
# fill JIRA_* or SERVICENOW_* 
npm run sync:incidents -- --provider jira --dry-run
npm run sync:incidents -- --provider jira
```

Tune filters with `JIRA_JQL` or `SERVICENOW_QUERY`. Map component / CI names to `service-registry.yaml` keys when you can.

### Boundaries

- Do not commit API keys, tokens, or customer incident detail to a public fork.
- Sync is pull-only; the agent does not write back to ITSM.
- Human can still edit the markdown between syncs (re-sync will overwrite).

## Manual path (default)

1. Open `context/active-incidents.md`.
2. Paste the active incident(s).
3. Clear or archive when closed.
4. Session bootstrap will pick it up as urgency context.
