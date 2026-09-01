#!/usr/bin/env node
/**
 * Optional: pull active incidents from Jira Service Management or ServiceNow
 * into context/active-incidents.md.
 *
 * Not required for the workbench to run. Secrets stay in env / .env (gitignored).
 *
 * Usage:
 *   cp .env.example .env   # fill credentials
 *   npm run sync:incidents -- --provider jira
 *   npm run sync:incidents -- --provider servicenow
 *   npm run sync:incidents -- --provider jira --dry-run
 *
 * Env (Jira):
 *   JIRA_BASE_URL          e.g. https://your-domain.atlassian.net
 *   JIRA_EMAIL             Atlassian account email
 *   JIRA_API_TOKEN         https://id.atlassian.com/manage-profile/security/api-tokens
 *   JIRA_JQL               optional override (default: open high-priority incidents-ish)
 *
 * Env (ServiceNow):
 *   SERVICENOW_INSTANCE    e.g. https://yourinstance.service-now.com
 *   SERVICENOW_USER
 *   SERVICENOW_PASSWORD    or app password / basic auth pair
 *   SERVICENOW_QUERY       optional encoded query override
 */

const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "context", "active-incidents.md");
const ENV_FILE = path.join(ROOT, ".env");

function loadDotEnv(filePath) {
  if (!fs.existsSync(filePath)) return;
  const text = fs.readFileSync(filePath, "utf8");
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

function parseArgs(argv) {
  let provider = "";
  let dryRun = false;
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--provider" && argv[i + 1]) provider = argv[++i].toLowerCase();
    else if (a === "--dry-run") dryRun = true;
    else if (a === "-h" || a === "--help") {
      console.log(`Usage: npm run sync:incidents -- --provider jira|servicenow [--dry-run]

Writes context/active-incidents.md from ITSM (optional integration).
Copy .env.example → .env and set credentials first.
`);
      process.exit(0);
    }
  }
  return { provider, dryRun };
}

function requireEnv(keys) {
  const missing = keys.filter((k) => !process.env[k]);
  if (missing.length) {
    console.error(`Missing env: ${missing.join(", ")}`);
    console.error("Copy .env.example → .env and fill values, or export them in your shell.");
    process.exit(1);
  }
}

function basicAuth(user, pass) {
  return `Basic ${Buffer.from(`${user}:${pass}`).toString("base64")}`;
}

async function fetchJson(url, headers) {
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText} for ${url}\n${body.slice(0, 400)}`);
  }
  return res.json();
}

function renderMarkdown(incidents, sourceLabel) {
  const stamp = new Date().toISOString();
  const lines = [
    "# active-incidents",
    "",
    `<!-- synced from ${sourceLabel} at ${stamp} — edit carefully; re-sync overwrites generated body -->`,
    "",
  ];
  if (!incidents.length) {
    lines.push("_No open incidents matched the sync filter._");
    lines.push("");
    return lines.join("\n");
  }
  for (const inc of incidents) {
    lines.push(`## ${inc.id} — ${inc.title}`);
    lines.push(`- Started: ${inc.started || "unknown"}`);
    lines.push(`- Severity: ${inc.severity || "unknown"}`);
    lines.push(`- Services: ${inc.services || "TODO: map to service-registry"}`);
    lines.push(`- Status: ${inc.status || "unknown"}`);
    if (inc.link) lines.push(`- Link: ${inc.link}`);
    if (inc.notes) lines.push(`- Notes: ${inc.notes}`);
    lines.push("");
  }
  lines.push(
    "How this file is filled: `knowledge/integrations/incident-sources.md`."
  );
  lines.push("");
  return lines.join("\n");
}

async function fromJira() {
  requireEnv(["JIRA_BASE_URL", "JIRA_EMAIL", "JIRA_API_TOKEN"]);
  const base = process.env.JIRA_BASE_URL.replace(/\/$/, "");
  const jql =
    process.env.JIRA_JQL ||
    'issuetype = Incident AND statusCategory != Done AND priority in ("Highest","High") ORDER BY priority ASC, updated DESC';
  const url = `${base}/rest/api/3/search?maxResults=25&fields=summary,status,priority,created,updated,components&jql=${encodeURIComponent(jql)}`;
  const data = await fetchJson(url, {
    Accept: "application/json",
    Authorization: basicAuth(process.env.JIRA_EMAIL, process.env.JIRA_API_TOKEN),
  });
  const issues = data.issues || [];
  return issues.map((issue) => {
    const f = issue.fields || {};
    const components = (f.components || []).map((c) => c.name).filter(Boolean);
    return {
      id: issue.key,
      title: f.summary || "(no summary)",
      started: f.created || "",
      severity: (f.priority && f.priority.name) || "",
      status: (f.status && f.status.name) || "",
      services: components.length ? components.join(", ") : "",
      link: `${base}/browse/${issue.key}`,
      notes: f.updated ? `updated ${f.updated}` : "",
    };
  });
}

async function fromServiceNow() {
  requireEnv(["SERVICENOW_INSTANCE", "SERVICENOW_USER", "SERVICENOW_PASSWORD"]);
  const base = process.env.SERVICENOW_INSTANCE.replace(/\/$/, "");
  const query =
    process.env.SERVICENOW_QUERY ||
    "active=true^priorityIN1,2^ORDERBYpriority";
  const url = `${base}/api/now/table/incident?sysparm_query=${encodeURIComponent(query)}&sysparm_limit=25&sysparm_fields=number,short_description,priority,state,opened_at,sys_updated_on,cmdb_ci`;
  const data = await fetchJson(url, {
    Accept: "application/json",
    Authorization: basicAuth(process.env.SERVICENOW_USER, process.env.SERVICENOW_PASSWORD),
  });
  const rows = data.result || [];
  return rows.map((row) => ({
    id: row.number || row.sys_id || "INC",
    title: row.short_description || "(no summary)",
    started: row.opened_at || "",
    severity: row.priority != null ? `P${row.priority}` : "",
    status: row.state || "",
    services: (row.cmdb_ci && (row.cmdb_ci.display_value || row.cmdb_ci.value)) || "",
    link: `${base}/nav_to.do?uri=incident.do?sys_id=${row.sys_id || ""}`,
    notes: row.sys_updated_on ? `updated ${row.sys_updated_on}` : "",
  }));
}

async function main() {
  loadDotEnv(ENV_FILE);
  const { provider, dryRun } = parseArgs(process.argv.slice(2));
  if (!provider || !["jira", "servicenow"].includes(provider)) {
    console.error("Pass --provider jira or --provider servicenow");
    process.exit(1);
  }

  const incidents =
    provider === "jira" ? await fromJira() : await fromServiceNow();
  const md = renderMarkdown(incidents, provider);

  if (dryRun) {
    console.log(md);
    console.error(`\nDry run: ${incidents.length} incident(s); did not write ${OUT}`);
    return;
  }

  fs.writeFileSync(OUT, md, "utf8");
  console.log(`Wrote ${incidents.length} incident(s) → ${path.relative(ROOT, OUT)}`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
