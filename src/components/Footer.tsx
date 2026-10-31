import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { PillButton } from './PillButton';

interface FooterProps {
  onOpenStoreLocator: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenStoreLocator }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="relative bg-[#220000] text-[#FFD482] pt-24 pb-12 overflow-hidden border-t border-[#FFD482]/15">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 pb-16 border-b border-[#FFD482]/15">
          {/* Column 1: Newsletter & Intention */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-[#FFD482]" />
                <span className="text-xs uppercase tracking-[0.25em] text-[#FFD482] font-display font-bold">
                  Private Salon Dispatch
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-display font-bold text-[#FFD482] mb-3 leading-snug">
                Receive private harvest dispatches & <span className="font-serif italic font-normal text-white">quiet previews.</span>
              </h3>
              <p className="text-sm text-[#FFF5E3]/70 font-sans leading-relaxed max-w-md mb-6">
                Sent bi-monthly from our distillation laboratory in Grasse. We honor your quietude and never send commercial clutter.
              </p>

              {subscribed ? (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-[#3B0000] border border-[#FFD482]/30 text-sm text-[#FFD482]">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>Thank you. Your invitation to our olfactory journal has been recorded.</span>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="relative flex items-center max-w-md">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full bg-[#3B0000] border border-[#FFD482]/25 rounded-full py-3.5 pl-5 pr-14 text-sm text-[#FFD482] placeholder-[#FFD482]/40 focus:outline-none focus:border-[#FFD482] transition-colors"
                  />
                  <button
                    type="submit"
                    aria-label="Subscribe to dispatch"
                    className="absolute right-1.5 p-2.5 rounded-full bg-[#FFD482] text-[#3B0000] hover:bg-white transition-colors cursor-pointer"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>

            <div className="mt-8 pt-6 text-xs text-[#FFD482]/50 flex items-center gap-2 font-mono">
              <span>Bespoke formulations formulated according to IFRA safety charters</span>
            </div>
          </div>

          {/* Column 2: Navigation Links (Real Links with Crawlable href) */}
          <div className="lg:col-span-2 col-span-6">
            <h4 className="text-xs font-display font-bold uppercase tracking-[0.2em] text-[#FFD482]/60 mb-5">
              The House
            </h4>
            <ul className="space-y-3 text-sm text-[#FFF5E3]/85 font-medium">
              <li>
                <Link
                  to="/"
                  className="hover:text-white hover:underline transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/shop"
                  className="hover:text-white hover:underline transition-colors"
                >
                  Catalogue & Objects
                </Link>
              </li>
              <li>
                <Link
                  to="/collections"
                  className="hover:text-white hover:underline transition-colors"
                >
                  Collection Chapters
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="hover:text-white hover:underline transition-colors"
                >
                  Atelier & Terroir
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="hover:text-white hover:underline transition-colors"
                >
                  Concierge & Inquiries
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Olfactory Categories (Deep links to /shop?category=...) */}
          <div className="lg:col-span-2 col-span-6">
            <h4 className="text-xs font-display font-bold uppercase tracking-[0.2em] text-[#FFD482]/60 mb-5">
              Categories
            </h4>
            <ul className="space-y-3 text-sm text-[#FFF5E3]/85 font-medium">
              <li>
                <Link
                  to="/shop?category=fragrance"
                  className="hover:text-white hover:underline transition-colors"
                >
                  Fine Fragrance
                </Link>
              </li>
              <li>
                <Link
                  to="/shop?category=body-bath"
                  className="hover:text-white hover:underline transition-colors"
                >
                  Body & Bath
                </Link>
              </li>
              <li>
                <Link
                  to="/shop?category=home"
                  className="hover:text-white hover:underline transition-colors"
                >
                  Home Fragrance
                </Link>
              </li>
              <li>
                <Link
                  to="/shop?category=beauty"
                  className="hover:text-white hover:underline transition-colors"
                >
                  Beauty & Cosmetics
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Flagships & Presence */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-display font-bold uppercase tracking-[0.2em] text-[#FFD482]/60 mb-5">
              Boutique Salons
            </h4>
            <p className="text-xs text-[#FFF5E3]/70 leading-relaxed mb-4">
              Private olfactory discovery by appointment or walk-in consultation.
            </p>
            <div className="space-y-2 text-xs text-[#FFD482]/80 mb-6 font-mono">
              <div>Paris Marais · 24 Rue de Sévigné</div>
              <div>Mayfair London · 14 Mount Street</div>
              <div>SoHo New York · 92 Prince Street</div>
              <div>Minato Tokyo · 5-7-22 Minami-Aoyama</div>
            </div>
            <PillButton
              variant="outline"
              size="sm"
              arrow="up-right"
              onClick={onOpenStoreLocator}
              className="border-[#FFD482]/30 text-[#FFD482] hover:bg-[#FFD482] hover:text-[#3B0000]"
            >
              Locate Boutiques
            </PillButton>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 text-xs text-[#FFD482]/60">
          <div>
            © {new Date().getFullYear()} AVELORE HAUTE PARFUMERIE. All rights reserved. Scent, composed with intention.
          </div>
          <div className="flex items-center gap-6">
            <span className="hover:text-white cursor-pointer transition-colors">Terms of Elegance</span>
            <span className="hover:text-white cursor-pointer transition-colors">Ethical Harvest Charter</span>
            <span className="hover:text-white cursor-pointer transition-colors">IFRA Compliance</span>
          </div>
        </div>
      </div>

      {/* Giant Brand Wordmark Watermark at the base */}
      <div className="w-full overflow-hidden select-none pointer-events-none mt-8 -mb-6 text-center">
        <span className="text-[18vw] font-display font-extrabold tracking-tighter text-[#FFD482]/[0.05] leading-none block">
          AVELORE
        </span>
      </div>
    </footer>
  );
};
