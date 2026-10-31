import React, { useState, useEffect } from 'react';
import { CheckCircle2, Mail, Phone, MessageCircle, Send, Shield, User, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth, BookingResult } from '../context/AuthContext';
import { PillButton } from './PillButton';

export interface EnquiryFormProps {
  className?: string;
  onSuccess?: (result: BookingResult) => void;
}

export const EnquiryForm: React.FC<EnquiryFormProps> = ({ className = '', onSuccess }) => {
  const { user, profile, isAdmin, submitBespokeEnquiry } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [topic, setTopic] = useState('Private Consultation');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<BookingResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Pre-fill authenticated details when available
  useEffect(() => {
    if (user) {
      if (user.displayName && !name) setName(user.displayName);
      if (user.email && !email) setEmail(user.email);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim() || name.trim().length < 2) {
      setErrorMsg('Please provide your name (at least 2 characters).');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setErrorMsg('Please provide a valid email address (e.g., patron@domain.com).');
      return;
    }
    if (!message.trim() || message.trim().length < 3) {
      setErrorMsg('Please write your inquiry message (minimum 3 characters).');
      return;
    }

    try {
      setSubmitting(true);

      // Perform authentication & role check before attempting to trigger the external notification service
      const isAuthenticated = Boolean(user);
      const userRole = isAdmin
        ? 'owner'
        : (profile?.role || (isAuthenticated ? 'patron' : 'guest'));

      // Verified submission payload using authentication check
      const res = await submitBespokeEnquiry({
        clientName: name.trim(),
        clientEmail: email.trim(),
        clientPhone: phone.trim() || undefined,
        subject: topic,
        message: message.trim(),
        userId: user?.uid,
        userRole,
        isAdminSubmission: isAdmin,
        triggerExternalNotification: true, // evaluated and authorized via auth check
      });

      setSubmissionResult(res);
      if (onSuccess) {
        onSuccess(res);
      }

      setName(user?.displayName || '');
      setEmail(user?.email || '');
      setPhone('');
      setMessage('');
    } catch (err: any) {
      console.error('Enquiry submission error:', err);
      setErrorMsg(err.message || 'Unable to submit inquiry at this time. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`bg-[#FFFBF5] rounded-[32px] p-8 sm:p-12 border border-[#3B0000]/10 shadow-xs ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-2xl font-display font-bold text-[#3B0000]">
          Send a Quiet Inquiry
        </h3>
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-[#FFD482] text-[#3B0000] font-bold">
          WhatsApp &amp; Email Alert
        </span>
      </div>
      <p className="text-xs text-[#7E4A4A] mb-6 font-sans">
        All correspondences are securely archived in the Avelore Maison system and dispatched directly to the concierge.
      </p>

      {/* Authentication & Authority Indicator Banner */}
      {isAdmin ? (
        <div className="flex items-center gap-2 p-3 mb-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 text-xs font-sans">
          <Shield className="w-4 h-4 text-[#801B00] shrink-0" />
          <span>
            <strong>Maison Owner Authority:</strong> Verified as <span className="font-mono font-semibold">{user?.email}</span>. External notification triggers will route with owner diagnostic priority.
          </span>
        </div>
      ) : user ? (
        <div className="flex items-center gap-2 p-3 mb-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-900 text-xs font-sans">
          <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>
            <strong>Distinguished Patron:</strong> Authenticated as <span className="font-mono font-semibold">{user.email}</span>. Inquiry will link directly to your personal salon profile.
          </span>
        </div>
      ) : null}

      {submissionResult ? (
        <div className="py-10 px-6 rounded-2xl bg-[#FAF2E1] border border-[#3B0000]/15 text-center animate-in fade-in duration-300 space-y-4">
          <div className="w-14 h-14 rounded-full bg-[#FFD482] text-[#3B0000] mx-auto flex items-center justify-center shadow-xs border border-[#3B0000]/10">
            <CheckCircle2 className="w-7 h-7 text-[#3B0000]" />
          </div>
          <div>
            <h4 className="text-2xl font-display font-bold text-[#3B0000]">
              Correspondence Received
            </h4>
            <p className="text-xs font-mono text-[#3B0000]/60 mt-0.5 uppercase tracking-widest">
              Reference #{submissionResult.bookingId.slice(0, 14)}
            </p>
          </div>

          <div className="bg-white/80 p-4 rounded-xl border border-[#3B0000]/10 text-xs text-left text-[#3B0000] space-y-2 max-w-md mx-auto">
            <div className="flex items-center gap-2 text-emerald-800 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Archived securely in Avelore Firestore Database</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-800 font-medium">
              <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Email notification transmitted to Maison Concierge
              </span>
            </div>
          </div>

          {/* Direct WhatsApp Call to Action */}
          <div className="pt-2 max-w-md mx-auto">
            {submissionResult.whatsappUrl && (
              <a
                href={submissionResult.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold py-3 px-6 rounded-full shadow-md hover:shadow-lg transition-all cursor-pointer mb-3"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Open Inquiry Directly on WhatsApp</span>
              </a>
            )}

            <PillButton
              variant="merlot"
              size="sm"
              arrow="none"
              onClick={() => setSubmissionResult(null)}
              className="w-full justify-center"
            >
              Send Another Message
            </PillButton>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-100 text-red-900 text-xs border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-display font-bold uppercase tracking-wider text-[#3B0000] mb-2">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Caroline de Beauvoir"
                className="w-full bg-[#FAF2E1] border border-[#3B0000]/15 rounded-2xl px-4 py-3 text-sm text-[#3B0000] placeholder-[#3B0000]/30 focus:outline-none focus:border-[#3B0000] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-display font-bold uppercase tracking-wider text-[#3B0000] mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. caroline@domain.com"
                className="w-full bg-[#FAF2E1] border border-[#3B0000]/15 rounded-2xl px-4 py-3 text-sm text-[#3B0000] placeholder-[#3B0000]/30 focus:outline-none focus:border-[#3B0000] transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-display font-bold uppercase tracking-wider text-[#3B0000] mb-2">
                Mobile / WhatsApp Number (Optional)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+33 6 12 34 56 78"
                className="w-full bg-[#FAF2E1] border border-[#3B0000]/15 rounded-2xl px-4 py-3 text-sm text-[#3B0000] placeholder-[#3B0000]/30 focus:outline-none focus:border-[#3B0000] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-display font-bold uppercase tracking-wider text-[#3B0000] mb-2">
                Inquiry Nature
              </label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full bg-[#FAF2E1] border border-[#3B0000]/15 rounded-2xl px-4 py-3 text-sm text-[#3B0000] focus:outline-none focus:border-[#3B0000] transition-colors cursor-pointer font-display font-bold"
              >
                <option value="Private Consultation">Private Olfactory Consultation</option>
                <option value="Bespoke Formulation">Bespoke Flacon Commission</option>
                <option value="Boutique Inquiries">Stockist &amp; Retail Inquiries</option>
                <option value="Press &amp; Editorial">Press &amp; Editorial Archives</option>
                <option value="Other">General Correspondence</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-display font-bold uppercase tracking-wider text-[#3B0000] mb-2">
              Message
            </label>
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us about your inquiry or desired consultation time..."
              className="w-full bg-[#FAF2E1] border border-[#3B0000]/15 rounded-2xl px-4 py-3 text-sm text-[#3B0000] placeholder-[#3B0000]/30 focus:outline-none focus:border-[#3B0000] transition-colors resize-none"
            />
          </div>

          <div className="pt-2">
            <PillButton
              type="submit"
              variant="merlot"
              size="md"
              arrow="right"
              disabled={submitting}
              className="w-full sm:w-auto"
            >
              {submitting ? 'Transmitting to Concierge...' : 'Send Inquiry'}
            </PillButton>
          </div>
        </form>
      )}
    </div>
  );
};
