# Workflow: production incident

1. Capture symptoms, start time, and blast radius in `communications/inbox/`.
2. Check `context/active-incidents.md`.
3. Resolve services via the registry; inspect live logs/metrics outside this repo.
4. Use `prompts/investigate.md` with incident urgency.
5. Produce Finding / Evidence / Risk / Recommended action quickly.
6. Draft stakeholder updates with a compose prompt — human sends.
