/**
 * Maison Avelore Auto-Reply Service (Root Entry Point)
 * Sends an exquisitely branded, professional patron confirmation email immediately after
 * an inquiry is successfully saved to Firestore, utilizing the SMTP configuration from .env.
 */

import {
  autoReplyService,
  sendEnquiryConfirmationEmail,
  onEnquirySavedToFirestore,
  handleFirestoreEnquiryAutoReply,
  generateBrandedConfirmationHtml,
  generatePlainTextConfirmation,
  getSmtpConfig,
  getTransporter,
  verifySmtpConnection,
  testAutoReply,
  type EnquiryConfirmationPayload,
  type SmtpConfig,
  type AutoReplyResult,
} from './src/services/autoReplyService';

export {
  autoReplyService,
  sendEnquiryConfirmationEmail,
  onEnquirySavedToFirestore,
  handleFirestoreEnquiryAutoReply,
  generateBrandedConfirmationHtml,
  generatePlainTextConfirmation,
  getSmtpConfig,
  getTransporter,
  verifySmtpConnection,
  testAutoReply,
  type EnquiryConfirmationPayload,
  type SmtpConfig,
  type AutoReplyResult,
};

export default autoReplyService;

// Self-executing diagnostic test if invoked directly via tsx / node
if (process.argv[1] && process.argv[1].endsWith('autoReplyService.ts')) {
  console.log('[AutoReplyService] Running diagnostic self-test...');
  const cfg = getSmtpConfig();
  console.log('[AutoReplyService] Active SMTP Configuration:', {
    host: cfg.host || '(not configured - using resilient simulation)',
    port: cfg.port,
    secure: cfg.secure,
    user: cfg.user ? `${cfg.user.substring(0, 3)}***` : '(empty)',
    fromAddress: cfg.fromAddress,
    isConfigured: cfg.isConfigured,
  });

  testAutoReply('patron-test@avelore.com')
    .then((result) => {
      console.log('[AutoReplyService] Test Auto-Reply Result:', result);
      console.log('[AutoReplyService] Verification Complete.');
    })
    .catch((err) => {
      console.error('[AutoReplyService] Test failed:', err);
    });
}
