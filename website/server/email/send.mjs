import nodemailer from 'nodemailer';
import { getSmtpConfig } from './env.mjs';
import { adminInquiryEmail, demoReplyEmail, userConfirmationEmail } from './templates.mjs';

function getConfig() {
  const config = getSmtpConfig();

  if (!config.smtpPass) {
    throw new Error(
      'SMTP_PASS is required — set it in website/.env or use alocare-notification-service/.env',
    );
  }

  return config;
}

function createTransport(config) {
  return nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpPort === 465,
    auth: {
      user: config.smtpUser,
      pass: config.smtpPass,
    },
  });
}

export async function sendInquiryEmails({ formType, fields }) {
  const config = getConfig();
  const transport = createTransport(config);
  const from = `"${config.fromName}" <${config.fromAddress}>`;

  const admin = adminInquiryEmail({ formType, fields });
  const user = userConfirmationEmail({ formType, fields });

  const [adminResult, userResult] = await Promise.all([
    transport.sendMail({
      from,
      to: config.toEmail,
      replyTo: fields.email,
      subject: admin.subject,
      html: admin.html,
      text: admin.text,
    }),
    transport.sendMail({
      from,
      to: fields.email,
      subject: user.subject,
      html: user.html,
      text: user.text,
    }),
  ]);

  return { adminId: adminResult.messageId, userId: userResult.messageId };
}

export async function sendDemoReply({ to, name }) {
  const config = getConfig();
  const transport = createTransport(config);
  const from = `"${config.fromName}" <${config.fromAddress}>`;
  const email = demoReplyEmail({ name });

  const result = await transport.sendMail({
    from,
    to,
    replyTo: config.toEmail,
    subject: email.subject,
    html: email.html,
    text: email.text,
  });

  return { messageId: result.messageId };
}
