# Demo investigation prompt

Paste this into Cursor (or Copilot Chat) after running `npm run demo`.

---

Follow `AGENTS.md` and `prompts/investigate.md`.

Investigate this demo enquiry. The services are fictional — use the sample registry at `knowledge/service-registry.yaml` for navigation only. If sibling repos are not checked out locally, say so and describe what you would inspect on GitHub.

```text
Can we push the edge gateway change for checkout-api this week?
Is anyone actively developing on checkout or payments?
```

Produce the standard output template:

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

Do not send messages or modify repositories.
