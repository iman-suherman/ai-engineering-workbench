# Workflow: production incident

1. Capture symptoms, start time, and blast radius in `communications/inbox/`.
2. Check `context/active-incidents.md`.
3. Resolve services via the registry; inspect live logs/metrics outside this repo.
4. Use `prompts/investigate.md` with incident urgency.
5. Produce Finding / Evidence / Risk / Recommended action quickly.
6. Draft stakeholder updates with a compose prompt — human sends.

When the next step is a **code fix + MR** (human reviews, no auto-merge), continue with
`workflows/incident-to-mr.md` and `prompts/incident-to-mr.md`.
