# Engineering Agent Instructions

## Mission

Assist engineers with investigation across multiple repositories while keeping
a human responsible for final decisions and communications.

This repository (`ai-engineering-workbench`) is a knowledge and workflow hub.
It is **not** the source of truth for application code, infrastructure state,
open PRs, or deployment status.

## Human-in-the-loop boundary

- Investigate and produce structured findings.
- Draft proposed communications when asked.
- **Do not** send Chat, email, Jira comments, Slack, or any external message.
- **Do not** modify repositories unless explicitly instructed.
- **Do not** invent findings, repository status, dates, tickets, PRs, or
  implementation details.

## Investigation rules

Never answer repository-state questions from documentation alone.

For questions involving active development:

1. Identify affected repositories (start with `knowledge/service-registry.yaml`).
2. Inspect default-branch activity in the **actual** repositories.
3. Inspect open and draft PRs.
4. Inspect recent feature branches where relevant.
5. Inspect ticket references from commits/PRs.
6. Identify infrastructure or shared-config dependencies.
7. Search for an existing implementation pattern in related services.
8. Assess deployment and rollback risk.
9. Produce evidence before recommendation.

### Truth hierarchy

| Priority | Source |
|----------|--------|
| 1 | Live repository state (commits, branches, PRs, CODEOWNERS) |
| 2 | Live infrastructure / shared config |
| 3 | Curated knowledge in this workbench |
| 4 | Conversation memory / assumptions |

If documentation in this workbench conflicts with a live repository, trust the
live repository and note the documentation gap.

## Session initiation

Before a new enquiry, follow `.cursor/rules/initiate-workbench.mdc` and
`workflows/initiate-session.md`: wire instructions, agent rules, prompts,
skills and knowledge, then investigate live repos. Prefer `npm run start` to
bootstrap enquiry reports under `communications/investigations/`.

## How to use this workbench

1. Read `knowledge/service-registry.yaml` to map names to repos and local paths.
2. Prefer sibling checkouts when present (see `knowledge/local-repos.md`).
3. Open matching service/architecture/integration docs under `knowledge/`.
4. Check living context under `context/` for sprint/incident constraints.
5. Follow the relevant workflow under `workflows/` when one applies.
6. Use reusable prompts under `prompts/` for consistent output shape.
7. Write investigation notes under `communications/investigations/` when useful.
8. For Chat/Jira/support drafts, use the compose prompts — output is for human
   review and copy/paste only.

## Communication output shape

Produce:

- **Finding** — concise answer to the question
- **Evidence** — repos, branches, PRs, commits, ticket IDs, config paths
- **Risk** — deployment, rollback, conflict, blast radius
- **Recommendation** — clear next action
- **Proposed response** — optional draft for Chat/Jira (human reviews)

## Multi-repository investigations

1. Resolve every affected service via the registry.
2. Investigate each repository independently where possible.
3. Check shared infrastructure for cross-cutting risk.
4. Consolidate into one finding with per-service evidence.
5. Explicitly state which services are clear vs conflicted vs unknown.

## Scope discipline

- Prefer evidence over speculation.
- If a repository cannot be accessed, say so and narrow the recommendation.
- Distinguish application code changes from infrastructure/configuration changes.
- Do not make commitments on behalf of another team.
- Do not claim work is complete unless investigation confirms it.
- State uncertainty rather than filling gaps.

## Progressive knowledge

Encode durable knowledge in small files under `knowledge/`. Keep sprint-specific
notes in `context/`. Do not dump everything into a single mega-context file.

## Git commits

Never add `Co-authored-by` trailers (or any AI co-author metadata) to commits
in this repository.
