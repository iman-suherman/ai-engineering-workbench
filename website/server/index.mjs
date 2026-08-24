import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { sendInquiryEmails } from './email/send.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.join(__dirname, '..', 'dist');
const PORT = Number(process.env.PORT || 8080);
const CANONICAL_HOST = process.env.SITE_HOST?.trim() || 'workbench.suherman.net';
const CANONICAL_ORIGIN = `https://${CANONICAL_HOST}`;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

function json(res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(JSON.stringify(body));
}

function normalizeFields(body) {
  return {
    name: String(body.name || '').trim(),
    email: String(body.email || '').trim().toLowerCase(),
    role: String(body.role || '').trim(),
    company: String(body.company || body.organization || '').trim(),
    teamSize: String(body.teamSize || '').trim(),
    repos: String(body.repos || '').trim(),
    kickoff: String(body.kickoff || '').trim(),
    billing: String(body.billing || '').trim(),
    organization: String(body.organization || body.company || '').trim(),
    message: String(body.message || '').trim(),
    notes: String(body.notes || '').trim(),
  };
}

function validateInquiry(formType, fields) {
  if (!fields.name || !fields.email) return 'Name and email are required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) return 'Invalid email address';

  if (formType === 'team') {
    if (!fields.company) return 'Company / team name is required';
    if (!fields.teamSize) return 'Team size is required';
    if (!fields.repos) return 'Repositories or services are required';
    if (!fields.kickoff) return 'Preferred kickoff window is required';
    if (!fields.billing) return 'Billing preference is required';
    return null;
  }

  if (!fields.message || fields.message.length < 10) {
    return 'Message must be at least 10 characters';
  }

  return null;
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return {};
  return JSON.parse(raw);
}

function redirectToCanonical(req, res, url) {
  const rawHost = String(req.headers.host || '').toLowerCase();
  const [host, port = ''] = rawHost.split(':');

  const forwardedHost = String(req.headers['x-forwarded-host'] || '').split(':')[0].toLowerCase();
  if (forwardedHost === CANONICAL_HOST) return false;

  const isDev = host === 'localhost' || host === '127.0.0.1';
  if (isDev) return false;

  const onCanonical = host === CANONICAL_HOST && !port;
  if (onCanonical) return false;

  const shouldRedirect = host.endsWith('.run.app') || port === '8080' || host !== CANONICAL_HOST;
  if (!shouldRedirect) return false;

  const target = `${CANONICAL_ORIGIN}${url.pathname}${url.search}`;
  res.writeHead(301, { Location: target, 'Cache-Control': 'no-store' });
  res.end();
  return true;
}

async function serveStatic(req, res, urlPath) {
  const candidates = [];
  if (urlPath === '/') {
    candidates.push('/index.html');
  } else {
    candidates.push(urlPath);
    if (!urlPath.endsWith('.html')) {
      candidates.push(`${urlPath.replace(/\/$/, '')}/index.html`);
    }
  }

  for (const candidate of candidates) {
    const filePath = path.join(DIST_DIR, candidate);
    try {
      const fileStat = await stat(filePath);
      if (!fileStat.isFile()) continue;

      const ext = path.extname(filePath);
      const cacheControl =
        ext === '.html'
          ? 'public, max-age=60, stale-while-revalidate=300'
          : 'public, max-age=604800, immutable';

      const data = await readFile(filePath);
      res.writeHead(200, {
        'Content-Type': MIME[ext] || 'application/octet-stream',
        'Cache-Control': cacheControl,
      });
      res.end(data);
      return true;
    } catch {
      // try next candidate
    }
  }

  return false;
}

async function handleInquiry(req, res) {
  try {
    const body = await readBody(req);
    const formType = String(body.formType || 'demo').trim();
    const fields = normalizeFields(body);
    const error = validateInquiry(formType, fields);
    if (error) return json(res, 400, { error });

    await sendInquiryEmails({ formType, fields });

    const message =
      formType === 'team'
        ? 'Thank you. We received your Team plan registration and will confirm within one business day.'
        : 'Thank you for reaching out. We will reply to you by email within one business day.';

    return json(res, 200, { message });
  } catch (error) {
    console.error('inquiry:error', error);
    return json(res, 500, {
      error: 'Could not send your message right now. Please email iman.suherman@gmail.com directly.',
    });
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === 'GET' || req.method === 'HEAD') {
    if (redirectToCanonical(req, res, url)) return;
  }

  if (req.method === 'POST' && url.pathname === '/api/inquiry') {
    return handleInquiry(req, res);
  }

  if (req.method === 'GET' && url.pathname === '/api/health') {
    return json(res, 200, { ok: true });
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return json(res, 405, { error: 'Method not allowed' });
  }

  const served = await serveStatic(req, res, url.pathname);
  if (!served && !url.pathname.startsWith('/api/')) {
    return serveStatic(req, res, '/index.html');
  }
  if (!served) {
    return json(res, 404, { error: 'Not found' });
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`workbench-website listening on ${PORT}`);
});
