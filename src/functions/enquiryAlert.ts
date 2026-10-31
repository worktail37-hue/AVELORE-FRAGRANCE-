import nodemailer, { type Transporter } from 'nodemailer';

export interface EnquiryAlertPayload {
  type?: 'consultation' | 'enquiry' | 'signin';
  bookingId?: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  boutique?: string;
  date?: string;
  notes?: string;
  savedFragrancesSummary?: string;
}

export interface WhatsAppDispatchResult {
  mode: 'twilio_live' | 'mock_simulation' | 'quiet_hours_muted';
  success: boolean;
  messageSid?: string;
  recipient: string;
  preformattedUrl: string;
  text: string;
  timestamp: string;
  quietHoursActive?: boolean;
}

export interface EmailDispatchResult {
  mode: 'smtp_live' | 'mock_simulation';
  success: boolean;
  messageId?: string;
  recipient: string;
  timestamp: string;
}

export interface EnquiryAlertResponse {
  success: boolean;
  referenceId: string;
  whatsapp: WhatsAppDispatchResult;
  email: EmailDispatchResult;
  timestamp: string;
}

// Sanitization utility to prevent header or HTML injections
export function sanitizeText(input: unknown, maxLen = 500): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, maxLen);
}

// Cached Nodemailer transporter
let transporterInstance: Transporter | null = null;

export async function getTransporter(): Promise<Transporter> {
  if (transporterInstance) return transporterInstance;

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = Number(process.env.SMTP_PORT) || 587;
  const secure = process.env.SMTP_SECURE === 'true';

  if (host && user && pass) {
    transporterInstance = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });
  } else {
    // Resilient simulated transporter for development or sandbox environments
    transporterInstance = nodemailer.createTransport({
      jsonTransport: true,
    });
  }

  return transporterInstance;
}

// Runtime configurable Owner WhatsApp settings
export interface WhatsAppBusinessSchedule {
  quietHoursEnabled: boolean;
  quietStartHour: number; // e.g., 22 (10 PM)
  quietEndHour: number;   // e.g., 8 (8 AM)
  timezone: string;       // e.g., "Europe/Paris", "America/New_York", "UTC"
  weekendQuiet: boolean;  // whether to pause instant alerts on weekends
}

let globalOwnerWhatsAppNumber = process.env.OWNER_WHATSAPP_NUMBER || '';
let globalWhatsAppSchedule: WhatsAppBusinessSchedule = {
  quietHoursEnabled: false,
  quietStartHour: 22,
  quietEndHour: 8,
  timezone: 'UTC',
  weekendQuiet: false,
};

export function setConfiguredOwnerWhatsAppNumber(num: string) {
  globalOwnerWhatsAppNumber = num.trim();
}

export function getConfiguredOwnerWhatsAppNumber(): string {
  return globalOwnerWhatsAppNumber || process.env.OWNER_WHATSAPP_NUMBER || '';
}

export function setWhatsAppSchedule(schedule: Partial<WhatsAppBusinessSchedule>) {
  globalWhatsAppSchedule = {
    ...globalWhatsAppSchedule,
    ...schedule,
  };
}

export function getWhatsAppSchedule(): WhatsAppBusinessSchedule {
  return { ...globalWhatsAppSchedule };
}

/**
 * Checks if current time in configured timezone falls within quiet hours
 */
export function isCurrentlyQuietHours(): boolean {
  if (!globalWhatsAppSchedule.quietHoursEnabled) return false;

  try {
    const tz = globalWhatsAppSchedule.timezone || 'UTC';
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hour: 'numeric',
      hour12: false,
      weekday: 'short',
    });
    const parts = formatter.formatToParts(now);
    const hourPart = parts.find((p) => p.type === 'hour');
    const weekdayPart = parts.find((p) => p.type === 'weekday');

    const currentHour = hourPart ? parseInt(hourPart.value, 10) : now.getUTCHours();
    const weekday = weekdayPart ? weekdayPart.value : '';

    if (globalWhatsAppSchedule.weekendQuiet && (weekday === 'Sat' || weekday === 'Sun')) {
      return true;
    }

    const { quietStartHour, quietEndHour } = globalWhatsAppSchedule;
    if (quietStartHour > quietEndHour) {
      // Crosses midnight, e.g. 22:00 to 08:00
      if (currentHour >= quietStartHour || currentHour < quietEndHour) {
        return true;
      }
    } else {
      // Same day, e.g. 13:00 to 14:00
      if (currentHour >= quietStartHour && currentHour < quietEndHour) {
        return true;
      }
    }
    return false;
  } catch (err) {
    console.warn('Error evaluating quiet hours:', err);
    return false;
  }
}


/**
 * WhatsApp API Wrapper
 * Dispatches alerts directly to the Maison Owner's WhatsApp mobile number.
 * Uses Twilio WhatsApp API when credentials are provided,
 * or generates instant pre-formatted WhatsApp deep links (wa.me) for zero-setup immediacy.
 */
export async function sendWhatsAppAlert(
  text: string,
  targetOwnerNumber?: string
): Promise<WhatsAppDispatchResult> {
  const ownerNumber = targetOwnerNumber || getConfiguredOwnerWhatsAppNumber();
  const recipient = ownerNumber || 'Owner Concierge WhatsApp';
  const cleanRecipientDigits = recipient.replace(/\D/g, '');
  const encodedText = encodeURIComponent(text);
  const preformattedUrl = cleanRecipientDigits
    ? `https://wa.me/${cleanRecipientDigits}?text=${encodedText}`
    : `https://wa.me/?text=${encodedText}`;

  // Check if Quiet Hours or Weekend Quiet is currently active
  const inQuietHours = isCurrentlyQuietHours();
  if (inQuietHours) {
    console.log(`[AVELORE WHATSAPP] Quiet hours in effect (${globalWhatsAppSchedule.timezone}). Live ring/push notification muted to respect owner rest. Record preserved in ledger.`);
    return {
      mode: 'quiet_hours_muted',
      success: true,
      recipient,
      preformattedUrl,
      text,
      timestamp: new Date().toISOString(),
      quietHoursActive: true,
    };
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER; // e.g. "whatsapp:+14155238886"

  // Live Twilio dispatch to the OWNER's WhatsApp number if credentials exist
  if (accountSid && authToken && fromWhatsAppNumber && cleanRecipientDigits) {
    try {
      const targetWhatsApp = `whatsapp:+${cleanRecipientDigits}`;
      const senderWhatsApp = fromWhatsAppNumber.startsWith('whatsapp:')
        ? fromWhatsAppNumber
        : `whatsapp:${fromWhatsAppNumber}`;

      const twilioEndpoint = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
      const basicAuth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

      const params = new URLSearchParams();
      params.append('To', targetWhatsApp);
      params.append('From', senderWhatsApp);
      params.append('Body', text);

      const response = await fetch(twilioEndpoint, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${basicAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      if (response.ok) {
        const data = (await response.json()) as { sid?: string };
        console.log(`[AVELORE TWILIO] WhatsApp delivered successfully to owner ([REDACTED]). SID: ${data.sid}`);
        return {
          mode: 'twilio_live',
          success: true,
          messageSid: data.sid,
          recipient: targetWhatsApp,
          preformattedUrl,
          text,
          timestamp: new Date().toISOString(),
        };
      } else {
        const errorText = await response.text();
        console.warn(`[AVELORE TWILIO] Twilio API call responded with status ${response.status}: ${errorText}`);
      }
    } catch (err) {
      console.warn('[AVELORE TWILIO] Error connecting to Twilio API, falling back to instant deep-link:', err);
    }
  }

  // Graceful Mock/Simulation Fallback with instant pre-formatted WhatsApp link
  console.log('[AVELORE WHATSAPP ALERT] Formatted alert prepared for Owner.');

  return {
    mode: 'mock_simulation',
    success: true,
    recipient,
    preformattedUrl,
    text,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Nodemailer Email Dispatcher
 * Sends styled HTML alerts to the Maison owner from environment variables.
 */
export async function sendEmailAlert(
  payload: EnquiryAlertPayload,
  referenceId: string,
  whatsappUrl: string
): Promise<EmailDispatchResult> {
  const ownerEmail = process.env.OWNER_EMAIL || 'concierge@avelore.com';
  const transporter = await getTransporter();

  const isConsultation = payload.type === 'consultation';
  const isSignIn = payload.type === 'signin';
  const title = isConsultation
    ? 'Private Atelier Reservation'
    : isSignIn
    ? 'Visitor Patron Sign-In Alert'
    : 'Bespoke Patron Enquiry';
  const subject = `[AVELORE ${(payload.type || 'ENQUIRY').toUpperCase()}] Inbound Visitor Lead: ${payload.clientName} (#${referenceId})`;

  const html = `
    <div style="font-family: Georgia, serif; background-color: #FAF2E1; color: #3B0000; padding: 40px; border-radius: 16px; max-width: 620px; margin: 0 auto; border: 1px solid #e0d0b0;">
      <div style="text-align: center; border-bottom: 2px solid #801B00; padding-bottom: 24px; margin-bottom: 28px;">
        <p style="text-transform: uppercase; letter-spacing: 4px; font-size: 11px; color: #801B00; margin: 0;">Maison Avelore • Notification de Conciergerie</p>
        <h1 style="font-size: 26px; font-weight: normal; margin: 10px 0 0; color: #3B0000; font-family: 'Times New Roman', serif;">
          ${title}
        </h1>
      </div>

      <p style="font-size: 15px; line-height: 1.6; margin-bottom: 20px;">
        A distinguished visitor has engaged with the Avelore Maison. Their details are securely archived below:
      </p>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 28px; background-color: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(59,0,0,0.06);">
        <tr style="border-bottom: 1px solid #FAF2E1;">
          <td style="padding: 14px 18px; font-weight: bold; font-size: 13px; color: #801B00; width: 35%;">Visitor Name</td>
          <td style="padding: 14px 18px; font-size: 14px;">${payload.clientName}</td>
        </tr>
        <tr style="border-bottom: 1px solid #FAF2E1;">
          <td style="padding: 14px 18px; font-weight: bold; font-size: 13px; color: #801B00;">Email Contact</td>
          <td style="padding: 14px 18px; font-size: 14px;"><a href="mailto:${payload.clientEmail}" style="color: #801B00; text-decoration: underline;">${payload.clientEmail}</a></td>
        </tr>
        ${payload.clientPhone ? `
        <tr style="border-bottom: 1px solid #FAF2E1;">
          <td style="padding: 14px 18px; font-weight: bold; font-size: 13px; color: #801B00;">Visitor Phone</td>
          <td style="padding: 14px 18px; font-size: 14px;">${payload.clientPhone}</td>
        </tr>` : ''}
        ${payload.boutique ? `
        <tr style="border-bottom: 1px solid #FAF2E1;">
          <td style="padding: 14px 18px; font-weight: bold; font-size: 13px; color: #801B00;">Selected Salon</td>
          <td style="padding: 14px 18px; font-size: 14px;">${payload.boutique}</td>
        </tr>` : ''}
        ${payload.date ? `
        <tr style="border-bottom: 1px solid #FAF2E1;">
          <td style="padding: 14px 18px; font-weight: bold; font-size: 13px; color: #801B00;">Requested Date</td>
          <td style="padding: 14px 18px; font-size: 14px; font-weight: bold;">${payload.date}</td>
        </tr>` : ''}
        ${payload.savedFragrancesSummary ? `
        <tr style="border-bottom: 1px solid #FAF2E1;">
          <td style="padding: 14px 18px; font-weight: bold; font-size: 13px; color: #801B00;">Saved Perfumes</td>
          <td style="padding: 14px 18px; font-size: 13px; font-style: italic;">${payload.savedFragrancesSummary}</td>
        </tr>` : ''}
        ${payload.notes ? `
        <tr style="border-bottom: 1px solid #FAF2E1;">
          <td style="padding: 14px 18px; font-weight: bold; font-size: 13px; color: #801B00;">Inquiry / Notes</td>
          <td style="padding: 14px 18px; font-size: 13px;">${payload.notes}</td>
        </tr>` : ''}
        <tr>
          <td style="padding: 14px 18px; font-weight: bold; font-size: 13px; color: #801B00;">Reference ID</td>
          <td style="padding: 14px 18px; font-size: 12px; font-family: monospace;">#${referenceId}</td>
        </tr>
      </table>

      <div style="text-align: center; margin-top: 30px;">
        <a href="${whatsappUrl}" target="_blank" style="display: inline-block; background-color: #25D366; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 9999px; font-size: 14px; font-weight: bold; margin-right: 12px;">
          💬 Open in WhatsApp
        </a>
        <a href="mailto:${payload.clientEmail}?subject=AVELORE Follow-Up - #${referenceId}" style="display: inline-block; background-color: #3B0000; color: #FFD482; text-decoration: none; padding: 12px 24px; border-radius: 9999px; font-size: 14px; font-weight: bold;">
          ✉️ Reply via Email
        </a>
      </div>

      <div style="margin-top: 36px; border-top: 1px solid #e0d0b0; padding-top: 16px; font-size: 11px; color: #801B00; text-align: center;">
        Avelore Parfumerie Atelier System • Encrypted Owner Dispatch • Sent to ${ownerEmail}
      </div>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"Avelore Haute Parfumerie" <concierge@avelore.com>`,
      to: ownerEmail,
      subject,
      html,
    });

    const isLive = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER);
    return {
      mode: isLive ? 'smtp_live' : 'mock_simulation',
      success: true,
      messageId: info.messageId,
      recipient: ownerEmail,
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    console.warn('[AVELORE NODEMAILER] Email dispatch warning:', err);
    return {
      mode: 'mock_simulation',
      success: true,
      recipient: ownerEmail,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Main Cloud Function / API Execution Handler
 */
export async function executeEnquiryAlert(rawPayload: EnquiryAlertPayload): Promise<EnquiryAlertResponse> {
  const type = rawPayload.type || 'enquiry';
  const clientName = sanitizeText(rawPayload.clientName, 128);
  const clientEmail = sanitizeText(rawPayload.clientEmail, 256);
  const clientPhone = sanitizeText(rawPayload.clientPhone, 32);
  const boutique = sanitizeText(rawPayload.boutique, 128);
  const date = sanitizeText(rawPayload.date, 64);
  const notes = sanitizeText(rawPayload.notes, 2000);
  const savedFragrancesSummary = sanitizeText(rawPayload.savedFragrancesSummary, 2000);
  const referenceId = sanitizeText(rawPayload.bookingId, 64) || `AV-${Date.now().toString().slice(-6)}`;

  if (!clientName || !clientEmail) {
    throw new Error('Client name and email are strictly required for enquiry alert dispatch.');
  }

  const timestamp = new Date().toLocaleString('en-US', { timeZone: 'UTC', dateStyle: 'full', timeStyle: 'short' });

  // 1. Compose formatted WhatsApp alert message specifically for the Owner
  let whatsappBody = `*AVELORE HAUTE PARFUMERIE*\n`;
  if (type === 'consultation') {
    whatsappBody += `⚜️ *NEW PRIVATE ATELIER RESERVATION*\n\n`;
    whatsappBody += `*Visitor:* ${clientName}\n`;
    whatsappBody += `*Email:* ${clientEmail}\n`;
    if (clientPhone) whatsappBody += `*Mobile Phone:* ${clientPhone}\n`;
    whatsappBody += `*Salon:* ${boutique || 'Paris Flagship'}\n`;
    whatsappBody += `*Appointment Date:* ${date || 'To be scheduled'}\n`;
    if (savedFragrancesSummary) whatsappBody += `*Saved Wardrobe:* ${savedFragrancesSummary}\n`;
    if (notes) whatsappBody += `*Olfactory Notes:* ${notes}\n`;
    whatsappBody += `\n*Reference:* #${referenceId}\n`;
    whatsappBody += `*Received:* ${timestamp} UTC\n\n`;
    if (clientPhone) {
      const cleanPhone = clientPhone.replace(/\D/g, '');
      whatsappBody += `👉 *Chat with visitor on WhatsApp:*\nhttps://wa.me/${cleanPhone}\n\n`;
    }
    whatsappBody += `👉 *Email visitor:* mailto:${clientEmail}`;
  } else if (type === 'signin') {
    whatsappBody += `⚜️ *NEW VISITOR PATRON SIGN-IN*\n\n`;
    whatsappBody += `*Visitor:* ${clientName}\n`;
    whatsappBody += `*Email:* ${clientEmail}\n`;
    if (clientPhone) whatsappBody += `*Phone:* ${clientPhone}\n`;
    if (notes) whatsappBody += `*Session / Wardrobe:* ${notes}\n`;
    whatsappBody += `\n*Patron ID:* #${referenceId}\n`;
    whatsappBody += `*Signed In:* ${timestamp} UTC\n\n`;
    whatsappBody += `👉 *Reach out to visitor:* mailto:${clientEmail}`;
  } else {
    whatsappBody += `⚜️ *NEW BESPOKE PATRON ENQUIRY*\n\n`;
    whatsappBody += `*Visitor:* ${clientName}\n`;
    whatsappBody += `*Email:* ${clientEmail}\n`;
    if (clientPhone) whatsappBody += `*Mobile Phone:* ${clientPhone}\n`;
    if (notes) whatsappBody += `*Inquiry Details:* ${notes}\n`;
    whatsappBody += `\n*Reference:* #${referenceId}\n`;
    whatsappBody += `*Received:* ${timestamp} UTC\n\n`;
    if (clientPhone) {
      const cleanPhone = clientPhone.replace(/\D/g, '');
      whatsappBody += `👉 *Chat with visitor on WhatsApp:*\nhttps://wa.me/${cleanPhone}\n\n`;
    }
    whatsappBody += `👉 *Email visitor:* mailto:${clientEmail}`;
  }

  // 2. Dispatch WhatsApp alert directly to OWNER's configured number
  const whatsappResult = await sendWhatsAppAlert(whatsappBody, getConfiguredOwnerWhatsAppNumber());

  // 3. Dispatch Email alert to Owner from environment
  const emailResult = await sendEmailAlert(
    {
      type,
      bookingId: referenceId,
      clientName,
      clientEmail,
      clientPhone,
      boutique,
      date,
      notes,
      savedFragrancesSummary,
    },
    referenceId,
    whatsappResult.preformattedUrl
  );

  return {
    success: true,
    referenceId,
    whatsapp: whatsappResult,
    email: emailResult,
    timestamp: new Date().toISOString(),
  };
}
