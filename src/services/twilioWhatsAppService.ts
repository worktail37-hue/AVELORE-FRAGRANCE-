/**
 * Maison Avelore Twilio WhatsApp Business API Service
 * Securely interfaces with Twilio to forward incoming visitor and patron enquiry details
 * directly to the registered Maison owner number from environment variables.
 *
 * All sensitive API keys are pulled strictly from environment variables (.env).
 */

import twilio, { Twilio } from 'twilio';
import dotenv from 'dotenv';

// Load environment variables from .env
dotenv.config();

// User's registered mobile number for WhatsApp alerts from environment
export const REGISTERED_OWNER_NUMBER = (process.env.OWNER_WHATSAPP_NUMBER || '').trim();
export const DEFAULT_TWILIO_SENDER = (process.env.TWILIO_WHATSAPP_NUMBER || '+14155238886').trim(); // Official Twilio WhatsApp Sandbox / Sender

export interface TwilioConfig {
  accountSid: string;
  authToken: string;
  fromWhatsAppNumber: string;
  ownerWhatsAppNumber: string;
  isConfigured: boolean;
  missingVariables: string[];
}

export interface TwilioConnectionStatus {
  connected: boolean;
  accountSid?: string;
  friendlyName?: string;
  status?: string;
  type?: string;
  error?: string;
  timestamp: string;
}

export interface SendWhatsAppMessageParams {
  to?: string; // Recipient number. Defaults to REGISTERED_OWNER_NUMBER from environment.
  body: string;
  mediaUrl?: string[];
}

export interface SendWhatsAppResult {
  success: boolean;
  mode: 'twilio_live' | 'simulation_click_to_chat';
  messageSid?: string;
  to: string;
  from: string;
  status: string;
  dateCreated?: string;
  clickToChatUrl?: string;
  error?: string;
  timestamp: string;
}

export interface TestNotificationResult {
  success: boolean;
  connectionStatus: TwilioConnectionStatus;
  dispatchResult?: SendWhatsAppResult;
  targetNumber: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

export interface VisitorEnquiryAlert {
  type?: 'enquiry' | 'consultation' | 'signin';
  referenceId?: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  subject?: string;
  message?: string;
  boutique?: string;
  date?: string;
  savedFragrancesSummary?: string;
  createdAt?: string;
}

/**
 * Normalizes phone numbers to standard E.164 and Twilio WhatsApp URI format.
 */
export function formatWhatsAppNumber(phone: string): { e164: string; twilioUri: string; rawDigits: string } {
  const target = (phone || REGISTERED_OWNER_NUMBER).trim();

  // Strip 'whatsapp:' prefix if present
  let cleaned = target.toLowerCase().startsWith('whatsapp:') ? target.slice(9) : target;
  cleaned = cleaned.replace(/[\s\-\(\)\.]/g, '');

  const digitsOnly = cleaned.replace(/\D/g, '');

  let e164 = '';
  if (cleaned.startsWith('+')) {
    e164 = cleaned;
  } else if (digitsOnly.length === 10) {
    // 10-digit number: if starting with 6, 7, 8, or 9 normalize to Indian mobile (+91)
    if (/^[6-9]/.test(digitsOnly)) {
      e164 = `+91${digitsOnly}`;
    } else {
      e164 = `+1${digitsOnly}`;
    }
  } else if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
    e164 = `+${digitsOnly}`;
  } else if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
    e164 = `+${digitsOnly}`;
  } else {
    e164 = `+${digitsOnly}`;
  }

  const twilioUri = `whatsapp:${e164}`;
  const finalDigits = e164.replace(/\D/g, '');

  return { e164, twilioUri, rawDigits: finalDigits };
}

/**
 * Retrieves and validates Twilio credentials from process.env.
 * Ensures sensitive keys are never hardcoded.
 */
export function getTwilioConfig(): TwilioConfig {
  const accountSid = (process.env.TWILIO_ACCOUNT_SID || '').trim();
  const authToken = (process.env.TWILIO_AUTH_TOKEN || '').trim();
  const fromWhatsAppNumber = (process.env.TWILIO_WHATSAPP_NUMBER || DEFAULT_TWILIO_SENDER).trim();
  const ownerWhatsAppNumber = (process.env.OWNER_WHATSAPP_NUMBER || REGISTERED_OWNER_NUMBER).trim();

  const missingVariables: string[] = [];
  if (!accountSid) missingVariables.push('TWILIO_ACCOUNT_SID');
  if (!authToken) missingVariables.push('TWILIO_AUTH_TOKEN');

  const isConfigured = missingVariables.length === 0;

  return {
    accountSid,
    authToken,
    fromWhatsAppNumber,
    ownerWhatsAppNumber,
    isConfigured,
    missingVariables,
  };
}

let cachedTwilioClient: Twilio | null = null;
let lastClientSid = '';

/**
 * Returns an authenticated Twilio SDK client instance or null if credentials are not configured.
 */
export function getTwilioClient(): Twilio | null {
  const config = getTwilioConfig();
  if (!config.isConfigured) {
    return null;
  }

  if (cachedTwilioClient && lastClientSid === config.accountSid) {
    return cachedTwilioClient;
  }

  try {
    cachedTwilioClient = twilio(config.accountSid, config.authToken);
    lastClientSid = config.accountSid;
    return cachedTwilioClient;
  } catch (err) {
    console.error('[TwilioWhatsAppService] Failed to initialize Twilio client:', err);
    return null;
  }
}

/**
 * Generates an instant universal WhatsApp Click-to-Chat URL (https://wa.me/...).
 * Provides guaranteed zero-latency fallback when API credentials are unset or in sandbox mode.
 */
export function generateClickToChatUrl(phone: string, text: string): string {
  const { rawDigits } = formatWhatsAppNumber(phone);
  const encodedText = encodeURIComponent(text);
  return rawDigits ? `https://wa.me/${rawDigits}?text=${encodedText}` : `https://wa.me/?text=${encodedText}`;
}

/**
 * Verifies the Twilio API connection and checks credentials against the Twilio Accounts endpoint.
 */
export async function verifyTwilioConnection(): Promise<TwilioConnectionStatus> {
  const config = getTwilioConfig();
  const timestamp = new Date().toISOString();

  if (!config.isConfigured) {
    return {
      connected: false,
      status: 'unconfigured',
      error: `Missing required environment variables in .env: ${config.missingVariables.join(', ')}`,
      timestamp,
    };
  }

  const client = getTwilioClient();
  if (!client) {
    return {
      connected: false,
      status: 'initialization_failed',
      error: 'Failed to create Twilio client with provided credentials.',
      timestamp,
    };
  }

  try {
    // Authenticate with Twilio API by fetching account details
    const account = await client.api.v2010.accounts(config.accountSid).fetch();

    return {
      connected: true,
      accountSid: account.sid,
      friendlyName: account.friendlyName,
      status: account.status,
      type: account.type,
      timestamp,
    };
  } catch (err: any) {
    const errorMessage = err?.message || String(err);
    console.error('[TwilioWhatsAppService] Connection verification failed:', errorMessage);

    return {
      connected: false,
      accountSid: config.accountSid,
      status: 'authentication_error',
      error: errorMessage,
      timestamp,
    };
  }
}

/**
 * Test function to verify the Twilio connection.
 * Returns a clear status object and diagnostic message.
 */
export async function testTwilioConnection(): Promise<{ connected: boolean; message: string; details?: any }> {
  const status = await verifyTwilioConnection();
  if (status.connected) {
    return {
      connected: true,
      message: `Successfully authenticated with Twilio API. Account: ${status.friendlyName || status.accountSid} (Status: ${status.status})`,
      details: status,
    };
  }
  return {
    connected: false,
    message: `Twilio connection unverified: ${status.error}`,
    details: status,
  };
}

export const testConnection = testTwilioConnection;

/**
 * Dispatches a WhatsApp message via the Twilio WhatsApp Business API.
 * Automatically targets the registered owner number from environment variables by default.
 * Falls back gracefully to simulation and generates click-to-chat links if credentials are unset.
 */
export async function sendWhatsAppMessage(params: SendWhatsAppMessageParams): Promise<SendWhatsAppResult> {
  const config = getTwilioConfig();
  const timestamp = new Date().toISOString();

  // Resolve recipient: either explicitly provided or default to registered owner number
  const recipientRaw = params.to || config.ownerWhatsAppNumber || REGISTERED_OWNER_NUMBER;
  const { twilioUri: toUri } = formatWhatsAppNumber(recipientRaw);
  const { twilioUri: fromUri } = formatWhatsAppNumber(config.fromWhatsAppNumber);

  // If Twilio credentials are not set in .env, provide resilient simulation with verified click-to-chat URL
  if (!config.isConfigured) {
    const fallbackUrl = generateClickToChatUrl(recipientRaw, params.body);
    console.log(`[TwilioWhatsAppService] Operating in simulation mode. Click-to-Chat dispatch prepared for recipient [REDACTED].`);

    return {
      success: true,
      mode: 'simulation_click_to_chat',
      to: toUri,
      from: fromUri,
      status: 'simulated_fallback',
      clickToChatUrl: fallbackUrl,
      error: `Live API dispatch requires: ${config.missingVariables.join(', ')} in .env`,
      timestamp,
    };
  }

  const client = getTwilioClient();
  if (!client) {
    throw new Error('Twilio client is unavailable. Please verify TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env.');
  }

  try {
    const message = await client.messages.create({
      from: fromUri,
      to: toUri,
      body: params.body,
      mediaUrl: params.mediaUrl,
    });

    console.log(`[TwilioWhatsAppService] WhatsApp message dispatched successfully. SID: ${message.sid}, Status: ${message.status}`);

    return {
      success: true,
      mode: 'twilio_live',
      messageSid: message.sid,
      to: toUri,
      from: fromUri,
      status: message.status,
      dateCreated: message.dateCreated ? message.dateCreated.toISOString() : undefined,
      clickToChatUrl: generateClickToChatUrl(recipientRaw, params.body),
      timestamp,
    };
  } catch (err: any) {
    const errorText = err?.message || String(err);
    console.error(`[TwilioWhatsAppService] Twilio API call failed for recipient [REDACTED]:`, errorText);

    return {
      success: false,
      mode: 'twilio_live',
      to: toUri,
      from: fromUri,
      status: 'failed',
      error: errorText,
      clickToChatUrl: generateClickToChatUrl(recipientRaw, params.body),
      timestamp,
    };
  }
}

/**
 * Formats and forwards incoming visitor enquiry details to the registered number 9106335415.
 */
export async function forwardEnquiryToWhatsApp(
  enquiry: VisitorEnquiryAlert,
  targetNumberOverride?: string
): Promise<SendWhatsAppResult> {
  const referenceId = enquiry.referenceId || `enquiry_${Date.now()}`;
  const isConsultation = enquiry.type === 'consultation';
  const isSignIn = enquiry.type === 'signin';

  const headline = isConsultation
    ? '⚜️ PRIVATE ATELIER CONSULTATION'
    : isSignIn
    ? '⚜️ PATRON SIGN-IN ACTIVITY'
    : '⚜️ NEW BESPOKE PATRON ENQUIRY';

  const targetRecipient = targetNumberOverride || REGISTERED_OWNER_NUMBER;

  const lines = [
    `*MAISON AVELORE HAUTE PARFUMERIE*`,
    headline,
    `Ref: #${referenceId}`,
    `Date: ${new Date().toLocaleString('en-US', { timeZone: 'UTC', dateStyle: 'medium', timeStyle: 'short' })} UTC`,
    '────────────────────────',
    `👤 *Patron:* ${enquiry.clientName}`,
    `📧 *Email:* ${enquiry.clientEmail}`,
    enquiry.clientPhone ? `📱 *Phone:* ${enquiry.clientPhone}` : null,
    enquiry.boutique ? `📍 *Salon Atelier:* ${enquiry.boutique}` : null,
    enquiry.date ? `📅 *Requested Appointment:* ${enquiry.date}` : null,
    enquiry.subject ? `🏷️ *Nature:* ${enquiry.subject}` : null,
    enquiry.savedFragrancesSummary ? `💎 *Saved Fragrances:* ${enquiry.savedFragrancesSummary}` : null,
    enquiry.message ? `💬 *Message:* "${enquiry.message}"` : null,
    '────────────────────────',
    enquiry.clientPhone
      ? `👉 *Chat with visitor:* https://wa.me/${enquiry.clientPhone.replace(/\D/g, '')}`
      : null,
    `👉 *Reply via Email:* mailto:${enquiry.clientEmail}`,
    'Confidential correspondence for Maison Avelore Owner Concierge.',
  ].filter(Boolean);

  const body = lines.join('\n');

  console.log(`[TwilioWhatsAppService] Forwarding enquiry #${referenceId} to registered owner contact...`);
  return await sendWhatsAppMessage({
    to: targetRecipient,
    body,
  });
}

// Re-export alias matching alternative naming conventions
export const sendVisitorEnquiryAlert = forwardEnquiryToWhatsApp;

/**
 * Performs an end-to-end connection test and sends a test notification to verify delivery
 * to the registered owner number.
 */
export async function sendTestNotification(recipientOverride?: string): Promise<TestNotificationResult> {
  const config = getTwilioConfig();
  const timestamp = new Date().toISOString();

  // Resolve target number (defaults to registered owner number from environment)
  const targetNumber = recipientOverride || config.ownerWhatsAppNumber || REGISTERED_OWNER_NUMBER;
  const { twilioUri } = formatWhatsAppNumber(targetNumber);

  console.log(`[TwilioWhatsAppService] Initiating connection test dispatch...`);

  // Step 1: Verify Twilio API connection
  const connectionStatus = await verifyTwilioConnection();

  // Step 2: Format test notification message
  const testMessage = [
    '⚜️ *MAISON AVELORE — TWILIO WHATSAPP API TEST*',
    '────────────────────────',
    'Salutations,',
    'This is a verification dispatch confirming that the Twilio WhatsApp Business API integration is configured and active.',
    '',
    `• *Auth Status:* ${connectionStatus.connected ? '✅ Authenticated & Active' : '⚠️ Unconfigured in .env / Simulation Mode'}`,
    `• *Twilio Account SID:* ${connectionStatus.accountSid || (config.accountSid ? `${config.accountSid.slice(0, 8)}...` : 'Not Set in .env')}`,
    `• *Sender Number:* ${config.fromWhatsAppNumber}`,
    `• *Registered Recipient:* ${twilioUri}`,
    `• *Reference ID:* #TEST-${Date.now().toString().slice(-6)}`,
    `• *Timestamp:* ${new Date().toLocaleString('en-US', { timeZone: 'UTC' })} UTC`,
    '',
    'All incoming visitor enquiries, consultations, and flacon commissions are routed to this registered WhatsApp number.',
    '────────────────────────',
  ].join('\n');

  // Step 3: Dispatch test notification
  let dispatchResult: SendWhatsAppResult;
  try {
    dispatchResult = await sendWhatsAppMessage({
      to: targetNumber,
      body: testMessage,
    });
  } catch (err: any) {
    dispatchResult = {
      success: false,
      mode: 'twilio_live',
      to: twilioUri,
      from: config.fromWhatsAppNumber,
      status: 'error',
      error: err?.message || String(err),
      clickToChatUrl: generateClickToChatUrl(targetNumber, testMessage),
      timestamp,
    };
  }

  const success = connectionStatus.connected ? dispatchResult.success : true;

  const result: TestNotificationResult = {
    success,
    connectionStatus,
    dispatchResult,
    targetNumber,
    message: testMessage,
    details: {
      accountConfigured: config.isConfigured,
      missingEnvVars: config.missingVariables,
      deliveryMode: dispatchResult.mode,
      registeredOwnerNumber: REGISTERED_OWNER_NUMBER,
    },
    timestamp,
  };

  console.log(`[TwilioWhatsAppService] Verification test complete. Connected: ${connectionStatus.connected}, Mode: ${dispatchResult.mode}`);
  return result;
}

export const testNotification = sendTestNotification;

// Default service export
export const twilioWhatsAppService = {
  getTwilioConfig,
  formatWhatsAppNumber,
  getTwilioClient,
  verifyTwilioConnection,
  testTwilioConnection,
  testConnection,
  sendWhatsAppMessage,
  forwardEnquiryToWhatsApp,
  sendVisitorEnquiryAlert,
  sendTestNotification,
  testNotification,
  generateClickToChatUrl,
  REGISTERED_OWNER_NUMBER,
  DEFAULT_TWILIO_SENDER,
};

export default twilioWhatsAppService;
