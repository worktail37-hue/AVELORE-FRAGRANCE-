import React from 'react';
import { PillButton } from './PillButton';
import { RotatingBadge } from './RotatingBadge';

interface FinalCtaBannerProps {
  onOpenStoreLocator: () => void;
}

export const FinalCtaBanner: React.FC<FinalCtaBannerProps> = ({ onOpenStoreLocator }) => {
  return (
    <section className="relative bg-[#FFFBF5] py-24 sm:py-32 overflow-hidden border-b border-[#3B0000]/10">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#FFD482]/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6 sm:px-8 text-center relative z-10 flex flex-col items-center">
        <div className="mb-8">
          <RotatingBadge size={96} text="SCENT · COMPOSED · WITH INTENTION · " />
        </div>

        <span className="text-xs uppercase tracking-[0.25em] text-[#3B0000] font-display font-bold mb-3 block">
          Haute Parfumerie Experience
        </span>

        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-display font-bold text-[#3B0000] max-w-3xl leading-tight mb-6">
          Find the scent that lingers <span className="font-serif italic font-normal text-[#520909]">long after you depart.</span>
        </h2>

        <p className="text-sm sm:text-base text-[#7E4A4A] max-w-xl mx-auto mb-10 leading-relaxed font-sans">
          Explore eighteen intentional formulations across fine extraits, restorative body oils, and ambient home objects.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <PillButton to="#shop" variant="apricot" size="lg" arrow="right">
            Explore the Collection
          </PillButton>
          <PillButton
            variant="merlot"
            size="lg"
            arrow="none"
            onClick={onOpenStoreLocator}
          >
            Visit a Boutique
          </PillButton>
        </div>
      </div>
    </section>
  );
};
