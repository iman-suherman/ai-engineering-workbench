# Workflow: investigate request

## 1. Capture

Paste the request into `communications/inbox/` or keep it in the agent chat.

## 2. Orient

- Read `AGENTS.md`.
- Resolve services via `knowledge/service-registry.yaml`.
- Skim relevant knowledge docs and `context/`.

## 3. Investigate

- Use `prompts/investigate.md`.
- Inspect sibling checkouts and remotes/PRs.

## 4. Consolidate

Finding / Evidence / Affected services / Conflicting development /
Implementation / Risk / Recommended action / Deadline / Communication points

## 5. Communicate (optional)

Hand findings to a compose prompt. Human reviews and copy/pastes.

## 6. Close

Update `context/current-investigations.md` if tracked. Archive inbox material when done.
