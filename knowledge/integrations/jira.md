# Jira integration

Jira is **optional**. The workbench runs with sibling repos + `service-registry.yaml` alone.

There are three useful Jira touchpoints — pick what you need.

## 1. Analyse a ticket (no API)

1. Paste the ticket into Chat or `communications/inbox/`.
2. Use `prompts/jira-analysis.md` (or `.github/prompts/jira-analysis.md`).
3. Agent maps services via the registry, inspects live repos, returns Finding / Evidence / Risk.
4. Optionally draft a comment with `prompts/compose-jira.md` — **you** paste it into Jira.

No API key. Human stays in the loop.

## 2. Sync active incidents into context (API)

Pulls open high-priority incidents into `context/active-incidents.md` so session bootstrap sees urgency.

```bash
cp .env.example .env
# set:
#   JIRA_BASE_URL=https://your-domain.atlassian.net
#   JIRA_EMAIL=you@company.com
#   JIRA_API_TOKEN=...   # https://id.atlassian.com/manage-profile/security/api-tokens

npm run sync:incidents -- --provider jira --dry-run
npm run sync:incidents -- --provider jira
```

| Env | Purpose |
|-----|---------|
| `JIRA_BASE_URL` | Site URL, no trailing slash required |
| `JIRA_EMAIL` | Atlassian account email |
| `JIRA_API_TOKEN` | API token (Basic auth with email) |
| `JIRA_JQL` | Optional filter (default: open high/highest Incident issues) |

Notes:

- Works with Jira Cloud REST API v3 search. Server/DC may need URL/path tweaks.
- For **Jira Service Management**, keep using Incident (or your ITSM issue type) and tune `JIRA_JQL`.
- Sync is **pull-only**. Nothing is written back to Jira.
- Re-sync overwrites the generated body of `context/active-incidents.md`.
- Map Jira **components** to registry service keys when you can (edit after sync or align component names).

Details: `knowledge/integrations/incident-sources.md` · script: `scripts/sync-incidents.cjs`.

## 3. Deeper Jira MCP / custom automation (later)

If your team already uses a Jira MCP server or Enterprise custom work:

- Read issues / search during investigation (still evidence-first).
- Do **not** auto-post comments unless a human explicitly owns that step.
- Keep tokens in MCP config or `.env`, never in git.

## Setup order

1. Fill `service-registry.yaml` (`prompts/fill-service-registry.md`).
2. Try one ticket with `prompts/jira-analysis.md` (paste only).
3. Add API sync only if keeping `active-incidents.md` fresh by hand is painful.

See also: `knowledge/setup-and-integrations.md`.
