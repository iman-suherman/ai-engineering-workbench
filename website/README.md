# AI Engineering Workbench — Marketing Website

**Production:** https://workbench.suherman.net

Astro static site + Node server for contact forms and Team registration (alocare-style Google SMTP notifications).

## Development

```bash
cd website
npm install
npm run build
SMTP_USER=suherman.fb@gmail.com SMTP_PASS=your-app-password npm start
```

Open http://localhost:8080

## Contact forms

All forms POST to `/api/inquiry` and send **two emails** via Google SMTP (same account as alocare-notification-service):

1. **Admin notification** → `iman.suherman@gmail.com`
2. **Sender confirmation** → the person who submitted the form

Form types: `demo`, `team`, `enterprise`, `support`

Copy `website/.env.example` → `website/.env`, or rely on `alocare-notification-service/.env` locally:

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=suherman.fb@gmail.com
SMTP_PASS=your-gmail-app-password
EMAIL_FROM_NAME=AI Engineering Workbench
EMAIL_FROM_ADDRESS=suherman.fb@gmail.com
```

Use a [Gmail App Password](https://support.google.com/accounts/answer/185833) (not your regular account password).

## Deploy

```bash
cd ai-engineering-workbench
# SMTP_PASS is auto-loaded from alocare-notification-service/.env when present
npm run deploy:website

cd ../suherman-net-infra
npm run cloudflare:workbench
```

Optional: `WORKBENCH_MIN_INSTANCES=1` reduces Cloud Run cold-start latency (adds cost).

## Performance notes

Slow first loads are usually **Cloud Run cold starts** (service scales to zero). Mitigations:

- Set `WORKBENCH_MIN_INSTANCES=1` on deploy
- Assets are cached (HTML: 60s, static: 7 days)
- Logo optimized to ~11KB

The `#register` and `#:~:text=` URL fragments are client-side only — they do not cause extra server requests.
