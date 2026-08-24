import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Alocare notification-service defaults (same Gmail SMTP account). */
export const ALOCARE_SMTP_DEFAULTS = {
  SMTP_HOST: 'smtp.gmail.com',
  SMTP_PORT: '587',
  SMTP_USER: 'suherman.fb@gmail.com',
  EMAIL_FROM_NAME: 'AI Engineering Workbench',
  EMAIL_FROM_ADDRESS: 'suherman.fb@gmail.com',
};

export const CONTACT_TO_EMAIL = 'iman.suherman@gmail.com';

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};

  const values = {};
  const content = fs.readFileSync(filePath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
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

function alocareNotificationEnvPath() {
  const explicit = process.env.ALOCARE_NOTIFICATION_SERVICE_ROOT?.trim();
  if (explicit) {
    return path.join(explicit, '.env');
  }

  const candidates = [
    path.join(os.homedir(), 'src', 'alocare.ai', 'alocare-notification-service', '.env'),
    path.join(__dirname, '..', '..', '..', '..', 'alocare.ai', 'alocare-notification-service', '.env'),
  ];

  return candidates.find((candidate) => fs.existsSync(candidate)) || candidates[0];
}

function websiteEnvPath() {
  return path.join(__dirname, '..', '..', '.env');
}

let loaded = false;

/** Load SMTP vars from website/.env then alocare-notification-service/.env (without overriding existing env). */
export function loadEmailEnv() {
  if (loaded) return;
  loaded = true;

  const sources = [websiteEnvPath(), alocareNotificationEnvPath()];
  for (const filePath of sources) {
    const parsed = parseEnvFile(filePath);
    for (const [key, value] of Object.entries(parsed)) {
      if (!process.env[key] && value) {
        process.env[key] = value;
      }
    }
  }
}

export function getSmtpConfig() {
  loadEmailEnv();

  const smtpUser = process.env.SMTP_USER?.trim() || ALOCARE_SMTP_DEFAULTS.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS?.trim();
  const smtpHost = process.env.SMTP_HOST?.trim() || ALOCARE_SMTP_DEFAULTS.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || ALOCARE_SMTP_DEFAULTS.SMTP_PORT);
  const fromName = process.env.EMAIL_FROM_NAME?.trim() || ALOCARE_SMTP_DEFAULTS.EMAIL_FROM_NAME;
  const fromAddress =
    process.env.EMAIL_FROM_ADDRESS?.trim() || ALOCARE_SMTP_DEFAULTS.EMAIL_FROM_ADDRESS;

  return {
    smtpHost,
    smtpPort,
    smtpUser,
    smtpPass,
    fromName,
    fromAddress,
    toEmail: CONTACT_TO_EMAIL,
  };
}
