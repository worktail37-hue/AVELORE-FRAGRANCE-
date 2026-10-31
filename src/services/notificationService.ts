/**
 * Maison Avelore Notification Service
 * Secure handler for incoming visitor and patron enquiries.
 * Integrates with the Twilio API to forward real-time enquiry data to the Maison owner.
 * All sensitive credentials are pulled strictly from environment variables.
 */

// Interface Definitions
export interface EnquiryData {
  id?: string;
  referenceId?: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  subject?: string;
  message: string;
  boutique?: string;
  date?: string;
  userId?: string;
  userRole?: string;
  source?: 'web_form' | 'concierge_chat' | 'consultation_modal' | 'direct_api';
  timestamp?: string;
}

export interface NotificationConfig {
  accountSid?: string;
  authToken?: string;
  fromNumber: string;
  ownerNumber: string;
  isTwilioConfigured: boolean;
}

export interface NotificationResult {
  success: boolean;
  deliveryMode: 'twilio_live' | 'whatsapp_direct_link' | 'server_dispatched';
  referenceId: string;
  targetNumber: string;
  timestamp: string;
  messageSid?: string;
  whatsappUrl?: string;
  formattedMessage: string;
  error?: string;
  emailRecipient?: string;
}

// Environment Variables Configuration
function getEnvVar(key: string, fallback = ''): string {
  // Support Node.js process.env and Vite import.meta.env
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key] || fallback;
  }
  if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env[key]) {
    return (import.meta as any).env[key] || fallback;
  }
  return fallback;
}

// Default Maison Owner WhatsApp Number configured strictly via environment
export const DEFAULT_OWNER_NUMBER = getEnvVar('OWNER_WHATSAPP_NUMBER', '');

/**
 * Returns active Twilio configuration pulled securely from environment variables.
 */
export function getNotificationConfig(): NotificationConfig {
  const accountSid = getEnvVar('TWILIO_ACCOUNT_SID');
  const authToken = getEnvVar('TWILIO_AUTH_TOKEN');
  const fromNumber = getEnvVar('TWILIO_WHATSAPP_NUMBER') || '+14155238886';
  const ownerNumber = getEnvVar('OWNER_WHATSAPP_NUMBER') || DEFAULT_OWNER_NUMBER;

  return {
    accountSid,
    authToken,
    fromNumber,
    ownerNumber,
    isTwilioConfigured: Boolean(accountSid && authToken),
  };
}

/**
 * Normalizes any phone number into standard international format for WhatsApp.
 */
export function normalizeWhatsAppNumber(rawNumber: string): {
  cleanDigits: string;
  e164: string;
  twilioUri: string;
  waMeDigits: string;
} {
  const defaultNum = DEFAULT_OWNER_NUMBER;
  const num = (rawNumber || defaultNum).trim();

  // Strip existing 'whatsapp:' prefix if present
  let sanitized = num.toLowerCase().startsWith('whatsapp:') ? num.slice(9) : num;
  sanitized = sanitized.replace(/[\s\-\(\)\.]/g, '');

  const digits = sanitized.replace(/\D/g, '');
  let e164 = '';

  if (sanitized.startsWith('+')) {
    e164 = sanitized;
  } else if (digits.length === 10) {
    // 10 digits starting with 6, 7, 8, or 9 indicates Indian mobile format (+91)
    if (/^[6-9]/.test(digits)) {
      e164 = `+91${digits}`;
    } else {
      e164 = `+1${digits}`;
    }
  } else if (digits.length === 12 && digits.startsWith('91')) {
    e164 = `+${digits}`;
  } else {
    e164 = `+${digits}`;
  }

  const waMeDigits = e164.replace(/\D/g, '');
  const twilioUri = `whatsapp:${e164}`;

  return {
    cleanDigits: digits,
    e164,
    twilioUri,
    waMeDigits,
  };
}

/**
 * Constructs an elegant, high-luxury formatted WhatsApp message for Maison Avelore.
 */
export function formatEnquiryMessage(enquiry: EnquiryData, referenceId: string): string {
  const dateFormatted = new Date().toLocaleString('en-US', {
    timeZone: 'UTC',
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const subjectHeader = enquiry.subject ? `[${enquiry.subject}]` : '[Bespoke Atelier Inquiry]';

  return (
    `*AVELORE HAUTE PARFUMERIE*\n` +
    `⚜️ *NEW BESPOKE PATRON ENQUIRY*\n\n` +
    `*Visitor:* ${enquiry.clientName}\n` +
    `*Email:* ${enquiry.clientEmail}\n` +
    (enquiry.clientPhone ? `*Phone:* ${enquiry.clientPhone}\n` : '') +
    (enquiry.boutique ? `*Atelier:* ${enquiry.boutique}\n` : '') +
    (enquiry.date ? `*Requested Date:* ${enquiry.date}\n` : '') +
    `*Inquiry Details:* ${subjectHeader} ${enquiry.message}\n\n` +
    `*Reference:* #${referenceId}\n` +
    `*Received:* ${dateFormatted} UTC\n\n` +
    `👉 *Email visitor:* mailto:${enquiry.clientEmail}`
  );
}

/**
 * Builds the direct universal WhatsApp click-to-chat URL as a zero-latency fallback.
 */
export function buildWhatsAppDirectUrl(targetNumber: string, messageText: string): string {
  const { waMeDigits } = normalizeWhatsAppNumber(targetNumber);
  return `https://wa.me/${waMeDigits}?text=${encodeURIComponent(messageText)}`;
}

/**
 * Dispatches a WhatsApp notification directly via the Twilio REST API using environment credentials.
 * Works securely in Node.js server environments.
 */
export async function sendTwilioWhatsAppApi(
  bodyText: string,
  targetNumber = DEFAULT_OWNER_NUMBER
): Promise<{ success: boolean; messageSid?: string; error?: string }> {
  const config = getNotificationConfig();

  if (!config.isTwilioConfigured || !config.accountSid || !config.authToken) {
    return {
      success: false,
      error: 'Twilio credentials (TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN) not configured in environment.',
    };
  }

  const { twilioUri: toUri } = normalizeWhatsAppNumber(targetNumber);
  const { twilioUri: fromUri } = normalizeWhatsAppNumber(config.fromNumber);

  try {
    // Dynamically require/import Twilio in Node.js or perform direct HTTPS Basic Auth REST request
    const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`;
    const authHeader = `Basic ${Buffer.from(`${config.accountSid}:${config.authToken}`).toString('base64')}`;

    const params = new URLSearchParams();
    params.append('To', toUri);
    params.append('From', fromUri);
    params.append('Body', bodyText);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const data = await response.json();

    if (response.ok && data.sid) {
      return {
        success: true,
        messageSid: data.sid,
      };
    } else {
      return {
        success: false,
        error: data.message || `Twilio API returned status ${response.status}`,
      };
    }
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to dispatch via Twilio API',
    };
  }
}

/**
 * Main, reusable handler for processing incoming visitor enquiries.
 *
 * Execution flow:
 * 1. Generates unique booking / reference ID.
 * 2. Formats luxury dispatch message.
 * 3. Normalizes recipient to owner number from environment.
 * 4. If executed in browser: routes via secure server proxy `/api/enquiries` or `/api/notify-enquiry`.
 * 5. If executed in server: attempts direct Twilio API dispatch with click-to-chat fallback.
 */
export async function handleIncomingEnquiry(enquiry: EnquiryData): Promise<NotificationResult> {
  const referenceId =
    enquiry.referenceId ||
    enquiry.id ||
    `enquiry_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const config = getNotificationConfig();
  const targetNumber = config.ownerNumber || DEFAULT_OWNER_NUMBER;
  const formattedMessage = formatEnquiryMessage(enquiry, referenceId);
  const whatsappUrl = buildWhatsAppDirectUrl(targetNumber, formattedMessage);
  const now = new Date().toISOString();

  // Check if running in browser client environment
  const isBrowser = typeof window !== 'undefined';

  if (isBrowser) {
    try {
      // Dispatch securely through server-side proxy
      const serverRes = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: enquiry.clientName,
          clientEmail: enquiry.clientEmail,
          clientPhone: enquiry.clientPhone,
          subject: enquiry.subject || 'Bespoke Atelier Inquiry',
          message: enquiry.message,
          userId: enquiry.userId,
          userRole: enquiry.userRole,
          triggerNotification: true,
        }),
      });

      if (serverRes.ok) {
        const data = await serverRes.json();
        return {
          success: true,
          deliveryMode: 'server_dispatched',
          referenceId: data.bookingId || referenceId,
          targetNumber,
          timestamp: now,
          whatsappUrl: data.whatsappUrl || whatsappUrl,
          formattedMessage,
          emailRecipient: data.emailDeliveredTo,
        };
      }
    } catch (browserErr) {
      console.warn('[NotificationService] Client-side fetch failed, falling back to direct URL:', browserErr);
    }

    // Fallback in browser: provide verified direct link
    return {
      success: true,
      deliveryMode: 'whatsapp_direct_link',
      referenceId,
      targetNumber,
      timestamp: now,
      whatsappUrl,
      formattedMessage,
    };
  }

  // Running on Server-Side: Attempt live Twilio dispatch
  if (config.isTwilioConfigured) {
    const twilioResult = await sendTwilioWhatsAppApi(formattedMessage, targetNumber);
    if (twilioResult.success) {
      return {
        success: true,
        deliveryMode: 'twilio_live',
        referenceId,
        targetNumber,
        timestamp: now,
        messageSid: twilioResult.messageSid,
        whatsappUrl,
        formattedMessage,
      };
    } else {
      console.warn(`[NotificationService] Twilio live dispatch error: ${twilioResult.error}. Using direct WhatsApp link fallback.`);
    }
  }

  // Fallback if Twilio keys are not set or in sandbox
  return {
    success: true,
    deliveryMode: 'whatsapp_direct_link',
    referenceId,
    targetNumber,
    timestamp: now,
    whatsappUrl,
    formattedMessage,
  };
}

/**
 * Diagnostic self-test function to verify the Twilio notification flow for the configured owner number.
 */
export async function testNotificationHandler(customNumber = DEFAULT_OWNER_NUMBER): Promise<NotificationResult> {
  const dummyEnquiry: EnquiryData = {
    clientName: 'Caroline de Beauvoir',
    clientEmail: 'caroline@domain.com',
    clientPhone: '+33 6 12 34 56 78',
    subject: 'Private Olfactory Consultation',
    message: 'Testing Maison Avelore Twilio WhatsApp notification bridge to owner number.',
    boutique: 'Flagship Marais Atelier, Paris',
    source: 'direct_api',
  };

  return await handleIncomingEnquiry(dummyEnquiry);
}

// Export default service singleton
export const notificationService = {
  handleIncomingEnquiry,
  sendTwilioWhatsAppApi,
  formatEnquiryMessage,
  buildWhatsAppDirectUrl,
  getNotificationConfig,
  testNotificationHandler,
  normalizeWhatsAppNumber,
  DEFAULT_OWNER_NUMBER,
};

export default notificationService;
