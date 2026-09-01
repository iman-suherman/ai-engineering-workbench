export const SETUP_PHASES = [
  {
    step: '01',
    title: 'Clone next to your repos',
    description:
      'Sibling layout is the default. Parent-child also works — point local_path at each checkout.',
    detail:
      '~/src/my-org/\n├── ai-engineering-workbench/\n├── service-a/\n└── service-b/',
  },
  {
    step: '02',
    title: 'Fill knowledge in units',
    description:
      'Plan once (cheap sibling list), then one service per agent turn with internal architecture notes. Separate prompt stitches overall architecture — resumes if quota dies mid-setup.',
    detail:
      'prompts/bootstrap-knowledge-plan.md\nprompts/bootstrap-knowledge-unit.md\nprompts/bootstrap-architecture-overview.md\n# or small estate:\nprompts/fill-service-registry.md',
  },
  {
    step: '03',
    title: 'Run one real enquiry',
    description:
      'Confirm the agent resolves services and inspects live repos (siblings + gh), not only YAML.',
    detail: 'npm run start -- --request "…"\nprompts/investigate.md',
  },
] as const;

export const REGISTRY_SOURCES = [
  {
    source: 'Sibling / parent-child folders',
    use: 'Ground truth for local_path — start here',
    required: false,
  },
  {
    source: 'GitHub / GitLab via gh',
    use: 'List org repos when checkouts are incomplete',
    required: false,
  },
  {
    source: 'Terraform',
    use: 'Module names, service tags, repo outputs as discovery hints',
    required: false,
  },
  {
    source: 'Helm charts',
    use: 'Chart names and image.repository → candidate services',
    required: false,
  },
  {
    source: 'Manual YAML',
    use: 'Always valid — edit knowledge/service-registry.yaml directly',
    required: false,
  },
] as const;

export const JIRA_TOUCHPOINTS = [
  {
    title: 'Analyse a ticket (no API)',
    description:
      'Paste the ticket, run prompts/jira-analysis.md, optionally draft with prompts/compose-jira.md. You paste the reply into Jira.',
    effort: 'Easy',
  },
  {
    title: 'Sync active incidents (API)',
    description:
      'API token in .env → npm run sync:incidents -- --provider jira → context/active-incidents.md. Pull-only; human still owns outbound updates.',
    effort: 'Medium',
  },
  {
    title: 'Jira MCP / custom (later)',
    description:
      'Optional read access during investigation. Do not auto-post comments. Enterprise/custom work if you need deeper automation.',
    effort: 'Harder',
  },
] as const;

export const OTHER_INTEGRATIONS = [
  { name: 'Incident → MR', note: 'Logs → RCA → fix → draft PR; human reviews — workflows/incident-to-mr.md' },
  {
    name: 'PagerDuty orchestrator (target)',
    note: 'Stages A–C; local CJS chain open source; Jenkins/GHA pack; Airflow for paying customers',
  },
  { name: 'Unitized knowledge bootstrap', note: 'Plan + one-service units — token-effective, resumable' },
  { name: 'ServiceNow', note: 'Same incident sync path: --provider servicenow' },
  { name: 'Chat / Slack / Teams', note: 'Compose drafts only — never auto-send' },
  { name: 'MCP (Datadog, search, …)', note: 'Configure in Cursor / Codex when useful' },
  { name: 'GitHub CLI', note: 'PRs and remotes when a local checkout is missing' },
] as const;

export const SETUP_DOCS = {
  github: 'https://github.com/iman-suherman/ai-engineering-workbench',
  setupDoc: 'https://github.com/iman-suherman/ai-engineering-workbench/blob/main/knowledge/setup-and-integrations.md',
  jiraDoc: 'https://github.com/iman-suherman/ai-engineering-workbench/blob/main/knowledge/integrations/jira.md',
  registryDoc: 'https://github.com/iman-suherman/ai-engineering-workbench/blob/main/knowledge/service-registry-howto.md',
} as const;
