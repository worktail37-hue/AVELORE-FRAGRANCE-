import React, { useState } from 'react';
import { X, Calendar, MapPin, Sparkles, Check, User, Mail, Phone, Shield, MessageCircle, Send } from 'lucide-react';
import { useAuth, BookingResult } from '../context/AuthContext';
import { PillButton } from './PillButton';

interface PrivateConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialBoutique?: string;
}

export const PrivateConsultationModal: React.FC<PrivateConsultationModalProps> = ({
  isOpen,
  onClose,
  initialBoutique = 'Paris Flagship',
}) => {
  const { user, profile, bookConsultation, signInWithGoogle } = useAuth();
  const [boutique, setBoutique] = useState(initialBoutique);
  const [date, setDate] = useState('');
  const [clientName, setClientName] = useState(user?.displayName || '');
  const [clientEmail, setClientEmail] = useState(user?.email || '');
  const [clientPhone, setClientPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState<BookingResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const boutiques = [
    { name: 'Paris Flagship', address: '14 Place Vendôme, Paris' },
    { name: 'London Salon', address: '28 Mount Street, Mayfair, London' },
    { name: 'New York Atelier', address: '742 Madison Avenue, New York' },
    { name: 'Tokyo Sanctuary', address: '6-10-1 Ginza, Chuo-ku, Tokyo' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!clientName.trim() || !clientEmail.trim() || !date) {
      setErrorMsg('Please provide your name, email, and preferred date.');
      return;
    }

    try {
      setSubmitting(true);
      if (!user) {
        // Trigger Google Sign-in so the booking is permanently attached to their patron account
        await signInWithGoogle();
      }

      const res = await bookConsultation({
        boutique,
        date,
        clientName: clientName.trim(),
        clientEmail: clientEmail.trim(),
        clientPhone: clientPhone.trim() || undefined,
        notes: notes.trim(),
      });

      setBookingResult(res);
    } catch (err: any) {
      console.error('Booking failed:', err);
      setErrorMsg(err.message || 'Consultation request could not be completed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setBookingResult(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3B0000]/70 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-[#FAF2E1] border border-[#3B0000]/20 rounded-3xl shadow-2xl overflow-hidden font-sans">
        {/* Header */}
        <div className="px-8 py-6 bg-[#3B0000] text-[#FFD482] flex items-center justify-between border-b border-[#FFD482]/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FFD482]/15 border border-[#FFD482]/30 flex items-center justify-center text-[#FFD482]">
              <Sparkles className="w-5 h-5 text-[#FFD482]" />
            </div>
            <div>
              <h2 className="font-display font-bold text-xl tracking-wide text-[#FFD482]">
                Private Atelier Consultation
              </h2>
              <p className="text-xs text-[#FFD482]/70 font-mono tracking-wider">
                SECURE LEAD CAPTURE • WHATSAPP & EMAIL DISPATCH
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-[#FFD482]/70 hover:text-[#FFD482] hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-8 max-h-[80vh] overflow-y-auto">
          {bookingResult ? (
            <div className="text-center py-4 space-y-5">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#3B0000] text-[#FFD482] flex items-center justify-center shadow-lg">
                <Check className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-display font-bold text-[#3B0000]">
                  Consultation Reserved & Alert Sent
                </h3>
                <p className="text-xs font-mono text-[#3B0000]/60 mt-1 uppercase tracking-widest">
                  Reference: #{bookingResult.bookingId.slice(0, 14)}
                </p>
              </div>

              {/* Status summary */}
              <div className="bg-white/80 p-5 rounded-2xl border border-[#3B0000]/15 text-left text-sm space-y-2.5 text-[#3B0000]">
                <div className="flex items-center justify-between border-b border-[#3B0000]/10 pb-2">
                  <span className="text-xs uppercase tracking-wider text-[#3B0000]/60 font-semibold">Boutique</span>
                  <span className="font-medium">{boutique}</span>
                </div>
                <div className="flex items-center justify-between border-b border-[#3B0000]/10 py-2">
                  <span className="text-xs uppercase tracking-wider text-[#3B0000]/60 font-semibold">Appointment Date</span>
                  <span className="font-medium">{date}</span>
                </div>
                <div className="flex items-center justify-between border-b border-[#3B0000]/10 py-2">
                  <span className="text-xs uppercase tracking-wider text-[#3B0000]/60 font-semibold">Patron Details</span>
                  <span className="font-medium">{clientName} ({clientEmail})</span>
                </div>
                {profile?.favoriteProductNames && profile.favoriteProductNames.length > 0 && (
                  <div className="flex items-center justify-between border-b border-[#3B0000]/10 py-2">
                    <span className="text-xs uppercase tracking-wider text-[#3B0000]/60 font-semibold">Saved Wardrobe</span>
                    <span className="font-medium text-xs truncate max-w-[240px]">{profile.favoriteProductNames.slice(0, 3).join(', ')}</span>
                  </div>
                )}
                <div className="flex flex-col gap-1.5 pt-1 text-xs">
                  <div className="flex items-center gap-2 text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-3 py-1.5 rounded-lg">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Saved to Avelore Firestore Database</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-3 py-1.5 rounded-lg">
                    <Mail className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Notification Dispatched to Maison Concierge</span>
                  </div>
                </div>
              </div>

              {/* Direct WhatsApp Call to Action */}
              <div className="bg-[#FAF2E1] border border-[#25D366]/40 p-4 rounded-2xl flex flex-col items-center text-center gap-2.5">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#075E54]">
                  <MessageCircle className="w-4 h-4 text-[#25D366]" />
                  <span>Direct WhatsApp Channel</span>
                </div>
                <p className="text-xs text-[#3B0000]/80">
                  You can also open this reservation directly in WhatsApp with the pre-formatted inquiry text.
                </p>
                <a
                  href={bookingResult.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold py-3 px-6 rounded-full shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Open Inquiry on WhatsApp</span>
                </a>
              </div>

              <PillButton
                variant="merlot"
                size="md"
                onClick={handleReset}
                className="w-full justify-center"
              >
                Close & Return to Collection
              </PillButton>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-100 text-red-900 text-xs border border-red-200">
                  {errorMsg}
                </div>
              )}

              {/* Boutique Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3B0000] mb-2 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#3B0000]" />
                  <span>Select Flagship Boutique</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {boutiques.map((b) => (
                    <button
                      key={b.name}
                      type="button"
                      onClick={() => setBoutique(b.name)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        boutique === b.name
                          ? 'bg-[#3B0000] text-[#FFD482] border-[#3B0000] shadow-xs'
                          : 'bg-white hover:bg-[#FFD482]/20 text-[#3B0000] border-[#3B0000]/15'
                      }`}
                    >
                      <div className="font-bold text-xs">{b.name}</div>
                      <div className={`text-[11px] mt-0.5 ${boutique === b.name ? 'text-[#FFD482]/80' : 'text-[#3B0000]/60'}`}>
                        {b.address}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date & Timeframe */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3B0000] mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#3B0000]" />
                  <span>Preferred Date</span>
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full bg-white border border-[#3B0000]/20 rounded-xl px-4 py-2.5 text-sm text-[#3B0000] focus:ring-2 focus:ring-[#3B0000]/30 focus:outline-hidden"
                />
              </div>

              {/* Client Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#3B0000] mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#3B0000]" />
                    <span>Your Name</span>
                  </label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Lady Genevieve"
                    required
                    className="w-full bg-white border border-[#3B0000]/20 rounded-xl px-4 py-2 text-sm text-[#3B0000] focus:ring-2 focus:ring-[#3B0000]/30 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#3B0000] mb-1.5 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#3B0000]" />
                    <span>Email Address</span>
                  </label>
                  <input
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="patron@domain.com"
                    required
                    className="w-full bg-white border border-[#3B0000]/20 rounded-xl px-4 py-2 text-sm text-[#3B0000] focus:ring-2 focus:ring-[#3B0000]/30 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Contact Phone (for WhatsApp) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3B0000] mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#3B0000]" />
                  <span>Contact Mobile / WhatsApp Number (Optional)</span>
                </label>
                <input
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="+1 (555) 234-5678 or +33 6 12 34 56 78"
                  className="w-full bg-white border border-[#3B0000]/20 rounded-xl px-4 py-2 text-sm text-[#3B0000] focus:ring-2 focus:ring-[#3B0000]/30 focus:outline-hidden"
                />
              </div>

              {/* Olfactory Interest / Notes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3B0000] mb-1.5">
                  Olfactory Ambition or Specific Fragrance Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Seeking a vintage amber with smoke nuances, layering advice with Rose Sépale, or bespoke wedding pairing..."
                  rows={2}
                  className="w-full bg-white border border-[#3B0000]/20 rounded-xl p-3 text-sm text-[#3B0000] focus:ring-2 focus:ring-[#3B0000]/30 focus:outline-hidden resize-none"
                />
              </div>

              {/* Auth Notice */}
              {!user && (
                <div className="p-3 rounded-xl bg-[#FFD482]/30 border border-[#3B0000]/15 flex items-center gap-2 text-xs text-[#3B0000]">
                  <Shield className="w-4 h-4 text-[#3B0000] shrink-0" />
                  <span>Submitting will prompt Google Sign-In to secure your VIP patron reservation.</span>
                </div>
              )}

              {/* Submit CTA */}
              <div className="pt-2">
                <PillButton
                  variant="merlot"
                  size="lg"
                  type="submit"
                  disabled={submitting}
                  className="w-full justify-center text-sm"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {submitting ? 'Securing Salon Chamber...' : 'Reserve Consultation & Alert Maison'}
                </PillButton>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
