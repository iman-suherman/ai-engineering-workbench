# Bootstrap knowledge — plan (cheap inventory)

Run this **once** before unit runs. Goal: build a queue only — no deep repo scans, no bulk knowledge writes.

Token goal: list siblings + skim names. Stay shallow so a quota hit does not waste a half-written estate.

---

## Prompt

```text
Run knowledge bootstrap PLAN only (no deep scans).

1. Read context/knowledge-bootstrap-progress.md.
2. List sibling directories next to this workbench (parent folder). Skip junk
   (node_modules, build, .git-only, hidden tooling unless it is clearly a service repo).
3. For each candidate, do at most:
   - folder name
   - whether README.md / package.json / pom.xml / build.gradle* exists (existence only)
   - optional: first ~20 lines of README if present — stop early
4. Do NOT read source trees, Terraform state, or full Helm values in this plan pass.
5. Propose a queue of 4–20 services we actually investigate (ask me to trim if too many).
6. Write/update context/knowledge-bootstrap-progress.md:
   - Status table: Mode = planned
   - Queue rows: service_key, local_path, status=pending
   - Clear stale demo-only rows if I say we are replacing samples
7. Show the queue for my approval. Do not start unit work in this turn.
8. Stop.

Optional inputs:
- Must-include: …
- Exclude: …
- Prefer parent-child path: …
```

---

## After plan

1. Edit the queue (drop noise, rename keys).
2. Run `prompts/bootstrap-knowledge-unit.md` once per service (new chat turn each time is safest for quota).
