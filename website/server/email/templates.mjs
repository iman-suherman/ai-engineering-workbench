import { CONTACT_TO_EMAIL } from './env.mjs';

const SITE_URL = 'https://workbench.suherman.net';

const BRAND = {
  cyan: '#00d2ff',
  blue: '#3a47d5',
  purple: '#8e2de2',
  bg: '#0a0a0f',
  text: '#e8edf5',
  muted: '#a0a0a0',
};

function layout({ preview, title, body }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:24px;background:#f8fafc;font-family:Inter,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;">${escapeHtml(preview)}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;margin:0 auto;">
    <tr>
      <td style="padding:32px;border-radius:16px;background:#ffffff;border:1px solid #e2e8f0;">
        <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:${BRAND.blue};">AI Engineering Workbench</p>
        <h1 style="margin:0 0 20px;font-size:22px;line-height:1.3;color:#0f172a;">${escapeHtml(title)}</h1>
        ${body}
        <p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:#64748b;">
          <a href="${SITE_URL}" style="color:${BRAND.blue};text-decoration:none;">workbench.suherman.net</a>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function fieldRow(label, value) {
  if (!value) return '';
  return `<p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#334155;"><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p>`;
}

function multilineBlock(label, value) {
  if (!value) return '';
  const safe = escapeHtml(value).replaceAll('\n', '<br />');
  return `<p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#334155;white-space:pre-wrap;"><strong>${escapeHtml(label)}:</strong><br />${safe}</p>`;
}

const FORM_LABELS = {
  demo: 'Demo request',
  'live-demo': 'Live demo request',
  team: 'Team plan registration',
  enterprise: 'Enterprise inquiry',
  support: 'Support request',
};

/** Admin notification — alocare GENERAL_INQUIRY pattern */
export function adminInquiryEmail({ formType, fields }) {
  const title = 'Website inquiry';
  const formLabel = FORM_LABELS[formType] || 'Website inquiry';
  const message = fields.message || fields.notes || '';

  const body = `
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#475569;">Someone submitted the contact form on the AI Engineering Workbench marketing website.</p>
    ${fieldRow('Form type', formLabel)}
    ${fieldRow('Name', fields.name)}
    ${fieldRow('Email', fields.email)}
    ${fieldRow('Role', fields.role)}
    ${fieldRow('Organization', fields.company || fields.organization)}
    ${fieldRow('Team size', fields.teamSize)}
    ${fieldRow('Repositories', fields.repos)}
    ${fieldRow('Kickoff', fields.kickoff)}
    ${fieldRow('Billing', fields.billing)}
    ${fieldRow('Source', SITE_URL)}
    ${multilineBlock('Message', message)}
    <p style="margin:16px 0 0;font-size:13px;color:#64748b;">Reply directly to ${escapeHtml(fields.email)}</p>
  `;

  const text = [
    'Website inquiry — AI Engineering Workbench',
    '',
    `Form type: ${formLabel}`,
    `Name: ${fields.name}`,
    `Email: ${fields.email}`,
    fields.role ? `Role: ${fields.role}` : '',
    fields.company ? `Organization: ${fields.company}` : '',
    fields.teamSize ? `Team size: ${fields.teamSize}` : '',
    fields.repos ? `Repositories: ${fields.repos}` : '',
    fields.kickoff ? `Kickoff: ${fields.kickoff}` : '',
    fields.billing ? `Billing: ${fields.billing}` : '',
    `Source: ${SITE_URL}`,
    message ? `\nMessage:\n${message}` : '',
    '',
    `Reply directly to ${fields.email}`,
  ]
    .filter(Boolean)
    .join('\n');

  return {
    subject: `[Workbench] ${formLabel} — ${fields.name}`,
    html: layout({ preview: 'New inquiry from workbench.suherman.net', title, body }),
    text,
  };
}

/** Demo request reply — self-serve trial + optional live session */
export function demoReplyEmail({ name }) {
  const title = 'Coba demo sendiri — AI Engineering Workbench';
  const body = `
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#334155;">Halo ${escapeHtml(name)},</p>
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#475569;">Terima kasih sudah tertarik dengan AI Engineering Workbench.</p>
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#475569;">Kamu bisa <strong>langsung coba sendiri</strong> tanpa jadwal demo — sekitar 10–20 menit di Cursor atau Copilot:</p>
    <ol style="margin:0 0 16px;padding-left:20px;color:#475569;font-size:14px;line-height:1.7;">
      <li>Clone: <a href="https://github.com/iman-suherman/ai-engineering-workbench" style="color:#0891b2;">github.com/iman-suherman/ai-engineering-workbench</a></li>
      <li>Jalankan: <code style="background:#f1f5f9;padding:2px 6px;border-radius:4px;">npm run demo</code></li>
      <li>Paste <code style="background:#f1f5f9;padding:2px 6px;border-radius:4px;">examples/demo-cursor-prompt.md</code> ke Cursor Chat</li>
    </ol>
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#475569;">Panduan lengkap: <a href="https://workbench.suherman.net/demo" style="color:#0891b2;">workbench.suherman.net/demo</a></p>
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#475569;">Kalau mau <strong>sesi live</strong> bareng saya (~30–45 menit) dengan repo/use case kamu, balas email ini dengan 2–3 opsi jadwal (WIB) dan siapa saja yang ikut.</p>
    <p style="margin:16px 0 0;font-size:14px;color:#334155;">— Iman Suherman<br /><span style="color:#64748b;">AI Engineering Workbench</span></p>
  `;

  const text = [
    `Halo ${name},`,
    '',
    'Terima kasih sudah tertarik dengan AI Engineering Workbench.',
    '',
    'Coba demo sendiri (~10–20 menit):',
    '1. git clone https://github.com/iman-suherman/ai-engineering-workbench.git',
    '2. npm run demo',
    '3. Paste examples/demo-cursor-prompt.md ke Cursor Chat',
    '',
    'Panduan: https://workbench.suherman.net/demo',
    '',
    'Untuk sesi live bareng saya, balas dengan jadwal (WIB) dan peserta.',
    '',
    '— Iman Suherman',
    'AI Engineering Workbench',
    SITE_URL,
  ].join('\n');

  return {
    subject: 'Coba demo AI Engineering Workbench — npm run demo',
    html: layout({ preview: title, title, body }),
    text,
  };
}

/** Sender confirmation — alocare-style acknowledgement */
export function userConfirmationEmail({ formType, fields }) {
  const isTeam = formType === 'team';
  const title = isTeam ? 'Team plan registration received' : 'We received your message';
  const intro = isTeam
    ? 'Thank you for registering your team. Our team will review your request and contact you by email within one business day.'
    : 'Thank you for reaching out. Our team will reply to you by email within one business day.';

  const body = `
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#334155;">Hi ${escapeHtml(fields.name)},</p>
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#475569;">${intro}</p>
    ${fields.message || fields.notes ? multilineBlock('Your message', fields.message || fields.notes) : ''}
    <p style="margin:16px 0 0;font-size:14px;color:#334155;">— Iman Suherman<br /><span style="color:#64748b;">AI Engineering Workbench</span></p>
  `;

  const text = [
    `Hi ${fields.name},`,
    '',
    intro,
    fields.message || fields.notes ? `\nYour message:\n${fields.message || fields.notes}` : '',
    '',
    '— Iman Suherman',
    'AI Engineering Workbench',
  ]
    .filter(Boolean)
    .join('\n');

  return {
    subject: isTeam
      ? 'Team plan registration received — AI Engineering Workbench'
      : 'We received your message — AI Engineering Workbench',
    html: layout({ preview: title, title, body }),
    text,
  };
}

export { CONTACT_TO_EMAIL };
