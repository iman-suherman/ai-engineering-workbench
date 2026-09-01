# Setup first, then integrations

Workbench runs **without** ServiceNow, Jira, Slack bots, or MCP. Start with local setup; add integrations only when they remove real friction.

## Phase 1 — setup (required to be useful)

1. **Clone next to the repos you investigate** (sibling layout):

   ```text
   ~/src/my-org/
   ├── ai-engineering-workbench/
   ├── service-a/
   └── service-b/
   ```

2. **Open the workbench root** in Cursor / Codex / Copilot.

3. **Fill the service registry** (no ITSM needed) — prefer **unitized** bootstrap if many siblings:
   - Plan once: `prompts/bootstrap-knowledge-plan.md` → queue in `context/knowledge-bootstrap-progress.md`
   - One service per turn: `prompts/bootstrap-knowledge-unit.md` (resume-safe if quota dies)
   - Or quick single-shot: `prompts/fill-service-registry.md` / `-from-infra` for small estates
   - Or edit `knowledge/service-registry.yaml` by hand
   - Approve writes; fix `related_services` / names after
   - Workflow: `workflows/bootstrap-knowledge.md`

4. **Optional living context** (still manual is fine):
   - `context/active-incidents.md`
   - `context/current-sprint.md`
   - `context/current-investigations.md`

5. **Run one real enquiry**:
   - `npm run start -- --request "…"` or paste into Chat + `prompts/investigate.md`
   - Confirm the agent opens the right sibling paths / uses `gh`.

You are done with setup when a multi-repo question resolves services from the registry and inspects live repos.

## Phase 2 — integrations (optional)

| Integration | Goes where | Purpose | Hard? |
|-------------|------------|---------|-------|
| **Sibling / parent-child checkouts** | Disk + `local_path` in registry | Agent reads real code | Easy (layout choice) |
| **GitHub CLI (`gh`)** | Your machine auth | PRs, commits, remote when checkout missing | Easy if already logged in |
| **Unitized knowledge bootstrap** | Plan + unit prompts + `context/knowledge-bootstrap-progress.md` | Scan siblings & write knowledge **one service per turn** (quota-safe) | Easy |
| **Fill-registry prompt** | `prompts/fill-service-registry.md` | Small-estate single-shot YAML | Easy |
| **Registry from Terraform / Helm** | `prompts/fill-service-registry-from-infra.md` | Discovery hints → same YAML (not live TF state) | Easy–medium |
| **Manual context files** | `context/*.md` | Sprint / incident urgency | Easy |
| **Jira ticket analysis** | Paste + `prompts/jira-analysis.md` / `compose-jira.md` | Investigate & draft — human posts | Easy |
| **Jira / Jira SM → incidents** | Env + `npm run sync:incidents -- --provider jira` → `context/active-incidents.md` | Auto-fill active incidents | Medium (API token + JQL) |
| **ServiceNow → incidents** | Env + `--provider servicenow` → same file | Same | Medium (instance + basic auth) |
| **Chat / Slack / Teams / email** | Compose prompts only | Draft replies — **never auto-send** | Easy |
| **MCP servers** (Datadog, search, …) | Cursor / Codex MCP config | Live telemetry or domain search | Medium (per server) |
| **Custom sync / bots** | `scripts/`, skills, or Team/Enterprise work | Org-specific automation | Harder — only when needed |
| **Marketing website** | `website/` + https://workbench.suherman.net | Demo, Team signup, contact | Not part of agent runtime |

### What does **not** need integration

- Service registry fill (prompt or manual)
- Investigation workflow
- Compose drafts for Chat/Jira/support
- Demo (`npm run demo`)

### Secrets

- Copy `.env.example` → `.env` (gitignored).
- Never commit tokens or customer incident detail to a public fork.
- Website SMTP secrets are separate (`website/.env`) and unrelated to agent investigation.

### Suggested order for Andre-style multi-service work

1. Sibling (or parent-child) checkouts for the services that share the DB.
2. Fill registry with the prompt for those services first (not the whole org).
3. Use investigate prompts across folders in one session.
4. Only then wire Jira/ServiceNow sync if keeping `active-incidents.md` fresh by hand is painful.

Details:

- Overview on the site: https://workbench.suherman.net/setup
- Quota-safe bootstrap: `workflows/bootstrap-knowledge.md` + `prompts/bootstrap-knowledge-*.md`
- Registry fill: `knowledge/service-registry-howto.md` + fill / infra prompts
- Jira: `knowledge/integrations/jira.md`
- Incident sync: `knowledge/integrations/incident-sources.md` + `scripts/sync-incidents.cjs`
