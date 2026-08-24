/**
 * Deploy the Astro marketing website to Cloud Run via Artifact Registry.
 *
 * Uses australia-southeast1-docker.pkg.dev/personal-suherman/cloudrun (not GHCR).
 * GHCR remote is not configured for this service; AR is the reliable local path.
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
const DEFAULT_PLATFORM = "linux/amd64";
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

function which(bin) {
  const r = spawnSync(process.platform === "win32" ? "where" : "which", [bin], {
    encoding: "utf8",
  });
  return r.status === 0 ? (r.stdout || "").trim().split(/\r?\n/)[0] : null;
}

function runCapture(command, args, options = {}) {
  const r = spawnSync(command, args, {
    stdio: ["ignore", "pipe", "pipe"],
    cwd: options.cwd || root,
    env: command === "gcloud" ? gcloudEnv() : options.env || process.env,
    shell,
    encoding: "utf8",
  });
  if (r.error) throw r.error;
  return {
    status: r.status ?? 1,
    stdout: (r.stdout || "").trim(),
    stderr: (r.stderr || "").trim(),
  };
}

const DEFAULT_GCP_ACCOUNT = "iman.suherman@gmail.com";
const DEFAULT_GCP_PROJECT = "personal-suherman";

function gcloudEnv() {
  const account =
    process.env.GCP_ACCOUNT?.trim() ||
    process.env.WORKBENCH_GCP_ACCOUNT?.trim() ||
    DEFAULT_GCP_ACCOUNT;
  return {
    ...process.env,
    CLOUDSDK_CORE_ACCOUNT: account,
    CLOUDSDK_CORE_PROJECT: process.env.GCP_PROJECT_ID?.trim() || DEFAULT_GCP_PROJECT,
  };
}

function run(command, args, options = {}) {
  const r = spawnSync(command, args, {
    stdio: "inherit",
    cwd: options.cwd || root,
    shell,
    env: command === "gcloud" ? gcloudEnv() : options.env || process.env,
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

function containerResponds(cli) {
  return runCapture(cli, ["info"]).status === 0;
}

function ensurePodmanMachine() {
  if (!which("podman")) return false;
  if (containerResponds("podman")) return true;
  console.log("deploy:website: restarting podman machine…");
  runCapture("podman", ["machine", "stop"]);
  const start = runCapture("podman", ["machine", "start"]);
  if (start.status !== 0) {
    fail(
      `podman machine start failed: ${start.stderr || start.stdout || "unknown error"}`,
    );
  }
  return containerResponds("podman");
}

function resolveContainerCli() {
  const forced = process.env.CONTAINER_CLI?.trim();
  if (forced) {
    if (!which(forced)) fail(`CONTAINER_CLI=${forced} not found on PATH`);
    if (!containerResponds(forced) && forced === "podman") {
      ensurePodmanMachine();
    }
    if (!containerResponds(forced)) {
      fail(`${forced} is installed but not running (try: podman machine start)`);
    }
    return forced;
  }

  // Prefer podman when docker is a dead stub (common on macOS with podman machine).
  if (which("podman")) {
    if (containerResponds("podman")) return "podman";
    if (ensurePodmanMachine()) return "podman";
  }

  if (which("docker") && containerResponds("docker")) return "docker";

  fail(
    "docker or podman is required. Install podman and run: podman machine start",
  );
}

function gitHeadSha() {
  const r = runCapture("git", ["rev-parse", "HEAD"], { cwd: root });
  return r.status === 0 ? r.stdout : null;
}

function resolveImageTag() {
  const override = process.env.WORKBENCH_IMAGE_TAG?.trim();
  if (override) return override;
  const sha = gitHeadSha();
  const suffix = Date.now().toString().slice(-6);
  if (sha) return `${sha.slice(0, 12)}-${suffix}`;
  return `deploy-${Date.now()}`;
}

function ensureGcloudContext(projectId) {
  const account = gcloudEnv().CLOUDSDK_CORE_ACCOUNT;
  console.log(`deploy:website: using gcloud account ${account} / project ${projectId}`);
  run("gcloud", ["config", "set", "account", account]);
  run("gcloud", ["config", "set", "project", projectId]);
  const region = process.env.GCP_LOCATION?.trim() || "australia-southeast1";
  run("gcloud", ["auth", "configure-docker", `${region}-docker.pkg.dev`, "--quiet"]);
}

function resolveArtifactRegistryImage({ projectId, region, imageName, tag }) {
  const registryHost = `${region}-docker.pkg.dev`;
  return `${registryHost}/${projectId}/cloudrun/${imageName}:${tag}`;
}

function loginArtifactRegistry(cli, registryHost) {
  const token = runCapture("gcloud", ["auth", "print-access-token"]);
  if (token.status !== 0) {
    fail(
      `gcloud auth print-access-token failed: ${token.stderr || "run gcloud auth login"}`,
    );
  }
  const login = spawnSync(
    cli,
    ["login", "-u", "oauth2accesstoken", "--password-stdin", registryHost],
    {
      input: token.stdout,
      stdio: ["pipe", "inherit", "inherit"],
      env: process.env,
      shell,
    },
  );
  if (login.error) throw login.error;
  if (login.status !== 0) {
    fail(`${cli} login ${registryHost} failed — check gcloud auth`);
  }
}

function runOrThrow(command, args, options = {}) {
  const r = spawnSync(command, args, {
    stdio: "inherit",
    cwd: options.cwd || root,
    shell,
    env: command === "gcloud" ? gcloudEnv() : options.env || process.env,
  });
  if (r.error) throw r.error;
  if (r.status !== 0) {
    throw new Error(`${command} exited ${r.status ?? 1}`);
  }
}

function buildImage(cli, platform, image, dockerfile, contextDir, { noCache = true } = {}) {
  const cacheFlag = noCache ? ["--no-cache"] : [];
  runOrThrow(cli, ["build", ...cacheFlag, "--platform", platform, "-t", image, "-f", dockerfile, contextDir]);
}

function buildAndPushLocal({ projectId, region, imageName, platform }) {
  const cli = resolveContainerCli();
  const tag = resolveImageTag();
  const registryHost = `${region}-docker.pkg.dev`;
  const image = resolveArtifactRegistryImage({ projectId, region, imageName, tag });
  const dockerfile = path.join(websiteDir, "Dockerfile");

  if (!fs.existsSync(dockerfile)) {
    fail(`Dockerfile not found: ${dockerfile}`);
  }

  console.log(`deploy:website: building ${image} (${platform}) via ${cli}…`);
  try {
    buildImage(cli, platform, image, dockerfile, websiteDir, { noCache: true });
  } catch (error) {
    if (cli !== "podman") throw error;
    console.warn("deploy:website: podman build failed — restarting machine and retrying…");
    runCapture("podman", ["machine", "stop"]);
    ensurePodmanMachine();
    buildImage(cli, platform, image, dockerfile, websiteDir, { noCache: true });
  }

  console.log(`deploy:website: logging in to ${registryHost}…`);
  loginArtifactRegistry(cli, registryHost);

  console.log(`deploy:website: pushing ${image}…`);
  try {
    runOrThrow(cli, ["push", image]);
  } catch (firstPushError) {
    console.warn("deploy:website: push failed — refreshing AR login and retrying…");
    loginArtifactRegistry(cli, registryHost);
    runOrThrow(cli, ["push", image]);
  }

  return image;
}

function buildAndPushCloudBuild({ projectId, region, imageName }) {
  const tag = resolveImageTag();
  const image = resolveArtifactRegistryImage({ projectId, region, imageName, tag });

  console.log(`deploy:website: building ${image} via Cloud Build (no local podman)…`);
  const args = [
    "builds",
    "submit",
    websiteDir,
    "--tag",
    image,
    "--project",
    projectId,
    "--quiet",
  ];
  const cloudRegion = process.env.CLOUD_BUILD_REGION?.trim() || region;
  args.push("--region", cloudRegion);
  runOrThrow("gcloud", args);
  return image;
}

function buildAndPushImage({ projectId, region, imageName, platform }) {
  const mode = (process.env.WORKBENCH_DEPLOY_MODE || "auto").trim().toLowerCase();

  if (mode === "cloud") {
    return buildAndPushCloudBuild({ projectId, region, imageName });
  }
  if (mode === "local") {
    return buildAndPushLocal({ projectId, region, imageName, platform });
  }

  try {
    return buildAndPushLocal({ projectId, region, imageName, platform });
  } catch (error) {
    console.warn(
      `deploy:website: local container build failed (${error.message || error}) — falling back to Cloud Build…`,
    );
    try {
      return buildAndPushCloudBuild({ projectId, region, imageName });
    } catch (cloudError) {
      fail(cloudError.message || String(cloudError));
    }
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
  const imageName = process.env.WORKBENCH_IMAGE_NAME?.trim() || serviceName;
  const platform = process.env.WORKBENCH_PLATFORM?.trim() || DEFAULT_PLATFORM;

  ensureGcloudContext(projectId);

  console.log("deploy:website: building Astro site locally…");
  run("npm", ["run", "build"], { cwd: websiteDir });

  let image;
  try {
    image = buildAndPushImage({ projectId, region, imageName, platform });
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
    `SITE_HOST=${process.env.SITE_HOST?.trim() || "workbench.suherman.net"}`,
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
  recordDeploy("success", {
    exitCode: 0,
    activityMessage: `deployed ${image}`,
  });
  console.log("deploy:website: provision DNS with: cd ../suherman-net-infra && npm run cloudflare:workbench");
}

main();
