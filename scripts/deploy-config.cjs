/**
 * Local manual deploy targets for workbench.suherman.net.
 */
const path = require("node:path");

const REPO_ROOT = path.resolve(__dirname, "..");
const DEFAULT_BRANCH = process.env.WORKBENCH_DEPLOY_BRANCH || "main";

/** @type {Array<{ repo: string; label: string; branch?: string; npmScript?: string; note?: string; details?: string[] }>} */
const DEPLOY_TARGETS = [
  {
    repo: "workbench-website",
    label: "workbench.suherman.net",
    branch: DEFAULT_BRANCH,
    npmScript: "deploy:website",
    details: [
      "Artifact Registry: australia-southeast1-docker.pkg.dev/personal-suherman/cloudrun/workbench-website:<sha>",
      "Deploy: npm run deploy:website (build Astro + podman push + Cloud Run)",
      "Requires: podman machine start (or CONTAINER_CLI=podman), gcloud auth",
      "DNS from suherman-net-infra: npm run cloudflare:workbench",
    ],
  },
];

function getDeployTarget(repo) {
  return DEPLOY_TARGETS.find((t) => t.repo === repo) || null;
}

function deployableTargets() {
  return DEPLOY_TARGETS.filter((t) => t.npmScript);
}

module.exports = {
  REPO_ROOT,
  DEFAULT_BRANCH,
  DEPLOY_TARGETS,
  getDeployTarget,
  deployableTargets,
};
