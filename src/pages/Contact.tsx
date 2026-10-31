import React from 'react';
import { PillButton } from '../components/PillButton';
import { Clock, Mail, Phone, ArrowUpRight } from 'lucide-react';
import { EnquiryForm } from '../components/EnquiryForm';
import { BranchLocator } from '../components/BranchLocator';

interface ContactSectionProps {
  onOpenStoreLocator: () => void;
}

export const Contact: React.FC<ContactSectionProps> = ({ onOpenStoreLocator }) => {

  return (
    <section id="contact" className="relative bg-[#FAF2E1] py-28 sm:py-36 border-b border-[#3B0000]/10">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-[#FFD482]" />
            <span className="text-xs uppercase tracking-[0.25em] text-[#3B0000] font-display font-bold">
              Concierge &amp; Salons
            </span>
          </div>
          <h2 className="text-4xl sm:text-6xl font-display font-bold text-[#3B0000] tracking-tight">
            Connect with the <span className="font-serif italic font-normal text-[#520909]">House</span>
          </h2>
          <p className="mt-4 text-base text-[#7E4A4A] leading-relaxed font-sans">
            Whether inquiring about private olfactory consultations, bespoke commissions, or authorized retail partnerships, our concierge is at your disposal.
          </p>
        </div>

        {/* Split Layout: Contact Form (Left) & Flagship Cards (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start mb-24">
          {/* Left Column: Form */}
          <div className="lg:col-span-7">
            <EnquiryForm />
          </div>

          {/* Right Column: Flagship Salons & Direct Channels */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#3B0000] text-[#FFD482] rounded-[32px] p-8 sm:p-10 border border-[#FFD482]/20 shadow-md">
              <span className="text-xs uppercase tracking-[0.25em] text-[#FFD482] font-display font-bold block mb-3">
                Flagship Marais Atelier
              </span>
              <h3 className="text-2xl font-display font-bold text-[#FFD482] mb-2">
                24 Rue de Sévigné, Paris
              </h3>
              <p className="text-xs text-[#FFF5E3]/75 leading-relaxed mb-6 font-sans">
                Situated in the heart of the historic Marais district, our atelier features the full botanical organ and custom blotter testing suites.
              </p>

              <div className="space-y-3 text-xs text-[#FFF5E3]/90 border-t border-[#FFD482]/15 pt-4 mb-6 font-mono">
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-[#FFD482]" />
                  <span>Tuesday – Saturday: 11:00 – 19:30 CET</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-[#FFD482]" />
                  <span>+33 1 42 78 30 12</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-[#FFD482]" />
                  <span>concierge@avelore.com</span>
                </div>
              </div>

              <PillButton
                variant="apricot"
                size="sm"
                arrow="up-right"
                onClick={onOpenStoreLocator}
                className="w-full justify-center"
              >
                View All Global Boutiques
              </PillButton>
            </div>

            {/* Social & Audio Channels */}
            <div className="bg-[#FFFBF5] rounded-[28px] p-6 sm:p-8 border border-[#3B0000]/10 shadow-xs">
              <h4 className="text-xs font-display font-bold uppercase tracking-[0.2em] text-[#3B0000] mb-4">
                Connected Dispatches
              </h4>
              <div className="space-y-3 text-xs">
                <a
                  href="#instagram"
                  onClick={(e) => e.preventDefault()}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#FAF2E1] hover:bg-[#FFD482]/30 transition-colors border border-[#3B0000]/5 cursor-pointer"
                >
                  <span className="font-bold text-[#3B0000] font-display">Instagram: @avelore.parfumerie</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#3B0000]" />
                </a>
                <a
                  href="#spotify"
                  onClick={(e) => e.preventDefault()}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#FAF2E1] hover:bg-[#FFD482]/30 transition-colors border border-[#3B0000]/5 cursor-pointer"
                >
                  <span className="font-bold text-[#3B0000] font-display">Spotify: Nocturne Olfactory Playlists</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#3B0000]" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* GOOGLE MAPS: Physical Branch Locations */}
        <BranchLocator onOpenStoreLocator={onOpenStoreLocator} />
      </div>
    </section>
  );
};
