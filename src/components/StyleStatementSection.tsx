import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

export const StyleStatementSection: React.FC = () => {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative bg-[#FAF2E1] py-24 sm:py-32 overflow-hidden border-b border-[#3B0000]/10">
      {/* Decorative grid plus markers in Burnt Merlot */}
      <div className="absolute top-12 left-12 font-mono text-sm text-[#3B0000]/25 select-none">+</div>
      <div className="absolute top-12 right-12 font-mono text-sm text-[#3B0000]/25 select-none">+</div>
      <div className="absolute bottom-12 left-12 font-mono text-sm text-[#3B0000]/25 select-none">+</div>
      <div className="absolute bottom-12 right-12 font-mono text-sm text-[#3B0000]/25 select-none">+</div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-16 sm:mb-20">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-[#FFD482]" />
            <span className="text-xs uppercase tracking-[0.25em] text-[#3B0000] font-display font-bold">
              The Avelore Philosophy
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-display font-bold text-[#3B0000] leading-[1.12] tracking-tight">
            Luxury without compromise, <span className="font-serif italic font-normal text-[#520909]">composed in quietude.</span>
          </h2>

          <p className="mt-6 text-base sm:text-lg text-[#7E4A4A] font-sans leading-relaxed">
            We reject the disposable volume of commercial fragrance. Every extrait is an intentional architectural composition, marrying single-estate harvests with pure artisanal patience.
          </p>
        </div>

        {/* 3 Rounded Editorial Tiles + Ingredient Story Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-stretch">
          {/* Tile 1: Botanical Terroir Tile */}
          <div className="md:col-span-4 bg-[#FFFBF5] rounded-[32px] p-8 border border-[#3B0000]/10 shadow-xs flex flex-col justify-between group hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center justify-between text-xs text-[#7E4A4A] mb-6">
                <span className="font-mono uppercase tracking-widest text-[#3B0000] font-bold">Terroir · Grasse</span>
                <span>05:30 AM Harvest</span>
              </div>

              {/* Vector Composition in Golden Apricot & Burnt Merlot */}
              <div className="relative h-48 rounded-2xl bg-[#FFF5E3] border border-[#3B0000]/10 flex items-center justify-center overflow-hidden mb-6">
                <svg viewBox="0 0 200 160" className="w-full h-full p-4" fill="none">
                  <circle cx="100" cy="80" r="50" fill="#FFD482" opacity="0.4" />
                  <path d="M100 80 C80 50, 70 20, 100 20 C130 20, 120 50, 100 80 Z" fill="#3B0000" opacity="0.9" />
                  <path d="M100 80 C130 70, 160 60, 165 90 C170 120, 135 110, 100 80 Z" fill="#FFD482" opacity="0.95" />
                  <path d="M100 80 C110 110, 120 140, 90 145 C60 150, 75 115, 100 80 Z" fill="#520909" opacity="0.85" />
                  <path d="M100 80 C70 90, 40 100, 35 70 C30 40, 65 50, 100 80 Z" fill="#E8BE72" opacity="0.85" />
                  <circle cx="100" cy="80" r="10" fill="#3B0000" />
                  <circle cx="100" cy="80" r="4" fill="#FFD482" />
                </svg>
                <span className="absolute bottom-3 left-4 text-[10px] tracking-widest uppercase font-bold text-[#3B0000]/80 font-display">
                  Centifolia Rose & Orange Blossom
                </span>
              </div>

              <h3 className="text-xl font-display font-bold text-[#3B0000] mb-2">
                Uncompromising Terroir
              </h3>
              <p className="text-xs text-[#7E4A4A] leading-relaxed">
                Raw resins and fragile flora hand-gathered at the precise dawn hour before evaporation strips their delicate green nuances.
              </p>
            </div>

            <div className="pt-6 border-t border-[#3B0000]/10 flex items-center justify-between text-xs font-bold font-display">
              <span className="text-[#3B0000]">Single-Estate Traceability</span>
              <span className="text-[#3B0000] bg-[#FFD482] px-2 py-0.5 rounded-full">100%</span>
            </div>
          </div>

          {/* Tile 2: Artisanal Glasscraft & Reflection Tile */}
          <div className="md:col-span-4 bg-[#FFFBF5] rounded-[32px] p-8 border border-[#3B0000]/10 shadow-xs flex flex-col justify-between group hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center justify-between text-xs text-[#7E4A4A] mb-6">
                <span className="font-mono uppercase tracking-widest text-[#3B0000] font-bold">Form · Architecture</span>
                <span>Heavy Crystal Flacon</span>
              </div>

              <div className="relative h-48 rounded-2xl bg-[#FFF5E3] border border-[#3B0000]/10 flex items-center justify-center overflow-hidden mb-6">
                <svg viewBox="0 0 200 160" className="w-full h-full p-4" fill="none">
                  <rect x="70" y="30" width="60" height="95" rx="12" fill="#FFFFFF" stroke="#3B0000" strokeWidth="1.5" />
                  <rect x="78" y="44" width="44" height="68" rx="6" fill="#3B0000" opacity="0.85" />
                  <rect x="88" y="16" width="24" height="15" rx="3" fill="#FFD482" />
                  <line x1="60" y1="135" x2="140" y2="135" stroke="#3B0000" strokeWidth="1" opacity="0.2" />
                  <path d="M40 70 L70 90 L130 90 L160 110" stroke="#FFD482" strokeWidth="1.5" strokeDasharray="3 3" />
                </svg>
                <span className="absolute bottom-3 left-4 text-[10px] tracking-widest uppercase font-bold text-[#3B0000]/80 font-display">
                  Weighted Crystal Base
                </span>
              </div>

              <h3 className="text-xl font-display font-bold text-[#3B0000] mb-2">
                Sculptural Permanence
              </h3>
              <p className="text-xs text-[#7E4A4A] leading-relaxed">
                Molded in high-clarity crystal glass with a weighted base. Designed to balance comfortably in the palm and anchor the morning counter.
              </p>
            </div>

            <div className="pt-6 border-t border-[#3B0000]/10 flex items-center justify-between text-xs font-bold font-display">
              <span className="text-[#3B0000]">Recyclable European Glass</span>
              <span className="text-[#3B0000] bg-[#FFD482] px-2 py-0.5 rounded-full">Signature</span>
            </div>
          </div>

          {/* Tile 3: Burnt Merlot Maceration Archive Card */}
          <div className="md:col-span-4 bg-[#3B0000] text-[#FFD482] rounded-[32px] p-8 shadow-sm flex flex-col justify-between relative overflow-hidden border border-[#FFD482]/20">
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[#FFD482]/15 blur-3xl pointer-events-none" />

            <div>
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-4 h-4 text-[#FFD482]" />
                <span className="text-xs uppercase tracking-[0.2em] text-[#FFD482] font-display font-bold">
                  Maceration Archive
                </span>
              </div>

              <div className="text-xs font-mono text-[#FFD482]/70 mb-3">
                BATCH CODE: N° 2026-AV-09
              </div>

              <blockquote className="text-lg sm:text-xl font-serif italic text-white/95 leading-snug mb-6">
                &ldquo;We allow the oils to speak to each other in stillness. A perfume cannot be hurried any more than a vintage can be demanded of an early vineyard.&rdquo;
              </blockquote>

              <div className="space-y-2 text-xs text-[#FFD482]/80 mb-6">
                <div className="flex justify-between border-b border-[#FFD482]/15 pb-1.5">
                  <span>Maceration:</span>
                  <span className="text-white font-medium">48 Hours to 6 Weeks</span>
                </div>
                <div className="flex justify-between border-b border-[#FFD482]/15 pb-1.5">
                  <span>Distillation:</span>
                  <span className="text-white font-medium">Fractional Steam & CO₂</span>
                </div>
                <div className="flex justify-between">
                  <span>Synthetic Fixatives:</span>
                  <span className="text-[#FFD482] font-bold">0.0% (Zero)</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => scrollToSection('about')}
              className="inline-flex items-center gap-2 text-xs font-display font-bold uppercase tracking-wider text-[#FFD482] hover:text-white transition-colors group cursor-pointer"
            >
              <span>Explore our Grasse Atelier</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
