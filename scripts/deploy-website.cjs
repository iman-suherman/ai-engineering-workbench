/**
 * Deploy the Astro marketing website to Cloud Run from a GHCR image.
 */
const { spawnSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { getDeployTarget } = require("./deploy-config.cjs");
const { recordDirectDeployOutcome } = require("./deploy-record-direct.cjs");

const root = path.join(__dirname, "..");
const websiteDir = path.join(root, "website");
const shell = process.platform === "win32";
const DEPLOY_REPO = "workbench-website";
const DEPLOY_NPM_SCRIPT = "deploy:website";
const deployTarget = getDeployTarget(DEPLOY_REPO);
const deployStartedAt = new Date().toISOString();

function recordDeploy(status, { exitCode = 0, error = null, activityMessage = null } = {}) {
  recordDirectDeployOutcome({
    repo: DEPLOY_REPO,
    label: deployTarget?.label,
    npmScript: DEPLOY_NPM_SCRIPT,
    status,
    startedAt: deployStartedAt,
    exitCode,
    error,
    activityMessage,
  });
}

function fail(message) {
  recordDeploy("failure", { exitCode: 1, error: message });
  console.error(`deploy:website: ${message}`);
  process.exit(1);
}

function requireGhcrDeploy() {
  const candidates = [
    process.env.SUHERMAN_NET_INFRA_ROOT?.trim(),
    path.join(os.homedir(), "src", "personal", "suherman-net-infra"),
  ].filter(Boolean);
  for (const infraRoot of candidates) {
    const helper = path.join(infraRoot, "scripts", "lib", "ghcr-cloudrun-deploy.cjs");
    if (fs.existsSync(helper)) return require(helper);
  }
  fail(
    "suherman-net-infra not found. Set SUHERMAN_NET_INFRA_ROOT or clone to ~/src/personal/suherman-net-infra",
  );
}

function run(command, args, options = {}) {
  const r = spawnSync(command, args, {
    stdio: "inherit",
    cwd: options.cwd || root,
    shell,
    env: process.env,
  });
  if (r.error) throw r.error;
  if (r.status !== 0) {
    recordDeploy("failure", {
      exitCode: r.status ?? 1,
      error: `${command} exited ${r.status ?? 1}`,
    });
    process.exit(r.status ?? 1);
  }
}

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const values = {};
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    values[key] = value;
  }
  return values;
}

function resolveAlocareNotificationEnv() {
  const explicit = process.env.ALOCARE_NOTIFICATION_SERVICE_ROOT?.trim();
  if (explicit) {
    return path.join(explicit, ".env");
  }
  const candidates = [
    path.join(os.homedir(), "src", "alocare.ai", "alocare-notification-service", ".env"),
    path.join(root, "..", "alocare.ai", "alocare-notification-service", ".env"),
  ];
  return candidates.find((candidate) => fs.existsSync(candidate)) || candidates[0];
}

function resolveSmtpEnv() {
  const defaults = {
    SMTP_HOST: "smtp.gmail.com",
    SMTP_PORT: "587",
    SMTP_USER: "suherman.fb@gmail.com",
    EMAIL_FROM_NAME: "AI Engineering Workbench",
    EMAIL_FROM_ADDRESS: "suherman.fb@gmail.com",
  };

  const alocareEnv = parseEnvFile(resolveAlocareNotificationEnv());
  const websiteEnv = parseEnvFile(path.join(websiteDir, ".env"));

  function pick(key) {
    return (
      process.env[key]?.trim() ||
      websiteEnv[key]?.trim() ||
      alocareEnv[key]?.trim() ||
      defaults[key] ||
      ""
    );
  }

  return {
    SMTP_HOST: pick("SMTP_HOST"),
    SMTP_PORT: pick("SMTP_PORT"),
    SMTP_USER: pick("SMTP_USER"),
    SMTP_PASS: pick("SMTP_PASS"),
    EMAIL_FROM_NAME: pick("EMAIL_FROM_NAME"),
    EMAIL_FROM_ADDRESS: pick("EMAIL_FROM_ADDRESS"),
  };
}

function resolveGcpProjectId() {
  return process.env.GCP_PROJECT_ID?.trim() || "personal-suherman";
}

function main() {
  const projectId = resolveGcpProjectId();
  const region = process.env.GCP_LOCATION?.trim() || "australia-southeast1";
  const serviceName = process.env.WEBSITE_SERVICE?.trim() || "workbench-website";

  console.log("deploy:website: building Astro site locally…");
  run("npm", ["run", "build"], { cwd: websiteDir });

  const { buildAndPushImage } = requireGhcrDeploy();
  let image;
  try {
    image = buildAndPushImage({
      cwd: root,
      contextDir: websiteDir,
      imageName: "workbench-website",
      platform: process.env.GHCR_PLATFORM?.trim() || "linux/amd64",
      logPrefix: "deploy:website",
    });
  } catch (error) {
    fail(error.message || String(error));
  }

  console.log(`deploy:website: deploying ${serviceName} ← ${image} (${region})…`);

  const smtp = resolveSmtpEnv();
  const envVars = [
    `SMTP_HOST=${smtp.SMTP_HOST}`,
    `SMTP_PORT=${smtp.SMTP_PORT}`,
    `SMTP_USER=${smtp.SMTP_USER}`,
    `EMAIL_FROM_NAME=${smtp.EMAIL_FROM_NAME}`,
    `EMAIL_FROM_ADDRESS=${smtp.EMAIL_FROM_ADDRESS}`,
  ];

  if (smtp.SMTP_PASS) {
    envVars.push(`SMTP_PASS=${smtp.SMTP_PASS}`);
  }

  const deployArgs = [
    "run",
    "deploy",
    serviceName,
    "--image",
    image,
    "--project",
    projectId,
    "--region",
    region,
    "--allow-unauthenticated",
    "--quiet",
    "--update-env-vars",
    envVars.join(","),
    "--min-instances",
    process.env.WORKBENCH_MIN_INSTANCES?.trim() || "1",
  ];

  if (!smtp.SMTP_PASS) {
    console.warn(
      "deploy:website: warning — SMTP_PASS not set; contact forms will fail until configured (check alocare-notification-service/.env)",
    );
  }

  run("gcloud", deployArgs);

  console.log("deploy:website: done");
  recordDeploy("success", { exitCode: 0 });
  console.log("deploy:website: provision DNS with: cd ../suherman-net-infra && npm run cloudflare:workbench");
}

main();
