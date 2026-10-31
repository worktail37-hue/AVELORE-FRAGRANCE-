import React, { useState, useEffect } from 'react';
import { X, MapPin, Phone, Clock, Calendar, CheckCircle2, Sparkles } from 'lucide-react';
import { BOUTIQUES, Boutique, Product } from '../data/siteData';
import { PillButton } from './PillButton';
import { useAuth } from '../context/AuthContext';

interface StoreLocatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProduct?: Product | null;
}

export const StoreLocatorModal: React.FC<StoreLocatorModalProps> = ({
  isOpen,
  onClose,
  selectedProduct,
}) => {
  const [selectedBoutique, setSelectedBoutique] = useState<Boutique>(BOUTIQUES[0]);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [consultationName, setConsultationName] = useState('');
  const [consultationDate, setConsultationDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user, bookConsultation, signInWithGoogle } = useAuth();

  useEffect(() => {
    if (user && user.displayName) {
      setConsultationName(user.displayName);
    }
  }, [user]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consultationName.trim()) return;

    try {
      setSubmitting(true);
      if (!user) {
        await signInWithGoogle();
      }
      await bookConsultation({
        boutique: selectedBoutique.name,
        date: consultationDate || new Date().toISOString().split('T')[0],
        clientName: consultationName.trim(),
        clientEmail: user?.email || `${consultationName.toLowerCase().replace(/\s+/g, '')}@patron.avelore.com`,
        notes: selectedProduct ? `Interested in experiencing ${selectedProduct.name}` : 'General haute olfactive consultation',
      });
      setBookingSuccess(true);
      setTimeout(() => {
        setBookingSuccess(false);
      }, 6000);
    } catch (err) {
      console.error('Booking failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#220000]/75 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="store-locator-title"
        className="relative w-full max-w-4xl bg-[#FFFBF5] rounded-[32px] shadow-[0_24px_80px_rgba(59,0,0,0.3)] border border-[#3B0000]/15 overflow-hidden z-10 my-auto animate-in fade-in zoom-in-95 duration-300"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-20 p-2.5 rounded-full bg-[#FAF2E1] hover:bg-[#3B0000] hover:text-[#FFD482] text-[#3B0000] border border-[#3B0000]/10 shadow-sm transition-all cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 sm:p-10 border-b border-[#3B0000]/10">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-[#FFD482]" />
            <span className="text-xs font-display font-bold uppercase tracking-[0.2em] text-[#3B0000]">
              Atelier & Stockist Directory
            </span>
          </div>
          <h2 id="store-locator-title" className="text-3xl sm:text-4xl font-display font-bold text-[#3B0000]">
            Find in <span className="font-serif italic font-normal text-[#520909]">Boutique</span>
          </h2>
          {selectedProduct && (
            <p className="text-xs text-[#3B0000] font-bold tracking-wider uppercase mt-2 font-display bg-[#FFD482]/40 px-3 py-1 rounded-full w-fit border border-[#3B0000]/10">
              Viewing availability for: {selectedProduct.name} ({selectedProduct.subtitle})
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12">
          {/* Boutique List Tabs */}
          <div className="md:col-span-5 p-6 sm:p-8 bg-[#FAF2E1] border-r border-[#3B0000]/10 space-y-3">
            <span className="text-[11px] font-display font-bold uppercase tracking-wider text-[#7E4A4A] block mb-3">
              Select City Flagship
            </span>
            {BOUTIQUES.map((boutique) => (
              <div
                key={boutique.city}
                onClick={() => setSelectedBoutique(boutique)}
                className={`p-4 rounded-2xl cursor-pointer transition-all duration-300 border ${
                  selectedBoutique.city === boutique.city
                    ? 'bg-[#FFFBF5] border-[#3B0000]/30 shadow-xs'
                    : 'bg-transparent border-transparent hover:bg-white/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-base font-display font-bold text-[#3B0000]">
                    {boutique.city}
                  </span>
                  {boutique.flagship && (
                    <span className="text-[10px] uppercase tracking-wider font-bold bg-[#FFD482] text-[#3B0000] px-2 py-0.5 rounded-full border border-[#3B0000]/10">
                      Flagship
                    </span>
                  )}
                </div>
                <div className="text-xs text-[#7E4A4A]">{boutique.name}</div>
                <div className="text-[11px] text-[#3B0000]/70 mt-1 font-mono">{boutique.address}</div>
              </div>
            ))}
          </div>

          {/* Active Boutique Details & Appointment Request */}
          <div className="md:col-span-7 p-8 sm:p-10 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#FFD482] bg-[#3B0000] px-3 py-1 rounded-full w-fit mb-4 font-display">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFD482]" />
                <span>{selectedBoutique.status}</span>
              </div>

              <h3 className="text-2xl font-display font-bold text-[#3B0000] mb-1">
                {selectedBoutique.name}
              </h3>
              <p className="text-sm text-[#7E4A4A] mb-6">{selectedBoutique.address}</p>

              <div className="space-y-4 text-xs text-[#3B0000] border-y border-[#3B0000]/10 py-4 mb-6">
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-[#3B0000]" />
                  <span>{selectedBoutique.hours}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-[#3B0000]" />
                  <a href={`tel:${selectedBoutique.phone}`} className="hover:underline font-mono">
                    {selectedBoutique.phone}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-[#3B0000]" />
                  <span>Complimentary private skin test & perfume blotter set on arrival</span>
                </div>
              </div>

              {/* Private Consultation Request */}
              <div className="bg-[#FAF2E1] rounded-2xl p-5 border border-[#3B0000]/10">
                <h4 className="text-xs font-display font-bold uppercase tracking-wider text-[#3B0000] mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#3B0000]" />
                  Reserve Private Olfactory Consultation
                </h4>
                <p className="text-[11px] text-[#7E4A4A] mb-3">
                  Spend 30 minutes with our resident nose to explore raw extracts and discover your signature scent.
                </p>

                {bookingSuccess ? (
                  <div className="flex items-center gap-2 text-xs text-[#3B0000] bg-white p-3 rounded-xl border border-[#FFD482]">
                    <CheckCircle2 className="w-4 h-4 text-[#3B0000] shrink-0" />
                    <span>Your private appointment request has been reserved. Our concierge will contact you shortly.</span>
                  </div>
                ) : (
                  <form onSubmit={handleBooking} className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Your Full Name"
                      value={consultationName}
                      onChange={(e) => setConsultationName(e.target.value)}
                      className="bg-white border border-[#3B0000]/15 rounded-xl px-3 py-2 text-xs text-[#3B0000] focus:outline-none focus:border-[#3B0000] flex-1"
                    />
                    <input
                      type="date"
                      value={consultationDate}
                      onChange={(e) => setConsultationDate(e.target.value)}
                      className="bg-white border border-[#3B0000]/15 rounded-xl px-3 py-2 text-xs text-[#3B0000] focus:outline-none focus:border-[#3B0000]"
                    />
                    <PillButton type="submit" variant="merlot" size="sm" arrow="none" disabled={submitting}>
                      {submitting ? 'Reserving...' : 'Reserve'}
                    </PillButton>
                  </form>
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 text-center sm:text-left text-[11px] text-[#7E4A4A]">
              Walk-in visitors are warmly welcomed during salon opening hours.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
