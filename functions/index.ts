/**
 * Firebase Cloud Functions & Firestore Triggers for Avelore Haute Parfumerie
 * Automatically captures form submissions from Firestore and dispatches
 * instant alerts to the Maison owner via Nodemailer and Twilio/WhatsApp API.
 */
import {
  executeEnquiryAlert,
  EnquiryAlertPayload,
  EnquiryAlertResponse,
  sendWhatsAppAlert,
  sendEmailAlert,
} from '../src/functions/enquiryAlert';
import {
  handleFirestoreFormSubmission,
  FirestoreTriggerEvent,
} from '../src/functions/firestoreTrigger';

/**
 * Callable Cloud Function Handler compatible with Firebase Functions v2 onCall
 */
export async function sendEnquiryAlert(data: EnquiryAlertPayload): Promise<EnquiryAlertResponse> {
  return await executeEnquiryAlert(data);
}

/**
 * Firestore Background Trigger for new Consultation reservations:
 * captures document creations at path 'consultations/{consultationId}'
 */
export async function onConsultationCreated(event: {
  params: { consultationId: string };
  data: any;
}): Promise<EnquiryAlertResponse> {
  const documentId = event.params.consultationId;
  const rawData = typeof event.data?.data === 'function' ? event.data.data() : event.data;

  return await handleFirestoreFormSubmission({
    eventType: 'create',
    collection: 'consultations',
    documentId,
    data: rawData,
  });
}

/**
 * Firestore Background Trigger for new Bespoke Enquiries:
 * captures document creations at path 'enquiries/{enquiryId}'
 */
export async function onEnquiryCreated(event: {
  params: { enquiryId: string };
  data: any;
}): Promise<EnquiryAlertResponse> {
  const documentId = event.params.enquiryId;
  const rawData = typeof event.data?.data === 'function' ? event.data.data() : event.data;

  return await handleFirestoreFormSubmission({
    eventType: 'create',
    collection: 'enquiries',
    documentId,
    data: rawData,
  });
}

export {
  handleFirestoreFormSubmission,
  executeEnquiryAlert,
  sendWhatsAppAlert,
  sendEmailAlert,
};
export type { EnquiryAlertPayload, EnquiryAlertResponse, FirestoreTriggerEvent };
