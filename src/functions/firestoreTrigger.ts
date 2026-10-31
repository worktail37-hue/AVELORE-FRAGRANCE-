import {
  executeEnquiryAlert,
  EnquiryAlertPayload,
  EnquiryAlertResponse,
  sanitizeText,
} from './enquiryAlert';
import { onEnquirySavedToFirestore } from '../services/autoReplyService';

// In-memory deduplication cache to prevent duplicate alerts for the same Firestore document
const processedSubmissionIds = new Map<string, number>();
const DEDUP_TTL_MS = 30 * 60 * 1000; // 30 minutes

function isDuplicate(id: string): boolean {
  const now = Date.now();
  // Clean expired keys
  for (const [key, timestamp] of processedSubmissionIds.entries()) {
    if (now - timestamp > DEDUP_TTL_MS) {
      processedSubmissionIds.delete(key);
    }
  }

  if (processedSubmissionIds.has(id)) {
    return true;
  }
  processedSubmissionIds.set(id, now);
  return false;
}

export interface FirestoreTriggerEvent<T = any> {
  eventType?: 'create' | 'write' | 'signin' | 'registration';
  collection: 'consultations' | 'enquiries' | 'users';
  documentId: string;
  data: T;
  timestamp?: string;
}

/**
 * Backend trigger handler for Firestore document creation events.
 * Captures form submissions from 'consultations' or 'enquiries' collections,
 * and visitor sign-ins from 'users' collection,
 * and dispatches instant alerts via Nodemailer (Email) and Twilio (WhatsApp API wrapper).
 */
export async function handleFirestoreFormSubmission(
  event: FirestoreTriggerEvent
): Promise<EnquiryAlertResponse & { triggeredBy: string; deduplicated?: boolean }> {
  const { collection, documentId, data } = event;

  if (!documentId) {
    throw new Error('Firestore documentId is required by backend trigger.');
  }

  // Deduplication guard
  const dedupKey = `${collection}:${documentId}`;
  if (isDuplicate(dedupKey)) {
    console.log(`[FIRESTORE TRIGGER] Document ${dedupKey} already processed. Skipping duplicate dispatch.`);
    return {
      success: true,
      referenceId: documentId,
      whatsapp: {
        mode: 'mock_simulation',
        success: true,
        recipient: 'Already Notified',
        preformattedUrl: '',
        text: 'Duplicate suppressed',
        timestamp: new Date().toISOString(),
      },
      email: {
        mode: 'mock_simulation',
        success: true,
        recipient: process.env.OWNER_EMAIL || 'concierge@avelore.com',
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
      triggeredBy: `firestore/${collection}`,
      deduplicated: true,
    };
  }

  console.log(`[FIRESTORE TRIGGER] New submission detected in ${collection}/${documentId}`);

  let alertPayload: EnquiryAlertPayload;

  if (collection === 'consultations') {
    alertPayload = {
      type: 'consultation',
      bookingId: documentId,
      clientName: sanitizeText(data.clientName || 'Distinguished Patron', 128),
      clientEmail: sanitizeText(data.clientEmail || '', 256),
      clientPhone: sanitizeText(data.clientPhone || '', 32),
      boutique: sanitizeText(data.boutique || 'Paris Flagship', 128),
      date: sanitizeText(data.date || 'To be scheduled', 64),
      notes: sanitizeText(data.notes || '', 2000),
      savedFragrancesSummary: sanitizeText(data.savedFragrancesSummary || '', 2000),
    };
  } else if (collection === 'users') {
    const isNew = data.isNewUser === true || event.eventType === 'registration';
    alertPayload = {
      type: 'signin',
      bookingId: documentId,
      clientName: sanitizeText(data.displayName || data.email?.split('@')[0] || 'Visitor Patron', 128),
      clientEmail: sanitizeText(data.email || '', 256),
      clientPhone: sanitizeText(data.phone || '', 32),
      notes: isNew
        ? 'New visitor registered via Google Authentication'
        : `Visitor logged in. Wardrobe: ${Array.isArray(data.favoriteProductIds) ? data.favoriteProductIds.length : 0} items saved`,
    };
  } else {
    // 'enquiries' collection
    alertPayload = {
      type: 'enquiry',
      bookingId: documentId,
      clientName: sanitizeText(data.clientName || 'Distinguished Patron', 128),
      clientEmail: sanitizeText(data.clientEmail || '', 256),
      clientPhone: sanitizeText(data.clientPhone || '', 32),
      notes: sanitizeText(data.message || data.notes || '', 2000),
    };
  }

  // Execute dual-channel notification service (Nodemailer HTML email + Twilio/WhatsApp message)
  const result = await executeEnquiryAlert(alertPayload);

  // Immediately dispatch branded confirmation email to visitor via autoReplyService utilizing SMTP
  if (collection === 'enquiries' && alertPayload.clientEmail) {
    try {
      await onEnquirySavedToFirestore(documentId, {
        clientName: alertPayload.clientName,
        clientEmail: alertPayload.clientEmail,
        clientPhone: alertPayload.clientPhone,
        subject: data.subject || 'Bespoke Atelier Inquiry',
        message: data.message || data.notes || '',
        boutique: data.boutique,
        date: data.date,
        createdAt: data.createdAt,
      });
      console.log(
        `[FIRESTORE TRIGGER AUTO-REPLY] Branded confirmation email dispatched to [REDACTED] for enquiry #${documentId}`
      );
    } catch (replyErr: any) {
      console.warn('[FIRESTORE TRIGGER AUTO-REPLY ERROR]', replyErr?.message || 'Auto-reply dispatch notice');
    }
  }

  console.log(
    `[FIRESTORE TRIGGER DISPATCH] Successfully captured ${collection}/${documentId} and notified owner via WhatsApp (${result.whatsapp.mode}) and Email (${result.email.mode}).`
  );

  return {
    ...result,
    triggeredBy: `firestore/${collection}`,
    deduplicated: false,
  };
}
