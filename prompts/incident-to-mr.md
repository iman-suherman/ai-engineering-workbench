# Incident → MR

Run the AI-native incident loop: evidence → root cause → fix → open MR.
Human reviews and adjusts. **Do not merge. Do not send external messages.**

Full playbook: `workflows/incident-to-mr.md`.

Incident / symptoms:

```text
<paste incident ID, symptoms, start time, severity, blast radius>
```

Optional human constraints:

```text
Phase: <0-capture | 1-orient | 2-evidence | 3-fix | 4-mr | 5-handoff | all-with-checkpoints>
Services allowed to patch: <registry keys or "propose first">
Log source: <datadog | gcp | kubectl | paste | other>
PR style: draft (default) | ready
```

---

## Prompt

```text
Execute incident → MR for the incident pasted above.

Truth hierarchy: live logs/metrics and live repos > workbench knowledge > chat memory.
Use knowledge/service-registry.yaml and knowledge/services/* only for navigation.

Global bans:
- Do not merge any PR/MR.
- Do not push to main/master/protected default branches.
- Do not send Chat, Slack, Jira, or email.
- Do not invent log lines, metrics, or stack traces.
- Do not start phase 3 (fix) until I approve the RCA from phase 2,
  unless I explicitly set Phase to include fix without checkpoint.
- Prefer the smallest fix; no unrelated refactors.

Phase 1 — Orient:
- Resolve affected services + local_path.
- Name which checkouts you will read.

Phase 2 — Evidence:
- Gather recent logs/metrics for the incident window (use configured MCP/CLI, or ask me to paste).
- Correlate with recent commits/PRs/deploys on those services.
- Write RCA with Evidence (log queries/pointers, SHAs, file paths).
- Save a short note under communications/investigations/ if useful.
- STOP and wait for my OK before coding — unless I waived the checkpoint.

Phase 3 — Fix (after OK):
- Patch only approved services.
- Minimal change + focused test when practical.
- Summarize diff intent before committing if I did not say auto-approve fix.

Phase 4 — MR:
- Branch from the service default branch (state ref).
- Commit without Co-authored-by or AI trailers.
- gh pr create --draft (or ready if I asked) with Summary, Test plan, Rollback.
- Return the PR URL. Do not merge.

Phase 5 — Handoff:
- Bullet list: what human should verify, rollback switch, who to notify.
- Optional compose draft only if I ask — I will send it.

If logs are unavailable: say blocked, list exact commands/queries I should run or paste, stop.
If multiple root causes are plausible: rank them; fix only the top one I approve.
```

---

## Output shape (every phase)

```text
Phase:
Finding:
Evidence:
Affected services:
Root cause hypothesis:
Fix plan:
Risk / blast radius:
PR:
Blocked on:
Next human action:
```
