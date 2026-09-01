# AI Engineering Workbench

Open-source, AI-assisted engineering workbench for multi-repository investigation.

This repository is a **knowledge and workflow hub**. It helps Cursor / Copilot (or similar agents) reduce manual context discovery when an enquiry spans several repos, shared infra, GitHub activity, and tickets — while keeping a human as the decision maker.

It is tooling for engineers, not an autonomous agent. The agent investigates; you review evidence and copy/paste any external reply.

## Principles

- **Evidence first** — live repositories and infrastructure remain the source of truth.
- **Agent investigates** — gather technical evidence across repos, branches, PRs, tickets, and patterns.
- **Composer helps communicate** — turn reviewed findings into clearer stakeholder messages (Chat, Jira, support).
- **Engineer decides** — evidence, recommendations, risk, and external communication are always human-reviewed.
- **Nothing is automatically sent or changed** — assisted workflow, not an autonomous engineering agent.

## Core concept

```
                 Engineer question
                        |
                        v
              ai-engineering-workbench
                        |
          +-------------+-------------+
          |             |             |
          v             v             v
     Repository     Infrastructure   Existing
     activity       configuration    patterns
          \             |             /
           +------------+------------+
                        |
                        v
              Consolidated finding
                        |
                        v
              Optional compose draft
                        |
                        v
                  Human review
                        |
                        v
                    Copy/paste
```

## Repository layout

```
ai-engineering-workbench/
├── AGENTS.md                 # Agent investigation rules
├── .cursor/rules/            # Cursor always-on rules
├── knowledge/                # Curated architecture & service model (fill with YOUR domain)
│   ├── service-registry.yaml # Machine-readable service → repo map
│   ├── architecture/
│   ├── integrations/
│   ├── services/
│   ├── infrastructure/
│   └── glossary.md
├── context/                  # Living sprint / incident / decision notes
├── prompts/                  # Reusable investigation & compose prompts
├── workflows/                # End-to-end playbooks
├── communications/           # Inbox, investigation notes, archive
├── scripts/                  # start.sh + demo.sh bootstrap helpers
├── examples/                 # Sample enquiry for a fictional demo platform
└── .github/
    ├── copilot-instructions.md
    ├── instructions/
    ├── prompts/
    └── skills/
```

## Try the demo (self-serve)

No booking required — run a fictional checkout investigation in Cursor or Copilot:

```bash
git clone https://github.com/iman-suherman/ai-engineering-workbench.git
cd ai-engineering-workbench
npm run demo
```

Then paste `examples/demo-cursor-prompt.md` into your agent. Full steps: `workflows/try-demo.md` · https://workbench.suherman.net/demo

For a **guided live session**, use the [contact form](https://workbench.suherman.net/contact?intent=live-demo).

## Quick start

1. Clone this repo next to the application repos you investigate.
2. Replace the sample entries in `knowledge/service-registry.yaml` with your services.
3. Add short docs under `knowledge/` for domains that matter to your team.
4. Open the folder in Cursor (or use Copilot with `.github/copilot-instructions.md`).
5. Paste a request into `communications/inbox/` or run:

```bash
npm run start -- --request "Can we ship the API gateway change for checkout?"
```

6. Point the agent at `AGENTS.md` + `prompts/investigate.md`.
7. Review Finding / Evidence / Risk / Recommendation.
8. Optionally compose a reply with `prompts/compose-chat-response.md` — then copy/paste yourself.

## Customize for your org

Setup order and where integrations plug in: [`knowledge/setup-and-integrations.md`](knowledge/setup-and-integrations.md) · site: [workbench.suherman.net/setup](https://workbench.suherman.net/setup).

| Replace | With |
|---------|------|
| Sample services in `knowledge/service-registry.yaml` | Your real service → repo map (`prompts/fill-service-registry.md` or `-from-infra` for Terraform/Helm) |
| `knowledge/local-repos.md` sibling paths | Your local checkout layout |
| `context/*` placeholders | Your sprint / incident notes (optional: `npm run sync:incidents`) |
| Compose prompt channel names | Slack, Teams, Chat, email — whatever you use |

Keep proprietary architecture, credentials, and customer data **out** of any public fork.

## Example flow

Question: *Is anyone actively changing the checkout API, and can we push the gateway config?*

1. Resolve `checkout-api` via the registry.
2. Inspect the live repo (commits, PRs, branches).
3. Inspect related gateway / infra config.
4. Produce Finding / Evidence / Risk / Recommendation.
5. Draft a short Chat reply for human review.

## Marketing website

A static landing page lives in [`website/`](website/) at **https://workbench.suherman.net** after deploy.

```bash
npm run deploy:website                              # Cloud Run (GHCR)
cd ../suherman-net-infra && npm run cloudflare:workbench  # DNS + Worker
```

Local preview: `cd website && npm install && npm run dev`

## License

GPL-3.0 — see [LICENSE](LICENSE).
