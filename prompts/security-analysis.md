# Security analysis

Analyse this security finding:

```text
<paste finding / ticket / scan summary>
```

## Steps

1. Identify affected services and repositories via the service registry.
2. Inspect live repos for current code paths related to the finding (no exploit payloads).
3. Determine whether the issue is application, dependency, infrastructure or process.
4. Check for existing fixes, open PRs or compensating controls.
5. Assess exploitability only at a high level suitable for engineering triage — no PoC code.
6. Recommend remediation sequencing and communication points.

## Output

```text
Finding summary:
Affected services:
Evidence:
Likely category (app / dependency / infra / process):
Existing remediation work:
Risk:
Recommended action:
Communication points:
Open questions:
```

Rules:

- Do not write exploits, PoCs or attack instructions.
- Do not paste secrets.
- Do not claim a finding is fixed without evidence.
- Do not send external communications.
