import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  auth,
  db,
  googleProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  doc,
  collection,
  query,
  where,
  limit,
  onSnapshot,
  FirebaseUser,
  UserProfile,
  ConsultationRecord,
  EnquiryRecord,
  BookingResult,
  userProfileService,
  consultationService,
  enquiryService,
  handleFirestoreError,
  OperationType,
} from '../services/firebase';
import { PRODUCTS } from '../data/siteData';

export type { UserProfile, ConsultationRecord, EnquiryRecord, BookingResult, FirebaseUser };

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  claims: Record<string, any>;
  loading: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (productId: string) => Promise<void>;
  saveOlfactoryNotes: (notes: string) => Promise<void>;
  updatePreferredOlfactoryFamily: (family: string) => Promise<void>;
  bookConsultation: (data: {
    boutique: string;
    date: string;
    notes?: string;
    clientName: string;
    clientEmail: string;
    clientPhone?: string;
  }) => Promise<BookingResult>;
  submitBespokeEnquiry: (data: {
    clientName: string;
    clientEmail: string;
    clientPhone?: string;
    subject?: string;
    message: string;
    userId?: string;
    userRole?: string;
    isAdminSubmission?: boolean;
    triggerExternalNotification?: boolean;
  }) => Promise<BookingResult>;
  consultations: ConsultationRecord[];
  fetchAdminEnquiries: () => Promise<EnquiryRecord[]>;
  updateAdminEnquiryStatus: (enquiryId: string, status: 'new' | 'replied' | 'archived') => Promise<void>;
  deleteAdminEnquiry: (enquiryId: string) => Promise<void>;
  deleteAccountAndData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const OWNER_EMAIL = (import.meta as any).env?.VITE_OWNER_EMAIL || '';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [claims, setClaims] = useState<Record<string, any>>({});
  const [consultations, setConsultations] = useState<ConsultationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Administrative authority check evaluating:
  // 1. Firebase Auth Custom Claims (e.g. claims.admin, claims.role === 'owner' | 'admin')
  // 2. Specific Firestore user document fields (e.g. profile.role === 'owner' | 'admin', profile.isAdmin === true)
  // 3. Fallback verification against configured owner email from environment
  const isAdmin = useMemo(() => {
    if (!user) return false;

    // 1. Custom Claims check from Firebase Auth ID Token
    const hasCustomClaim = Boolean(
      claims.admin === true ||
      claims.isAdmin === true ||
      claims.role === 'admin' ||
      claims.role === 'owner'
    );

    // 2. Specific Firestore user document fields check
    const hasFirestoreAdminField = Boolean(
      profile?.isAdmin === true ||
      profile?.role === 'admin' ||
      profile?.role === 'owner'
    );

    // 3. Verified owner email fallback from environment variable
    const isOwnerEmail = Boolean(OWNER_EMAIL && user.email?.toLowerCase() === OWNER_EMAIL.toLowerCase());

    return hasCustomClaim || hasFirestoreAdminField || isOwnerEmail;
  }, [user, claims, profile]);

  // Monitor auth state changes and synchronize extended profile via userProfileService
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          // Fetch custom claims from Firebase Auth ID token
          const tokenResult = await currentUser.getIdTokenResult();
          setClaims(tokenResult.claims || {});
        } catch (claimErr) {
          console.warn('Error fetching custom token claims:', claimErr);
          setClaims({});
        }

        try {
          const userProf = await userProfileService.syncProfile(currentUser);
          setProfile(userProf);
        } catch (err) {
          console.error('Error synchronizing user profile:', err);
        }
      } else {
        setProfile(null);
        setClaims({});
        setConsultations([]);
      }
      setLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  // Real-time synchronization of current patron profile document
  useEffect(() => {
    if (!user) return;
    const userPath = `users/${user.uid}`;
    const userRef = doc(db, 'users', user.uid);
    const unsubscribeProfile = onSnapshot(
      userRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, userPath);
      }
    );

    return () => unsubscribeProfile();
  }, [user]);

  // Real-time synchronization of patron consultations
  useEffect(() => {
    if (!user) return;
    const pathForConsultations = 'consultations';
    const q = query(collection(db, pathForConsultations), where('userId', '==', user.uid), limit(50));
    const unsubscribeConsultations = onSnapshot(
      q,
      (snap) => {
        const records: ConsultationRecord[] = [];
        snap.forEach((d) => {
          records.push(d.data() as ConsultationRecord);
        });
        records.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setConsultations(records);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, pathForConsultations);
      }
    );

    return () => unsubscribeConsultations();
  }, [user]);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: unknown) {
      console.error('Google Sign-In failed:', err);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setProfile(null);
      setConsultations([]);
    } catch (err) {
      console.error('Sign-Out failed:', err);
    }
  };

  const isFavorite = (productId: string) => {
    if (!profile || !profile.favoriteProductIds) return false;
    return profile.favoriteProductIds.includes(productId);
  };

  const toggleFavorite = async (productId: string) => {
    if (!user) {
      await signInWithGoogle();
      return;
    }
    const currentFavs = profile?.favoriteProductIds || [];
    const isCurrentlyFav = currentFavs.includes(productId);
    const updatedFavIds = isCurrentlyFav
      ? currentFavs.filter((id) => id !== productId)
      : [...currentFavs, productId];

    // Compute updated perfume names
    const updatedFavNames = updatedFavIds
      .map((id) => PRODUCTS.find((p) => p.id === id)?.name || id)
      .slice(0, 100);

    await userProfileService.updateWardrobe(user.uid, updatedFavIds, updatedFavNames);
    setProfile((prev) =>
      prev
        ? {
            ...prev,
            favoriteProductIds: updatedFavIds,
            favoriteProductNames: updatedFavNames,
          }
        : null
    );
  };

  const updatePreferredOlfactoryFamily = async (family: string) => {
    if (!user) return;
    await userProfileService.updateOlfactoryFamily(user.uid, family);
    setProfile((prev) => (prev ? { ...prev, preferredOlfactoryFamily: family } : null));
  };

  const saveOlfactoryNotes = async (notes: string) => {
    if (!user) return;
    await userProfileService.updateOlfactoryNotes(user.uid, notes);
    setProfile((prev) => (prev ? { ...prev, olfactoryNotes: notes } : null));
  };

  const bookConsultation = async (data: {
    boutique: string;
    date: string;
    notes?: string;
    clientName: string;
    clientEmail: string;
    clientPhone?: string;
  }): Promise<BookingResult> => {
    const savedFragrancesSummary =
      profile?.favoriteProductNames && profile.favoriteProductNames.length > 0
        ? profile.favoriteProductNames.join(', ')
        : 'None selected in wardrobe yet';

    return await consultationService.bookConsultation({
      boutique: data.boutique,
      date: data.date,
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      clientPhone: data.clientPhone,
      notes: data.notes,
      savedFragrancesSummary,
    });
  };

  const submitBespokeEnquiry = async (data: {
    clientName: string;
    clientEmail: string;
    clientPhone?: string;
    subject?: string;
    message: string;
    userId?: string;
    userRole?: string;
    isAdminSubmission?: boolean;
    triggerExternalNotification?: boolean;
  }): Promise<BookingResult> => {
    const resolvedUserId = data.userId || user?.uid;
    const resolvedRole = data.userRole || (isAdmin ? 'owner' : (profile?.role || (user ? 'patron' : 'guest')));
    const isOwnerOrAdmin = typeof data.isAdminSubmission === 'boolean' ? data.isAdminSubmission : isAdmin;

    return await enquiryService.submitEnquiry({
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      clientPhone: data.clientPhone,
      subject: data.subject,
      message: data.message,
      userId: resolvedUserId,
      userRole: resolvedRole,
      isAdminSubmission: isOwnerOrAdmin,
      triggerExternalNotification: data.triggerExternalNotification !== false,
    });
  };

  const fetchAdminEnquiries = async (): Promise<EnquiryRecord[]> => {
    if (!isAdmin) {
      throw new Error('Access denied: Only Maison owner may access visitor enquiries.');
    }
    return (await enquiryService.getAllEnquiries()) || [];
  };

  const updateAdminEnquiryStatus = async (
    enquiryId: string,
    status: 'new' | 'replied' | 'archived'
  ): Promise<void> => {
    if (!isAdmin) {
      throw new Error('Access denied: Only Maison owner may modify enquiry status.');
    }
    await enquiryService.updateEnquiryStatus(enquiryId, status);
  };

  const deleteAdminEnquiry = async (enquiryId: string): Promise<void> => {
    if (!isAdmin) {
      throw new Error('Access denied: Only Maison owner may delete enquiry records.');
    }
    await enquiryService.deleteEnquiry(enquiryId);
  };

  const deleteAccountAndData = async (): Promise<void> => {
    if (!user) return;
    try {
      await userProfileService.deleteUserData(user.uid, user.email || undefined);
      await logout();
    } catch (err: any) {
      console.error('Account erasure error:', err?.message || 'Erasure failed');
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        claims,
        loading,
        isAdmin,
        signInWithGoogle,
        logout,
        isFavorite,
        toggleFavorite,
        saveOlfactoryNotes,
        updatePreferredOlfactoryFamily,
        bookConsultation,
        submitBespokeEnquiry,
        consultations,
        fetchAdminEnquiries,
        updateAdminEnquiryStatus,
        deleteAdminEnquiry,
        deleteAccountAndData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
