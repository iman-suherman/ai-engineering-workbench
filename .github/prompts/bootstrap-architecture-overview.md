# Bootstrap architecture overview (separate pass)

Run **after** enough service units are `done`. Connect per-service internal architecture notes into one overall picture.

Token-effective by design: read **only** curated knowledge files — do **not** re-scan sibling repos.

Prereq: several `knowledge/services/*.md` with `## Internal architecture` (from unit bootstrap).

---

## Prompt

```text
Synthesize overall architecture from existing knowledge only.

Hard limits:
- Do NOT scan sibling application repos in this turn.
- Inputs allowed:
  - knowledge/service-registry.yaml
  - knowledge/services/*.md (all done units)
  - knowledge/local-repos.md (optional)
  - existing knowledge/architecture/* (optional, to merge/replace sample)
- Do not invent services, edges, or data stores that no service note mentions.
- If two notes conflict, note the conflict under Gaps — do not pick a winner silently.
- Keep the overview short enough for agent orientation (not a design thesis).

Steps:
1. Read registry + every knowledge/services/*.md that has real content (skip empty stubs if any).
2. Build:
   - one text diagram (boxes/arrows) of runtime/request or domain flow
   - shared data stores / tables only when multiple services evidence them
   - integration edges (sync/async) from Inbound/Outbound bullets
   - list of services still missing Internal architecture
3. Show the proposed markdown for approval.
4. After approval, write knowledge/architecture/overview.md (replace sample fiction if we are on real services).
5. Optionally add knowledge/architecture/<domain>.md only if one cluster is clearly separable and I asked for it.
6. Update context/knowledge-bootstrap-progress.md Status notes: architecture overview = done (date).
7. Stop.

Write overview.md with sections: Context, Diagram (fenced text diagram),
Services table (Service | Role | Key deps), Shared data / coupling,
Integration style, Gaps / unknowns.
```

---

## When to re-run

- After several new unit bootstraps.
- After a major split (e.g. shared DB decoupling) when service notes were updated.
- Do not re-run on every single unit unless the human asks.
