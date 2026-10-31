import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  User,
  Heart,
  Calendar,
  LogOut,
  Sparkles,
  Save,
  Trash2,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Shield,
  MessageCircle,
  Inbox,
  RefreshCw,
  Search,
  Mail,
  Phone,
  Clock,
  AlertCircle,
  Filter,
  Check,
  Eye,
  EyeOff,
  Lock,
} from 'lucide-react';
import { useAuth, EnquiryRecord } from '../context/AuthContext';
import { PRODUCTS, Product } from '../data/siteData';
import { ProductVisual } from './ProductVisual';
import { PillButton } from './PillButton';
import { Link } from 'react-router-dom';

interface PatronProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuickView: (product: Product) => void;
  onOpenConsultation: () => void;
  initialTab?: 'wishlist' | 'consultations' | 'profile' | 'concierge-admin' | 'admin';
}

const OLFACTORY_FAMILIES = [
  'Amber & Balsamic Resins',
  'Floral & Damask Rose',
  'Woody & Sacred Cedar',
  'Citrus Vert & Neroli',
  'Smoky Leather & Cured Labdanum',
  'Gourmand & Tonka Bean',
];

interface AdminNotificationRecord {
  id: string;
  type: 'consultation' | 'enquiry' | 'signin';
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  boutique?: string;
  date?: string;
  notes?: string;
  savedFragrancesSummary?: string;
  createdAt: string;
  status: string;
}

export const PatronProfileModal: React.FC<PatronProfileModalProps> = ({
  isOpen,
  onClose,
  onQuickView,
  onOpenConsultation,
  initialTab = 'wishlist',
}) => {
  const {
    user,
    profile,
    isAdmin,
    signInWithGoogle,
    logout,
    toggleFavorite,
    saveOlfactoryNotes,
    updatePreferredOlfactoryFamily,
    consultations,
    fetchAdminEnquiries,
    updateAdminEnquiryStatus,
    deleteAdminEnquiry,
    deleteAccountAndData,
  } = useAuth();

  const [notes, setNotes] = useState(profile?.olfactoryNotes || '');
  const [selectedFamily, setSelectedFamily] = useState(profile?.preferredOlfactoryFamily || 'Amber & Balsamic Resins');
  const [savingNotes, setSavingNotes] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [confirmDeleteAccount, setConfirmDeleteAccount] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteAccountError, setDeleteAccountError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'wishlist' | 'consultations' | 'profile' | 'concierge-admin' | 'admin'>(initialTab);
  const [favoriteCategoryFilter, setFavoriteCategoryFilter] = useState<string>('all');

  // Admin Inbound leads state
  const [adminNotifications, setAdminNotifications] = useState<AdminNotificationRecord[]>([]);
  const [loadingAdmin, setLoadingAdmin] = useState(false);
  const [ownerWhatsAppNumber, setOwnerWhatsAppNumber] = useState('');
  const [showWhatsAppNumber, setShowWhatsAppNumber] = useState(false);
  const [savingWhatsApp, setSavingWhatsApp] = useState(false);
  const [whatsAppSavedMsg, setWhatsAppSavedMsg] = useState('');
  const [testingWhatsApp, setTestingWhatsApp] = useState(false);
  const [testResultMsg, setTestResultMsg] = useState('');

  // Business Hours & Quiet Notification schedule state
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [quietStartHour, setQuietStartHour] = useState(22);
  const [quietEndHour, setQuietEndHour] = useState(8);
  const [scheduleTimezone, setScheduleTimezone] = useState('Europe/Paris');
  const [weekendQuiet, setWeekendQuiet] = useState(false);

  // Protected Admin Enquiries State (Firestore collection: enquiries)
  const [enquiries, setEnquiries] = useState<EnquiryRecord[]>([]);
  const [loadingEnquiries, setLoadingEnquiries] = useState(false);
  const [enquiriesError, setEnquiriesError] = useState<string | null>(null);
  const [enquiryStatusFilter, setEnquiryStatusFilter] = useState<'all' | 'new' | 'replied' | 'archived'>('all');
  const [enquirySearchQuery, setEnquirySearchQuery] = useState('');
  const [updatingEnquiryId, setUpdatingEnquiryId] = useState<string | null>(null);
  const [expandedMessageId, setExpandedMessageId] = useState<string | null>(null);
  const [lastSyncedTime, setLastSyncedTime] = useState<string | null>(null);
  const [adminSubSection, setAdminSubSection] = useState<'enquiries' | 'whatsapp' | 'live-alerts'>('enquiries');

  // Fetch protected Firestore enquiries (strictly restricted to owner/admin)
  const loadAdminEnquiries = async () => {
    if (!isAdmin) return;
    try {
      setLoadingEnquiries(true);
      setEnquiriesError(null);
      const records = await fetchAdminEnquiries();
      setEnquiries(records || []);
      setLastSyncedTime(
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    } catch (err: any) {
      console.error('Failed to load admin enquiries:', err);
      setEnquiriesError(err?.message || 'Access denied or network failure.');
    } finally {
      setLoadingEnquiries(false);
    }
  };

  const handleUpdateStatus = async (enquiryId: string, status: 'new' | 'replied' | 'archived') => {
    if (!isAdmin) return;
    setUpdatingEnquiryId(enquiryId);
    try {
      await updateAdminEnquiryStatus(enquiryId, status);
      setEnquiries((prev) =>
        prev.map((item) => (item.id === enquiryId ? { ...item, status } : item))
      );
    } catch (err) {
      console.error('Failed to update enquiry status:', err);
    } finally {
      setUpdatingEnquiryId(null);
    }
  };

  const handleDeleteEnquiry = async (enquiryId: string) => {
    if (!isAdmin) return;
    try {
      await deleteAdminEnquiry(enquiryId);
      setEnquiries((prev) => prev.filter((item) => item.id !== enquiryId));
    } catch (err) {
      console.error('Failed to delete enquiry:', err);
    }
  };

  const filteredEnquiries = useMemo(() => {
    return enquiries.filter((item) => {
      const matchesFilter = enquiryStatusFilter === 'all' || item.status === enquiryStatusFilter;
      const q = enquirySearchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        item.clientName?.toLowerCase().includes(q) ||
        item.clientEmail?.toLowerCase().includes(q) ||
        item.clientPhone?.toLowerCase().includes(q) ||
        item.subject?.toLowerCase().includes(q) ||
        item.message?.toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [enquiries, enquiryStatusFilter, enquirySearchQuery]);

  const enquiryCounts = useMemo(() => {
    return {
      all: enquiries.length,
      new: enquiries.filter((e) => e.status === 'new').length,
      replied: enquiries.filter((e) => e.status === 'replied').length,
      archived: enquiries.filter((e) => e.status === 'archived').length,
    };
  }, [enquiries]);

  // Sync state when profile loads
  useEffect(() => {
    if (profile?.olfactoryNotes) setNotes(profile.olfactoryNotes);
    if (profile?.preferredOlfactoryFamily) setSelectedFamily(profile.preferredOlfactoryFamily);
  }, [profile]);

  // Fetch admin lead notifications if user is owner
  const fetchAdminLeads = async () => {
    if (!isAdmin || !user?.email) return;
    try {
      setLoadingAdmin(true);
      const token = await user.getIdToken();
      const res = await fetch('/api/admin/notifications', {
        headers: {
          'x-admin-email': user.email,
          'Authorization': `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setAdminNotifications(data.notifications || []);
      }
    } catch (err) {
      console.warn('Failed to fetch admin notifications:', err);
    } finally {
      setLoadingAdmin(false);
    }
  };

  const fetchWhatsAppConfig = async () => {
    if (!isAdmin || !user?.email) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/admin/whatsapp-config', {
        headers: {
          'x-admin-email': user.email,
          'Authorization': `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.ownerWhatsAppNumber) {
          setOwnerWhatsAppNumber(data.ownerWhatsAppNumber);
        }
        if (data.schedule) {
          setQuietHoursEnabled(Boolean(data.schedule.quietHoursEnabled));
          if (typeof data.schedule.quietStartHour === 'number') setQuietStartHour(data.schedule.quietStartHour);
          if (typeof data.schedule.quietEndHour === 'number') setQuietEndHour(data.schedule.quietEndHour);
          if (data.schedule.timezone) setScheduleTimezone(data.schedule.timezone);
          if (typeof data.schedule.weekendQuiet === 'boolean') setWeekendQuiet(data.schedule.weekendQuiet);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch WhatsApp config:', err);
    }
  };

  const handleSaveWhatsAppNumber = async () => {
    if (!isAdmin || !user?.email) return;
    setSavingWhatsApp(true);
    setWhatsAppSavedMsg('');
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/admin/whatsapp-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': user.email,
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          whatsappNumber: ownerWhatsAppNumber,
          schedule: {
            quietHoursEnabled,
            quietStartHour,
            quietEndHour,
            timezone: scheduleTimezone,
            weekendQuiet,
          },
        }),
      });
      if (res.ok) {
        setWhatsAppSavedMsg('WhatsApp settings & business schedule saved! Muted during quiet hours, active during salon hours.');
        setTimeout(() => setWhatsAppSavedMsg(''), 6000);
      }
    } catch (err) {
      setWhatsAppSavedMsg('Failed to save settings. Please check connection.');
    } finally {
      setSavingWhatsApp(false);
    }
  };

  const handleTestWhatsAppAlert = async () => {
    if (!isAdmin || !user?.email) return;
    setTestingWhatsApp(true);
    setTestResultMsg('');
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/admin/verify-channel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': user.email,
          'Authorization': `Bearer ${token}`,
        },
      });
      if (res.ok) {
        setTestResultMsg('Verification alert dispatched! Check your WhatsApp.');
        setTimeout(() => setTestResultMsg(''), 6000);
      }
    } catch (err) {
      setTestResultMsg('Verification dispatch failed.');
    } finally {
      setTestingWhatsApp(false);
    }
  };

  useEffect(() => {
    if ((activeTab === 'concierge-admin' || activeTab === 'admin') && isAdmin) {
      loadAdminEnquiries();
      fetchAdminLeads();
      fetchWhatsAppConfig();
    }
  }, [activeTab, isAdmin]);

  // Match saved product IDs to full product records
  const savedProducts = useMemo(() => {
    return (profile?.favoriteProductIds || [])
      .map((id) => PRODUCTS.find((p) => p.id === id))
      .filter(Boolean) as Product[];
  }, [profile?.favoriteProductIds]);

  const availableFavoriteCategories = useMemo(() => {
    const cats = new Set(savedProducts.map((p) => p.categoryLabel));
    return ['all', ...Array.from(cats)];
  }, [savedProducts]);

  const filteredFavoriteProducts = useMemo(() => {
    if (favoriteCategoryFilter === 'all') return savedProducts;
    return savedProducts.filter((p) => p.categoryLabel === favoriteCategoryFilter);
  }, [savedProducts, favoriteCategoryFilter]);

  const handleSaveNotes = async () => {
    try {
      setSavingNotes(true);
      await saveOlfactoryNotes(notes);
      await updatePreferredOlfactoryFamily(selectedFamily);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err: any) {
      console.error('Failed to save notes:', err?.message || 'Save error');
    } finally {
      setSavingNotes(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setDeletingAccount(true);
      setDeleteAccountError(null);
      await deleteAccountAndData();
      onClose();
    } catch (err: any) {
      setDeleteAccountError(err?.message || 'Failed to complete data deletion request.');
    } finally {
      setDeletingAccount(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3B0000]/70 backdrop-blur-md animate-fadeIn font-sans">
      <div className="relative w-full max-w-2xl bg-[#FAF2E1] border border-[#3B0000]/20 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-8 py-5 bg-[#3B0000] text-[#FFD482] flex items-center justify-between border-b border-[#FFD482]/20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FFD482]/20 border border-[#FFD482]/30 flex items-center justify-center overflow-hidden">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Patron'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-5 h-5 text-[#FFD482]" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-lg md:text-xl tracking-wider text-[#FFD482]">
                  {user ? user.displayName || 'Distinguished Patron' : 'Avelore Patron Salon'}
                </h2>
                {isAdmin && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFD482] text-[#3B0000] uppercase tracking-wider flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Maison Owner
                  </span>
                )}
              </div>
              <p className="text-xs text-[#FFD482]/70 font-mono tracking-widest uppercase">
                {user ? user.email : 'Firebase Authentication & Firestore Sync'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-[#FFD482]/70 hover:text-[#FFD482] hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {!user ? (
          /* Unauthenticated Patron View */
          <div className="p-8 text-center space-y-6 flex-1 overflow-y-auto">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#3B0000] text-[#FFD482] flex items-center justify-center shadow-md">
              <Sparkles className="w-8 h-8 text-[#FFD482]" />
            </div>

            <div>
              <h3 className="text-2xl font-display font-bold text-[#3B0000]">
                Enter the Private Patron Circle
              </h3>
              <p className="text-xs text-[#3B0000]/70 max-w-md mx-auto mt-2 leading-relaxed">
                Authenticate with Google to preserve your personalized fragrance compositions, save bespoke olfactory notes, and reserve private appointments across our Paris, London, New York, and Tokyo ateliers.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto text-left text-xs">
              <div className="p-3 bg-white/70 rounded-xl border border-[#3B0000]/10">
                <Heart className="w-4 h-4 text-[#801B00] mb-1 fill-[#801B00]/20" />
                <div className="font-bold text-[#3B0000]">Personal Wishlist</div>
                <div className="text-[11px] text-[#3B0000]/60 mt-0.5">Save your favorite extraits & flacons.</div>
              </div>
              <div className="p-3 bg-white/70 rounded-xl border border-[#3B0000]/10">
                <Calendar className="w-4 h-4 text-[#3B0000] mb-1" />
                <div className="font-bold text-[#3B0000]">Atelier Bookings</div>
                <div className="text-[11px] text-[#3B0000]/60 mt-0.5">Confirmed private consultation slots.</div>
              </div>
              <div className="p-3 bg-white/70 rounded-xl border border-[#3B0000]/10">
                <ShieldCheck className="w-4 h-4 text-[#3B0000] mb-1" />
                <div className="font-bold text-[#3B0000]">Secure Firestore</div>
                <div className="text-[11px] text-[#3B0000]/60 mt-0.5">Strict ABAC zero-trust persistence.</div>
              </div>
            </div>

            <div className="pt-4 max-w-xs mx-auto">
              <button
                onClick={async () => {
                  try {
                    await signInWithGoogle();
                  } catch (e) {
                    console.error('Sign-in error:', e);
                  }
                }}
                className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-[#3B0000] hover:bg-[#520909] text-[#FFD482] rounded-full font-bold text-sm tracking-wider shadow-lg transition-transform active:scale-95 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Sign in with Google</span>
              </button>
            </div>
          </div>
        ) : (
          /* Authenticated Patron Salon View */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Tabs */}
            <div className="px-6 pt-3 pb-2 bg-[#FAF2E1] border-b border-[#3B0000]/10 flex flex-wrap items-center justify-between gap-2 shrink-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => setActiveTab('wishlist')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'wishlist'
                      ? 'bg-[#3B0000] text-[#FFD482] shadow-xs'
                      : 'text-[#3B0000]/70 hover:bg-[#3B0000]/5'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${activeTab === 'wishlist' ? 'fill-[#FFD482] text-[#FFD482]' : 'fill-[#801B00] text-[#801B00]'}`} />
                  <span>My Favorites ({savedProducts.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('consultations')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === 'consultations'
                      ? 'bg-[#3B0000] text-[#FFD482]'
                      : 'text-[#3B0000]/70 hover:bg-[#3B0000]/5'
                  }`}
                >
                  Appointments ({consultations.length})
                </button>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === 'profile'
                      ? 'bg-[#3B0000] text-[#FFD482]'
                      : 'text-[#3B0000]/70 hover:bg-[#3B0000]/5'
                  }`}
                >
                  Olfactory Profile
                </button>
                {isAdmin && (
                  <button
                    onClick={() => setActiveTab('concierge-admin')}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'concierge-admin' || activeTab === 'admin'
                        ? 'bg-[#801B00] text-[#FFD482] shadow-xs ring-1 ring-[#FFD482]/30'
                        : 'text-[#801B00] bg-[#801B00]/10 hover:bg-[#801B00]/20'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Concierge Admin</span>
                    {enquiryCounts.new > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-[#FFD482] text-[#3B0000] font-bold">
                        {enquiryCounts.new}
                      </span>
                    )}
                  </button>
                )}
              </div>

              <button
                onClick={logout}
                title="Sign out"
                className="text-xs text-[#3B0000]/60 hover:text-red-700 flex items-center gap-1 font-medium transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>

            {/* Tab Panes */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              {/* Wishlist / My Favorites Tab */}
              {activeTab === 'wishlist' && (
                <div className="space-y-6">
                  {/* Dedicated 'My Favorites' Section Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#3B0000]/10">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-full bg-[#FFD482]/50 text-[#801B00]">
                          <Heart className="w-4 h-4 fill-current text-[#801B00]" />
                        </span>
                        <h3 className="font-display font-bold text-xl sm:text-2xl text-[#3B0000]">
                          My Favorites
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FFD482] text-[#3B0000] border border-[#3B0000]/10">
                          {savedProducts.length} {savedProducts.length === 1 ? 'Creation' : 'Creations'}
                        </span>
                      </div>
                      <p className="text-xs text-[#7E4A4A] mt-1 font-sans">
                        Your private fragrance wardrobe and bespoke flacons curated and securely saved to your patron profile.
                      </p>
                    </div>

                    {savedProducts.length > 0 && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => {
                            onClose();
                            onOpenConsultation();
                          }}
                          className="text-xs px-3.5 py-2 rounded-full bg-[#3B0000] text-[#FFD482] font-semibold hover:bg-[#520909] transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                          title="Sample your favorites with a Master Perfumer"
                        >
                          <Calendar className="w-3.5 h-3.5 text-[#FFD482]" />
                          <span>Sample in Atelier</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Category Filter Pills (if multiple categories are in savedProducts) */}
                  {savedProducts.length > 1 && availableFavoriteCategories.length > 2 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {availableFavoriteCategories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setFavoriteCategoryFilter(cat)}
                          className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                            favoriteCategoryFilter === cat
                              ? 'bg-[#3B0000] text-[#FFD482] shadow-xs'
                              : 'bg-white text-[#3B0000]/70 border border-[#3B0000]/10 hover:bg-[#FAF2E1]'
                          }`}
                        >
                          {cat === 'all' ? `All (${savedProducts.length})` : cat}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Empty State */}
                  {savedProducts.length === 0 ? (
                    <div className="text-center py-14 space-y-4 bg-white/70 rounded-3xl border border-[#3B0000]/10 p-8 shadow-xs">
                      <div className="w-16 h-16 mx-auto rounded-full bg-[#FAF2E1] border border-[#3B0000]/15 flex items-center justify-center text-[#801B00] shadow-sm">
                        <Heart className="w-8 h-8 text-[#801B00]/40" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-display font-bold text-xl text-[#3B0000]">
                          Your Wishlist is Empty
                        </h4>
                        <p className="text-xs text-[#7E4A4A] max-w-md mx-auto leading-relaxed font-sans">
                          You haven't saved any creations to your profile yet. Explore our fine fragrances, body rituals, and home scents, then tap the heart icon on any flacon to curate your personal olfactory collection.
                        </p>
                      </div>
                      <div className="pt-2">
                        <Link
                          to="/shop"
                          onClick={onClose}
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#3B0000] hover:bg-[#520909] text-[#FFD482] text-xs font-bold uppercase tracking-wider font-display transition-all shadow-md cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-[#FFD482]" />
                          <span>Explore Fragrance Collections</span>
                        </Link>
                      </div>
                    </div>
                  ) : filteredFavoriteProducts.length === 0 ? (
                    <div className="text-center py-10 space-y-2 bg-white/50 rounded-2xl border border-[#3B0000]/10 p-6">
                      <p className="text-sm font-display font-bold text-[#3B0000]">
                        No favorites found in category "{favoriteCategoryFilter}"
                      </p>
                      <button
                        onClick={() => setFavoriteCategoryFilter('all')}
                        className="text-xs text-[#801B00] font-semibold underline cursor-pointer"
                      >
                        View all favorites ({savedProducts.length})
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3.5">
                      {filteredFavoriteProducts.map((product) => (
                        <div
                          key={product.id}
                          className="p-4 sm:p-5 bg-white rounded-2xl border border-[#3B0000]/10 flex flex-col sm:flex-row items-center gap-4 sm:gap-5 shadow-xs hover:border-[#3B0000]/30 hover:shadow-md transition-all group"
                        >
                          {/* Visual Bottle Representation */}
                          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#FAF2E1] rounded-2xl border border-[#3B0000]/10 flex items-center justify-center shrink-0 p-2 overflow-hidden relative group-hover:scale-102 transition-transform">
                            <ProductVisual product={product} size="sm" isHovered={false} />
                          </div>

                          {/* Details */}
                          <div className="flex-1 min-w-0 text-center sm:text-left">
                            <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                              <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-[#801B00]">
                                {product.categoryLabel}
                              </span>
                              {product.badge && (
                                <span className="text-[9px] uppercase tracking-wider text-[#3B0000] bg-[#FFD482]/60 px-2 py-0.5 rounded-full font-bold">
                                  {product.badge}
                                </span>
                              )}
                            </div>

                            <h5 className="font-display font-bold text-base sm:text-lg text-[#3B0000] truncate group-hover:text-[#801B00] transition-colors">
                              {product.name}
                            </h5>

                            <p className="text-xs text-[#7E4A4A] truncate mt-0.5 font-sans">
                              {product.subtitle}
                            </p>

                            {product.notes ? (
                              <p className="text-[11px] text-[#3B0000]/75 truncate mt-1 italic font-serif">
                                <span className="font-semibold text-[#801B00] not-italic">Accords: </span>
                                {product.notes.top.slice(0, 2).join(' · ')} · {product.notes.heart.slice(0, 2).join(' · ')}
                              </p>
                            ) : product.ingredients ? (
                              <p className="text-[11px] text-[#3B0000]/75 truncate mt-1 font-mono">
                                {product.ingredients.slice(0, 3).join(', ')}
                              </p>
                            ) : null}

                            <div className="text-xs font-bold text-[#3B0000] mt-2 font-display tabular-nums">
                              From ${product.priceFrom} · {product.volume}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex sm:flex-col items-center justify-end gap-2 shrink-0 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-[#3B0000]/10">
                            <button
                              onClick={() => {
                                onQuickView(product);
                                onClose();
                              }}
                              className="flex-1 sm:flex-none px-3.5 py-2 rounded-full bg-[#FAF2E1] hover:bg-[#FFD482] text-[#3B0000] text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                              title="Quick View Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Details</span>
                            </button>

                            <button
                              onClick={() => toggleFavorite(product.id)}
                              className="px-3 py-2 rounded-full text-red-700 hover:bg-red-50 text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5 border border-red-200/60"
                              title="Remove from My Favorites"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span className="sm:hidden">Remove</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Curated Consultation Banner */}
                  {savedProducts.length > 0 && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-[#FFF5E3] border border-[#FFD482]/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5 text-[#3B0000] text-center sm:text-left">
                        <Sparkles className="w-4 h-4 text-[#801B00] shrink-0" />
                        <span>
                          <strong>Private Flacon Discovery:</strong> Schedule a bespoke appointment in Paris, London, New York, or Tokyo to experience your <strong>{savedProducts.length} {savedProducts.length === 1 ? 'favorite' : 'favorites'}</strong> in person with a Master Perfumer.
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          onClose();
                          onOpenConsultation();
                        }}
                        className="px-4 py-2 rounded-full bg-[#801B00] hover:bg-[#520909] text-[#FFD482] font-bold shrink-0 transition-colors cursor-pointer text-xs uppercase tracking-wider font-display shadow-xs"
                      >
                        Book Salon Session
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Consultations Tab */}
              {activeTab === 'consultations' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-display font-bold text-base text-[#3B0000]">
                      Your Reserved Atelier Salons
                    </h4>
                    <button
                      onClick={() => {
                        onClose();
                        onOpenConsultation();
                      }}
                      className="text-xs px-3 py-1.5 rounded-full bg-[#3B0000] text-[#FFD482] font-semibold hover:bg-[#520909] transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Calendar className="w-3 h-3" />
                      <span>Book New Appointment</span>
                    </button>
                  </div>

                  {consultations.length === 0 ? (
                    <div className="text-center py-10 space-y-3 bg-white/60 rounded-2xl border border-[#3B0000]/10 p-6">
                      <Calendar className="w-10 h-10 mx-auto text-[#3B0000]/30" />
                      <div className="font-display font-bold text-sm text-[#3B0000]">
                        No Appointments Reserved
                      </div>
                      <p className="text-xs text-[#3B0000]/60 max-w-sm mx-auto">
                        Experience a private 1-on-1 olfactory composition session with our Master Perfumers in Paris, London, New York, or Tokyo.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {consultations.map((c) => (
                        <div
                          key={c.id}
                          className="p-4 bg-white rounded-2xl border border-[#3B0000]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-display font-bold text-sm text-[#3B0000]">
                                {c.boutique}
                              </span>
                              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[#FFD482] text-[#3B0000] font-bold">
                                {c.status}
                              </span>
                            </div>
                            <div className="text-xs text-[#3B0000]/70 mt-1">
                              Date: {c.date || 'To be scheduled with concierge'}
                            </div>
                            {c.savedFragrancesSummary && (
                              <div className="text-xs text-[#3B0000]/60 mt-0.5 font-mono">
                                Wardrobe: {c.savedFragrancesSummary}
                              </div>
                            )}
                            {c.notes && (
                              <div className="text-xs italic text-[#3B0000]/60 mt-1">
                                &ldquo;{c.notes}&rdquo;
                              </div>
                            )}
                          </div>
                          <div className="text-[10px] font-mono text-[#3B0000]/40">
                            ID: #{c.id.slice(0, 14)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Profile & Olfactory Notes Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-5">
                  {/* Preferred Scent Family */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#3B0000] mb-1.5 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#3B0000]" />
                      <span>Preferred Olfactory Family Accord</span>
                    </label>
                    <p className="text-xs text-[#3B0000]/60 mb-2">
                      Guides the Master Perfumer and Olfactory Concierge during fragrance recommendations.
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {OLFACTORY_FAMILIES.map((family) => (
                        <button
                          key={family}
                          type="button"
                          onClick={() => setSelectedFamily(family)}
                          className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all cursor-pointer ${
                            selectedFamily === family
                              ? 'bg-[#3B0000] text-[#FFD482] border-[#3B0000] shadow-xs'
                              : 'bg-white hover:bg-[#FFD482]/20 text-[#3B0000] border-[#3B0000]/15'
                          }`}
                        >
                          {family}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Free-form notes */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#3B0000] mb-1.5">
                      Personal Olfactory Sensibilities & Notes
                    </label>
                    <p className="text-xs text-[#3B0000]/60 mb-2">
                      Note skin chemistry nuances, favorite base accords, or seasonal wear preferences.
                    </p>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g., Prefers dry smoky amber, powdery Florentine orris, and cold frankincense. Avoids overly sweet gourmands. Wears Cuir Nocturne in autumn/winter."
                      rows={4}
                      className="w-full bg-white border border-[#3B0000]/20 rounded-2xl p-4 text-sm text-[#3B0000] focus:ring-2 focus:ring-[#3B0000]/30 focus:outline-hidden resize-none leading-relaxed"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    {savedSuccess ? (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Saved to Firestore successfully.</span>
                      </div>
                    ) : (
                      <div className="text-[11px] text-[#3B0000]/50 font-mono">
                        Instant encrypted sync to patron record.
                      </div>
                    )}

                    <PillButton
                      variant="merlot"
                      size="sm"
                      onClick={handleSaveNotes}
                      disabled={savingNotes}
                    >
                      <Save className="w-3 h-3 mr-1" />
                      {savingNotes ? 'Saving...' : 'Save Profile'}
                    </PillButton>
                  </div>

                  {/* Data Privacy & Right to Erasure (GDPR) */}
                  <div className="pt-5 mt-3 border-t border-[#3B0000]/15">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-[#3B0000]" />
                        <span className="text-xs font-bold uppercase tracking-wider text-[#3B0000]">
                          Privacy & Data Sovereignty (GDPR)
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-[#3B0000]/70 mb-3 leading-relaxed">
                      You retain complete ownership over your personal data. Requesting erasure will permanently delete your wardrobe preferences, private salon consultations, olfactory formulas, and cached server logs.
                    </p>

                    {deleteAccountError && (
                      <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{deleteAccountError}</span>
                      </div>
                    )}

                    {!confirmDeleteAccount ? (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteAccount(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-300 text-red-700 hover:bg-red-50 text-xs font-medium transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Erase All Personal Data & Account</span>
                      </button>
                    ) : (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                        <p className="text-xs font-bold text-red-800 mb-2">
                          Are you sure you want to permanently erase your patron record and all associated consultations? This action is irreversible.
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleDeleteAccount}
                            disabled={deletingAccount}
                            className="px-3 py-1.5 bg-red-700 text-white rounded-lg text-xs font-bold hover:bg-red-800 transition-colors cursor-pointer disabled:opacity-50"
                          >
                            {deletingAccount ? 'Purging records...' : 'Yes, Permanently Erase'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteAccount(false)}
                            disabled={deletingAccount}
                            className="px-3 py-1.5 bg-white border border-[#3B0000]/20 text-[#3B0000] rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Maison Owner Protected Concierge Admin Tab */}
              {(activeTab === 'concierge-admin' || activeTab === 'admin') && isAdmin && (
                <div className="space-y-5">
                  {/* Admin Header with Access Verification */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#3B0000]/10 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-[#801B00]" />
                        <h4 className="font-display font-bold text-base text-[#3B0000]">
                          Concierge Admin Portal
                        </h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#FFD482] text-[#3B0000] border border-[#3B0000]/20">
                          Owner Protected
                        </span>
                      </div>
                      <p className="text-xs text-[#3B0000]/60 mt-0.5">
                        Authenticated as <span className="font-mono text-[#3B0000] font-semibold">{user?.email}</span> · Collection <span className="font-mono font-semibold text-[#801B00]">enquiries</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {lastSyncedTime && (
                        <span className="text-[10px] font-mono text-[#3B0000]/50 hidden sm:inline-block">
                          Synced at {lastSyncedTime}
                        </span>
                      )}
                      <button
                        onClick={() => {
                          loadAdminEnquiries();
                          fetchAdminLeads();
                          fetchWhatsAppConfig();
                        }}
                        disabled={loadingEnquiries || loadingAdmin}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-[#FAF2E1] text-[#3B0000] border border-[#3B0000]/20 text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50"
                        title="Synchronize Firestore Enquiries"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${loadingEnquiries || loadingAdmin ? 'animate-spin' : ''}`} />
                        <span>Sync Ledger</span>
                      </button>
                    </div>
                  </div>

                  {/* Sub-Section Navigation */}
                  <div className="flex items-center gap-1.5 border-b border-[#3B0000]/10 pb-2">
                    <button
                      onClick={() => setAdminSubSection('enquiries')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        adminSubSection === 'enquiries'
                          ? 'bg-[#3B0000] text-[#FFD482] shadow-xs'
                          : 'bg-white/60 text-[#3B0000]/70 hover:bg-white hover:text-[#3B0000]'
                      }`}
                    >
                      <Inbox className="w-3.5 h-3.5" />
                      <span>Visitor Enquiries</span>
                      {enquiryCounts.new > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-[#FFD482] text-[#3B0000] font-bold">
                          {enquiryCounts.new} new
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => setAdminSubSection('whatsapp')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        adminSubSection === 'whatsapp'
                          ? 'bg-[#3B0000] text-[#FFD482] shadow-xs'
                          : 'bg-white/60 text-[#3B0000]/70 hover:bg-white hover:text-[#3B0000]'
                      }`}
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp Mobile Setup</span>
                    </button>

                    <button
                      onClick={() => setAdminSubSection('live-alerts')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        adminSubSection === 'live-alerts'
                          ? 'bg-[#3B0000] text-[#FFD482] shadow-xs'
                          : 'bg-white/60 text-[#3B0000]/70 hover:bg-white hover:text-[#3B0000]'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Live Push Dispatches</span>
                    </button>
                  </div>

                  {/* SECTION 1: VISITOR ENQUIRIES (FIRESTORE) */}
                  {adminSubSection === 'enquiries' && (
                    <div className="space-y-4">
                      {/* Search & Filter Toolbar */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white/80 p-3 rounded-2xl border border-[#3B0000]/15">
                        {/* Search Input */}
                        <div className="relative flex-1">
                          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#3B0000]/40" />
                          <input
                            type="text"
                            value={enquirySearchQuery}
                            onChange={(e) => setEnquirySearchQuery(e.target.value)}
                            placeholder="Search by patron name, email, phone, or message..."
                            className="w-full bg-[#FAF2E1]/60 border border-[#3B0000]/15 rounded-xl pl-9 pr-8 py-1.5 text-xs text-[#3B0000] placeholder:text-[#3B0000]/40 focus:outline-none focus:border-[#3B0000]"
                          />
                          {enquirySearchQuery && (
                            <button
                              onClick={() => setEnquirySearchQuery('')}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#3B0000]/40 hover:text-[#3B0000] text-xs font-bold"
                            >
                              ✕
                            </button>
                          )}
                        </div>

                        {/* Status Filter Pills */}
                        <div className="flex items-center gap-1 overflow-x-auto shrink-0">
                          {(['all', 'new', 'replied', 'archived'] as const).map((filter) => {
                            const count = enquiryCounts[filter];
                            const isSelected = enquiryStatusFilter === filter;
                            return (
                              <button
                                key={filter}
                                onClick={() => setEnquiryStatusFilter(filter)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize transition-all cursor-pointer whitespace-nowrap ${
                                  isSelected
                                    ? 'bg-[#3B0000] text-[#FFD482]'
                                    : 'bg-[#FAF2E1] text-[#3B0000]/70 hover:bg-[#FAF2E1]/80 hover:text-[#3B0000]'
                                }`}
                              >
                                {filter} ({count})
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Error state */}
                      {enquiriesError && (
                        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                          <span>{enquiriesError}</span>
                        </div>
                      )}

                      {/* LOADING STATE - TABLE SKELETON */}
                      {loadingEnquiries ? (
                        <div className="overflow-x-auto rounded-2xl border border-[#3B0000]/15 bg-white shadow-xs">
                          <div className="flex items-center justify-center gap-2 py-4 bg-[#FAF2E1]/50 border-b border-[#3B0000]/10 text-xs text-[#3B0000]/70">
                            <RefreshCw className="w-4 h-4 animate-spin text-[#801B00]" />
                            <span className="font-display italic">Decrypting visitor enquiries ledger from Firestore...</span>
                          </div>
                          <table className="w-full text-left border-collapse min-w-[760px]">
                            <thead className="bg-[#FAF2E1] border-b border-[#3B0000]/15">
                              <tr className="text-[11px] font-mono uppercase tracking-wider text-[#3B0000]/80">
                                <th className="py-3 px-4 font-semibold">Timestamp</th>
                                <th className="py-3 px-4 font-semibold">Client / Contact</th>
                                <th className="py-3 px-4 font-semibold">Subject &amp; Message</th>
                                <th className="py-3 px-4 font-semibold">Status Indicator</th>
                                <th className="py-3 px-4 font-semibold text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#3B0000]/10 text-xs">
                              {[1, 2, 3].map((n) => (
                                <tr key={n} className="animate-pulse">
                                  <td className="py-4 px-4">
                                    <div className="h-3.5 w-24 bg-[#3B0000]/10 rounded mb-1.5" />
                                    <div className="h-3 w-16 bg-[#3B0000]/10 rounded" />
                                  </td>
                                  <td className="py-4 px-4">
                                    <div className="h-4 w-32 bg-[#3B0000]/10 rounded mb-1.5" />
                                    <div className="h-3 w-40 bg-[#3B0000]/10 rounded" />
                                  </td>
                                  <td className="py-4 px-4">
                                    <div className="h-3 w-20 bg-[#3B0000]/10 rounded mb-1.5" />
                                    <div className="h-3 w-48 bg-[#3B0000]/10 rounded" />
                                  </td>
                                  <td className="py-4 px-4">
                                    <div className="h-6 w-20 bg-[#3B0000]/10 rounded-full" />
                                  </td>
                                  <td className="py-4 px-4 text-right">
                                    <div className="h-6 w-28 bg-[#3B0000]/10 rounded-full ml-auto" />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : filteredEnquiries.length === 0 ? (
                        /* EMPTY STATE */
                        <div className="text-center py-12 px-6 bg-white/80 rounded-2xl border border-[#3B0000]/10 space-y-3 shadow-xs">
                          <div className="w-12 h-12 mx-auto rounded-full bg-[#FAF2E1] flex items-center justify-center border border-[#3B0000]/15">
                            <Inbox className="w-6 h-6 text-[#801B00]/60" />
                          </div>
                          <div>
                            <div className="font-display font-bold text-sm text-[#3B0000]">
                              {enquiries.length === 0
                                ? 'No Visitor Enquiries Recorded in Firestore'
                                : 'No Matching Enquiries Found'}
                            </div>
                            <p className="text-xs text-[#3B0000]/60 max-w-md mx-auto mt-1 leading-relaxed">
                              {enquiries.length === 0
                                ? 'When visitors submit an enquiry or bespoke fragrance consultation through the site, their submissions will be decrypted from Firestore and archived here in your ledger.'
                                : `No inquiries match the current search "${enquirySearchQuery}" or "${enquiryStatusFilter}" status filter.`}
                            </p>
                          </div>
                          {enquiries.length > 0 && (
                            <button
                              onClick={() => {
                                setEnquirySearchQuery('');
                                setEnquiryStatusFilter('all');
                              }}
                              className="px-3.5 py-1.5 bg-[#FAF2E1] hover:bg-[#FFD482]/40 text-[#3B0000] text-xs font-bold rounded-full transition-colors cursor-pointer border border-[#3B0000]/20"
                            >
                              Reset Filters
                            </button>
                          )}
                        </div>
                      ) : (
                        /* POPULATED SECURE TABLE FORMAT */
                        <div className="space-y-2">
                          <div className="overflow-x-auto rounded-2xl border border-[#3B0000]/15 bg-white shadow-xs">
                            <table className="w-full text-left border-collapse min-w-[760px]">
                              <thead className="bg-[#FAF2E1] border-b border-[#3B0000]/15">
                                <tr className="text-[11px] font-mono uppercase tracking-wider text-[#3B0000]/80">
                                  <th className="py-3 px-4 font-semibold">Timestamp</th>
                                  <th className="py-3 px-4 font-semibold">Client / Contact</th>
                                  <th className="py-3 px-4 font-semibold">Subject &amp; Message</th>
                                  <th className="py-3 px-4 font-semibold">Status Indicator</th>
                                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[#3B0000]/10 text-xs">
                                {filteredEnquiries.map((enquiry) => {
                                  const cleanPhone = enquiry.clientPhone ? enquiry.clientPhone.replace(/\D/g, '') : '';
                                  const waReplyText = `Hello ${enquiry.clientName}, this is the Avelore Haute Parfumerie Concierge following up on your inquiry regarding "${enquiry.subject || 'our fine fragrance collection'}". How may we assist you today?`;
                                  const waUrl = cleanPhone
                                    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waReplyText)}`
                                    : `https://wa.me/?text=${encodeURIComponent(waReplyText)}`;
                                  const emailSubject = encodeURIComponent(`AVELORE Fine Fragrance - In response to your inquiry (#${enquiry.id.slice(-6)})`);
                                  const emailBody = encodeURIComponent(`Dear ${enquiry.clientName},\n\nThank you for reaching out to AVELORE Fine Fragrance.\n\nIn response to your inquiry:\n"${enquiry.message}"\n\nWarm regards,\nThe Avelore Olfactory Concierge`);
                                  const mailtoUrl = `mailto:${enquiry.clientEmail}?subject=${emailSubject}&body=${emailBody}`;

                                  const isUpdating = updatingEnquiryId === enquiry.id;
                                  const isExpanded = expandedMessageId === enquiry.id;

                                  return (
                                    <tr key={enquiry.id} className="hover:bg-[#FAF2E1]/35 transition-colors">
                                      {/* Timestamp Column */}
                                      <td className="py-3.5 px-4 align-top whitespace-nowrap">
                                        <div className="flex items-center gap-1.5 font-medium text-[#3B0000]">
                                          <Clock className="w-3.5 h-3.5 text-[#3B0000]/40 shrink-0" />
                                          <span>
                                            {new Date(enquiry.createdAt).toLocaleDateString([], {
                                              month: 'short',
                                              day: 'numeric',
                                              year: 'numeric',
                                            })}
                                          </span>
                                        </div>
                                        <div className="text-[11px] font-mono text-[#3B0000]/50 pl-5">
                                          {new Date(enquiry.createdAt).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            second: '2-digit',
                                          })}
                                        </div>
                                      </td>

                                      {/* Client / Contact Column */}
                                      <td className="py-3.5 px-4 align-top">
                                        <div className="flex items-center gap-2.5">
                                          <div className="w-7 h-7 rounded-full bg-[#FAF2E1] border border-[#3B0000]/15 flex items-center justify-center text-xs font-bold text-[#801B00] shrink-0">
                                            {enquiry.clientName.charAt(0).toUpperCase()}
                                          </div>
                                          <div>
                                            <div className="font-display font-bold text-sm text-[#3B0000]">
                                              {enquiry.clientName}
                                            </div>
                                            <div className="text-[11px] text-[#3B0000]/70 flex items-center gap-1 mt-0.5">
                                              <Mail className="w-3 h-3 text-[#3B0000]/40 shrink-0" />
                                              <a
                                                href={mailtoUrl}
                                                className="hover:underline hover:text-[#801B00] truncate max-w-[170px]"
                                                title={enquiry.clientEmail}
                                              >
                                                {enquiry.clientEmail}
                                              </a>
                                            </div>
                                            {enquiry.clientPhone && (
                                              <div className="text-[11px] font-mono text-[#3B0000]/70 flex items-center gap-1 mt-0.5">
                                                <Phone className="w-3 h-3 text-[#3B0000]/40 shrink-0" />
                                                <span>{enquiry.clientPhone}</span>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </td>

                                      {/* Subject & Message Column */}
                                      <td className="py-3.5 px-4 align-top max-w-[280px]">
                                        {enquiry.subject && (
                                          <div className="mb-1">
                                            <span className="inline-block px-2 py-0.5 rounded-md bg-[#FAF2E1] border border-[#3B0000]/15 text-[10px] font-mono text-[#801B00] font-semibold">
                                              {enquiry.subject}
                                            </span>
                                          </div>
                                        )}
                                        <div className="text-xs text-[#3B0000]/85 font-serif italic leading-relaxed">
                                          {isExpanded ? (
                                            <div className="space-y-1">
                                              <span>&ldquo;{enquiry.message}&rdquo;</span>
                                              <button
                                                onClick={() => setExpandedMessageId(null)}
                                                className="block text-[10px] font-sans font-bold text-[#801B00] hover:underline cursor-pointer not-italic"
                                              >
                                                Show less ▲
                                              </button>
                                            </div>
                                          ) : (
                                            <div>
                                              <span>
                                                &ldquo;{enquiry.message.length > 90
                                                  ? `${enquiry.message.slice(0, 90)}...`
                                                  : enquiry.message}&rdquo;
                                              </span>
                                              {enquiry.message.length > 90 && (
                                                <button
                                                  onClick={() => setExpandedMessageId(enquiry.id)}
                                                  className="inline-block ml-1 text-[10px] font-sans font-bold text-[#801B00] hover:underline cursor-pointer not-italic"
                                                >
                                                  Read more ▼
                                                </button>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      </td>

                                      {/* Status Indicator Column */}
                                      <td className="py-3.5 px-4 align-top whitespace-nowrap">
                                        {enquiry.status === 'new' && (
                                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
                                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                            <span>Pending</span>
                                          </span>
                                        )}
                                        {enquiry.status === 'replied' && (
                                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs">
                                            <span className="w-2 h-2 rounded-full bg-emerald-600" />
                                            <span>Responded</span>
                                          </span>
                                        )}
                                        {enquiry.status === 'archived' && (
                                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-stone-100 text-stone-700 border border-stone-300 shadow-2xs">
                                            <span className="w-2 h-2 rounded-full bg-stone-400" />
                                            <span>Archived</span>
                                          </span>
                                        )}
                                      </td>

                                      {/* Actions Column */}
                                      <td className="py-3.5 px-4 align-top text-right whitespace-nowrap">
                                        <div className="flex items-center justify-end gap-1.5">
                                          {/* Status Toggle Buttons */}
                                          {enquiry.status !== 'replied' && (
                                            <button
                                              onClick={() => handleUpdateStatus(enquiry.id, 'replied')}
                                              disabled={isUpdating}
                                              className="px-2 py-1 text-[10px] font-bold rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 transition-colors cursor-pointer disabled:opacity-50"
                                              title="Mark status as Responded"
                                            >
                                              Responded
                                            </button>
                                          )}
                                          {enquiry.status !== 'new' && (
                                            <button
                                              onClick={() => handleUpdateStatus(enquiry.id, 'new')}
                                              disabled={isUpdating}
                                              className="px-2 py-1 text-[10px] font-bold rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 transition-colors cursor-pointer disabled:opacity-50"
                                              title="Mark status as Pending"
                                            >
                                              Pending
                                            </button>
                                          )}
                                          {enquiry.status !== 'archived' && (
                                            <button
                                              onClick={() => handleUpdateStatus(enquiry.id, 'archived')}
                                              disabled={isUpdating}
                                              className="px-2 py-1 text-[10px] font-bold rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 transition-colors cursor-pointer disabled:opacity-50"
                                              title="Move to Archive"
                                            >
                                              Archive
                                            </button>
                                          )}

                                          {/* Direct WhatsApp Response */}
                                          <a
                                            href={waUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-1.5 rounded-lg bg-[#25D366]/15 hover:bg-[#25D366] text-[#128C7E] hover:text-white transition-colors cursor-pointer"
                                            title={cleanPhone ? `WhatsApp ${enquiry.clientPhone}` : 'Open WhatsApp'}
                                          >
                                            <MessageCircle className="w-3.5 h-3.5" />
                                          </a>

                                          {/* Direct Email Response */}
                                          <a
                                            href={mailtoUrl}
                                            className="p-1.5 rounded-lg bg-[#3B0000]/10 hover:bg-[#3B0000] text-[#3B0000] hover:text-[#FFD482] transition-colors cursor-pointer"
                                            title="Send Email Response"
                                          >
                                            <Mail className="w-3.5 h-3.5" />
                                          </a>

                                          {/* Delete from Firestore */}
                                          <button
                                            onClick={() => handleDeleteEnquiry(enquiry.id)}
                                            disabled={isUpdating}
                                            className="p-1.5 text-stone-400 hover:text-rose-700 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer disabled:opacity-50"
                                            title="Delete record from Firestore"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                          <div className="flex items-center justify-between text-[11px] font-mono text-[#3B0000]/60 px-1 pt-1">
                            <span>Showing {filteredEnquiries.length} of {enquiries.length} enquiries</span>
                            <span className="text-[10px] text-[#3B0000]/40 italic">Scroll table horizontally on smaller screens</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* SECTION 2: WHATSAPP MOBILE CONFIGURATION */}
                  {adminSubSection === 'whatsapp' && (
                    <div className="bg-[#FAF2E1] p-5 rounded-2xl border border-[#3B0000]/15 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MessageCircle className="w-4 h-4 text-emerald-700" />
                          <span className="font-display font-bold text-sm text-[#3B0000]">
                            Owner WhatsApp Contact Mobile
                          </span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                          Zero-Leak Protected
                        </span>
                      </div>

                      <p className="text-xs text-[#3B0000]/75 leading-relaxed">
                        Whenever someone visits &amp; signs in or submits an enquiry/reservation, all details are automatically dispatched to this mobile number on WhatsApp.
                      </p>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                        <div className="relative flex-1">
                          <input
                            type={showWhatsAppNumber ? 'text' : 'password'}
                            value={ownerWhatsAppNumber}
                            onChange={(e) => setOwnerWhatsAppNumber(e.target.value)}
                            placeholder="Enter your mobile number (e.g. +919876543210 or +14155552671)"
                            className="w-full bg-white border border-[#3B0000]/20 rounded-xl pl-3.5 pr-10 py-2 text-xs font-mono text-[#3B0000] focus:outline-none focus:border-[#3B0000]"
                          />
                          <button
                            type="button"
                            onClick={() => setShowWhatsAppNumber(!showWhatsAppNumber)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#3B0000]/50 hover:text-[#3B0000] transition-colors cursor-pointer"
                            title={showWhatsAppNumber ? 'Mask private number' : 'Show private number'}
                          >
                            {showWhatsAppNumber ? (
                              <EyeOff className="w-3.5 h-3.5" />
                            ) : (
                              <Eye className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        <button
                          onClick={handleSaveWhatsAppNumber}
                          disabled={savingWhatsApp}
                          className="px-4 py-2 bg-[#3B0000] hover:bg-[#520909] text-[#FFD482] rounded-xl text-xs font-bold uppercase tracking-wider font-display transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                        >
                          {savingWhatsApp ? 'Saving...' : 'Save Settings'}
                        </button>
                        <button
                          onClick={handleTestWhatsAppAlert}
                          disabled={testingWhatsApp}
                          className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold font-display transition-colors cursor-pointer shrink-0 disabled:opacity-50 flex items-center gap-1.5"
                          title="Verify notification delivery to your WhatsApp"
                        >
                          <span>{testingWhatsApp ? 'Verifying...' : 'Verify Channel'}</span>
                        </button>
                      </div>

                      {/* Business Hours & Quiet Hours Settings */}
                      <div className="mt-4 pt-4 border-t border-[#3B0000]/15 space-y-3 bg-white/70 p-4 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-[#801B00]" />
                            <span className="font-display font-bold text-xs uppercase tracking-wider text-[#3B0000]">
                              Notification Hours &amp; Quiet Schedule
                            </span>
                          </div>
                          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#3B0000]">
                            <input
                              type="checkbox"
                              checked={quietHoursEnabled}
                              onChange={(e) => setQuietHoursEnabled(e.target.checked)}
                              className="rounded text-[#3B0000] focus:ring-[#3B0000]"
                            />
                            <span>Enable Quiet Hours</span>
                          </label>
                        </div>

                        <p className="text-[11px] text-[#3B0000]/70 leading-relaxed">
                          During quiet hours, new visitor enquiries and sign-ins are logged silently in your Firestore Ledger and email without triggering instant WhatsApp chime rings.
                        </p>

                        {quietHoursEnabled && (
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                            <div>
                              <label className="block text-[10px] font-bold uppercase text-[#3B0000]/70 mb-1">
                                Quiet Starts (Mute From)
                              </label>
                              <select
                                value={quietStartHour}
                                onChange={(e) => setQuietStartHour(Number(e.target.value))}
                                className="w-full bg-white border border-[#3B0000]/20 rounded-lg px-2.5 py-1.5 text-xs text-[#3B0000]"
                              >
                                {Array.from({ length: 24 }).map((_, i) => (
                                  <option key={i} value={i}>
                                    {i.toString().padStart(2, '0')}:00 ({i === 0 ? 'Midnight' : i < 12 ? `${i} AM` : i === 12 ? 'Noon' : `${i - 12} PM`})
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold uppercase text-[#3B0000]/70 mb-1">
                                Quiet Ends (Resume At)
                              </label>
                              <select
                                value={quietEndHour}
                                onChange={(e) => setQuietEndHour(Number(e.target.value))}
                                className="w-full bg-white border border-[#3B0000]/20 rounded-lg px-2.5 py-1.5 text-xs text-[#3B0000]"
                              >
                                {Array.from({ length: 24 }).map((_, i) => (
                                  <option key={i} value={i}>
                                    {i.toString().padStart(2, '0')}:00 ({i === 0 ? 'Midnight' : i < 12 ? `${i} AM` : i === 12 ? 'Noon' : `${i - 12} PM`})
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold uppercase text-[#3B0000]/70 mb-1">
                                Salon Timezone
                              </label>
                              <select
                                value={scheduleTimezone}
                                onChange={(e) => setScheduleTimezone(e.target.value)}
                                className="w-full bg-white border border-[#3B0000]/20 rounded-lg px-2.5 py-1.5 text-xs text-[#3B0000]"
                              >
                                <option value="Europe/Paris">Paris / CET (UTC+1)</option>
                                <option value="Europe/London">London / GMT (UTC+0)</option>
                                <option value="America/New_York">New York / EST (UTC-5)</option>
                                <option value="Asia/Tokyo">Tokyo / JST (UTC+9)</option>
                                <option value="Asia/Kolkata">India / IST (UTC+5:30)</option>
                                <option value="UTC">UTC / Coordinated Universal</option>
                              </select>
                            </div>

                            <div className="sm:col-span-3 flex items-center justify-between pt-1">
                              <label className="flex items-center gap-2 cursor-pointer text-xs text-[#3B0000]/80">
                                <input
                                  type="checkbox"
                                  checked={weekendQuiet}
                                  onChange={(e) => setWeekendQuiet(e.target.checked)}
                                  className="rounded text-[#3B0000] focus:ring-[#3B0000]"
                                />
                                <span>Mute instant WhatsApp notifications on Weekends (Sat &amp; Sun)</span>
                              </label>

                              {/* Presets */}
                              <div className="flex items-center gap-1.5 text-[10px]">
                                <span className="text-[#3B0000]/50 font-bold uppercase">Presets:</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setQuietHoursEnabled(true);
                                    setQuietStartHour(22);
                                    setQuietEndHour(8);
                                  }}
                                  className="px-2 py-0.5 rounded bg-[#FAF2E1] border border-[#3B0000]/15 hover:bg-[#3B0000] hover:text-[#FFD482] transition-colors"
                                >
                                  Night (22:00-08:00)
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setQuietHoursEnabled(false);
                                  }}
                                  className="px-2 py-0.5 rounded bg-[#FAF2E1] border border-[#3B0000]/15 hover:bg-[#3B0000] hover:text-[#FFD482] transition-colors"
                                >
                                  24/7 Always Active
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {whatsAppSavedMsg && (
                        <div className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5 pt-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{whatsAppSavedMsg}</span>
                        </div>
                      )}

                      {testResultMsg && (
                        <div className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5 pt-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{testResultMsg}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* SECTION 3: LIVE PUSH DISPATCHES */}
                  {adminSubSection === 'live-alerts' && (
                    <div className="space-y-3">
                      {adminNotifications.length === 0 ? (
                        <div className="text-center py-10 bg-white/70 rounded-2xl border border-[#3B0000]/10 p-6 space-y-2">
                          <Inbox className="w-8 h-8 mx-auto text-[#3B0000]/30" />
                          <div className="font-bold text-sm text-[#3B0000]">No Recent Inquiries in Server Memory</div>
                          <p className="text-xs text-[#3B0000]/60 max-w-sm mx-auto">
                            Inbound leads will appear here instantly when patrons reserve an atelier appointment or submit an enquiry.
                          </p>
                        </div>
                      ) : (
                        adminNotifications.map((lead) => {
                          const whatsappMsg = `Hello ${lead.clientName}, this is the Avelore Concierge regarding your inquiry for ${lead.boutique || 'our collection'}.`;
                          const clientPhoneClean = lead.clientPhone ? lead.clientPhone.replace(/\D/g, '') : '';
                          const waUrl = clientPhoneClean
                            ? `https://wa.me/${clientPhoneClean}?text=${encodeURIComponent(whatsappMsg)}`
                            : `https://wa.me/?text=${encodeURIComponent(whatsappMsg)}`;

                          return (
                            <div
                              key={lead.id}
                              className="p-4 bg-white rounded-2xl border border-[#3B0000]/15 space-y-2 shadow-xs"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-sm text-[#3B0000]">{lead.clientName}</span>
                                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[#FFD482] text-[#3B0000] font-bold">
                                    {lead.type}
                                  </span>
                                </div>
                                <span className="text-[11px] font-mono text-[#3B0000]/50">
                                  {new Date(lead.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>

                              <div className="text-xs text-[#3B0000]/80 space-y-1">
                                <div><span className="font-semibold">Email:</span> {lead.clientEmail}</div>
                                {lead.clientPhone && <div><span className="font-semibold">Phone:</span> {lead.clientPhone}</div>}
                                {lead.boutique && <div><span className="font-semibold">Salon & Date:</span> {lead.boutique} · {lead.date}</div>}
                                {lead.savedFragrancesSummary && (
                                  <div className="font-mono text-[11px] text-[#801B00]">
                                    <span className="font-semibold">Wardrobe:</span> {lead.savedFragrancesSummary}
                                  </div>
                                )}
                                {lead.notes && (
                                  <div className="p-2 bg-[#FAF2E1] rounded-lg italic text-xs text-[#3B0000]/80">
                                    &ldquo;{lead.notes}&rdquo;
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center gap-2 pt-2 border-t border-[#3B0000]/10">
                                <a
                                  href={waUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold transition-all"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                  <span>WhatsApp Patron</span>
                                </a>
                                <a
                                  href={`mailto:${lead.clientEmail}?subject=AVELORE Concierge - Reservation #${lead.id}`}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#3B0000] hover:bg-[#520909] text-[#FFD482] text-xs font-bold transition-all"
                                >
                                  <span>Email Patron</span>
                                </a>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
