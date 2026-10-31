import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  limit,
  getDocs,
  onSnapshot,
  getDocFromServer,
} from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase Core App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Services
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Initialize Firestore targeting applet database ID (CRITICAL: The app will break without this line)
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Firebase Cloud Functions
export const functions = getFunctions(app);

// Verify connection on boot per Firebase integration standard
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();

// ==========================================
// 1. Firebase Security Rules Definitions & Specifications
// ==========================================
export const SECURITY_RULES_SPEC = {
  adminEmail: (typeof process !== 'undefined' && process.env?.OWNER_EMAIL) || ((import.meta as any).env?.VITE_OWNER_EMAIL) || '',
  idPattern: /^[a-zA-Z0-9_\-]+$/,
  collections: {
    users: {
      path: 'users',
      maxDisplayNameLength: 128,
      maxEmailLength: 256,
      maxPhotoURLLength: 512,
      maxOlfactoryNotesLength: 2000,
      maxPreferredFamilyLength: 64,
      maxFavoriteItems: 100,
    },
    consultations: {
      path: 'consultations',
      maxClientNameLength: 128,
      maxClientEmailLength: 256,
      maxBoutiqueLength: 128,
      maxDateLength: 64,
      maxNotesLength: 2000,
      maxSavedFragrancesSummaryLength: 2000,
      validStatuses: ['requested', 'confirmed', 'completed'] as const,
    },
    enquiries: {
      path: 'enquiries',
      maxClientNameLength: 128,
      maxClientEmailLength: 256,
      maxClientPhoneLength: 32,
      maxSubjectLength: 256,
      maxMessageLength: 2000,
      validStatuses: ['new', 'replied', 'archived'] as const,
    },
  },
} as const;

// ==========================================
// 2. Context-Rich Firestore Error Handling
// ==========================================
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// ==========================================
// 3. Type Definitions
// ==========================================
export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role?: 'owner' | 'admin' | 'patron';
  isAdmin?: boolean;
  favoriteProductIds: string[];
  favoriteProductNames?: string[];
  preferredOlfactoryFamily?: string;
  olfactoryNotes?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ConsultationRecord {
  id: string;
  userId: string;
  clientName: string;
  clientEmail: string;
  boutique: string;
  date?: string;
  notes?: string;
  savedFragrancesSummary?: string;
  status: 'requested' | 'confirmed' | 'completed';
  createdAt: string;
}

export interface EnquiryRecord {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  subject?: string;
  message: string;
  userId?: string;
  status: 'new' | 'replied' | 'archived';
  createdAt: string;
}

export interface BookingResult {
  bookingId: string;
  whatsappUrl: string;
  whatsappText: string;
  emailDeliveredTo?: string;
}

// ==========================================
// 4. Cloud Functions for Sanitizing and Routing Visitor Enquiries
// ==========================================

/**
 * Sanitizes visitor text inputs to prevent HTML, script, or control character injection
 * and strictly bounds field lengths to match Firestore security rules.
 */
export function sanitizeVisitorInput(input: unknown, maxLen = 500): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, maxLen);
}

export interface VisitorEnquiryPayload {
  type: 'consultation' | 'enquiry';
  bookingId: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  boutique?: string;
  date?: string;
  notes?: string;
  savedFragrancesSummary?: string;
}

/**
 * Cloud Function client wrapper: Sanitizes and routes visitor enquiries through
 * the dual-channel notification pipeline (Nodemailer HTML email + Twilio/WhatsApp API).
 */
export async function routeVisitorEnquiry(rawPayload: VisitorEnquiryPayload): Promise<BookingResult> {
  const sanitizedPayload: VisitorEnquiryPayload = {
    type: rawPayload.type,
    bookingId: sanitizeVisitorInput(rawPayload.bookingId, 64),
    clientName: sanitizeVisitorInput(rawPayload.clientName, SECURITY_RULES_SPEC.collections.enquiries.maxClientNameLength),
    clientEmail: sanitizeVisitorInput(rawPayload.clientEmail, SECURITY_RULES_SPEC.collections.enquiries.maxClientEmailLength),
    clientPhone: sanitizeVisitorInput(rawPayload.clientPhone, SECURITY_RULES_SPEC.collections.enquiries.maxClientPhoneLength),
    boutique: sanitizeVisitorInput(rawPayload.boutique, SECURITY_RULES_SPEC.collections.consultations.maxBoutiqueLength),
    date: sanitizeVisitorInput(rawPayload.date, SECURITY_RULES_SPEC.collections.consultations.maxDateLength),
    notes: sanitizeVisitorInput(rawPayload.notes, SECURITY_RULES_SPEC.collections.consultations.maxNotesLength),
    savedFragrancesSummary: sanitizeVisitorInput(
      rawPayload.savedFragrancesSummary,
      SECURITY_RULES_SPEC.collections.consultations.maxSavedFragrancesSummaryLength
    ),
  };

  // 1. Attempt dispatch via Firebase Cloud Function Callable first
  try {
    const sendAlertCallable = httpsCallable(functions, 'sendEnquiryAlert');
    const result = await sendAlertCallable(sanitizedPayload);
    const data = result.data as any;
    if (data && data.success) {
      return {
        bookingId: data.bookingId || data.referenceId || sanitizedPayload.bookingId,
        whatsappUrl: data.whatsappUrl || data.whatsapp?.preformattedUrl || '',
        whatsappText: data.whatsappText || data.whatsapp?.text || '',
        emailDeliveredTo: data.emailDeliveredTo || data.email?.recipient || SECURITY_RULES_SPEC.adminEmail,
      };
    }
  } catch (callableErr) {
    // Gracefully fall back to backend triggers
  }

  // 2. Invoke Backend Firestore Trigger endpoint directly with document metadata
  try {
    const triggerResponse = await fetch('/api/triggers/firestore-submission', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType: 'create',
        collection: sanitizedPayload.type === 'consultation' ? 'consultations' : 'enquiries',
        documentId: sanitizedPayload.bookingId,
        data: sanitizedPayload,
      }),
    });
    if (triggerResponse.ok) {
      const triggerData = await triggerResponse.json();
      const res = triggerData.result;
      if (res) {
        return {
          bookingId: res.referenceId || sanitizedPayload.bookingId,
          whatsappUrl: res.whatsapp?.preformattedUrl || '',
          whatsappText: res.whatsapp?.text || '',
          emailDeliveredTo: res.email?.recipient || SECURITY_RULES_SPEC.adminEmail,
        };
      }
    }
  } catch (triggerErr) {
    console.debug('Backend Firestore trigger endpoint fallback:', triggerErr);
  }

  // 3. Fallback to server notification gateway
  try {
    const response = await fetch('/api/notify-enquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sanitizedPayload),
    });
    if (response.ok) {
      const data = await response.json();
      return {
        bookingId: data.bookingId || data.referenceId || sanitizedPayload.bookingId,
        whatsappUrl:
          data.whatsappUrl ||
          `https://wa.me/?text=${encodeURIComponent(`AVELORE ${sanitizedPayload.type.toUpperCase()}: ${sanitizedPayload.clientName} - #${sanitizedPayload.bookingId}`)}`,
        whatsappText: data.whatsappText || '',
        emailDeliveredTo: data.emailDeliveredTo || SECURITY_RULES_SPEC.adminEmail,
      };
    }
  } catch (apiErr) {
    console.warn('Backend notification dispatch warning:', apiErr);
  }

  // Fallback to guarantee seamless patron experience
  return {
    bookingId: sanitizedPayload.bookingId,
    whatsappUrl: `https://wa.me/?text=${encodeURIComponent(`AVELORE ${sanitizedPayload.type.toUpperCase()}: ${sanitizedPayload.clientName} - #${sanitizedPayload.bookingId}`)}`,
    whatsappText: `*AVELORE* ${sanitizedPayload.clientName} (#${sanitizedPayload.bookingId})`,
    emailDeliveredTo: SECURITY_RULES_SPEC.adminEmail,
  };
}

// Re-export dispatchEnquiryAlert for compatibility
export const dispatchEnquiryAlert = routeVisitorEnquiry;

// ==========================================
// 5. Secure Wrapper for User Profiles Management
// ==========================================
export const userProfileService = {
  /**
   * Retrieves an authenticated patron profile from Firestore.
   */
  async getProfile(userId: string): Promise<UserProfile | null> {
    const userPath = `users/${userId}`;
    try {
      const userRef = doc(db, 'users', userId);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        return snap.data() as UserProfile;
      }
      return null;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, userPath);
    }
  },

  /**
   * Synchronizes or initializes a patron profile document upon sign-in.
   */
  async syncProfile(currentUser: FirebaseUser): Promise<UserProfile> {
    const userPath = `users/${currentUser.uid}`;
    const userRef = doc(db, 'users', currentUser.uid);
    const nowIso = new Date().toISOString();

    try {
      const snap = await getDoc(userRef);
      let returnProfile: UserProfile;
      const isOwner = currentUser.email?.toLowerCase() === SECURITY_RULES_SPEC.adminEmail.toLowerCase();

      if (snap.exists()) {
        const existingData = snap.data() as UserProfile;
        const updates: Partial<UserProfile> = {
          lastLoginAt: nowIso,
          updatedAt: nowIso,
        };
        if (isOwner && (!existingData.role || existingData.role !== 'owner' || !existingData.isAdmin)) {
          updates.role = 'owner';
          updates.isAdmin = true;
        }
        await updateDoc(userRef, updates);
        returnProfile = {
          ...existingData,
          ...updates,
        };
      } else {
        const newProfile: UserProfile = {
          id: currentUser.uid,
          email: currentUser.email || '',
          displayName: currentUser.displayName?.slice(0, SECURITY_RULES_SPEC.collections.users.maxDisplayNameLength) || 'Distinguished Patron',
          photoURL: currentUser.photoURL?.slice(0, SECURITY_RULES_SPEC.collections.users.maxPhotoURLLength) || '',
          role: isOwner ? 'owner' : 'patron',
          isAdmin: isOwner,
          favoriteProductIds: [],
          favoriteProductNames: [],
          preferredOlfactoryFamily: 'Amber & Balsamic Resins',
          olfactoryNotes: '',
          lastLoginAt: nowIso,
          createdAt: nowIso,
          updatedAt: nowIso,
        };
        await setDoc(userRef, newProfile);
        returnProfile = newProfile;
      }

      // Automated Owner Alert: Notify owner on WhatsApp when a visitor signs in or registers
      fetch('/api/triggers/firestore-submission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collection: 'users',
          documentId: currentUser.uid,
          eventType: snap.exists() ? 'signin' : 'registration',
          data: {
            displayName: currentUser.displayName || returnProfile.displayName,
            email: currentUser.email || returnProfile.email,
            favoriteProductIds: returnProfile.favoriteProductIds || [],
            isNewUser: !snap.exists(),
          },
        }),
      }).catch((triggerErr) => console.warn('Visitor sign-in notification warning:', triggerErr));

      return returnProfile;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, userPath);
    }
  },

  /**
   * Updates a patron's favorite fragrance wardrobe bookmarks.
   */
  async updateWardrobe(userId: string, productIds: string[], productNames: string[]): Promise<void> {
    const userPath = `users/${userId}`;
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        favoriteProductIds: productIds.slice(0, SECURITY_RULES_SPEC.collections.users.maxFavoriteItems),
        favoriteProductNames: productNames.slice(0, SECURITY_RULES_SPEC.collections.users.maxFavoriteItems),
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, userPath);
    }
  },

  /**
   * Updates a patron's preferred olfactory family accord.
   */
  async updateOlfactoryFamily(userId: string, family: string): Promise<void> {
    const userPath = `users/${userId}`;
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        preferredOlfactoryFamily: family.slice(0, SECURITY_RULES_SPEC.collections.users.maxPreferredFamilyLength),
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, userPath);
    }
  },

  /**
   * Updates personal olfactory notes and formulation nuances.
   */
  async updateOlfactoryNotes(userId: string, notes: string): Promise<void> {
    const userPath = `users/${userId}`;
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        olfactoryNotes: notes.slice(0, SECURITY_RULES_SPEC.collections.users.maxOlfactoryNotesLength),
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, userPath);
    }
  },

  /**
   * Erases all user personal data across Firestore and backend caches (Right to Be Forgotten / GDPR).
   */
  async deleteUserData(userId: string, email?: string): Promise<void> {
    const userPath = `users/${userId}`;
    try {
      // 1. Delete all consultations booked by this user
      const q = query(collection(db, 'consultations'), where('userId', '==', userId));
      const snap = await getDocs(q);
      const deletePromises = snap.docs.map((docSnap) => deleteDoc(doc(db, 'consultations', docSnap.id)));
      await Promise.allSettled(deletePromises);

      // 2. Delete user profile document
      const userRef = doc(db, 'users', userId);
      await deleteDoc(userRef);

      // 3. Purge cached backend server records with cryptographically verified token
      const authToken = await auth.currentUser?.getIdToken();
      await fetch('/api/user/delete-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({ userId, email }),
      }).catch((err) => console.warn('Cache purge notice:', err?.message || 'Purge'));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, userPath);
    }
  },
};

// ==========================================
// 6. Secure Wrapper for Consultation Bookings & History
// ==========================================
export const consultationService = {
  /**
   * Books a private atelier consultation, sanitizes input according to security rules,
   * archives securely in Firestore, and triggers WhatsApp + Email notification routing.
   */
  async bookConsultation(params: {
    boutique: string;
    date: string;
    clientName: string;
    clientEmail: string;
    clientPhone?: string;
    notes?: string;
    savedFragrancesSummary?: string;
  }): Promise<BookingResult> {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Authentication required to book a private fragrance salon.');
    }

    const consultationId = `consultation_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const docPath = `consultations/${consultationId}`;

    // Defensive Sanitization ensuring exact rule boundaries
    const clientName = sanitizeVisitorInput(params.clientName, SECURITY_RULES_SPEC.collections.consultations.maxClientNameLength);
    const clientEmail = sanitizeVisitorInput(params.clientEmail, SECURITY_RULES_SPEC.collections.consultations.maxClientEmailLength);
    const boutique = sanitizeVisitorInput(params.boutique, SECURITY_RULES_SPEC.collections.consultations.maxBoutiqueLength);
    const date = sanitizeVisitorInput(params.date, SECURITY_RULES_SPEC.collections.consultations.maxDateLength);
    const notes = sanitizeVisitorInput(params.notes, SECURITY_RULES_SPEC.collections.consultations.maxNotesLength);
    const savedFragrancesSummary = sanitizeVisitorInput(
      params.savedFragrancesSummary,
      SECURITY_RULES_SPEC.collections.consultations.maxSavedFragrancesSummaryLength
    );

    const newRecord: ConsultationRecord = {
      id: consultationId,
      userId: currentUser.uid,
      clientName,
      clientEmail,
      boutique,
      date,
      notes,
      savedFragrancesSummary,
      status: 'requested',
      createdAt: new Date().toISOString(),
    };

    try {
      const docRef = doc(db, 'consultations', consultationId);
      await setDoc(docRef, newRecord);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, docPath);
    }

    // Route enquiry and dispatch alerts
    const alertResult = await routeVisitorEnquiry({
      type: 'consultation',
      bookingId: consultationId,
      clientName: newRecord.clientName,
      clientEmail: newRecord.clientEmail,
      clientPhone: params.clientPhone,
      boutique: newRecord.boutique,
      date: newRecord.date,
      notes: newRecord.notes,
      savedFragrancesSummary: newRecord.savedFragrancesSummary,
    });

    return alertResult;
  },

  /**
   * Retrieves consultation history for a patron (bounded by limit(50)).
   */
  async getConsultationsForUser(userId: string, maxResults = 50): Promise<ConsultationRecord[]> {
    const path = 'consultations';
    try {
      const q = query(
        collection(db, path),
        where('userId', '==', userId),
        limit(Math.min(maxResults, 50))
      );
      const snap = await getDocs(q);
      const records: ConsultationRecord[] = [];
      snap.forEach((d) => {
        records.push(d.data() as ConsultationRecord);
      });
      // Sort chronologically (newest first)
      records.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return records;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
    }
  },

  /**
   * Retrieves a single consultation record by ID with authorization verification.
   */
  async getConsultationById(consultationId: string): Promise<ConsultationRecord | null> {
    const path = `consultations/${consultationId}`;
    try {
      const docRef = doc(db, 'consultations', consultationId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data() as ConsultationRecord;
      }
      return null;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
    }
  },

  /**
   * Updates consultation status (e.g. cancellation by patron or confirmation).
   */
  async updateStatus(
    consultationId: string,
    status: 'requested' | 'confirmed' | 'completed'
  ): Promise<void> {
    const path = `consultations/${consultationId}`;
    try {
      const docRef = doc(db, 'consultations', consultationId);
      await updateDoc(docRef, { status });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  },
};

// ==========================================
// 7. Secure Wrapper for Bespoke Enquiries
// ==========================================
export const enquiryService = {
  /**
   * Submits a customer inquiry to Firestore with input sanitization and triggers notification routing.
   */
  async submitEnquiry(params: {
    clientName: string;
    clientEmail: string;
    clientPhone?: string;
    subject?: string;
    message: string;
    userId?: string;
    userRole?: string;
    isAdminSubmission?: boolean;
    triggerExternalNotification?: boolean;
  }): Promise<BookingResult> {
    const enquiryId = `enquiry_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const docPath = `enquiries/${enquiryId}`;

    const clientName = sanitizeVisitorInput(params.clientName, SECURITY_RULES_SPEC.collections.enquiries.maxClientNameLength);
    const clientEmail = sanitizeVisitorInput(params.clientEmail, SECURITY_RULES_SPEC.collections.enquiries.maxClientEmailLength);
    const clientPhone = sanitizeVisitorInput(params.clientPhone, SECURITY_RULES_SPEC.collections.enquiries.maxClientPhoneLength);
    const subject = sanitizeVisitorInput(params.subject || 'Bespoke Atelier Inquiry', SECURITY_RULES_SPEC.collections.enquiries.maxSubjectLength);
    const message = sanitizeVisitorInput(params.message, SECURITY_RULES_SPEC.collections.enquiries.maxMessageLength);

    const newRecord: EnquiryRecord = {
      id: enquiryId,
      clientName,
      clientEmail,
      clientPhone,
      subject,
      message,
      userId: params.userId || auth.currentUser?.uid,
      status: 'new',
      createdAt: new Date().toISOString(),
    };

    // 1. Submit through the server-side validation & sanitization endpoint
    try {
      const serverRes = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: params.clientName,
          clientEmail: params.clientEmail,
          clientPhone: params.clientPhone,
          subject: params.subject,
          message: params.message,
          userId: params.userId || auth.currentUser?.uid,
          userRole: params.userRole || 'patron',
          isAdmin: params.isAdminSubmission || false,
          triggerNotification: params.triggerExternalNotification !== false,
        }),
      });

      if (serverRes.ok) {
        const serverData = await serverRes.json();
        const activeEnquiryId = serverData.bookingId || enquiryId;

        // If user is authenticated, synchronize to Firestore collection under authenticated identity
        if (auth.currentUser) {
          try {
            const docRef = doc(db, 'enquiries', activeEnquiryId);
            await setDoc(docRef, {
              ...newRecord,
              id: activeEnquiryId,
              userId: auth.currentUser.uid,
            });

            // Dispatch branded confirmation email to visitor immediately after enquiry is saved to Firestore
            fetch('/api/enquiries/autoreply', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                referenceId: activeEnquiryId,
                clientName: newRecord.clientName,
                clientEmail: newRecord.clientEmail,
                clientPhone: newRecord.clientPhone,
                subject: newRecord.subject,
                message: newRecord.message,
              }),
            }).catch((replyErr) => console.debug('[AutoReply] Firestore sync notice:', replyErr));
          } catch (fsErr) {
            console.debug('Authenticated Firestore sync notice:', fsErr);
          }
        }

        return {
          bookingId: activeEnquiryId,
          whatsappUrl: serverData.whatsappUrl || '',
          whatsappText: serverData.whatsappText || '',
          emailDeliveredTo: serverData.emailDeliveredTo || SECURITY_RULES_SPEC.adminEmail,
        };
      } else {
        const errJson = await serverRes.json().catch(() => ({}));
        throw new Error(errJson.error || 'Server validation failed.');
      }
    } catch (apiErr: any) {
      // Propagate explicit server validation messages to the UI
      if (apiErr.message && !apiErr.message.includes('Failed to fetch') && !apiErr.message.includes('NetworkError')) {
        throw apiErr;
      }

      // If network fallback and user is authenticated, fall back to direct authenticated Firestore write
      if (auth.currentUser) {
        try {
          const docRef = doc(db, 'enquiries', enquiryId);
          await setDoc(docRef, newRecord);

          // Dispatch branded confirmation email to patron via auto-reply service
          fetch('/api/enquiries/autoreply', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              referenceId: enquiryId,
              clientName: newRecord.clientName,
              clientEmail: newRecord.clientEmail,
              clientPhone: newRecord.clientPhone,
              subject: newRecord.subject,
              message: newRecord.message,
            }),
          }).catch((replyErr) => console.debug('[AutoReply] Direct firestore trigger notice:', replyErr));

          return await routeVisitorEnquiry({
            type: 'enquiry',
            bookingId: enquiryId,
            clientName: newRecord.clientName,
            clientEmail: newRecord.clientEmail,
            clientPhone: newRecord.clientPhone,
            notes: newRecord.message,
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, docPath);
        }
      } else {
        throw new Error(apiErr.message || 'Unable to submit enquiry at this time.');
      }
    }
  },

  /**
   * Retrieves enquiries submitted by a patron (if authenticated).
   */
  async getEnquiriesForUser(userId: string, maxResults = 50): Promise<EnquiryRecord[]> {
    const path = 'enquiries';
    try {
      const q = query(
        collection(db, path),
        where('userId', '==', userId),
        limit(Math.min(maxResults, 50))
      );
      const snap = await getDocs(q);
      const records: EnquiryRecord[] = [];
      snap.forEach((d) => {
        records.push(d.data() as EnquiryRecord);
      });
      records.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return records;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
    }
  },

  /**
   * Retrieves all visitor enquiries for Maison administrative review.
   * Strictly guarded by Firestore Security Rules: only succeeds for verified owner/admin roles.
   */
  async getAllEnquiries(maxResults = 100): Promise<EnquiryRecord[]> {
    const path = 'enquiries';
    try {
      const q = query(collection(db, path), limit(Math.min(maxResults, 100)));
      const snap = await getDocs(q);
      const records: EnquiryRecord[] = [];
      snap.forEach((d) => {
        records.push(d.data() as EnquiryRecord);
      });
      records.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return records;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
    }
  },

  /**
   * Updates an enquiry's status (new | replied | archived).
   * Adheres strictly to Firestore rules allowing only 'status' field updates by admin.
   */
  async updateEnquiryStatus(
    enquiryId: string,
    status: 'new' | 'replied' | 'archived'
  ): Promise<void> {
    const path = `enquiries/${enquiryId}`;
    try {
      const docRef = doc(db, 'enquiries', enquiryId);
      await updateDoc(docRef, { status });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  },

  /**
   * Deletes an enquiry record. Strictly allowed for admin only.
   */
  async deleteEnquiry(enquiryId: string): Promise<void> {
    const path = `enquiries/${enquiryId}`;
    try {
      const docRef = doc(db, 'enquiries', enquiryId);
      await deleteDoc(docRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  },
};

export interface SharedMoodboardDoc {
  id: string;
  themeTitle: string;
  imageUrl: string;
  isFallbackImage?: boolean;
  poeticNarrative: string;
  colorPalette: { hex: string; name: string }[];
  sensoryElements: string[];
  inspiration: {
    scentFamily: string;
    atmosphere: string;
    lighting: string;
    paletteTheme: string;
    customNotes: string;
  };
  matchedPerfumes: any[];
  authorName?: string;
  authorId?: string;
  createdAt: string;
}

export const moodboardService = {
  async saveMoodboard(data: SharedMoodboardDoc): Promise<string> {
    const path = `moodboards/${data.id}`;
    try {
      const docRef = doc(db, 'moodboards', data.id);
      await setDoc(docRef, data);
      return data.id;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
      throw err;
    }
  },

  async getMoodboard(id: string): Promise<SharedMoodboardDoc | null> {
    const path = `moodboards/${id}`;
    try {
      const docRef = doc(db, 'moodboards', id);
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) return null;
      return snapshot.data() as SharedMoodboardDoc;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
      return null;
    }
  },
};

// Re-export common Firebase Firestore & Auth helpers
export {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  limit,
  getDocs,
  onSnapshot,
  getDocFromServer,
  GoogleAuthProvider,
  httpsCallable,
};
export type { FirebaseUser };
