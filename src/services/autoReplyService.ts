/**
 * Maison Avelore Auto-Reply Service
 * Sends an exquisitely branded, professional patron confirmation email immediately after
 * an inquiry is successfully saved to Firestore, utilizing the SMTP configuration from .env.
 */

import nodemailer, { type Transporter } from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export interface EnquiryConfirmationPayload {
  referenceId: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  subject?: string;
  message: string;
  boutique?: string;
  date?: string;
  createdAt?: string;
}

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  fromAddress: string;
  replyTo: string;
  isConfigured: boolean;
}

export interface AutoReplyResult {
  success: boolean;
  deliveryMode: 'smtp_live' | 'simulation_preview';
  messageId?: string;
  recipient: string;
  referenceId: string;
  timestamp: string;
  previewUrl?: string;
  error?: string;
}

/**
 * Retrieves SMTP settings from environment variables with fallbacks.
 */
export function getSmtpConfig(): SmtpConfig {
  const host = process.env.SMTP_HOST || '';
  const port = Number(process.env.SMTP_PORT) || 587;
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const user = process.env.SMTP_USER || '';
  const pass = process.env.SMTP_PASS || '';
  const replyTo = process.env.OWNER_EMAIL || process.env.SMTP_FROM || 'concierge@avelore.com';
  const fromAddress =
    process.env.SMTP_FROM ||
    (user
      ? `"Maison Avelore Concierge" <${user}>`
      : '"Maison Avelore Concierge" <concierge@avelore.com>');

  const isConfigured = Boolean(host && (user ? pass : true));

  return {
    host,
    port,
    secure,
    user,
    pass,
    fromAddress,
    replyTo,
    isConfigured,
  };
}

// Cached Nodemailer Transporter instance
let transporterInstance: Transporter | null = null;

/**
 * Returns or initializes the Nodemailer transporter.
 * Uses live SMTP when configured; gracefully falls back to jsonTransport for sandbox/simulation.
 */
export async function getTransporter(): Promise<{ transporter: Transporter; isLive: boolean }> {
  const config = getSmtpConfig();

  if (config.isConfigured) {
    if (!transporterInstance) {
      const transportOptions: any = {
        host: config.host,
        port: config.port,
        secure: config.secure,
        tls: {
          rejectUnauthorized: false, // Prevents certificate rejection in development environments
        },
      };

      if (config.user && config.pass) {
        transportOptions.auth = {
          user: config.user,
          pass: config.pass,
        };
      }

      transporterInstance = nodemailer.createTransport(transportOptions);
    }
    return { transporter: transporterInstance, isLive: true };
  }

  // Graceful simulation fallback for development or when SMTP credentials are unset in .env
  const fallbackTransporter = nodemailer.createTransport({
    jsonTransport: true,
  });

  return { transporter: fallbackTransporter, isLive: false };
}

/**
 * Generates an haute parfumerie branded HTML confirmation email.
 */
export function generateBrandedConfirmationHtml(data: EnquiryConfirmationPayload): string {
  const brandMerlot = '#3B0000';
  const brandDarkRed = '#520909';
  const brandParchment = '#FAF2E1';
  const brandGold = '#FFD482';
  const brandCarmine = '#801B00';
  const textMuted = '#7E4A4A';
  const cardBg = '#FFFBF5';

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });

  const subjectTitle = data.subject || 'Bespoke Atelier Inquiry';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Maison Avelore — Inquiry Confirmation</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: ${brandParchment};
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: ${brandMerlot};
      -webkit-font-smoothing: antialiased;
    }
    table {
      border-collapse: collapse;
    }
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: ${brandParchment};
      padding: 40px 16px;
    }
    .main-card {
      max-width: 600px;
      margin: 0 auto;
      background-color: ${cardBg};
      border-radius: 28px;
      border: 1px solid rgba(59, 0, 0, 0.12);
      overflow: hidden;
      box-shadow: 0 10px 25px rgba(59, 0, 0, 0.05);
    }
    .header-bar {
      background: linear-gradient(135deg, ${brandMerlot} 0%, ${brandDarkRed} 100%);
      padding: 40px 32px 36px;
      text-align: center;
      border-bottom: 2px solid ${brandGold};
    }
    .brand-title {
      font-size: 26px;
      font-weight: 700;
      letter-spacing: 0.28em;
      color: ${brandGold};
      margin: 0 0 6px 0;
      text-transform: uppercase;
      font-family: Georgia, serif;
    }
    .brand-tagline {
      font-size: 11px;
      color: rgba(255, 245, 227, 0.75);
      letter-spacing: 0.18em;
      text-transform: uppercase;
      margin: 0;
      font-style: italic;
    }
    .body-content {
      padding: 36px 36px 32px;
    }
    .greeting {
      font-size: 18px;
      font-weight: 600;
      color: ${brandMerlot};
      margin: 0 0 16px 0;
      font-family: Georgia, serif;
    }
    .lead-text {
      font-size: 14px;
      line-height: 1.65;
      color: ${textMuted};
      margin: 0 0 28px 0;
    }
    .receipt-box {
      background-color: ${brandParchment};
      border-radius: 18px;
      border: 1px solid rgba(59, 0, 0, 0.12);
      padding: 24px;
      margin-bottom: 28px;
    }
    .status-badge {
      display: inline-block;
      background-color: #e6f4ea;
      color: #137333;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      padding: 4px 10px;
      border-radius: 9999px;
      border: 1px solid #ceead6;
      margin-bottom: 12px;
    }
    .message-excerpt {
      background-color: #FFFFFF;
      border-left: 3px solid ${brandCarmine};
      padding: 14px 18px;
      border-radius: 0 12px 12px 0;
      font-size: 13px;
      color: ${brandMerlot};
      font-style: italic;
      line-height: 1.5;
      margin-top: 14px;
    }
    .ateliers-strip {
      background-color: rgba(255, 212, 130, 0.2);
      border-radius: 16px;
      padding: 18px;
      margin-bottom: 28px;
      text-align: center;
      border: 1px solid rgba(255, 212, 130, 0.5);
    }
    .ateliers-title {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.2em;
      color: ${brandCarmine};
      font-weight: 700;
      margin: 0 0 6px 0;
    }
    .ateliers-list {
      font-size: 12px;
      color: ${brandMerlot};
      margin: 0;
      font-weight: 500;
    }
    .footer-section {
      background-color: ${brandMerlot};
      color: rgba(255, 245, 227, 0.7);
      padding: 28px 32px;
      text-align: center;
      font-size: 11px;
      line-height: 1.6;
    }
    .footer-links a {
      color: ${brandGold};
      text-decoration: none;
      font-weight: 600;
      margin: 0 8px;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="main-card">
      <!-- Header Banner -->
      <div class="header-bar">
        <div style="font-size: 24px; margin-bottom: 6px;">⚜️</div>
        <h1 class="brand-title">AVELORE</h1>
        <p class="brand-tagline">Haute Parfumerie • Scent, composed with intention</p>
      </div>

      <!-- Main Body -->
      <div class="body-content">
        <span class="status-badge">✓ Archived in Firestore Concierge Vault</span>
        <p class="greeting">Chère / Cher ${escapeHtml(data.clientName)},</p>
        <p class="lead-text">
          Thank you for reaching out to Maison Avelore. We have received your inquiry, and your dispatch has been archived in our secure atelier database. Our Master Olfactory Concierge has been notified for personal review.
        </p>

        <!-- Archived Enquiry Details -->
        <div class="receipt-box">
          <table width="100%">
            <tr>
              <td style="padding: 6px 0; font-size: 11px; color: ${brandCarmine}; text-transform: uppercase; font-weight: 700; letter-spacing: 0.1em;">Reference ID</td>
              <td align="right" style="padding: 6px 0; font-size: 12px; font-family: monospace; font-weight: 700; color: ${brandMerlot};">#${escapeHtml(data.referenceId)}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-size: 11px; color: ${brandCarmine}; text-transform: uppercase; font-weight: 700; letter-spacing: 0.1em;">Inquiry Nature</td>
              <td align="right" style="padding: 6px 0; font-size: 12px; font-weight: 600; color: ${brandMerlot};">${escapeHtml(subjectTitle)}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-size: 11px; color: ${brandCarmine}; text-transform: uppercase; font-weight: 700; letter-spacing: 0.1em;">Archived At</td>
              <td align="right" style="padding: 6px 0; font-size: 12px; color: ${brandMerlot};">${formattedDate}</td>
            </tr>
            ${
              data.clientPhone
                ? `
            <tr>
              <td style="padding: 6px 0; font-size: 11px; color: ${brandCarmine}; text-transform: uppercase; font-weight: 700; letter-spacing: 0.1em;">Contact Phone</td>
              <td align="right" style="padding: 6px 0; font-size: 12px; font-family: monospace; color: ${brandMerlot};">${escapeHtml(data.clientPhone)}</td>
            </tr>`
                : ''
            }
            ${
              data.boutique
                ? `
            <tr>
              <td style="padding: 6px 0; font-size: 11px; color: ${brandCarmine}; text-transform: uppercase; font-weight: 700; letter-spacing: 0.1em;">Salon Atelier</td>
              <td align="right" style="padding: 6px 0; font-size: 12px; color: ${brandMerlot};">${escapeHtml(data.boutique)}</td>
            </tr>`
                : ''
            }
          </table>

          <div class="message-excerpt">
            &ldquo;${escapeHtml(data.message)}&rdquo;
          </div>
        </div>

        <!-- Global Salons -->
        <div class="ateliers-strip">
          <p class="ateliers-title">Global Flagship Ateliers</p>
          <p class="ateliers-list">Paris Marais • London Mayfair • New York SoHo • Tokyo Ginza</p>
        </div>

        <p style="font-size: 12px; line-height: 1.6; color: ${textMuted}; margin: 0;">
          Our olfactory concierge typically replies within 24 business hours. If you wish to reach us with immediate urgency or update your reservation, simply reply directly to this email or write to us at <a href="mailto:concierge@avelore.com" style="color: ${brandCarmine}; text-decoration: underline; font-weight: 600;">concierge@avelore.com</a>.
        </p>
      </div>

      <!-- Footer -->
      <div class="footer-section">
        <p style="margin: 0 0 10px 0; font-weight: 600; color: #FFF5E3; letter-spacing: 0.1em; text-transform: uppercase;">
          MAISON AVELORE HAUTE PARFUMERIE
        </p>
        <p style="margin: 0 0 12px 0;">
          24 Rue de Sévigné, 75004 Paris, France • +33 1 42 78 30 12
        </p>
        <div class="footer-links">
          <a href="https://avelore.com/collections">Collections</a> •
          <a href="https://avelore.com/contact">Global Salons</a> •
          <a href="https://avelore.com/journal">Scent Journal</a>
        </div>
        <p style="margin: 14px 0 0 0; font-size: 10px; opacity: 0.5;">
          &copy; ${new Date().getFullYear()} Avelore Parfumerie. All rights reserved. Confidential Correspondence.
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Generates a clean, refined plain-text alternative.
 */
export function generatePlainTextConfirmation(data: EnquiryConfirmationPayload): string {
  return (
    `MAISON AVELORE HAUTE PARFUMERIE\n` +
    `Scent, composed with intention\n\n` +
    `Chère / Cher ${data.clientName},\n\n` +
    `Thank you for contacting Maison Avelore. We have received your inquiry, and your dispatch has been archived in our secure atelier database. Our Olfactory Concierge will review your request shortly.\n\n` +
    `INQUIRY SUMMARY\n` +
    `---------------\n` +
    `Reference ID : #${data.referenceId}\n` +
    `Status       : Archived in Firestore Concierge Vault\n` +
    `Subject      : ${data.subject || 'Bespoke Atelier Inquiry'}\n` +
    `Email        : ${data.clientEmail}\n` +
    (data.clientPhone ? `Phone        : ${data.clientPhone}\n` : '') +
    (data.boutique ? `Atelier      : ${data.boutique}\n` : '') +
    `\nMessage:\n"${data.message}"\n\n` +
    `Our concierge typically replies within 24 business hours.\n` +
    `If you have urgent questions, you may reply directly to this email.\n\n` +
    `Ateliers: Paris Marais • London Mayfair • New York SoHo • Tokyo Ginza\n` +
    `24 Rue de Sévigné, 75004 Paris, France\n` +
    `https://avelore.com\n`
  );
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Sends a branded confirmation email to the visitor using the SMTP configuration from .env.
 */
export async function sendEnquiryConfirmationEmail(
  enquiry: EnquiryConfirmationPayload
): Promise<AutoReplyResult> {
  const referenceId = enquiry.referenceId || `enquiry_${Date.now()}`;
  const config = getSmtpConfig();
  const now = new Date().toISOString();

  try {
    const { transporter, isLive } = await getTransporter();

    const htmlBody = generateBrandedConfirmationHtml({
      ...enquiry,
      referenceId,
    });

    const textBody = generatePlainTextConfirmation({
      ...enquiry,
      referenceId,
    });

    const mailOptions = {
      from: config.fromAddress,
      to: enquiry.clientEmail,
      replyTo: config.replyTo,
      subject: `Maison Avelore — Inquiry Received [Ref: #${referenceId}]`,
      text: textBody,
      html: htmlBody,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log(
      `[AutoReplyService] Confirmation email sent to [REDACTED] (Mode: ${
        isLive ? 'SMTP_LIVE' : 'SIMULATION'
      }) MessageId: ${info.messageId || 'simulated'}`
    );

    return {
      success: true,
      deliveryMode: isLive ? 'smtp_live' : 'simulation_preview',
      messageId: info.messageId || `msg_${Date.now()}`,
      recipient: enquiry.clientEmail,
      referenceId,
      timestamp: now,
    };
  } catch (err: any) {
    console.error('[AutoReplyService] Failed to send patron confirmation email:', err);
    return {
      success: false,
      deliveryMode: config.isConfigured ? 'smtp_live' : 'simulation_preview',
      recipient: enquiry.clientEmail,
      referenceId,
      timestamp: now,
      error: err.message || 'SMTP transmission failure',
    };
  }
}

/**
 * Hook to be called immediately after an enquiry document is successfully saved to Firestore.
 * Extracts the visitor details and sends a branded confirmation email using the SMTP configuration.
 *
 * @param enquiryId The Firestore document ID (e.g., from docRef.id)
 * @param data The enquiry data saved in Firestore
 */
export async function onEnquirySavedToFirestore(
  enquiryId: string,
  data: {
    clientName?: string;
    clientEmail?: string;
    clientPhone?: string;
    subject?: string;
    message?: string;
    notes?: string;
    boutique?: string;
    date?: string;
    createdAt?: string;
    [key: string]: any;
  }
): Promise<AutoReplyResult> {
  const email = data.clientEmail;
  const name = data.clientName || 'Distinguished Patron';

  if (!email) {
    console.warn(
      `[AutoReplyService] Cannot send confirmation for Firestore enquiry #${enquiryId}: clientEmail is missing.`
    );
    return {
      success: false,
      deliveryMode: 'simulation_preview',
      recipient: '',
      referenceId: enquiryId,
      timestamp: new Date().toISOString(),
      error: 'Missing clientEmail in Firestore enquiry document.',
    };
  }

  console.log(
    `[AutoReplyService] Enquiry #${enquiryId} successfully saved to Firestore. Dispatching confirmation email to [REDACTED]...`
  );

  return await sendEnquiryConfirmationEmail({
    referenceId: enquiryId,
    clientName: name,
    clientEmail: email,
    clientPhone: data.clientPhone,
    subject: data.subject || 'Bespoke Atelier Inquiry',
    message: data.message || data.notes || '',
    boutique: data.boutique,
    date: data.date,
    createdAt: data.createdAt,
  });
}

export const handleFirestoreEnquiryAutoReply = onEnquirySavedToFirestore;

/**
 * Verifies SMTP connection credentials.
 */
export async function verifySmtpConnection(): Promise<{ connected: boolean; message: string }> {
  const config = getSmtpConfig();
  if (!config.isConfigured) {
    return {
      connected: false,
      message:
        'SMTP credentials (SMTP_HOST, SMTP_USER, SMTP_PASS) not configured in .env. Operating in resilient simulation mode.',
    };
  }

  try {
    const { transporter } = await getTransporter();
    await transporter.verify();
    return {
      connected: true,
      message: `Successfully connected to SMTP server ${config.host}:${config.port}`,
    };
  } catch (err: any) {
    return {
      connected: false,
      message: `SMTP verification failed: ${err.message}`,
    };
  }
}

/**
 * Diagnostic self-test function.
 */
export async function testAutoReply(targetEmail = 'patron@example.com'): Promise<AutoReplyResult> {
  const samplePayload: EnquiryConfirmationPayload = {
    referenceId: `test_${Date.now()}`,
    clientName: 'Caroline de Beauvoir',
    clientEmail: targetEmail,
    clientPhone: '+33 6 12 34 56 78',
    subject: 'Private Olfactory Consultation',
    message: 'Testing Maison Avelore branded confirmation auto-reply service.',
    boutique: 'Flagship Marais Atelier, Paris',
  };

  return await sendEnquiryConfirmationEmail(samplePayload);
}

// Default service export
export const autoReplyService = {
  sendEnquiryConfirmationEmail,
  onEnquirySavedToFirestore,
  handleFirestoreEnquiryAutoReply,
  generateBrandedConfirmationHtml,
  generatePlainTextConfirmation,
  getSmtpConfig,
  getTransporter,
  verifySmtpConnection,
  testAutoReply,
};

export default autoReplyService;
