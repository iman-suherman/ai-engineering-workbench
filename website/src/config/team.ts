import { SITE_URL } from './contact';

export const TEAM_PLAN = {
  name: 'Team',
  price: '$299',
  period: 'AUD / month',
  billingNote: 'Up to 10 engineers · month-to-month · cancel anytime',
  annualPrice: '$2,990',
  annualNote: 'Pay annually — 2 months free',
  tagline: 'Managed setup, custom knowledge base, and hands-on onboarding for growing engineering orgs.',
  cta: 'Register your team',
  ctaHref: `${SITE_URL}/team#register`,
};

export const TEAM_PRICING_TIERS = [
  {
    seats: 'Up to 10 engineers',
    monthly: '$299 AUD',
    annual: '$2,990 AUD',
    note: 'Best for a single squad or platform team',
  },
  {
    seats: '11–25 engineers',
    monthly: '$499 AUD',
    annual: '$4,990 AUD',
    note: 'Multiple squads sharing one service registry',
  },
];

export const PLAN_COMPARISON = [
  { feature: 'Service registry & knowledge base', openSource: true, team: true },
  { feature: 'Investigation prompts & workflows', openSource: true, team: true },
  { feature: 'Custom registry setup for your repos', openSource: false, team: true },
  { feature: 'Knowledge base scaffolding', openSource: false, team: true },
  { feature: 'Live team brown-bag (90 min)', openSource: false, team: true },
  { feature: 'Office hours (2× in month one)', openSource: false, team: true },
  { feature: 'Onboarding runbook', openSource: false, team: true },
  { feature: 'Priority email support (1 business day)', openSource: false, team: true },
  { feature: '30-day launch support', openSource: false, team: true },
  { feature: 'Community / self-serve only', openSource: true, team: false },
];

export const TEAM_INCLUDES = [
  {
    title: 'Everything in Open Source',
    description: 'Full workbench — service registry, prompts, workflows, and compose templates.',
  },
  {
    title: 'Custom service registry',
    description: 'We map your repositories, services, and local checkout layout into `service-registry.yaml`.',
  },
  {
    title: 'Knowledge base scaffolding',
    description: 'Starter architecture docs, integration notes, and glossary tailored to your domain.',
  },
  {
    title: 'Team onboarding brown-bag',
    description: '90-minute live session: investigation workflow, evidence-first output, and compose drafts.',
  },
  {
    title: 'Office hours',
    description: 'Two 45-minute follow-up sessions in your first month for questions and tuning.',
  },
  {
    title: 'Priority email support',
    description: 'Responses within one business day for setup, workflow, and troubleshooting questions.',
  },
  {
    title: 'Onboarding runbook',
    description: 'A written guide your team can follow after go-live — prompts, examples, and conventions.',
  },
  {
    title: '30-day launch support',
    description: 'Hands-on help while your team adopts the workbench across real enquiries.',
  },
];

export const ONBOARDING_STEPS = [
  {
    step: '01',
    week: 'Day 0',
    title: 'Register your team',
    description: 'Submit the registration form with your company, role, team size, repos, and preferred kickoff window.',
    duration: '5 minutes',
    deliverable: 'Registration received',
  },
  {
    step: '02',
    week: 'Day 1–2',
    title: 'Confirmation & kickoff',
    description: 'We confirm within one business day, send an invoice or agreement, and schedule a 30-minute kickoff call.',
    duration: '30 min call',
    deliverable: 'Kickoff scheduled + access checklist',
  },
  {
    step: '03',
    week: 'Week 1',
    title: 'Registry & knowledge setup',
    description: 'Together we configure your service registry, sibling repo paths, and starter knowledge docs for your domain.',
    duration: '1–2 sessions',
    deliverable: 'Configured `service-registry.yaml` + knowledge stubs',
  },
  {
    step: '04',
    week: 'Week 2',
    title: 'Team training brown-bag',
    description: 'Live session for your engineers: run a real enquiry end-to-end — evidence, risk, recommendation, compose draft.',
    duration: '90 minutes',
    deliverable: 'Recorded session + shared slides',
  },
  {
    step: '05',
    week: 'Weeks 3–4',
    title: 'Go-live & office hours',
    description: 'Your team runs real investigations. Two office-hour sessions cover tuning, edge cases, and workflow gaps.',
    duration: '2× 45 min',
    deliverable: 'Tuned prompts + team runbook',
  },
  {
    step: '06',
    week: 'Ongoing',
    title: 'Priority support',
    description: 'Email support continues on your Team plan. Upgrade to Enterprise for SSO, custom integrations, and SLA.',
    duration: 'Monthly',
    deliverable: '1 business day response SLA',
  },
];

export const SUPPORT_DETAILS = {
  channel: 'Email',
  address: 'iman.suherman@gmail.com',
  responseTime: 'Within 1 business day',
  urgentResponseTime: 'Same day for launch blockers (first 30 days)',
  hours: 'Mon–Fri, 9am–5pm AEST/AEDT',
  escalation: 'Reply with [URGENT] in the subject for launch blockers during your first month.',
  included: [
    'Setup and configuration questions',
    'Workflow and prompt tuning',
    'Registry and knowledge base updates',
    'Brown-bag and office-hour scheduling',
    'Compose template customisation',
    'Launch blocker triage (first 30 days)',
  ],
  notIncluded: [
    'Application code changes in your product repos',
    'On-call incident response or pager duty',
    'Custom agent, MCP, or integration development',
    'SSO, compliance, or enterprise SLA (see Enterprise plan)',
  ],
};

export const TEAM_FAQ = [
  {
    question: 'How does registration work?',
    answer:
      'Submit the registration form on this page. You receive a confirmation email and we notify our team at iman.suherman@gmail.com. We confirm within one business day and send next steps.',
  },
  {
    question: 'Do you store my form data?',
    answer:
      'Form submissions are sent by email only — we do not store registration data in a database on workbench.suherman.net.',
  },
  {
    question: 'Do we need Jira or ServiceNow to use the workbench?',
    answer:
      'No. Setup is clone + fill service-registry.yaml + investigate. Jira is optional: paste tickets for analysis, or sync open incidents with an API token into context/active-incidents.md. See /setup and knowledge/integrations/jira.md.',
  },
  {
    question: 'Where does the service registry come from — Terraform or Helm?',
    answer:
      'The registry is always knowledge/service-registry.yaml. Draft from sibling folders, gh, Terraform/Helm hints, or by hand. For many repos use the unitized bootstrap (plan + one service per turn) so quota limits do not kill a half-finished setup — workflows/bootstrap-knowledge.md. Infra sources are discovery hints, not a live feed from Terraform state.',
  },
  {
    question: 'Do you offer Airflow or Jenkins for the incident → MR loop?',
    answer:
      'Open source includes a local prompt chain (npm run incident:chain) plus the incident-to-MR playbook. Jenkins/GitHub Actions packs are easy mounts for teams. Airflow DAGs are reserved for paying Team/Enterprise customers who already run Airflow — same stage contract, different scheduler. See knowledge/architecture/incident-pipeline.md.',
  },
  {
    question: 'Can we start on Open Source and upgrade later?',
    answer:
      'Yes. Many teams clone the repo first, then upgrade to Team when they want hands-on registry setup and training.',
  },
  {
    question: 'What do we need before kickoff?',
    answer:
      'A list of repositories and services your team investigates, who owns each, and at least one real enquiry you want the workbench to handle. Optional: Terraform/Helm paths or Jira access if you want those wired during onboarding.',
  },
  {
    question: 'How is billing handled?',
    answer:
      'Month-to-month by default. Annual billing saves two months. Invoice sent after kickoff confirmation.',
  },
];

export const REGISTRATION_FIELDS = [
  { id: 'name', label: 'Your name', type: 'text', required: true, placeholder: 'Iman Suherman' },
  { id: 'email', label: 'Work email', type: 'email', required: true, placeholder: 'you@company.com' },
  { id: 'role', label: 'Your role', type: 'text', required: true, placeholder: 'e.g. Engineering Manager, Staff Engineer' },
  { id: 'company', label: 'Company / team name', type: 'text', required: true, placeholder: 'Acme Engineering' },
  {
    id: 'teamSize',
    label: 'Engineers on team',
    type: 'select',
    required: true,
    options: ['1–5', '6–10', '11–25', '26–50', '50+'],
  },
  {
    id: 'repos',
    label: 'Repositories or services to map',
    type: 'text',
    required: true,
    placeholder: 'e.g. checkout-api, payments-api, edge-gateway',
  },
  {
    id: 'kickoff',
    label: 'Preferred kickoff window',
    type: 'select',
    required: true,
    options: ['This week', 'Next 2 weeks', 'This month', 'Next month', 'Flexible'],
  },
  {
    id: 'billing',
    label: 'Billing preference',
    type: 'select',
    required: true,
    options: ['Monthly', 'Annual (2 months free)', 'Not sure yet'],
  },
  {
    id: 'notes',
    label: 'Goals or questions (optional)',
    type: 'textarea',
    required: false,
    placeholder: 'What enquiries do you want the workbench to help with first?',
  },
] as const;
