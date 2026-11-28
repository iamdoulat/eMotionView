import nodemailer from 'nodemailer';
import { getMongoDb } from '@/lib/mongodb';

export type ContactEmailPayload = {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  submittedAt?: string;
};

export type MailResult = {
  success: boolean;
  targetEmail: string;
  simulated: boolean;
  messageId?: string;
  error?: string;
};

/**
 * Resolves the designated recipient email from General Settings or environment.
 */
export async function getDesignatedAdminEmail(): Promise<{ email: string; storeName: string; logo?: string }> {
  const fallbackEmail = 'motionview22@gmail.com.bd';
  const fallbackStoreName = 'eMotionView';

  try {
    const db = await getMongoDb();
    if (db) {
      const generalDoc = await db.collection('settings').findOne({ _id: 'general' } as any);
      if (generalDoc) {
        return {
          email: generalDoc.contactNotificationEmail || generalDoc.email || fallbackEmail,
          storeName: generalDoc.storeName || generalDoc.companyName || fallbackStoreName,
          logo: generalDoc.logo || '',
        };
      }
    }
  } catch (err) {
    console.warn('Could not read general settings for designated email:', err);
  }

  return {
    email: process.env.ADMIN_EMAIL || process.env.SMTP_TO || fallbackEmail,
    storeName: fallbackStoreName,
    logo: '',
  };
}

/**
 * Sends or logs an email notification for a new contact form submission.
 */
export async function sendContactNotificationEmail(
  payload: ContactEmailPayload,
  designatedEmail?: string
): Promise<MailResult> {
  const settings = await getDesignatedAdminEmail();
  const recipientEmail = designatedEmail || settings.email;
  const storeName = settings.storeName || 'eMotionView';
  const submittedTime = payload.submittedAt || new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' });

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT) || 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpSecure = process.env.SMTP_SECURE === 'true' || smtpPort === 465;
  const smtpFrom = process.env.SMTP_FROM || `"${storeName} Notifications" <noreply@emotionview.com.bd>`;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .header { background: #0f172a; padding: 24px 32px; color: #ffffff; text-align: left; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 700; color: #ffffff; }
    .header p { margin: 4px 0 0; font-size: 13px; color: #94a3b8; }
    .body { padding: 32px; }
    .badge { display: inline-block; padding: 4px 10px; background: #e0e7ff; color: #3730a3; border-radius: 9999px; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 20px; }
    .field-row { margin-bottom: 16px; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px; }
    .field-label { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; margin-bottom: 4px; }
    .field-value { font-size: 15px; color: #0f172a; font-weight: 500; }
    .message-box { background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #4f46e5; border-radius: 8px; padding: 16px; margin: 20px 0; font-size: 14px; line-height: 1.6; color: #334155; white-space: pre-wrap; }
    .button-container { margin-top: 24px; text-align: center; }
    .reply-btn { display: inline-block; background: #4f46e5; color: #ffffff !important; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; }
    .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 32px; font-size: 12px; color: #94a3b8; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${storeName}</h1>
      <p>New Contact Form Submission Notification</p>
    </div>
    <div class="body">
      <span class="badge">Inquiry: ${payload.subject}</span>

      <div class="field-row">
        <div class="field-label">Customer Name</div>
        <div class="field-value">${payload.name}</div>
      </div>

      <div class="field-row">
        <div class="field-label">Email Address</div>
        <div class="field-value"><a href="mailto:${payload.email}" style="color: #4f46e5; text-decoration: none;">${payload.email}</a></div>
      </div>

      ${payload.phone ? `
      <div class="field-row">
        <div class="field-label">Phone Number</div>
        <div class="field-value"><a href="tel:${payload.phone}" style="color: #0f172a; text-decoration: none;">${payload.phone}</a></div>
      </div>` : ''}

      <div class="field-row">
        <div class="field-label">Subject</div>
        <div class="field-value">${payload.subject}</div>
      </div>

      <div class="field-label" style="margin-top: 20px;">Customer Message</div>
      <div class="message-box">${payload.message}</div>

      <div class="button-container">
        <a href="mailto:${payload.email}?subject=Re: ${encodeURIComponent(payload.subject)}" class="reply-btn">
          Reply Directly to ${payload.name}
        </a>
      </div>
    </div>
    <div class="footer">
      This notification was sent to <strong>${recipientEmail}</strong> as designated in ${storeName} General Settings.<br/>
      Received on ${submittedTime} (BST).
    </div>
  </div>
</body>
</html>
  `;

  const textContent = `
New Contact Inquiry Received - ${storeName}
==========================================
From: ${payload.name} (${payload.email})
Phone: ${payload.phone || 'N/A'}
Subject: ${payload.subject}
Received: ${submittedTime}

Message:
--------
${payload.message}

Reply to: ${payload.email}
Sent to designated admin address: ${recipientEmail}
  `.trim();

  // If SMTP is properly configured with user & pass
  if (smtpHost && smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const info = await transporter.sendMail({
        from: smtpFrom,
        to: recipientEmail,
        replyTo: `"${payload.name}" <${payload.email}>`,
        subject: `[Contact Inquiry] ${payload.subject} - ${payload.name}`,
        text: textContent,
        html: htmlContent,
      });

      console.log(`[Mail Service] Sent email to ${recipientEmail}, MessageId: ${info.messageId}`);
      return {
        success: true,
        targetEmail: recipientEmail,
        simulated: false,
        messageId: info.messageId,
      };
    } catch (err: any) {
      console.error('[Mail Service] SMTP send failed:', err);
      // Fall through to record in mail_logs
    }
  }

  // Fallback: SMTP not configured or failed - record simulated notification
  console.log(`[Mail Service] SMTP not configured. Notification recorded for designated admin email: ${recipientEmail}`);

  try {
    const db = await getMongoDb();
    if (db) {
      await db.collection('mail_logs').insertOne({
        recipient: recipientEmail,
        sender: payload.email,
        subject: `[Contact Inquiry] ${payload.subject} - ${payload.name}`,
        payload,
        createdAt: new Date().toISOString(),
        status: 'simulated_logged',
        note: smtpHost ? 'SMTP send attempt encountered error; logged to DB' : 'SMTP not configured in environment; logged to DB',
      });
    }
  } catch (logErr) {
    console.warn('[Mail Service] Could not log to mail_logs:', logErr);
  }

  return {
    success: true,
    targetEmail: recipientEmail,
    simulated: true,
    messageId: `sim_${Date.now()}`,
  };
}
