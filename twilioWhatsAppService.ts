/**
 * Maison Avelore Twilio WhatsApp Business API Service (Root Entry Point)
 * Interfaces with the Twilio WhatsApp Business API using credentials from .env
 * to forward incoming visitor and patron enquiry details directly to the registered owner number.
 */

import {
  twilioWhatsAppService,
  REGISTERED_OWNER_NUMBER,
  DEFAULT_TWILIO_SENDER,
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
  type TwilioConfig,
  type TwilioConnectionStatus,
  type SendWhatsAppMessageParams,
  type SendWhatsAppResult,
  type TestNotificationResult,
  type VisitorEnquiryAlert,
} from './src/services/twilioWhatsAppService';

export {
  twilioWhatsAppService,
  REGISTERED_OWNER_NUMBER,
  DEFAULT_TWILIO_SENDER,
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
  type TwilioConfig,
  type TwilioConnectionStatus,
  type SendWhatsAppMessageParams,
  type SendWhatsAppResult,
  type TestNotificationResult,
  type VisitorEnquiryAlert,
};

export default twilioWhatsAppService;

// Enable direct CLI test execution: `npx tsx twilioWhatsAppService.ts`
if (process.argv[1] && process.argv[1].endsWith('twilioWhatsAppService.ts')) {
  console.log('--- EXECUTING TWILIO WHATSAPP SERVICE VERIFICATION (ROOT ENTRY) ---');
  sendTestNotification()
    .then((res) => {
      console.log('\n--- TEST RESULT SUMMARY ---');
      console.log(JSON.stringify(res, null, 2));
      process.exit(res.success ? 0 : 1);
    })
    .catch((err) => {
      console.error('Fatal CLI test error:', err);
      process.exit(1);
    });
}
