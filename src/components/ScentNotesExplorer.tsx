import React, { useState } from 'react';
import { PRODUCTS, Product } from '../data/siteData';
import { ProductVisual } from './ProductVisual';
import { PillButton } from './PillButton';

interface ScentNotesExplorerProps {
  onQuickView: (product: Product) => void;
}

export const ScentNotesExplorer: React.FC<ScentNotesExplorerProps> = ({ onQuickView }) => {
  const fragrances = PRODUCTS.filter((p) => p.category === 'fragrance');
  const [selectedFragrance, setSelectedFragrance] = useState<Product>(fragrances[0]);

  const notes = selectedFragrance.notes || {
    top: ['Citrus Accord', 'Pink Pepper'],
    heart: ['Floral Absolute', 'Cedar'],
    base: ['Amber', 'Resins'],
  };

  return (
    <section className="relative bg-[#FFFBF5] py-24 sm:py-32 overflow-hidden border-b border-[#3B0000]/10">
      {/* Decorative hairline plus markers */}
      <div className="absolute top-12 left-12 font-mono text-sm text-[#3B0000]/25">+</div>
      <div className="absolute bottom-12 right-12 font-mono text-sm text-[#3B0000]/25">+</div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Header */}
        <div className="max-w-3xl mb-14">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-[#FFD482]" />
            <span className="text-xs uppercase tracking-[0.25em] text-[#3B0000] font-display font-bold">
              Olfactory Architecture
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-display font-bold text-[#3B0000] tracking-tight">
            The Scent Notes <span className="font-serif italic font-normal text-[#520909]">Pyramid</span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#7E4A4A] leading-relaxed">
            Select an extrait to deconstruct its three-tier composition. Every note is calibrated to unfurl over hours in harmonic dialogue with skin warmth.
          </p>
        </div>

        {/* Fragrance Selector Tabs */}
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-4 mb-12 scrollbar-none">
          {fragrances.map((frag) => (
            <button
              key={frag.id}
              onClick={() => setSelectedFragrance(frag)}
              className={`px-5 py-2.5 rounded-full text-xs font-display font-bold uppercase tracking-wider transition-all duration-300 whitespace-nowrap shrink-0 cursor-pointer ${
                selectedFragrance.id === frag.id
                  ? 'bg-[#3B0000] text-[#FFD482] shadow-sm scale-105 border border-[#FFD482]/30'
                  : 'bg-[#FAF2E1] text-[#3B0000]/75 hover:bg-[#FFD482]/30 border border-[#3B0000]/10'
              }`}
            >
              {frag.name}
            </button>
          ))}
        </div>

        {/* Interactive Explorer Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Visual Bottle Showcase in Golden Apricot/Merlot */}
          <div
            className="lg:col-span-5 flex flex-col items-center justify-center p-8 sm:p-12 rounded-[32px] border border-[#3B0000]/10 relative overflow-hidden transition-colors duration-700 bg-[#FAF2E1]"
          >
            <div
              className="absolute w-64 h-64 rounded-full blur-3xl opacity-25 pointer-events-none bg-[#FFD482]"
            />

            <div className="relative z-10 w-full max-w-[240px]">
              <ProductVisual product={selectedFragrance} size="lg" />
            </div>

            <div className="mt-6 text-center z-10">
              <span className="text-xs uppercase tracking-[0.2em] font-display font-bold text-[#3B0000]">
                {selectedFragrance.subtitle}
              </span>
              <h3 className="text-2xl font-display font-bold text-[#3B0000] mt-1 mb-2">
                {selectedFragrance.name}
              </h3>
              <p className="text-xs text-[#7E4A4A] max-w-xs leading-relaxed mb-5">
                {selectedFragrance.description}
              </p>
              <PillButton
                variant="merlot"
                size="sm"
                arrow="up-right"
                onClick={() => onQuickView(selectedFragrance)}
              >
                Discover Formulation
              </PillButton>
            </div>
          </div>

          {/* Right Column: 3-Tier Olfactory Architecture Pyramid */}
          <div className="lg:col-span-7 space-y-6">
            {/* Tier 1: Top Notes */}
            <div className="bg-[#FAF2E1] rounded-[24px] p-6 sm:p-7 border border-[#3B0000]/10 transition-all duration-300 hover:bg-[#FFFBF5] hover:shadow-md">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-[#FFD482] text-[#3B0000] font-mono text-[11px] font-bold flex items-center justify-center border border-[#3B0000]/15">
                    01
                  </span>
                  <span className="text-xs font-display font-bold uppercase tracking-[0.2em] text-[#3B0000]">
                    Top Notes (Head)
                  </span>
                </div>
                <span className="text-[11px] text-[#7E4A4A] font-mono">
                  First 15–30 Minutes
                </span>
              </div>
              <p className="text-xs text-[#7E4A4A] mb-4">
                The immediate sensory impression; vibrant, ethereal molecules that awaken the senses upon initial atomization.
              </p>
              <div className="flex flex-wrap gap-2">
                {notes.top.map((note, idx) => (
                  <span
                    key={idx}
                    className="px-3.5 py-1.5 rounded-full bg-[#FFFBF5] text-[#3B0000] text-xs font-bold font-display border border-[#3B0000]/10 shadow-2xs"
                  >
                    {note}
                  </span>
                ))}
              </div>
            </div>

            {/* Tier 2: Heart Notes */}
            <div className="bg-[#FAF2E1] rounded-[24px] p-6 sm:p-7 border border-[#3B0000]/10 transition-all duration-300 hover:bg-[#FFFBF5] hover:shadow-md">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-[#FFD482] text-[#3B0000] font-mono text-[11px] font-bold flex items-center justify-center border border-[#3B0000]/15">
                    02
                  </span>
                  <span className="text-xs font-display font-bold uppercase tracking-[0.2em] text-[#3B0000]">
                    Heart Notes (Corpus)
                  </span>
                </div>
                <span className="text-[11px] text-[#7E4A4A] font-mono">
                  2 to 5 Hours
                </span>
              </div>
              <p className="text-xs text-[#7E4A4A] mb-4">
                The personality and harmonic core of the fragrance; full-bodied florals and aromatic resins that blossom as top notes settle.
              </p>
              <div className="flex flex-wrap gap-2">
                {notes.heart.map((note, idx) => (
                  <span
                    key={idx}
                    className="px-3.5 py-1.5 rounded-full bg-[#FFFBF5] text-[#3B0000] text-xs font-bold font-display border border-[#3B0000]/10 shadow-2xs"
                  >
                    {note}
                  </span>
                ))}
              </div>
            </div>

            {/* Tier 3: Base Notes */}
            <div className="bg-[#FAF2E1] rounded-[24px] p-6 sm:p-7 border border-[#3B0000]/10 transition-all duration-300 hover:bg-[#FFFBF5] hover:shadow-md">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-[#3B0000] text-[#FFD482] font-mono text-[11px] font-bold flex items-center justify-center border border-[#FFD482]/20">
                    03
                  </span>
                  <span className="text-xs font-display font-bold uppercase tracking-[0.2em] text-[#3B0000]">
                    Base Notes (Soul & Sillage)
                  </span>
                </div>
                <span className="text-[11px] text-[#7E4A4A] font-mono">
                  8 to 24+ Hours
                </span>
              </div>
              <p className="text-xs text-[#7E4A4A] mb-4">
                The enduring memory that clings to linens and skin; heavy woods, balsams, and precious resin crystals.
              </p>
              <div className="flex flex-wrap gap-2">
                {notes.base.map((note, idx) => (
                  <span
                    key={idx}
                    className="px-3.5 py-1.5 rounded-full bg-[#FFFBF5] text-[#3B0000] text-xs font-bold font-display border border-[#3B0000]/10 shadow-2xs"
                  >
                    {note}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
